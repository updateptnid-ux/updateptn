'use server';

/**
 * Server Actions for Midtrans Payment
 * Secure payment operations
 */

import { createClient } from '@/lib/supabase/server';
import { createSnapToken, generateOrderId, getTransactionStatus } from '@/lib/midtrans';
import { revalidatePath } from 'next/cache';

interface ActionResult<T = void> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * Create payment transaction
 */
export async function createPayment(params: {
  subscriptionPlanId: string;
  voucherCode?: string;
}): Promise<ActionResult<{ token: string; orderId: string }>> {
  try {
    const supabase = await createClient();

    // Get user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return { success: false, error: 'Unauthorized' };
    }

    // Get user profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name, email, phone')
      .eq('id', user.id)
      .single();

    if (!profile) {
      return { success: false, error: 'Profile not found' };
    }

    // Get subscription plan
    const { data: plan, error: planError } = await supabase
      .from('subscription_plans')
      .select('*')
      .eq('id', params.subscriptionPlanId)
      .eq('is_active', true)
      .single();

    if (planError || !plan) {
      return { success: false, error: 'Subscription plan not found' };
    }

    let finalAmount = plan.price;
    let discountAmount = 0;

    // Apply voucher if provided
    if (params.voucherCode) {
      const { data: voucher } = await supabase
        .from('vouchers')
        .select('*')
        .eq('code', params.voucherCode.toUpperCase())
        .eq('is_active', true)
        .single();

      if (voucher && new Date(voucher.valid_until) > new Date()) {
        if (voucher.discount_type === 'percentage') {
          discountAmount = (finalAmount * voucher.discount_value) / 100;
        } else {
          discountAmount = voucher.discount_value;
        }
        finalAmount = finalAmount - discountAmount;
      }
    }

    // Generate order ID
    const orderId = generateOrderId('UPDPTN');

    // Create subscription record
    const subscriptionEndDate = new Date();
    subscriptionEndDate.setDate(subscriptionEndDate.getDate() + plan.duration_days);

    const { data: subscription, error: subError } = await supabase
      .from('subscriptions')
      .insert({
        user_id: user.id,
        plan_id: plan.id,
        status: 'pending',
        start_date: new Date().toISOString(),
        end_date: subscriptionEndDate.toISOString(),
      })
      .select()
      .single();

    if (subError) {
      return { success: false, error: 'Failed to create subscription' };
    }

    // Create payment record
    const { error: paymentError } = await supabase
      .from('payments')
      .insert({
        user_id: user.id,
        subscription_id: subscription.id,
        order_id: orderId,
        amount: finalAmount,
        original_amount: plan.price,
        discount_amount: discountAmount,
        voucher_code: params.voucherCode || null,
        status: 'pending',
        payment_method: 'midtrans',
      });

    if (paymentError) {
      return { success: false, error: 'Failed to create payment record' };
    }

    // Create Midtrans transaction
    const { token, redirectUrl } = await createSnapToken({
      orderId,
      grossAmount: finalAmount,
      customerDetails: {
        firstName: profile.full_name || 'User',
        email: profile.email || user.email || '',
        phone: profile.phone || '08123456789',
      },
      itemDetails: [
        {
          id: plan.id,
          name: plan.name,
          price: finalAmount,
          quantity: 1,
        },
      ],
    });

    revalidatePath('/dashboard/student');

    return {
      success: true,
      data: {
        token,
        orderId,
      },
    };
  } catch (error) {
    console.error('Create payment error:', error);
    return { success: false, error: 'Internal server error' };
  }
}

/**
 * Check payment status
 */
export async function checkPaymentStatus(
  orderId: string
): Promise<ActionResult<{ status: string; message: string }>> {
  try {
    const supabase = await createClient();

    // Get user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return { success: false, error: 'Unauthorized' };
    }

    // Get payment from database
    const { data: payment } = await supabase
      .from('payments')
      .select('*')
      .eq('order_id', orderId)
      .eq('user_id', user.id)
      .single();

    if (!payment) {
      return { success: false, error: 'Payment not found' };
    }

    // Check status from Midtrans
    const status = await getTransactionStatus(orderId);

    // Update local database
    await supabase
      .from('payments')
      .update({
        status: status.transaction_status,
        updated_at: new Date().toISOString(),
      })
      .eq('order_id', orderId);

    let message = 'Payment pending';
    if (status.transaction_status === 'settlement') {
      message = 'Payment successful';
    } else if (status.transaction_status === 'pending') {
      message = 'Waiting for payment';
    } else if (['cancel', 'deny', 'expire'].includes(status.transaction_status)) {
      message = 'Payment failed';
    }

    return {
      success: true,
      data: {
        status: status.transaction_status,
        message,
      },
    };
  } catch (error) {
    console.error('Check payment status error:', error);
    return { success: false, error: 'Failed to check payment status' };
  }
}

/**
 * Get user's payment history
 */
export async function getPaymentHistory(): Promise<ActionResult<any[]>> {
  try {
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return { success: false, error: 'Unauthorized' };
    }

    const { data: payments, error } = await supabase
      .from('payments')
      .select(`
        *,
        subscriptions (
          plan_id,
          subscription_plans (
            name,
            duration_days
          )
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      return { success: false, error: 'Failed to fetch payment history' };
    }

    return { success: true, data: payments || [] };
  } catch (error) {
    console.error('Get payment history error:', error);
    return { success: false, error: 'Internal server error' };
  }
}
