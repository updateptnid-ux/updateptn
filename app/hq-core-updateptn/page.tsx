import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  UserCheck,
  DollarSign,
  TrendingUp,
  FileSpreadsheet,
  FileQuestion,
  Building2,
  Video,
  Plus,
  ArrowUpRight,
  ShieldCheck,
  CreditCard,
  PieChart,
  BarChart3,
  Calendar,
  Sparkles,
} from "lucide-react";

export default function AdminDashboardPage() {
  const summaryWidgets = [
    {
      title: "Total User",
      value: "52.480",
      change: "+12.4% bulan ini",
      isPositive: true,
      icon: Users,
      color: "text-blue-600 bg-blue-50 border-blue-100",
    },
    {
      title: "User Premium",
      value: "14.250",
      change: "27.1% konversi",
      isPositive: true,
      icon: UserCheck,
      color: "text-indigo-600 bg-indigo-50 border-indigo-100",
    },
    {
      title: "Pendapatan Hari Ini",
      value: "Rp 14.850.000",
      change: "+18.5% vs kemarin",
      isPositive: true,
      icon: DollarSign,
      color: "text-emerald-600 bg-emerald-50 border-emerald-100",
    },
    {
      title: "Pendapatan Bulan Ini",
      value: "Rp 328.500.000",
      change: "82% dari target",
      isPositive: true,
      icon: TrendingUp,
      color: "text-teal-600 bg-teal-50 border-teal-100",
    },
    {
      title: "Total Try Out",
      value: "18",
      change: "Seri SNBT",
      isPositive: true,
      icon: FileSpreadsheet,
      color: "text-amber-600 bg-amber-50 border-amber-100",
    },
    {
      title: "Jumlah Soal IRT",
      value: "2.450",
      change: "Subtes TPS & Literasi",
      isPositive: true,
      icon: FileQuestion,
      color: "text-violet-600 bg-violet-50 border-violet-100",
    },
    {
      title: "Jumlah PTN Terdaftar",
      value: "85",
      change: "3.420 Program Studi",
      isPositive: true,
      icon: Building2,
      color: "text-sky-600 bg-sky-50 border-sky-100",
    },
    {
      title: "Live Class Hari Ini",
      value: "3 Sesi",
      change: "200+ Peserta Aktif",
      isPositive: true,
      icon: Video,
      color: "text-rose-600 bg-rose-50 border-rose-100",
    },
  ];

  return (
    <div className="space-y-8 font-sans">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm">
        <div className="space-y-1">
          <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200 font-semibold mb-1">
            Ringkasan Performa Sistem HQ
          </Badge>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Dashboard Overview Admin HQ
          </h1>
          <p className="text-sm text-slate-500">
            Pantau pertumbuhan pengguna, pendapatan transaksi, statistik Try Out, dan master data PTN.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/hq-core-updateptn/questions">
            <Button className="bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl gap-2 shadow-sm text-xs h-10 px-4">
              <Plus className="h-4 w-4" />
              <span>Tambah Soal</span>
            </Button>
          </Link>
          <Link href="/hq-core-updateptn/tryouts">
            <Button variant="outline" className="border-slate-200 font-semibold rounded-xl text-xs h-10 px-4">
              <span>Buat Try Out</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* 8 Summary Metric Widgets Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {summaryWidgets.map((item, idx) => {
          const Icon = item.icon;
          return (
            <Card key={idx} className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{item.title}</span>
                <div className={`h-9 w-9 rounded-xl flex items-center justify-center border ${item.color}`}>
                  <Icon className="h-5 w-5" />
                </div>
              </div>
              <div>
                <p className="text-2xl font-black text-slate-900 tracking-tight">{item.value}</p>
                <p className="text-xs text-emerald-600 font-semibold flex items-center gap-1 pt-1">
                  <ArrowUpRight className="h-3.5 w-3.5" />
                  <span>{item.change}</span>
                </p>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Analytics Visualization Placeholders */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Revenue & Growth Chart Placeholder */}
        <Card className="lg:col-span-8 bg-white border border-slate-200 shadow-sm rounded-2xl p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-lg font-extrabold text-slate-900">Perkembangan Pendapatan & User</h3>
              <p className="text-xs text-slate-500">Tren pendaftaran siswa dan transaksi Midtrans 30 hari terakhir</p>
            </div>
            <Badge variant="outline" className="text-xs bg-slate-50 border-slate-200 text-slate-600 font-semibold">
              Real-time Analytics
            </Badge>
          </div>

          {/* Chart Mock Box */}
          <div className="h-64 bg-slate-50 rounded-xl border border-dashed border-slate-200 flex flex-col items-center justify-center p-6 space-y-3 text-center">
            <BarChart3 className="h-10 w-10 text-blue-600 opacity-60 animate-pulse" />
            <div className="space-y-1">
              <p className="text-sm font-bold text-slate-900">Grafik Performa Pendapatan & Pertumbuhan</p>
              <p className="text-xs text-slate-500 max-w-sm">
                Grafik visualisasi data pendaftaran harian dan omzet transaksi Rp 328.500.000 bulan ini.
              </p>
            </div>
            <div className="flex items-center gap-6 pt-2 text-xs font-semibold">
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-blue-600"></span>
                <span className="text-slate-600">Pendapatan Transaksi</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-indigo-500"></span>
                <span className="text-slate-600">Siswa Baru Terdaftar</span>
              </div>
            </div>
          </div>
        </Card>

        {/* Subscription & Try Out Stats Placeholder */}
        <Card className="lg:col-span-4 bg-white border border-slate-200 shadow-sm rounded-2xl p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-lg font-extrabold text-slate-900">Distribusi Paket</h3>
              <p className="text-xs text-slate-500">Breakdown penjualan paket</p>
            </div>
            <PieChart className="h-5 w-5 text-slate-400" />
          </div>

          <div className="space-y-4 pt-1">
            {/* Item 1 */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-slate-700">All Access Bundling</span>
                <span className="text-slate-900 font-bold">58% (8.265 User)</span>
              </div>
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div className="bg-blue-600 h-2.5 rounded-full w-[58%]"></div>
              </div>
            </div>

            {/* Item 2 */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-slate-700">Try Out IRT Pass</span>
                <span className="text-slate-900 font-bold">26% (3.705 User)</span>
              </div>
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div className="bg-indigo-600 h-2.5 rounded-full w-[26%]"></div>
              </div>
            </div>

            {/* Item 3 */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-slate-700">Cek Peluang PTN Only</span>
                <span className="text-slate-900 font-bold">16% (2.280 User)</span>
              </div>
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div className="bg-teal-600 h-2.5 rounded-full w-[16%]"></div>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-100 space-y-1">
            <p className="text-xs font-bold text-blue-900 flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-blue-600" />
              <span>Insight Sistem</span>
            </p>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Paket All Access mendominasi 58% penjualan dengan rata-rata transaksi harian 450 paket.
            </p>
          </div>
        </Card>
      </div>

      {/* Quick Action Shortcuts Grid */}
      <div className="space-y-4">
        <h3 className="text-base font-bold text-slate-900">Akses Cepat Modul HQ</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Link href="/hq-core-updateptn/questions">
            <Card className="bg-white border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all p-4 rounded-2xl flex items-center gap-3 group">
              <div className="h-10 w-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <FileQuestion className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900 group-hover:text-blue-600">Bank Soal</p>
                <p className="text-[11px] text-slate-500">2.450 Soal IRT</p>
              </div>
            </Card>
          </Link>

          <Link href="/hq-core-updateptn/tryouts">
            <Card className="bg-white border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all p-4 rounded-2xl flex items-center gap-3 group">
              <div className="h-10 w-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                <FileSpreadsheet className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900 group-hover:text-blue-600">Paket Try Out</p>
                <p className="text-[11px] text-slate-500">18 Paket Aktif</p>
              </div>
            </Card>
          </Link>

          <Link href="/hq-core-updateptn/live-classes">
            <Card className="bg-white border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all p-4 rounded-2xl flex items-center gap-3 group">
              <div className="h-10 w-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                <Video className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900 group-hover:text-blue-600">Live Class</p>
                <p className="text-[11px] text-slate-500">3 Sesi Hari Ini</p>
              </div>
            </Card>
          </Link>

          <Link href="/hq-core-updateptn/universities">
            <Card className="bg-white border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all p-4 rounded-2xl flex items-center gap-3 group">
              <div className="h-10 w-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center shrink-0">
                <Building2 className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900 group-hover:text-blue-600">Master PTN</p>
                <p className="text-[11px] text-slate-500">85 Universitas</p>
              </div>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  );
}
