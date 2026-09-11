"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  CalendarDays,
  Users,
  Wallet,
  UserCircle2,
  Clock,
  ArrowUpRight,
  Sparkles,
  TrendingUp,
  ChevronRight,
  Video,
  FileText,
  Link as LinkIcon,
  CheckCircle2,
  DollarSign,
  Star,
  Plus,
  Award,
  CreditCard,
  Download,
  ExternalLink,
  BookOpen,
  Check,
  Search,
  Pencil,
  Save,
  Radio,
} from "lucide-react";

// --- TYPES ---
interface UpcomingSession {
  id: string;
  title: string;
  category: string;
  scheduled_at: string;
  time: string;
  meeting_url: string;
  studentCount: number;
  status: "upcoming" | "completed";
}

interface StudentItem {
  id: string;
  name: string;
  email: string;
  targetPtn: string;
  targetProdi: string;
  classGroup: string;
  attendanceRate: number;
  latestIrtScore: number;
  avatar: string;
}

interface MaterialItem {
  id: string;
  title: string;
  subtest: string;
  type: "pdf" | "video" | "slide";
  url: string;
  date: string;
  downloadsCount: number;
}

interface ProgressNoteItem {
  id: string;
  studentId: string;
  studentName: string;
  date: string;
  subtest: string;
  score: number;
  strengths: string;
  improvements: string;
  mentorNote: string;
}

interface IncomeLogItem {
  id: string;
  date: string;
  sessionTitle: string;
  durationMinutes: number;
  ratePerSession: number;
  platformFee: number;
  netPayout: number;
  status: "Lunas" | "Diproses";
}

interface WithdrawalItem {
  id: string;
  requestDate: string;
  amount: number;
  bankName: string;
  accountNumber: string;
  accountName: string;
  status: "Selesai" | "Diproses" | "Pending";
}

// --- SAMPLE DATA ---
const INITIAL_SESSIONS: UpcomingSession[] = [
  {
    id: "ses-1",
    title: "Bedah Trik Cepat IRT Penalaran Kuantitatif",
    category: "TPS - Kuantitatif",
    scheduled_at: "2026-09-12",
    time: "19:00 - 20:30 WIB",
    meeting_url: "https://zoom.us/j/987654321",
    studentCount: 32,
    status: "upcoming",
  },
  {
    id: "ses-2",
    title: "Analisa Paragraf & Teks Panjang PBM",
    category: "TPS - PBM",
    scheduled_at: "2026-09-14",
    time: "14:00 - 15:30 WIB",
    meeting_url: "https://meet.google.com/abc-defg-hij",
    studentCount: 28,
    status: "upcoming",
  },
  {
    id: "ses-3",
    title: "Konsep Dasar Logika & Penalaran Umum",
    category: "TPS - PU",
    scheduled_at: "2026-09-08",
    time: "19:00 - 20:30 WIB",
    meeting_url: "https://zoom.us/j/123456789",
    studentCount: 35,
    status: "completed",
  },
];

const INITIAL_STUDENTS: StudentItem[] = [
  {
    id: "std-1",
    name: "Amanda Zevanya",
    email: "amanda.z@gmail.com",
    targetPtn: "Universitas Indonesia (UI)",
    targetProdi: "Pendidikan Dokter",
    classGroup: "Intensif SNBT #1",
    attendanceRate: 95,
    latestIrtScore: 685,
    avatar: "AZ",
  },
  {
    id: "std-2",
    name: "Bagas Pratama",
    email: "bagas.pratama@gmail.com",
    targetPtn: "Institut Teknologi Bandung (ITB)",
    targetProdi: "Teknik Informatika",
    classGroup: "Intensif SNBT #1",
    attendanceRate: 90,
    latestIrtScore: 670,
    avatar: "BP",
  },
];

