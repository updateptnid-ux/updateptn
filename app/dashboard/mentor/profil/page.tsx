"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
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
  GraduationCap,
  Plus,
  Trash2,
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
  education?: EducationItem[];
}

interface EducationItem {
  id: string;
  university: string;
  faculty: string;
  major: string;
  start_year: string;
  end_year: string;
  degree: string; // S1, S2, S3
}

export default function MentorProfilPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

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

  const [educationList, setEducationList] = useState<EducationItem[]>([]);
  const [isEditingEducation, setIsEditingEducation] = useState(false);

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
        setEducationList(p.education || []);
      } else {
        // Fallback from user metadata
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
          supabase
            .from("live_classes")
            .select("*", { count: "exact", head: true }),
          supabase
            .from("videos")
            .select("*", { count: "exact", head: true }),
          supabase
            .from("moduls")
            .select("*", { count: "exact", head: true }),
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

      const { error } = await supabase
        .from("profiles")
        .upsert({
          id: user.id,
          ...formData,
          education: educationList,
        });

      if (error) throw error;

      setSaveSuccess(true);
      setIsEditing(false);
      setIsEditingEducation(false);
      fetchProfile();

      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      alert("Gagal menyimpan: " + (err as Error).message);
    } finally {
      setIsSaving(false);
    }
  };

  const addEducation = () => {
    const newEdu: EducationItem = {
      id: Date.now().toString(),
      university: "",
      faculty: "",
      major: "",
      start_year: "",
      end_year: "",
      degree: "S1",
    };
    setEducationList([...educationList, newEdu]);
  };

  const removeEducation = (id: string) => {
    setEducationList(educationList.filter((edu) => edu.id !== id));
  };

  const updateEducation = (id: string, field: keyof EducationItem, value: string) => {
    setEducationList(
      educationList.map((edu) =>
        edu.id === id ? { ...edu, [field]: value } : edu
      )
    );
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
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900">Profil Saya</h1>
        <p className="text-sm text-slate-500 mt-1">
          Informasi akun dan identitas mentor Anda
        </p>
      </div>

      {/* Success banner */}
      {saveSuccess && (
        <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
          <span className="text-sm font-semibold text-emerald-700">
            Profil berhasil diperbarui!
          </span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="lg:col-span-1 space-y-4">
          <Card className="p-6 rounded-2xl bg-white border border-slate-200 text-center space-y-4">
            {/* Avatar */}
            <div className="flex justify-center">
              <div className="relative">
                <Avatar className="h-20 w-20 border-4 border-violet-200 shadow-lg">
                  <AvatarFallback className="bg-gradient-to-br from-violet-500 to-purple-600 text-white text-2xl font-extrabold">
                    {loading ? "..." : getInitials(displayName)}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-1 -right-1 bg-violet-600 rounded-full p-1">
                  <Sparkles className="h-3 w-3 text-white" />
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-lg font-extrabold text-slate-900">
                {loading ? "..." : displayName}
              </h2>
              <p className="text-sm text-slate-500 mt-0.5">{email}</p>
              <Badge className="mt-2 bg-violet-100 text-violet-700 border-violet-200 text-xs font-bold">
                ✦ Mentor UpdatePTN
              </Badge>
            </div>

            {profile?.specialization && (
              <div className="bg-slate-50 rounded-xl p-3">
                <p className="text-xs text-slate-400 font-semibold mb-1">
                  Spesialisasi
                </p>
                <p className="text-sm font-bold text-slate-700">
                  {profile.specialization}
                </p>
              </div>
            )}

            {profile?.bio && (
              <p className="text-xs text-slate-500 text-left leading-relaxed">
                {profile.bio}
              </p>
            )}

            {/* Education Badge */}
            {profile?.education && profile.education.length > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-left space-y-2">
                <div className="flex items-center gap-1.5 mb-1">
                  <GraduationCap className="h-3.5 w-3.5 text-blue-600" />
                  <p className="text-xs text-blue-600 font-bold">Alumni</p>
                </div>
                {profile.education.slice(0, 2).map((edu, index) => (
                  <div key={index} className="text-xs">
                    <p className="font-bold text-blue-900">
                      {edu.degree} {edu.major}
                    </p>
                    <p className="text-blue-700 text-[11px]">
                      {edu.university}
                    </p>
                    <p className="text-blue-600 text-[10px]">
                      {edu.start_year} - {edu.end_year}
                    </p>
                  </div>
                ))}
                {profile.education.length > 2 && (
                  <p className="text-[10px] text-blue-600 font-semibold">
                    +{profile.education.length - 2} lainnya
                  </p>
                )}
              </div>
            )}
          </Card>

          {/* Stats Card */}
          <Card className="p-5 rounded-2xl bg-gradient-to-br from-violet-50 to-purple-50 border border-violet-200/60">
            <p className="text-xs font-bold text-violet-700 mb-4">
              📊 Kontribusi Saya
            </p>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-violet-100 rounded-lg">
                    <Video className="h-3.5 w-3.5 text-violet-600" />
                  </div>
                  <span className="text-xs font-semibold text-slate-600">
                    Live Class
                  </span>
                </div>
                <span className="text-sm font-extrabold text-slate-900">
                  {stats.liveClass}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-blue-100 rounded-lg">
                    <PlaySquare className="h-3.5 w-3.5 text-blue-600" />
                  </div>
                  <span className="text-xs font-semibold text-slate-600">
                    Video
                  </span>
                </div>
                <span className="text-sm font-extrabold text-slate-900">
                  {stats.video}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-emerald-100 rounded-lg">
                    <BookOpen className="h-3.5 w-3.5 text-emerald-600" />
                  </div>
                  <span className="text-xs font-semibold text-slate-600">
                    Modul
                  </span>
                </div>
                <span className="text-sm font-extrabold text-slate-900">
                  {stats.modul}
                </span>
              </div>
            </div>
          </Card>
        </div>

        {/* Edit Form */}
        <div className="lg:col-span-2">
          <Card className="p-6 rounded-2xl bg-white border border-slate-200">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-base font-extrabold text-slate-900">
                Informasi Akun
              </h3>
              {!isEditing ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditing(true)}
                  className="rounded-xl border-violet-200 text-violet-700 hover:bg-violet-50 gap-1.5 text-xs font-bold"
                >
                  <Pencil className="h-3.5 w-3.5" />
                  Edit Profil
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setIsEditing(false);
                      // Reset form
                      if (profile) {
                        setFormData({
                          full_name: profile.full_name || "",
                          phone: profile.phone || "",
                          specialization: profile.specialization || "",
                          bio: profile.bio || "",
                        });
                      }
                    }}
                    className="rounded-xl text-xs font-bold"
                  >
                    <X className="h-3.5 w-3.5 mr-1" />
                    Batal
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleSave}
                    disabled={isSaving}
                    className="bg-violet-600 hover:bg-violet-700 text-white rounded-xl gap-1.5 text-xs font-bold"
                  >
                    <Save className="h-3.5 w-3.5" />
                    {isSaving ? "Menyimpan..." : "Simpan"}
                  </Button>
                </div>
              )}
            </div>

            <div className="space-y-5">
              {/* Email (read only) */}
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-500 flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5" />
                  Email Akun
                </Label>
                <div className="px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-500 font-medium">
                  {email || "—"}
                </div>
                <p className="text-[11px] text-slate-400">
                  Email tidak dapat diubah
                </p>
              </div>

              {/* Full Name */}
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <UserCircle2 className="h-3.5 w-3.5 text-violet-500" />
                  Nama Lengkap
                </Label>
                {isEditing ? (
                  <Input
                    value={formData.full_name}
                    onChange={(e) =>
                      setFormData({ ...formData, full_name: e.target.value })
                    }
                    placeholder="Nama lengkap Anda"
                    className="rounded-xl border-slate-200 focus:ring-violet-500/20 focus:border-violet-400"
                  />
                ) : (
                  <div className="px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700">
                    {formData.full_name || "—"}
                  </div>
                )}
              </div>

              {/* Phone */}
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Phone className="h-3.5 w-3.5 text-slate-400" />
                  Nomor HP
                </Label>
                {isEditing ? (
                  <Input
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    placeholder="08xxxxxxxxxx"
                    className="rounded-xl"
                  />
                ) : (
                  <div className="px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700">
                    {formData.phone || "—"}
                  </div>
                )}
              </div>

              {/* Specialization */}
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <BookOpen className="h-3.5 w-3.5 text-violet-500" />
                  Spesialisasi Mengajar
                </Label>
                {isEditing ? (
                  <Input
                    value={formData.specialization}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        specialization: e.target.value,
                      })
                    }
                    placeholder="Contoh: Penalaran Umum & Matematika (Alumni UI)"
                    className="rounded-xl"
                  />
                ) : (
                  <div className="px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700">
                    {formData.specialization || "—"}
                  </div>
                )}
              </div>

              {/* Bio */}
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-700">Bio</Label>
                {isEditing ? (
                  <textarea
                    value={formData.bio}
                    onChange={(e) =>
                      setFormData({ ...formData, bio: e.target.value })
                    }
                    placeholder="Ceritakan sedikit tentang diri Anda sebagai mentor..."
                    rows={4}
                    className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm text-slate-700 resize-none focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400"
                  />
                ) : (
                  <div className="px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 min-h-[80px]">
                    {formData.bio || (
                      <span className="text-slate-400">—</span>
                    )}
                  </div>
                )}
              </div>
            </div>
          </Card>

          {/* Education History Card */}
          <Card className="p-6 rounded-2xl bg-white border border-slate-200 mt-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5 text-blue-600" />
                <h3 className="text-base font-extrabold text-slate-900">
                  Jejak Pendidikan
                </h3>
              </div>
              {!isEditingEducation ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditingEducation(true)}
                  className="rounded-xl border-blue-200 text-blue-700 hover:bg-blue-50 gap-1.5 text-xs font-bold"
                >
                  <Pencil className="h-3.5 w-3.5" />
                  Edit
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setIsEditingEducation(false);
                      // Reset
                      if (profile) {
                        setEducationList(profile.education || []);
                      }
                    }}
                    className="rounded-xl text-xs font-bold"
                  >
                    <X className="h-3.5 w-3.5 mr-1" />
                    Batal
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleSave}
                    disabled={isSaving}
                    className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl gap-1.5 text-xs font-bold"
                  >
                    <Save className="h-3.5 w-3.5" />
                    {isSaving ? "Menyimpan..." : "Simpan"}
                  </Button>
                </div>
              )}
            </div>

            <div className="space-y-4">
              {educationList.length === 0 && !isEditingEducation && (
                <div className="text-center py-8 px-4 bg-slate-50 rounded-xl border border-slate-200">
                  <GraduationCap className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-sm text-slate-400">
                    Belum ada jejak pendidikan
                  </p>
                </div>
              )}

              {educationList.map((edu, index) => (
                <div
                  key={edu.id}
                  className="border border-slate-200 rounded-xl p-4 bg-slate-50/50"
                >
                  <div className="flex items-start justify-between mb-3">
                    <Badge className="bg-blue-100 text-blue-700 border-blue-200 text-xs font-bold">
                      Pendidikan {index + 1}
                    </Badge>
                    {isEditingEducation && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeEducation(edu.id)}
                        className="h-7 w-7 p-0 hover:bg-red-50 hover:text-red-600"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {/* Degree */}
                    <div className="space-y-1.5">
                      <Label className="text-xs font-bold text-slate-700">
                        Jenjang
                      </Label>
                      {isEditingEducation ? (
                        <select
                          value={edu.degree}
                          onChange={(e) =>
                            updateEducation(edu.id, "degree", e.target.value)
                          }
                          className="w-full h-10 px-3 rounded-lg border border-slate-200 text-sm font-semibold text-slate-700"
                        >
                          <option value="S1">S1</option>
                          <option value="S2">S2</option>
                          <option value="S3">S3</option>
                          <option value="D3">D3</option>
                          <option value="D4">D4</option>
                        </select>
                      ) : (
                        <div className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-semibold text-slate-700">
                          {edu.degree || "—"}
                        </div>
                      )}
                    </div>

                    {/* University */}
                    <div className="space-y-1.5">
                      <Label className="text-xs font-bold text-slate-700">
                        Universitas
                      </Label>
                      {isEditingEducation ? (
                        <Input
                          value={edu.university}
                          onChange={(e) =>
                            updateEducation(edu.id, "university", e.target.value)
                          }
                          placeholder="Nama universitas"
                          className="rounded-lg"
                        />
                      ) : (
                        <div className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-semibold text-slate-700">
                          {edu.university || "—"}
                        </div>
                      )}
                    </div>

                    {/* Faculty */}
                    <div className="space-y-1.5">
                      <Label className="text-xs font-bold text-slate-700">
                        Fakultas
                      </Label>
                      {isEditingEducation ? (
                        <Input
                          value={edu.faculty}
                          onChange={(e) =>
                            updateEducation(edu.id, "faculty", e.target.value)
                          }
                          placeholder="Nama fakultas"
                          className="rounded-lg"
                        />
                      ) : (
                        <div className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-semibold text-slate-700">
                          {edu.faculty || "—"}
                        </div>
                      )}
                    </div>

                    {/* Major */}
                    <div className="space-y-1.5">
                      <Label className="text-xs font-bold text-slate-700">
                        Jurusan
                      </Label>
                      {isEditingEducation ? (
                        <Input
                          value={edu.major}
                          onChange={(e) =>
                            updateEducation(edu.id, "major", e.target.value)
                          }
                          placeholder="Nama jurusan"
                          className="rounded-lg"
                        />
                      ) : (
                        <div className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-semibold text-slate-700">
                          {edu.major || "—"}
                        </div>
                      )}
                    </div>

                    {/* Start Year */}
                    <div className="space-y-1.5">
                      <Label className="text-xs font-bold text-slate-700">
                        Tahun Mulai
                      </Label>
                      {isEditingEducation ? (
                        <Input
                          value={edu.start_year}
                          onChange={(e) =>
                            updateEducation(edu.id, "start_year", e.target.value)
                          }
                          placeholder="2018"
                          className="rounded-lg"
                        />
                      ) : (
                        <div className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-semibold text-slate-700">
                          {edu.start_year || "—"}
                        </div>
                      )}
                    </div>

                    {/* End Year */}
                    <div className="space-y-1.5">
                      <Label className="text-xs font-bold text-slate-700">
                        Tahun Lulus
                      </Label>
                      {isEditingEducation ? (
                        <Input
                          value={edu.end_year}
                          onChange={(e) =>
                            updateEducation(edu.id, "end_year", e.target.value)
                          }
                          placeholder="2022"
                          className="rounded-lg"
                        />
                      ) : (
                        <div className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-semibold text-slate-700">
                          {edu.end_year || "—"}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {isEditingEducation && (
                <Button
                  variant="outline"
                  onClick={addEducation}
                  className="w-full h-10 border-2 border-dashed border-blue-200 text-blue-700 hover:bg-blue-50 hover:border-blue-300 rounded-xl gap-2 font-bold"
                >
                  <Plus className="h-4 w-4" />
                  Tambah Pendidikan
                </Button>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
