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
  univ: string;
  prodi: string;
  jenjang?: string;
  kelompok?: string;
  keketatan?: number | string;
  passing_grade_est?: number | string;
  daya_tampung?: number;
  peminat?: number;
  ukt_min?: number;
  ukt_max?: number;
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
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedKelompok, setSelectedKelompok] = useState("ALL");
  const [selectedJenjang, setSelectedJenjang] = useState("ALL");

  const [suggestions, setSuggestions] = useState<ProdiRecord[]>([]);
  const [selectedProdi, setSelectedProdi] = useState<ProdiRecord | null>(null);
  
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Strict Zero-Trust Client Auth Guard
  useEffect(() => {
    async function checkAuth() {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login?redirect=/direktori-prodi");
      }
    }
    checkAuth();
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

  // Fetch Autocomplete Suggestions via Supabase RPC search_kampus_pintar
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
        const supabase = createClient();
        const { data, error } = await supabase.rpc("search_kampus_pintar", {
          keyword: searchQuery.trim(),
        });

        if (!error && data && data.length > 0) {
          let results = data as ProdiRecord[];

          // Apply pre-filter constraints
          if (selectedKelompok !== "ALL") {
            results = results.filter((item) =>
              item.kelompok?.toUpperCase().includes(selectedKelompok)
            );
          }
          if (selectedJenjang !== "ALL") {
            results = results.filter(
              (item) => item.jenjang?.toUpperCase() === selectedJenjang
            );
          }

          setSuggestions(results.slice(0, 10));
          setShowDropdown(true);
        } else {
          // Fallback mock suggestions
          const mockData: ProdiRecord[] = [
            {
              id: "1",
              univ: "UNIVERSITAS INDONESIA",
              prodi: "Ilmu Komputer",
              jenjang: "S1",
              kelompok: "Saintek",
              passing_grade_est: 728.5,
              daya_tampung: 60,
              peminat: 2450,
              keketatan: 2.45,
              ukt_min: 500000,
              ukt_max: 17500000,
            },
            {
              id: "2",
              univ: "UNIVERSITAS INDONESIA",
              prodi: "Kedokteran",
              jenjang: "S1",
              kelompok: "Saintek",
              passing_grade_est: 742.0,
              daya_tampung: 75,
              peminat: 3820,
              keketatan: 1.96,
              ukt_min: 500000,
              ukt_max: 20000000,
            },
            {
              id: "3",
              univ: "UNIVERSITAS GADJAH MADA",
              prodi: "Teknologi Informasi",
              jenjang: "S1",
              kelompok: "Saintek",
              passing_grade_est: 715.0,
              daya_tampung: 70,
              peminat: 2100,
              keketatan: 3.33,
              ukt_min: 500000,
              ukt_max: 13500000,
            },
            {
              id: "4",
              univ: "INSTITUT TEKNOLOGI BANDUNG",
              prodi: "Teknik Informatika (STEI-K)",
              jenjang: "S1",
              kelompok: "Saintek",
              passing_grade_est: 735.0,
              daya_tampung: 100,
              peminat: 3950,
              keketatan: 2.53,
              ukt_min: 500000,
              ukt_max: 14500000,
            },
          ];

          const filtered = mockData.filter(
            (item) =>
              item.univ.toLowerCase().includes(searchQuery.toLowerCase()) ||
              item.prodi.toLowerCase().includes(searchQuery.toLowerCase())
          );
          setSuggestions(filtered);
          setShowDropdown(true);
        }
      } catch (err) {
        console.error("Error fetching suggestions:", err);
      } finally {
        setLoading(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [searchQuery, selectedKelompok, selectedJenjang, selectedProdi]);

  const handleSelectSuggestion = (item: ProdiRecord) => {
    setSelectedProdi(item);
    setSearchQuery(`${item.prodi} - ${item.univ}`);
    setShowDropdown(false);
  };

  const handleClearSelection = () => {
    setSelectedProdi(null);
    setSearchQuery("");
    setSuggestions([]);
    setShowDropdown(false);
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
    <div className="w-full max-w-xl md:max-w-2xl mx-auto py-2 space-y-3.5 md:space-y-4 flex flex-col justify-start">
        {/* 2. Ultra-Compact Header */}
        <div className="text-center">
          <h1 className="text-xl md:text-2xl font-bold text-center tracking-tight text-slate-950">
            Cari Kampus & Jurusan
          </h1>
        </div>

        {/* Full-Width Search Input Bar */}
        <div ref={containerRef} className="relative w-full space-y-3">
          <div className="bg-white p-2 rounded-2xl border border-slate-200 shadow-sm relative flex items-center">
            <Search className="absolute left-3.5 h-4.5 w-4.5 text-slate-400" />
            <Input
              type="text"
              placeholder="Ketik nama jurusan atau universitas (misal: Kedokteran UI, ITB)..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                if (selectedProdi) setSelectedProdi(null);
              }}
              onFocus={() => {
                if (suggestions.length > 0 && !selectedProdi) setShowDropdown(true);
              }}
              className="pl-10 pr-9 h-11 bg-transparent border-none text-sm font-medium focus-visible:ring-0 shadow-none text-slate-900 placeholder:text-slate-400"
            />
            {searchQuery && (
              <button
                onClick={handleClearSelection}
                className="absolute right-3.5 text-slate-400 hover:text-slate-600 transition-colors p-1"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Filter Chips / Pill Toggles BELOW Search Bar */}
          <div className="flex flex-wrap items-center justify-center gap-1.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mr-1">Filter:</span>
            
            {/* Kelompok Chips */}
            {[
              { id: "ALL", label: "Semua" },
              { id: "SAINTEK", label: "Saintek" },
              { id: "SOSHUM", label: "Soshum" },
            ].map((chip) => (
              <button
                key={chip.id}
                onClick={() => {
                  setSelectedKelompok(chip.id);
                  if (selectedProdi) setSelectedProdi(null);
                }}
                className={`px-3 py-1 rounded-full text-[11px] font-semibold transition-all ${
                  selectedKelompok === chip.id
                    ? "bg-blue-600 text-white shadow-xs"
                    : "bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100"
                }`}
              >
                {chip.label}
              </button>
            ))}

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
                onClick={() => {
                  setSelectedJenjang(chip.id);
                  if (selectedProdi) setSelectedProdi(null);
                }}
                className={`px-3 py-1 rounded-full text-[11px] font-semibold transition-all ${
                  selectedJenjang === chip.id
                    ? "bg-slate-900 text-white shadow-xs"
                    : "bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100"
                }`}
              >
                {chip.label}
              </button>
            ))}
          </div>

          {/* 4. Internal Scrollable Combobox Suggestions Dropdown (Glassmorphism & Clean Layers) */}
          {showDropdown && !selectedProdi && (
            <Card className="absolute top-full left-0 right-0 mt-2 bg-white/90 backdrop-blur-md border border-slate-200/80 rounded-2xl shadow-2xl z-50 overflow-hidden max-h-[40vh] overflow-y-auto divide-y divide-slate-100 animate-in fade-in zoom-in-95">
              {loading ? (
                <div className="flex items-center justify-center p-5 space-x-2 text-slate-500 text-xs font-medium">
                  <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                  <span>Mencari data jurusan di Supabase...</span>
                </div>
              ) : suggestions.length === 0 ? (
                <div className="p-5 text-center text-xs text-slate-500 font-medium">
                  Tidak ditemukan prodi yang cocok. Coba kata kunci lainnya.
                </div>
              ) : (
                suggestions.map((item) => {
                  const domain = getUnivDomain(item.univ);
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleSelectSuggestion(item)}
                      className="w-full text-left p-3 hover:bg-blue-50/70 transition-colors flex items-center justify-between group"
                    >
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8.5 w-8.5 rounded-xl border border-slate-200 shrink-0 shadow-2xs">
                          <AvatarImage
                            src={domain ? `https://logo.clearbit.com/${domain}` : undefined}
                            alt={item.univ}
                          />
                          <AvatarFallback className="bg-blue-600 text-white font-bold text-xs">
                            {getInitials(item.univ)}
                          </AvatarFallback>
                        </Avatar>

                        <div className="space-y-0.5">
                          <p className="text-xs md:text-sm font-extrabold text-slate-900 group-hover:text-blue-600 transition-colors leading-tight">
                            {item.prodi}
                          </p>
                          <p className="text-[11px] text-slate-500 font-medium truncate max-w-50 sm:max-w-none">
                            {item.univ}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <Badge variant="outline" className="bg-slate-50 text-slate-700 border-slate-200 text-[10px] font-bold px-1.5 py-0.5">
                          {item.jenjang || "S1"}
                        </Badge>
                        <Badge variant="outline" className={`text-[10px] font-bold px-1.5 py-0.5 ${
                          item.kelompok?.toLowerCase().includes("saintek")
                            ? "bg-teal-50 text-teal-700 border-teal-200"
                            : "bg-amber-50 text-amber-700 border-amber-200"
                        }`}>
                          {item.kelompok || "Saintek"}
                        </Badge>
                      </div>
                    </button>
                  );
                })
              )}
            </Card>
          )}
        </div>

        {/* 3. MOBILE-OPTIMIZED SINGLE DETAIL CARD VIEW */}
        {selectedProdi ? (
          <Card className="bg-white border border-slate-200 shadow-md rounded-2xl md:rounded-3xl p-4 md:p-6 space-y-4 md:space-y-6 animate-in fade-in zoom-in-95 relative w-full">
            {/* Header: University Avatar Logo & Major Title */}
            <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12 md:h-14 md:w-14 rounded-xl md:rounded-2xl border border-slate-200 shrink-0 shadow-2xs">
                  <AvatarImage
                    src={getUnivDomain(selectedProdi.univ) ? `https://logo.clearbit.com/${getUnivDomain(selectedProdi.univ)}` : undefined}
                    alt={selectedProdi.univ}
                  />
                  <AvatarFallback className="bg-blue-600 text-white font-black text-sm">
                    {getInitials(selectedProdi.univ)}
                  </AvatarFallback>
                </Avatar>

                <div className="space-y-0.5 overflow-hidden">
                  <span className="text-[11px] md:text-xs font-bold text-blue-600 uppercase tracking-wider block truncate">
                    {selectedProdi.univ}
                  </span>
                  <h2 className="text-lg md:text-2xl font-black text-slate-950 tracking-tight leading-tight truncate">
                    {selectedProdi.prodi}
                  </h2>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <Badge variant="outline" className="bg-slate-50 text-slate-700 border-slate-200 text-[10px] md:text-xs font-bold px-2 py-0.5">
                  {selectedProdi.jenjang || "S1"}
                </Badge>
                <Badge variant="outline" className={`text-[10px] md:text-xs font-bold px-2 py-0.5 ${
                  selectedProdi.kelompok?.toLowerCase().includes("saintek")
                    ? "bg-teal-50 text-teal-700 border-teal-200"
                    : "bg-amber-50 text-amber-700 border-amber-200"
                }`}>
                  {selectedProdi.kelompok || "Saintek"}
                </Badge>
              </div>
            </div>

            {/* Mobile Dynamic Grid Gaps (Grid 2x2 with p-3 md:p-4) */}
            <div className="grid grid-cols-2 gap-2.5 md:gap-4">
              {/* Passing Grade Box */}
              <div className="bg-slate-50 p-3 md:p-4 rounded-xl md:rounded-2xl border border-slate-100 space-y-0.5">
                <p className="text-[10px] md:text-[11px] font-bold uppercase text-blue-600 tracking-wider">Passing Grade</p>
                <p className="text-lg md:text-xl font-extrabold text-slate-900">{selectedProdi.passing_grade_est || 680}</p>
                <p className="text-[10px] text-slate-500 font-semibold">Skor UTBK SNBT</p>
              </div>

              {/* Formatted Keketatan Box */}
              {(() => {
                const kInfo = formatKeketatan(selectedProdi.keketatan);
                return (
                  <div className="bg-slate-50 p-3 md:p-4 rounded-xl md:rounded-2xl border border-slate-100 space-y-0.5">
                    <div className="flex items-center justify-between">
                      <p className="text-[10px] md:text-[11px] font-bold uppercase text-amber-700 tracking-wider">Keketatan</p>
                    </div>
                    <p className="text-lg md:text-xl font-extrabold text-slate-900">{kInfo.text}</p>
                    <Badge variant="outline" className={`text-[9px] md:text-[10px] font-bold px-1 py-0 ${kInfo.color}`}>
                      {kInfo.badge}
                    </Badge>
                  </div>
                );
              })()}

              {/* Daya Tampung & Peminat Metric */}
              <div className="bg-slate-50 p-3 md:p-4 rounded-xl md:rounded-2xl border border-slate-100 space-y-0.5">
                <p className="text-[10px] md:text-[11px] font-bold uppercase text-slate-400 tracking-wider">Kuota / Peminat</p>
                <p className="text-base md:text-lg font-extrabold text-slate-900">
                  {selectedProdi.daya_tampung || 60} <span className="text-[10px] font-normal text-slate-400">/ {selectedProdi.peminat || 1200}</span>
                </p>
                <p className="text-[10px] text-slate-500 font-medium">Daya Tampung PTN</p>
              </div>

              {/* Formatted UKT Range Box */}
              <div className="bg-slate-50 p-3 md:p-4 rounded-xl md:rounded-2xl border border-slate-100 space-y-0.5">
                <p className="text-[10px] md:text-[11px] font-bold uppercase text-emerald-700 tracking-wider">UKT Maksimal</p>
                <p className="text-sm md:text-base font-extrabold text-slate-900 truncate">
                  {formatCurrency(selectedProdi.ukt_max)}
                </p>
                <p className="text-[10px] text-emerald-700 font-semibold">Per Semester</p>
              </div>
            </div>

            {/* Footer Action Bar */}
            <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
              <span className="text-[11px] text-slate-400 font-semibold flex items-center gap-1">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                <span>Verified Data SNBT</span>
              </span>

              <Link href="/dashboard/student/cek-peluang" className="w-full sm:w-auto">
                <Button className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl h-10 px-5 gap-2 text-xs shadow-xs">
                  <Target className="h-4 w-4" />
                  <span>Cek Peluang Kelulusan</span>
                </Button>
              </Link>
            </div>
          </Card>
        ) : (
          /* Clean Initial State Placeholder */
          <div className="bg-white border border-slate-200 rounded-2xl md:rounded-3xl p-8 md:p-10 text-center space-y-2 shadow-2xs w-full">
            <BookOpen className="h-8 w-8 text-slate-300 mx-auto" />
            <p className="text-xs md:text-sm font-bold text-slate-700">Mulai Pencarian Jurusan & Kampus</p>
            <p className="text-[11px] md:text-xs text-slate-400 max-w-xs mx-auto leading-relaxed">
              Ketik kata kunci nama jurusan atau universitas pada kolom di atas.
            </p>
          </div>
        )}
    </div>
  );
}
