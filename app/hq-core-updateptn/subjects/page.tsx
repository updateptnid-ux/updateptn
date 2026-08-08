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
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, BookCheck, Edit, Trash2, AlertTriangle, Save, X } from "lucide-react";
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

interface SubjectRecord {
  id: string;
  name: string;
  category: "TPS" | "LITERASI";
}

export default function AdminSubjectsPage() {
  const [subjects, setSubjects] = useState<SubjectRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<SubjectRecord | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    category: "TPS" as "TPS" | "LITERASI",
  });

  const mockSubjects: SubjectRecord[] = [
    {
      id: "sub1",
      name: "Penalaran Umum (PU)",
      category: "TPS",
    },
    {
      id: "sub2",
      name: "Pengetahuan Kuantitatif (PK)",
      category: "TPS",
    },
    {
      id: "sub3",
      name: "Literasi Bahasa Inggris",
      category: "LITERASI",
    },
  ];

  useEffect(() => {
    fetchSubjects();
  }, []);

  const fetchSubjects = async () => {
    try {
      setLoading(true);
      const supabase = createClient();
      const { data, error } = await supabase.from("subjects").select("*").order("name", { ascending: true });

      if (error) {
        setIsDemoMode(true);
        setSubjects(mockSubjects);
      } else if (data) {
        setSubjects(data as SubjectRecord[]);
        setIsDemoMode(false);
      }
    } catch (err) {
      console.error(err);
      setIsDemoMode(true);
      setSubjects(mockSubjects);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingSubject(null);
    setFormData({
      name: "",
      category: "TPS",
    });
    setIsDialogOpen(true);
  };

  const handleEdit = (sub: SubjectRecord) => {
    setEditingSubject(sub);
    setFormData({
      name: sub.name,
      category: sub.category,
    });
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      if (isDemoMode) {
        if (editingSubject) {
          setSubjects(prev => prev.map(s => (s.id === editingSubject.id ? { ...s, ...formData } : s)));
        } else {
          setSubjects(prev => [
            ...prev,
            { id: `sub_${Date.now()}`, ...formData },
          ]);
        }
        setIsDialogOpen(false);
        return;
      }

      const supabase = createClient();
      if (editingSubject) {
        const { error } = await supabase.from("subjects").update(formData).eq("id", editingSubject.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("subjects").insert([formData]);
        if (error) throw error;
      }

      setIsDialogOpen(false);
      fetchSubjects();
    } catch (err) {
      alert("Gagal menyimpan: " + (err as Error).message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Hapus mata pelajaran ini?")) return;
    try {
      if (isDemoMode) {
        setSubjects(prev => prev.filter(s => s.id !== id));
        return;
      }
      const supabase = createClient();
      const { error } = await supabase.from("subjects").delete().eq("id", id);
      if (error) throw error;
      fetchSubjects();
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
            <p className="text-[11px] text-amber-700">Tabel subjects tidak ditemukan, menggunakan data demo.</p>
          </div>
        </div>
      )}

      <CrudLayout
        title="Mata Pelajaran (Mapel)"
        description="Kelola kategori mata pelajaran UTBK (TPS & Literasi) serta statistik bab pelajaran."
        addButtonLabel="Tambah Mapel"
        onAddClick={handleCreate}
        searchPlaceholder="Cari mapel..."
        totalItems={subjects.length}
        currentPage={1}
        totalPages={1}
      >
        <Table>
          <TableHeader>
            <TableRow className="border-slate-200 bg-slate-50/50">
              <TableHead className="font-bold text-slate-700">Nama Mata Pelajaran</TableHead>
              <TableHead className="font-bold text-slate-700">Kategori</TableHead>
              <TableHead className="font-bold text-slate-700 text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center py-8 text-xs text-slate-500">Memuat data...</TableCell>
              </TableRow>
            ) : subjects.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center py-8 text-xs text-slate-500">Belum ada data.</TableCell>
              </TableRow>
            ) : (
              subjects.map((sub) => (
                <TableRow key={sub.id} className="border-slate-100 hover:bg-slate-50/60 transition-colors">
                  <TableCell className="py-3 font-bold text-slate-900 flex items-center gap-2">
                    <BookCheck className="h-4 w-4 text-blue-600" />
                    <span>{sub.name}</span>
                  </TableCell>
                  <TableCell>
                    <Badge className={
                      sub.category === "TPS"
                        ? "bg-blue-100 text-blue-800 border-blue-200"
                        : "bg-indigo-100 text-indigo-800 border-indigo-200"
                    }>
                      {sub.category}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8 rounded-xl border border-slate-200 hover:bg-slate-100">
                          <MoreHorizontal className="h-4 w-4 text-slate-600" />
                        </Button></DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48 bg-white border border-slate-200 rounded-xl p-1 shadow-md">
                        <DropdownMenuLabel className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Opsi</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleEdit(sub)} className="text-xs font-semibold text-slate-700 cursor-pointer rounded-lg gap-2">
                          <Edit className="h-3.5 w-3.5 text-indigo-600" />
                          <span>Ubah Data</span>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleDelete(sub.id)} className="text-xs font-semibold text-rose-600 cursor-pointer rounded-lg gap-2 focus:bg-rose-50">
                          <Trash2 className="h-3.5 w-3.5 text-rose-600" />
                          <span>Hapus Mapel</span>
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
            <DialogTitle>{editingSubject ? "Ubah Mapel" : "Tambah Mapel"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Nama Mapel *</Label>
              <Input value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} placeholder="Penalaran Matematika" />
            </div>
            <div className="space-y-2">
              <Label>Kategori *</Label>
              <select
                value={formData.category}
                onChange={e => setFormData({ ...formData, category: e.target.value as any })}
                className="w-full h-10 px-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 bg-white"
              >
                <option value="TPS">TPS</option>
                <option value="LITERASI">LITERASI</option>
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Batal</Button>
            <Button onClick={handleSave} disabled={isSaving || !formData.name} className="bg-blue-600 hover:bg-blue-700 text-white">Simpan</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
