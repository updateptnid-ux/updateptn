# 📋 UpdatePTN Platform - Task List & Development Plan

## 🎯 Project Overview
**UpdatePTN** adalah platform pembelajaran terpadu untuk persiapan UTBK & SNBT dengan fitur:
- Try Out berbasis IRT (Item Response Theory)
- Cek Peluang PTN (rasionalisasi nilai terhadap 4.900+ prodi)
- Live Class & Replay dengan Master Tutor
- Bank Soal terstruktur dengan pembahasan

---

## 🏗️ Architecture Stack
- **Framework**: Next.js 16 (App Router)
- **UI Library**: Shadcn/UI + Tailwind CSS 4
- **Animation**: Framer Motion
- **Backend**: Supabase (Auth + Database)
- **Language**: TypeScript

---

## ✅ Current Status (Completed Features)

### 1. Landing Page ✅
- [x] Hero Section dengan CTA
- [x] Trust Metrics (50.000+ siswa, 100+ PTN, dll)
- [x] Stats Impact Bar (4 metrics cards)
- [x] Company Profile & Mission
- [x] Features Grid (4 fitur utama)
- [x] How It Works (4-step flow)
- [x] Badge universitas (UI, ITB, UGM, ITS, UNPAD, dll) ⚠️ **Bisa pakai logo.png untuk enhancement**

### 2. Authentication
- [x] Login page
- [x] Register page
- [x] Auth actions (actions/auth.ts)

### 3. Dashboard Structure
- [x] Dashboard layout
- [x] Student dashboard page
- [x] Cek Peluang page (student)
- [x] Live Class page (student)

### 4. Core Features (Partial)
- [x] Profile page + actions
- [x] Tryout routing structure
- [x] Tryout result page
- [x] Direktori Prodi page
- [x] Leaderboard page
- [x] HQ Core (Admin) - Users management

### 5. UI Components ✅
- [x] Shadcn/UI components (accordion, avatar, badge, button, card, dialog, dropdown, input, label, navigation-menu, progress, radio-group, select, sheet, table, tabs)
- [x] Custom fade-in animation components

---

## 🚧 Pending Tasks & Development Plan

### **FASE 1: Enhancement UI & Logo Integration** 🎨

#### Task 1.1: Logo Universitas Integration
- [ ] **Ganti badge text universitas** di Hero Section dengan logo universitas
  - File target: `app/page.tsx` (line ~216)
  - Asset tersedia: `public/logo.png` atau buat folder `public/universities/`
  - Implementasi: Gunakan Next.js `<Image>` component dengan width/height optimal
  - Design: Grid 4 kolom di mobile, 8 kolom di desktop dengan logo grayscale + hover color effect

#### Task 1.2: Enhanced Brand Identity
- [ ] Tambahkan logo universitas di section lain yang relevan:
  - Stats section (keberhasilan alumni masuk PTN X)
  - Testimonial section (jika ada)
  - Footer (partner universitas)

#### Task 1.3: Responsive Logo Display
- [ ] Optimasi ukuran logo untuk berbagai device
- [ ] Lazy loading untuk performa optimal
- [ ] Alt text untuk accessibility

---

### **FASE 2: Landing Page Completion** 📄

#### Task 2.1: Pricing/Paket Section
- [ ] Implementasi section "Paket Belajar" (id="paket")
- [ ] 3 tier pricing: Basic (Gratis), Premium, Platinum
- [ ] Highlight fitur per paket
- [ ] CTA button per tier

#### Task 2.2: FAQ Section
- [ ] Implementasi accordion FAQ (id="faq")
- [ ] Min. 8-10 pertanyaan umum seputar:
  - Cara daftar
  - Sistem IRT
  - Cek Peluang PTN
  - Akses Live Class
  - Pembayaran
  - Garansi

#### Task 2.3: Testimonial Section
- [ ] Card testimonial siswa yang lolos PTN
- [ ] Include: foto, nama, universitas, tahun lolos
- [ ] Slider carousel untuk mobile

#### Task 2.4: Footer
- [ ] Logo + tagline
- [ ] Quick Links (Tentang, Fitur, Harga, Kontak)
- [ ] Social Media icons
- [ ] Copyright & Legal (Privacy Policy, Terms of Service)

---

### **FASE 3: Try Out System Implementation** 🎯

