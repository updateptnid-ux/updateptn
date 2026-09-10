"use client";

import { useState, useEffect, useRef, useTransition } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { hasFeatureAccess } from "@/lib/subscription-helpers";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Target,
  ArrowLeft,
  Loader2,
  Building2,
  Search,
  ChevronDown,
  Check,
  Calculator,
  Sun,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Award,
} from "lucide-react";

interface ProdiReferenceItem {
  id: string | number;
  univ?: string;
  prodi?: string;
  jenjang?: string;
  kelompok?: string;
  passing_grade_est?: number | string;
  ptn_name?: string;
  nama_prodi?: string;
  kategori?: string;
  daya_tampung?: number;
  peminat?: number;
  rasio_keketatan?: number;
  estimasi_nilai_raport?: number;
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
  const predictionType = searchParams.get("type") === "snbp" ? "snbp" : "snbt";
  
  const urlScore = searchParams.get("score");
  const initialScore = urlScore ? parseFloat(urlScore) : (predictionType === "snbt" ? 0 : 85);
  
  const [universities, setUniversities] = useState<string[]>([]);
  const [selectedUniv, setSelectedUniv] = useState<string>("");
  const [univSearch, setUnivSearch] = useState<string>("");
  const [isUnivOpen, setIsUnivOpen] = useState<boolean>(false);
  const [majors, setMajors] = useState<ProdiReferenceItem[]>([]);
  const [snbtScores, setSnbtScores] = useState<Record<string, number>>({
    penalaran_umum: 667,
    pemahaman_bacaan_menulis: 678,
    literasi_bahasa_indonesia: 570,
    penalaran_matematika: 556,
    pengetahuan_umum: 547,
    pengetahuan_kuantitatif: 665,
    literasi_bahasa_inggris: 736,
  });
  const [selectedTargets, setSelectedTargets] = useState<(string | null)[]>([null, null, null, null]);
  const [isTargetPickerOpen, setIsTargetPickerOpen] = useState<boolean>(false);
  const [pickerSlot, setPickerSlot] = useState<number | null>(null);
  const [pickerSearch, setPickerSearch] = useState<string>("");
  const [targetWarnings, setTargetWarnings] = useState<(string | null)[]>([null, null, null, null]);
  const [jenjangValidationError, setJenjangValidationError] = useState<string>('');
  const [multiResults, setMultiResults] = useState<any[] | null>(null);
  const [selectedProdiId, setSelectedProdiId] = useState<string>("");
  const [majorSearch, setMajorSearch] = useState<string>("");
  const [isMajorOpen, setIsMajorOpen] = useState<boolean>(false);
  const [score, setScore] = useState<string | number>(initialScore);
  const [result, setResult] = useState<PredictionResult | null>(null);
  const [loadingUnivs, setLoadingUnivs] = useState(true);
  const [loadingMajors, setLoadingMajors] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [hasAccess, setHasAccess] = useState<boolean>(false);
  const [isCheckingAccess, setIsCheckingAccess] = useState<boolean>(true);
  const [userTier, setUserTier] = useState<string>("Basic");

  const univContainerRef = useRef<HTMLDivElement>(null);
  const majorContainerRef = useRef<HTMLDivElement>(null);
  const targetPickerRef = useRef<HTMLDivElement | null>(null);

