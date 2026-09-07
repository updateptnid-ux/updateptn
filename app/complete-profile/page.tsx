"use client";

import { useState, useTransition, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { updateProfileAction } from "@/actions/profile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  User, School, Target, CheckCircle2, AlertCircle, Loader2, 
  BookOpen, Search, MapPin, Building2, Check, Sparkles, Upload, 
  Image as ImageIcon, ArrowRight
} from "lucide-react";

// ─── 34 Provinsi Indonesia ────────────────────────────────────────────────────
const PROVINSI_LIST = [
  "Aceh", "Bali", "Banten", "Bengkulu", "DI Yogyakarta", "DKI Jakarta",
  "Gorontalo", "Jambi", "Jawa Barat", "Jawa Tengah", "Jawa Timur",
  "Kalimantan Barat", "Kalimantan Selatan", "Kalimantan Tengah", 
  "Kalimantan Timur", "Kalimantan Utara", "Kepulauan Bangka Belitung",
  "Kepulauan Riau", "Lampung", "Maluku", "Maluku Utara",
  "Nusa Tenggara Barat", "Nusa Tenggara Timur", "Papua", "Papua Barat",
  "Papua Barat Daya", "Papua Pegunungan", "Papua Selatan", "Papua Tengah",
  "Riau", "Sulawesi Barat", "Sulawesi Selatan", "Sulawesi Tengah",
  "Sulawesi Tenggara", "Sulawesi Utara", "Sumatera Barat",
  "Sumatera Selatan", "Sumatera Utara",
];

interface ProdiSuggestion {
  id: string | number;
  univ: string;
  prodi: string;
  jenjang?: string;
  kelompok?: string;
}

