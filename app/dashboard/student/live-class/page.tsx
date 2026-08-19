import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { StaggerContainer, StaggerItem, MotionCard } from "@/components/ui/fade-in";
import {
  GraduationCap,
  Video,
  Calendar,
  Clock,
  Download,
  PlayCircle,
  ExternalLink,
  User,
  ArrowLeft,
  CheckCircle2,
  Radio,
} from "lucide-react";

export default async function LiveClassPage() {
  const supabase = await createClient();

  // Fetch live classes from Supabase DB
  const { data: liveClassesData } = await supabase
    .from("live_classes")
    .select("*")
    .order("scheduled_at", { ascending: true });

  // Fallback demo items if DB empty
  const allClasses =
    liveClassesData && liveClassesData.length > 0
      ? liveClassesData
      : [
          {
            id: "1",
            title: "Mastery Class: Trik Cepat Penalaran Matematika UTBK",
            mentor_name: "Kak Sarah, M.Sc (Alumni ITB)",
            scheduled_at: new Date().toISOString(),
            meeting_url: "https://zoom.us/j/987654321",
            material_url: "https://updateptn.id/materials/penalaran-matematika.pdf",
            status: "ongoing",
          },
          {
            id: "2",
            title: "Bedah Pola Soal Penalaran Umum",
            mentor_name: "Kak Fikri, S.Kom (Alumni UI)",
            scheduled_at: new Date(Date.now() + 86400000).toISOString(),
            meeting_url: "https://zoom.us/j/123456789",
            material_url: "https://updateptn.id/materials/penalaran-umum.pdf",
            status: "upcoming",
          },
          {
            id: "3",
            title: "Trik Cepat Kuasai Literasi Bahasa Inggris UTBK",
            mentor_name: "Kak Dimas, M.A (Alumni UGM)",
            scheduled_at: new Date(Date.now() - 172800000).toISOString(),
            replay_url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
            material_url: "https://updateptn.id/materials/literasi-inggris.pdf",
            status: "completed",
          },
        ];

  const upcomingClasses = allClasses.filter((c) => c.status === "upcoming" || c.status === "ongoing");
  const completedClasses = allClasses.filter((c) => c.status === "completed");

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString("id-ID", {
        weekday: "long",
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/70 text-slate-900 flex flex-col font-sans">
      {/* Header Bar (Glassmorphic) */}
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-8 h-16 flex items-center justify-between sticky top-0 z-40 shadow-xs">
        <Link href="/dashboard/student" className="flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-xs">
            <GraduationCap className="h-5 w-5" />
          </div>
          <span className="font-extrabold text-lg tracking-tight text-slate-900">
            Update<span className="text-blue-600">PTN</span>
          </span>
        </Link>

        <Link href="/dashboard/student">
          <Button variant="outline" size="sm" className="rounded-xl gap-2 font-semibold border-slate-200/80 bg-white/50 backdrop-blur-xs hover:bg-slate-100">
            <ArrowLeft className="h-4 w-4" />
            <span>Kembali ke Dashboard</span>
          </Button>
        </Link>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-5xl w-full mx-auto p-4 sm:p-8 space-y-8 my-2">
        {/* Banner Header */}
        <div className="text-center space-y-3">
          <Badge variant="outline" className="px-3.5 py-1.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border-blue-200">
            <Video className="h-3.5 w-3.5 mr-1.5 text-blue-600 animate-pulse" />
            Bimbel Online & Master Tutor
          </Badge>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
            Live Class & Rekaman Sesi
          </h1>
          <p className="text-slate-500 text-sm sm:text-base max-w-xl mx-auto">
            Ikuti siaran langsung bedah soal bersama Master Tutor lulusan PTN favorit atau tonton ulang rekaman videonya 24/7.
          </p>
        </div>

        {/* Tabs Interface */}
        <Tabs defaultValue="upcoming" className="w-full">
          <div className="flex justify-center mb-8">
            <TabsList className="grid grid-cols-2 p-1.5 bg-white/80 backdrop-blur-md rounded-xl h-auto border border-slate-200/80 shadow-xs w-full max-w-md">
              <TabsTrigger value="upcoming" className="py-2.5 font-semibold text-sm rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-xs text-slate-600 data-[state=active]:text-blue-600">
                Jadwal Mendatang ({upcomingClasses.length})
              </TabsTrigger>
              <TabsTrigger value="replays" className="py-2.5 font-semibold text-sm rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-xs text-slate-600 data-[state=active]:text-blue-600">
                Rekaman Kelas ({completedClasses.length})
              </TabsTrigger>
            </TabsList>
          </div>

          {/* TAB 1: UPCOMING / ONGOING CLASSES */}
          <TabsContent value="upcoming" className="space-y-6">
            {upcomingClasses.length === 0 ? (
              <Card className="p-8 text-center border-dashed border-slate-200 rounded-2xl bg-white/80 backdrop-blur-xs">
                <p className="text-sm text-slate-500">Belum ada jadwal Live Class mendatang.</p>
              </Card>
            ) : (
              <StaggerContainer className="grid grid-cols-2 gap-3 md:gap-6" staggerDelay={0.08}>
                {upcomingClasses.map((item) => (
                  <StaggerItem key={item.id}>
                    <MotionCard className="h-full rounded-2xl">
                      <Card className="border border-slate-200/80 shadow-xs rounded-2xl flex flex-col justify-between overflow-hidden bg-white/90 backdrop-blur-md h-full">
                        <CardHeader className="space-y-2 p-3 md:p-6">
                          <div className="flex items-center justify-between gap-1">
                            {item.status === "ongoing" ? (
                              <Badge className="bg-rose-600 text-white font-bold text-[9px] md:text-xs gap-1 animate-pulse px-1.5 py-0.5">
                                <Radio className="h-2.5 w-2.5 md:h-3.5 md:w-3.5" />
                                <span className="hidden sm:inline">SEDANG BERLANGSUNG</span>
                                <span className="sm:hidden">LIVE</span>
                              </Badge>
                            ) : (
                              <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200 text-[9px] md:text-xs font-semibold px-1.5 py-0.5">
                                <span className="hidden sm:inline">JADWAL MENDATANG</span>
                                <span className="sm:hidden">MENDATANG</span>
                              </Badge>
                            )}

                            <Badge variant="outline" className="text-[8px] md:text-[11px] font-medium text-slate-500 border-slate-200 px-1.5 py-0.5">
                              Zoom
                            </Badge>
                          </div>

                          <CardTitle className="text-sm md:text-xl font-bold leading-tight text-slate-900 line-clamp-2">
                            {item.title}
                          </CardTitle>

                          <div className="space-y-1 pt-1 text-[10px] md:text-xs text-slate-500">
                            <div className="flex items-center gap-1.5">
                              <User className="h-3 w-3 md:h-3.5 md:w-3.5 text-blue-600 shrink-0" />
                              <span className="font-semibold text-slate-900 truncate">{item.mentor_name}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <Calendar className="h-3 w-3 md:h-3.5 md:w-3.5 text-indigo-500 shrink-0" />
                              <span className="truncate">{formatDate(item.scheduled_at)} WIB</span>
                            </div>
                          </div>
                        </CardHeader>

                        <CardFooter className="p-2 md:p-4 bg-slate-50/70 border-t border-slate-100 flex flex-col gap-1.5 md:gap-2">
                          {item.meeting_url && (
                            <a
                              href={item.meeting_url}
                              target="_blank"
                              rel="noreferrer"
                              className="w-full"
                            >
                              <Button className="w-full font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-lg md:rounded-xl gap-1.5 text-[10px] md:text-xs h-8 md:h-10 shadow-xs transition-all hover:scale-[1.01]">
                                <ExternalLink className="h-3 w-3 md:h-4 md:w-4" />
                                <span>Join Live</span>
                              </Button>
                            </a>
                          )}

                          {item.material_url && (
                            <a
                              href={item.material_url}
                              target="_blank"
                              rel="noreferrer"
                              className="w-full"
                            >
                              <Button variant="outline" className="w-full font-semibold border-slate-200 rounded-lg md:rounded-xl gap-1.5 text-[10px] md:text-xs h-8 md:h-10 text-slate-700 hover:bg-slate-100">
                                <Download className="h-3 w-3 md:h-4 md:w-4" />
                                <span>Modul PDF</span>
                              </Button>
                            </a>
                          )}
                        </CardFooter>
                      </Card>
                    </MotionCard>
                  </StaggerItem>
                ))}
              </StaggerContainer>
            )}
          </TabsContent>

          {/* TAB 2: COMPLETED REPLAYS */}
          <TabsContent value="replays" className="space-y-6">
            {completedClasses.length === 0 ? (
              <Card className="p-8 text-center border-dashed border-slate-200 rounded-2xl bg-white/80 backdrop-blur-xs">
                <p className="text-sm text-slate-500">Belum ada rekaman kelas yang tersedia.</p>
              </Card>
            ) : (
              <StaggerContainer className="grid grid-cols-2 gap-3 md:gap-6" staggerDelay={0.08}>
                {completedClasses.map((item) => (
                  <StaggerItem key={item.id}>
                    <MotionCard className="h-full rounded-2xl">
                      <Card className="border border-slate-200/80 rounded-2xl flex flex-col justify-between overflow-hidden bg-white/90 backdrop-blur-md h-full shadow-xs">
                        <CardHeader className="space-y-2 p-3 md:p-6">
                          <div className="flex items-center justify-between gap-1">
                            <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[9px] md:text-xs font-semibold px-1.5 py-0.5">
                              <span className="hidden sm:inline">REKAMAN HD SELESAI</span>
                              <span className="sm:hidden">REPLAY</span>
                            </Badge>
                            <Badge variant="outline" className="text-[8px] md:text-[11px] text-slate-500 border-slate-200 px-1.5 py-0.5">
                              24/7
                            </Badge>
                          </div>

                          <CardTitle className="text-sm md:text-xl font-bold leading-tight text-slate-900 line-clamp-2">
                            {item.title}
                          </CardTitle>

                          <div className="space-y-1 pt-1 text-[10px] md:text-xs text-slate-500">
                            <div className="flex items-center gap-1.5">
                              <User className="h-3 w-3 md:h-3.5 md:w-3.5 text-blue-600 shrink-0" />
                              <span className="font-semibold text-slate-900 truncate">{item.mentor_name}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <Calendar className="h-3 w-3 md:h-3.5 md:w-3.5 text-slate-400 shrink-0" />
                              <span className="truncate">Selesai: {formatDate(item.scheduled_at)}</span>
                            </div>
                          </div>
                        </CardHeader>

                        <CardFooter className="p-2 md:p-4 bg-slate-50/70 border-t border-slate-100 flex flex-col gap-1.5 md:gap-2">
                          {item.replay_url && (
                            <a
                              href={item.replay_url}
                              target="_blank"
                              rel="noreferrer"
                              className="w-full"
                            >
                              <Button className="w-full font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg md:rounded-xl gap-1.5 text-[10px] md:text-xs h-8 md:h-10 shadow-xs transition-all hover:scale-[1.01]">
                                <PlayCircle className="h-3 w-3 md:h-4 md:w-4" />
                                <span>Tonton Replay</span>
                              </Button>
                            </a>
                          )}

                          {item.material_url && (
                            <a
                              href={item.material_url}
                              target="_blank"
                              rel="noreferrer"
                              className="w-full"
                            >
                              <Button variant="outline" className="w-full font-semibold border-slate-200 rounded-lg md:rounded-xl gap-1.5 text-[10px] md:text-xs h-8 md:h-10 text-slate-700 hover:bg-slate-100">
                                <Download className="h-3 w-3 md:h-4 md:w-4" />
                                <span>Modul PDF</span>
                              </Button>
                            </a>
                          )}
                        </CardFooter>
                      </Card>
                    </MotionCard>
                  </StaggerItem>
                ))}
              </StaggerContainer>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

