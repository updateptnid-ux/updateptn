import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
  Sparkles,
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
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans hero-glow">
      {/* Header Bar */}
      <header className="bg-card border-b border-border px-4 sm:px-8 h-16 flex items-center justify-between">
        <Link href="/dashboard/student" className="flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-xl bg-primary flex items-center justify-center text-primary-foreground">
            <GraduationCap className="h-5 w-5" />
          </div>
          <span className="font-extrabold text-lg tracking-tight">
            Update<span className="text-primary">PTN</span>
          </span>
        </Link>

        <Link href="/dashboard/student">
          <Button variant="outline" size="sm" className="rounded-xl gap-2 font-semibold">
            <ArrowLeft className="h-4 w-4" />
            <span>Kembali ke Dashboard</span>
          </Button>
        </Link>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-5xl w-full mx-auto p-4 sm:p-8 space-y-8 my-6">
        {/* Banner Header */}
        <div className="text-center space-y-3">
          <Badge variant="outline" className="px-3.5 py-1.5 rounded-full text-xs font-semibold bg-primary/5 text-primary border-primary/20">
            <Video className="h-3.5 w-3.5 mr-1.5 text-primary animate-pulse" />
            Bimbel Online & Master Tutor
          </Badge>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Live Class & Rekaman Sesi
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base max-w-xl mx-auto">
            Ikuti siaran langsung bedah soal bersama Master Tutor lulusan PTN favorit atau tonton ulang rekaman videonya 24/7.
          </p>
        </div>

        {/* Tabs Interface */}
        <Tabs defaultValue="upcoming" className="w-full">
          <div className="flex justify-center mb-8">
            <TabsList className="grid grid-cols-2 p-1.5 bg-muted/80 backdrop-blur rounded-xl h-auto border border-border w-full max-w-md">
              <TabsTrigger value="upcoming" className="py-2.5 font-semibold text-sm rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm">
                Jadwal Mendatang ({upcomingClasses.length})
              </TabsTrigger>
              <TabsTrigger value="replays" className="py-2.5 font-semibold text-sm rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm">
                Rekaman Kelas ({completedClasses.length})
              </TabsTrigger>
            </TabsList>
          </div>

          {/* TAB 1: UPCOMING / ONGOING CLASSES */}
          <TabsContent value="upcoming" className="space-y-6">
            {upcomingClasses.length === 0 ? (
              <Card className="p-8 text-center border-dashed border-border rounded-2xl">
                <p className="text-sm text-muted-foreground">Belum ada jadwal Live Class mendatang.</p>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {upcomingClasses.map((item) => (
                  <Card key={item.id} className="border-primary/30 shadow-lg rounded-2xl flex flex-col justify-between overflow-hidden bg-card">
                    <CardHeader className="space-y-3 p-6">
                      <div className="flex items-center justify-between">
                        {item.status === "ongoing" ? (
                          <Badge className="bg-rose-600 text-white font-bold text-xs gap-1.5 animate-pulse">
                            <Radio className="h-3.5 w-3.5" />
                            <span>SEDANG BERLANGSUNG</span>
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20 text-xs font-semibold">
                            JADWAL MENDATANG
                          </Badge>
                        )}

                        <Badge variant="outline" className="text-[11px] font-medium">
                          Zoom Meeting
                        </Badge>
                      </div>

                      <CardTitle className="text-xl font-bold leading-snug">
                        {item.title}
                      </CardTitle>

                      <div className="space-y-1.5 pt-1 text-xs text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <User className="h-3.5 w-3.5 text-primary" />
                          <span className="font-semibold text-foreground">{item.mentor_name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-3.5 w-3.5 text-indigo-500" />
                          <span>{formatDate(item.scheduled_at)} WIB</span>
                        </div>
                      </div>
                    </CardHeader>

                    <CardFooter className="p-4 bg-muted/40 border-t border-border flex flex-col sm:flex-row gap-2">
                      {item.meeting_url && (
                        <a
                          href={item.meeting_url}
                          target="_blank"
                          rel="noreferrer"
                          className="w-full sm:flex-1"
                        >
                          <Button className="w-full font-bold bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl gap-2 text-xs h-10">
                            <ExternalLink className="h-4 w-4" />
                            <span>Join Sesi Live</span>
                          </Button>
                        </a>
                      )}

                      {item.material_url && (
                        <a
                          href={item.material_url}
                          target="_blank"
                          rel="noreferrer"
                          className="w-full sm:flex-1"
                        >
                          <Button variant="outline" className="w-full font-semibold rounded-xl gap-2 text-xs h-10">
                            <Download className="h-4 w-4" />
                            <span>Download Modul PDF</span>
                          </Button>
                        </a>
                      )}
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* TAB 2: COMPLETED REPLAYS */}
          <TabsContent value="replays" className="space-y-6">
            {completedClasses.length === 0 ? (
              <Card className="p-8 text-center border-dashed border-border rounded-2xl">
                <p className="text-sm text-muted-foreground">Belum ada rekaman kelas yang tersedia.</p>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {completedClasses.map((item) => (
                  <Card key={item.id} className="border-border rounded-2xl flex flex-col justify-between overflow-hidden bg-card">
                    <CardHeader className="space-y-3 p-6">
                      <div className="flex items-center justify-between">
                        <Badge variant="outline" className="bg-emerald-50 text-emerald-600 border-emerald-200 text-xs font-semibold">
                          REKAMAN HD SELESAI
                        </Badge>
                        <Badge variant="outline" className="text-[11px]">
                          24/7 Access
                        </Badge>
                      </div>

                      <CardTitle className="text-xl font-bold leading-snug">
                        {item.title}
                      </CardTitle>

                      <div className="space-y-1.5 pt-1 text-xs text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <User className="h-3.5 w-3.5 text-primary" />
                          <span className="font-semibold text-foreground">{item.mentor_name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                          <span>Selesai pada: {formatDate(item.scheduled_at)}</span>
                        </div>
                      </div>
                    </CardHeader>

                    <CardFooter className="p-4 bg-muted/40 border-t border-border flex flex-col sm:flex-row gap-2">
                      {item.replay_url && (
                        <a
                          href={item.replay_url}
                          target="_blank"
                          rel="noreferrer"
                          className="w-full sm:flex-1"
                        >
                          <Button className="w-full font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl gap-2 text-xs h-10">
                            <PlayCircle className="h-4 w-4" />
                            <span>Tonton Replay</span>
                          </Button>
                        </a>
                      )}

                      {item.material_url && (
                        <a
                          href={item.material_url}
                          target="_blank"
                          rel="noreferrer"
                          className="w-full sm:flex-1"
                        >
                          <Button variant="outline" className="w-full font-semibold rounded-xl gap-2 text-xs h-10">
                            <Download className="h-4 w-4" />
                            <span>Modul PDF</span>
                          </Button>
                        </a>
                      )}
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
