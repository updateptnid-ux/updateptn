"use client";

import { useState, useEffect, useRef, useTransition } from "react";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { calculateProbabilityAction } from "@/actions/predict";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Target,
  ShieldCheck,
  ArrowLeft,
  Loader2,
  Building2,
  BookOpen,
  Search,
  ChevronDown,
  Check,
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
  const [univSearch, setUnivSearch] = useState<string>("");
  const [isUnivOpen, setIsUnivOpen] = useState<boolean>(false);
  
  const [majors, setMajors] = useState<ProdiReferenceItem[]>([]);
  const [selectedProdiId, setSelectedProdiId] = useState<string>("");
  const [majorSearch, setMajorSearch] = useState<string>("");
  const [isMajorOpen, setIsMajorOpen] = useState<boolean>(false);

  const [score, setScore] = useState<string | number>(720);
  const [result, setResult] = useState<PredictionResult | null>(null);
  
  const [loadingUnivs, setLoadingUnivs] = useState(true);
  const [loadingMajors, setLoadingMajors] = useState(false);
  const [isPending, startTransition] = useTransition();

  const univContainerRef = useRef<HTMLDivElement>(null);
  const majorContainerRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (univContainerRef.current && !univContainerRef.current.contains(event.target as Node)) {
        setIsUnivOpen(false);
      }
      if (majorContainerRef.current && !majorContainerRef.current.contains(event.target as Node)) {
        setIsMajorOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // 1. Fetch Complete List of Unique Universities from prodi_reference or JSON fallback
  useEffect(() => {
    async function loadUniversities() {
      try {
        setLoadingUnivs(true);
        const supabase = createClient();

        let allData: any[] = [];
        let from = 0;
        const batchSize = 1000;
        let hasMore = true;

        while (hasMore) {
          const { data, error } = await supabase
            .from("prodi_reference")
            .select("univ")
            .order("univ", { ascending: true })
            .range(from, from + batchSize - 1);

          if (error) {
            console.error("DB error:", error);
            break;
          }

          if (data && data.length > 0) {
            allData = [...allData, ...data];
            from += batchSize;
            if (data.length < batchSize) hasMore = false;
          } else {
            hasMore = false;
          }
        }

        if (allData.length > 0) {
          const uniqueUnivs = Array.from(new Set(allData.map((item: any) => item.univ).filter(Boolean))).sort() as string[];
          setUniversities(uniqueUnivs);
          if (uniqueUnivs.length > 0) {
            setSelectedUniv(uniqueUnivs[0]);
          }
        } else {
          // Fallback to local /data_snbt.json
          const res = await fetch("/data_snbt.json");
          if (res.ok) {
            const localData = await res.json();
            const uniqueUnivs = Array.from(new Set(localData.map((item: any) => item.univ).filter(Boolean))).sort() as string[];
            setUniversities(uniqueUnivs);
            if (uniqueUnivs.length > 0) {
              setSelectedUniv(uniqueUnivs[0]);
            }
          } else {
            const fallbackUnivs = [
              "UNIVERSITAS INDONESIA",
              "INSTITUT TEKNOLOGI BANDUNG",
              "UNIVERSITAS GADJAH MADA",
              "UNIVERSITAS BRAWIJAYA",
              "UNIVERSITAS AIRLANGGA",
              "UNIVERSITAS DIPONEGORO",
              "UNIVERSITAS PADJADJARAN",
              "INSTITUT TEKNOLOGI SEPULUH NOPEMBER",
            ];
            setUniversities(fallbackUnivs);
            setSelectedUniv(fallbackUnivs[0]);
          }
        }
      } catch (err) {
        console.error("Error loading PTN list:", err);
      } finally {
        setLoadingUnivs(false);
      }
    }

    loadUniversities();
  }, []);

  // 2. Fetch ALL Majors when selected University changes
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
          .limit(1000)
          .order("prodi", { ascending: true });

        if (!error && data && data.length > 0) {
          setMajors(data as ProdiReferenceItem[]);
          setSelectedProdiId(String(data[0].id));
        } else {
          // Fallback to local /data_snbt.json
          const res = await fetch("/data_snbt.json");
          if (res.ok) {
            const localData = await res.json();
            const filtered = localData.filter((item: any) => item.univ === selectedUniv);
            if (filtered.length > 0) {
              setMajors(filtered);
              setSelectedProdiId(String(filtered[0].id));
            } else {
              const sample = [
                { id: "1", univ: selectedUniv, prodi: "Ilmu Komputer", jenjang: "S1", kelompok: "Saintek", passing_grade_est: 715 },
                { id: "2", univ: selectedUniv, prodi: "Kedokteran", jenjang: "S1", kelompok: "Saintek", passing_grade_est: 735 },
                { id: "3", univ: selectedUniv, prodi: "Manajemen", jenjang: "S1", kelompok: "Soshum", passing_grade_est: 690 },
              ];
              setMajors(sample);
              setSelectedProdiId("1");
            }
          }
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
      // Find selected prodi object
      let currentProdi = majors.find((m) => String(m.id) === String(selectedProdiId));
      
      const res = await calculateProbabilityAction({
        score: numScore,
        universityName: selectedUniv,
        prodiId: selectedProdiId,
      });

      if (res?.success) {
        // If passingGrade in res was default 700 but we have exact passing_grade_est in local prodi object
        if (currentProdi?.passing_grade_est && res.passingGrade === 700) {
          const pg = Number(currentProdi.passing_grade_est);
          const diff = numScore - pg;
          let percentage = 75;
          let status: "AMAN" | "BERSAING" | "RENTAN" = "BERSAING";
          let recommendation = "";

          if (diff >= 20) {
            status = "AMAN";
            percentage = Math.min(98, Math.round(85 + (diff - 20) * 0.4));
            recommendation = `Skor kamu (${numScore}) berada +${diff.toFixed(1)} poin di atas estimasi ketetatan (${pg}). Peluang kelulusan di ${currentProdi.prodi} - ${selectedUniv} SANGAT TINGGI!`;
          } else if (diff >= 0) {
            status = "BERSAING";
            percentage = Math.round(60 + (diff / 20) * 24);
            recommendation = `Skor kamu (${numScore}) melampaui estimasi passing grade (${pg}) sebesar +${diff.toFixed(1)} poin. Berada di zona kompetisi aktif.`;
          } else {
            status = "RENTAN";
            percentage = Math.max(25, Math.round(60 + diff * 1.2));
            recommendation = `Skor kamu (${numScore}) berjarak ${Math.abs(diff).toFixed(1)} poin di bawah estimasi (${pg}). Pertimbangkan jurusan ini di Pilihan 2.`;
          }

          setResult({
            score: numScore,
            passingGrade: pg,
            diff,
            percentage,
            status,
            majorName: `${currentProdi.jenjang ? `${currentProdi.jenjang} ` : ""}${currentProdi.prodi}`,
            universityName: selectedUniv,
            recommendation,
          });
        } else {
          setResult(res as PredictionResult);
        }
      }
    });
  };

  const filteredUnivs = universities.filter((u) =>
    u.toLowerCase().includes(univSearch.trim().toLowerCase())
  );

  const filteredMajors = majors.filter((m) =>
    `${m.prodi} ${m.jenjang || ""} ${m.kelompok || ""}`
      .toLowerCase()
      .includes(majorSearch.trim().toLowerCase())
  );

  const selectedProdiObj = majors.find((m) => String(m.id) === String(selectedProdiId));

  return (
    <div className="max-w-4xl w-full mx-auto space-y-8 py-4 font-sans">
      {/* Header Title */}
      <div className="text-center space-y-3">
        <Badge variant="outline" className="px-3.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border-blue-200 inline-block">
          Rasionalisasi Algoritma PTN
        </Badge>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
          Cek Peluang Kelulusan PTN
        </h1>
        <p className="text-slate-500 text-sm sm:text-base max-w-xl mx-auto">
          Bandingkan skor IRT Try Out kamu dengan estimasi keketatan 4.900+ Jurusan di PTN Impian secara presisi.
        </p>
      </div>

      {/* Input Form Card */}
      <Card className="border border-slate-200 shadow-md rounded-2xl bg-white p-6 sm:p-8">
        {loadingUnivs ? (
          <div className="flex flex-col items-center justify-center py-12 space-y-3">
            <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
            <p className="text-xs font-semibold text-slate-500">Memuat Database 4.900+ PTN & Jurusan...</p>
          </div>
        ) : (
          <form onSubmit={handleAnalyze} className="space-y-6">
            {/* Skor UTBK Input Section */}
            <div className="bg-slate-50 p-4 sm:p-5 rounded-2xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <Label htmlFor="score" className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-1">
                  Skor IRT UTBK / Try Out Kamu
                </Label>
                <p className="text-xs text-slate-400">Masukkan total skor hasil Try Out atau latihan subtes</p>
              </div>
              <div className="w-full sm:w-48">
                <Input
                  id="score"
                  type="number"
                  min={300}
                  max={1000}
                  value={score}
                  onChange={(e) => {
                    const val = e.target.value;
                    setScore(val === "" ? "" : Number(val));
                  }}
                  required
                  className="h-12 rounded-xl text-lg font-black text-blue-600 bg-white border-slate-300 text-center"
                />
              </div>
            </div>

            {/* Selection Grid: PTN & Jurusan */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* PTN Selection Combobox */}
              <div className="space-y-2 relative" ref={univContainerRef}>
                <Label className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center justify-between">
                  <span>1. Perguruan Tinggi Negeri (PTN)</span>
                  <span className="text-[11px] font-normal text-slate-400">{universities.length} PTN</span>
                </Label>

                <button
                  type="button"
                  onClick={() => setIsUnivOpen(!isUnivOpen)}
                  className="w-full h-13 px-4 bg-white border border-slate-300 rounded-xl text-sm font-bold text-slate-900 flex items-center justify-between hover:border-blue-500 transition-colors shadow-xs"
                >
                  <div className="flex items-center gap-3 truncate">
                    <Building2 className="h-5 w-5 text-blue-600 shrink-0" />
                    <span className="truncate">{selectedUniv || "Pilih PTN Target"}</span>
                  </div>
                  <ChevronDown className="h-4 w-4 text-slate-500 shrink-0" />
                </button>

                {isUnivOpen && (
                  <div className="absolute top-full left-0 right-0 mt-2 z-50 bg-white border border-slate-200 shadow-2xl rounded-2xl p-3 flex flex-col gap-2 max-h-80 animate-in fade-in zoom-in-95">
                    <div className="relative">
                      <Search className="h-4 w-4 text-slate-400 absolute left-3.5 top-3.5" />
                      <input
                        type="text"
                        value={univSearch}
                        onChange={(e) => setUnivSearch(e.target.value)}
                        placeholder="Ketik nama PTN (cth: UI, ITB, UGM)..."
                        className="w-full h-10 pl-10 pr-3 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:border-blue-600 font-medium"
                        autoFocus
                      />
                    </div>

                    <div className="flex items-center justify-between px-1 text-[11px] font-semibold text-slate-400">
                      <span>Daftar Kampus Negeri</span>
                      <span>{filteredUnivs.length} ditemukan</span>
                    </div>

                    <div className="max-h-56 overflow-y-auto space-y-1 pr-1">
                      {filteredUnivs.length > 0 ? (
                        filteredUnivs.map((univName) => (
                          <button
                            key={univName}
                            type="button"
                            onClick={() => {
                              setSelectedUniv(univName);
                              setIsUnivOpen(false);
                              setUnivSearch("");
                            }}
                            className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center justify-between transition-colors ${
                              selectedUniv === univName
                                ? "bg-blue-600 text-white"
                                : "text-slate-800 hover:bg-slate-100"
                            }`}
                          >
                            <span className="truncate">{univName}</span>
                            {selectedUniv === univName && <Check className="h-4 w-4 text-white shrink-0" />}
                          </button>
                        ))
                      ) : (
                        <div className="p-4 text-center text-xs text-slate-400 font-medium">
                          PTN "{univSearch}" tidak ditemukan
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Major Selection Combobox */}
              <div className="space-y-2 relative" ref={majorContainerRef}>
                <Label className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center justify-between">
                  <span>2. Program Studi (Jurusan)</span>
                  {loadingMajors && <Loader2 className="h-3.5 w-3.5 animate-spin text-blue-600" />}
                </Label>

                <button
                  type="button"
                  disabled={loadingMajors || majors.length === 0}
                  onClick={() => setIsMajorOpen(!isMajorOpen)}
                  className="w-full h-13 px-4 bg-white border border-slate-300 rounded-xl text-sm font-bold text-slate-900 flex items-center justify-between hover:border-blue-500 transition-colors shadow-xs disabled:opacity-50"
                >
                  <div className="flex items-center gap-3 truncate">
                    <BookOpen className="h-5 w-5 text-blue-600 shrink-0" />
                    <span className="truncate">
                      {selectedProdiObj
                        ? `${selectedProdiObj.prodi}${selectedProdiObj.jenjang ? ` (${selectedProdiObj.jenjang})` : ""}${selectedProdiObj.kelompok ? ` - ${selectedProdiObj.kelompok}` : ""}`
                        : (loadingMajors ? "Memuat jurusan..." : "Pilih Jurusan")}
                    </span>
                  </div>
                  <ChevronDown className="h-4 w-4 text-slate-500 shrink-0" />
                </button>

                {isMajorOpen && (
                  <div className="absolute top-full left-0 right-0 mt-2 z-50 bg-white border border-slate-200 shadow-2xl rounded-2xl p-3 flex flex-col gap-2 max-h-80 animate-in fade-in zoom-in-95">
                    <div className="relative">
                      <Search className="h-4 w-4 text-slate-400 absolute left-3.5 top-3.5" />
                      <input
                        type="text"
                        value={majorSearch}
                        onChange={(e) => setMajorSearch(e.target.value)}
                        placeholder="Ketik jurusan (cth: Kedokteran, Informatika)..."
                        className="w-full h-10 pl-10 pr-3 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:border-blue-600 font-medium"
                        autoFocus
                      />
                    </div>

                    <div className="flex items-center justify-between px-1 text-[11px] font-semibold text-slate-400">
                      <span>Jurusan di {selectedUniv}</span>
                      <span>{filteredMajors.length} prodi</span>
                    </div>

                    <div className="max-h-56 overflow-y-auto space-y-1 pr-1">
                      {filteredMajors.length > 0 ? (
                        filteredMajors.map((m) => {
                          const isSelected = String(m.id) === String(selectedProdiId);
                          const label = `${m.prodi}${m.jenjang ? ` (${m.jenjang})` : ""}${m.kelompok ? ` - ${m.kelompok}` : ""}`;
                          return (
                            <button
                              key={m.id}
                              type="button"
                              onClick={() => {
                                setSelectedProdiId(String(m.id));
                                setIsMajorOpen(false);
                                setMajorSearch("");
                              }}
                              className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center justify-between transition-colors ${
                                isSelected
                                  ? "bg-blue-600 text-white"
                                  : "text-slate-800 hover:bg-slate-100"
                              }`}
                            >
                              <span className="truncate">{label}</span>
                              {isSelected && <Check className="h-4 w-4 text-white shrink-0" />}
                            </button>
                          );
                        })
                      ) : (
                        <div className="p-4 text-center text-xs text-slate-400 font-medium">
                          Jurusan "{majorSearch}" tidak ditemukan
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <Button
              type="submit"
              disabled={isPending || !selectedProdiId}
              className="w-full h-13 text-base font-extrabold bg-blue-600 hover:bg-blue-700 text-white rounded-xl gap-2 shadow-md hover:shadow-lg transition-all"
            >
              {isPending ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>Menganalisis Algoritma Rasionalisasi...</span>
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
    </div>
  );
}
