"use server";

import { createClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";

// Admin client for bypassing RLS
function getAdminClient() {
  return createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

// ============================================
// AFFILIATE REGISTRATION
// ============================================

export async function applyForAffiliateAction(data: {
  fullName: string;
  email: string;
  phone: string;
  socialMedia?: string;
  socialMediaUsername?: string;
}) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return { success: false, error: "Unauthorized", message: "Anda harus login terlebih dahulu" };
    }

    // Check if user already has affiliate account
    const { data: existing } = await supabase
      .from("affiliates")
      .select("id, status")
      .eq("user_id", user.id)
      .maybeSingle();

    if (existing) {
      if (existing.status === "pending") {
        return { 
          success: false, 
          error: "PendingApplication",
          message: "Aplikasi Anda masih dalam proses review. Mohon tunggu konfirmasi dari tim kami." 
        };
      }
      if (existing.status === "active") {
        return { 
          success: false, 
          error: "AlreadyAffiliate",
          message: "Anda sudah terdaftar sebagai mitra afiliasi!" 
        };
      }
      if (existing.status === "rejected") {
        return { 
          success: false, 
          error: "Rejected",
          message: "Aplikasi Anda sebelumnya ditolak. Silakan hubungi admin untuk informasi lebih lanjut." 
        };
      }
    }

    // Prepare social media data
    let socialMediaInfo = null;
    if (data.socialMedia && data.socialMediaUsername) {
      socialMediaInfo = `${data.socialMedia}:${data.socialMediaUsername}`;
    }

    // Create new affiliate application
    const admin = getAdminClient();
    const { data: newAffiliate, error: insertError } = await admin
      .from("affiliates")
      .insert({
        user_id: user.id,
        full_name: data.fullName,
        email: data.email,
        phone: data.phone,
        social_media_info: socialMediaInfo,
        status: "pending",
        applied_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (insertError) {
      console.error("Error creating affiliate:", insertError);
      return { success: false, error: "DatabaseError", message: "Gagal mendaftar. Silakan coba lagi." };
    }

    return {
      success: true,
      message: "Aplikasi berhasil dikirim! Tim kami akan meninjau dalam 1-2 hari kerja.",
      affiliate: newAffiliate,
    };
  } catch (error) {
    console.error("Error in applyForAffiliateAction:", error);
    return { success: false, error: "ServerError", message: "Terjadi kesalahan server" };
  }
}

// ============================================
// GET AFFILIATE PROFILE
// ============================================

export async function getAffiliateProfileAction() {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return { success: false, error: "Unauthorized" };
    }

    const { data: affiliate, error } = await supabase
      .from("affiliates")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    if (error) {
      console.error("Error fetching affiliate:", error);
      return { success: false, error: "DatabaseError" };
    }

    if (!affiliate) {
      return { success: false, error: "NotFound", message: "Anda belum terdaftar sebagai mitra afiliasi" };
    }

    return { success: true, affiliate };
  } catch (error) {
    console.error("Error in getAffiliateProfileAction:", error);
    return { success: false, error: "ServerError" };
  }
}

// ============================================
// UPDATE BANK INFO
// ============================================

export async function updateAffiliateBankInfoAction(data: {
  bankName: string;
  bankAccountNumber: string;
  bankAccountName: string;
}) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return { success: false, error: "Unauthorized" };
    }

    const admin = getAdminClient();
    const { error: updateError } = await admin
      .from("affiliates")
      .update({
        bank_name: data.bankName,
        bank_account_number: data.bankAccountNumber,
        bank_account_name: data.bankAccountName,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", user.id);

    if (updateError) {
      console.error("Error updating bank info:", updateError);
      return { success: false, error: "DatabaseError", message: "Gagal memperbarui info bank" };
    }

    return { success: true, message: "Info bank berhasil diperbarui!" };
  } catch (error) {
    console.error("Error in updateAffiliateBankInfoAction:", error);
    return { success: false, error: "ServerError" };
  }
}

// ============================================
// GET AFFILIATE STATS & DASHBOARD DATA
// ============================================