#### Task 3.1: Try Out List Page
- [ ] Buat page: `app/tryout/page.tsx`
- [ ] Fetch list try out dari database (actions/tryout.ts)
- [ ] Card design per try out: judul, durasi, jumlah soal, status (belum/sudah dikerjakan)
- [ ] Filter: Semua, Belum Dikerjakan, Sudah Selesai
- [ ] CTA "Mulai Try Out"

#### Task 3.2: Try Out Exam Interface
- [ ] Enhance `app/tryout/[id]/page.tsx`
- [ ] Timer countdown real-time (per subtes)
- [ ] Navigation soal (grid 1-40/soal)
- [ ] Marking system (ragu-ragu)
- [ ] Auto-save jawaban ke database
- [ ] Modal konfirmasi submit

#### Task 3.3: Try Out Result Enhancement
- [ ] Enhance `app/tryout/result/[id]/page.tsx`
- [ ] Chart visualisasi skor per subtes (TPS, Literasi)
- [ ] Breakdown: benar, salah, tidak dijawab
- [ ] Perbandingan dengan rata-rata platform
- [ ] IRT Score calculation & display
- [ ] Download result PDF

#### Task 3.4: Pembahasan Soal
- [ ] Page pembahasan per soal
- [ ] Tampilkan: soal, jawaban user, jawaban benar, pembahasan lengkap
- [ ] Video pembahasan (jika ada)

---

### **FASE 4: Cek Peluang PTN Feature** 🎓

#### Task 4.1: Form Input Nilai
- [ ] Enhance `app/dashboard/student/cek-peluang/page.tsx`
- [ ] Input: Nilai TPS, Literasi (atau ambil dari Try Out terakhir)
- [ ] Pilih maksimal 2 program studi
- [ ] Button "Analisis Peluang"

#### Task 4.2: Rasionalisasi Engine
- [ ] Implementasi di `actions/predict.ts`
- [ ] Algoritma komparasi nilai dengan histori keketatan prodi
- [ ] Data source: 4.900+ prodi + passing grade 3 tahun terakhir
- [ ] Output: persentase peluang (Sangat Aman, Aman, Cukup Aman, Risiko, Sangat Berisiko)

#### Task 4.3: Result Visualization
- [ ] Chart perbandingan nilai user vs passing grade 3 tahun
- [ ] Gauge chart persentase kelulusan
- [ ] Rekomendasi prodi alternatif
- [ ] Historical data peminat & kuota

#### Task 4.4: Direktori Prodi Integration
- [ ] Enhance `app/direktori-prodi/page.tsx`
- [ ] Search & filter: universitas, provinsi, rumpun ilmu
- [ ] Detail per prodi: akreditasi, passing grade, kuota, peminat
- [ ] Link ke "Cek Peluang" dengan prodi terpilih

---

### **FASE 5: Live Class & Learning Materials** 📹

#### Task 5.1: Live Class Schedule
- [ ] Enhance `app/dashboard/student/live-class/page.tsx`
- [ ] Tampilkan jadwal live class (upcoming & past)
- [ ] Filter by: mata pelajaran, tutor, tanggal
- [ ] CTA "Join Live" untuk upcoming session

#### Task 5.2: Live Class Room
- [ ] Integration dengan video streaming platform (Zoom/YouTube Live/Twilio)
- [ ] Chat interaktif real-time
- [ ] Q&A section
- [ ] Polling/quiz during live

#### Task 5.3: Replay Library
- [ ] Archive page untuk rekaman live class
- [ ] Video player dengan timestamp
- [ ] Download modul PDF terkait
- [ ] Bookmark & notes feature

#### Task 5.4: Bank Soal
- [ ] Buat page: `app/bank-soal/page.tsx`
- [ ] Kategori: TPS (PU, PBM, PK, PPU), Literasi (Bahasa Indonesia, Bahasa Inggris, Matematika)
- [ ] Filter by: tingkat kesulitan, topik
- [ ] Practice mode (latihan soal tanpa timer)
- [ ] Review jawaban + pembahasan instant

---

### **FASE 6: Admin Panel (HQ Core)** 🛠️

#### Task 6.1: Dashboard Overview
- [ ] Total users (siswa, tutor, admin)
- [ ] Total try out dikerjakan (hari ini, minggu ini, bulan ini)
- [ ] Chart engagement (daily active users)
- [ ] Revenue metrics (jika premium)

#### Task 6.2: User Management
- [ ] Enhance `app/hq-core-updateptn/users/page.tsx`
- [ ] CRUD users dengan CrudLayout component
- [ ] Filter & search users
- [ ] Export user data (CSV/Excel)
- [ ] Bulk actions (activate, deactivate, delete)

