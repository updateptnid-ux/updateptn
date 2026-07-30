"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import {
  GraduationCap,
  BarChart3,
  Video,
  Target,
  CheckCircle2,
  ArrowRight,
  Menu,
  ChevronRight,
  User,
  BookOpen,
} from "lucide-react";

export default function LandingPage() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-white text-slate-900 font-sans">
      {/* ---------------- NAVIGATION NAVBAR ---------------- */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200">
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
              Fitur Layanan
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
                <span>Daftar Akun</span>
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
                    href="/direktori-prodi"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="text-base font-semibold text-slate-900 py-1"
                  >
                    Direktori PTN
                  </Link>
                  <Link
                    href="#fitur"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="text-base font-medium text-slate-700 hover:text-blue-600 py-1"
                  >
                    Fitur Layanan
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
                      Daftar Akun
                    </Button>
                  </Link>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      {/* ---------------- HERO SECTION (Clean, Minimalist, Enterprise Typography) ---------------- */}
      <section className="py-20 md:py-28 bg-white border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <Badge variant="outline" className="px-3.5 py-1 rounded-full text-xs font-semibold bg-slate-50 text-slate-700 border-slate-200 inline-block">
            Ekosistem Persiapan UTBK & SNBT 2026
          </Badge>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-slate-950 leading-[1.15]">
            Persiapan Seleksi Masuk PTN{" "}
            <span className="text-blue-600">Terarah & Terukur</span>
          </h1>

          <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto font-normal leading-relaxed">
            Platform pembelajaran terpadu dengan simulasi Try Out IRT, rasionalisasi Cek Peluang PTN, dan pembelajaran interaktif untuk persiapan UTBK SNBT.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
            <Link href="/register" className="w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto h-12 px-8 text-base font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-xs gap-2">
                <span>Mulai Sekarang</span>
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
            <Link href="/direktori-prodi" className="w-full sm:w-auto">
              <Button size="lg" variant="outline" className="w-full sm:w-auto h-12 px-8 text-base font-semibold text-slate-700 rounded-xl border-slate-200 hover:bg-slate-50 gap-2">
                <BookOpen className="h-4 w-4 text-slate-500" />
                <span>Eksplorasi Kampus</span>
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ---------------- FEATURES SECTION (Clean Structural Cards) ---------------- */}
      <section id="fitur" className="py-20 bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          {/* Section Header */}
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-950 tracking-tight">
              Fitur Layanan Pembelajaran
            </h2>
            <p className="text-slate-600 text-base">
              Dirancang untuk mendukung kesiapan akademik siswa secara sistematis dan terstruktur.
            </p>
          </div>

          {/* 3 Feature Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <Card className="bg-white border border-slate-200 shadow-xs p-8 rounded-2xl flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="h-12 w-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <BarChart3 className="h-6 w-6" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-slate-900">Try Out UTBK (IRT Scoring)</h3>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    Simulasi ujian sesuai standar penilaian Item Response Theory (IRT) untuk mengukur tingkat kemampuan siswa.
                  </p>
                </div>

                <ul className="space-y-2 text-sm text-slate-600 pt-2">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
                    <span>Timer dan navigasi subtes akurat.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
                    <span>Analisis skor per subtes (TPS & Literasi).</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
                    <span>Pembahasan soal terstruktur.</span>
                  </li>
                </ul>
              </div>

              <div className="pt-4 border-t border-slate-100">
                <Link href="/register">
                  <Button variant="ghost" className="p-0 h-auto font-semibold text-sm text-blue-600 hover:text-blue-700 inline-flex items-center gap-1">
                    <span>Akses Try Out</span>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </Card>

            {/* Feature 2 */}
            <Card className="bg-white border border-slate-200 shadow-xs p-8 rounded-2xl flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="h-12 w-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Target className="h-6 w-6" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-slate-900">Cek Peluang PTN</h3>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    Fitur rasionalisasi berbasis data histori keketatan dan estimasi passing grade jurusan perguruan tinggi.
                  </p>
                </div>

                <ul className="space-y-2 text-sm text-slate-600 pt-2">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
                    <span>Rasionalisasi pilihan 1 dan pilihan 2.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
                    <span>Analisis komparatif kuota dan peminat.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
                    <span>Informasi rentang biaya UKT prodi.</span>
                  </li>
                </ul>
              </div>

              <div className="pt-4 border-t border-slate-100">
                <Link href="/direktori-prodi">
                  <Button variant="ghost" className="p-0 h-auto font-semibold text-sm text-blue-600 hover:text-blue-700 inline-flex items-center gap-1">
                    <span>Cek Rasionalisasi</span>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </Card>

            {/* Feature 3 */}
            <Card className="bg-white border border-slate-200 shadow-xs p-8 rounded-2xl flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="h-12 w-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Video className="h-6 w-6" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-slate-900">Live Class Interaktif</h3>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    Pembahasan materi dan strategi penyelesaian soal bersama pengajar.
                  </p>
                </div>

                <ul className="space-y-2 text-sm text-slate-600 pt-2">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
                    <span>Sesi pembelajaran terjadwal.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
                    <span>Diskusi tanya jawab interaktif.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
                    <span>Akses materi pendukung.</span>
                  </li>
                </ul>
              </div>

              <div className="pt-4 border-t border-slate-100">
                <Link href="/register">
                  <Button variant="ghost" className="p-0 h-auto font-semibold text-sm text-blue-600 hover:text-blue-700 inline-flex items-center gap-1">
                    <span>Lihat Jadwal</span>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* ---------------- FAQ SECTION ---------------- */}
      <section id="faq" className="py-20 bg-white border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          {/* Header */}
          <div className="text-center space-y-3">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-950 tracking-tight">
              Pertanyaan Umum
            </h2>
            <p className="text-slate-600 text-base">
              Informasi seputar penggunaan platform UpdatePTN.
            </p>
          </div>

          {/* Accordion */}
          <Accordion className="w-full space-y-3">
            <AccordionItem value="item-1" className="border border-slate-200 rounded-xl bg-white px-6 py-1">
              <AccordionTrigger className="text-base font-bold text-slate-900 text-left hover:no-underline hover:text-blue-600">
                Apakah sistem penilaian Try Out menggunakan IRT?
              </AccordionTrigger>
              <AccordionContent className="text-slate-600 text-sm leading-relaxed">
                Ya, sistem penilaian Try Out mengadopsi prinsip Item Response Theory (IRT) untuk mengukur tingkat kesulitan soal dan bobot skor siswa.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-2" className="border border-slate-200 rounded-xl bg-white px-6 py-1">
              <AccordionTrigger className="text-base font-bold text-slate-900 text-left hover:no-underline hover:text-blue-600">
                Bagaimana cara kerja Cek Peluang PTN?
              </AccordionTrigger>
              <AccordionContent className="text-slate-600 text-sm leading-relaxed">
                Cek Peluang PTN membandingkan nilai hasil Try Out dengan acuan passing grade dan keketatan histori jurusan yang dipilih.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-3" className="border border-slate-200 rounded-xl bg-white px-6 py-1">
              <AccordionTrigger className="text-base font-bold text-slate-900 text-left hover:no-underline hover:text-blue-600">
                Bagaimana cara memulai pendaftaran?
              </AccordionTrigger>
              <AccordionContent className="text-slate-600 text-sm leading-relaxed">
                Siswa dapat membuat akun gratis melalui halaman pendaftaran untuk mengakses direktori prodi dan fitur pembelajaran yang tersedia.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </section>

      {/* ---------------- FOOTER (Strictly Clean & Minimalist Copyright) ---------------- */}
      <footer className="mt-auto bg-white py-8 border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <div className="flex items-center gap-2">
            <Image
              src="/logo.svg"
              alt="UpdatePTN Logo"
              width={24}
              height={24}
              className="h-6 w-auto object-contain"
            />
            <span className="font-bold text-slate-900">UpdatePTN</span>
          </div>
          <p>© 2026 UpdatePTN. Seluruh hak cipta dilindungi.</p>
        </div>
      </footer>
    </div>
  );
}
