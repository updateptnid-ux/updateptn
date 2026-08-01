"use client";

import { useState, useEffect, useTransition } from "react";
import { use } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { submitTryoutAction } from "@/actions/tryout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import {
  GraduationCap,
  Clock,
  Flag,
  ChevronLeft,
  ChevronRight,
  Send,
  Loader2,
  AlertTriangle,
  FileCheck2,
} from "lucide-react";

interface QuestionItem {
  id: string;
  tryout_id: string;
  subtest: string;
  question_text: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  option_e: string;
}

export default function TryoutEnginePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const tryoutId = resolvedParams.id;
  const router = useRouter();

  const [questions, setQuestions] = useState<QuestionItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [flagged, setFlagged] = useState<Record<string, boolean>>({});
  const [timeLeftSeconds, setTimeLeftSeconds] = useState<number>(7200); // 120 mins
  const [loading, setLoading] = useState<boolean>(true);
  const [isSubmitDialogOpen, setIsSubmitDialogOpen] = useState<boolean>(false);
  const [isPending, startTransition] = useTransition();

  // Fetch Questions from Supabase
  useEffect(() => {
    async function loadQuestions() {
      try {
        setLoading(true);
        const supabase = createClient();
        let dbData = null;
        if (tryoutId.startsWith("latihan-")) {
          const categorySlug = tryoutId.replace("latihan-", "");
          const slugToName: Record<string, string> = {
            "penalaran-umum": "Penalaran Umum",
            "pengetahuan-kuantitatif": "Pengetahuan Kuantitatif",
            "literasi-indonesia": "Literasi B. Indonesia",
            "literasi-inggris": "Literasi B. Inggris",
            "penalaran-matematika": "Penalaran Matematika"
          };
          const subtestName = slugToName[categorySlug] || "Penalaran Umum";

          const { data } = await supabase
            .from("questions")
            .select("*")
            .ilike("text", `%%`); // Fetch all questions first

          if (data && data.length > 0) {
            // Filter by subtest name (case insensitive/loose match)
            const matched = data.filter((q: any) => 
              (q.subtest || "").toLowerCase().includes(subtestName.toLowerCase()) || 
              (q.text || "").toLowerCase().includes(subtestName.toLowerCase())
            );
            
            if (matched.length > 0) {
              // Shuffle and select up to 15 questions for quick practice session
              dbData = [...matched].sort(() => 0.5 - Math.random()).slice(0, 15);
            } else {
              // Fallback to any random questions from the database if no direct match is found
              dbData = [...data].sort(() => 0.5 - Math.random()).slice(0, 15);
            }
          }
        } else {
          const { data } = await supabase
            .from("questions")
            .select("*")
            .eq("tryout_id", tryoutId)
            .order("id");
          dbData = data;
        }

        if (dbData && dbData.length > 0) {
          setQuestions(dbData);
        } else {
          // Fallback sample questions if DB empty
          setQuestions([
            {
              id: "q1",
              tryout_id: tryoutId,
              subtest: "Penalaran Umum",
              question_text:
                "Jika semua siswa yang belajar secara konsisten lulus UTBK, dan Amanda adalah siswa yang belajar secara konsisten, maka kesimpulan yang paling tepat adalah...",
              option_a: "Amanda mungkin lulus UTBK jika beruntung.",
              option_b: "Amanda pasti lulus UTBK.",
              option_c: "Amanda tidak akan lulus UTBK.",
              option_d: "Amanda harus belajar lebih keras lagi.",
              option_e: "Siswa selain Amanda juga dipastikan lulus UTBK.",
            },
            {
              id: "q2",
              tryout_id: tryoutId,
              subtest: "Penalaran Matematika",
              question_text:
                "Sebuah nilai rata-rata Try Out 5 orang siswa adalah 700. Jika nilai satu orang siswa baru dimasukkan, rata-ratanya menjadi 720. Berapakah nilai siswa baru tersebut?",
              option_a: "780",
              option_b: "800",
              option_c: "820",
              option_d: "840",
              option_e: "860",
            },
            {
              id: "q3",
              tryout_id: tryoutId,
              subtest: "Literasi Bahasa Indonesia",
              question_text:
                "Gagasan utama paragraf di atas menekankan pentingnya peningkatan literasi digital bagi generasi muda untuk menghadapi persaingan global. Kata 'literasi' dalam konteks ini bermakna...",
              option_a: "Kemampuan membaca dan menulis secara mekanis.",
              option_b: "Kemampuan memahami dan mengaplikasikan informasi secara kritis.",
              option_c: "Keterampilan mengoperasikan perangkat komputer modern.",
              option_d: "Koleksi buku-buku digital di perpustakaan daring.",
              option_e: "Kemampuan berkomunikasi di media sosial.",
            },
          ]);
        }
      } catch (err) {
        console.error("Error fetching questions:", err);
      } finally {
        setLoading(false);
      }
    }

    loadQuestions();
  }, [tryoutId]);

  // Sticky Countdown Timer Effect
  useEffect(() => {
    if (timeLeftSeconds <= 0) return;
    const timer = setInterval(() => {
      setTimeLeftSeconds((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeftSeconds]);

  const formatTimer = (secs: number) => {
    const hours = Math.floor(secs / 3600);
    const minutes = Math.floor((secs % 3600) / 60);
    const seconds = secs % 60;
    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  };

  const currentQ = questions[currentIndex];

  const handleSelectOption = (value: string) => {
    if (!currentQ) return;
    setAnswers((prev) => ({ ...prev, [currentQ.id]: value }));
  };

  const toggleFlag = () => {
    if (!currentQ) return;
    setFlagged((prev) => ({ ...prev, [currentQ.id]: !prev[currentQ.id] }));
  };

  const handleSubmitTest = () => {
    startTransition(async () => {
      const res = await submitTryoutAction({
        tryoutId,
        answers,
      });

      if (res?.success && res?.resultId) {
        router.push(`/tryout/result/${res.resultId}`);
      }
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center space-y-4 font-sans">
        <Loader2 className="h-10 w-10 text-blue-600 animate-spin" />
        <p className="text-sm font-semibold text-slate-600">Menyiapkan Lembar Ujian CBT...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans select-none">
      {/* ---------------- FIXED CBT HEADER BAR ---------------- */}
      <header className="sticky top-0 z-50 bg-white border-b border-slate-200 h-16 px-4 sm:px-8 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-3">
          <Link href="/dashboard/student" className="flex items-center gap-2">
            <Image
              src="/logo.svg"
              alt="UpdatePTN Logo"
              width={32}
              height={32}
              className="h-8 w-auto object-contain"
            />
          </Link>
          <div>
            <h1 className="font-extrabold text-sm sm:text-base text-slate-900">Simulasi CBT UTBK</h1>
            <p className="text-[11px] text-slate-500 font-medium">{currentQ?.subtest || "Subtes UTBK"}</p>
          </div>
        </div>

        {/* Timer Display */}
        <div className="flex items-center gap-4">
          <div className="bg-slate-100 border border-slate-200 px-4 py-1.5 rounded-xl flex items-center gap-2">
            <Clock className="h-4 w-4 text-blue-600 animate-pulse" />
            <span className="font-mono font-bold text-sm sm:text-base text-slate-900">
              {formatTimer(timeLeftSeconds)}
            </span>
          </div>

          {/* Submit Dialog Button */}
          <Dialog open={isSubmitDialogOpen} onOpenChange={setIsSubmitDialogOpen}>
            <DialogTrigger render={
              <Button className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm rounded-xl gap-2 h-10 px-4">
                <Send className="h-4 w-4" />
                <span className="hidden sm:inline">Selesai Ujian</span>
              </Button>
            } />
            <DialogContent className="sm:max-w-md rounded-2xl bg-white p-6">
              <DialogHeader className="space-y-2">
                <div className="h-12 w-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-2">
                  <FileCheck2 className="h-6 w-6" />
                </div>
                <DialogTitle className="text-xl font-bold text-center text-slate-900">
                  Kirim Lembar Jawaban?
                </DialogTitle>
                <DialogDescription className="text-center text-sm text-slate-500">
                  Kamu telah menjawab <strong className="text-slate-900">{Object.keys(answers).length}</strong> dari <strong className="text-slate-900">{questions.length}</strong> soal. Setelah dikirim, jawaban tidak dapat diubah lagi.
                </DialogDescription>
              </DialogHeader>

              <DialogFooter className="flex sm:flex-row gap-2 pt-4 border-t border-slate-100">
                <Button
                  variant="outline"
                  onClick={() => setIsSubmitDialogOpen(false)}
                  className="flex-1 rounded-xl border-slate-200 font-semibold"
                >
                  Periksa Kembali
                </Button>
                <Button
                  onClick={handleSubmitTest}
                  disabled={isPending}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl gap-2"
                >
                  {isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Menilai...</span>
                    </>
                  ) : (
                    <span>Ya, Selesaikan</span>
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </header>

      {/* ---------------- MAIN CBT TEST VIEWPORT ---------------- */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left/Middle: Question & Answer Block (max-w-3xl reading area) */}
        <div className="lg:col-span-8 space-y-6">
          <Card className="bg-white border border-slate-200 shadow-sm rounded-2xl p-6 sm:p-8 space-y-6">
            {/* Question Header Status */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 font-bold text-xs">
                  Soal No. {currentIndex + 1}
                </Badge>
                <span className="text-xs font-semibold text-slate-400">/ {questions.length}</span>
              </div>

              <Button
                variant={flagged[currentQ?.id] ? "destructive" : "outline"}
                size="sm"
                onClick={toggleFlag}
                className="rounded-xl gap-2 font-semibold text-xs h-9"
              >
                <Flag className="h-3.5 w-3.5" />
                <span>{flagged[currentQ?.id] ? "Ragu-Ragu (Tersimpan)" : "Tandai Ragu-Ragu"}</span>
              </Button>
            </div>

            {/* Question Reading Body */}
            <div className="space-y-4">
              <p className="text-base sm:text-lg text-slate-900 font-medium leading-relaxed">
                {currentQ?.question_text}
              </p>
            </div>

            {/* Options A - E Selector */}
            <div className="space-y-3 pt-2">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Pilihan Jawaban:</p>
              
              <RadioGroup
                value={answers[currentQ?.id] || ""}
                onValueChange={handleSelectOption}
                className="space-y-2.5"
              >
                {[
                  { key: "A", text: currentQ?.option_a },
                  { key: "B", text: currentQ?.option_b },
                  { key: "C", text: currentQ?.option_c },
                  { key: "D", text: currentQ?.option_d },
                  { key: "E", text: currentQ?.option_e },
                ].map((opt) => {
                  const isSelected = answers[currentQ?.id] === opt.key;
                  return (
                    <Label
                      key={opt.key}
                      htmlFor={`opt-${opt.key}`}
                      className={`flex items-start gap-3.5 p-4 rounded-xl border transition-all cursor-pointer ${
                        isSelected
                          ? "bg-blue-50 border-blue-600 text-blue-950 shadow-xs"
                          : "bg-white border-slate-200 hover:bg-slate-50 text-slate-800"
                      }`}
                    >
                      <RadioGroupItem
                        value={opt.key}
                        id={`opt-${opt.key}`}
                        className="mt-0.5 border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                      <div className="flex gap-2">
                        <span className="font-bold text-sm text-blue-600">{opt.key}.</span>
                        <span className="text-sm font-normal leading-relaxed">{opt.text}</span>
                      </div>
                    </Label>
                  );
                })}
              </RadioGroup>
            </div>

            {/* Navigation Footer */}
            <div className="flex items-center justify-between border-t border-slate-100 pt-6 mt-6">
              <Button
                variant="outline"
                disabled={currentIndex === 0}
                onClick={() => setCurrentIndex((prev) => prev - 1)}
                className="rounded-xl border-slate-200 font-semibold gap-2 h-11"
              >
                <ChevronLeft className="h-4 w-4" />
                <span>Sebelumnya</span>
              </Button>

              <Button
                disabled={currentIndex === questions.length - 1}
                onClick={() => setCurrentIndex((prev) => prev + 1)}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl gap-2 h-11 px-6"
              >
                <span>Berikutnya</span>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </Card>
        </div>

        {/* Right Sidebar: Question Number Palette Grid */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="bg-white border border-slate-200 shadow-sm rounded-2xl p-6 space-y-4 sticky top-20">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900">Navigasi Nomor Soal</h3>
              <Badge variant="outline" className="text-[11px] font-semibold text-slate-500 border-slate-200">
                {Object.keys(answers).length} / {questions.length} Terjawab
              </Badge>
            </div>

            {/* Palette Grid */}
            <div className="grid grid-cols-5 gap-2.5">
              {questions.map((q, idx) => {
                const isCurrent = idx === currentIndex;
                const isAnswered = Boolean(answers[q.id]);
                const isFlagged = Boolean(flagged[q.id]);

                let styleClass = "bg-white border-slate-200 text-slate-700 hover:bg-slate-50";

                if (isCurrent) {
                  styleClass = "ring-2 ring-blue-600 bg-blue-600 text-white font-bold";
                } else if (isFlagged) {
                  styleClass = "bg-amber-500 text-white font-bold border-amber-600";
                } else if (isAnswered) {
                  styleClass = "bg-blue-50 text-blue-700 border-blue-300 font-bold";
                }

                return (
                  <button
                    key={q.id}
                    onClick={() => setCurrentIndex(idx)}
                    className={`h-11 rounded-xl text-xs font-semibold flex items-center justify-center border transition-all ${styleClass}`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>

            {/* Legend */}
            <div className="pt-4 border-t border-slate-100 space-y-2 text-[11px] text-slate-500 font-medium">
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-blue-600 inline-block"></span>
                <span>Sedang Dikerjakan</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-blue-50 border border-blue-300 inline-block"></span>
                <span>Sudah Dijawab</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-amber-500 inline-block"></span>
                <span>Ragu-Ragu</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-white border border-slate-300 inline-block"></span>
                <span>Belum Dijawab</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
