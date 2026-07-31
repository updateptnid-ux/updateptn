"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ShieldCheck,
  Mail,
  Lock,
  ArrowRight,
  AlertCircle,
  Loader2,
  LockKeyhole,
} from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!email || !password) {
      setErrorMsg("Harap masukkan email dan kata sandi admin.");
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

      // 2. Fetch role from profiles table
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .maybeSingle();

      const isAdmin =
        profile?.role === "admin" ||
        user.user_metadata?.role === "admin" ||
        user.app_metadata?.role === "admin" ||
        user.email === "admin@updateptn.id";

      // 3. Authorization Check
      if (!isAdmin) {
        await supabase.auth.signOut();
        setErrorMsg("Akses Ditolak: Akun Anda tidak memiliki hak akses Administrator HQ.");
        setIsLoading(false);
        return;
      }

      // 4. Redirect to HQ Dashboard
      router.push("/hq-core-updateptn");
      router.refresh();
    } catch (err: any) {
      setErrorMsg(err?.message || "Terjadi kesalahan sistem saat verifikasi otorisasi.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Background Radial Gradient Grid */}
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_center,rgba(37,99,235,0.15)_0,transparent_70%)]"></div>
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(#1e293b_1px,transparent_1px)] bg-size-[24px_24px] opacity-40"></div>

      <div className="w-full max-w-md space-y-8 relative z-10">
        {/* Header Branding */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center gap-3 bg-white/5 border border-white/10 px-4 py-2 rounded-2xl backdrop-blur-md">
            <Image
              src="/logo.svg"
              alt="UpdatePTN Logo"
              width={32}
              height={32}
              className="h-8 w-auto object-contain"
            />
            <span className="font-extrabold text-lg tracking-tight text-white">
              Update<span className="text-blue-500">PTN</span>
            </span>
          </div>

          <div className="space-y-1">
            <Badge variant="outline" className="bg-blue-500/10 text-blue-400 border-blue-500/30 text-xs font-bold px-3 py-1">
              <ShieldCheck className="h-3.5 w-3.5 mr-1" />
              ENTERPRISE HQ CONSOLE
            </Badge>
            <h1 className="text-2xl font-black tracking-tight text-white pt-2">
              Autentikasi HQ Administrator
            </h1>
            <p className="text-xs text-slate-400">
              Gerbang masuk terbatas khusus pengelola & manajemen sistem UpdatePTN.
            </p>
          </div>
        </div>

        {/* Login Card Form */}
        <Card className="bg-slate-900/90 border border-slate-800 backdrop-blur-xl shadow-2xl p-8 rounded-3xl space-y-6">
          {errorMsg && (
            <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-start gap-3">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span className="leading-relaxed font-semibold">{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleAdminLogin} className="space-y-5">
            {/* Email Field */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
                <span>Email Administrator</span>
                <span className="text-[10px] text-blue-400 font-medium">Domain Official Only</span>
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
                <Input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@updateptn.id"
                  className="pl-10 h-11 bg-slate-950 border-slate-800 focus:border-blue-500 text-xs text-white rounded-xl placeholder:text-slate-600"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
                <span>Kata Sandi Admin</span>
                <span className="text-[10px] text-slate-500">Encrypted</span>
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
                <Input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="pl-10 h-11 bg-slate-950 border-slate-800 focus:border-blue-500 text-xs text-white rounded-xl placeholder:text-slate-600"
                />
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm rounded-xl shadow-lg shadow-blue-600/25 transition-all gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Memverifikasi Hak Akses HQ...</span>
                </>
              ) : (
                <>
                  <span>Masuk ke Console HQ</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </form>

          <div className="pt-4 border-t border-slate-800 text-center">
            <p className="text-[11px] text-slate-500 flex items-center justify-center gap-1">
              <LockKeyhole className="h-3 w-3" />
              <span>Sesi ini dilindungi oleh Supabase Row Level Security & TLS 1.3</span>
            </p>
          </div>
        </Card>

        {/* Back to Home Link */}
        <div className="text-center">
          <Link href="/" className="text-xs text-slate-500 hover:text-slate-300 transition-colors">
            ← Kembali ke Halaman Utama UpdatePTN
          </Link>
        </div>
      </div>
    </div>
  );
}
