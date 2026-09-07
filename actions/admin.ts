"use server";

import { createClient } from "@/lib/supabase/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";

/**
 * Admin Action: Delete User Account Permanently
 * 
 * This uses Service Role Key to bypass RLS and delete:
 * - User's auth account
 * - Profile data
 * - All related data (results, subscriptions, payments, etc.)
 * 
 * ⚠️ WARNING: This action is IRREVERSIBLE!
 * 
 * @param userId - UUID of the user to delete
 * @returns Success or error message
 */
export async function deleteUserByAdminAction(userId: string) {
  try {
    // 1. Verify admin is making this request
    const supabase = await createClient();
    const { data: { user: adminUser }, error: adminError } = await supabase.auth.getUser();

    if (adminError || !adminUser) {
      return { error: "Unauthorized: Admin authentication required" };
    }

    // Check if user is admin
    const ADMIN_EMAILS = ["updateptnid@gmail.com", "admin@updateptn.id"];
    const isAdmin = ADMIN_EMAILS.includes(adminUser.email?.toLowerCase() || "");

    if (!isAdmin) {
      return { error: "Forbidden: Admin access required" };
    }

    // 2. Get user info before deletion (for logging)
    const { data: userProfile } = await supabase
      .from("profiles")
      .select("full_name, email")
      .eq("id", userId)
      .single();

    const userName = userProfile?.full_name || userProfile?.email || userId;

    // 3. Create Service Role client for deletion
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!serviceRoleKey) {
      return { error: "Service Role Key not configured in environment variables" };
    }

    const supabaseAdmin = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      serviceRoleKey,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    // 4. Delete related data (in order to avoid foreign key constraints)
    
    // Delete tryout results
    const { error: resultsError } = await supabaseAdmin
      .from("results")
      .delete()
      .eq("user_id", userId);
    
    if (resultsError) {
      console.error("Error deleting results:", resultsError);
    }

    // Delete tryout results mandiri (if table exists)
    const { error: resultsMandiriError } = await supabaseAdmin
      .from("results_mandiri")
      .delete()
      .eq("user_id", userId);
    
    if (resultsMandiriError && resultsMandiriError.code !== "42P01") { // Ignore if table doesn't exist
      console.error("Error deleting results_mandiri:", resultsMandiriError);
    }

    // Delete subscriptions
    const { error: subsError } = await supabaseAdmin
      .from("subscriptions")
      .delete()
      .eq("user_id", userId);
    
    if (subsError) {
      console.error("Error deleting subscriptions:", subsError);
    }

    // Delete payments
    const { error: paymentsError } = await supabaseAdmin
      .from("payments")
      .delete()
      .eq("user_id", userId);
    
    if (paymentsError) {
      console.error("Error deleting payments:", paymentsError);
    }

    // Delete free claims
    const { error: freeClaimsError } = await supabaseAdmin
      .from("free_claims")
      .delete()
      .eq("user_id", userId);
    
    if (freeClaimsError) {
      console.error("Error deleting free_claims:", freeClaimsError);
    }

    // Delete affiliate data
    const { error: affiliateError } = await supabaseAdmin
      .from("affiliates")
      .delete()
      .eq("user_id", userId);
    
    if (affiliateError && affiliateError.code !== "42P01") {
      console.error("Error deleting affiliate data:", affiliateError);
    }

    // Delete affiliate referrals (where user was referred)
    const { error: referralsError } = await supabaseAdmin
      .from("affiliate_referrals")
      .delete()
      .eq("referred_user_id", userId);
    
    if (referralsError && referralsError.code !== "42P01") {
      console.error("Error deleting referrals:", referralsError);
    }

    // 5. Delete profile
    const { error: profileError } = await supabaseAdmin
      .from("profiles")
      .delete()
      .eq("id", userId);

    if (profileError) {
      console.error("Error deleting profile:", profileError);
      return { error: `Failed to delete profile: ${profileError.message}` };
    }

    // 6. Delete auth user (this is the final step)
    const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(userId);

    if (authError) {
      console.error("Error deleting auth user:", authError);
      return { error: `Failed to delete auth user: ${authError.message}` };
    }

    // 7. Log the action (optional - if you have audit_logs table)
    try {
      await supabaseAdmin.from("audit_logs").insert({
        admin_id: adminUser.id,
        admin_email: adminUser.email,
        action: "DELETE_USER",
        target_user_id: userId,
        target_user_name: userName,
        details: `Deleted user account and all related data`,
        timestamp: new Date().toISOString(),
      });
    } catch (logError) {
      // Ignore logging errors, don't fail the delete operation
      console.warn("Could not log deletion (audit_logs table might not exist):", logError);
    }

    // 8. Revalidate the users page
    revalidatePath("/hq-core-updateptn/users");

    return { 
      success: true, 
      message: `User account "${userName}" has been permanently deleted along with all related data.` 
    };

  } catch (err: any) {
    console.error("Unexpected error in deleteUserByAdminAction:", err);
    return { error: `Unexpected error: ${err.message}` };
  }
}

/**
 * Admin Action: Get User Details
 * Fetch comprehensive user information for admin review
 */
export async function getUserDetailsByAdmin(userId: string) {
  try {
    const supabase = await createClient();
    
    // Verify admin
    const { data: { user: adminUser } } = await supabase.auth.getUser();
    if (!adminUser) {
      return { error: "Unauthorized" };
    }

    const ADMIN_EMAILS = ["updateptnid@gmail.com", "admin@updateptn.id"];
    const isAdmin = ADMIN_EMAILS.includes(adminUser.email?.toLowerCase() || "");
    if (!isAdmin) {
      return { error: "Forbidden: Admin access required" };
    }

    // Fetch user profile
    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    // Fetch subscription
    const { data: subscription } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("user_id", userId)
      .single();

    // Count tryout results
    const { count: resultsCount } = await supabase
      .from("results")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId);

    // Count payments
    const { count: paymentsCount } = await supabase
      .from("payments")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId);

    return {
      success: true,
      data: {
        profile,
        subscription,
        resultsCount: resultsCount || 0,
        paymentsCount: paymentsCount || 0,
      }
    };

  } catch (err: any) {
    return { error: err.message };
  }
}
