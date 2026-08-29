/**
 * Authentication & Authorization Helpers
 * Centralized auth logic untuk prevent security issues
 */

import { createClient } from "./supabase/server";

/**
 * Check if current user is admin
 * Uses database role instead of hardcoded emails
 */
export async function checkAdminAccess(): Promise<{ 
  isAdmin: boolean; 
  user: any; 
  error?: string 
}> {
  try {
    const supabase = await createClient();
    
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return { isAdmin: false, user: null, error: "Not authenticated" };
    }

    // Check role dari database
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profileError || !profile) {
      return { isAdmin: false, user, error: "Profile not found" };
    }

    const isAdmin = profile.role === "admin";
    
    return { isAdmin, user };
  } catch (error) {
    console.error("Admin check error:", error);
    return { isAdmin: false, user: null, error: "Server error" };
  }
}

/**
 * Check if current user is mentor
 */
export async function checkMentorAccess(): Promise<{ 
  isMentor: boolean; 
  user: any;
  mentorId?: string;
  error?: string 
}> {
  try {
    const supabase = await createClient();
    
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return { isMentor: false, user: null, error: "Not authenticated" };
    }

    // Check if user is active mentor
    const { data: mentor, error: mentorError } = await supabase
      .from("mentors")
      .select("id, status")
      .eq("email", user.email?.toLowerCase())
      .eq("status", "active")
      .maybeSingle();

    if (mentorError || !mentor) {
      return { isMentor: false, user, error: "Not a mentor" };
    }

    return { isMentor: true, user, mentorId: mentor.id };
  } catch (error) {
    console.error("Mentor check error:", error);
    return { isMentor: false, user: null, error: "Server error" };
  }
}

/**
 * Get current authenticated user
 */
export async function getCurrentUser() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  
  if (error || !user) {
    return null;
  }
  
  return user;
}

/**
 * Require authentication (throw if not authenticated)
 */
export async function requireAuth() {
  const user = await getCurrentUser();
  
  if (!user) {
    throw new Error("Authentication required");
  }
  
  return user;
}

/**
 * Require admin access (throw if not admin)
 */
export async function requireAdmin() {
  const { isAdmin, user, error } = await checkAdminAccess();
  
  if (!isAdmin) {
    throw new Error(error || "Admin access required");
  }
  
  return user;
}

/**
 * Require mentor access (throw if not mentor)
 */
export async function requireMentor() {
  const { isMentor, user, mentorId, error } = await checkMentorAccess();
  
  if (!isMentor) {
    throw new Error(error || "Mentor access required");
  }
  
  return { user, mentorId };
}

/**
 * Require mentor OR admin access (throw if neither)
 */
export async function requireMentorOrAdmin() {
  const { isAdmin, user: adminUser } = await checkAdminAccess();
  
  if (isAdmin) {
    return { user: adminUser, role: "admin" as const };
  }
  
  const { isMentor, user: mentorUser, mentorId } = await checkMentorAccess();
  
  if (isMentor) {
    return { user: mentorUser, role: "mentor" as const, mentorId };
  }
  
  throw new Error("Mentor or Admin access required");
}
