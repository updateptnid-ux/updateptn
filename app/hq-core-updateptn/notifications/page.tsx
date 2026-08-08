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
import { MoreHorizontal, Bell, Send, Edit, Trash2, AlertTriangle, Save, X } from "lucide-react";
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

interface NotificationRecord {
  id: string;
  title: string;
  body: string;
  target_audience: string;
  sent_at: string;
  status: "sent" | "draft";
}

export default function AdminNotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingNotification, setEditingNotification] = useState<NotificationRecord | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    body: "",
    target_audience: "Semua Siswa",
    status: "draft" as "sent" | "draft",
  });

  const mockNotifications: NotificationRecord[] = [
    {
      id: "n1",
      title: "Try Out Nasional Episode 2 Telah Dibuka!",
      body: "Silakan akses menu Try Out untuk mulai mengerjakan Try Out Nasional Episode 2 sekarang.",
      target_audience: "Semua Siswa",
      sent_at: new Date().toISOString(),
      status: "sent",
    },
    {
      id: "n2",
      title: "Jadwal Live Class Kimia Malam Ini",
      body: "Pembahasan Trik Cepat Stoikiometri bersama Kak Sarah jam 19.00 WIB.",
      target_audience: "Siswa Premium/Platinum",
      sent_at: new Date().toISOString(),
      status: "draft",
    },
  ];

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const supabase = createClient();
      const { data, error } = await supabase.from("notifications").select("*").order("created_at", { ascending: false });

      if (error) {
        setIsDemoMode(true);
        setNotifications(mockNotifications);
      } else if (data) {
        setNotifications(data as NotificationRecord[]);
        setIsDemoMode(false);
      }
    } catch (err) {
      console.error(err);
      setIsDemoMode(true);
      setNotifications(mockNotifications);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingNotification(null);
    setFormData({
      title: "",
      body: "",
      target_audience: "Semua Siswa",
      status: "draft",
    });
    setIsDialogOpen(true);
  };

  const handleEdit = (n: NotificationRecord) => {
    setEditingNotification(n);
    setFormData({
      title: n.title,
      body: n.body,
      target_audience: n.target_audience,
      status: n.status,
    });
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      const payload = {
        ...formData,
        sent_at: new Date().toISOString(),
      };

      if (isDemoMode) {
        if (editingNotification) {
          setNotifications(prev => prev.map(n => (n.id === editingNotification.id ? { ...n, ...payload } : n)));
        } else {
          setNotifications(prev => [
            ...prev,
            { id: `n_${Date.now()}`, ...payload },
          ]);
        }
        setIsDialogOpen(false);
        return;
      }

      const supabase = createClient();
      if (editingNotification) {
        const { error } = await supabase.from("notifications").update(payload).eq("id", editingNotification.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("notifications").insert([payload]);
        if (error) throw error;
      }

      setIsDialogOpen(false);
      fetchNotifications();
    } catch (err) {
      alert("Gagal menyimpan: " + (err as Error).message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Hapus notifikasi ini?")) return;
    try {
      if (isDemoMode) {
        setNotifications(prev => prev.filter(n => n.id !== id));
        return;
      }
      const supabase = createClient();
      const { error } = await supabase.from("notifications").delete().eq("id", id);
      if (error) throw error;
      fetchNotifications();
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
            <p className="text-[11px] text-amber-700">Tabel notifications tidak ditemukan, menggunakan data demo.</p>
          </div>
        </div>
      )}

      <CrudLayout
        title="Broadcast Notifikasi"
        description="Kirim broadcast notifikasi sistem, info penting, atau promo ke seluruh/segmentasi pengguna."
        addButtonLabel="Buat Notifikasi"
        onAddClick={handleCreate}
        searchPlaceholder="Cari notifikasi..."
        totalItems={notifications.length}
        currentPage={1}
        totalPages={1}
      >
        <Table>
          <TableHeader>
            <TableRow className="border-slate-200 bg-slate-50/50">
              <TableHead className="font-bold text-slate-700">Judul Notifikasi</TableHead>
              <TableHead className="font-bold text-slate-700">Target Audiens</TableHead>
              <TableHead className="font-bold text-slate-700">Isi Pesan</TableHead>
              <TableHead className="font-bold text-slate-700">Status</TableHead>
              <TableHead className="font-bold text-slate-700">Waktu Kirim</TableHead>
              <TableHead className="font-bold text-slate-700 text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-xs text-slate-500">Memuat data...</TableCell>
              </TableRow>
            ) : notifications.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-xs text-slate-500">Belum ada data.</TableCell>
              </TableRow>
            ) : (
              notifications.map((notif) => (
                <TableRow key={notif.id} className="border-slate-100 hover:bg-slate-50/60 transition-colors">
                  <TableCell className="py-3 font-bold text-slate-900 flex items-center gap-2 max-w-xs truncate">
                    <Bell className="h-4 w-4 text-blue-600 shrink-0" />
                    <span className="truncate">{notif.title}</span>
                  </TableCell>
                  <TableCell className="text-xs text-slate-700 font-semibold">{notif.target_audience}</TableCell>
                  <TableCell className="text-xs text-slate-500 truncate max-w-xs">{notif.body}</TableCell>
                  <TableCell>
                    {notif.status === "sent" ? (
                      <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 font-bold text-[11px] px-2.5">
                        TERKIRIM
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-slate-50 text-slate-400 border-slate-200 font-semibold text-[11px] px-2.5">
                        DRAFT
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-xs text-slate-500">{formatDate(notif.sent_at)}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8 rounded-xl border border-slate-200 hover:bg-slate-100">
                          <MoreHorizontal className="h-4 w-4 text-slate-600" />
                        </Button></DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48 bg-white border border-slate-200 rounded-xl p-1 shadow-md">
                        <DropdownMenuLabel className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Opsi</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleEdit(notif)} className="text-xs font-semibold text-slate-700 cursor-pointer rounded-lg gap-2">
                          <Edit className="h-3.5 w-3.5 text-indigo-600" />
                          <span>Ubah Notifikasi</span>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleDelete(notif.id)} className="text-xs font-semibold text-rose-600 cursor-pointer rounded-lg gap-2 focus:bg-rose-50">
                          <Trash2 className="h-3.5 w-3.5 text-rose-600" />
                          <span>Hapus Notifikasi</span>
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
            <DialogTitle>{editingNotification ? "Ubah Notifikasi" : "Buat Notifikasi Baru"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Judul Notifikasi *</Label>
              <Input value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} placeholder="Jadwal Live Class Baru" />
            </div>
            <div className="space-y-2">
              <Label>Target Audiens *</Label>
              <Input value={formData.target_audience} onChange={e => setFormData({ ...formData, target_audience: e.target.value })} placeholder="Semua Siswa" />
            </div>
            <div className="space-y-2">
              <Label>Isi Pesan Notifikasi *</Label>
              <textarea
                value={formData.body}
                onChange={e => setFormData({ ...formData, body: e.target.value })}
                className="w-full h-24 p-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                placeholder="Tulis pesan..."
              />
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <select
                value={formData.status}
                onChange={e => setFormData({ ...formData, status: e.target.value as any })}
                className="w-full h-10 px-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 bg-white"
              >
                <option value="draft">Draft</option>
                <option value="sent">Sent (Kirim)</option>
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Batal</Button>
            <Button onClick={handleSave} disabled={isSaving || !formData.title || !formData.body} className="bg-blue-600 hover:bg-blue-700 text-white">Simpan</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
