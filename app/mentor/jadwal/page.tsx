"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  CalendarDays,
  Clock,
  ChevronLeft,
  ChevronRight,
  Video,
  Radio,
  CheckCircle2,
  Link as LinkIcon,
  Plus,
} from "lucide-react";

interface LiveClass {
  id: string;
  title: string;
  tutor_name: string;
  category: string;
  scheduled_at: string;
  time: string;
  meeting_url: string;
  replay_url?: string;
  status: "upcoming" | "ongoing" | "completed";
  is_premium: boolean;
}

const MONTH_NAMES = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];

const DAY_NAMES = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];

const statusConfig: Record<
  string,
  { label: string; color: string; icon: React.ElementType; dot: string }
> = {
  upcoming: {
    label: "Upcoming",
    color: "bg-blue-100 text-blue-700 border-blue-200",
    icon: Clock,
    dot: "bg-blue-500",
  },
  ongoing: {
    label: "Live Now",
    color: "bg-red-100 text-red-700 border-red-200",
    icon: Radio,
    dot: "bg-red-500",
  },
  completed: {
    label: "Selesai",
    color: "bg-blue-50 text-blue-700 border-blue-200",
    icon: CheckCircle2,
    dot: "bg-blue-500",
  },
};

export default function MentorJadwalPage() {
  const [liveClasses, setLiveClasses] = useState<LiveClass[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const today = new Date();

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      setLoading(true);
      const supabase = createClient();
      const { data, error } = await supabase
        .from("live_classes")
        .select("*")
        .order("scheduled_at", { ascending: true });

      if (!error && data) {
        setLiveClasses(data as LiveClass[]);
      }
    } catch (err) {
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };

  const getClassesForDate = (date: Date) => {
    const dateStr = date.toISOString().split("T")[0];
    return liveClasses.filter((lc) => lc.scheduled_at === dateStr);
  };

  const hasClassOnDate = (date: Date) => {
    const dateStr = date.toISOString().split("T")[0];
    return liveClasses.some((lc) => lc.scheduled_at === dateStr);
  };

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
    setSelectedDate(null);
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
    setSelectedDate(null);
  };

  const selectDate = (day: number) => {
    setSelectedDate(new Date(year, month, day));
  };

  const isToday = (day: number) => {
    return (
      day === today.getDate() &&
      month === today.getMonth() &&
      year === today.getFullYear()
    );
  };

  const isSelected = (day: number) => {
    return (
      selectedDate?.getDate() === day &&
      selectedDate?.getMonth() === month &&
      selectedDate?.getFullYear() === year
    );
  };

  // Get upcoming classes (all future)
  const upcomingClasses = liveClasses
    .filter((lc) => lc.status === "upcoming")
    .slice(0, 5);

  const selectedClasses = selectedDate ? getClassesForDate(selectedDate) : [];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">
            Jadwal Mengajar
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Lihat dan pantau jadwal live class Anda
          </p>
        </div>
        <Link href="/mentor/live-class">
          <Button className="bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-xl gap-2 shadow-md shadow-blue-200">
            <Plus className="h-4 w-4" />
            Tambah Jadwal
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Calendar */}
        <div className="lg:col-span-3">
          <Card className="p-6 rounded-2xl bg-white border border-slate-200">
            {/* Calendar Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-base font-extrabold text-slate-900">
                {MONTH_NAMES[month]} {year}
              </h2>
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={prevMonth}
                  className="h-8 w-8 rounded-lg border-slate-200"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={nextMonth}
                  className="h-8 w-8 rounded-lg border-slate-200"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Day Names */}
            <div className="grid grid-cols-7 mb-2">
              {DAY_NAMES.map((d) => (
                <div
                  key={d}
                  className="text-center text-[11px] font-bold text-slate-400 py-1"
                >
                  {d}
                </div>
              ))}
            </div>

            {/* Days Grid */}
            <div className="grid grid-cols-7 gap-1">
              {/* Empty cells for first day offset */}
              {Array.from({ length: firstDay }).map((_, i) => (
                <div key={`empty-${i}`} />
              ))}

              {/* Day cells */}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const date = new Date(year, month, day);
                const hasClass = hasClassOnDate(date);
                const todayDay = isToday(day);
                const selectedDay = isSelected(day);

                return (
                  <button
                    key={day}
                    onClick={() => selectDate(day)}
                    className={`
                      relative aspect-square flex flex-col items-center justify-center rounded-xl text-sm font-semibold transition-all
                      ${todayDay && !selectedDay ? "bg-blue-100 text-blue-700 font-extrabold" : ""}
                      ${selectedDay ? "bg-blue-600 text-white shadow-md shadow-blue-200" : ""}
                      ${!todayDay && !selectedDay ? "text-slate-700 hover:bg-slate-100" : ""}
                    `}
                  >
                    {day}
                    {hasClass && (
                      <span
                        className={`absolute bottom-1 h-1.5 w-1.5 rounded-full ${
                          selectedDay ? "bg-white" : "bg-blue-400"
                        }`}
                      />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Legend */}
            <div className="flex items-center gap-4 mt-4 pt-4 border-t border-slate-100">
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-blue-600" />
                <span className="text-[11px] text-slate-400 font-semibold">
                  Hari ini
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-blue-400" />
                <span className="text-[11px] text-slate-400 font-semibold">
                  Ada jadwal
                </span>
              </div>
            </div>
          </Card>

          {/* Selected Date Classes */}
          {selectedDate && (
            <div className="mt-4 space-y-3">
              <h3 className="text-sm font-extrabold text-slate-700 flex items-center gap-2">
                <CalendarDays className="h-4 w-4 text-blue-500" />
                {selectedDate.toLocaleDateString("id-ID", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                })}
              </h3>

              {selectedClasses.length === 0 ? (
                <Card className="p-5 rounded-xl bg-white border border-slate-100 text-center">
                  <p className="text-sm text-slate-400 font-semibold">
                    Tidak ada jadwal pada tanggal ini
                  </p>
                  <Link href="/mentor/live-class">
                    <Button
                      size="sm"
                      className="mt-2 bg-blue-500 hover:bg-blue-600 text-white rounded-xl text-xs"
                    >
                      Tambah Jadwal
                    </Button>
                  </Link>
                </Card>
              ) : (
                selectedClasses.map((lc) => {
                  const cfg = statusConfig[lc.status];
                  const CfgIcon = cfg.icon;
                  return (
                    <Card
                      key={lc.id}
                      className="p-4 rounded-xl bg-white border border-slate-200"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-slate-900 truncate">
                            {lc.title}
                          </p>
                          <div className="flex items-center gap-3 mt-1">
                            <span className="text-xs text-slate-400 flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {lc.time || "—"}
                            </span>
                            <span className="text-xs text-slate-400">
                              {lc.category}
                            </span>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-1.5">
                          <Badge
                            className={`${cfg.color} border text-[10px] font-bold flex items-center gap-1`}
                          >
                            <CfgIcon className="h-2.5 w-2.5" />
                            {cfg.label}
                          </Badge>
                          {lc.meeting_url && (
                            <a
                              href={lc.meeting_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline text-xs flex items-center gap-1 font-semibold"
                            >
                              <LinkIcon className="h-3 w-3" />
                              Join
                            </a>
                          )}
                        </div>
                      </div>
                    </Card>
                  );
                })
              )}
            </div>
          )}
        </div>

        {/* Sidebar: Upcoming */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
            <Video className="h-4 w-4 text-blue-600" />
            Sesi Mendatang
          </h2>

          {loading ? (
            <div className="space-y-3">
              {[...Array(4)].map((_, i) => (
                <Card
                  key={i}
                  className="p-4 rounded-xl bg-white border border-slate-100 animate-pulse"
                >
                  <div className="h-3.5 bg-slate-100 rounded w-3/4 mb-2" />
                  <div className="h-2.5 bg-slate-100 rounded w-1/2" />
                </Card>
              ))}
            </div>
          ) : upcomingClasses.length === 0 ? (
            <Card className="p-6 rounded-xl bg-white border border-slate-100 text-center">
              <CalendarDays className="h-8 w-8 text-slate-200 mx-auto mb-2" />
              <p className="text-sm text-slate-400 font-semibold">
                Tidak ada sesi mendatang
              </p>
              <Link href="/mentor/live-class">
                <Button
                  size="sm"
                  className="mt-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs"
                >
                  Buat Jadwal
                </Button>
              </Link>
            </Card>
          ) : (
            <div className="space-y-3">
              {upcomingClasses.map((lc) => (
                <Card
                  key={lc.id}
                  className="p-4 rounded-xl bg-white border border-slate-200 hover:border-blue-200 hover:shadow-sm transition-all"
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-xl bg-blue-50 shrink-0 mt-0.5">
                      <Video className="h-4 w-4 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-slate-900 leading-tight truncate">
                        {lc.title}
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {lc.category}
                      </p>
                      <div className="flex items-center gap-3 mt-2">
                        <span className="text-[11px] text-slate-400 flex items-center gap-1">
                          <CalendarDays className="h-3 w-3" />
                          {new Date(lc.scheduled_at).toLocaleDateString(
                            "id-ID",
                            {
                              day: "numeric",
                              month: "short",
                            }
                          )}
                        </span>
                        {lc.time && (
                          <span className="text-[11px] text-slate-400 flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {lc.time}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  {lc.meeting_url && (
                    <a
                      href={lc.meeting_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-3 flex items-center justify-center gap-1.5 w-full py-1.5 rounded-lg bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold hover:bg-blue-100 transition-colors"
                    >
                      <LinkIcon className="h-3 w-3" />
                      Buka Link Meeting
                    </a>
                  )}
                </Card>
              ))}
            </div>
          )}

          {/* Stats Summary */}
          <Card className="p-4 rounded-xl bg-gradient-to-br from-blue-50 to-blue-50 border border-blue-200/60">
            <p className="text-xs font-bold text-blue-700 mb-3">
              📊 Ringkasan Bulan Ini
            </p>
            <div className="space-y-2">
              {Object.entries(statusConfig).map(([status, cfg]) => {
                const count = liveClasses.filter(
                  (lc) =>
                    lc.status === status &&
                    new Date(lc.scheduled_at).getMonth() === today.getMonth() &&
                    new Date(lc.scheduled_at).getFullYear() ===
                      today.getFullYear()
                ).length;
                return (
                  <div
                    key={status}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`}
                      />
                      <span className="text-xs text-slate-600 font-semibold">
                        {cfg.label}
                      </span>
                    </div>
                    <span className="text-xs font-extrabold text-slate-900">
                      {count}
                    </span>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
