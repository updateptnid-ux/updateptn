"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function loginAction(prevState: any, formData: FormData) {
  const email = (formData.get("email") as string)?.trim();
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { error: "Email dan kata sandi wajib diisi." };
  }

  try {
    const supabase = await createClient();

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      const msg = error.message.toLowerCase();
      if (msg.includes("invalid login credentials") || msg.includes("invalid credentials")) {
        return { error: "Email atau kata sandi tidak cocok." };
      } else if (msg.includes("email not confirmed")) {
        return { error: "Email belum dikonfirmasi." };
      }
      return { error: error.message };
    }

    if (!data.session) {
      return { error: "Gagal membuat sesi." };
    }

    // Tentukan redirect berdasarkan role user
    const ADMIN_EMAILS = ["updateptnid@gmail.com", "admin@updateptn.id"];

    let redirectUrl = "/dashboard/student"; // default: siswa

    if (ADMIN_EMAILS.includes(email.toLowerCase())) {
      // Admin → HQ Core
      redirectUrl = "/hq-core-updateptn";
    } else {
      // Cek apakah user ada di tabel mentors
      // Pakai service_role (bypass RLS) atau anon key langsung — bukan SSR cookie client
      try {
        const { createClient: createDirectClient } = await import("@supabase/supabase-js");
        const bypassClient = createDirectClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
          { auth: { persistSession: false } }
        );

        const { data: mentorRecord } = await bypassClient
          .from("mentors")
          .select("id, status")
          .eq("email", email.toLowerCase())
          .eq("status", "active")
          .maybeSingle();

        if (mentorRecord) {
          redirectUrl = "/mentor";
        }
      } catch {
        // Gagal query mentors — tetap ke student dashboard
      }
    }

    return { 
      success: true, 
      redirectUrl,
      message: "Login berhasil!" 
    };
  } catch (err: any) {
    return { error: "Terjadi kesalahan. Silakan coba lagi." };
  }
}

export async function registerAction(formData: FormData) {
  const fullName = formData.get("fullName") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const asalSekolah = formData.get("asalSekolah") as string;
  const targetUniv = formData.get("targetUniv") as string;
  const targetProdi = formData.get("targetProdi") as string;
  const targetPtn = (formData.get("targetPtn") as string) || targetUniv || "";

  if (!email || !password || !fullName) {
    return { error: "Nama lengkap, email, dan kata sandi wajib diisi." };
  }

  try {
    const supabase = await createClient();

    const signUpPromise = supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          asal_sekolah: asalSekolah || "",
          target_univ: targetUniv || "",
          target_prodi: targetProdi || "",
          target_ptn: targetPtn,
        },
      },
    });

    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error("Koneksi ke server timeout. Silakan periksa jaringan internet Anda.")), 8000)
    );

    const { error } = (await Promise.race([signUpPromise, timeoutPromise])) as any;

    if (error) {
      return { error: error.message };
    }
  } catch (err: any) {
    console.error("Register auth error:", err);
    return { error: err.message || "Terjadi kesalahan saat pendaftaran." };
  }

  redirect("/dashboard/student");
}

export async function signOutAction() {
  try {
    const supabase = await createClient();
    
    // Sign out dari Supabase auth
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      console.error("Sign out error:", error);
    }
    
    // Clear all cookies manually (important for mobile browsers)
    const { cookies } = await import("next/headers");
    const cookieStore = await cookies();
    
    // Delete Supabase auth cookies
    const allCookies = cookieStore.getAll();
    allCookies.forEach(cookie => {
      if (cookie.name.includes('sb-') || cookie.name.includes('supabase')) {
        cookieStore.delete(cookie.name);
      }
    });
  } catch (err) {
    console.error("Logout error:", err);
  }
  
  // Force redirect to login
  redirect("/login");
}
