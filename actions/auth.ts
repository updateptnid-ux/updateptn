"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function loginAction(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { error: "Email dan kata sandi wajib diisi." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: error.message };
  }

<<<<<<< HEAD
=======
  // Auto redirect admin ke dashboard admin
  const ADMIN_EMAILS = ["updateptnid@gmail.com"];
  if (ADMIN_EMAILS.includes(email.toLowerCase())) {
    redirect("/hq-core-updateptn");
  }

  // User biasa ke dashboard student
>>>>>>> 856ccaee71bcd89c4d1542980f34c3986cd70e3e
  redirect("/dashboard/student");
}

export async function registerAction(formData: FormData) {
  const fullName = formData.get("fullName") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
<<<<<<< HEAD
  const targetPtn = formData.get("targetPtn") as string;
=======
  const asalSekolah = formData.get("asalSekolah") as string;
  const targetUniv = formData.get("targetUniv") as string;
  const targetProdi = formData.get("targetProdi") as string;
>>>>>>> 856ccaee71bcd89c4d1542980f34c3986cd70e3e

  if (!email || !password || !fullName) {
    return { error: "Nama lengkap, email, dan kata sandi wajib diisi." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
<<<<<<< HEAD
        target_ptn: targetPtn || "",
=======
        asal_sekolah: asalSekolah || "",
        target_univ: targetUniv || "",
        target_prodi: targetProdi || "",
        // legacy field kept for backward compat
        target_ptn: targetUniv || "",
>>>>>>> 856ccaee71bcd89c4d1542980f34c3986cd70e3e
      },
    },
  });

  if (error) {
    return { error: error.message };
  }

  redirect("/dashboard/student");
}

export async function signOutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
