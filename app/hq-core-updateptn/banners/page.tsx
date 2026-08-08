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
import { MoreHorizontal, Image as ImageIcon, Edit, Trash2, AlertTriangle, Save, X } from "lucide-react";
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

interface BannerRecord {
  id: string;
  title: string;
  image_url: string;
  target_link: string;
  position: "home_hero" | "dashboard_top";
  status: "active" | "inactive";
}

export default function AdminBannersPage() {
  const [banners, setBanners] = useState<BannerRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<BannerRecord | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    image_url: "",
    target_link: "",
    position: "dashboard_top" as "home_hero" | "dashboard_top",
    status: "active" as "active" | "inactive",
  });

  const mockBanners: BannerRecord[] = [
    {
      id: "b1",
      title: "Promo Kemerdekaan RI 81",
      image_url: "/banners/merdeka.jpg",
      target_link: "/pricing",
      position: "dashboard_top",
      status: "active",
    },
    {
      id: "b2",
      title: "Pendaftaran Try Out Akbar 2026",
      image_url: "/banners/tryoutakbar.jpg",
      target_link: "/tryout",
      position: "home_hero",
      status: "active",
    },
  ];

  useEffect(() => {
    fetchBanners();
  }, []);

  const fetchBanners = async () => {
    try {
      setLoading(true);
      const supabase = createClient();
      const { data, error } = await supabase.from("banners").select("*").order("created_at", { ascending: false });

      if (error) {
        setIsDemoMode(true);
        setBanners(mockBanners);
      } else if (data) {
        setBanners(data as BannerRecord[]);
        setIsDemoMode(false);
      }
    } catch (err) {
      console.error(err);
      setIsDemoMode(true);
      setBanners(mockBanners);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingBanner(null);
    setFormData({
      title: "",
      image_url: "",
      target_link: "",
      position: "dashboard_top",
      status: "active",
    });
    setIsDialogOpen(true);
  };

  const handleEdit = (b: BannerRecord) => {
    setEditingBanner(b);
    setFormData({
      title: b.title,
      image_url: b.image_url,
      target_link: b.target_link,
      position: b.position,
      status: b.status,
    });
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      if (isDemoMode) {
        if (editingBanner) {
          setBanners(prev => prev.map(b => (b.id === editingBanner.id ? { ...b, ...formData } : b)));
        } else {
          setBanners(prev => [
            ...prev,
            { id: `b_${Date.now()}`, ...formData },
          ]);
        }
        setIsDialogOpen(false);
        return;
      }

      const supabase = createClient();
      if (editingBanner) {
        const { error } = await supabase.from("banners").update(formData).eq("id", editingBanner.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("banners").insert([formData]);
        if (error) throw error;
      }

      setIsDialogOpen(false);
      fetchBanners();
    } catch (err) {
      alert("Gagal menyimpan: " + (err as Error).message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Hapus banner ini?")) return;
    try {
      if (isDemoMode) {
        setBanners(prev => prev.filter(b => b.id !== id));
        return;
      }
      const supabase = createClient();
      const { error } = await supabase.from("banners").delete().eq("id", id);
      if (error) throw error;
      fetchBanners();
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
            <p className="text-[11px] text-amber-700">Tabel banners tidak ditemukan, menggunakan data demo.</p>
          </div>
        </div>
      )}

      <CrudLayout
        title="Banner Promosi"
        description="Kelola banner promosi digital yang muncul di dashboard siswa dan landing page utama."
        addButtonLabel="Pasang Banner"
        onAddClick={handleCreate}
        searchPlaceholder="Cari banner..."
        totalItems={banners.length}
        currentPage={1}
        totalPages={1}
      >
        <Table>
          <TableHeader>
            <TableRow className="border-slate-200 bg-slate-50/50">
              <TableHead className="font-bold text-slate-700">Nama Banner</TableHead>
              <TableHead className="font-bold text-slate-700">Posisi Tampilan</TableHead>
              <TableHead className="font-bold text-slate-700">Target URL / Redirect</TableHead>
              <TableHead className="font-bold text-slate-700">Status</TableHead>
              <TableHead className="font-bold text-slate-700 text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-xs text-slate-500">Memuat data...</TableCell>
              </TableRow>
            ) : banners.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-xs text-slate-500">Belum ada data.</TableCell>
              </TableRow>
            ) : (
              banners.map((ban) => (
                <TableRow key={ban.id} className="border-slate-100 hover:bg-slate-50/60 transition-colors">
                  <TableCell className="py-3 font-bold text-slate-900 flex items-center gap-2">
                    <ImageIcon className="h-4 w-4 text-blue-600 shrink-0" />
                    <span>{ban.title}</span>
                  </TableCell>
                  <TableCell className="text-xs text-slate-700 font-semibold font-mono uppercase">{ban.position}</TableCell>
                  <TableCell className="text-xs text-slate-600 font-mono">{ban.target_link}</TableCell>
                  <TableCell>
                    {ban.status === "active" ? (
                      <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 font-bold text-[11px] px-2.5">
                        AKTIF
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-slate-50 text-slate-400 border-slate-200 font-semibold text-[11px] px-2.5">
                        NON-AKTIF
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8 rounded-xl border border-slate-200 hover:bg-slate-100">
                          <MoreHorizontal className="h-4 w-4 text-slate-600" />
                        </Button></DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48 bg-white border border-slate-200 rounded-xl p-1 shadow-md">
                        <DropdownMenuLabel className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Opsi</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleEdit(ban)} className="text-xs font-semibold text-slate-700 cursor-pointer rounded-lg gap-2">
                          <Edit className="h-3.5 w-3.5 text-indigo-600" />
                          <span>Edit Banner</span>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleDelete(ban.id)} className="text-xs font-semibold text-rose-600 cursor-pointer rounded-lg gap-2 focus:bg-rose-50">
                          <Trash2 className="h-3.5 w-3.5 text-rose-600" />
                          <span>Hapus Banner</span>
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
            <DialogTitle>{editingBanner ? "Ubah Banner" : "Pasang Banner Baru"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Nama/Judul Banner *</Label>
              <Input value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} placeholder="Promo Merdeka" />
            </div>
            <div className="space-y-2">
              <Label>URL Gambar *</Label>
              <Input value={formData.image_url} onChange={e => setFormData({ ...formData, image_url: e.target.value })} placeholder="/banners/promo.jpg" />
            </div>
            <div className="space-y-2">
              <Label>Link Redirect *</Label>
              <Input value={formData.target_link} onChange={e => setFormData({ ...formData, target_link: e.target.value })} placeholder="/pricing" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Posisi Tampilan *</Label>
                <select
                  value={formData.position}
                  onChange={e => setFormData({ ...formData, position: e.target.value as any })}
                  className="w-full h-10 px-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 bg-white"
                >
                  <option value="dashboard_top">Dashboard Atas</option>
                  <option value="home_hero">Home Hero Section</option>
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
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Batal</Button>
            <Button onClick={handleSave} disabled={isSaving || !formData.title || !formData.image_url} className="bg-blue-600 hover:bg-blue-700 text-white">Simpan</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