export async function getAffiliateDashboardAction() {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return { success: false, error: "Unauthorized" };
    }

    // Get affiliate profile
    const { data: affiliate } = await supabase
      .from("affiliates")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    if (!affiliate) {
      return { success: false, error: "NotAffiliate", message: "Anda belum terdaftar sebagai mitra afiliasi" };
    }

    // CRITICAL: Check if affiliate is ACTIVE
    if (affiliate.status !== "active") {
      return { 
        success: false, 
        error: "NotActiveAffiliate", 
        message: "Akun affiliate Anda belum diaktifkan atau sedang pending review" 
      };
    }

    // Get referrals
    const { data: referrals } = await supabase
      .from("referrals")
      .select("*")
      .eq("affiliate_id", affiliate.id)
      .order("created_at", { ascending: false });

    // Get commissions
    const { data: commissions } = await supabase
      .from("commissions")
      .select("*")
      .eq("affiliate_id", affiliate.id)
      .order("created_at", { ascending: false });

    // Get recent withdrawals
    const { data: withdrawals } = await supabase
      .from("withdrawals")
      .select("*")
      .eq("affiliate_id", affiliate.id)
      .order("created_at", { ascending: false })
      .limit(10);

    // Calculate stats
    const totalReferrals = referrals?.length || 0;
    const convertedReferrals = referrals?.filter(r => r.status === "converted").length || 0;
    const pendingReferrals = referrals?.filter(r => r.status === "pending").length || 0;
    
    const totalCommissions = commissions?.reduce((sum, c) => sum + Number(c.commission_amount), 0) || 0;
    const approvedCommissions = commissions?.filter(c => c.status === "approved").length || 0;
    const pendingCommissions = commissions?.filter(c => c.status === "pending").length || 0;

    return {
      success: true,
      affiliate,
      stats: {
        totalReferrals,
        convertedReferrals,
        pendingReferrals,
        conversionRate: totalReferrals > 0 ? ((convertedReferrals / totalReferrals) * 100).toFixed(1) : "0",
        totalCommissions,
        approvedCommissions,
        pendingCommissions,
      },
      referrals: referrals || [],
      commissions: commissions || [],
      withdrawals: withdrawals || [],
    };
  } catch (error) {
    console.error("Error in getAffiliateDashboardAction:", error);
    return { success: false, error: "ServerError" };
  }
}

// ============================================
// VALIDATE PROMO CODE (FOR CHECKOUT)
// ============================================

export async function validatePromoCodeAction(promoCode: string) {
  try {
    const supabase = await createClient();
    
    // Normalize code (uppercase, trim)
    const normalizedCode = promoCode.trim().toUpperCase();
    
    if (!normalizedCode) {
      return { 
        success: false, 
        error: "InvalidCode", 
        message: "Kode promo tidak boleh kosong" 
      };
    }

    // Check if code exists and is active
    const { data: affiliate, error } = await supabase
      .from("affiliates")
      .select("id, affiliate_code, full_name, status, commission_rate")
      .eq("affiliate_code", normalizedCode)
      .maybeSingle();

    if (error) {
      console.error("Error validating promo code:", error);
      return { 
        success: false, 
        error: "DatabaseError", 
        message: "Gagal memvalidasi kode promo" 
      };
    }

    if (!affiliate) {
      return { 
        success: false, 
        error: "NotFound", 
        message: "Kode promo tidak valid" 
      };
    }

    if (affiliate.status !== "active") {
      return { 
        success: false, 
        error: "Inactive", 
        message: "Kode promo tidak aktif" 
      };
    }

    // Return success with discount info
    return {
      success: true,
      message: "Kode promo valid!",
      affiliate: {
        id: affiliate.id,
        code: affiliate.affiliate_code,
        name: affiliate.full_name,
        discountPercent: 10, // Fixed 10% discount for customers
        commissionRate: affiliate.commission_rate || 10, // Commission rate for affiliate
      },
    };
  } catch (error) {
    console.error("Error in validatePromoCodeAction:", error);
    return { 
      success: false, 
      error: "ServerError", 
      message: "Terjadi kesalahan server" 
    };
  }
}

// ============================================
// CREATE WITHDRAWAL REQUEST
// ============================================

