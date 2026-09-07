"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ArrowLeft,
  ArrowRight,
  Lock,
  Mail,
  User,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { GoogleLoginButton } from "@/components/auth/GoogleLoginButton";
import { recordReferralAction, trackReferralClickAction } from "@/actions/affiliate";

export default function RegisterPage() {
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [affiliateCode, setAffiliateCode] = useState<string | null>(null);

  // Check for OAuth errors in URL params & Track Affiliate Referral
  useEffect(() => {
    // Check for referral code
    const refCode = searchParams.get("ref");
    if (refCode) {
      // Store in localStorage for tracking
      localStorage.setItem("affiliate_ref", refCode);
      setAffiliateCode(refCode);
      
      // Track the click
      trackReferralClickAction(refCode, "direct");
    }

    const errorParam = searchParams.get('error');
    const messageParam = searchParams.get('message');
    
    if (errorParam) {
      let errorMsg = 'Terjadi kesalahan saat login dengan Google.';
      
      if (errorParam === 'access_denied') {
        errorMsg = 'Akses ditolak. Anda membatalkan login dengan Google.';
      } else if (errorParam === 'auth_failed') {
        errorMsg = messageParam || 'Gagal autentikasi dengan Google.';
      } else if (errorParam === 'no_session') {
        errorMsg = 'Sesi tidak berhasil dibuat. Silakan coba lagi.';
      } else if (messageParam) {
        errorMsg = messageParam;
      }
      
      setError(errorMsg);
      
      // Clear URL params without reload
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const fullName = (formData.get("fullName") as string)?.trim();
    const email = (formData.get("email") as string)?.trim();
    const password = formData.get("password") as string;

    if (!fullName || !email || !password) {
      setError("Nama lengkap, email, dan kata sandi wajib diisi.");
      setIsLoading(false);
      return;
    }

    try {
      const supabase = createClient();
      const { data, error: signUpErr } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });

      // Record affiliate referral if exists
      const storedRef = localStorage.getItem("affiliate_ref") || affiliateCode;
      if (storedRef && data.user) {
        await recordReferralAction({
          affiliateCode: storedRef,
          referredEmail: email,
          source: "direct",
        });
        localStorage.removeItem("affiliate_ref"); // Clean up
      }

      if (signUpErr) {
        setError(signUpErr.message);
        setIsLoading(false);
        return;
      }

      // Check if session exists or if email confirmation is required
      if (data.session) {
        // Success - show subtle toast and redirect
        setError(null);
        setIsLoading(false);
        
        // Subtle success toast
        const toast = document.createElement('div');
        toast.className = 'fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-white border border-slate-200 rounded-xl shadow-lg p-4 flex items-center gap-3 text-sm';
        toast.innerHTML = `
          <div class="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
            <svg class="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <span class="font-medium text-slate-900">Akun berhasil dibuat</span>
          <span class="text-slate-400 ml-2" id="countdown">3</span>
        `;
        document.body.appendChild(toast);

        // Countdown
        let seconds = 3;
        const countdownEl = document.getElementById('countdown');
        const interval = setInterval(() => {
          seconds--;
          if (countdownEl) countdownEl.textContent = seconds.toString();
          if (seconds <= 0) {
            clearInterval(interval);
            window.location.href = "/dashboard/student";
          }
        }, 1000);
      } else {
        // Email confirmation required
        alert("Pendaftaran berhasil! Silakan periksa inbox email kamu untuk konfirmasi, lalu klik Masuk.");
        window.location.href = "/login";
      }
    } catch (err: any) {
      setError(err?.message || "Terjadi kesalahan saat pendaftaran.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-4 py-12 bg-slate-50/70 font-sans">
      <div className="w-full max-w-md space-y-6">
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center space-y-3">
          <div className="w-full flex items-center justify-between">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-blue-600 transition-colors group"
            >
              <ArrowLeft className="h-3.5 w-3.5 group-hover:-translate-x-0.5 transition-transform" />
              <span>Kembali ke Beranda</span>
            </Link>
          </div>

          <Link href="/" className="inline-flex items-center gap-2.5">
            <Image
              src="/logo.svg"
              alt="UpdatePTN Logo"
              width={40}
              height={40}
              className="h-10 w-auto object-contain"
              priority
            />
            <span className="font-extrabold text-2xl tracking-tight text-slate-900">
              Update<span className="text-blue-600">PTN</span>
            </span>
          </Link>
        </div>

        {/* Register Card */}
        <Card className="border border-slate-200 shadow-lg rounded-2xl bg-white overflow-visible p-2 sm:p-4">
          <CardHeader className="space-y-1.5 text-center pb-4">
            <CardTitle className="text-2xl font-bold text-slate-900">Mulai Belajar Sekarang</CardTitle>
            <CardDescription className="text-sm text-slate-500">
              Buat akun gratis untuk akses Try Out &amp; Cek Peluang PTN
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-5 overflow-visible">
            {/* Error Banner */}
            {error && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 flex items-center gap-2.5 text-xs font-medium">
                <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
                <span>{error}</span>
              </div>
            )}

            {/* Registration Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Nama */}
              <div className="space-y-1.5">
                <Label htmlFor="fullName" className="text-xs font-bold text-slate-700">
                  Nama Lengkap <span className="text-rose-500">*</span>
                </Label>
                <div className="relative">
                  <User className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                  <Input
                    id="fullName"
                    name="fullName"
                    type="text"
                    placeholder="Contoh: Amanda Zevanya"
                    required
                    style={{ fontSize: '16px' }}
                    className="pl-10 h-12 rounded-xl border-slate-200 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-base"
                  />
                </div>
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-xs font-bold text-slate-700">
                  Email <span className="text-rose-500">*</span>
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="nama@email.com"
                    required
                    style={{ fontSize: '16px' }}
                    className="pl-10 h-12 rounded-xl border-slate-200 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-base"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-xs font-bold text-slate-700">
                  Kata Sandi (Min. 6 Karakter) <span className="text-rose-500">*</span>
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="••••••••"
                    required
                    minLength={6}
                    style={{ fontSize: '16px' }}
                    className="pl-10 h-12 rounded-xl border-slate-200 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-base"
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 font-bold text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-xs gap-2 mt-2 touch-manipulation"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Mendaftarkan Akun...</span>
                  </>
                ) : (
                  <>
                    <span>Daftar Akun Gratis</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            </form>

            {/* Divider */}
            <div className="relative my-5">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-slate-200" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-white px-3 text-slate-500 font-medium">atau daftar dengan</span>
              </div>
            </div>

            {/* Google Login */}
            <GoogleLoginButton />
          </CardContent>

          <CardFooter className="bg-slate-50 p-4 border-t border-slate-200 justify-center rounded-b-2xl">
            <p className="text-xs text-slate-500 font-medium">
              Sudah memiliki akun?{" "}
              <Link href="/login" className="text-blue-600 font-bold hover:underline">
                Masuk Sekarang
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
