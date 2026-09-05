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
      // Get payment details with metadata
      const { data: payment } = await supabase
        .from('payments')
        .select('user_id, metadata')
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
