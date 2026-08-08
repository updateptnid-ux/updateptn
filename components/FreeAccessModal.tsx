"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { AlertCircle, Share2, CheckCircle2, Loader2, Sparkles } from "lucide-react";

interface FreeAccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  tryoutId: string;
  tryoutTitle: string;
  userId: string;
  userName: string;
  userEmail: string;
  onSuccess: () => void;
}

export default function FreeAccessModal({
  isOpen,
  onClose,
  tryoutId,
  tryoutTitle,
  userId,
  userName,
  userEmail,
  onSuccess
}: FreeAccessModalProps) {
  const [usernameIg, setUsernameIg] = useState("");
  const [usernameTt, setUsernameTt] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (selectedFile.size > 2 * 1024 * 1024) {
        setError("Ukuran gambar maksimal 2MB!");
        setFile(null);
        return;
      }
      setError("");
      setFile(selectedFile);
    }
  };

  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (err) => reject(err);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!usernameIg || !usernameTt || !file) {
      setError("Semua field dan bukti screenshot wajib diisi!");
      return;
    }

    try {
      setLoading(true);
      setError("");
      const supabase = createClient();

      // Convert image file to base64 string (fail-safe storage replacement)
      const base64Image = await convertToBase64(file);

      // Save request to free_access_requests table
      const { error: dbError } = await supabase.from("free_access_requests").insert([
        {
          user_id: userId,
          tryout_id: tryoutId,
          username_ig: usernameIg,
          username_tt: usernameTt,
          proof_url: base64Image, // Menyimpan base64 screenshot secara langsung di text proof_url
          status: "pending"
        }
      ]);

      if (dbError) throw dbError;

      // Save locally as fallback/cache
      localStorage.setItem(`tryout_promo_${tryoutId}`, "pending");

      setSuccess(true);
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 2500);
    } catch (err: any) {
      setError("Gagal mengirim pengajuan: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md bg-white rounded-2xl p-6 font-sans">
        <DialogHeader>
          <DialogTitle className="text-lg font-black text-slate-900 flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-amber-500" />
            <span>Akses Gratis Bersyarat</span>
          </DialogTitle>
        </DialogHeader>

        {success ? (
          <div className="py-8 flex flex-col items-center justify-center text-center space-y-3">
            <CheckCircle2 className="h-16 w-16 text-emerald-500 animate-bounce" />
            <h4 className="font-extrabold text-slate-950">Pengajuan Berhasil Dikirim!</h4>
            <p className="text-xs text-slate-500 max-w-xs">
              Bukti follow IG & TikTok kamu sedang ditinjau admin. Akses Try Out akan terbuka dalam 1-12 jam.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 py-2">
            <div className="bg-blue-50/70 border border-blue-100 rounded-xl p-3.5 space-y-2">
              <h5 className="text-xs font-bold text-blue-900">Syarat Membuka Try Out Premium:</h5>
              <ol className="text-[11px] text-blue-700 space-y-1.5 list-decimal pl-4 font-medium">
                <li>Follow Instagram <a href="https://instagram.com/updateptn.id" target="_blank" className="font-bold underline">@updateptn.id</a></li>
                <li>Follow TikTok <a href="https://tiktok.com/@updateptn.id" target="_blank" className="font-bold underline">@updateptn.id</a></li>
                <li>Screenshot bukti follow & upload di bawah.</li>
              </ol>
            </div>

            <div className="space-y-3">
              {/* Username IG */}
              <div className="space-y-1">
                <Label className="text-xs font-bold text-slate-600">Username Instagram Kamu *</Label>
                <Input
                  value={usernameIg}
                  onChange={(e) => setUsernameIg(e.target.value)}
                  placeholder="cth: @pejuangutbk"
                  className="rounded-xl h-10 text-xs font-medium"
                  required
                />
              </div>

              {/* Username TikTok */}
              <div className="space-y-1">
                <Label className="text-xs font-bold text-slate-600">Username TikTok Kamu *</Label>
                <Input
                  value={usernameTt}
                  onChange={(e) => setUsernameTt(e.target.value)}
                  placeholder="cth: @pejuangutbk_tiktok"
                  className="rounded-xl h-10 text-xs font-medium"
                  required
                />
              </div>

              {/* Screenshot Upload */}
              <div className="space-y-1">
                <Label className="text-xs font-bold text-slate-600">Upload Screenshot Bukti Follow *</Label>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="rounded-xl h-10 text-xs font-medium pt-2.5 cursor-pointer"
                  required
                />
                <p className="text-[10px] text-slate-400">Format PNG/JPG/JPEG, Maksimal 2MB</p>
              </div>
            </div>

            {error && (
              <div className="bg-rose-50 border border-rose-100 rounded-xl p-3 flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
                <span className="text-[11px] font-bold text-rose-700">{error}</span>
              </div>
            )}

            <DialogFooter className="gap-2 pt-2">
              <Button type="button" variant="outline" onClick={onClose} className="rounded-xl font-bold text-xs h-10">
                Batal
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs h-10 px-6 gap-1.5"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4.5 w-4.5 animate-spin" />
                    <span>Mengirim Bukti...</span>
                  </>
                ) : (
                  <span>Ajukan Akses Gratis</span>
                )}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