export async function createWithdrawalRequestAction(amount: number) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return { success: false, error: "Unauthorized" };
    }

    // Get affiliate
    const { data: affiliate } = await supabase
      .from("affiliates")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    if (!affiliate) {
      return { success: false, error: "NotAffiliate", message: "Anda belum terdaftar sebagai mitra" };
    }

    // Validations
    if (amount < 100000) {
      return { 
        success: false, 
        error: "MinimumAmount", 
        message: "Minimal penarikan adalah Rp 100.000" 
      };
    }

    if (amount > Number(affiliate.pending_balance)) {
      return { 
        success: false, 
        error: "InsufficientBalance", 
        message: `Saldo tidak cukup. Saldo tersedia: Rp ${Number(affiliate.pending_balance).toLocaleString("id-ID")}` 
      };
    }

    if (!affiliate.bank_name || !affiliate.bank_account_number) {
      return { 
        success: false, 
        error: "BankInfoRequired", 
        message: "Harap lengkapi informasi bank terlebih dahulu" 
      };
    }

    // Create withdrawal
    const admin = getAdminClient();
    const { data: withdrawal, error: insertError } = await admin
      .from("withdrawals")
      .insert({
        affiliate_id: affiliate.id,
        amount,
        status: "pending",
        bank_name: affiliate.bank_name,
        bank_account_number: affiliate.bank_account_number,
        bank_account_name: affiliate.bank_account_name,
      })
      .select()
      .single();

    if (insertError) {
      console.error("Error creating withdrawal:", insertError);
      return { success: false, error: "DatabaseError", message: "Gagal membuat permintaan penarikan" };
    }

    return { 
      success: true, 
      message: "Permintaan penarikan berhasil dibuat! Tim kami akan memproses dalam 1-3 hari kerja.",
      withdrawal 
    };
  } catch (error) {
    console.error("Error in createWithdrawalRequestAction:", error);
    return { success: false, error: "ServerError" };
  }
}

// ============================================
// TRACK REFERRAL (called when user clicks affiliate link)
// ============================================

export async function trackReferralClickAction(affiliateCode: string, source?: string) {
  try {
    const admin = getAdminClient();
    
    // Verify affiliate exists and is active
    const { data: affiliate } = await admin
      .from("affiliates")
      .select("id, status")
      .eq("affiliate_code", affiliateCode)
      .eq("status", "active")
      .maybeSingle();

    if (!affiliate) {
      return { success: false, error: "InvalidCode", message: "Kode afiliasi tidak valid" };
    }

    // Store in cookie/session for attribution (handled on client-side)
    return { 
      success: true, 
      affiliateId: affiliate.id,
      affiliateCode,
    };
  } catch (error) {
    console.error("Error in trackReferralClickAction:", error);
    return { success: false, error: "ServerError" };
  }
}

// ============================================
// RECORD REFERRAL (called after user registers)
// ============================================

export async function recordReferralAction(data: {
  affiliateCode: string;
  referredEmail: string;
  source?: string;
}) {
  try {
    const admin = getAdminClient();
    
    // Get affiliate
    const { data: affiliate } = await admin
      .from("affiliates")
      .select("id")
      .eq("affiliate_code", data.affiliateCode)
      .eq("status", "active")
      .maybeSingle();

    if (!affiliate) {
      return { success: false, error: "InvalidCode" };
    }

    // Check if referral already exists
    const { data: existing } = await admin
      .from("referrals")
      .select("id")
      .eq("affiliate_code", data.affiliateCode)
      .eq("referred_email", data.referredEmail)
      .maybeSingle();

    if (existing) {
      return { success: true, message: "Referral already recorded" };
    }

    // Create referral record
    const { error: insertError } = await admin
      .from("referrals")
      .insert({
        affiliate_id: affiliate.id,
        affiliate_code: data.affiliateCode,
        referred_email: data.referredEmail,
        status: "pending",
        source: data.source || "direct",
      });

    if (insertError) {
      console.error("Error recording referral:", insertError);
      return { success: false, error: "DatabaseError" };
    }

    // Update affiliate stats
    await admin
      .from("affiliates")
      .update({ 
        total_referrals: admin.rpc("increment", { x: 1 }),
        updated_at: new Date().toISOString() 
      })
      .eq("id", affiliate.id);

    return { success: true, message: "Referral recorded successfully" };
  } catch (error) {
    console.error("Error in recordReferralAction:", error);
    return { success: false, error: "ServerError" };
  }
}
