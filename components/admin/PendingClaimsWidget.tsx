"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, AtSign, ImageIcon, ExternalLink, Gift } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Link from "next/link";

interface ClaimItem {
  id: string;
  user_id: string;
  tryout_id: string;
  username_ig: string;
  username_tt: string;
  proof_url: string;
  created_at: string;
  user_email?: string;
  tryout_title?: string;
}

interface Props {
  initialClaims: ClaimItem[];
}

export default function PendingClaimsWidget({ initialClaims }: Props) {
  const [claims, setClaims] = useState<ClaimItem[]>(initialClaims);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleAction = async (id: string, action: "approved" | "rejected") => {
    try {
      setProcessingId(id);
      const supabase = createClient();
      const { error } = await supabase
        .from("free_access_requests")
        .update({ status: action, updated_at: new Date().toISOString() })
        .eq("id", id);
      if (error) throw error;
      // Remove from pending list
      setClaims((prev) => prev.filter((c) => c.id !== id));
    } catch (err) {
      alert("Gagal: " + (err as Error).message);
    } finally {
      setProcessingId(null);
    }
  };

  if (claims.length === 0) {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <span className="h-7 w-7 rounded-lg bg-amber-50 border border-amber-100 flex items-center justify-center">
                <Gift className="h-4 w-4 text-amber-600" />
              </span>
              Klaim Try Out Gratis
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">Pengajuan akses gratis bersyarat</p>
          </div>
          <Link href="/hq-core-updateptn/free-claims">
            <Button variant="ghost" className="text-xs text-slate-500 h-8 px-3 rounded-xl hover:bg-slate-100">
              Lihat Semua
              <ExternalLink className="h-3 w-3 ml-1.5" />
            </Button>
          </Link>
        </div>
        <div className="flex flex-col items-center justify-center py-8 rounded-xl bg-slate-50 border border-dashed border-slate-200">
          <CheckCircle2 className="h-8 w-8 text-emerald-400 mb-2" />
          <p className="text-xs font-bold text-slate-500">Semua klaim sudah diproses 🎉</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Tidak ada pengajuan yang menunggu</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <span className="h-8 w-8 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center">
              <Gift className="h-4 w-4 text-amber-600" />
            </span>
            <div>
              <h3 className="text-sm font-extrabold text-slate-900 leading-none">
                Klaim Try Out Gratis
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Siswa follow IG & TikTok • butuh persetujuan
              </p>
            </div>
            <Badge className="bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-black ml-1 px-2 py-0.5">
              {claims.length} Pending
            </Badge>
          </div>
          <Link href="/hq-core-updateptn/free-claims">
            <Button variant="ghost" className="text-xs text-slate-500 h-8 px-3 rounded-xl hover:bg-slate-100">
              Lihat Semua
              <ExternalLink className="h-3 w-3 ml-1.5" />
            </Button>
          </Link>
        </div>

        {/* Claim rows */}
        <div className="divide-y divide-slate-100">
          {claims.slice(0, 5).map((claim) => (
            <div
              key={claim.id}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-3.5 hover:bg-slate-50/60 transition-colors"
            >
              {/* Left: user + tryout info */}
              <div className="min-w-0 flex-1 space-y-1">
                <p className="text-xs font-bold text-slate-800 truncate">
                  {claim.user_email || claim.user_id}
                </p>
                <p className="text-[11px] text-slate-500 truncate">
                  Minta akses:{" "}
                  <span className="font-semibold text-slate-700">{claim.tryout_title || claim.tryout_id}</span>
                </p>
                <div className="flex items-center gap-3 pt-0.5">
                  <span className="text-[11px] font-bold text-pink-600 flex items-center gap-1">
                    <AtSign className="h-3 w-3" />
                    {claim.username_ig || "-"}
                  </span>
                  <span className="text-[11px] font-bold text-slate-500">
                    🎵 {claim.username_tt || "-"}
                  </span>
                  {claim.proof_url && (
                    <button
                      onClick={() => setPreviewUrl(claim.proof_url)}
                      className="text-[11px] font-bold text-blue-600 hover:underline flex items-center gap-1"
                    >
                      <ImageIcon className="h-3 w-3" />
                      Bukti
                    </button>
                  )}
                </div>
              </div>

              {/* Right: action buttons */}
              <div className="flex items-center gap-2 shrink-0">
                <Button
                  size="sm"
                  onClick={() => handleAction(claim.id, "approved")}
                  disabled={processingId === claim.id}
                  className="h-8 px-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl gap-1.5 shadow-xs"
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
            </div>
          ))}

          {claims.length > 5 && (
            <div className="px-5 py-3 bg-slate-50/60">
              <Link href="/hq-core-updateptn/free-claims">
                <p className="text-xs text-blue-600 font-bold hover:underline text-center">
                  + {claims.length - 5} pengajuan lainnya →
                </p>
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Preview Screenshot */}
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
    </>
  );
}
