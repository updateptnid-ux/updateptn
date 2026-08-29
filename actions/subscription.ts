"use server";

import { createClient } from "@/lib/supabase/server";
import { FREE_TIERS, calculateExpiresAt } from "@/lib/subscription-helpers";


export interface SubscriptionData {
  user_id: string;
  user_name: string;
  user_email: string;
  tier: string;          // Nama tier lengkap, mis. "Premium SNBT", "VIP"
  status: "active" | "expired" | "pending";
  price_paid: string;    // Format string, mis. "Rp 79.000"
  duration: string;      // String durasi, mis. "7 hari", "1 bulan", "3 bulan"
  payment_method?: string;
  transaction_id?: string;
}

/**
 * Create a new subscription for a user
 */
export async function createSubscription(data: SubscriptionData) {
  try {
    const supabase = await createClient();

    const expiresAt = calculateExpiresAt(data.duration);

    const payload = {
      user_id: data.user_id,
      user_name: data.user_name,
      user_email: data.user_email,
      tier: data.tier,
      status: data.status || "pending",
      price_paid: data.price_paid,
      expires_at: expiresAt.toISOString(),
      payment_method: data.payment_method || null,
      transaction_id: data.transaction_id || null,
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

    const { data, error } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("user_id", userId)
      .eq("status", "active")
      .gt("expires_at", now)
      .order("expires_at", { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== "PGRST116") {
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
 * Check if user has active premium subscription (any non-free tier)
 */
export async function hasPremiumAccess(userId: string): Promise<boolean> {
  try {
    const result = await getUserSubscription(userId);
    if (!result.success || !result.data) return false;

    const sub = result.data;
    return (
      sub.status === "active" &&
      !FREE_TIERS.includes(sub.tier) &&
      new Date(sub.expires_at) > new Date()
    );
  } catch {
    return false;
  }
}

/**
 * Get user's subscription tier
 */
export async function getUserTier(userId: string): Promise<string> {
  try {
    const result = await getUserSubscription(userId);
    if (!result.success || !result.data) return "Basic";

    const sub = result.data;
    if (sub.status === "active" && new Date(sub.expires_at) > new Date()) {
      return sub.tier;
    }
    return "Basic";
  } catch {
    return "Basic";
  }
}

/**
 * Admin: Activate pending subscription
 */
export async function activateSubscription(subscriptionId: string) {
  try {
    const { requireAdmin } = await import("@/lib/auth-helpers");
    await requireAdmin();

    const supabase = await createClient();

    const { data, error } = await supabase
      .from("subscriptions")
      .update({
        status: "active",
        updated_at: new Date().toISOString(),
      })
      .eq("id", subscriptionId)
      .select()
      .single();

    if (error) {
      return { ok: false, message: error.message };
    }

    return { ok: true, subscription: data, message: "Subscription berhasil diaktifkan" };
  } catch (error: any) {
    return { ok: false, message: error.message || "Unauthorized" };
  }
}

/**
 * Admin: Reject pending subscription
 */
export async function rejectSubscription(subscriptionId: string, reason: string) {
  try {
    const { requireAdmin } = await import("@/lib/auth-helpers");
    await requireAdmin();

    const supabase = await createClient();

    const { data, error } = await supabase
      .from("subscriptions")
      .update({
        status: "rejected" as any,
        rejection_reason: reason,
        updated_at: new Date().toISOString(),
      })
      .eq("id", subscriptionId)
      .select()
      .single();

    if (error) {
      return { ok: false, message: error.message };
    }

    return { ok: true, subscription: data, message: "Subscription ditolak" };
  } catch (error: any) {
    return { ok: false, message: error.message || "Unauthorized" };
  }
}

/**
 * Extend subscription duration
 */
export async function extendSubscription(
  subscriptionId: string,
  additionalDays: number
) {
  try {
    const supabase = await createClient();

    const { data: subscription, error: fetchError } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("id", subscriptionId)
      .single();

    if (fetchError) {
      return { success: false, error: fetchError.message };
    }

    const currentExpiry = new Date(subscription.expires_at);
    const now = new Date();
    const baseDate = currentExpiry > now ? currentExpiry : now;
    baseDate.setDate(baseDate.getDate() + additionalDays);

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
    return { success: false, error: error.message };
  }
}
