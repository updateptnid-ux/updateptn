"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Video,
  PlaySquare,
  BookOpen,
  CalendarDays,
  Users,
  Clock,
  ArrowUpRight,
  Radio,
  Sparkles,
  TrendingUp,
  ChevronRight,
} from "lucide-react";

interface LiveClass {
  id: string;
  title: string;
  tutor_name: string;
  category: string;
  scheduled_at: string;
  time: string;
  status: "upcoming" | "ongoing" | "completed";
  is_premium: boolean;
}

interface VideoItem {
  id: string;
  title: string;
  category: string;
  created_at: string;
  is_premium: boolean;
}

export default function MentorHomePage() {
  const [liveClasses, setLiveClasses] = useState<LiveClass[]>([]);
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [mentorName, setMentorName] = useState("Mentor");
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalLiveClass: 0,
    upcomingClass: 0,
    totalVideo: 0,
    totalModul: 0,
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const supabase = createClient();

      // Get current user
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      // Get profile name
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", user.id)
        .maybeSingle();

      const name =
        profile?.full_name ||
        user.user_metadata?.full_name ||
        user.email?.split("@")[0] ||
        "Mentor";
      setMentorName(name);

      // Fetch live classes (filter by tutor name if possible)
      const { data: lcData } = await supabase
        .from("live_classes")
        .select("*")
        .order("scheduled_at", { ascending: false })
        .limit(20);

      const allLC = (lcData as LiveClass[]) || [];
      setLiveClasses(allLC.slice(0, 4));

      // Fetch videos
      const { data: vidData } = await supabase
        .from("videos")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(4);

      setVideos((vidData as VideoItem[]) || []);

      // Stats
      const upcoming = allLC.filter((lc) => lc.status === "upcoming").length;
      const { count: modulCount } = await supabase
        .from("moduls")
        .select("*", { count: "exact", head: true });

      setStats({
        totalLiveClass: allLC.length,
        upcomingClass: upcoming,
        totalVideo: vidData?.length || 0,
        totalModul: modulCount || 0,
      });
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

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("id-ID", {
      weekday: "short",
      day: "numeric",
      month: "short",
    });
  };

  const statusConfig = {
    upcoming: {
      label: "Upcoming",
      color: "bg-blue-100 text-blue-700 border-blue-200",
      icon: Clock,
    },
    ongoing: {
      label: "Live Now",
      color: "bg-red-100 text-red-700 border-red-200",
      icon: Radio,
    },
    completed: {
      label: "Selesai",
      color: "bg-blue-50 text-blue-700 border-blue-200",
      icon: PlaySquare,
    },
  };

  const summaryCards = [
    {
      title: "Total Live Class",
      value: loading ? "—" : stats.totalLiveClass.toString(),
      sub: `${stats.upcomingClass} upcoming`,
      icon: Video,
      color: "from-blue-500 to-blue-700",
      bg: "bg-blue-50",
      textColor: "text-blue-700",
      href: "/mentor/live-class",
    },
    {
      title: "Video Pembelajaran",
      value: loading ? "—" : stats.totalVideo.toString(),
      sub: "Total video aktif",
      icon: PlaySquare,
      color: "from-blue-500 to-blue-700",
      bg: "bg-blue-50",
      textColor: "text-blue-700",
      href: "/mentor/video",
    },
    {
      title: "Modul Belajar",
      value: loading ? "—" : stats.totalModul.toString(),
      sub: "Materi tersedia",
      icon: BookOpen,
      color: "from-blue-500 to-blue-700",
      bg: "bg-blue-50",
      textColor: "text-blue-700",
      href: "/mentor/modul",
    },
    {
      title: "Jadwal Mengajar",
      value: loading ? "—" : `${stats.upcomingClass}`,
      sub: "Sesi mendatang",
      icon: CalendarDays,
      color: "from-blue-500 to-blue-700",
      bg: "bg-blue-50",
      textColor: "text-blue-700",
      href: "/mentor/jadwal",
    },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Hero Greeting */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 p-8 text-white shadow-xl shadow-blue-200">
        {/* decorative blobs */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-32 translate-x-32 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-400/20 rounded-full translate-y-24 -translate-x-24 blur-2xl" />

        <div className="relative z-10 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="h-4 w-4 text-blue-200" />
              <span className="text-blue-200 text-sm font-semibold">
                {getGreeting()}, Mentor!
              </span>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight mb-1">
              {loading ? "..." : mentorName}
            </h1>
            <p className="text-blue-200 text-sm max-w-md">
              Selamat datang di Mentor Panel UpdatePTN. Kelola konten
              pembelajaran Anda dan dukung siswa meraih PTN impian. 🎓
            </p>
          </div>

          <div className="hidden md:flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl px-4 py-3">
            <TrendingUp className="h-5 w-5 text-blue-200" />
            <div>
              <p className="text-xs text-blue-200 font-semibold">
                Sesi Aktif
              </p>
              <p className="text-lg font-extrabold">
                {loading ? "—" : stats.upcomingClass}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {summaryCards.map((card) => {
          const Icon = card.icon;
          return (
            <Link key={card.title} href={card.href}>
              <Card className="p-5 bg-white border border-slate-200 rounded-2xl hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer group">
                <div className="flex items-start justify-between mb-4">
                  <div
                    className={`${card.bg} p-2.5 rounded-xl group-hover:scale-110 transition-transform`}
                  >
                    <Icon className={`h-5 w-5 ${card.textColor}`} />
                  </div>
                  <ArrowUpRight
                    className={`h-4 w-4 ${card.textColor} opacity-0 group-hover:opacity-100 transition-opacity`}
                  />
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

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Live Class Terbaru */}
        <div className="lg:col-span-3 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <Video className="h-4 w-4 text-blue-600" />
              Live Class Terbaru
            </h2>
            <Link href="/mentor/live-class">
              <Button
                variant="ghost"
                size="sm"
                className="text-blue-600 hover:bg-blue-50 text-xs font-semibold rounded-xl gap-1"
              >
                Lihat Semua <ChevronRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>

          <div className="space-y-3">
            {loading ? (
              [...Array(3)].map((_, i) => (
                <Card
                  key={i}
                  className="p-4 rounded-2xl bg-white border border-slate-100 animate-pulse"
                >
                  <div className="h-4 bg-slate-100 rounded w-3/4 mb-2" />
                  <div className="h-3 bg-slate-100 rounded w-1/2" />
                </Card>
              ))
            ) : liveClasses.length === 0 ? (
              <Card className="p-8 rounded-2xl bg-white border border-slate-100 text-center">
                <Video className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                <p className="text-sm text-slate-400 font-semibold">
                  Belum ada live class
                </p>
                <Link href="/mentor/live-class">
                  <Button
                    size="sm"
                    className="mt-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs"
                  >
                    Tambah Sekarang
                  </Button>
                </Link>
              </Card>
            ) : (
              liveClasses.map((lc) => {
                const cfg = statusConfig[lc.status];
                const CfgIcon = cfg.icon;
                return (
                  <Card
                    key={lc.id}
                    className="p-4 rounded-2xl bg-white border border-slate-100 hover:border-blue-200 hover:shadow-sm transition-all"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-slate-900 truncate">
                          {lc.title}
                        </p>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {lc.category} · {formatDate(lc.scheduled_at)}{" "}
                          {lc.time && `· ${lc.time}`}
                        </p>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        {lc.is_premium && (
                          <Badge className="bg-blue-50 text-blue-700 border-blue-200 text-[10px] font-bold">
                            Premium
                          </Badge>
                        )}
                        <Badge
                          className={`${cfg.color} text-[10px] font-bold flex items-center gap-1 border`}
                        >
                          <CfgIcon
                            className={`h-2.5 w-2.5 ${lc.status === "ongoing" ? "animate-pulse" : ""}`}
                          />
                          {cfg.label}
                        </Badge>
                      </div>
                    </div>
                  </Card>
                );
              })
            )}
          </div>
        </div>

        {/* Video Terbaru */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <PlaySquare className="h-4 w-4 text-blue-600" />
              Video Terbaru
            </h2>
            <Link href="/mentor/video">
              <Button
                variant="ghost"
                size="sm"
                className="text-blue-600 hover:bg-blue-50 text-xs font-semibold rounded-xl gap-1"
              >
                Semua <ChevronRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>

          <div className="space-y-3">
            {loading ? (
              [...Array(4)].map((_, i) => (
                <Card
                  key={i}
                  className="p-3.5 rounded-2xl bg-white border border-slate-100 animate-pulse"
                >
                  <div className="h-3.5 bg-slate-100 rounded w-3/4 mb-2" />
                  <div className="h-2.5 bg-slate-100 rounded w-1/2" />
                </Card>
              ))
            ) : videos.length === 0 ? (
              <Card className="p-8 rounded-2xl bg-white border border-slate-100 text-center">
                <PlaySquare className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                <p className="text-sm text-slate-400 font-semibold">
                  Belum ada video
                </p>
                <Link href="/mentor/video">
                  <Button
                    size="sm"
                    className="mt-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs"
                  >
                    Upload Video
                  </Button>
                </Link>
              </Card>
            ) : (
              videos.map((vid) => (
                <Card
                  key={vid.id}
                  className="p-3.5 rounded-2xl bg-white border border-slate-100 hover:border-blue-200 hover:shadow-sm transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-blue-50 shrink-0">
                      <PlaySquare className="h-4 w-4 text-blue-600" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-900 truncate">
                        {vid.title}
                      </p>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        {vid.category}
                      </p>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>

          {/* Quick Actions */}
          <Card className="p-4 rounded-2xl bg-gradient-to-br from-blue-50 to-blue-50 border border-blue-200/60">
            <p className="text-xs font-bold text-blue-700 mb-3">
              ⚡ Aksi Cepat
            </p>
            <div className="space-y-2">
              <Link href="/mentor/live-class">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start text-xs font-semibold border-blue-200 text-blue-700 hover:bg-blue-100 rounded-xl gap-2 mb-2"
                >
                  <Video className="h-3.5 w-3.5" />
                  Tambah Live Class
                </Button>
              </Link>
              <Link href="/mentor/video">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start text-xs font-semibold border-blue-200 text-blue-700 hover:bg-blue-50 rounded-xl gap-2 mb-2"
                >
                  <PlaySquare className="h-3.5 w-3.5" />
                  Upload Video
                </Button>
              </Link>
              <Link href="/mentor/modul">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start text-xs font-semibold border-blue-200 text-blue-700 hover:bg-blue-50 rounded-xl gap-2"
                >
                  <BookOpen className="h-3.5 w-3.5" />
                  Tambah Modul
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
