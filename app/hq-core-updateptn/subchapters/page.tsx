"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import CrudLayout from "@/components/admin/CrudLayout";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Layers, Bookmark, Edit, Trash2, AlertTriangle, Save, X } from "lucide-react";
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

interface SubchapterRecord {
  id: string;
  name: string;
  chapter_id: string;
  chapter_name: string;
  order_index: number;
}

interface ChapterItem {
  id: string;
  name: string;
}

export default function AdminSubchaptersPage() {
  const [subchapters, setSubchapters] = useState<SubchapterRecord[]>([]);
  const [chapters, setChapters] = useState<ChapterItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSubchapter, setEditingSubchapter] = useState<SubchapterRecord | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    chapter_id: "",
    order_index: 1,
  });

  const mockSubchapters: SubchapterRecord[] = [
    {
      id: "sch1",
      name: "Silogisme & Penarikan Kesimpulan",
      chapter_id: "ch1",
      chapter_name: "Logika Analitis & Kognitif",
      order_index: 1,
    },
    {
      id: "sch2",
      name: "Pola Barisan Bilangan & Huruf",
      chapter_id: "ch1",
      chapter_name: "Logika Analitis & Kognitif",
      order_index: 2,
    },
    {
      id: "sch3",
      name: "Persamaan Linear Dua Variabel",
      chapter_id: "ch2",
      chapter_name: "Aljabar & Persamaan Kuadrat",
      order_index: 1,
    },
  ];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const supabase = createClient();

      const { data: chapData } = await supabase.from("chapters").select("id, name");
      if (chapData) setChapters(chapData);

      const { data, error } = await supabase.from("subchapters").select("*").order("order_index", { ascending: true });

      if (error) {
        setIsDemoMode(true);
        setSubchapters(mockSubchapters);
      } else if (data) {
        setSubchapters(data as SubchapterRecord[]);
        setIsDemoMode(false);
      }
    } catch (err) {
      console.error(err);
      setIsDemoMode(true);
      setSubchapters(mockSubchapters);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingSubchapter(null);
    setFormData({
      name: "",
      chapter_id: chapters[0]?.id || "",
      order_index: subchapters.length + 1,
    });
    setIsDialogOpen(true);
  };

  const handleEdit = (subch: SubchapterRecord) => {
    setEditingSubchapter(subch);
    setFormData({
      name: subch.name,
      chapter_id: subch.chapter_id,
      order_index: subch.order_index,
    });
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      const chapName = chapters.find(c => c.id === formData.chapter_id)?.name || "Induk Bab";

      const payload = {
        ...formData,
        chapter_name: chapName,
      };

      if (isDemoMode) {
        if (editingSubchapter) {
          setSubchapters(prev => prev.map(s => (s.id === editingSubchapter.id ? { ...s, ...payload } : s)));
        } else {
          setSubchapters(prev => [
            ...prev,
            { id: `sch_${Date.now()}`, ...payload },
          ]);
        }
        setIsDialogOpen(false);
        return;
      }

      const supabase = createClient();
      if (editingSubchapter) {
        const { error } = await supabase.from("subchapters").update(payload).eq("id", editingSubchapter.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("subchapters").insert([payload]);
        if (error) throw error;
      }

      setIsDialogOpen(false);
      fetchData();
    } catch (err) {
      alert("Gagal menyimpan: " + (err as Error).message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Hapus sub-bab ini?")) return;
    try {
      if (isDemoMode) {
        setSubchapters(prev => prev.filter(s => s.id !== id));
        return;
      }
      const supabase = createClient();
      const { error } = await supabase.from("subchapters").delete().eq("id", id);
      if (error) throw error;
      fetchData();
    } catch (err) {
      alert("Gagal menghapus: " + (err as Error).message);
    }
  };

  return (
    <div className="space-y-4">
      {isDemoMode && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <h4 className="text-xs font-bold text-amber-900">Mode Demonstrasi Aktif</h4>
            <p className="text-[11px] text-amber-700">Tabel subchapters tidak ditemukan, menggunakan data demo.</p>
          </div>
        </div>
      )}

      <CrudLayout
        title="Sub Bab Pelajaran"
        description="Kelola sub bab pelajaran spesifik untuk materi belajar, bank soal, dan modul belajar."
        addButtonLabel="Tambah Sub-Bab"
        onAddClick={handleCreate}
        searchPlaceholder="Cari sub-bab..."
        totalItems={subchapters.length}
        currentPage={1}
        totalPages={1}
      >
        <Table>
          <TableHeader>
            <TableRow className="border-slate-200 bg-slate-50/50">
              <TableHead className="font-bold text-slate-700">Urutan</TableHead>
              <TableHead className="font-bold text-slate-700">Nama Sub-Bab</TableHead>
              <TableHead className="font-bold text-slate-700">Induk Bab Pelajaran</TableHead>
              <TableHead className="font-bold text-slate-700 text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8 text-xs text-slate-500">Memuat data...</TableCell>
              </TableRow>
            ) : subchapters.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8 text-xs text-slate-500">Belum ada data.</TableCell>
              </TableRow>
            ) : (
              subchapters.map((subch) => (
                <TableRow key={subch.id} className="border-slate-100 hover:bg-slate-50/60 transition-colors">
                  <TableCell className="text-xs font-mono font-bold text-slate-600">#{subch.order_index}</TableCell>
                  <TableCell className="py-3 font-bold text-slate-900 flex items-center gap-2">
                    <Layers className="h-4 w-4 text-blue-600" />
                    <span>{subch.name}</span>
                  </TableCell>
                  <TableCell className="text-xs text-slate-700 font-semibold">
                    <div className="flex items-center gap-1">
                      <Bookmark className="h-3.5 w-3.5 text-slate-400" />
                      <span>{subch.chapter_name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger render={
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-xl border border-slate-200 hover:bg-slate-100">
                          <MoreHorizontal className="h-4 w-4 text-slate-600" />
                        </Button>
                      } />
                      <DropdownMenuContent align="end" className="w-48 bg-white border border-slate-200 rounded-xl p-1 shadow-md">
                        <DropdownMenuLabel className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Opsi</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleEdit(subch)} className="text-xs font-semibold text-slate-700 cursor-pointer rounded-lg gap-2">
                          <Edit className="h-3.5 w-3.5 text-indigo-600" />
                          <span>Ubah Data</span>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleDelete(subch.id)} className="text-xs font-semibold text-rose-600 cursor-pointer rounded-lg gap-2 focus:bg-rose-50">
                          <Trash2 className="h-3.5 w-3.5 text-rose-600" />
                          <span>Hapus Sub-Bab</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CrudLayout>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingSubchapter ? "Ubah Sub-Bab" : "Tambah Sub-Bab"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Nama Sub-Bab *</Label>
              <Input value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} placeholder="Logika Silogisme" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Induk Bab Pelajaran *</Label>
                {isDemoMode ? (
                  <select
                    value={formData.chapter_id}
                    onChange={e => setFormData({ ...formData, chapter_id: e.target.value })}
                    className="w-full h-10 px-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 bg-white"
                  >
                    <option value="ch1">Logika Analitis & Kognitif</option>
                    <option value="ch2">Aljabar & Persamaan Kuadrat</option>
                  </select>
                ) : (
                  <select
                    value={formData.chapter_id}
                    onChange={e => setFormData({ ...formData, chapter_id: e.target.value })}
                    className="w-full h-10 px-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 bg-white"
                  >
                    {chapters.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                )}
              </div>
              <div className="space-y-2">
                <Label>Nomor Urut *</Label>
                <Input type="number" value={formData.order_index} onChange={e => setFormData({ ...formData, order_index: parseInt(e.target.value) || 1 })} />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Batal</Button>
            <Button onClick={handleSave} disabled={isSaving || !formData.name || !formData.chapter_id} className="bg-blue-600 hover:bg-blue-700 text-white">Simpan</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
