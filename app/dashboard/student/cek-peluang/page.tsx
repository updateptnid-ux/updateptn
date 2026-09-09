"use client";

import { useState, useEffect, useRef, useTransition } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { calculateProbabilityAction } from "@/actions/predict";
import { hasFeatureAccess } from "@/lib/subscription-helpers";
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
  Calculator,
  ArrowRight,
} from "lucide-react";

interface ProdiReferenceItem {
  id: string | number;
  univ?: string;
  prodi?: string;
  jenjang?: string;
  kelompok?: string;
  passing_grade_est?: number | string;
  // SNBP specific fields
  ptn_name?: string;
  nama_prodi?: string;
  kategori?: string;
  kode_prodi?: string;
  daya_tampung?: number;
  peminat?: number;
  rasio_keketatan?: number;
  nilai_raport?: number;
  estimasi_nilai_raport?: number;
  jenis_portofolio?: string;
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
  const searchParams = useSearchParams();
  const predictionType = searchParams.get("type") === "snbp" ? "snbp" : "snbt"; // Default to SNBT
  
  // Get score from URL parameter if exists
  const urlScore = searchParams.get("score");
  const initialScore = urlScore 
    ? parseFloat(urlScore) 
    : (predictionType === "snbt" ? 0 : 85);
  
  const [universities, setUniversities] = useState<string[]>([]);
  
  // Pilihan 1
  const [selectedUniv, setSelectedUniv] = useState<string>("");
  const [univSearch, setUnivSearch] = useState<string>("");
  const [isUnivOpen, setIsUnivOpen] = useState<boolean>(false);
  const [majors, setMajors] = useState<ProdiReferenceItem[]>([]);
  const [selectedProdiId, setSelectedProdiId] = useState<string>("");
  const [majorSearch, setMajorSearch] = useState<string>("");
  const [isMajorOpen, setIsMajorOpen] = useState<boolean>(false);
  
  // Pilihan 2
  const [selectedUniv2, setSelectedUniv2] = useState<string>("");
  const [univSearch2, setUnivSearch2] = useState<string>("");
  const [isUnivOpen2, setIsUnivOpen2] = useState<boolean>(false);
  const [majors2, setMajors2] = useState<ProdiReferenceItem[]>([]);
  const [selectedProdiId2, setSelectedProdiId2] = useState<string>("");
  const [majorSearch2, setMajorSearch2] = useState<string>("");
  const [isMajorOpen2, setIsMajorOpen2] = useState<boolean>(false);
  
  // Pilihan 3
  const [selectedUniv3, setSelectedUniv3] = useState<string>("");
  const [univSearch3, setUnivSearch3] = useState<string>("");
  const [isUnivOpen3, setIsUnivOpen3] = useState<boolean>(false);
  const [majors3, setMajors3] = useState<ProdiReferenceItem[]>([]);
  const [selectedProdiId3, setSelectedProdiId3] = useState<string>("");
  const [majorSearch3, setMajorSearch3] = useState<string>("");
  const [isMajorOpen3, setIsMajorOpen3] = useState<boolean>(false);
  
  // Pilihan 4
  const [selectedUniv4, setSelectedUniv4] = useState<string>("");
  const [univSearch4, setUnivSearch4] = useState<string>("");
  const [isUnivOpen4, setIsUnivOpen4] = useState<boolean>(false);
  const [majors4, setMajors4] = useState<ProdiReferenceItem[]>([]);
  const [selectedProdiId4, setSelectedProdiId4] = useState<string>("");
  const [majorSearch4, setMajorSearch4] = useState<string>("");
  const [isMajorOpen4, setIsMajorOpen4] = useState<boolean>(false);

  const [score, setScore] = useState<string | number>(initialScore);
  const [result, setResult] = useState<PredictionResult | null>(null);
  
  // Mode input: "total" atau "manual"
  const [inputMode, setInputMode] = useState<"total" | "manual">("total");
  
  // Manual subtes scores (untuk SNBT - 7 subtes)
  const [subtesScores, setSubtesScores] = useState({
    penalaran_umum: 0,
    bacaan_menulis: 0,
    pengetahuan_umum: 0,
    pengetahuan_kuantitatif: 0,
    literasi_indonesia: 0,
    literasi_inggris: 0,
    penalaran_matematika: 0,
  });
  
  const [loadingUnivs, setLoadingUnivs] = useState(true);
  const [loadingMajors, setLoadingMajors] = useState(false);
  const [isPending, startTransition] = useTransition();

  // Auto-calculate total score from subtes (AVERAGE, not SUM)
  useEffect(() => {
    if (predictionType === "snbt") {
      const values = Object.values(subtesScores);
      const total = values.reduce((sum, val) => sum + val, 0);
      const average = Math.round(total / values.length); // Divide by 6 (number of subtests)
      setScore(average);
    }
  }, [subtesScores, predictionType]);

  // Quota tracking states
  const [remainingPredictions, setRemainingPredictions] = useState<number | null>(null);
  const [hasAccess, setHasAccess] = useState<boolean>(false);
  const [accessMessage, setAccessMessage] = useState<string>("");
  const [userTier, setUserTier] = useState<string>("Basic");
  const [quotaError, setQuotaError] = useState<string>("");
  const [isCheckingAccess, setIsCheckingAccess] = useState<boolean>(true); // NEW: loading state

