"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Wallet,
  ArrowUpRight,
  TrendingUp,
  CreditCard,
  Building2,
  Clock,
  CheckCircle2,
  DollarSign,
  Receipt,
  Download,
  AlertCircle,
  Sparkles,
  RefreshCw,
} from "lucide-react";

interface IncomeLogItem {
  id: string;
  date: string;
  sessionTitle: string;
  durationMinutes: number;
  ratePerSession: number;
  platformFee: number;
  netPayout: number;
  status: "Lunas" | "Diproses";
}

interface WithdrawalItem {
  id: string;
  requestDate: string;
  amount: number;
  bankName: string;
  accountNumber: string;
  accountName: string;
  status: "Selesai" | "Diproses" | "Pending";
}

const INITIAL_INCOME_LOGS: IncomeLogItem[] = [
  {
    id: "inc-1",
    date: "2026-09-10",
    sessionTitle: "Live Class PK: Trik Cepat IRT & Aljabar Spasial",
    durationMinutes: 90,
    ratePerSession: 200000,
    platformFee: 20000,
    netPayout: 180000,
    status: "Lunas",
  },
  {
    id: "inc-2",
    date: "2026-09-08",
    sessionTitle: "Live Class PBM: Strategi Teks Panjang & Analisa Paragraf",
    durationMinutes: 90,
    ratePerSession: 200000,
    platformFee: 20000,
    netPayout: 180000,
    status: "Lunas",
  },
  {
    id: "inc-3",
    date: "2026-09-05",
    sessionTitle: "Private Coaching SNBT #1 (Amanda Zevanya)",
    durationMinutes: 120,
    ratePerSession: 300000,
    platformFee: 30000,
    netPayout: 270000,
    status: "Lunas",
  },
  {
    id: "inc-4",
    date: "2026-09-02",
    sessionTitle: "Live Class PM: Formula Penalaran Matematika Studi Kasus",
    durationMinutes: 90,
    ratePerSession: 200000,
    platformFee: 20000,
    netPayout: 180000,
    status: "Lunas",
  },
];

const INITIAL_WITHDRAWALS: WithdrawalItem[] = [
  {
    id: "wd-101",
    requestDate: "2026-09-01",
    amount: 1500000,
    bankName: "Bank BCA",
    accountNumber: "8830192841",
    accountName: "Ahmad Rizky",
    status: "Selesai",
  },
  {
    id: "wd-102",
    requestDate: "2026-08-15",
    amount: 2100000,
    bankName: "Bank BCA",
    accountNumber: "8830192841",
    accountName: "Ahmad Rizky",
    status: "Selesai",
  },
];

