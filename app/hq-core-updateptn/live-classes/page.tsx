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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Plus,
  Pencil,
  Trash2,
  Calendar,
  Clock,
  Save,
  X,
  Radio,
  Link as LinkIcon,
  FileText,
  Video,
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

export default function AdminLiveClassesPage() {
  const [liveClasses, setLiveClasses] = useState<LiveClass[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<LiveClass | null>(null);
  const [isSaving, setIsSaving] = useState(false);

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
    fetchLiveClasses();
  }, []);

  const fetchLiveClasses = async () => {
    try {
      setLoading(true);
      const supabase = createClient();
      const { data, error } = await supabase
        .from("live_classes")
        .select("*")
        .order("scheduled_at", { ascending: false });

      if (!error && data) {
        setLiveClasses(data as LiveClass[]);
      }
    } catch (err) {
      console.error("Error fetching live classes:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingClass(null);
    setFormData({
      title: "",
      tutor_name: "",
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

  const handleEdit = (liveClass: LiveClass) => {
    setEditingClass(liveClass);
    setFormData({
      title: liveClass.title,
      tutor_name: liveClass.tutor_name,
      tutor_avatar_url: liveClass.tutor_avatar_url,
      category: liveClass.category,
      scheduled_at: liveClass.scheduled_at,
      time: liveClass.time,
      meeting_url: liveClass.meeting_url,
      replay_url: liveClass.replay_url || "",
      material_url: liveClass.material_url || "",
      status: liveClass.status,
      is_premium: liveClass.is_premium,
      is_active: liveClass.is_active,
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
        const { error } = await supabase.from("live_classes").insert([formData]);
        if (error) throw error;
      }

      setIsDialogOpen(false);
      fetchLiveClasses();
    } catch (err) {
      console.error("Error saving live class:", err);
      alert("Gagal menyimpan live class: " + (err as Error).message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Yakin ingin menghapus live class ini?")) return;

    try {
      const supabase = createClient();
      const { error } = await supabase.from("live_classes").delete().eq("id", id);
      if (error) throw error;
      fetchLiveClasses();
    } catch (err) {
      console.error("Error deleting live class:", err);
      alert("Gagal menghapus live class: " + (err as Error).message);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("id-ID", {
      weekday: "long",
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900">Manajemen Live Class</h1>
          <p className="text-sm text-slate-600 mt-1">
            Kelola jadwal dan link streaming live class untuk siswa
          </p>
        </div>
        <Button
          onClick={handleCreate}
          className="bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-xl gap-2"
        >
          <Plus className="h-4 w-4" />
          <span>Tambah Live Class</span>
        </Button>
      </div>

      <Card className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-500">Memuat data live class...</div>
        ) : liveClasses.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            Belum ada live class. Klik tombol "Tambah Live Class" untuk menambahkan.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50">
                <TableHead className="font-bold">Judul & Tutor</TableHead>
                <TableHead className="font-bold">Kategori</TableHead>
                <TableHead className="font-bold">Jadwal</TableHead>
                <TableHead className="font-bold">Status</TableHead>
                <TableHead className="font-bold">Link</TableHead>
                <TableHead className="font-bold text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {liveClasses.map((liveClass) => (
                <TableRow key={liveClass.id}>
                  <TableCell>
                    <div className="space-y-1">
                      <p className="font-bold text-slate-900 text-sm">{liveClass.title}</p>
                      <p className="text-xs text-slate-500">👤 {liveClass.tutor_name}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-xs font-semibold text-slate-600">
                      {liveClass.category}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1 text-xs">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-3.5 w-3.5 text-slate-400" />
                        <span>{formatDate(liveClass.scheduled_at)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-3.5 w-3.5 text-slate-400" />
                        <span>{liveClass.time}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      {liveClass.status === "upcoming" && (
                        <Badge className="bg-blue-100 text-blue-700 border-blue-200 text-xs gap-1">
                          <Radio className="h-3 w-3" />
                          Upcoming
                        </Badge>
                      )}
                      {liveClass.status === "ongoing" && (
                        <Badge className="bg-red-100 text-red-700 border-red-200 text-xs gap-1">
                          <Radio className="h-3 w-3 animate-pulse" />
                          Live Now
                        </Badge>
                      )}
                      {liveClass.status === "completed" && (
                        <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 text-xs gap-1">
                          <Video className="h-3 w-3" />
                          Selesai
                        </Badge>
                      )}
                      {liveClass.is_premium && (
                        <Badge className="bg-amber-100 text-amber-700 border-amber-200 text-xs">
                          Premium
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1 text-xs">
                      {liveClass.meeting_url && (
                        <a
                          href={liveClass.meeting_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline flex items-center gap-1"
                        >
                          <LinkIcon className="h-3 w-3" />
                          Meeting
                        </a>
                      )}
                      {liveClass.replay_url && (
                        <a
                          href={liveClass.replay_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline flex items-center gap-1"
                        >
                          <Video className="h-3 w-3" />
                          Replay
                        </a>
                      )}
                      {liveClass.material_url && (
                        <a
                          href={liveClass.material_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline flex items-center gap-1"
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
                        onClick={() => handleEdit(liveClass)}
                        className="h-8 px-3 rounded-lg"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDelete(liveClass.id)}
                        className="h-8 px-3 rounded-lg text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingClass ? "Edit Live Class" : "Tambah Live Class Baru"}
            </DialogTitle>
            <DialogDescription>
              Lengkapi form di bawah untuk {editingClass ? "mengupdate" : "menambahkan"} live class.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Judul Live Class *</Label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Bedah Pola Soal TPS: Penalaran Umum"
                className="rounded-xl"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Nama Tutor *</Label>
                <Input
                  value={formData.tutor_name}
                  onChange={(e) =>
                    setFormData({ ...formData, tutor_name: e.target.value })
                  }
                  placeholder="Dr. Budi Santoso, M.Pd (Alumni UI)"
                  className="rounded-xl"
                />
              </div>

              <div className="space-y-2">
                <Label>Kategori *</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) =>
                    setFormData({ ...formData, category: value || "" })
                  }
                >
                  <SelectTrigger className="rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PENALARAN UMUM">Penalaran Umum</SelectItem>
                    <SelectItem value="PENGETAHUAN KUANTITATIF">Pengetahuan Kuantitatif</SelectItem>
                    <SelectItem value="LITERASI INDONESIA">Literasi Indonesia</SelectItem>
                    <SelectItem value="LITERASI INGGRIS">Literasi Inggris</SelectItem>
                    <SelectItem value="PENALARAN MATEMATIKA">Penalaran Matematika</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Tanggal *</Label>
                <Input
                  type="date"
                  value={formData.scheduled_at}
                  onChange={(e) =>
                    setFormData({ ...formData, scheduled_at: e.target.value })
                  }
                  className="rounded-xl"
                />
              </div>

              <div className="space-y-2">
                <Label>Waktu *</Label>
                <Input
                  value={formData.time}
                  onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                  placeholder="14:00 - 16:00 WIB"
                  className="rounded-xl"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Link Meeting (Zoom/Google Meet) *</Label>
              <Input
                value={formData.meeting_url}
                onChange={(e) =>
                  setFormData({ ...formData, meeting_url: e.target.value })
                }
                placeholder="https://zoom.us/j/..."
                className="rounded-xl"
              />
            </div>

            <div className="space-y-2">
              <Label>Link Replay (YouTube/Vimeo)</Label>
              <Input
                value={formData.replay_url}
                onChange={(e) =>
                  setFormData({ ...formData, replay_url: e.target.value })
                }
                placeholder="https://youtube.com/watch?v=..."
                className="rounded-xl"
              />
            </div>

            <div className="space-y-2">
              <Label>Link Modul PDF</Label>
              <Input
                value={formData.material_url}
                onChange={(e) =>
                  setFormData({ ...formData, material_url: e.target.value })
                }
                placeholder="https://storage.../modul.pdf"
                className="rounded-xl"
              />
            </div>

            <div className="space-y-2">
              <Label>Status *</Label>
              <Select
                value={formData.status}
                onValueChange={(value) =>
                  setFormData({ ...formData, status: (value as any) || "upcoming" })
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

            <div className="flex items-center gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.is_premium}
                  onChange={(e) =>
                    setFormData({ ...formData, is_premium: e.target.checked })
                  }
                  className="rounded"
                />
                <span className="text-sm font-semibold">Konten Premium</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.is_active}
                  onChange={(e) =>
                    setFormData({ ...formData, is_active: e.target.checked })
                  }
                  className="rounded"
                />
                <span className="text-sm font-semibold">Aktifkan sekarang</span>
              </label>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDialogOpen(false)}
              className="rounded-xl"
            >
              <X className="h-4 w-4 mr-2" />
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
              className="bg-blue-500 hover:bg-blue-600 text-white rounded-xl"
            >
              {isSaving ? (
                <span>Menyimpan...</span>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  <span>Simpan</span>
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
