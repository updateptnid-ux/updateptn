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
  DialogTrigger,
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
  Plus,
  Pencil,
  Trash2,
  Calendar,
  Clock,
  FileText,
  Save,
  X,
} from "lucide-react";

interface Tryout {
  id: string;
  title: string;
  description: string;
  duration_minutes: number;
  total_questions: number;
  scheduled_date: string;
  is_free: boolean;
  is_active: boolean;
  created_at: string;
}

export default function AdminTryoutsPage() {
  const [tryouts, setTryouts] = useState<Tryout[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTryout, setEditingTryout] = useState<Tryout | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    duration_minutes: 120,
    total_questions: 155,
    scheduled_date: "",
    is_free: true,
    is_active: true,
  });

  useEffect(() => {
    fetchTryouts();
  }, []);

  const fetchTryouts = async () => {
    try {
      setLoading(true);
      const supabase = createClient();
      const { data, error } = await supabase
        .from("tryouts")
        .select("*")
        .order("scheduled_date", { ascending: false });

      if (!error && data) {
        setTryouts(data as Tryout[]);
      }
    } catch (err) {
      console.error("Error fetching tryouts:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingTryout(null);
    setFormData({
      title: "",
      description: "",
      duration_minutes: 120,
      total_questions: 155,
      scheduled_date: new Date().toISOString().split("T")[0],
      is_free: true,
      is_active: true,
    });
    setIsDialogOpen(true);
  };

  const handleEdit = (tryout: Tryout) => {
    setEditingTryout(tryout);
    setFormData({
      title: tryout.title,
      description: tryout.description,
      duration_minutes: tryout.duration_minutes,
      total_questions: tryout.total_questions,
      scheduled_date: tryout.scheduled_date ? new Date(tryout.scheduled_date).toISOString().split("T")[0] : "",
      is_free: tryout.is_free,
      is_active: tryout.is_active,
    });
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      const supabase = createClient();

      if (editingTryout) {
        // Update existing
        const { error } = await supabase
          .from("tryouts")
          .update(formData)
          .eq("id", editingTryout.id);

        if (error) throw error;
      } else {
        // Create new
        const { error } = await supabase.from("tryouts").insert([formData]);

        if (error) throw error;
      }

      setIsDialogOpen(false);
      fetchTryouts();
    } catch (err) {
      console.error("Error saving tryout:", err);
      alert("Gagal menyimpan tryout: " + (err as Error).message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Yakin ingin menghapus tryout ini?")) return;

    try {
      const supabase = createClient();
      const { error } = await supabase.from("tryouts").delete().eq("id", id);

      if (error) throw error;

      fetchTryouts();
    } catch (err) {
      console.error("Error deleting tryout:", err);
      alert("Gagal menghapus tryout: " + (err as Error).message);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900">Manajemen Try Out</h1>
          <p className="text-sm text-slate-600 mt-1">
            Kelola jadwal Try Out UTBK untuk siswa
          </p>
        </div>
        <Button
          onClick={handleCreate}
          className="bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-xl gap-2"
        >
          <Plus className="h-4 w-4" />
          <span>Buat Try Out Baru</span>
        </Button>
      </div>

      {/* Table */}
      <Card className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-500">
            Memuat data tryout...
          </div>
        ) : tryouts.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            Belum ada tryout. Klik tombol "Buat Try Out Baru" untuk menambahkan.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50">
                <TableHead className="font-bold">Judul Try Out</TableHead>
                <TableHead className="font-bold">Tanggal Pelaksanaan</TableHead>
                <TableHead className="font-bold">Durasi</TableHead>
                <TableHead className="font-bold">Soal</TableHead>
                <TableHead className="font-bold">Akses</TableHead>
                <TableHead className="font-bold">Status</TableHead>
                <TableHead className="font-bold text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tryouts.map((tryout) => (
                <TableRow key={tryout.id}>
                  <TableCell>
                    <div className="space-y-1">
                      <p className="font-bold text-slate-900">{tryout.title}</p>
                      <p className="text-xs text-slate-500 line-clamp-1">
                        {tryout.description}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-slate-400" />
                      <span>{tryout.scheduled_date ? formatDate(tryout.scheduled_date) : "-"}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="h-4 w-4 text-slate-400" />
                      <span>{tryout.duration_minutes} menit</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 text-sm">
                      <FileText className="h-4 w-4 text-slate-400" />
                      <span>{tryout.total_questions} soal</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {tryout.is_free ? (
                      <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 text-xs">
                        Gratis
                      </Badge>
                    ) : (
                      <Badge className="bg-amber-100 text-amber-700 border-amber-200 text-xs">
                        Premium
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {tryout.is_active ? (
                        <Badge className="bg-blue-100 text-blue-700 border-blue-200 text-xs">
                          Aktif
                        </Badge>
                      ) : (
                        <Badge className="bg-slate-100 text-slate-700 border-slate-200 text-xs">
                          Draft
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(tryout)}
                        className="h-8 px-3 rounded-lg"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDelete(tryout.id)}
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

      {/* Dialog Form */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingTryout ? "Edit Try Out" : "Buat Try Out Baru"}
            </DialogTitle>
            <DialogDescription>
              Lengkapi form di bawah untuk {editingTryout ? "mengupdate" : "membuat"} try out.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Judul Try Out *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                placeholder="Try Out Nasional UTBK SNBT - Seri 01"
                className="rounded-xl"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Deskripsi</Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Simulasi lengkap TPS & Literasi..."
                className="rounded-xl"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="duration">Durasi (menit) *</Label>
                <Input
                  id="duration"
                  type="number"
                  value={formData.duration_minutes}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      duration_minutes: parseInt(e.target.value) || 0,
                    })
                  }
                  className="rounded-xl"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="total_questions">Total Soal *</Label>
                <Input
                  id="total_questions"
                  type="number"
                  value={formData.total_questions}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      total_questions: parseInt(e.target.value) || 0,
                    })
                  }
                  className="rounded-xl"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="scheduled_date">Tanggal Pelaksanaan *</Label>
              <Input
                id="scheduled_date"
                type="date"
                value={formData.scheduled_date}
                onChange={(e) =>
                  setFormData({ ...formData, scheduled_date: e.target.value })
                }
                className="rounded-xl"
              />
            </div>

            <div className="flex items-center gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.is_free}
                  onChange={(e) =>
                    setFormData({ ...formData, is_free: e.target.checked })
                  }
                  className="rounded"
                />
                <span className="text-sm font-semibold">Gratis untuk semua siswa</span>
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
              disabled={isSaving || !formData.title || !formData.scheduled_date}
              className="bg-blue-500 hover:bg-blue-600 text-white rounded-xl"
            >
              {isSaving ? (
                <>
                  <span>Menyimpan...</span>
                </>
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
