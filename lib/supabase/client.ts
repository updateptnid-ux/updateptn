import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const supabaseKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    "";

  if (!supabaseUrl || !supabaseKey) {
    console.error("[Supabase Browser Client] Missing environment variables");
    throw new Error("Konfigurasi Supabase tidak lengkap. Hubungi administrator.");
  }

  return createBrowserClient(supabaseUrl, supabaseKey);
}
