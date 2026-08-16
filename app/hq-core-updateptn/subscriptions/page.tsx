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
import { MoreHorizontal, CreditCard, Edit, Eye, Trash2, ShieldCheck, Clock, AlertTriangle, X, Save } from "lucide-react";
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

interface SubRecord {
  id: string;
  user_name: string;
  user_email: string;
  tier: string;
  status: "active" | "expired" | "pending";
  expires_at: string;
  price_paid: string;
}

export default function AdminSubscriptionsPage() {
  const [subs, setSubs] = useState<SubRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSub, setEditingSub] = useState<SubRecord | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState({
    user_name: "",
    user_email: "",
    tier: "VIP",
    status: "active" as "active" | "expired" | "pending",
    expires_at: "",
    price_paid: "Rp 149.000",
  });

  const mockSubs: SubRecord[] = [
    {
      id: "s1",
      user_name: "Amanda Zevanya",
      user_email: "amanda.zevanya@gmail.com",
      tier: "VIP",
      status: "active",
      expires_at: new Date(Date.now() + 86400000 * 90).toISOString(),
      price_paid: "Rp 249.000",
    },
    {
      id: "s2",
      user_name: "Budi Pratama",
      user_email: "budi.pratama@yahoo.com",
      tier: "Premium SNBT",
      status: "active",
      expires_at: new Date(Date.now() + 86400000 * 30).toISOString(),
      price_paid: "Rp 79.000",
    },
    {
      id: "s3",
      user_name: "Citra Kirana",
      user_email: "citra.kirana@outlook.com",
      tier: "Premium SNBP",
      status: "active",
      expires_at: new Date(Date.now() + 86400000 * 30).toISOString(),
      price_paid: "Rp 85.000",
    },
    {
      id: "s4",
      user_name: "Dimas Anggara",
      user_email: "dimas.anggara@gmail.com",
      tier: "Premium Mandiri",
      status: "active",
      expires_at: new Date(Date.now() + 86400000 * 90).toISOString(),
      price_paid: "Rp 160.000",
    },
    {
      id: "s5",
      user_name: "Eka Putri",
      user_email: "eka.putri@gmail.com",
      tier: "Try Out (8x)",
      status: "active",
      expires_at: new Date(Date.now() + 86400000 * 180).toISOString(),
      price_paid: "Rp 379.000",
    },
    {
      id: "s6",
      user_name: "Farhan Rizky",
      user_email: "farhan.rizky@gmail.com",
      tier: "Trial / Gratis",
      status: "expired",
      expires_at: new Date(Date.now() - 86400000 * 5).toISOString(),
      price_paid: "Rp 0",
    },
  ];

  useEffect(() => {
    fetchSubs();
  }, []);

  const fetchSubs = async () => {
    try {
      setLoading(true);
      const supabase = createClient();
      const { data, error } = await supabase.from("subscriptions").select("*").order("created_at", { ascending: false });

      if (error) {
        setIsDemoMode(true);
        setSubs(mockSubs);
      } else if (data) {
        setSubs(data as SubRecord[]);
        setIsDemoMode(false);
      }
    } catch (err) {
      console.error(err);
      setIsDemoMode(true);
      setSubs(mockSubs);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingSub(null);
    setFormData({
      user_name: "",
      user_email: "",
      tier: "VIP",
      status: "active",
      expires_at: new Date(Date.now() + 86400000 * 30).toISOString().split("T")[0],
      price_paid: "Rp 149.000",
    });
    setIsDialogOpen(true);
  };

  const handleEdit = (sub: SubRecord) => {
    setEditingSub(sub);
    setFormData({
      user_name: sub.user_name,
      user_email: sub.user_email,
      tier: sub.tier,
      status: sub.status,
      expires_at: new Date(sub.expires_at).toISOString().split("T")[0],
      price_paid: sub.price_paid,
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
        if (editingSub) {
          setSubs(prev => prev.map(s => (s.id === editingSub.id ? { ...s, ...payload } : s)));
        } else {
          setSubs(prev => [
            ...prev,
            { id: `s_${Date.now()}`, ...payload },
          ]);
        }
        setIsDialogOpen(false);
        return;
      }

      const supabase = createClient();
      if (editingSub) {
        const { error } = await supabase.from("subscriptions").update(payload).eq("id", editingSub.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("subscriptions").insert([payload]);
        if (error) throw error;
      }

      setIsDialogOpen(false);
      fetchSubs();
    } catch (err) {
      alert("Gagal menyimpan: " + (err as Error).message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Hapus langganan ini?")) return;
    try {
      if (isDemoMode) {
        setSubs(prev => prev.filter(s => s.id !== id));
        return;
      }
      const supabase = createClient();
      const { error } = await supabase.from("subscriptions").delete().eq("id", id);
      if (error) throw error;
      fetchSubs();
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

  const renderTierBadge = (tier: string) => {
    const t = tier.toLowerCase();
    if (t.includes("vip")) {
      return <Badge className="bg-amber-100 text-amber-800 border-amber-300 font-extrabold px-2.5">👑 VIP</Badge>;
    }
    if (t.includes("snbt")) {
      return <Badge className="bg-blue-100 text-blue-800 border-blue-200 font-bold px-2.5">SNBT</Badge>;
    }
    if (t.includes("snbp")) {
      return <Badge className="bg-orange-100 text-orange-800 border-orange-200 font-bold px-2.5">SNBP</Badge>;
    }
    if (t.includes("mandiri")) {
      return <Badge className="bg-teal-100 text-teal-800 border-teal-200 font-bold px-2.5">Mandiri</Badge>;
    }
    if (t.includes("try out") || t.includes("to")) {
      return <Badge className="bg-purple-100 text-purple-800 border-purple-200 font-bold px-2.5">Try Out</Badge>;
    }
    if (t.includes("trial") || t.includes("gratis") || t.includes("basic")) {
      return <Badge variant="outline" className="bg-slate-100 text-slate-700 border-slate-200 font-medium px-2.5">Trial / Gratis</Badge>;
    }
    return <Badge className="bg-indigo-100 text-indigo-800 border-indigo-200 font-bold px-2.5">{tier}</Badge>;
  };

  return (
    <div className="space-y-4">
      {isDemoMode && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <h4 className="text-xs font-bold text-amber-900">Mode Demonstrasi Aktif</h4>
            <p className="text-[11px] text-amber-700">Tabel subscriptions tidak ditemukan di database Supabase Anda, menggunakan data demo.</p>
          </div>
        </div>
      )}

      <CrudLayout
        title="Langganan Active"
        description="Daftar paket aktif siswa, masa berlaku, dan detail billing akun premium UpdatePTN."
        addButtonLabel="Tambah Langganan"
        onAddClick={handleCreate}
        searchPlaceholder="Cari siswa..."
        totalItems={subs.length}
        currentPage={1}
        totalPages={1}
      >
        <Table>
          <TableHeader>
            <TableRow className="border-slate-200 bg-slate-50/50">
              <TableHead className="font-bold text-slate-700">Siswa</TableHead>
              <TableHead className="font-bold text-slate-700">Paket</TableHead>
              <TableHead className="font-bold text-slate-700">Status</TableHead>
              <TableHead className="font-bold text-slate-700">Harga Bayar</TableHead>
              <TableHead className="font-bold text-slate-700">Masa Berlaku</TableHead>
              <TableHead className="font-bold text-slate-700 text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-xs text-slate-500">Memuat data...</TableCell>
              </TableRow>
            ) : subs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-xs text-slate-500">Belum ada data.</TableCell>
              </TableRow>
            ) : (
              subs.map((sub) => (
                <TableRow key={sub.id} className="border-slate-100 hover:bg-slate-50/60 transition-colors">
                  <TableCell className="py-3">
                    <div>
                      <p className="text-sm font-bold text-slate-900 leading-tight">{sub.user_name}</p>
                      <p className="text-xs text-slate-500">{sub.user_email}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    {renderTierBadge(sub.tier)}
                  </TableCell>
                  <TableCell>
                    {sub.status === "active" ? (
                      <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 font-bold text-[11px] gap-1 px-2.5">
                        <ShieldCheck className="h-3.5 w-3.5" />
                        <span>AKTIF</span>
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-rose-50 text-rose-600 border-rose-100 font-semibold text-[11px] px-2.5">
                        EXPIRED
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-xs font-bold text-slate-900">{sub.price_paid}</TableCell>
                  <TableCell className="text-xs text-slate-500">
                    <div className="flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5 text-slate-400" />
                      <span>s.d. {formatDate(sub.expires_at)}</span>
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
                        <DropdownMenuItem onClick={() => handleEdit(sub)} className="text-xs font-semibold text-slate-700 cursor-pointer rounded-lg gap-2">
                          <Edit className="h-3.5 w-3.5 text-indigo-600" />
                          <span>Ubah Durasi</span>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleDelete(sub.id)} className="text-xs font-semibold text-rose-600 cursor-pointer rounded-lg gap-2 focus:bg-rose-50">
                          <Trash2 className="h-3.5 w-3.5 text-rose-600" />
                          <span>Batalkan Paket</span>
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
            <DialogTitle>{editingSub ? "Edit Langganan" : "Tambah Langganan Baru"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Nama Siswa *</Label>
              <Input value={formData.user_name} onChange={e => setFormData({ ...formData, user_name: e.target.value })} placeholder="Amanda Zevanya" />
            </div>
            <div className="space-y-2">
              <Label>Email Siswa *</Label>
              <Input value={formData.user_email} onChange={e => setFormData({ ...formData, user_email: e.target.value })} placeholder="amanda@gmail.com" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Paket Tier *</Label>
                <select
                  value={formData.tier}
                  onChange={e => setFormData({ ...formData, tier: e.target.value })}
                  className="w-full h-10 px-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 bg-white font-medium"
                >
                  <option value="VIP">VIP (Semua Produk)</option>
                  <option value="Premium SNBT">Premium SNBT</option>
                  <option value="Premium SNBP">Premium SNBP</option>
                  <option value="Premium Mandiri">Premium Mandiri</option>
                  <option value="Try Out (Paket Satuan)">Try Out (Paket Satuan)</option>
                  <option value="Trial / Gratis">Trial / Gratis</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label>Status *</Label>
                <select
                  value={formData.status}
                  onChange={e => setFormData({ ...formData, status: e.target.value as any })}
                  className="w-full h-10 px-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 bg-white"
                >
                  <option value="active">Active</option>
                  <option value="expired">Expired</option>
                  <option value="pending">Pending</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Harga Bayar *</Label>
                <Input value={formData.price_paid} onChange={e => setFormData({ ...formData, price_paid: e.target.value })} placeholder="Rp 149.000" />
              </div>
              <div className="space-y-2">
                <Label>Masa Berlaku *</Label>
                <Input type="date" value={formData.expires_at} onChange={e => setFormData({ ...formData, expires_at: e.target.value })} />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Batal</Button>
            <Button onClick={handleSave} disabled={isSaving || !formData.user_name || !formData.user_email} className="bg-blue-600 hover:bg-blue-700 text-white">Simpan</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
