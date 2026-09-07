import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

/**
 * Check if user's profile is complete
 * Returns true if profile has required fields (full_name and provinsi)
 */
export async function isProfileComplete(userId: string): Promise<boolean> {
  const supabase = await createClient();
  
  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, provinsi")
    .eq("id", userId)
    .single();

  return !!(profile?.full_name && profile?.provinsi);
}

/**
 * Require complete profile for a page
 * Redirects to /complete-profile if profile is incomplete
 * Use this in Server Components
 */
export async function requireCompleteProfile() {
  const supabase = await createClient();
  
  const { data: { user }, error } = await supabase.auth.getUser();
  
  if (error || !user) {
    redirect("/login");
  }

  const complete = await isProfileComplete(user.id);
  
  if (!complete) {
    redirect("/complete-profile");
  }

  return user;
}

/**
 * Get profile completion status with user data
 * Use this when you need both auth and profile check without redirect
 */
export async function getProfileStatus() {
  const supabase = await createClient();
  
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  
  if (userError || !user) {
    return {
      authenticated: false,
      profileComplete: false,
      user: null,
      profile: null,
    };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  const profileComplete = !!(profile?.full_name && profile?.provinsi);

  return {
    authenticated: true,
    profileComplete,
    user,
    profile,
  };
}
