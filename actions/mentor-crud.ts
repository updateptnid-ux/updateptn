"use server";

import { createClient } from "@supabase/supabase-js";
import { requireAdmin } from "@/lib/auth-helpers";

/**
 * Server-side Supabase client pakai service_role key — bypass RLS sepenuhnya.
 * HANYA digunakan untuk operasi yang sudah divalidasi di server.
 * 
 * ⚠️ SECURITY: Semua fungsi di file ini HARUS memanggil requireAdmin() terlebih dahulu
 */
function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );
}

// ──────────────────────────────────────────────
// LIVE CLASSES
// ──────────────────────────────────────────────

export async function ensureLiveClassColumns() {
  // Check admin access
  try {
    await requireAdmin();
  } catch (error) {
    return { ok: false, message: "Unauthorized: Admin access required" };
  }

  const supabase = getServiceClient();
  // Add columns that might be missing
  const columns = [
    { name: "category", type: "text", default: "'PENALARAN UMUM'" },
    { name: "tutor_avatar_url", type: "text", default: "''" },
    { name: "replay_url", type: "text", default: "''" },
    { name: "material_url", type: "text", default: "''" },
    { name: "is_active", type: "boolean", default: "true" },
  ];
  for (const col of columns) {
    try {
      await supabase.rpc("exec_sql", {
        query: `ALTER TABLE public.live_classes ADD COLUMN IF NOT EXISTS ${col.name} ${col.type} DEFAULT ${col.default}`,
      });
    } catch (error) {
      // Ignore if rpc doesn't exist
      console.error("Error adding column:", error);
    }
  }
  return { ok: true };
}

export async function insertLiveClass(data: Record<string, unknown>) {
  // Check admin access
  try {
    await requireAdmin();
  } catch (error) {
    return { ok: false, message: "Unauthorized: Admin access required" };
  }

  const supabase = getServiceClient();

  // Map form fields to actual DB column names
  const mapped = { ...data };
  if ("tutor_name" in mapped) {
    mapped.mentor_name = mapped.tutor_name;
    delete mapped.tutor_name;
  }
  // Remove fields that might not exist in the table
  delete mapped.tutor_avatar_url;

  let { error } = await supabase.from("live_classes").insert([mapped]);

  // If column not found, try with only the most basic columns
  if (error && error.message?.includes("schema cache")) {
    const basicCols = ["title", "mentor_name", "scheduled_at", "meeting_url", "status"];
    const safeData: Record<string, unknown> = {};
    for (const key of basicCols) {
      if (key in mapped) safeData[key] = mapped[key];
    }
    const retry = await supabase.from("live_classes").insert([safeData]);
    error = retry.error;
  }

  if (error) {
    console.error("insertLiveClass error:", error.code, error.message, error.details);
    return { ok: false, message: error.message || error.details || "Gagal menyimpan live class" };
  }
  return { ok: true };
}

export async function updateLiveClass(id: string, data: Record<string, unknown>) {
  // Check admin access
  try {
    await requireAdmin();
  } catch (error) {
    return { ok: false, message: "Unauthorized: Admin access required" };
  }

  const supabase = getServiceClient();

  const mapped = { ...data };
  if ("tutor_name" in mapped) {
    mapped.mentor_name = mapped.tutor_name;
    delete mapped.tutor_name;
  }
  delete mapped.tutor_avatar_url;

  const { error } = await supabase.from("live_classes").update(mapped).eq("id", id);
  if (error) {
    console.error("updateLiveClass error:", error.code, error.message, error.details);
    return { ok: false, message: error.message || error.details || "Gagal update live class" };
  }
  return { ok: true };
}

export async function deleteLiveClass(id: string) {
  // Check admin access
  try {
    await requireAdmin();
  } catch (error) {
    return { ok: false, message: "Unauthorized: Admin access required" };
  }

  const supabase = getServiceClient();
  const { error } = await supabase.from("live_classes").delete().eq("id", id);
  if (error) {
    console.error("deleteLiveClass error:", error.code, error.message, error.details);
    return { ok: false, message: error.message || error.details || "Gagal hapus live class" };
  }
  return { ok: true };
}

