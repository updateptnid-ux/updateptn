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
import { MoreHorizontal, PieChart, Building2, Edit, Trash2, AlertTriangle, Save, X } from "lucide-react";
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

interface QuotaRecord {
  id: string;
  major_id: string;
  major_name: string;
  university_name: string;
  quota_snbt: number;
  applicants_last_year: number;
  keketatan_percentage: string;
}

interface MajorItem {
  id: string;
  name: string;
  universities?: { name: string };
}

export default function AdminQuotasPage() {
  const [quotas, setQuotas] = useState<QuotaRecord[]>([]);
  const [majors, setMajors] = useState<MajorItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingQuota, setEditingQuota] = useState<QuotaRecord | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState({
    major_id: "",
    quota_snbt: 50,
    applicants_last_year: 1000,
    keketatan_percentage: "5.00%",
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const supabase = createClient();

      const { data: majorData } = await supabase.from("majors").select("id, name, universities(name)");
      if (majorData) setMajors(majorData as any);

      const { data, error } = await supabase.from("quotas").select("*").order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching quotas:", error);
        setQuotas([]);
        setIsDemoMode(false);
      } else if (data) {
        setQuotas(data as QuotaRecord[]);
        setIsDemoMode(false);
      }
    } catch (err) {
      console.error("Error in fetchData:", err);
      setQuotas([]);
      setIsDemoMode(false);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingQuota(null);
    setFormData({
      major_id: majors[0]?.id || "",
      quota_snbt: 50,
      applicants_last_year: 1000,
      keketatan_percentage: "5.00%",
    });
    setIsDialogOpen(true);
  };

  const handleEdit = (q: QuotaRecord) => {
    setEditingQuota(q);
    setFormData({
      major_id: q.major_id,
      quota_snbt: q.quota_snbt,
      applicants_last_year: q.applicants_last_year,
      keketatan_percentage: q.keketatan_percentage,
    });
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      const selectedMajor = majors.find(m => m.id === formData.major_id);
      const majorName = selectedMajor?.name || "Program Studi";
      const uniName = selectedMajor?.universities?.name || "Universitas";

      const payload = {
        ...formData,
        major_name: majorName,
        university_name: uniName,
      };

      if (isDemoMode) {
        if (editingQuota) {
          setQuotas(prev => prev.map(q => (q.id === editingQuota.id ? { ...q, ...payload } : q)));
        } else {
          setQuotas(prev => [
            ...prev,
            { id: `q_${Date.now()}`, ...payload },
          ]);
        }
        setIsDialogOpen(false);
        return;
      }

      const supabase = createClient();
      if (editingQuota) {
        const { error } = await supabase.from("quotas").update(payload).eq("id", editingQuota.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("quotas").insert([payload]);
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
    if (!confirm("Hapus kuota ini?")) return;
    try {
      if (isDemoMode) {
        setQuotas(prev => prev.filter(q => q.id !== id));
        return;
      }
      const supabase = createClient();
      const { error } = await supabase.from("quotas").delete().eq("id", id);
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
            <p className="text-[11px] text-amber-700">Tabel quotas tidak ditemukan, menggunakan data demo.</p>
          </div>
        </div>
      )}

      <CrudLayout
        title="Kuota & Keketatan"
        description="Kelola histori peminat tahun lalu, daya tampung kuota SNBT saat ini, dan perhitungan rasio keketatan masuk."
        addButtonLabel="Update Rasio"
        onAddClick={handleCreate}
        searchPlaceholder="Cari program studi..."
        totalItems={quotas.length}
        currentPage={1}
        totalPages={1}
      >
        <Table>
          <TableHeader>
            <TableRow className="border-slate-200 bg-slate-50/50">
              <TableHead className="font-bold text-slate-700">Program Studi</TableHead>
              <TableHead className="font-bold text-slate-700">Universitas</TableHead>
              <TableHead className="font-bold text-slate-700">Kuota SNBT</TableHead>
              <TableHead className="font-bold text-slate-700">Peminat Tahun Lalu</TableHead>
              <TableHead className="font-bold text-slate-700">Persentase Keketatan</TableHead>
              <TableHead className="font-bold text-slate-700 text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-xs text-slate-500">Memuat data...</TableCell>
              </TableRow>
            ) : quotas.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-xs text-slate-500">Belum ada data.</TableCell>
              </TableRow>
            ) : (
              quotas.map((quota) => (
                <TableRow key={quota.id} className="border-slate-100 hover:bg-slate-50/60 transition-colors">
                  <TableCell className="py-3 font-bold text-slate-900 flex items-center gap-2">
                    <PieChart className="h-4 w-4 text-blue-600" />
                    <span>{quota.major_name}</span>
                  </TableCell>
                  <TableCell className="text-xs text-slate-700 font-semibold">
                    <div className="flex items-center gap-1">
                      <Building2 className="h-3.5 w-3.5 text-slate-400" />
                      <span>{quota.university_name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-xs text-slate-900 font-bold">{quota.quota_snbt} Kursi</TableCell>
                  <TableCell className="text-xs text-slate-600 font-medium">{quota.applicants_last_year?.toLocaleString()} Pendaftar</TableCell>
                  <TableCell className="text-xs font-bold text-rose-600">{quota.keketatan_percentage}</TableCell>
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
                        <DropdownMenuItem onClick={() => handleEdit(quota)} className="text-xs font-semibold text-slate-700 cursor-pointer rounded-lg gap-2">
                          <Edit className="h-3.5 w-3.5 text-indigo-600" />
                          <span>Ubah Angka</span>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleDelete(quota.id)} className="text-xs font-semibold text-rose-600 cursor-pointer rounded-lg gap-2 focus:bg-rose-50">
                          <Trash2 className="h-3.5 w-3.5 text-rose-600" />
                          <span>Reset Parameter</span>
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
            <DialogTitle>{editingQuota ? "Ubah Keketatan" : "Tambah Keketatan"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Program Studi *</Label>
              {isDemoMode ? (
                <select
                  value={formData.major_id}
                  onChange={e => setFormData({ ...formData, major_id: e.target.value })}
                  className="w-full h-10 px-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 bg-white"
                >
                  <option value="m1">S1 Ilmu Komputer</option>
                  <option value="m2">S1 Kedokteran</option>
                </select>
              ) : (
                <select
                  value={formData.major_id}
                  onChange={e => setFormData({ ...formData, major_id: e.target.value })}
                  className="w-full h-10 px-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 bg-white"
                >
                  {majors.map(m => (
                    <option key={m.id} value={m.id}>{m.name}</option>
                  ))}
                </select>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Kuota SNBT *</Label>
                <Input type="number" value={formData.quota_snbt} onChange={e => setFormData({ ...formData, quota_snbt: parseInt(e.target.value) || 0 })} />
              </div>
              <div className="space-y-2">
                <Label>Peminat Tahun Lalu *</Label>
                <Input type="number" value={formData.applicants_last_year} onChange={e => setFormData({ ...formData, applicants_last_year: parseInt(e.target.value) || 0 })} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Persentase Keketatan *</Label>
              <Input value={formData.keketatan_percentage} onChange={e => setFormData({ ...formData, keketatan_percentage: e.target.value })} placeholder="2.45%" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Batal</Button>
            <Button onClick={handleSave} disabled={isSaving || !formData.major_id} className="bg-blue-600 hover:bg-blue-700 text-white">Simpan</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