  const univContainerRef = useRef<HTMLDivElement>(null);
  const majorContainerRef = useRef<HTMLDivElement>(null);
  const univContainerRef2 = useRef<HTMLDivElement>(null);
  const majorContainerRef2 = useRef<HTMLDivElement>(null);
  const univContainerRef3 = useRef<HTMLDivElement>(null);
  const majorContainerRef3 = useRef<HTMLDivElement>(null);
  const univContainerRef4 = useRef<HTMLDivElement>(null);
  const majorContainerRef4 = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  // Fetch user quota on mount + AUTH GUARD + FEATURE ACCESS CHECK
  useEffect(() => {
    async function fetchUserQuota() {
      setIsCheckingAccess(true); // Start loading
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          window.location.href = "/login?redirect=/dashboard/student/cek-peluang";
          return;
        }

        const now = new Date().toISOString();

        // Cek subscription aktif dari tabel subscriptions
        const { data: subscription } = await supabase
          .from("subscriptions")
          .select("tier, status, expires_at")
          .eq("user_email", user.email)
          .eq("status", "active")
          .gt("expires_at", now)
          .order("expires_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        // Check if user is admin (admins bypass all restrictions)
        const { data: profileData } = await supabase
          .from("profiles")
          .select("prediction_count, role")
          .eq("id", user.id)
          .maybeSingle();

        const isAdminUser = profileData?.role === "admin";
        const count = profileData?.prediction_count ?? 0;

        // Determine feature type based on prediction type (SNBP or SNBT)
        const featureType = predictionType === "snbp" ? "snbp" : "snbt";
        
        // Check feature access using new helper function
        const accessCheck = hasFeatureAccess(subscription, featureType);
        
        const tier = subscription?.tier || "Basic";
        
        // Admins always have access
        if (isAdminUser) {
          setHasAccess(true);
          setAccessMessage("Akses Admin (Unlimited)");
          setUserTier("Admin");
          setRemainingPredictions(999);
        } else if (accessCheck.hasAccess) {
          // User has valid subscription for this specific feature
          setHasAccess(true);
          setAccessMessage(accessCheck.message || "");
          setUserTier(tier);
          setRemainingPredictions(999); // Unlimited for premium users
        } else {
          // User does NOT have access to this feature
          setHasAccess(false);
          setAccessMessage(accessCheck.message || `Fitur ${featureType.toUpperCase()} membutuhkan subscription`);
          setUserTier(tier);
          setRemainingPredictions(0);
        }
      } catch (err) {
        console.error("Error fetching quota:", err);
        setHasAccess(false);
        setRemainingPredictions(0);
      } finally {
        setIsCheckingAccess(false); // Stop loading
      }
    }

    fetchUserQuota();
  }, [predictionType]); // Re-run when prediction type changes


  // Clear result and reset score when switching between SNBP and SNBT
  useEffect(() => {
    // Clear previous result when type changes
    setResult(null);
    setQuotaError("");
    
    // Reset score to default for the new type
    const defaultScore = predictionType === "snbt" ? 0 : 85;
    setScore(defaultScore);
    
    // Reset selected university and major to first available
    if (universities.length > 0 && selectedUniv === "") {
      setSelectedUniv(universities[0]);
    }
  }, [predictionType]); // Trigger when switching SNBP ↔ SNBT


  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (univContainerRef.current && !univContainerRef.current.contains(event.target as Node)) {
        setIsUnivOpen(false);
      }
      if (majorContainerRef.current && !majorContainerRef.current.contains(event.target as Node)) {
        setIsMajorOpen(false);
      }
      if (univContainerRef2.current && !univContainerRef2.current.contains(event.target as Node)) {
        setIsUnivOpen2(false);
      }
      if (majorContainerRef2.current && !majorContainerRef2.current.contains(event.target as Node)) {
        setIsMajorOpen2(false);
      }
      if (univContainerRef3.current && !univContainerRef3.current.contains(event.target as Node)) {
        setIsUnivOpen3(false);
      }
      if (majorContainerRef3.current && !majorContainerRef3.current.contains(event.target as Node)) {
        setIsMajorOpen3(false);
      }
      if (univContainerRef4.current && !univContainerRef4.current.contains(event.target as Node)) {
        setIsUnivOpen4(false);
      }
      if (majorContainerRef4.current && !majorContainerRef4.current.contains(event.target as Node)) {
        setIsMajorOpen4(false);
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
        
        if (predictionType === "snbp") {
          // Load from SNBP JSON
          const res = await fetch("/data_snbp.json");
          if (res.ok) {
            const localData = await res.json();
            const uniqueUnivs = Array.from(new Set(localData.map((item: any) => item.ptn_name).filter(Boolean))).sort() as string[];
            setUniversities(uniqueUnivs);
            if (uniqueUnivs.length > 0) {
              setSelectedUniv(uniqueUnivs[0]);
            }
          }
        } else {
          // Load from SNBT (existing logic)
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
        }
      } catch (err) {
        console.error("Error loading PTN list:", err);
      } finally {
        setLoadingUnivs(false);
      }
    }

    loadUniversities();
  }, [predictionType]);

  // 2. Fetch majors — JSON lokal sebagai primary source (passing_grade_est verified)
  useEffect(() => {
    if (!selectedUniv) return;

    async function loadMajorsForUniv() {
      try {
        setLoadingMajors(true);

        if (predictionType === "snbp") {
          // Load from SNBP JSON
          const res = await fetch("/data_snbp.json");
          if (res.ok) {
            const localData = await res.json();
            const filtered = localData.filter((item: any) => item.ptn_name === selectedUniv);
            if (filtered.length > 0) {
              setMajors(filtered);
              setSelectedProdiId(String(filtered[0].id));
              return;
            }
          }
        } else {
          // Load from SNBT — PRIMARY: local data_snbt.json — data verified & selalu sinkron
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
        }
      } catch (err) {
        console.error("Error loading majors:", err);
      } finally {
        setLoadingMajors(false);
      }
    }

    loadMajorsForUniv();
  }, [selectedUniv, predictionType]);

  // Fetch majors for Pilihan 2
  useEffect(() => {
    if (!selectedUniv2) return;

    async function loadMajorsForUniv2() {
      try {
        if (predictionType === "snbp") {
          const res = await fetch("/data_snbp.json");
          if (res.ok) {
            const localData = await res.json();
            const filtered = localData.filter((item: any) => item.ptn_name === selectedUniv2);
            if (filtered.length > 0) {
              setMajors2(filtered);
              setSelectedProdiId2(String(filtered[0].id));
              return;
            }
          }
        } else {
          const res = await fetch("/data_snbt.json");
          if (res.ok) {
            const localData = await res.json();
            const filtered = localData.filter((item: any) => item.univ === selectedUniv2);
            if (filtered.length > 0) {
              setMajors2(filtered);
              setSelectedProdiId2(String(filtered[0].id));
              return;
            }
          }
        }
      } catch (err) {
        console.error("Error loading majors 2:", err);
      }
    }

    loadMajorsForUniv2();
  }, [selectedUniv2, predictionType]);

  // Fetch majors for Pilihan 3
  useEffect(() => {
    if (!selectedUniv3) return;

    async function loadMajorsForUniv3() {
      try {
        if (predictionType === "snbp") {
          const res = await fetch("/data_snbp.json");
          if (res.ok) {
            const localData = await res.json();
            const filtered = localData.filter((item: any) => item.ptn_name === selectedUniv3);
            if (filtered.length > 0) {
              setMajors3(filtered);
              setSelectedProdiId3(String(filtered[0].id));
              return;
            }
          }
        } else {
          const res = await fetch("/data_snbt.json");
          if (res.ok) {
            const localData = await res.json();
            const filtered = localData.filter((item: any) => item.univ === selectedUniv3);
            if (filtered.length > 0) {
              setMajors3(filtered);
              setSelectedProdiId3(String(filtered[0].id));
              return;
            }
          }
        }
      } catch (err) {
        console.error("Error loading majors 3:", err);
      }
    }

    loadMajorsForUniv3();
  }, [selectedUniv3, predictionType]);

  // Fetch majors for Pilihan 4
  useEffect(() => {
    if (!selectedUniv4) return;

    async function loadMajorsForUniv4() {
      try {
        if (predictionType === "snbp") {
          const res = await fetch("/data_snbp.json");
          if (res.ok) {
            const localData = await res.json();
            const filtered = localData.filter((item: any) => item.ptn_name === selectedUniv4);
            if (filtered.length > 0) {
              setMajors4(filtered);
              setSelectedProdiId4(String(filtered[0].id));
              return;
            }
          }
        } else {
          const res = await fetch("/data_snbt.json");
          if (res.ok) {
            const localData = await res.json();
            const filtered = localData.filter((item: any) => item.univ === selectedUniv4);
            if (filtered.length > 0) {
              setMajors4(filtered);
              setSelectedProdiId4(String(filtered[0].id));
              return;
            }
          }
        }
      } catch (err) {
        console.error("Error loading majors 4:", err);
      }
    }

    loadMajorsForUniv4();
  }, [selectedUniv4, predictionType]);

  // Submit Handler for Prediction Calculation
  const handleAnalyze = (e: React.FormEvent) => {
    e.preventDefault();
    
    // PREVENT AUTO-SCROLL: Save scroll position before state changes
    const scrollY = window.scrollY;
    
    setQuotaError("");
    setResult(null); // Clear previous result
    
    // Restore scroll position immediately to prevent jump
    setTimeout(() => {
      window.scrollTo(0, scrollY);
    }, 0);
    
    if (!selectedUniv || !selectedProdiId) return;
    const numScore = Number(score) || (predictionType === "snbt" ? 720 : 85);

    startTransition(async () => {
      try {
        // Find selected prodi object
        let currentProdi = majors.find((m) => String(m.id) === String(selectedProdiId));
        
        if (predictionType === "snbp") {
          // SNBP Logic: Based on nilai raport (grade-based)
          if (!currentProdi) return;
          
          const estimasiNilai = currentProdi.estimasi_nilai_raport || 80;
          const rasioKeketatan = currentProdi.rasio_keketatan || 1;
          const diff = numScore - estimasiNilai;
          
          let percentage = 75;
          let status: "AMAN" | "BERSAING" | "RENTAN" = "BERSAING";
          let recommendation = "";

          // SNBP calculation logic
          if (diff >= 5) {
            status = "AMAN";
            percentage = Math.min(98, Math.round(85 + diff * 2));
            recommendation = `Rata-rata raport kamu (${numScore}) berada +${diff.toFixed(1)} poin di atas estimasi (${estimasiNilai}). Dengan rasio keketatan ${rasioKeketatan.toFixed(2)}:1, peluang kamu di ${currentProdi.nama_prodi} - ${currentProdi.ptn_name} SANGAT TINGGI!`;
          } else if (diff >= 0) {
            status = "BERSAING";
            percentage = Math.round(60 + (diff / 5) * 24);
            recommendation = `Rata-rata raport kamu (${numScore}) melampaui estimasi (${estimasiNilai}) sebesar +${diff.toFixed(1)} poin. Rasio keketatan ${rasioKeketatan.toFixed(2)}:1. Berada di zona kompetisi aktif.`;
          } else {
            status = "RENTAN";
            percentage = Math.max(25, Math.round(60 + diff * 4));
            recommendation = `Rata-rata raport kamu (${numScore}) berjarak ${Math.abs(diff).toFixed(1)} poin di bawah estimasi (${estimasiNilai}). Dengan rasio keketatan ${rasioKeketatan.toFixed(2)}:1, pertimbangkan jurusan ini di pilihan ke-2 atau tingkatkan nilai raport.`;
          }

          setResult({
            score: numScore,
            passingGrade: estimasiNilai,
            diff,
            percentage,
            status,
            majorName: `${currentProdi.jenjang ? `${currentProdi.jenjang} ` : ""}${currentProdi.nama_prodi}`,
            universityName: currentProdi.ptn_name || "",
            recommendation,
          });
          
          // Maintain scroll position after result is set
          setTimeout(() => {
            window.scrollTo(0, scrollY);
          }, 10);
        } else {
          // SNBT Logic: Use passing_grade_est from local data
          if (currentProdi?.passing_grade_est) {
            const pg = Number(currentProdi.passing_grade_est);
            const diff = numScore - pg;
            let percentage = 75;
            let status: "AMAN" | "BERSAING" | "RENTAN" = "BERSAING";
            let recommendation = "";

            if (diff >= 20) {
              status = "AMAN";
              percentage = Math.min(98, Math.round(85 + (diff - 20) * 0.4));
              recommendation = `Skor kamu (${numScore}) berada +${diff.toFixed(1)} poin di atas estimasi keketatan (${pg}). Peluang kelulusan di ${currentProdi.prodi} - ${selectedUniv} SANGAT TINGGI!`;
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
            
            // Maintain scroll position after result is set
            setTimeout(() => {
              window.scrollTo(0, scrollY);
            }, 10);
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
      
      // Get prodi name based on type
      const prodiName = predictionType === "snbp" ? (m.nama_prodi || "") : (m.prodi || "");
      
      // Calculate scores for different fields
      const prodiScore = getRelevanceScore(prodiName, searchTerm);
      const jenjangScore = m.jenjang ? getRelevanceScore(m.jenjang, searchTerm) * 0.3 : 0;
      const kelompokScore = m.kelompok ? getRelevanceScore(m.kelompok, searchTerm) * 0.2 : 0;
      const kategoriScore = predictionType === "snbp" && m.kategori ? getRelevanceScore(m.kategori, searchTerm) * 0.2 : 0;
      
      // Combined full text score
      const fullText = `${prodiName} ${m.jenjang || ''} ${m.kelompok || ''} ${m.kategori || ''}`;
      const fullScore = getRelevanceScore(fullText, searchTerm) * 0.5;
      
      const totalScore = Math.max(prodiScore, fullScore) + jenjangScore + kelompokScore + kategoriScore;
      
      return { major: m, score: totalScore };
    })
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .map(item => item.major);

  const selectedProdiObj = majors.find((m) => String(m.id) === String(selectedProdiId));
  const selectedProdiObj2 = majors2.find((m) => String(m.id) === String(selectedProdiId2));
  const selectedProdiObj3 = majors3.find((m) => String(m.id) === String(selectedProdiId3));
  const selectedProdiObj4 = majors4.find((m) => String(m.id) === String(selectedProdiId4));

  // Filtered majors for each selection
  const filteredMajors2 = majors2
    .map((m) => {
      const searchTerm = normalizeText(majorSearch2);
      if (!searchTerm) return { major: m, score: 1 };
      const prodiName = predictionType === "snbp" ? (m.nama_prodi || "") : (m.prodi || "");
      const prodiScore = getRelevanceScore(prodiName, searchTerm);
      const jenjangScore = m.jenjang ? getRelevanceScore(m.jenjang, searchTerm) * 0.3 : 0;
      const kelompokScore = m.kelompok ? getRelevanceScore(m.kelompok, searchTerm) * 0.2 : 0;
      const kategoriScore = predictionType === "snbp" && m.kategori ? getRelevanceScore(m.kategori, searchTerm) * 0.2 : 0;
      const fullText = `${prodiName} ${m.jenjang || ''} ${m.kelompok || ''} ${m.kategori || ''}`;
      const fullScore = getRelevanceScore(fullText, searchTerm) * 0.5;
      const totalScore = Math.max(prodiScore, fullScore) + jenjangScore + kelompokScore + kategoriScore;
      return { major: m, score: totalScore };
    })
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .map(item => item.major);

  const filteredMajors3 = majors3
    .map((m) => {
      const searchTerm = normalizeText(majorSearch3);
      if (!searchTerm) return { major: m, score: 1 };
      const prodiName = predictionType === "snbp" ? (m.nama_prodi || "") : (m.prodi || "");
      const prodiScore = getRelevanceScore(prodiName, searchTerm);
      const jenjangScore = m.jenjang ? getRelevanceScore(m.jenjang, searchTerm) * 0.3 : 0;
      const kelompokScore = m.kelompok ? getRelevanceScore(m.kelompok, searchTerm) * 0.2 : 0;
      const kategoriScore = predictionType === "snbp" && m.kategori ? getRelevanceScore(m.kategori, searchTerm) * 0.2 : 0;
      const fullText = `${prodiName} ${m.jenjang || ''} ${m.kelompok || ''} ${m.kategori || ''}`;
      const fullScore = getRelevanceScore(fullText, searchTerm) * 0.5;
      const totalScore = Math.max(prodiScore, fullScore) + jenjangScore + kelompokScore + kategoriScore;
      return { major: m, score: totalScore };
    })
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .map(item => item.major);

  const filteredMajors4 = majors4
    .map((m) => {
      const searchTerm = normalizeText(majorSearch4);
      if (!searchTerm) return { major: m, score: 1 };
      const prodiName = predictionType === "snbp" ? (m.nama_prodi || "") : (m.prodi || "");
      const prodiScore = getRelevanceScore(prodiName, searchTerm);
      const jenjangScore = m.jenjang ? getRelevanceScore(m.jenjang, searchTerm) * 0.3 : 0;
      const kelompokScore = m.kelompok ? getRelevanceScore(m.kelompok, searchTerm) * 0.2 : 0;
      const kategoriScore = predictionType === "snbp" && m.kategori ? getRelevanceScore(m.kategori, searchTerm) * 0.2 : 0;
      const fullText = `${prodiName} ${m.jenjang || ''} ${m.kelompok || ''} ${m.kategori || ''}`;
      const fullScore = getRelevanceScore(fullText, searchTerm) * 0.5;
      const totalScore = Math.max(prodiScore, fullScore) + jenjangScore + kelompokScore + kategoriScore;
      return { major: m, score: totalScore };
    })
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .map(item => item.major);

  return (
    <div className="max-w-4xl w-full mx-auto space-y-8 py-4 font-sans">
      {/* Loading State - Show while checking access */}
      {isCheckingAccess && (
        <div className="max-w-2xl mx-auto space-y-6 text-center py-24">
          <div className="flex justify-center">
            <Loader2 className="h-12 w-12 text-blue-500 animate-spin" />
          </div>
          <p className="text-sm text-slate-600 font-medium">
            Memeriksa akses fitur...
          </p>
        </div>
      )}

      {/* No Access - Simple blocking UI */}
      {!isCheckingAccess && remainingPredictions !== null && !hasAccess && (
        <div className="max-w-2xl mx-auto space-y-6 text-center py-12">
          <div className="space-y-4">
            <div className="flex justify-center">
              <div className="h-20 w-20 rounded-full bg-amber-100 flex items-center justify-center">
                <Target className="h-10 w-10 text-amber-600" />
              </div>
            </div>
            
            <div className="space-y-3">
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
                Subscription {predictionType.toUpperCase()} Diperlukan
              </h1>
              <p className="text-slate-600 text-sm sm:text-base max-w-lg mx-auto">
                {accessMessage || `Untuk mengakses Cek Peluang ${predictionType.toUpperCase()}, kamu perlu berlangganan Premium ${predictionType.toUpperCase()} atau VIP All-in-One.`}
              </p>
              
              {userTier !== "Basic" && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm max-w-md mx-auto">
                  <p className="text-amber-900 font-semibold">
                    Subscription Aktif: <span className="font-bold">{userTier}</span>
                  </p>
                  <p className="text-amber-700 text-xs mt-1">
                    Paket ini tidak mencakup {predictionType.toUpperCase()}. Upgrade untuk akses fitur ini.
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center items-center pt-4">
            <Link href={`/pricing?feature=cek-peluang-${predictionType}`} className="w-full sm:w-auto">
              <Button className="w-full sm:w-auto h-11 px-6 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl">
                Lihat Paket Premium {predictionType.toUpperCase()}
              </Button>
            </Link>
            <Link href="/dashboard/student" className="w-full sm:w-auto">
              <Button variant="outline" className="w-full sm:w-auto h-11 px-6 border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold rounded-xl">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Kembali
              </Button>
            </Link>
          </div>
        </div>
      )}

      {/* Main Content - Clean UI for users with access */}
      {!isCheckingAccess && hasAccess && (
        <>
      {/* Back Button */}
      <div className="mb-4">
        <Link href="/dashboard/student">
          <Button variant="ghost" className="h-9 px-3 text-xs font-semibold text-slate-700 hover:text-blue-600 hover:bg-blue-50">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Kembali ke Beranda
          </Button>
        </Link>
      </div>

      {/* Header Title */}
      <div className="text-center space-y-3 mb-6">
        <div className="flex justify-center mb-3">
          <Badge className="bg-blue-100 text-blue-700 border-blue-300 text-xs font-bold px-4 py-1.5 rounded-full">
            📊 RASIONALISASI {predictionType === "snbp" ? "SNBP" : "SNBT"} 2026
          </Badge>
        </div>
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-900">
          Analisis <span className="text-blue-600">Peluang</span>
        </h1>
        <p className="text-slate-600 text-xs sm:text-sm max-w-2xl mx-auto leading-relaxed">
          {predictionType === "snbp" 
            ? "Bandingkan rata-rata nilai raport kamu dengan estimasi keketatan 5.100+ Jurusan SNBP 2026."
            : "Bandingkan skor IRT Try Out kamu dengan estimasi keketatan 4.900+ Jurusan di PTN Impian."
          }
        </p>
      </div>

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

      {/* Input Form Card - New Two-Column Layout */}
      <div className="space-y-4" style={{ overflow: "visible" }}>
        {loadingUnivs ? (
          <div className="flex flex-col items-center justify-center py-12 space-y-3">
            <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
            <p className="text-xs font-semibold text-blue-400">Memuat Database 4.900+ PTN & Jurusan...</p>
          </div>
        ) : (
          <form onSubmit={handleAnalyze} className="space-y-4" style={{ overflow: "visible" }}>
            {/* SNBP Calculator Link Banner (if SNBP) */}
            {predictionType === "snbp" && (
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-3 rounded-xl border border-blue-200">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg shrink-0">
                      <Calculator className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900 mb-0.5">
                        Belum tahu rata-rata nilai raport kamu?
                      </p>
                      <p className="text-[10px] text-slate-600">
                        Gunakan kalkulator detail untuk menghitung nilai per mata pelajaran
                      </p>
                    </div>
                  </div>
                  <Link href="/dashboard/student/kalkulator-snbp">
                    <Button
                      type="button"
                      className="h-9 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-xs whitespace-nowrap"
                    >
                      Buka Kalkulator
                      <ArrowRight className="h-3 w-3 ml-2" />
                    </Button>
                  </Link>
                </div>
              </div>
            )}

            {/* Two-Column Grid Layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4" style={{ overflow: "visible" }}>
              {/* LEFT CARD: Skor Simulasi */}
              <Card className="p-4 border-2 border-slate-200 bg-white rounded-xl">
                <div className="flex items-center gap-2 mb-3">
                  <div className="p-1.5 bg-blue-100 rounded-lg">
                    <Target className="h-4 w-4 text-blue-600" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-900">Skor Simulasi</h3>
                </div>

                {predictionType === "snbt" ? (
                  <>
                    {/* Slider per subtes - Horizontal Layout (7 SUBTES) */}
                    <div className="space-y-3 mb-3">
                      {/* 1. Penalaran Umum (PU) */}
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1.5 min-w-[140px]">
                          <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0"></div>
                          <span className="text-[9px] font-semibold text-slate-700">Penalaran Umum</span>
                        </div>
                        <input
                          type="range"
                          min={0}
                          max={1000}
                          value={subtesScores.penalaran_umum}
                          onChange={(e) => setSubtesScores({ ...subtesScores, penalaran_umum: Number(e.target.value) })}
                          className="flex-1 h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                        />
                        <span className="text-xs font-bold text-slate-900 w-10 text-right">{subtesScores.penalaran_umum}</span>
                      </div>

                      {/* 2. Bacaan dan Menulis (KMBM) */}
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1.5 min-w-[140px]">
                          <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0"></div>
                          <span className="text-[9px] font-semibold text-slate-700">Bacaan dan Menulis</span>
                        </div>
                        <input
                          type="range"
                          min={0}
                          max={1000}
                          value={subtesScores.bacaan_menulis}
                          onChange={(e) => setSubtesScores({ ...subtesScores, bacaan_menulis: Number(e.target.value) })}
                          className="flex-1 h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                        />
                        <span className="text-xs font-bold text-slate-900 w-10 text-right">{subtesScores.bacaan_menulis}</span>
                      </div>

                      {/* 3. Pengetahuan Umum (PPU) */}
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1.5 min-w-[140px]">
                          <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0"></div>
                          <span className="text-[9px] font-semibold text-slate-700">Pengetahuan Umum</span>
                        </div>
                        <input
                          type="range"
                          min={0}
                          max={1000}
                          value={subtesScores.pengetahuan_umum}
                          onChange={(e) => setSubtesScores({ ...subtesScores, pengetahuan_umum: Number(e.target.value) })}
                          className="flex-1 h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                        />
                        <span className="text-xs font-bold text-slate-900 w-10 text-right">{subtesScores.pengetahuan_umum}</span>
                      </div>

                      {/* 4. Pengetahuan Kuantitatif (PK) */}
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1.5 min-w-[140px]">
                          <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0"></div>
                          <span className="text-[9px] font-semibold text-slate-700">Pengetahuan Kuantitatif</span>
                        </div>
                        <input
                          type="range"
                          min={0}
                          max={1000}
                          value={subtesScores.pengetahuan_kuantitatif}
                          onChange={(e) => setSubtesScores({ ...subtesScores, pengetahuan_kuantitatif: Number(e.target.value) })}
                          className="flex-1 h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                        />
                        <span className="text-xs font-bold text-slate-900 w-10 text-right">{subtesScores.pengetahuan_kuantitatif}</span>
                      </div>

                      {/* 5. Literasi Bahasa Indonesia (LBI) */}
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1.5 min-w-[140px]">
                          <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0"></div>
                          <span className="text-[9px] font-semibold text-slate-700">Literasi Bahasa Indonesia</span>
                        </div>
                        <input
                          type="range"
                          min={0}
                          max={1000}
                          value={subtesScores.literasi_indonesia}
                          onChange={(e) => setSubtesScores({ ...subtesScores, literasi_indonesia: Number(e.target.value) })}
                          className="flex-1 h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                        />
                        <span className="text-xs font-bold text-slate-900 w-10 text-right">{subtesScores.literasi_indonesia}</span>
                      </div>

                      {/* 6. Literasi Bahasa Inggris (LBIng) */}
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1.5 min-w-[140px]">
                          <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0"></div>
                          <span className="text-[9px] font-semibold text-slate-700">Literasi Bahasa Inggris</span>
                        </div>
                        <input
                          type="range"
                          min={0}
                          max={1000}
                          value={subtesScores.literasi_inggris}
                          onChange={(e) => setSubtesScores({ ...subtesScores, literasi_inggris: Number(e.target.value) })}
                          className="flex-1 h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                        />
                        <span className="text-xs font-bold text-slate-900 w-10 text-right">{subtesScores.literasi_inggris}</span>
                      </div>

                      {/* 7. Penalaran Matematika (PM) */}
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1.5 min-w-[140px]">
                          <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0"></div>
                          <span className="text-[9px] font-semibold text-slate-700">Penalaran Matematika</span>
                        </div>
                        <input
                          type="range"
                          min={0}
                          max={1000}
                          value={subtesScores.penalaran_matematika}
                          onChange={(e) => setSubtesScores({ ...subtesScores, penalaran_matematika: Number(e.target.value) })}
                          className="flex-1 h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                        />
                        <span className="text-xs font-bold text-slate-900 w-10 text-right">{subtesScores.penalaran_matematika}</span>
                      </div>
                    </div>

                    {/* Total Skor - Visible */}
                    <div className="mt-4 pt-3 border-t border-slate-200">
                      <div className="flex items-baseline justify-between">
                        <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wide">RATA-RATA SKOR</span>
                        <span className="text-3xl font-black text-blue-600">{score}</span>
                      </div>
                      <p className="text-[8px] text-slate-500 mt-1">Total skor = rata-rata dari 7 subtes</p>
                    </div>

                    {/* Info Box */}
                    <div className="mt-3 bg-blue-50 rounded-lg p-2 border border-blue-200">
                      <div className="flex items-start gap-1.5">
                        <div className="p-1 bg-blue-200 rounded shrink-0">
                          <Calculator className="h-2.5 w-2.5 text-blue-700" />
                        </div>
                        <p className="text-[8px] text-slate-700 leading-snug">
                          Input skor IRT untuk 7 subtes SNBT (TPS: PU, KMBM, PPU, PK | Literasi: LBI, LBIng, PM)
                        </p>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    {/* SNBP - Direct Input */}
                    <div className="mb-3">
                      <Label htmlFor="score" className="text-[10px] font-bold text-slate-700 mb-2 block uppercase tracking-wide">
                        RATA-RATA NILAI RAPORT
                      </Label>
                      <Input
                        id="score"
                        type="number"
                        min={0}
                        max={100}
                        step={0.01}
                        value={score}
                        onChange={(e) => {
                          const val = e.target.value;
                          setScore(val === "" ? "" : Number(val));
                        }}
                        required
                        style={{ fontSize: '16px' }}
                        className="h-12 rounded-lg text-2xl font-black text-blue-700 bg-blue-50 border-2 border-blue-200 text-center focus:border-blue-500"
                      />
                      <p className="text-[9px] text-slate-500 mt-1.5 text-center">
                        Masukkan rata-rata nilai raport semester 1-5
                      </p>
                    </div>

                    <div className="bg-blue-50 rounded-lg p-2.5 border border-blue-200">
                      <div className="flex items-start gap-2">
                        <div className="p-1 bg-blue-200 rounded shrink-0">
                          <Calculator className="h-3 w-3 text-blue-700" />
                        </div>
                        <div className="flex-1">
                          <p className="text-[9px] font-bold text-slate-900 mb-0.5">
                            Gunakan Kalkulator SNBP
                          </p>
                          <p className="text-[8px] text-slate-600 leading-snug">
                            Hitung nilai raport detail per mata pelajaran.
                          </p>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </Card>

              {/* RIGHT CARD: Jurusan Target */}
              <Card className="p-4 border-2 border-slate-200 bg-white rounded-xl">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Building2 className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Jurusan Target</h3>
                  </div>
                </div>

                <p className="text-xs text-slate-600 mb-4 leading-relaxed">
                  Pilih hingga 4 jurusan untuk dianalisa peluang kelulusannya berdasarkan skor simulasi kamu.
                </p>

                <div className="space-y-3">
                  {/* PILIHAN 1 - PTN Dropdown */}
                  <div className="space-y-2 pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline" className="text-[10px] px-2 py-0.5">1</Badge>
                      <Label className="text-xs font-bold text-slate-700">Pilih Jurusan</Label>
                    </div>
                    
                    {/* PTN Selection - Fixed positioning */}
                    <div className="space-y-2" style={{ position: "relative" }}>
                      <div ref={univContainerRef} style={{ position: "relative", zIndex: isUnivOpen ? 50 : 1 }}>
                        <button
                          type="button"
                          onClick={() => { 
                            setIsUnivOpen(!isUnivOpen); 
                            setIsMajorOpen(false); 
                            setIsUnivOpen2(false);
                            setIsMajorOpen2(false);
                            setIsUnivOpen3(false);
                            setIsMajorOpen3(false);
                            setIsUnivOpen4(false);
                            setIsMajorOpen4(false);
                          }}
                          className="w-full h-10 px-3 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-900 flex items-center justify-between hover:border-blue-500 hover:bg-blue-50 transition-colors"
                        >
                          <span className="truncate text-left flex-1">{selectedUniv || "Pilih PTN"}</span>
                          <ChevronDown className={`h-3.5 w-3.5 text-slate-400 shrink-0 transition-transform duration-200 ${isUnivOpen ? "rotate-180" : ""}`} />
                        </button>

                        {isUnivOpen && (
                          <div 
                            className="absolute left-0 right-0 mt-1 bg-white border border-blue-100 shadow-2xl rounded-xl p-2 flex flex-col gap-2 animate-in fade-in zoom-in-95" 
                            style={{ top: "100%", zIndex: 9999, maxHeight: "300px" }}
                          >
                            <div className="relative">
                              <Search className="h-3.5 w-3.5 text-blue-400 absolute left-3 top-2.5" />
                              <input
                                type="text"
                                value={univSearch}
                                onChange={(e) => setUnivSearch(e.target.value)}
                                placeholder="Cari PTN..."
                                style={{ fontSize: '16px' }}
                                className="w-full h-8 pl-9 pr-3 text-xs bg-blue-50 border border-blue-100 rounded-lg focus:outline-none focus:border-blue-500 font-medium text-slate-800"
                                autoFocus
                              />
                            </div>

                            <div className="overflow-y-auto space-y-0.5" style={{ maxHeight: "240px" }}>
                              {filteredUnivs.slice(0, 50).map((univName) => (
                                <button
                                  key={univName}
                                  type="button"
                                  onClick={() => {
                                    setSelectedUniv(univName);
                                    setIsUnivOpen(false);
                                    setUnivSearch("");
                                  }}
                                  className={`w-full text-left px-3 py-2 rounded-lg text-[10px] font-bold transition-colors ${
                                    selectedUniv === univName
                                      ? "bg-blue-700 text-white"
                                      : "text-slate-800 hover:bg-blue-50"
                                  }`}
                                >
                                  {univName}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Jurusan Selection - Fixed positioning */}
                      <div ref={majorContainerRef} style={{ position: "relative", zIndex: isMajorOpen ? 50 : 1 }}>
                        <button
                          type="button"
                          disabled={loadingMajors || majors.length === 0}
                          onClick={() => { 
                            setIsMajorOpen(!isMajorOpen); 
                            setIsUnivOpen(false); 
                            setIsUnivOpen2(false);
                            setIsMajorOpen2(false);
                            setIsUnivOpen3(false);
                            setIsMajorOpen3(false);
                            setIsUnivOpen4(false);
                            setIsMajorOpen4(false);
                          }}
                          className="w-full h-10 px-3 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-900 flex items-center justify-between hover:border-blue-500 hover:bg-blue-50 transition-colors disabled:opacity-50"
                        >
                          <span className="truncate text-left flex-1">
                            {selectedProdiObj
                              ? (predictionType === "snbp" ? selectedProdiObj.nama_prodi : selectedProdiObj.prodi)
                              : (loadingMajors ? "Memuat..." : "Pilih Jurusan")}
                          </span>
                          <ChevronDown className={`h-3.5 w-3.5 text-slate-400 shrink-0 transition-transform ${isMajorOpen ? "rotate-180" : ""}`} />
                        </button>

                        {isMajorOpen && (
                          <div 
                            className="absolute left-0 right-0 mt-1 bg-white border border-blue-100 shadow-2xl rounded-xl p-2 flex flex-col gap-2 animate-in fade-in zoom-in-95" 
                            style={{ top: "100%", zIndex: 9999, maxHeight: "300px" }}
                          >
                            <div className="relative">
                              <Search className="h-3.5 w-3.5 text-blue-400 absolute left-3 top-2.5" />
                              <input
                                type="text"
                                value={majorSearch}
                                onChange={(e) => setMajorSearch(e.target.value)}
                                placeholder="Cari jurusan..."
                                style={{ fontSize: '16px' }}
                                className="w-full h-8 pl-9 pr-3 text-xs bg-blue-50 border border-blue-100 rounded-lg focus:outline-none focus:border-blue-500 font-medium text-slate-800"
                                autoFocus
                              />
                            </div>

                            <div className="overflow-y-auto space-y-0.5" style={{ maxHeight: "240px" }}>
                              {filteredMajors.slice(0, 50).map((m) => {
                                const isSelected = String(m.id) === String(selectedProdiId);
                                const label = predictionType === "snbp" ? m.nama_prodi : m.prodi;
                                return (
                                  <button
                                    key={m.id}
                                    type="button"
                                    onClick={() => {
                                      setSelectedProdiId(String(m.id));
                                      setIsMajorOpen(false);
                                      setMajorSearch("");
                                    }}
                                    className={`w-full text-left px-3 py-2 rounded-lg text-[10px] font-bold transition-colors ${
                                      isSelected ? "bg-blue-700 text-white" : "text-slate-800 hover:bg-blue-50"
                                    }`}
                                  >
                                    {label}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    
                      {selectedProdiObj && (
                        <div className="mt-2 flex items-center gap-1.5 text-emerald-600">
                          <Check className="h-3.5 w-3.5" />
                          <span className="text-[10px] font-bold">Jurusan terpilih</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* PILIHAN 2 - Fully Functional */}
                  <div className="space-y-2 pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline" className="text-[10px] px-2 py-0.5">2</Badge>
                      <Label className="text-xs font-bold text-slate-700">Pilih Jurusan</Label>
                    </div>
                    
                    <div className="space-y-2" style={{ position: "relative" }}>
                      {/* PTN Selection 2 */}
                      <div ref={univContainerRef2} style={{ position: "relative", zIndex: isUnivOpen2 ? 50 : 1 }}>
                        <button
                          type="button"
                          onClick={() => { 
                            setIsUnivOpen2(!isUnivOpen2); 
                            setIsMajorOpen2(false);
                            setIsUnivOpen(false);
                            setIsMajorOpen(false);
                            setIsUnivOpen3(false);
                            setIsMajorOpen3(false);
                            setIsUnivOpen4(false);
                            setIsMajorOpen4(false);
                          }}
                          className="w-full h-10 px-3 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-900 flex items-center justify-between hover:border-blue-500 hover:bg-blue-50 transition-colors"
                        >
                          <span className="truncate text-left flex-1">{selectedUniv2 || "Pilih PTN"}</span>
                          <ChevronDown className={`h-3.5 w-3.5 text-slate-400 shrink-0 transition-transform duration-200 ${isUnivOpen2 ? "rotate-180" : ""}`} />
                        </button>

                        {isUnivOpen2 && (
                          <div 
                            className="absolute left-0 right-0 mt-1 bg-white border border-blue-100 shadow-2xl rounded-xl p-2 flex flex-col gap-2 animate-in fade-in zoom-in-95" 
                            style={{ top: "100%", zIndex: 9999, maxHeight: "300px" }}
                          >
                            <div className="relative">
                              <Search className="h-3.5 w-3.5 text-blue-400 absolute left-3 top-2.5" />
                              <input
                                type="text"
                                value={univSearch2}
                                onChange={(e) => setUnivSearch2(e.target.value)}
                                placeholder="Cari PTN..."
                                style={{ fontSize: '16px' }}
                                className="w-full h-8 pl-9 pr-3 text-xs bg-blue-50 border border-blue-100 rounded-lg focus:outline-none focus:border-blue-500 font-medium text-slate-800"
                                autoFocus
                              />
                            </div>

                            <div className="overflow-y-auto space-y-0.5" style={{ maxHeight: "240px" }}>
                              {filteredUnivs.slice(0, 50).map((univName) => (
                                <button
                                  key={univName}
                                  type="button"
                                  onClick={() => {
                                    setSelectedUniv2(univName);
                                    setIsUnivOpen2(false);
                                    setUnivSearch2("");
                                  }}
                                  className={`w-full text-left px-3 py-2 rounded-lg text-[10px] font-bold transition-colors ${
                                    selectedUniv2 === univName
                                      ? "bg-blue-700 text-white"
                                      : "text-slate-800 hover:bg-blue-50"
                                  }`}
                                >
                                  {univName}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Jurusan Selection 2 */}
                      <div ref={majorContainerRef2} style={{ position: "relative", zIndex: isMajorOpen2 ? 50 : 1 }}>
                        <button
                          type="button"
                          disabled={!selectedUniv2 || majors2.length === 0}
                          onClick={() => { 
                            setIsMajorOpen2(!isMajorOpen2); 
                            setIsUnivOpen2(false);
                            setIsUnivOpen(false);
                            setIsMajorOpen(false);
                            setIsUnivOpen3(false);
                            setIsMajorOpen3(false);
                            setIsUnivOpen4(false);
                            setIsMajorOpen4(false);
                          }}
                          className="w-full h-10 px-3 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-900 flex items-center justify-between hover:border-blue-500 hover:bg-blue-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <span className="truncate text-left flex-1">
                            {selectedProdiObj2
                              ? (predictionType === "snbp" ? selectedProdiObj2.nama_prodi : selectedProdiObj2.prodi)
                              : (!selectedUniv2 ? "Pilih PTN dulu" : "Pilih Jurusan")}
                          </span>
                          <ChevronDown className={`h-3.5 w-3.5 text-slate-400 shrink-0 transition-transform ${isMajorOpen2 ? "rotate-180" : ""}`} />
                        </button>

                        {isMajorOpen2 && (
                          <div 
                            className="absolute left-0 right-0 mt-1 bg-white border border-blue-100 shadow-2xl rounded-xl p-2 flex flex-col gap-2 animate-in fade-in zoom-in-95" 
                            style={{ top: "100%", zIndex: 9999, maxHeight: "300px" }}
                          >
                            <div className="relative">
                              <Search className="h-3.5 w-3.5 text-blue-400 absolute left-3 top-2.5" />
                              <input
                                type="text"
                                value={majorSearch2}
                                onChange={(e) => setMajorSearch2(e.target.value)}
                                placeholder="Cari jurusan..."
                                style={{ fontSize: '16px' }}
                                className="w-full h-8 pl-9 pr-3 text-xs bg-blue-50 border border-blue-100 rounded-lg focus:outline-none focus:border-blue-500 font-medium text-slate-800"
                                autoFocus
                              />
                            </div>

                            <div className="overflow-y-auto space-y-0.5" style={{ maxHeight: "240px" }}>
                              {filteredMajors2.slice(0, 50).map((m) => {
                                const isSelected = String(m.id) === String(selectedProdiId2);
                                const label = predictionType === "snbp" ? m.nama_prodi : m.prodi;
                                return (
                                  <button
                                    key={m.id}
                                    type="button"
                                    onClick={() => {
                                      setSelectedProdiId2(String(m.id));
                                      setIsMajorOpen2(false);
                                      setMajorSearch2("");
                                    }}
                                    className={`w-full text-left px-3 py-2 rounded-lg text-[10px] font-bold transition-colors ${
                                      isSelected ? "bg-blue-700 text-white" : "text-slate-800 hover:bg-blue-50"
                                    }`}
                                  >
                                    {label}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    
                      {selectedProdiObj2 && (
                        <div className="mt-2 flex items-center gap-1.5 text-emerald-600">
                          <Check className="h-3.5 w-3.5" />
                          <span className="text-[10px] font-bold">Jurusan terpilih</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* PILIHAN 3 - Fully Functional */}
                  <div className="space-y-2 pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline" className="text-[10px] px-2 py-0.5">3</Badge>
                      <Label className="text-xs font-bold text-slate-700">Pilih Jurusan</Label>
                    </div>
                    
                    <div className="space-y-2" style={{ position: "relative" }}>
                      {/* PTN Selection 3 */}
                      <div ref={univContainerRef3} style={{ position: "relative", zIndex: isUnivOpen3 ? 50 : 1 }}>
                        <button
                          type="button"
                          onClick={() => { 
                            setIsUnivOpen3(!isUnivOpen3); 
                            setIsMajorOpen3(false);
                            setIsUnivOpen(false);
                            setIsMajorOpen(false);
                            setIsUnivOpen2(false);
                            setIsMajorOpen2(false);
                            setIsUnivOpen4(false);
                            setIsMajorOpen4(false);
                          }}
                          className="w-full h-10 px-3 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-900 flex items-center justify-between hover:border-blue-500 hover:bg-blue-50 transition-colors"
                        >
                          <span className="truncate text-left flex-1">{selectedUniv3 || "Pilih PTN"}</span>
                          <ChevronDown className={`h-3.5 w-3.5 text-slate-400 shrink-0 transition-transform duration-200 ${isUnivOpen3 ? "rotate-180" : ""}`} />
                        </button>

                        {isUnivOpen3 && (
                          <div 
                            className="absolute left-0 right-0 mt-1 bg-white border border-blue-100 shadow-2xl rounded-xl p-2 flex flex-col gap-2 animate-in fade-in zoom-in-95" 
                            style={{ top: "100%", zIndex: 9999, maxHeight: "300px" }}
                          >
                            <div className="relative">
                              <Search className="h-3.5 w-3.5 text-blue-400 absolute left-3 top-2.5" />
                              <input
                                type="text"
                                value={univSearch3}
                                onChange={(e) => setUnivSearch3(e.target.value)}
                                placeholder="Cari PTN..."
                                style={{ fontSize: '16px' }}
                                className="w-full h-8 pl-9 pr-3 text-xs bg-blue-50 border border-blue-100 rounded-lg focus:outline-none focus:border-blue-500 font-medium text-slate-800"
                                autoFocus
                              />
                            </div>

                            <div className="overflow-y-auto space-y-0.5" style={{ maxHeight: "240px" }}>
                              {filteredUnivs.slice(0, 50).map((univName) => (
                                <button
                                  key={univName}
                                  type="button"
                                  onClick={() => {
                                    setSelectedUniv3(univName);
                                    setIsUnivOpen3(false);
                                    setUnivSearch3("");
                                  }}
                                  className={`w-full text-left px-3 py-2 rounded-lg text-[10px] font-bold transition-colors ${
                                    selectedUniv3 === univName
                                      ? "bg-blue-700 text-white"
                                      : "text-slate-800 hover:bg-blue-50"
                                  }`}
                                >
                                  {univName}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Jurusan Selection 3 */}
                      <div ref={majorContainerRef3} style={{ position: "relative", zIndex: isMajorOpen3 ? 50 : 1 }}>
                        <button
                          type="button"
                          disabled={!selectedUniv3 || majors3.length === 0}
                          onClick={() => { 
                            setIsMajorOpen3(!isMajorOpen3); 
                            setIsUnivOpen3(false);
                            setIsUnivOpen(false);
                            setIsMajorOpen(false);
                            setIsUnivOpen2(false);
                            setIsMajorOpen2(false);
                            setIsUnivOpen4(false);
                            setIsMajorOpen4(false);
                          }}
                          className="w-full h-10 px-3 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-900 flex items-center justify-between hover:border-blue-500 hover:bg-blue-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <span className="truncate text-left flex-1">
                            {selectedProdiObj3
                              ? (predictionType === "snbp" ? selectedProdiObj3.nama_prodi : selectedProdiObj3.prodi)
                              : (!selectedUniv3 ? "Pilih PTN dulu" : "Pilih Jurusan")}
                          </span>
                          <ChevronDown className={`h-3.5 w-3.5 text-slate-400 shrink-0 transition-transform ${isMajorOpen3 ? "rotate-180" : ""}`} />
                        </button>

                        {isMajorOpen3 && (
                          <div 
                            className="absolute left-0 right-0 mt-1 bg-white border border-blue-100 shadow-2xl rounded-xl p-2 flex flex-col gap-2 animate-in fade-in zoom-in-95" 
                            style={{ top: "100%", zIndex: 9999, maxHeight: "300px" }}
                          >
                            <div className="relative">
                              <Search className="h-3.5 w-3.5 text-blue-400 absolute left-3 top-2.5" />
                              <input
                                type="text"
                                value={majorSearch3}
                                onChange={(e) => setMajorSearch3(e.target.value)}
                                placeholder="Cari jurusan..."
                                style={{ fontSize: '16px' }}
                                className="w-full h-8 pl-9 pr-3 text-xs bg-blue-50 border border-blue-100 rounded-lg focus:outline-none focus:border-blue-500 font-medium text-slate-800"
                                autoFocus
                              />
                            </div>

                            <div className="overflow-y-auto space-y-0.5" style={{ maxHeight: "240px" }}>
                              {filteredMajors3.slice(0, 50).map((m) => {
                                const isSelected = String(m.id) === String(selectedProdiId3);
                                const label = predictionType === "snbp" ? m.nama_prodi : m.prodi;
                                return (
                                  <button
                                    key={m.id}
                                    type="button"
                                    onClick={() => {
                                      setSelectedProdiId3(String(m.id));
                                      setIsMajorOpen3(false);
                                      setMajorSearch3("");
                                    }}
                                    className={`w-full text-left px-3 py-2 rounded-lg text-[10px] font-bold transition-colors ${
                                      isSelected ? "bg-blue-700 text-white" : "text-slate-800 hover:bg-blue-50"
                                    }`}
                                  >
                                    {label}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    
                      {selectedProdiObj3 && (
                        <div className="mt-2 flex items-center gap-1.5 text-emerald-600">
                          <Check className="h-3.5 w-3.5" />
                          <span className="text-[10px] font-bold">Jurusan terpilih</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* PILIHAN 4 - Fully Functional */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline" className="text-[10px] px-2 py-0.5">4</Badge>
                      <Label className="text-xs font-bold text-slate-700">Pilih Jurusan</Label>
                    </div>
                    
                    <div className="space-y-2" style={{ position: "relative" }}>
                      {/* PTN Selection 4 */}
                      <div ref={univContainerRef4} style={{ position: "relative", zIndex: isUnivOpen4 ? 50 : 1 }}>
                        <button
                          type="button"
                          onClick={() => { 
                            setIsUnivOpen4(!isUnivOpen4); 
                            setIsMajorOpen4(false);
                            setIsUnivOpen(false);
                            setIsMajorOpen(false);
                            setIsUnivOpen2(false);
                            setIsMajorOpen2(false);
                            setIsUnivOpen3(false);
                            setIsMajorOpen3(false);
                          }}
                          className="w-full h-10 px-3 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-900 flex items-center justify-between hover:border-blue-500 hover:bg-blue-50 transition-colors"
                        >
                          <span className="truncate text-left flex-1">{selectedUniv4 || "Pilih PTN"}</span>
                          <ChevronDown className={`h-3.5 w-3.5 text-slate-400 shrink-0 transition-transform duration-200 ${isUnivOpen4 ? "rotate-180" : ""}`} />
                        </button>

                        {isUnivOpen4 && (
                          <div 
                            className="absolute left-0 right-0 mt-1 bg-white border border-blue-100 shadow-2xl rounded-xl p-2 flex flex-col gap-2 animate-in fade-in zoom-in-95" 
                            style={{ top: "100%", zIndex: 9999, maxHeight: "300px" }}
                          >
                            <div className="relative">
                              <Search className="h-3.5 w-3.5 text-blue-400 absolute left-3 top-2.5" />
                              <input
                                type="text"
                                value={univSearch4}
                                onChange={(e) => setUnivSearch4(e.target.value)}
                                placeholder="Cari PTN..."
                                style={{ fontSize: '16px' }}
                                className="w-full h-8 pl-9 pr-3 text-xs bg-blue-50 border border-blue-100 rounded-lg focus:outline-none focus:border-blue-500 font-medium text-slate-800"
                                autoFocus
                              />
                            </div>

                            <div className="overflow-y-auto space-y-0.5" style={{ maxHeight: "240px" }}>
                              {filteredUnivs.slice(0, 50).map((univName) => (
                                <button
                                  key={univName}
                                  type="button"
                                  onClick={() => {
                                    setSelectedUniv4(univName);
                                    setIsUnivOpen4(false);
                                    setUnivSearch4("");
                                  }}
                                  className={`w-full text-left px-3 py-2 rounded-lg text-[10px] font-bold transition-colors ${
                                    selectedUniv4 === univName
                                      ? "bg-blue-700 text-white"
                                      : "text-slate-800 hover:bg-blue-50"
                                  }`}
                                >
                                  {univName}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Jurusan Selection 4 */}
                      <div ref={majorContainerRef4} style={{ position: "relative", zIndex: isMajorOpen4 ? 50 : 1 }}>
                        <button
                          type="button"
                          disabled={!selectedUniv4 || majors4.length === 0}
                          onClick={() => { 
                            setIsMajorOpen4(!isMajorOpen4); 
                            setIsUnivOpen4(false);
                            setIsUnivOpen(false);
                            setIsMajorOpen(false);
                            setIsUnivOpen2(false);
                            setIsMajorOpen2(false);
                            setIsUnivOpen3(false);
                            setIsMajorOpen3(false);
                          }}
                          className="w-full h-10 px-3 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-900 flex items-center justify-between hover:border-blue-500 hover:bg-blue-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <span className="truncate text-left flex-1">
                            {selectedProdiObj4
                              ? (predictionType === "snbp" ? selectedProdiObj4.nama_prodi : selectedProdiObj4.prodi)
                              : (!selectedUniv4 ? "Pilih PTN dulu" : "Pilih Jurusan")}
                          </span>
                          <ChevronDown className={`h-3.5 w-3.5 text-slate-400 shrink-0 transition-transform ${isMajorOpen4 ? "rotate-180" : ""}`} />
                        </button>

                        {isMajorOpen4 && (
                          <div 
                            className="absolute left-0 right-0 mt-1 bg-white border border-blue-100 shadow-2xl rounded-xl p-2 flex flex-col gap-2 animate-in fade-in zoom-in-95" 
                            style={{ top: "100%", zIndex: 9999, maxHeight: "300px" }}
                          >
                            <div className="relative">
                              <Search className="h-3.5 w-3.5 text-blue-400 absolute left-3 top-2.5" />
                              <input
                                type="text"
                                value={majorSearch4}
                                onChange={(e) => setMajorSearch4(e.target.value)}
                                placeholder="Cari jurusan..."
                                style={{ fontSize: '16px' }}
                                className="w-full h-8 pl-9 pr-3 text-xs bg-blue-50 border border-blue-100 rounded-lg focus:outline-none focus:border-blue-500 font-medium text-slate-800"
                                autoFocus
                              />
                            </div>

                            <div className="overflow-y-auto space-y-0.5" style={{ maxHeight: "240px" }}>
                              {filteredMajors4.slice(0, 50).map((m) => {
                                const isSelected = String(m.id) === String(selectedProdiId4);
                                const label = predictionType === "snbp" ? m.nama_prodi : m.prodi;
                                return (
                                  <button
                                    key={m.id}
                                    type="button"
                                    onClick={() => {
                                      setSelectedProdiId4(String(m.id));
                                      setIsMajorOpen4(false);
                                      setMajorSearch4("");
                                    }}
                                    className={`w-full text-left px-3 py-2 rounded-lg text-[10px] font-bold transition-colors ${
                                      isSelected ? "bg-blue-700 text-white" : "text-slate-800 hover:bg-blue-50"
                                    }`}
                                  >
                                    {label}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    
                      {selectedProdiObj4 && (
                        <div className="mt-2 flex items-center gap-1.5 text-emerald-600">
                          <Check className="h-3.5 w-3.5" />
                          <span className="text-[10px] font-bold">Jurusan terpilih</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isPending || !selectedProdiId}
              className="w-full h-12 text-sm font-black bg-blue-600 hover:bg-blue-700 text-white rounded-xl gap-2 shadow-md hover:shadow-lg transition-all"
            >
              {isPending ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>Menganalisis...</span>
                </>
              ) : (
                <>
                  <Target className="h-5 w-5" />
                  <span>Lihat Hasil Analisis</span>
                </>
              )}
            </Button>
          </form>
        )}
      </div>

      {/* PREDICTION RESULT DISPLAY CARD - Mobile Optimized */}
      {result && (
        <Card className="border-2 border-blue-200 shadow-lg rounded-xl overflow-hidden bg-white p-4 sm:p-6 space-y-4 animate-in fade-in zoom-in-95">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
            <div>
              <span className="text-[10px] text-blue-500 font-bold uppercase tracking-wide">Hasil Analisis</span>
              <h3 className="text-base sm:text-lg font-black text-slate-900 mt-0.5">
                {result.majorName}
              </h3>
              <p className="text-xs text-slate-600 font-semibold">{result.universityName}</p>
            </div>

            {result.status === "AMAN" && (
              <Badge className="bg-emerald-600 text-white font-bold text-xs px-3 py-1 rounded-lg">
                🎉 AMAN
              </Badge>
            )}
            {result.status === "BERSAING" && (
              <Badge className="bg-blue-600 text-white font-bold text-xs px-3 py-1 rounded-lg">
                ⚡ BERSAING
              </Badge>
            )}
            {result.status === "RENTAN" && (
              <Badge className="bg-amber-500 text-white font-bold text-xs px-3 py-1 rounded-lg">
                ⚠️ RENTAN
              </Badge>
            )}
          </div>

          {/* Probability Percentage Bar */}
          <div className="space-y-2">
            <div className="flex justify-between items-baseline">
              <span className="text-xs font-bold text-slate-700">Estimasi Peluang Lulus</span>
              <span className="text-3xl font-black text-blue-600">{result.percentage}%</span>
            </div>
            <Progress value={result.percentage} className="h-3 bg-slate-100 rounded-full" />
          </div>

          {/* Score Comparison Grid - More Compact */}
          <div className="grid grid-cols-3 gap-2 p-3 rounded-lg bg-slate-50 border border-slate-200 text-center">
            <div>
              <span className="text-[10px] text-slate-500 block font-semibold mb-1">
                {predictionType === "snbp" ? "Nilai Raport" : "Skor Kamu"}
              </span>
              <span className="text-lg sm:text-xl font-black text-slate-900">{result.score}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 block font-semibold mb-1">
                {predictionType === "snbp" ? "Estimasi Min" : "Passing Grade"}
              </span>
              <span className="text-lg sm:text-xl font-black text-slate-900">{result.passingGrade}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 block font-semibold mb-1">Selisih</span>
              <span className={`text-lg sm:text-xl font-black ${result.diff >= 0 ? "text-emerald-600" : "text-rose-500"}`}>
                {result.diff >= 0 ? `+${result.diff.toFixed(1)}` : result.diff.toFixed(1)}
              </span>
            </div>
          </div>

          {/* Recommendation Box - Compact */}
          <div className="p-3 rounded-lg bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 flex items-start gap-2">
            <ShieldCheck className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
            <p className="text-xs text-slate-700 leading-relaxed font-medium">
              {result.recommendation}
            </p>
          </div>
        </Card>
      )}
        </>
      )}
    </div>
  );
}
