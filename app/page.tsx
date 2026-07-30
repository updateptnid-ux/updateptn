"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import {
  GraduationCap,
  Sparkles,
  BarChart3,
  Video,
  Target,
  CheckCircle2,
  ArrowRight,
  Menu,
  Star,
  Check,
  ShieldCheck,
  ChevronRight,
  User,
} from "lucide-react";

export default function LandingPage() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans">
      {/* ---------------- NAVIGATION NAVBAR ---------------- */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <Image
              src="/logo.svg"
              alt="UpdatePTN Logo"
              width={36}
              height={36}
              className="h-9 w-auto object-contain transition-transform group-hover:scale-105"
              priority
            />
            <div className="flex flex-col">
              <span className="font-extrabold text-xl tracking-tight text-slate-900">
                Update<span className="text-blue-600">PTN</span>
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
            <Link
              href="/direktori-prodi"
              className="hover:text-blue-600 transition-colors font-semibold text-slate-900"
            >
              Direktori PTN
            </Link>
            <Link
              href="#fitur"
              className="hover:text-blue-600 transition-colors"
            >
              Fitur Unggulan
            </Link>
            <Link
              href="#cek-peluang"
              className="hover:text-blue-600 transition-colors flex items-center gap-1.5"
            >
              <span>Cek Peluang</span>
              <Badge variant="secondary" className="text-[10px] bg-blue-50 text-blue-600 border-blue-200 font-semibold">
                AI Engine
              </Badge>
            </Link>
            <Link
              href="#harga"
              className="hover:text-blue-600 transition-colors"
            >
              Paket Harga
            </Link>
            <Link
              href="#faq"
              className="hover:text-blue-600 transition-colors"
            >
              FAQ
            </Link>
          </nav>

          {/* Action CTAs */}
          <div className="hidden md:flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" className="font-semibold text-sm text-slate-700 hover:text-blue-600 hover:bg-slate-100 rounded-xl">
                Masuk
              </Button>
            </Link>
            <Link href="/register">
              <Button className="font-semibold text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-sm gap-2 px-5">
                <span>Mulai Belajar Gratis</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>

          {/* Mobile Hamburger */}
          <div className="md:hidden">
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger render={
                <Button variant="outline" size="icon" className="rounded-xl border-slate-200">
                  <Menu className="h-5 w-5 text-slate-700" />
                </Button>
              } />
              <SheetContent side="right" className="w-75 sm:w-87.5 p-6 bg-white">
                <SheetHeader>
                  <SheetTitle className="flex items-center gap-2 text-left text-slate-900">
                    <GraduationCap className="h-6 w-6 text-blue-600" />
                    <span className="font-bold">UpdatePTN</span>
                  </SheetTitle>
                </SheetHeader>
                <div className="mt-8 flex flex-col gap-4">
                  <Link
                    href="#fitur"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="text-base font-medium text-slate-700 hover:text-blue-600 py-1"
                  >
                    Fitur Unggulan
                  </Link>
                  <Link
                    href="#cek-peluang"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="text-base font-medium text-slate-700 hover:text-blue-600 py-1"
                  >
                    Cek Peluang PTN
                  </Link>
                  <Link
                    href="#harga"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="text-base font-medium text-slate-700 hover:text-blue-600 py-1"
                  >
                    Paket Harga
                  </Link>
                  <Link
                    href="#faq"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="text-base font-medium text-slate-700 hover:text-blue-600 py-1"
                  >
                    FAQ
                  </Link>
                  <hr className="my-2 border-slate-200" />
                  <Link href="/login" onClick={() => setIsMobileMenuOpen(false)}>
                    <Button variant="outline" className="w-full justify-center border-slate-200 font-semibold rounded-xl">
                      Masuk
                    </Button>
                  </Link>
                  <Link href="/register" onClick={() => setIsMobileMenuOpen(false)}>
                    <Button className="w-full justify-center bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl">
                      Mulai Belajar Gratis
                    </Button>
                  </Link>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      {/* ---------------- HERO SECTION ---------------- */}
      <section className="bg-white pt-16 pb-20 md:pt-24 md:pb-28 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Hero Text Content */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <Badge variant="outline" className="px-3.5 py-1.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border-blue-200 inline-flex items-center gap-2">
                <Sparkles className="h-3.5 w-3.5 text-blue-600" />
                <span>Persiapan SNBT & UTBK 2026 Terlengkap</span>
              </Badge>

              <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.15]">
                Lulus PTN Impianmu dengan Persiapan UTBK{" "}
                <span className="text-blue-600">Terarah & Terukur</span>
              </h1>

              <p className="text-base sm:text-lg text-slate-500 max-w-2xl mx-auto lg:mx-0 font-normal leading-relaxed">
                Tingkatkan skor UTBK-mu dengan Try Out IRT Akurat, fitur rasionalisasi Cek Peluang PTN, dan Live Class Interaktif bersama Master Tutor kelulusan PTN favorit.
              </p>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                <Link href="/register" className="w-full sm:w-auto">
                  <Button size="lg" className="w-full sm:w-auto h-12 px-8 text-base font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-sm gap-2">
                    <span>Mulai Belajar Gratis</span>
                    <ArrowRight className="h-5 w-5" />
                  </Button>
                </Link>
                <Link href="/login" className="w-full sm:w-auto">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto h-12 px-8 text-base font-semibold text-slate-700 rounded-xl border-slate-200 hover:bg-slate-50 gap-2">
                    <User className="h-4 w-4 text-slate-400" />
                    <span>Masuk Akun</span>
                  </Button>
                </Link>
              </div>

              {/* Trust Badges */}
              <div className="pt-8 border-t border-slate-100 grid grid-cols-3 gap-4 text-center lg:text-left">
                <div>
                  <p className="text-2xl sm:text-3xl font-extrabold text-slate-900">94.8%</p>
                  <p className="text-xs sm:text-sm text-slate-500 font-medium">Tingkat Lulus PTN</p>
                </div>
                <div>
                  <p className="text-2xl sm:text-3xl font-extrabold text-slate-900">50.000+</p>
                  <p className="text-xs sm:text-sm text-slate-500 font-medium">Siswa Terdaftar</p>
                </div>
                <div>
                  <p className="text-2xl sm:text-3xl font-extrabold text-slate-900">100%</p>
                  <p className="text-xs sm:text-sm text-slate-500 font-medium">Sistem IRT BPPP</p>
                </div>
              </div>
            </div>

            {/* Hero Clean Preview Component Card */}
            <div className="lg:col-span-5">
              <div className="mx-auto max-w-md lg:max-w-none">
                <Card className="border border-slate-200 shadow-sm rounded-2xl overflow-hidden bg-white">
                  <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full bg-slate-300"></div>
                      <div className="h-3 w-3 rounded-full bg-slate-300"></div>
                      <div className="h-3 w-3 rounded-full bg-slate-300"></div>
                    </div>
                    <Badge variant="secondary" className="text-xs bg-emerald-50 text-emerald-700 border border-emerald-200 font-medium flex items-center gap-1">
                      <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                      Rasionalisasi IRT Aktif
                    </Badge>
                  </div>

                  <CardContent className="p-6 space-y-5">
                    {/* Student Profile Preview */}
                    <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-200">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-11 w-11 border border-slate-200">
                          <AvatarImage src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80" />
                          <AvatarFallback className="bg-blue-50 text-blue-700 font-bold">AZ</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-bold text-slate-900">Amanda Zevanya</p>
                          <p className="text-xs text-slate-500">SMA Negeri 8 Jakarta</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-xs text-slate-500 block">Rata-Rata IRT</span>
                        <span className="text-lg font-black text-blue-600">742.5</span>
                      </div>
                    </div>

                    {/* Target PTN Chance Meter */}
                    <div className="space-y-3 p-4 rounded-xl bg-blue-50/50 border border-blue-100">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Target className="h-4 w-4 text-blue-600" />
                          <span className="text-xs font-bold uppercase tracking-wider text-slate-900">Target Utama</span>
                        </div>
                        <Badge className="bg-emerald-600 text-white font-semibold text-[11px]">
                          Peluang 88% (Sangat Tinggi)
                        </Badge>
                      </div>
                      <div>
                        <p className="text-sm font-extrabold text-slate-900">Universitas Indonesia (UI)</p>
                        <p className="text-xs text-slate-500">S1 Teknik Informatika • Kuota 60</p>
                      </div>
                      <div className="w-full bg-blue-200/60 rounded-full h-2 overflow-hidden">
                        <div className="bg-blue-600 h-2 rounded-full w-[88%]"></div>
                      </div>
                    </div>

                    {/* Upcoming Live Class Item */}
                    <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
                          <Video className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-slate-900">Live Class Nanti Malam</p>
                          <p className="text-xs text-slate-500">Penalaran Matematika • Kak Fikri (ITB)</p>
                        </div>
                      </div>
                      <Badge variant="outline" className="text-[10px] font-semibold border-slate-300 text-slate-700 bg-white">
                        19:30 WIB
                      </Badge>
                    </div>
                  </CardContent>

                  <CardFooter className="p-4 bg-slate-50 border-t border-slate-200 text-center justify-center">
                    <p className="text-xs text-slate-500 flex items-center gap-1.5 font-medium">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                      <span>Digunakan oleh 50.000+ pejuang UTBK tahun ini</span>
                    </p>
                  </CardFooter>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------- FEATURES SECTION ---------------- */}
      <section id="fitur" className="py-20 bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          {/* Section Header */}
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <Badge variant="secondary" className="px-3.5 py-1 text-xs font-semibold text-blue-700 bg-blue-50 border-blue-200">
              Solusi Terintegrasi
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              3 Pilar Utama Rahasia Lulus SNBT
            </h2>
            <p className="text-slate-500 text-base sm:text-lg">
              UpdatePTN dirancang khusus menyesuaikan standar terbaru BPPP dengan teknologi analisis presisi tinggi.
            </p>
          </div>

          {/* 3 Feature Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <Card className="bg-white border border-slate-200 shadow-sm hover:shadow-md transition-shadow p-8 rounded-2xl flex flex-col justify-between group">
              <div className="space-y-4">
                <div className="h-12 w-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <BarChart3 className="h-6 w-6" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-slate-900">1. Try Out UTBK (IRT Scoring)</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">
                    Simulasi persis sistem asli BPPP dengan pembobotan Item Response Theory (IRT).
                  </p>
                </div>

                <ul className="space-y-2.5 text-sm text-slate-600 pt-2">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
                    <span>Timer & navigasi subtest akurat sesuai hari H.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
                    <span>Analisis kelemahan per subtes (TPS & Literasi).</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
                    <span>Pembahasan teks + video solusi langkah demi langkah.</span>
                  </li>
                </ul>
              </div>

              <div className="pt-6">
                <Link href="/register">
                  <Button variant="ghost" className="p-0 h-auto font-bold text-blue-600 hover:text-blue-700 inline-flex items-center gap-1.5">
                    <span>Pelajari Try Out</span>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </Card>

            {/* Feature 2 */}
            <Card id="cek-peluang" className="bg-white border border-slate-200 shadow-sm hover:shadow-md transition-shadow p-8 rounded-2xl flex flex-col justify-between group">
              <div className="space-y-4">
                <div className="h-12 w-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Target className="h-6 w-6" />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold text-slate-900">2. Cek Peluang PTN</h3>
                    <Badge variant="outline" className="text-[10px] border-blue-200 text-blue-700 bg-blue-50 font-semibold">
                      Rasionalisasi
                    </Badge>
                  </div>
                  <p className="text-sm text-slate-500 leading-relaxed">
                    Algoritma prediksi berbasis historis ketetatan dan nilai siswa nasional.
                  </p>
                </div>

                <ul className="space-y-2.5 text-sm text-slate-600 pt-2">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
                    <span>Rasionalisasi pilihan 1 & pilihan 2 PTN.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
                    <span>Rekomendasi jurusan alternatif aman sesuai minat.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
                    <span>Matriks keketatan kuota & statistik peserta.</span>
                  </li>
                </ul>
              </div>

              <div className="pt-6">
                <Link href="/register">
                  <Button variant="ghost" className="p-0 h-auto font-bold text-blue-600 hover:text-blue-700 inline-flex items-center gap-1.5">
                    <span>Coba Fitur Rasionalisasi</span>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </Card>

            {/* Feature 3 */}
            <Card className="bg-white border border-slate-200 shadow-sm hover:shadow-md transition-shadow p-8 rounded-2xl flex flex-col justify-between group">
              <div className="space-y-4">
                <div className="h-12 w-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Video className="h-6 w-6" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-slate-900">3. Live Class Interaktif</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">
                    Belajar konsep & trik cepat bedah soal bersama Master Tutor berpengalaman.
                  </p>
                </div>

                <ul className="space-y-2.5 text-sm text-slate-600 pt-2">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
                    <span>Tutor lulusan PTN Ternama (UI, ITB, UGM).</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
                    <span>Tanya jawab langsung saat sesi live streaming.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
                    <span>Modul PDF ringkasan & rekaman video tanpa batas.</span>
                  </li>
                </ul>
              </div>

              <div className="pt-6">
                <Link href="/register">
                  <Button variant="ghost" className="p-0 h-auto font-bold text-blue-600 hover:text-blue-700 inline-flex items-center gap-1.5">
                    <span>Jadwal Live Class</span>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* ---------------- PRICING SECTION (MODULAR TABS) ---------------- */}
      <section id="harga" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          {/* Header */}
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <Badge variant="secondary" className="px-3.5 py-1 text-xs font-semibold text-blue-700 bg-blue-50 border-blue-200">
              Paket Fleksibel
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Investasi Terjangkau untuk Masa Depan PTN-mu
            </h2>
            <p className="text-slate-500 text-base sm:text-lg">
              Pilih paket satuan sesuai kebutuhanmu (A La Carte) atau ambil paket hemat <strong className="text-slate-900">All Access</strong> untuk fasilitas paling lengkap.
            </p>
          </div>

          {/* Modular Tabs Component */}
          <Tabs defaultValue="all-access" className="w-full max-w-5xl mx-auto">
            <div className="flex justify-center mb-10">
              <TabsList className="grid grid-cols-2 md:grid-cols-4 p-1.5 bg-slate-100 rounded-xl h-auto border border-slate-200">
                <TabsTrigger value="tryout" className="py-2.5 px-4 font-semibold text-sm rounded-lg data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm">
                  Try Out
                </TabsTrigger>
                <TabsTrigger value="peluang" className="py-2.5 px-4 font-semibold text-sm rounded-lg data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm">
                  Cek Peluang
                </TabsTrigger>
                <TabsTrigger value="liveclass" className="py-2.5 px-4 font-semibold text-sm rounded-lg data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm">
                  Live Class
                </TabsTrigger>
                <TabsTrigger value="all-access" className="py-2.5 px-4 font-semibold text-sm rounded-lg data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-sm">
                  All Access ⭐
                </TabsTrigger>
              </TabsList>
            </div>

            {/* TAB CONTENT 1: TRY OUT */}
            <TabsContent value="tryout" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Paket 1x */}
                <Card className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm flex flex-col justify-between">
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">Paket 1x Try Out</h3>
                      <p className="text-xs text-slate-500">Uji coba 1 kali evaluasi IRT</p>
                    </div>
                    <div>
                      <span className="text-3xl font-black text-slate-900">Rp 49.000</span>
                      <span className="text-xs text-slate-500 ml-1">/sekali tes</span>
                    </div>
                    <ul className="space-y-2 text-sm text-slate-600 pt-2">
                      <li className="flex items-center gap-2"><Check className="h-4 w-4 text-blue-600" /><span>1x Token Try Out UTBK IRT</span></li>
                      <li className="flex items-center gap-2"><Check className="h-4 w-4 text-blue-600" /><span>Analisis Pembobotan IRT</span></li>
                      <li className="flex items-center gap-2"><Check className="h-4 w-4 text-blue-600" /><span>Pembahasan Soal Teks PDF</span></li>
                    </ul>
                  </div>
                  <div className="pt-6">
                    <Link href="/register" className="w-full">
                      <Button variant="outline" className="w-full font-semibold border-slate-200 hover:bg-slate-50 rounded-xl">Pilih Paket</Button>
                    </Link>
                  </div>
                </Card>

                {/* Paket 4x */}
                <Card className="bg-white border-2 border-blue-600 p-6 rounded-2xl shadow-sm relative flex flex-col justify-between">
                  <Badge className="absolute -top-3 right-6 bg-blue-600 text-white text-[10px] font-bold">Paling Populer</Badge>
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">Paket 4x Try Out</h3>
                      <p className="text-xs text-slate-500">Evaluasi rutin bulanan</p>
                    </div>
                    <div>
                      <span className="text-3xl font-black text-slate-900">Rp 169.000</span>
                      <span className="text-xs text-slate-500 ml-1">/4x tes</span>
                    </div>
                    <ul className="space-y-2 text-sm text-slate-600 pt-2">
                      <li className="flex items-center gap-2"><Check className="h-4 w-4 text-blue-600" /><span>4x Token Try Out UTBK IRT</span></li>
                      <li className="flex items-center gap-2"><Check className="h-4 w-4 text-blue-600" /><span>Grafik Perkembangan Skor</span></li>
                      <li className="flex items-center gap-2"><Check className="h-4 w-4 text-blue-600" /><span>Video Pembahasan Master Tutor</span></li>
                      <li className="flex items-center gap-2"><Check className="h-4 w-4 text-blue-600" /><span>Ranking Nasional Real-time</span></li>
                    </ul>
                  </div>
                  <div className="pt-6">
                    <Link href="/register" className="w-full">
                      <Button className="w-full font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-xl">Pilih Paket</Button>
                    </Link>
                  </div>
                </Card>

                {/* Unlimited Try Out */}
                <Card className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm flex flex-col justify-between">
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">Unlimited Try Out</h3>
                      <p className="text-xs text-slate-500">Akses bebas sepanjang musim</p>
                    </div>
                    <div>
                      <span className="text-3xl font-black text-slate-900">Rp 299.000</span>
                      <span className="text-xs text-slate-500 ml-1">/sampai UTBK</span>
                    </div>
                    <ul className="space-y-2 text-sm text-slate-600 pt-2">
                      <li className="flex items-center gap-2"><Check className="h-4 w-4 text-blue-600" /><span>Bebas Ikut Semua TO Seri SNBT</span></li>
                      <li className="flex items-center gap-2"><Check className="h-4 w-4 text-blue-600" /><span>Bank Soal Latihan Mandiri</span></li>
                      <li className="flex items-center gap-2"><Check className="h-4 w-4 text-blue-600" /><span>Fitur Statistik Komparasi Rekan</span></li>
                    </ul>
                  </div>
                  <div className="pt-6">
                    <Link href="/register" className="w-full">
                      <Button variant="outline" className="w-full font-semibold border-slate-200 hover:bg-slate-50 rounded-xl">Pilih Paket</Button>
                    </Link>
                  </div>
                </Card>
              </div>
            </TabsContent>

            {/* TAB CONTENT 2: CEK PELUANG */}
            <TabsContent value="peluang" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
                <Card className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm flex flex-col justify-between">
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">1 Bulan Akses</h3>
                      <p className="text-xs text-slate-500">Pass rasionalisasi 30 hari</p>
                    </div>
                    <div>
                      <span className="text-3xl font-black text-slate-900">Rp 69.000</span>
                      <span className="text-xs text-slate-500 ml-1">/bulan</span>
                    </div>
                    <ul className="space-y-2 text-sm text-slate-600 pt-2">
                      <li className="flex items-center gap-2"><Check className="h-4 w-4 text-blue-600" /><span>Unlimited Cek Rasionalisasi PTN</span></li>
                      <li className="flex items-center gap-2"><Check className="h-4 w-4 text-blue-600" /><span>Rekomendasi Jurusan Cadangan</span></li>
                      <li className="flex items-center gap-2"><Check className="h-4 w-4 text-blue-600" /><span>Data Daya Tampung & Keketatan</span></li>
                    </ul>
                  </div>
                  <div className="pt-6">
                    <Link href="/register" className="w-full">
                      <Button variant="outline" className="w-full font-semibold border-slate-200 hover:bg-slate-50 rounded-xl">Beli Pass 1 Bulan</Button>
                    </Link>
                  </div>
                </Card>

                <Card className="bg-white border-2 border-blue-600 p-6 rounded-2xl shadow-sm flex flex-col justify-between">
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">3 Bulan Pass (Season)</h3>
                      <p className="text-xs text-slate-500">Dampingi hingga pendaftaran SNBT</p>
                    </div>
                    <div>
                      <span className="text-3xl font-black text-slate-900">Rp 149.000</span>
                      <span className="text-xs text-slate-500 ml-1">/3 bulan</span>
                    </div>
                    <ul className="space-y-2 text-sm text-slate-600 pt-2">
                      <li className="flex items-center gap-2"><Check className="h-4 w-4 text-blue-600" /><span>Semua Fitur Pass 1 Bulan</span></li>
                      <li className="flex items-center gap-2"><Check className="h-4 w-4 text-blue-600" /><span>Updates Tren Keketatan Real-time</span></li>
                      <li className="flex items-center gap-2"><Check className="h-4 w-4 text-blue-600" /><span>Hemat Rp 58.000 dibanding bulanan</span></li>
                    </ul>
                  </div>
                  <div className="pt-6">
                    <Link href="/register" className="w-full">
                      <Button className="w-full font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-xl">Beli Pass 3 Bulan</Button>
                    </Link>
                  </div>
                </Card>
              </div>
            </TabsContent>

            {/* TAB CONTENT 3: LIVE CLASS */}
            <TabsContent value="liveclass" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
                <Card className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm flex flex-col justify-between">
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">Basic Live Class</h3>
                      <p className="text-xs text-slate-500">Intensif 8 sesi per bulan</p>
                    </div>
                    <div>
                      <span className="text-3xl font-black text-slate-900">Rp 149.000</span>
                      <span className="text-xs text-slate-500 ml-1">/bulan</span>
                    </div>
                    <ul className="space-y-2 text-sm text-slate-600 pt-2">
                      <li className="flex items-center gap-2"><Check className="h-4 w-4 text-blue-600" /><span>8x Live Interactive Sessions</span></li>
                      <li className="flex items-center gap-2"><Check className="h-4 w-4 text-blue-600" /><span>Modul PDF Catatan Master Tutor</span></li>
                      <li className="flex items-center gap-2"><Check className="h-4 w-4 text-blue-600" /><span>Sesi Tanya Jawab Chat Live</span></li>
                    </ul>
                  </div>
                  <div className="pt-6">
                    <Link href="/register" className="w-full">
                      <Button variant="outline" className="w-full font-semibold border-slate-200 hover:bg-slate-50 rounded-xl">Pilih Live Basic</Button>
                    </Link>
                  </div>
                </Card>

                <Card className="bg-white border-2 border-blue-600 p-6 rounded-2xl shadow-sm flex flex-col justify-between">
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">Premium Live Class</h3>
                      <p className="text-xs text-slate-500">Intensif 20 sesi + Rekaman 24/7</p>
                    </div>
                    <div>
                      <span className="text-3xl font-black text-slate-900">Rp 249.000</span>
                      <span className="text-xs text-slate-500 ml-1">/bulan</span>
                    </div>
                    <ul className="space-y-2 text-sm text-slate-600 pt-2">
                      <li className="flex items-center gap-2"><Check className="h-4 w-4 text-blue-600" /><span>20x Live Interactive Sessions</span></li>
                      <li className="flex items-center gap-2"><Check className="h-4 w-4 text-blue-600" /><span>Akses Rekaman Video (Replay 24/7)</span></li>
                      <li className="flex items-center gap-2"><Check className="h-4 w-4 text-blue-600" /><span>Grup Diskusi VIP Bersama Tutor</span></li>
                    </ul>
                  </div>
                  <div className="pt-6">
                    <Link href="/register" className="w-full">
                      <Button className="w-full font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-xl">Pilih Live Premium</Button>
                    </Link>
                  </div>
                </Card>
              </div>
            </TabsContent>

            {/* TAB CONTENT 4: ALL ACCESS ⭐ (REDESIGNED WITH SCALE & RING) */}
            <TabsContent value="all-access">
              <div className="max-w-2xl mx-auto pt-4 pb-4">
                <Card className="bg-blue-50/60 border-2 border-blue-600 ring-2 ring-blue-600/30 shadow-lg p-8 sm:p-10 rounded-3xl transform scale-105 transition-transform duration-300 space-y-6">
                  {/* Badge */}
                  <div className="flex items-center justify-between">
                    <Badge className="bg-blue-600 text-white font-bold px-3.5 py-1 text-xs gap-1.5 rounded-full">
                      <Star className="h-3.5 w-3.5 fill-current" />
                      <span>PALING DIMINATI (BEST VALUE)</span>
                    </Badge>
                    <span className="text-xs font-semibold text-emerald-700 bg-emerald-100/80 px-3 py-1 rounded-full border border-emerald-200">
                      Hemat 55%
                    </span>
                  </div>

                  {/* Title & Price */}
                  <div className="space-y-2 border-b border-blue-200/80 pb-6">
                    <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                      Paket Bundling All Access
                    </h3>
                    <p className="text-slate-600 text-sm">
                      Semua fasilitas bertempur SNBT dalam satu paket tanpa biaya tersembunyi.
                    </p>
                    <div className="pt-4 flex items-baseline gap-3">
                      <span className="text-4xl sm:text-5xl font-black text-blue-600">Rp 199.000</span>
                      <span className="text-sm font-semibold text-slate-400 line-through">Rp 450.000</span>
                      <span className="text-xs text-slate-500 font-medium">/bulan</span>
                    </div>
                  </div>

                  {/* Feature List */}
                  <div className="space-y-3.5">
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-700">
                      Sudah Termasuk Semua Fitur Premium:
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                      <div className="flex items-center gap-2.5">
                        <div className="h-5 w-5 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0">
                          <Check className="h-3.5 w-3.5" />
                        </div>
                        <span className="font-semibold text-slate-800">Unlimited Try Out IRT UTBK</span>
                      </div>
                      <div className="flex items-center gap-2.5">
                        <div className="h-5 w-5 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0">
                          <Check className="h-3.5 w-3.5" />
                        </div>
                        <span className="font-semibold text-slate-800">Unlimited Cek Peluang PTN</span>
                      </div>
                      <div className="flex items-center gap-2.5">
                        <div className="h-5 w-5 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0">
                          <Check className="h-3.5 w-3.5" />
                        </div>
                        <span className="font-semibold text-slate-800">Full Sesi Live Class & Replay</span>
                      </div>
                      <div className="flex items-center gap-2.5">
                        <div className="h-5 w-5 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0">
                          <Check className="h-3.5 w-3.5" />
                        </div>
                        <span className="font-semibold text-slate-800">Bank Soal & PDF Modul Lengkap</span>
                      </div>
                      <div className="flex items-center gap-2.5">
                        <div className="h-5 w-5 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0">
                          <Check className="h-3.5 w-3.5" />
                        </div>
                        <span className="font-semibold text-slate-800">Grup VIP Telegram Diskusi Tutor</span>
                      </div>
                      <div className="flex items-center gap-2.5">
                        <div className="h-5 w-5 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0">
                          <Check className="h-3.5 w-3.5" />
                        </div>
                        <span className="font-semibold text-slate-800">Konsultasi Jurusan Prioritas</span>
                      </div>
                    </div>
                  </div>

                  {/* Action Button */}
                  <div className="pt-4 space-y-3">
                    <Link href="/register" className="w-full">
                      <Button size="lg" className="w-full h-12 text-base font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-md gap-2">
                        <span>Ambil Paket All Access Sekarang</span>
                        <ArrowRight className="h-5 w-5" />
                      </Button>
                    </Link>
                    <p className="text-center text-xs text-slate-500 flex items-center justify-center gap-2">
                      <ShieldCheck className="h-4 w-4 text-emerald-600" />
                      <span>Pembayaran aman instan via Midtrans (QRIS, Bank, E-Wallet)</span>
                    </p>
                  </div>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* ---------------- FAQ SECTION ---------------- */}
      <section id="faq" className="py-20 bg-slate-50 border-t border-slate-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          {/* Header */}
          <div className="text-center space-y-3">
            <Badge variant="secondary" className="px-3.5 py-1 text-xs font-semibold text-blue-700 bg-blue-50 border-blue-200">
              Pertanyaan Umum
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Pertanyaan yang Sering Diajukan
            </h2>
            <p className="text-slate-500 text-base">
              Punya pertanyaan seputar UpdatePTN? Temukan jawabannya di bawah ini.
            </p>
          </div>

          {/* Accordion */}
          <Accordion className="w-full space-y-4">
            <AccordionItem value="item-1" className="border border-slate-200 rounded-xl bg-white px-6 py-1 shadow-sm">
              <AccordionTrigger className="text-base font-bold text-slate-900 text-left hover:no-underline hover:text-blue-600">
                Apakah sistem penilaian Try Out UpdatePTN sudah menggunakan IRT?
              </AccordionTrigger>
              <AccordionContent className="text-slate-600 text-sm leading-relaxed">
                Ya! Sistem penilaian Try Out di UpdatePTN 100% mengadopsi algoritma <strong>Item Response Theory (IRT)</strong> persis seperti yang digunakan oleh BPPP Kemendikbudristek. Bobot nilai setiap soal dihitung berdasarkan tingkat kesulitan soal yang dijawab oleh seluruh peserta nasional.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-2" className="border border-slate-200 rounded-xl bg-white px-6 py-1 shadow-sm">
              <AccordionTrigger className="text-base font-bold text-slate-900 text-left hover:no-underline hover:text-blue-600">
                Bagaimana cara kerja fitur Cek Peluang PTN?
              </AccordionTrigger>
              <AccordionContent className="text-slate-600 text-sm leading-relaxed">
                Fitur Cek Peluang PTN membandingkan perolehan skor IRT Try Out kamu dengan database histori ketetatan jurusan, daya tampung (kuota) resmi PTN, serta pergerakan persaingan siswa secara real-time untuk memberikan estimasi persentase kelulusan yang akurat.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-3" className="border border-slate-200 rounded-xl bg-white px-6 py-1 shadow-sm">
              <AccordionTrigger className="text-base font-bold text-slate-900 text-left hover:no-underline hover:text-blue-600">
                Apakah sesi Live Class bisa ditonton ulang jika saya berhalangan hadir?
              </AccordionTrigger>
              <AccordionContent className="text-slate-600 text-sm leading-relaxed">
                Tentu saja! Bagi pengguna paket Live Class Premium atau All Access, semua siaran langsung akan otomatis tersimpan sebagai rekaman video berkualitas HD yang dapat diakses 24/7 lengkap dengan modul ringkasan PDF.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-4" className="border border-slate-200 rounded-xl bg-white px-6 py-1 shadow-sm">
              <AccordionTrigger className="text-base font-bold text-slate-900 text-left hover:no-underline hover:text-blue-600">
                Metode pembayaran apa saja yang didukung?
              </AccordionTrigger>
              <AccordionContent className="text-slate-600 text-sm leading-relaxed">
                Kami terintegrasi penuh dengan gateway pembayaran <strong>Midtrans</strong>. Kamu bisa membayar dengan mudah menggunakan QRIS (GoPay, OVO, ShopeePay, Dana, LinkAja), Transfer Virtual Account Bank (BCA, Mandiri, BNI, BRI), maupun gerai minimarket (Indomaret / Alfamart).
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-5" className="border border-slate-200 rounded-xl bg-white px-6 py-1 shadow-sm">
              <AccordionTrigger className="text-base font-bold text-slate-900 text-left hover:no-underline hover:text-blue-600">
                Apakah saya bisa mencoba layanan secara gratis terlebih dahulu?
              </AccordionTrigger>
              <AccordionContent className="text-slate-600 text-sm leading-relaxed">
                Bisa! Setelah melakukan pendaftaran akun gratis, kamu akan secara otomatis mendapatkan akses ke 1x Try Out Starter dan fitur sampel Cek Peluang PTN tanpa dipungut biaya apapun.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </section>

      {/* ---------------- FOOTER ---------------- */}
      <footer className="mt-auto bg-white border-t border-slate-200 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            {/* Column 1: Brand */}
            <div className="space-y-4 md:col-span-1">
              <Link href="/" className="flex items-center gap-2.5">
                <Image
                  src="/logo.svg"
                  alt="UpdatePTN Logo"
                  width={36}
                  height={36}
                  className="h-9 w-auto object-contain"
                />
                <span className="font-extrabold text-lg tracking-tight text-slate-900">
                  Update<span className="text-blue-600">PTN</span>
                </span>
              </Link>
              <p className="text-xs text-slate-500 leading-relaxed">
                Platform ekosistem bimbel & persiapan UTBK SNBT terdepan di Indonesia. Membantu puluhan ribu siswa meraih impian kuliah di PTN favorit.
              </p>
            </div>

            {/* Column 2: Produk */}
            <div className="space-y-3">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-900">Produk</p>
              <ul className="space-y-2 text-xs text-slate-600">
                <li><Link href="#fitur" className="hover:text-blue-600 transition-colors">Try Out UTBK IRT</Link></li>
                <li><Link href="#cek-peluang" className="hover:text-blue-600 transition-colors">Cek Peluang PTN</Link></li>
                <li><Link href="#fitur" className="hover:text-blue-600 transition-colors">Live Class Interaktif</Link></li>
                <li><Link href="#harga" className="hover:text-blue-600 transition-colors">Paket All Access</Link></li>
              </ul>
            </div>

            {/* Column 3: Perusahaan */}
            <div className="space-y-3">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-900">Informasi</p>
              <ul className="space-y-2 text-xs text-slate-600">
                <li><Link href="#faq" className="hover:text-blue-600 transition-colors">Tentang Kami</Link></li>
                <li><Link href="#faq" className="hover:text-blue-600 transition-colors">Pusat Bantuan (FAQ)</Link></li>
                <li><Link href="#faq" className="hover:text-blue-600 transition-colors">Kebijakan Privasi</Link></li>
                <li><Link href="#faq" className="hover:text-blue-600 transition-colors">Syarat & Ketentuan</Link></li>
              </ul>
            </div>

            {/* Column 4: Kontak & Midtrans */}
            <div className="space-y-3">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-900">Metode Pembayaran</p>
              <p className="text-xs text-slate-500">
                Didukung oleh Midtrans Payment Gateway
              </p>
              <div className="flex flex-wrap gap-2 pt-1">
                <Badge variant="outline" className="text-[10px] bg-slate-50 border-slate-200 text-slate-700">QRIS</Badge>
                <Badge variant="outline" className="text-[10px] bg-slate-50 border-slate-200 text-slate-700">GoPay</Badge>
                <Badge variant="outline" className="text-[10px] bg-slate-50 border-slate-200 text-slate-700">BCA VA</Badge>
                <Badge variant="outline" className="text-[10px] bg-slate-50 border-slate-200 text-slate-700">Mandiri</Badge>
                <Badge variant="outline" className="text-[10px] bg-slate-50 border-slate-200 text-slate-700">Indomaret</Badge>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-200 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
            <p>© 2026 UpdatePTN. Hak Cipta Dilindungi Undang-Undang.</p>
            <p>Made with ❤️ for Indonesia's Future PTN Students</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
