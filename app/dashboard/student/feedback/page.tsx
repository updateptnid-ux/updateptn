"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { submitFeedbackAction } from "@/actions/feedback";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { 
  MessageSquare, Star, AlertCircle, CheckCircle2, 
  TrendingUp, Target, DollarSign, Phone, Loader2,
  ThumbsUp, Zap, ArrowRight
} from "lucide-react";

export default function FeedbackPage() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  
  const [form, setForm] = useState({
    easeOfNavigation: 0,
    predictionAccuracy: 0,
    accuracyReason: "",
    hasTechnicalIssue: false,
    technicalIssueDetail: "",
    mostAttractiveFeature: "",
    nextAction: "",
    premiumInterest: 0,
    expectedPrice: "",
    willingToBeContacted: false,
    contactInfo: "",
  });

  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validation
    if (form.easeOfNavigation === 0) {
      setError("Tolong rating kemudahan navigasi");
      return;
    }
    if (form.predictionAccuracy === 0) {
      setError("Tolong rating akurasi prediksi");
      return;
    }
    if (!form.mostAttractiveFeature.trim()) {
      setError("Tolong isi fitur paling menarik");
      return;
    }
    if (!form.nextAction) {
      setError("Tolong pilih tindakan selanjutnya");
      return;
    }
    if (form.premiumInterest === 0) {
      setError("Tolong rating ketertarikan premium");
      return;
    }
    if (!form.expectedPrice) {
      setError("Tolong pilih ekspektasi harga");
      return;
    }
    if (form.hasTechnicalIssue && !form.technicalIssueDetail.trim()) {
      setError("Tolong jelaskan kendala teknis yang kamu alami");
      return;
    }
    if (form.willingToBeContacted && !form.contactInfo.trim()) {
      setError("Tolong isi info kontak (WhatsApp/Email)");
      return;
    }

    startTransition(async () => {
      const result = await submitFeedbackAction(form);
      if (result.success) {
        setSubmitted(true);
      } else {
        setError(result.error || "Gagal mengirim feedback");
      }
    });
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <Card className="max-w-lg w-full p-6 md:p-8 text-center space-y-4">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-100 mb-2">
            <CheckCircle2 className="h-8 w-8 text-emerald-600" />
          </div>
          <h2 className="text-xl md:text-2xl font-bold text-slate-900">
            Terima Kasih! 🎉
          </h2>
          <p className="text-sm text-slate-600">
            Feedbackmu sangat berharga untuk membantu kami membangun platform persiapan PTN yang lebih baik.
          </p>
          <div className="bg-blue-50 rounded-xl p-4 text-sm text-blue-700">
            <p className="font-bold mb-1">🎁 Apresiasi Spesial</p>
            <p className="text-xs">10 pengisi survei terpilih akan mendapatkan akses gratis ke Try Out Premium selama 1 bulan saat rilis nanti!</p>
          </div>
          <Button
            onClick={() => router.push("/dashboard/student")}
            className="mt-4 w-full h-12 bg-blue-600 hover:bg-blue-700 rounded-xl"
          >
            Kembali ke Dashboard
          </Button>
        </Card>
      </div>
    );
  }

  const StarRating = ({ value, onChange, label }: { value: number; onChange: (val: number) => void; label: string }) => (
    <div className="space-y-2">
      <Label className="text-sm font-bold text-slate-700">{label}</Label>
      <div className="flex items-center gap-2">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            className="transition-transform hover:scale-110 active:scale-95"
          >
            <Star
              className={`h-8 w-8 md:h-10 md:w-10 ${
                star <= value
                  ? "fill-amber-400 text-amber-400"
                  : "fill-slate-200 text-slate-300"
              }`}
            />
          </button>
        ))}
        <span className="ml-2 text-sm font-bold text-slate-700">
          {value === 0 ? "Pilih rating" : value === 1 ? "Sangat Buruk" : value === 2 ? "Kurang" : value === 3 ? "Cukup" : value === 4 ? "Baik" : "Sangat Baik"}
        </span>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-6">
      <div className="max-w-3xl mx-auto space-y-4">
        {/* Header */}
        <Card className="bg-gradient-to-br from-blue-600 to-indigo-600 text-white p-6 md:p-8 rounded-2xl shadow-lg">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-12 h-12 md:w-16 md:h-16 bg-white/20 rounded-2xl flex items-center justify-center">
              <MessageSquare className="h-6 w-6 md:h-8 md:w-8 text-white" />
            </div>
            <div className="flex-1">
              <h1 className="text-xl md:text-2xl font-extrabold mb-2">
                Bantu Kami Lebih Baik! 🚀
              </h1>
              <p className="text-sm md:text-base text-blue-50">
                Terima kasih telah mencoba fitur Cek Skor kami! Sebagai pengguna awal, pendapatmu sangat berharga. Survei ini hanya memakan waktu <strong>2 menit</strong>.
              </p>
            </div>
          </div>
        </Card>

        {error && (
          <Card className="bg-rose-50 border-2 border-rose-200 p-4 rounded-xl">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
              <p className="text-sm font-medium text-rose-700">{error}</p>
            </div>
          </Card>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Bagian 1: Pengalaman Pengguna */}
          <Card className="p-4 md:p-6 rounded-2xl space-y-4">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-200">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                <ThumbsUp className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h2 className="text-base md:text-lg font-bold text-slate-900">
                  Bagian 1: Pengalaman Pengguna
                </h2>
                <p className="text-xs text-slate-500">UX & Akurasi Platform</p>
              </div>
            </div>

            <StarRating
              value={form.easeOfNavigation}
              onChange={(val) => setForm({ ...form, easeOfNavigation: val })}
              label="1. Seberapa mudah navigasi saat menggunakan fitur Cek Skor? *"
            />

            <StarRating
              value={form.predictionAccuracy}
              onChange={(val) => setForm({ ...form, predictionAccuracy: val })}
              label="2. Apakah hasil prediksi skor terasa relevan dan akurat untukmu? *"
            />

            <div className="space-y-2">
              <Label className="text-sm font-bold text-slate-700">
                Boleh ceritakan kenapa kamu merasa demikian? (Opsional)
              </Label>
              <textarea
                value={form.accuracyReason}
                onChange={(e) => setForm({ ...form, accuracyReason: e.target.value })}
                placeholder="Misal: Prediksi terlalu optimis, data jurusan kurang update, dll."
                rows={3}
                className="w-full px-4 py-3 text-sm rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none resize-none"
              />
            </div>

            <div className="space-y-3">
              <Label className="text-sm font-bold text-slate-700">
                3. Apakah ada kendala teknis yang kamu alami? *
              </Label>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setForm({ ...form, hasTechnicalIssue: false, technicalIssueDetail: "" })}
                  className={`flex-1 h-12 px-4 rounded-xl border-2 font-bold text-sm transition-all ${
                    !form.hasTechnicalIssue
                      ? "bg-emerald-50 border-emerald-500 text-emerald-700"
                      : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"
                  }`}
                >
                  Tidak Ada
                </button>
                <button
                  type="button"
                  onClick={() => setForm({ ...form, hasTechnicalIssue: true })}
                  className={`flex-1 h-12 px-4 rounded-xl border-2 font-bold text-sm transition-all ${
                    form.hasTechnicalIssue
                      ? "bg-rose-50 border-rose-500 text-rose-700"
                      : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"
                  }`}
                >
                  Ada Kendala
                </button>
              </div>

              {form.hasTechnicalIssue && (
                <div className="animate-in slide-in-from-top-2 duration-300">
                  <textarea
                    value={form.technicalIssueDetail}
                    onChange={(e) => setForm({ ...form, technicalIssueDetail: e.target.value })}
                    placeholder="Jelaskan kendala teknisnya (misal: loading lama, error login, dll)"
                    rows={2}
                    className="w-full px-4 py-3 text-sm rounded-xl border-2 border-rose-200 bg-rose-50 focus:border-rose-500 focus:ring-2 focus:ring-rose-100 outline-none resize-none"
                  />
                </div>
              )}
            </div>
          </Card>

          {/* Bagian 2: Nilai Produk */}
          <Card className="p-4 md:p-6 rounded-2xl space-y-4">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-200">
              <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
                <Zap className="h-5 w-5 text-indigo-600" />
              </div>
              <div>
                <h2 className="text-base md:text-lg font-bold text-slate-900">
                  Bagian 2: Nilai Produk
                </h2>
                <p className="text-xs text-slate-500">Value Proposition</p>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-bold text-slate-700">
                4. Apa yang paling menarik dari fitur Cek Skor dibanding layanan serupa? *
              </Label>
              <textarea
                value={form.mostAttractiveFeature}
                onChange={(e) => setForm({ ...form, mostAttractiveFeature: e.target.value })}
                placeholder="Misal: Lebih akurat, tampilan lebih simpel, gratis, dll."
                rows={3}
                className="w-full px-4 py-3 text-sm rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none resize-none"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-bold text-slate-700">
                5. Setelah lihat hasil skor, apa yang paling ingin kamu lakukan selanjutnya? *
              </Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {[
                  { id: "improve_scores", label: "Memperbaiki nilai mapel tertentu", icon: TrendingUp },
                  { id: "search_majors", label: "Cari info jurusan/kampus lain", icon: Target },
                  { id: "practice_tests", label: "Kerjakan soal latihan/Try Out", icon: CheckCircle2 },
                  { id: "no_action", label: "Tidak ada tindakan", icon: AlertCircle },
                ].map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => setForm({ ...form, nextAction: option.id })}
                    className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all text-left ${
                      form.nextAction === option.id
                        ? "bg-blue-50 border-blue-500"
                        : "bg-white border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <option.icon className={`h-5 w-5 shrink-0 ${
                      form.nextAction === option.id ? "text-blue-600" : "text-slate-400"
                    }`} />
                    <span className={`text-sm font-medium ${
                      form.nextAction === option.id ? "text-blue-700" : "text-slate-700"
                    }`}>
                      {option.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </Card>

          {/* Bagian 3: Niat Membeli */}
          <Card className="p-4 md:p-6 rounded-2xl space-y-4">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-200">
              <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <h2 className="text-base md:text-lg font-bold text-slate-900">
                  Bagian 3: Niat Membeli
                </h2>
                <p className="text-xs text-slate-500">Purchase Intent & Pricing</p>
              </div>
            </div>

            <StarRating
              value={form.premiumInterest}
              onChange={(val) => setForm({ ...form, premiumInterest: val })}
              label="6. Seberapa tertarik kamu untuk akses 'Analisis Jurusan Mendalam' atau 'Try Out Premium'? *"
            />

            <div className="space-y-2">
              <Label className="text-sm font-bold text-slate-700">
                7. Berapa harga yang menurutmu wajar untuk layanan Cek Skor dengan analisis mendalam? *
              </Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {[
                  { id: "0-50k", label: "Rp 0 - 50k", color: "emerald" },
                  { id: "50k-100k", label: "Rp 50k - 100k", color: "blue" },
                  { id: "100k-200k", label: "Rp 100k - 200k", color: "indigo" },
                  { id: "200k-500k", label: "Rp 200k - 500k", color: "purple" },
                  { id: "500k+", label: "Rp 500k+", color: "rose" },
                ].map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => setForm({ ...form, expectedPrice: option.id })}
                    className={`h-12 px-4 rounded-xl border-2 font-bold text-sm transition-all ${
                      form.expectedPrice === option.id
                        ? `bg-${option.color}-50 border-${option.color}-500 text-${option.color}-700`
                        : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          </Card>

          {/* Bagian 4: Penutup */}
          <Card className="p-4 md:p-6 rounded-2xl space-y-4">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-200">
              <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
                <Phone className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <h2 className="text-base md:text-lg font-bold text-slate-900">
                  Bagian 4: Penutup
                </h2>
                <p className="text-xs text-slate-500">Follow-up Research</p>
              </div>
            </div>

            <div className="space-y-3">
              <Label className="text-sm font-bold text-slate-700">
                8. Apakah kamu bersedia kami hubungi kembali untuk riset produk lebih lanjut?
              </Label>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setForm({ ...form, willingToBeContacted: true })}
                  className={`flex-1 h-12 px-4 rounded-xl border-2 font-bold text-sm transition-all ${
                    form.willingToBeContacted
                      ? "bg-emerald-50 border-emerald-500 text-emerald-700"
                      : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"
                  }`}
                >
                  Ya, Boleh
                </button>
                <button
                  type="button"
                  onClick={() => setForm({ ...form, willingToBeContacted: false, contactInfo: "" })}
                  className={`flex-1 h-12 px-4 rounded-xl border-2 font-bold text-sm transition-all ${
                    !form.willingToBeContacted
                      ? "bg-slate-50 border-slate-300 text-slate-700"
                      : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"
                  }`}
                >
                  Tidak, Terima Kasih
                </button>
              </div>

              {form.willingToBeContacted && (
                <div className="animate-in slide-in-from-top-2 duration-300">
                  <Input
                    type="text"
                    value={form.contactInfo}
                    onChange={(e) => setForm({ ...form, contactInfo: e.target.value })}
                    placeholder="Nomor WhatsApp atau Email"
                    style={{ fontSize: "16px" }}
                    className="h-12 rounded-xl border-2 border-emerald-200 bg-emerald-50 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                  />
                </div>
              )}
            </div>
          </Card>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={pending}
            className="w-full h-14 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-base shadow-lg hover:shadow-xl transition-all"
          >
            {pending ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin mr-2" />
                Mengirim Feedback...
              </>
            ) : (
              <>
                Kirim Feedback
                <ArrowRight className="h-5 w-5 ml-2" />
              </>
            )}
          </Button>

          <p className="text-xs text-center text-slate-500">
            Dengan mengisi survei ini, kamu berpeluang mendapat akses gratis Try Out Premium! 🎁
          </p>
        </form>
      </div>
    </div>
  );
}
