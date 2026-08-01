# 🗄️ Database Setup - UpdatePTN Platform

## Setup Database di Supabase

### 1. Buka Supabase Dashboard
1. Login ke https://supabase.com
2. Pilih project UpdatePTN
3. Klik "SQL Editor" di sidebar kiri

### 2. Run Database Schema
1. Copy semua code dari file `supabase/database_schema.sql`
2. Paste di SQL Editor
3. Klik "Run" atau tekan `Ctrl + Enter`
4. Tunggu sampai selesai (✅ Success)

### 3. Verify Tables
Run query ini untuk cek semua table sudah dibuat:

```sql
SELECT tablename 
FROM pg_tables 
WHERE schemaname = 'public' 
ORDER BY tablename;
```

Expected output:
- ✅ `live_classes`
- ✅ `moduls`
- ✅ `prodi_reference`
- ✅ `questions`
- ✅ `results`
- ✅ `tryouts`
- ✅ `user_answers`
- ✅ `user_roles`

---

## Tables Overview

### 1. `tryouts` - Paket Try Out
**Columns:**
- `id` (UUID) - Primary key
- `title` (TEXT) - Judul try out
- `description` (TEXT) - Deskripsi
- `duration_minutes` (INT) - Durasi (menit)
- `total_questions` (INT) - Total soal
- `scheduled_date` (DATE) - Tanggal pelaksanaan
- `is_free` (BOOLEAN) - Gratis/Premium
- `is_active` (BOOLEAN) - Aktif/Draft
- `participants_count` (INT) - Jumlah peserta

**Used by:**
- Admin: `/hq-core-updateptn/tryouts` (CRUD)
- Student: `/dashboard/student` (list) & `/tryout` (public)

---

### 2. `questions` - Bank Soal
**Columns:**
- `id` (UUID) - Primary key
- `tryout_id` (UUID) - Foreign key ke tryouts
- `text` (TEXT) - Teks soal
- `option_a` to `option_e` (TEXT) - Pilihan jawaban
- `correct_answer` (TEXT) - Kunci jawaban (A/B/C/D/E)
- `explanation` (TEXT) - Pembahasan
- `subject` (TEXT) - Mata pelajaran
- `difficulty` (TEXT) - Tingkat kesulitan
- `irt_discrimination` (DECIMAL) - Parameter IRT (a)
- `irt_difficulty` (DECIMAL) - Parameter IRT (b)

**Used by:**
- Admin: `/hq-core-updateptn/questions` (CRUD)
- Student: `/tryout/[id]` (exam interface)

**Status:** ✅ Table exists, admin page ready

---

### 3. `moduls` - Modul Belajar (Video + PDF)
**Columns:**
- `id` (UUID) - Primary key
- `type` (TEXT) - 'video' atau 'pdf'
- `category` (TEXT) - Kategori subtes
- `title` (TEXT) - Judul modul
- `thumbnail_url` (TEXT) - Link thumbnail
- `content_url` (TEXT) - Link konten (YouTube/PDF)
- `duration` (TEXT) - Durasi video (e.g., "12:45")
- `pages` (INT) - Jumlah halaman PDF
- `views` (INT) - Jumlah views
- `downloads` (INT) - Jumlah downloads
- `rating` (DECIMAL) - Rating (0-5)
- `is_premium` (BOOLEAN) - Premium/Gratis
- `is_active` (BOOLEAN) - Aktif/Hidden

**Used by:**
- Admin: `/hq-core-updateptn/moduls` (CRUD)
- Student: `/dashboard/student/modul` (list & view)

---

### 4. `live_classes` - Live Class & Rekaman
**Columns:**
- `id` (UUID) - Primary key
- `title` (TEXT) - Judul live class
- `tutor_name` (TEXT) - Nama tutor
- `tutor_avatar_url` (TEXT) - Avatar tutor
- `category` (TEXT) - Kategori
- `scheduled_at` (DATE) - Tanggal
- `time` (TEXT) - Waktu (e.g., "14:00-16:00 WIB")
- `meeting_url` (TEXT) - Link Zoom/Meet
- `replay_url` (TEXT) - Link rekaman (YouTube)
- `material_url` (TEXT) - Link modul PDF
- `status` (TEXT) - 'upcoming', 'ongoing', 'completed'
- `is_premium` (BOOLEAN) - Premium/Gratis
- `is_active` (BOOLEAN) - Aktif/Hidden
- `participants_count` (INT) - Jumlah peserta

**Used by:**
- Admin: `/hq-core-updateptn/live-classes` (CRUD)
- Student: `/dashboard/student/live-class` (tabs: upcoming & replay)

---

### 5. `results` - Hasil Try Out
**Columns:**
- `id` (UUID) - Primary key
- `user_id` (UUID) - Foreign key ke auth.users
- `tryout_id` (UUID) - Foreign key ke tryouts
- `score` (DECIMAL) - Skor total
- `score_tps` (DECIMAL) - Skor TPS
- `score_literasi` (DECIMAL) - Skor Literasi
- `irt_score` (DECIMAL) - Skor IRT
- `total_correct` (INT) - Jumlah benar
- `total_wrong` (INT) - Jumlah salah
- `total_unanswered` (INT) - Tidak dijawab
- `completed_at` (TIMESTAMP) - Waktu selesai

