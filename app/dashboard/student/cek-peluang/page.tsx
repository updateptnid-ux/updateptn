"use client";

import { useState, useEffect, useTransition } from "react";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { calculateProbabilityAction } from "@/actions/predict";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  GraduationCap,
  Target,
  Sparkles,
  ShieldCheck,
  ArrowLeft,
  Loader2,
  Building2,
  BookOpen,
} from "lucide-react";

interface ProdiReferenceItem {
  id: string | number;
  univ: string;
  prodi: string;
  jenjang?: string;
  kelompok?: string;
  passing_grade_est?: number | string;
}

interface PredictionResult {
  score: number;
  passingGrade: number;
  diff: number;
  percentage: number;
  status: "AMAN" | "BERSAING" | "RENTAN";
  majorName: string;
  universityName: string;
  recommendation: string;
}

export default function CekPeluangPage() {
  const [universities, setUniversities] = useState<string[]>([]);
  const [selectedUniv, setSelectedUniv] = useState<string>("");
  
  const [majors, setMajors] = useState<ProdiReferenceItem[]>([]);
  const [selectedProdiId, setSelectedProdiId] = useState<string>("");

  const [score, setScore] = useState<string | number>(720);
  const [result, setResult] = useState<PredictionResult | null>(null);
  
  const [loadingUnivs, setLoadingUnivs] = useState(true);
  const [loadingMajors, setLoadingMajors] = useState(false);
  const [isPending, startTransition] = useTransition();

  // 1. Fetch Unique Universities from prodi_reference
  useEffect(() => {
    async function loadUniversities() {
      try {
        setLoadingUnivs(true);
        const supabase = createClient();

        // Fetch distinct universities from prodi_reference
        const { data, error } = await supabase
          .from("prodi_reference")
          .select("univ")
          .order("univ", { ascending: true });

        if (!error && data && data.length > 0) {
          // Deduplicate university names
          const uniqueUnivs = Array.from(new Set(data.map((item) => item.univ).filter(Boolean)));
          setUniversities(uniqueUnivs);
          if (uniqueUnivs.length > 0) {
            setSelectedUniv(uniqueUnivs[0]);
          }
        } else {
          // Fallback popular PTNs if DB initializing
          const fallbackUnivs = [
            "Universitas Indonesia (UI)",
            "Universitas Gadjah Mada (UGM)",
            "Institut Teknologi Bandung (ITB)",
            "Universitas Brawijaya (UB)",
            "Universitas Airlangga (UNAIR)",
            "Universitas Diponegoro (UNDIP)",
            "Universitas Padjadjaran (UNPAD)",
          ];
          setUniversities(fallbackUnivs);
          setSelectedUniv(fallbackUnivs[0]);
        }
      } catch (err) {
        console.error("Error loading PTN list:", err);
      } finally {
        setLoadingUnivs(false);
      }
    }

    loadUniversities();
  }, []);

  // 2. Fetch Majors when selected University changes
  useEffect(() => {
    if (!selectedUniv) return;

    async function loadMajorsForUniv() {
      try {
        setLoadingMajors(true);
        const supabase = createClient();

        const { data, error } = await supabase
          .from("prodi_reference")
          .select("id, univ, prodi, jenjang, kelompok, passing_grade_est")
          .eq("univ", selectedUniv)
          .order("prodi", { ascending: true });

        if (!error && data && data.length > 0) {
          setMajors(data as ProdiReferenceItem[]);
          setSelectedProdiId(String(data[0].id));
        } else {
          // Fallback majors if DB empty for this univ
          const sample = [
            { id: "1", univ: selectedUniv, prodi: "Ilmu Komputer", jenjang: "S1", kelompok: "Saintek", passing_grade_est: 715 },
            { id: "2", univ: selectedUniv, prodi: "Kedokteran", jenjang: "S1", kelompok: "Saintek", passing_grade_est: 735 },
            { id: "3", univ: selectedUniv, prodi: "Manajemen", jenjang: "S1", kelompok: "Soshum", passing_grade_est: 690 },
          ];
          setMajors(sample);
          setSelectedProdiId("1");
        }
      } catch (err) {
        console.error("Error loading majors:", err);
      } finally {
        setLoadingMajors(false);
      }
    }

    loadMajorsForUniv();
  }, [selectedUniv]);

  // Submit Handler for Prediction Calculation
  const handleAnalyze = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUniv || !selectedProdiId) return;
    const numScore = Number(score) || 720;

    startTransition(async () => {
      const res = await calculateProbabilityAction({
        score: numScore,
        universityName: selectedUniv,
        prodiId: selectedProdiId,
      });

      if (res?.success) {
        setResult(res as PredictionResult);
      }
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* Top Navigation Bar */}
      <header className="bg-white border-b border-slate-200 px-4 sm:px-8 h-16 flex items-center justify-between sticky top-0 z-40">
        <Link href="/dashboard/student" className="flex items-center gap-2.5">
          <Image
            src="/logo.svg"
            alt="UpdatePTN Logo"
            width={36}
            height={36}
            className="h-9 w-auto object-contain"
            priority
          />
          <span className="font-extrabold text-xl tracking-tight text-slate-900">
            Update<span className="text-blue-600">PTN</span>
          </span>
        </Link>

        <Link href="/dashboard/student">
          <Button variant="outline" size="sm" className="rounded-xl gap-2 font-semibold border-slate-200 text-xs">
            <ArrowLeft className="h-4 w-4" />
            <span>Kembali ke Dashboard</span>
          </Button>
        </Link>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-8 space-y-8 my-6">
        {/* Header Title */}
        <div className="text-center space-y-3">
          <Badge variant="outline" className="px-3.5 py-1.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border-blue-200 gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-blue-600" />
            <span>Rasionalisasi Algoritma PTN</span>
          </Badge>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
            Cek Peluang Kelulusan PTN
          </h1>
          <p className="text-slate-500 text-sm sm:text-base max-w-xl mx-auto">
            Bandingkan skor IRT Try Out kamu dengan estimasi keketatan 4.900+ Jurusan di PTN Impian secara presisi.
          </p>
        </div>

        {/* Input Form Card */}
        <Card className="border border-slate-200 shadow-sm rounded-2xl bg-white p-6 sm:p-8">
          {loadingUnivs ? (
            <div className="flex flex-col items-center justify-center py-12 space-y-3">
              <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
              <p className="text-xs font-semibold text-slate-500">Memuat Database 4.900+ PTN & Jurusan...</p>
            </div>
          ) : (
            <form onSubmit={handleAnalyze} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                {/* Score Input */}
                <div className="space-y-2">
                  <Label htmlFor="score" className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Skor UTBK / Try Out
                  </Label>
                  <Input
                    id="score"
                    type="number"
                    min={300}
                    max={1000}
                    value={score}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === "") {
                        setScore("");
                      } else {
                        setScore(Number(val));
                      }
                    }}
                    required
                    className="h-11 rounded-xl text-base font-bold text-blue-600 border-slate-200"
                  />
                  <span className="text-[11px] text-slate-400 block">Rentang: 300 - 1000</span>
                </div>

                {/* University Select */}
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Pilihan PTN Target
                  </Label>
                  <Select value={selectedUniv} onValueChange={(val) => val && setSelectedUniv(val)}>
                    <SelectTrigger className="h-11 rounded-xl border-slate-200 text-xs font-semibold">
                      <SelectValue placeholder="Pilih PTN Target" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-slate-200 rounded-xl max-h-64">
                      {universities.map((univName) => (
                        <SelectItem key={univName} value={univName} className="text-xs font-medium">
                          {univName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Major Select */}
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
                    <span>Pilihan Jurusan Target</span>
                    {loadingMajors && <Loader2 className="h-3 w-3 animate-spin text-blue-600" />}
                  </Label>
                  {(() => {
                    const selectedProdiObj = majors.find((m) => String(m.id) === String(selectedProdiId));
                    return (
                      <Select
                        disabled={loadingMajors || majors.length === 0}
                        value={selectedProdiId}
                        onValueChange={(val) => val && setSelectedProdiId(val)}
                      >
                        <SelectTrigger className="h-11 rounded-xl border-slate-200 text-xs font-semibold">
                          <SelectValue placeholder={loadingMajors ? "Memuat jurusan..." : "Pilih Jurusan"}>
                            {selectedProdiObj
                              ? `${selectedProdiObj.prodi}${selectedProdiObj.jenjang ? ` (${selectedProdiObj.jenjang})` : ""}${selectedProdiObj.kelompok ? ` - ${selectedProdiObj.kelompok}` : ""}`
                              : (loadingMajors ? "Memuat jurusan..." : "Pilih Jurusan")}
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent className="bg-white border-slate-200 rounded-xl max-h-64 z-50">
                          {majors.map((m) => (
                            <SelectItem key={m.id} value={String(m.id)} className="text-xs font-medium">
                              {m.prodi} {m.jenjang ? `(${m.jenjang})` : ""} {m.kelompok ? `- ${m.kelompok}` : ""}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    );
                  })()}
                </div>
              </div>

              <Button
                type="submit"
                disabled={isPending || !selectedProdiId}
                className="w-full h-12 text-sm font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl gap-2 shadow-sm"
              >
                {isPending ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>Menganalisis Peluang...</span>
                  </>
                ) : (
                  <>
                    <Target className="h-5 w-5" />
                    <span>Analisis Peluang Kelulusan Sekarang</span>
                  </>
                )}
              </Button>
            </form>
          )}
        </Card>

        {/* PREDICTION RESULT DISPLAY CARD */}
        {result && (
          <Card className="border border-blue-200 shadow-md rounded-2xl overflow-hidden bg-white p-6 sm:p-8 space-y-6 animate-in fade-in zoom-in-95">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <span className="text-xs text-slate-400 font-semibold">Hasil Analisis Rasionalisasi:</span>
                <h3 className="text-xl font-extrabold text-slate-900">
                  {result.majorName} • {result.universityName}
                </h3>
              </div>

              {result.status === "AMAN" && (
                <Badge className="bg-emerald-600 text-white font-bold text-xs px-3.5 py-1">
                  SANGAT TINGGI (AMAN)
                </Badge>
              )}
              {result.status === "BERSAING" && (
                <Badge className="bg-blue-600 text-white font-bold text-xs px-3.5 py-1">
                  MODERAT (BERSAING)
                </Badge>
              )}
              {result.status === "RENTAN" && (
                <Badge className="bg-amber-600 text-white font-bold text-xs px-3.5 py-1">
                  BERISIKO (RENTAN)
                </Badge>
              )}
            </div>

            {/* Probability Percentage Bar */}
            <div className="space-y-3">
              <div className="flex justify-between items-baseline">
                <span className="text-xs font-bold text-slate-500">Estimasi Peluang Lulus</span>
                <span className="text-3xl font-black text-blue-600">{result.percentage}%</span>
              </div>
              <Progress value={result.percentage} className="h-3 bg-slate-100 rounded-full" />
            </div>

            {/* Score Comparison Grid */}
            <div className="grid grid-cols-3 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200 text-center">
              <div>
                <span className="text-xs text-slate-400 block font-medium">Skor Kamu</span>
                <span className="text-xl font-extrabold text-slate-900">{result.score}</span>
              </div>
              <div>
                <span className="text-xs text-slate-400 block font-medium">Passing Grade</span>
                <span className="text-xl font-extrabold text-slate-900">{result.passingGrade}</span>
              </div>
              <div>
                <span className="text-xs text-slate-400 block font-medium">Selisih Poin</span>
                <span className={`text-xl font-extrabold ${result.diff >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
                  {result.diff >= 0 ? `+${result.diff.toFixed(1)}` : result.diff.toFixed(1)}
                </span>
              </div>
            </div>

            {/* Recommendation Box */}
            <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-100 flex items-start gap-3">
              <ShieldCheck className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
              <p className="text-xs text-slate-700 leading-relaxed font-medium">
                {result.recommendation}
              </p>
            </div>
          </Card>
        )}
      </main>
    </div>
  );
}