#### Task 6.3: Try Out Management
- [ ] Buat page: `app/hq-core-updateptn/tryouts/page.tsx`
- [ ] CRUD try out: create, edit, delete, duplicate
- [ ] Upload soal (bulk import CSV/JSON)
- [ ] Atur jadwal publish & deadline
- [ ] Preview try out

#### Task 6.4: Soal Management
- [ ] Buat page: `app/hq-core-updateptn/questions/page.tsx`
- [ ] CRUD soal dengan rich text editor
- [ ] Upload gambar soal
- [ ] Tag soal: mata pelajaran, topik, tingkat kesulitan
- [ ] IRT parameter: discrimination, difficulty

#### Task 6.5: Live Class Management
- [ ] Schedule live class
- [ ] Assign tutor
- [ ] Upload modul PDF
- [ ] Monitoring attendance

#### Task 6.6: Prodi Database Management
- [ ] Buat page: `app/hq-core-updateptn/prodi/page.tsx`
- [ ] CRUD data prodi & passing grade
- [ ] Import data dari LTMPT/SNPMB
- [ ] Update histori keketatan per tahun

---

### **FASE 7: Profile & Gamification** 🏆

#### Task 7.1: Profile Enhancement
- [ ] Enhance `app/profile/page.tsx`
- [ ] Upload foto profil
- [ ] Edit data: nama, sekolah, kelas, target PTN
- [ ] Progress tracking: total try out, rata-rata skor, tren improvement
- [ ] Badge/achievement collection

#### Task 7.2: Leaderboard
- [ ] Enhance `app/leaderboard/page.tsx`
- [ ] Top 100 berdasarkan rata-rata skor IRT
- [ ] Filter: global, regional, sekolah
- [ ] Highlight posisi user saat ini

#### Task 7.3: Achievement System
- [ ] Badge definitions (e.g., "First Try Out", "Perfect Score", "Consistent Learner")
- [ ] Progress bars untuk unlock achievement
- [ ] Shareable certificate

---

### **FASE 8: Database & Backend** 🗄️

#### Task 8.1: Supabase Schema Design
- [ ] Tabel users (extended dari auth.users)
- [ ] Tabel tryouts (id, title, duration, total_questions, status)
- [ ] Tabel questions (id, tryout_id, question_text, options, correct_answer, explanation, irt_params)
- [ ] Tabel user_answers (id, user_id, tryout_id, question_id, answer, is_correct, timestamp)
- [ ] Tabel tryout_results (id, user_id, tryout_id, score_tps, score_literasi, irt_score, completed_at)
- [ ] Tabel prodi (id, name, university, passing_grade_history, quota, applicants)
- [ ] Tabel live_classes (id, title, tutor, schedule, video_url, modul_url)
- [ ] Tabel achievements (id, user_id, badge_type, unlocked_at)

#### Task 8.2: Row Level Security (RLS)
- [ ] Setup RLS policies untuk semua tabel
- [ ] User hanya bisa akses data sendiri
- [ ] Admin bisa akses semua data

#### Task 8.3: Server Actions Completion
- [ ] Complete `actions/auth.ts` (login, register, logout, reset password)
- [ ] Complete `actions/tryout.ts` (get list, get detail, submit answers, calculate IRT)
- [ ] Complete `actions/predict.ts` (rasionalisasi algorithm)
- [ ] Complete `actions/profile.ts` (get, update, upload photo)

#### Task 8.4: API Routes (if needed)
- [ ] `/api/irt-calculation` (kalkulasi IRT score)
- [ ] `/api/leaderboard` (fetch top 100)
- [ ] `/api/statistics` (dashboard metrics)

---

### **FASE 9: Testing & Optimization** 🧪

#### Task 9.1: Unit Testing
- [ ] Test utility functions (IRT calculation, score normalization)
- [ ] Test server actions
- [ ] Test UI components

#### Task 9.2: Integration Testing
- [ ] Test complete try out flow (start → answer → submit → result)
- [ ] Test auth flow (register → verify email → login → logout)
- [ ] Test cek peluang flow

#### Task 9.3: Performance Optimization
- [ ] Image optimization (next/image)
- [ ] Code splitting & lazy loading
- [ ] Caching strategy (SWR/React Query)
- [ ] Lighthouse audit (score 90+)

