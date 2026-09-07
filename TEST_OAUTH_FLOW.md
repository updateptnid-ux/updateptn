# OAuth Flow Testing Checklist

## Pre-Test Setup

### 1. Ensure All Migrations Are Applied
Run these in Supabase SQL Editor (in order):

```sql
-- Migration 1: Create profile trigger
-- From: supabase/migrations/20260108000000_create_profile_trigger.sql

-- Migration 2: Fix profile columns
-- From: supabase/migrations/20260109000000_fix_profiles_columns.sql

-- Migration 3: Backfill missing profiles
-- From: supabase/migrations/20260108000001_backfill_missing_profiles.sql

-- Migration 4: Add RLS policies
-- From: supabase/migrations/20260109000001_add_profiles_rls_policies.sql
```

### 2. Verify Environment Variables
Check `.env.local`:
```bash
NEXT_PUBLIC_SUPABASE_URL=https://dafznwwhlqpvsofmtslj.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci... (your key)
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### 3. Restart Dev Server
```bash
# Stop current server (Ctrl+C)
npm run dev
```

## Test Scenarios

### Scenario A: New User (Google OAuth)

**Steps**:
1. Clear all site data (DevTools > Application > Clear storage)
2. Go to `http://localhost:3000/login`
3. Click "Login dengan Google"
4. Choose Google account that has NEVER logged in before
5. Complete OAuth consent

**Expected Flow**:
```
/login
  ↓ (click Google)
accounts.google.com (Google OAuth)
  ↓ (approve)
/auth/callback?code=xxx
  ↓ (exchange code for session)
  ↓ (profile trigger creates empty profile)
  ↓ (wait 2 seconds)
  ↓ (check if profile.full_name & provinsi exist)
  ↓ (they don't exist - NEW USER)
/complete-profile
  ↓ (user fills form)
  ↓ (submit)
/dashboard/student
```

**Expected Result**:
- ✅ User lands on `/complete-profile`
- ✅ Form is pre-filled with email
- ✅ After filling required fields (name, provinsi) and submit
- ✅ Redirects to `/dashboard/student`
- ✅ Top-right shows user avatar/name
- ✅ Can access all dashboard features

**Debug Checks**:
1. Check `/api/debug-session` after OAuth:
   ```json
   {
     "user": { "exists": true, "email": "..." },
     "profile": { 
       "exists": true, 
       "fullName": null,
       "provinsi": null,
       "isComplete": false 
     }
   }
   ```

2. Check Supabase Dashboard > Authentication > Users:
   - New user should appear with provider "google"

3. Check Supabase Dashboard > Table Editor > profiles:
   - New row with user ID, empty full_name and provinsi

### Scenario B: Returning User (Complete Profile)

**Steps**:
1. Clear all site data
2. Login with Google account that HAS completed profile before
3. Complete OAuth

**Expected Flow**:
```
/login
  ↓
accounts.google.com
  ↓
/auth/callback?code=xxx
  ↓ (profile exists with full_name & provinsi)
/dashboard/student (direct!)
```

**Expected Result**:
- ✅ User lands DIRECTLY on `/dashboard/student` (skips complete-profile)
- ✅ Top-right shows user info
- ✅ All features accessible

**Debug Checks**:
```json
{
  "user": { "exists": true },
  "profile": { 
    "exists": true,
    "fullName": "John Doe",
    "provinsi": "DKI Jakarta",
    "isComplete": true 
  }
}
```

### Scenario C: Returning User (Incomplete Profile)

**Steps**:
1. Manually remove profile data:
   ```sql
   -- In Supabase SQL Editor
   UPDATE profiles 
   SET full_name = NULL, provinsi = NULL 
   WHERE id = 'user-uuid-here';
   ```
2. Clear browser cookies
3. Login with Google

**Expected Flow**:
```
/login → OAuth → /auth/callback → /complete-profile
```

**Expected Result**:
- ✅ User is redirected to `/complete-profile`
- ✅ Must fill required fields to continue

## Debugging Failed Tests

### Problem 1: Stuck on Login Page After OAuth
**Symptoms**: After Google OAuth, returns to login page showing "Daftar Gratis" / "Masuk"

**Debug Steps**:
1. Check `/api/debug-session`:
   - If `user.exists: false` → Session not created
   - If `cookies.total: 0` → Cookies not set

2. Check browser console for errors

3. Check Network tab:
   - Look at `/auth/callback?code=...` request
   - Check response headers for `Set-Cookie`
   - Check if cookies are being sent in subsequent requests

**Possible Causes**:
- Browser blocking cookies (check settings)
- OAuth code expired (took too long)
- Supabase project settings issue

**Fix**:
- Allow cookies in browser
- Try incognito mode
- Check Supabase Dashboard > Authentication > URL Configuration:
  - Site URL: `http://localhost:3000`
  - Redirect URLs: `http://localhost:3000/**`

### Problem 2: Error During Profile Creation
**Symptoms**: Redirected to `/register?error=...`

**Debug Steps**:
1. Check URL parameter for error message
2. Check server logs in terminal
3. Check Supabase logs

**Fix**: Run migrations or check RLS policies

### Problem 3: Can Access Dashboard But Features Don't Work
**Symptoms**: Dashboard loads but "Cek Peluang" or other features show errors

**Debug Steps**:
1. Check `/api/debug-session`:
   - If `profile.isComplete: false` → Profile data missing
2. Check browser console for RLS errors

**Fix**:
- Ensure all profile columns have values
- Check RLS policies are applied
- Try updating profile manually in Supabase

## Success Criteria

All these must be ✅:
- [ ] New Google user → `/complete-profile`
- [ ] After completing profile → `/dashboard/student`
- [ ] Returning complete user → `/dashboard/student` (direct)
- [ ] Session persists across page reloads
- [ ] User info shows in top-right corner
- [ ] Profile page loads without errors
- [ ] Cek Peluang feature works
- [ ] No console errors
- [ ] `/api/debug-session` shows valid session & user

## If All Tests Pass
🎉 OAuth flow is working correctly!

## If Tests Still Fail
1. Share screenshot of `/api/debug-session` output
2. Share browser console logs
3. Share Network tab screenshot of `/auth/callback` request
4. Check Supabase logs for any auth errors

## Additional Test: Email/Password Login
To isolate if issue is OAuth-specific:

1. Go to `/register`
2. Create account with email/password
3. Verify email (check Supabase inbox or disable email confirmation)
4. Login with email/password
5. Should work without issues

If email/password works but Google OAuth doesn't → Issue is OAuth configuration
If both fail → Issue is general session/cookie handling
