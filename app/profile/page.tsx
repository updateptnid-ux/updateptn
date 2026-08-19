"use client";

import { useState, useTransition, useEffect, useRef } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { updateProfileAction, changePasswordAction } from "@/actions/profile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  User, School, Target, Lock, CheckCircle2, AlertCircle,
  Loader2, BookOpen, Search, X, Eye, EyeOff, Save, KeyRound, MapPin, Building2, Check, Sparkles, Upload, Image as ImageIcon,
} from "lucide-react";

// ─── 34 Provinsi Indonesia ────────────────────────────────────────────────────
const PROVINSI_LIST = [
  "Aceh",
  "Bali",
  "Banten",
  "Bengkulu",
  "DI Yogyakarta",
  "DKI Jakarta",
  "Gorontalo",
  "Jambi",
  "Jawa Barat",
  "Jawa Tengah",
  "Jawa Timur",
  "Kalimantan Barat",
  "Kalimantan Selatan",
  "Kalimantan Tengah",
  "Kalimantan Timur",
  "Kalimantan Utara",
  "Kepulauan Bangka Belitung",
  "Kepulauan Riau",
  "Lampung",
  "Maluku",
  "Maluku Utara",
  "Nusa Tenggara Barat",
  "Nusa Tenggara Timur",
  "Papua",
  "Papua Barat",
  "Papua Barat Daya",
  "Papua Pegunungan",
  "Papua Selatan",
  "Papua Tengah",
  "Riau",
  "Sulawesi Barat",
  "Sulawesi Selatan",
  "Sulawesi Tengah",
  "Sulawesi Tenggara",
  "Sulawesi Utara",
  "Sumatera Barat",
  "Sumatera Selatan",
  "Sumatera Utara",
];
import { useRouter } from "next/navigation";

// ─── Univ domain helpers ─────────────────────────────────────────────────────
const UNIV_DOMAINS: Record<string, string> = {
  "UNIVERSITAS INDONESIA": "ui.ac.id",
  "INSTITUT TEKNOLOGI BANDUNG": "itb.ac.id",
  "UNIVERSITAS GADJAH MADA": "ugm.ac.id",
  "UNIVERSITAS BRAWIJAYA": "ub.ac.id",
  "UNIVERSITAS PADJADJARAN": "unpad.ac.id",
  "UNIVERSITAS DIPONEGORO": "undip.ac.id",
  "UNIVERSITAS AIRLANGGA": "unair.ac.id",
  "INSTITUT TEKNOLOGI SEPULUH NOPEMBER": "its.ac.id",
  "UNIVERSITAS HASANUDDIN": "unhas.ac.id",
};
const getUnivDomain = (name?: string) => {
  if (!name) return null;
  const n = name.toUpperCase().trim();
  if (UNIV_DOMAINS[n]) return UNIV_DOMAINS[n];
  for (const [key, d] of Object.entries(UNIV_DOMAINS)) {
    if (n.includes(key) || key.includes(n)) return d;
  }
  return null;
};
const getInitials = (name?: string) => {
  if (!name) return "??";
  const clean = name.toUpperCase().replace("UNIVERSITAS ", "").replace("INSTITUT ", "").trim();
  const words = clean.split(" ");
  if (words.length >= 2) return (words[0][0] + words[1][0]).toUpperCase();
  return clean.substring(0, 2).toUpperCase();
};

interface ProdiSuggestion {
  id: string | number;
  univ: string;
  prodi: string;
  jenjang?: string;
  kelompok?: string;
}

