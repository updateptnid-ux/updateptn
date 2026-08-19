"use client";

import { useState } from "react";
import TryoutTerbaruInlineCard from "@/components/landing/tryout-terbaru-section";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { FadeIn, MotionCard, MotionButton, StaggerContainer, StaggerItem } from "@/components/ui/fade-in";
import {
  GraduationCap,
  BarChart3,
  Video,
  Target,
  CheckCircle2,
  ArrowRight,
  Menu,
  ChevronRight,
  BookOpen,
  Users,
  Award,
  ShieldCheck,
  Zap,
  HelpCircle,
  MessageSquare,
  Check,
  Star,
  Clock,
  FileText,
  Building2,
  Mail,
  Phone,
} from "lucide-react";

export default function LandingPage() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-white text-slate-900 font-sans selection:bg-blue-100 selection:text-blue-900">
      {/* ---------------- 1. PUBLIC NAVIGATION NAVBAR ---------------- */}
      <header className="sticky top-0 z-50 bg-white/85 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
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
            <span className="font-extrabold text-xl tracking-tight text-slate-900">
              Update<span className="text-blue-600">PTN</span>
            </span>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-600">
            <Link href="#fitur" className="hover:text-blue-600 transition-colors">
              Program & Fitur
            </Link>
            <Link href="#keunggulan" className="hover:text-blue-600 transition-colors">
              Keunggulan
            </Link>
            <Link href="#paket" className="hover:text-blue-600 transition-colors">
              Paket Belajar
            </Link>
            <Link href="#faq" className="hover:text-blue-600 transition-colors">
              FAQ
            </Link>
          </nav>

          {/* Action CTAs */}
          <div className="hidden md:flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" className="font-semibold text-sm text-slate-700 hover:text-blue-600 hover:bg-slate-100/80 rounded-xl">
                Masuk
              </Button>
            </Link>
            <Link href="/register">
              <MotionButton>
                <Button className="font-semibold text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-sm gap-2 px-5">
                  <span>Daftar Akun</span>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </MotionButton>
            </Link>
          </div>

          {/* Mobile Hamburger Drawer */}
          <div className="md:hidden">
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger render={
                <Button variant="outline" size="icon" className="rounded-xl border-slate-200/80 bg-white/50 backdrop-blur-xs">
                  <Menu className="h-5 w-5 text-slate-700" />
                </Button>
              } />
              <SheetContent side="right" className="w-75 sm:w-87.5 p-6 bg-white/95 backdrop-blur-xl border-l border-slate-200/80">
                <SheetHeader>
                  <SheetTitle className="flex items-center gap-2 text-left text-slate-900">
                    <Image
                      src="/logo.svg"
                      alt="UpdatePTN Logo"
                      width={32}
                      height={32}
                      className="h-8 w-auto object-contain"
                    />
                    <span className="font-extrabold text-lg">Update<span className="text-blue-600">PTN</span></span>
                  </SheetTitle>
                </SheetHeader>
                <div className="mt-8 flex flex-col gap-4">
                  <Link
                    href="#fitur"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="text-base font-semibold text-slate-800 hover:text-blue-600 py-1"
                  >
                    Program & Fitur
                  </Link>
                  <Link
                    href="#keunggulan"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="text-base font-semibold text-slate-800 hover:text-blue-600 py-1"
                  >
                    Keunggulan
                  </Link>
                  <Link
                    href="#paket"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="text-base font-semibold text-slate-800 hover:text-blue-600 py-1"
                  >
                    Paket Belajar
                  </Link>
                  <Link
                    href="#faq"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="text-base font-semibold text-slate-800 hover:text-blue-600 py-1"
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
                      Daftar Akun
                    </Button>
                  </Link>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      {/* ---------------- 2. HERO SECTION (Single CTA & Trust Metrics) ---------------- */}
      <section className="py-20 md:py-28 bg-linear-to-b from-blue-50/50 via-white to-white border-b border-slate-200/80 relative overflow-hidden">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8 relative z-10">
          <FadeIn className="space-y-6">
            <Badge variant="outline" className="px-4 py-1.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border-blue-200/80 inline-flex items-center gap-2">
              <ShieldCheck className="h-3.5 w-3.5 text-blue-600" />
              <span>Platform Persiapan UTBK & SNBT #1 di Indonesia</span>
            </Badge>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight text-slate-950 leading-[1.15] max-w-4xl mx-auto">
              Persiapan Seleksi Masuk PTN{" "}
              <span className="text-blue-600 bg-clip-text">Terarah & Terukur</span>
            </h1>

            <p className="text-base sm:text-lg md:text-xl text-slate-600 max-w-2xl mx-auto font-normal leading-relaxed">
              Platform pembelajaran terpadu dengan simulasi Try Out IRT, rasionalisasi Cek Peluang PTN, dan bimbingan interaktif untuk kelulusan SNBT.
            </p>

            {/* ONLY ONE PRIMARY ACTION BUTTON */}
            <div className="pt-2 flex justify-center">
              <Link href="/register">
                <MotionButton>
                  <Button size="lg" className="h-13 px-9 text-base font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-lg shadow-blue-500/25 gap-2.5">
                    <span>Mulai Sekarang</span>
                    <ArrowRight className="h-5 w-5" />
                  </Button>
                </MotionButton>
              </Link>
            </div>
          </FadeIn>

          {/* Try Out Terbaru — inline card */}
          <TryoutTerbaruInlineCard />

          {/* Trust Metric Bar (PTN Targets & Student Proof) */}
          <FadeIn delay={0.15} className="pt-8 border-t border-slate-200/60 max-w-4xl mx-auto space-y-4">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Dipercaya 50.000+ Siswa Pejuang UTBK Menuju PTN Favorit
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6">
              {[
                { name: "Universitas Indonesia", logo: "/logo-univ/univ/Universitas Indonesia.png" },
                { name: "Institut Teknologi Bandung", logo: "/logo-univ/intitut/Logo_Institut_Teknologi_Bandung-removebg-preview.png" },
                { name: "Universitas Gadjah Mada", logo: "/logo-univ/univ/Universitas Gadjah Mada.png" },
                { name: "Institut Teknologi Sepuluh November", logo: "/logo-univ/intitut/Logo_ITS-removebg-preview.png" },
                { name: "Universitas Padjadjaran", logo: "/logo-univ/univ/Universitas Padjadjaran.png" },
                { name: "Universitas Airlangga", logo: "/logo-univ/univ/UNIVERSITAS AIRLANGGA.png" },
                { name: "Universitas Brawijaya", logo: "/logo-univ/univ/UNIVERSITAS BRAWIJAYA.png" },
                { name: "Universitas Diponegoro", logo: "/logo-univ/univ/Universitas Diponegoro.png" }
              ].map((univ) => (
                <div
                  key={univ.name}
                  className="group relative"
                  title={univ.name}
                >
                  <div className="h-12 w-12 sm:h-14 sm:w-14 rounded-xl bg-white border border-slate-200/80 shadow-xs flex items-center justify-center p-2 hover:border-blue-500/40 hover:shadow-md hover:scale-105 transition-all">
                    <Image
                      src={univ.logo}
                      alt={`Logo ${univ.name}`}
                      width={56}
                      height={56}
                      className="object-contain"
                      loading="lazy"
                    />
                  </div>
                </div>
              ))}
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ---------------- 3. STATS IMPACT BAR ---------------- */}
      <section className="py-12 bg-slate-900 text-white border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <StaggerContainer className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center" staggerDelay={0.08}>
            <StaggerItem>
              <div className="space-y-1.5 p-5 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/8 hover:border-blue-500/30 transition-all group">
                <div className="w-10 h-0.5 bg-blue-500 mx-auto mb-3 rounded-full group-hover:w-full transition-all duration-500" />
                <p className="text-3xl sm:text-4xl font-black text-white">50.000+</p>
                <p className="text-xs sm:text-sm font-semibold text-slate-400">Bank Soal &amp; Pembahasan</p>
              </div>
            </StaggerItem>

            <StaggerItem>
              <div className="space-y-1.5 p-5 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/8 hover:border-blue-500/30 transition-all group">
                <div className="w-10 h-0.5 bg-blue-500 mx-auto mb-3 rounded-full group-hover:w-full transition-all duration-500" />
                <p className="text-3xl sm:text-4xl font-black text-white">99.2%</p>
                <p className="text-xs sm:text-sm font-semibold text-slate-400">Akurasi Penilaian IRT</p>
              </div>
            </StaggerItem>

            <StaggerItem>
              <div className="space-y-1.5 p-5 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/8 hover:border-blue-500/30 transition-all group">
                <div className="w-10 h-0.5 bg-blue-500 mx-auto mb-3 rounded-full group-hover:w-full transition-all duration-500" />
                <p className="text-3xl sm:text-4xl font-black text-white">100+</p>
                <p className="text-xs sm:text-sm font-semibold text-slate-400">PTN &amp; 4.900+ Prodi</p>
              </div>
            </StaggerItem>

            <StaggerItem>
              <div className="space-y-1.5 p-5 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/8 hover:border-blue-500/30 transition-all group">
                <div className="w-10 h-0.5 bg-blue-500 mx-auto mb-3 rounded-full group-hover:w-full transition-all duration-500" />
                <p className="text-3xl sm:text-4xl font-black text-white">98%</p>
                <p className="text-xs sm:text-sm font-semibold text-slate-400">Kepuasan Siswa Tembus PTN</p>
              </div>
            </StaggerItem>
          </StaggerContainer>
        </div>
      </section>

      {/* ---------------- 4. COMPANY PROFILE & MISSION ---------------- */}
      <section className="py-20 bg-white border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Content */}
            <FadeIn className="lg:col-span-6 space-y-6">
              <Badge variant="outline" className="text-xs font-bold bg-blue-50 text-blue-700 border-blue-200 px-3 py-1">
                Tentang UpdatePTN
              </Badge>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-950 tracking-tight leading-tight">
                Solusi Terpadu Menuju Kampus Impian Kamu
              </h2>
              <p className="text-slate-600 text-base leading-relaxed">
                UpdatePTN adalah ekosistem persiapan seleksi masuk perguruan tinggi negeri yang dirancang khusus untuk memetakan kemampuan siswa secara ilmiah dan akurat. Kami meyakini bahwa kelulusan SNBT bukan sekadar keberuntungan, melainkan hasil dari persiapan terarah dan evaluasi terukur.
              </p>

              <div className="space-y-4 pt-2">
                <div className="flex items-start gap-3.5">
                  <div className="h-8 w-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle2 className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Transparansi Algoritma IRT</h3>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      Sistem pembobotan soal otomatis berbasis Item Response Theory sesuai standar resmi BPPP.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="h-8 w-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                    <Target className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Rasionalisasi Data Presisi</h3>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      Komparasi nilai Try Out dengan histori keketatan 4.900+ program studi perguruan tinggi se-Indonesia.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="h-8 w-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 mt-0.5">
                    <Users className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Bimbingan Master Tutor</h3>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      Sesi siaran langsung bedah pola soal bersama pengajar berpengalaman alumni ITB, UI, dan UGM.
                    </p>
                  </div>
                </div>
              </div>
            </FadeIn>

            {/* Right Card Illustration */}
            <FadeIn delay={0.2} className="lg:col-span-6">
              <MotionCard className="rounded-3xl">
                <Card className="bg-slate-950 text-white p-8 rounded-3xl border border-slate-800 shadow-2xl space-y-6 relative overflow-hidden">
                  <div className="space-y-2">
                    <Badge className="bg-blue-600 text-white font-bold text-xs">EKOSISTEM DIGITAL</Badge>
                    <h3 className="text-2xl font-bold">Teknologi Pembelajaran Terpadu</h3>
                    <p className="text-slate-400 text-xs leading-relaxed">
                      Akses platform bimbel online dengan performa tinggi yang tetap ringan digunakan di semua perangkat smartphone siswa.
                    </p>
                  </div>

                  <div className="space-y-3 pt-2">
                    <div className="p-3.5 rounded-xl bg-white/10 border border-white/10 flex items-center justify-between text-xs font-semibold">
                      <span>Simulasi CBT UTBK Bertimer</span>
                      <Badge className="bg-emerald-500 text-white text-[10px]">AKTIF</Badge>
                    </div>
                    <div className="p-3.5 rounded-xl bg-white/10 border border-white/10 flex items-center justify-between text-xs font-semibold">
                      <span>Analisis Keketatan Prodi Real-time</span>
                      <Badge className="bg-emerald-500 text-white text-[10px]">TERDOKUMENTASI</Badge>
                    </div>
                    <div className="p-3.5 rounded-xl bg-white/10 border border-white/10 flex items-center justify-between text-xs font-semibold">
                      <span>Modul PDF & Replay Live Class 24/7</span>
                      <Badge className="bg-emerald-500 text-white text-[10px]">TIDAK TERBATAS</Badge>
                    </div>
                  </div>
                </Card>
              </MotionCard>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* ---------------- 5. FEATURES GRID ---------------- */}
      <section id="fitur" className="py-20 bg-slate-50/70 border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          {/* Section Header */}
          <FadeIn className="text-center max-w-3xl mx-auto space-y-3">
            <Badge variant="outline" className="text-xs font-bold bg-blue-50 text-blue-700 border-blue-200 px-3 py-1">
              Layanan Unggulan
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-950 tracking-tight">
              Fitur Pembelajaran Terpadu
            </h2>
            <p className="text-slate-600 text-base">
              Dirancang untuk mendukung kesiapan akademik siswa secara komprehensif dan sistematis.
            </p>
          </FadeIn>

          {/* 4 Feature Cards Grid */}
          <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6" staggerDelay={0.08}>
            {/* Feature 1 */}
            <StaggerItem>
              <MotionCard className="h-full rounded-2xl">
                <Card className="bg-white/90 backdrop-blur-md border border-slate-200/80 shadow-xs p-6 rounded-2xl flex flex-col justify-between space-y-6 h-full">
                  <div className="space-y-4">
                    <div className="h-11 w-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                      <BarChart3 className="h-5 w-5" />
                    </div>
                    <div className="space-y-1.5">
                      <h3 className="text-lg font-bold text-slate-900">Try Out UTBK (IRT)</h3>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        Simulasi ujian bertimer presisi sesuai sistem pembobotan Item Response Theory (IRT).
                      </p>
                    </div>
                    <ul className="space-y-2 text-xs text-slate-600 pt-2">
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="h-3.5 w-3.5 text-blue-600 shrink-0" />
                        <span>Timer subtes akurat</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="h-3.5 w-3.5 text-blue-600 shrink-0" />
                        <span>Analisis TPS & Literasi</span>
                      </li>
                    </ul>
                  </div>

                  <div className="pt-4 border-t border-slate-100">
                    <Link href="/register">
                      <Button variant="ghost" className="p-0 h-auto font-bold text-xs text-blue-600 hover:text-blue-700 inline-flex items-center gap-1">
                        <span>Akses Try Out</span>
                        <ChevronRight className="h-3.5 w-3.5" />
                      </Button>
                    </Link>
                  </div>
                </Card>
              </MotionCard>
            </StaggerItem>

            {/* Feature 2 */}
            <StaggerItem>
              <MotionCard className="h-full rounded-2xl">
                <Card className="bg-white/90 backdrop-blur-md border border-slate-200/80 shadow-xs p-6 rounded-2xl flex flex-col justify-between space-y-6 h-full">
                  <div className="space-y-4">
                    <div className="h-11 w-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                      <Target className="h-5 w-5" />
                    </div>
                    <div className="space-y-1.5">
                      <h3 className="text-lg font-bold text-slate-900">Cek Peluang PTN</h3>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        Rasionalisasi nilai otomatis terhadap 4.900+ jurusan & keketatan PTN.
                      </p>
                    </div>
                    <ul className="space-y-2 text-xs text-slate-600 pt-2">
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                        <span>Estimasi passing grade</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                        <span>Analisis kuota & peminat</span>
                      </li>
                    </ul>
                  </div>

                  <div className="pt-4 border-t border-slate-100">
                    <Link href="/register">
                      <Button variant="ghost" className="p-0 h-auto font-bold text-xs text-emerald-600 hover:text-emerald-700 inline-flex items-center gap-1">
                        <span>Cek Rasionalisasi</span>
                        <ChevronRight className="h-3.5 w-3.5" />
                      </Button>
                    </Link>
                  </div>
                </Card>
              </MotionCard>
            </StaggerItem>

            {/* Feature 3 */}
            <StaggerItem>
              <MotionCard className="h-full rounded-2xl">
                <Card className="bg-white/90 backdrop-blur-md border border-slate-200/80 shadow-xs p-6 rounded-2xl flex flex-col justify-between space-y-6 h-full">
                  <div className="space-y-4">
                    <div className="h-11 w-11 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                      <Video className="h-5 w-5" />
                    </div>
                    <div className="space-y-1.5">
                      <h3 className="text-lg font-bold text-slate-900">Live Class & Replay</h3>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        Sesi siaran langsung bedah pola soal bersama pengajar PTN & rekaman 24/7.
                      </p>
                    </div>
                    <ul className="space-y-2 text-xs text-slate-600 pt-2">
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="h-3.5 w-3.5 text-indigo-600 shrink-0" />
                        <span>Tanya jawab interaktif</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="h-3.5 w-3.5 text-indigo-600 shrink-0" />
                        <span>Download Modul PDF</span>
                      </li>
                    </ul>
                  </div>

                  <div className="pt-4 border-t border-slate-100">
                    <Link href="/register">
                      <Button variant="ghost" className="p-0 h-auto font-bold text-xs text-indigo-600 hover:text-indigo-700 inline-flex items-center gap-1">
                        <span>Lihat Jadwal</span>
                        <ChevronRight className="h-3.5 w-3.5" />
                      </Button>
                    </Link>
                  </div>
                </Card>
              </MotionCard>
            </StaggerItem>

            {/* Feature 4 */}
            <StaggerItem>
              <MotionCard className="h-full rounded-2xl">
                <Card className="bg-white/90 backdrop-blur-md border border-slate-200/80 shadow-xs p-6 rounded-2xl flex flex-col justify-between space-y-6 h-full">
                  <div className="space-y-4">
                    <div className="h-11 w-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                      <BookOpen className="h-5 w-5" />
                    </div>
                    <div className="space-y-1.5">
                      <h3 className="text-lg font-bold text-slate-900">Bank Soal Terstruktur</h3>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        Ribuan koleksi latihan soal TPS & Literasi bertingkat lengkap dengan pembahasan.
                      </p>
                    </div>
                    <ul className="space-y-2 text-xs text-slate-600 pt-2">
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="h-3.5 w-3.5 text-amber-600 shrink-0" />
                        <span>Tipe Soal HOTS UTBK</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="h-3.5 w-3.5 text-amber-600 shrink-0" />
                        <span>Pembahasan langkah cepat</span>
                      </li>
                    </ul>
                  </div>

                  <div className="pt-4 border-t border-slate-100">
                    <Link href="/register">
                      <Button variant="ghost" className="p-0 h-auto font-bold text-xs text-amber-600 hover:text-amber-700 inline-flex items-center gap-1">
                        <span>Eksplor Soal</span>
                        <ChevronRight className="h-3.5 w-3.5" />
                      </Button>
                    </Link>
                  </div>
                </Card>
              </MotionCard>
            </StaggerItem>
          </StaggerContainer>
        </div>
      </section>

      {/* ---------------- 6. HOW IT WORKS (4-Step Visual Flow) ---------------- */}
      <section id="keunggulan" className="py-20 bg-white border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <FadeIn className="text-center max-w-3xl mx-auto space-y-3">
            <Badge variant="outline" className="text-xs font-bold bg-blue-50 text-blue-700 border-blue-200 px-3 py-1">
              Alur Perjuangan
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-950 tracking-tight">
              4 Langkah Mudah Menuju PTN Impian
            </h2>
            <p className="text-slate-600 text-base">
              Proses sistematis untuk mengukur dan meningkatkan kesiapan UTBK kamu.
            </p>
          </FadeIn>

          <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6" staggerDelay={0.08}>
            {/* Step 1 */}
            <StaggerItem>
              <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-4 relative h-full">
                <div className="h-10 w-10 rounded-xl bg-blue-600 text-white font-extrabold text-sm flex items-center justify-center shadow-xs">
                  01
                </div>
                <h3 className="text-lg font-bold text-slate-900">Daftar Akun Gratis</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Lengkapi registrasi dalam 1 menit dan tentukan 2 pilihan program studi PTN targetmu.
                </p>
              </div>
            </StaggerItem>

            {/* Step 2 */}
            <StaggerItem>
              <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-4 relative h-full">
                <div className="h-10 w-10 rounded-xl bg-blue-600 text-white font-extrabold text-sm flex items-center justify-center shadow-xs">
                  02
                </div>
                <h3 className="text-lg font-bold text-slate-900">Uji Try Out IRT</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Kerjakan simulasi ujian CBT bertimer dengan standar penilaian pembobotan IRT BPPP.
                </p>
              </div>
            </StaggerItem>

            {/* Step 3 */}
            <StaggerItem>
              <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-4 relative h-full">
                <div className="h-10 w-10 rounded-xl bg-blue-600 text-white font-extrabold text-sm flex items-center justify-center shadow-xs">
                  03
                </div>
                <h3 className="text-lg font-bold text-slate-900">Analisis Rasionalisasi</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Dapatkan grafik evaluasi skor IRT dan persentase estimasi kelulusan prodi pilihan.
                </p>
              </div>
            </StaggerItem>

            {/* Step 4 */}
            <StaggerItem>
              <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-4 relative h-full">
                <div className="h-10 w-10 rounded-xl bg-blue-600 text-white font-extrabold text-sm flex items-center justify-center shadow-xs">
                  04
                </div>
                <h3 className="text-lg font-bold text-slate-900">Evaluasi & Live Class</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Tingkatkan kemampuan lewat sesi bedah soal bersama Master Tutor dan modul PDF.
                </p>
              </div>
            </StaggerItem>
          </StaggerContainer>
        </div>
      </section>

      {/* ---------------- 7. PRICING CARDS ---------------- */}
      <section id="paket" className="py-20 bg-slate-50/70 border-b border-slate-200/80">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <FadeIn className="text-center max-w-3xl mx-auto space-y-3">
            <Badge variant="outline" className="text-xs font-bold bg-blue-50 text-blue-700 border-blue-200 px-3 py-1">
              Investasi Masa Depan
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-950 tracking-tight">
              Pilihan Paket Belajar Transparan
            </h2>
            <p className="text-slate-600 text-base">
              Tanpa biaya tersembunyi. Pilih paket yang sesuai dengan kebutuhan persiapan ujianmu.
            </p>
          </FadeIn>

          <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch" staggerDelay={0.1}>
            {/* Free Trial Tier */}
            <StaggerItem>
              <MotionCard className="h-full rounded-3xl">
                <Card className="bg-white border border-slate-200/80 shadow-xs p-8 rounded-3xl flex flex-col justify-between space-y-6 h-full">
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <Badge variant="outline" className="text-xs font-bold border-slate-200 text-slate-600">
                        PAKET STARTER
                      </Badge>
                      <h3 className="text-2xl font-black text-slate-900">Trial / Gratis</h3>
                      <p className="text-xs text-slate-500">
                        Cocok untuk mencoba dan menguji kemampuan awal kamu secara gratis.
                      </p>
                    </div>

                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-black text-slate-900">Rp 0</span>
                      <span className="text-xs font-semibold text-slate-400">/ selamanya</span>
                    </div>

                    <ul className="space-y-3 text-xs text-slate-700 pt-2 border-t border-slate-100">
                      <li className="flex items-center gap-2.5">
                        <Check className="h-4 w-4 text-emerald-600 shrink-0" />
                        <span>Gratis 1x Cek Rasionalisasi SNBP</span>
                      </li>
                      <li className="flex items-center gap-2.5">
                        <Check className="h-4 w-4 text-emerald-600 shrink-0" />
                        <span>Gratis 3x Cek Rasionalisasi SNBT</span>
                      </li>
                      <li className="flex items-center gap-2.5">
                        <Check className="h-4 w-4 text-emerald-600 shrink-0" />
                        <span>Gratis 1x Cek Rasionalisasi Mandiri</span>
                      </li>
                      <li className="flex items-center gap-2.5">
                        <Check className="h-4 w-4 text-emerald-600 shrink-0" />
                        <span>Akses Direktori Kampus & Jurusan</span>
                      </li>
                    </ul>
                  </div>

                  <div className="space-y-3 pt-2">
                    <Link href="/register" className="w-full block">
                      <Button variant="outline" className="w-full h-11 font-bold text-xs rounded-xl border-slate-200 text-slate-700 hover:bg-slate-50">
                        Daftar Akun Gratis
                      </Button>
                    </Link>
                    <Link href="/pricing" className="w-full block text-center">
                      <span className="text-xs font-semibold text-blue-600 hover:underline">
                        Lihat Rincian Paket
                      </span>
                    </Link>
                  </div>
                </Card>
              </MotionCard>
            </StaggerItem>

            {/* VIP All Access Tier */}
            <StaggerItem>
              <MotionCard className="h-full rounded-3xl">
                <Card className="bg-slate-950 text-white border border-slate-800 shadow-2xl p-8 rounded-3xl flex flex-col justify-between space-y-6 h-full relative overflow-hidden">
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <Badge className="bg-blue-600 text-white font-bold text-xs">
                        POPULER & REKOMENDASI
                      </Badge>
                      <span className="text-[11px] font-bold text-amber-400">All Access</span>
                    </div>

                    <div className="space-y-1">
                      <h3 className="text-2xl font-black text-white">Paket VIP</h3>
                      <p className="text-xs text-slate-400">
                        Akses tanpa batas ke seluruh produk SNBP, SNBT, dan Mandiri.
                      </p>
                    </div>

                    <div>
                      <div className="flex items-baseline gap-1">
                        <span className="text-4xl font-black text-white">Rp 49.000</span>
                        <span className="text-xs font-semibold text-slate-400">/ 7 hari</span>
                      </div>
                      <p className="text-[11px] text-blue-400 font-semibold mt-1">
                        Tersedia juga paket bulanan Rp 149.000 / bln
                      </p>
                    </div>

                    <ul className="space-y-3 text-xs text-slate-300 pt-2 border-t border-slate-800">
                      <li className="flex items-center gap-2.5">
                        <Check className="h-4 w-4 text-blue-400 shrink-0" />
                        <span className="font-semibold text-white">Cek Rasionalisasi SNBP, SNBT & Mandiri Tanpa Batas</span>
                      </li>
                      <li className="flex items-center gap-2.5">
                        <Check className="h-4 w-4 text-blue-400 shrink-0" />
                        <span>Semua Bank Soal & Timer CBT IRT</span>
                      </li>
                      <li className="flex items-center gap-2.5">
                        <Check className="h-4 w-4 text-blue-400 shrink-0" />
                        <span>Akses Live Class & Download Rekaman HD 24/7</span>
                      </li>
                      <li className="flex items-center gap-2.5">
                        <Check className="h-4 w-4 text-blue-400 shrink-0" />
                        <span>Konsultasi Pemilihan Jurusan & Priority Support</span>
                      </li>
                    </ul>
                  </div>

                  <Link href="/pricing" className="w-full block pt-2">
                    <Button className="w-full h-12 font-bold text-xs bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-lg shadow-blue-500/25">
                      Pilih Paket VIP
                    </Button>
                  </Link>
                </Card>
              </MotionCard>
            </StaggerItem>
          </StaggerContainer>

          {/* Try Out Highlight & Link to Full Pricing */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="space-y-1 text-center md:text-left">
              <div className="flex items-center gap-2 justify-center md:justify-start">
                <Badge variant="outline" className="text-[10px] font-bold border-purple-200 bg-purple-50 text-purple-700">
                  PAKET TRY OUT SATUAN
                </Badge>
                <span className="text-xs font-extrabold text-slate-900">Rp 59.000 s.d. Rp 400.000</span>
              </div>
              <p className="text-xs text-slate-500">
                Beli Try Out IRT satuan (1x, 4x Hemat, 8x Ambiss, 10x Super) tanpa perlu berlangganan.
              </p>
            </div>
            <Link href="/pricing" className="shrink-0">
              <Button variant="outline" className="h-10 px-6 font-bold text-xs rounded-xl border-blue-200 text-blue-600 hover:bg-blue-50 gap-2">
                <span>Lihat Semua Paket & Try Out</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ---------------- 8. TESTIMONIAL GRID ---------------- */}
      <section className="py-20 bg-white border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <FadeIn className="text-center max-w-3xl mx-auto space-y-3">
            <Badge variant="outline" className="text-xs font-bold bg-blue-50 text-blue-700 border-blue-200 px-3 py-1">
              Kisah Sukses Siswa
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-950 tracking-tight">
              Cerita Kelulusan Pejuang PTN
            </h2>
            <p className="text-slate-600 text-base">
              Mereka yang telah membuktikan efektivitas persiapan terarah di UpdatePTN.
            </p>
          </FadeIn>

          <StaggerContainer className="grid grid-cols-1 md:grid-cols-3 gap-8" staggerDelay={0.1}>
            {/* Testimonial 1 */}
            <StaggerItem>
              <MotionCard className="h-full rounded-2xl">
                <Card className="bg-slate-50 p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4 h-full flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="flex items-center gap-1 text-amber-400">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-amber-400" />
                      ))}
                    </div>
                    <p className="text-xs text-slate-700 leading-relaxed italic">
                      "Skor IRT Try Out UpdatePTN presisi banget! Hasil UTBK asliku cuma beda 5 poin dari rata-rata Try Out di sini. Fitur Cek Peluangnya beneran nolong waktu milih prodi."
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-200/60 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-slate-900">Amanda Zevanya</p>
                      <p className="text-[11px] text-blue-600 font-bold">Teknik Informatika - UI</p>
                    </div>
                    <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px] font-bold">
                      TEMBUS PTN
                    </Badge>
                  </div>
                </Card>
              </MotionCard>
            </StaggerItem>

            {/* Testimonial 2 */}
            <StaggerItem>
              <MotionCard className="h-full rounded-2xl">
                <Card className="bg-slate-50 p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4 h-full flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="flex items-center gap-1 text-amber-400">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-amber-400" />
                      ))}
                    </div>
                    <p className="text-xs text-slate-700 leading-relaxed italic">
                      "Live Class bedah soalnya paling berkesan. Tutor-tutornya ngasih trik cepat ngerjain soal Penalaran Matematika yang keliatan rumit jadi simpel banget."
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-200/60 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-slate-900">Rian Pratama</p>
                      <p className="text-[11px] text-blue-600 font-bold">Kedokteran - UGM</p>
                    </div>
                    <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px] font-bold">
                      TEMBUS PTN
                    </Badge>
                  </div>
                </Card>
              </MotionCard>
            </StaggerItem>

            {/* Testimonial 3 */}
            <StaggerItem>
              <MotionCard className="h-full rounded-2xl">
                <Card className="bg-slate-50 p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4 h-full flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="flex items-center gap-1 text-amber-400">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-amber-400" />
                      ))}
                    </div>
                    <p className="text-xs text-slate-700 leading-relaxed italic">
                      "Tampilan CBT-nya persis banget sama ujian UTBK asli BPPP. Jadi pas hari-H gak ada canggung sama sekali. Worth it banget paket All Access-nya!"
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-200/60 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-slate-900">Farah Nabila</p>
                      <p className="text-[11px] text-blue-600 font-bold">SBM - ITB</p>
                    </div>
                    <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px] font-bold">
                      TEMBUS PTN
                    </Badge>
                  </div>
                </Card>
              </MotionCard>
            </StaggerItem>
          </StaggerContainer>
        </div>
      </section>

      {/* ---------------- 9. INTERACTIVE FAQ ACCORDION ---------------- */}
      <section id="faq" className="py-20 bg-slate-50/70 border-b border-slate-200/80">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <FadeIn className="text-center space-y-3">
            <Badge variant="outline" className="text-xs font-bold bg-blue-50 text-blue-700 border-blue-200 px-3 py-1">
              Pertanyaan Umum
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-950 tracking-tight">
              Pertanyaan Sering Diajukan
            </h2>
            <p className="text-slate-600 text-base">
              Informasi lengkap seputar sistem evaluasi dan penggunaan platform UpdatePTN.
            </p>
          </FadeIn>

          <FadeIn delay={0.1}>
            <Accordion className="w-full space-y-3">
              <AccordionItem value="item-1" className="border border-slate-200/80 rounded-2xl bg-white px-6 py-1 shadow-xs">
                <AccordionTrigger className="text-base font-bold text-slate-900 text-left hover:no-underline hover:text-blue-600">
                  Apakah sistem penilaian Try Out menggunakan IRT resmi?
                </AccordionTrigger>
                <AccordionContent className="text-slate-600 text-sm leading-relaxed">
                  Ya, kami mengadopsi prinsip Item Response Theory (IRT) yang menghitung bobot tingkat kesulitan tiap butir soal secara akurat sesuai standar penilaian seleksi BPPP.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-2" className="border border-slate-200/80 rounded-2xl bg-white px-6 py-1 shadow-xs">
                <AccordionTrigger className="text-base font-bold text-slate-900 text-left hover:no-underline hover:text-blue-600">
                  Bagaimana cara kerja fitur Cek Peluang PTN?
                </AccordionTrigger>
                <AccordionContent className="text-slate-600 text-sm leading-relaxed">
                  Fitur Cek Peluang PTN membandingkan skor IRT hasil Try Out kamu dengan data historis daya tampung, jumlah peminat, dan estimasi keketatan 4.900+ prodi di 100+ PTN se-Indonesia.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-3" className="border border-slate-200/80 rounded-2xl bg-white px-6 py-1 shadow-xs">
                <AccordionTrigger className="text-base font-bold text-slate-900 text-left hover:no-underline hover:text-blue-600">
                  Apakah rekaman Live Class dapat diakses 24/7?
                </AccordionTrigger>
                <AccordionContent className="text-slate-600 text-sm leading-relaxed">
                  Ya, seluruh sesi siaran langsung bedah soal direkam dalam kualitas HD dan modul PDF pembahasan dapat diunduh kapan saja tanpa batasan waktu.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-4" className="border border-slate-200/80 rounded-2xl bg-white px-6 py-1 shadow-xs">
                <AccordionTrigger className="text-base font-bold text-slate-900 text-left hover:no-underline hover:text-blue-600">
                  Apakah ada biaya berlangganan bulanan?
                </AccordionTrigger>
                <AccordionContent className="text-slate-600 text-sm leading-relaxed">
                  Tidak ada. Pembayaran Paket All Access bersifat sekali bayar (one-time payment) dan aktif hingga pendaftaran dan pelaksanaan SNBT selesai.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-5" className="border border-slate-200/80 rounded-2xl bg-white px-6 py-1 shadow-xs">
                <AccordionTrigger className="text-base font-bold text-slate-900 text-left hover:no-underline hover:text-blue-600">
                  Apakah platform dapat diakses dengan lancar di smartphone?
                </AccordionTrigger>
                <AccordionContent className="text-slate-600 text-sm leading-relaxed">
                  Sangat bisa. Tampilan UpdatePTN dirancang sangat ringan, mulus, dan efisien untuk browser perangkat seluler Android maupun iOS tanpa memberatkan GPU.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-6" className="border border-slate-200/80 rounded-2xl bg-white px-6 py-1 shadow-xs">
                <AccordionTrigger className="text-base font-bold text-slate-900 text-left hover:no-underline hover:text-blue-600">
                  Bagaimana cara mulai pendaftaran?
                </AccordionTrigger>
                <AccordionContent className="text-slate-600 text-sm leading-relaxed">
                  Cukup klik tombol 'Mulai Sekarang', isi nama dan email kamu, lalu dapatkan akses gratis ke simulasi Try Out pertama dan analisis rasionalisasi.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </FadeIn>
        </div>
      </section>

      {/* ---------------- 10. ENTERPRISE FOOTER ---------------- */}
      <footer className="mt-auto bg-slate-950 text-white py-16 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 justify-between">
            {/* Column 1: Brand & Mission */}
            <div className="md:col-span-5 space-y-4">
              <div className="flex items-center gap-2.5">
                <Image
                  src="/logo.svg"
                  alt="UpdatePTN Logo"
                  width={32}
                  height={32}
                  className="h-8 w-auto object-contain"
                />
                <span className="font-extrabold text-xl tracking-tight text-white">
                  Update<span className="text-blue-500">PTN</span>
                </span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
                Ekosistem Pembelajaran & Persiapan UTBK SNBT #1 di Indonesia. Membantu siswa meraih cita-cita masuk perguruan tinggi negeri favorit secara terarah dan terukur.
              </p>
            </div>

            {/* Column 2: Navigation Links */}
            <div className="md:col-span-3 space-y-3">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-300">Navigasi Utama</p>
              <ul className="space-y-2 text-xs text-slate-400">
                <li>
                  <Link href="#fitur" className="hover:text-blue-400 transition-colors">Program & Fitur</Link>
                </li>
                <li>
                  <Link href="#keunggulan" className="hover:text-blue-400 transition-colors">Keunggulan</Link>
                </li>
                <li>
                  <Link href="#paket" className="hover:text-blue-400 transition-colors">Paket Belajar</Link>
                </li>
                <li>
                  <Link href="#faq" className="hover:text-blue-400 transition-colors">Pertanyaan Umum (FAQ)</Link>
                </li>
                <li>
                  <Link href="/direktori-prodi" className="hover:text-blue-400 transition-colors">Direktori Kampus</Link>
                </li>
              </ul>
            </div>

            {/* Column 3: Contact & Support */}
            <div className="md:col-span-4 space-y-3">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-300">Layanan Bantuan</p>
              <ul className="space-y-2 text-xs text-slate-400">
                <li className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-blue-500 shrink-0" />
                  <span>support@updateptn.id</span>
                </li>
                <li className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-blue-500 shrink-0" />
                  <span>+62 812-3456-7890 (WhatsApp Support)</span>
                </li>
                <li className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-blue-500 shrink-0" />
                  <span>Senin - Sabtu: 08.00 - 20.00 WIB</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
            <p>© {new Date().getFullYear()} UpdatePTN. Seluruh Hak Cipta Dilindungi.</p>
            <div className="flex items-center gap-4 text-slate-400">
              <Link href="#" className="hover:text-white transition-colors">Syarat & Ketentuan</Link>
              <span>•</span>
              <Link href="#" className="hover:text-white transition-colors">Kebijakan Privasi</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
