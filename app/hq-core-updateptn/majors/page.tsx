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
import { MoreHorizontal, BookOpen, Building2, Edit, Trash2, X, Save, AlertTriangle } from "lucide-react";
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

interface MajorRecord {
  id: string;
  name: string;
  university_id: string;
  university_name: string;
  passing_grade: number;
  capacity: number;
}

interface UniversityItem {
  id: string;
  name: string;
}

export default function AdminMajorsPage() {
  const [majors, setMajors] = useState<MajorRecord[]>([]);
  const [unis, setUnis] = useState<UniversityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingMajor, setEditingMajor] = useState<MajorRecord | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    university_id: "",
    passing_grade: 650.0,
    capacity: 50,
  });

  const mockMajors: MajorRecord[] = [
    {
      id: "m1",
      name: "S1 Ilmu Komputer / Teknik Informatika",
      university_id: "u1",
      university_name: "Universitas Indonesia (UI)",
      passing_grade: 710.0,
      capacity: 60,
    },
    {
      id: "m2",
      name: "S1 Kedokteran",
      university_id: "u1",
      university_name: "Universitas Indonesia (UI)",
      passing_grade: 735.0,
      capacity: 75,
    },
    {
      id: "m3",
      name: "S1 Teknologi Informasi",
      university_id: "u2",
      university_name: "Universitas Gadjah Mada (UGM)",
      passing_grade: 700.0,
      capacity: 55,
    },
  ];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const supabase = createClient();

      // Fetch universities first
      const { data: uniData, error: uniError } = await supabase.from("universities").select("id, name");
      if (uniData) setUnis(uniData);

      const { data, error } = await supabase
        .from("majors")
        .select("*, universities(name)")
        .order("name", { ascending: true });

      if (error) {
        setIsDemoMode(true);
        setMajors(mockMajors);
      } else if (data) {
        setMajors(
          data.map((item: any) => ({
            id: item.id,
            name: item.name,
            university_id: item.university_id,
            university_name: item.universities?.name || "Universitas",
            passing_grade: item.passing_grade,
            capacity: item.capacity,
          }))
        );
        setIsDemoMode(false);
      }
    } catch (err) {
      console.error(err);
      setIsDemoMode(true);
      setMajors(mockMajors);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingMajor(null);
    setFormData({
      name: "",
      university_id: unis[0]?.id || "",
      passing_grade: 650.0,
      capacity: 50,
    });
    setIsDialogOpen(true);
  };

  const handleEdit = (major: MajorRecord) => {
    setEditingMajor(major);
    setFormData({
      name: major.name,
      university_id: major.university_id,
      passing_grade: major.passing_grade,
      capacity: major.capacity,
    });
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      const uniName = unis.find(u => u.id === formData.university_id)?.name || "Universitas";

      if (isDemoMode) {
        if (editingMajor) {
          setMajors(prev =>
            prev.map(m => (m.id === editingMajor.id ? { ...m, ...formData, university_name: uniName } : m))
          );
        } else {
          setMajors(prev => [
            ...prev,
            { id: `mj_${Date.now()}`, ...formData, university_name: uniName },
          ]);
        }
        setIsDialogOpen(false);
        return;
      }

      const supabase = createClient();
      const payload = {
        name: formData.name,
        university_id: formData.university_id,
        passing_grade: formData.passing_grade,
        capacity: formData.capacity,
      };

      if (editingMajor) {
        const { error } = await supabase.from("majors").update(payload).eq("id", editingMajor.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("majors").insert([payload]);
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
    if (!confirm("Hapus program studi ini?")) return;
    try {
      if (isDemoMode) {
        setMajors(prev => prev.filter(m => m.id !== id));
        return;
      }
      const supabase = createClient();
      const { error } = await supabase.from("majors").delete().eq("id", id);
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
            <p className="text-[11px] text-amber-700">Tabel majors tidak ditemukan, menggunakan data demo.</p>
          </div>
        </div>
      )}

      <CrudLayout
        title="Program Studi (Major)"
        description="Manajemen Program Studi PTN, passing grade, daya tampung kuota, dan rasionalisasi peluang."
        addButtonLabel="Tambah Prodi"
        onAddClick={handleCreate}
        searchPlaceholder="Cari program studi..."
        totalItems={majors.length}
        currentPage={1}
        totalPages={1}
      >
        <Table>
          <TableHeader>
            <TableRow className="border-slate-200 bg-slate-50/50">
              <TableHead className="font-bold text-slate-700">Nama Prodi</TableHead>
              <TableHead className="font-bold text-slate-700">Universitas</TableHead>
              <TableHead className="font-bold text-slate-700">Passing Grade</TableHead>
              <TableHead className="font-bold text-slate-700">Daya Tampung</TableHead>
              <TableHead className="font-bold text-slate-700 text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-xs text-slate-500">Memuat data...</TableCell>
              </TableRow>
            ) : majors.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-xs text-slate-500">Belum ada data.</TableCell>
              </TableRow>
            ) : (
              majors.map((major) => (
                <TableRow key={major.id} className="border-slate-100 hover:bg-slate-50/60 transition-colors">
                  <TableCell className="py-3 font-bold text-slate-900 flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-blue-600" />
                    <span>{major.name}</span>
                  </TableCell>
                  <TableCell className="text-xs text-slate-700 font-semibold">
                    <div className="flex items-center gap-1">
                      <Building2 className="h-3.5 w-3.5 text-slate-400" />
                      <span>{major.university_name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-xs font-bold text-blue-600">{major.passing_grade}</TableCell>
                  <TableCell className="text-xs text-slate-600 font-medium">{major.capacity} Siswa</TableCell>
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
                        <DropdownMenuItem onClick={() => handleEdit(major)} className="text-xs font-semibold text-slate-700 cursor-pointer rounded-lg gap-2">
                          <Edit className="h-3.5 w-3.5 text-indigo-600" />
                          <span>Ubah Data</span>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleDelete(major.id)} className="text-xs font-semibold text-rose-600 cursor-pointer rounded-lg gap-2 focus:bg-rose-50">
                          <Trash2 className="h-3.5 w-3.5 text-rose-600" />
                          <span>Hapus Prodi</span>
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
            <DialogTitle>{editingMajor ? "Ubah Program Studi" : "Tambah Program Studi"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Nama Program Studi *</Label>
              <Input value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} placeholder="S1 Kedokteran" />
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
                  <option value="u2">Universitas Gadjah Mada (UGM)</option>
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
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Passing Grade *</Label>
                <Input type="number" step="0.01" value={formData.passing_grade} onChange={e => setFormData({ ...formData, passing_grade: parseFloat(e.target.value) || 0 })} />
              </div>
              <div className="space-y-2">
                <Label>Kapasitas Daya Tampung *</Label>
                <Input type="number" value={formData.capacity} onChange={e => setFormData({ ...formData, capacity: parseInt(e.target.value) || 0 })} />
              </div>
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