export default function CompleteProfilePage() {
  const router = useRouter();
  const supabase = createClient();

  // User data state
  const [email, setEmail] = useState("");
  const [authLoading, setAuthLoading] = useState(true);

  // Form fields (required)
  const [fullName, setFullName] = useState("");
  const [provinsi, setProvinsi] = useState("");
  
  // Optional fields
  const [asalSekolah, setAsalSekolah] = useState("");
  const [bio, setBio] = useState("");

  // Avatar upload state
  const [avatarUrl, setAvatarUrl] = useState<string>("");
  const [avatarError, setAvatarError] = useState<string>("");

  // Prodi selection
  const [universities, setUniversities] = useState<string[]>([]);
  const [selectedUniv, setSelectedUniv] = useState<string>("");
  const [univSearch, setUnivSearch] = useState<string>("");
  const [isUnivOpen, setIsUnivOpen] = useState<boolean>(false);
  
  const [majors, setMajors] = useState<ProdiSuggestion[]>([]);
  const [selectedProdiId, setSelectedProdiId] = useState<string>("");
  const [majorSearch, setMajorSearch] = useState<string>("");
  const [isMajorOpen, setIsMajorOpen] = useState<boolean>(false);

  const [loadingUnivs, setLoadingUnivs] = useState(false);
  const [loadingMajors, setLoadingMajors] = useState(false);
  
  const [targetUnivValue, setTargetUnivValue] = useState("");
  const [targetProdiValue, setTargetProdiValue] = useState("");
  
  const univContainerRef = useRef<HTMLDivElement>(null);
  const majorContainerRef = useRef<HTMLDivElement>(null);

  // Feedback
  const [profileMsg, setProfileMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [profilePending, startProfileTransition] = useTransition();

  // Check auth and profile status
  useEffect(() => {
    async function checkAuth() {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.push("/login");
        return;
      }

      setEmail(user.email || "");
      
      // Get redirect parameter from URL
      const params = new URLSearchParams(window.location.search);
      const redirectUrl = params.get("redirect");
      
      // Check if profile is already complete
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name, provinsi")
        .eq("id", user.id)
        .single();

      // If profile already has required data and there's a redirect, go there
      if (profile?.full_name && profile?.provinsi && redirectUrl) {
        router.push(redirectUrl);
        return;
      }

      // Pre-fill with available data
      const meta = user.user_metadata as Record<string, string>;
      setFullName(profile?.full_name || meta.full_name || "");
      setProvinsi(profile?.provinsi || meta.provinsi || "");
      setAsalSekolah(meta.asal_sekolah || "");
      setBio(meta.bio || "");
      setAvatarUrl(meta.avatar_url || "");
      
      loadUniversities();
      setAuthLoading(false);
    }
    
    checkAuth();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Load universities
  async function loadUniversities() {
    try {
      setLoadingUnivs(true);
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
      }
    } catch (err) {
      console.error("Error loading PTN list:", err);
    } finally {
      setLoadingUnivs(false);
    }
  }

  // Load majors for selected university
  async function loadMajorsForUniv(univName: string) {
    try {
      setLoadingMajors(true);
      const { data, error } = await supabase
        .from("prodi_reference")
        .select("id, univ, prodi, jenjang, kelompok")
        .eq("univ", univName)
        .limit(1000)
        .order("prodi", { ascending: true });

      if (!error && data && data.length > 0) {
        setMajors(data as ProdiSuggestion[]);
        if (data[0]) {
          setSelectedProdiId(String(data[0].id));
        }
      }
    } catch (err) {
      console.error("Error loading majors:", err);
    } finally {
      setLoadingMajors(false);
    }
  }

  // When univ changes
  useEffect(() => {
    if (selectedUniv) {
      loadMajorsForUniv(selectedUniv);
      setTargetUnivValue(selectedUniv);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedUniv]);

  // When prodi changes
  useEffect(() => {
    if (selectedProdiId && majors.length > 0) {
      const selected = majors.find(m => String(m.id) === String(selectedProdiId));
      if (selected) {
        setTargetProdiValue(selected.prodi);
      }
    }
  }, [selectedProdiId, majors]);

  // Dropdown outside click
  useEffect(() => {
    function onOutside(e: MouseEvent) {
      if (univContainerRef.current && !univContainerRef.current.contains(e.target as Node)) setIsUnivOpen(false);
      if (majorContainerRef.current && !majorContainerRef.current.contains(e.target as Node)) setIsMajorOpen(false);
    }
    document.addEventListener("mousedown", onOutside);
    return () => document.removeEventListener("mousedown", onOutside);
  }, []);

  const filteredUnivs = universities.filter((u) =>
    u.toLowerCase().includes(univSearch.trim().toLowerCase())
  );

  const filteredMajors = majors.filter((m) =>
    `${m.prodi} ${m.jenjang || ""} ${m.kelompok || ""}`
      .toLowerCase()
      .includes(majorSearch.trim().toLowerCase())
  );

  const selectedProdiObj = majors.find((m) => String(m.id) === String(selectedProdiId));

  // Avatar validation
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAvatarError("");
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== "image/png") {
      setAvatarError("Format foto profil harus PNG!");
      e.target.value = "";
      return;
    }

    if (file.size > 500 * 1024) {
      setAvatarError("Ukuran foto profil maksimal 500 KB!");
      e.target.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const maxDim = 256;
          let width = img.width;
          let height = img.height;
          if (width > height) {
            if (width > maxDim) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            }
          } else {
            if (height > maxDim) {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            const resizedBase64 = canvas.toDataURL("image/png");
            setAvatarUrl(resizedBase64);
          } else {
            setAvatarUrl(event.target?.result as string);
          }
        };
        img.src = event.target.result as string;
      }
    };
    reader.readAsDataURL(file);
  };

  // Submit profile
  const handleProfileSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setProfileMsg(null);

    // Validation
    if (!fullName.trim()) {
      setProfileMsg({ type: "error", text: "Nama lengkap wajib diisi!" });
      return;
    }
    if (!provinsi) {
      setProfileMsg({ type: "error", text: "Provinsi wajib dipilih!" });
      return;
    }
    if (avatarError) return;

    const fd = new FormData(e.currentTarget);
    fd.set("targetUniv", targetUnivValue);
    fd.set("targetProdi", targetProdiValue);
    fd.set("avatarUrl", avatarUrl);
    
    startProfileTransition(async () => {
      const res = await updateProfileAction(fd);
      if (res?.error) {
        setProfileMsg({ type: "error", text: res.error });
      } else {
        setProfileMsg({ type: "success", text: "Profil berhasil disimpan! Redirecting..." });
        
        // Get redirect URL from query params
        const params = new URLSearchParams(window.location.search);
        const redirectUrl = params.get("redirect") || "/dashboard/student";
        
        setTimeout(() => {
          router.push(redirectUrl);
        }, 1500);
      }
    });
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const avatarInitial = (fullName || email || "U").charAt(0).toUpperCase();

  return (
    <div className="min-h-screen bg-slate-50 py-4 md:py-8">
      <div className="max-w-2xl mx-auto px-3 md:px-4">
        {/* Header */}
        <div className="text-center mb-6 space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-blue-600 mb-3">
            <Sparkles className="h-7 w-7 text-white" />
          </div>
          <h1 className="text-xl md:text-2xl font-extrabold text-slate-900">
            Lengkapi Profil Kamu
          </h1>
          <p className="text-xs md:text-sm text-slate-600 max-w-md mx-auto">
            Agar bisa akses semua fitur UpdatePTN, isi data diri kamu dulu ya!
          </p>
        </div>

        {/* Form Card */}
        <Card className="bg-white border border-slate-200 rounded-2xl p-4 md:p-6 shadow-sm">
          {profileMsg && (
            <div className={`mb-4 p-3 rounded-xl flex items-center gap-2 text-xs font-medium ${
              profileMsg.type === "success"
                ? "bg-emerald-50 border border-emerald-200 text-emerald-700"
                : "bg-rose-50 border border-rose-200 text-rose-700"
            }`}>
              {profileMsg.type === "success" ? <CheckCircle2 className="h-4 w-4 shrink-0" /> : <AlertCircle className="h-4 w-4 shrink-0" />}
              {profileMsg.text}
            </div>
          )}

          <form onSubmit={handleProfileSubmit} className="space-y-4">
            {/* Avatar Preview */}
            <div className="flex items-center gap-4 pb-4 border-b border-slate-100">
              <Avatar className="h-16 w-16 border-2 border-slate-200 rounded-2xl">
                {avatarUrl ? (
                  <AvatarImage src={avatarUrl} alt={fullName} />
                ) : null}
                <AvatarFallback className="bg-blue-600 text-white font-black text-xl rounded-2xl">
                  {avatarInitial}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-bold text-slate-900">{fullName || "Nama Kamu"}</p>
                <p className="text-xs text-slate-500">{email}</p>
              </div>
            </div>

            {/* Avatar Upload */}
            <div className="space-y-1.5">
              <Label htmlFor="avatarFile" className="text-xs font-bold text-slate-700 flex items-center gap-1">
                <ImageIcon className="h-3.5 w-3.5 text-blue-600" /> Foto Profil (Opsional, PNG, Max 500KB)
              </Label>
              <div className="flex items-center gap-3">
                <label
                  htmlFor="avatarFile"
                  className="cursor-pointer inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-blue-50 hover:border-blue-300 text-xs font-bold text-slate-700 hover:text-blue-600 transition-all"
                >
                  <Upload className="h-3.5 w-3.5 text-blue-600" />
                  <span>{avatarUrl ? "Ganti Foto" : "Pilih Foto"}</span>
                </label>
                {avatarUrl && (
                  <span className="text-[11px] font-semibold text-emerald-600 flex items-center gap-1">
                    <CheckCircle2 className="h-3.5 w-3.5" /> Foto terpasang
                  </span>
                )}
              </div>
              <input
                id="avatarFile"
                type="file"
                accept="image/png"
                onChange={handleAvatarChange}
                className="hidden"
              />
              {avatarError && (
                <p className="text-[11px] font-bold text-rose-600 flex items-center gap-1 pt-1">
                  <AlertCircle className="h-3.5 w-3.5" /> {avatarError}
                </p>
              )}
            </div>

            {/* Nama Lengkap (Required) */}
            <div className="space-y-1.5">
              <Label htmlFor="fullName" className="text-xs font-bold text-slate-700">
                Nama Lengkap <span className="text-rose-500">*</span>
              </Label>
              <div className="relative">
                <User className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                <Input 
                  id="fullName" 
                  name="fullName" 
                  value={fullName} 
                  onChange={e => setFullName(e.target.value)}
                  placeholder="Nama lengkap kamu" 
                  required
                  style={{ fontSize: '16px' }}
                  className="pl-10 h-11 rounded-xl border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20" 
                />
              </div>
            </div>

            {/* Provinsi (Required) */}
            <div className="space-y-1.5">
              <Label htmlFor="provinsi" className="text-xs font-bold text-slate-700 flex items-center gap-1">
                <MapPin className="h-3 w-3 text-blue-600" /> Provinsi <span className="text-rose-500">*</span>
              </Label>
              <div className="relative">
                <MapPin className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400 pointer-events-none" />
                <select
                  id="provinsi"
                  name="provinsi"
                  value={provinsi}
                  onChange={e => setProvinsi(e.target.value)}
                  required
                  className="w-full pl-10 h-11 rounded-xl border border-slate-200 bg-white text-sm font-medium text-slate-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none appearance-none cursor-pointer"
                >
                  <option value="">-- Pilih Provinsi --</option>
                  {PROVINSI_LIST.map(prov => (
                    <option key={prov} value={prov}>{prov}</option>
                  ))}
                </select>
                <div className="absolute right-3.5 top-3.5 pointer-events-none">
                  <svg className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                </div>
              </div>
            </div>

            {/* Asal Sekolah (Optional) */}
            <div className="space-y-1.5">
              <Label htmlFor="asalSekolah" className="text-xs font-bold text-slate-700">Asal Sekolah (Opsional)</Label>
              <div className="relative">
                <School className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                <Input 
                  id="asalSekolah" 
                  name="asalSekolah" 
                  value={asalSekolah} 
                  onChange={e => setAsalSekolah(e.target.value)}
                  placeholder="Misal: SMAN 1 Jakarta"
                  style={{ fontSize: '16px' }}
                  className="pl-10 h-11 rounded-xl border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20" 
                />
              </div>
            </div>

            {/* Bio (Optional) */}
            <div className="space-y-1.5">
              <Label htmlFor="bio" className="text-xs font-bold text-slate-700">Bio Singkat (Opsional)</Label>
              <textarea
                id="bio" 
                name="bio" 
                value={bio} 
                onChange={e => setBio(e.target.value)}
                placeholder="Ceritakan sedikit tentang kamu..."
                rows={3}
                className="w-full px-4 py-3 text-sm rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none resize-none text-slate-900 placeholder:text-slate-400 font-medium"
              />
            </div>

            {/* Target PTN & Prodi (Optional) */}
            <div className="space-y-3">
              <Label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                <Target className="h-3 w-3 text-blue-600" /> Target PTN & Prodi (Opsional)
              </Label>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* PTN Selection */}
                <div ref={univContainerRef} style={{ position: "relative", zIndex: isUnivOpen ? 200 : 1 }}>
                  <button
                    type="button"
                    onClick={() => { setIsUnivOpen(!isUnivOpen); setIsMajorOpen(false); }}
                    className="w-full h-11 px-4 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-900 flex items-center justify-between hover:border-blue-500 transition-colors"
                  >
                    <div className="flex items-center gap-3 truncate">
                      <Building2 className="h-4 w-4 text-blue-600 shrink-0" />
                      <span className="truncate">{selectedUniv || "Pilih PTN"}</span>
                    </div>
                    <svg className={`h-4 w-4 text-slate-500 shrink-0 transition-transform duration-200 ${isUnivOpen ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                  </button>

                  {isUnivOpen && (
                    <div className="absolute left-0 right-0 mt-2 bg-white border border-slate-200 shadow-2xl rounded-2xl p-3 flex flex-col gap-2" style={{ top: "100%", zIndex: 10000, maxHeight: "320px" }}>
                      <div className="relative">
                        <Search className="h-4 w-4 text-slate-400 absolute left-3.5 top-3.5" />
                        <input
                          type="text"
                          value={univSearch}
                          onChange={(e) => setUnivSearch(e.target.value)}
                          placeholder="Cari PTN..."
                          className="w-full h-10 pl-10 pr-3 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-600 font-medium"
                          autoFocus
                        />
                      </div>

                      {loadingUnivs ? (
                        <div className="flex items-center justify-center py-4">
                          <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
                        </div>
                      ) : (
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
                              PTN tidak ditemukan
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Prodi Selection */}
                <div ref={majorContainerRef} style={{ position: "relative", zIndex: isMajorOpen ? 100 : 1 }}>
                  <button
                    type="button"
                    disabled={loadingMajors || majors.length === 0 || !selectedUniv}
                    onClick={() => { setIsMajorOpen(!isMajorOpen); setIsUnivOpen(false); }}
                    className="w-full h-11 px-4 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-900 flex items-center justify-between hover:border-blue-500 transition-colors disabled:opacity-50"
                  >
                    <div className="flex items-center gap-3 truncate">
                      <BookOpen className="h-4 w-4 text-blue-600 shrink-0" />
                      <span className="truncate">
                        {selectedProdiObj
                          ? `${selectedProdiObj.prodi}${selectedProdiObj.jenjang ? ` (${selectedProdiObj.jenjang})` : ""}`
                          : (loadingMajors ? "Memuat..." : !selectedUniv ? "Pilih PTN dulu" : "Pilih Prodi")}
                      </span>
                    </div>
                    <svg className={`h-4 w-4 text-slate-500 shrink-0 transition-transform duration-200 ${isMajorOpen ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                  </button>

                  {isMajorOpen && (
                    <div className="absolute left-0 right-0 mt-2 bg-white border border-slate-200 shadow-2xl rounded-2xl p-3 flex flex-col gap-2" style={{ top: "100%", zIndex: 10000, maxHeight: "320px" }}>
                      <div className="relative">
                        <Search className="h-4 w-4 text-slate-400 absolute left-3.5 top-3.5" />
                        <input
                          type="text"
                          value={majorSearch}
                          onChange={(e) => setMajorSearch(e.target.value)}
                          placeholder="Cari prodi..."
                          className="w-full h-10 pl-10 pr-3 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-600 font-medium"
                          autoFocus
                        />
                      </div>

                      <div className="overflow-y-auto space-y-1 pr-1" style={{ maxHeight: "220px" }}>
                        {filteredMajors.length > 0 ? (
                          filteredMajors.map((m) => {
                            const isSelected = String(m.id) === String(selectedProdiId);
                            const label = `${m.prodi}${m.jenjang ? ` (${m.jenjang})` : ""}`;
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
                            Prodi tidak ditemukan
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <Button
                type="submit"
                disabled={profilePending || !fullName.trim() || !provinsi}
                className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-sm touch-manipulation disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {profilePending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Menyimpan...</span>
                  </>
                ) : (
                  <>
                    <span>Simpan & Lanjutkan</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            </div>

            {/* Skip Button */}
            <div className="text-center">
              <button
                type="button"
                onClick={() => router.push("/dashboard/student")}
                className="text-xs text-slate-500 hover:text-slate-700 font-medium"
              >
                Lewati dulu, isi nanti →
              </button>
            </div>
          </form>
        </Card>

        {/* Footer Note */}
        <div className="mt-4 text-center">
          <p className="text-[10px] md:text-xs text-slate-400">
            <span className="text-rose-500">*</span> Wajib diisi untuk akses fitur lengkap
          </p>
        </div>
      </div>
    </div>
  );
}
