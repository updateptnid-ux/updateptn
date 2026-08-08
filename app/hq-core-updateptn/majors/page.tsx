"use client";

import { useState, useEffect, useCallback, useRef } from "react";
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
  DropdownMenuGroup,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal, BookOpen, Building2, Edit, Trash2, X, Save, AlertTriangle, Search } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface MajorRecord {
  id: string;
  // Raw fields from DB
  prodi: string;
  jenjang: string;
  kelompok: string;
  university_name: string; // = univ
  passing_grade: number;
  capacity: number;
  // Display helper
  name: string;
}

export default function AdminMajorsPage() {
  const [majors, setMajors] = useState<MajorRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingMajor, setEditingMajor] = useState<MajorRecord | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const itemsPerPage = 20;
  const [isImporting, setIsImporting] = useState(false);
  const searchDebounceRef = useRef<NodeJS.Timeout | null>(null);

  const [formData, setFormData] = useState({
    prodi: "",
    university_id: "",
    jenjang: "S1",
    kelompok: "Saintek",
    passing_grade: 650.0,
    capacity: 50,
  });

  // Fetch dengan server-side search & pagination
  const fetchData = useCallback(async (search: string = "", page: number = 1) => {
    try {
      setLoading(true);
      const supabase = createClient();
      const from = (page - 1) * itemsPerPage;
      const to = from + itemsPerPage - 1;

      let query = supabase
        .from("prodi_reference")
        .select("id, univ, prodi, jenjang, kelompok, passing_grade_est, daya_tampung", { count: "exact" })
        .order("univ", { ascending: true })
        .order("prodi", { ascending: true })
        .range(from, to);

      // Filter server-side jika ada search
      if (search.trim()) {
        query = query.or(`univ.ilike.%${search.trim()}%,prodi.ilike.%${search.trim()}%`);
      }

      const { data: prodiData, error: prodiError, count } = await query;

      if (!prodiError && prodiData && prodiData.length > 0) {
        const formatted = prodiData.map((item: any) => ({
          id: String(item.id),
          prodi: item.prodi,
          jenjang: item.jenjang || "S1",
          kelompok: item.kelompok || "Saintek",
          university_name: item.univ,
          passing_grade: Number(item.passing_grade_est) || 500,
          capacity: Number(item.daya_tampung) || 30,
          name: `${item.prodi}${item.jenjang ? ` (${item.jenjang})` : ""} - ${item.kelompok || "Saintek"}`,
        }));
        setMajors(formatted);
        setTotalCount(count ?? 0);
        setIsDemoMode(false);
      } else if (prodiError) {
        console.error("DB error:", prodiError);
        setMajors([]);
        setTotalCount(0);
        setIsDemoMode(true);
      } else {
        // Tidak ada hasil
        setMajors([]);
        setTotalCount(0);
      }
    } catch (err) {
      console.error(err);
      setIsDemoMode(true);
    } finally {
      setLoading(false);
    }
  }, [itemsPerPage]);

  useEffect(() => {
    fetchData(searchTerm, currentPage);
  }, [currentPage]);

  // Debounce search
  const handleSearchChange = (val: string) => {
    setSearchTerm(val);
    setCurrentPage(1);
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    searchDebounceRef.current = setTimeout(() => {
      fetchData(val, 1);
    }, 400);
  };

  // Pagination sekarang server-side
  const totalPages = Math.ceil(totalCount / itemsPerPage) || 1;

  const handleCreate = () => {
    setEditingMajor(null);
    setFormData({
      prodi: "",
      university_id: "",
      jenjang: "S1",
      kelompok: "Saintek",
      passing_grade: 650.0,
      capacity: 50,
    });
    setIsDialogOpen(true);
  };

  const handleEdit = (major: MajorRecord) => {
    setEditingMajor(major);
    setFormData({
      prodi: major.prodi,
      university_id: major.university_name,
      jenjang: major.jenjang || "S1",
      kelompok: major.kelompok || "Saintek",
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
                ? {
                    ...m,
                    prodi: formData.prodi,
                    jenjang: formData.jenjang,
                    kelompok: formData.kelompok,
                    university_name: formData.university_id,
                    passing_grade: formData.passing_grade,
                    capacity: formData.capacity,
                    name: `${formData.prodi} (${formData.jenjang}) - ${formData.kelompok}`,
                  }
                : m
            )
          );
        } else {
          setMajors((prev) => [
            {
              id: `mj_${Date.now()}`,
              prodi: formData.prodi,
              jenjang: formData.jenjang,
              kelompok: formData.kelompok,
              university_name: formData.university_id,
              passing_grade: formData.passing_grade,
              capacity: formData.capacity,
              name: `${formData.prodi} (${formData.jenjang}) - ${formData.kelompok}`,
            },
            ...prev,
          ]);
        }
        setIsDialogOpen(false);
        return;
      }

      const supabase = createClient();
      const payload = {
        prodi: formData.prodi,
        univ: formData.university_id,
        jenjang: formData.jenjang,
        kelompok: formData.kelompok,
        passing_grade_est: formData.passing_grade,
        daya_tampung: formData.capacity,
      };

      if (editingMajor) {
        await supabase.from("prodi_reference").update(payload).eq("id", editingMajor.id);
      } else {
        await supabase.from("prodi_reference").insert([payload]);
      }

      setIsDialogOpen(false);
      fetchData(searchTerm, currentPage);
    } catch (err) {
      alert("Gagal menyimpan: " + (err as Error).message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Hapus program studi ini dari Master Data?")) return;
    try {
      const supabase = createClient();
      await supabase.from("prodi_reference").delete().eq("id", id);
      fetchData(searchTerm, currentPage);
    } catch (err) {
      alert("Gagal menghapus: " + (err as Error).message);
    }
  };

  const importToDatabase = async () => {
    try {
      if (!confirm("Apakah Anda yakin ingin mengimpor seluruh data JSON ke Database Utama? Ini bisa memakan waktu beberapa detik.")) return;
      setIsImporting(true);
      const res = await fetch("/data_snbt.json");
      if (!res.ok) throw new Error("Gagal membaca file JSON");
      const localData = await res.json();
      
      const supabase = createClient();
      
      // Batch insert logic (Supabase limit is typically 1000 or so, we'll do batches of 1000)
      const batchSize = 1000;
      for (let i = 0; i < localData.length; i += batchSize) {
        const batch = localData.slice(i, i + batchSize).map((item: any) => ({
          univ: item.univ,
          prodi: item.prodi,
          jenjang: item.jenjang,
          kelompok: item.kelompok,
          passing_grade_est: item.passing_grade_est,
          daya_tampung: item.daya_tampung,
          peminat: item.peminat,
          keketatan: item.keketatan,
          ukt_min: item.ukt_min,
          ukt_max: item.ukt_max,
          prov: item.prov
        }));
        
        const { error } = await supabase.from("prodi_reference").insert(batch);
        if (error) throw error;
      }
      
      alert("Berhasil mengimpor " + localData.length + " prodi ke database!");
      fetchData();
    } catch (err) {
      console.error(err);
      alert("Gagal mengimpor: " + (err as Error).message);
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="space-y-4 font-sans">
      {isDemoMode && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <h4 className="text-xs font-bold text-amber-900">Koneksi Database Gagal</h4>
            <p className="text-[11px] text-amber-700 mt-1">
              Tidak dapat terhubung ke Supabase. Periksa koneksi internet dan konfigurasi Supabase.
            </p>
          </div>
        </div>
      )}

      <CrudLayout
        title="Master Data PTN & Program Studi"
        description={`Manajemen ${totalCount.toLocaleString()} Program Studi PTN se-Indonesia. Pencarian langsung ke database.`}
        addButtonLabel="Tambah Prodi PTN"
        onAddClick={handleCreate}
        searchPlaceholder="Cari nama PTN atau jurusan (cth: Malang, Kedokteran)..."
        searchValue={searchTerm}
        onSearchChange={handleSearchChange}
        totalItems={totalCount}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={(page) => setCurrentPage(page)}
      >
        <Table>
          <TableHeader>
            <TableRow className="border-slate-200 bg-slate-50/50">
              <TableHead className="font-bold text-slate-700">Nama Prodi</TableHead>
              <TableHead className="font-bold text-slate-700">Jenjang</TableHead>
              <TableHead className="font-bold text-slate-700">Kelompok</TableHead>
              <TableHead className="font-bold text-slate-700">Perguruan Tinggi Negeri</TableHead>
              <TableHead className="font-bold text-slate-700">Est. Passing Grade</TableHead>
              <TableHead className="font-bold text-slate-700">Daya Tampung</TableHead>
              <TableHead className="font-bold text-slate-700 text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-xs text-slate-500">Mencari data di database...</TableCell>
              </TableRow>
            ) : majors.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-xs text-slate-500">
                  {searchTerm ? `Tidak ada prodi/PTN yang cocok dengan "${searchTerm}"` : "Belum ada data. Jalankan import data terlebih dahulu."}
                </TableCell>
              </TableRow>
            ) : (
              majors.map((major) => (
                <TableRow key={major.id} className="border-slate-100 hover:bg-slate-50/60 transition-colors">
                  <TableCell className="py-3">
                    <div className="flex items-center gap-2">
                      <BookOpen className="h-4 w-4 text-blue-600 shrink-0" />
                      <span className="font-bold text-slate-900 text-sm">{major.prodi}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={`text-xs font-bold px-2 ${
                        major.jenjang === "S1" ? "bg-blue-50 text-blue-700 border-blue-200"
                        : major.jenjang === "D4" ? "bg-purple-50 text-purple-700 border-purple-200"
                        : major.jenjang === "D3" ? "bg-orange-50 text-orange-700 border-orange-200"
                        : "bg-slate-50 text-slate-600 border-slate-200"
                      }`}
                    >
                      {major.jenjang}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={`text-xs font-bold px-2 ${
                        major.kelompok?.toLowerCase().includes("saintek")
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : "bg-rose-50 text-rose-700 border-rose-200"
                      }`}
                    >
                      {major.kelompok}
                    </Badge>
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
                      <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8 rounded-xl border border-slate-200 hover:bg-slate-100">
                          <MoreHorizontal className="h-4 w-4 text-slate-600" />
                        </Button></DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48 bg-white border border-slate-200 rounded-xl p-1 shadow-md">
                        <DropdownMenuGroup>
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

      {/* Dialog Tambah / Edit */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-lg bg-white rounded-2xl p-6">
          <DialogHeader>
            <DialogTitle className="text-lg font-extrabold">
              {editingMajor ? "Ubah Data Program Studi" : "Tambah Program Studi PTN"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-3">
            {/* Nama Prodi */}
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-slate-600">Nama Program Studi *</Label>
              <Input
                value={formData.prodi}
                onChange={e => setFormData({ ...formData, prodi: e.target.value })}
                placeholder="cth: TEKNIK MESIN"
                className="rounded-xl h-10 text-xs font-medium"
              />
            </div>

            {/* Nama PTN */}
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-slate-600">Nama PTN *</Label>
              <Input
                value={formData.university_id}
                onChange={e => setFormData({ ...formData, university_id: e.target.value })}
                placeholder="cth: POLITEKNIK NEGERI MALANG"
                className="rounded-xl h-10 text-xs font-medium"
              />
            </div>

            {/* Jenjang & Kelompok */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-600">Jenjang *</Label>
                <select
                  value={formData.jenjang}
                  onChange={e => setFormData({ ...formData, jenjang: e.target.value })}
                  className="w-full h-10 rounded-xl border border-slate-300 bg-white px-3 text-xs font-bold text-slate-800 focus:outline-none focus:border-blue-500"
                >
                  <option value="S1">S1 (Sarjana)</option>
                  <option value="D4">D4 (Sarjana Terapan)</option>
                  <option value="D3">D3 (Diploma 3)</option>
                  <option value="D2">D2 (Diploma 2)</option>
                  <option value="D1">D1 (Diploma 1)</option>
                  <option value="S2">S2 (Magister)</option>
                  <option value="Profesi">Profesi</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-600">Kelompok *</Label>
                <select
                  value={formData.kelompok}
                  onChange={e => setFormData({ ...formData, kelompok: e.target.value })}
                  className="w-full h-10 rounded-xl border border-slate-300 bg-white px-3 text-xs font-bold text-slate-800 focus:outline-none focus:border-blue-500"
                >
                  <option value="Saintek">Saintek</option>
                  <option value="Soshum">Soshum</option>
                  <option value="Campuran">Campuran</option>
                </select>
              </div>
            </div>

            {/* Passing Grade & Daya Tampung */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-600">Passing Grade Est. *</Label>
                <Input
                  type="number" step="0.01"
                  value={formData.passing_grade}
                  onChange={e => setFormData({ ...formData, passing_grade: parseFloat(e.target.value) || 0 })}
                  className="rounded-xl h-10 text-xs font-bold text-blue-600"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-600">Daya Tampung *</Label>
                <Input
                  type="number"
                  value={formData.capacity}
                  onChange={e => setFormData({ ...formData, capacity: parseInt(e.target.value) || 0 })}
                  className="rounded-xl h-10 text-xs font-medium"
                />
              </div>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setIsDialogOpen(false)} className="rounded-xl font-semibold text-xs">Batal</Button>
            <Button
              onClick={handleSave}
              disabled={isSaving || !formData.prodi || !formData.university_id}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs"
            >
              {isSaving ? "Menyimpan..." : "Simpan Data"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
