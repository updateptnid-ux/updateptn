"use server";

import { createClient } from "@/lib/supabase/server";

export interface SubscriptionData {
  user_id: string;
  user_name: string;
  user_email: string;
  tier: string;
  status: "active" | "expired" | "pending";
  price_paid: string;
  duration_months: number;
  payment_method?: string;
  transaction_id?: string;
}

/**
 * Create a new subscription for a user
 */
export async function createSubscription(data: SubscriptionData) {
  try {
    const supabase = await createClient();

    // Calculate expiry date based on duration
    const expiresAt = new Date();
    expiresAt.setMonth(expiresAt.getMonth() + data.duration_months);

    const payload = {
      user_id: data.user_id,
      user_name: data.user_name,
      user_email: data.user_email,
      tier: data.tier,
      status: data.status || "pending",
      price_paid: data.price_paid,
      expires_at: expiresAt.toISOString(),
      payment_method: data.payment_method,
      transaction_id: data.transaction_id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { data: subscription, error } = await supabase
      .from("subscriptions")
      .insert([payload])
      .select()
      .single();

    if (error) {
      console.error("Error creating subscription:", error);
      return { success: false, error: error.message };
    }

    return { success: true, data: subscription };
  } catch (error: any) {
    console.error("Unexpected error creating subscription:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Get active subscription for a user
 */
export async function getUserSubscription(userId: string) {
  try {
    const supabase = await createClient();
    const now = new Date().toISOString();

    // First, auto-update any expired subscriptions to "expired" status
    await supabase
      .from("subscriptions")
      .update({ status: "expired", updated_at: now })
      .eq("user_id", userId)
      .eq("status", "active")
      .lt("expires_at", now);

    // Then, auto-update any subscriptions that should be active (not yet expired)
    await supabase
      .from("subscriptions")
      .update({ status: "active", updated_at: now })
      .eq("user_id", userId)
      .eq("status", "expired")
      .gt("expires_at", now);

    // Fetch the most recent active subscription
    const { data, error } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("user_id", userId)
      .gt("expires_at", now)
      .order("expires_at", { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== "PGRST116") {
      // PGRST116 is "no rows returned"
      console.error("Error fetching subscription:", error);
      return { success: false, error: error.message };
    }

    return { success: true, data: data || null };
  } catch (error: any) {
    console.error("Unexpected error fetching subscription:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Update subscription status (e.g., activate after payment)
 */
export async function updateSubscriptionStatus(
  subscriptionId: string,
  status: "active" | "expired" | "pending",
  transactionId?: string
) {
  try {
    const supabase = await createClient();

    const updateData: any = {
      status,
      updated_at: new Date().toISOString(),
    };

    if (transactionId) {
      updateData.transaction_id = transactionId;
    }

    const { data, error } = await supabase
      .from("subscriptions")
      .update(updateData)
      .eq("id", subscriptionId)
      .select()
      .single();

    if (error) {
      console.error("Error updating subscription:", error);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error: any) {
    console.error("Unexpected error updating subscription:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Check if user has active premium subscription
 */
export async function hasPremiumAccess(userId: string) {
  try {
    const result = await getUserSubscription(userId);

    if (!result.success || !result.data) {
      return false;
    }

    const subscription = result.data;
    return (
      subscription.status === "active" &&
      subscription.tier !== "Trial / Gratis" &&
      subscription.tier !== "Basic" &&
      new Date(subscription.expires_at) > new Date()
    );
  } catch (error) {
    console.error("Error checking premium access:", error);
    return false;
  }
}

/**
 * Get user's subscription tier
 */
export async function getUserTier(userId: string): Promise<"Basic" | "Premium" | "Platinum"> {
  try {
    const result = await getUserSubscription(userId);

    if (!result.success || !result.data) {
      return "Basic";
    }

    const subscription = result.data;
    if (
      subscription.status === "active" &&
      new Date(subscription.expires_at) > new Date()
    ) {
      return subscription.tier;
    }

    return "Basic";
  } catch (error) {
    console.error("Error getting user tier:", error);
    return "Basic";
  }
}

/**
 * Extend subscription duration
 */
export async function extendSubscription(
  subscriptionId: string,
  additionalMonths: number
) {
  try {
    const supabase = await createClient();

    // Get current subscription
    const { data: subscription, error: fetchError } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("id", subscriptionId)
      .single();

    if (fetchError) {
      return { success: false, error: fetchError.message };
    }

    // Calculate new expiry date
    const currentExpiry = new Date(subscription.expires_at);
    const now = new Date();
    const baseDate = currentExpiry > now ? currentExpiry : now;
    baseDate.setMonth(baseDate.getMonth() + additionalMonths);

    // Determine status based on new expiry date
    const newStatus = baseDate > now ? "active" : "expired";

    const { data, error } = await supabase
      .from("subscriptions")
      .update({
        expires_at: baseDate.toISOString(),
        status: newStatus,
        updated_at: new Date().toISOString(),
      })
      .eq("id", subscriptionId)
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error: any) {
    console.error("Unexpected error extending subscription:", error);
    return { success: false, error: error.message };
  }
}