**Used by:**
- Student: `/tryout/result/[id]` (result page)
- Student: `/dashboard/student` (recent results)

---

### 6. `user_answers` - Jawaban Per Soal
**Columns:**
- `id` (UUID) - Primary key
- `user_id` (UUID) - Foreign key ke auth.users
- `tryout_id` (UUID) - Foreign key ke tryouts
- `question_id` (UUID) - Foreign key ke questions
- `answer` (TEXT) - Jawaban user (A/B/C/D/E)
- `is_correct` (BOOLEAN) - Benar/salah
- `time_spent_seconds` (INT) - Waktu mengerjakan

**Used by:**
- Student: `/tryout/[id]` (save answers)
- Student: `/tryout/result/[id]/pembahasan` (review)

---

### 7. `prodi_reference` - Data PTN & Prodi
**Columns:**
- `id` (UUID) - Primary key
- `univ` (TEXT) - Nama universitas
- `prodi` (TEXT) - Nama prodi
- `jenjang` (TEXT) - S1/D4/D3
- `kelompok` (TEXT) - Saintek/Soshum
- `passing_grade_est` (DECIMAL) - Estimasi passing grade
- `keketatan` (DECIMAL) - Tingkat keketatan (%)
- `daya_tampung` (INT) - Kuota
- `peminat` (INT) - Jumlah peminat
- `ukt_min` (INT) - UKT minimal
- `ukt_max` (INT) - UKT maksimal

**Used by:**
- Student: `/direktori-prodi` (search & filter)
- Student: `/dashboard/student/cek-peluang` (select prodi)

---

## Row Level Security (RLS)

### Public Access (No Auth Required)
✅ `tryouts` (read active only)
✅ `questions` (read all)
✅ `moduls` (read active only)
✅ `live_classes` (read active only)
✅ `prodi_reference` (read all)

### User Access (Auth Required)
✅ `results` - User hanya bisa lihat & insert data sendiri
✅ `user_answers` - User hanya bisa lihat & insert data sendiri

### Admin Access (Service Role)
✅ Semua table - Full CRUD via service_role

---

## Functions Available

### 1. `search_kampus_pintar(keyword TEXT)`
Search prodi by universitas atau nama prodi.

**Usage:**
```sql
SELECT * FROM search_kampus_pintar('informatika');
```

**Used by:** `/direktori-prodi` page

### 2. `calculate_irt_score(user_id UUID, tryout_id UUID)`
Calculate IRT score for user's try out result.

**Usage:**
```sql
SELECT calculate_irt_score(
  'user-uuid-here',
  'tryout-uuid-here'
);
```

**Used by:** `actions/tryout.ts` (after submit)

---

## Testing Database

### 1. Test Insert Try Out
```sql
INSERT INTO tryouts (title, description, duration_minutes, total_questions, scheduled_date, is_free, is_active)
VALUES ('Test Try Out', 'Test description', 120, 100, '2026-08-10', true, true);

-- Verify
SELECT * FROM tryouts ORDER BY created_at DESC LIMIT 1;
```

### 2. Test Insert Question
```sql
-- Get tryout_id first
SELECT id FROM tryouts LIMIT 1;

-- Insert question
INSERT INTO questions (tryout_id, text, option_a, option_b, option_c, option_d, option_e, correct_answer)
VALUES (
  'YOUR-TRYOUT-ID-HERE',
  'Test question?',
  'Option A',
  'Option B',
  'Option C',
  'Option D',
  'Option E',
  'A'
);

-- Verify
SELECT * FROM questions ORDER BY created_at DESC LIMIT 1;
```

### 3. Test Insert Modul
```sql
INSERT INTO moduls (type, category, title, content_url, is_premium, is_active)
VALUES ('video', 'PENALARAN UMUM', 'Test Video', 'https://youtube.com/watch?v=test', false, true);

-- Verify
SELECT * FROM moduls ORDER BY created_at DESC LIMIT 1;
```

### 4. Test Insert Live Class
```sql
INSERT INTO live_classes (title, tutor_name, category, scheduled_at, time, meeting_url, status, is_active)
VALUES (
  'Test Live Class',
  'Kak Test (Alumni UI)',
  'PENALARAN UMUM',
  '2026-08-15',
  '14:00-16:00 WIB',
  'https://zoom.us/j/test',
  'upcoming',
  true
);

-- Verify
SELECT * FROM live_classes ORDER BY created_at DESC LIMIT 1;
```

---

## Troubleshooting

### Problem: "relation does not exist"
**Solution:**
- Run `supabase/database_schema.sql` di SQL Editor
- Atau run individual CREATE TABLE commands

### Problem: "permission denied for table"
**Solution:**
- Check RLS policies
- Pastikan user sudah login (untuk user_answers & results)
- Admin pakai service_role key

### Problem: Questions page demo mode
**Solution:**
1. Buka Supabase SQL Editor
2. Run:
   ```sql
   CREATE TABLE IF NOT EXISTS questions (...);
   ```
3. Refresh admin page `/hq-core-updateptn/questions`
4. Demo mode warning hilang

---

## Next Steps

1. ✅ Run `database_schema.sql` di Supabase
2. ✅ Run `admin_setup.sql` untuk setup admin role
3. ✅ Test insert data via admin dashboard
4. ✅ Verify data muncul di student dashboard

**Database siap digunakan!** 🚀
