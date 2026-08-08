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
import { MoreHorizontal, GitBranch, Edit, Trash2, Building2, AlertTriangle, Save, X } from "lucide-react";
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

interface FacultyRecord {
  id: string;
  name: string;
  university_id: string;
  university_name: string;
}

interface UniversityItem {
  id: string;
  name: string;
}

export default function AdminFacultiesPage() {
  const [faculties, setFaculties] = useState<FacultyRecord[]>([]);
  const [unis, setUnis] = useState<UniversityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingFaculty, setEditingFaculty] = useState<FacultyRecord | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    university_id: "",
  });

  const mockFaculties: FacultyRecord[] = [
    {
      id: "f1",
      name: "Fakultas Ilmu Komputer (Fasilkom)",
      university_id: "u1",
      university_name: "Universitas Indonesia (UI)",
    },
    {
      id: "f2",
      name: "Fakultas Kedokteran (FK)",
      university_id: "u1",
      university_name: "Universitas Indonesia (UI)",
    },
    {
      id: "f3",
      name: "Sekolah Teknik Elektro & Informatika (STEI)",
      university_id: "u3",
      university_name: "Institut Teknologi Bandung (ITB)",
    },
  ];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const supabase = createClient();

      const { data: uniData } = await supabase.from("universities").select("id, name");
      if (uniData) setUnis(uniData);

      const { data, error } = await supabase
        .from("faculties")
        .select("*, universities(name)")
        .order("name", { ascending: true });

      if (error) {
        setIsDemoMode(true);
        setFaculties(mockFaculties);
      } else if (data) {
        setFaculties(
          data.map((item: any) => ({
            id: item.id,
            name: item.name,
            university_id: item.university_id,
            university_name: item.universities?.name || "Universitas",
          }))
        );
        setIsDemoMode(false);
      }
    } catch (err) {
      console.error(err);
      setIsDemoMode(true);
      setFaculties(mockFaculties);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingFaculty(null);
    setFormData({
      name: "",
      university_id: unis[0]?.id || "",
    });
    setIsDialogOpen(true);
  };

  const handleEdit = (fac: FacultyRecord) => {
    setEditingFaculty(fac);
    setFormData({
      name: fac.name,
      university_id: fac.university_id,
    });
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      const uniName = unis.find(u => u.id === formData.university_id)?.name || "Universitas";

      if (isDemoMode) {
        if (editingFaculty) {
          setFaculties(prev => prev.map(f => (f.id === editingFaculty.id ? { ...f, ...formData, university_name: uniName } : f)));
        } else {
          setFaculties(prev => [
            ...prev,
            { id: `f_${Date.now()}`, ...formData, university_name: uniName },
          ]);
        }
        setIsDialogOpen(false);
        return;
      }

      const supabase = createClient();
      if (editingFaculty) {
        const { error } = await supabase.from("faculties").update(formData).eq("id", editingFaculty.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("faculties").insert([formData]);
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
    if (!confirm("Hapus fakultas ini?")) return;
    try {
      if (isDemoMode) {
        setFaculties(prev => prev.filter(f => f.id !== id));
        return;
      }
      const supabase = createClient();
      const { error } = await supabase.from("faculties").delete().eq("id", id);
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
            <p className="text-[11px] text-amber-700">Tabel faculties tidak ditemukan, menggunakan data demo.</p>
          </div>
        </div>
      )}

      <CrudLayout
        title="Fakultas (PTN)"
        description="Kelola data fakultas di setiap perguruan tinggi negeri peserta SNBT."
        addButtonLabel="Tambah Fakultas"
        onAddClick={handleCreate}
        searchPlaceholder="Cari fakultas..."
        totalItems={faculties.length}
        currentPage={1}
        totalPages={1}
      >
        <Table>
          <TableHeader>
            <TableRow className="border-slate-200 bg-slate-50/50">
              <TableHead className="font-bold text-slate-700">Nama Fakultas</TableHead>
              <TableHead className="font-bold text-slate-700">Universitas</TableHead>
              <TableHead className="font-bold text-slate-700 text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center py-8 text-xs text-slate-500">Memuat data...</TableCell>
              </TableRow>
            ) : faculties.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center py-8 text-xs text-slate-500">Belum ada data.</TableCell>
              </TableRow>
            ) : (
              faculties.map((fac) => (
                <TableRow key={fac.id} className="border-slate-100 hover:bg-slate-50/60 transition-colors">
                  <TableCell className="py-3 font-bold text-slate-900 flex items-center gap-2">
                    <GitBranch className="h-4 w-4 text-blue-600" />
                    <span>{fac.name}</span>
                  </TableCell>
                  <TableCell className="text-xs text-slate-700 font-semibold">
                    <div className="flex items-center gap-1">
                      <Building2 className="h-3.5 w-3.5 text-slate-400" />
                      <span>{fac.university_name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8 rounded-xl border border-slate-200 hover:bg-slate-100">
                          <MoreHorizontal className="h-4 w-4 text-slate-600" />
                        </Button></DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48 bg-white border border-slate-200 rounded-xl p-1 shadow-md">
                        <DropdownMenuLabel className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Opsi</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleEdit(fac)} className="text-xs font-semibold text-slate-700 cursor-pointer rounded-lg gap-2">
                          <Edit className="h-3.5 w-3.5 text-indigo-600" />
                          <span>Ubah Data</span>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleDelete(fac.id)} className="text-xs font-semibold text-rose-600 cursor-pointer rounded-lg gap-2 focus:bg-rose-50">
                          <Trash2 className="h-3.5 w-3.5 text-rose-600" />
                          <span>Hapus Fakultas</span>
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
            <DialogTitle>{editingFaculty ? "Ubah Fakultas" : "Tambah Fakultas"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Nama Fakultas *</Label>
              <Input value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} placeholder="Fakultas Teknik" />
            </div>
            <div className="space-y-2">
              <Label>Universitas *</Label>
              {isDemoMode ? (
                <select
                  value={formData.university_id}
                  onChange={e => setFormData({ ...formData, university_id: e.target.value })}
                  className="w-full h-10 px-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 bg-white"
                >
                  <option value="u1">Universitas Indonesia (UI)</option>
                  <option value="u3">Institut Teknologi Bandung (ITB)</option>
                </select>
              ) : (
                <select
                  value={formData.university_id}
                  onChange={e => setFormData({ ...formData, university_id: e.target.value })}
                  className="w-full h-10 px-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 bg-white"
                >
                  {unis.map(u => (
                    <option key={u.id} value={u.id}>{u.name}</option>
                  ))}
                </select>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Batal</Button>
            <Button onClick={handleSave} disabled={isSaving || !formData.name || !formData.university_id} className="bg-blue-600 hover:bg-blue-700 text-white">Simpan</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
