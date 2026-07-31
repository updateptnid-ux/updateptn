"use client";

import { useState } from "react";
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

    </div>
  );
}
