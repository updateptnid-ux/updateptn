"use client";

import { useState } from "react";
<<<<<<< HEAD
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowRight, 
  MapPinOff, 
  SearchX, 
  Compass,
  CheckCircle2, 
  XCircle,
  Target, 
  BrainCircuit, 
  Video, 
  BookOpen,
  Star,
  ChevronDown
} from "lucide-react";
import Link from "next/link";

export default function LandingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const } }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15 }
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-blue-600 selection:text-white">
      
      {/* 1. HERO SECTION */}
      <section className="relative pt-32 pb-20 px-6 lg:px-8 overflow-hidden flex flex-col items-center text-center">
        <div className="absolute inset-0 -z-10 h-full w-full bg-white bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] bg-size-[16px_16px] mask-[radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)]"></div>
        
        <motion.div initial="hidden" animate="visible" variants={fadeInUp} className="max-w-4xl mx-auto">
          <span className="inline-block py-1 px-3 rounded-full bg-blue-100 text-blue-700 font-semibold text-sm mb-6 shadow-sm border border-blue-200">
            🌟 Platform Persiapan SNBT Terlengkap
          </span>
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-slate-900 mb-8 leading-[1.1]">
            Lolos PTN Impian Bukan Lagi Kebetulan. <span className="text-blue-600">Wujudkan dengan Strategi Terukur.</span>
          </h1>
          <p className="text-lg md:text-xl text-slate-600 mb-10 max-w-2xl mx-auto leading-relaxed">
            Jangan cuma belajar keras, tapi belajar cerdas. Gabung dengan ekosistem belajar interaktif yang dilengkapi Try Out sistem IRT asli, rasionalisasi prodi, dan Live Class eksklusif.
          </p>
          <div className="flex flex-col items-center gap-3">
            <Link href="/login" className="group flex items-center justify-center gap-2 bg-blue-600 text-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-blue-700 transition-all shadow-lg hover:shadow-blue-500/30 hover:-translate-y-0.5">
              Mulai Belajar Sekarang
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <span className="text-sm text-slate-500 flex items-center gap-1 mt-2">
              🔒 Bebas akses fitur dasar. Tanpa kartu kredit.
            </span>
          </div>
        </motion.div>
      </section>

      {/* 2. LOGO STRIP */}
      <section className="py-10 border-y border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-sm font-semibold text-slate-400 uppercase tracking-widest mb-6">
            Jadilah bagian dari mereka yang telah bersiap menuju kampus impian:
          </p>
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
            {/* Placeholder Text as Logos for now - replace with actual Image tags later */}
            <h3 className="text-2xl font-bold font-serif">Universitas Indonesia</h3>
            <h3 className="text-2xl font-bold font-serif">Universitas Gadjah Mada</h3>
            <h3 className="text-2xl font-bold font-serif">Institut Teknologi Bandung</h3>
            <h3 className="text-2xl font-bold font-serif">Universitas Brawijaya</h3>
          </div>
        </div>
      </section>

      {/* 3. PAIN POINTS */}
      <section className="py-24 px-6 bg-slate-50">
        <div className="max-w-7xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp} className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Masih Bingung Mulai Belajar SNBT dari Mana?</h2>
            <p className="text-slate-600 max-w-2xl mx-auto">Masalah yang sering dialami pejuang PTN karena persiapan yang kurang terarah.</p>
          </motion.div>

          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer} className="grid md:grid-cols-3 gap-8">
            {[
              { title: "Belajar Buta Arah", desc: "Nggak tahu materi mana yang sering keluar di UTBK. Belajar semua bab bikin waktu habis sia-sia.", icon: Compass },
              { title: "Try Out Abal-abal", desc: "Sistem penilaian nggak pakai sistem IRT (Item Response Theory) yang asli, bikin skor palsu.", icon: SearchX },
              { title: "Salah Pilih Jurusan", desc: "Nggak tahu seberapa besar peluang asli lolos ke jurusan target. Modal nekat berujung gagal.", icon: MapPinOff }
            ].map((item, i) => (
              <motion.div key={i} variants={fadeInUp} className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-red-100 text-red-500 rounded-2xl flex items-center justify-center mb-6">
                  <item.icon className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold mb-3">{item.title}</h3>
                <p className="text-slate-600">{item.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* 4. CORE FEATURES */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp} className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Tenang, UpdatePTN Punya Semua yang Kamu Butuhkan.</h2>
            <p className="text-slate-600 max-w-2xl mx-auto">Ekosistem lengkap yang didesain khusus untuk melipatgandakan peluang kelulusanmu.</p>
          </motion.div>

          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer} className="grid md:grid-cols-2 gap-6">
            {[
              { title: "Try Out IRT Presisi", desc: "Rasakan sensasi ujian sesungguhnya. Sistem penilaian kami menggunakan algoritma IRT standar pusat dengan blocking time.", icon: Target },
              { title: "Analisis & Rasionalisasi", desc: "Algoritma UpdatePTN akan membedah skormu dan membandingkannya dengan ketetatan ribuan prodi se-Indonesia.", icon: BrainCircuit },
              { title: "Live Class & Rekaman", desc: "Ikuti kelas interaktif bersama tutor berpengalaman. Ketinggalan kelas? Akses rekaman videonya kapan saja.", icon: Video },
              { title: "Bank Soal Terupdate", desc: "Ribuan latihan soal TPS dan TKA yang disusun berdasarkan kisi-kisi terbaru dan pola soal tahun-tahun sebelumnya.", icon: BookOpen }
            ].map((feat, i) => (
              <motion.div key={i} variants={fadeInUp} className="group p-8 bg-slate-50 rounded-3xl border border-slate-100 hover:bg-blue-50 transition-colors">
                <div className="w-14 h-14 bg-white text-blue-600 rounded-2xl flex items-center justify-center mb-6 shadow-sm border border-slate-100 group-hover:border-blue-200 group-hover:scale-110 transition-all">
                  <feat.icon className="w-7 h-7" />
                </div>
                <h3 className="text-2xl font-bold mb-3">{feat.title}</h3>
                <p className="text-slate-600 leading-relaxed">{feat.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* 5. TESTIMONIALS */}
      <section className="py-24 px-6 bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp} className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Bukti Nyata, Bukan Sekadar Janji.</h2>
            <p className="text-slate-400">Dengarkan dari mereka yang telah berhasil menembus kampus impian bersama UpdatePTN.</p>
          </motion.div>

          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer} className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { name: "Nabila P.", univ: "Kedokteran UI", text: "Sistem IRT di UpdatePTN beneran mirip aslinya. Awalnya skor stuck di 400-an, semenjak ikut Live Class dan sering TO, akhirnya bisa tembus 720+!" },
              { name: "Kevin A.", univ: "Sistem Informasi ITB", text: "Fitur rasionalisasinya ngebantu banget buat nentuin pilihan kampus yang aman. UI-UX nya juga enak banget nggak bikin pusing buat belajar lama-lama." },
              { name: "Sarah D.", univ: "Ilmu Hukum UGM", text: "Bank soalnya gila sih lengkap banget. Pembahasannya juga detail. Nyesel baru tahu UpdatePTN pas udah mepet ujian." }
            ].map((testi, i) => (
              <motion.div key={i} variants={fadeInUp} className="bg-slate-800/50 p-8 rounded-3xl border border-slate-700 backdrop-blur-sm">
                <div className="flex gap-1 text-yellow-400 mb-6">
                  {[...Array(5)].map((_, i) => <Star key={i} className="w-5 h-5 fill-current" />)}
                </div>
                <p className="text-slate-300 italic mb-6 leading-relaxed">"{testi.text}"</p>
                <div>
                  <h4 className="font-bold text-white">{testi.name}</h4>
                  <p className="text-blue-400 text-sm">Lolos {testi.univ}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* 6. PRICING */}
      <section className="py-24 px-6 bg-slate-50">
        <div className="max-w-5xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp} className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Investasi Terbaik untuk Masa Depanmu.</h2>
            <p className="text-slate-600">Pilih paket belajar yang sesuai dengan kebutuhan persiapanmu.</p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8 items-center">
            {/* Starter Card */}
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp} className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
              <h3 className="text-2xl font-bold mb-2">Paket Starter</h3>
              <p className="text-slate-500 mb-6">Cocok untuk pemanasan awal.</p>
              <div className="mb-8">
                <span className="text-4xl font-extrabold">Gratis</span>
              </div>
              <ul className="space-y-4 mb-8">
                {["1x Akses Try Out Basic", "Akses Terbatas Direktori Kampus", "Rasionalisasi Basic", "Tanpa Live Class"].map((feat, i) => (
                  <li key={i} className="flex items-center gap-3 text-slate-600">
                    {i < 3 ? <CheckCircle2 className="w-5 h-5 text-green-500" /> : <XCircle className="w-5 h-5 text-slate-300" />}
                    {feat}
                  </li>
                ))}
              </ul>
              <Link href="/login" className="block w-full py-4 text-center rounded-xl font-bold bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors">
                Daftar Gratis
              </Link>
            </motion.div>

            {/* All Access Card */}
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp} className="relative bg-blue-600 p-8 rounded-3xl border border-blue-500 shadow-xl shadow-blue-600/20 text-white md:-my-4 z-10">
              <div className="absolute top-0 right-8 -translate-y-1/2 bg-yellow-400 text-yellow-900 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                Paling Populer
              </div>
              <h3 className="text-2xl font-bold mb-2">Paket All Access</h3>
              <p className="text-blue-200 mb-6">Senjata lengkap tembus PTN impian.</p>
              <div className="mb-8">
                <span className="text-lg line-through text-blue-300 mr-2">Rp 499.000</span>
                <span className="text-4xl font-extrabold">Rp 199.000</span>
              </div>
              <ul className="space-y-4 mb-8">
                {["Akses Unlimited Semua Try Out Premium", "Analisis Rasionalisasi VIP", "Akses Seluruh Rekaman Live Class", "Pembahasan PDF Eksklusif & Bank Soal Lengkap"].map((feat, i) => (
                  <li key={i} className="flex items-center gap-3 text-blue-100">
                    <CheckCircle2 className="w-5 h-5 text-yellow-400" />
                    {feat}
                  </li>
                ))}
              </ul>
              <Link href="/login" className="block w-full py-4 text-center rounded-xl font-bold bg-white text-blue-600 hover:bg-slate-50 transition-colors shadow-lg hover:shadow-white/20">
                Ambil Promo Sekarang
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 7. FAQ ACCORDION */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-3xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp} className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Pertanyaan yang Sering Diajukan</h2>
          </motion.div>

          <div className="space-y-4">
            {[
              { q: "Apa itu sistem penilaian IRT?", a: "Item Response Theory (IRT) adalah sistem penilaian dinamis di mana bobot nilai setiap soal bergantung pada seberapa banyak siswa lain yang menjawab benar atau salah pada soal tersebut. Persis seperti ujian aslinya!" },
              { q: "Apakah soal selalu di-update?", a: "Ya, tim akademik kami membedah dan menambahkan soal terbaru setiap bulan berdasarkan kisi-kisi dan tren soal tahun sebelumnya." },
              { q: "Bagaimana metode pembayarannya?", a: "Kami menerima berbagai metode pembayaran otomatis termasuk QRIS, GoPay, ShopeePay, DANA, dan transfer Bank/Virtual Account." },
              { q: "Apakah rekaman Live Class bisa diulang?", a: "Tentu saja! Untuk pengguna All Access, seluruh rekaman kelas dapat diakses kapan saja dan diulang berkali-kali sampai paham." }
            ].map((faq, i) => (
              <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp} key={i} className="border border-slate-200 rounded-2xl overflow-hidden">
                <button 
                  onClick={() => toggleFaq(i)}
                  className="w-full flex items-center justify-between p-6 text-left bg-white hover:bg-slate-50 transition-colors"
                >
                  <span className="font-bold text-lg">{faq.q}</span>
                  <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform duration-300 ${openFaq === i ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence>
                  {openFaq === i && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="px-6 pb-6 text-slate-600 bg-white"
                    >
                      {faq.a}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 8. FINAL CTA BANNER */}
      <section className="py-24 px-6 bg-slate-50">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp} className="max-w-5xl mx-auto bg-blue-600 rounded-[3rem] p-12 text-center text-white shadow-2xl relative overflow-hidden">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,white_1px,transparent_1px)] bg-size-[20px_20px]"></div>
          <h2 className="text-4xl md:text-5xl font-extrabold mb-6 relative z-10">
            Waktu Terus Berjalan.<br/>Pesaingmu Sudah Mulai Belajar.
          </h2>
          <p className="text-blue-100 text-lg md:text-xl mb-10 max-w-2xl mx-auto relative z-10">
            Ambil langkah pertamamu hari ini. Daftar sekarang dan lihat seberapa besar peluangmu menembus kampus impian.
          </p>
          <Link href="/login" className="relative z-10 inline-flex items-center justify-center bg-white text-blue-600 px-10 py-5 rounded-full text-lg font-bold hover:bg-slate-100 hover:scale-105 transition-all shadow-xl">
            Daftar Gratis Sekarang
          </Link>
        </motion.div>
      </section>

      {/* FOOTER */}
      <footer className="bg-white border-t border-slate-200 py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-2xl text-blue-600 tracking-tight">Update<span className="text-slate-900">PTN</span></span>
          </div>
          <p className="text-slate-500 text-sm">
            © UpdatePTN. Hak cipta dilindungi. Ekosistem Persiapan SNBT Terdepan.
          </p>
        </div>
      </footer>

=======
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
                  <div className="h-12 w-12 sm:h-14 sm:w-14 rounded-lg bg-white border border-slate-200/80 shadow-sm flex items-center justify-center p-2 hover:border-blue-300 hover:shadow-md transition-all grayscale hover:grayscale-0">
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
            {/* Free Starter Tier */}
            <StaggerItem>
              <MotionCard className="h-full rounded-3xl">
                <Card className="bg-white border border-slate-200/80 shadow-xs p-8 rounded-3xl flex flex-col justify-between space-y-6 h-full">
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <Badge variant="outline" className="text-xs font-bold border-slate-200 text-slate-600">
                        PAKET STARTER
                      </Badge>
                      <h3 className="text-2xl font-black text-slate-900">Gratis</h3>
                      <p className="text-xs text-slate-500">
                        Cocok untuk mencoba dan menguji kemampuan awal kamu secara cepat.
                      </p>
                    </div>

                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-black text-slate-900">Rp 0</span>
                      <span className="text-xs font-semibold text-slate-400">/ selamanya</span>
                    </div>

                    <ul className="space-y-3 text-xs text-slate-700 pt-2 border-t border-slate-100">
                      <li className="flex items-center gap-2.5">
                        <Check className="h-4 w-4 text-emerald-600 shrink-0" />
                        <span>1x Try Out IRT Full Subtes TPS & Literasi</span>
                      </li>
                      <li className="flex items-center gap-2.5">
                        <Check className="h-4 w-4 text-emerald-600 shrink-0" />
                        <span>Basic Cek Peluang PTN</span>
                      </li>
                      <li className="flex items-center gap-2.5">
                        <Check className="h-4 w-4 text-emerald-600 shrink-0" />
                        <span>Akses Direktori Kampus & Jurusan</span>
                      </li>
                      <li className="flex items-center gap-2.5 text-slate-400">
                        <Check className="h-4 w-4 text-slate-300 shrink-0" />
                        <span>Sistem Timer CBT Standard</span>
                      </li>
                    </ul>
                  </div>

                  <Link href="/register" className="w-full pt-4">
                    <Button variant="outline" className="w-full h-11 font-bold text-xs rounded-xl border-slate-200 text-slate-700 hover:bg-slate-50">
                      Daftar Akun Gratis
                    </Button>
                  </Link>
                </Card>
              </MotionCard>
            </StaggerItem>

            {/* All Access Premium Tier */}
            <StaggerItem>
              <MotionCard className="h-full rounded-3xl">
                <Card className="bg-slate-950 text-white border border-slate-800 shadow-2xl p-8 rounded-3xl flex flex-col justify-between space-y-6 h-full relative overflow-hidden">
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <Badge className="bg-blue-600 text-white font-bold text-xs">
                        POPULER & REKOMENDASI
                      </Badge>
                      <span className="text-[11px] font-bold text-emerald-400">Sekali Bayar</span>
                    </div>

                    <div className="space-y-1">
                      <h3 className="text-2xl font-black text-white">All Access Pass</h3>
                      <p className="text-xs text-slate-400">
                        Akses tanpa batas ke seluruh paket Try Out, Live Class, & Rasionalisasi.
                      </p>
                    </div>

                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-black text-white">Rp 199.000</span>
                      <span className="text-xs font-semibold text-slate-400">/ hingga SNBT</span>
                    </div>

                    <ul className="space-y-3 text-xs text-slate-300 pt-2 border-t border-slate-800">
                      <li className="flex items-center gap-2.5">
                        <Check className="h-4 w-4 text-blue-400 shrink-0" />
                        <span className="font-semibold text-white">Unlimited Try Out IRT Seri 01 - 20</span>
                      </li>
                      <li className="flex items-center gap-2.5">
                        <Check className="h-4 w-4 text-blue-400 shrink-0" />
                        <span className="font-semibold text-white">Cek Peluang PTN Presisi Tanpa Batas</span>
                      </li>
                      <li className="flex items-center gap-2.5">
                        <Check className="h-4 w-4 text-blue-400 shrink-0" />
                        <span>Akses Live Class & Download Rekaman HD 24/7</span>
                      </li>
                      <li className="flex items-center gap-2.5">
                        <Check className="h-4 w-4 text-blue-400 shrink-0" />
                        <span>Modul PDF Pembahasan & Bank Soal HOTS</span>
                      </li>
                      <li className="flex items-center gap-2.5">
                        <Check className="h-4 w-4 text-blue-400 shrink-0" />
                        <span>Konsultasi Pemilihan Jurusan & PTN</span>
                      </li>
                    </ul>
                  </div>

                  <Link href="/register" className="w-full pt-4">
                    <Button className="w-full h-12 font-bold text-xs bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-lg shadow-blue-500/25">
                      Pilih Paket All Access
                    </Button>
                  </Link>
                </Card>
              </MotionCard>
            </StaggerItem>
          </StaggerContainer>
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
>>>>>>> 856ccaee71bcd89c4d1542980f34c3986cd70e3e
    </div>
  );
}