const INITIAL_MATERIALS: MaterialItem[] = [
  {
    id: "mat-1",
    title: "Bedah Soal Penalaran Kuantitatif & Trik Cepat IRT",
    subtest: "Pengetahuan Kuantitatif (PK)",
    type: "pdf",
    url: "#",
    date: "2026-09-08",
    downloadsCount: 142,
  },
  {
    id: "mat-2",
    title: "Konsep Dasar & Strategi Pengerjaan Teks Panjang PBM",
    subtest: "Pemahaman Bacaan & Menulis (PBM)",
    type: "pdf",
    url: "#",
    date: "2026-09-05",
    downloadsCount: 198,
  },
];

const INITIAL_NOTES: ProgressNoteItem[] = [
  {
    id: "note-1",
    studentId: "std-1",
    studentName: "Amanda Zevanya",
    date: "2026-09-10",
    subtest: "Pengetahuan Kuantitatif",
    score: 685,
    strengths: "Memahami konsep logika aritmatika dan aljabar dengan sangat baik.",
    improvements: "Perlu meningkatkan ketelitian pada soal geometri berbasis spasial.",
    mentorNote: "Konsistensi tinggi. Berpeluang besar lolos FK UI jika mempertahankan grafik IRT.",
  },
];

const INITIAL_INCOME: IncomeLogItem[] = [
  {
    id: "inc-1",
    date: "2026-09-10",
    sessionTitle: "Live Class PK: Trik Cepat IRT & Aljabar Spasial",
    durationMinutes: 90,
    ratePerSession: 200000,
    platformFee: 20000,
    netPayout: 180000,
    status: "Lunas",
  },
  {
    id: "inc-2",
    date: "2026-09-08",
    sessionTitle: "Live Class PBM: Strategi Teks Panjang & Analisa Paragraf",
    durationMinutes: 90,
    ratePerSession: 200000,
    platformFee: 20000,
    netPayout: 180000,
    status: "Lunas",
  },
];

const INITIAL_WITHDRAWALS: WithdrawalItem[] = [
  {
    id: "wd-101",
    requestDate: "2026-09-01",
    amount: 1500000,
    bankName: "Bank BCA",
    accountNumber: "8830192841",
    accountName: "Ahmad Rizky",
    status: "Selesai",
  },
];

const WEEKDAYS = [
  { key: "senin", label: "Senin" },
  { key: "selasa", label: "Selasa" },
  { key: "rabu", label: "Rabu" },
  { key: "kamis", label: "Kamis" },
  { key: "jumat", label: "Jumat" },
  { key: "sabtu", label: "Sabtu" },
  { key: "minggu", label: "Minggu" },
];

