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
import { MoreHorizontal, Ticket, Edit, Trash2, Calendar, AlertTriangle, Save, X } from "lucide-react";
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

interface VoucherRecord {
  id: string;
  code: string;
  discount_type: "percentage" | "fixed";
  value: string;
  category: "universal" | "snbt" | "snbp" | "mandiri" | "tryout" | "bimbel" | "cek-peluang";
  usage_limit: number;
  usage_count: number;
  status: "active" | "expired";
  expires_at: string;
}

export default function AdminVouchersPage() {
  const [vouchers, setVouchers] = useState<VoucherRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingVoucher, setEditingVoucher] = useState<VoucherRecord | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState({
    code: "",
    discount_type: "percentage" as "percentage" | "fixed",
    value: "15%",
    category: "universal" as "universal" | "snbt" | "snbp" | "mandiri" | "tryout" | "bimbel" | "cek-peluang",
    usage_limit: 100,
    usage_count: 0,
    status: "active" as "active" | "expired",
    expires_at: "",
  });

  useEffect(() => {
    fetchVouchers();
  }, []);

  const fetchVouchers = async () => {
    try {
      setLoading(true);
      const supabase = createClient();
      const { data, error } = await supabase.from("vouchers").select("*").order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching vouchers:", error);
        setVouchers([]);
        setIsDemoMode(false);
      } else if (data) {
        setVouchers(data as VoucherRecord[]);
        setIsDemoMode(false);
      }
    } catch (err) {
      console.error("Error in fetchVouchers:", err);
      setVouchers([]);
      setIsDemoMode(false);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingVoucher(null);
    setFormData({
      code: "",
      discount_type: "percentage",
      value: "15%",
      category: "universal",
      usage_limit: 100,
      usage_count: 0,
      status: "active",
      expires_at: new Date(Date.now() + 86400000 * 30).toISOString().split("T")[0],
    });
    setIsDialogOpen(true);
  };

  const handleEdit = (v: VoucherRecord) => {
    setEditingVoucher(v);
    setFormData({
      code: v.code,
      discount_type: v.discount_type,
      value: v.value,
      category: v.category || "universal",
      usage_limit: v.usage_limit,
      usage_count: v.usage_count,
      status: v.status,
      expires_at: new Date(v.expires_at).toISOString().split("T")[0],
    });
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      const payload = {
        ...formData,
        expires_at: new Date(formData.expires_at).toISOString(),
      };

      if (isDemoMode) {
        if (editingVoucher) {
          setVouchers(prev => prev.map(v => (v.id === editingVoucher.id ? { ...v, ...formData } : v)));
        } else {
          setVouchers(prev => [
            ...prev,
            { id: `v_${Date.now()}`, ...payload },
          ]);
        }
        setIsDialogOpen(false);
        return;
      }

      const supabase = createClient();
      if (editingVoucher) {
        const { error } = await supabase.from("vouchers").update(payload).eq("id", editingVoucher.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("vouchers").insert([payload]);
        if (error) throw error;
      }

      setIsDialogOpen(false);
      fetchVouchers();
    } catch (err) {
      alert("Gagal menyimpan: " + (err as Error).message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Hapus voucher ini?")) return;
    try {
      if (isDemoMode) {
        setVouchers(prev => prev.filter(v => v.id !== id));
        return;
      }
      const supabase = createClient();
      const { error } = await supabase.from("vouchers").delete().eq("id", id);
      if (error) throw error;
      fetchVouchers();
    } catch (err) {
      alert("Gagal menghapus: " + (err as Error).message);
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="space-y-4">
      {isDemoMode && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <h4 className="text-xs font-bold text-amber-900">Mode Demonstrasi Aktif</h4>
            <p className="text-[11px] text-amber-700">Tabel vouchers tidak ditemukan di database Supabase Anda, menggunakan data demo.</p>
          </div>
        </div>
      )}

      <CrudLayout
        title="Voucher Diskon"
        description="Kelola promo potongan harga, kode diskon musiman, kuota penggunaan, dan durasi aktif voucher."
        addButtonLabel="Buat Voucher"
        onAddClick={handleCreate}
        searchPlaceholder="Cari kode voucher..."
        totalItems={vouchers.length}
        currentPage={1}
        totalPages={1}
      >
        <Table>
          <TableHeader>
            <TableRow className="border-slate-200 bg-slate-50/50">
              <TableHead className="font-bold text-slate-700">Kode Voucher</TableHead>
              <TableHead className="font-bold text-slate-700">Jenis Diskon</TableHead>
              <TableHead className="font-bold text-slate-700">Kategori</TableHead>
              <TableHead className="font-bold text-slate-700">Nilai Potongan</TableHead>
              <TableHead className="font-bold text-slate-700">Penggunaan</TableHead>
              <TableHead className="font-bold text-slate-700">Status</TableHead>
              <TableHead className="font-bold text-slate-700">Tanggal Kadaluarsa</TableHead>
              <TableHead className="font-bold text-slate-700 text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-xs text-slate-500">Memuat data...</TableCell>
              </TableRow>
            ) : vouchers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-xs text-slate-500">Belum ada data.</TableCell>
              </TableRow>
            ) : (
              vouchers.map((voucher) => (
                <TableRow key={voucher.id} className="border-slate-100 hover:bg-slate-50/60 transition-colors">
                  <TableCell className="font-mono text-xs font-black text-slate-900 flex items-center gap-1.5 py-3">
                    <Ticket className="h-4 w-4 text-blue-500" />
                    <span>{voucher.code}</span>
                  </TableCell>
                  <TableCell className="text-xs text-slate-700 font-semibold uppercase">
                    {voucher.discount_type === "percentage" ? "Persentase" : "Nominal Tetap"}
                  </TableCell>
                  <TableCell className="text-xs text-slate-700 font-bold uppercase">
                    {voucher.category === "universal" ? "Semua Paket" : voucher.category}
                  </TableCell>
                  <TableCell className="text-xs font-bold text-slate-900">{voucher.value}</TableCell>
                  <TableCell className="text-xs text-slate-700 font-semibold">
                    {voucher.usage_count} / {voucher.usage_limit} kali
                  </TableCell>
                  <TableCell>
                    {voucher.status === "active" ? (
                      <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 font-bold text-[11px] px-2.5">
                        AKTIF
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-slate-50 text-slate-400 border-slate-200 font-semibold text-[11px] px-2.5">
                        EXPIRED
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-xs text-slate-500">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5 text-slate-400" />
                      <span>{formatDate(voucher.expires_at)}</span>
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
                        <DropdownMenuItem onClick={() => handleEdit(voucher)} className="text-xs font-semibold text-slate-700 cursor-pointer rounded-lg gap-2">
                          <Edit className="h-3.5 w-3.5 text-indigo-600" />
                          <span>Edit Voucher</span>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleDelete(voucher.id)} className="text-xs font-semibold text-rose-600 cursor-pointer rounded-lg gap-2 focus:bg-rose-50">
                          <Trash2 className="h-3.5 w-3.5 text-rose-600" />
                          <span>Hapus Voucher</span>
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
            <DialogTitle>{editingVoucher ? "Edit Voucher" : "Buat Voucher Baru"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Kode Voucher *</Label>
              <Input value={formData.code} onChange={e => setFormData({ ...formData, code: e.target.value.toUpperCase() })} placeholder="PROMOUTBK" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Jenis Diskon *</Label>
                <select
                  value={formData.discount_type}
                  onChange={e => setFormData({ ...formData, discount_type: e.target.value as any })}
                  className="w-full h-10 px-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 bg-white"
                >
                  <option value="percentage">Persentase (%)</option>
                  <option value="fixed">Nominal Tetap (Rp)</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label>Kategori Paket *</Label>
                <select
                  value={formData.category}
                  onChange={e => setFormData({ ...formData, category: e.target.value as any })}
                  className="w-full h-10 px-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 bg-white"
                >
                  <option value="universal">Semua Paket (Universal)</option>
                  <option value="snbt">Premium SNBT</option>
                  <option value="snbp">Premium SNBP</option>
                  <option value="mandiri">Premium Mandiri</option>
                  <option value="tryout">Paket Try Out</option>
                  <option value="bimbel">Paket Bimbel</option>
                  <option value="cek-peluang">Paket Cek Peluang PTN</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label>Nilai Potongan *</Label>
                <Input value={formData.value} onChange={e => setFormData({ ...formData, value: e.target.value })} placeholder="15% / Rp 50.000" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Kuota Limit *</Label>
                <Input type="number" value={formData.usage_limit} onChange={e => setFormData({ ...formData, usage_limit: parseInt(e.target.value) || 0 })} />
              </div>
              <div className="space-y-2">
                <Label>Batas Kadaluarsa *</Label>
                <Input type="date" value={formData.expires_at} onChange={e => setFormData({ ...formData, expires_at: e.target.value })} />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Batal</Button>
            <Button onClick={handleSave} disabled={isSaving || !formData.code || !formData.value} className="bg-blue-600 hover:bg-blue-700 text-white">Simpan</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
