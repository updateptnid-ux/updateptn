"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, Lock, ArrowRight, AlertCircle, Loader2, ArrowLeft } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    const errorParam = searchParams.get("error");
    if (errorParam === "unauthorized") {
      setErrorMsg("Akses ditolak: Anda harus memiliki hak akses admin untuk membuka halaman HQ Admin.");
    }
  }, [searchParams]);

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!email || !password) {
      setErrorMsg("Harap masukkan email dan kata sandi.");
      return;
    }

    setIsLoading(true);

    try {
      // 1. Authenticate with Supabase Auth
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error || !data.user) {
        setErrorMsg(error?.message || "Kredensial login admin tidak valid.");
        setIsLoading(false);
        return;
      }

      const user = data.user;

      // 2. Synchronize real-time role to session via server endpoint
      let isConfirmedAdmin =
        user.email === "admin@updateptn.id" ||
        user.email === "updateptnid@gmail.com" ||
        user.user_metadata?.role === "admin" ||
        user.app_metadata?.role === "admin";

      try {
        const syncRes = await fetch("/api/auth/sync-role", { method: "POST" });
        if (syncRes.ok) {
          const syncData = await syncRes.json();
          if (syncData.isAdmin) {
            isConfirmedAdmin = true;
          }
        }
      } catch (syncErr) {
        console.warn("Role sync request warning:", syncErr);
      }

      // 3. Fallback: Query profiles table directly
      if (!isConfirmedAdmin) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .maybeSingle();

        if (profile?.role === "admin") {
          isConfirmedAdmin = true;
        }
      }

      // 4. Refresh session to update JWT claims in cookies
      try {
        await supabase.auth.refreshSession();
      } catch (refErr) {
        console.warn("Session refresh warning:", refErr);
      }

      // 5. Authorization Check
      if (!isConfirmedAdmin) {
        await supabase.auth.signOut();
        setErrorMsg("Akses ditolak: Akun Anda tidak memiliki hak akses admin.");
        setIsLoading(false);
        return;
      }

      // 6. Redirect to Admin Dashboard
      router.push("/hq-core-updateptn");
      router.refresh();
    } catch (err: any) {
      setErrorMsg(err?.message || "Terjadi kesalahan saat proses masuk.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4 font-sans">
      <div className="w-full max-w-sm space-y-6">
        {/* Back link */}
        <div>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-blue-600 transition-colors group"
          >
            <ArrowLeft className="h-3.5 w-3.5 group-hover:-translate-x-0.5 transition-transform" />
            <span>Kembali ke Beranda</span>
          </Link>
        </div>

        {/* Branding & Card */}
        <Card className="bg-white border border-slate-200 shadow-sm rounded-2xl p-2 sm:p-4">
          <CardHeader className="space-y-3 text-center pb-4">
            <div className="flex justify-center">
              <Link href="/" className="inline-flex items-center gap-2">
                <Image
                  src="/logo.svg"
                  alt="UpdatePTN Logo"
                  width={36}
                  height={36}
                  className="h-9 w-auto object-contain"
                  priority
                />
                <span className="font-extrabold text-xl tracking-tight text-slate-900">
                  Update<span className="text-blue-600">PTN</span>
                </span>
              </Link>
            </div>
            <div>
              <CardTitle className="text-xl font-bold text-slate-900">Login Admin</CardTitle>
              <CardDescription className="text-xs text-slate-500 mt-1">
                Silakan masuk ke akun Anda
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            {errorMsg && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2.5 font-medium">
                <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleAdminLogin} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                  <Input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@updateptn.id"
                    className="pl-10 h-11 bg-white border-slate-200 focus:border-blue-600 text-sm text-slate-900 rounded-xl placeholder:text-slate-400"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Kata Sandi</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                  <Input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="pl-10 h-11 bg-white border-slate-200 focus:border-blue-600 text-sm text-slate-900 rounded-xl placeholder:text-slate-400"
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl shadow-xs transition-colors gap-2 mt-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Memproses...</span>
                  </>
                ) : (
                  <>
                    <span>Masuk</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
