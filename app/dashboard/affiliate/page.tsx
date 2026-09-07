"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  getAffiliateDashboardAction, 
  updateAffiliateBankInfoAction,
  createWithdrawalRequestAction 
} from "@/actions/affiliate";
import {
  Users,
  DollarSign,
  TrendingUp,
  Loader2,
  Copy,
  Check,
  Wallet,
  Calendar,
  CreditCard,
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

export default function AffiliateDashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [copied, setCopied] = useState(false);
  const [showBankForm, setShowBankForm] = useState(false);
  const [showWithdrawForm, setShowWithdrawForm] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [processing, setProcessing] = useState(false);

  const [bankInfo, setBankInfo] = useState({
    bankName: "",
    bankAccountNumber: "",
    bankAccountName: "",
  });

  useEffect(() => {
    loadDashboard();
  }, []);

  async function loadDashboard() {
    setLoading(true);
    const result = await getAffiliateDashboardAction();
    
    if (result.success && result.affiliate) {
      setData(result);
      setBankInfo({
        bankName: result.affiliate.bank_name || "",
        bankAccountNumber: result.affiliate.bank_account_number || "",
        bankAccountName: result.affiliate.bank_account_name || "",
      });
    } else {
      // If not affiliate or not active, redirect to registration page
      if (result.error === "NotAffiliate" || result.error === "NotActiveAffiliate") {
        toast.error(result.message || "Anda belum terdaftar sebagai mitra afiliasi");
        router.push("/dashboard/student/affiliate");
        return;
      }
      toast.error(result.message || "Gagal memuat data");
    }
    setLoading(false);
  }

  async function handleCopyLink() {
    const link = `${window.location.origin}/register?ref=${data?.affiliate?.affiliate_code}`;
    await navigator.clipboard.writeText(link);
    setCopied(true);
    toast.success("Link referral disalin!");
    setTimeout(() => setCopied(false), 2000);
  }

  async function handleUpdateBank() {
    if (!bankInfo.bankName || !bankInfo.bankAccountNumber || !bankInfo.bankAccountName) {
      toast.error("Harap isi semua field bank");
      return;
    }

    setProcessing(true);
    const result = await updateAffiliateBankInfoAction(bankInfo);
    
    if (result.success) {
      toast.success("Info bank berhasil diperbarui!");
      setShowBankForm(false);
      loadDashboard();
    } else {
      toast.error(result.message || "Gagal memperbarui info bank");
    }
    setProcessing(false);
  }

  async function handleWithdraw() {
    const amount = parseInt(withdrawAmount);
    if (!amount || amount < 100000) {
      toast.error("Minimal penarikan Rp 100.000");
      return;
    }

    if (amount > Number(data?.affiliate?.pending_balance)) {
      toast.error("Saldo tidak cukup");
      return;
    }

    setProcessing(true);
    const result = await createWithdrawalRequestAction(amount);
    
    if (result.success) {
      toast.success("Permintaan penarikan berhasil dibuat!");
      setShowWithdrawForm(false);
      setWithdrawAmount("");
      loadDashboard();
    } else {
      toast.error(result.message || "Gagal membuat permintaan");
    }
    setProcessing(false);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!data || !data.affiliate) {
    return (
      <div className="max-w-4xl mx-auto p-4 md:p-6 space-y-6">
        <Card className="p-8 text-center">
          <p className="text-slate-600 mb-4">Anda belum terdaftar sebagai mitra afiliasi.</p>
          <Link href="/dashboard/student/affiliate">
            <Button className="bg-blue-600 hover:bg-blue-700 mr-3">
              Daftar Sekarang
            </Button>
          </Link>
          <Link href="/dashboard/student">
            <Button variant="outline">
              Kembali ke Dashboard
            </Button>
          </Link>
        </Card>
      </div>
    );
  }

  const { affiliate, stats, commissions, withdrawals } = data;

  return (
    <div className="max-w-7xl mx-auto p-3 md:p-6 space-y-4 md:space-y-6 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-br from-purple-600 to-purple-700 rounded-xl md:rounded-2xl p-4 md:p-6 text-white">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-lg md:text-2xl font-bold">Dashboard Afiliasi</h1>
            <p className="text-xs md:text-sm text-purple-100 mt-1">
              Selamat datang, {affiliate.full_name}!
            </p>
          </div>
          <Badge className="bg-white/20 text-white border-white/30 text-xs">
            {affiliate.affiliate_code}
          </Badge>
        </div>

        {/* Promo Code */}
        <div className="mt-4 bg-white/10 backdrop-blur rounded-lg p-3 md:p-4">
          <p className="text-xs font-bold mb-2 flex items-center gap-2">
            <Copy className="h-3.5 w-3.5" />
            KODE PROMO ANDA
          </p>
          <div className="flex gap-2 items-center">
            <div className="flex-1 bg-white/90 rounded-lg px-4 py-3 flex items-center justify-between">
              <p className="text-2xl md:text-3xl font-black text-purple-600 tracking-wider">
                {affiliate.affiliate_code}
              </p>
              <Button
                onClick={() => {
                  navigator.clipboard.writeText(affiliate.affiliate_code);
                  setCopied(true);
                  toast.success("Kode promo disalin!");
                  setTimeout(() => setCopied(false), 2000);
                }}
                variant="ghost"
                className="hover:bg-purple-100 h-10"
              >
                {copied ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4 text-purple-600" />}
              </Button>
            </div>
          </div>
          <p className="text-[10px] md:text-xs text-purple-100 mt-2">
            💡 Customer masukkan kode ini saat checkout untuk dapatkan diskon 10%. Anda dapat komisi 10% dari harga setelah diskon.
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <Card className="p-3 md:p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] md:text-xs font-bold text-slate-400">TOTAL PENGGUNAAN</span>
            <Users className="h-4 w-4 text-blue-600" />
          </div>
          <p className="text-xl md:text-2xl font-black text-slate-900">{stats.approvedCommissions}</p>
          <p className="text-[10px] md:text-xs text-slate-600 mt-1">
            Kode promo digunakan {stats.approvedCommissions}x
          </p>
        </Card>

        <Card className="p-3 md:p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] md:text-xs font-bold text-slate-400">TOTAL KOMISI</span>
            <DollarSign className="h-4 w-4 text-emerald-600" />
          </div>
          <p className="text-xl md:text-2xl font-black text-slate-900">
            Rp {stats.totalCommissions.toLocaleString("id-ID")}
          </p>
          <p className="text-[10px] md:text-xs text-slate-600 mt-1">
            {stats.approvedCommissions} transaksi
          </p>
        </Card>

        <Card className="p-3 md:p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] md:text-xs font-bold text-slate-400">SALDO TERSEDIA</span>
            <Wallet className="h-4 w-4 text-purple-600" />
          </div>
          <p className="text-xl md:text-2xl font-black text-slate-900">
            Rp {Number(affiliate.pending_balance || 0).toLocaleString("id-ID")}
          </p>
          <Button
            size="sm"
            onClick={() => setShowWithdrawForm(true)}
            disabled={Number(affiliate.pending_balance) < 100000}
            className="mt-2 w-full bg-purple-600 hover:bg-purple-700 text-white h-8 text-xs"
          >
            Tarik Saldo
          </Button>
        </Card>

        <Card className="p-3 md:p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] md:text-xs font-bold text-slate-400">AVG. KOMISI</span>
            <TrendingUp className="h-4 w-4 text-amber-600" />
          </div>
          <p className="text-xl md:text-2xl font-black text-slate-900">
            Rp {stats.approvedCommissions > 0 
              ? Math.round(stats.totalCommissions / stats.approvedCommissions).toLocaleString("id-ID") 
              : "0"}
          </p>
          <p className="text-[10px] md:text-xs text-slate-600 mt-1">
            Per transaksi
          </p>
        </Card>
      </div>

      {/* Bank Info Card */}
      <Card className="p-4 md:p-6 bg-blue-50/50 border-blue-200">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <CreditCard className="h-4 w-4 md:h-5 md:w-5 text-blue-600" />
            <h3 className="text-sm md:text-base font-bold text-slate-900">Informasi Bank</h3>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setShowBankForm(!showBankForm)}
            className="text-xs h-8"
          >
            {showBankForm ? "Batal" : "Edit"}
          </Button>
        </div>

        {showBankForm ? (
          <div className="space-y-3">
            <Input
              placeholder="Nama Bank (contoh: BCA)"
              value={bankInfo.bankName}
              onChange={(e) => setBankInfo({ ...bankInfo, bankName: e.target.value })}
              className="text-sm"
              style={{ fontSize: "14px" }}
            />
            <Input
              placeholder="Nomor Rekening"
              value={bankInfo.bankAccountNumber}
              onChange={(e) => setBankInfo({ ...bankInfo, bankAccountNumber: e.target.value })}
              className="text-sm"
              style={{ fontSize: "14px" }}
            />
            <Input
              placeholder="Nama Pemilik Rekening"
              value={bankInfo.bankAccountName}
              onChange={(e) => setBankInfo({ ...bankInfo, bankAccountName: e.target.value })}
              className="text-sm"
              style={{ fontSize: "14px" }}
            />
            <Button
              onClick={handleUpdateBank}
              disabled={processing}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white h-10"
            >
              {processing ? <Loader2 className="h-4 w-4 animate-spin" /> : "Simpan"}
            </Button>
          </div>
        ) : (
          <div className="text-xs md:text-sm text-slate-700 space-y-1">
            {affiliate.bank_name ? (
              <>
                <p>🏦 <strong>{affiliate.bank_name}</strong></p>
                <p>💳 {affiliate.bank_account_number}</p>
                <p>👤 {affiliate.bank_account_name}</p>
              </>
            ) : (
              <p className="text-slate-500 italic">Belum ada info bank. Klik Edit untuk menambahkan.</p>
            )}
          </div>
        )}
      </Card>

      {/* Withdraw Form Modal */}
      {showWithdrawForm && (
        <Card className="p-4 md:p-6 bg-emerald-50/50 border-emerald-200">
          <h3 className="text-sm md:text-base font-bold text-slate-900 mb-3">Tarik Saldo</h3>
          <div className="space-y-3">
            <div>
              <label className="text-xs md:text-sm font-semibold text-slate-700 mb-1 block">
                Jumlah Penarikan (Min. Rp 100.000)
              </label>
              <Input
                type="number"
                placeholder="100000"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
                className="text-sm"
                style={{ fontSize: "16px" }}
              />
              <p className="text-xs text-slate-500 mt-1">
                Saldo tersedia: Rp {Number(affiliate.pending_balance || 0).toLocaleString("id-ID")}
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleWithdraw}
                disabled={processing}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white h-10"
              >
                {processing ? <Loader2 className="h-4 w-4 animate-spin" /> : "Ajukan Penarikan"}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowWithdrawForm(false);
                  setWithdrawAmount("");
                }}
                className="h-10 px-6"
              >
                Batal
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Tabs */}
      <Tabs defaultValue="commissions" className="space-y-3 md:space-y-4">
        <TabsList className="bg-white border w-full grid grid-cols-2">
          <TabsTrigger value="commissions" className="text-xs md:text-sm">
            Komisi ({commissions.length})
          </TabsTrigger>
          <TabsTrigger value="withdrawals" className="text-xs md:text-sm">
            Penarikan ({withdrawals.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="commissions">
          <Card className="p-3 md:p-4">
            <h3 className="text-sm md:text-base font-bold text-slate-900 mb-3">Riwayat Komisi</h3>
            {commissions.length === 0 ? (
              <div className="text-center py-12">
                <DollarSign className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                <p className="text-sm font-bold text-slate-700 mb-1">Belum Ada Komisi</p>
                <p className="text-xs text-slate-500">
                  Bagikan kode promo <span className="font-bold text-purple-600">{affiliate.affiliate_code}</span> untuk mulai mendapatkan komisi!
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {commissions.map((comm: any) => (
                  <div
                    key={comm.id}
                    className="flex items-center justify-between p-3 bg-gradient-to-r from-emerald-50 to-white rounded-lg border border-emerald-100"
                  >
                    <div className="flex-1">
                      <p className="text-base md:text-lg font-black text-emerald-600">
                        + Rp {Number(comm.commission_amount).toLocaleString("id-ID")}
                      </p>
                      <p className="text-[10px] md:text-xs text-slate-600 mt-1">
                        Order: {comm.order_id}
                      </p>
                      <p className="text-[10px] md:text-xs text-slate-500 truncate">
                        {comm.customer_email || "Customer"}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <Calendar className="h-3 w-3 text-slate-400" />
                        <p className="text-[10px] md:text-xs text-slate-400">
                          {new Date(comm.created_at).toLocaleDateString("id-ID", {
                            day: "numeric",
                            month: "short",
                            year: "numeric"
                          })}
                        </p>
                      </div>
                    </div>
                    <Badge
                      className={
                        comm.status === "approved" || comm.status === "paid"
                          ? "bg-emerald-100 text-emerald-700 text-[10px] md:text-xs border-emerald-300"
                          : "bg-amber-100 text-amber-700 text-[10px] md:text-xs border-amber-300"
                      }
                    >
                      {comm.status === "approved" ? "✓ Disetujui" : comm.status === "paid" ? "✓ Dibayar" : "⏳ Pending"}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="withdrawals">
          <Card className="p-3 md:p-4">
            <h3 className="text-sm md:text-base font-bold text-slate-900 mb-3">Riwayat Penarikan</h3>
            {withdrawals.length === 0 ? (
              <div className="text-center py-12">
                <Wallet className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                <p className="text-sm font-bold text-slate-700 mb-1">Belum Ada Penarikan</p>
                <p className="text-xs text-slate-500">
                  Saldo minimum Rp 100.000 untuk melakukan penarikan
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {withdrawals.map((wd: any) => (
                  <div
                    key={wd.id}
                    className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200"
                  >
                    <div className="flex-1">
                      <p className="text-base md:text-lg font-black text-slate-900">
                        Rp {Number(wd.amount).toLocaleString("id-ID")}
                      </p>
                      <p className="text-[10px] md:text-xs text-slate-600 mt-1 font-mono">
                        {wd.bank_name} • {wd.bank_account_number}
                      </p>
                      <p className="text-[10px] md:text-xs text-slate-500">
                        a.n. {wd.bank_account_name}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <Calendar className="h-3 w-3 text-slate-400" />
                        <p className="text-[10px] md:text-xs text-slate-400">
                          {new Date(wd.created_at).toLocaleDateString("id-ID", {
                            day: "numeric",
                            month: "short",
                            year: "numeric"
                          })}
                        </p>
                      </div>
                      {wd.rejection_reason && (
                        <p className="text-[10px] text-rose-600 mt-1">
                          ⚠️ {wd.rejection_reason}
                        </p>
                      )}
                    </div>
                    <Badge
                      className={
                        wd.status === "completed"
                          ? "bg-emerald-100 text-emerald-700 text-[10px] md:text-xs border-emerald-300"
                          : wd.status === "rejected"
                          ? "bg-rose-100 text-rose-700 text-[10px] md:text-xs border-rose-300"
                          : wd.status === "processing"
                          ? "bg-blue-100 text-blue-700 text-[10px] md:text-xs border-blue-300"
                          : "bg-amber-100 text-amber-700 text-[10px] md:text-xs border-amber-300"
                      }
                    >
                      {wd.status === "completed" ? "✓ Selesai" : 
                       wd.status === "rejected" ? "✗ Ditolak" :
                       wd.status === "processing" ? "⏳ Proses" : 
                       "⏳ Pending"}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
