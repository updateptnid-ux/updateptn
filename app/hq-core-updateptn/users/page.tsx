import { createClient } from "@/lib/supabase/server";
import UsersDataTable, { UserRecord } from "@/components/admin/UsersDataTable";

export default async function AdminUsersPage() {
  const supabase = await createClient();

  // Fetch profiles from Supabase DB
  const { data: profilesData, count } = await supabase
    .from("profiles")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false });

  // Fallback demo users if DB is empty for UI demonstration
  const users: UserRecord[] =
    profilesData && profilesData.length > 0
      ? profilesData
      : [
          {
            id: "1",
            full_name: "Super Admin UpdatePTN",
            email: "admin@updateptn.id",
            target_ptn: "Universitas Indonesia",
            role: "admin",
            created_at: new Date().toISOString(),
          },
          {
            id: "2",
            full_name: "Amanda Zevanya",
            email: "amanda.zevanya@gmail.com",
            target_ptn: "Universitas Indonesia (UI)",
            role: "student",
            created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
          },
          {
            id: "3",
            full_name: "Budi Pratama",
            email: "budi.pratama@yahoo.com",
            target_ptn: "Universitas Gadjah Mada (UGM)",
            role: "student",
            created_at: new Date(Date.now() - 86400000 * 5).toISOString(),
          },
          {
            id: "4",
            full_name: "Citra Kirana",
            email: "citra.kirana@outlook.com",
            target_ptn: "Institut Teknologi Bandung (ITB)",
            role: "student",
            created_at: new Date(Date.now() - 86400000 * 10).toISOString(),
          },
          {
            id: "5",
            full_name: "Dion Rahardjo",
            email: "dion.rahardjo@gmail.com",
            target_ptn: "Universitas Airlangga (UNAIR)",
            role: "student",
            created_at: new Date(Date.now() - 86400000 * 12).toISOString(),
          },
        ];

  return <UsersDataTable initialUsers={users} totalCount={count || users.length} />;
}
