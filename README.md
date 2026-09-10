# UpdatePTN Platform

> Platform persiapan ujian masuk PTN dengan tryout online, kalkulator prediksi peluang, dan sistem afiliasi.

[![Next.js](https://img.shields.io/badge/Next.js-15-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Database-green)](https://supabase.com/)
[![Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black)](https://vercel.com/)

## 🚀 Features

### Untuk Siswa
- ✅ **Tryout Online** - Latihan soal SNBT dengan pembahasan lengkap
- 📊 **Kalkulator SNBT/SNBP** - Prediksi peluang masuk PTN impian
- 🎯 **Bank Soal** - Ribuan soal latihan dengan berbagai subtes
- 📅 **Kalender Tryout** - Jadwal tryout dan event
- 💳 **Sistem Subscription** - Paket berlangganan fleksibel
- 📱 **Mobile-First Design** - Optimized untuk Android & iOS

### Untuk Affiliates
- 💰 **Program Afiliasi** - Dapatkan komisi dari referral
- 📈 **Dashboard Earnings** - Tracking komisi real-time
- 🔗 **Unique Referral Code** - Link personal untuk promosi

### Untuk Admin
- 🛠️ **Admin Dashboard** - Manage users, subscriptions, payments
- 📝 **Content Management** - CRUD soal, tryout, artikel
- 💸 **Payment Management** - Monitor transaksi Midtrans
- 👥 **Affiliate Management** - Approve & manage affiliates

## 🏗️ Tech Stack

- **Framework:** [Next.js 15](https://nextjs.org/) (App Router, Server Actions)
- **Language:** TypeScript
- **Database:** [Supabase](https://supabase.com/) (PostgreSQL)
- **Authentication:** Supabase Auth (Email + Google OAuth)
- **Payment Gateway:** [Midtrans](https://midtrans.com/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/) + [shadcn/ui](https://ui.shadcn.com/)
- **Deployment:** [Vercel](https://vercel.com/)

## 📦 Installation

### Prerequisites
- Node.js 18+ 
- npm atau yarn
- Supabase account
- Midtrans account (sandbox/production)

### Setup

1. **Clone repository**
   ```bash
   git clone https://github.com/updateptnid-ux/updateptn.git
   cd updateptn
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment variables**
   
   Copy `.env.local.example` ke `.env.local`:
   ```bash
   cp .env.local.example .env.local
   ```
   
   Edit `.env.local` dengan credentials kamu:
   ```env
   # Supabase
   NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

   # Site URL
   NEXT_PUBLIC_SITE_URL=http://localhost:3000

   # Midtrans (Sandbox)
   MIDTRANS_SERVER_KEY=SB-Mid-server-xxx
   MIDTRANS_CLIENT_KEY=SB-Mid-client-xxx
   MIDTRANS_IS_PRODUCTION=false
   ```

4. **Setup Supabase**
   
   a. Create new project di [Supabase Dashboard](https://supabase.com/dashboard)
   
   b. Run migrations:
   ```bash
   # Install Supabase CLI
   npm install -g supabase

   # Login
   supabase login

   # Link project
   supabase link --project-ref your-project-ref

   # Push migrations
   supabase db push
   ```

5. **Run development server**
   ```bash
   npm run dev
   ```
   
   Buka [http://localhost:3000](http://localhost:3000)

## 🗂️ Project Structure

```
updateptn-platform/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Auth pages (login, register)
│   ├── dashboard/                # Protected dashboards
│   │   ├── student/              # Student dashboard
│   │   └── affiliate/            # Affiliate dashboard
│   ├── hq-core-updateptn/        # Admin dashboard
│   ├── api/                      # API routes
│   └── auth/                     # OAuth callbacks
│
├── actions/                      # Server actions
│   ├── auth.ts                   # Authentication
│   ├── payment-midtrans.ts       # Payment processing
│   ├── tryout.ts                 # Tryout operations
│   └── ...
│
├── components/                   # React components
│   ├── ui/                       # shadcn/ui components
│   ├── admin/                    # Admin components
│   └── student/                  # Student components
│
├── lib/                          # Utilities & helpers
│   ├── supabase/                 # Supabase clients
│   ├── midtrans.ts               # Midtrans integration
│   └── ...
│
├── supabase/
│   └── migrations/               # Database migrations
│
├── public/                       # Static assets
│   ├── logo.svg
│   └── data_snbp.json
│
└── docs/                         # Documentation
    ├── OAUTH_COOKIE_FIX_FINAL.md
    ├── MIDTRANS_SETUP.md
    └── ...
```

## 🔐 Authentication

### Email/Password
```typescript
// Login
import { loginAction } from '@/actions/auth';
await loginAction(formData);

// Register
import { registerAction } from '@/actions/auth';
await registerAction(formData);
```

### Google OAuth
```typescript
import { createClient } from '@/lib/supabase/client';

const supabase = createClient();
await supabase.auth.signInWithOAuth({
  provider: 'google',
  options: {
    redirectTo: `${window.location.origin}/auth/callback`,
  },
});
```

**OAuth Flow:**
1. User login dengan Google
2. Redirect ke `/auth/callback` (exchange code for session)
3. Redirect ke `/auth/success` (profile check)
4. Jika profil belum lengkap → `/complete-profile`
5. Jika sudah lengkap → `/dashboard/student`

> **Note:** Lihat `OAUTH_COOKIE_FIX_FINAL.md` untuk detail implementasi cookie handling.

## 💳 Payment Integration

### Midtrans Flow

1. **Create Payment**
   ```typescript
   import { createMidtransPaymentAction } from '@/actions/payment-midtrans';
   
   const result = await createMidtransPaymentAction({
     packageName: 'Premium 1 Bulan',
     price: 50000,
     affiliateCode: 'AFFILIATE123', // optional
   });
   
   // Get snap token
   const snapToken = result.snapToken;
   ```

2. **Show Payment Modal**
   ```typescript
   // Load Midtrans Snap script
   window.snap.pay(snapToken, {
     onSuccess: (result) => {
       console.log('Payment success:', result);
     },
     onPending: (result) => {
       console.log('Payment pending:', result);
     },
     onError: (result) => {
       console.log('Payment error:', result);
     },
   });
   ```

3. **Webhook Handler**
   - Midtrans akan send POST ke `/api/midtrans/webhook`
   - Verify signature
   - Update `payments` & `subscriptions` table
   - Calculate affiliate commission (jika ada)

> **Note:** Lihat `docs/MIDTRANS_SETUP.md` untuk setup lengkap.

## 📊 Database Schema

### Key Tables

**profiles**
```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  full_name TEXT,
  provinsi TEXT,
  target_ptn TEXT,
  target_prodi TEXT,
  role TEXT DEFAULT 'student',
  created_at TIMESTAMP DEFAULT NOW()
);
```

**subscriptions**
```sql
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id),
  package_name TEXT,
  price INTEGER,
  start_date TIMESTAMP,
  end_date TIMESTAMP,
  is_active BOOLEAN DEFAULT true
);
```

**payments**
```sql
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id),
  amount INTEGER,
  status TEXT, -- pending, success, failed
  midtrans_order_id TEXT,
  affiliate_code TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

**affiliates**
```sql
CREATE TABLE affiliates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id),
  affiliate_code TEXT UNIQUE,
  commission_rate DECIMAL DEFAULT 0.20,
  total_earnings INTEGER DEFAULT 0
);
```

> **Full Schema:** Lihat `supabase/migrations/` folder.

## 🎨 Mobile-First Guidelines

### Design Principles
- **Android 60% + iOS 40%** user base
- Minimum font size **16px** untuk input (prevent iOS zoom)
- Touch targets minimum **48x48px**
- Responsive spacing: `p-3 md:p-6`

### Responsive Typography
```tsx
<h1 className="text-base md:text-xl">Heading</h1>
<p className="text-xs md:text-sm">Body text</p>

{/* Input MUST use 16px minimum */}
<Input style={{ fontSize: '16px' }} />
```

### iOS Safe Area
```css
.safe-top { padding-top: env(safe-area-inset-top); }
.safe-bottom { padding-bottom: env(safe-area-inset-bottom); }
```

> **Full Guide:** Lihat `.kiro/steering/mobile-optimization.md`

## 🧪 Testing

### Local Testing
```bash
# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm run start
```

### Test on Mobile Devices
```bash
# Get your local IP
ipconfig  # Windows
ifconfig  # Mac/Linux

# Access from phone
http://192.168.x.x:3000
```

### Test Payment (Sandbox)
```
Card Number: 4811 1111 1111 1114
CVV: 123
Expiry: 01/25
OTP: 112233
```

## 🚀 Deployment

### Vercel (Recommended)

1. **Connect to Vercel**
   ```bash
   npm install -g vercel
   vercel login
   vercel
   ```

2. **Set Environment Variables**
   - Go to Vercel Dashboard → Settings → Environment Variables
   - Add all env vars from `.env.local`
   - Change `NEXT_PUBLIC_SITE_URL` to production URL
   - Set `MIDTRANS_IS_PRODUCTION=true` for production

3. **Deploy**
   ```bash
   git push origin main  # Auto-deploy from main branch
   ```

### Supabase Setup (Production)

1. **Add Redirect URLs**
   - Go to Supabase Dashboard → Authentication → URL Configuration
   - Add: `https://updateptn.com/auth/callback`

2. **Enable Google OAuth**
   - Go to Authentication → Providers → Google
   - Add OAuth credentials
   - Add authorized redirect URI

## 📝 Scripts

```bash
# Development
npm run dev           # Start dev server
npm run build         # Build for production
npm run start         # Start production server
npm run lint          # Run ESLint

# Database
supabase db push      # Push migrations
supabase db reset     # Reset database
supabase gen types typescript --local > types/supabase.ts
```

## 🐛 Common Issues

### 1. OAuth Redirect Loop
**Problem:** Stuck at login after Google OAuth  
**Solution:** Check `app/auth/callback/route.ts` cookie handling  
**Docs:** `OAUTH_COOKIE_FIX_FINAL.md`

### 2. Midtrans Payment Not Updating
**Problem:** Payment success but subscription inactive  
**Solution:** 
- Check webhook logs in `webhook_audit_log` table
- Verify Midtrans server key
- Check signature verification

### 3. Profile Not Created
**Problem:** New OAuth user has no profile  
**Solution:** Check `handle_new_user()` trigger in database

### 4. Mobile Input Zoom on iOS
**Problem:** Input zooms when focused  
**Solution:** Use `fontSize: '16px'` minimum (not `text-sm`)

## 📚 Documentation

- [AI Context](.kiro/AI_CONTEXT.md) - Comprehensive AI assistant context
- [OAuth Fix](OAUTH_COOKIE_FIX_FINAL.md) - OAuth cookie persistence fix
- [Midtrans Setup](docs/MIDTRANS_SETUP.md) - Payment gateway setup
- [Affiliate System](docs/AFFILIATE_SYSTEM.md) - Affiliate program guide
- [Mobile Optimization](.kiro/steering/mobile-optimization.md) - Mobile-first guidelines

## 🤝 Contributing

1. Fork repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'feat: add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

### Commit Convention
```
feat: new feature
fix: bug fix
refactor: code refactoring
docs: documentation only
style: formatting
test: adding tests
chore: maintenance
```

## 📄 License

This project is proprietary and confidential.

## 👥 Team

- **Developer:** zonaa
- **Organization:** updateptnid-ux

## 🔗 Links

- **Production:** https://updateptn.com
- **GitHub:** https://github.com/updateptnid-ux/updateptn
- **Supabase:** [Dashboard](https://supabase.com/dashboard)
- **Vercel:** [Dashboard](https://vercel.com)

---

**Made with ❤️ for Indonesian students preparing for PTN entrance exams**
