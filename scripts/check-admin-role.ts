import { createClient } from "@supabase/supabase-js";

async function checkAdminRole() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

  if (!serviceRoleKey) {
    console.error("❌ SUPABASE_SERVICE_ROLE_KEY tidak ditemukan!");
    console.error("Tambahkan ke .env.local:");
    console.error("SUPABASE_SERVICE_ROLE_KEY=your_service_role_key");
    process.exit(1);
  }

  console.log("✅ Service role key ditemukan");
  console.log("🔍 Checking admin untuk: zonaarjun1@gmail.com\n");

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
  });

  try {
    // 1. Get user by email from auth.users
    const { data: authUsers } = await supabase.auth.admin.listUsers();
    const user = authUsers?.users.find(
      (u) => u.email?.toLowerCase() === "zonaarjun1@gmail.com"
    );

    if (!user) {
      console.error("❌ User zonaarjun1@gmail.com tidak ditemukan di auth.users");
      process.exit(1);
    }

    console.log("✅ User ditemukan di auth.users:");
    console.log("   - User ID:", user.id);
    console.log("   - Email:", user.email);
    console.log("   - Created:", user.created_at);

    // 2. Check profile in profiles table
    const { data: profile, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .maybeSingle();

    if (error) {
      console.error("\n❌ Error mengambil profile:", error.message);
      process.exit(1);
    }

    if (!profile) {
      console.error("\n❌ Profile tidak ditemukan di tabel profiles!");
      console.log("\n💡 Solusi: Buat profile manual dengan role admin:");
      console.log(`
INSERT INTO profiles (id, full_name, role, created_at, updated_at)
VALUES ('${user.id}', 'Admin', 'admin', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET role = 'admin', updated_at = NOW();
      `);
      process.exit(1);
    }

    console.log("\n✅ Profile ditemukan:");
    console.log("   - Full Name:", profile.full_name || "(kosong)");
    console.log("   - Role:", profile.role || "student (default)");
    console.log("   - Created:", profile.created_at);
    console.log("   - Updated:", profile.updated_at);

    if (profile.role === "admin") {
      console.log("\n✅✅✅ USER SUDAH ADMIN! ✅✅✅");
      console.log("Jika masih kepental, restart dev server:");
      console.log("1. Ctrl+C untuk stop server");
      console.log("2. npm run dev untuk start lagi");
    } else {
      console.log("\n❌ Role bukan admin:", profile.role || "student");
      console.log("\n💡 Solusi: Update role ke admin:");
      console.log(`
UPDATE profiles 
SET role = 'admin', updated_at = NOW() 
WHERE id = '${user.id}';
      `);
      console.log("\nAtau gunakan Supabase Dashboard:");
      console.log("1. Buka https://supabase.com/dashboard");
      console.log("2. Pilih project");
      console.log("3. Table Editor > profiles");
      console.log(`4. Cari row dengan id: ${user.id}`);
      console.log("5. Edit kolom 'role' jadi 'admin'");
    }
  } catch (err) {
    console.error("\n❌ Error:", err);
    process.exit(1);
  }
}

// Load env
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

checkAdminRole();
