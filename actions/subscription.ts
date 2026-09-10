'use server';

import { createClient } from '@/lib/supabase/server';

/**
 * Get user's active subscription
 */
export async function getUserActiveSubscription() {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return { success: false, error: 'Unauthorized', data: null };
  }
  
  const { data, error } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_email', user.email)
    .eq('status', 'active')
    .gte('expires_at', new Date().toISOString())
    .order('expires_at', { ascending: false })
    .limit(1)
    .single();
  
  if (error && error.code !== 'PGRST116') {
    console.error('Error fetching subscription:', error);
    return { success: false, error: error.message, data: null };
  }
  
  return { success: true, data, error: null };
}

/**
 * Get user subscription by ID
 */
export async function getUserSubscription(userId: string) {
  const supabase = await createClient();
  
  // Get user email first
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.id !== userId) {
    return { success: false, error: 'Unauthorized', data: null };
  }
  
  const { data, error } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_email', user.email)
    .eq('status', 'active')
    .gte('expires_at', new Date().toISOString())
    .order('expires_at', { ascending: false })
    .limit(1)
    .single();
  
  if (error && error.code !== 'PGRST116') {
    console.error('Error fetching subscription:', error);
    return { success: false, error: error.message, data: null };
  }
  
  return { success: true, data, error: null };
}

/**
 * Create subscription record
 */
export async function createSubscription(subscriptionData: any) {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return { success: false, error: 'Unauthorized', data: null };
  }
  
  try {
    // Parse duration to calculate expires_at
    const durationString = subscriptionData.duration || '30 hari';
    let durationDays = 30;
    
    if (durationString.includes('hari')) {
      durationDays = parseInt(durationString) || 1;
    } else if (durationString.includes('bulan')) {
      durationDays = (parseInt(durationString) || 1) * 30;
    }
    
    // Calculate expiry date
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + durationDays);
    
    // Create subscription with correct schema matching the actual table
    // Auto-approve: automatically set status to 'active'
    const finalStatus = subscriptionData.status || 'active';

    const subscriptionRecord = {
      user_name: subscriptionData.user_name || user.email?.split('@')[0] || 'User',
      user_email: subscriptionData.user_email || user.email || '',
      tier: subscriptionData.tier,
      status: finalStatus,
      expires_at: expiresAt.toISOString(),
      price_paid: subscriptionData.price_paid,
    };
    
    const { data: subscription, error: subError } = await supabase
      .from('subscriptions')
      .insert([subscriptionRecord])
      .select()
      .single();
    
    if (subError) {
      console.error('Error creating subscription:', subError);
      return { success: false, error: subError.message, data: null };
    }
    
    // Also create a payment record to track the purchase
    const orderId = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    
    const amount = parseInt(subscriptionData.price_paid?.replace(/\D/g, '') || '0');
    
    const isApproved = finalStatus === 'active';

    const paymentRecord = {
      user_id: user.id,
      order_id: orderId,
      amount: amount,
      original_amount: amount,
      status: isApproved ? 'success' : 'pending',
      transaction_status: isApproved ? 'settlement' : 'pending',
      method: subscriptionData.payment_method || 'manual',
      metadata: {
        tier: subscriptionData.tier,
        duration: subscriptionData.duration,
        user_name: subscriptionData.user_name,
        user_email: subscriptionData.user_email,
        subscription_id: subscription.id,
      }
    };
    
    await supabase.from('payments').insert([paymentRecord]);
    
    // Auto-approve: update profile to active premium
    if (isApproved) {
      await supabase
        .from('profiles')
        .update({
          is_premium: true,
          subscription_status: 'active',
          subscription_tier: subscriptionData.tier,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);
    }
    
    return { success: true, data: { ...subscription, order_id: orderId }, error: null };
  } catch (err: any) {
    console.error('Error creating subscription:', err);
    return { success: false, error: err.message || 'Failed to create subscription', data: null };
  }
}

/**
 * Get user tier level based on active subscription
 */
