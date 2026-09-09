/**
 * Helper functions for subscription tier checking with feature-specific access control
 */

// List of free/non-premium tiers
const FREE_TIERS = ['Basic', 'Trial / Gratis', 'Gratis', 'gratis', 'Trial', 'trial'];

// VIP tiers that have access to ALL features (SNBP + SNBT + Mandiri)
const VIP_ALL_ACCESS_TIERS = ['VIP All-in-One', 'VIP', 'vip', 'Platinum', 'platinum'];

/**
 * Check if a subscription tier is premium (any paid subscription)
 * @param tier - The subscription tier string
 * @returns true if tier is premium, false otherwise
 */
export function isPremiumTier(tier: string | null | undefined): boolean {
  if (!tier) return false;
  
  const normalizedTier = tier.trim().toLowerCase();
  
  // Check if it's a free tier
  const isFree = FREE_TIERS.some(freeTier => 
    normalizedTier === freeTier.toLowerCase()
  );
  
  if (isFree) return false;
  
  // Any other tier with 'premium', 'snbt', 'snbp', 'mandiri', etc. is considered premium
  return (
    normalizedTier.includes('premium') ||
    normalizedTier.includes('snbt') ||
    normalizedTier.includes('snbp') ||
    normalizedTier.includes('mandiri') ||
    normalizedTier.includes('vip') ||
    normalizedTier.includes('gold') ||
    normalizedTier.includes('plus') ||
    normalizedTier.includes('bimbel') ||
    normalizedTier.includes('eksklusif') ||
    normalizedTier.includes('intensif')
  );
}

/**
 * Check if a subscription tier is free/non-premium
 * @param tier - The subscription tier string
 * @returns true if tier is free, false otherwise
 */
export function isFreeTier(tier: string | null | undefined): boolean {
  if (!tier) return true; // No tier = free
  
  const normalizedTier = tier.trim().toLowerCase();
  
  return FREE_TIERS.some(freeTier => 
    normalizedTier === freeTier.toLowerCase()
  );
}

/**
 * Check if user has active premium subscription (any paid plan)
 * @param subscription - Subscription object from database
 * @returns true if user has active premium subscription
 */
export function hasActivePremiumSubscription(subscription: {
  tier: string;
  status: string;
  expires_at: string;
} | null | undefined): boolean {
  if (!subscription) return false;
  
  // CRITICAL: Check expiry FIRST before status
  // This prevents issues where status='active' but expires_at is past
  if (new Date(subscription.expires_at) <= new Date()) return false;
  
  // Check status is active
  if (subscription.status !== 'active') return false;
  
  // Check tier is premium
  return isPremiumTier(subscription.tier);
}

/**
 * Check if subscription has VIP All-Access (can use ALL features)
 * @param tier - The subscription tier string
 * @returns true if tier is VIP All-Access
 */
export function isVIPAllAccess(tier: string | null | undefined): boolean {
  if (!tier) return false;
  
  const normalizedTier = tier.trim().toLowerCase();
  
  return VIP_ALL_ACCESS_TIERS.some(vipTier => 
    normalizedTier.includes(vipTier.toLowerCase())
  );
}

/**
 * Check if user has access to a specific feature (SNBP, SNBT, or Mandiri)
 * Returns true if:
 * 1. User has VIP All-in-One subscription, OR
 * 2. User has specific Premium subscription for that feature
 * 
 * @param subscription - Subscription object from database
 * @param featureType - Type of feature: "snbp" | "snbt" | "mandiri"
 * @returns object with hasAccess boolean and message
 */
export function hasFeatureAccess(
  subscription: {
    tier: string;
    status: string;
    expires_at: string;
  } | null | undefined,
  featureType: "snbp" | "snbt" | "mandiri"
): { hasAccess: boolean; message?: string } {
  // No subscription = no access
  if (!subscription) {
    return { 
      hasAccess: false, 
      message: `Fitur ${featureType.toUpperCase()} membutuhkan subscription Premium ${featureType.toUpperCase()} atau VIP All-in-One` 
    };
  }
  
  // CRITICAL: Check expiry FIRST before status
  // This prevents issues where status='active' but expires_at is past
  if (new Date(subscription.expires_at) <= new Date()) {
    return { 
      hasAccess: false, 
      message: "Subscription sudah kadaluarsa" 
    };
  }
  
  // Check status is active
  if (subscription.status !== 'active') {
    return { 
      hasAccess: false, 
      message: "Subscription tidak aktif" 
    };
  }
  
  const tierLower = subscription.tier?.toLowerCase() || '';
  
  // VIP All-in-One has access to EVERYTHING
  if (isVIPAllAccess(subscription.tier)) {
    return { 
      hasAccess: true, 
      message: `Akses VIP All-in-One (Semua Fitur)` 
    };
  }
  
  // Check specific feature subscription
  const featureLower = featureType.toLowerCase();
  if (tierLower.includes(featureLower)) {
    return { 
      hasAccess: true, 
      message: `Akses Premium ${featureType.toUpperCase()}` 
    };
  }
  
  // User has subscription but not for this specific feature
  return { 
    hasAccess: false, 
    message: `Subscription ${subscription.tier} tidak mencakup fitur ${featureType.toUpperCase()}. Upgrade ke Premium ${featureType.toUpperCase()} atau VIP All-in-One.` 
  };
}
