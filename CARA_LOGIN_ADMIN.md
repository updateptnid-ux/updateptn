# 🔑 Cara Login sebagai Admin

## Login Otomatis ke Admin Dashboard

### Email Admin:
```
updateptnid@gmail.com
```

### Password:
Gunakan password yang sudah diset saat register account ini.

---

## Langkah-Langkah Login Admin

### 1. Buka Halaman Login
```
http://localhost:3000/login
```

### 2. Masukkan Kredensial Admin
- **Email**: `updateptnid@gmail.com`
- **Password**: (password account ini)

### 3. Klik Login
Setelah login berhasil, akan **OTOMATIS REDIRECT** ke:
```
http://localhost:3000/hq-core-updateptn
```

🎉 Anda langsung masuk ke **Admin Dashboard**!

---

## Jika Belum Punya Account Admin

### Cara 1: Register via Web
1. Buka `http://localhost:3000/register`
2. Isi form dengan:
   - **Nama**: Admin UpdatePTN
   - **Email**: `updateptnid@gmail.com`
   - **Password**: (pilih password yang aman)
   - Asal Sekolah: (opsional)
   - Target PTN: (opsional)
3. Klik "Daftar Akun"
4. Logout, lalu login lagi dengan email admin
5. Otomatis masuk ke admin dashboard

### Cara 2: Manual di Supabase Dashboard
1. Buka Supabase Dashboard → Authentication → Users
2. Klik "Add user"
3. Isi:
   - **Email**: `updateptnid@gmail.com`
   - **Password**: (pilih password)
   - Auto Confirm User: ✅ (centang ini)
4. Klik "Create new user"
5. Sekarang bisa login dengan email tersebut

---

## Cara Kerja Auto Redirect

### File: `actions/auth.ts`

```typescript
export async function loginAction(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  // ... validasi & login

  // Auto redirect admin ke dashboard admin
  const ADMIN_EMAILS = ["updateptnid@gmail.com"];
  if (ADMIN_EMAILS.includes(email.toLowerCase())) {
    redirect("/hq-core-updateptn"); // 👈 ADMIN DASHBOARD
  }

  // User biasa ke dashboard student
  redirect("/dashboard/student"); // 👈 STUDENT DASHBOARD
}
```

---

## Proteksi Admin Routes

Semua halaman admin (`/hq-core-updateptn/**`) sudah diproteksi dengan:

### File: `lib/check-admin.ts`

```typescript
export async function checkAdminAccess() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?redirect=/hq-core-updateptn");
  }

  const ADMIN_EMAILS = ["updateptnid@gmail.com"];

  if (!ADMIN_EMAILS.includes(user.email || "")) {
    redirect("/dashboard/student"); // 👈 Non-admin redirect ke student
  }

  return user;
}
```

**Artinya:**
- Jika belum login → redirect ke `/login`
- Jika login tapi bukan admin → redirect ke `/dashboard/student`
- Jika login sebagai admin → bisa akses admin dashboard ✅

---

## Menambahkan Admin Lain

### Edit file: `lib/check-admin.ts`

```typescript
const ADMIN_EMAILS = [
  "updateptnid@gmail.com",
  "admin2@updateptn.id",      // 👈 Tambahkan email admin baru
  "superadmin@updateptn.id",   // 👈 Atau email lain
];
```

### Edit file: `actions/auth.ts`

```typescript
const ADMIN_EMAILS = [
  "updateptnid@gmail.com",
  "admin2@updateptn.id",      // 👈 Tambahkan juga di sini
  "superadmin@updateptn.id",
];
```

Setelah ditambahkan, semua email di list tersebut bisa:
1. Login otomatis ke admin dashboard
2. Akses semua halaman admin

---

## Testing

### Test 1: Login sebagai Admin
```bash
1. Buka http://localhost:3000/login
2. Email: updateptnid@gmail.com
3. Password: (password admin)
4. Klik Login
5. ✅ Harus masuk ke http://localhost:3000/hq-core-updateptn
```

### Test 2: Login sebagai User Biasa
```bash
1. Buka http://localhost:3000/login
2. Email: user@example.com (email non-admin)
3. Password: (password user)
4. Klik Login
5. ✅ Harus masuk ke http://localhost:3000/dashboard/student
```

### Test 3: Akses Admin Tanpa Login
```bash
1. Buka http://localhost:3000/hq-core-updateptn (langsung tanpa login)
2. ✅ Harus redirect ke http://localhost:3000/login?redirect=/hq-core-updateptn
```

### Test 4: User Biasa Coba Akses Admin
```bash
1. Login sebagai user biasa (bukan admin)
2. Manual ketik URL: http://localhost:3000/hq-core-updateptn
3. ✅ Harus redirect ke http://localhost:3000/dashboard/student
```

---

## Troubleshooting

### Problem: Setelah login admin, redirect ke student dashboard

**Solution:**
- Pastikan email yang digunakan **PERSIS** `updateptnid@gmail.com` (huruf kecil semua)
- Check file `actions/auth.ts` → pastikan email ada di `ADMIN_EMAILS`
- Logout, lalu login lagi

### Problem: Error "checkAdminAccess is not defined"

**Solution:**
- Pastikan file `lib/check-admin.ts` sudah dibuat
- Import di halaman admin: `import { checkAdminAccess } from "@/lib/check-admin";`

### Problem: Admin bisa akses tapi user lain juga bisa

**Solution:**
- Pastikan semua admin pages punya `await checkAdminAccess();` di awal function
- Contoh di `app/hq-core-updateptn/page.tsx`:
  ```typescript
  export default async function AdminDashboardPage() {
    await checkAdminAccess(); // 👈 Ini wajib ada
    // ... rest of code
  }
  ```

---

## Summary

✅ **Email Admin**: `updateptnid@gmail.com`

✅ **Auto Redirect**: Login → Langsung ke `/hq-core-updateptn`

✅ **Protected**: Non-admin tidak bisa akses admin pages

✅ **Easy Add**: Tinggal tambah email di array `ADMIN_EMAILS`

**Selamat mengelola platform UpdatePTN!** 🚀
