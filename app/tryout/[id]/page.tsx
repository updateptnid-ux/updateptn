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
import { Input } from "@/components/ui/input";
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
  Search,
  Target,
  BookOpen,
  CheckCircle2,
} from "lucide-react";

interface ProdiItem {
  id: string | number;
  univ: string;
  prodi: string;
  jenjang?: string;
  kelompok?: string;
  passing_grade_est?: number;
}

interface QuestionItem {
  id: string;
  tryout_id?: string;
  subtest: string;
  question_text?: string;
  text?: string;
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
  const [timeLeftSeconds, setTimeLeftSeconds] = useState<number>(7200);
  const [loading, setLoading] = useState<boolean>(true);
  const [isSubmitDialogOpen, setIsSubmitDialogOpen] = useState<boolean>(false);
  const [isPending, startTransition] = useTransition();

  // Target Jurusan Picker state
  const [showTargetPicker, setShowTargetPicker] = useState<boolean>(false);
  const [prodiList, setProdiList] = useState<ProdiItem[]>([]);
  const [prodiSearch, setProdiSearch] = useState("");
  const [selectedPtn, setSelectedPtn] = useState("");
  const [selectedProdi, setSelectedProdi] = useState("");
  const [selectedPg, setSelectedPg] = useState<number>(695);
  const [targetConfirmed, setTargetConfirmed] = useState(false);

  // Helper to normalize question objects
  const normalizeQuestions = (data: any[]): QuestionItem[] => {
    return data.map((q, idx) => ({
      ...q,
      id: q.id || `q-${idx + 1}`,
      question_text: q.text || q.question_text || "Teks soal tidak tersedia.",
      text: q.text || q.question_text || "Teks soal tidak tersedia.",
    }));
  };

