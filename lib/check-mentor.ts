import { createClient } from "@/lib/supabase/server";
import { createClient as createDirectClient } from "@supabase/supabase-js";
import { redirect } from "next/navigation";
import { cache } from "react";

/**
 * Membuat Supabase client yang bypass RLS.
 * Gunakan service_role key jika ada, fallback ke anon key.
 */
function createBypassClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  return createDirectClient(url, serviceKey ?? anonKey, {
    auth: { persistSession: false },
  });
}

/**
 * Cached per-request session lookup.
 */
const getMentorSession = cache(async () => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return { supabase, user };
});

/**
 * Check if current user is a mentor.
 * - Query tabel `mentors` pakai service_role (bypass RLS)
 * - Fallback: admin juga boleh akses mentor panel
 */
export async function checkMentorAccess() {
  const { supabase, user } = await getMentorSession();

  if (!user) {
    redirect("/login?redirect=/mentor");
  }

  // 1. Query mentors table pakai bypass client (no RLS block)
  try {
    const bypassClient = createBypassClient();
    const { data: mentorRecord, error } = await bypassClient
      .from("mentors")
      .select("id, full_name, email, specialization, status")
      .eq("email", user.email!)
      .eq("status", "active")
      .maybeSingle();

    if (!error && mentorRecord) {
      return {
        user,
        mentorRecord,
        isMentor: true,
        name:
          mentorRecord.full_name ||
          user.user_metadata?.full_name ||
          user.email?.split("@")[0] ||
          "Tentor",
      };
    }
  } catch (err) {
    console.error("checkMentorAccess mentors table error:", err);
  }

  // 2. Fallback: izinkan admin akses mentor panel
  try {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role, full_name")
      .eq("id", user.id)
      .maybeSingle();

    if (profile?.role === "admin") {
      return {
        user,
        mentorRecord: null,
        isMentor: true,
        name:
          profile.full_name ||
          user.user_metadata?.full_name ||
          user.email?.split("@")[0] ||
          "Admin",
      };
    }
  } catch (err) {
    console.error("checkMentorAccess admin fallback error:", err);
  }

  // Bukan mentor atau admin → redirect ke student
  redirect("/dashboard/student");
}

/**
 * Client-side check — true jika user ada di tabel mentors atau adalah admin
 */
export async function isMentor(): Promise<boolean> {
  try {
    const { createClient } = await import("@/lib/supabase/client");
    const supabase = createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return false;

    // Check mentors table via bypass client
    const bypassClient = createBypassClient();
    const { data: mentorRecord } = await bypassClient
      .from("mentors")
      .select("id")
      .eq("email", user.email!)
      .eq("status", "active")
      .maybeSingle();

    if (mentorRecord) return true;

    // Fallback: check admin dari profiles
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();

    return profile?.role === "admin";
  } catch {
    return false;
  }
}
