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
import { MoreHorizontal, Building2, MapPin, Edit, Trash2, X, Save, Plus, AlertTriangle } from "lucide-react";
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

interface UniversityRecord {
  id: string;
  name: string;
  code: string | null;
  location: string | null;
  created_at: string;
}

export default function AdminUniversitiesPage() {
  const [unis, setUnis] = useState<UniversityRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingUni, setEditingUni] = useState<UniversityRecord | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    code: "",
    location: "",
  });

  const mockUnis: UniversityRecord[] = [
    {
      id: "u1",
      name: "Universitas Indonesia (UI)",
      code: "UI",
      location: "Depok, Jawa Barat",
      created_at: new Date().toISOString(),
    },
    {
      id: "u2",
      name: "Universitas Gadjah Mada (UGM)",
      code: "UGM",
      location: "Sleman, D.I. Yogyakarta",
      created_at: new Date().toISOString(),
    },
    {
      id: "u3",
      name: "Institut Teknologi Bandung (ITB)",
      code: "ITB",
      location: "Bandung, Jawa Barat",
      created_at: new Date().toISOString(),
    },
  ];

  useEffect(() => {
    fetchUnis();
  }, []);

  const fetchUnis = async () => {
    try {
      setLoading(true);
      const supabase = createClient();
      const { data, error } = await supabase.from("universities").select("*").order("name", { ascending: true });

      if (error) {
        setIsDemoMode(true);
        setUnis(mockUnis);
      } else if (data) {
        setUnis(data as UniversityRecord[]);
        setIsDemoMode(false);
      }
    } catch (err) {
      console.error(err);
      setIsDemoMode(true);
      setUnis(mockUnis);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingUni(null);
    setFormData({ name: "", code: "", location: "" });
    setIsDialogOpen(true);
  };

  const handleEdit = (uni: UniversityRecord) => {
    setEditingUni(uni);
    setFormData({
      name: uni.name,
      code: uni.code || "",
      location: uni.location || "",
    });
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      if (isDemoMode) {
        if (editingUni) {
          setUnis(prev => prev.map(u => (u.id === editingUni.id ? { ...u, ...formData } : u)));
        } else {
          setUnis(prev => [
            ...prev,
            { id: `u_${Date.now()}`, ...formData, created_at: new Date().toISOString() },
          ]);
        }
        setIsDialogOpen(false);
        return;
      }

      const supabase = createClient();
      if (editingUni) {
        const { error } = await supabase.from("universities").update(formData).eq("id", editingUni.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("universities").insert([formData]);
        if (error) throw error;
      }

      setIsDialogOpen(false);
      fetchUnis();
    } catch (err) {
      alert("Gagal menyimpan: " + (err as Error).message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Hapus universitas ini beserta fakultas & prodi terkait?")) return;
    try {
      if (isDemoMode) {
        setUnis(prev => prev.filter(u => u.id !== id));
        return;
      }
      const supabase = createClient();
      const { error } = await supabase.from("universities").delete().eq("id", id);
      if (error) throw error;
      fetchUnis();
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
            <p className="text-[11px] text-amber-700">Tabel universities tidak ditemukan, menggunakan data demo.</p>
          </div>
        </div>
      )}

      <CrudLayout
        title="Universitas (PTN)"
        description="Kelola daftar perguruan tinggi negeri peserta SNBT, kode PTN, dan lokasi kampus."
        addButtonLabel="Tambah Universitas"
        onAddClick={handleCreate}
        searchPlaceholder="Cari berdasarkan nama..."
        totalItems={unis.length}
        currentPage={1}
        totalPages={1}
      >
        <Table>
          <TableHeader>
            <TableRow className="border-slate-200 bg-slate-50/50">
              <TableHead className="font-bold text-slate-700">Nama Universitas</TableHead>
              <TableHead className="font-bold text-slate-700">Kode Singkat</TableHead>
              <TableHead className="font-bold text-slate-700">Lokasi</TableHead>
              <TableHead className="font-bold text-slate-700 text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8 text-xs text-slate-500">Memuat data...</TableCell>
              </TableRow>
            ) : unis.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8 text-xs text-slate-500">Belum ada data.</TableCell>
              </TableRow>
            ) : (
              unis.map((uni) => (
                <TableRow key={uni.id} className="border-slate-100 hover:bg-slate-50/60 transition-colors">
                  <TableCell className="py-3 font-bold text-slate-900 flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-blue-600" />
                    <span>{uni.name}</span>
                  </TableCell>
                  <TableCell className="text-xs font-mono font-bold text-slate-600 uppercase">
                    {uni.code || "-"}
                  </TableCell>
                  <TableCell className="text-xs text-slate-600">
                    <div className="flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5 text-slate-400" />
                      <span>{uni.location || "-"}</span>
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
                        <DropdownMenuItem onClick={() => handleEdit(uni)} className="text-xs font-semibold text-slate-700 cursor-pointer rounded-lg gap-2">
                          <Edit className="h-3.5 w-3.5 text-indigo-600" />
                          <span>Ubah Data</span>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleDelete(uni.id)} className="text-xs font-semibold text-rose-600 cursor-pointer rounded-lg gap-2 focus:bg-rose-50">
                          <Trash2 className="h-3.5 w-3.5 text-rose-600" />
                          <span>Hapus PTN</span>
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
            <DialogTitle>{editingUni ? "Ubah Universitas" : "Tambah Universitas"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Nama PTN *</Label>
              <Input value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} placeholder="Universitas Indonesia (UI)" />
            </div>
            <div className="space-y-2">
              <Label>Kode *</Label>
              <Input value={formData.code} onChange={e => setFormData({ ...formData, code: e.target.value })} placeholder="UI" />
            </div>
            <div className="space-y-2">
              <Label>Lokasi</Label>
              <Input value={formData.location} onChange={e => setFormData({ ...formData, location: e.target.value })} placeholder="Depok, Jawa Barat" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Batal</Button>
            <Button onClick={handleSave} disabled={isSaving || !formData.name || !formData.code} className="bg-blue-600 hover:bg-blue-700 text-white">Simpan</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
