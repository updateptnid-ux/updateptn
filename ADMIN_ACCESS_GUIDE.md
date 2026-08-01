# 🔐 Panduan Akses Admin Dashboard

## Cara Masuk ke Admin Dashboard

### Metode 1: Direct URL
1. Buka browser
2. Ketik URL: `http://localhost:3000/hq-core-updateptn`
3. Jika belum login, akan redirect ke login page
4. Login dengan akun admin
5. Setelah login, akan masuk ke Admin Dashboard

### Metode 2: Dari Landing Page
1. Buka `http://localhost:3000`
2. Login (klik tombol "Masuk" di navbar)
3. Setelah login, manually ketik URL: `http://localhost:3000/hq-core-updateptn`

### Metode 3: Tambahkan Link di Navbar (Recommended)
Tambahkan link admin di navbar untuk user dengan role admin.

---

## Setup Role Admin di Database

### 1. Buat Tabel `user_roles` di Supabase

```sql
CREATE TABLE user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('student', 'admin', 'tutor')),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read their own role
CREATE POLICY "Users can view own role"
  ON user_roles FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Only service role can insert/update roles
CREATE POLICY "Service role can manage roles"
  ON user_roles FOR ALL
  USING (auth.role() = 'service_role');
```

### 2. Insert Admin Role untuk User Tertentu

```sql
-- Ganti 'USER_ID_HERE' dengan UUID user yang mau dijadikan admin
INSERT INTO user_roles (user_id, role)
VALUES ('USER_ID_HERE', 'admin');
```

**Cara cek user_id:**
1. Login sebagai user yang mau dijadikan admin
2. Di Supabase Dashboard → Authentication → Users
3. Copy UUID user tersebut
4. Paste ke query di atas

---

## Protect Admin Routes dengan Middleware

### Buat Middleware untuk Check Role

File: `app/hq-core-updateptn/middleware.ts` (atau di root `/middleware.ts`)

```typescript
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  // Only run middleware for admin routes
  if (!request.nextUrl.pathname.startsWith('/hq-core-updateptn')) {
    return NextResponse.next()
  }

  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: any) {
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: any) {
          response.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Redirect to login if not authenticated
  if (!user) {
    return NextResponse.redirect(new URL('/login?redirect=/hq-core-updateptn', request.url))
  }

  // Check if user has admin role
  const { data: userRole } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', user.id)
    .single()

  // Redirect if not admin
  if (!userRole || userRole.role !== 'admin') {
    return NextResponse.redirect(new URL('/dashboard/student', request.url))
  }

  return response
}

export const config = {
  matcher: '/hq-core-updateptn/:path*',
}
```

---

## Alternatif: Simple Auth Check (Tanpa Role)

Jika tidak mau setup role, bisa pakai auth check sederhana di setiap admin page:

File: `app/hq-core-updateptn/page.tsx`

```typescript
export default async function AdminDashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login?redirect=/hq-core-updateptn');
  }

  // Opsional: Hardcode admin email
  const ADMIN_EMAILS = [
    'admin@updateptn.id',
    'superadmin@updateptn.id',
  ];

  if (!ADMIN_EMAILS.includes(user.email || '')) {
    redirect('/dashboard/student');
  }

  return (
    // ... admin dashboard content
  );
}
```

---

## Recommended Approach: Add Admin Link to Navbar

Update `app/dashboard/layout.tsx`:

```typescript
const navItems = [
  {
    name: "Dashboard & Try Out",
    href: "/dashboard/student",
    icon: LayoutDashboard,
  },
  // ... other menu items
  
  // Add admin link conditionally
  ...(isAdmin ? [{
    name: "🔧 Admin Panel",
    href: "/hq-core-updateptn",
    icon: Settings,
  }] : []),
];
```

Fetch `isAdmin` status:

```typescript
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    async function checkAdminStatus() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        const { data } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .single();
        
        setIsAdmin(data?.role === 'admin');
      }
    }
    
    checkAdminStatus();
  }, []);

  // ... rest of layout
}
```

---

## Quick Access for Development

Untuk development, bisa disable auth check sementara:

1. Comment out auth check di admin pages
2. Atau tambahkan environment variable:

```env
# .env.local
NEXT_PUBLIC_DISABLE_ADMIN_AUTH=true
```

Lalu di middleware:

```typescript
if (process.env.NEXT_PUBLIC_DISABLE_ADMIN_AUTH === 'true') {
  return NextResponse.next();
}
```

**⚠️ WARNING: Jangan lupa enable kembali untuk production!**

---

## Summary

### Untuk Testing (Development):
1. Direct access: `http://localhost:3000/hq-core-updateptn`
2. Login dengan akun apapun
3. Bisa tambahkan bypass auth untuk dev

### Untuk Production:
1. Setup `user_roles` table
2. Assign role `admin` ke user tertentu
3. Implement middleware untuk protect routes
4. Atau hardcode admin emails sebagai whitelist

**Cara Paling Simple**: Hardcode admin emails di setiap page.

**Cara Paling Proper**: Middleware + role-based access control (RBAC).
