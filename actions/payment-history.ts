'use server';

import { createClient } from '@/lib/supabase/server';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';

/**
 * Helper to get a privileged Supabase client with SUPABASE_SERVICE_ROLE_KEY
 * or fallback to the authenticated user client.
 */
function getPrivilegedDb(userClient: any) {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (serviceRoleKey) {
    return createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      serviceRoleKey,
      { auth: { persistSession: false } }
    );
  }
  return userClient;
}

/**
 * Get user's pending payments that can be resumed
 */
export async function getPendingPayments() {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return { success: false, error: 'Unauthorized', data: [] };
    }

    const db = getPrivilegedDb(supabase);

    // Get pending payments from last 24 hours
    const twentyFourHoursAgo = new Date();
    twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);

    const { data: payments, error } = await db
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

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return { success: false, error: 'Unauthorized', data: [] };
    }

    const db = getPrivilegedDb(supabase);

    const { data: payments, error } = await db
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
 * Cancel or Delete a pending payment (Student-side)
 * Action:
 * - 'cancel': Updates status to 'cancelled' (fallback to delete if update blocked)
 * - 'delete': Removes transaction permanently from the database
 */
export async function cancelPendingPayment(
  orderId: string,
  action: 'cancel' | 'delete' = 'cancel'
) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return { success: false, error: 'Unauthorized: Sesi Anda telah berakhir' };
    }

    const db = getPrivilegedDb(supabase);

    // 1. Verify payment exists and belongs to the authenticated student
    const { data: payment, error: fetchError } = await db
      .from('payments')
      .select('*')
      .eq('order_id', orderId)
      .eq('user_id', user.id)
      .maybeSingle();

    if (fetchError || !payment) {
      console.error('Payment not found:', fetchError);
      return { success: false, error: 'Pembayaran tidak ditemukan di akun Anda' };
    }

    // Only allow canceling if still pending
    if (payment.status !== 'pending' && action !== 'delete') {
      return {
        success: false,
        error: `Pembayaran sudah berstatus ${payment.status} dan tidak bisa dibatalkan`,
      };
    }

    // 2. Call Midtrans Cancel API if configured
    let midtransResult: any = null;
    try {
      const { cancelTransaction } = await import('@/lib/midtrans');
      await cancelTransaction(orderId);
      midtransResult = { cancelled: true };
      console.log('✅ Midtrans transaction cancelled for order:', orderId);
    } catch (midtransError: any) {
      const msg = (midtransError.message || '').toLowerCase();
      console.warn('⚠️ Midtrans cancel returned error (proceeding):', msg);
      midtransResult = { cancelled: false, error: msg };
    }

    // 3. Clean up related commissions and pending subscriptions
    try {
      await db.from('commissions').delete().eq('order_id', orderId);
    } catch (commErr) {
      console.warn('Commission cleanup warning:', commErr);
    }

    if (payment.metadata?.subscription_id) {
      try {
        await db
          .from('subscriptions')
          .delete()
          .eq('id', payment.metadata.subscription_id)
          .eq('status', 'pending');
      } catch (subErr) {
        console.warn('Subscription cleanup warning:', subErr);
      }
    }

    const nowIso = new Date().toISOString();
    const updatedMetadata = {
      ...(payment.metadata || {}),
      cancelled_at: nowIso,
      cancelled_by: user.id,
      cancelled_by_email: user.email,
      midtrans_result: midtransResult,
    };

    let operationSuccess = false;
    let lastErrorMsg = '';

    // 4. If action === 'delete', perform direct deletion
    if (action === 'delete') {
      const { data: deletedRows, error: deleteError } = await db
        .from('payments')
        .delete()
        .eq('order_id', orderId)
        .eq('user_id', user.id)
        .select();

      if (!deleteError && deletedRows && deletedRows.length > 0) {
        operationSuccess = true;
      } else if (deleteError) {
        lastErrorMsg = deleteError.message;
      }
    } else {
      // 5. Action === 'cancel': Try updating status to 'cancelled', 'cancel', or 'failed'
      const statusCandidates = ['cancelled', 'cancel', 'failed'];

      for (const statusVal of statusCandidates) {
        const { data: updatedRows, error: updateError } = await db
          .from('payments')
          .update({
            status: statusVal,
            transaction_status: 'cancel',
            metadata: updatedMetadata,
            updated_at: nowIso,
          })
          .eq('order_id', orderId)
          .eq('user_id', user.id)
          .select();

        // Check if row was actually updated
        if (!updateError && updatedRows && updatedRows.length > 0) {
          console.log(`✅ Payment ${orderId} updated to status '${statusVal}'`);
          operationSuccess = true;
          break;
        }

        if (updateError) {
          lastErrorMsg = updateError.message;
          console.warn(`Update status '${statusVal}' error:`, updateError.message);
        }
      }

      // 6. If UPDATE affected 0 rows (e.g., restricted by RLS or constraint), attempt DELETE fallback
      if (!operationSuccess) {
        console.log(`⚠️ Status update affected 0 rows, attempting .delete() fallback for ${orderId}...`);
        const { data: deletedRows, error: deleteError } = await db
          .from('payments')
          .delete()
          .eq('order_id', orderId)
          .eq('user_id', user.id)
          .select();

        if (!deleteError && deletedRows && deletedRows.length > 0) {
          console.log(`✅ Payment ${orderId} deleted via fallback`);
          operationSuccess = true;
        } else if (deleteError) {
          lastErrorMsg = deleteError.message;
        }
      }
    }

    // 7. If still not successful, return an informative error pointing to RLS
    if (!operationSuccess) {
      console.error(`❌ Both update and delete failed/affected 0 rows for order: ${orderId}`);
      return {
        success: false,
        error:
          'Gagal mengubah data transaksi di database. Pastikan RLS Policy di Supabase mengizinkan user mengupdate/menghapus transaksi miliknya sendiri: ' +
          (lastErrorMsg || '0 baris terupdate'),
      };
    }

    console.log('✅ Payment cancellation completed for order:', orderId);

    // Invalidate caches
    revalidatePath('/dashboard/student/payments');
    revalidatePath('/hq-core-updateptn/payments');

    return { success: true, action, error: null };
  } catch (err: any) {
    console.error('❌ Cancel payment exception:', err);
    return { success: false, error: 'Terjadi kesalahan sistem: ' + err.message };
  }
}

/**
 * Get Snap token for resuming payment
 */
export async function resumePayment(orderId: string) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return { success: false, error: 'Unauthorized' };
    }

    const db = getPrivilegedDb(supabase);

    // Get payment details
    const { data: payment, error: paymentError } = await db
      .from('payments')
      .select('*')
      .eq('order_id', orderId)
      .eq('user_id', user.id)
      .eq('status', 'pending')
      .single();

    if (paymentError || !payment) {
      return { success: false, error: 'Payment not found or already processed' };
    }

    return {
      success: true,
      data: {
        orderId: payment.order_id,
        amount: payment.amount,
        metadata: payment.metadata,
      },
      error: null,
    };
  } catch (err: any) {
    console.error('Resume payment error:', err);
    return { success: false, error: err.message };
  }
}
