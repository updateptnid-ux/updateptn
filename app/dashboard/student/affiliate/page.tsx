"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { 
  applyForAffiliateAction, 
  getAffiliateDashboardAction,
  updateAffiliateBankInfoAction,
  createWithdrawalRequestAction 
} from "@/actions/affiliate";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Users,
  Loader2,
  AlertCircle,
  ArrowLeft,
  CheckCircle,
  Globe,
  Copy,
  Wallet,
  TrendingUp,
  Clock,
  ArrowUpRight,
} from "lucide-react";

type AffiliateStatus = "notApplied" | "pending" | "active" | "rejected";

export default function AffiliatePage() {
  const router = useRouter();
  const [status, setStatus] = useState<AffiliateStatus | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Application form state
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    socialMedia: "",
    socialMediaUsername: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Dashboard state
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [showBankForm, setShowBankForm] = useState(false);
  const [showWithdrawal, setShowWithdrawal] = useState(false);
  const [bankInfo, setBankInfo] = useState({
    bankName: "",
    bankAccountNumber: "",
    bankAccountName: "",
  });
  const [withdrawalAmount, setWithdrawalAmount] = useState("");

  // Check affiliate status on mount
  useEffect(() => {
    async function checkStatus() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.push("/auth/login");
        return;
      }

      // Auto-fill email
      setForm(prev => ({ ...prev, email: user.email || "" }));

      // Get profile for name
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', user.id)
        .single();

      if (profile?.full_name) {
        setForm(prev => ({ ...prev, fullName: profile.full_name || "" }));
      }

      // Check affiliate status
      const { data: affiliate } = await supabase
        .from("affiliates")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (!affiliate) {
        setStatus("notApplied");
        setLoading(false);
      } else if (affiliate.status === "pending") {
        setStatus("pending");
        setLoading(false);
      } else if (affiliate.status === "active") {
        // REDIRECT TO DASHBOARD IF ALREADY ACTIVE
        router.push("/dashboard/affiliate");
        return;
      } else if (affiliate.status === "rejected") {
        setStatus("rejected");
        setLoading(false);
      }
    }

    checkStatus();
  }, [router]);

  // Handle application submission
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    const result = await applyForAffiliateAction(form);

    if (result.success) {
      setSuccess(true);
      setStatus("pending");
    } else {
      setError(result.message || "Gagal mendaftar");
    }
    setSubmitting(false);
  }

  // Handle bank info update
  async function handleBankUpdate(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);

    const result = await updateAffiliateBankInfoAction(bankInfo);
    
    if (result.success) {
      alert("Info bank berhasil diperbarui!");
      setShowBankForm(false);
    } else {
      alert(result.message || "Gagal memperbarui info bank");
    }
    setSubmitting(false);
  }

  // Handle withdrawal request
  async function handleWithdrawal(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);

    const amount = parseInt(withdrawalAmount);
    const result = await createWithdrawalRequestAction(amount);

    if (result.success) {
      alert(result.message);
      setShowWithdrawal(false);
      setWithdrawalAmount("");
      // Reload dashboard
      const updated = await getAffiliateDashboardAction();
      if (updated.success) setDashboardData(updated);
    } else {
      alert(result.message || "Gagal membuat permintaan penarikan");
    }
    setSubmitting(false);
  }

  // Copy promo code
  function copyPromoCode(code: string) {
    navigator.clipboard.writeText(code);
    alert("Kode promo berhasil disalin!");
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0
    }).format(price);
  };

  // ===========================================
  // LOADING STATE
  // ===========================================
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  // ===========================================
  // ACTIVE AFFILIATE DASHBOARD (SIMPLIFIED - PROMO CODE MODEL)
  // ===========================================
  if (status === "active" && dashboardData) {
    const { affiliate, stats, commissions, withdrawals } = dashboardData;

    return (
      <div className="min-h-screen bg-slate-50 p-3 md:p-6">
        <div className="max-w-5xl mx-auto space-y-3 md:space-y-4">
          {/* Header */}
          <div className="flex items-center gap-2 md:gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.back()}
              className="h-8 md:h-10 rounded-lg"
            >
              <ArrowLeft className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
              <span className="text-xs md:text-sm">Kembali</span>
            </Button>
          </div>

          {/* Welcome Card with Promo Code */}
          <Card className="p-4 md:p-6 bg-gradient-to-br from-blue-600 to-blue-800 text-white rounded-lg md:rounded-xl">
            <div className="space-y-3 md:space-y-4">
              <div>
                <p className="text-xs md:text-sm text-blue-100">Selamat datang kembali,</p>
                <h1 className="text-lg md:text-2xl font-bold">{affiliate.full_name}</h1>
              </div>

              {/* Promo Code Display */}
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 md:p-4 space-y-2">
                <p className="text-[10px] md:text-xs text-blue-100 font-medium">Kode Promo Anda</p>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-white/20 rounded-lg p-2 md:p-3">
                    <p className="text-xl md:text-3xl font-bold tracking-wider text-center">
                      {affiliate.affiliate_code}
                    </p>
                  </div>
                  <Button
                    onClick={() => copyPromoCode(affiliate.affiliate_code)}
                    className="h-10 md:h-12 px-3 md:px-4 bg-white/20 hover:bg-white/30 border-none rounded-lg"
                  >
                    <Copy className="h-4 w-4 md:h-5 md:w-5" />
                  </Button>
                </div>
                <p className="text-[9px] md:text-xs text-blue-100">
                  💡 Bagikan kode ini kepada customer saat mereka membeli paket untuk mendapatkan diskon 10%!
                </p>
              </div>
            </div>
          </Card>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* Total Commission */}
            <Card className="p-3 md:p-4 rounded-lg space-y-1 md:space-y-2">
              <div className="flex items-center gap-2 text-slate-600">
                <Wallet className="h-4 w-4 md:h-5 md:w-5" />
                <p className="text-[10px] md:text-xs font-medium">Total Komisi</p>
              </div>
              <p className="text-lg md:text-2xl font-bold text-slate-900">
                {formatPrice(Number(affiliate.pending_balance || 0))}
              </p>
              <p className="text-[9px] md:text-xs text-slate-500">Saldo tersedia</p>
            </Card>

            {/* Total Purchases with Code */}
            <Card className="p-3 md:p-4 rounded-lg space-y-1 md:space-y-2">
              <div className="flex items-center gap-2 text-slate-600">
                <TrendingUp className="h-4 w-4 md:h-5 md:w-5" />
                <p className="text-[10px] md:text-xs font-medium">Total Pembelian</p>
              </div>
              <p className="text-lg md:text-2xl font-bold text-slate-900">
                {stats.approvedCommissions}
              </p>
              <p className="text-[9px] md:text-xs text-slate-500">Menggunakan kode Anda</p>
            </Card>

            {/* Pending Commissions */}
            <Card className="p-3 md:p-4 rounded-lg space-y-1 md:space-y-2">
              <div className="flex items-center gap-2 text-slate-600">
                <Clock className="h-4 w-4 md:h-5 md:w-5" />
                <p className="text-[10px] md:text-xs font-medium">Pending</p>
              </div>
              <p className="text-lg md:text-2xl font-bold text-amber-600">
                {stats.pendingCommissions}
              </p>
              <p className="text-[9px] md:text-xs text-slate-500">Menunggu persetujuan</p>
            </Card>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Button
              onClick={() => setShowWithdrawal(true)}
              disabled={Number(affiliate.pending_balance) < 100000}
              className="h-11 md:h-12 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg disabled:opacity-50"
            >
              <ArrowUpRight className="h-4 w-4 mr-2" />
              Tarik Saldo (Min. Rp 100k)
            </Button>

            <Button
              onClick={() => setShowBankForm(true)}
              variant="outline"
              className="h-11 md:h-12 font-bold rounded-lg"
            >
              {bankInfo.bankName ? "Ubah" : "Tambah"} Info Bank
            </Button>
          </div>

          {/* Bank Info Display */}
          {bankInfo.bankName && (
            <Card className="p-3 md:p-4 bg-slate-50 rounded-lg">
              <p className="text-[10px] md:text-xs font-bold text-slate-700 mb-2">Info Bank Terdaftar</p>
              <div className="space-y-1">
                <p className="text-xs md:text-sm text-slate-900">
                  <span className="font-bold">{bankInfo.bankName}</span> - {bankInfo.bankAccountNumber}
                </p>
                <p className="text-xs md:text-sm text-slate-600">{bankInfo.bankAccountName}</p>
              </div>
            </Card>
          )}

          {/* Recent Commissions */}
          {commissions && commissions.length > 0 && (
            <Card className="p-3 md:p-4 rounded-lg space-y-3">
              <h3 className="text-sm md:text-base font-bold text-slate-900">Riwayat Komisi</h3>
              <div className="space-y-2">
                {commissions.slice(0, 5).map((commission: any) => (
                  <div key={commission.id} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
                    <div className="flex-1">
                      <p className="text-xs md:text-sm font-medium text-slate-900">
                        Pembelian Paket
                      </p>
                      <p className="text-[9px] md:text-xs text-slate-500">
                        {new Date(commission.created_at).toLocaleDateString("id-ID")}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs md:text-sm font-bold text-emerald-600">
                        +{formatPrice(Number(commission.commission_amount))}
                      </p>
                      <p className={`text-[9px] md:text-xs ${
                        commission.status === 'approved' ? 'text-emerald-600' : 
                        commission.status === 'pending' ? 'text-amber-600' : 'text-slate-500'
                      }`}>
                        {commission.status === 'approved' ? '✓ Disetujui' : 
                         commission.status === 'pending' ? '⏳ Pending' : commission.status}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Recent Withdrawals */}
          {withdrawals && withdrawals.length > 0 && (
            <Card className="p-3 md:p-4 rounded-lg space-y-3">
              <h3 className="text-sm md:text-base font-bold text-slate-900">Riwayat Penarikan</h3>
              <div className="space-y-2">
                {withdrawals.map((withdrawal: any) => (
                  <div key={withdrawal.id} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
                    <div className="flex-1">
                      <p className="text-xs md:text-sm font-medium text-slate-900">
                        {withdrawal.bank_name} - {withdrawal.bank_account_number}
                      </p>
                      <p className="text-[9px] md:text-xs text-slate-500">
                        {new Date(withdrawal.created_at).toLocaleDateString("id-ID")}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs md:text-sm font-bold text-slate-900">
                        {formatPrice(Number(withdrawal.amount))}
                      </p>
                      <p className={`text-[9px] md:text-xs ${
                        withdrawal.status === 'completed' ? 'text-emerald-600' : 
                        withdrawal.status === 'pending' ? 'text-amber-600' : 
                        withdrawal.status === 'rejected' ? 'text-rose-600' : 'text-slate-500'
                      }`}>
                        {withdrawal.status === 'completed' ? '✓ Selesai' : 
                         withdrawal.status === 'pending' ? '⏳ Diproses' : 
                         withdrawal.status === 'rejected' ? '✕ Ditolak' : withdrawal.status}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Withdrawal Modal */}
          {showWithdrawal && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
              <Card className="w-full max-w-md p-4 md:p-6 space-y-4">
                <h3 className="text-base md:text-lg font-bold">Tarik Saldo</h3>
                <form onSubmit={handleWithdrawal} className="space-y-3">
                  <div className="space-y-2">
                    <Label className="text-xs md:text-sm">Jumlah Penarikan</Label>
                    <Input
                      type="number"
                      value={withdrawalAmount}
                      onChange={(e) => setWithdrawalAmount(e.target.value)}
                      placeholder="Minimal Rp 100.000"
                      min="100000"
                      required
                      className="h-10 md:h-11 text-sm"
                      style={{ fontSize: "16px" }}
                    />
                    <p className="text-[9px] md:text-xs text-slate-500">
                      Saldo tersedia: {formatPrice(Number(affiliate.pending_balance))}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowWithdrawal(false)}
                      className="flex-1 h-10 md:h-11"
                    >
                      Batal
                    </Button>
                    <Button
                      type="submit"
                      disabled={submitting}
                      className="flex-1 h-10 md:h-11 bg-emerald-600 hover:bg-emerald-700"
                    >
                      {submitting ? "Memproses..." : "Tarik"}
                    </Button>
                  </div>
                </form>
              </Card>
            </div>
          )}

          {/* Bank Form Modal */}
          {showBankForm && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
              <Card className="w-full max-w-md p-4 md:p-6 space-y-4">
                <h3 className="text-base md:text-lg font-bold">Info Bank</h3>
                <form onSubmit={handleBankUpdate} className="space-y-3">
                  <div className="space-y-2">
                    <Label className="text-xs md:text-sm">Nama Bank</Label>
                    <Input
                      value={bankInfo.bankName}
                      onChange={(e) => setBankInfo({ ...bankInfo, bankName: e.target.value })}
                      placeholder="BCA, Mandiri, BNI, dll"
                      required
                      className="h-10 md:h-11"
                      style={{ fontSize: "16px" }}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs md:text-sm">Nomor Rekening</Label>
                    <Input
                      value={bankInfo.bankAccountNumber}
                      onChange={(e) => setBankInfo({ ...bankInfo, bankAccountNumber: e.target.value })}
                      placeholder="1234567890"
                      required
                      className="h-10 md:h-11"
                      style={{ fontSize: "16px" }}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs md:text-sm">Nama Pemilik Rekening</Label>
                    <Input
                      value={bankInfo.bankAccountName}
                      onChange={(e) => setBankInfo({ ...bankInfo, bankAccountName: e.target.value })}
                      placeholder="Sesuai rekening bank"
                      required
                      className="h-10 md:h-11"
                      style={{ fontSize: "16px" }}
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowBankForm(false)}
                      className="flex-1 h-10 md:h-11"
                    >
                      Batal
                    </Button>
                    <Button
                      type="submit"
                      disabled={submitting}
                      className="flex-1 h-10 md:h-11 bg-blue-600 hover:bg-blue-700"
                    >
                      {submitting ? "Menyimpan..." : "Simpan"}
                    </Button>
                  </div>
                </form>
              </Card>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ===========================================
  // PENDING STATUS
  // ===========================================
  if (status === "pending") {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full p-6 md:p-8 text-center space-y-4">
          <div className="inline-flex items-center justify-center w-14 h-14 md:w-16 md:h-16 rounded-full bg-amber-100 mb-2">
            <Clock className="h-7 w-7 md:h-8 md:w-8 text-amber-600" />
          </div>
          <h2 className="text-lg md:text-xl font-bold text-slate-900">Aplikasi Sedang Ditinjau</h2>
          <p className="text-xs md:text-sm text-slate-600">
            Tim kami sedang meninjau aplikasi Anda. Proses ini biasanya memakan waktu 1-2 hari kerja.
          </p>
          <Button
            onClick={() => router.push("/dashboard/student")}
            variant="outline"
            className="mt-4 w-full h-10 md:h-11"
          >
            Kembali ke Dashboard
          </Button>
        </Card>
      </div>
    );
  }

  // ===========================================
  // REJECTED STATUS
  // ===========================================
  if (status === "rejected") {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full p-6 md:p-8 text-center space-y-4">
          <div className="inline-flex items-center justify-center w-14 h-14 md:w-16 md:h-16 rounded-full bg-rose-100 mb-2">
            <AlertCircle className="h-7 w-7 md:h-8 md:w-8 text-rose-600" />
          </div>
          <h2 className="text-lg md:text-xl font-bold text-slate-900">Aplikasi Ditolak</h2>
          <p className="text-xs md:text-sm text-slate-600">
            Mohon maaf, aplikasi Anda tidak dapat disetujui saat ini. Silakan hubungi admin untuk informasi lebih lanjut.
          </p>
          <Button
            onClick={() => router.push("/dashboard/student")}
            variant="outline"
            className="mt-4 w-full h-10 md:h-11"
          >
            Kembali ke Dashboard
          </Button>
        </Card>
      </div>
    );
  }

  // ===========================================
  // APPLICATION FORM (NOT APPLIED YET)
  // ===========================================
  const socialPlatforms = [
    { 
      id: "instagram", 
      name: "Instagram", 
      icon: "/social-icons/instagram.png",
      placeholder: "https://instagram.com/username"
    },
    { 
      id: "tiktok", 
      name: "TikTok", 
      icon: "/social-icons/tik-tok.png",
      placeholder: "https://tiktok.com/@username"
    },
    { 
      id: "twitter", 
      name: "Twitter / X", 
      iconComponent: <Globe className="h-4 w-4 text-blue-400" />,
      placeholder: "https://twitter.com/username"
    },
    { 
      id: "linkedin", 
      name: "LinkedIn", 
      icon: "/social-icons/linkedin.png",
      placeholder: "https://linkedin.com/in/username"
    },
    { 
      id: "youtube", 
      name: "YouTube", 
      iconComponent: <Globe className="h-4 w-4 text-red-600" />,
      placeholder: "https://youtube.com/@username"
    },
    { 
      id: "facebook", 
      name: "Facebook", 
      icon: "/social-icons/communication.png",
      placeholder: "https://facebook.com/username"
    },
    { 
      id: "other", 
      name: "Lainnya", 
      iconComponent: <Globe className="h-4 w-4 text-slate-600" />,
      placeholder: "https://..."
    },
  ];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    const result = await applyForAffiliateAction(form);

    if (result.success) {
      setSuccess(true);
    } else {
      setError(result.message || "Gagal mendaftar");
    }
    setSubmitting(false);
  }

  if (success) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full p-6 md:p-8 text-center space-y-4">
          <div className="inline-flex items-center justify-center w-14 h-14 md:w-16 md:h-16 rounded-full bg-emerald-100 mb-2">
            <CheckCircle className="h-7 w-7 md:h-8 md:w-8 text-emerald-600" />
          </div>
          <h2 className="text-lg md:text-xl font-bold text-slate-900">Aplikasi Terkirim!</h2>
          <p className="text-xs md:text-sm text-slate-600">
            Terima kasih sudah mendaftar sebagai mitra afiliasi. Tim kami akan meninjau aplikasi Anda dalam 1-2 hari kerja.
          </p>
          <p className="text-[10px] md:text-xs text-slate-500">
            Kami akan mengirim email konfirmasi setelah aplikasi Anda disetujui.
          </p>
          <Button
            onClick={() => router.push("/dashboard/student")}
            className="mt-4 w-full h-10 md:h-11"
          >
            Kembali ke Dashboard
          </Button>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-3 md:p-6">
      <div className="max-w-2xl mx-auto space-y-3 md:space-y-4">
        {/* Header */}
        <div className="flex items-center gap-2 md:gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.back()}
            className="h-8 md:h-10 rounded-lg"
          >
            <ArrowLeft className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
            <span className="text-xs md:text-sm">Kembali</span>
          </Button>
        </div>

        <Card className="p-4 md:p-8 space-y-4 md:space-y-6">
          <div className="text-center space-y-2 md:space-y-3">
            <div className="inline-flex items-center justify-center w-14 h-14 md:w-16 md:h-16 rounded-full bg-blue-100 mb-2">
              <Users className="h-7 w-7 md:h-8 md:w-8 text-blue-600" />
            </div>
            <h1 className="text-xl md:text-2xl font-bold text-slate-900">
              Gabung Program Afiliasi Update PTN
            </h1>
            <p className="text-xs md:text-sm text-slate-600 max-w-lg mx-auto">
              Dapatkan komisi <strong className="text-blue-600">10%</strong> dari setiap customer yang membeli paket menggunakan kode promo Anda!
            </p>
          </div>

          {/* Benefits */}
          <div className="bg-blue-50 rounded-lg md:rounded-xl p-3 md:p-4 space-y-2">
            <p className="text-[10px] md:text-xs font-bold text-blue-900 mb-2">✨ Keuntungan Menjadi Mitra:</p>
            <ul className="text-[10px] md:text-xs text-blue-700 space-y-1.5">
              <li className="flex items-start gap-2">
                <span className="text-blue-600 shrink-0">✓</span>
                <span>Komisi 10% dari pembelian paket yang menggunakan kode promo Anda</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 shrink-0">✓</span>
                <span>Customer dapat diskon 10%, Anda dapat komisi dari harga setelah diskon</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 shrink-0">✓</span>
                <span>Dashboard tracking real-time untuk monitor komisi</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 shrink-0">✓</span>
                <span>Kode promo unik yang mudah dibagikan</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 shrink-0">✓</span>
                <span>Penarikan dana mulai dari Rp 100.000</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 shrink-0">✓</span>
                <span>Gratis bergabung, tidak ada biaya pendaftaran</span>
              </li>
            </ul>
          </div>

          {error && (
            <div className="bg-rose-50 border border-rose-200 rounded-lg md:rounded-xl p-3 flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
              <p className="text-[10px] md:text-xs text-rose-700">{error}</p>
            </div>
          )}

          {/* Application Form */}
          <form onSubmit={handleSubmit} className="space-y-3 md:space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName" className="text-[10px] md:text-xs font-bold text-slate-700">
                Nama Lengkap *
              </Label>
              <Input
                id="fullName"
                type="text"
                required
                value={form.fullName}
                onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                placeholder="Nama lengkap Anda"
                className="h-10 md:h-11 text-xs md:text-sm"
                style={{ fontSize: "16px" }}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-[10px] md:text-xs font-bold text-slate-700 flex items-center gap-2">
                Email *
                <span className="text-[9px] md:text-[10px] font-normal text-slate-500">(dari akun Anda)</span>
              </Label>
              <Input
                id="email"
                type="email"
                required
                value={form.email}
                disabled
                readOnly
                placeholder="email@example.com"
                className="h-10 md:h-11 text-xs md:text-sm bg-slate-50 cursor-not-allowed"
                style={{ fontSize: "16px" }}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone" className="text-[10px] md:text-xs font-bold text-slate-700">
                Nomor WhatsApp *
              </Label>
              <Input
                id="phone"
                type="tel"
                required
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="08123456789"
                className="h-10 md:h-11 text-xs md:text-sm"
                style={{ fontSize: "16px" }}
              />
            </div>

            {/* Social Media Section */}
            <div className="space-y-3 pt-2 md:pt-3">
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg md:rounded-2xl p-3 md:p-4 border border-blue-100">
                <Label className="text-xs md:text-sm font-bold text-slate-800 mb-1 block">
                  Media Sosial Promosi
                </Label>
                <p className="text-[10px] md:text-xs text-slate-600">
                  Pilih platform utama untuk mempromosikan kode promo Anda
                </p>
              </div>

              {/* Elegant Platform Selection */}
              <div className="grid grid-cols-2 gap-2 md:gap-3">
                {socialPlatforms.map((platform) => {
                  const isSelected = form.socialMedia === platform.id;
                  return (
                    <button
                      key={platform.id}
                      type="button"
                      onClick={() => setForm({ ...form, socialMedia: platform.id, socialMediaUsername: "" })}
                      className={`
                        group relative overflow-hidden
                        p-3 md:p-4 rounded-lg md:rounded-2xl border-2 
                        transition-all duration-300 ease-out
                        ${isSelected 
                          ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-blue-100 shadow-lg shadow-blue-200/50 scale-[1.02]' 
                          : 'border-slate-200 bg-white hover:border-blue-300 hover:shadow-md hover:scale-[1.01]'
                        }
                      `}
                    >
                      {/* Gradient Overlay on Hover */}
                      <div className={`
                        absolute inset-0 bg-gradient-to-br from-blue-500/5 to-indigo-500/5 
                        opacity-0 group-hover:opacity-100 transition-opacity duration-300
                        ${isSelected ? 'opacity-100' : ''}
                      `} />
                      
                      <div className="relative flex items-center gap-2 md:gap-3">
                        {/* Icon */}
                        <div className={`
                          flex-shrink-0 w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl flex items-center justify-center
                          transition-all duration-300
                          ${isSelected 
                            ? 'bg-blue-500 shadow-md' 
                            : 'bg-slate-100 group-hover:bg-slate-200'
                          }
                        `}>
                          {platform.icon ? (
                            <Image 
                              src={platform.icon} 
                              alt={platform.name} 
                              width={16} 
                              height={16} 
                              className="object-contain md:w-5 md:h-5"
                            />
                          ) : (
                            <div className={isSelected ? 'text-white' : ''}>
                              {platform.iconComponent}
                            </div>
                          )}
                        </div>
                        
                        {/* Name */}
                        <div className="flex-1 text-left">
                          <span className={`
                            text-xs md:text-sm font-bold transition-colors
                            ${isSelected ? 'text-blue-700' : 'text-slate-700 group-hover:text-blue-600'}
                          `}>
                            {platform.name}
                          </span>
                        </div>

                        {/* Checkmark */}
                        {isSelected && (
                          <div className="flex-shrink-0">
                            <div className="w-5 h-5 md:w-6 md:h-6 bg-blue-500 rounded-full flex items-center justify-center animate-in zoom-in duration-200">
                              <svg className="w-3 h-3 md:w-4 md:h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                              </svg>
                            </div>
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Username Input with Elegant Design */}
              {form.socialMedia && (
                <div className="space-y-2 animate-in slide-in-from-top-2 duration-300">
                  <Label htmlFor="socialMediaUsername" className="text-[10px] md:text-xs font-bold text-slate-700 flex items-center gap-2">
                    {socialPlatforms.find(p => p.id === form.socialMedia)?.icon ? (
                      <div className="w-4 h-4 md:w-5 md:h-5 rounded-lg bg-slate-100 flex items-center justify-center">
                        <Image 
                          src={socialPlatforms.find(p => p.id === form.socialMedia)!.icon!} 
                          alt="Icon" 
                          width={12} 
                          height={12} 
                          className="object-contain md:w-3.5 md:h-3.5" 
                        />
                      </div>
                    ) : (
                      <div className="w-4 h-4 md:w-5 md:h-5 rounded-lg bg-slate-100 flex items-center justify-center">
                        {socialPlatforms.find(p => p.id === form.socialMedia)?.iconComponent}
                      </div>
                    )}
                    <span>
                      {form.socialMedia === "instagram" && "Link Instagram"}
                      {form.socialMedia === "tiktok" && "Link TikTok"}
                      {form.socialMedia === "twitter" && "Link Twitter/X"}
                      {form.socialMedia === "linkedin" && "Link LinkedIn"}
                      {form.socialMedia === "youtube" && "Link YouTube"}
                      {form.socialMedia === "facebook" && "Link Facebook"}
                      {form.socialMedia === "other" && "Link Lainnya"}
                    </span>
                  </Label>
                  <Input
                    id="socialMediaUsername"
                    type="url"
                    value={form.socialMediaUsername}
                    onChange={(e) => setForm({ ...form, socialMediaUsername: e.target.value })}
                    placeholder={socialPlatforms.find(p => p.id === form.socialMedia)?.placeholder}
                    className="h-10 md:h-12 text-xs md:text-sm border-2 border-slate-200 rounded-lg md:rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all"
                    style={{ fontSize: "16px" }}
                  />
                </div>
              )}
            </div>

            <Button
              type="submit"
              disabled={submitting}
              className="w-full h-11 md:h-12 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg md:rounded-xl"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Mengirim Aplikasi...
                </>
              ) : (
                "Daftar Sekarang (Gratis)"
              )}
            </Button>
          </form>

          <p className="text-[9px] md:text-xs text-slate-500 text-center">
            Dengan mendaftar, Anda menyetujui syarat dan ketentuan program afiliasi kami.
          </p>
        </Card>
      </div>
    </div>
  );
}
