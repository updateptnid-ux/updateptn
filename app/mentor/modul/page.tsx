"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { insertModul, updateModul, deleteModul } from "@/actions/mentor-crud";
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
  Save,
  X,
  BookOpen,
  Search,
  ExternalLink,
  FileText,
} from "lucide-react";

interface ModulRecord {
  id: string;
  title: string;
  description?: string;
  category: string;
  pdf_url?: string;
  is_premium: boolean;
  order_index?: number;
  created_at: string;
}

const CATEGORIES = [
  "Penalaran Umum",
  "Pengetahuan Kuantitatif",
  "Literasi Indonesia",
  "Literasi Inggris",
  "Penalaran Matematika",
  "Umum",
];

export default function MentorModulPage() {
  const [moduls, setModuls] = useState<ModulRecord[]>([]);
  const [filtered, setFiltered] = useState<ModulRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingModul, setEditingModul] = useState<ModulRecord | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "Penalaran Umum",
    pdf_url: "",
    is_premium: false,
    order_index: 0,
  });

  useEffect(() => {
    fetchModuls();
  }, []);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setFiltered(moduls);
    } else {
      const q = searchQuery.toLowerCase();
      setFiltered(
        moduls.filter(
          (m) =>
            m.title.toLowerCase().includes(q) ||
            m.category.toLowerCase().includes(q)
        )
      );
    }
  }, [searchQuery, moduls]);

  const fetchModuls = async () => {
    try {
      setLoading(true);
      const supabase = createClient();
      const { data, error } = await supabase
        .from("moduls")
        .select("*")
        .order("created_at", { ascending: false });

      if (!error && data) {
        setModuls(data as ModulRecord[]);
      }
    } catch (err) {
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingModul(null);
    setFormData({
      title: "",
      description: "",
      category: "Penalaran Umum",
      pdf_url: "",
      is_premium: false,
      order_index: moduls.length + 1,
    });
    setIsDialogOpen(true);
  };

  const handleEdit = (m: ModulRecord) => {
    setEditingModul(m);
    setFormData({
      title: m.title,
      description: m.description || "",
      category: m.category,
      pdf_url: m.pdf_url || "",
      is_premium: m.is_premium || false,
      order_index: m.order_index || 0,
    });
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      let result;
      if (editingModul) {
        result = await updateModul(editingModul.id, formData);
      } else {
        result = await insertModul(formData);
      }
      if (!result.ok) throw new Error(result.message);
      setIsDialogOpen(false);
      fetchModuls();
    } catch (err) {
      alert("Gagal menyimpan: " + (err instanceof Error ? err.message : JSON.stringify(err)));
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Yakin ingin menghapus modul ini?")) return;
    try {
      const result = await deleteModul(id);
      if (!result.ok) throw new Error(result.message);
      fetchModuls();
    } catch (err) {
      alert("Gagal menghapus: " + (err instanceof Error ? err.message : JSON.stringify(err)));
    }
  };

  const categoryCount = (cat: string) =>
    moduls.filter((m) => m.category === cat).length;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">
            Modul Belajar
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Kelola materi belajar dan modul PDF untuk siswa
          </p>
        </div>
        <Button
          onClick={handleCreate}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl gap-2 shadow-md shadow-blue-200 shrink-0"
        >
          <Plus className="h-4 w-4" />
          Tambah Modul
        </Button>
      </div>

      {/* Category Breakdown */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {CATEGORIES.map((cat) => (
          <Card
            key={cat}
            className="p-3 rounded-xl border border-slate-200 bg-white text-center"
          >
            <p className="text-lg font-extrabold text-slate-900">
              {loading ? "—" : categoryCount(cat)}
            </p>
            <p className="text-[10px] text-slate-400 font-semibold leading-tight mt-0.5">
              {cat}
            </p>
          </Card>
        ))}
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
        <Input
          placeholder="Cari modul..."
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
              <BookOpen className="h-5 w-5 animate-pulse text-blue-400" />
              <span className="text-sm font-semibold">Memuat modul...</span>
            </div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <BookOpen className="h-10 w-10 text-slate-200 mx-auto" />
            <p className="text-sm text-slate-400 font-semibold">
              {searchQuery
                ? "Tidak ada modul yang cocok"
                : "Belum ada modul. Tambahkan yang pertama!"}
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50/80">
                <TableHead className="font-bold text-slate-700">
                  Judul Modul
                </TableHead>
                <TableHead className="font-bold text-slate-700">
                  Kategori
                </TableHead>
                <TableHead className="font-bold text-slate-700">
                  Deskripsi
                </TableHead>
                <TableHead className="font-bold text-slate-700">Tipe</TableHead>
                <TableHead className="font-bold text-slate-700">PDF</TableHead>
                <TableHead className="font-bold text-slate-700 text-right">
                  Aksi
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((m) => (
                <TableRow
                  key={m.id}
                  className="hover:bg-blue-50/30 transition-colors"
                >
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-blue-50 shrink-0">
                        <BookOpen className="h-4 w-4 text-blue-600" />
                      </div>
                      <span className="font-bold text-slate-900 text-sm">
                        {m.title}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-lg">
                      {m.category}
                    </span>
                  </TableCell>
                  <TableCell>
                    <p className="text-xs text-slate-500 max-w-xs truncate">
                      {m.description || "—"}
                    </p>
                  </TableCell>
                  <TableCell>
                    {m.is_premium ? (
                      <Badge className="bg-blue-50 text-blue-700 border-blue-200 text-[10px] font-bold">
                        Premium
                      </Badge>
                    ) : (
                      <Badge className="bg-slate-100 text-slate-500 border-slate-200 text-[10px] font-bold">
                        Gratis
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {m.pdf_url ? (
                      <a
                        href={m.pdf_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline flex items-center gap-1 text-xs font-semibold"
                      >
                        <FileText className="h-3 w-3" />
                        Buka PDF
                      </a>
                    ) : (
                      <span className="text-slate-300 text-xs">—</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(m)}
                        className="h-8 px-3 rounded-lg hover:border-emerald-300 hover:text-blue-700"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDelete(m.id)}
                        className="h-8 px-3 rounded-lg text-red-500 hover:text-red-700 hover:bg-red-50 hover:border-red-200"
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

      {/* Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-lg rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-extrabold text-slate-900">
              {editingModul ? "Edit Modul" : "Tambah Modul Baru"}
            </DialogTitle>
            <DialogDescription className="text-sm text-slate-500">
              {editingModul ? "Perbarui" : "Isi"} informasi modul belajar.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-slate-700">
                Judul Modul *
              </Label>
              <Input
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                placeholder="Contoh: Modul Silogisme & Penalaran Logis"
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
                  setFormData({ ...formData, category: v || "Penalaran Umum" })
                }
              >
                <SelectTrigger className="rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-slate-700">
                Deskripsi
              </Label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Ringkasan isi modul..."
                rows={3}
                className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm text-slate-700 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-slate-700">
                URL PDF / Google Drive
              </Label>
              <Input
                value={formData.pdf_url}
                onChange={(e) =>
                  setFormData({ ...formData, pdf_url: e.target.value })
                }
                placeholder="https://drive.google.com/..."
                className="rounded-xl"
              />
            </div>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.is_premium}
                onChange={(e) =>
                  setFormData({ ...formData, is_premium: e.target.checked })
                }
                className="rounded accent-blue-600"
              />
              <span className="text-sm font-semibold text-slate-700">
                Modul Premium (hanya untuk subscriber)
              </span>
            </label>
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
              disabled={isSaving || !formData.title}
              className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl gap-1.5"
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
