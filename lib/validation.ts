/**
 * Input Validation Schemas with Zod
 * Prevent SQL injection, XSS, and invalid data
 */

import { z } from "zod";

// ========================================
// AUTH SCHEMAS
// ========================================

export const loginSchema = z.object({
  email: z
    .string()
    .email("Email tidak valid")
    .max(255, "Email terlalu panjang")
    .transform(val => val.toLowerCase().trim()),
  password: z
    .string()
    .min(8, "Password minimal 8 karakter")
    .max(72, "Password maksimal 72 karakter"), // bcrypt limit
});

export const registerSchema = z.object({
  email: z
    .string()
    .email("Email tidak valid")
    .max(255, "Email terlalu panjang")
    .transform(val => val.toLowerCase().trim()),
  password: z
    .string()
    .min(8, "Password minimal 8 karakter")
    .max(72, "Password maksimal 72 karakter")
    .regex(/[A-Z]/, "Password harus mengandung huruf besar")
    .regex(/[a-z]/, "Password harus mengandung huruf kecil")
    .regex(/[0-9]/, "Password harus mengandung angka"),
  fullName: z
    .string()
    .min(3, "Nama minimal 3 karakter")
    .max(100, "Nama maksimal 100 karakter")
    .trim(),
});

export const updatePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Password lama wajib diisi"),
  newPassword: z
    .string()
    .min(8, "Password baru minimal 8 karakter")
    .max(72, "Password maksimal 72 karakter")
    .regex(/[A-Z]/, "Password harus mengandung huruf besar")
    .regex(/[a-z]/, "Password harus mengandung huruf kecil")
    .regex(/[0-9]/, "Password harus mengandung angka"),
  confirmPassword: z.string().min(1, "Konfirmasi password wajib diisi"),
}).refine(data => data.newPassword === data.confirmPassword, {
  message: "Konfirmasi password tidak cocok",
  path: ["confirmPassword"],
});

// ========================================
// PROFILE SCHEMAS
// ========================================

export const updateProfileSchema = z.object({
  fullName: z
    .string()
    .min(3, "Nama minimal 3 karakter")
    .max(100, "Nama maksimal 100 karakter")
    .trim()
    .optional(),
  phone: z
    .string()
    .regex(/^(\+62|62|0)[0-9]{9,12}$/, "Nomor HP tidak valid")
    .optional()
    .or(z.literal("")),
  asalSekolah: z
    .string()
    .max(200, "Nama sekolah terlalu panjang")
    .trim()
    .optional(),
  targetUniv: z
    .string()
    .max(200, "Nama universitas terlalu panjang")
    .trim()
    .optional(),
  targetProdi: z
    .string()
    .max(200, "Nama prodi terlalu panjang")
    .trim()
    .optional(),
});

// ========================================
// TRYOUT SCHEMAS
// ========================================

export const tryoutIdSchema = z.object({
  tryoutId: z.string().uuid("Tryout ID tidak valid"),
});

export const resultIdSchema = z.object({
  resultId: z.string().uuid("Result ID tidak valid"),
});

export const submitAnswerSchema = z.object({
  resultId: z.string().uuid("Result ID tidak valid"),
  questionId: z.string().uuid("Question ID tidak valid"),
  answer: z.string().min(1, "Jawaban wajib diisi").max(1, "Jawaban harus 1 karakter (A/B/C/D/E)"),
});

// ========================================
// PREDICTION SCHEMAS
// ========================================

export const predictionSchema = z.object({
  prodiId: z.string().uuid("Prodi ID tidak valid"),
  pu: z.number().min(100, "Skor minimal 100").max(200, "Skor maksimal 200"),
  ppu: z.number().min(100).max(200),
  pbm: z.number().min(100).max(200),
  pk: z.number().min(100).max(200),
  literasi_indo: z.number().min(100).max(200),
  literasi_inggris: z.number().min(100).max(200),
  penalaran_matematika: z.number().min(100).max(200),
});

// ========================================
// MENTOR SCHEMAS
// ========================================

export const createMentorSchema = z.object({
  name: z.string().min(3).max(100).trim(),
  email: z.string().email().max(255).transform(val => val.toLowerCase().trim()),
  phone: z.string().regex(/^(\+62|62|0)[0-9]{9,12}$/, "Nomor HP tidak valid"),
  expertise: z.string().min(3).max(200).trim(),
  status: z.enum(["active", "inactive"]).default("active"),
  bio: z.string().max(1000).optional(),
});

export const updateMentorSchema = createMentorSchema.partial();

// ========================================
// ADMIN SCHEMAS
// ========================================

export const createLiveClassSchema = z.object({
  title: z.string().min(5).max(200).trim(),
  description: z.string().min(10).max(2000).trim(),
  mentorId: z.string().uuid("Mentor ID tidak valid"),
  scheduledDate: z.string().datetime("Format tanggal tidak valid"),
  meetingLink: z.string().url("Link meeting tidak valid"),
});

export const createModulSchema = z.object({
  title: z.string().min(5).max(200).trim(),
  description: z.string().min(10).max(2000).trim(),
  mentorId: z.string().uuid("Mentor ID tidak valid"),
  videoUrl: z.string().url("URL video tidak valid"),
  thumbnailUrl: z.string().url("URL thumbnail tidak valid").optional(),
  duration: z.number().min(1, "Durasi minimal 1 menit").optional(),
});

// ========================================
// UTILITY FUNCTIONS
// ========================================

/**
 * Validate and parse data with Zod schema
 * Returns { success: true, data } or { success: false, error }
 */
export function validateData<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; error: string } {
  try {
    const validated = schema.parse(data);
    return { success: true, data: validated };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const firstError = error.issues[0];
      return { 
        success: false, 
        error: firstError?.message || "Validasi gagal" 
      };
    }
    return { success: false, error: "Validasi gagal" };
  }
}

/**
 * Sanitize string untuk prevent XSS
 */
export function sanitizeString(str: string): string {
  return str
    .replace(/[<>]/g, "") // Remove < >
    .replace(/javascript:/gi, "") // Remove javascript:
    .replace(/on\w+=/gi, "") // Remove onclick=, onerror=, etc
    .trim();
}

/**
 * Validate UUID format
 */
export function isValidUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}
