"use server";

import { createClient } from "@/lib/supabase/server";
import { requireAuth } from "@/lib/auth-helpers";

export type PackageTier = "premium" | "gold";

export interface CreateSubscriptionParams {
  userId: string;
  tier: PackageTier;
  paymentMethod: string;
  paymentProof?: string;
}

/**
 * Create pending subscription after payment
 */
export async function createPendingSubscription(params: CreateSubscriptionParams) {
  try {
    // Verify user is authenticated
    const user = await requireAuth();
    
    if (user.id !== params.userId) {
      return { 
        ok: false, 
        message: "Unauthorized: User ID mismatch" 
      };
    }

    const supabase = await createClient();

    // Calculate expiry date based on tier
    const now = new Date();
    let expiresAt: Date;
    
    if (params.tier === "premium") {
      // 1 month
      expiresAt = new Date(now.setMonth(now.getMonth() + 1));
    } else if (params.tier === "gold") {
      // 3 months
      expiresAt = new Date(now.setMonth(now.getMonth() + 3));
    } else {
      return { ok: false, message: "Invalid tier" };
    }

    // Create subscription record with "active" status (Auto-Approved)
    const { data: subscription, error } = await supabase
      .from("subscriptions")
      .insert([
        {
          user_id: params.userId,
          tier: params.tier,
          status: "active", // Auto-approved
          expires_at: expiresAt.toISOString(),
          payment_method: params.paymentMethod,
          payment_proof: params.paymentProof,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (error) {
      console.error("Error creating subscription:", error);
      return { 
        ok: false, 
        message: error.message || "Gagal membuat subscription" 
      };
    }

    // Auto-approve: update user profile to premium
    await supabase
      .from("profiles")
      .update({
        is_premium: true,
        subscription_status: "active",
        subscription_tier: params.tier,
        updated_at: new Date().toISOString(),
      })
      .eq("id", params.userId);

    return { 
      ok: true, 
      subscription,
      message: "Subscription berhasil diaktifkan secara otomatis" 
    };
  } catch (error: any) {
    console.error("Create subscription error:", error);
    return { 
      ok: false, 
      message: error.message || "Internal server error" 
    };
  }
}

/**
 * Get user's subscription history
 */
export async function getUserSubscriptions(userId: string) {
  try {
    const user = await requireAuth();
    
    if (user.id !== userId) {
      return { 
        ok: false, 
        message: "Unauthorized" 
      };
    }

    const supabase = await createClient();

    const { data, error } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching subscriptions:", error);
      return { 
        ok: false, 
        message: error.message 
      };
    }

    return { 
      ok: true, 
      subscriptions: data 
    };
  } catch (error: any) {
    console.error("Get subscriptions error:", error);
    return { 
      ok: false, 
      message: error.message || "Internal server error" 
    };
  }
}

/**
 * Admin: Activate pending subscription
 */
export async function activateSubscription(subscriptionId: string) {
  try {
    // Check admin access
    const { requireAdmin } = await import("@/lib/auth-helpers");
    await requireAdmin();

    const supabase = await createClient();

    const { data, error } = await supabase
      .from("subscriptions")
      .update({ 
        status: "active",
        updated_at: new Date().toISOString() 
      })
      .eq("id", subscriptionId)
      .select()
      .single();

    if (error) {
      console.error("Error activating subscription:", error);
      return { 
        ok: false, 
        message: error.message 
      };
    }

    // TODO: Send email notification to user

    return { 
      ok: true, 
      subscription: data,
      message: "Subscription berhasil diaktifkan" 
    };
  } catch (error: any) {
    console.error("Activate subscription error:", error);
    return { 
      ok: false, 
      message: error.message || "Unauthorized" 
    };
  }
}

/**
 * Admin: Reject pending subscription
 */
export async function rejectSubscription(subscriptionId: string, reason: string) {
  try {
    // Check admin access
    const { requireAdmin } = await import("@/lib/auth-helpers");
    await requireAdmin();

    const supabase = await createClient();

    const { data, error } = await supabase
      .from("subscriptions")
      .update({ 
        status: "rejected",
        rejection_reason: reason,
        updated_at: new Date().toISOString() 
      })
      .eq("id", subscriptionId)
      .select()
      .single();

    if (error) {
      console.error("Error rejecting subscription:", error);
      return { 
        ok: false, 
        message: error.message 
      };
    }

    // TODO: Send email notification to user with reason

    return { 
      ok: true, 
      subscription: data,
      message: "Subscription ditolak" 
    };
  } catch (error: any) {
    console.error("Reject subscription error:", error);
    return { 
      ok: false, 
      message: error.message || "Unauthorized" 
    };
  }
}

/**
 * Get package pricing info
 * @deprecated Gunakan resolveTierName dari actions/subscription.ts untuk tier naming
 */
export function getPackageInfo(tier: PackageTier) {
  const packages = {
    premium: {
      name: "Premium SNBT",
      price: 79000,
      durationDays: 30,
      features: [
        "Cek Rasionalisasi SNBT Tak Terbatas",
        "Modul Belajar SNBT Lengkap",
        "Bank Soal SNBT HOTS",
        "Timer CBT Standard",
        "Download Rekaman HD",
      ],
    },
    gold: {
      name: "VIP",
      price: 149000,
      durationDays: 30,
      features: [
        "Cek Rasionalisasi SNBP, SNBT & Mandiri",
        "Semua Materi & Bank Soal",
        "Timer CBT Full",
        "Download Rekaman HD",
        "Live Class & Materi Replay",
        "Konsultasi Jurusan",
      ],
    },
  };

  return packages[tier];
}
