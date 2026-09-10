"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import CrudLayout from "@/components/admin/CrudLayout";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Edit, Trash2, Eye, EyeOff, ArrowUp, ArrowDown } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface SubtesModule {
  id: string;
  subtes_category: string;
  title: string;
  description: string;
  duration_minutes: number;
  total_questions: number;
  difficulty: string;
  order_index: number;
  is_active: boolean;
}

const subtesCategories = [
  // TES POTENSI SKOLASTIK (TPS)
  { value: "penalaran-umum", label: "Penalaran Umum (PU)" },
  { value: "pengetahuan-pemahaman-umum", label: "Pengetahuan & Pemahaman Umum (PPU)" },
  { value: "pemahaman-bacaan-menulis", label: "Pemahaman Bacaan & Menulis (PBM)" },
  { value: "pengetahuan-kuantitatif", label: "Pengetahuan Kuantitatif (PK)" },
  // TES LITERASI
  { value: "literasi-indonesia", label: "Literasi B. Indonesia" },
  { value: "literasi-inggris", label: "Literasi B. Inggris" },
  { value: "penalaran-matematika", label: "Penalaran Matematika (PM)" },
];

export default function SubtesModulesPage() {
  const [modules, setModules] = useState<SubtesModule[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingModule, setEditingModule] = useState<SubtesModule | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL"); // ← BARU: Filter kategori

  const [formData, setFormData] = useState({
    subtes_category: "penalaran-umum",
    title: "",
    description: "",
    duration_minutes: 45,
    total_questions: 40,
    difficulty: "Sedang",
    order_index: 1,
    is_active: true,
  });

  useEffect(() => {
    fetchModules();
  }, []);

  const fetchModules = async () => {
    try {
      setLoading(true);
      const supabase = createClient();
      const { data, error } = await supabase
        .from("subtes_modules")
        .select("*")
        .order("subtes_category", { ascending: true })
        .order("order_index", { ascending: true });

      if (!error && data) {
        setModules(data as SubtesModule[]);
      }
    } catch (err) {
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingModule(null);
    setFormData({
      subtes_category: "penalaran-umum",
      title: "",
      description: "",
      duration_minutes: 45,
      total_questions: 40,
      difficulty: "Sedang",
      order_index: 1,
      is_active: true,
    });
    setIsDialogOpen(true);
  };

  const handleEdit = (module: SubtesModule) => {
    setEditingModule(module);
    setFormData({
      subtes_category: module.subtes_category,
      title: module.title,
      description: module.description,
      duration_minutes: module.duration_minutes,
      total_questions: module.total_questions,
      difficulty: module.difficulty,
      order_index: module.order_index,
      is_active: module.is_active,
    });
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.title.trim()) {
      alert("Judul modul wajib diisi!");
      return;
    }

    try {
      setIsSaving(true);
      const supabase = createClient();

      if (editingModule) {
        const { error } = await supabase
          .from("subtes_modules")
          .update(formData)
          .eq("id", editingModule.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("subtes_modules")
          .insert([formData]);

        if (error) throw error;
      }

      setIsDialogOpen(false);
      fetchModules();
    } catch (err: any) {
      alert("Gagal menyimpan: " + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Hapus modul ini?")) return;

    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("subtes_modules")
        .delete()
        .eq("id", id);

      if (error) throw error;
      fetchModules();
    } catch (err: any) {
      alert("Gagal menghapus: " + err.message);
    }
  };

  const toggleActive = async (module: SubtesModule) => {
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("subtes_modules")
        .update({ is_active: !module.is_active })
        .eq("id", module.id);

      if (error) throw error;
      fetchModules();
    } catch (err: any) {
      alert("Gagal mengubah status: " + err.message);
    }
  };

  const getCategoryLabel = (value: string) => {
    return subtesCategories.find(c => c.value === value)?.label || value;
  };

  // ← BARU: Filter modules berdasarkan kategori
  const filteredModules = selectedCategory === "ALL" 
    ? modules 
    : modules.filter(m => m.subtes_category === selectedCategory);

  const modulesByCategory = subtesCategories.reduce((acc, cat) => {
    acc[cat.value] = modules.filter(m => m.subtes_category === cat.value).length;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-4">
      {/* ← BARU: Category Filter Tabs */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900">Modul Latihan Per Subtes</h2>
            <p className="text-xs text-slate-500 mt-0.5">Kelola daftar modul latihan untuk setiap kategori subtes UTBK</p>
          </div>
          <Button onClick={handleCreate} className="bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl gap-2">
            Tambah Modul
          </Button>
        </div>

        {/* Category Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          <button
            onClick={() => setSelectedCategory("ALL")}
            className={`px-4 py-2 rounded-xl font-bold text-xs whitespace-nowrap transition-all ${
              selectedCategory === "ALL"
                ? "bg-blue-600 text-white shadow-sm"
                : "bg-white border border-slate-200 text-slate-600 hover:border-blue-300"
            }`}
          >
            Semua Kategori ({subtesCategories.length})
          </button>
          {subtesCategories.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setSelectedCategory(cat.value)}
              className={`px-4 py-2 rounded-xl font-bold text-xs whitespace-nowrap transition-all ${
                selectedCategory === cat.value
                  ? "bg-blue-600 text-white shadow-sm"
                  : "bg-white border border-slate-200 text-slate-600 hover:border-blue-300"
              }`}
            >
              {cat.label} ({modulesByCategory[cat.value] || 0})
            </button>
          ))}
        </div>
      </div>

      <CrudLayout
        title=""
        description=""
        addButtonLabel=""
        onAddClick={handleCreate}
        searchPlaceholder="Cari modul..."
        totalItems={filteredModules.length}
        currentPage={1}
        totalPages={1}
      >
        <Table>
          <TableHeader>
            <TableRow className="border-slate-200 bg-slate-50/50">
              <TableHead className="font-bold text-slate-700">Kategori</TableHead>
              <TableHead className="font-bold text-slate-700">Judul Modul</TableHead>
              <TableHead className="font-bold text-slate-700">Durasi</TableHead>
              <TableHead className="font-bold text-slate-700">Soal</TableHead>
              <TableHead className="font-bold text-slate-700">Tingkat</TableHead>
              <TableHead className="font-bold text-slate-700">Urutan</TableHead>
              <TableHead className="font-bold text-slate-700">Status</TableHead>
              <TableHead className="font-bold text-slate-700 text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-xs text-slate-500">
                  Memuat data...
                </TableCell>
              </TableRow>
            ) : filteredModules.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-xs text-slate-500">
                  {selectedCategory === "ALL" ? "Belum ada data." : `Belum ada modul untuk kategori ${getCategoryLabel(selectedCategory)}.`}
                </TableCell>
              </TableRow>
            ) : (
              filteredModules.map((module) => (
                <TableRow key={module.id} className="border-slate-100 hover:bg-slate-50/60 transition-colors">
                  <TableCell>
                    <Badge variant="outline" className="text-xs font-semibold">
                      {getCategoryLabel(module.subtes_category)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <p className="text-sm font-bold text-slate-900 leading-tight">{module.title}</p>
                    <p className="text-xs text-slate-500 line-clamp-1">{module.description}</p>
                  </TableCell>
                  <TableCell className="text-xs text-slate-600">{module.duration_minutes} menit</TableCell>
                  <TableCell className="text-xs text-slate-600">{module.total_questions} soal</TableCell>
                  <TableCell>
                    <Badge
                      className={`text-[10px] font-bold ${
                        module.difficulty === "Mudah"
                          ? "bg-emerald-100 text-emerald-700 border-emerald-200"
                          : module.difficulty === "Sedang"
                          ? "bg-amber-100 text-amber-700 border-amber-200"
                          : "bg-red-100 text-red-700 border-red-200"
                      }`}
                    >
                      {module.difficulty}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs text-slate-600 font-bold">{module.order_index}</TableCell>
                  <TableCell>
                    {module.is_active ? (
                      <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 font-semibold text-[10px]">
                        AKTIF
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-slate-50 text-slate-600 border-slate-200 font-semibold text-[10px]">
                        NONAKTIF
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger className="inline-flex shrink-0 items-center justify-center rounded-xl text-sm font-medium whitespace-nowrap transition-all outline-none select-none h-8 w-8 hover:bg-muted hover:text-foreground">
                        <MoreHorizontal className="h-4 w-4" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuGroup>
                          <DropdownMenuLabel className="text-[11px]">Opsi</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => handleEdit(module)} className="text-xs cursor-pointer">
                            <Edit className="h-3.5 w-3.5 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => toggleActive(module)} className="text-xs cursor-pointer">
                            {module.is_active ? (
                              <>
                                <EyeOff className="h-3.5 w-3.5 mr-2" />
                                Nonaktifkan
                              </>
                            ) : (
                              <>
                                <Eye className="h-3.5 w-3.5 mr-2" />
                                Aktifkan
                              </>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => handleDelete(module.id)}
                            className="text-xs cursor-pointer text-rose-600 focus:bg-rose-50"
                          >
                            <Trash2 className="h-3.5 w-3.5 mr-2" />
                            Hapus
                          </DropdownMenuItem>
                        </DropdownMenuGroup>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CrudLayout>

      {/* Dialog Form */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingModule ? "Edit Modul" : "Tambah Modul Baru"}</DialogTitle>
            <DialogDescription>
              Modul akan ditampilkan di halaman latihan per subtes sesuai kategori
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Kategori Subtes *</Label>
              <select
                value={formData.subtes_category}
                onChange={(e) => setFormData({ ...formData, subtes_category: e.target.value })}
                className="w-full h-10 px-3 border border-slate-200 rounded-xl text-sm"
              >
                {subtesCategories.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label>Judul Modul *</Label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Konsep Dasar IRT & Strategi Pengerjaan"
              />
            </div>

            <div className="space-y-2">
              <Label>Deskripsi</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Pahami sistem IRT dan cara memaksimalkan skor..."
                rows={3}
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Durasi (menit) *</Label>
                <Input
                  type="number"
                  value={formData.duration_minutes}
                  onChange={(e) => setFormData({ ...formData, duration_minutes: parseInt(e.target.value) || 0 })}
                />
              </div>

              <div className="space-y-2">
                <Label>Jumlah Soal *</Label>
                <Input
                  type="number"
                  value={formData.total_questions}
                  onChange={(e) => setFormData({ ...formData, total_questions: parseInt(e.target.value) || 0 })}
                />
              </div>

              <div className="space-y-2">
                <Label>Urutan *</Label>
                <Input
                  type="number"
                  value={formData.order_index}
                  onChange={(e) => setFormData({ ...formData, order_index: parseInt(e.target.value) || 1 })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Tingkat Kesulitan *</Label>
                <select
                  value={formData.difficulty}
                  onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                  className="w-full h-10 px-3 border border-slate-200 rounded-xl text-sm"
                >
                  <option value="Mudah">Mudah</option>
                  <option value="Sedang">Sedang</option>
                  <option value="Sulit">Sulit</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label>Status *</Label>
                <select
                  value={formData.is_active ? "active" : "inactive"}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.value === "active" })}
                  className="w-full h-10 px-3 border border-slate-200 rounded-xl text-sm"
                >
                  <option value="active">Aktif</option>
                  <option value="inactive">Nonaktif</option>
                </select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Batal
            </Button>
            <Button onClick={handleSave} disabled={isSaving} className="bg-blue-600 hover:bg-blue-700">
              {isSaving ? "Menyimpan..." : "Simpan"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