export default function MentorHomePage() {
  const [activeModuleTab, setActiveModuleTab] = useState<
    "overview" | "jadwal" | "siswa" | "keuangan" | "profil"
  >("overview");

  const [mentorName, setMentorName] = useState("Mentor");
  const [loading, setLoading] = useState(true);

  // States for 4 modules
  const [sessions, setSessions] = useState<UpcomingSession[]>(INITIAL_SESSIONS);
  const [students, setStudents] = useState<StudentItem[]>(INITIAL_STUDENTS);
  const [materials, setMaterials] = useState<MaterialItem[]>(INITIAL_MATERIALS);
  const [notes, setNotes] = useState<ProgressNoteItem[]>(INITIAL_NOTES);
  const [incomeLogs, setIncomeLogs] = useState<IncomeLogItem[]>(INITIAL_INCOME);
  const [withdrawals, setWithdrawals] = useState<WithdrawalItem[]>(INITIAL_WITHDRAWALS);

  // Financial Balance State
  const [availableBalance, setAvailableBalance] = useState(3810000);
  const [isPayoutModalOpen, setIsPayoutModalOpen] = useState(false);
  const [payoutForm, setPayoutForm] = useState({
    bankName: "Bank BCA",
    accountNumber: "8830192841",
    accountName: "Ahmad Rizky",
    amount: 1000000,
  });

  // Profile Settings State
  const [hourlyRate, setHourlyRate] = useState(150000);
  const [availability, setAvailability] = useState<Record<string, string[]>>({
    senin: ["09:00 - 11:00", "19:00 - 21:00"],
    selasa: ["14:00 - 16:00", "19:00 - 21:00"],
    rabu: ["09:00 - 11:00", "19:00 - 21:00"],
    kamis: ["14:00 - 16:00"],
    jumat: ["19:00 - 21:00"],
    sabtu: ["09:00 - 11:00", "14:00 - 16:00"],
    minggu: [],
  });

  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", user.id)
        .maybeSingle();

      const name =
        profile?.full_name ||
        user.user_metadata?.full_name ||
        user.email?.split("@")[0] ||
        "Tentor";
      setMentorName(name);
    } catch (err) {
      console.error("fetchProfileData error:", err);
    } finally {
      setLoading(false);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Selamat Pagi";
    if (hour < 15) return "Selamat Siang";
    if (hour < 18) return "Selamat Sore";
    return "Selamat Malam";
  };

  const handleRequestPayout = () => {
    if (payoutForm.amount < 100000) {
      alert("Minimal pencairan dana adalah Rp 100.000");
      return;
    }
    if (payoutForm.amount > availableBalance) {
      alert("Jumlah pencairan melebihi saldo yang tersedia.");
      return;
    }

    const newWd: WithdrawalItem = {
      id: `wd-${Date.now()}`,
      requestDate: new Date().toISOString().split("T")[0],
      amount: Number(payoutForm.amount),
      bankName: payoutForm.bankName,
      accountNumber: payoutForm.accountNumber,
      accountName: payoutForm.accountName,
      status: "Diproses",
    };

    setWithdrawals([newWd, ...withdrawals]);
    setAvailableBalance(availableBalance - Number(payoutForm.amount));
    setIsPayoutModalOpen(false);
    alert("Permintaan pencairan dana berhasil diajukan!");
  };

  const toggleSlot = (dayKey: string, slot: string) => {
    const current = availability[dayKey] || [];
    const exists = current.includes(slot);
    const updated = exists ? current.filter((s) => s !== slot) : [...current, slot];
    setAvailability({ ...availability, [dayKey]: updated });
  };

  const upcomingOnly = sessions.filter((s) => s.status === "upcoming");
  const completedOnly = sessions.filter((s) => s.status === "completed");

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Top Header Hero */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 p-8 text-white shadow-xl shadow-blue-200">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-32 translate-x-32 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-400/20 rounded-full translate-y-24 -translate-x-24 blur-2xl" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="h-4 w-4 text-blue-200" />
              <span className="text-blue-200 text-sm font-semibold">
                {getGreeting()}, Tentor!
              </span>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight mb-1">
              {loading ? "..." : mentorName}
            </h1>
            <p className="text-blue-200 text-sm max-w-lg leading-relaxed">
              Dashboard Utama Tentor UpdatePTN — Kelola 4 modul utama: Jadwal Mengajar, Manajemen Siswa, Keuangan, dan Pengaturan Profil.
            </p>
          </div>

          <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl px-5 py-3 shrink-0">
            <TrendingUp className="h-6 w-6 text-blue-200" />
            <div>
              <p className="text-xs text-blue-200 font-semibold">Status Akun</p>
              <p className="text-base font-extrabold">Tentor Resmi Terverifikasi</p>
            </div>
          </div>
        </div>
      </div>

      {/* 4 Core Module Filter Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-3">
        <button
          onClick={() => setActiveModuleTab("overview")}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeModuleTab === "overview"
              ? "bg-blue-600 text-white shadow-sm"
              : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
          }`}
        >
          📊 Overview Dashboard
        </button>
        <button
          onClick={() => setActiveModuleTab("jadwal")}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeModuleTab === "jadwal"
              ? "bg-blue-600 text-white shadow-sm"
              : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
          }`}
        >
          📅 1. Jadwal Mengajar ({upcomingOnly.length} Mendatang)
        </button>
        <button
          onClick={() => setActiveModuleTab("siswa")}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeModuleTab === "siswa"
              ? "bg-blue-600 text-white shadow-sm"
              : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
          }`}
        >
          👨‍🎓 2. Manajemen Siswa &amp; Kelas ({students.length} Siswa)
        </button>
        <button
          onClick={() => setActiveModuleTab("keuangan")}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeModuleTab === "keuangan"
              ? "bg-blue-600 text-white shadow-sm"
              : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
          }`}
        >
          💰 3. Keuangan &amp; Pendapatan
        </button>
        <button
          onClick={() => setActiveModuleTab("profil")}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeModuleTab === "profil"
              ? "bg-blue-600 text-white shadow-sm"
              : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
          }`}
        >
          ⚙️ 4. Pengaturan Profil &amp; Tarif
        </button>
      </div>

      {/* OVERVIEW MODULE TAB */}
      {activeModuleTab === "overview" && (
        <div className="space-y-6">
          {/* Summary Metric Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="p-5 bg-white border border-slate-200 rounded-2xl">
              <div className="flex items-center justify-between mb-3">
                <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600">
                  <CalendarDays className="h-5 w-5" />
                </div>
                <Badge variant="outline" className="text-[10px] font-semibold bg-blue-50 text-blue-700 border-blue-200">
                  Aktif
                </Badge>
              </div>
              <p className="text-2xl font-extrabold text-slate-900 mb-0.5">{upcomingOnly.length} Sesi</p>
              <p className="text-xs font-bold text-slate-700">Jadwal Mengajar</p>
              <p className="text-[11px] text-slate-400 mt-1">Sesi mendatang</p>
            </Card>

            <Card className="p-5 bg-white border border-slate-200 rounded-2xl">
              <div className="flex items-center justify-between mb-3">
                <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600">
                  <Users className="h-5 w-5" />
                </div>
                <Badge variant="outline" className="text-[10px] font-semibold bg-emerald-50 text-emerald-700 border-emerald-200">
                  Intensif
                </Badge>
              </div>
              <p className="text-2xl font-extrabold text-slate-900 mb-0.5">{students.length} Siswa</p>
              <p className="text-xs font-bold text-slate-700">Manajemen Siswa</p>
              <p className="text-[11px] text-slate-400 mt-1">Siswa diampu aktif</p>
            </Card>

            <Card className="p-5 bg-white border border-slate-200 rounded-2xl">
              <div className="flex items-center justify-between mb-3">
                <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600">
                  <Wallet className="h-5 w-5" />
                </div>
                <Badge variant="outline" className="text-[10px] font-semibold bg-indigo-50 text-indigo-700 border-indigo-200">
                  Siap Cair
                </Badge>
              </div>
              <p className="text-2xl font-extrabold text-slate-900 mb-0.5">Rp 3.81M</p>
              <p className="text-xs font-bold text-slate-700">Keuangan Tentor</p>
              <p className="text-[11px] text-slate-400 mt-1">Saldo akumulasi honor</p>
            </Card>

            <Card className="p-5 bg-white border border-slate-200 rounded-2xl">
              <div className="flex items-center justify-between mb-3">
                <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600">
                  <Star className="h-5 w-5" />
                </div>
                <Badge variant="outline" className="text-[10px] font-semibold bg-amber-50 text-amber-700 border-amber-200">
                  Rating Top
                </Badge>
              </div>
              <p className="text-2xl font-extrabold text-slate-900 mb-0.5">4.95 ★</p>
              <p className="text-xs font-bold text-slate-700">Pengaturan Profil</p>
              <p className="text-[11px] text-slate-400 mt-1">Berdasarkan ulasan siswa</p>
            </Card>
          </div>

          {/* Core Feature Sections Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            {/* Left 3 Columns: Upcoming Sessions & Student Progress */}
            <div className="lg:col-span-3 space-y-6">
              {/* Module 1 Widget: Sesi Mendatang & Link Meeting */}
              <Card className="p-5 bg-white border border-slate-200 rounded-2xl space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                    <CalendarDays className="h-4.5 w-4.5 text-blue-600" />
                    1. Sesi Mengajar Mendatang &amp; Tautan Meeting
                  </h3>
                  <button onClick={() => setActiveModuleTab("jadwal")} className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1">
                    Lihat Selengkapnya <ChevronRight className="h-3.5 w-3.5" />
                  </button>
                </div>

                <div className="space-y-3">
                  {upcomingOnly.map((ses) => (
                    <div key={ses.id} className="p-3.5 bg-slate-50 border border-slate-200/70 rounded-xl flex items-center justify-between gap-3">
                      <div>
                        <Badge variant="outline" className="text-[10px] font-bold bg-blue-50 text-blue-700 border-blue-200 mb-1">
                          {ses.category}
                        </Badge>
                        <h4 className="text-xs font-bold text-slate-900">{ses.title}</h4>
                        <p className="text-[11px] text-slate-500 mt-0.5">{ses.scheduled_at} · {ses.time}</p>
                      </div>

                      <a
                        href={ses.meeting_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition-colors"
                      >
                        <LinkIcon className="h-3 w-3" />
                        <span>Join Zoom</span>
                      </a>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Module 2 Widget: Evaluasi & Catatan Siswa */}
              <Card className="p-5 bg-white border border-slate-200 rounded-2xl space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                    <Users className="h-4.5 w-4.5 text-blue-600" />
                    2. Catatan Perkembangan Siswa Terkini
                  </h3>
                  <button onClick={() => setActiveModuleTab("siswa")} className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1">
                    Kelola Siswa <ChevronRight className="h-3.5 w-3.5" />
                  </button>
                </div>

                {notes.map((n) => (
                  <div key={n.id} className="p-3.5 bg-blue-50/50 border border-blue-100 rounded-xl text-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900">{n.studentName}</span>
                      <Badge className="bg-blue-100 text-blue-800 text-[10px] font-bold">Skor IRT: {n.score}</Badge>
                    </div>
                    <p className="text-slate-700 leading-relaxed"><span className="font-bold">Analisis Tentor:</span> {n.mentorNote}</p>
                  </div>
                ))}
              </Card>
            </div>

            {/* Right 2 Columns: Keuangan Widget & Profil Tarif */}
            <div className="lg:col-span-2 space-y-6">
              {/* Module 3 Widget: Keuangan */}
              <Card className="p-5 bg-slate-900 text-white rounded-2xl space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-400">3. Keuangan &amp; Pendapatan</span>
                  <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30 text-[10px] font-bold">
                    Siap Cair
                  </Badge>
                </div>
                <div>
                  <p className="text-2xl font-extrabold tracking-tight">Rp {availableBalance.toLocaleString("id-ID")}</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">Sudah dipotong komisi platform 10%</p>
                </div>
                <Button onClick={() => setIsPayoutModalOpen(true)} className="w-full h-10 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs gap-2">
                  <CreditCard className="h-3.5 w-3.5" />
                  <span>Tarik Dana (Pencairan)</span>
                </Button>
              </Card>

              {/* Module 4 Widget: Tariff & Availability */}
              <Card className="p-5 bg-white border border-slate-200 rounded-2xl space-y-3">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <UserCircle2 className="h-4 w-4 text-blue-600" />
                  4. Tarif &amp; Ketersediaan Jam
                </h3>
                <div className="p-3 bg-slate-50 border border-slate-200/70 rounded-xl text-xs space-y-1">
                  <p className="text-[11px] text-slate-400 font-semibold">Tarif Mengajar Sesi</p>
                  <p className="font-extrabold text-blue-700 text-sm">Rp {hourlyRate.toLocaleString("id-ID")} / 90 menit</p>
                </div>
                <button onClick={() => setActiveModuleTab("profil")} className="w-full text-center text-xs font-bold text-blue-600 hover:underline">
                  Atur Ketersediaan Jam &amp; Sertifikasi →
                </button>
              </Card>
            </div>
          </div>
        </div>
      )}

      {/* MODULE 1 TAB: JADWAL MENGAJAR */}
      {activeModuleTab === "jadwal" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-white border border-slate-200 p-5 rounded-2xl">
            <div>
              <h2 className="text-lg font-extrabold text-slate-900">Modul 1: Jadwal Mengajar Tentor</h2>
              <p className="text-xs text-slate-500 mt-0.5">Kelola sesi mendatang, riwayat kelas selesai, dan tautan Zoom/Google Meet.</p>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">📌 Sesi Mendatang</h3>
            {upcomingOnly.map((ses) => (
              <Card key={ses.id} className="p-5 bg-white border border-slate-200 rounded-2xl flex items-center justify-between gap-4">
                <div>
                  <Badge className="bg-blue-100 text-blue-800 border-blue-200 text-[10px] font-bold mb-1">{ses.category}</Badge>
                  <h4 className="text-sm font-bold text-slate-900">{ses.title}</h4>
                  <p className="text-xs text-slate-500 mt-1">{ses.scheduled_at} · {ses.time} · {ses.studentCount} Siswa</p>
                </div>
                <a href={ses.meeting_url} target="_blank" rel="noopener noreferrer" className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-2">
                  <LinkIcon className="h-4 w-4" /> Buka Link Meeting
                </a>
              </Card>
            ))}

            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider pt-3">✅ Riwayat Sesi Selesai</h3>
            {completedOnly.map((ses) => (
              <Card key={ses.id} className="p-4 bg-white border border-slate-200 rounded-2xl flex items-center justify-between gap-4">
                <div>
                  <h4 className="text-xs font-bold text-slate-900">{ses.title}</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">{ses.scheduled_at} · Selesai 90m</p>
                </div>
                <Badge className="bg-slate-100 text-slate-700 border-slate-200 text-xs font-semibold">Tuntas</Badge>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* MODULE 2 TAB: MANAJEMEN SISWA DAN KELAS */}
      {activeModuleTab === "siswa" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-white border border-slate-200 p-5 rounded-2xl">
            <div>
              <h2 className="text-lg font-extrabold text-slate-900">Modul 2: Manajemen Siswa dan Kelas</h2>
              <p className="text-xs text-slate-500 mt-0.5">Daftar siswa yang diampu, materi pembelajaran, dan catatan perkembangan IRT.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {students.map((std) => (
              <Card key={std.id} className="p-5 bg-white border border-slate-200 rounded-2xl space-y-3">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10 border border-blue-200">
                    <AvatarFallback className="bg-blue-600 text-white font-bold text-xs">{std.avatar}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">{std.name}</h4>
                    <p className="text-xs text-slate-500">{std.targetPtn} - {std.targetProdi}</p>
                  </div>
                </div>
                <div className="pt-2 border-t border-slate-100 flex justify-between text-xs font-semibold text-slate-700">
                  <span>Kehadiran: {std.attendanceRate}%</span>
                  <span className="text-emerald-600 font-extrabold">Skor IRT: {std.latestIrtScore}</span>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* MODULE 3 TAB: KEUANGAN DAN PENDAPATAN */}
      {activeModuleTab === "keuangan" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-white border border-slate-200 p-5 rounded-2xl">
            <div>
              <h2 className="text-lg font-extrabold text-slate-900">Modul 3: Keuangan dan Pendapatan</h2>
              <p className="text-xs text-slate-500 mt-0.5">Laporan honor mengajar, potongan komisi platform, dan pencairan dana.</p>
            </div>
            <Button onClick={() => setIsPayoutModalOpen(true)} className="rounded-xl bg-blue-600 text-white font-bold text-xs gap-2">
              <CreditCard className="h-4 w-4" /> Tarik Dana
            </Button>
          </div>

          <Card className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50">
                  <TableHead className="text-xs font-bold">Sesi</TableHead>
                  <TableHead className="text-xs font-bold">Gross</TableHead>
                  <TableHead className="text-xs font-bold">Komisi (10%)</TableHead>
                  <TableHead className="text-xs font-bold">Honor Bersih</TableHead>
                  <TableHead className="text-xs font-bold text-right">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {incomeLogs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="text-xs font-bold text-slate-900">{log.sessionTitle}</TableCell>
                    <TableCell className="text-xs font-semibold">Rp {log.ratePerSession.toLocaleString("id-ID")}</TableCell>
                    <TableCell className="text-xs text-rose-600 font-semibold">-Rp {log.platformFee.toLocaleString("id-ID")}</TableCell>
                    <TableCell className="text-xs font-extrabold text-emerald-600">Rp {log.netPayout.toLocaleString("id-ID")}</TableCell>
                    <TableCell className="text-right"><Badge className="bg-emerald-100 text-emerald-800 text-[10px] font-bold">{log.status}</Badge></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </div>
      )}

      {/* MODULE 4 TAB: PENGATURAN PROFIL */}
      {activeModuleTab === "profil" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-white border border-slate-200 p-5 rounded-2xl">
            <div>
              <h2 className="text-lg font-extrabold text-slate-900">Modul 4: Pengaturan Profil Tentor</h2>
              <p className="text-xs text-slate-500 mt-0.5">Formulir tarif mengajar, ketersediaan jam harian, dan sertifikasi.</p>
            </div>
          </div>

          <Card className="p-6 bg-white border border-slate-200 rounded-2xl space-y-4">
            <div className="space-y-2">
              <Label className="text-xs font-bold text-slate-700">Tarif Mengajar Sesi (Rp / 90m)</Label>
              <Input type="number" value={hourlyRate} onChange={(e) => setHourlyRate(Number(e.target.value))} className="rounded-xl text-xs font-bold text-blue-700 max-w-xs" />
            </div>

            <div className="space-y-3 pt-3 border-t border-slate-100">
              <Label className="text-xs font-bold text-slate-700">Ketersediaan Jam Harian</Label>
              {WEEKDAYS.map((day) => {
                const activeSlots = availability[day.key] || [];
                return (
                  <div key={day.key} className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between gap-3">
                    <span className="text-xs font-bold text-slate-800 w-24">{day.label}</span>
                    <div className="flex gap-2">
                      {["09:00 - 11:00", "14:00 - 16:00", "19:00 - 21:00"].map((slot) => {
                        const isSelected = activeSlots.includes(slot);
                        return (
                          <button
                            key={slot}
                            onClick={() => toggleSlot(day.key, slot)}
                            className={`px-3 py-1 rounded-lg text-xs font-semibold ${isSelected ? "bg-blue-600 text-white" : "bg-white text-slate-600 border border-slate-200"}`}
                          >
                            {slot}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      )}

      {/* DIALOG PAYOUT / PENCAIRAN DANA */}
      <Dialog open={isPayoutModalOpen} onOpenChange={setIsPayoutModalOpen}>
        <DialogContent className="max-w-md rounded-2xl p-6">
          <DialogHeader>
            <DialogTitle className="text-lg font-extrabold text-slate-900">Formulir Pencairan Dana Tentor</DialogTitle>
            <DialogDescription className="text-xs text-slate-500">Tarik saldo honor mengajar Anda ke rekening bank pribadi.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2 text-xs">
            <div className="p-3 bg-blue-50 rounded-xl flex justify-between font-bold text-blue-800">
              <span>Saldo Tersedia:</span>
              <span>Rp {availableBalance.toLocaleString("id-ID")}</span>
            </div>
            <div className="space-y-1">
              <Label className="font-bold text-slate-700">Bank / E-Wallet</Label>
              <select value={payoutForm.bankName} onChange={(e) => setPayoutForm({ ...payoutForm, bankName: e.target.value })} className="w-full h-9 border rounded-xl px-2 font-semibold">
                <option value="Bank BCA">Bank BCA</option>
                <option value="Bank Mandiri">Bank Mandiri</option>
                <option value="Bank BNI">Bank BNI</option>
              </select>
            </div>
            <div className="space-y-1">
              <Label className="font-bold text-slate-700">Nomor Rekening</Label>
              <Input value={payoutForm.accountNumber} onChange={(e) => setPayoutForm({ ...payoutForm, accountNumber: e.target.value })} className="rounded-xl h-9 text-xs" />
            </div>
            <div className="space-y-1">
              <Label className="font-bold text-slate-700">Jumlah Penarikan (Rp)</Label>
              <Input type="number" value={payoutForm.amount} onChange={(e) => setPayoutForm({ ...payoutForm, amount: Number(e.target.value) })} className="rounded-xl h-9 text-xs font-bold" />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setIsPayoutModalOpen(false)} className="rounded-xl text-xs font-bold">Batal</Button>
            <Button onClick={handleRequestPayout} className="rounded-xl bg-blue-600 text-white font-bold text-xs">Ajukan Pencairan</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
