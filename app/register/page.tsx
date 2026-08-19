"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  ArrowLeft,
  ArrowRight,
  Lock,
  Mail,
  User,
  Target,
  AlertCircle,
  Loader2,
  School,
  BookOpen,
  Building2,
  X,
  Search,
} from "lucide-react";
import { registerAction } from "@/actions/auth";
import { createClient } from "@/lib/supabase/client";

// ─── University logo helpers ────────────────────────────────────────────────
const UNIV_DOMAINS: Record<string, string> = {
  "UNIVERSITAS INDONESIA": "ui.ac.id",
  "INSTITUT TEKNOLOGI BANDUNG": "itb.ac.id",
  "UNIVERSITAS GADJAH MADA": "ugm.ac.id",
  "UNIVERSITAS BRAWIJAYA": "ub.ac.id",
  "UNIVERSITAS PADJADJARAN": "unpad.ac.id",
  "UNIVERSITAS DIPONEGORO": "undip.ac.id",
  "UNIVERSITAS AIRLANGGA": "unair.ac.id",
  "INSTITUT TEKNOLOGI SEPULUH NOPEMBER": "its.ac.id",
  "INSTITUT PERTANIAN BOGOR": "ipb.ac.id",
  "UNIVERSITAS SEBELAS MARET": "uns.ac.id",
  "UNIVERSITAS HASANUDDIN": "unhas.ac.id",
  "UNIVERSITAS SUMATERA UTARA": "usu.ac.id",
  "UNIVERSITAS ANDALAS": "unand.ac.id",
  "UNIVERSITAS NEGERI YOGYAKARTA": "uny.ac.id",
  "UNIVERSITAS NEGERI JAKARTA": "unj.ac.id",
  "UNIVERSITAS UDAYANA": "unud.ac.id",
};

const getUnivDomain = (name?: string) => {
  if (!name) return null;
  const n = name.toUpperCase().trim();
  if (UNIV_DOMAINS[n]) return UNIV_DOMAINS[n];
  for (const [key, domain] of Object.entries(UNIV_DOMAINS)) {
    if (n.includes(key) || key.includes(n)) return domain;
  }
  return null;
};

const getInitials = (name?: string) => {
  if (!name) return "UN";
  const clean = name.toUpperCase().replace("UNIVERSITAS ", "").replace("INSTITUT ", "").trim();
  const words = clean.split(" ");
  if (words.length >= 2) return (words[0][0] + words[1][0]).toUpperCase();
  return clean.substring(0, 2).toUpperCase();
};

interface ProdiSuggestion {
  id: string | number;
  univ: string;
  prodi: string;
  jenjang?: string;
  kelompok?: string;
}

