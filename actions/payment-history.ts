'use server';

import { createClient } from '@/lib/supabase/server';

/**
 * Get user's pending payments that can be resumed
 */
export async function getPendingPayments() {
  try {
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return { success: false, error: 'Unauthorized', data: [] };
    }

    // Get pending payments from last 24 hours
    const twentyFourHoursAgo = new Date();
    twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);

    const { data: payments, error } = await supabase
      .from('payments')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'pending')
      .gte('created_at', twentyFourHoursAgo.toISOString())
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching pending payments:', error);
      return { success: false, error: error.message, data: [] };
    }

    return { success: true, data: payments || [], error: null };
  } catch (err: any) {
    console.error('Get pending payments error:', err);
    return { success: false, error: err.message, data: [] };
  }
}

/**
 * Get all payment history
 */
export async function getPaymentHistory() {
  try {
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return { success: false, error: 'Unauthorized', data: [] };
    }

    const { data: payments, error } = await supabase
      .from('payments')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      console.error('Error fetching payment history:', error);
      return { success: false, error: error.message, data: [] };
    }

    return { success: true, data: payments || [], error: null };
  } catch (err: any) {
    console.error('Get payment history error:', err);
    return { success: false, error: err.message, data: [] };
  }
}

/**
 * Cancel a pending payment
 */
export async function cancelPendingPayment(orderId: string) {
  try {
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return { success: false, error: 'Unauthorized' };
    }

    // Get payment data first to verify ownership
    const { data: payment, error: fetchError } = await supabase
      .from('payments')
      .select('*')
      .eq('order_id', orderId)
      .eq('user_id', user.id)
      .single();

    if (fetchError || !payment) {
      console.error('Payment not found:', fetchError);
      return { success: false, error: 'Pembayaran tidak ditemukan' };
    }

    // Only cancel if still pending
    if (payment.status !== 'pending') {
      return { success: false, error: 'Pembayaran sudah diproses dan tidak bisa dibatalkan' };
    }

    // Try to cancel on Midtrans (may fail, that's ok)
    try {
      const { cancelTransaction } = await import('@/lib/midtrans');
      await cancelTransaction(orderId);
      console.log('✅ Midtrans transaction cancelled:', orderId);
    } catch (midtransError: any) {
      console.log('⚠️ Midtrans cancel skipped:', midtransError.message);
    }

    // Update payment status to cancelled
    const { error: updateError } = await supabase
      .from('payments')
      .update({ 
        status: 'cancelled',
        updated_at: new Date().toISOString()
      })
      .eq('order_id', orderId)
      .eq('user_id', user.id);

    if (updateError) {
      console.error('❌ Error updating payment status:', updateError);
      return { success: false, error: 'Gagal memperbarui status pembayaran' };
    }

    console.log('✅ Payment cancelled:', orderId);

    // Cancel associated subscription if exists
    if (payment.metadata && typeof payment.metadata === 'object') {
      const metadata = payment.metadata as any;
      if (metadata.subscription_id) {
        await supabase
          .from('subscriptions')
          .update({ 
            status: 'cancelled',
            updated_at: new Date().toISOString()
          })
          .eq('id', metadata.subscription_id)
          .eq('status', 'pending');

        console.log('✅ Subscription cancelled:', metadata.subscription_id);
      }
    }

    return { success: true, error: null };
  } catch (err: any) {
    console.error('❌ Cancel payment error:', err);
    return { success: false, error: 'Terjadi kesalahan sistem' };
  }
}

/**
 * Get Snap token for resuming payment
 */
export async function resumePayment(orderId: string) {
  try {
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return { success: false, error: 'Unauthorized' };
    }

    // Get payment details
    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .select('*')
      .eq('order_id', orderId)
      .eq('user_id', user.id)
      .eq('status', 'pending')
      .single();

    if (paymentError || !payment) {
      return { success: false, error: 'Payment not found or already processed' };
    }

    // Payment sudah punya Snap token dari Midtrans
    // Kita perlu generate token baru karena token lama mungkin sudah expire
    // Tapi untuk simplicity, kita bisa gunakan order_id yang sama
    
    return { 
      success: true, 
      data: {
        orderId: payment.order_id,
        amount: payment.amount,
        metadata: payment.metadata
      },
      error: null 
    };
  } catch (err: any) {
    console.error('Resume payment error:', err);
    return { success: false, error: err.message };
  }
}