export default function MentorKeuanganPage() {
  const [incomeLogs, setIncomeLogs] = useState<IncomeLogItem[]>(INITIAL_INCOME_LOGS);
  const [withdrawals, setWithdrawals] = useState<WithdrawalItem[]>(INITIAL_WITHDRAWALS);
  const [availableBalance, setAvailableBalance] = useState(3810000);
  const [isPayoutModalOpen, setIsPayoutModalOpen] = useState(false);

  const [payoutForm, setPayoutForm] = useState({
    bankName: "Bank BCA",
    accountNumber: "8830192841",
    accountName: "Ahmad Rizky",
    amount: 1000000,
  });

  const totalAccumulatedEarnings = incomeLogs.reduce((acc, item) => acc + item.netPayout, 0) + 3600000;

  const handleRequestPayout = () => {
    if (payoutForm.amount < 100000) {
      alert("Minimal pencairan dana adalah Rp 100.000");
      return;
    }
    if (payoutForm.amount > availableBalance) {
      alert("Jumlah pencairan melebihi saldo yang tersedia.");
      return;
    }

    const newWd: WithdrawalItem = {
      id: `wd-${Date.now()}`,
      requestDate: new Date().toISOString().split("T")[0],
      amount: Number(payoutForm.amount),
      bankName: payoutForm.bankName,
      accountNumber: payoutForm.accountNumber,
      accountName: payoutForm.accountName,
      status: "Diproses",
    };

    setWithdrawals([newWd, ...withdrawals]);
    setAvailableBalance(availableBalance - Number(payoutForm.amount));
    setIsPayoutModalOpen(false);
    alert("Permintaan pencairan dana berhasil diajukan!");
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border border-slate-200 p-6 rounded-2xl shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Wallet className="h-5 w-5 text-blue-600" />
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
              Panel Keuangan Tentor
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Keuangan &amp; Pendapatan
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Pantau ringkasan honor mengajar, potongan komisi platform, dan riwayat pencairan dana.
          </p>
        </div>

        <Button
          onClick={() => setIsPayoutModalOpen(true)}
          className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold gap-2 text-xs shadow-md shadow-blue-200"
        >
          <CreditCard className="h-4 w-4" />
          <span>Tarik Dana (Pencairan)</span>
        </Button>
      </div>

      {/* Financial Summary Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Saldo Siap Cair */}
        <Card className="p-5 bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 text-white rounded-2xl shadow-lg shadow-blue-200 relative overflow-hidden">
          <div className="absolute right-0 top-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -translate-y-8 translate-x-8" />
          <p className="text-xs font-bold text-blue-200 mb-1">Saldo Siap Cair</p>
          <p className="text-2xl font-extrabold tracking-tight">
            Rp {availableBalance.toLocaleString("id-ID")}
          </p>
          <p className="text-[11px] text-blue-200 mt-2 font-medium">
            Dapat ditarik ke rekening bank atau e-wallet kapan saja.
          </p>
        </Card>

        {/* Total Akumulasi */}
        <Card className="p-5 bg-white border border-slate-200 rounded-2xl">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-bold text-slate-500">Total Akumulasi Honor</p>
            <div className="p-1.5 bg-emerald-50 rounded-lg text-emerald-600">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
          <p className="text-xl font-extrabold text-slate-900">
            Rp {totalAccumulatedEarnings.toLocaleString("id-ID")}
          </p>
          <p className="text-[11px] text-emerald-600 font-bold mt-1">+15% dari bulan lalu</p>
        </Card>

        {/* Sesi Berbayar */}
        <Card className="p-5 bg-white border border-slate-200 rounded-2xl">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-bold text-slate-500">Sesi Berbayar Bulan Ini</p>
            <div className="p-1.5 bg-blue-50 rounded-lg text-blue-600">
              <Receipt className="h-4 w-4" />
            </div>
          </div>
          <p className="text-xl font-extrabold text-slate-900">18 Sesi Kelas</p>
          <p className="text-[11px] text-slate-400 font-medium mt-1">Rata-rata 90 min/sesi</p>
        </Card>

        {/* Komisi Platform */}
        <Card className="p-5 bg-white border border-slate-200 rounded-2xl">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-bold text-slate-500">Potongan Komisi Platform</p>
            <div className="p-1.5 bg-indigo-50 rounded-lg text-indigo-600">
              <Sparkles className="h-4 w-4" />
            </div>
          </div>
          <p className="text-xl font-extrabold text-slate-900">10% Saja</p>
          <p className="text-[11px] text-indigo-600 font-bold mt-1">Biaya Pemeliharaan &amp; Server</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Rincian Honor Sesi (Tabel Pendapatan) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <Receipt className="h-4 w-4 text-blue-600" />
              Laporan Rincian Penghasilan Sesi
            </h2>
            <Badge variant="outline" className="text-xs font-semibold bg-blue-50 text-blue-700 border-blue-200">
              Update Real-time
            </Badge>
          </div>

          <Card className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50">
                  <TableHead className="font-bold text-xs">Tanggal &amp; Sesi</TableHead>
                  <TableHead className="font-bold text-xs">Honor Gross</TableHead>
                  <TableHead className="font-bold text-xs">Komisi (10%)</TableHead>
                  <TableHead className="font-bold text-xs">Honor Bersih</TableHead>
                  <TableHead className="font-bold text-xs text-right">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {incomeLogs.map((log) => (
                  <TableRow key={log.id} className="hover:bg-slate-50/60">
                    <TableCell>
                      <p className="font-bold text-slate-900 text-xs">{log.sessionTitle}</p>
                      <p className="text-[11px] text-slate-500">{log.date} · {log.durationMinutes} menit</p>
                    </TableCell>
                    <TableCell className="text-xs font-semibold text-slate-700">
                      Rp {log.ratePerSession.toLocaleString("id-ID")}
                    </TableCell>
                    <TableCell className="text-xs text-rose-600 font-semibold">
                      -Rp {log.platformFee.toLocaleString("id-ID")}
                    </TableCell>
                    <TableCell className="text-xs font-extrabold text-emerald-600">
                      Rp {log.netPayout.toLocaleString("id-ID")}
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 text-[10px] font-bold">
                        {log.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </div>

        {/* Riwayat Pencairan Dana (Withdrawal Status) */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-blue-600" />
              Status Pencairan Dana
            </h2>
          </div>

          <div className="space-y-3">
            {withdrawals.map((wd) => (
              <Card key={wd.id} className="p-4 bg-white border border-slate-200 rounded-2xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-slate-900">
                    Rp {wd.amount.toLocaleString("id-ID")}
                  </span>
                  <Badge
                    className={`text-[10px] font-bold ${
                      wd.status === "Selesai"
                        ? "bg-emerald-100 text-emerald-800 border-emerald-200"
                        : wd.status === "Diproses"
                        ? "bg-amber-100 text-amber-800 border-amber-200"
                        : "bg-blue-100 text-blue-800 border-blue-200"
                    }`}
                  >
                    {wd.status}
                  </Badge>
                </div>

                <div className="text-xs text-slate-500 space-y-0.5">
                  <p className="font-semibold text-slate-700">{wd.bankName} - {wd.accountNumber}</p>
                  <p className="text-[11px]">a.n. {wd.accountName}</p>
                  <p className="text-[10px] text-slate-400">Tgl Pengajuan: {wd.requestDate}</p>
                </div>
              </Card>
            ))}
          </div>

          <Card className="p-4 rounded-2xl bg-blue-50/60 border border-blue-200/60 text-xs space-y-2">
            <p className="font-bold text-blue-800 flex items-center gap-1.5">
              <AlertCircle className="h-4 w-4 text-blue-600" />
              Info Ketentuan Pencairan
            </p>
            <p className="text-blue-900 leading-relaxed">
              Pencairan dana yang diajukan sebelum pukul 14:00 WIB akan diproses dan masuk ke rekening tujuan pada hari kerja yang sama.
            </p>
          </Card>
        </div>
      </div>

      {/* DIALOG TARIK DANA / PENCAIRAN */}
      <Dialog open={isPayoutModalOpen} onOpenChange={setIsPayoutModalOpen}>
        <DialogContent className="max-w-md rounded-2xl p-6">
          <DialogHeader>
            <DialogTitle className="text-lg font-extrabold text-slate-900">
              Formulir Pencairan Dana Tentor
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Tarik saldo penghasilan mengajar Anda langsung ke rekening bank pribadi.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs flex justify-between items-center">
              <span className="font-semibold text-slate-600">Saldo Siap Cair:</span>
              <span className="font-extrabold text-blue-700 text-sm">
                Rp {availableBalance.toLocaleString("id-ID")}
              </span>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-slate-700">Bank / E-Wallet Tujuan *</Label>
              <select
                value={payoutForm.bankName}
                onChange={(e) => setPayoutForm({ ...payoutForm, bankName: e.target.value })}
                className="w-full h-10 px-3 border border-slate-200 rounded-xl text-xs font-semibold bg-white"
              >
                <option value="Bank BCA">Bank BCA</option>
                <option value="Bank Mandiri">Bank Mandiri</option>
                <option value="Bank BNI">Bank BNI</option>
                <option value="Bank BRI">Bank BRI</option>
                <option value="GoPay / OVO">GoPay / OVO</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-slate-700">Nomor Rekening / HP *</Label>
              <Input
                value={payoutForm.accountNumber}
                onChange={(e) => setPayoutForm({ ...payoutForm, accountNumber: e.target.value })}
                placeholder="8830192841"
                className="rounded-xl text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-slate-700">Nama Pemilik Rekening *</Label>
              <Input
                value={payoutForm.accountName}
                onChange={(e) => setPayoutForm({ ...payoutForm, accountName: e.target.value })}
                placeholder="Sesuaikan dengan nama di buku tabungan"
                className="rounded-xl text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-slate-700">Jumlah Penarikan (Rp) *</Label>
              <Input
                type="number"
                value={payoutForm.amount}
                onChange={(e) => setPayoutForm({ ...payoutForm, amount: Number(e.target.value) })}
                className="rounded-xl text-xs font-bold"
              />
              <p className="text-[10px] text-slate-400">Minimum pencairan Rp 100.000</p>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setIsPayoutModalOpen(false)} className="rounded-xl text-xs font-bold">
              Batal
            </Button>
            <Button onClick={handleRequestPayout} className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs">
              Ajukan Pencairan Now
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
