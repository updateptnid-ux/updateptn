/**
 * Subscription helpers — pure functions, no "use server"
 * Aman diimport dari client maupun server
 */

// Tier-tier yang dianggap GRATIS (bukan premium)
export const FREE_TIERS = ["Trial / Gratis", "Basic", "trial", "basic"];

/**
 * Hitung expires_at dari string durasi plan
 * Contoh: "7 hari", "1 bulan", "3 bulan", "1 hari"
 */
export function calculateExpiresAt(duration: string): Date {
  const now = new Date();
  const d = duration.toLowerCase().trim();

  if (d.includes("3 bulan")) {
    const date = new Date(now);
    date.setMonth(date.getMonth() + 3);
    return date;
  }
  if (d.includes("1 bulan") || (d.includes("bulan") && !d.includes("3"))) {
    const date = new Date(now);
    date.setMonth(date.getMonth() + 1);
    return date;
  }
  if (d.includes("7 hari")) {
    const date = new Date(now);
    date.setDate(date.getDate() + 7);
    return date;
  }
  if (d.includes("1 hari") || (d.includes("hari") && !d.includes("7"))) {
    const date = new Date(now);
    date.setDate(date.getDate() + 1);
    return date;
  }
  // Try Out / Bimbel / Cek Peluang → default 180 hari (akses panjang)
  if (d.includes("try out") || d.includes("x to") || d.includes("bimbel") || d.includes("cek")) {
    const date = new Date(now);
    date.setDate(date.getDate() + 180);
    return date;
  }
  // Default fallback: 30 hari
  const date = new Date(now);
  date.setDate(date.getDate() + 30);
  return date;
}

/**
 * Mapping plan ID → nama tier yang disimpan ke DB
 */
export function resolveTierName(planId: string, planName: string): string {
  if (planId.startsWith("vip")) return "VIP";
  if (planId.startsWith("premium-snbt")) return "Premium SNBT";
  if (planId.startsWith("premium-snbp")) return "Premium SNBP";
  if (planId.startsWith("premium-mandiri")) return "Premium Mandiri";
  if (planId.startsWith("bimbel-hemat")) return "Bimbel 2027 (Paket Hemat)";
  if (planId.startsWith("bimbel-eksklusif")) return "Bimbel 2027 (Paket Eksklusif)";
  if (planId.startsWith("bimbel-intensif")) return "Bimbel 2027 (Premium Intensif)";
  if (planId.startsWith("bimbel-mandiri")) return "Bimbel 2027 (Bimbel Mandiri)";
  if (planId.startsWith("to-1x")) return "Try Out (1x Paket Satuan)";
  if (planId.startsWith("to-4x")) return "Try Out (4x Paket Hemat)";
  if (planId.startsWith("to-8x")) return "Try Out (8x Paket Ambiss)";
  if (planId.startsWith("to-10x")) return "Try Out (10x Paket Super)";
  if (planId.startsWith("cek-peluang-3x")) return "Cek Peluang PTN (3x Cek)";
  if (planId.startsWith("cek-peluang-5x")) return "Cek Peluang PTN (5x Cek)";
  if (planId.startsWith("cek-peluang-10x")) return "Cek Peluang PTN (10x Cek)";
  if (planId === "trial") return "Trial / Gratis";
  return planName;
}
