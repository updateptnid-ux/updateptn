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
        <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-xl px-4 py-3">
          <CheckCircle2 className="h-4 w-4 text-blue-600 shrink-0" />
          <span className="text-sm font-semibold text-blue-700">
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
              <p className="text-sm text-slate-500 mt-0.5">{email}</p>
              <Badge className="mt-2 bg-blue-100 text-blue-700 border-blue-200 text-xs font-bold">
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
          </Card>

          {/* Stats Card */}
          <Card className="p-5 rounded-2xl bg-gradient-to-br from-blue-50 to-blue-50 border border-blue-200/60">
            <p className="text-xs font-bold text-blue-700 mb-4">
              📊 Kontribusi Saya
            </p>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-blue-100 rounded-lg">
                    <Video className="h-3.5 w-3.5 text-blue-600" />
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
                  <div className="p-1.5 bg-blue-50 rounded-lg">
                    <BookOpen className="h-3.5 w-3.5 text-blue-600" />
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
                  className="rounded-xl border-blue-200 text-blue-700 hover:bg-blue-50 gap-1.5 text-xs font-bold"
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
                    className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl gap-1.5 text-xs font-bold"
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
                  <UserCircle2 className="h-3.5 w-3.5 text-blue-500" />
                  Nama Lengkap
                </Label>
                {isEditing ? (
                  <Input
                    value={formData.full_name}
                    onChange={(e) =>
                      setFormData({ ...formData, full_name: e.target.value })
                    }
                    placeholder="Nama lengkap Anda"
                    className="rounded-xl border-slate-200 focus:ring-blue-500/20 focus:border-blue-400"
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
                  <BookOpen className="h-3.5 w-3.5 text-blue-500" />
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
                    className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm text-slate-700 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
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
        </div>
      </div>
    </div>
  );
}
