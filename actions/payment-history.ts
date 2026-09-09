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

    // Try to cancel on Midtrans FIRST
    let midtransCancelled = false;
    let midtransError = '';
    
    try {
      const { cancelTransaction } = await import('@/lib/midtrans');
      await cancelTransaction(orderId);
      midtransCancelled = true;
      console.log('✅ Midtrans transaction cancelled:', orderId);
    } catch (midtransError: any) {
      midtransError = midtransError.message?.toLowerCase() || '';
      console.error('❌ Midtrans cancel failed:', midtransError);
      
      // These errors are OK - transaction already inactive/expired
      // We should still delete from DB
      if (
        midtransError.includes('not found') || 
        midtransError.includes('404') ||
        midtransError.includes('tidak dapat dibatalkan') ||
        midtransError.includes('non-aktif') ||
        midtransError.includes('expire') ||
        midtransError.includes('cancel') ||
        midtransError.includes('deny')
      ) {
        console.log('⚠️ Transaction already inactive/expired in Midtrans - safe to delete from DB');
        midtransCancelled = true;
      } else {
        // Real API error (network, auth, etc) - don't delete
        return { 
          success: false, 
          error: `Gagal membatalkan di Midtrans: ${midtransError}. Silakan coba lagi.` 
        };
      }
    }

    // Proceed with DB deletion (transaction is cancelled or already inactive)
    if (!midtransCancelled) {
      return { success: false, error: 'Gagal membatalkan transaksi' };
    }

    // Delete associated commission first (if exists) - to avoid foreign key constraint
    const { error: commissionDeleteError } = await supabase
      .from('commissions')
      .delete()
      .eq('order_id', orderId);

    if (commissionDeleteError) {
      console.log('⚠️ No commission to delete or error:', commissionDeleteError.message);
    } else {
      console.log('✅ Commission deleted for order:', orderId);
    }

    // Cancel associated subscription if exists
    if (payment.metadata && typeof payment.metadata === 'object') {
      const metadata = payment.metadata as any;
      if (metadata.subscription_id) {
        // Delete subscription instead of updating
        await supabase
          .from('subscriptions')
          .delete()
          .eq('id', metadata.subscription_id)
          .eq('status', 'pending');

        console.log('✅ Subscription deleted:', metadata.subscription_id);
      }
    }

    // Delete payment record completely
    const { error: deleteError } = await supabase
      .from('payments')
      .delete()
      .eq('order_id', orderId)
      .eq('user_id', user.id);

    if (deleteError) {
      console.error('❌ Error deleting payment:', deleteError);
      return { success: false, error: 'Gagal menghapus pembayaran' };
    }

    console.log('✅ Payment deleted:', orderId);

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
