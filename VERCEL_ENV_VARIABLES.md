# 🚀 Vercel Environment Variables Setup

## Cara Setting di Vercel Dashboard

1. Buka Vercel Dashboard: https://vercel.com/dashboard
2. Pilih project **updateptn-platform**
3. Klik **Settings** → **Environment Variables**
4. Copy-paste variabel di bawah ini satu per satu

---

## 📋 Copy-Paste Variables untuk Vercel

### 1. SUPABASE (Database & Auth)

**Variable 1:**
```
Name: NEXT_PUBLIC_SUPABASE_URL
Value: https://dafznwwhlqpvsofmtslj.supabase.co
Environment: Production, Preview, Development (pilih semua)
```

**Variable 2:**
```
Name: NEXT_PUBLIC_SUPABASE_ANON_KEY
Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRhZnpud3dobHFwdnNvZm10c2xqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU0MTU0NjgsImV4cCI6MjEwMDk5MTQ2OH0.P2BvT8P5EmtxE9T9WcTlzKtHBc_dSjvDYlOkC7I6tC8
Environment: Production, Preview, Development
```

**Variable 3:**
```
Name: SUPABASE_SERVICE_ROLE_KEY
Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRhZnpud3dobHFwdnNvZm10c2xqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NTQxNTQ2OCwiZXhwIjoyMTAwOTkxNDY4fQ.1cFgrsvk06beL-MJbP-r3ngoWoWe1VYyIfJZ6sDXdQ8
Environment: Production, Preview, Development
⚠️ CRITICAL: This is SECRET - never expose to client
```

---

### 2. APP CONFIGURATION

**Variable 4:**
```
Name: NEXT_PUBLIC_SITE_URL
Value: https://updateptn.id
Environment: Production

ATAU untuk staging:
Value: https://updateptn-platform-git-main-yourteam.vercel.app
Environment: Preview
```

---

### 3. ANTHROPIC API (AI Generator)

**Variable 5:**
```
Name: ANTHROPIC_API_KEY
Value: [Get from https://console.anthropic.com/settings/keys]
Environment: Production, Preview, Development
Note: Used for AI-powered question generator
```

---

### 4. MIDTRANS PAYMENT (PRODUCTION MODE)

**Variable 6:**
```
Name: MIDTRANS_SERVER_KEY
Value: Mid-server-a6z2QQMxh7JJPetfwKMlY_8n
Environment: Production
⚠️ PRODUCTION KEY - for real money transactions
```

**Variable 7:**
```
Name: NEXT_PUBLIC_MIDTRANS_CLIENT_KEY
Value: `Mid-client-7O6I9Fp-C3WU4G9t`
Environment: Production
```

**Variable 8:**
```
Name: MIDTRANS_IS_PRODUCTION
Value: true
Environment: Production
```

**Variable 9:**
```
Name: NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION
Value: true
Environment: Production
```

**Variable 10:**
```
Name: NEXT_PUBLIC_MIDTRANS_SNAP_URL
Value: https://app.midtrans.com/snap/snap.js
Environment: Production
```

---

## 🧪 OPTIONAL: Sandbox Mode for Preview/Development

Jika mau test di Preview/Development environment, tambahin ini:

**Preview/Development Environment:**
```
Name: MIDTRANS_SERVER_KEY
Value: Mid-server-YOUR_SANDBOX_KEY
Environment: Preview, Development

Name: NEXT_PUBLIC_MIDTRANS_CLIENT_KEY
Value: Mid-client-YOUR_SANDBOX_KEY
Environment: Preview, Development

Name: MIDTRANS_IS_PRODUCTION
Value: false
Environment: Preview, Development

Name: NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION
Value: false
Environment: Preview, Development

Name: NEXT_PUBLIC_MIDTRANS_SNAP_URL
Value: https://app.sandbox.midtrans.com/snap/snap.js
Environment: Preview, Development
```

