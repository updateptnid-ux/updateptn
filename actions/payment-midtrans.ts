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
 * Create payment for subscription (New - matching actual schema)
 */
export async function createSubscriptionPayment(params: {
  tier: string;
  duration: string;
  price: number;
  voucherCode?: string;
}): Promise<ActionResult<{ token: string; orderId: string }>> {
  try {
    const supabase = await createClient();

    // Get user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      console.error('Auth error:', authError);
      return { success: false, error: 'Unauthorized - silakan login kembali' };
    }

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('full_name, email, phone')
      .eq('id', user.id)
      .single();

    if (profileError) {
      console.error('Profile fetch error:', profileError);
    }

    const userName = profile?.full_name || user.email?.split('@')[0] || 'User';
    const userEmail = user.email || '';
    const userPhone = profile?.phone || '08123456789';

    let finalAmount = params.price;
    let discountAmount = 0;
    let appliedVoucherCode = null;
    let affiliateId = null;

    // Apply voucher/affiliate code if provided
    if (params.voucherCode) {
      // Check vouchers table (sudah ada RLS public read)
      const { data: voucher } = await supabase
        .from('vouchers')
        .select('*, affiliate_id')
        .ilike('code', params.voucherCode)
        .eq('status', 'active')
        .single();

      if (voucher && new Date(voucher.valid_until) > new Date()) {
        const voucherValue = parseInt(String(voucher.value || '0').replace(/\D/g, '')) || 0;
        
        if (voucher.discount_type === 'percentage') {
          discountAmount = Math.round((params.price * voucherValue) / 100);
        } else {
          discountAmount = voucherValue;
        }
        
        finalAmount = Math.max(0, params.price - discountAmount);
        appliedVoucherCode = voucher.code;
        
        // If voucher has affiliate_id, set it for commission
        if (voucher.affiliate_id) {
          affiliateId = voucher.affiliate_id;
          console.log(`✅ Affiliate voucher applied: ${voucher.code}, affiliate: ${affiliateId}`);
        }
        
        console.log(`✅ Voucher applied: ${voucher.code}, discount: Rp ${discountAmount.toLocaleString('id-ID')}`);
      }
    }

    // Parse duration to calculate expires_at
    let durationDays = 30;
    if (params.duration.includes('hari')) {
      durationDays = parseInt(params.duration) || 1;
    } else if (params.duration.includes('bulan')) {
      durationDays = (parseInt(params.duration) || 1) * 30;
    }

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + durationDays);

    // Generate order ID and invoice number
    const orderId = generateOrderId('UPDPTN');
    const invoiceNo = `INV-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;

    // Create subscription record (matching actual schema)
    const { data: subscription, error: subError } = await supabase
      .from('subscriptions')
      .insert({
        user_name: userName,
        user_email: userEmail,
        tier: params.tier,
        status: 'pending',
        expires_at: expiresAt.toISOString(),
        price_paid: `Rp ${finalAmount.toLocaleString('id-ID')}`,
      })
      .select()
      .single();

    if (subError) {
      console.error('❌ Subscription insert error:', subError);
      return { success: false, error: `Gagal membuat subscription: ${subError.message}` };
    }

    console.log('✅ Subscription created:', subscription.id);

    // Create payment record - ONLY provide required columns and common ones
    const paymentData: any = {
      // REQUIRED columns (NOT NULL)
      amount: finalAmount,        // REQUIRED
      method: 'midtrans',         // REQUIRED
      
      // Common columns (might have defaults or nullable)
      user_id: user.id,
      order_id: orderId,
      invoice_no: invoiceNo,
      status: 'pending',
      original_amount: params.price,
      discount_amount: discountAmount || 0,
      
      // Store additional info in metadata JSON
      metadata: {
        tier: params.tier,
        duration: params.duration,
        subscription_id: subscription.id,
        user_name: userName,
        user_email: userEmail,
        payment_method: 'midtrans', // backup
      }
    };

    // Add voucher_code only if exists
    if (appliedVoucherCode) {
      paymentData.voucher_code = appliedVoucherCode;
    }

    // Add affiliate_id for commission tracking
    if (affiliateId) {
      paymentData.affiliate_id = affiliateId;
    }

    // Insert payment and get the UUID back
    const { data: paymentRecord, error: paymentError } = await supabase
      .from('payments')
      .insert(paymentData)
      .select('id')
      .single();

    if (paymentError) {
      console.error('❌ Payment insert error:', paymentError);
      console.error('📦 Payment data attempted:', paymentData);
      
      // Rollback: delete the subscription we just created
      await supabase.from('subscriptions').delete().eq('id', subscription.id);
      
      return { success: false, error: `Gagal membuat record pembayaran: ${paymentError.message}` };
    }

    console.log('✅ Payment record created for order:', orderId, 'with UUID:', paymentRecord.id);

    // If affiliate code was used, create commission record (pending status)
    if (affiliateId && finalAmount > 0 && paymentRecord) {
      const commissionAmount = Math.round((finalAmount * 10) / 100); // 10% commission from DISCOUNTED price
      const commissionRate = 10.00;
      
      const { error: commissionError } = await supabase
        .from('commissions')
        .insert({
          affiliate_id: affiliateId,
          payment_id: paymentRecord.id, // ✅ Use payment UUID not order_id string
          order_id: orderId,
          customer_email: userEmail,
          transaction_amount: finalAmount,
          commission_rate: commissionRate,
          commission_amount: commissionAmount,
          status: 'pending', // Will be updated to 'approved' when payment settles
          created_at: new Date().toISOString(),
        });

      if (commissionError) {
        console.error('⚠️ Commission record error (non-critical):', commissionError);
      } else {
        console.log(`✅ Commission record created: Rp ${commissionAmount.toLocaleString('id-ID')} for affiliate ${affiliateId}`);
      }
    }

    // Create Midtrans transaction
    try {
      const { token, redirectUrl } = await createSnapToken({
        orderId,
        grossAmount: finalAmount,
        customerDetails: {
          firstName: userName,
          email: userEmail,
          phone: userPhone,
        },
        itemDetails: [
          {
            id: subscription.id,
            name: `${params.tier} - ${params.duration}`,
            price: finalAmount,
            quantity: 1,
          },
        ],
      });

      console.log('✅ Midtrans Snap token created');

      revalidatePath('/dashboard/student');

      return {
        success: true,
        data: {
          token,
          orderId,
        },
      };
    } catch (midtransError: any) {
      console.error('❌ Midtrans Snap token error:', midtransError);
      
      // Rollback both payment and subscription
      await supabase.from('payments').delete().eq('order_id', orderId);
      await supabase.from('subscriptions').delete().eq('id', subscription.id);
      
      return { 
        success: false, 
        error: `Gagal membuat token pembayaran: ${midtransError.message || 'Midtrans error'}` 
      };
    }
  } catch (error: any) {
    console.error('❌ Create subscription payment error:', error);
    return { success: false, error: `Internal error: ${error.message || 'Unknown error'}` };
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
      .select('*')
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
