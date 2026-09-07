# ⚡ Environment Variables Quick Reference

## 📋 Checklist untuk Vercel

Copy-paste satu per satu ke Vercel Dashboard → Settings → Environment Variables

---

## ✅ Variable #1: NEXT_PUBLIC_SUPABASE_URL
```
Name: NEXT_PUBLIC_SUPABASE_URL
Value: https://dafznwwhlqpvsofmtslj.supabase.co
Environment: ☑ Production ☑ Preview ☑ Development
Type: Plaintext
```

---

## ✅ Variable #2: NEXT_PUBLIC_SUPABASE_ANON_KEY
```
Name: NEXT_PUBLIC_SUPABASE_ANON_KEY
Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRhZnpud3dobHFwdnNvZm10c2xqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU0MTU0NjgsImV4cCI6MjEwMDk5MTQ2OH0.P2BvT8P5EmtxE9T9WcTlzKtHBc_dSjvDYlOkC7I6tC8
Environment: ☑ Production ☑ Preview ☑ Development
Type: Plaintext
Note: Warning "public" is OK - this is an anon key
```

---

## ✅ Variable #3: SUPABASE_SERVICE_ROLE_KEY
```
Name: SUPABASE_SERVICE_ROLE_KEY
Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRhZnpud3dobHFwdnNvZm10c2xqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NTQxNTQ2OCwiZXhwIjoyMTAwOTkxNDY4fQ.1cFgrsvk06beL-MJbP-r3ngoWoWe1VYyIfJZ6sDXdQ8
Environment: ☑ Production ☑ Preview ☑ Development
Type: Secret
⚠️ CRITICAL: Keep this SECRET!
```

---

## ✅ Variable #4: NEXT_PUBLIC_SITE_URL
```
Name: NEXT_PUBLIC_SITE_URL
Value: https://updateptn.id
Environment: ☑ Production only
Type: Plaintext
```

**For Preview/Development:**
```
Name: NEXT_PUBLIC_SITE_URL
Value: https://updateptn-platform-git-main-yourteam.vercel.app
Environment: ☑ Preview ☑ Development
```

---

## ✅ Variable #5: ANTHROPIC_API_KEY
```
Name: ANTHROPIC_API_KEY
Value: [Get from: https://console.anthropic.com/settings/keys]
Environment: ☑ Production ☑ Preview ☑ Development
Type: Secret
Note: Optional - only for AI JSON generator
```

---

## ✅ Variable #6: MIDTRANS_SERVER_KEY
```
Name: MIDTRANS_SERVER_KEY
Value: Mid-server-a6z2QQMxh7JJPetfwKMlY_8n
Environment: ☑ Production only
Type: Secret
⚠️ PRODUCTION KEY - real money transactions!
```

---

## ✅ Variable #7: NEXT_PUBLIC_MIDTRANS_CLIENT_KEY
```
Name: NEXT_PUBLIC_MIDTRANS_CLIENT_KEY
Value: Mid-client-7O6I9Fp-C3WU4G9t
Environment: ☑ Production only
Type: Plaintext
Note: Warning "public" is OK - client key is meant to be public
```

---

## ✅ Variable #8: MIDTRANS_IS_PRODUCTION
```
Name: MIDTRANS_IS_PRODUCTION
Value: true
Environment: ☑ Production only
Type: Plaintext
```

---

## ✅ Variable #9: NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION
```
Name: NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION
Value: true
Environment: ☑ Production only
Type: Plaintext
```

---

## ✅ Variable #10: NEXT_PUBLIC_MIDTRANS_SNAP_URL
```
Name: NEXT_PUBLIC_MIDTRANS_SNAP_URL
Value: https://app.midtrans.com/snap/snap.js
Environment: ☑ Production only
Type: Plaintext
```

---

## 📊 Summary Table

| # | Variable Name | Type | Environment | Public? |
|---|---------------|------|-------------|---------|
| 1 | NEXT_PUBLIC_SUPABASE_URL | URL | All | ✅ Yes |
| 2 | NEXT_PUBLIC_SUPABASE_ANON_KEY | Key | All | ✅ Yes |
| 3 | SUPABASE_SERVICE_ROLE_KEY | Key | All | ❌ No |
| 4 | NEXT_PUBLIC_SITE_URL | URL | All | ✅ Yes |
| 5 | ANTHROPIC_API_KEY | Key | All | ❌ No |
| 6 | MIDTRANS_SERVER_KEY | Key | Prod | ❌ No |
| 7 | NEXT_PUBLIC_MIDTRANS_CLIENT_KEY | Key | Prod | ✅ Yes |
| 8 | MIDTRANS_IS_PRODUCTION | Bool | Prod | ❌ No |
| 9 | NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION | Bool | Prod | ✅ Yes |
| 10 | NEXT_PUBLIC_MIDTRANS_SNAP_URL | URL | Prod | ✅ Yes |

**Total:** 10 variables (11 if using Anthropic)

---

## 🧪 For Testing (Preview/Development Environment)

If you want to test Midtrans in sandbox mode:

```
MIDTRANS_SERVER_KEY=Mid-server-[YOUR_SANDBOX_KEY]
NEXT_PUBLIC_MIDTRANS_CLIENT_KEY=Mid-client-[YOUR_SANDBOX_KEY]
MIDTRANS_IS_PRODUCTION=false
NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION=false
NEXT_PUBLIC_MIDTRANS_SNAP_URL=https://app.sandbox.midtrans.com/snap/snap.js
```

**Get sandbox keys from:** https://dashboard.sandbox.midtrans.com

---

## ⚠️ Common Mistakes

### ❌ DON'T:
- Add quotes around values: `"Mid-server-xxx"` ❌
- Use wrong environment (Prod keys in Dev)
- Expose Service Role Key to client
- Forget to redeploy after adding variables

### ✅ DO:
- Copy values exactly as shown
- Select correct environments
- Mark secrets appropriately
- Redeploy after changes

---

## 🔄 After Adding All Variables

### Step 1: Verify in Vercel
Go to: Settings → Environment Variables

Should see **10 variables** listed (or 11 with Anthropic)

### Step 2: Redeploy
```bash
# Option 1: Push empty commit
git commit --allow-empty -m "trigger redeploy with env vars"
git push

# Option 2: In Vercel dashboard
Go to: Deployments → Latest → "Redeploy"
```

### Step 3: Check Logs
Go to: Deployments → Latest → Runtime Logs

Look for:
- ✅ No "undefined" env variable errors
- ✅ Supabase connection successful
- ✅ Midtrans initialization successful

### Step 4: Test
1. Login works
2. Payments work
3. Promo codes work
4. Webhooks received

---

## 🆘 Troubleshooting

### Error: "env variable undefined"
**Fix:** Variable name typo or not added to correct environment

### Error: "Supabase connection failed"
**Fix:** Check `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### Error: "Midtrans initialization failed"
**Fix:** Check all 5 Midtrans variables are set correctly

### Error: "401 Unauthorized"
**Fix:** Check `SUPABASE_SERVICE_ROLE_KEY` is set (without quotes)

---

## ✅ Done!

Setelah semua variables ditambah dan redeploy berhasil, aplikasi siap production! 🚀

**Quick verify:**
```bash
# Test homepage
curl -I https://updateptn.id

# Test API
curl https://updateptn.id/api/check-snbp
```

**Last Updated:** 2026-01-07
