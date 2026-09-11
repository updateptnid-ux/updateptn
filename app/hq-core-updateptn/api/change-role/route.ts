import { createClient } from "@/lib/supabase/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Check if requester is admin
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const ADMIN_EMAILS = ["updateptnid@gmail.com", "admin@updateptn.id"];
    const isAdminEmail = ADMIN_EMAILS.includes(user.email?.toLowerCase() || "");

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();

    const isAdmin = isAdminEmail || profile?.role === "admin";

    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized - Admin only" }, { status: 403 });
    }

    // Get request body
    const body = await request.json();
    const { userId, newRole, isMarketing, freeAccess } = body;

    if (!userId || !newRole) {
      return NextResponse.json({ error: "userId and newRole are required" }, { status: 400 });
    }

    const ALLOWED_ROLES = ["student", "admin", "kol", "ba"];
    if (!ALLOWED_ROLES.includes(newRole)) {
      return NextResponse.json({
        error: `Invalid role. Must be one of: ${ALLOWED_ROLES.join(", ")}`,
      }, { status: 400 });
    }

    // Prevent self-demotion
    if (user.id === userId && newRole !== "admin") {
      return NextResponse.json({ error: "Tidak dapat mengubah role admin sendiri" }, { status: 400 });
    }

    // Use service role to update
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!serviceRoleKey) {
      return NextResponse.json({ error: "Service role key not configured" }, { status: 500 });
    }

    const serviceClient = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      serviceRoleKey,
      { auth: { persistSession: false } }
    );

    // Build update object
    const updateData: Record<string, any> = {
      role: newRole,
      updated_at: new Date().toISOString(),
    };

    if (typeof isMarketing === "boolean") {
      updateData.is_marketing = isMarketing;
    }

    if (typeof freeAccess === "boolean") {
      updateData.free_access = freeAccess;
    }

    // Update role in profiles table
    const { error: updateError } = await serviceClient
      .from("profiles")
      .update(updateData)
      .eq("id", userId);

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    // Also sync directly to auth.users metadata via Supabase Admin API
    try {
      await serviceClient.auth.admin.updateUserById(userId, {
        app_metadata: {
          role: newRole,
          ...(typeof isMarketing === "boolean" ? { is_marketing: isMarketing } : {}),
          ...(typeof freeAccess === "boolean" ? { free_access: freeAccess } : {}),
        },
        user_metadata: {
          role: newRole,
        },
      });
    } catch (authError) {
      console.warn("Warning: Could not update auth.users metadata directly:", authError);
    }

    return NextResponse.json({ 
      success: true, 
      message: `Role berhasil diubah menjadi ${newRole}`,
      data: updateData,
    });

  } catch (error: any) {
    console.error("Change role error:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