export async function getUserTier(userId: string): Promise<"Basic" | "Premium" | "Platinum"> {
  const supabase = await createClient();
  
  try {
    // Get user email from userId
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || user.id !== userId) {
      return "Basic";
    }
    
    // Get user's active subscription
    const { data: subscription, error } = await supabase
      .from('subscriptions')
      .select('tier, status, expires_at')
      .eq('user_email', user.email)
      .eq('status', 'active')
      .gte('expires_at', new Date().toISOString())
      .order('expires_at', { ascending: false })
      .limit(1)
      .single();
    
    if (error || !subscription) {
      return "Basic"; // Default tier for free users
    }
    
    // Map tier names to tier levels based on your pricing structure
    const tierName = subscription.tier?.toLowerCase() || '';
    
    // Check for platinum/VIP tier - AKSES SEMUA FITUR
    if (
      tierName.includes('vip') || 
      tierName.includes('all-in-one') ||
      tierName.includes('platinum') || 
      tierName.includes('pro')
    ) {
      return "Platinum";
    }
    
    // Check for premium tier (any paid subscription except trial)
    if (
      tierName.includes('premium') || 
      tierName.includes('gold') ||
      tierName.includes('eksklusif') ||
      tierName.includes('bimbel') ||
      tierName.includes('snbt') ||
      tierName.includes('snbp') ||
      tierName.includes('mandiri') ||
      tierName.includes('intensif')
    ) {
      return "Premium";
    }
    
    // Default to Basic
    return "Basic";
  } catch (err) {
    console.error('Error getting user tier:', err);
    return "Basic"; // Fallback to Basic on error
  }
}

/**
 * Check if user has access to specific feature type (SNBP, SNBT, or Mandiri)
 * Returns true if user has VIP All-in-One OR specific premium subscription for that feature
 */
export async function hasFeatureAccess(
  userId: string, 
  featureType: "snbp" | "snbt" | "mandiri"
): Promise<{ hasAccess: boolean; tier: string | null; message?: string }> {
  const supabase = await createClient();
  
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || user.id !== userId) {
      return { 
        hasAccess: false, 
        tier: null, 
        message: "User tidak terautentikasi" 
      };
    }
    
    // Check active subscription
    const { data: subscription, error } = await supabase
      .from('subscriptions')
      .select('tier, status, expires_at')
      .eq('user_email', user.email)
      .eq('status', 'active')
      .gte('expires_at', new Date().toISOString())
      .order('expires_at', { ascending: false })
      .limit(1)
      .single();
    
    if (error || !subscription) {
      return { 
        hasAccess: false, 
        tier: null, 
        message: "Tidak ada subscription aktif" 
      };
    }
    
    const tierName = subscription.tier?.toLowerCase() || '';
    
    // VIP All-in-One can access ALL features
    if (
      tierName.includes('vip') || 
      tierName.includes('all-in-one')
    ) {
      return { 
        hasAccess: true, 
        tier: subscription.tier,
        message: "Akses VIP All-in-One (Semua Fitur)" 
      };
    }
    
    // Check specific feature access
    const featureLower = featureType.toLowerCase();
    if (tierName.includes(featureLower)) {
      return { 
        hasAccess: true, 
        tier: subscription.tier,
        message: `Akses Premium ${featureType.toUpperCase()}` 
      };
    }

    // Check Paket Cek Peluang Satuan (Paket Cek 3x, 5x, 10x)
    if (tierName.includes('cek')) {
      if (tierName.includes('snbp') && featureType !== 'snbp') {
        return {
          hasAccess: false,
          tier: subscription.tier,
          message: `Paket ini khusus untuk SNBP.`,
        };
      }
      if (tierName.includes('snbt') && featureType !== 'snbt') {
        return {
          hasAccess: false,
          tier: subscription.tier,
          message: `Paket ini khusus untuk SNBT.`,
        };
      }
      return {
        hasAccess: true,
        tier: subscription.tier,
        message: `Akses ${subscription.tier}`,
      };
    }
    
    // No access for this specific feature
    return { 
      hasAccess: false, 
      tier: subscription.tier,
      message: `Subscription ${subscription.tier} tidak mencakup fitur ${featureType.toUpperCase()}` 
    };
  } catch (err) {
    console.error('Error checking feature access:', err);
    return { 
      hasAccess: false, 
      tier: null, 
      message: "Error saat memeriksa akses" 
    };
  }
}
