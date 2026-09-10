"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Target,
  ArrowLeft,
  Loader2,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Award,
  Building2,
  BookOpen,
  Search,
  ChevronDown,
  Check,
  Plus
} from "lucide-react";
import SNBPCalculatorForm from "@/components/student/SNBPCalculatorForm";
import { createClient } from "@/lib/supabase/client";
import { hasFeatureAccess } from "@/lib/subscription-helpers";

interface SNBPData {
  province: string;
  city: string;
  schoolName: string;
  accreditation: string;
  curriculum: string;
  boosterSubjects: Array<{ id: string; name: string; value: string }>;
  achievements: Array<{ id: string; name: string; level: string; year: string }>;
  averageScore: number;
}

interface ProdiSNBP {
  id: string | number;
  ptn_name: string;
  nama_prodi: string;
  jenjang?: string;
  kategori?: string;
  daya_tampung: number;
  peminat: number;
  rasio_keketatan: number;
  estimasi_nilai_raport: number;
}

interface PredictionResult {
  prodiData: ProdiSNBP;
  finalScore: number;
  status: "AMAN" | "BERSAING" | "RENTAN";
  percentage: number;
  boosterContribution: number;
  achievementBonus: number;
  accreditationBonus: number;
  recommendation: string;
}

export default function CekPeluangSNBPPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [allProdi, setAllProdi] = useState<ProdiSNBP[]>([]);
  
  // User selections
  const [snbpData, setSNBPData] = useState<SNBPData | null>(null);
  
  // Tab and prodi selection states
  const [activeTab, setActiveTab] = useState<string>("1");
  const [selectedProdis, setSelectedProdis] = useState<Record<string, string>>({});
  const [prodiSearch, setProdiSearch] = useState<Record<string, string>>({});
  const [isProdiOpen, setIsProdiOpen] = useState<Record<string, boolean>>({});
  const [results, setResults] = useState<Record<string, PredictionResult>>({});
  
  // Number of choices available
  const [choicesCount, setChoicesCount] = useState<number>(2);
  
  // Access control
  const [hasAccess, setHasAccess] = useState<boolean>(false);
  const [isCheckingAccess, setIsCheckingAccess] = useState<boolean>(true);

  // Load SNBP data
  useEffect(() => {
    async function loadSNBPData() {
      try {
        const res = await fetch("/data_snbp.json");
        if (res.ok) {
          const data = await res.json();
          setAllProdi(data);
        }
      } catch (err) {
        console.error("Error loading SNBP data:", err);
      }
    }
    
    loadSNBPData();
  }, []);

  // Check access
  useEffect(() => {
    async function checkAccess() {
      setIsCheckingAccess(true);
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          router.push("/login?redirect=/dashboard/student/cek-peluang-snbp");
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

        const isAdmin = profileData?.role === "admin";
        const accessCheck = hasFeatureAccess(subscription, "snbp");
        
        if (isAdmin) {
          setHasAccess(true);
        } else {
          setHasAccess(accessCheck.hasAccess);
        }
      } catch (err) {
        console.error("Error checking access:", err);
        setHasAccess(false);
      } finally {
        setIsCheckingAccess(false);
      }
    }

    checkAccess();
  }, [router]);

  const calculateAchievementBonus = (achievements: SNBPData['achievements']): number => {
    let bonus = 0;
    achievements.forEach(a => {
      if (a.level.includes("Internasional - Juara 1")) bonus += 5;
      else if (a.level.includes("Internasional - Juara 2")) bonus += 4;
      else if (a.level.includes("Internasional - Juara 3")) bonus += 3;
      else if (a.level.includes("Nasional - Juara 1")) bonus += 3;
      else if (a.level.includes("Nasional - Juara 2")) bonus += 2;
      else if (a.level.includes("Nasional - Juara 3")) bonus += 1.5;
      else if (a.level.includes("Provinsi - Juara 1")) bonus += 1;
      else if (a.level.includes("Provinsi - Juara 2")) bonus += 0.75;
      else if (a.level.includes("Provinsi - Juara 3")) bonus += 0.5;
    });
    return bonus;
  };

  const calculateBoosterContribution = (data: SNBPData): number => {
    if (data.boosterSubjects.length === 0) return 0;
    const boosterAvg = data.boosterSubjects.reduce((sum, s) => 
      sum + parseFloat(s.value), 0) / data.boosterSubjects.length;
    const diff = boosterAvg - data.averageScore;
    return Math.max(0, diff * 0.05); // 5% weight
  };

  const calculateAccreditationBonus = (accreditation: string): number => {
    if (accreditation === "A (Unggul)") return 1;
    if (accreditation === "B (Baik Sekali)") return 0.5;
    return 0;
  };

  const calculatePrediction = (data: SNBPData, prodiId: string): PredictionResult | null => {
    const prodi = allProdi.find(p => String(p.id) === prodiId);
    if (!prodi) return null;

    const boosterBonus = calculateBoosterContribution(data);
    const achievementBonus = calculateAchievementBonus(data.achievements);
    const accreditationBonus = calculateAccreditationBonus(data.accreditation);
    
    const finalScore = data.averageScore + boosterBonus + achievementBonus + accreditationBonus;
    const estimasi = prodi.estimasi_nilai_raport || 80;
    const diff = finalScore - estimasi;
    
    let status: "AMAN" | "BERSAING" | "RENTAN" = "BERSAING";
    let percentage = 75;
    let recommendation = "";

    if (diff >= 5) {
      status = "AMAN";
      percentage = Math.min(98, Math.round(85 + diff * 2));
      recommendation = `Dengan nilai ${finalScore.toFixed(1)} (termasuk booster +${boosterBonus.toFixed(1)} dan prestasi +${achievementBonus}), kamu berada ${diff.toFixed(1)} poin di atas estimasi ${estimasi}. Peluang lolos SANGAT TINGGI! Rasio keketatan ${prodi.rasio_keketatan.toFixed(2)}:1 dengan daya tampung ${prodi.daya_tampung} kursi.`;
    } else if (diff >= 0) {
      status = "BERSAING";
      percentage = Math.round(60 + (diff / 5) * 24);
      recommendation = `Nilai ${finalScore.toFixed(1)} melampaui estimasi ${estimasi} sebesar +${diff.toFixed(1)}. Kamu berada di zona kompetisi aktif dengan ${prodi.peminat} peminat untuk ${prodi.daya_tampung} kursi (rasio ${prodi.rasio_keketatan.toFixed(2)}:1). ${boosterBonus > 0 ? \`Booster score +${boosterBonus.toFixed(1)} membantu posisi kamu.\` : ''}`;
    } else {
      status = "RENTAN";
      percentage = Math.max(25, Math.round(60 + diff * 4));
      recommendation = `Nilai ${finalScore.toFixed(1)} berjarak ${Math.abs(diff).toFixed(1)} poin di bawah estimasi ${estimasi}. Dengan keketatan ${prodi.rasio_keketatan.toFixed(2)}:1, pertimbangkan jurusan ini di pilihan lain atau fokus tingkatkan nilai raport di semester 6. ${achievementBonus > 0 ? \`Prestasi +${achievementBonus} poin sudah membantu, tapi tetap perlu boost nilai akademik.\` : 'Prestasi akademik atau portofolio bisa jadi penentu.'}`;
    }

    return {
      prodiData: prodi,
      finalScore,
      status,
      percentage,
      boosterContribution: boosterBonus,
      achievementBonus,
      accreditationBonus,
      recommendation,
    };
  };

  const handleCalculate = (data: SNBPData) => {
    setSNBPData(data);
    setLoading(true);
    
    setTimeout(() => {
      const newResults: Record<string, PredictionResult> = {};
      for (let i = 1; i <= choicesCount; i++) {
        const id = selectedProdis[String(i)];
        if (id) {
          const res = calculatePrediction(data, id);
          if (res) newResults[String(i)] = res;
        }
      }
      setResults(newResults);
      setLoading(false);
    }, 500);
  };

  // Add alternative recommendation for BERSAING or RENTAN
  const getAlternativeProdi = (currentProdi: ProdiSNBP, userScore: number) => {
    // Find prodi with same category or similar name but lower estimasi
    const alternatives = allProdi.filter(p => 
      p.id !== currentProdi.id && 
      (p.kategori === currentProdi.kategori || p.nama_prodi.includes(currentProdi.nama_prodi.split(" ")[0])) &&
      p.estimasi_nilai_raport <= userScore + 2
    ).sort((a, b) => b.estimasi_nilai_raport - a.estimasi_nilai_raport);
    
    return alternatives.slice(0, 2); // get top 2
  };

  const renderStatusBadge = (status: string) => {
    if (status === "AMAN") {
      return (
        <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 text-xs md:text-sm px-3 py-1">
          <CheckCircle2 className="h-3 w-3 md:h-4 md:w-4 mr-1" />
          AMAN
        </Badge>
      );
    } else if (status === "BERSAING") {
      return (
        <Badge className="bg-blue-100 text-blue-700 border-blue-200 text-xs md:text-sm px-3 py-1">
          <TrendingUp className="h-3 w-3 md:h-4 md:w-4 mr-1" />
          BERSAING
        </Badge>
      );
    } else {
      return (
        <Badge className="bg-amber-100 text-amber-700 border-amber-200 text-xs md:text-sm px-3 py-1">
          <AlertTriangle className="h-3 w-3 md:h-4 md:w-4 mr-1" />
          RENTAN
        </Badge>
      );
    }
  };

  const renderResultCard = (result: PredictionResult | null, choiceNumber: string) => {
    if (!result) return null;

    const { prodiData, finalScore, status, percentage, boosterContribution, achievementBonus, accreditationBonus, recommendation } = result;

    const alternatives = (status === "RENTAN" || status === "BERSAING") 
      ? getAlternativeProdi(prodiData, finalScore)
      : [];

    return (
      <Card className={`p-5 md:p-6 border-2 ${
        status === "AMAN" ? "border-emerald-300 bg-emerald-50" :
        status === "BERSAING" ? "border-blue-300 bg-blue-50" :
        "border-amber-300 bg-amber-50"
      }`}>
        <div className="space-y-5">
          <div className="pb-4 border-b-2 border-slate-200">
            <div className="flex items-center gap-2 mb-3 flex-wrap">
              <Badge variant="outline" className="text-xs font-bold">
                Pilihan {choiceNumber}
              </Badge>
              {renderStatusBadge(status)}
            </div>
            <h3 className="text-base md:text-lg font-black text-slate-900 mb-1">
              {prodiData.ptn_name}
            </h3>
            <p className="text-sm text-slate-600">
              {prodiData.jenjang} {prodiData.nama_prodi}
              {prodiData.kategori && ` • ${prodiData.kategori}`}
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm font-semibold">
              <span className="text-slate-700">Peluang Kelulusan</span>
              <span className="text-xl font-black text-slate-900">{percentage}%</span>
            </div>
            <Progress value={percentage} className="h-4" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white rounded-xl p-4 border-2 border-blue-200">
              <p className="text-xs text-slate-600 mb-2 font-semibold">Nilai Kamu</p>
              <p className="text-2xl md:text-3xl font-black text-blue-600">
                {finalScore.toFixed(1)}
              </p>
            </div>
            <div className="bg-white rounded-xl p-4 border-2 border-slate-200">
              <p className="text-xs text-slate-600 mb-2 font-semibold">Estimasi Minimal</p>
              <p className="text-2xl md:text-3xl font-black text-slate-900">
                {prodiData.estimasi_nilai_raport.toFixed(1)}
              </p>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 border-2 border-slate-200">
            <p className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-purple-600" />
              Detail Kontribusi Nilai
            </p>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between items-center py-1.5 border-b border-slate-100">
                <span className="text-slate-600">• Nilai Raport (Rata-rata)</span>
                <span className="font-bold text-slate-900">{snbpData?.averageScore.toFixed(1)}</span>
              </div>
              {boosterContribution > 0 && (
                <div className="flex justify-between items-center py-1.5 border-b border-slate-100">
                  <span className="text-slate-600">• Booster Score (Mapel Pendukung)</span>
                  <span className="font-bold text-purple-600">+{boosterContribution.toFixed(1)}</span>
                </div>
              )}
              {achievementBonus > 0 && (
                <div className="flex justify-between items-center py-1.5 border-b border-slate-100">
                  <span className="text-slate-600">• Prestasi (Achievement)</span>
                  <span className="font-bold text-amber-600">+{achievementBonus.toFixed(1)}</span>
                </div>
              )}
              {accreditationBonus > 0 && (
                <div className="flex justify-between items-center py-1.5">
                  <span className="text-slate-600">• Akreditasi Sekolah</span>
                  <span className="font-bold text-emerald-600">+{accreditationBonus.toFixed(1)}</span>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 border-2 border-slate-200">
            <p className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
              <Target className="h-4 w-4 text-blue-600" />
              Statistik Jurusan
            </p>
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="bg-slate-50 rounded-lg p-3">
                <p className="text-xs text-slate-600 mb-1 font-semibold">Daya Tampung</p>
                <p className="text-lg md:text-xl font-black text-slate-900">{prodiData.daya_tampung}</p>
              </div>
              <div className="bg-slate-50 rounded-lg p-3">
                <p className="text-xs text-slate-600 mb-1 font-semibold">Peminat</p>
                <p className="text-lg md:text-xl font-black text-slate-900">{prodiData.peminat}</p>
              </div>
              <div className="bg-slate-50 rounded-lg p-3">
                <p className="text-xs text-slate-600 mb-1 font-semibold">Rasio</p>
                <p className="text-lg md:text-xl font-black text-slate-900">{prodiData.rasio_keketatan.toFixed(1)}:1</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border-2 border-blue-200">
            <p className="text-sm font-bold text-slate-900 mb-2 flex items-center gap-2">
              <Award className="h-4 w-4 text-blue-600" />
              Rasionalisasi & Rekomendasi
            </p>
            <p className="text-sm text-slate-700 leading-relaxed mb-4">
              {recommendation}
            </p>
            
            {alternatives.length > 0 && (
              <div className="mt-3 pt-3 border-t border-blue-200">
                <p className="text-xs font-bold text-blue-900 mb-2">💡 Rekomendasi Alternatif PTN (Peluang Lebih Besar):</p>
                <div className="space-y-2">
                  {alternatives.map((alt) => (
                    <div key={alt.id} className="bg-white rounded-lg p-2 border border-blue-100 flex justify-between items-center">
                      <div>
                        <p className="text-xs font-bold text-slate-900">{alt.ptn_name}</p>
                        <p className="text-[10px] text-slate-600">{alt.jenjang} {alt.nama_prodi}</p>
                      </div>
                      <Badge className="bg-blue-100 text-blue-700 text-[10px]">
                        Est. Nilai: {alt.estimasi_nilai_raport}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          
        </div>
      </Card>
    );
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
      <div className="max-w-2xl mx-auto p-4 md:p-6 space-y-6 text-center py-12">
        <Target className="h-16 w-16 text-amber-600 mx-auto" />
        <h1 className="text-2xl font-bold text-slate-900">Subscription SNBP Diperlukan</h1>
        <p className="text-slate-600">
          Untuk mengakses Cek Peluang SNBP, kamu perlu berlangganan Premium SNBP atau VIP All-in-One.
        </p>
        <div className="flex gap-3 justify-center">
          <Link href="/pricing">
            <Button className="bg-blue-600 hover:bg-blue-700">
              Lihat Paket Premium
            </Button>
          </Link>
          <Link href="/dashboard/student">
            <Button variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Kembali
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-slate-50 overflow-y-auto">
      <div className="max-w-6xl mx-auto p-4 md:p-6 space-y-6 pb-24">
        
        <div className="space-y-3 md:space-y-4">
          <Link href="/dashboard/student">
            <Button variant="ghost" size="sm" className="h-9 text-xs md:text-sm">
              <ArrowLeft className="h-3.5 w-3.5 md:h-4 md:w-4 mr-2" />
              Kembali ke Dashboard
            </Button>
          </Link>
          
          <Card className="p-3 md:p-6 bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-0">
            <Badge className="bg-white/20 text-white border-white/30 mb-2 text-[10px] md:text-xs">
              Kalkulator SNBP 2026
            </Badge>
            <h1 className="text-lg md:text-3xl font-black">
              Cek Peluang SNBP
            </h1>
            <p className="text-xs md:text-base text-blue-50 mt-1.5 md:mt-2">
              Hitung peluang kelulusan SNBP berdasarkan nilai raport, booster score, dan prestasi kamu
            </p>
          </Card>
        </div>

        {/* Both Form and PTN Selection are visible together */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-6">
            <SNBPCalculatorForm
              onCalculate={handleCalculate}
              initialScore={85}
            />
          </div>

          <div className="space-y-6">
            <Card className="p-4 md:p-6 bg-white overflow-visible sticky top-6">
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <Building2 className="h-5 w-5 text-blue-600" />
                  <h2 className="text-lg md:text-xl font-black text-slate-900">
                    Pilih Jurusan PTN
                  </h2>
                </div>
                <p className="text-sm text-slate-600">
                  Pilih hingga 4 jurusan untuk membandingkan peluang kamu
                </p>
              </div>

              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <div className="flex items-center justify-between mb-4">
                  <TabsList className="bg-slate-100 flex-wrap h-auto p-1">
                    {Array.from({ length: choicesCount }).map((_, i) => (
                      <TabsTrigger key={i + 1} value={String(i + 1)} className="text-xs font-bold py-2">
                        Pilihan {i + 1}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                  {choicesCount < 4 && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setChoicesCount(prev => prev + 1)}
                      className="text-xs h-8 ml-2 whitespace-nowrap"
                    >
                      <Plus className="h-3 w-3 mr-1" /> Tab
                    </Button>
                  )}
                </div>

                {Array.from({ length: choicesCount }).map((_, i) => {
                  const choiceNum = String(i + 1);
                  const isDropdownOpen = isProdiOpen[choiceNum] || false;
                  const search = prodiSearch[choiceNum] || "";
                  const selectedId = selectedProdis[choiceNum] || "";

                  return (
                    <TabsContent key={choiceNum} value={choiceNum} className="mt-0">
                      <div className="space-y-3 relative">
                        <Label className="text-sm font-bold text-slate-900 flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">{choiceNum}</Badge>
                          Pilihan Ke-{choiceNum}
                        </Label>
                        
                        <button
                          type="button"
                          onClick={() => setIsProdiOpen({...isProdiOpen, [choiceNum]: !isDropdownOpen})}
                          className="w-full h-12 md:h-13 px-4 bg-white border-2 border-slate-300 rounded-xl text-xs md:text-sm font-bold text-slate-900 flex items-center justify-between hover:border-blue-500 hover:bg-blue-50 transition-colors touch-manipulation"
                          style={{ fontSize: '16px' }}
                        >
                          <div className="flex items-center gap-3 truncate">
                            <Building2 className="h-4 w-4 md:h-5 md:w-5 text-blue-500 shrink-0" />
                            <span className="truncate text-left">
                              {selectedId ? 
                                (() => {
                                  const p = allProdi.find(pr => String(pr.id) === selectedId);
                                  return p ? `${p.ptn_name} - ${p.nama_prodi}` : "Pilih PTN & Jurusan";
                                })()
                                : "Pilih PTN & Jurusan"
                              }
                            </span>
                          </div>
                          <ChevronDown className={`h-4 w-4 text-slate-400 shrink-0 transition-transform duration-200 ${isDropdownOpen ? "rotate-180" : ""}`} />
                        </button>

                        {isDropdownOpen && (
                          <div className="absolute left-0 right-0 mt-2 bg-white border-2 border-blue-300 shadow-2xl rounded-2xl p-3 flex flex-col gap-2 z-[100]" style={{ maxHeight: "420px" }}>
                            <div className="relative flex-shrink-0">
                              <Search className="h-4 w-4 text-blue-400 absolute left-3.5 top-3" />
                              <input
                                type="text"
                                value={search}
                                onChange={(e) => setProdiSearch({...prodiSearch, [choiceNum]: e.target.value})}
                                placeholder="Ketik PTN atau Jurusan..."
                                className="w-full h-10 pl-10 pr-3 text-base bg-blue-50 border border-blue-200 rounded-xl focus:outline-none focus:border-blue-500 font-medium text-slate-800 touch-manipulation"
                                style={{ fontSize: '16px' }}
                                autoFocus
                              />
                            </div>

                            <div className="overflow-y-auto space-y-1 pr-1 overscroll-contain" style={{ maxHeight: "300px" }}>
                              {allProdi
                                .filter(p => {
                                  if (!search) return true;
                                  const s = search.toLowerCase();
                                  return p.ptn_name.toLowerCase().includes(s) || 
                                         p.nama_prodi.toLowerCase().includes(s);
                                })
                                .slice(0, 100) // limit for performance
                                .map((p) => (
                                  <button
                                    key={p.id}
                                    type="button"
                                    onClick={() => {
                                      setSelectedProdis({...selectedProdis, [choiceNum]: String(p.id)});
                                      setIsProdiOpen({...isProdiOpen, [choiceNum]: false});
                                      setProdiSearch({...prodiSearch, [choiceNum]: ""});
                                    }}
                                    className={`w-full text-left px-3 md:px-4 py-3 rounded-xl text-xs font-bold flex items-center justify-between transition-colors touch-manipulation ${
                                      selectedId === String(p.id)
                                        ? "bg-blue-700 text-white"
                                        : "text-slate-800 hover:bg-blue-50 active:bg-blue-100"
                                    }`}
                                  >
                                    <div className="flex-1 min-w-0 pr-3">
                                      <div className="font-black text-xs md:text-sm leading-tight">{p.ptn_name}</div>
                                      <div className="text-[10px] md:text-xs opacity-80 mt-1 leading-tight">{p.nama_prodi}</div>
                                    </div>
                                    {selectedId === String(p.id) && <Check className="h-4 w-4 shrink-0" />}
                                  </button>
                                ))}
                            </div>
                          </div>
                        )}
                        {selectedId && (
                          <p className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            Tersimpan
                          </p>
                        )}
                      </div>
                    </TabsContent>
                  );
                })}
              </Tabs>
              
              <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <p className="text-xs text-amber-800 flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>
                    Pastikan sudah memilih jurusan PTN dan mengisi form di samping, lalu klik <strong>Hitung Peluang SNBP</strong> pada form.
                  </span>
                </p>
              </div>

            </Card>
          </div>
        </div>

        {Object.keys(results).length > 0 && (
          <div className="space-y-6 pt-6 border-t-2 border-slate-200">
            <Card className="p-6 bg-white text-center border-2 border-blue-200">
              <div className="flex items-center justify-center gap-2 mb-2">
                <CheckCircle2 className="h-6 w-6 text-emerald-600" />
                <h2 className="text-xl md:text-2xl font-black text-slate-900">
                  Hasil Analisis Peluang SNBP
                </h2>
              </div>
              <p className="text-sm text-slate-600">
                Berdasarkan data yang kamu input
              </p>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {Object.entries(results).map(([choiceNum, result]) => (
                <div key={choiceNum}>
                  {renderResultCard(result, choiceNum)}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
