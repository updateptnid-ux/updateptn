# 🚀 Deployment Checklist - Update PTN Platform

## Pre-Deployment Checklist

### 1. Database Migrations ✅

**Run di Supabase SQL Editor:**

```sql
-- Step 1: Add affiliate_id to payments table
-- File: supabase/migrations/20260107000001_add_affiliate_tracking_to_payments.sql
-- Copy-paste isi file tersebut ke SQL Editor
```

**Verify migration:**
```sql
-- Check column exists
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'payments' 
AND column_name = 'affiliate_id';

-- Should return: affiliate_id | uuid
```

---

### 2. Environment Variables di Vercel ✅

**File reference:** `VERCEL_ENV_VARIABLES.md`

**Quick check (10 variables total):**
- [x] `NEXT_PUBLIC_SUPABASE_URL`
- [x] `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [x] `SUPABASE_SERVICE_ROLE_KEY`
- [x] `NEXT_PUBLIC_SITE_URL` (production: https://updateptn.id)
- [x] `ANTHROPIC_API_KEY` (optional)
- [x] `MIDTRANS_SERVER_KEY` (production)
- [x] `NEXT_PUBLIC_MIDTRANS_CLIENT_KEY` (production)
- [x] `MIDTRANS_IS_PRODUCTION` = `true`
- [x] `NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION` = `true`
- [x] `NEXT_PUBLIC_MIDTRANS_SNAP_URL` = `https://app.midtrans.com/snap/snap.js`

---

### 3. Midtrans Configuration ✅

**Di Midtrans Dashboard (Production):**

1. **Webhook URL:**
   ```
   https://updateptn.id/api/midtrans/webhook
   ```
   Set di: Settings → Configuration → Payment Notification URL

2. **Redirect URLs:**
   ```
   Finish:    https://updateptn.id/payment/status
   Unfinish:  https://updateptn.id/payment/status
   Error:     https://updateptn.id/payment/status
   ```

3. **Enable payment methods:**
   - [x] Credit/Debit Card
   - [x] Bank Transfer (BCA, Mandiri, BNI, BRI, Permata)
   - [x] E-Wallet (GoPay, OVO, DANA, ShopeePay)
   - [x] Convenience Store (Indomaret, Alfamart)

---

### 4. Supabase Configuration ✅

**Di Supabase Dashboard:**

1. **Redirect URLs:**
   ```
   https://updateptn.id/**
   https://updateptn.id/auth/callback
   ```
   Set di: Authentication → URL Configuration → Redirect URLs

2. **Site URL:**
   ```
   https://updateptn.id
   ```
   Set di: Authentication → URL Configuration → Site URL

3. **RLS Policies:**
   ```sql
   -- Verify all tables have RLS enabled
   SELECT tablename, rowsecurity 
   FROM pg_tables 
   WHERE schemaname = 'public';
   
   -- All should show: rowsecurity = true
   ```

---

## Deployment Steps

### Step 1: Code Push

```bash
# Check status
git status

# Add all changes
git add .

# Commit with descriptive message
git commit -m "feat: implement promo code affiliate system

- Add affiliate_id tracking to payments
- Implement promo code validation at checkout
- Auto-create commission on successful payment
- Update webhook to handle affiliate commissions
- Add comprehensive documentation"

# Push to main
git push origin main
```

---

### Step 2: Vercel Auto-Deploy

1. Vercel will automatically detect push
2. Check deployment progress: https://vercel.com/dashboard
3. Wait for "Building..." → "Deploying..." → "Ready"
4. Check deployment logs for errors

---

### Step 3: Verify Deployment

#### A. Health Checks

```bash
# Check homepage
curl -I https://updateptn.id
# Should return: 200 OK

# Check API
curl https://updateptn.id/api/check-snbp
# Should return JSON response

# Check webhook (will fail but should not 500)
curl -X POST https://updateptn.id/api/midtrans/webhook
# Should return: 401 (unauthorized) - this is expected
```

#### B. Manual Testing

1. **Login/Register:**
   - Go to: https://updateptn.id
   - Test email/password login
   - Test Google OAuth login

2. **Promo Code System:**
   ```
   Steps:
   1. Login as user
   2. Go to: /dashboard/student/beli-paket?tier=Premium+SNBT&duration=1+bulan&price=79000
   3. Enter test promo code (create in database first)
   4. Click "Terapkan"
   5. Verify discount shown: ~~Rp 79,000~~ → Rp 71,100
   6. Click "Bayar Sekarang"
   7. Complete payment (use real card or test in sandbox)
   8. Check commission created in database
   ```

