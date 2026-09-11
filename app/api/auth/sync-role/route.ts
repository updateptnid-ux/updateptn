import { createClient } from "@/lib/supabase/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // 1. Get current authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized: No active session" },
        { status: 401 }
      );
    }

    const SUPER_ADMIN_EMAILS = ["updateptnid@gmail.com", "admin@updateptn.id"];
    const isSuperAdmin = Boolean(
      user.email && SUPER_ADMIN_EMAILS.includes(user.email.toLowerCase())
    );

    // 2. Query latest real-time profile data
    let profileRole: string | null = null;
    let isMarketing = false;
    let freeAccess = false;
    let fullName: string | null = null;

    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    let serviceClient: any = null;

    if (serviceRoleKey) {
      serviceClient = createSupabaseClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        serviceRoleKey,
        { auth: { persistSession: false } }
      );

      const { data: profile } = await serviceClient
        .from("profiles")
        .select("role, is_marketing, free_access, full_name")
        .eq("id", user.id)
        .maybeSingle();

      if (profile) {
        profileRole = profile.role || null;
        isMarketing = Boolean(profile.is_marketing);
        freeAccess = Boolean(profile.free_access);
        fullName = profile.full_name || null;
      }
    } else {
      // Fallback to authenticated user client
      const { data: profile } = await supabase
        .from("profiles")
        .select("role, is_marketing, free_access, full_name")
        .eq("id", user.id)
        .maybeSingle();

      if (profile) {
        profileRole = profile.role || null;
        isMarketing = Boolean(profile.is_marketing);
        freeAccess = Boolean(profile.free_access);
        fullName = profile.full_name || null;
      }
    }

    const effectiveRole = isSuperAdmin
      ? "admin"
      : (profileRole || user.app_metadata?.role || user.user_metadata?.role || "student").toLowerCase();

    const isAdmin = isSuperAdmin || effectiveRole === "admin";

    // 3. Sync to Supabase Auth metadata if service client available
    if (serviceClient) {
      try {
        await serviceClient.auth.admin.updateUserById(user.id, {
          app_metadata: {
            role: effectiveRole,
            is_marketing: isMarketing,
            free_access: freeAccess,
          },
          user_metadata: {
            role: effectiveRole,
            ...(fullName ? { full_name: fullName } : {}),
          },
        });
      } catch (syncErr) {
        console.error("Warning: Failed to update auth metadata in sync-role:", syncErr);
      }
    }

    return NextResponse.json({
      success: true,
      userId: user.id,
      role: effectiveRole,
      isAdmin,
      isMarketing,
      freeAccess,
      syncedAt: new Date().toISOString(),
    });
  } catch (err: any) {
    console.error("Error in /api/auth/sync-role:", err);
    return NextResponse.json(
      { error: err?.message || "Internal server error" },
      { status: 500 }
    );
  }
}