---

## ✅ Verifikasi Setup

### After adding all variables:

1. **Redeploy project:**
   ```bash
   git commit --allow-empty -m "trigger redeploy"
   git push
   ```

2. **Check deployment logs:**
   - Go to Vercel Dashboard → Deployments → Latest deployment
   - Click "View Function Logs"
   - Should NOT see any "env variable undefined" errors

3. **Test critical features:**
   - ✅ User login (Supabase auth)
   - ✅ Payment checkout (Midtrans)
   - ✅ Affiliate promo code validation
   - ✅ JSON Generator (Anthropic API)

---

## 🔐 Security Best Practices

### Secret Variables (NEVER expose to client):
- ❌ `SUPABASE_SERVICE_ROLE_KEY` - Server-only
- ❌ `MIDTRANS_SERVER_KEY` - Server-only
- ❌ `ANTHROPIC_API_KEY` - Server-only

### Public Variables (Safe for client):
- ✅ `NEXT_PUBLIC_SUPABASE_URL`
- ✅ `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- ✅ `NEXT_PUBLIC_MIDTRANS_CLIENT_KEY`
- ✅ `NEXT_PUBLIC_SITE_URL`
- ✅ `NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION`

---

## 🐛 Troubleshooting

### Issue: "Supabase connection failed"
**Fix:** Check `NEXT_PUBLIC_SUPABASE_URL` dan `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### Issue: "Midtrans payment not working"
**Fix:** 
1. Check all Midtrans variables are set
2. Verify `MIDTRANS_IS_PRODUCTION` matches your intent
3. Check Midtrans dashboard for webhook URL: `https://updateptn.id/api/midtrans/webhook`

### Issue: "Unauthorized: Service role key missing"
**Fix:** Check `SUPABASE_SERVICE_ROLE_KEY` is set (without quotes)

### Issue: "OAuth redirect mismatch"
**Fix:** 
1. Check `NEXT_PUBLIC_SITE_URL` matches deployment URL
2. Update Supabase redirect URLs in: Dashboard → Authentication → URL Configuration

---

## 📊 Environment Variable Summary

| Variable | Type | Required | Environment |
|----------|------|----------|-------------|
| NEXT_PUBLIC_SUPABASE_URL | Public | ✅ Yes | All |
| NEXT_PUBLIC_SUPABASE_ANON_KEY | Public | ✅ Yes | All |
| SUPABASE_SERVICE_ROLE_KEY | Secret | ✅ Yes | All |
| NEXT_PUBLIC_SITE_URL | Public | ✅ Yes | All |
| ANTHROPIC_API_KEY | Secret | ⚠️ Optional | All |
| MIDTRANS_SERVER_KEY | Secret | ✅ Yes | Production |
| NEXT_PUBLIC_MIDTRANS_CLIENT_KEY | Public | ✅ Yes | Production |
| MIDTRANS_IS_PRODUCTION | Secret | ✅ Yes | Production |
| NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION | Public | ✅ Yes | Production |
| NEXT_PUBLIC_MIDTRANS_SNAP_URL | Public | ✅ Yes | Production |

**Total: 10 variables** (11 if Anthropic API used)

---

## 🚀 Quick Setup Commands

```bash
# Step 1: Push latest code
git add .
git commit -m "feat: complete promo code affiliate system"
git push origin main

# Step 2: Vercel will auto-deploy
# Go to: https://vercel.com/dashboard

# Step 3: Add environment variables (copy from above)

# Step 4: Trigger redeploy
git commit --allow-empty -m "trigger redeploy with env vars"
git push
```

---

## 📞 Need Help?

- **Supabase Issues:** Check https://supabase.com/dashboard/project/dafznwwhlqpvsofmtslj/settings/api
- **Midtrans Issues:** Check https://dashboard.midtrans.com/settings/access-keys
- **Vercel Issues:** Check deployment logs in dashboard

