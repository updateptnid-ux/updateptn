# 🚨 Fix Email Verification Redirect - Quick Guide

## Problem
Email verification links redirect to `localhost` instead of `updateptn.id`

---

## ✅ Step 1: Supabase Dashboard (5 minutes)

### Login & Navigate:
1. Go to: https://supabase.com/dashboard
2. Select project: `dafznwwhlqpvsofmtslj`
3. Click: **Authentication** → **URL Configuration**

### Update Settings:
```
Site URL: https://updateptn.id

Redirect URLs (add these):
- https://updateptn.id/**
- https://updateptn.id/auth/callback
```

Click **SAVE** ✅

---

## ✅ Step 2: Vercel Dashboard (3 minutes)

### Login & Navigate:
1. Go to: https://vercel.com/dashboard
2. Select project: `updateptn-platform`
3. Click: **Settings** → **Environment Variables**

### Update Variable:
Find: `NEXT_PUBLIC_SITE_URL`

Current value: `http://localhost:3000`
New value: `https://updateptn.id`

Environment: Select **Production** ✅

Click **SAVE**

---

## ✅ Step 3: Redeploy (1 minute)

After updating Vercel environment variable:

1. Go to: **Deployments** tab
2. Click **Redeploy** on latest deployment
3. Wait for deployment to complete (~2-3 minutes)

---

## ✅ Step 4: Test

### Test Email Verification:
1. Register new test account
2. Check email inbox
3. Click verification link
4. Should redirect to: `https://updateptn.id` ✅

---

## 📝 Important Notes

- **Local Development:** Keep using `localhost:3000` in your local `.env.local` file
- **Production Only:** Change to `updateptn.id` ONLY in Vercel dashboard
- **DO NOT commit** production URL changes to git

---

## Need Help?

See full documentation: `docs/EMAIL_VERIFICATION_REDIRECT_FIX.md`
