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
import { MoreHorizontal, Receipt, Edit, Trash2, Calendar, AlertTriangle, Save, X } from "lucide-react";
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

interface PaymentRecord {
  id: string;
  invoice_no: string;
  user_name: string;
  user_email: string;
  amount: string;
  method: string;
  status: "success" | "pending" | "failed";
  created_at: string;
}

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPayment, setEditingPayment] = useState<PaymentRecord | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState({
    invoice_no: "",
    user_name: "",
    user_email: "",
    amount: "Rp 149.000",
    method: "GoPay / Midtrans",
    status: "pending" as "success" | "pending" | "failed",
  });

  const mockPayments: PaymentRecord[] = [
    {
      id: "p1",
      invoice_no: "INV-20260801-001",
      user_name: "Amanda Zevanya",
      user_email: "amanda.zevanya@gmail.com",
      amount: "Rp 249.000",
      method: "GoPay / Midtrans",
      status: "success",
      created_at: new Date().toISOString(),
    },
    {
      id: "p2",
      invoice_no: "INV-20260801-002",
      user_name: "Budi Pratama",
      user_email: "budi.pratama@yahoo.com",
      amount: "Rp 149.000",
      method: "VA Mandiri / Midtrans",
      status: "pending",
      created_at: new Date(Date.now() - 3600000).toISOString(),
    },
    {
      id: "p3",
      invoice_no: "INV-20260730-089",
      user_name: "Citra Kirana",
      user_email: "citra.kirana@outlook.com",
      amount: "Rp 149.000",
      method: "VA BCA / Midtrans",
      status: "failed",
      created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    },
  ];

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const supabase = createClient();
      const { data, error } = await supabase.from("payments").select("*").order("created_at", { ascending: false });

      if (error) {
        setIsDemoMode(true);
        setPayments(mockPayments);
      } else if (data) {
        setPayments(data as PaymentRecord[]);
        setIsDemoMode(false);
      }
    } catch (err) {
      console.error(err);
      setIsDemoMode(true);
      setPayments(mockPayments);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingPayment(null);
    setFormData({
      invoice_no: `INV-${new Date().toISOString().split("T")[0].replace(/-/g, "")}-${Math.floor(100 + Math.random() * 900)}`,
      user_name: "",
      user_email: "",
      amount: "Rp 149.000",
      method: "GoPay / Midtrans",
      status: "success",
    });
    setIsDialogOpen(true);
  };

  const handleEdit = (p: PaymentRecord) => {
    setEditingPayment(p);
    setFormData({
      invoice_no: p.invoice_no,
      user_name: p.user_name,
      user_email: p.user_email,
      amount: p.amount,
      method: p.method,
      status: p.status,
    });
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      const payload = {
        ...formData,
        created_at: new Date().toISOString(),
      };

      if (isDemoMode) {
        if (editingPayment) {
          setPayments(prev => prev.map(p => (p.id === editingPayment.id ? { ...p, ...formData } : p)));
        } else {
          setPayments(prev => [
            ...prev,
            { id: `p_${Date.now()}`, ...payload },
          ]);
        }
        setIsDialogOpen(false);
        return;
      }

      const supabase = createClient();
      if (editingPayment) {
        const { error } = await supabase.from("payments").update(formData).eq("id", editingPayment.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("payments").insert([payload]);
        if (error) throw error;
      }

      setIsDialogOpen(false);
      fetchPayments();
    } catch (err) {
      alert("Gagal menyimpan: " + (err as Error).message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Hapus transaksi ini?")) return;
    try {
      if (isDemoMode) {
        setPayments(prev => prev.filter(p => p.id !== id));
        return;
      }
      const supabase = createClient();
      const { error } = await supabase.from("payments").delete().eq("id", id);
      if (error) throw error;
      fetchPayments();
    } catch (err) {
      alert("Gagal menghapus: " + (err as Error).message);
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
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
            <p className="text-[11px] text-amber-700">Tabel payments tidak ditemukan di database Supabase Anda, menggunakan data demo.</p>
          </div>
        </div>
      )}

      <CrudLayout
        title="Transaksi Payment"
        description="Pantau log pembayaran, status billing Midtrans, dan laporan keuangan harian."
        addButtonLabel="Tambah Transaksi"
        onAddClick={handleCreate}
        searchPlaceholder="Cari invoice..."
        totalItems={payments.length}
        currentPage={1}
        totalPages={1}
      >
        <Table>
          <TableHeader>
            <TableRow className="border-slate-200 bg-slate-50/50">
              <TableHead className="font-bold text-slate-700">No. Invoice</TableHead>
              <TableHead className="font-bold text-slate-700">Siswa</TableHead>
              <TableHead className="font-bold text-slate-700">Metode</TableHead>
              <TableHead className="font-bold text-slate-700">Total Nominal</TableHead>
              <TableHead className="font-bold text-slate-700">Status</TableHead>
              <TableHead className="font-bold text-slate-700">Waktu Transaksi</TableHead>
              <TableHead className="font-bold text-slate-700 text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-xs text-slate-500">Memuat data...</TableCell>
              </TableRow>
            ) : payments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-xs text-slate-500">Belum ada data.</TableCell>
              </TableRow>
            ) : (
              payments.map((payment) => (
                <TableRow key={payment.id} className="border-slate-100 hover:bg-slate-50/60 transition-colors">
                  <TableCell className="font-mono text-xs font-bold text-slate-900">{payment.invoice_no}</TableCell>
                  <TableCell className="py-3">
                    <div>
                      <p className="text-sm font-bold text-slate-900 leading-tight">{payment.user_name}</p>
                      <p className="text-xs text-slate-500">{payment.user_email}</p>
                    </div>
                  </TableCell>
                  <TableCell className="text-xs font-semibold text-slate-600">{payment.method}</TableCell>
                  <TableCell className="text-xs font-black text-slate-900">{payment.amount}</TableCell>
                  <TableCell>
                    {payment.status === "success" ? (
                      <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 font-bold text-[11px] px-2.5">
                        SUCCESS
                      </Badge>
                    ) : payment.status === "pending" ? (
                      <Badge className="bg-amber-100 text-amber-800 border-amber-200 font-bold text-[11px] px-2.5">
                        PENDING
                      </Badge>
                    ) : (
                      <Badge className="bg-rose-100 text-rose-800 border-rose-200 font-bold text-[11px] px-2.5">
                        FAILED
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-xs text-slate-500">{formatDate(payment.created_at)}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8 rounded-xl border border-slate-200 hover:bg-slate-100">
                          <MoreHorizontal className="h-4 w-4 text-slate-600" />
                        </Button></DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48 bg-white border border-slate-200 rounded-xl p-1 shadow-md">
                        <DropdownMenuLabel className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Opsi</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleEdit(payment)} className="text-xs font-semibold text-slate-700 cursor-pointer rounded-lg gap-2">
                          <Edit className="h-3.5 w-3.5 text-indigo-600" />
                          <span>Ubah Transaksi</span>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleDelete(payment.id)} className="text-xs font-semibold text-rose-600 cursor-pointer rounded-lg gap-2 focus:bg-rose-50">
                          <Trash2 className="h-3.5 w-3.5 text-rose-600" />
                          <span>Batalkan Transaksi</span>
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
            <DialogTitle>{editingPayment ? "Edit Transaksi" : "Tambah Transaksi Manual"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>No. Invoice *</Label>
              <Input value={formData.invoice_no} onChange={e => setFormData({ ...formData, invoice_no: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Nama Siswa *</Label>
              <Input value={formData.user_name} onChange={e => setFormData({ ...formData, user_name: e.target.value })} placeholder="Budi Pratama" />
            </div>
            <div className="space-y-2">
              <Label>Email Siswa *</Label>
              <Input value={formData.user_email} onChange={e => setFormData({ ...formData, user_email: e.target.value })} placeholder="budi@yahoo.com" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Nominal Pembayaran *</Label>
                <Input value={formData.amount} onChange={e => setFormData({ ...formData, amount: e.target.value })} placeholder="Rp 149.000" />
              </div>
              <div className="space-y-2">
                <Label>Metode *</Label>
                <Input value={formData.method} onChange={e => setFormData({ ...formData, method: e.target.value })} placeholder="GoPay / Midtrans" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Status Transaksi</Label>
              <select
                value={formData.status}
                onChange={e => setFormData({ ...formData, status: e.target.value as any })}
                className="w-full h-10 px-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 bg-white"
              >
                <option value="success">Success</option>
                <option value="pending">Pending</option>
                <option value="failed">Failed</option>
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Batal</Button>
            <Button onClick={handleSave} disabled={isSaving || !formData.invoice_no || !formData.user_name} className="bg-blue-600 hover:bg-blue-700 text-white">Simpan</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
