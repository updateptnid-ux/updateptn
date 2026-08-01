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
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  const [formData, setFormData] = useState({
    name: "",
    university_id: "",
    passing_grade: 650.0,
    capacity: 50,
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const supabase = createClient();

      // Try prodi_reference first
      const { data: prodiData, error: prodiError } = await supabase
        .from("prodi_reference")
        .select("*")
        .order("univ", { ascending: true })
        .limit(500);

      if (!prodiError && prodiData && prodiData.length > 0) {
        const formatted = prodiData.map((item: any) => ({
          id: String(item.id),
          name: `${item.prodi}${item.jenjang ? ` (${item.jenjang})` : ""} - ${item.kelompok || "Saintek"}`,
          university_id: String(item.id),
          university_name: item.univ,
          passing_grade: Number(item.passing_grade_est) || 500,
          capacity: Number(item.daya_tampung) || 30,
        }));
        setMajors(formatted);
        setIsDemoMode(false);
      } else {
        // Fallback to local /data_snbt.json
        const res = await fetch("/data_snbt.json");
        if (res.ok) {
          const localData = await res.json();
          const formatted = localData.map((item: any) => ({
            id: String(item.id),
            name: `${item.prodi}${item.jenjang ? ` (${item.jenjang})` : ""} - ${item.kelompok || "Saintek"}`,
            university_id: String(item.id),
            university_name: item.univ,
            passing_grade: Number(item.passing_grade_est) || 500,
            capacity: Number(item.daya_tampung) || 30,
          }));
          setMajors(formatted);
          setIsDemoMode(true);
        }
      }
    } catch (err) {
      console.error(err);
      setIsDemoMode(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredMajors = majors.filter(
    (m) =>
      m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.university_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredMajors.length / itemsPerPage) || 1;
  const paginatedMajors = filteredMajors.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleCreate = () => {
    setEditingMajor(null);
    setFormData({
      name: "",
      university_id: "UNIVERSITAS INDONESIA",
      passing_grade: 650.0,
      capacity: 50,
    });
    setIsDialogOpen(true);
  };

  const handleEdit = (major: MajorRecord) => {
    setEditingMajor(major);
    setFormData({
      name: major.name,
      university_id: major.university_name,
      passing_grade: major.passing_grade,
      capacity: major.capacity,
    });
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      if (isDemoMode) {
        if (editingMajor) {
          setMajors((prev) =>
            prev.map((m) =>
              m.id === editingMajor.id
                ? { ...m, name: formData.name, university_name: formData.university_id, passing_grade: formData.passing_grade, capacity: formData.capacity }
                : m
            )
          );
        } else {
          setMajors((prev) => [
            {
              id: `mj_${Date.now()}`,
              name: formData.name,
              university_id: `u_${Date.now()}`,
              university_name: formData.university_id,
              passing_grade: formData.passing_grade,
              capacity: formData.capacity,
            },
            ...prev,
          ]);
        }
        setIsDialogOpen(false);
        return;
      }

      const supabase = createClient();
      const payload = {
        prodi: formData.name,
        univ: formData.university_id,
        passing_grade_est: formData.passing_grade,
        daya_tampung: formData.capacity,
      };

      if (editingMajor) {
        await supabase.from("prodi_reference").update(payload).eq("id", editingMajor.id);
      } else {
        await supabase.from("prodi_reference").insert([payload]);
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
    if (!confirm("Hapus program studi ini dari Master Data?")) return;
    try {
      if (isDemoMode) {
        setMajors((prev) => prev.filter((m) => m.id !== id));
        return;
      }
      const supabase = createClient();
      await supabase.from("prodi_reference").delete().eq("id", id);
      fetchData();
    } catch (err) {
      alert("Gagal menghapus: " + (err as Error).message);
    }
  };

  return (
    <div className="space-y-4 font-sans">
      {isDemoMode && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <h4 className="text-xs font-bold text-amber-900">Database Lokal / Cache File Aktif</h4>
            <p className="text-[11px] text-amber-700">
              Menampilkan 4.978+ Master Data PTN & Jurusan dari database/JSON. Kamu bisa mengubah atau menambah data secara langsung.
            </p>
          </div>
        </div>
      )}

      <CrudLayout
        title="Master Data PTN & Program Studi"
        description="Manajemen 4.900+ Program Studi PTN se-Indonesia, passing grade, daya tampung kuota, dan rasionalisasi."
        addButtonLabel="Tambah Prodi PTN"
        onAddClick={handleCreate}
        searchPlaceholder="Cari berdasarkan jurusan atau PTN..."
        searchValue={searchTerm}
        onSearchChange={(val) => {
          setSearchTerm(val);
          setCurrentPage(1);
        }}
        totalItems={filteredMajors.length}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={(page) => setCurrentPage(page)}
      >
        <Table>
          <TableHeader>
            <TableRow className="border-slate-200 bg-slate-50/50">
              <TableHead className="font-bold text-slate-700">Nama Prodi</TableHead>
              <TableHead className="font-bold text-slate-700">Perguruan Tinggi Negeri</TableHead>
              <TableHead className="font-bold text-slate-700">Estimasi Passing Grade</TableHead>
              <TableHead className="font-bold text-slate-700">Daya Tampung</TableHead>
              <TableHead className="font-bold text-slate-700 text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-xs text-slate-500">Memuat Master Data PTN...</TableCell>
              </TableRow>
            ) : paginatedMajors.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-xs text-slate-500">Data jurusan tidak ditemukan.</TableCell>
              </TableRow>
            ) : (
              paginatedMajors.map((major) => (
                <TableRow key={major.id} className="border-slate-100 hover:bg-slate-50/60 transition-colors">
                  <TableCell className="py-3 font-bold text-slate-900 flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-blue-600 shrink-0" />
                    <span>{major.name}</span>
                  </TableCell>
                  <TableCell className="text-xs text-slate-700 font-bold">
                    <div className="flex items-center gap-1.5">
                      <Building2 className="h-4 w-4 text-slate-400 shrink-0" />
                      <span>{major.university_name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-xs font-bold text-blue-600">{major.passing_grade}</TableCell>
                  <TableCell className="text-xs text-slate-600 font-medium">{major.capacity} Kursi</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger render={
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-xl border border-slate-200 hover:bg-slate-100">
                          <MoreHorizontal className="h-4 w-4 text-slate-600" />
                        </Button>
                      } />
                      <DropdownMenuContent align="end" className="w-48 bg-white border border-slate-200 rounded-xl p-1 shadow-md">
                        <DropdownMenuLabel className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Opsi Master</DropdownMenuLabel>
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
        <DialogContent className="max-w-md bg-white rounded-2xl p-6">
          <DialogHeader>
            <DialogTitle className="text-lg font-extrabold">{editingMajor ? "Ubah Data Program Studi" : "Tambah Program Studi PTN"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-slate-600">Nama Program Studi *</Label>
              <Input value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} placeholder="S1 Kedokteran - Saintek" className="rounded-xl h-10 text-xs font-medium" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-slate-600">Nama PTN *</Label>
              <Input value={formData.university_id} onChange={e => setFormData({ ...formData, university_id: e.target.value })} placeholder="UNIVERSITAS INDONESIA" className="rounded-xl h-10 text-xs font-medium" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-600">Passing Grade Est. *</Label>
                <Input type="number" step="0.01" value={formData.passing_grade} onChange={e => setFormData({ ...formData, passing_grade: parseFloat(e.target.value) || 0 })} className="rounded-xl h-10 text-xs font-bold text-blue-600" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-600">Daya Tampung *</Label>
                <Input type="number" value={formData.capacity} onChange={e => setFormData({ ...formData, capacity: parseInt(e.target.value) || 0 })} className="rounded-xl h-10 text-xs font-medium" />
              </div>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setIsDialogOpen(false)} className="rounded-xl font-semibold text-xs">Batal</Button>
            <Button onClick={handleSave} disabled={isSaving || !formData.name || !formData.university_id} className="bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs">Simpan Data</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
