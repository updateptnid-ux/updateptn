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
 * - Amount verification
 * - Idempotency check
 * - IP whitelist validation
 * - Audit logging
 * - Server-side only
 */
export async function POST(request: NextRequest) {
  const startTime = Date.now();
  let orderId = 'unknown';
  let processingStatus: 'success' | 'failed' | 'rejected' | 'duplicate' = 'failed';
  let errorMessage: string | null = null;
  
  const supabase = await createClient();
  
  // Security: Get client IP and user agent
  const clientIP = request.headers.get('x-forwarded-for') || 
                   request.headers.get('x-real-ip') || 
                   'unknown';
  const userAgent = request.headers.get('user-agent') || 'unknown';
  
  // Security: Midtrans IP whitelist (Sandbox + Production)
  // Source: https://docs.midtrans.com/docs/http-notification-webhooks
  const MIDTRANS_IPS = [
    '103.127.16.0/23',   // Production range
    '103.127.17.6',      // Specific production IP
    '103.208.23.6',      // Specific production IP  
    '103.208.23.0/24',   // Production range
    '::1',               // localhost (for testing)
    '127.0.0.1',         // localhost (for testing)
  ];
  
  // IP validation (warning only, don't block - some proxies may change IP)
  const isValidIP = MIDTRANS_IPS.some(allowedIP => {
    if (allowedIP.includes('/')) {
      // CIDR notation - simple check (for production, use proper CIDR library)
      const [network, bits] = allowedIP.split('/');
      return clientIP.startsWith(network.split('.').slice(0, parseInt(bits) / 8).join('.'));
    }
    return clientIP === allowedIP || clientIP.includes(allowedIP);
  });
  
  if (!isValidIP) {
    console.warn(`⚠️ Webhook from unrecognized IP: ${clientIP}`);
  }

  try {
    const notification = await request.json();

    // Parse notification
    const {
      orderId: parsedOrderId,
      transactionStatus,
      fraudStatus,
      paymentType,
      grossAmount,
      signatureKey,
      statusCode,
    } = parseTransactionStatus(notification);
    
    orderId = parsedOrderId;

    // Security: Verify signature
    const isValid = verifyWebhookSignature(
      orderId,
      statusCode,
      grossAmount,
      signatureKey
    );

    // Audit log: Log webhook attempt
    await supabase.from('webhook_logs').insert({
      source: 'midtrans',
      order_id: orderId,
      transaction_status: transactionStatus,
      signature_valid: isValid,
      ip_address: clientIP,
      user_agent: userAgent,
      raw_payload: notification,
      headers: Object.fromEntries(request.headers.entries()),
      processing_status: 'failed', // Will update on success
      processed_in_ms: null,
    }).select('id').maybeSingle(); // Non-blocking

    if (!isValid) {
      console.error('❌ Invalid signature from Midtrans webhook');
      processingStatus = 'rejected';
      errorMessage = 'Invalid signature';
      
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      );
    }

    // Security: Get payment details FIRST for validation
    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .select('id, user_id, amount, status, metadata, affiliate_id')
      .eq('order_id', orderId)
      .single();

    if (paymentError || !payment) {
      console.error('❌ Payment not found for order_id:', orderId);
      processingStatus = 'rejected';
      errorMessage = 'Payment not found';
      
      return NextResponse.json(
        { error: 'Payment not found' },
        { status: 404 }
      );
    }

    // Security: AMOUNT VERIFICATION - prevent price manipulation
    const expectedAmount = payment.amount;
    const receivedAmount = parseFloat(grossAmount);
    
    if (Math.abs(expectedAmount - receivedAmount) > 1) { // Allow 1 Rp tolerance
      console.error(`❌ Amount mismatch! Expected: ${expectedAmount}, Received: ${receivedAmount}`);
      processingStatus = 'rejected';
      errorMessage = `Amount mismatch: expected ${expectedAmount}, got ${receivedAmount}`;
      
      await supabase.from('webhook_logs').insert({
        source: 'midtrans',
        order_id: orderId,
        transaction_status: transactionStatus,
        signature_valid: isValid,
        ip_address: clientIP,
        user_agent: userAgent,
        raw_payload: notification,
        processing_status: 'rejected',
        error_message: errorMessage,
        processed_in_ms: Date.now() - startTime,
      });
      
      return NextResponse.json(
        { error: 'Amount mismatch' },
        { status: 400 }
      );
    }

    // Security: IDEMPOTENCY CHECK - prevent duplicate processing
    const finalStatus = getFinalStatus(transactionStatus, fraudStatus);
    
    if (['success', 'settlement', 'capture'].includes(payment.status) && 
        ['success', 'settlement', 'capture'].includes(finalStatus)) {
      console.log(`✅ Payment ${orderId} already processed (status: ${payment.status})`);
      processingStatus = 'duplicate';
      
      return NextResponse.json({ 
        success: true, 
        message: 'Already processed' 
      });
    }

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
      console.error('❌ Error updating payment:', updateError);
      processingStatus = 'failed';
      errorMessage = 'Database update failed';
      
      return NextResponse.json(
        { error: 'Database update failed' },
        { status: 500 }
      );
    }

    // If payment successful, activate subscription
    if (finalStatus === 'success') {
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
                const transactionAmount = receivedAmount;
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
      
      processingStatus = 'success';
    } else if (finalStatus === 'failed') {
      // Mark subscription as failed
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
      
      processingStatus = 'success'; // Successfully processed a failure
    }

    // Log successful processing
    const processingTime = Date.now() - startTime;
    await supabase.from('webhook_logs').insert({
      source: 'midtrans',
      order_id: orderId,
      transaction_status: transactionStatus,
      signature_valid: true,
      ip_address: clientIP,
      user_agent: userAgent,
      raw_payload: notification,
      processing_status: processingStatus,
      processed_in_ms: processingTime,
    });

    console.log(`✅ Webhook processed successfully in ${processingTime}ms - Order: ${orderId}, Status: ${finalStatus}`);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('❌ Webhook error:', error);
    errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    // Log error
    await supabase.from('webhook_logs').insert({
      source: 'midtrans',
      order_id: orderId,
      signature_valid: false,
      ip_address: clientIP,
      user_agent: userAgent,
      processing_status: 'failed',
      error_message: errorMessage,
      processed_in_ms: Date.now() - startTime,
    });
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
