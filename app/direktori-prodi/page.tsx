"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Search,
  Building2,
  BookOpen,
  ArrowLeft,
  Target,
  X,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { MotionCard, StaggerContainer, StaggerItem } from "@/components/ui/fade-in";

interface ProdiRecord {
  id: string | number;
  // SNBT fields
  univ?: string;
  prodi?: string;
  jenjang?: string;
  kelompok?: string;
  keketatan?: number | string;
  passing_grade_est?: number | string;
  daya_tampung?: number;
  peminat?: number;
  ukt_min?: number;
  ukt_max?: number;
  // SNBP fields
  ptn_id?: string;
  ptn_name?: string;
  kategori?: string;
  kode_prodi?: string;
  nama_prodi?: string;
  rasio_keketatan?: number;
  nilai_raport?: number;
  estimasi_nilai_raport?: number;
  jenis_portofolio?: string;
}

// ---------------- UNIVERSITY DOMAIN MAPPING DICTIONARY ----------------
const UNIV_DOMAINS: Record<string, string> = {
  "UNIVERSITAS INDONESIA": "ui.ac.id",
  "INSTITUT TEKNOLOGI BANDUNG": "itb.ac.id",
  "UNIVERSITAS GADJAH MADA": "ugm.ac.id",
  "UNIVERSITAS BRAWIJAYA": "ub.ac.id",
  "UNIVERSITAS PADJADJARAN": "unpad.ac.id",
  "UNIVERSITAS DIPONEGORO": "undip.ac.id",
  "UNIVERSITAS AIRLANGGA": "unair.ac.id",
  "INSTITUT TEKNOLOGI SEPULUH NOPEMBER": "its.ac.id",
  "INSTITUT PERTANIAN BOGOR": "ipb.ac.id",
  "UNIVERSITAS SEBELAS MARET": "uns.ac.id",
  "UNIVERSITAS HASANUDDIN": "unhas.ac.id",
  "UNIVERSITAS SUMATERA UTARA": "usu.ac.id",
  "UNIVERSITAS ANDALAS": "unand.ac.id",
  "UNIVERSITAS SRIWIJAYA": "unsri.ac.id",
  "UNIVERSITAS PENDIDIKAN INDONESIA": "upi.edu",
  "UNIVERSITAS NEGERI MALANG": "um.ac.id",
  "UNIVERSITAS NEGERI YOGYAKARTA": "uny.ac.id",
  "UNIVERSITAS NEGERI SURABAYA": "unesa.ac.id",
  "UNIVERSITAS NEGERI JAKARTA": "unj.ac.id",
  "UNIVERSITAS NEGERI SEMARANG": "unnes.ac.id",
  "UNIVERSITAS SYIAH KUALA": "usk.ac.id",
  "UNIVERSITAS JEMBER": "unej.ac.id",
  "UNIVERSITAS UDAYANA": "unud.ac.id",
  "UNIVERSITAS MATARAM": "unram.ac.id",
  "UNIVERSITAS MULAWARMAN": "unmul.ac.id",
  "UNIVERSITAS LAMBUNG MANGKURAT": "ulm.ac.id",
  "UNIVERSITAS TANJUNGPURA": "untan.ac.id",
  "UNIVERSITAS RIAU": "unri.ac.id",
  "UNIVERSITAS BENGKULU": "unib.ac.id",
  "UNIVERSITAS LAMPUNG": "unila.ac.id",
  "UNIVERSITAS JENDERAL SOEDIRMAN": "unsoed.ac.id",
  "UPN VETERAN JAKARTA": "upnvj.ac.id",
  "UPN VETERAN YOGYAKARTA": "upnyk.ac.id",
  "UPN VETERAN JAWA TIMUR": "upnjatim.ac.id",
  "UNIVERSITAS NEGERI PADANG": "unp.ac.id",
  "UNIVERSITAS NEGERI MAKASSAR": "unm.ac.id",
  "UNIVERSITAS NEGERI MEDAN": "unimed.ac.id",
  "UNIVERSITAS HALU OLEO": "uho.ac.id",
  "UNIVERSITAS SAM RATULANGI": "unsrat.ac.id",
  "UNIVERSITAS TERBUKA": "ut.ac.id"
};

const getUnivDomain = (name?: string) => {
  if (!name) return null;
  const normalizedName = name.toUpperCase().trim();
  if (UNIV_DOMAINS[normalizedName]) return UNIV_DOMAINS[normalizedName];
  for (const [key, domain] of Object.entries(UNIV_DOMAINS)) {
    if (normalizedName.includes(key) || key.includes(normalizedName)) {
      return domain;
    }
  }
  return null;
};

