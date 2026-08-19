"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Plus,
  Pencil,
  Trash2,
  Calendar,
  Clock,
  Save,
  X,
  Radio,
  Video,
  Link as LinkIcon,
  FileText,
  Search,
} from "lucide-react";

interface LiveClass {
  id: string;
  title: string;
  tutor_name: string;
  tutor_avatar_url: string;
  category: string;
  scheduled_at: string;
  time: string;
  meeting_url: string;
  replay_url?: string;
  material_url?: string;
  status: "upcoming" | "ongoing" | "completed";
  is_premium: boolean;
  is_active: boolean;
  created_at: string;
}

const CATEGORIES = [
  "PENALARAN UMUM",
  "PENGETAHUAN KUANTITATIF",
  "LITERASI INDONESIA",
  "LITERASI INGGRIS",
  "PENALARAN MATEMATIKA",
];

const statusConfig: Record<
  string,
  { label: string; color: string; dotColor: string }
> = {
  upcoming: {
    label: "Upcoming",
    color: "bg-blue-100 text-blue-700 border-blue-200",
    dotColor: "bg-blue-500",
  },
  ongoing: {
    label: "Live Now",
    color: "bg-red-100 text-red-700 border-red-200",
    dotColor: "bg-red-500",
  },
  completed: {
    label: "Selesai",
    color: "bg-emerald-100 text-emerald-700 border-emerald-200",
    dotColor: "bg-emerald-500",
  },
};

