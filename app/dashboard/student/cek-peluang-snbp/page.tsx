"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
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
  const [selectedProdi1Id, setSelectedProdi1Id] = useState<string>("");
  const [selectedProdi2Id, setSelectedProdi2Id] = useState<string>("");
  
  // Results for 2 choices
  const [result1, setResult1] = useState<PredictionResult | null>(null);
  const [result2, setResult2] = useState<PredictionResult | null>(null);
  
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
        
        // Check feature access using helper function (same as SNBT page)
        const accessCheck = hasFeatureAccess(subscription, "snbp");
        
        // Admins always have access
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

  // Calculate achievement bonus
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

  // Calculate booster contribution
  const calculateBoosterContribution = (data: SNBPData): number => {
    if (data.boosterSubjects.length === 0) return 0;
    
    const boosterAvg = data.boosterSubjects.reduce((sum, s) => 
      sum + parseFloat(s.value), 0) / data.boosterSubjects.length;
    
    const diff = boosterAvg - data.averageScore;
    return Math.max(0, diff * 0.05); // 5% weight
  };

  // Calculate accreditation bonus
  const calculateAccreditationBonus = (accreditation: string): number => {
    if (accreditation === "A (Unggul)") return 1;
    if (accreditation === "B (Baik Sekali)") return 0.5;
    return 0;
  };

  // Calculate prediction for a prodi
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
      recommendation = `Nilai ${finalScore.toFixed(1)} melampaui estimasi ${estimasi} sebesar +${diff.toFixed(1)}. Kamu berada di zona kompetisi aktif dengan ${prodi.peminat} peminat untuk ${prodi.daya_tampung} kursi (rasio ${prodi.rasio_keketatan.toFixed(2)}:1). ${boosterBonus > 0 ? `Booster score +${boosterBonus.toFixed(1)} membantu posisi kamu.` : ''}`;
    } else {
      status = "RENTAN";
      percentage = Math.max(25, Math.round(60 + diff * 4));
      recommendation = `Nilai ${finalScore.toFixed(1)} berjarak ${Math.abs(diff).toFixed(1)} poin di bawah estimasi ${estimasi}. Dengan keketatan ${prodi.rasio_keketatan.toFixed(2)}:1, pertimbangkan jurusan ini di pilihan ke-2 atau fokus tingkatkan nilai raport di semester 6. ${achievementBonus > 0 ? `Prestasi +${achievementBonus} poin sudah membantu, tapi tetap perlu boost nilai akademik.` : 'Prestasi akademik atau portofolio bisa jadi penentu.'}`;
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

  // Handle form calculation
  const handleCalculate = (data: SNBPData) => {
    setSNBPData(data);
    setLoading(true);
    
    setTimeout(() => {
      if (selectedProdi1Id) {
        const result = calculatePrediction(data, selectedProdi1Id);
        setResult1(result);
      }
      
      if (selectedProdi2Id) {
        const result = calculatePrediction(data, selectedProdi2Id);
        setResult2(result);
      }
      
      setLoading(false);
    }, 500);
  };

  // Render status badge
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

  // Render result card
  const renderResultCard = (result: PredictionResult | null, choiceNumber: number) => {
    if (!result) return null;

    const { prodiData, finalScore, status, percentage, boosterContribution, achievementBonus, accreditationBonus, recommendation } = result;

    return (
      <Card className={`p-5 md:p-6 border-2 ${
        status === "AMAN" ? "border-emerald-300 bg-emerald-50" :
        status === "BERSAING" ? "border-blue-300 bg-blue-50" :
        "border-amber-300 bg-amber-50"
      }`}>
        <div className="space-y-5">
          
          {/* ===== HEADER CARD ===== */}
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

          {/* ===== PROGRESS BAR ===== */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm font-semibold">
              <span className="text-slate-700">Peluang Kelulusan</span>
              <span className="text-xl font-black text-slate-900">{percentage}%</span>
            </div>
            <Progress value={percentage} className="h-4" />
          </div>

          {/* ===== NILAI COMPARISON ===== */}
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

          {/* ===== DETAIL KONTRIBUSI ===== */}
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

          {/* ===== STATISTIK JURUSAN ===== */}
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

          {/* ===== RASIONALISASI ===== */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border-2 border-blue-200">
            <p className="text-sm font-bold text-slate-900 mb-2 flex items-center gap-2">
              <Award className="h-4 w-4 text-blue-600" />
              Rasionalisasi & Rekomendasi
            </p>
            <p className="text-sm text-slate-700 leading-relaxed">
              {recommendation}
            </p>
          </div>
          
        </div>
      </Card>
    );
  };

  // Loading state
  if (isCheckingAccess) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  // No access
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
        
        {/* ===== SECTION: HEADER ===== */}
        <div className="space-y-4">
          <Link href="/dashboard/student">
            <Button variant="ghost" size="sm" className="h-9">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Kembali ke Dashboard
            </Button>
          </Link>
          
          <Card className="p-4 md:p-6 bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-0">
            <Badge className="bg-white/20 text-white border-white/30 mb-3">
              Kalkulator SNBP 2026
            </Badge>
            <h1 className="text-2xl md:text-3xl font-black">
              Cek Peluang SNBP
            </h1>
            <p className="text-sm md:text-base text-blue-50 mt-2">
              Hitung peluang kelulusan SNBP berdasarkan nilai raport, booster score, dan prestasi kamu
            </p>
          </Card>
        </div>

        {/* ===== SECTION: CALCULATOR FORM ===== */}
        <div>
          <SNBPCalculatorForm
            onCalculate={handleCalculate}
            initialScore={85}
          />
        </div>

        {/* ===== SECTION: PILIH JURUSAN (Only show after form filled) ===== */}
        {snbpData && (
          <Card className="p-4 md:p-6 bg-white">
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-2">
                <Building2 className="h-5 w-5 text-blue-600" />
                <h2 className="text-lg md:text-xl font-black text-slate-900">
                  Pilih 2 Jurusan PTN
                </h2>
              </div>
              <p className="text-sm text-slate-600">
                Pilih maksimal 2 jurusan untuk membandingkan peluang kamu
              </p>
            </div>

            <div className="space-y-4 mb-6">
              {/* Pilihan 1 */}
              <div className="space-y-2">
                <Label className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">1</Badge>
                  Pilihan Pertama <span className="text-rose-600">*</span>
                </Label>
                <div className="relative">
                  <select
                    value={selectedProdi1Id}
                    onChange={(e) => setSelectedProdi1Id(e.target.value)}
                    className="w-full h-12 pl-4 pr-10 border-2 border-slate-300 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white appearance-none cursor-pointer hover:border-blue-400 transition-colors"
                    style={{ fontSize: '14px' }}
                  >
                    <option value="">-- Pilih Universitas & Jurusan --</option>
                    {allProdi.map((p) => (
                      <option key={p.id} value={p.id} className="py-2">
                        {p.ptn_name.replace('UNIVERSITAS ', '').replace('INSTITUT TEKNOLOGI ', 'IT ')} — {p.nama_prodi}
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                    <svg className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
                {selectedProdi1Id && (
                  <p className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Pilihan 1 sudah dipilih
                  </p>
                )}
              </div>

              {/* Pilihan 2 */}
              <div className="space-y-2">
                <Label className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">2</Badge>
                  Pilihan Kedua <span className="text-rose-600">*</span>
                </Label>
                <div className="relative">
                  <select
                    value={selectedProdi2Id}
                    onChange={(e) => setSelectedProdi2Id(e.target.value)}
                    className="w-full h-12 pl-4 pr-10 border-2 border-slate-300 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white appearance-none cursor-pointer hover:border-blue-400 transition-colors"
                    style={{ fontSize: '14px' }}
                  >
                    <option value="">-- Pilih Universitas & Jurusan --</option>
                    {allProdi.map((p) => (
                      <option key={p.id} value={p.id} className="py-2">
                        {p.ptn_name.replace('UNIVERSITAS ', '').replace('INSTITUT TEKNOLOGI ', 'IT ')} — {p.nama_prodi}
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                    <svg className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
                {selectedProdi2Id && (
                  <p className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Pilihan 2 sudah dipilih
                  </p>
                )}
              </div>
            </div>

            <Button
              onClick={() => handleCalculate(snbpData)}
              disabled={!selectedProdi1Id || !selectedProdi2Id || loading}
              className="w-full h-14 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-base shadow-lg shadow-blue-600/30 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  Sedang Menghitung Peluang...
                </>
              ) : (
                <>
                  <Target className="h-5 w-5 mr-2" />
                  Hitung Peluang Kedua Pilihan
                </>
              )}
            </Button>
          </Card>
        )}

        {/* ===== SECTION: HASIL ANALISIS ===== */}
        {(result1 || result2) && (
          <div className="space-y-6">
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
              {result1 && renderResultCard(result1, 1)}
              {result2 && renderResultCard(result2, 2)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