const getInitials = (name?: string) => {
  if (!name) return "UN";
  const cleanName = name.toUpperCase().replace("UNIVERSITAS ", "").replace("INSTITUT ", "").trim();
  const words = cleanName.split(" ");
  if (words.length >= 2) {
    return (words[0][0] + words[1][0]).toUpperCase();
  }
  if (name.toUpperCase().includes("UNIVERSITAS")) return "U" + cleanName.charAt(0);
  if (name.toUpperCase().includes("INSTITUT")) return "I" + cleanName.charAt(0);
  return cleanName.substring(0, 2).toUpperCase();
};

export default function DirektoriProdiPage() {
  const [jalurType, setJalurType] = useState<"SNBT" | "SNBP">("SNBT"); // Tab selection
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedKelompok, setSelectedKelompok] = useState("ALL");
  const [selectedJenjang, setSelectedJenjang] = useState("ALL");

  const [suggestions, setSuggestions] = useState<ProdiRecord[]>([]);
  const [selectedProdi, setSelectedProdi] = useState<ProdiRecord | null>(null);
  
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  // Subscription & Quota states
  const [isSubscribed, setIsSubscribed] = useState<boolean>(false);
  const [userTier, setUserTier] = useState<string>("Basic");
  const [searchCount, setSearchCount] = useState<number>(0);
  const [maxFreeSearches] = useState<number>(3); // 3x free searches
  const [showUpgradeAlert, setShowUpgradeAlert] = useState<boolean>(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Auth guard + Subscription check
  useEffect(() => {
    async function checkAuthAndSubscription() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.push("/login?redirect=/direktori-prodi");
        return;
      }

      // Check subscription status
      const now = new Date().toISOString();
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

      // Check if admin
      const { data: profile } = await supabase
        .from("profiles")
        .select("role, directory_search_count")
        .eq("id", user.id)
        .maybeSingle();

      const isAdminUser = profile?.role === "admin";
      const count = profile?.directory_search_count ?? 0;

      setIsSubscribed(subscribed || isAdminUser);
      setUserTier(tier);
      setSearchCount(count);
    }
    
    checkAuthAndSubscription();
  }, [router]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Helper: Normalize text for better search matching
  const normalizeText = (text: string): string => {
    return text
      .toLowerCase()
      .trim()
      .replace(/\s+/g, ' ')
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  };

  // Helper: Get university aliases/abbreviations
  const getUnivAliases = (univName: string): string[] => {
    const aliases: string[] = [univName.toLowerCase()];
    const normalized = normalizeText(univName);
    
    // Common abbreviations mapping
    const abbrevMap: Record<string, string[]> = {
      'universitas indonesia': ['ui', 'univ indonesia'],
      'institut teknologi bandung': ['itb', 'teknologi bandung'],
      'universitas gadjah mada': ['ugm', 'gajah mada', 'gadjahmada'],
      'universitas brawijaya': ['ub', 'unibraw', 'brawijaya'],
      'universitas airlangga': ['unair', 'airlangga'],
      'universitas diponegoro': ['undip', 'diponegoro'],
      'universitas padjadjaran': ['unpad', 'padjadjaran'],
      'institut teknologi sepuluh nopember': ['its', 'sepuluh nopember'],
      'institut pertanian bogor': ['ipb', 'pertanian bogor'],
      'upn veteran yogyakarta': ['upn yogya', 'upn yogyakarta', 'upn yk', 'upn jogja', 'upn yogja', 'veteran yogyakarta', 'veteran yogya'],
      'upn veteran jakarta': ['upn jkt', 'upn jakarta', 'veteran jakarta'],
      'upn veteran jawa timur': ['upn jatim', 'upn surabaya', 'upn sby', 'veteran jatim'],
      'universitas sebelas maret': ['uns', 'sebelas maret'],
      'universitas hasanuddin': ['unhas', 'hasanuddin'],
      'universitas sumatera utara': ['usu', 'sumut'],
      'universitas negeri yogyakarta': ['uny', 'negeri yogyakarta'],
      'universitas negeri surabaya': ['unesa', 'negeri surabaya'],
      'universitas negeri malang': ['um', 'negeri malang'],
      'universitas negeri jakarta': ['unj', 'negeri jakarta'],
      'universitas negeri semarang': ['unnes', 'negeri semarang'],
    };
    
    // Find matching aliases
    for (const [key, values] of Object.entries(abbrevMap)) {
      if (normalized.includes(key)) {
        aliases.push(...values);
      }
    }
    
    return aliases;
  };

  // Helper: Calculate search relevance score (support both SNBT & SNBP)
  const getSearchScore = (item: ProdiRecord, searchTerms: string[]): number => {
    const prodiNorm = normalizeText(item.prodi || item.nama_prodi || '');
    const univNorm = normalizeText(item.univ || item.ptn_name || '');
    const jenjangNorm = normalizeText(item.jenjang || '');
    const kelompokNorm = normalizeText(item.kelompok || item.kategori || '');
    
    // Get university aliases
    const univAliases = getUnivAliases(item.univ || item.ptn_name || '');
    
    const fullText = `${prodiNorm} ${univNorm} ${jenjangNorm} ${kelompokNorm} ${univAliases.join(' ')}`;
    
    let score = 0;
    
    // Check each search term
    for (const term of searchTerms) {
      // Exact match in prodi = highest priority
      if (prodiNorm === term) score += 100;
      else if (prodiNorm.startsWith(term)) score += 80;
      else if (prodiNorm.includes(term)) score += 60;
      
      // Match in university name or aliases
      if (univNorm.includes(term)) score += 50;
      for (const alias of univAliases) {
        if (alias.includes(term) || term.includes(alias)) {
          score += 45;
          break;
        }
      }
      
      // Match in full text
      if (fullText.includes(term)) score += 20;
    }
    
    // Bonus if all terms found
    const allTermsFound = searchTerms.every(term => fullText.includes(term));
    if (allTermsFound) score += 50;
    
    return score;
  };

  // Fetch Autocomplete Suggestions — JSON lokal sebagai primary source (data verified)
  // Supabase RPC hanya sebagai fallback jika JSON gagal
  useEffect(() => {
    if (selectedProdi) {
      setShowDropdown(false);
      return;
    }

    if (searchQuery.trim().length < 2) {
      setSuggestions([]);
      setShowDropdown(false);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        let results: ProdiRecord[] = [];
        const searchNormalized = normalizeText(searchQuery);
        const searchTerms = searchNormalized.split(' ').filter(t => t.length > 0);

        // PRIMARY: Pilih JSON sesuai jalur type
        try {
          const jsonFile = jalurType === "SNBP" ? "/data_snbp.json" : "/data_snbt.json";
          const res = await fetch(jsonFile);
          if (res.ok) {
            const localData: ProdiRecord[] = await res.json();
            
            // Score and filter results
            const scoredResults = localData
              .map(item => ({
                item,
                score: getSearchScore(item, searchTerms)
              }))
              .filter(({ score }) => score > 0)
              .sort((a, b) => b.score - a.score)
              .map(({ item }) => item);
            
            results = scoredResults;
          }
        } catch {
          // JSON gagal → coba Supabase RPC hanya untuk SNBT
          if (jalurType === "SNBT") {
            try {
              const supabase = createClient();
              const { data, error } = await supabase.rpc("search_kampus_pintar", {
                keyword: searchQuery.trim(),
              });
              if (!error && data && data.length > 0) {
                results = data as ProdiRecord[];
              }
            } catch {
              // Supabase juga gagal — biarkan kosong
            }
          }
        }

        // Apply pre-filter constraints
        if (selectedKelompok !== "ALL") {
          results = results.filter((item) =>
            item.kelompok?.toUpperCase().includes(selectedKelompok) ||
            item.kategori?.toUpperCase().includes(selectedKelompok)
          );
        }
        if (selectedJenjang !== "ALL") {
          results = results.filter(
            (item) => item.jenjang?.toUpperCase() === selectedJenjang || item.jenjang?.toUpperCase().includes(selectedJenjang)
          );
        }

        // Increased limit from 15 to 50 for better search results
        setSuggestions(results.slice(0, 50));
        // Always show dropdown when searching (even if no results, to show "not found" message)
        setShowDropdown(true);
      } catch (err) {
        console.error("Error fetching suggestions:", err);
        setShowDropdown(true); // Show dropdown even on error
      } finally {
        setLoading(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [searchQuery, selectedKelompok, selectedJenjang, selectedProdi, jalurType]); // Tambah jalurType dependency

  const handleSelectSuggestion = async (item: ProdiRecord) => {
    // Check quota for non-subscribers
    if (!isSubscribed && searchCount >= maxFreeSearches) {
      setShowUpgradeAlert(true);
      return;
    }

    setSelectedProdi(item);
    setSearchQuery(`${item.prodi} - ${item.univ}`);
    setShowDropdown(false);

    // Increment search count for non-subscribers
    if (!isSubscribed) {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const newCount = searchCount + 1;
          await supabase
            .from("profiles")
            .update({ directory_search_count: newCount })
            .eq("id", user.id);
          setSearchCount(newCount);
        }
      } catch (err) {
        console.error("Error updating search count:", err);
      }
    }
  };

  const handleClearSelection = () => {
    setSelectedProdi(null);
    setSearchQuery("");
    setSuggestions([]);
    setShowDropdown(false);
  };

  // Helper: Highlight matching text
  const highlightMatch = (text: string, query: string): React.ReactNode => {
    if (!query.trim()) return text;
    
    const normalizedText = text.toLowerCase();
    const normalizedQuery = query.toLowerCase();
    const index = normalizedText.indexOf(normalizedQuery);
    
    if (index === -1) return text;
    
    return (
      <>
        {text.slice(0, index)}
        <span className="bg-yellow-100 text-yellow-900 font-bold">
          {text.slice(index, index + query.length)}
        </span>
        {text.slice(index + query.length)}
      </>
    );
  };

  const formatCurrency = (val?: number) => {
    if (!val) return "Rp 500.000";
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(val);
  };

  const formatKeketatan = (val?: number | string) => {
    if (val === undefined || val === null) return { num: 3.5, text: "3.50%", badge: "Kompetitif", color: "bg-amber-50 text-amber-700 border-amber-200" };
    let num = Number(val);
    if (num > 100) {
      num = num / 100;
    }
    const text = `${num.toFixed(2)}%`;
    if (num < 5.0) {
      return { num, text, badge: "Sangat Ketat", color: "bg-rose-50 text-rose-700 border-rose-200" };
    } else if (num <= 12.0) {
      return { num, text, badge: "Kompetitif", color: "bg-amber-50 text-amber-700 border-amber-200" };
    } else {
      return { num, text, badge: "Peluang Besar", color: "bg-emerald-50 text-emerald-700 border-emerald-200" };
    }
  };

  return (
    <div className="w-full min-h-screen bg-slate-50">
      <div className="max-w-2xl mx-auto px-4 py-4 md:py-6 space-y-4 md:space-y-6">
        {/* Header */}
        <div className="text-center space-y-1">
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-slate-950">
            Direktori Jurusan & Kampus PTN
          </h1>
          <p className="text-xs md:text-sm text-slate-500">
            Temukan informasi lengkap jalur SNBT & SNBP
          </p>
        </div>

        {/* Tab Selection: SNBT vs SNBP */}
        <div className="bg-white p-2 rounded-2xl border border-slate-200 shadow-sm flex gap-2">
          <button
            type="button"
            onClick={() => {
              setJalurType("SNBT");
              setSelectedProdi(null);
              setSearchQuery("");
              setSuggestions([]);
            }}
            className={`flex-1 h-11 rounded-xl font-bold text-sm transition-all touch-manipulation ${
              jalurType === "SNBT"
                ? "bg-blue-600 text-white shadow-md"
                : "bg-transparent text-slate-600 hover:bg-slate-50"
            }`}
          >
            📝 SNBT (Tes)
          </button>
          <button
            type="button"
            onClick={() => {
              setJalurType("SNBP");
              setSelectedProdi(null);
              setSearchQuery("");
              setSuggestions([]);
            }}
            className={`flex-1 h-11 rounded-xl font-bold text-sm transition-all touch-manipulation ${
              jalurType === "SNBP"
                ? "bg-emerald-600 text-white shadow-md"
                : "bg-transparent text-slate-600 hover:bg-slate-50"
            }`}
          >
            🎓 SNBP (Rapor)
          </button>
        </div>

        {/* CTA Box after tab selection (only show for SNBP) */}
        {jalurType === "SNBP" && (
          <div className="bg-gradient-to-br from-emerald-50 via-blue-50 to-purple-50 border-2 border-emerald-200 rounded-2xl p-4 shadow-lg">
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-emerald-100 rounded-xl shrink-0">
                  <Target className="h-6 w-6 text-emerald-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-base md:text-lg font-bold text-slate-900 mb-1">
                    Cek Peluang Lolos SNBP 2026!
                  </h3>
                  <p className="text-xs md:text-sm text-slate-600 mb-3">
                    Hitung estimasi peluang lolos ke jurusan impian berdasarkan nilai rapor, rasio keketatan, dan daya tampung real 2025. Data 5.100+ jurusan PTN!
                  </p>
                  <Link href="/dashboard/student/cek-peluang?type=snbp">
                    <Button className="h-10 md:h-11 px-5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold rounded-xl text-sm md:text-base w-full sm:w-auto touch-manipulation shadow-md">
                      🎯 Cek Peluang SNBP Sekarang
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Info Banner berdasarkan jalur */}
        <div className={`border rounded-2xl p-4 ${
          jalurType === "SNBP" 
            ? "bg-emerald-50 border-emerald-200" 
            : "bg-blue-50 border-blue-200"
        }`}>
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl shrink-0 ${
              jalurType === "SNBP" ? "bg-emerald-100" : "bg-blue-100"
            }`}>
              <BookOpen className={`h-5 w-5 ${
                jalurType === "SNBP" ? "text-emerald-600" : "text-blue-600"
              }`} />
            </div>
            <div className="flex-1 min-w-0">
              <p className={`text-sm font-bold mb-0.5 ${
                jalurType === "SNBP" ? "text-emerald-900" : "text-blue-900"
              }`}>
                {jalurType === "SNBP" 
                  ? "Data SNBP 2025 (Jalur Rapor)" 
                  : "Database SNBT 2025 (Jalur Tes)"}
              </p>
              <p className={`text-xs ${
                jalurType === "SNBP" ? "text-emerald-600" : "text-blue-600"
              }`}>
                {jalurType === "SNBP"
                  ? "5.100+ jurusan dengan data keketatan, daya tampung & estimasi nilai rapor"
                  : "4.900+ jurusan dengan passing grade & keketatan real"}
              </p>
            </div>
          </div>
        </div>

        {/* Quota Display Banner */}
        {!isSubscribed && (
          <div className={`border rounded-2xl p-4 ${
            searchCount >= maxFreeSearches 
              ? "bg-rose-50 border-rose-200" 
              : jalurType === "SNBP" ? "bg-emerald-50 border-emerald-200" : "bg-blue-50 border-blue-200"
          }`}>
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-xl ${
                  searchCount >= maxFreeSearches 
                    ? "bg-rose-100" 
                    : jalurType === "SNBP" ? "bg-emerald-100" : "bg-blue-100"
                }`}>
                  <Search className={`h-5 w-5 ${
                    searchCount >= maxFreeSearches 
                      ? "text-rose-600" 
                      : jalurType === "SNBP" ? "text-emerald-600" : "text-blue-600"
                  }`} />
                </div>
                <div>
                  <p className={`text-sm font-bold ${
                    searchCount >= maxFreeSearches 
                      ? "text-rose-900" 
                      : jalurType === "SNBP" ? "text-emerald-900" : "text-blue-900"
                  }`}>
                    {searchCount >= maxFreeSearches 
                      ? "Quota Gratis Habis!" 
                      : `Sisa ${maxFreeSearches - searchCount}x Pencarian Gratis`}
                  </p>
                  <p className={`text-xs ${
                    searchCount >= maxFreeSearches 
                      ? "text-rose-600" 
                      : jalurType === "SNBP" ? "text-emerald-600" : "text-blue-600"
                  }`}>
                    {searchCount >= maxFreeSearches 
                      ? `Upgrade ke Premium untuk unlimited akses direktori ${jalurType}` 
                      : `Akses data lengkap ${jalurType === "SNBP" ? "5.100+" : "4.900+"} jurusan`}
                  </p>
                </div>
              </div>
              {searchCount >= maxFreeSearches && (
                <Link href="/pricing">
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl h-10 px-6 shrink-0 touch-manipulation">
                    Upgrade Sekarang
                  </Button>
                </Link>
              )}
            </div>
          </div>
        )}

        {/* Upgrade Alert Modal */}
        {showUpgradeAlert && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4" onClick={() => setShowUpgradeAlert(false)}>
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-4" onClick={(e) => e.stopPropagation()}>
              <div className="text-center space-y-2">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-rose-100 mb-2">
                  <Target className="h-7 w-7 text-rose-600" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">
                  Quota Pencarian Habis
                </h3>
                <p className="text-sm text-slate-600">
                  Kamu sudah menggunakan {maxFreeSearches}x pencarian gratis. Upgrade ke paket Premium untuk unlimited akses direktori PTN!
                </p>
              </div>

              <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                <p className="text-xs font-bold text-blue-900 mb-2">✨ Keuntungan Premium:</p>
                <ul className="text-xs text-blue-700 space-y-1">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 shrink-0">✓</span>
                    <span>Unlimited pencarian direktori jurusan & PTN</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 shrink-0">✓</span>
                    <span>Akses data lengkap 4.900+ jurusan</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 shrink-0">✓</span>
                    <span>Unlimited cek peluang kelulusan PTN</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 shrink-0">✓</span>
                    <span>Try-out SNBT premium & pembahasan detail</span>
                  </li>
                </ul>
              </div>

              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => setShowUpgradeAlert(false)}
                  className="flex-1 rounded-xl h-11 font-bold touch-manipulation"
                >
                  Nanti Saja
                </Button>
                <Link href="/pricing" className="flex-1">
                  <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl h-11 gap-2 touch-manipulation">
                    <Target className="h-4 w-4" />
                    Lihat Paket
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Search Container */}
        <div ref={containerRef} className="relative w-full space-y-3">
          {/* Search Input */}
          <div className="bg-white p-3 rounded-xl md:rounded-2xl border border-slate-200 shadow-sm relative flex items-center">
            <Search className="absolute left-4 h-4 w-4 text-slate-400 pointer-events-none" />
            <Input
              type="search"
              inputMode="search"
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck="false"
              placeholder="Ketik nama jurusan atau universitas..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                if (selectedProdi) setSelectedProdi(null);
              }}
              onFocus={() => {
                if (suggestions.length > 0 && !selectedProdi) setShowDropdown(true);
              }}
              className="pl-10 pr-10 h-10 md:h-11 bg-transparent border-none text-sm font-medium focus-visible:ring-0 shadow-none text-slate-900 placeholder:text-slate-400 w-full"
              style={{ fontSize: '16px' }} // Prevent zoom on iOS
            />
            {searchQuery && (
              <button
                onClick={handleClearSelection}
                type="button"
                className="absolute right-3 text-slate-400 hover:text-slate-600 transition-colors p-1.5 touch-manipulation"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Filter Chips */}
          <div className="flex flex-wrap items-center gap-2 justify-center">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Filter:</span>
            
            {/* Kelompok Chips - berubah untuk SNBP */}
            {jalurType === "SNBP" ? (
              // SNBP menggunakan "kategori" bukan "kelompok"
              <>
                {[
                  { id: "ALL", label: "Semua" },
                  { id: "AKADEMIK", label: "Akademik" },
                  { id: "VOKASI", label: "Vokasi" },
                ].map((chip) => (
                  <button
                    key={chip.id}
                    type="button"
                    onClick={() => {
                      setSelectedKelompok(chip.id);
                      if (selectedProdi) setSelectedProdi(null);
                    }}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all touch-manipulation ${
                      selectedKelompok === chip.id
                        ? "bg-emerald-600 text-white shadow-sm"
                        : "bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    {chip.label}
                  </button>
                ))}
              </>
            ) : (
              // SNBT menggunakan "kelompok"
              <>
                {[
                  { id: "ALL", label: "Semua" },
                  { id: "SAINTEK", label: "Saintek" },
                  { id: "SOSHUM", label: "Soshum" },
                ].map((chip) => (
                  <button
                    key={chip.id}
                    type="button"
                    onClick={() => {
                      setSelectedKelompok(chip.id);
                      if (selectedProdi) setSelectedProdi(null);
                    }}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all touch-manipulation ${
                      selectedKelompok === chip.id
                        ? "bg-blue-600 text-white shadow-sm"
                        : "bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    {chip.label}
                  </button>
                ))}
              </>
            )}

            <span className="text-slate-300 text-xs">|</span>

            {/* Jenjang Chips */}
            {[
              { id: "ALL", label: "Semua" },
              { id: "S1", label: "S1" },
              { id: "D4", label: "D4" },
              { id: "D3", label: "D3" },
            ].map((chip) => (
              <button
                key={chip.id}
                type="button"
                onClick={() => {
                  setSelectedJenjang(chip.id);
                  if (selectedProdi) setSelectedProdi(null);
                }}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all touch-manipulation ${
                  selectedJenjang === chip.id
                    ? "bg-slate-900 text-white shadow-sm"
                    : "bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100"
                }`}
              >
                {chip.label}
              </button>
            ))}
          </div>

          {/* Dropdown Suggestions - FIXED SCROLLING & BETTER NO RESULTS MESSAGE */}
          {showDropdown && !selectedProdi && (
            <div className="fixed inset-x-0 md:absolute md:inset-x-auto md:left-0 md:right-0 top-auto bottom-0 md:bottom-auto md:top-full md:mt-2 bg-white border-t md:border md:border-slate-200 md:rounded-2xl shadow-2xl z-50 max-h-[50vh] md:max-h-[60vh] overflow-hidden flex flex-col">
              {/* Results counter header */}
              {!loading && suggestions.length > 0 && (
                <div className="px-4 py-2 border-b border-slate-100 bg-blue-50 flex items-center justify-between flex-shrink-0">
                  <span className="text-[11px] font-bold text-blue-700">
                    {suggestions.length} jurusan ditemukan
                  </span>
                  <span className="text-[10px] text-blue-500">
                    Diurutkan berdasarkan relevansi
                  </span>
                </div>
              )}

              <div className="overflow-y-auto overscroll-contain divide-y divide-slate-100" style={{ WebkitOverflowScrolling: 'touch' }}>
                {loading ? (
                  <div className="flex items-center justify-center p-6 space-x-2 text-slate-500 text-xs font-medium">
                    <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                    <span>Mencari data jurusan...</span>
                  </div>
                ) : suggestions.length === 0 ? (
                  <div className="p-6 space-y-3">
                    <div className="text-center space-y-2">
                      <Search className="h-8 w-8 text-slate-300 mx-auto" />
                      <p className="text-sm font-bold text-slate-700">
                        Tidak ada hasil untuk "{searchQuery}"
                      </p>
                      <p className="text-xs text-slate-500">
                        Coba kata kunci lain atau periksa ejaan
                      </p>
                    </div>
                    
                    {/* Search tips */}
                    <div className="bg-blue-50 rounded-xl p-3 space-y-2 border border-blue-100">
                      <p className="text-[11px] font-bold text-blue-700 mb-1">Tips Pencarian:</p>
                      <ul className="text-[10px] text-slate-600 space-y-1">
                        <li className="flex items-start gap-2">
                          <span className="text-blue-600 shrink-0">•</span>
                          <span>Coba singkatan: <strong>UI</strong>, <strong>ITB</strong>, <strong>UGM</strong></span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-blue-600 shrink-0">•</span>
                          <span>Gunakan nama lengkap: <strong>Teknik Informatika</strong></span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-blue-600 shrink-0">•</span>
                          <span>Kombinasi kata: <strong>teknik UI</strong>, <strong>kedokteran UGM</strong></span>
                        </li>
                      </ul>
                    </div>
                  </div>
                ) : (
                  suggestions.map((item) => {
                    const univName = item.univ || item.ptn_name || '';
                    const prodiName = item.prodi || item.nama_prodi || '';
                    const domain = getUnivDomain(univName);
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => handleSelectSuggestion(item)}
                        className="w-full text-left p-4 hover:bg-blue-50 active:bg-blue-100 transition-colors flex items-center justify-between touch-manipulation"
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <Avatar className="h-10 w-10 rounded-xl border border-slate-200 shrink-0">
                            <AvatarImage
                              src={domain ? `https://logo.clearbit.com/${domain}` : undefined}
                              alt={univName}
                            />
                            <AvatarFallback className="bg-blue-600 text-white font-bold text-xs">
                              {getInitials(univName)}
                            </AvatarFallback>
                          </Avatar>

                          <div className="space-y-1 flex-1 min-w-0">
                            <p className="text-sm font-bold text-slate-900 leading-tight truncate">
                              {highlightMatch(prodiName, searchQuery)}
                            </p>
                            <p className="text-xs text-slate-500 font-medium truncate">
                              {highlightMatch(item.univ, searchQuery)}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 ml-2 shrink-0">
                          <Badge variant="outline" className="bg-slate-50 text-slate-700 border-slate-200 text-[10px] font-bold px-1.5 py-0.5">
                            {item.jenjang || "S1"}
                          </Badge>
                          <Badge variant="outline" className={`text-[10px] font-bold px-1.5 py-0.5 ${
                            item.kelompok?.toLowerCase().includes("saintek")
                              ? "bg-blue-50 text-blue-700 border-blue-200"
                              : "bg-blue-50 text-blue-700 border-blue-200"
                          }`}>
                            {item.kelompok || "Saintek"}
                          </Badge>
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>

        {/* Detail Card or Empty State */}
        {selectedProdi ? (
          <Card className="bg-white border border-slate-200 shadow-md rounded-xl md:rounded-2xl p-4 md:p-6 space-y-4 md:space-y-5">
            {/* Header */}
            <div className="flex items-start gap-3 border-b border-slate-100 pb-4">
              <Avatar className="h-12 w-12 md:h-14 md:w-14 rounded-xl border border-slate-200 shrink-0">
                <AvatarImage
                  src={getUnivDomain(selectedProdi.univ) ? `https://logo.clearbit.com/${getUnivDomain(selectedProdi.univ)}` : undefined}
                  alt={selectedProdi.univ}
                />
                <AvatarFallback className="bg-blue-600 text-white font-black text-sm">
                  {getInitials(selectedProdi.univ)}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 min-w-0 space-y-1">
                <span className="text-[11px] font-bold text-blue-600 uppercase tracking-wider block">
                  {selectedProdi.univ}
                </span>
                <h2 className="text-base md:text-xl font-black text-slate-950 tracking-tight leading-tight">
                  {selectedProdi.prodi}
                </h2>
                <div className="flex items-center gap-1.5 mt-1">
                  <Badge variant="outline" className="bg-slate-50 text-slate-700 border-slate-200 text-[10px] font-bold px-2 py-0.5">
                    {selectedProdi.jenjang || "S1"}
                  </Badge>
                  <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 text-[10px] font-bold px-2 py-0.5">
                    {selectedProdi.kelompok || "Saintek"}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-3 md:gap-4">
              {/* Passing Grade */}
              <div className="bg-slate-50 p-3 md:p-4 rounded-xl border border-slate-100 space-y-1">
                <p className="text-[10px] font-bold uppercase text-blue-600 tracking-wider">Passing Grade</p>
                <p className="text-lg md:text-xl font-extrabold text-slate-900">
                  {selectedProdi.passing_grade_est
                    ? Number(selectedProdi.passing_grade_est).toLocaleString("id-ID")
                    : "-"}
                </p>
                <p className="text-[10px] text-slate-500 font-semibold">UTBK SNBT</p>
              </div>

              {/* Keketatan */}
              {(() => {
                const kInfo = formatKeketatan(selectedProdi.keketatan);
                return (
                  <div className="bg-slate-50 p-3 md:p-4 rounded-xl border border-slate-100 space-y-1">
                    <p className="text-[10px] font-bold uppercase text-blue-600 tracking-wider">Keketatan</p>
                    <p className="text-lg md:text-xl font-extrabold text-slate-900">{kInfo.text}</p>
                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 text-[9px] font-bold px-1.5 py-0.5">
                      {kInfo.badge}
                    </Badge>
                  </div>
                );
              })()}

              {/* Kuota */}
              <div className="bg-slate-50 p-3 md:p-4 rounded-xl border border-slate-100 space-y-1">
                <p className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Kuota / Peminat</p>
                <p className="text-base md:text-lg font-extrabold text-slate-900">
                  {selectedProdi.daya_tampung || 60} <span className="text-[10px] font-normal text-slate-400">/ {selectedProdi.peminat || 1200}</span>
                </p>
                <p className="text-[10px] text-slate-500 font-medium">Daya Tampung</p>
              </div>

              {/* UKT */}
              <div className="bg-slate-50 p-3 md:p-4 rounded-xl border border-slate-100 space-y-1">
                <p className="text-[10px] font-bold uppercase text-blue-600 tracking-wider">UKT Maksimal</p>
                <p className="text-sm md:text-base font-extrabold text-slate-900 truncate">
                  {formatCurrency(selectedProdi.ukt_max)}
                </p>
                <p className="text-[10px] text-blue-700 font-semibold">Per Semester</p>
              </div>
            </div>

            {/* Footer */}
            <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
              <span className="text-[11px] text-slate-400 font-semibold flex items-center gap-1">
                <CheckCircle2 className="h-3.5 w-3.5 text-blue-600" />
                <span>Verified Data SNBT</span>
              </span>

              <Link href="/dashboard/student/cek-peluang" className="w-full sm:w-auto">
                <Button className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl h-10 px-5 gap-2 text-xs touch-manipulation">
                  <Target className="h-4 w-4" />
                  <span>Cek Peluang Kelulusan</span>
                </Button>
              </Link>
            </div>
          </Card>
        ) : (
          <div className="bg-white border border-slate-200 rounded-xl md:rounded-2xl p-8 md:p-10 text-center space-y-2">
            <BookOpen className="h-8 w-8 text-slate-300 mx-auto" />
            <p className="text-xs md:text-sm font-bold text-slate-700">Mulai Pencarian Jurusan & Kampus</p>
            <p className="text-[11px] md:text-xs text-slate-400 max-w-xs mx-auto leading-relaxed">
              Ketik kata kunci nama jurusan atau universitas pada kolom di atas.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
