"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { upsertProfile } from "@/actions/mentor-crud";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  UserCircle2,
  Mail,
  Phone,
  BookOpen,
  Save,
  Pencil,
  X,
  CheckCircle2,
  Sparkles,
  Video,
  PlaySquare,
  DollarSign,
  Clock,
  Award,
  Plus,
  Calendar,
  Check,
} from "lucide-react";

interface Profile {
  id: string;
  full_name: string;
  email?: string;
  phone?: string;
  specialization?: string;
  bio?: string;
  avatar_url?: string;
  role?: string;
}

interface CertificateItem {
  id: string;
  title: string;
  issuer: string;
  year: string;
  isVerified: boolean;
}

const INITIAL_CERTS: CertificateItem[] = [
  {
    id: "cert-1",
    title: "Sertifikasi Master Tutor SNBT & IRT System",
    issuer: "Lembaga Edukasi UpdatePTN",
    year: "2025",
    isVerified: true,
  },
  {
    id: "cert-2",
    title: "Olimpiade Matematika Nasional - Top 5 Finalist",
    issuer: "Kementerian Pendidikan & Kebudayaan",
    year: "2024",
    isVerified: true,
  },
];

const WEEKDAYS = [
  { key: "senin", label: "Senin" },
  { key: "selasa", label: "Selasa" },
  { key: "rabu", label: "Rabu" },
  { key: "kamis", label: "Kamis" },
  { key: "jumat", label: "Jumat" },
  { key: "sabtu", label: "Sabtu" },
  { key: "minggu", label: "Minggu" },
];