// ──────────────────────────────────────────────
// VIDEOS
// ──────────────────────────────────────────────

export async function insertVideo(data: Record<string, unknown>) {
  // Check admin access
  try {
    await requireAdmin();
  } catch (error) {
    return { ok: false, message: "Unauthorized: Admin access required" };
  }

  const supabase = getServiceClient();
  const { error } = await supabase.from("videos").insert([data]);
  if (error) {
    console.error("insertVideo error:", error.code, error.message, error.details);
    return { ok: false, message: error.message || error.details || "Gagal menyimpan video" };
  }
  return { ok: true };
}

export async function updateVideo(id: string, data: Record<string, unknown>) {
  // Check admin access
  try {
    await requireAdmin();
  } catch (error) {
    return { ok: false, message: "Unauthorized: Admin access required" };
  }

  const supabase = getServiceClient();
  const { error } = await supabase.from("videos").update(data).eq("id", id);
  if (error) {
    console.error("updateVideo error:", error.code, error.message, error.details);
    return { ok: false, message: error.message || error.details || "Gagal update video" };
  }
  return { ok: true };
}

export async function deleteVideo(id: string) {
  // Check admin access
  try {
    await requireAdmin();
  } catch (error) {
    return { ok: false, message: "Unauthorized: Admin access required" };
  }

  const supabase = getServiceClient();
  const { error } = await supabase.from("videos").delete().eq("id", id);
  if (error) {
    console.error("deleteVideo error:", error.code, error.message, error.details);
    return { ok: false, message: error.message || error.details || "Gagal hapus video" };
  }
  return { ok: true };
}

// ──────────────────────────────────────────────
// MODULS
// ──────────────────────────────────────────────

export async function insertModul(data: Record<string, unknown>) {
  // Check admin access
  try {
    await requireAdmin();
  } catch (error) {
    return { ok: false, message: "Unauthorized: Admin access required" };
  }

  const supabase = getServiceClient();
  const { error } = await supabase.from("moduls").insert([data]);
  if (error) {
    console.error("insertModul error:", error.code, error.message, error.details);
    return { ok: false, message: error.message || error.details || "Gagal menyimpan modul" };
  }
  return { ok: true };
}

export async function updateModul(id: string, data: Record<string, unknown>) {
  // Check admin access
  try {
    await requireAdmin();
  } catch (error) {
    return { ok: false, message: "Unauthorized: Admin access required" };
  }

  const supabase = getServiceClient();
  const { error } = await supabase.from("moduls").update(data).eq("id", id);
  if (error) {
    console.error("updateModul error:", error.code, error.message, error.details);
    return { ok: false, message: error.message || error.details || "Gagal update modul" };
  }
  return { ok: true };
}

export async function deleteModul(id: string) {
  // Check admin access
  try {
    await requireAdmin();
  } catch (error) {
    return { ok: false, message: "Unauthorized: Admin access required" };
  }

  const supabase = getServiceClient();
  const { error } = await supabase.from("moduls").delete().eq("id", id);
  if (error) {
    console.error("deleteModul error:", error.code, error.message, error.details);
    return { ok: false, message: error.message || error.details || "Gagal hapus modul" };
  }
  return { ok: true };
}

// ──────────────────────────────────────────────
// PROFILES (mentor upsert)
// ──────────────────────────────────────────────

export async function upsertProfile(id: string, data: Record<string, unknown>) {
  const supabase = getServiceClient();
  const { error } = await supabase.from("profiles").upsert({ id, ...data });
  if (error) {
    console.error("upsertProfile error:", error.code, error.message, error.details);
    return { ok: false, message: error.message || error.details || "Gagal update profil" };
  }
  return { ok: true };
}
