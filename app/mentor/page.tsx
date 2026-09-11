"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
} from "lucide-react";

interface UpcomingSession {
  id: string;
  title: string;
  category: string;
  scheduled_at: string;
  time: string;
  meeting_url: string;
  studentCount: number;
}

export default function MentorHomePage() {
  const [mentorName, setMentorName] = useState("Mentor");
  const [loading, setLoading] = useState(true);
  const [upcomingSessions, setUpcomingSessions] = useState<UpcomingSession[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
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

      // Fetch live class schedules for mentor
      const { data: lcData } = await supabase
        .from("live_classes")
        .select("*")
        .order("scheduled_at", { ascending: true })
        .limit(4);

      if (lcData && lcData.length > 0) {
        const mapped = lcData.map((lc: any) => ({
          id: lc.id,
          title: lc.title || "Sesi Pembimbingan UTBK-SNBT",
          category: lc.category || "TPS - Kuantitatif",
          scheduled_at: lc.scheduled_at || "2026-09-12",
          time: lc.time || "19:00 - 20:30 WIB",
          meeting_url: lc.meeting_url || "https://zoom.us/j/123456789",
          studentCount: 24,
        }));
        setUpcomingSessions(mapped);
      } else {
        // Fallback default sample sessions if table is empty
        setUpcomingSessions([
          {
            id: "ses-1",
            title: "Bedah Trik Cepat IRT Penalaran Kuantitatif",
            category: "TPS - Kuantitatif",
            scheduled_at: "2026-09-12",
            time: "19:00 - 20:30 WIB",
            meeting_url: "https://zoom.us/j/987654321",
            studentCount: 32,
          },
          {
            id: "ses-2",
            title: "Analisa Paragraf & Teks Panjang PBM",
            category: "TPS - PBM",
            scheduled_at: "2026-09-14",
            time: "14:00 - 15:30 WIB",
            meeting_url: "https://meet.google.com/abc-defg-hij",
            studentCount: 28,
          },
        ]);
      }
    } catch (err) {
      console.error("fetchData error:", err);
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

  const summaryCards = [
    {
      title: "Jadwal Mendatang",
      value: loading ? "—" : `${upcomingSessions.length} Sesi`,
      sub: "Live class & private coaching",
      icon: CalendarDays,
      bg: "bg-blue-50",
      textColor: "text-blue-600",
      href: "/mentor/jadwal",
    },
    {
      title: "Manajemen Siswa",
      value: "4 Siswa",
      sub: "Siswa diampu aktif",
      icon: Users,
      bg: "bg-blue-50",
      textColor: "text-blue-600",
      href: "/mentor/siswa-kelas",
    },
    {
      title: "Saldo Siap Cair",
      value: "Rp 3.810.000",
      sub: "Penghasilan mengajar",
      icon: Wallet,
      bg: "bg-emerald-50",
      textColor: "text-emerald-600",
      href: "/mentor/keuangan",
    },
    {
      title: "Rating Mengajar",
      value: "4.95 ★",
      sub: "Berdasarkan ulasan siswa",
      icon: Star,
      bg: "bg-amber-50",
      textColor: "text-amber-600",
      href: "/mentor/profil",
    },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Hero Banner */}
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
              Selamat datang di Panel khusus Tentor UpdatePTN. Kelola jadwal mengajar, evaluasi progres siswa, dan pantau penghasilan mengajar Anda di satu tempat.
            </p>
          </div>

          <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl px-5 py-3 shrink-0">
            <TrendingUp className="h-6 w-6 text-blue-200" />
            <div>
              <p className="text-xs text-blue-200 font-semibold">Status Tentor</p>
              <p className="text-base font-extrabold">Aktif &amp; Terverifikasi</p>
            </div>
          </div>
        </div>
      </div>

      {/* Grid Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {summaryCards.map((card) => {
          const Icon = card.icon;
          return (
            <Link key={card.title} href={card.href}>
              <Card className="p-5 bg-white border border-slate-200 rounded-2xl hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer group">
                <div className="flex items-start justify-between mb-3">
                  <div className={`${card.bg} p-2.5 rounded-xl group-hover:scale-105 transition-transform`}>
                    <Icon className={`h-5 w-5 ${card.textColor}`} />
                  </div>
                  <ArrowUpRight className={`h-4 w-4 ${card.textColor} opacity-0 group-hover:opacity-100 transition-opacity`} />
                </div>
                <p className="text-2xl font-extrabold text-slate-900 mb-0.5">
                  {card.value}
                </p>
                <p className="text-xs font-bold text-slate-700 mb-0.5">
                  {card.title}
                </p>
                <p className="text-[11px] text-slate-400">{card.sub}</p>
              </Card>
            </Link>
          );
        })}
      </div>

      {/* Main Feature Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Left 3 Columns: Jadwal Sesi & Manajemen Siswa */}
        <div className="lg:col-span-3 space-y-6">
          {/* Section: Jadwal Mengajar Mendatang */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <CalendarDays className="h-4.5 w-4.5 text-blue-600" />
                Jadwal Mengajar Mendatang
              </h2>
              <Link href="/mentor/jadwal">
                <Button variant="ghost" size="sm" className="text-blue-600 hover:bg-blue-50 text-xs font-bold gap-1 rounded-xl">
                  Lihat Semua Jadwal <ChevronRight className="h-3.5 w-3.5" />
                </Button>
              </Link>
            </div>

            <div className="space-y-3">
              {upcomingSessions.map((ses) => (
                <Card key={ses.id} className="p-4 bg-white border border-slate-200 rounded-2xl hover:border-blue-200 transition-all shadow-xs">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className="text-[10px] font-bold bg-blue-50 text-blue-700 border-blue-200">
                          {ses.category}
                        </Badge>
                        <span className="text-[11px] text-slate-400 font-medium">
                          {ses.studentCount} Siswa Terdaftar
                        </span>
                      </div>
                      <h3 className="text-sm font-bold text-slate-900 truncate">
                        {ses.title}
                      </h3>
                      <div className="flex items-center gap-3 mt-2 text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                          <CalendarDays className="h-3.5 w-3.5 text-slate-400" />
                          {ses.scheduled_at}
                        </span>
                        <span className="flex items-center gap-1 font-semibold text-slate-700">
                          <Clock className="h-3.5 w-3.5 text-blue-600" />
                          {ses.time}
                        </span>
                      </div>
                    </div>

                    <a
                      href={ses.meeting_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="shrink-0 inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition-colors"
                    >
                      <LinkIcon className="h-3.5 w-3.5" />
                      <span>Buka Meeting</span>
                    </a>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Section: Ringkasan Catatan Perkembangan Siswa */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <Users className="h-4.5 w-4.5 text-blue-600" />
                Evaluasi Progres Siswa Terkini
              </h2>
              <Link href="/mentor/siswa-kelas">
                <Button variant="ghost" size="sm" className="text-blue-600 hover:bg-blue-50 text-xs font-bold gap-1 rounded-xl">
                  Kelola Siswa <ChevronRight className="h-3.5 w-3.5" />
                </Button>
              </Link>
            </div>

            <Card className="p-5 bg-white border border-slate-200 rounded-2xl space-y-3 shadow-xs">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Amanda Zevanya</h4>
                  <p className="text-xs text-slate-500">Target: FK UI · Skor IRT Terakhir: 685 Poin</p>
                </div>
                <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 text-[10px] font-bold">
                  Grafik Meningkat
                </Badge>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                <span className="font-bold text-slate-800">Catatan Tentor:</span> Pemahaman konsep Penalaran Kuantitatif meningkat pesat. Perlu latihan fokus pada soal geometri berbasis spasial.
              </p>
            </Card>
          </div>
        </div>

        {/* Right 2 Columns: Keuangan & Quick Actions */}
        <div className="lg:col-span-2 space-y-6">
          {/* Ringkasan Keuangan Widget */}
          <div className="space-y-4">
            <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <Wallet className="h-4.5 w-4.5 text-blue-600" />
              Keuangan &amp; Saldo
            </h2>

            <Card className="p-5 bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-2xl space-y-4 shadow-md">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400 font-semibold">Saldo Siap Cair</span>
                <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30 text-[10px] font-bold">
                  BCA - 8830192841
                </Badge>
              </div>
              <div>
                <p className="text-2xl font-extrabold tracking-tight">Rp 3.810.000</p>
                <p className="text-[11px] text-slate-400 mt-1">Potongan platform 10% sudah termasuk</p>
              </div>
              <Link href="/mentor/keuangan">
                <Button className="w-full h-10 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs gap-2">
                  <span>Tarik Dana (Pencairan)</span>
                  <ChevronRight className="h-3.5 w-3.5" />
                </Button>
              </Link>
            </Card>
          </div>

          {/* Quick Actions Grid */}
          <div className="space-y-4">
            <h2 className="text-base font-extrabold text-slate-900">⚡ Aksi Cepat Tentor</h2>
            <div className="grid grid-cols-1 gap-2.5">
              <Link href="/mentor/jadwal">
                <Button variant="outline" className="w-full justify-between h-11 px-4 rounded-xl border-slate-200 text-slate-700 hover:bg-slate-50 font-bold text-xs">
                  <span className="flex items-center gap-2">
                    <CalendarDays className="h-4 w-4 text-blue-600" />
                    Atur Jadwal Mengajar
                  </span>
                  <ChevronRight className="h-4 w-4 text-slate-400" />
                </Button>
              </Link>
              <Link href="/mentor/siswa-kelas">
                <Button variant="outline" className="w-full justify-between h-11 px-4 rounded-xl border-slate-200 text-slate-700 hover:bg-slate-50 font-bold text-xs">
                  <span className="flex items-center gap-2">
                    <Plus className="h-4 w-4 text-blue-600" />
                    Tambah Catatan Perkembangan Siswa
                  </span>
                  <ChevronRight className="h-4 w-4 text-slate-400" />
                </Button>
              </Link>
              <Link href="/mentor/profil">
                <Button variant="outline" className="w-full justify-between h-11 px-4 rounded-xl border-slate-200 text-slate-700 hover:bg-slate-50 font-bold text-xs">
                  <span className="flex items-center gap-2">
                    <UserCircle2 className="h-4 w-4 text-blue-600" />
                    Update Tarif &amp; Ketersediaan Jam
                  </span>
                  <ChevronRight className="h-4 w-4 text-slate-400" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
