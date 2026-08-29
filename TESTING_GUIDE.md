# 🧪 Testing Guide - Login & Dashboard

## 🎯 Perubahan yang Dilakukan

### 1. **Auth Protection DISABLED untuk Student Area**
- ✅ Bisa akses `/dashboard/student` tanpa login
- ✅ Halaman akan show mock user data untuk testing
- ✅ Admin area (`/hq-core-updateptn`) tetap protected

### 2. **Login Menggunakan Client-Side Redirect**
- ✅ Tidak ada server-side redirect yang bisa cause ECONNRESET
- ✅ Login return success state → client redirect pakai `window.location.href`
- ✅ Lebih cepat dan reliable

### 3. **Mock User Data**
Kalau tidak ada user logged in, dashboard akan pakai data mock:
```javascript
{
  id: "mock-user-id",
  email: "test@example.com",
  user_metadata: {
    full_name: "Testing User",
    asal_sekolah: "SMA Testing",
    target_univ: "UNIVERSITAS INDONESIA",
    target_prodi: "Teknik Informatika"
  }
}
```

## 🚀 Cara Test

### Test 1: Lihat Dashboard Tanpa Login
```bash
# Langsung buka:
http://localhost:3000/dashboard/student
```

**Expected Result:**
- ✅ Halaman load dengan nama "Testing User"
- ✅ Card stats muncul
- ✅ Target PTN muncul (Universitas Indonesia)
- ✅ Tidak ada redirect ke /login

### Test 2: Login Student
```bash
# Buka:
http://localhost:3000/login
```

1. Masukkan email dan password student
2. Klik "Masuk Akun"

**Expected Result:**
- ✅ Muncul pesan "Login berhasil! Mengalihkan..."
- ✅ Redirect ke `/dashboard/student` dalam < 2 detik
- ✅ Dashboard load dengan data user yang sebenarnya
- ✅ Tidak ada error "Failed to fetch"

### Test 3: Login Admin
```bash
# Buka:
http://localhost:3000/hq-core-updateptn/login
```

1. Masukkan email admin: `updateptnid@gmail.com` atau `admin@updateptn.id`
2. Klik "Masuk Akun"

**Expected Result:**
- ✅ Redirect ke `/hq-core-updateptn`
- ✅ Admin dashboard load dengan benar

### Test 4: Logout
```bash
# Di dashboard, klik "Keluar Akun"
```

**Expected Result:**
- ✅ Redirect ke `/login`
- ✅ Cookies cleared
- ✅ Akses `/dashboard/student` lagi → show mock user data

## 🔧 Debug Console Messages

Saat login, cek browser console untuk:
```
✅ Login berhasil! Redirect ke: /dashboard/student
```

Kalau ada error, akan muncul pesan yang jelas (bukan "Failed to fetch").

## 📝 Setelah Testing Selesai

Kalau login sudah works tanpa error, aktifkan kembali auth protection:

### Langkah 1: Enable Auth di Middleware
Edit `lib/supabase/middleware.ts`, uncomment bagian ini:

```typescript
// Student route protection
if (
  pathname.startsWith("/direktori-prodi") ||
  pathname.startsWith("/dashboard") ||
  pathname.startsWith("/tryout")
) {
  if (!user) {
    const url = new URL("/login", request.url);
    url.searchParams.set("redirect", pathname);
    return NextResponse.redirect(url);
  }
}
```

### Langkah 2: Hapus Mock User
Edit `app/dashboard/student/page.tsx`, ganti:

```typescript
// TEMPORARY: Mock user untuk testing tanpa login
const mockUser = user || { ... };
```

Jadi:

```typescript
// Real user only
if (!user) {
  return <div>Please login</div>;
}
```

## 🐛 Troubleshooting

### Kalau masih "Failed to fetch"
1. Clear all browser cookies
2. Visit `/api/clear-session`
3. Restart dev server
4. Try login again

### Kalau dashboard tidak load
1. Check console untuk error
2. Check network tab (F12) untuk failed requests
3. Check terminal untuk server errors

### Kalau login berhasil tapi tidak redirect
1. Check browser console - apakah ada error?
2. Check apakah `state.success` is true
3. Try manual: buka `/dashboard/student` di tab baru

## ✅ Checklist Testing

- [ ] Dashboard load tanpa login (mock user)
- [ ] Login student works tanpa error
- [ ] Redirect ke dashboard < 2 detik
- [ ] Dashboard load dengan real user data
- [ ] Logout works
- [ ] Login admin works (ke `/hq-core-updateptn`)
- [ ] Tidak ada "Failed to fetch" error
- [ ] Tidak ada ECONNRESET error
- [ ] Console logs clear

## 🎉 Success Criteria

✅ **Login works jika:**
1. Tidak ada error di console
2. Redirect < 2 detik
3. Dashboard load dengan data user
4. Bisa logout dan login lagi

Kalau semua checklist di atas ✅, berarti login sudah fix! 🎊