export default function RegisterPage() {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Prodi Impian Autocomplete
  const [prodiQuery, setProdiQuery] = useState("");
  const [prodiSuggestions, setProdiSuggestions] = useState<ProdiSuggestion[]>([]);
  const [selectedProdi, setSelectedProdi] = useState<ProdiSuggestion | null>(null);
  const [showProdiDropdown, setShowProdiDropdown] = useState(false);
  const [prodiLoading, setProdiLoading] = useState(false);

  // Hidden fields synced from selected prodi
  const [targetUnivValue, setTargetUnivValue] = useState("");
  const [targetProdiValue, setTargetProdiValue] = useState("");

  const prodiContainerRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (prodiContainerRef.current && !prodiContainerRef.current.contains(event.target as Node)) {
        setShowProdiDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Autocomplete search
  useEffect(() => {
    if (selectedProdi) {
      setShowProdiDropdown(false);
      return;
    }
    if (prodiQuery.trim().length < 2) {
      setProdiSuggestions([]);
      setShowProdiDropdown(false);
      return;
    }

    const timer = setTimeout(async () => {
      setProdiLoading(true);
      try {
        const supabase = createClient();
        const { data, error } = await supabase.rpc("search_kampus_pintar", {
          keyword: prodiQuery.trim(),
        });
        if (!error && data && data.length > 0) {
          setProdiSuggestions((data as ProdiSuggestion[]).slice(0, 8));
          setShowProdiDropdown(true);
        } else {
          setProdiSuggestions([]);
          setShowProdiDropdown(false);
        }
      } catch {
        // silent
      } finally {
        setProdiLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [prodiQuery, selectedProdi]);

  const handleSelectProdi = (item: ProdiSuggestion) => {
    setSelectedProdi(item);
    setProdiQuery(`${item.prodi} — ${item.univ}`);
    setTargetUnivValue(item.univ);
    setTargetProdiValue(item.prodi);
    setShowProdiDropdown(false);
  };

  const handleClearProdi = () => {
    setSelectedProdi(null);
    setProdiQuery("");
    setTargetUnivValue("");
    setTargetProdiValue("");
    setProdiSuggestions([]);
    setShowProdiDropdown(false);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const fullName = (formData.get("fullName") as string)?.trim();
    const email = (formData.get("email") as string)?.trim();
    const password = formData.get("password") as string;
    const asalSekolah = (formData.get("asalSekolah") as string)?.trim();

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
            asal_sekolah: asalSekolah || "",
            target_univ: targetUnivValue || "",
            target_prodi: targetProdiValue || "",
            target_ptn: targetUnivValue || "",
          },
        },
      });

      if (signUpErr) {
        setError(signUpErr.message);
        setIsLoading(false);
        return;
      }

      // Check if session exists or if email confirmation is required
      if (data.session) {
        window.location.href = "/dashboard/student";
      } else {
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
              Buat akun gratis untuk akses 1x Try Out IRT &amp; Cek Peluang PTN
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
            <form onSubmit={handleSubmit} className="space-y-5">

              {/* Data Diri */}
              <div className="space-y-1">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
                  <User className="h-3 w-3" /> Data Diri
                </p>
                <div className="space-y-3 bg-slate-50/60 border border-slate-100 rounded-xl p-3">
                  {/* Nama */}
                  <div className="space-y-1.5">
                    <Label htmlFor="fullName" className="text-xs font-bold text-slate-700">Nama Lengkap <span className="text-rose-500">*</span></Label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                      <Input
                        id="fullName"
                        name="fullName"
                        type="text"
                        placeholder="Contoh: Amanda Zevanya"
                        required
                        className="pl-10 h-11 rounded-xl border-slate-200 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                      />
                    </div>
                  </div>

                  {/* Asal Sekolah */}
                  <div className="space-y-1.5">
                    <Label htmlFor="asalSekolah" className="text-xs font-bold text-slate-700">Asal Sekolah (SMA/SMK/MA)</Label>
                    <div className="relative">
                      <School className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                      <Input
                        id="asalSekolah"
                        name="asalSekolah"
                        type="text"
                        placeholder="Misal: SMAN 1 Jakarta, MAN 2 Surabaya"
                        className="pl-10 h-11 rounded-xl border-slate-200 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Target PTN & Prodi */}
              <div className="space-y-1">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
                  <Target className="h-3 w-3" /> Target PTN &amp; Prodi Impian
                </p>
                <div className="space-y-3 bg-blue-50/40 border border-blue-100 rounded-xl p-3">

                  {/* Prodi Impian — Autocomplete */}
                  <div className="space-y-1.5" ref={prodiContainerRef}>
                    <Label htmlFor="prodiQuery" className="text-xs font-bold text-slate-700">
                      Prodi &amp; Universitas Impian
                    </Label>
                    <div className="relative">
                      <div className="relative bg-white rounded-xl border border-slate-200 flex items-center shadow-xs focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20 transition-all">
                        {selectedProdi ? (
                          <BookOpen className="absolute left-3.5 h-4 w-4 text-blue-600 shrink-0" />
                        ) : (
                          <Search className="absolute left-3.5 h-4 w-4 text-slate-400 shrink-0" />
                        )}
                        <input
                          id="prodiQuery"
                          type="text"
                          value={prodiQuery}
                          onChange={(e) => {
                            setProdiQuery(e.target.value);
                            if (selectedProdi) {
                              setSelectedProdi(null);
                              setTargetUnivValue("");
                              setTargetProdiValue("");
                            }
                          }}
                          onFocus={() => {
                            if (prodiSuggestions.length > 0 && !selectedProdi) setShowProdiDropdown(true);
                          }}
                          placeholder="Ketik nama jurusan atau kampus…"
                          className="w-full pl-10 pr-9 h-11 bg-transparent border-none outline-hidden text-sm font-medium text-slate-900 placeholder:text-slate-400"
                        />
                        {prodiLoading && (
                          <Loader2 className="absolute right-3.5 h-4 w-4 animate-spin text-blue-600" />
                        )}
                        {prodiQuery && !prodiLoading && (
                          <button
                            type="button"
                            onClick={handleClearProdi}
                            className="absolute right-3.5 text-slate-400 hover:text-slate-600 transition-colors p-1"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>

                      {/* Dropdown */}
                      {showProdiDropdown && !selectedProdi && (
                        <div className="absolute top-full left-0 right-0 mt-1.5 bg-white border border-slate-200 rounded-xl shadow-xl z-50 max-h-52 overflow-y-auto divide-y divide-slate-100 animate-in fade-in zoom-in-95">
                          {prodiSuggestions.length === 0 ? (
                            <div className="p-4 text-center text-xs text-slate-500">
                              Tidak ditemukan. Coba kata kunci lain.
                            </div>
                          ) : (
                            prodiSuggestions.map((item) => {
                              const domain = getUnivDomain(item.univ);
                              return (
                                <button
                                  key={item.id}
                                  type="button"
                                  onClick={() => handleSelectProdi(item)}
                                  className="w-full text-left px-3 py-2.5 hover:bg-blue-50 transition-colors flex items-center gap-3 group"
                                >
                                  <Avatar className="h-8 w-8 rounded-lg border border-slate-100 shrink-0">
                                    <AvatarImage src={domain ? `https://logo.clearbit.com/${domain}` : undefined} alt={item.univ} />
                                    <AvatarFallback className="bg-blue-600 text-white font-bold text-[10px]">
                                      {getInitials(item.univ)}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div className="overflow-hidden">
                                    <p className="text-xs font-extrabold text-slate-900 group-hover:text-blue-600 transition-colors truncate">
                                      {item.prodi}
                                    </p>
                                    <p className="text-[11px] text-slate-500 font-medium truncate">{item.univ}</p>
                                  </div>
                                  <Badge variant="outline" className="ml-auto shrink-0 text-[10px] font-bold px-1.5 py-0 bg-slate-50 text-slate-600 border-slate-200">
                                    {item.jenjang || "S1"}
                                  </Badge>
                                </button>
                              );
                            })
                          )}
                        </div>
                      )}
                    </div>

                    {selectedProdi && (
                      <p className="text-[11px] text-blue-600 font-semibold flex items-center gap-1 pl-1">
                        ✓ Target dipilih: <span className="font-bold">{selectedProdi.prodi}</span> di {selectedProdi.univ}
                      </p>
                    )}
                  </div>

                  {/* Hidden fields yang dikirim ke server */}
                  <input type="hidden" name="targetUniv" value={targetUnivValue} />
                  <input type="hidden" name="targetProdi" value={targetProdiValue} />
                </div>
              </div>

              {/* Data Akun */}
              <div className="space-y-1">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
                  <Lock className="h-3 w-3" /> Data Akun
                </p>
                <div className="space-y-3 bg-slate-50/60 border border-slate-100 rounded-xl p-3">
                  {/* Email */}
                  <div className="space-y-1.5">
                    <Label htmlFor="email" className="text-xs font-bold text-slate-700">Email <span className="text-rose-500">*</span></Label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="nama@email.com"
                        required
                        className="pl-10 h-11 rounded-xl border-slate-200 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                      />
                    </div>
                  </div>

                  {/* Password */}
                  <div className="space-y-1.5">
                    <Label htmlFor="password" className="text-xs font-bold text-slate-700">Kata Sandi (Min. 6 Karakter) <span className="text-rose-500">*</span></Label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                      <Input
                        id="password"
                        name="password"
                        type="password"
                        placeholder="••••••••"
                        required
                        minLength={6}
                        className="pl-10 h-11 rounded-xl border-slate-200 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-11 font-bold text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-xs gap-2 mt-2"
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