  // Check access
  useEffect(() => {
    async function fetchUserQuota() {
      setIsCheckingAccess(true);
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          window.location.href = "/login?redirect=/dashboard/student/cek-peluang";
          return;
        }

        const now = new Date().toISOString();
        const { data: subscription } = await supabase
          .from("subscriptions")
          .select("tier, status, expires_at")
          .eq("user_email", user.email)
          .eq("status", "active")
          .gt("expires_at", now)
          .order("expires_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        const { data: profileData } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .maybeSingle();

        const isAdminUser = profileData?.role === "admin";
        const featureType = predictionType === "snbp" ? "snbp" : "snbt";
        const accessCheck = hasFeatureAccess(subscription, featureType);
        const tier = subscription?.tier || "Basic";
        
        if (isAdminUser || accessCheck.hasAccess) {
          setHasAccess(true);
          setUserTier(isAdminUser ? "Admin" : tier);
        } else {
          setHasAccess(false);
          setUserTier(tier);
        }
      } catch (err) {
        console.error("Error fetching quota:", err);
        setHasAccess(false);
      } finally {
        setIsCheckingAccess(false);
      }
    }
    fetchUserQuota();
  }, [predictionType]);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (univContainerRef.current && !univContainerRef.current.contains(event.target as Node)) {
        setIsUnivOpen(false);
      }
      if (majorContainerRef.current && !majorContainerRef.current.contains(event.target as Node)) {
        setIsMajorOpen(false);
      }
      if (targetPickerRef.current && !targetPickerRef.current.contains(event.target as Node)) {
        setIsTargetPickerOpen(false);
        setPickerSlot(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Load universities
  useEffect(() => {
    async function loadUniversities() {
      try {
        setLoadingUnivs(true);
        const jsonFile = predictionType === "snbp" ? "/data_snbp.json" : "/data_snbt.json";
        const res = await fetch(jsonFile);
        if (res.ok) {
          const localData = await res.json();
          const univField = predictionType === "snbp" ? "ptn_name" : "univ";
          const uniqueUnivs = Array.from(new Set(localData.map((item: any) => item[univField]).filter(Boolean))).sort() as string[];
          setUniversities(uniqueUnivs);
          if (uniqueUnivs.length > 0) {
            setSelectedUniv(uniqueUnivs[0]);
          }
          // set majors to full list so jurusan picker can choose across PTN
          setMajors(localData);
          if (localData.length > 0 && !selectedProdiId) {
            setSelectedProdiId(String(localData[0].id));
          }
        }
      } catch (err) {
        console.error("Error loading universities:", err);
      } finally {
        setLoadingUnivs(false);
      }
    }
    loadUniversities();
  }, [predictionType]);

  // Note: `majors` is set to the full dataset on loadUniversities so picker can select across PTN

  // Calculate prediction
  const handleAnalyze = (e: React.FormEvent) => {
    e.preventDefault();
    const scrollY = window.scrollY;
    setResult(null);
    
    setTimeout(() => window.scrollTo(0, scrollY), 0);
    
    if (!selectedProdiId) return;
    const numScore = Number(score) || (predictionType === "snbt" ? 720 : 85);

    startTransition(async () => {
      try {
        const currentProdi = majors.find((m) => String(m.id) === String(selectedProdiId));
        if (!currentProdi) return;
        
        let percentage = 75;
        let status: "AMAN" | "BERSAING" | "RENTAN" = "BERSAING";
        let recommendation = "";
        let passingGrade = 0;
        let diff = 0;

        if (predictionType === "snbp") {
          passingGrade = currentProdi.estimasi_nilai_raport || 80;
          diff = numScore - passingGrade;
          const rasio = currentProdi.rasio_keketatan || 1;
          
          if (diff >= 5) {
            status = "AMAN";
            percentage = Math.min(98, Math.round(85 + diff * 2));
            recommendation = `Nilai ${numScore} berada +${diff.toFixed(1)} di atas estimasi ${passingGrade}. Rasio ${rasio.toFixed(1)}:1. Peluang SANGAT TINGGI!`;
          } else if (diff >= 0) {
            status = "BERSAING";
            percentage = Math.round(60 + (diff / 5) * 24);
            recommendation = `Nilai ${numScore} melampaui estimasi ${passingGrade} sebesar +${diff.toFixed(1)}. Zona kompetisi aktif.`;
          } else {
            status = "RENTAN";
            percentage = Math.max(25, Math.round(60 + diff * 4));
            recommendation = `Nilai ${numScore} berjarak ${Math.abs(diff).toFixed(1)} di bawah estimasi ${passingGrade}. Pertimbangkan pilihan ke-2.`;
          }
        } else {
          passingGrade = Number(currentProdi.passing_grade_est) || 700;
          diff = numScore - passingGrade;
          
          if (diff >= 20) {
            status = "AMAN";
            percentage = Math.min(98, Math.round(85 + (diff - 20) * 0.4));
            recommendation = `Skor ${numScore} berada +${diff.toFixed(1)} di atas passing grade ${passingGrade}. Peluang SANGAT TINGGI!`;
          } else if (diff >= 0) {
            status = "BERSAING";
            percentage = Math.round(60 + (diff / 20) * 24);
            recommendation = `Skor ${numScore} melampaui passing grade ${passingGrade} sebesar +${diff.toFixed(1)}. Zona kompetisi aktif.`;
          } else {
            status = "RENTAN";
            percentage = Math.max(25, Math.round(60 + diff * 1.2));
            recommendation = `Skor ${numScore} berjarak ${Math.abs(diff).toFixed(1)} di bawah passing grade ${passingGrade}. Pertimbangkan pilihan 2.`;
          }
        }

        const prodiName = predictionType === "snbp" ? currentProdi.nama_prodi : currentProdi.prodi;
        const univName = predictionType === "snbp" ? currentProdi.ptn_name : currentProdi.univ;

        setResult({
          score: numScore,
          passingGrade,
          diff,
          percentage,
          status,
          majorName: `${currentProdi.jenjang || "S1"} ${prodiName}`,
          universityName: univName || "",
          recommendation,
        });
        
        setTimeout(() => window.scrollTo(0, scrollY), 10);
      } catch (error) {
        console.error("Error:", error);
      }
    });
  };

  // Search helpers
  const normalizeText = (text: string) => text.toLowerCase().trim().replace(/\s+/g, ' ');
  
  const getRelevanceScore = (text: string, search: string): number => {
    const normalizedText = normalizeText(text);
    const normalizedSearch = normalizeText(search);
    if (!normalizedSearch) return 1;
    if (normalizedText === normalizedSearch) return 100;
    if (normalizedText.startsWith(normalizedSearch)) return 80;
    if (normalizedText.includes(normalizedSearch)) return 60;
    return 0;
  };

  const filteredUnivs = universities
    .map(u => ({ univ: u, score: getRelevanceScore(u, univSearch) }))
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .map(item => item.univ);

  const filteredMajors = majors
    .map((m) => {
      const prodiName = predictionType === "snbp" ? (m.nama_prodi || "") : (m.prodi || "");
      const score = getRelevanceScore(prodiName, majorSearch);
      return { major: m, score };
    })
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .map(item => item.major);

  // Picker-specific filtered majors (search inside picker)
  const filteredPickerMajors = majors
    .map((m) => {
      const prodiName = predictionType === "snbp" ? (m.nama_prodi || "") : (m.prodi || "");
      const score = getRelevanceScore(prodiName, pickerSearch);
      return { major: m, score };
    })
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .map(item => item.major);

  const selectedProdiObj = majors.find((m) => String(m.id) === String(selectedProdiId));

  const computeSNBTTotal = () => {
    const vals = Object.values(snbtScores);
    if (vals.length === 0) return 0;
    const avg = vals.reduce((a, b) => a + b, 0) / vals.length;
    return Math.round(avg);
  };

  // Smart Guard: Analisis jurusan berdasarkan kategori
  const analyzeJurusanFit = (prodiName: string, scores: Record<string, number>) => {
    const prodiLower = prodiName.toLowerCase();
    const suggestions: string[] = [];
    const warnings: string[] = [];
    
    // Kategori Teknik - butuh PM & PK tinggi
    if (prodiLower.includes('teknik') || prodiLower.includes('engineering') || 
        prodiLower.includes('informatika') || prodiLower.includes('komputer')) {
      if (scores.penalaran_matematika < 600) {
        warnings.push('Penalaran Matematika masih rendah untuk jurusan Teknik (idealnya 650+)');
        suggestions.push('Fokus tingkatkan PM dengan latihan soal matematika intensif');
      }
      if (scores.pengetahuan_kuantitatif < 650) {
        warnings.push('Pengetahuan Kuantitatif perlu ditingkatkan (idealnya 700+)');
        suggestions.push('Perbanyak latihan soal kuantitatif dan logika matematika');
      }
    }
    
    // Kategori Kesehatan - butuh semua subtes balanced
    if (prodiLower.includes('kedokteran') || prodiLower.includes('farmasi') || 
        prodiLower.includes('kesehatan') || prodiLower.includes('keperawatan')) {
      const allScores = Object.values(scores);
      const minScore = Math.min(...allScores);
      const maxScore = Math.max(...allScores);
      if (maxScore - minScore > 150) {
        warnings.push('Jurusan Kesehatan butuh skor balanced di semua subtes');
        suggestions.push('Fokus perbaiki subtes terendah agar lebih seimbang');
      }
      if (scores.literasi_bahasa_indonesia < 600) {
        warnings.push('Literasi B. Indonesia penting untuk membaca soal medis (idealnya 650+)');
      }
    }
    
    // Kategori Sosial/Hukum - butuh PBM & LBI tinggi
    if (prodiLower.includes('hukum') || prodiLower.includes('ekonomi') || 
        prodiLower.includes('manajemen') || prodiLower.includes('akuntansi') ||
        prodiLower.includes('psikologi') || prodiLower.includes('komunikasi')) {
      if (scores.pemahaman_bacaan_menulis < 650) {
        warnings.push('Pemahaman Bacaan & Menulis krusial untuk jurusan Sosial (idealnya 700+)');
        suggestions.push('Perbanyak baca artikel akademik dan latihan analisis teks');
      }
      if (scores.literasi_bahasa_indonesia < 600) {
        warnings.push('Literasi B. Indonesia perlu ditingkatkan (idealnya 650+)');
      }
    }
    
    // Kategori IPA Murni - butuh PU & PK tinggi
    if (prodiLower.includes('fisika') || prodiLower.includes('kimia') || 
        prodiLower.includes('biologi') || prodiLower.includes('matematika')) {
      if (scores.penalaran_umum < 650) {
        warnings.push('Penalaran Umum penting untuk analisis IPA (idealnya 700+)');
      }
      if (scores.pengetahuan_kuantitatif < 650) {
        warnings.push('Pengetahuan Kuantitatif perlu lebih tinggi (idealnya 700+)');
      }
    }
    
    // Kategori Bahasa/Sastra - butuh LBI & LBIng tinggi
    if (prodiLower.includes('sastra') || prodiLower.includes('bahasa') || 
        prodiLower.includes('linguistik') || prodiLower.includes('pendidikan bahasa')) {
      if (scores.literasi_bahasa_indonesia < 650) {
        warnings.push('Literasi B. Indonesia harus tinggi untuk jurusan Bahasa (idealnya 750+)');
      }
      if (scores.literasi_bahasa_inggris < 700) {
        warnings.push('Literasi B. Inggris perlu ditingkatkan (idealnya 750+)');
      }
    }
    
    return { warnings, suggestions };
  };

  // Validasi kombinasi jenjang sesuai aturan SNBT
  const validateJenjangCombination = (targets: (string | null)[]) => {
    const selectedMajors = targets
      .map(t => t ? majors.find(m => String(m.id) === String(t)) : null)
      .filter(Boolean) as ProdiReferenceItem[];
    
    if (selectedMajors.length === 0) return { valid: true, message: '' };
    
    // Count jenjang types
    const jenjangCounts = {
      S1: 0,
      D4: 0,
      D3: 0
    };
    
    selectedMajors.forEach(m => {
      const jenjang = m.jenjang?.toUpperCase() || 'S1';
      if (jenjang.includes('S1') || jenjang.includes('SARJANA')) {
        jenjangCounts.S1++;
      } else if (jenjang.includes('D4') || jenjang.includes('D-IV') || jenjang.includes('DIPLOMA EMPAT')) {
        jenjangCounts.D4++;
      } else if (jenjang.includes('D3') || jenjang.includes('D-III') || jenjang.includes('DIPLOMA TIGA')) {
        jenjangCounts.D3++;
      }
    });
    
    const totalSelected = selectedMajors.length;
    const vokasiCount = jenjangCounts.D3 + jenjangCounts.D4;
    const akademisCount = jenjangCounts.S1;
    
    // Aturan 1 Pilihan: Bebas
    if (totalSelected === 1) {
      return { valid: true, message: '' };
    }
    
    // Aturan 2 Pilihan: Bebas kombinasi apa pun
    if (totalSelected === 2) {
      return { valid: true, message: '' };
    }
    
    // Aturan 3 Pilihan: Wajib campuran Sarjana dan Vokasi
    if (totalSelected === 3) {
      if (akademisCount > 0 && vokasiCount > 0) {
        return { valid: true, message: '' };
      } else {
        return { 
          valid: false, 
          message: '❌ Aturan 3 Pilihan: Wajib mencampurkan jenjang Sarjana (S1) dan Vokasi (D3/D4). Contoh: 2 S1 + 1 D3/D4 atau 1 S1 + 2 D3/D4'
        };
      }
    }
    
    // Aturan 4 Pilihan: Wajib kombinasi akademis & vokasi, minimal 1 D3
    if (totalSelected === 4) {
      if (akademisCount > 0 && vokasiCount > 0 && jenjangCounts.D3 >= 1) {
        return { valid: true, message: '' };
      } else {
        let errorMsg = '❌ Aturan 4 Pilihan: ';
        if (akademisCount === 0 || vokasiCount === 0) {
          errorMsg += 'Wajib kombinasi Sarjana (S1) dan Vokasi (D3/D4). ';
        }
        if (jenjangCounts.D3 === 0) {
          errorMsg += 'Minimal 1 program studi Diploma Tiga (D3) wajib dipilih.';
        }
        return { valid: false, message: errorMsg };
      }
    }
    
    return { valid: true, message: '' };
  };

  // Get jenjang type from major
  const getJenjangType = (jenjang: string | undefined): 'S1' | 'D4' | 'D3' => {
    if (!jenjang) return 'S1';
    const j = jenjang.toUpperCase();
    if (j.includes('S1') || j.includes('SARJANA')) return 'S1';
    if (j.includes('D4') || j.includes('D-IV') || j.includes('DIPLOMA EMPAT')) return 'D4';
    if (j.includes('D3') || j.includes('D-III') || j.includes('DIPLOMA TIGA')) return 'D3';
    return 'S1';
  };

  // Get suggested jenjang based on current selection
  const getSuggestedJenjang = (currentTargets: (string | null)[], currentSlot: number): string[] => {
    const selected = currentTargets
      .map((t, i) => i === currentSlot ? null : t) // exclude current slot
      .filter(Boolean)
      .map(t => majors.find(m => String(m.id) === String(t)))
      .filter(Boolean) as ProdiReferenceItem[];
    
    if (selected.length === 0) return []; // No restriction for first choice
    
    const jenjangCounts = { S1: 0, D4: 0, D3: 0 };
    selected.forEach(m => {
      const type = getJenjangType(m.jenjang);
      jenjangCounts[type]++;
    });
    
    const totalSelected = selected.length;
    const targetTotal = currentTargets.filter(t => t !== null).length;
    
    // If selecting 3rd choice and already have 2 S1
    if (totalSelected === 2 && targetTotal === 3) {
      if (jenjangCounts.S1 === 2) {
        return ['D3', 'D4']; // Must pick vokasi
      }
      if (jenjangCounts.D3 + jenjangCounts.D4 === 2) {
        return ['S1']; // Must pick sarjana
      }
    }
    
    // If selecting 4th choice
    if (totalSelected === 3 && targetTotal === 4) {
      const vokasiCount = jenjangCounts.D3 + jenjangCounts.D4;
      const akademisCount = jenjangCounts.S1;
      
      // If no D3 yet, must pick D3
      if (jenjangCounts.D3 === 0) {
        return ['D3'];
      }
      // If all S1 so far, must pick vokasi
      if (akademisCount === 3) {
        return ['D3', 'D4'];
      }
      // If all vokasi so far, must pick S1
      if (vokasiCount === 3) {
        return ['S1'];
      }
    }
    
    return []; // No restriction
  };

  // Get helper text for picker
  const getPickerHelperText = (currentTargets: (string | null)[], currentSlot: number): string => {
    const suggested = getSuggestedJenjang(currentTargets, currentSlot);
    if (suggested.length === 0) return '';
    
    if (suggested.includes('D3') && suggested.length === 1) {
      return '⚠️ Pilihan ke-4 wajib Diploma Tiga (D3)';
    }
    if (suggested.includes('D3') && suggested.includes('D4')) {
      return '💡 Disarankan pilih Vokasi (D3/D4) untuk memenuhi aturan kombinasi';
    }
    if (suggested.includes('S1') && suggested.length === 1) {
      return '💡 Disarankan pilih Sarjana (S1) untuk memenuhi aturan kombinasi';
    }
    return '';
  };

  // Render status badge
  const renderStatusBadge = (status: string) => {
    if (status === "AMAN") {
      return (
        <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 text-xs px-2 py-0.5">
          <CheckCircle2 className="h-3 w-3 mr-1" />
          AMAN
        </Badge>
      );
    } else if (status === "BERSAING") {
      return (
        <Badge className="bg-blue-100 text-blue-700 border-blue-200 text-xs px-2 py-0.5">
          <TrendingUp className="h-3 w-3 mr-1" />
          BERSAING
        </Badge>
      );
    } else {
      return (
        <Badge className="bg-amber-100 text-amber-700 border-amber-200 text-xs px-2 py-0.5">
          <AlertTriangle className="h-3 w-3 mr-1" />
          RENTAN
        </Badge>
      );
    }
  };

  if (isCheckingAccess) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!hasAccess) {
    return (
      <div className="max-w-2xl mx-auto p-3 md:p-6 space-y-4 text-center py-12">
        <Target className="h-12 w-12 md:h-16 md:w-16 text-amber-600 mx-auto" />
        <h1 className="text-lg md:text-2xl font-bold text-slate-900">Subscription Diperlukan</h1>
        <p className="text-sm md:text-base text-slate-600">
          Untuk mengakses Cek Peluang {predictionType.toUpperCase()}, kamu perlu berlangganan paket Premium.
        </p>
        <div className="flex gap-2 justify-center">
          <Link href="/pricing">
            <Button className="h-10 text-sm bg-blue-600 hover:bg-blue-700">
              Lihat Paket
            </Button>
          </Link>
          <Link href="/dashboard/student">
            <Button variant="outline" className="h-10 text-sm">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Kembali
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-slate-50">
      <div className="max-w-4xl mx-auto p-3 md:p-6 space-y-3 md:space-y-4 pb-20">
        
        {/* ===== SECTION: HEADER ===== */}
        <div className="space-y-3 md:space-y-4">
          <Link href="/dashboard/student">
            <Button variant="ghost" size="sm" className="h-9 text-xs md:text-sm">
              <ArrowLeft className="h-3.5 w-3.5 md:h-4 md:w-4 mr-2" />
              Kembali ke Dashboard
            </Button>
          </Link>
          
          <Card className="p-3 md:p-6 bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-0">
            <Badge className="bg-white/20 text-white border-white/30 mb-2 text-[10px] md:text-xs">
              Kalkulator {predictionType.toUpperCase()} 2026
            </Badge>
            <h1 className="text-lg md:text-3xl font-black">
              Cek Peluang {predictionType.toUpperCase()}
            </h1>
            <p className="text-xs md:text-base text-blue-50 mt-1.5 md:mt-2">
              {predictionType === "snbp" 
                ? "Hitung peluang kelulusan SNBP berdasarkan nilai raport, booster score, dan prestasi kamu"
                : "Hitung peluang kelulusan SNBT berdasarkan skor UTBK kamu"}
            </p>
          </Card>
        </div>

        {/* Form */}
        <Card className="p-3 md:p-4">
          <form onSubmit={handleAnalyze} className="space-y-3">
            
            {/* PTN selector removed — jurusan picker supports cross-PTN selection */}

            {/* Top jurusan dropdown removed for new design */}

            {/* Score Input or SNBT Sliders + Targets (new layout) */}
            {predictionType === "snbt" ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                {/* Left: Skor Simulasi - Compact but readable */}
                <div className="bg-white rounded-xl p-5 md:p-6 border border-slate-200 shadow-sm">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="p-2 bg-blue-50 rounded-lg">
                      <Calculator className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-sm md:text-base font-bold text-slate-900">Skor Simulasi</h3>
                      <p className="text-xs text-slate-500">Sesuaikan skor UTBK kamu</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {[
                      { key: 'penalaran_umum', label: 'Penalaran Umum' },
                      { key: 'pengetahuan_umum', label: 'Pengetahuan & Pemahaman Umum' },
                      { key: 'pemahaman_bacaan_menulis', label: 'Pemahaman Bacaan & Menulis' },
                      { key: 'pengetahuan_kuantitatif', label: 'Pengetahuan Kuantitatif' },
                      { key: 'literasi_bahasa_indonesia', label: 'Literasi Bahasa Indonesia' },
                      { key: 'literasi_bahasa_inggris', label: 'Literasi Bahasa Inggris' },
                      { key: 'penalaran_matematika', label: 'Penalaran Matematika' },
                    ].map((s) => (
                      <div key={s.key} className="flex items-center gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs md:text-sm text-slate-700 font-semibold truncate pr-2">{s.label}</span>
                            <span className="text-lg md:text-xl font-black text-blue-600">{snbtScores[s.key]}</span>
                          </div>
                          <input
                            type="range"
                            min={200}
                            max={1000}
                            value={snbtScores[s.key]}
                            onChange={(e) => setSnbtScores(prev => ({ ...prev, [s.key]: Number(e.target.value) }))}
                            className="w-full h-2 bg-slate-200 rounded-full appearance-none cursor-pointer"
                            style={{
                              background: `linear-gradient(to right, #2563eb 0%, #2563eb ${((snbtScores[s.key] - 200) / 800) * 100}%, #e2e8f0 ${((snbtScores[s.key] - 200) / 800) * 100}%, #e2e8f0 100%)`
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {/* Total Score Display */}
                  <div className="mt-4 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                    <div className="flex items-center justify-between">
                      <span className="text-xs md:text-sm font-bold text-slate-700">Skor Rata-rata</span>
                      <span className="text-2xl md:text-3xl font-black text-blue-600">{computeSNBTTotal()}</span>
                    </div>
                  </div>
                </div>

                {/* Right: Jurusan Target - Compact */}
                <div className="bg-white rounded-xl p-5 md:p-6 border border-slate-200 shadow-sm">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="p-2 bg-blue-50 rounded-lg">
                      <Target className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-sm md:text-base font-bold text-slate-900">Jurusan Target</h3>
                      <p className="text-xs text-slate-500">Pilih hingga 4 jurusan</p>
                    </div>
                  </div>
                  
                  <p className="text-xs text-slate-600 mb-4 leading-relaxed">
                    Pilih hingga 4 jurusan untuk dianalisa peluang kelulusannya. 
                    <span className="font-bold text-blue-600"> Perhatian:</span> Untuk 3-4 pilihan, wajib campurkan <Badge className="inline-flex items-center bg-blue-100 text-blue-700 border-blue-300 text-[10px] px-1 py-0">S1</Badge> dan <Badge className="inline-flex items-center bg-purple-100 text-purple-700 border-purple-300 text-[10px] px-1 py-0">Vokasi</Badge>.
                  </p>

                  <div className="space-y-2.5 mb-4">
                    {selectedTargets.map((t, idx) => {
                      const found = t ? majors.find(m => String(m.id) === String(t)) : null;
                      const label = found ? (found.prodi || found.nama_prodi || 'Terpilih') : 'Pilih Jurusan';
                      const ptnLabel = found ? (found.ptn_name || found.univ || '') : '';
                      const jenjangLabel = found ? (found.jenjang || 'S1') : '';
                      
                      return (
                        <div key={idx}>
                          <button
                            type="button"
                            onClick={() => { 
                              setPickerSlot(idx); 
                              setIsTargetPickerOpen(true);
                              setPickerSearch('');
                            }}
                            className={`w-full text-left px-3.5 py-3 rounded-lg border-2 transition-all touch-manipulation ${
                              pickerSlot === idx && isTargetPickerOpen
                                ? 'border-blue-500 bg-blue-50 shadow-md' 
                                : found 
                                  ? 'border-emerald-300 bg-emerald-50/50 hover:border-emerald-400 hover:shadow-sm'
                                  : 'border-slate-200 hover:border-blue-300 bg-white hover:shadow-sm'
                            }`}
                          >
                            <div className="flex items-center gap-2.5">
                              <span className="h-7 w-7 rounded-full bg-white border-2 border-slate-300 flex items-center justify-center text-sm font-bold text-slate-700 shrink-0">
                                {idx + 1}
                              </span>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <div className={`text-sm font-bold truncate flex-1 ${found ? 'text-slate-900' : 'text-slate-400'}`}>
                                    {label}
                                  </div>
                                  {found && (
                                    <Badge className={`text-[10px] px-1.5 py-0.5 font-bold shrink-0 ${
                                      jenjangLabel.toUpperCase().includes('S1') || jenjangLabel.toUpperCase().includes('SARJANA')
                                        ? 'bg-blue-100 text-blue-700 border-blue-300'
                                        : 'bg-purple-100 text-purple-700 border-purple-300'
                                    }`}>
                                      {jenjangLabel.toUpperCase()}
                                    </Badge>
                                  )}
                                </div>
                                {ptnLabel && (
                                  <div className="text-xs text-slate-500 truncate mt-0.5">
                                    {ptnLabel}
                                  </div>
                                )}
                              </div>
                            </div>
                          </button>
                          
                          {targetWarnings[idx] && (
                            <div className="mt-2 p-3.5 bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-400 rounded-xl shadow-sm">
                              <div className="flex items-start gap-3">
                                <div className="p-1.5 bg-amber-100 rounded-lg shrink-0">
                                  <AlertTriangle className="h-5 w-5 text-amber-600" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs font-bold text-amber-900 mb-2">⚠️ Analisis Smart Guard</p>
                                  <div className="text-xs text-amber-900 leading-relaxed space-y-1.5 whitespace-pre-line">
                                    {targetWarnings[idx]}
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      if (!selectedTargets[idx]) return;
                                      const newTargets = [...selectedTargets];
                                      const item = newTargets.splice(idx, 1)[0];
                                      newTargets.unshift(item);
                                      setSelectedTargets(newTargets);
                                      
                                      const newWarnings: (string | null)[] = [null, null, null, null];
                                      setTargetWarnings(newWarnings);
                                    }}
                                    className="mt-2.5 text-xs bg-white hover:bg-amber-50 px-3 py-2 rounded-lg border-2 border-amber-400 text-amber-900 font-bold transition-all touch-manipulation inline-flex items-center gap-2 shadow-sm"
                                  >
                                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4" />
                                    </svg>
                                    Pindahkan ke Pilihan 1
                                  </button>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Jenjang Validation Error */}
                  {jenjangValidationError && (
                    <div className="mb-4 p-4 bg-rose-50 border-2 border-rose-400 rounded-xl">
                      <div className="flex items-start gap-3">
                        <div className="p-1.5 bg-rose-100 rounded-lg shrink-0">
                          <svg className="h-5 w-5 text-rose-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                          </svg>
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-bold text-rose-900 mb-1.5">Kombinasi Jenjang Tidak Valid</p>
                          <p className="text-xs text-rose-800 leading-relaxed">{jenjangValidationError}</p>
                          <div className="mt-2 p-2 bg-white/60 rounded-lg border border-rose-200">
                            <p className="text-[11px] font-semibold text-rose-900 mb-1">📋 Ketentuan Resmi SNBT:</p>
                            <ul className="text-[11px] text-rose-800 space-y-0.5 ml-4 list-disc">
                              <li><strong>1 Pilihan:</strong> Bebas (S1/D4/D3)</li>
                              <li><strong>2 Pilihan:</strong> Bebas kombinasi</li>
                              <li><strong>3 Pilihan:</strong> Wajib campuran Sarjana + Vokasi</li>
                              <li><strong>4 Pilihan:</strong> Campuran Sarjana + Vokasi, minimal 1 D3</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  <Button
                    type="button"
                    onClick={() => {
                      // Validasi jenjang terlebih dahulu
                      const validation = validateJenjangCombination(selectedTargets);
                      if (!validation.valid) {
                        setJenjangValidationError(validation.message);
                        return;
                      }
                      
                      const total = computeSNBTTotal();
                      const results: any[] = [];
                      selectedTargets.forEach((t, i) => {
                        if (!t) return;
                        const prodi = majors.find(m => String(m.id) === String(t));
                        if (!prodi) return;
                        const passing = Number(prodi.passing_grade_est) || 700;
                        const diff = total - passing;
                        let percentage = 60;
                        let status = 'BERSAING';
                        if (diff >= 20) {
                          status = 'AMAN';
                          percentage = Math.min(98, Math.round(85 + (diff - 20) * 0.4));
                        } else if (diff >= 0) {
                          status = 'BERSAING';
                          percentage = Math.round(60 + (diff / 20) * 24);
                        } else {
                          status = 'RENTAN';
                          percentage = Math.max(25, Math.round(60 + diff * 1.2));
                        }
                        results.push({ slot: i + 1, prodi, passing, diff, percentage, status });
                      });
                      setMultiResults(results);
                    }}
                    disabled={jenjangValidationError !== ''}
                    className={`w-full font-bold py-3 md:py-3.5 rounded-lg text-sm md:text-base shadow-lg hover:shadow-xl transition-all touch-manipulation h-11 md:h-12 flex items-center justify-center gap-2 ${
                      jenjangValidationError 
                        ? 'bg-slate-300 text-slate-500 cursor-not-allowed' 
                        : 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white'
                    }`}
                  >
                    <Target className="h-5 w-5" />
                    Lihat Hasil Analisis
                  </Button>

                  {isTargetPickerOpen && pickerSlot !== null && (
                    <div ref={targetPickerRef} className="fixed inset-0 z-[100] flex items-center justify-center bg-black/30 p-4" onClick={() => { setIsTargetPickerOpen(false); setPickerSlot(null); }}>
                      <div className="bg-white border-2 border-blue-300 rounded-2xl shadow-2xl max-w-lg w-full max-h-[80vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
                        <div className="p-4 border-b border-slate-200">
                          <div className="flex items-center justify-between mb-3">
                            <h3 className="text-base font-black text-slate-900">Pilih Jurusan Target #{pickerSlot + 1}</h3>
                            <button 
                              onClick={() => { setIsTargetPickerOpen(false); setPickerSlot(null); }}
                              className="p-2 hover:bg-slate-100 rounded-full transition-colors touch-manipulation"
                            >
                              <svg className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>
                          
                          {/* Helper Text */}
                          {getPickerHelperText(selectedTargets, pickerSlot) && (
                            <div className="mb-3 p-2.5 bg-blue-50 border border-blue-200 rounded-lg">
                              <p className="text-xs font-semibold text-blue-900">
                                {getPickerHelperText(selectedTargets, pickerSlot)}
                              </p>
                            </div>
                          )}
                          
                          <div className="relative">
                            <Search className="h-4 w-4 text-slate-400 absolute left-3 top-3" />
                            <input
                              type="text"
                              value={pickerSearch}
                              onChange={(e) => setPickerSearch(e.target.value)}
                              placeholder="Ketik nama jurusan atau PTN..."
                              className="w-full h-10 pl-10 pr-3 text-base bg-blue-50 border border-blue-200 rounded-xl focus:outline-none focus:border-blue-500 font-medium text-slate-800 touch-manipulation"
                              style={{ fontSize: '16px' }}
                              autoFocus
                            />
                          </div>
                        </div>
                        
                        <div className="flex-1 overflow-y-auto p-3 space-y-1 overscroll-contain" style={{ WebkitOverflowScrolling: 'touch' }}>
                          {(() => {
                            const suggested = getSuggestedJenjang(selectedTargets, pickerSlot);
                            let filtered = filteredPickerMajors;
                            
                            // Apply smart filtering if suggested jenjang exists
                            if (suggested.length > 0) {
                              filtered = filtered.filter(m => {
                                const jType = getJenjangType(m.jenjang);
                                return suggested.includes(jType);
                              });
                            }
                            
                            if (filtered.length > 0) {
                              return filtered.map((m) => {
                                const prodiName = m.prodi || m.nama_prodi || "";
                                const ptnName = m.univ || m.ptn_name || "";
                                const isSelected = selectedTargets[pickerSlot] === String(m.id);
                                const jenjangType = getJenjangType(m.jenjang);
                                
                                return (
                                  <button
                                    key={m.id}
                                    type="button"
                                    onClick={() => {
                                      const newTargets = [...selectedTargets];
                                      newTargets[pickerSlot] = String(m.id);
                                      setSelectedTargets(newTargets);

                                      // Enhanced Smart Guard with detailed analysis
                                      const total = computeSNBTTotal();
                                      const passing = Number(m.passing_grade_est) || 700;
                                      const diff = total - passing;
                                      const targetProdiName = m.prodi || m.nama_prodi || '';
                                      const analysis = analyzeJurusanFit(targetProdiName, snbtScores);
                                      
                                      const newWarnings: (string | null)[] = [...targetWarnings];
                                      let warningMessage = '';
                                      
                                      // Warning 1: Passing Grade Check
                                      if (diff < -30) {
                                        warningMessage += `⚠️ Passing grade ${passing} lebih tinggi ${Math.abs(diff).toFixed(0)} poin dari skor kamu (${total}). `;
                                      } else if (diff < 0) {
                                        warningMessage += `📊 Skor kamu ${Math.abs(diff).toFixed(0)} poin di bawah passing grade ${passing}. `;
                                      }
                                      
                                      // Warning 2: Kategori-specific warnings
                                      if (analysis.warnings.length > 0) {
                                        warningMessage += '\n\n📚 ' + analysis.warnings.join(' | ');
                                      }
                                      
                                      // Warning 3: Suggestions
                                      if (analysis.suggestions.length > 0) {
                                        warningMessage += '\n\n💡 Tips: ' + analysis.suggestions.join(' • ');
                                      }
                                      
                                      // Warning 4: Placement recommendation
                                      if (pickerSlot > 0 && diff < -50) {
                                        warningMessage += `\n\n⚡ Rekomendasi: Jurusan ini terlalu tinggi untuk pilihan ${pickerSlot + 1}. Pertimbangkan sebagai pilihan cadangan atau tingkatkan skor terlebih dahulu.`;
                                      }
                                      
                                      newWarnings[pickerSlot] = warningMessage.trim() || null;
                                      setTargetWarnings(newWarnings);

                                      // Validasi kombinasi jenjang
                                      const validation = validateJenjangCombination(newTargets);
                                      setJenjangValidationError(validation.valid ? '' : validation.message);

                                      setIsTargetPickerOpen(false);
                                      setPickerSlot(null);
                                      setPickerSearch('');
                                    }}
                                    className={`w-full text-left px-3 md:px-4 py-3 rounded-xl font-bold flex items-center justify-between transition-colors touch-manipulation ${
                                      isSelected
                                        ? "bg-blue-700 text-white"
                                        : "text-slate-800 hover:bg-blue-50 active:bg-blue-100"
                                    }`}
                                  >
                                    <div className="flex-1 min-w-0 pr-3">
                                      <div className="flex items-center gap-2 mb-1">
                                        <div className="font-black text-xs md:text-sm leading-tight flex-1">{ptnName}</div>
                                        <Badge className={`text-[10px] px-1.5 py-0.5 font-bold shrink-0 ${
                                          jenjangType === 'S1'
                                            ? 'bg-blue-500 text-white border-0'
                                            : jenjangType === 'D4'
                                            ? 'bg-purple-500 text-white border-0'
                                            : 'bg-green-500 text-white border-0'
                                        }`}>
                                          {jenjangType}
                                        </Badge>
                                      </div>
                                      <div className={`text-[10px] md:text-xs leading-tight ${isSelected ? 'opacity-90' : 'opacity-70'}`}>{prodiName}</div>
                                    </div>
                                    {isSelected && <Check className="h-4 w-4 shrink-0" />}
                                  </button>
                                );
                              });
                            } else {
                              return (
                                <div className="p-8 text-center space-y-2">
                                  <p className="text-sm text-slate-600 font-medium">
                                    {suggested.length > 0 
                                      ? `Tidak ada jurusan ${suggested.join('/')} yang cocok dengan pencarian "${pickerSearch}"`
                                      : `Jurusan "${pickerSearch}" tidak ditemukan`
                                    }
                                  </p>
                                  <p className="text-xs text-slate-400">
                                    Coba cari dengan nama PTN atau jurusan lain
                                  </p>
                                </div>
                              );
                            }
                          })()}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div>
                <Label className="text-xs md:text-sm font-bold text-slate-900 mb-2 block">
                  {predictionType === "snbp" ? "Rata-rata Nilai Raport" : "Skor UTBK"} <span className="text-rose-600">*</span>
                </Label>
                <div className="relative">
                  <Calculator className="h-4 w-4 text-slate-400 absolute left-3 top-3.5" />
                  <Input
                    type="number"
                    value={score}
                    onChange={(e) => setScore(e.target.value)}
                    placeholder={predictionType === "snbp" ? "85.5" : "720"}
                    className="pl-10 h-11 md:h-12 text-base font-bold"
                    style={{ fontSize: '16px' }}
                    min={predictionType === "snbp" ? 0 : 200}
                    max={predictionType === "snbp" ? 100 : 1000}
                    step={predictionType === "snbp" ? 0.1 : 1}
                    required
                  />
                </div>
                <p className="text-[10px] md:text-xs text-slate-500 mt-1">
                  {predictionType === "snbp" ? "Masukkan rata-rata nilai raport semester 1-5" : "Masukkan total skor UTBK kamu (200-1000)"}
                </p>
              </div>
            )}

            {/* Submit removed in new design (results shown via Hasil Analisis tab) */}
          </form>
        </Card>
        
        {/* ===== SECTION: HASIL ANALISIS ===== */}
        {multiResults && multiResults.length > 0 && (
          <div className="space-y-3 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Modern Header */}
            <Card className="p-4 bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 text-white border-0 shadow-xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-blue-100 mb-0.5">Hasil Analisis Peluang</p>
                  <h2 className="text-xl md:text-2xl font-black">Skor Rata-rata {computeSNBTTotal()}</h2>
                </div>
                <div className="h-12 w-12 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                  <Award className="h-6 w-6" />
                </div>
              </div>
            </Card>

            {/* Modern Result Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {multiResults.map((result, index) => {
                const prodiName = result.prodi.prodi || result.prodi.nama_prodi;
                const ptnName = result.prodi.univ || result.prodi.ptn_name;
                
                return (
                  <Card key={index} className={`p-4 border-2 bg-white shadow-lg hover:shadow-xl transition-shadow ${
                    result.status === 'AMAN' ? 'border-emerald-400' :
                    result.status === 'BERSAING' ? 'border-blue-400' : 'border-amber-400'
                  }`}>
                    {/* Header Section */}
                    <div className="flex items-start justify-between mb-3 pb-3 border-b">
                      <div className="flex-1 min-w-0 pr-3">
                        <div className="flex items-center gap-2 mb-2">
                          <div className={`h-8 w-8 rounded-lg flex items-center justify-center font-black text-sm ${
                            result.status === 'AMAN' ? 'bg-emerald-100 text-emerald-700' :
                            result.status === 'BERSAING' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'
                          }`}>
                            {result.slot}
                          </div>
                          <Badge className={`font-bold text-xs ${
                            result.status === 'AMAN' ? 'bg-emerald-500' :
                            result.status === 'BERSAING' ? 'bg-blue-500' : 'bg-amber-500'
                          } text-white border-0`}>
                            {result.status}
                          </Badge>
                        </div>
                        <h3 className="text-sm font-black text-slate-900 mb-1 line-clamp-1">
                          {ptnName}
                        </h3>
                        <p className="text-xs text-slate-600 line-clamp-1">{prodiName}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <div className={`text-3xl font-black leading-none ${
                          result.status === 'AMAN' ? 'text-emerald-600' :
                          result.status === 'BERSAING' ? 'text-blue-600' : 'text-amber-600'
                        }`}>
                          {result.percentage}
                          <span className="text-base">%</span>
                        </div>
                        <p className="text-[10px] text-slate-500 font-semibold mt-0.5">Peluang</p>
                      </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-3 gap-2 mb-3">
                      <div className="text-center p-2 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
                        <p className="text-[10px] text-slate-600 font-semibold mb-1">Skor</p>
                        <p className="text-lg font-black text-blue-700">{computeSNBTTotal()}</p>
                      </div>
                      <div className="text-center p-2 bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg">
                        <p className="text-[10px] text-slate-600 font-semibold mb-1">PG</p>
                        <p className="text-lg font-black text-slate-700">{result.passing}</p>
                      </div>
                      <div className={`text-center p-2 rounded-lg ${
                        result.diff >= 0
                          ? 'bg-gradient-to-br from-emerald-50 to-emerald-100'
                          : 'bg-gradient-to-br from-rose-50 to-rose-100'
                      }`}>
                        <p className="text-[10px] text-slate-600 font-semibold mb-1">Gap</p>
                        <p className={`text-lg font-black ${
                          result.diff >= 0 ? 'text-emerald-700' : 'text-rose-700'
                        }`}>
                          {result.diff >= 0 ? '+' : ''}{result.diff.toFixed(0)}
                        </p>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mb-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] font-bold text-slate-700">Progress</span>
                        <span className="text-[10px] font-bold text-slate-900">{result.percentage}%</span>
                      </div>
                      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all duration-500 ${
                            result.status === 'AMAN' ? 'bg-gradient-to-r from-emerald-500 to-emerald-600' :
                            result.status === 'BERSAING' ? 'bg-gradient-to-r from-blue-500 to-blue-600' :
                            'bg-gradient-to-r from-amber-500 to-amber-600'
                          }`}
                          style={{ width: `${result.percentage}%` }}
                        />
                      </div>
                    </div>

                    {/* Recommendation Box */}
                    <div className={`rounded-lg p-3 ${
                      result.status === 'AMAN' ? 'bg-gradient-to-br from-emerald-50 to-emerald-100/50 border border-emerald-200' :
                      result.status === 'BERSAING' ? 'bg-gradient-to-br from-blue-50 to-blue-100/50 border border-blue-200' :
                      'bg-gradient-to-br from-amber-50 to-amber-100/50 border border-amber-200'
                    }`}>
                      <div className="flex items-start gap-2">
                        <div className={`mt-0.5 h-5 w-5 rounded-md flex items-center justify-center shrink-0 ${
                          result.status === 'AMAN' ? 'bg-emerald-200' :
                          result.status === 'BERSAING' ? 'bg-blue-200' : 'bg-amber-200'
                        }`}>
                          <TrendingUp className={`h-3 w-3 ${
                            result.status === 'AMAN' ? 'text-emerald-700' :
                            result.status === 'BERSAING' ? 'text-blue-700' : 'text-amber-700'
                          }`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[10px] font-black text-slate-900 mb-1">
                            {result.status === 'AMAN' ? 'Strategi Pertahankan' :
                             result.status === 'BERSAING' ? 'Strategi Tingkatkan' : 'Strategi Perbaiki'}
                          </p>
                          <p className="text-[10px] text-slate-700 leading-relaxed">
                            {result.status === 'AMAN' 
                              ? `Peluang sangat baik. Fokus pertahankan performa dengan tryout rutin dan maksimalkan subtes yang masih bisa ditingkatkan.`
                              : result.status === 'BERSAING'
                              ? `Target tingkatkan 20-30 poin dengan fokus pada 3 subtes tertinggi. Siapkan juga opsi cadangan yang lebih aman.`
                              : `Perlu peningkatan signifikan 40+ poin atau pertimbangkan jurusan dengan passing grade lebih realistis untuk pilihan ini.`
                            }
                          </p>
                        </div>
                      </div>
                    </div>
                    {/* Alternatives Recommendation */}
                    {result.percentage < 80 && (() => {
                      const getAlternativeProdi = (currentProdi: ProdiReferenceItem, userScore: number) => {
                        const alternatives = majors.filter(p => 
                          p.id !== currentProdi.id && 
                          (p.kategori === currentProdi.kategori || (p.prodi || p.nama_prodi || "").includes((currentProdi.prodi || currentProdi.nama_prodi || "").split(" ")[0])) &&
                          (Number(p.passing_grade_est) || 0) <= userScore + 20
                        ).sort((a, b) => (Number(b.passing_grade_est) || 0) - (Number(a.passing_grade_est) || 0));
                        return alternatives.slice(0, 2);
                      };
                      const alts = getAlternativeProdi(result.prodi, computeSNBTTotal());
                      if (alts.length === 0) return null;
                      
                      return (
                        <div className="mt-3 pt-3 border-t border-slate-200">
                          <p className="text-[10px] font-bold text-slate-900 mb-2">💡 Rekomendasi Alternatif PTN:</p>
                          <div className="space-y-2">
                            {alts.map(alt => (
                              <div key={alt.id} className="bg-slate-50 rounded-lg p-2 border border-slate-200 flex justify-between items-center">
                                <div>
                                  <p className="text-[10px] font-bold text-slate-900">{alt.univ || alt.ptn_name}</p>
                                  <p className="text-[9px] text-slate-600">{alt.jenjang} {alt.prodi || alt.nama_prodi}</p>
                                </div>
                                <Badge className="bg-slate-200 text-slate-700 text-[9px]">
                                  PG: {alt.passing_grade_est}
                                </Badge>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })()}

                  </Card>
                );
              })}
            </div>

            {/* Compact Footer Info */}
            <Card className="p-3 bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-blue-100 rounded-xl flex items-center justify-center shrink-0">
                  <svg className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-xs font-bold text-slate-900 mb-0.5">Estimasi Biaya Kuliah</p>
                  <p className="text-[10px] text-slate-600">
                    UKT: Rp 500K-5jt/semester (gol. 1-4) • IPI: Rp 10-50jt (jika ada) • Cek website PTN untuk info detail
                  </p>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
