# 🚀 Setup Midtrans - Langkah Selanjutnya

## Status Saat Ini
✅ Kode integrasi Midtrans sudah lengkap
✅ Webhook handler sudah ready
✅ Server actions sudah ready
✅ Migration files sudah safe & idempotent
⚠️ **Database migration belum dijalankan**
⚠️ **Environment variables belum disetup**

---

## 📝 Yang Harus Dilakukan

### 1. CEK DATABASE STRUCTURE (WAJIB DULU!)

**Kenapa penting?**
- Database kamu sudah punya tabel `payments` tapi strukturnya belum diketahui
- Perlu tahu kolom apa yang sudah ada sebelum add yang baru
- Avoid conflict atau duplicate columns

**Cara:**
1. Buka Supabase Dashboard → SQL Editor
2. Copy paste isi file: `supabase/CHECK_ALL_TABLES_FULL.sql`
3. Klik "Run"
4. **Screenshot atau save semua output**
5. Cek hasil:
   - Tabel apa saja yang ada?
   - Kolom apa saja di tabel `payments`?
   - Ada tabel `profiles`, `subscriptions`, `subscription_plans`?
   - Berapa row di masing-masing tabel?

---

### 2. JALANKAN SAFE MIGRATION

**File:** `supabase/SAFE_MIDTRANS_MIGRATION.sql`

**Apa yang dilakukan file ini?**
- ✓ Cek apakah tabel sudah ada sebelum CREATE
- ✓ Cek apakah kolom sudah ada sebelum ADD COLUMN
- ✓ Skip kalau sudah ada (tidak error)
- ✓ Add missing columns ke tabel `payments` existing
- ✓ Create tabel baru kalau belum ada
- ✓ Setup RLS policies
- ✓ Insert 3 default subscription plans

**Cara:**
1. Buka Supabase Dashboard → SQL Editor
2. Copy paste isi file: `supabase/SAFE_MIDTRANS_MIGRATION.sql`
3. Klik "Run"
4. **Perhatikan NOTICE messages** - akan kasih tau apa yang di-create/skip
5. Kalau ada error, screenshot dan share

**Expected Output:**
```
NOTICE: Table subscription_plans already exists, skipping creation
NOTICE: Table subscriptions already exists, skipping creation
NOTICE: Table payments already exists, will add missing columns if any
NOTICE: Added column: payments.user_id
NOTICE: Added column: payments.order_id
... (dst)
NOTICE: Inserted 3 default subscription plans
```

---

### 3. VERIFY MIGRATION SUCCESS

Jalankan lagi: `supabase/CHECK_ALL_TABLES_FULL.sql`

**Pastikan:**
- ✓ Tabel `subscription_plans` ada (3 rows)
- ✓ Tabel `subscriptions` ada
- ✓ Tabel `payments` punya kolom:
  - `user_id`
  - `subscription_id`
  - `order_id`
  - `amount`
  - `status`
  - `payment_method`
  - `payment_type`
  - `transaction_status`
  - `fraud_status`
  - `metadata`
  - `created_at`
  - `updated_at`

---

### 4. SETUP ENVIRONMENT VARIABLES

**File:** `.env.local`

Tambahkan:
```bash
# Midtrans Configuration
MIDTRANS_SERVER_KEY=SB-Mid-server-xxxxxxxxxxxxx
NEXT_PUBLIC_MIDTRANS_CLIENT_KEY=SB-Mid-client-xxxxxxxxxxxxx
MIDTRANS_IS_PRODUCTION=false

# Site URL (untuk webhook callback)
NEXT_PUBLIC_SITE_URL=https://updateptn.vercel.app
```

**Cara dapet API Keys:**
1. Login ke [Midtrans Dashboard](https://dashboard.midtrans.com/)
2. **Settings** → **Access Keys**
3. Copy **Server Key** dan **Client Key**
4. Untuk testing, gunakan **Sandbox Keys**

**⚠️ JANGAN COMMIT `.env.local` KE GIT!**

---

### 5. SETUP DI VERCEL (PRODUCTION)

1. Buka Vercel Dashboard
2. Pilih project `updateptn-platform`
3. **Settings** → **Environment Variables**
4. Add semua variable di atas
5. Redeploy

---

### 6. SETUP WEBHOOK DI MIDTRANS

**Kenapa penting?**
Webhook akan notify aplikasi kamu kalau payment status berubah (success, pending, failed)

**Cara:**
1. Login ke [Midtrans Dashboard](https://dashboard.midtrans.com/)
2. **Settings** → **Configuration**
3. **Payment Notification URL:**
   ```
   https://updateptn.vercel.app/api/midtrans/webhook
   ```
4. **HTTP Notification:**
   - Method: `POST`
   - Format: `JSON`
5. Save

---

### 7. TEST PAYMENT FLOW (SANDBOX)

**Sandbox Test Cards:**

**Credit Card:**
- Number: `4811 1111 1111 1114`
- CVV: `123`
- Exp: `12/25` (atau future date)
- 3DS OTP: `112233`

**Cara Test:**
1. Run dev server: `npm run dev`
2. Login sebagai user
3. Buka halaman `/pricing` atau `/dashboard/student/beli-paket`
4. Klik "Bayar Sekarang" pada salah satu paket
5. Akan muncul modal Snap dari Midtrans
6. Pilih "Credit Card"
7. Masukkan test card number di atas
8. Complete payment
9. Check:
   - Database `payments` table (ada row baru?)
   - Database `subscriptions` table (ada row baru?)
   - Vercel Functions logs (webhook masuk?)

---

## 🔍 Troubleshooting

### Error: "relation subscription_plans does not exist"
→ Migration belum dijalankan. Jalankan `SAFE_MIDTRANS_MIGRATION.sql`

### Error: "column user_id does not exist"
→ Migration belum complete. Cek output NOTICE messages

### Snap modal tidak muncul
→ Check:
- Client Key benar?
- Script Snap loaded? (check browser console)
- Environment variables sudah di Vercel?

### Webhook tidak masuk
→ Check:
- Webhook URL sudah terdaftar di Midtrans Dashboard?
- URL accessible? (test dengan cURL atau Postman)
- Vercel Functions logs ada error?

### Payment success tapi status tidak update
→ Check:
- Webhook endpoint returning 200?
- Database RLS policies allow update?
- Signature validation passed?

---

## 📚 File Reference

**Migration Files:**
- `supabase/CHECK_ALL_TABLES_FULL.sql` - Cek struktur database lengkap
- `supabase/SAFE_MIDTRANS_MIGRATION.sql` - Safe migration (idempotent)

**Code Files:**
- `lib/midtrans.ts` - Core Midtrans integration
- `actions/payment-midtrans.ts` - Server actions
- `app/api/midtrans/webhook/route.ts` - Webhook handler

**Documentation:**
- `docs/MIDTRANS_SETUP.md` - Setup guide lengkap

---

## ✅ Checklist

Sebelum go live, pastikan:
- [ ] Database migration berhasil
- [ ] Environment variables di `.env.local`
- [ ] Environment variables di Vercel
- [ ] Webhook URL terdaftar di Midtrans
- [ ] Test payment dengan Sandbox cards
- [ ] Webhook masuk dan status update
- [ ] User bisa lihat subscription aktif

---

## 🚀 Next After Setup

1. Build payment UI di `/pricing` page
2. Add payment history di user dashboard
3. Add voucher/discount feature
4. Monitor first transactions closely
5. Setup alerts untuk failed payments

---

**Kalau ada error atau butuh bantuan, kasih tau:**
1. Error message lengkap
2. Screenshot
3. Output dari `CHECK_ALL_TABLES_FULL.sql`
