# ✅ Free Trial System: Cek Peluang PTN (2x Gratis)

## Status: IMPLEMENTED

Sistem free trial untuk fitur "Cek Peluang Kelulusan PTN" sudah selesai diimplementasikan dengan rule:

- **Gratis 2x** untuk semua user baru
- **Setelah 2x habis** → harus berlangganan **Premium** atau **Plus** untuk unlimited
- **Admin** (`updateptnid@gmail.com`) → **unlimited** tanpa batas

---

## 📋 Changes Made

### 1. **Database Migration** ✅
**File**: `ADD_PREDICTION_COUNT.sql`

```sql
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS prediction_count INTEGER DEFAULT 0;
```

- Tambah kolom `prediction_count` di tabel `profiles`
- Default value: `0`
- Index untuk performance

### 2. **Backend Action Update** ✅
**File**: `actions/predict.ts`

**Features:**
- ✅ Check authentication
- ✅ Get user profile + subscription status
- ✅ Handle NULL `prediction_count` (auto-initialize ke 0)
- ✅ Admin bypass (unlimited untuk `updateptnid@gmail.com` dan role `admin`)
- ✅ Check quota: Free user max 2x, subscribed/admin unlimited
- ✅ Increment count setelah prediction
- ✅ Return `remainingPredictions` untuk UI

**Quota Rules:**
```typescript
const FREE_PREDICTION_LIMIT = 2;

// Admin bypass
const ADMIN_EMAILS = ["updateptnid@gmail.com", "admin@updateptn.id"];
const isAdmin = ADMIN_EMAILS.includes(email) || role === "admin";

// Quota check
if (!isSubscribed && !isAdmin && count >= 2) {
  return { error: "QuotaExceeded", needsUpgrade: true };
}
```

### 3. **Frontend UI Update** ✅
**File**: `app/dashboard/student/cek-peluang/page.tsx`

**Added UI Components:**

#### A. Quota Display Banner (Before Form)
```tsx
{!isSubscribed && remainingPredictions !== null && (
  <div className={remainingPredictions === 0 ? "bg-rose-50" : "bg-blue-50"}>
    <p>Sisa {remainingPredictions}x Cek Gratis</p>
    {remainingPredictions === 0 && (
      <Button href="/pricing">Upgrade Sekarang</Button>
    )}
  </div>
)}
```

#### B. Quota Error Alert
```tsx
{quotaError && (
  <div className="bg-rose-50">
    <p>{quotaError}</p>
    <Button href="/pricing">Lihat Paket Berlangganan</Button>
  </div>
)}
```

#### C. Fetch User Quota on Mount
```tsx
useEffect(() => {
  // Fetch prediction_count, subscription_status
  // Set remainingPredictions state
}, []);
```

---

## 🎯 User Flow

### **Scenario 1: User Baru (Free)**
1. User login → `prediction_count = 0`
2. Cek peluang 1x → Banner: "Sisa 1x Cek Gratis"
3. Cek peluang 2x → Banner: "Quota Gratis Habis! Upgrade Sekarang"
4. Cek peluang 3x → ❌ **Blocked**, tampil error + tombol "Upgrade"

### **Scenario 2: User Premium/Plus**
1. User dengan `subscription_status = 'active'`
2. **Unlimited** cek peluang
3. Tidak ada quota limit
4. Banner tidak muncul (atau "Unlimited")

### **Scenario 3: Admin**
1. Admin email: `updateptnid@gmail.com` atau role `admin`
2. **Unlimited** cek peluang
3. `prediction_count` **tidak di-increment**
4. Tidak ada quota limit

---

## 🔧 Database Requirements

**Run this SQL migration in Supabase:**

```sql
-- Add prediction_count column
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS prediction_count INTEGER DEFAULT 0;

-- Add index
CREATE INDEX IF NOT EXISTS idx_profiles_prediction_count 
ON profiles(prediction_count);

-- Update existing NULL values to 0
UPDATE profiles 
SET prediction_count = 0 
WHERE prediction_count IS NULL;
```

---

## 🧪 Testing Checklist

### Free User Testing
- [x] User baru → `prediction_count = 0`, quota = 2
- [x] Cek 1x → `prediction_count = 1`, quota = 1
- [x] Cek 2x → `prediction_count = 2`, quota = 0
- [x] Cek 3x → ❌ Blocked dengan error "Quota habis"
- [x] Banner quota muncul dengan benar
- [x] Tombol "Upgrade" redirect ke `/pricing`

### Subscribed User Testing
- [x] User Premium/Plus → unlimited
- [x] `prediction_count` tidak di-increment
- [x] Banner quota tidak muncul
- [x] Bisa cek berkali-kali tanpa limit

### Admin Testing
- [x] Admin (`updateptnid@gmail.com`) → unlimited
- [x] Admin role → unlimited
- [x] `prediction_count` tidak di-increment

### Edge Cases
- [x] NULL `prediction_count` → auto-initialize ke 0
- [x] User upgrade mid-session → langsung unlimited
- [x] Error handling quota exceeded

---

## 📊 Analytics Tracking (Optional Future)

Untuk tracking conversion rate:

```sql
-- Count users who hit quota limit
SELECT COUNT(*) FROM profiles 
WHERE prediction_count >= 2 
AND subscription_status != 'active';

-- Count conversions (users yang upgrade setelah hit limit)
SELECT COUNT(*) FROM profiles 
WHERE prediction_count >= 2 
AND subscription_status = 'active';
```

---

## 🎨 UI Screenshots

**Quota Banner (Sisa 2x):**
```
┌─────────────────────────────────────────┐
│ 🎯 Sisa 2x Cek Gratis                  │
│ Setelah habis, upgrade untuk unlimited  │
└─────────────────────────────────────────┘
```

**Quota Habis (0x):**
```
┌─────────────────────────────────────────┐
│ ❌ Quota Gratis Habis!                  │
│ Upgrade ke Premium/Plus untuk unlimited │
│ [Upgrade Sekarang] Button               │
└─────────────────────────────────────────┘
```

---

## 🚀 Next Steps (Optional)

1. **Email Notification**: Send email ketika quota habis
2. **Push to Upgrade**: Popup modal saat quota tinggal 1x
3. **Analytics Dashboard**: Track conversion rate dari free → paid
4. **A/B Testing**: Test free limit (2x vs 3x vs 5x)

---

## 📝 Notes

- Subscription tier: `Basic` (free, 2x limit), `Plus`, `Premium` (unlimited)
- Admin unlimited: `updateptnid@gmail.com`, `admin@updateptn.id`, atau role `admin`
- Quota reset: Tidak ada auto-reset (by design untuk encourage upgrade)
- Counter tidak di-decrement kalau user downgrade dari Premium ke Basic

---

**Implementation Date**: 2026-08-25  
**Status**: ✅ Ready for Production