3. **Affiliate Dashboard:**
   ```
   Steps:
   1. Login as affiliate user
   2. Go to: /dashboard/student/affiliate
   3. Check if "Pindah Menu" shows "Dashboard Affiliate"
   4. Click to go to /dashboard/affiliate
   5. Verify stats, commissions, balance shown correctly
   ```

---

## Post-Deployment Testing

### Test Case 1: Valid Promo Code

**Create test affiliate:**
```sql
INSERT INTO affiliates (
  user_id,
  full_name,
  email,
  status,
  affiliate_code,
  commission_rate
) VALUES (
  'your-test-user-uuid',
  'Test Affiliate',
  'test@affiliate.com',
  'active',
  'PTN-TEST01',
  10.00
);
```

**Test flow:**
1. Enter code: `PTN-TEST01`
2. Expected: ✅ "Kode promo valid! - Diskon 10%"
3. Complete payment
4. Check commission:
   ```sql
   SELECT * FROM commissions 
   WHERE affiliate_id = (
     SELECT id FROM affiliates WHERE affiliate_code = 'PTN-TEST01'
   )
   ORDER BY created_at DESC LIMIT 1;
   ```

---

### Test Case 2: Invalid Promo Code

1. Enter code: `INVALID123`
2. Expected: ❌ "Kode promo tidak valid"

---

### Test Case 3: Inactive Affiliate

```sql
-- Set affiliate to pending
UPDATE affiliates 
SET status = 'pending' 
WHERE affiliate_code = 'PTN-TEST01';
```

1. Enter code: `PTN-TEST01`
2. Expected: ❌ "Kode promo tidak aktif"

---

## Monitoring & Alerts

### 1. Check Error Logs

**Vercel:**
```
Dashboard → Deployments → Latest → Runtime Logs
```

**Look for:**
- ❌ Database connection errors
- ❌ Midtrans API errors
- ❌ Webhook failures

---

### 2. Database Monitoring

**Supabase Dashboard → Database → Query Performance**

```sql
-- Check recent payments
SELECT 
  order_id,
  amount,
  status,
  affiliate_id,
  created_at
FROM payments
WHERE created_at > NOW() - INTERVAL '24 hours'
ORDER BY created_at DESC;

-- Check commission creation rate
SELECT 
  DATE(created_at) as date,
  COUNT(*) as total_commissions,
  SUM(commission_amount) as total_amount
FROM commissions
GROUP BY DATE(created_at)
ORDER BY date DESC;

-- Check failed commissions
SELECT 
  p.order_id,
  p.amount,
  p.status,
  p.affiliate_id,
  c.id as commission_id
FROM payments p
LEFT JOIN commissions c ON c.order_id = p.order_id
WHERE p.affiliate_id IS NOT NULL
  AND p.status = 'success'
  AND c.id IS NULL
ORDER BY p.created_at DESC;
```

---

### 3. Midtrans Webhook Logs

**Midtrans Dashboard → Transactions → Notification History**

Check for:
- ✅ Webhook delivery success (200 OK)
- ❌ Failed webhooks (retry count)

---

## Rollback Plan

### If deployment fails:

```bash
# Option 1: Revert to previous commit
git log --oneline -n 5
git revert HEAD
git push origin main

# Option 2: Rollback in Vercel
# Go to: Vercel Dashboard → Deployments → Previous deployment → "Promote to Production"
```

---

## Post-Launch Checklist

### Day 1:
- [x] Monitor error logs (first 2 hours)
- [x] Check first real payment completes successfully
- [x] Verify commission created for affiliate payment
- [x] Check webhook delivery rate (should be 100%)

### Week 1:
- [x] Review payment success rate
- [x] Check affiliate commission accuracy
- [x] Monitor database performance
- [x] Collect user feedback on promo code UX

### Month 1:
- [x] Review total commissions paid
- [x] Check affiliate withdrawal requests
- [x] Optimize slow queries if any
- [x] Plan next features based on usage data

---

## Success Metrics

### Payment System:
- Payment success rate: **> 95%**
- Webhook delivery rate: **> 99%**
- Average payment time: **< 2 minutes**

### Affiliate System:
- Promo code validation: **< 1 second**
- Commission creation: **100% accuracy**
- False positive rate: **0%**

---

## Emergency Contacts

| Issue | Contact | Action |
|-------|---------|--------|
| Payment down | Midtrans Support | Call: +62 21 2921 6000 |
| Database down | Supabase Support | https://supabase.com/support |
| Site down | Vercel Support | Check status.vercel.com |

---

## 🎉 Launch Ready!

When all checkboxes are ✅, you're ready to deploy to production.

**Final command:**
```bash
git push origin main
```

**Then watch the magic happen at:**
- Deployment: https://vercel.com/dashboard
- Live site: https://updateptn.id
- Affiliate dashboard: https://updateptn.id/dashboard/affiliate

Good luck! 🚀

