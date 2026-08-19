"use client";

import { useActionState, useEffect } from "react";
import { useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MotionCard } from "@/components/ui/fade-in";
import { ArrowLeft, ArrowRight, Lock, Mail, AlertCircle, Loader2, CheckCircle2 } from "lucide-react";
import { loginAction } from "@/actions/auth";
import { createClient } from "@/lib/supabase/client";

// ── Submit button — harus child of <form> agar useFormStatus bekerja ──────
function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      disabled={pending}
      className="w-full h-11 font-bold text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-md shadow-blue-500/20 gap-2"
    >
      {pending ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Memproses...</span>
        </>
      ) : (
        <>
          <span>Masuk Akun</span>
          <ArrowRight className="h-4 w-4" />
        </>
      )}
    </Button>
  );
}

export default function LoginPage() {
  const [state, formAction] = useActionState(loginAction, null);
  const router = useRouter();

  // Handle client-side redirect after successful login
  useEffect(() => {
    if (state?.success && state?.redirectUrl) {
      console.log("✅ Login berhasil! Redirect ke:", state.redirectUrl);
      // Use window.location for full page reload to ensure cookies are set
      window.location.href = state.redirectUrl;
    }
  }, [state, router]);

  const handleGoogleLogin = async () => {
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/dashboard/student`,
        },
      });
      if (error) console.warn("[Google Login] error:", error.message);
    } catch (err: any) {
      console.warn("[Google Login] unexpected:", err?.message);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-4 py-12 bg-slate-50/70 font-sans">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="flex flex-col items-center text-center space-y-3">
          <div className="w-full flex items-center justify-between">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-blue-600 transition-colors group"
            >
              <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1 text-slate-400 group-hover:text-blue-600" />
              <span>Kembali ke Beranda</span>
            </Link>
            <Badge variant="outline" className="text-[11px] bg-blue-50/80 text-blue-700 border-blue-200/80 font-bold px-2.5 py-0.5">
              Portal Siswa
            </Badge>
          </div>

          <Link href="/" className="flex items-center gap-2.5 group pt-2">
            <Image
              src="/logo.svg"
              alt="UpdatePTN Logo"
              width={40}
              height={40}
              className="h-10 w-auto object-contain transition-transform group-hover:scale-105"
              priority
            />
            <span className="font-extrabold text-2xl tracking-tight text-slate-900">
              Update<span className="text-blue-600">PTN</span>
            </span>
          </Link>
        </div>

        {/* Card */}
        <MotionCard className="rounded-2xl">
          <Card className="border border-slate-200/80 shadow-xl rounded-2xl bg-white/95 backdrop-blur-md overflow-hidden p-2 sm:p-4">
            <CardHeader className="space-y-1.5 text-center pb-4">
              <CardTitle className="text-2xl font-extrabold text-slate-900 tracking-tight">
                Selamat Datang Kembali
              </CardTitle>
              <CardDescription className="text-sm text-slate-500 font-normal">
                Masukkan email dan kata sandi untuk mengakses akunmu
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-5">
              {/* Success message */}
              {state?.success && (
                <div className="p-3.5 rounded-xl bg-emerald-50/80 border border-emerald-200/80 text-emerald-700 flex items-center gap-2.5 text-xs font-medium animate-in fade-in">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
                  <span>{state.message} Mengalihkan...</span>
                </div>
              )}

              {/* Error dari server action */}
              {state?.error && (
                <div className="p-3.5 rounded-xl bg-rose-50/80 border border-rose-200/80 text-rose-700 flex items-center gap-2.5 text-xs font-medium animate-in fade-in">
                  <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
                  <span>{state.error}</span>
                </div>
              )}

              {/* Google OAuth */}
              <Button
                type="button"
                variant="outline"
                onClick={handleGoogleLogin}
                className="w-full h-11 font-semibold rounded-xl border-slate-200/80 hover:bg-slate-50 text-slate-700 flex items-center justify-center gap-3 transition-all hover:border-slate-300"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <span>Masuk dengan Google</span>
              </Button>

              <div className="relative flex items-center justify-center my-4">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-slate-200/80" />
                </div>
                <span className="relative bg-white px-3 text-xs uppercase tracking-wider text-slate-400 font-semibold">
                  atau email
                </span>
              </div>

              {/* Form — action={formAction} agar redirect otomatis dihandle Next.js */}
              <form action={formAction} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-xs font-bold text-slate-700">
                    Email Siswa
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="nama@email.com"
                      required
                      autoComplete="email"
                      className="pl-10 h-11 rounded-xl border-slate-200/80 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 font-medium text-slate-900"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password" className="text-xs font-bold text-slate-700">
                      Kata Sandi
                    </Label>
                    <Link href="#" className="text-xs text-blue-600 font-semibold hover:underline">
                      Lupa sandi?
                    </Link>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      placeholder="••••••••"
                      required
                      autoComplete="current-password"
                      className="pl-10 h-11 rounded-xl border-slate-200/80 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 font-medium text-slate-900"
                    />
                  </div>
                </div>

                <SubmitButton />
              </form>
            </CardContent>

            <CardFooter className="bg-slate-50/70 p-4 border-t border-slate-100 justify-center">
              <p className="text-xs text-slate-500 font-medium">
                Belum punya akun UpdatePTN?{" "}
                <Link href="/register" className="text-blue-600 font-bold hover:underline">
                  Daftar Gratis
                </Link>
              </p>
            </CardFooter>
          </Card>
        </MotionCard>
      </div>
    </div>
  );
}
