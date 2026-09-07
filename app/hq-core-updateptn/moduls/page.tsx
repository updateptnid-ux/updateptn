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
  Video,
  FileText,
  Save,
  X,
  Eye,
  Download,
} from "lucide-react";

interface Modul {
  id: string;
  type: "video" | "pdf";
  category: string;
  title: string;
  thumbnail_url: string;
  content_url: string;
  duration?: string;
  pages?: number;
  views?: number;
  downloads?: number;
  rating?: number;
  is_premium: boolean;
  is_active: boolean;
  created_at: string;
}

export default function AdminModulsPage() {
  const [moduls, setModuls] = useState<Modul[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingModul, setEditingModul] = useState<Modul | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState({
    type: "video" as "video" | "pdf",
    category: "PU",
    title: "",
    thumbnail_url: "",
    content_url: "",
    duration: "",
    pages: 0,
    is_premium: false,
    is_active: true,
  });

  useEffect(() => {
    fetchModuls();
  }, []);

  const fetchModuls = async () => {
    try {
      setLoading(true);
      const supabase = createClient();
      const { data, error } = await supabase
        .from("moduls")
        .select("*")
        .order("created_at", { ascending: false });

      if (!error && data) {
        setModuls(data as Modul[]);
      }
    } catch (err) {
      console.error("Error fetching moduls:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingModul(null);
    setFormData({
      type: "video",
      category: "PU",
      title: "",
      thumbnail_url: "",
      content_url: "",
      duration: "",
      pages: 0,
      is_premium: false,
      is_active: true,
    });
    setIsDialogOpen(true);
  };

  const handleEdit = (modul: Modul) => {
    setEditingModul(modul);
    setFormData({
      type: modul.type,
      category: modul.category,
      title: modul.title,
      thumbnail_url: modul.thumbnail_url,
      content_url: modul.content_url,
      duration: modul.duration || "",
      pages: modul.pages || 0,
      is_premium: modul.is_premium,
      is_active: modul.is_active,
    });
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      const supabase = createClient();

      if (editingModul) {
        const { error } = await supabase
          .from("moduls")
          .update(formData)
          .eq("id", editingModul.id);

        if (error) throw error;
      } else {
        const { error } = await supabase.from("moduls").insert([formData]);
        if (error) throw error;
      }

      setIsDialogOpen(false);
      fetchModuls();
    } catch (err) {
      console.error("Error saving modul:", err);
      alert("Gagal menyimpan modul: " + (err as Error).message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Yakin ingin menghapus modul ini?")) return;

    try {
      const supabase = createClient();
      const { error } = await supabase.from("moduls").delete().eq("id", id);
      if (error) throw error;
      fetchModuls();
    } catch (err) {
      console.error("Error deleting modul:", err);
      alert("Gagal menghapus modul: " + (err as Error).message);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900">Manajemen Modul Belajar</h1>
          <p className="text-sm text-slate-600 mt-1">
            Kelola video pembelajaran dan modul PDF untuk siswa
          </p>
        </div>
        <Button
          onClick={handleCreate}
          className="bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-xl gap-2"
        >
          <Plus className="h-4 w-4" />
          <span>Tambah Modul Baru</span>
        </Button>
      </div>

      <Card className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-500">Memuat data modul...</div>
        ) : moduls.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            Belum ada modul. Klik tombol "Tambah Modul Baru" untuk menambahkan.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50">
                <TableHead className="font-bold">Judul Modul</TableHead>
                <TableHead className="font-bold">Tipe</TableHead>
                <TableHead className="font-bold">Kategori</TableHead>
                <TableHead className="font-bold">Stats</TableHead>
                <TableHead className="font-bold">Status</TableHead>
                <TableHead className="font-bold text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {moduls.map((modul) => (
                <TableRow key={modul.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-16 bg-slate-100 rounded-lg overflow-hidden shrink-0">
                        {modul.thumbnail_url && (
                          <img
                            src={modul.thumbnail_url}
                            alt={modul.title}
                            className="w-full h-full object-cover"
                          />
                        )}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 text-sm">{modul.title}</p>
                        <p className="text-xs text-slate-500">
                          {modul.type === "video" ? modul.duration : `${modul.pages} Halaman`}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {modul.type === "video" ? (
                      <Badge className="bg-blue-100 text-blue-700 border-blue-200 text-xs gap-1">
                        <Video className="h-3 w-3" />
                        Video
                      </Badge>
                    ) : (
                      <Badge className="bg-slate-100 text-slate-700 border-slate-200 text-xs gap-1">
                        <FileText className="h-3 w-3" />
                        PDF
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <span className="text-xs font-semibold text-slate-600">{modul.category}</span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3 text-xs text-slate-600">
                      {modul.type === "video" ? (
                        <div className="flex items-center gap-1">
                          <Eye className="h-3.5 w-3.5" />
                          <span>{modul.views?.toLocaleString() || 0}</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1">
                          <Download className="h-3.5 w-3.5" />
                          <span>{modul.downloads?.toLocaleString() || 0}</span>
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {modul.is_premium ? (
                        <Badge className="bg-amber-100 text-amber-700 border-amber-200 text-xs">
                          Premium
                        </Badge>
                      ) : (
                        <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 text-xs">
                          Gratis
                        </Badge>
                      )}
                      {modul.is_active && (
                        <Badge className="bg-blue-100 text-blue-700 border-blue-200 text-xs">
                          Aktif
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(modul)}
                        className="h-8 px-3 rounded-lg"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDelete(modul.id)}
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
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingModul ? "Edit Modul" : "Tambah Modul Baru"}
            </DialogTitle>
            <DialogDescription>
              Lengkapi form di bawah untuk {editingModul ? "mengupdate" : "menambahkan"} modul belajar.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Tipe Modul *</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) =>
                    setFormData({ ...formData, type: (value as any) || "video" })
                  }
                >
                  <SelectTrigger className="rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="video">Video</SelectItem>
                    <SelectItem value="pdf">PDF</SelectItem>
                  </SelectContent>
                </Select>
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
                    <SelectItem value="PU">Penalaran Umum (PU)</SelectItem>
                    <SelectItem value="PK">Pengetahuan Kuantitatif (PK)</SelectItem>
                    <SelectItem value="PM">Penalaran Matematika (PM)</SelectItem>
                    <SelectItem value="PBM">Literasi Bahasa Indonesia (LBI)</SelectItem>
                    <SelectItem value="LBI">Literasi Bahasa Inggris (LBE)</SelectItem>
                    <SelectItem value="PPU">Pemahaman Bacaan (PB)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Judul Modul *</Label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Konsep Dasar IRT & Strategi Pengerjaan"
                className="rounded-xl"
              />
            </div>

            <div className="space-y-2">
              <Label>URL Thumbnail</Label>
              <Input
                value={formData.thumbnail_url}
                onChange={(e) =>
                  setFormData({ ...formData, thumbnail_url: e.target.value })
                }
                placeholder="https://..."
                className="rounded-xl"
              />
            </div>

            <div className="space-y-2">
              <Label>URL Konten ({formData.type === "video" ? "Video" : "PDF"}) *</Label>
              <Input
                value={formData.content_url}
                onChange={(e) =>
                  setFormData({ ...formData, content_url: e.target.value })
                }
                placeholder={
                  formData.type === "video"
                    ? "https://youtube.com/watch?v=..."
                    : "https://storage.../modul.pdf"
                }
                className="rounded-xl"
              />
            </div>

            {formData.type === "video" ? (
              <div className="space-y-2">
                <Label>Durasi Video</Label>
                <Input
                  value={formData.duration}
                  onChange={(e) =>
                    setFormData({ ...formData, duration: e.target.value })
                  }
                  placeholder="12:45"
                  className="rounded-xl"
                />
              </div>
            ) : (
              <div className="space-y-2">
                <Label>Jumlah Halaman</Label>
                <Input
                  type="number"
                  value={formData.pages}
                  onChange={(e) =>
                    setFormData({ ...formData, pages: parseInt(e.target.value) || 0 })
                  }
                  placeholder="24"
                  className="rounded-xl"
                />
              </div>
            )}

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
              disabled={isSaving || !formData.title || !formData.content_url}
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

