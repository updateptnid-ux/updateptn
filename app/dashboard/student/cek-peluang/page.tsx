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

  // Quota tracking states
  const [remainingPredictions, setRemainingPredictions] = useState<number | null>(null);
  const [isSubscribed, setIsSubscribed] = useState<boolean>(false);
  const [userTier, setUserTier] = useState<string>("Basic");
  const [quotaError, setQuotaError] = useState<string>("");

  const univContainerRef = useRef<HTMLDivElement>(null);
  const majorContainerRef = useRef<HTMLDivElement>(null);

  // Fetch user quota on mount
  useEffect(() => {
    async function fetchUserQuota() {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const now = new Date().toISOString();

        // Cek subscription aktif dari tabel subscriptions
        const { data: subscription } = await supabase
          .from("subscriptions")
          .select("tier, status, expires_at")
          .eq("user_id", user.id)
          .eq("status", "active")
          .gt("expires_at", now)
          .order("expires_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        const subscribed =
          !!subscription &&
          subscription.status === "active" &&
          subscription.tier !== "Trial / Gratis" &&
          subscription.tier !== "Basic" &&
          new Date(subscription.expires_at) > new Date();

        const tier = subscription?.tier || "Basic";

        // Baca prediction_count dari profiles
        const { data: profile } = await supabase
          .from("profiles")
          .select("prediction_count, role")
          .eq("id", user.id)
          .maybeSingle();

        const isAdminUser = profile?.role === "admin";
        const count = profile?.prediction_count ?? 0;

        setIsSubscribed(subscribed || isAdminUser);
        setUserTier(tier);
        setRemainingPredictions(subscribed || isAdminUser ? 999 : Math.max(0, 2 - count));
      } catch (err) {
        console.error("Error fetching quota:", err);
      }
    }

    fetchUserQuota();
  }, []);


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

  // 2. Fetch majors — JSON lokal sebagai primary source (passing_grade_est verified)
  useEffect(() => {
    if (!selectedUniv) return;

    async function loadMajorsForUniv() {
      try {
        setLoadingMajors(true);

        // PRIMARY: local data_snbt.json — data verified & selalu sinkron
        const res = await fetch("/data_snbt.json");
        if (res.ok) {
          const localData = await res.json();
          const filtered = localData.filter((item: any) => item.univ === selectedUniv);
          if (filtered.length > 0) {
            setMajors(filtered);
            setSelectedProdiId(String(filtered[0].id));
            return;
          }
        }

        // FALLBACK: Supabase jika JSON tidak ada data untuk universitas ini
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
          // Last resort sample data
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
    setQuotaError("");
    setResult(null); // Clear previous result
    
    if (!selectedUniv || !selectedProdiId) return;
    const numScore = Number(score) || 720;

    startTransition(async () => {
      try {
        // Find selected prodi object
        let currentProdi = majors.find((m) => String(m.id) === String(selectedProdiId));
        
        const res = await calculateProbabilityAction({
          score: numScore,
          universityName: selectedUniv,
          prodiId: selectedProdiId,
        });

        console.log("Prediction response:", res); // Debug log

        // Handle quota exceeded error
        if (!res.success && res.error === "QuotaExceeded") {
          setQuotaError(res.message || "Quota habis. Upgrade untuk unlimited!");
          setRemainingPredictions(0);
          return;
        }

        // Handle other errors
        if (!res.success) {
          setQuotaError(res.message || "Terjadi kesalahan. Silakan coba lagi.");
          return;
        }

        if (res?.success) {
          // Update remaining predictions from response
          if (typeof res.remainingPredictions === "number") {
            setRemainingPredictions(res.remainingPredictions);
          }

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
      } catch (error) {
        console.error("Error during analysis:", error);
        setQuotaError("Terjadi kesalahan saat menganalisis. Silakan coba lagi.");
      }
    });
  };

  // Improved search with normalization and scoring
  const normalizeText = (text: string): string => {
    return text
      .toLowerCase()
      .trim()
      .replace(/\s+/g, ' ') // normalize multiple spaces
      .normalize('NFD').replace(/[\u0300-\u036f]/g, ''); // remove accents
  };

  // Calculate search relevance score
  const getRelevanceScore = (text: string, search: string): number => {
    const normalizedText = normalizeText(text);
    const normalizedSearch = normalizeText(search);
    
    if (!normalizedSearch) return 1;
    if (normalizedText === normalizedSearch) return 100; // exact match
    if (normalizedText.startsWith(normalizedSearch)) return 80; // starts with
    if (normalizedText.includes(normalizedSearch)) return 60; // contains
    
    // Check word-by-word match
    const words = normalizedSearch.split(' ').filter(w => w.length > 0);
    const matchedWords = words.filter(word => normalizedText.includes(word));
    if (matchedWords.length > 0) {
      return (matchedWords.length / words.length) * 40; // partial match
    }
    
    return 0;
  };

  const filteredUnivs = universities
    .map(u => ({ univ: u, score: getRelevanceScore(u, univSearch) }))
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .map(item => item.univ);

  // Enhanced major search with better matching and sorting
  const filteredMajors = majors
    .map((m) => {
      const searchTerm = normalizeText(majorSearch);
      
      // If no search, return all with neutral score
      if (!searchTerm) return { major: m, score: 1 };
      
      // Calculate scores for different fields
      const prodiScore = getRelevanceScore(m.prodi, searchTerm);
      const jenjangScore = m.jenjang ? getRelevanceScore(m.jenjang, searchTerm) * 0.3 : 0;
      const kelompokScore = m.kelompok ? getRelevanceScore(m.kelompok, searchTerm) * 0.2 : 0;
      
      // Combined full text score
      const fullText = `${m.prodi} ${m.jenjang || ''} ${m.kelompok || ''}`;
      const fullScore = getRelevanceScore(fullText, searchTerm) * 0.5;
      
      const totalScore = Math.max(prodiScore, fullScore) + jenjangScore + kelompokScore;
      
      return { major: m, score: totalScore };
    })
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .map(item => item.major);

  const selectedProdiObj = majors.find((m) => String(m.id) === String(selectedProdiId));

  return (
    <div className="max-w-4xl w-full mx-auto space-y-8 py-4 font-sans">
      {/* Header Title */}
      <div className="text-center space-y-3">
        <Badge variant="outline" className="px-3.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border-blue-200 inline-block">
          Rasionalisasi Algoritma PTN
        </Badge>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-blue-900">
          Cek Peluang Kelulusan PTN
        </h1>
        <p className="text-blue-400 text-sm sm:text-base max-w-xl mx-auto">
          Bandingkan skor IRT Try Out kamu dengan estimasi keketatan 4.900+ Jurusan di PTN Impian secara presisi.
        </p>
      </div>

      {/* Quota Display Banner */}
      {remainingPredictions !== null && !isSubscribed && (
        <div className={`border rounded-2xl p-4 ${remainingPredictions === 0 ? "bg-rose-50 border-rose-200" : "bg-blue-50 border-blue-200"}`}>
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-xl ${remainingPredictions === 0 ? "bg-rose-100" : "bg-blue-100"}`}>
                <Target className={`h-5 w-5 ${remainingPredictions === 0 ? "text-rose-600" : "text-blue-600"}`} />
              </div>
              <div>
                <p className={`text-sm font-bold ${remainingPredictions === 0 ? "text-rose-900" : "text-blue-900"}`}>
                  {remainingPredictions === 0 ? "Quota Gratis Habis!" : `Sisa ${remainingPredictions}x Cek Gratis`}
                </p>
                <p className={`text-xs ${remainingPredictions === 0 ? "text-rose-600" : "text-blue-600"}`}>
                  {remainingPredictions === 0 
                    ? "Upgrade ke Premium/Plus untuk unlimited cek peluang" 
                    : "Setelah habis, upgrade untuk unlimited analisis"}
                </p>
              </div>
            </div>
            {remainingPredictions === 0 && (
              <Link href="/pricing">
                <Button className="bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl h-10 px-6 shrink-0">
                  Upgrade Sekarang
                </Button>
              </Link>
            )}
          </div>
        </div>
      )}

      {/* Quota Error Alert */}
      {quotaError && (
        <div className="border border-rose-200 bg-rose-50 rounded-2xl p-4">
          <div className="flex items-start gap-3">
            <ShieldCheck className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-bold text-rose-900 mb-2">{quotaError}</p>
              <Link href="/pricing">
                <Button className="bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl h-10 px-6">
                  Lihat Paket CEK PELUANG PTN
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Input Form Card */}
      <div className="border border-blue-100 shadow-md rounded-2xl bg-white p-6 sm:p-8" style={{ overflow: "visible" }}>
        {loadingUnivs ? (
          <div className="flex flex-col items-center justify-center py-12 space-y-3">
            <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
            <p className="text-xs font-semibold text-blue-400">Memuat Database 4.900+ PTN & Jurusan...</p>
          </div>
        ) : (
          <form onSubmit={handleAnalyze} className="space-y-6" style={{ overflow: "visible" }}>
            {/* Skor UTBK Input Section */}
            <div className="bg-blue-50 p-4 sm:p-5 rounded-2xl border border-blue-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <Label htmlFor="score" className="text-xs font-bold uppercase tracking-wider text-blue-700 block mb-1">
                  Skor IRT UTBK / Try Out Kamu
                </Label>
                <p className="text-xs text-blue-400">Masukkan total skor hasil Try Out atau latihan subtes</p>
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
                  className="h-12 rounded-xl text-lg font-black text-blue-700 bg-white border-blue-200 text-center focus:border-blue-500"
                />
              </div>
            </div>

            {/* Selection Grid: PTN & Jurusan */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6" style={{ overflow: "visible" }}>
              {/* PTN Selection Combobox */}
              <div className="space-y-2" ref={univContainerRef} style={{ position: "relative", zIndex: isUnivOpen ? 100 : 1 }}>
                <Label className="text-xs font-bold uppercase tracking-wider text-blue-700 flex items-center justify-between">
                  <span>1. Perguruan Tinggi Negeri (PTN)</span>
                  <span className="text-[11px] font-normal text-blue-400">{universities.length} PTN</span>
                </Label>

                <button
                  type="button"
                  onClick={() => { setIsUnivOpen(!isUnivOpen); setIsMajorOpen(false); }}
                  className="w-full h-13 px-4 bg-white border border-blue-200 rounded-xl text-sm font-bold text-slate-900 flex items-center justify-between hover:border-blue-500 hover:bg-blue-50 transition-colors shadow-xs"
                >
                  <div className="flex items-center gap-3 truncate">
                    <Building2 className="h-5 w-5 text-blue-500 shrink-0" />
                    <span className="truncate">{selectedUniv || "Pilih PTN Target"}</span>
                  </div>
                  <ChevronDown className={`h-4 w-4 text-blue-400 shrink-0 transition-transform duration-200 ${isUnivOpen ? "rotate-180" : ""}`} />
                </button>

                {isUnivOpen && (
                  <div className="absolute left-0 right-0 mt-2 bg-white border border-blue-100 shadow-2xl rounded-2xl p-3 flex flex-col gap-2 animate-in fade-in zoom-in-95" style={{ top: "100%", zIndex: 9999, maxHeight: "320px" }}>
                    <div className="relative flex-shrink-0">
                      <Search className="h-4 w-4 text-blue-400 absolute left-3.5 top-3.5" />
                      <input
                        type="text"
                        value={univSearch}
                        onChange={(e) => setUnivSearch(e.target.value)}
                        placeholder="Ketik nama PTN (cth: UI, ITB, UGM)..."
                        className="w-full h-10 pl-10 pr-3 text-sm bg-blue-50 border border-blue-100 rounded-xl focus:outline-none focus:border-blue-500 font-medium text-slate-800"
                        autoFocus
                      />
                    </div>

                    <div className="flex items-center justify-between px-1 text-[11px] font-semibold text-blue-400 flex-shrink-0">
                      <span>Daftar Kampus Negeri</span>
                      <span>{filteredUnivs.length} ditemukan</span>
                    </div>

                    <div className="overflow-y-auto space-y-1 pr-1" style={{ maxHeight: "220px" }}>
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
                                ? "bg-blue-700 text-white"
                                : "text-slate-800 hover:bg-blue-50"
                            }`}
                          >
                            <span className="truncate">{univName}</span>
                            {selectedUniv === univName && <Check className="h-4 w-4 text-white shrink-0" />}
                          </button>
                        ))
                      ) : (
                        <div className="p-6 text-center space-y-2">
                          <p className="text-sm text-slate-600 font-medium">
                            PTN "{univSearch}" tidak ditemukan
                          </p>
                          <p className="text-xs text-slate-400">
                            Coba singkatan atau nama lengkap kampus
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Major Selection Combobox */}
              <div className="space-y-2" ref={majorContainerRef} style={{ position: "relative", zIndex: isMajorOpen ? 100 : 1 }}>
                <Label className="text-xs font-bold uppercase tracking-wider text-blue-700 flex items-center justify-between">
                  <span>2. Program Studi (Jurusan)</span>
                  {loadingMajors && <Loader2 className="h-3.5 w-3.5 animate-spin text-blue-500" />}
                </Label>

                <button
                  type="button"
                  disabled={loadingMajors || majors.length === 0}
                  onClick={() => { setIsMajorOpen(!isMajorOpen); setIsUnivOpen(false); }}
                  className="w-full h-13 px-4 bg-white border border-blue-200 rounded-xl text-sm font-bold text-slate-900 flex items-center justify-between hover:border-blue-500 hover:bg-blue-50 transition-colors shadow-xs disabled:opacity-50"
                >
                  <div className="flex items-center gap-3 truncate">
                    <BookOpen className="h-5 w-5 text-blue-500 shrink-0" />
                    <span className="truncate">
                      {selectedProdiObj
                        ? `${selectedProdiObj.prodi}${selectedProdiObj.jenjang ? ` (${selectedProdiObj.jenjang})` : ""}${selectedProdiObj.kelompok ? ` - ${selectedProdiObj.kelompok}` : ""}`
                        : (loadingMajors ? "Memuat jurusan..." : "Pilih Jurusan")}
                    </span>
                  </div>
                  <ChevronDown className={`h-4 w-4 text-blue-400 shrink-0 transition-transform duration-200 ${isMajorOpen ? "rotate-180" : ""}`} />
                </button>

                {isMajorOpen && (
                  <div className="absolute left-0 right-0 mt-2 bg-white border border-blue-100 shadow-2xl rounded-2xl p-3 flex flex-col gap-2 animate-in fade-in zoom-in-95" style={{ top: "100%", zIndex: 9999, maxHeight: "320px" }}>
                    <div className="relative flex-shrink-0">
                      <Search className="h-4 w-4 text-blue-400 absolute left-3.5 top-3.5" />
                      <input
                        type="text"
                        value={majorSearch}
                        onChange={(e) => setMajorSearch(e.target.value)}
                        placeholder="Ketik jurusan (cth: Kedokteran, Informatika)..."
                        className="w-full h-10 pl-10 pr-3 text-sm bg-blue-50 border border-blue-100 rounded-xl focus:outline-none focus:border-blue-500 font-medium text-slate-800"
                        autoFocus
                      />
                    </div>

                    <div className="flex items-center justify-between px-1 text-[11px] font-semibold text-blue-400 flex-shrink-0">
                      <span>Jurusan di {selectedUniv}</span>
                      <span className={filteredMajors.length === 0 ? "text-rose-500" : "text-blue-600"}>
                        {filteredMajors.length} {filteredMajors.length === 1 ? "prodi" : "prodi"}
                      </span>
                    </div>

                    <div className="overflow-y-auto space-y-1 pr-1" style={{ maxHeight: "220px" }}>
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
                                  ? "bg-blue-700 text-white"
                                  : "text-slate-800 hover:bg-blue-50"
                              }`}
                            >
                              <span className="truncate">{label}</span>
                              {isSelected && <Check className="h-4 w-4 text-white shrink-0" />}
                            </button>
                          );
                        })
                      ) : (
                        <div className="p-6 text-center space-y-2">
                          <p className="text-sm text-slate-600 font-medium">
                            Tidak ada jurusan yang cocok dengan "{majorSearch}"
                          </p>
                          <p className="text-xs text-slate-400">
                            Coba kata kunci lain atau cek ejaan pencarian
                          </p>
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
              className="w-full h-13 text-base font-extrabold bg-blue-700 hover:bg-blue-800 text-white rounded-xl gap-2 shadow-md hover:shadow-lg transition-all"
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
      </div>

      {/* PREDICTION RESULT DISPLAY CARD */}
      {result && (
        <Card className="border border-blue-100 shadow-md rounded-2xl overflow-hidden bg-white p-6 sm:p-8 space-y-6 animate-in fade-in zoom-in-95">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-blue-50 pb-4">
            <div>
              <span className="text-xs text-blue-400 font-semibold">Hasil Analisis Rasionalisasi:</span>
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
              <Badge className="bg-blue-700 text-white font-bold text-xs px-3.5 py-1">
                MODERAT (BERSAING)
              </Badge>
            )}
            {result.status === "RENTAN" && (
              <Badge className="bg-amber-500 text-white font-bold text-xs px-3.5 py-1">
                BERISIKO (RENTAN)
              </Badge>
            )}
          </div>

          {/* Probability Percentage Bar */}
          <div className="space-y-3">
            <div className="flex justify-between items-baseline">
              <span className="text-xs font-bold text-blue-500">Estimasi Peluang Lulus</span>
              <span className="text-3xl font-black text-blue-700">{result.percentage}%</span>
            </div>
            <Progress value={result.percentage} className="h-3 bg-blue-50 rounded-full" />
          </div>

          {/* Score Comparison Grid */}
          <div className="grid grid-cols-3 gap-4 p-4 rounded-xl bg-blue-50 border border-blue-100 text-center">
            <div>
              <span className="text-xs text-blue-400 block font-medium">Skor Kamu</span>
              <span className="text-xl font-extrabold text-slate-900">{result.score}</span>
            </div>
            <div>
              <span className="text-xs text-blue-400 block font-medium">Passing Grade</span>
              <span className="text-xl font-extrabold text-slate-900">{result.passingGrade}</span>
            </div>
            <div>
              <span className="text-xs text-blue-400 block font-medium">Selisih Poin</span>
              <span className={`text-xl font-extrabold ${result.diff >= 0 ? "text-emerald-600" : "text-rose-500"}`}>
                {result.diff >= 0 ? `+${result.diff.toFixed(1)}` : result.diff.toFixed(1)}
              </span>
            </div>
          </div>

          {/* Recommendation Box */}
          <div className="p-4 rounded-xl bg-blue-50 border border-blue-100 flex items-start gap-3">
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
