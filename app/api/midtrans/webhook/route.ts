import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import {
  parseTransactionStatus,
  verifyWebhookSignature,
  getFinalStatus,
} from '@/lib/midtrans';

/**
 * Midtrans Webhook Handler
 * Receives payment notifications from Midtrans
 * 
 * Security:
 * - Signature verification
 * - Server-side only
 * - Idempotent updates
 */
export async function POST(request: NextRequest) {
  try {
    const notification = await request.json();

    // Parse notification
    const {
      orderId,
      transactionStatus,
      fraudStatus,
      paymentType,
      grossAmount,
      signatureKey,
      statusCode,
    } = parseTransactionStatus(notification);

    // Verify signature
    const isValid = verifyWebhookSignature(
      orderId,
      statusCode,
      grossAmount,
      signatureKey
    );

    if (!isValid) {
      console.error('Invalid signature from Midtrans webhook');
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      );
    }

    // Get final status
    const finalStatus = getFinalStatus(transactionStatus, fraudStatus);

    // Update database
    const supabase = await createClient();

    // Update payment record
    const { error: updateError } = await supabase
      .from('payments')
      .update({
        status: finalStatus,
        payment_type: paymentType,
        transaction_status: transactionStatus,
        fraud_status: fraudStatus,
        updated_at: new Date().toISOString(),
      })
      .eq('order_id', orderId);

    if (updateError) {
      console.error('Error updating payment:', updateError);
      return NextResponse.json(
        { error: 'Database update failed' },
        { status: 500 }
      );
    }

    // If payment successful, activate subscription
    if (finalStatus === 'success') {
      // Get payment details with metadata, affiliate_id, and UUID
      const { data: payment } = await supabase
        .from('payments')
        .select('id, user_id, metadata, affiliate_id')
        .eq('order_id', orderId)
        .single();

      if (payment && payment.metadata) {
        const metadata = payment.metadata as any;
        const subscriptionId = metadata.subscription_id;

        if (subscriptionId) {
          // Activate subscription
          await supabase
            .from('subscriptions')
            .update({
              status: 'active',
              updated_at: new Date().toISOString(),
            })
            .eq('id', subscriptionId);

          // Update user profile to premium
          await supabase
            .from('profiles')
            .update({
              is_premium: true,
              updated_at: new Date().toISOString(),
            })
            .eq('id', payment.user_id);
          
          console.log(`✅ Subscription ${subscriptionId} activated for user ${payment.user_id}`);
        }

        // ========================================
        // AFFILIATE COMMISSION PROCESSING
        // ========================================
        if (payment.affiliate_id) {
          try {
            // Check if commission already exists (prevent duplicates)
            const { data: existingCommission } = await supabase
              .from('commissions')
              .select('id, status')
              .eq('payment_id', payment.id)
              .maybeSingle();

            if (existingCommission) {
              // Update existing commission to approved
              if (existingCommission.status !== 'approved') {
                const { error: updateError } = await supabase
                  .from('commissions')
                  .update({
                    status: 'approved',
                    approved_at: new Date().toISOString(),
                  })
                  .eq('id', existingCommission.id);

                if (updateError) {
                  console.error('❌ Error updating commission status:', updateError);
                } else {
                  console.log(`✅ Commission ${existingCommission.id} status updated to approved`);
                }
              } else {
                console.log(`✅ Commission already approved for payment ${payment.id}`);
              }
            } else {
              // No existing commission found - create new one (fallback)
              // Get affiliate details
              const { data: affiliate } = await supabase
                .from('affiliates')
                .select('id, commission_rate, affiliate_code, full_name')
                .eq('id', payment.affiliate_id)
                .eq('status', 'active')
                .single();

              if (affiliate) {
                // IMPORTANT: Calculate commission from ACTUAL PAID AMOUNT (after discount)
                const transactionAmount = parseFloat(grossAmount);
                const commissionRate = affiliate.commission_rate || 10.00;
                const commissionAmount = Math.round((transactionAmount * commissionRate) / 100);

                console.log(`💰 Commission Calculation:
                  Transaction Amount (after discount): Rp ${transactionAmount.toLocaleString('id-ID')}
                  Commission Rate: ${commissionRate}%
                  Commission Amount: Rp ${commissionAmount.toLocaleString('id-ID')}
                  Affiliate: ${affiliate.full_name} (${affiliate.affiliate_code})
                `);

                // Create commission record as 'approved' since payment is settled
                const { error: commissionError } = await supabase
                  .from('commissions')
                  .insert({
                    affiliate_id: affiliate.id,
                    payment_id: payment.id, // ✅ Use payment UUID not order_id
                    order_id: orderId,
                    customer_email: notification.customer_email || metadata.user_email,
                    transaction_amount: transactionAmount,
                    commission_rate: commissionRate,
                    commission_amount: commissionAmount,
                    status: 'approved', // Directly approved on successful payment
                    approved_at: new Date().toISOString(),
                    created_at: new Date().toISOString(),
                  });

                if (commissionError) {
                  console.error('❌ Error creating commission:', commissionError);
                } else {
                  console.log(`✅ Commission Rp ${commissionAmount.toLocaleString('id-ID')} credited to ${affiliate.full_name} (${affiliate.affiliate_code})`);
                }
              } else {
                console.warn(`⚠️ Affiliate ID ${payment.affiliate_id} not found or inactive`);
              }
            }
          } catch (affiliateError) {
            console.error('❌ Error processing affiliate commission:', affiliateError);
            // Don't fail the webhook - payment already successful
          }
        }
      }
    } else if (finalStatus === 'failed') {
      // Mark subscription as failed
      const { data: payment } = await supabase
        .from('payments')
        .select('metadata')
        .eq('order_id', orderId)
        .single();

      if (payment && payment.metadata) {
        const metadata = payment.metadata as any;
        const subscriptionId = metadata.subscription_id;

        if (subscriptionId) {
          await supabase
            .from('subscriptions')
            .update({
              status: 'failed',
              updated_at: new Date().toISOString(),
            })
            .eq('id', subscriptionId);
          
          console.log(`❌ Subscription ${subscriptionId} marked as failed`);
        }
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