#### Task 9.4: SEO Optimization
- [ ] Meta tags per page
- [ ] Open Graph images
- [ ] Structured data (JSON-LD)
- [ ] Sitemap.xml & robots.txt

---

### **FASE 10: Deployment & Monitoring** 🚀

#### Task 10.1: Environment Setup
- [ ] Setup environment variables (.env.local, .env.production)
- [ ] Supabase production project
- [ ] Vercel/Netlify deployment config

#### Task 10.2: CI/CD Pipeline
- [ ] GitHub Actions for automated testing
- [ ] Automated deployment on push to main
- [ ] Preview deployments for PR

#### Task 10.3: Monitoring & Analytics
- [ ] Vercel Analytics
- [ ] Sentry for error tracking
- [ ] Google Analytics 4
- [ ] Supabase monitoring dashboard

#### Task 10.4: Documentation
- [ ] API documentation
- [ ] Admin user guide
- [ ] Developer onboarding guide
- [ ] Architecture decision records (ADR)

---

## 🎨 Priority: Logo Integration (Quick Win!)

### Implementasi Logo Universitas di Hero Section

**Current State** (line ~216 di `app/page.tsx`):
```tsx
{["UI", "ITB", "UGM", "ITS", "UNPAD", "AIRLANGGA", "UB", "UNS"].map((univ) => (
  <Badge key={univ} variant="outline" className="...">
    {univ}
  </Badge>
))}
```

**Proposed Enhancement**:
```tsx
// Siapkan logo di public/universities/
const universities = [
  { name: "UI", logo: "/universities/ui-logo.png" },
  { name: "ITB", logo: "/universities/itb-logo.png" },
  { name: "UGM", logo: "/universities/ugm-logo.png" },
  // ... dst
];

{universities.map((univ) => (
  <div key={univ.name} className="...">
    <Image 
      src={univ.logo} 
      alt={`Logo ${univ.name}`} 
      width={80} 
      height={80}
      className="grayscale hover:grayscale-0 transition-all"
    />
  </div>
))}
```

**Benefit**:
- Visual lebih menarik & kredibel
- Brand recognition universitas
- User trust meningkat
- Professional appearance

---

## 📊 Timeline Estimate

| Fase | Durasi | Dependencies |
|------|--------|--------------|
| Fase 1 (Logo) | 1 hari | Asset logo universitas |
| Fase 2 (Landing) | 3-5 hari | Design pricing & FAQ |
| Fase 3 (Try Out) | 2 minggu | Database schema |
| Fase 4 (Cek Peluang) | 1.5 minggu | Data prodi + algorithm |
| Fase 5 (Live Class) | 1.5 minggu | Video platform integration |
| Fase 6 (Admin) | 2 minggu | Fase 3 & 4 selesai |
| Fase 7 (Gamification) | 1 minggu | Database ready |
| Fase 8 (Backend) | Paralel dengan Fase 3-7 | Supabase project |
| Fase 9 (Testing) | 1 minggu | All features done |
| Fase 10 (Deploy) | 3 hari | Production environment |

**Total Estimate**: 10-12 minggu (2.5-3 bulan) untuk complete MVP

---

## 🔥 Immediate Next Steps

1. **✅ Siapkan asset logo universitas** → Save di `public/universities/`
2. **Implement logo integration** → Task 1.1 (2-3 jam)
3. **Complete landing page** → Fase 2 (fokus pricing & FAQ)
4. **Setup database schema** → Task 8.1 (critical path)
5. **Implement try out flow** → Fase 3 (core feature)

---

## 📝 Notes & Considerations

### Technical Debt
- [ ] Migrate ke Next.js stable API (jika ada breaking changes)
- [ ] Refactor animation components untuk reusability
- [ ] Standardize error handling across actions

### Security
- [ ] Rate limiting untuk API endpoints
- [ ] Input validation & sanitization
- [ ] CSRF protection
- [ ] XSS prevention

### Scalability
- [ ] Database indexing strategy
- [ ] CDN untuk static assets
- [ ] Caching layer (Redis) untuk leaderboard & statistics
- [ ] Load testing untuk try out concurrent users

### Business Logic
- [ ] IRT algorithm validation dengan statistician
- [ ] Data prodi update mechanism (sync dengan LTMPT)
- [ ] Payment gateway integration (Midtrans/Xendit)
- [ ] Subscription management

---

**Last Updated**: 2026-08-01
**Maintainer**: Development Team UpdatePTN