export default function MentorProfilPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Certifications State
  const [certificates, setCertificates] = useState<CertificateItem[]>(INITIAL_CERTS);
  const [isAddCertOpen, setIsAddCertOpen] = useState(false);
  const [certForm, setCertForm] = useState({ title: "", issuer: "", year: "2025" });

  // Rate & Availability State
  const [hourlyRate, setHourlyRate] = useState(150000);
  const [availability, setAvailability] = useState<Record<string, string[]>>({
    senin: ["09:00 - 11:00", "19:00 - 21:00"],
    selasa: ["14:00 - 16:00", "19:00 - 21:00"],
    rabu: ["09:00 - 11:00", "19:00 - 21:00"],
    kamis: ["14:00 - 16:00"],
    jumat: ["19:00 - 21:00"],
    sabtu: ["09:00 - 11:00", "14:00 - 16:00"],
    minggu: [],
  });

  const [stats, setStats] = useState({
    liveClass: 0,
    video: 0,
    modul: 0,
  });

  const [formData, setFormData] = useState({
    full_name: "",
    phone: "",
    specialization: "",
    bio: "",
  });

  useEffect(() => {
    fetchProfile();
    fetchStats();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const supabase = createClient();

      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      setEmail(user.email || "");

      const { data: p } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();

      if (p) {
        setProfile(p as Profile);
        setFormData({
          full_name: p.full_name || "",
          phone: p.phone || "",
          specialization: p.specialization || "",
          bio: p.bio || "",
        });
      } else {
        const name =
          user.user_metadata?.full_name || user.email?.split("@")[0] || "";
        setFormData((prev) => ({ ...prev, full_name: name }));
      }
    } catch (err) {
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const supabase = createClient();
      const [{ count: lcCount }, { count: vidCount }, { count: modCount }] =
        await Promise.all([
          supabase.from("live_classes").select("*", { count: "exact", head: true }),
          supabase.from("videos").select("*", { count: "exact", head: true }),
          supabase.from("moduls").select("*", { count: "exact", head: true }),
        ]);

      setStats({
        liveClass: lcCount || 0,
        video: vidCount || 0,
        modul: modCount || 0,
      });
    } catch (err) {
      console.error("Stats error:", err);
    }
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const result = await upsertProfile(user.id, formData);
      if (!result.ok) throw new Error(result.message);

      setSaveSuccess(true);
      setIsEditing(false);
      fetchProfile();
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      alert("Gagal menyimpan: " + (err instanceof Error ? err.message : JSON.stringify(err)));
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddCert = () => {
    if (!certForm.title || !certForm.issuer) {
      alert("Judul sertifikat dan penerbit wajib diisi.");
      return;
    }
    const newCert: CertificateItem = {
      id: `cert-${Date.now()}`,
      title: certForm.title,
      issuer: certForm.issuer,
      year: certForm.year || "2025",
      isVerified: true,
    };
    setCertificates([...certificates, newCert]);
    setIsAddCertOpen(false);
    setCertForm({ title: "", issuer: "", year: "2025" });
  };

  const toggleSlot = (dayKey: string, slot: string) => {
    const current = availability[dayKey] || [];
    const exists = current.includes(slot);
    const updated = exists ? current.filter((s) => s !== slot) : [...current, slot];
    setAvailability({ ...availability, [dayKey]: updated });
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();
  };

  const displayName = profile?.full_name || formData.full_name || "Mentor";

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Pengaturan Profil Tentor</h1>
          <p className="text-sm text-slate-500 mt-1">
            Kelola identitas, tarif mengajar per sesi, ketersediaan jam, dan sertifikasi.
          </p>
        </div>

        <Button
          onClick={() => setIsAddCertOpen(true)}
          className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold gap-2 text-xs shadow-md shadow-blue-200"
        >
          <Award className="h-4 w-4" />
          <span>Tambah Sertifikasi</span>
        </Button>
      </div>

      {saveSuccess && (
        <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-xl px-4 py-3">
          <CheckCircle2 className="h-4 w-4 text-blue-600 shrink-0" />
          <span className="text-sm font-semibold text-blue-700">
            Profil tentor &amp; pengaturan berhasil diperbarui!
          </span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Avatar & Quick Summary */}
        <div className="lg:col-span-1 space-y-4">
          <Card className="p-6 rounded-2xl bg-white border border-slate-200 text-center space-y-4 shadow-xs">
            <div className="flex justify-center">
              <div className="relative">
                <Avatar className="h-20 w-20 border-4 border-blue-200 shadow-lg">
                  <AvatarFallback className="bg-gradient-to-br from-blue-500 to-blue-600 text-white text-2xl font-extrabold">
                    {loading ? "..." : getInitials(displayName)}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-1 -right-1 bg-blue-600 rounded-full p-1">
                  <Sparkles className="h-3 w-3 text-white" />
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-lg font-extrabold text-slate-900">
                {loading ? "..." : displayName}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">{email}</p>
              <Badge className="mt-2 bg-blue-100 text-blue-700 border-blue-200 text-xs font-bold">
                ✦ Mentor UpdatePTN Verified
              </Badge>
            </div>

            {/* Rate Display */}
            <div className="p-3 bg-gradient-to-r from-blue-50 to-blue-50 border border-blue-200/60 rounded-xl text-left">
              <p className="text-[11px] text-blue-700 font-bold uppercase tracking-wider">Tarif Mengajar Sesi</p>
              <p className="text-lg font-extrabold text-blue-900 mt-0.5">
                Rp {hourlyRate.toLocaleString("id-ID")} <span className="text-xs font-normal text-slate-500">/ 90 menit</span>
              </p>
            </div>

            {profile?.specialization && (
              <div className="bg-slate-50 rounded-xl p-3 text-left">
                <p className="text-xs text-slate-400 font-semibold mb-1">Spesialisasi Subtes</p>
                <p className="text-xs font-bold text-slate-700">{profile.specialization}</p>
              </div>
            )}
          </Card>

          {/* Certifications List */}
          <Card className="p-5 rounded-2xl bg-white border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <Award className="h-4 w-4 text-blue-600" />
                Sertifikasi &amp; Gelar ({certificates.length})
              </h3>
            </div>

            <div className="space-y-2">
              {certificates.map((c) => (
                <div key={c.id} className="p-2.5 bg-slate-50 border border-slate-100 rounded-xl text-xs space-y-1">
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-bold text-slate-800 leading-tight">{c.title}</p>
                    <Badge className="bg-blue-100 text-blue-800 text-[9px] font-bold shrink-0">
                      Terverifikasi
                    </Badge>
                  </div>
                  <p className="text-[11px] text-slate-500">{c.issuer} · {c.year}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Right Column: Edit Forms & Schedule */}
        <div className="lg:col-span-2 space-y-6">
          {/* Section 1: Informasi Profil & Tarif */}
          <Card className="p-6 rounded-2xl bg-white border border-slate-200 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-extrabold text-slate-900">1. Data Diri &amp; Tarif Mengajar</h3>
              {!isEditing ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditing(true)}
                  className="rounded-xl border-blue-200 text-blue-700 hover:bg-blue-50 gap-1.5 text-xs font-bold"
                >
                  <Pencil className="h-3.5 w-3.5" />
                  Edit Data
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditing(false)}
                    className="rounded-xl text-xs font-bold"
                  >
                    Batal
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleSave}
                    disabled={isSaving}
                    className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold"
                  >
                    {isSaving ? "Menyimpan..." : "Simpan"}
                  </Button>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-700">Nama Lengkap Tentor</Label>
                {isEditing ? (
                  <Input
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    className="rounded-xl text-xs"
                  />
                ) : (
                  <div className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800">
                    {formData.full_name || "—"}
                  </div>
                )}
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-700">Nomor Telepon / WhatsApp</Label>
                {isEditing ? (
                  <Input
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="rounded-xl text-xs"
                  />
                ) : (
                  <div className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800">
                    {formData.phone || "—"}
                  </div>
                )}
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-700">Tarif Mengajar (Rp / Sesi 90m)</Label>
                <Input
                  type="number"
                  value={hourlyRate}
                  onChange={(e) => setHourlyRate(Number(e.target.value))}
                  className="rounded-xl text-xs font-bold text-blue-700"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-700">Spesialisasi Subtes</Label>
                {isEditing ? (
                  <Input
                    value={formData.specialization}
                    onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                    className="rounded-xl text-xs"
                  />
                ) : (
                  <div className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800">
                    {formData.specialization || "—"}
                  </div>
                )}
              </div>
            </div>
          </Card>

          {/* Section 2: Ketersediaan Jam (Weekly Availability) */}
          <Card className="p-6 rounded-2xl bg-white border border-slate-200 space-y-4">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <Clock className="h-4 w-4 text-blue-600" />
                2. Pengaturan Ketersediaan Jam Mengajar
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Pilih slot waktu mengajar harian Anda agar tim akademis dan siswa dapat mencocokkan jadwal live class.
              </p>
            </div>

            <div className="space-y-3">
              {WEEKDAYS.map((day) => {
                const activeSlots = availability[day.key] || [];
                return (
                  <div key={day.key} className="p-3 bg-slate-50 border border-slate-200/70 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-3">
                    <span className="text-xs font-extrabold text-slate-800 w-24">
                      {day.label}
                    </span>

                    <div className="flex flex-wrap gap-2">
                      {["09:00 - 11:00", "14:00 - 16:00", "19:00 - 21:00"].map((slot) => {
                        const isSelected = activeSlots.includes(slot);
                        return (
                          <button
                            key={slot}
                            onClick={() => toggleSlot(day.key, slot)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 border ${
                              isSelected
                                ? "bg-blue-600 text-white border-blue-600 shadow-2xs"
                                : "bg-white text-slate-600 border-slate-200 hover:border-blue-300"
                            }`}
                          >
                            {isSelected && <Check className="h-3 w-3" />}
                            <span>{slot}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      </div>

      {/* DIALOG ADD CERTIFICATION */}
      <Dialog open={isAddCertOpen} onOpenChange={setIsAddCertOpen}>
        <DialogContent className="max-w-md rounded-2xl p-6">
          <DialogHeader>
            <DialogTitle className="text-lg font-extrabold text-slate-900">
              Tambah Sertifikasi Baru
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Tambahkan gelar akademik, lisensi pengajar, atau prestasi kompetensi.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-slate-700">Judul Sertifikasi / Prestasi *</Label>
              <Input
                value={certForm.title}
                onChange={(e) => setCertForm({ ...certForm, title: e.target.value })}
                placeholder="Misal: Certificate of Pedagogy & Education"
                className="rounded-xl text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-slate-700">Lembaga Penerbit *</Label>
              <Input
                value={certForm.issuer}
                onChange={(e) => setCertForm({ ...certForm, issuer: e.target.value })}
                placeholder="Misal: Universitas Indonesia"
                className="rounded-xl text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-slate-700">Tahun Perolehan</Label>
              <Input
                value={certForm.year}
                onChange={(e) => setCertForm({ ...certForm, year: e.target.value })}
                placeholder="2025"
                className="rounded-xl text-xs"
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setIsAddCertOpen(false)} className="rounded-xl text-xs font-bold">
              Batal
            </Button>
            <Button onClick={handleAddCert} className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs">
              Simpan Sertifikasi
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