export default function MentorLiveClassPage() {
  const [liveClasses, setLiveClasses] = useState<LiveClass[]>([]);
  const [filtered, setFiltered] = useState<LiveClass[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<LiveClass | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [mentorName, setMentorName] = useState("");

  const [formData, setFormData] = useState({
    title: "",
    tutor_name: "",
    tutor_avatar_url: "",
    category: "PENALARAN UMUM",
    scheduled_at: "",
    time: "",
    meeting_url: "",
    replay_url: "",
    material_url: "",
    status: "upcoming" as "upcoming" | "ongoing" | "completed",
    is_premium: false,
    is_active: true,
  });

  useEffect(() => {
    fetchMentorAndClasses();
  }, []);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setFiltered(liveClasses);
    } else {
      const q = searchQuery.toLowerCase();
      setFiltered(
        liveClasses.filter(
          (lc) =>
            lc.title.toLowerCase().includes(q) ||
            lc.category.toLowerCase().includes(q) ||
            lc.tutor_name.toLowerCase().includes(q)
        )
      );
    }
  }, [searchQuery, liveClasses]);

  const fetchMentorAndClasses = async () => {
    try {
      setLoading(true);
      const supabase = createClient();

      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", user.id)
        .maybeSingle();

      const name =
        profile?.full_name ||
        user.user_metadata?.full_name ||
        user.email?.split("@")[0] ||
        "";
      setMentorName(name);

      const { data, error } = await supabase
        .from("live_classes")
        .select("*")
        .order("scheduled_at", { ascending: false });

      if (!error && data) {
        setLiveClasses(data as LiveClass[]);
      }
    } catch (err) {
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingClass(null);
    setFormData({
      title: "",
      tutor_name: mentorName,
      tutor_avatar_url: "",
      category: "PENALARAN UMUM",
      scheduled_at: "",
      time: "",
      meeting_url: "",
      replay_url: "",
      material_url: "",
      status: "upcoming",
      is_premium: false,
      is_active: true,
    });
    setIsDialogOpen(true);
  };

  const handleEdit = (lc: LiveClass) => {
    setEditingClass(lc);
    setFormData({
      title: lc.title,
      tutor_name: lc.tutor_name,
      tutor_avatar_url: lc.tutor_avatar_url || "",
      category: lc.category,
      scheduled_at: lc.scheduled_at,
      time: lc.time,
      meeting_url: lc.meeting_url,
      replay_url: lc.replay_url || "",
      material_url: lc.material_url || "",
      status: lc.status,
      is_premium: lc.is_premium,
      is_active: lc.is_active,
    });
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      const supabase = createClient();

      if (editingClass) {
        const { error } = await supabase
          .from("live_classes")
          .update(formData)
          .eq("id", editingClass.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("live_classes")
          .insert([formData]);
        if (error) throw error;
      }

      setIsDialogOpen(false);
      fetchMentorAndClasses();
    } catch (err) {
      console.error("Error saving:", err);
      alert("Gagal menyimpan: " + (err as Error).message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Yakin ingin menghapus live class ini?")) return;
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("live_classes")
        .delete()
        .eq("id", id);
      if (error) throw error;
      fetchMentorAndClasses();
    } catch (err) {
      alert("Gagal menghapus: " + (err as Error).message);
    }
  };

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString("id-ID", {
      weekday: "long",
      day: "numeric",
      month: "short",
      year: "numeric",
    });

  const countByStatus = (s: string) =>
    liveClasses.filter((lc) => lc.status === s).length;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">
            Live Class Saya
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Kelola jadwal live class dan link streaming untuk siswa
          </p>
        </div>
        <Button
          onClick={handleCreate}
          className="bg-violet-600 hover:bg-violet-700 text-white font-bold rounded-xl gap-2 shadow-md shadow-violet-200 shrink-0"
        >
          <Plus className="h-4 w-4" />
          Tambah Live Class
        </Button>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-3 gap-3">
        {["upcoming", "ongoing", "completed"].map((s) => {
          const cfg = statusConfig[s];
          return (
            <Card
              key={s}
              className="p-4 rounded-xl border border-slate-200 bg-white flex items-center gap-3"
            >
              <div
                className={`h-2.5 w-2.5 rounded-full ${cfg.dotColor} shrink-0 ${s === "ongoing" ? "animate-pulse" : ""}`}
              />
              <div>
                <p className="text-lg font-extrabold text-slate-900">
                  {countByStatus(s)}
                </p>
                <p className="text-[11px] text-slate-400 font-semibold">
                  {cfg.label}
                </p>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
        <Input
          placeholder="Cari live class..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9 rounded-xl border-slate-200 text-sm"
        />
      </div>

      {/* Table */}
      <Card className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="inline-flex items-center gap-2 text-slate-400">
              <Video className="h-5 w-5 animate-pulse" />
              <span className="text-sm font-semibold">Memuat data...</span>
            </div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <Video className="h-10 w-10 text-slate-200 mx-auto" />
            <p className="text-sm text-slate-400 font-semibold">
              {searchQuery
                ? "Tidak ada hasil untuk pencarian ini"
                : "Belum ada live class. Tambahkan yang pertama!"}
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50/80">
                <TableHead className="font-bold text-slate-700">
                  Judul & Tutor
                </TableHead>
                <TableHead className="font-bold text-slate-700">
                  Kategori
                </TableHead>
                <TableHead className="font-bold text-slate-700">
                  Jadwal
                </TableHead>
                <TableHead className="font-bold text-slate-700">
                  Status
                </TableHead>
                <TableHead className="font-bold text-slate-700">Link</TableHead>
                <TableHead className="font-bold text-slate-700 text-right">
                  Aksi
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((lc) => {
                const cfg = statusConfig[lc.status];
                return (
                  <TableRow
                    key={lc.id}
                    className="hover:bg-violet-50/30 transition-colors"
                  >
                    <TableCell>
                      <div className="space-y-0.5">
                        <p className="font-bold text-slate-900 text-sm">
                          {lc.title}
                        </p>
                        <p className="text-xs text-slate-400">
                          👤 {lc.tutor_name}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-lg">
                        {lc.category}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1 text-xs text-slate-600">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="h-3 w-3 text-slate-400" />
                          <span>{formatDate(lc.scheduled_at)}</span>
                        </div>
                        {lc.time && (
                          <div className="flex items-center gap-1.5">
                            <Clock className="h-3 w-3 text-slate-400" />
                            <span>{lc.time}</span>
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <Badge
                          className={`${cfg.color} border text-[10px] font-bold w-fit flex items-center gap-1`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${cfg.dotColor} ${lc.status === "ongoing" ? "animate-pulse" : ""}`}
                          />
                          {cfg.label}
                        </Badge>
                        {lc.is_premium && (
                          <Badge className="bg-amber-100 text-amber-700 border-amber-200 text-[10px] font-bold w-fit">
                            Premium
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1 text-xs">
                        {lc.meeting_url && (
                          <a
                            href={lc.meeting_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-violet-600 hover:underline flex items-center gap-1 font-semibold"
                          >
                            <LinkIcon className="h-3 w-3" />
                            Meeting
                          </a>
                        )}
                        {lc.replay_url && (
                          <a
                            href={lc.replay_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline flex items-center gap-1 font-semibold"
                          >
                            <Video className="h-3 w-3" />
                            Replay
                          </a>
                        )}
                        {lc.material_url && (
                          <a
                            href={lc.material_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-slate-500 hover:underline flex items-center gap-1"
                          >
                            <FileText className="h-3 w-3" />
                            Modul
                          </a>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(lc)}
                          className="h-8 px-3 rounded-lg hover:border-violet-300 hover:text-violet-700"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDelete(lc.id)}
                          className="h-8 px-3 rounded-lg text-red-500 hover:text-red-700 hover:bg-red-50 hover:border-red-200"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </Card>

      {/* Form Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-extrabold text-slate-900">
              {editingClass ? "Edit Live Class" : "Tambah Live Class Baru"}
            </DialogTitle>
            <DialogDescription className="text-sm text-slate-500">
              {editingClass ? "Perbarui" : "Isi"} detail live class di bawah
              ini.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-slate-700">
                Judul Live Class *
              </Label>
              <Input
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                placeholder="Contoh: Bedah Pola Soal TPS – Penalaran Umum"
                className="rounded-xl"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-700">
                  Nama Tutor *
                </Label>
                <Input
                  value={formData.tutor_name}
                  onChange={(e) =>
                    setFormData({ ...formData, tutor_name: e.target.value })
                  }
                  placeholder="Nama lengkap tutor"
                  className="rounded-xl"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-700">
                  Kategori *
                </Label>
                <Select
                  value={formData.category}
                  onValueChange={(v) =>
                    setFormData({ ...formData, category: v || "PENALARAN UMUM" })
                  }
                >
                  <SelectTrigger className="rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c
                          .split(" ")
                          .map(
                            (w) => w.charAt(0) + w.slice(1).toLowerCase()
                          )
                          .join(" ")}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-700">
                  Tanggal *
                </Label>
                <Input
                  type="date"
                  value={formData.scheduled_at}
                  onChange={(e) =>
                    setFormData({ ...formData, scheduled_at: e.target.value })
                  }
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-700">
                  Waktu
                </Label>
                <Input
                  value={formData.time}
                  onChange={(e) =>
                    setFormData({ ...formData, time: e.target.value })
                  }
                  placeholder="14:00 - 16:00 WIB"
                  className="rounded-xl"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-slate-700">
                Link Meeting (Zoom / Google Meet) *
              </Label>
              <Input
                value={formData.meeting_url}
                onChange={(e) =>
                  setFormData({ ...formData, meeting_url: e.target.value })
                }
                placeholder="https://zoom.us/j/..."
                className="rounded-xl"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-700">
                  Link Replay (YouTube)
                </Label>
                <Input
                  value={formData.replay_url}
                  onChange={(e) =>
                    setFormData({ ...formData, replay_url: e.target.value })
                  }
                  placeholder="https://youtube.com/..."
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-700">
                  Link Modul PDF
                </Label>
                <Input
                  value={formData.material_url}
                  onChange={(e) =>
                    setFormData({ ...formData, material_url: e.target.value })
                  }
                  placeholder="https://storage.../modul.pdf"
                  className="rounded-xl"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-slate-700">
                Status *
              </Label>
              <Select
                value={formData.status}
                onValueChange={(v) =>
                  setFormData({
                    ...formData,
                    status: (v as "upcoming" | "ongoing" | "completed") || "upcoming",
                  })
                }
              >
                <SelectTrigger className="rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="upcoming">Upcoming</SelectItem>
                  <SelectItem value="ongoing">Live Now</SelectItem>
                  <SelectItem value="completed">Selesai</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-6 pt-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.is_premium}
                  onChange={(e) =>
                    setFormData({ ...formData, is_premium: e.target.checked })
                  }
                  className="rounded accent-violet-600"
                />
                <span className="text-sm font-semibold text-slate-700">
                  Konten Premium
                </span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.is_active}
                  onChange={(e) =>
                    setFormData({ ...formData, is_active: e.target.checked })
                  }
                  className="rounded accent-violet-600"
                />
                <span className="text-sm font-semibold text-slate-700">
                  Aktifkan sekarang
                </span>
              </label>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setIsDialogOpen(false)}
              className="rounded-xl"
            >
              <X className="h-4 w-4 mr-1.5" />
              Batal
            </Button>
            <Button
              onClick={handleSave}
              disabled={
                isSaving ||
                !formData.title ||
                !formData.tutor_name ||
                !formData.scheduled_at ||
                !formData.meeting_url
              }
              className="bg-violet-600 hover:bg-violet-700 text-white rounded-xl gap-1.5"
            >
              {isSaving ? (
                <span>Menyimpan...</span>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Simpan
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