  // Fetch Questions from Supabase or Fallback JSON
  useEffect(() => {
    async function loadQuestions() {
      try {
        setLoading(true);
        const supabase = createClient();
        let dbData: any[] | null = null;

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
            .select("*");

          if (data && data.length > 0) {
            const matched = data.filter((q: any) => 
              (q.subtest || "").toLowerCase().includes(subtestName.toLowerCase()) || 
              (q.text || q.question_text || "").toLowerCase().includes(subtestName.toLowerCase())
            );
            
            if (matched.length > 0) {
              dbData = [...matched].sort(() => 0.5 - Math.random()).slice(0, 15);
            } else {
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

          // If no questions specific to tryoutId, fetch all DB questions
          if (!dbData || dbData.length === 0) {
            const { data: allData } = await supabase.from("questions").select("*");
            if (allData && allData.length > 0) {
              dbData = allData;
            }
          }
        }

        if (dbData && dbData.length > 0) {
          setQuestions(normalizeQuestions(dbData));
        } else {
          // Fallback to local /40_soal_snbt.json
          try {
            const res = await fetch("/40_soal_snbt.json");
            if (res.ok) {
              const localJson = await res.json();
              if (localJson && localJson.length > 0) {
                setQuestions(normalizeQuestions(localJson));
              } else {
                setQuestions([]);
              }
            }
          } catch (jsonErr) {
            console.error("Error loading JSON fallback:", jsonErr);
            setQuestions([]);
          }
        }
      } catch (err) {
        console.error("Error fetching questions:", err);
        // Try JSON fallback on error
        try {
          const res = await fetch("/40_soal_snbt.json");
          if (res.ok) {
            const localJson = await res.json();
            setQuestions(normalizeQuestions(localJson));
          }
        } catch {
          setQuestions([]);
        }
      } finally {
        setLoading(false);
      }
    }

    loadQuestions();
  }, [tryoutId]);

  // Fetch Autocomplete Suggestions via Supabase RPC search_kampus_pintar
  useEffect(() => {
    if (prodiSearch.trim().length < 2) {
      setProdiList([]);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const supabase = createClient();
        const { data, error } = await supabase.rpc("search_kampus_pintar", {
          keyword: prodiSearch.trim(),
        });

        if (!error && data && data.length > 0) {
          setProdiList(data as ProdiItem[]);
        } else {
          // Fallback to local
          const res = await fetch("/data_snbt.json");
          if (res.ok) {
            const localData = await res.json();
            const q = prodiSearch.toLowerCase();
            const filtered = localData.filter((p: any) => 
              p.univ.toLowerCase().includes(q) || 
              p.prodi.toLowerCase().includes(q)
            ).slice(0, 30);
            setProdiList(filtered);
          }
        }
      } catch (err) {
        console.error("Error searching prodi:", err);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [prodiSearch]);

  const filteredProdi = prodiList;

  // Show target picker after loading finishes (only once per session)
  useEffect(() => {
    if (!loading) {
      const saved = localStorage.getItem("tryout_target_ptn");
      if (!saved) {
        setShowTargetPicker(true);
      } else {
        setSelectedPtn(localStorage.getItem("tryout_target_ptn") || "");
        setSelectedProdi(localStorage.getItem("tryout_target_prodi") || "");
        setSelectedPg(Number(localStorage.getItem("tryout_target_pg")) || 695);
        setTargetConfirmed(true);
      }
    }
  }, [loading]);



  const handleConfirmTarget = () => {
    if (!selectedPtn || !selectedProdi) return;
    localStorage.setItem("tryout_target_ptn", selectedPtn);
    localStorage.setItem("tryout_target_prodi", selectedProdi);
    localStorage.setItem("tryout_target_pg", String(selectedPg));
    setTargetConfirmed(true);
    setShowTargetPicker(false);
  };

  const handleSkipTarget = () => {
    localStorage.setItem("tryout_target_ptn", "UNIVERSITAS INDONESIA");
    localStorage.setItem("tryout_target_prodi", "S1 Ilmu Komputer");
    localStorage.setItem("tryout_target_pg", "710");
    setSelectedPtn("UNIVERSITAS INDONESIA");
    setSelectedProdi("S1 Ilmu Komputer");
    setSelectedPg(710);
    setTargetConfirmed(true);
    setShowTargetPicker(false);
  };

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

  // --- TARGET JURUSAN PICKER SCREEN ---
  if (showTargetPicker) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-950 via-slate-900 to-indigo-950 flex flex-col items-center justify-center p-4 font-sans">
        <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-6 text-white">
            <div className="flex items-center gap-3 mb-3">
              <div className="h-10 w-10 rounded-2xl bg-white/20 flex items-center justify-center">
                <Target className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-xs font-bold opacity-80 uppercase tracking-widest">Sebelum Mulai Try Out</p>
                <h2 className="text-xl font-extrabold">Pilih Target Jurusan</h2>
              </div>
            </div>
            <p className="text-sm opacity-80 leading-relaxed">
              Pilih PTN & Program Studi impianmu. Setelah TO selesai, kamu akan melihat analisis peluang kelulusan berdasarkan skor dan jurusan ini.
            </p>
          </div>

          {/* Search Input */}
          <div className="px-6 pt-5 pb-2">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                value={prodiSearch}
                onChange={(e) => {
                  setProdiSearch(e.target.value);
                  setSelectedPtn("");
                  setSelectedProdi("");
                }}
                placeholder="Cari jurusan atau nama PTN..."
                className="pl-10 rounded-xl border-slate-200 bg-slate-50 h-11 text-sm font-medium"
                autoFocus
              />
            </div>
          </div>

          {/* Selected Banner */}
          {selectedProdi && (
            <div className="mx-6 mb-2 p-3 rounded-xl bg-blue-50 border border-blue-200 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-blue-600 shrink-0" />
              <div className="min-w-0">
                <p className="text-xs font-extrabold text-blue-900 truncate">{selectedProdi}</p>
                <p className="text-[11px] text-blue-600 font-medium truncate">{selectedPtn}</p>
              </div>
            </div>
          )}

          {/* Prodi List */}
          <div className="px-6 pb-2 max-h-64 overflow-y-auto space-y-1.5">
            {prodiSearch.length < 2 ? (
              <div className="text-center py-8 text-sm text-slate-400 font-medium">
                <BookOpen className="h-8 w-8 mx-auto mb-2 opacity-40" />
                Ketik nama jurusan atau PTN untuk mencari...
              </div>
            ) : filteredProdi.length === 0 ? (
              <div className="text-center py-6 text-sm text-slate-400">Jurusan tidak ditemukan.</div>
            ) : (
              filteredProdi.map((p) => {
                const isSelected = selectedPtn === p.univ && selectedProdi === p.prodi;
                return (
                  <button
                    key={`${p.univ}-${p.prodi}`}
                    onClick={() => {
                      setSelectedPtn(p.univ);
                      setSelectedProdi(p.prodi);
                      setSelectedPg(Number(p.passing_grade_est) || 695);
                    }}
                    className={`w-full text-left px-4 py-3 rounded-xl border transition-all ${
                      isSelected
                        ? "bg-blue-600 border-blue-600 text-white"
                        : "bg-white border-slate-200 hover:border-blue-300 hover:bg-blue-50"
                    }`}
                  >
                    <p className={`text-xs font-extrabold truncate ${isSelected ? "text-white" : "text-slate-900"}`}>
                      {p.prodi}{p.jenjang ? ` (${p.jenjang})` : ""}
                    </p>
                    <p className={`text-[11px] font-medium truncate ${isSelected ? "text-blue-100" : "text-slate-500"}`}>
                      {p.univ} · Est. PG {p.passing_grade_est ?? "–"}
                    </p>
                  </button>
                );
              })
            )}
          </div>

          {/* Footer Actions */}
          <div className="px-6 py-5 border-t border-slate-100 flex gap-3">
            <Button
              variant="outline"
              onClick={handleSkipTarget}
              className="flex-1 rounded-xl border-slate-200 text-slate-600 font-semibold text-xs h-11"
            >
              Lewati
            </Button>
            <Button
              onClick={handleConfirmTarget}
              disabled={!selectedPtn || !selectedProdi}
              className="flex-1 h-11 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs gap-2"
            >
              <Target className="h-4 w-4" />
              Mulai Try Out
            </Button>
          </div>
        </div>

        {/* Already confirmed indicator */}
        {targetConfirmed && (
          <p className="mt-4 text-xs text-white/60">
            Target tersimpan · {selectedProdi} di {selectedPtn}
          </p>
        )}
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
                {currentQ?.question_text || currentQ?.text}
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
