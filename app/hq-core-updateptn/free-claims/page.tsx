"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { updateFreeClaimAction } from "@/actions/free-claims";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";
import {
  CheckCircle2, XCircle, Clock, AtSign, ImageIcon, AlertTriangle,
  RefreshCw, Gift,
} from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle
} from "@/components/ui/dialog";

interface ClaimRequest {
  id: string;
  user_id: string;
  tryout_id: string;
  username_ig: string;
  username_tt: string;
  proof_url: string;
  status: "pending" | "approved" | "rejected";
  created_at: string;
  // joined
  user_email?: string;
  tryout_title?: string;
}

export default function FreeClaimsPage() {
  const [claims, setClaims] = useState<ClaimRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<"all" | "pending" | "approved" | "rejected">("pending");

  const fetchClaims = useCallback(async () => {
    try {
      setLoading(true);
      const supabase = createClient();

      const { data, error } = await supabase
        .from("free_access_requests")
        .select("*, tryouts(title)")
        .order("created_at", { ascending: false });

      if (error) throw error;

      if (data) {
        // Fetch user emails separately for each unique user_id
        const userIds = [...new Set(data.map((d: any) => d.user_id))];
        const { data: userData } = await supabase
          .from("profiles")
          .select("id, email, full_name")
          .in("id", userIds);

        const userMap: Record<string, string> = {};
        userData?.forEach((u: any) => {
          userMap[u.id] = u.email || u.full_name || u.id;
        });

        const formatted = data.map((item: any) => ({
          id: item.id,
          user_id: item.user_id,
          tryout_id: item.tryout_id,
          username_ig: item.username_ig || "-",
          username_tt: item.username_tt || "-",
          proof_url: item.proof_url || "",
          status: item.status,
          created_at: item.created_at,
          user_email: userMap[item.user_id] || item.user_id,
          tryout_title: item.tryouts?.title || item.tryout_id,
        }));
        setClaims(formatted);
      }
    } catch (err) {
      console.error("Gagal memuat klaim:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchClaims();
  }, [fetchClaims]);

  const handleAction = async (id: string, action: "approved" | "rejected") => {
    try {
      setProcessingId(id);
      
      const res = await updateFreeClaimAction(id, action);
      if (!res.success) {
        // Fallback to client client
        const supabase = createClient();
        const { error } = await supabase
          .from("free_access_requests")
          .update({ status: action, updated_at: new Date().toISOString() })
          .eq("id", id);

        if (error) throw new Error(res.error || error.message);
      }

      setClaims((prev) =>
        prev.map((c) => (c.id === id ? { ...c, status: action } : c))
      );
    } catch (err) {
      alert("Gagal memproses: " + (err as Error).message);
    } finally {
      setProcessingId(null);
    }
  };

  const filtered = filterStatus === "all"
    ? claims
    : claims.filter((c) => c.status === filterStatus);

  const counts = {
    all: claims.length,
    pending: claims.filter((c) => c.status === "pending").length,
    approved: claims.filter((c) => c.status === "approved").length,
    rejected: claims.filter((c) => c.status === "rejected").length,
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Klaim Try Out Gratis</h1>
          <p className="text-xs text-slate-500 mt-1">
            Pengajuan akses gratis bersyarat — siswa wajib follow IG & TikTok UpdatePTN
          </p>
        </div>
        <Button
          onClick={fetchClaims}
          variant="outline"
          className="rounded-xl text-xs font-bold gap-2 border-slate-200 h-9"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Refresh
        </Button>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {(["pending", "approved", "rejected", "all"] as const).map((s) => (
          <button
            key={s}
            onClick={() => setFilterStatus(s)}
            className={`rounded-xl p-3.5 border text-left transition-all ${
              filterStatus === s
                ? s === "pending" ? "bg-amber-50 border-amber-300"
                  : s === "approved" ? "bg-emerald-50 border-emerald-300"
                  : s === "rejected" ? "bg-rose-50 border-rose-300"
                  : "bg-blue-50 border-blue-300"
                : "bg-white border-slate-200 hover:border-slate-300"
            }`}
          >
            <p className={`text-2xl font-black ${
              filterStatus === s
                ? s === "pending" ? "text-amber-700"
                  : s === "approved" ? "text-emerald-700"
                  : s === "rejected" ? "text-rose-700"
                  : "text-blue-700"
                : "text-slate-800"
            }`}>{counts[s]}</p>
            <p className="text-[11px] font-bold text-slate-500 mt-0.5 capitalize">
              {s === "all" ? "Total Klaim" : s === "pending" ? "Menunggu" : s === "approved" ? "Disetujui" : "Ditolak"}
            </p>
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50/70 border-slate-200">
              <TableHead className="font-bold text-slate-700 text-xs">Siswa</TableHead>
              <TableHead className="font-bold text-slate-700 text-xs">Try Out</TableHead>
              <TableHead className="font-bold text-slate-700 text-xs">Akun Sosmed</TableHead>
              <TableHead className="font-bold text-slate-700 text-xs">Bukti</TableHead>
              <TableHead className="font-bold text-slate-700 text-xs">Waktu</TableHead>
              <TableHead className="font-bold text-slate-700 text-xs">Status</TableHead>
              <TableHead className="font-bold text-slate-700 text-xs text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-12 text-xs text-slate-400">
                  Memuat data klaim...
                </TableCell>
              </TableRow>
            ) : filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-12">
                  <div className="flex flex-col items-center gap-2">
                    <CheckCircle2 className="h-8 w-8 text-slate-200" />
                    <p className="text-xs text-slate-400 font-medium">
                      Tidak ada pengajuan {filterStatus !== "all" ? `berstatus "${filterStatus}"` : ""}
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((claim) => (
                <TableRow key={claim.id} className="border-slate-100 hover:bg-slate-50/50 transition-colors">
                  {/* Siswa */}
                  <TableCell className="py-3">
                    <span className="text-xs font-bold text-slate-800 block truncate max-w-[160px]">
                      {claim.user_email}
                    </span>
                  </TableCell>

                  {/* Try Out */}
                  <TableCell>
                    <span className="text-xs font-semibold text-slate-700 block truncate max-w-[150px]">
                      {claim.tryout_title}
                    </span>
                  </TableCell>

                  {/* Sosmed */}
                  <TableCell>
                    <div className="space-y-0.5">
                      <p className="text-[11px] font-bold text-pink-600 flex items-center gap-1">
                        <AtSign className="h-3 w-3" />
                        {claim.username_ig}
                      </p>
                      <p className="text-[11px] font-bold text-slate-600">
                        🎵 {claim.username_tt}
                      </p>
                    </div>
                  </TableCell>

                  {/* Bukti Screenshot */}
                  <TableCell>
                    {claim.proof_url ? (
                      <button
                        onClick={() => setPreviewUrl(claim.proof_url)}
                        className="flex items-center gap-1.5 text-[11px] font-bold text-blue-600 hover:text-blue-700 hover:underline"
                      >
                        <ImageIcon className="h-3.5 w-3.5" />
                        Lihat Bukti
                      </button>
                    ) : (
                      <span className="text-[11px] text-slate-400">Tidak ada</span>
                    )}
                  </TableCell>

                  {/* Waktu */}
                  <TableCell>
                    <span className="text-[11px] text-slate-500 font-medium">
                      {new Date(claim.created_at).toLocaleDateString("id-ID", {
                        day: "numeric", month: "short", year: "numeric",
                        hour: "2-digit", minute: "2-digit"
                      })}
                    </span>
                  </TableCell>

                  {/* Status */}
                  <TableCell>
                    {claim.status === "pending" ? (
                      <Badge className="bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-bold gap-1 px-2">
                        <Clock className="h-3 w-3" />
                        Menunggu
                      </Badge>
                    ) : claim.status === "approved" ? (
                      <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold gap-1 px-2">
                        <CheckCircle2 className="h-3 w-3" />
                        Disetujui
                      </Badge>
                    ) : (
                      <Badge className="bg-rose-50 text-rose-700 border border-rose-200 text-[10px] font-bold gap-1 px-2">
                        <XCircle className="h-3 w-3" />
                        Ditolak
                      </Badge>
                    )}
                  </TableCell>

                  {/* Aksi */}
                  <TableCell className="text-right">
                    {claim.status === "pending" ? (
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleAction(claim.id, "approved")}
                          disabled={processingId === claim.id}
                          className="h-8 px-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl gap-1.5"
                        >
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          ACC
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleAction(claim.id, "rejected")}
                          disabled={processingId === claim.id}
                          variant="outline"
                          className="h-8 px-3 text-rose-600 border-rose-200 hover:bg-rose-50 text-xs font-bold rounded-xl gap-1.5"
                        >
                          <XCircle className="h-3.5 w-3.5" />
                          TOLAK
                        </Button>
                      </div>
                    ) : (
                      <span className="text-[11px] text-slate-400 font-medium">Sudah diproses</span>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Preview Screenshot Dialog */}
      <Dialog open={!!previewUrl} onOpenChange={() => setPreviewUrl(null)}>
        <DialogContent className="max-w-lg bg-white rounded-2xl p-5">
          <DialogHeader>
            <DialogTitle className="text-sm font-black text-slate-900">Bukti Screenshot Follow</DialogTitle>
          </DialogHeader>
          {previewUrl && (
            <div className="rounded-xl overflow-hidden border border-slate-200 bg-slate-50">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={previewUrl}
                alt="Bukti follow IG & TikTok"
                className="w-full max-h-[400px] object-contain"
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
