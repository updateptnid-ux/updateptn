"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Clock,
  ChevronLeft,
  ChevronRight,
  Video,
  FileText,
  BookOpen,
  Gift,
} from "lucide-react";

type CalendarEvent = {
  id: string;
  title: string;
  date: string;
  time?: string;
  type: "live_class" | "tryout_free" | "tryout_paid";
  status?: "upcoming" | "ongoing" | "completed";
  link?: string;
  category?: string;
  is_free?: boolean;
  duration_minutes?: number;
};

const MONTH_NAMES = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember",
];

const DAY_NAMES = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];

const eventTypeConfig: Record<string, { label: string; color: string; icon: React.ElementType; dot: string }> = {
  live_class: {
    label: "Live Class",
    color: "bg-blue-100 text-blue-700 border-blue-200",
    icon: Video,
    dot: "bg-blue-500",
  },
  tryout_free: {
    label: "Try Out Gratis",
    color: "bg-blue-50 text-blue-600 border-blue-100",
    icon: Gift,
    dot: "bg-blue-400",
  },
  tryout_paid: {
    label: "Try Out Premium",
    color: "bg-blue-100 text-blue-800 border-blue-200",
    icon: FileText,
    dot: "bg-blue-600",
  },
};

export default function StudentKalenderPage() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const today = new Date();

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      const supabase = createClient();
      
      const { data: classesData } = await supabase
        .from("live_classes")
        .select("*")
        .order("scheduled_at", { ascending: true });

      const { data: tryoutsData } = await supabase
        .from("tryouts")
        .select("id, title, description, duration_minutes, total_questions, scheduled_date, is_free, participants_count")
        .order("scheduled_date", { ascending: true });

      const allEvents: CalendarEvent[] = [];

      classesData?.forEach((lc) => {
        allEvents.push({
          id: lc.id,
          title: lc.title,
          date: lc.scheduled_at,
          time: lc.time,
          type: "live_class",
          status: lc.status,
          link: lc.meeting_url,
          category: lc.category,
        });
      });

      tryoutsData?.forEach((tryout) => {
        allEvents.push({
          id: tryout.id,
          title: tryout.title,
          date: tryout.scheduled_date,
          type: tryout.is_free ? "tryout_free" : "tryout_paid",
          is_free: tryout.is_free,
          duration_minutes: tryout.duration_minutes,
        });
      });

      setEvents(allEvents);
    } catch (err) {
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const getEventsForDate = (date: Date) => {
    const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    return events.filter((evt) => evt.date.split('T')[0] === dateStr);
  };

  const hasEventOnDate = (date: Date) => getEventsForDate(date).length > 0;
  const getEventTypesForDate = (date: Date) => [...new Set(getEventsForDate(date).map((evt) => evt.type))];

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);

  const prevMonth = () => { setCurrentDate(new Date(year, month - 1, 1)); setSelectedDate(null); };
  const nextMonth = () => { setCurrentDate(new Date(year, month + 1, 1)); setSelectedDate(null); };
  const selectDate = (day: number) => setSelectedDate(new Date(year, month, day));

  const isToday = (day: number) => day === today.getDate() && month === today.getMonth() && year === today.getFullYear();
  const isSelected = (day: number) => selectedDate?.getDate() === day && selectedDate?.getMonth() === month && selectedDate?.getFullYear() === year;

  const upcomingEvents = events.filter((evt) => new Date(evt.date) >= today || evt.status === "upcoming" || evt.status === "ongoing").slice(0, 5);
  const selectedEvents = selectedDate ? getEventsForDate(selectedDate) : [];

  return (
    <div className="w-full min-h-screen bg-slate-50">
      {/* Header - Mobile Sticky, Desktop Static */}
      <div className="bg-white border-b border-slate-200 px-4 md:px-6 py-3 md:py-4 sticky md:static top-0 z-10 shadow-sm md:shadow-none">
        <h1 className="text-base md:text-2xl font-bold text-slate-900">Kalender Akademik</h1>
        <div className="flex items-center gap-3 md:gap-4 mt-2">
          <div className="flex items-center gap-1">
            <span className="h-1.5 w-1.5 md:h-2 md:w-2 rounded-full bg-blue-500"></span>
            <span className="text-[9px] md:text-[11px] text-slate-500">Live</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="h-1.5 w-1.5 md:h-2 md:w-2 rounded-full bg-blue-400"></span>
            <span className="text-[9px] md:text-[11px] text-slate-500">Gratis</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="h-1.5 w-1.5 md:h-2 md:w-2 rounded-full bg-blue-600"></span>
            <span className="text-[9px] md:text-[11px] text-slate-500">Premium</span>
          </div>
        </div>
      </div>

      {/* Content - Responsive Grid */}
      <div className="p-3 md:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-3 md:gap-6">
          {/* Calendar - Left Column on Desktop */}
          <div className="lg:col-span-2 space-y-3 md:space-y-4">
            <Card className="bg-white rounded-xl md:rounded-2xl overflow-hidden">
              <div className="flex items-center justify-between p-2.5 md:p-4 border-b border-slate-100">
                <h2 className="text-sm md:text-base font-bold text-slate-900">{MONTH_NAMES[month]} {year}</h2>
                <div className="flex gap-1">
                  <Button variant="outline" size="icon" onClick={prevMonth} className="h-6 w-6 md:h-8 md:w-8 rounded-md">
                    <ChevronLeft className="h-3 w-3 md:h-4 md:w-4" />
                  </Button>
                  <Button variant="outline" size="icon" onClick={nextMonth} className="h-6 w-6 md:h-8 md:w-8 rounded-md">
                    <ChevronRight className="h-3 w-3 md:h-4 md:w-4" />
                  </Button>
                </div>
              </div>

              <div className="p-2 md:p-4">
                <div className="grid grid-cols-7 mb-1 md:mb-2">
                  {DAY_NAMES.map((d) => (
                    <div key={d} className="text-center text-[8px] md:text-[11px] font-bold text-slate-400 py-0.5 md:py-1">{d}</div>
                  ))}
                </div>

                <div className="grid grid-cols-7 gap-0.5 md:gap-1">
                  {Array.from({ length: firstDay }).map((_, i) => (<div key={`empty-${i}`} />))}
                  {Array.from({ length: daysInMonth }).map((_, i) => {
                    const day = i + 1;
                    const date = new Date(year, month, day);
                    const hasEvent = hasEventOnDate(date);
                    const eventTypes = getEventTypesForDate(date);
                    const todayDay = isToday(day);
                    const selectedDay = isSelected(day);

                    return (
                      <button
                        key={day}
                        onClick={() => selectDate(day)}
                        className={`aspect-square flex flex-col items-center justify-center rounded-md md:rounded-xl text-[10px] md:text-sm font-semibold transition-all ${
                          todayDay && !selectedDay ? "bg-blue-100 text-blue-700 ring-1 ring-blue-300" : ""
                        } ${selectedDay ? "bg-blue-600 text-white shadow-md" : ""} ${
                          !todayDay && !selectedDay ? "text-slate-700 hover:bg-slate-50" : ""
                        }`}
                      >
                        {day}
                        {hasEvent && (
                          <div className="flex gap-0.5 mt-0.5">
                            {eventTypes.map((type) => (
                              <span key={type} className={`h-0.5 w-0.5 md:h-1 md:w-1 rounded-full ${selectedDay ? "bg-white" : eventTypeConfig[type].dot}`} />
                            ))}
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </Card>

            {/* Selected Date Events */}
            {selectedDate && (
              <div className="space-y-2 md:space-y-3">
                <h3 className="text-xs md:text-sm font-bold text-slate-700">
                  {selectedDate.toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long" })}
                </h3>
                {selectedEvents.length === 0 ? (
                  <Card className="p-4 md:p-5 rounded-xl bg-white text-center">
                    <p className="text-xs md:text-sm text-slate-400">Tidak ada jadwal</p>
                  </Card>
                ) : (
                  selectedEvents.map((evt) => {
                    const cfg = eventTypeConfig[evt.type];
                    const Icon = cfg.icon;
                    return (
                      <Card key={evt.id} className="p-2.5 md:p-4 rounded-xl bg-white">
                        <div className="flex items-start gap-2 md:gap-3">
                          <div className="p-1 md:p-2 rounded-lg bg-blue-50 shrink-0">
                            <Icon className="h-3 w-3 md:h-4 md:w-4 text-blue-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs md:text-sm font-bold text-slate-900 leading-tight mb-0.5">{evt.title}</p>
                            {evt.time && (
                              <span className="text-[10px] md:text-xs text-slate-500 flex items-center gap-0.5">
                                <Clock className="h-2 w-2 md:h-3 md:w-3" /> {evt.time}
                              </span>
                            )}
                          </div>
                          {evt.link && (
                            <a href={evt.link} target="_blank" rel="noopener noreferrer">
                              <Button size="sm" className="h-6 md:h-8 px-2 md:px-3 bg-blue-600 hover:bg-blue-700 text-white text-[9px] md:text-xs rounded-md">Join</Button>
                            </a>
                          )}
                        </div>
                      </Card>
                    );
                  })
                )}
              </div>
            )}
          </div>

          {/* Right Sidebar - Upcoming & Stats */}
          <div className="lg:col-span-1 space-y-3 md:space-y-4">
            <div className="space-y-2 md:space-y-3">
              <h3 className="text-xs md:text-sm font-bold text-slate-700 flex items-center gap-1 md:gap-2">
                <BookOpen className="h-3 w-3 md:h-4 md:w-4 text-blue-600" /> Kegiatan Mendatang
              </h3>
              {loading ? (
                [1, 2, 3].map((i) => (
                  <Card key={i} className="p-2.5 md:p-4 rounded-xl bg-white animate-pulse">
                    <div className="h-3 bg-slate-100 rounded w-3/4 mb-1" />
                    <div className="h-2 bg-slate-100 rounded w-1/2" />
                  </Card>
                ))
              ) : upcomingEvents.length === 0 ? (
                <Card className="p-5 md:p-6 rounded-xl bg-white text-center">
                  <p className="text-xs md:text-sm text-slate-400">Tidak ada kegiatan</p>
                </Card>
              ) : (
                upcomingEvents.map((evt) => {
                  const cfg = eventTypeConfig[evt.type];
                  const Icon = cfg.icon;
                  return (
                    <Card key={evt.id} className="p-2.5 md:p-4 rounded-xl bg-white hover:shadow-sm transition-shadow">
                      <div className="flex items-start gap-2 md:gap-3">
                        <div className="p-1 md:p-2 rounded-lg bg-blue-50 shrink-0">
                          <Icon className="h-3 w-3 md:h-4 md:w-4 text-blue-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs md:text-sm font-bold text-slate-900 leading-tight mb-0.5 truncate">{evt.title}</p>
                          <div className="flex items-center gap-2 text-[10px] md:text-xs text-slate-500 mt-1">
                            <span>{new Date(evt.date).toLocaleDateString("id-ID", { day: "numeric", month: "short" })}</span>
                            {evt.time && <span>{evt.time}</span>}
                          </div>
                        </div>
                        <Badge className={`${cfg.color} text-[8px] md:text-[10px] px-1 py-0 shrink-0`}>
                          {cfg.label.split(" ")[0]}
                        </Badge>
                      </div>
                      {evt.link && (
                        <a href={evt.link} target="_blank" rel="noopener noreferrer" className="block mt-2">
                          <Button size="sm" className="w-full h-6 md:h-8 bg-blue-600 hover:bg-blue-700 text-white text-[9px] md:text-xs rounded-md">
                            Buka Link Meeting
                          </Button>
                        </a>
                      )}
                    </Card>
                  );
                })
              )}
            </div>

            {/* Stats */}
            <Card className="p-2.5 md:p-4 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200/60">
              <p className="text-[9px] md:text-xs font-bold text-blue-700 mb-1.5 md:mb-3">Ringkasan Bulan Ini</p>
              <div className="space-y-1 md:space-y-2">
                {Object.entries(eventTypeConfig).map(([type, cfg]) => {
                  const count = events.filter((evt) => evt.type === type && new Date(evt.date).getMonth() === month && new Date(evt.date).getFullYear() === year).length;
                  return (
                    <div key={type} className="flex items-center justify-between">
                      <div className="flex items-center gap-1 md:gap-2">
                        <span className={`h-1 w-1 md:h-1.5 md:w-1.5 rounded-full ${cfg.dot}`} />
                        <span className="text-[9px] md:text-xs text-slate-600 font-semibold">{cfg.label}</span>
                      </div>
                      <span className="text-[9px] md:text-xs font-bold text-slate-900">{count}</span>
                    </div>
                  );
                })}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
