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
import { MoreHorizontal, Bookmark, BookOpen, Edit, Trash2, AlertTriangle, Save, X } from "lucide-react";
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

interface ChapterRecord {
  id: string;
  name: string;
  subject_id: string;
  subject_name: string;
}

interface SubjectItem {
  id: string;
  name: string;
}

export default function AdminChaptersPage() {
  const [chapters, setChapters] = useState<ChapterRecord[]>([]);
  const [subjects, setSubjects] = useState<SubjectItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingChapter, setEditingChapter] = useState<ChapterRecord | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    subject_id: "",
  });

  const mockChapters: ChapterRecord[] = [
    {
      id: "ch1",
      name: "Logika Analitis & Kognitif",
      subject_id: "sub1",
      subject_name: "Penalaran Umum (PU)",
    },
    {
      id: "ch2",
      name: "Aljabar & Persamaan Kuadrat",
      subject_id: "sub2",
      subject_name: "Pengetahuan Kuantitatif (PK)",
    },
    {
      id: "ch3",
      name: "Reading Comprehension & Inference",
      subject_id: "sub3",
      subject_name: "Literasi Bahasa Inggris",
    },
  ];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const supabase = createClient();

      const { data: subData } = await supabase.from("subjects").select("id, name");
      if (subData) setSubjects(subData);

      const { data, error } = await supabase.from("chapters").select("*").order("name", { ascending: true });

      if (error) {
        setIsDemoMode(true);
        setChapters(mockChapters);
      } else if (data) {
        setChapters(data as ChapterRecord[]);
        setIsDemoMode(false);
      }
    } catch (err) {
      console.error(err);
      setIsDemoMode(true);
      setChapters(mockChapters);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingChapter(null);
    setFormData({
      name: "",
      subject_id: subjects[0]?.id || "",
    });
    setIsDialogOpen(true);
  };

  const handleEdit = (chap: ChapterRecord) => {
    setEditingChapter(chap);
    setFormData({
      name: chap.name,
      subject_id: chap.subject_id,
    });
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      const subName = subjects.find(s => s.id === formData.subject_id)?.name || "Mata Pelajaran";

      const payload = {
        ...formData,
        subject_name: subName,
      };

      if (isDemoMode) {
        if (editingChapter) {
          setChapters(prev => prev.map(c => (c.id === editingChapter.id ? { ...c, ...payload } : c)));
        } else {
          setChapters(prev => [
            ...prev,
            { id: `ch_${Date.now()}`, ...payload },
          ]);
        }
        setIsDialogOpen(false);
        return;
      }

      const supabase = createClient();
      if (editingChapter) {
        const { error } = await supabase.from("chapters").update(payload).eq("id", editingChapter.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("chapters").insert([payload]);
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
    if (!confirm("Hapus bab pelajaran ini?")) return;
    try {
      if (isDemoMode) {
        setChapters(prev => prev.filter(c => c.id !== id));
        return;
      }
      const supabase = createClient();
      const { error } = await supabase.from("chapters").delete().eq("id", id);
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
            <p className="text-[11px] text-amber-700">Tabel chapters tidak ditemukan, menggunakan data demo.</p>
          </div>
        </div>
      )}

      <CrudLayout
        title="Bab Pelajaran"
        description="Kelola bab pembelajaran yang membagi materi setiap mata pelajaran UTBK."
        addButtonLabel="Tambah Bab"
        onAddClick={handleCreate}
        searchPlaceholder="Cari bab..."
        totalItems={chapters.length}
        currentPage={1}
        totalPages={1}
      >
        <Table>
          <TableHeader>
            <TableRow className="border-slate-200 bg-slate-50/50">
              <TableHead className="font-bold text-slate-700">Nama Bab</TableHead>
              <TableHead className="font-bold text-slate-700">Mata Pelajaran</TableHead>
              <TableHead className="font-bold text-slate-700 text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center py-8 text-xs text-slate-500">Memuat data...</TableCell>
              </TableRow>
            ) : chapters.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center py-8 text-xs text-slate-500">Belum ada data.</TableCell>
              </TableRow>
            ) : (
              chapters.map((chap) => (
                <TableRow key={chap.id} className="border-slate-100 hover:bg-slate-50/60 transition-colors">
                  <TableCell className="py-3 font-bold text-slate-900 flex items-center gap-2">
                    <Bookmark className="h-4 w-4 text-blue-600" />
                    <span>{chap.name}</span>
                  </TableCell>
                  <TableCell className="text-xs text-slate-700 font-semibold">
                    <div className="flex items-center gap-1">
                      <BookOpen className="h-3.5 w-3.5 text-slate-400" />
                      <span>{chap.subject_name}</span>
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
                        <DropdownMenuItem onClick={() => handleEdit(chap)} className="text-xs font-semibold text-slate-700 cursor-pointer rounded-lg gap-2">
                          <Edit className="h-3.5 w-3.5 text-indigo-600" />
                          <span>Ubah Data</span>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleDelete(chap.id)} className="text-xs font-semibold text-rose-600 cursor-pointer rounded-lg gap-2 focus:bg-rose-50">
                          <Trash2 className="h-3.5 w-3.5 text-rose-600" />
                          <span>Hapus Bab</span>
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
            <DialogTitle>{editingChapter ? "Ubah Bab" : "Tambah Bab"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Nama Bab *</Label>
              <Input value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} placeholder="Logika Numerik" />
            </div>
            <div className="space-y-2">
              <Label>Mata Pelajaran *</Label>
              {isDemoMode ? (
                <select
                  value={formData.subject_id}
                  onChange={e => setFormData({ ...formData, subject_id: e.target.value })}
                  className="w-full h-10 px-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 bg-white"
                >
                  <option value="sub1">Penalaran Umum (PU)</option>
                  <option value="sub2">Pengetahuan Kuantitatif (PK)</option>
                </select>
              ) : (
                <select
                  value={formData.subject_id}
                  onChange={e => setFormData({ ...formData, subject_id: e.target.value })}
                  className="w-full h-10 px-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 bg-white"
                >
                  {subjects.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Batal</Button>
            <Button onClick={handleSave} disabled={isSaving || !formData.name || !formData.subject_id} className="bg-blue-600 hover:bg-blue-700 text-white">Simpan</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
