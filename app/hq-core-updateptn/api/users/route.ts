import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { UserRecord } from "@/components/admin/UsersDataTable";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const supabase = await createClient();

    // Fetch profiles from Supabase DB
    const { data: profilesData, count } = await supabase
      .from("profiles")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false });

    let users: UserRecord[] = [];

    if (profilesData && profilesData.length > 0) {
      const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

      if (serviceRoleKey) {
        const serviceClient = createSupabaseClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          serviceRoleKey,
          { auth: { persistSession: false } }
        );

        const { data: authUsers } = await serviceClient.auth.admin.listUsers();

        users = profilesData.map((profile) => {
          const authUser = authUsers?.users.find((u) => u.id === profile.id);
          return {
            ...profile,
            email: authUser?.email || profile.email || `user-${profile.id.substring(0, 8)}@updateptn.id`,
          };
        });
      } else {
        users = profilesData.map((profile) => ({
          ...profile,
          email: profile.email || `user-${profile.id.substring(0, 8)}@updateptn.id`,
        }));
      }
    }

    return NextResponse.json({
      success: true,
      data: users,
      count: count || users.length,
    });
  } catch (error: any) {
    console.error("Error in users API route:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch users" },
      { status: 500 }
    );
  }
}
