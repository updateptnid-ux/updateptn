import { createClient } from '@supabase/supabase-js';

/**
 * Cookie-free Supabase client untuk kebutuhan publik (sitemap, SSG, dll.)
 * Tidak menggunakan cookies sama sekali sehingga aman dipakai di halaman statis.
 */
export function createPublicClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    '';

  return createClient(supabaseUrl, supabaseKey, {
    auth: { persistSession: false },
  });
}