// ─── Component ───────────────────────────────────────────────────────────────
export default function ProfilePage() {
  const router = useRouter();
  const supabase = createClient();

  // User metadata state
  const [userData, setUserData] = useState<Record<string, string>>({});
  const [email, setEmail] = useState("");
  const [authLoading, setAuthLoading] = useState(true);

  // Form fields
  const [fullName, setFullName] = useState("");
  const [asalSekolah, setAsalSekolah] = useState("");
  const [bio, setBio] = useState("");
  const [provinsi, setProvinsi] = useState("");

  // Avatar upload state
  const [avatarUrl, setAvatarUrl] = useState<string>("");
  const [avatarError, setAvatarError] = useState<string>("");

  // Prodi selection - two-step combobox like Cek Peluang  
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
  
  // Hidden field values
  const [targetUnivValue, setTargetUnivValue] = useState("");
  const [targetProdiValue, setTargetProdiValue] = useState("");
  
  const univContainerRef = useRef<HTMLDivElement>(null);
  const majorContainerRef = useRef<HTMLDivElement>(null);

  // Password form
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPw, setShowNewPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);

  // Feedback
  const [profileMsg, setProfileMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [pwMsg, setPwMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [profilePending, startProfileTransition] = useTransition();
  const [pwPending, startPwTransition] = useTransition();

  // Subscription state
  const [isPremium, setIsPremium] = useState(false);
  const [subTier, setSubTier] = useState("");
  const [subExpiry, setSubExpiry] = useState("");

  // Load user
  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login?redirect=/profile"); return; }

      const meta = user.user_metadata as Record<string, string>;
      setUserData(meta);
      setEmail(user.email || "");
      setFullName(meta.full_name || "");
      setAsalSekolah(meta.asal_sekolah || "");
      setBio(meta.bio || "");
      setProvinsi(meta.provinsi || "");
      setAvatarUrl(meta.avatar_url || "");

      // Load subscription status
      const { data: sub } = await supabase
        .from("subscriptions")
        .select("status, tier, expires_at")
        .eq("user_id", user.id)
        .eq("status", "active")
        .gt("expires_at", new Date().toISOString())
        .single();
      if (sub) {
        setIsPremium(true);
        setSubTier(sub.tier || "Premium");
        setSubExpiry(sub.expires_at ? new Date(sub.expires_at).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }) : "");
      }
      
      const univ = meta.target_univ || meta.target_ptn || "";
      const prodi = meta.target_prodi || "";
      
      setSelectedUniv(univ);
      setTargetUnivValue(univ);
      setTargetProdiValue(prodi);
      
      // Load universities list
      loadUniversities();
      
      // If user has existing prodi data, load majors for that univ
      if (univ) {
        loadMajorsForUniv(univ, prodi);
      }
      
      setAuthLoading(false);
    }
    load();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Load full universities list from DB
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

  // Load majors when university selected
  async function loadMajorsForUniv(univName: string, existingProdi?: string) {
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
        
        // Auto-select if there's existing prodi
        if (existingProdi) {
          const found = data.find((m: any) => m.prodi === existingProdi);
          if (found) {
            setSelectedProdiId(String(found.id));
          } else if (data[0]) {
            setSelectedProdiId(String(data[0].id));
          }
        } else if (data[0]) {
          setSelectedProdiId(String(data[0].id));
        }
      }
    } catch (err) {
      console.error("Error loading majors:", err);
    } finally {
      setLoadingMajors(false);
    }
  }

  // When univ changes, load new majors
  useEffect(() => {
    if (selectedUniv) {
      loadMajorsForUniv(selectedUniv);
      // Update hidden field
      setTargetUnivValue(selectedUniv);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedUniv]);

  // When prodi changes, update hidden field
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

  // Filter functions for combobox
  const filteredUnivs = universities.filter((u) =>
    u.toLowerCase().includes(univSearch.trim().toLowerCase())
  );

  const filteredMajors = majors.filter((m) =>
    `${m.prodi} ${m.jenjang || ""} ${m.kelompok || ""}`
      .toLowerCase()
      .includes(majorSearch.trim().toLowerCase())
  );

  const selectedProdiObj = majors.find((m) => String(m.id) === String(selectedProdiId));

  // Avatar file validation (PNG, Max 500KB)
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
    if (avatarError) return;
    const fd = new FormData(e.currentTarget);
    fd.set("targetUniv", targetUnivValue);
    fd.set("targetProdi", targetProdiValue);
    fd.set("avatarUrl", avatarUrl);
    startProfileTransition(async () => {
      const res = await updateProfileAction(fd);
      if (res?.error) setProfileMsg({ type: "error", text: res.error });
      else setProfileMsg({ type: "success", text: "Profil berhasil diperbarui!" });
    });
  };

  // Submit password
  const handlePwSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setPwMsg(null);
    const fd = new FormData(e.currentTarget);
    startPwTransition(async () => {
      const res = await changePasswordAction(fd);
      if (res?.error) setPwMsg({ type: "error", text: res.error });
      else {
        setPwMsg({ type: "success", text: "Kata sandi berhasil diubah!" });
        setNewPassword("");
        setConfirmPassword("");
      }
    });
  };

  if (authLoading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
      </div>
    );
  }

  const avatarInitial = (fullName || email || "U").charAt(0).toUpperCase();

  return (
    <div className="max-w-4xl mx-auto space-y-6 py-2">{/* Changed from max-w-2xl to max-w-4xl */}
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="relative group">
          <Avatar className="h-16 w-16 border-2 border-slate-200 rounded-2xl overflow-hidden shadow-xs">
            {avatarUrl ? (
              <AvatarImage src={avatarUrl} alt={fullName} className="object-cover h-full w-full" />
            ) : null}
            <AvatarFallback className="bg-blue-600 text-white font-black text-xl rounded-2xl">
              {avatarInitial}
            </AvatarFallback>
          </Avatar>
        </div>
        <div>
          <h1 className="text-xl font-extrabold text-slate-900">{fullName || "Siswa UpdatePTN"}</h1>
          <p className="text-xs text-slate-500 font-medium">{email}</p>
          {userData.asal_sekolah && (
            <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
              {userData.asal_sekolah}
            </p>
          )}
        </div>
      </div>

      {/* ── CARD: Edit Profil ───────────────────────────────── */}
      <Card className="bg-white border border-slate-200 rounded-2xl p-5 md:p-6 shadow-xs space-y-5" style={{ overflow: "visible" }}>
        <div className="flex items-center gap-2 border-b border-slate-100 pb-4">
          <div className="h-8 w-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <User className="h-4 w-4" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-900">Edit Profil</p>
            <p className="text-[11px] text-slate-500">Data diri, asal sekolah, dan target PTN</p>
          </div>
        </div>

        {profileMsg && (
          <div className={`p-3 rounded-xl flex items-center gap-2 text-xs font-medium ${
            profileMsg.type === "success"
              ? "bg-emerald-50 border border-emerald-200 text-emerald-700"
              : "bg-rose-50 border border-rose-200 text-rose-700"
          }`}>
            {profileMsg.type === "success" ? <CheckCircle2 className="h-4 w-4 shrink-0" /> : <AlertCircle className="h-4 w-4 shrink-0" />}
            {profileMsg.text}
          </div>
        )}

        <form onSubmit={handleProfileSubmit} className="space-y-4">
          {/* Upload Foto Profil */}
          <div className="space-y-1.5">
            <Label htmlFor="avatarFile" className="text-xs font-bold text-slate-700 flex items-center gap-1">
              <ImageIcon className="h-3.5 w-3.5 text-blue-600" /> Foto Profil (Format PNG, Max 500 KB)
            </Label>
            <div className="flex items-center gap-3">
              <label
                htmlFor="avatarFile"
                className="cursor-pointer inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-blue-50 hover:border-blue-300 text-xs font-bold text-slate-700 hover:text-blue-600 transition-all"
              >
                <Upload className="h-3.5 w-3.5 text-blue-600" />
                <span>{avatarUrl ? "Ganti Foto Profil (PNG)" : "Pilih File PNG (Max 500KB)"}</span>
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
          {/* Nama */}
          <div className="space-y-1.5">
            <Label htmlFor="fullName" className="text-xs font-bold text-slate-700">Nama Lengkap <span className="text-rose-500">*</span></Label>
            <div className="relative">
              <User className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
              <Input id="fullName" name="fullName" value={fullName} onChange={e => setFullName(e.target.value)}
                placeholder="Nama lengkap kamu" required
                className="pl-10 h-11 rounded-xl border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20" />
            </div>
          </div>

          {/* Bio */}
          <div className="space-y-1.5">
            <Label htmlFor="bio" className="text-xs font-bold text-slate-700">Bio Singkat</Label>
            <textarea
              id="bio" name="bio" value={bio} onChange={e => setBio(e.target.value)}
              placeholder="Ceritakan sedikit tentang kamu, ambisi, atau motivasi belajar kamu..."
              rows={3}
              className="w-full px-4 py-3 text-sm rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none resize-none text-slate-900 placeholder:text-slate-400 font-medium"
            />
          </div>

          {/* Provinsi */}
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
            {provinsi && (
              <p className="text-[11px] text-blue-600 font-semibold pl-1">{provinsi}</p>
            )}
          </div>

          {/* Asal Sekolah */}
          <div className="space-y-1.5">
            <Label htmlFor="asalSekolah" className="text-xs font-bold text-slate-700">Asal Sekolah</Label>
            <div className="relative">
              <School className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
              <Input id="asalSekolah" name="asalSekolah" value={asalSekolah} onChange={e => setAsalSekolah(e.target.value)}
                placeholder="Misal: SMAN 1 Jakarta"
                className="pl-10 h-11 rounded-xl border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20" />
            </div>
          </div>

          {/* Target PTN & Prodi - Two-Step Combobox Side by Side */}
          <div className="space-y-3" style={{ overflow: "visible" }}>
            <Label className="text-xs font-bold text-slate-700 flex items-center gap-1">
              <Target className="h-3 w-3 text-blue-600" /> Target PTN & Prodi Impian
            </Label>

            {/* Grid 2 columns for PTN and Prodi */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4" style={{ overflow: "visible" }}>
              {/* Step 1: PTN Selection */}
              <div ref={univContainerRef} style={{ position: "relative", zIndex: isUnivOpen ? 200 : 1 }}>
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    1. Pilih PTN
                  </Label>
                  <button
                    type="button"
                    onClick={() => { setIsUnivOpen(!isUnivOpen); setIsMajorOpen(false); }}
                    className="w-full h-11 px-4 bg-white border border-slate-300 rounded-xl text-sm font-bold text-slate-900 flex items-center justify-between hover:border-blue-500 transition-colors shadow-xs"
                  >
                    <div className="flex items-center gap-3 truncate">
                      <Building2 className="h-4 w-4 text-blue-600 shrink-0" />
                      <span className="truncate">{selectedUniv || "Pilih PTN Target"}</span>
                    </div>
                    <svg className={`h-4 w-4 text-slate-500 shrink-0 transition-transform duration-200 ${isUnivOpen ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                  </button>
                </div>

              {isUnivOpen && (
                <div className="absolute left-0 right-0 mt-2 bg-white border border-slate-200 shadow-2xl rounded-2xl p-3 flex flex-col gap-2 animate-in fade-in zoom-in-95" style={{ top: "100%", zIndex: 10000, maxHeight: "320px" }}>
                  <div className="relative flex-shrink-0">
                    <Search className="h-4 w-4 text-slate-400 absolute left-3.5 top-3.5" />
                    <input
                      type="text"
                      value={univSearch}
                      onChange={(e) => setUnivSearch(e.target.value)}
                      placeholder="Cari PTN (cth: UI, ITB, UGM)..."
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

            {/* Step 2: Prodi Selection */}
            <div ref={majorContainerRef} style={{ position: "relative", zIndex: isMajorOpen ? 100 : 1 }}>
              <div className="space-y-1.5">
                <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  2. Pilih Prodi
                </Label>
                <button
                  type="button"
                  disabled={loadingMajors || majors.length === 0 || !selectedUniv}
                  onClick={() => { setIsMajorOpen(!isMajorOpen); setIsUnivOpen(false); }}
                  className="w-full h-11 px-4 bg-white border border-slate-300 rounded-xl text-sm font-bold text-slate-900 flex items-center justify-between hover:border-blue-500 transition-colors shadow-xs disabled:opacity-50"
                >
                  <div className="flex items-center gap-3 truncate">
                    <BookOpen className="h-4 w-4 text-blue-600 shrink-0" />
                    <span className="truncate">
                      {selectedProdiObj
                        ? `${selectedProdiObj.prodi}${selectedProdiObj.jenjang ? ` (${selectedProdiObj.jenjang})` : ""}`
                        : (loadingMajors ? "Memuat jurusan..." : !selectedUniv ? "Pilih PTN dulu" : "Pilih Jurusan")}
                    </span>
                  </div>
                  <svg className={`h-4 w-4 text-slate-500 shrink-0 transition-transform duration-200 ${isMajorOpen ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                </button>
              </div>

                {isMajorOpen && (
                  <div className="absolute left-0 right-0 mt-2 bg-white border border-slate-200 shadow-2xl rounded-2xl p-3 flex flex-col gap-2 animate-in fade-in zoom-in-95" style={{ top: "100%", zIndex: 10000, maxHeight: "320px" }}>
                    <div className="relative flex-shrink-0">
                      <Search className="h-4 w-4 text-slate-400 absolute left-3.5 top-3.5" />
                      <input
                        type="text"
                        value={majorSearch}
                        onChange={(e) => setMajorSearch(e.target.value)}
                        placeholder="Cari jurusan..."
                        className="w-full h-10 pl-10 pr-3 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-600 font-medium"
                        autoFocus
                      />
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
                          Jurusan tidak ditemukan
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {selectedProdiObj && (
              <p className="text-[11px] text-blue-600 font-semibold pl-1">
                {selectedProdiObj.prodi} di {selectedUniv}
              </p>
            )}

            <input type="hidden" name="targetUniv" value={targetUnivValue} />
            <input type="hidden" name="targetProdi" value={targetProdiValue} />
          </div>

          <Button type="submit" disabled={profilePending}
            className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl gap-2">
            {profilePending ? <><Loader2 className="h-4 w-4 animate-spin" /><span>Menyimpan...</span></> : <><Save className="h-4 w-4" /><span>Simpan Perubahan</span></>}
          </Button>
        </form>
      </Card>

      {/* ── CARD: Ganti Password ─────────────────────────────── */}
      <Card className="bg-white border border-slate-200 rounded-2xl p-5 md:p-6 shadow-xs space-y-5">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-4">
          <div className="h-8 w-8 rounded-xl bg-slate-900 text-white flex items-center justify-center">
            <KeyRound className="h-4 w-4" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-900">Ganti Kata Sandi</p>
            <p className="text-[11px] text-slate-500">Perbarui kata sandi akun kamu</p>
          </div>
        </div>

        {pwMsg && (
          <div className={`p-3 rounded-xl flex items-center gap-2 text-xs font-medium ${
            pwMsg.type === "success"
              ? "bg-emerald-50 border border-emerald-200 text-emerald-700"
              : "bg-rose-50 border border-rose-200 text-rose-700"
          }`}>
            {pwMsg.type === "success" ? <CheckCircle2 className="h-4 w-4 shrink-0" /> : <AlertCircle className="h-4 w-4 shrink-0" />}
            {pwMsg.text}
          </div>
        )}

        <form onSubmit={handlePwSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="newPassword" className="text-xs font-bold text-slate-700">Kata Sandi Baru</Label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
              <Input id="newPassword" name="newPassword" type={showNewPw ? "text" : "password"}
                value={newPassword} onChange={e => setNewPassword(e.target.value)}
                placeholder="Min. 6 karakter" minLength={6} required
                className="pl-10 pr-10 h-11 rounded-xl border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20" />
              <button type="button" onClick={() => setShowNewPw(v => !v)}
                className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600">
                {showNewPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="confirmPassword" className="text-xs font-bold text-slate-700">Konfirmasi Kata Sandi Baru</Label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
              <Input id="confirmPassword" name="confirmPassword" type={showConfirmPw ? "text" : "password"}
                value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
                placeholder="Ulangi kata sandi baru" required
                className={`pl-10 pr-10 h-11 rounded-xl border-slate-200 focus:ring-2 focus:ring-blue-500/20 ${
                  confirmPassword && confirmPassword !== newPassword
                    ? "border-rose-400 focus:border-rose-400"
                    : "focus:border-blue-500"
                }`} />
              <button type="button" onClick={() => setShowConfirmPw(v => !v)}
                className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600">
                {showConfirmPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {confirmPassword && confirmPassword !== newPassword && (
              <p className="text-[11px] text-rose-600 font-semibold pl-1">Kata sandi tidak cocok</p>
            )}
          </div>

          <Button type="submit" disabled={pwPending || (!!confirmPassword && confirmPassword !== newPassword)}
            className="w-full h-11 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl gap-2">
            {pwPending ? <><Loader2 className="h-4 w-4 animate-spin" /><span>Mengubah...</span></> : <><KeyRound className="h-4 w-4" /><span>Ubah Kata Sandi</span></>}
          </Button>
        </form>
      </Card>

      {/* ── CARD: Status Langganan / Upgrade Premium ───────────────── */}
      {isPremium ? (
        <Card className="bg-blue-50 border border-blue-200 rounded-2xl p-5 md:p-6 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0">
              <Sparkles className="h-5 w-5 text-amber-300" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-extrabold text-blue-950">Paket {subTier} Aktif ✨</p>
              <p className="text-xs text-blue-700 font-medium">
                {subExpiry ? `Berlaku hingga ${subExpiry}` : "Akses tak terbatas"}
              </p>
            </div>
            <Link href="/pricing">
              <Button variant="outline" size="sm" className="shrink-0 border-blue-300 text-blue-700 hover:bg-blue-100 font-bold rounded-xl text-xs">
                Perpanjang
              </Button>
            </Link>
          </div>
        </Card>
      ) : (
        <Card className="bg-blue-900 border border-blue-800/60 rounded-2xl p-5 md:p-6 shadow-lg text-white">
          <div className="flex items-center gap-2 border-b border-white/10 pb-4 mb-4">
            <div className="h-8 w-8 rounded-xl bg-blue-600 flex items-center justify-center shrink-0">
              <Sparkles className="h-4 w-4 text-amber-300" />
            </div>
            <div>
              <p className="text-sm font-extrabold">Upgrade ke Premium</p>
              <p className="text-[11px] text-blue-200">Buka semua fitur analisis &amp; Try Out</p>
            </div>
          </div>
          <div className="space-y-2 mb-5">
            {[
              "Akses semua paket Try Out tanpa batas",
              "Analisis detail per soal &amp; subtes",
              "Latihan soal per subtes (premium)",
              "Live Rank SNBT real-time",
              "Prediksi kelulusan berbasis AI IRT",
            ].map((benefit, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="h-4 w-4 rounded-full bg-blue-500/20 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="h-2.5 w-2.5 text-blue-400" />
                </div>
                <span className="text-xs text-slate-300 font-medium" dangerouslySetInnerHTML={{ __html: benefit }} />
              </div>
            ))}
          </div>
          <Link href="/pricing">
            <Button className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-xl gap-2 shadow-lg shadow-blue-600/30 transition-all hover:scale-[1.01]">
              <Sparkles className="h-4 w-4 text-amber-300" />
              <span>Lihat Paket &amp; Harga</span>
            </Button>
          </Link>
        </Card>
      )}
    </div>
  );
}
