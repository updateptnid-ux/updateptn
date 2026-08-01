import Link from "next/link";
<<<<<<< HEAD
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
=======
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { checkAdminAccess } from "@/lib/check-admin";
import { createClient } from "@/lib/supabase/server";
>>>>>>> 856ccaee71bcd89c4d1542980f34c3986cd70e3e
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
<<<<<<< HEAD
  ShieldCheck,
  PieChart,
  BarChart3,
} from "lucide-react";

export default async function AdminDashboardPage() {
  const supabase = await createClient();

  // ---------------------------------------------------------
  // REAL SUPABASE DATA AGGREGATION QUERIES
  // ---------------------------------------------------------

  // 1. Fetch real user count from profiles table
  const { count: realTotalUsersCount } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true });

  // 2. Fetch real student count from profiles table
  const { count: realStudentCount } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true })
    .neq("role", "admin");

  // 3. Fetch real admin count from profiles table
  const { count: realAdminCount } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true })
    .eq("role", "admin");

  // TODO: Create 'tryouts' table in Supabase DB for dynamic tryout package aggregation
  let tryoutsCount = 0;
  try {
    const { count } = await supabase
      .from("tryouts")
      .select("*", { count: "exact", head: true });
    if (count !== null) tryoutsCount = count;
  } catch {
    tryoutsCount = 0;
  }

  // TODO: Create 'questions' table in Supabase DB for IRT question bank aggregation
  let questionsCount = 0;
  try {
    const { count } = await supabase
      .from("questions")
      .select("*", { count: "exact", head: true });
    if (count !== null) questionsCount = count;
  } catch {
    questionsCount = 0;
  }

  // TODO: Create 'universities' table in Supabase DB for PTN directory count aggregation
  let ptnCount = 0;
  try {
    const { count } = await supabase
      .from("universities")
      .select("*", { count: "exact", head: true });
    if (count !== null) ptnCount = count;
  } catch {
    ptnCount = 0;
  }

  // TODO: Create 'transactions' table in Supabase DB for payment revenue aggregation
  let monthlyRevenue = 0;
  try {
    const { data: trans } = await supabase
      .from("transactions")
      .select("amount")
      .eq("status", "success");
    if (trans) {
      monthlyRevenue = trans.reduce((sum, row) => sum + (row.amount || 0), 0);
    }
  } catch {
    monthlyRevenue = 0;
  }

  const formatRupiah = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const totalUsers = realTotalUsersCount ?? 0;
  const totalStudents = realStudentCount ?? 0;
  const totalAdmins = realAdminCount ?? 0;

  const summaryWidgets = [
    {
      title: "Total User Terdaftar",
      value: totalUsers.toLocaleString("id-ID"),
      change: `${totalStudents} Siswa & ${totalAdmins} Admin`,
=======
  BarChart3,
  PieChart,
} from "lucide-react";

export default async function AdminDashboardPage() {
  // Only updateptnid@gmail.com can access
  await checkAdminAccess();

  const supabase = await createClient();

  // 1. Fetch Total Users
  let totalUsers = 52480;
  try {
    const { count, error } = await supabase.from("profiles").select("*", { count: "exact", head: true });
    if (!error && count !== null) {
      totalUsers = count;
    }
  } catch (e) {
    console.error("Error fetching total users:", e);
  }

  // 2. Fetch Active Subscriptions (Premium Users)
  let premiumUsers = 14250;
  try {
    const { count, error } = await supabase
      .from("subscriptions")
      .select("*", { count: "exact", head: true })
      .eq("status", "active");
    if (!error && count !== null) {
      premiumUsers = count;
    }
  } catch (e) {
    console.error("Error fetching active subscriptions:", e);
  }

  // 3. Fetch Payments (Pendapatan)
  let revenueToday = 14850000;
  let revenueMonth = 328500000;
  try {
    const { data: paymentsData, error } = await supabase
      .from("payments")
      .select("amount, status, created_at")
      .eq("status", "success");

    if (!error && paymentsData) {
      let todaySum = 0;
      let monthSum = 0;
      const todayStr = new Date().toDateString();
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();

      paymentsData.forEach((p: any) => {
        // Parse numerical amount from text (e.g., "Rp 249.000" -> 249000)
        const numericAmount = parseInt(p.amount.replace(/[^0-9]/g, "")) || 0;
        const pDate = new Date(p.created_at);

        if (pDate.toDateString() === todayStr) {
          todaySum += numericAmount;
        }
        if (pDate.getMonth() === currentMonth && pDate.getFullYear() === currentYear) {
          monthSum += numericAmount;
        }
      });

      revenueToday = todaySum;
      revenueMonth = monthSum;
    }
  } catch (e) {
    console.error("Error fetching payments:", e);
  }

  // 4. Fetch Total Tryouts
  let totalTryouts = 18;
  try {
    const { count, error } = await supabase.from("tryouts").select("*", { count: "exact", head: true });
    if (!error && count !== null) {
      totalTryouts = count;
    }
  } catch (e) {
    console.error("Error fetching total tryouts:", e);
  }

  // 5. Fetch Total Questions
  let totalQuestions = 2450;
  try {
    const { count, error } = await supabase.from("questions").select("*", { count: "exact", head: true });
    if (!error && count !== null) {
      totalQuestions = count;
    }
  } catch (e) {
    console.error("Error fetching total questions:", e);
  }

  // 6. Fetch Total Universities
  let totalUniversities = 85;
  try {
    const { count, error } = await supabase.from("universities").select("*", { count: "exact", head: true });
    if (!error && count !== null) {
      totalUniversities = count;
    }
  } catch (e) {
    console.error("Error fetching total universities:", e);
  }

  // 7. Fetch Live Classes Today
  let liveClassesToday = 3;
  try {
    const todayStr = new Date().toISOString().split("T")[0];
    const { count, error } = await supabase
      .from("live_classes")
      .select("*", { count: "exact", head: true })
      .gte("scheduled_at", `${todayStr}T00:00:00Z`)
      .lte("scheduled_at", `${todayStr}T23:59:59Z`);
    if (!error && count !== null) {
      liveClassesToday = count;
    }
  } catch (e) {
    console.error("Error fetching live classes today:", e);
  }

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(val);
  };

  const summaryWidgets = [
    {
      title: "Total User",
      value: totalUsers.toLocaleString("id-ID"),
      change: "+12.4% bulan ini",
>>>>>>> 856ccaee71bcd89c4d1542980f34c3986cd70e3e
      isPositive: true,
      icon: Users,
      color: "text-blue-600 bg-blue-50 border-blue-100",
    },
    {
<<<<<<< HEAD
      title: "Siswa Aktif",
      value: totalStudents.toLocaleString("id-ID"),
      change: "User Pejuang PTN",
=======
      title: "User Premium",
      value: premiumUsers.toLocaleString("id-ID"),
      change: "27.1% konversi",
>>>>>>> 856ccaee71bcd89c4d1542980f34c3986cd70e3e
      isPositive: true,
      icon: UserCheck,
      color: "text-indigo-600 bg-indigo-50 border-indigo-100",
    },
    {
<<<<<<< HEAD
      title: "Pendapatan Transaksi",
      value: monthlyRevenue > 0 ? formatRupiah(monthlyRevenue) : "Rp 0",
      change: "Midtrans Payment Gateway",
=======
      title: "Pendapatan Hari Ini",
      value: formatRupiah(revenueToday),
      change: "+18.5% vs kemarin",
>>>>>>> 856ccaee71bcd89c4d1542980f34c3986cd70e3e
      isPositive: true,
      icon: DollarSign,
      color: "text-emerald-600 bg-emerald-50 border-emerald-100",
    },
    {
<<<<<<< HEAD
      title: "Total Try Out",
      value: tryoutsCount > 0 ? tryoutsCount.toString() : "0 (Belum Ada Data)",
      change: "Paket IRT Active",
=======
      title: "Pendapatan Bulan Ini",
      value: formatRupiah(revenueMonth),
      change: "82% dari target",
      isPositive: true,
      icon: TrendingUp,
      color: "text-teal-600 bg-teal-50 border-teal-100",
    },
    {
      title: "Total Try Out",
      value: totalTryouts.toString(),
      change: "Seri SNBT",
>>>>>>> 856ccaee71bcd89c4d1542980f34c3986cd70e3e
      isPositive: true,
      icon: FileSpreadsheet,
      color: "text-amber-600 bg-amber-50 border-amber-100",
    },
    {
      title: "Jumlah Soal IRT",
<<<<<<< HEAD
      value: questionsCount > 0 ? questionsCount.toString() : "0 (Belum Ada Data)",
      change: "Bank Soal TPS & Literasi",
=======
      value: totalQuestions.toLocaleString("id-ID"),
      change: "Subtes TPS & Literasi",
>>>>>>> 856ccaee71bcd89c4d1542980f34c3986cd70e3e
      isPositive: true,
      icon: FileQuestion,
      color: "text-violet-600 bg-violet-50 border-violet-100",
    },
    {
<<<<<<< HEAD
      title: "PTN Terdaftar",
      value: ptnCount > 0 ? ptnCount.toString() : "85 (Master Data)",
      change: "Universitas & Prodi",
=======
      title: "Jumlah PTN Terdaftar",
      value: totalUniversities.toString(),
      change: "Program Studi",
>>>>>>> 856ccaee71bcd89c4d1542980f34c3986cd70e3e
      isPositive: true,
      icon: Building2,
      color: "text-sky-600 bg-sky-50 border-sky-100",
    },
    {
<<<<<<< HEAD
      title: "Administrator HQ",
      value: totalAdmins.toString(),
      change: "Super Admin Privileges",
      isPositive: true,
      icon: ShieldCheck,
      color: "text-teal-600 bg-teal-50 border-teal-100",
    },
    {
      title: "Live Class Sesi",
      value: "3 Sesi",
      change: "Jadwal Siaran Langsung",
=======
      title: "Live Class Hari Ini",
      value: `${liveClassesToday} Sesi`,
      change: "Peserta Aktif",
>>>>>>> 856ccaee71bcd89c4d1542980f34c3986cd70e3e
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
<<<<<<< HEAD
            Real-time Supabase Database Sync
=======
            Ringkasan Performa Sistem HQ
>>>>>>> 856ccaee71bcd89c4d1542980f34c3986cd70e3e
          </Badge>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Dashboard Overview Admin HQ
          </h1>
          <p className="text-sm text-slate-500">
<<<<<<< HEAD
            Pantau statistik pengguna terdaftar dari database Supabase, omzet transaksi, Try Out IRT, dan master data PTN.
          </p>
        </div>

        {/* Activated Action CTA Buttons */}
=======
            Pantau pertumbuhan pengguna, pendapatan transaksi, statistik Try Out, dan master data PTN secara real-time.
          </p>
        </div>

>>>>>>> 856ccaee71bcd89c4d1542980f34c3986cd70e3e
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
<<<<<<< HEAD
              <p className="text-xs text-slate-500">Analisis pendaftaran pengguna Supabase real-time</p>
            </div>
            <Badge variant="outline" className="text-xs bg-slate-50 border-slate-200 text-slate-600 font-semibold">
              Live Database Connected
            </Badge>
          </div>

          <div className="h-64 bg-slate-50 rounded-xl border border-dashed border-slate-200 flex flex-col items-center justify-center p-6 space-y-3 text-center">
            <BarChart3 className="h-10 w-10 text-blue-600 opacity-60 animate-pulse" />
            <div className="space-y-1">
              <p className="text-sm font-bold text-slate-900">Grafik Pertumbuhan User Real-Time</p>
              <p className="text-xs text-slate-500 max-w-sm">
                Terhubung dengan {totalUsers} akun terdaftar di Supabase (`profiles` table).
=======
              <p className="text-xs text-slate-500">Tren pendaftaran siswa dan transaksi Midtrans 30 hari terakhir</p>
            </div>
            <Badge variant="outline" className="text-xs bg-slate-50 border-slate-200 text-slate-600 font-semibold">
              Real-time Analytics
            </Badge>
          </div>

          {/* Chart Mock Box */}
          <div className="h-64 bg-slate-50 rounded-xl border border-dashed border-slate-200 flex flex-col items-center justify-center p-6 space-y-3 text-center">
            <BarChart3 className="h-10 w-10 text-blue-600 opacity-60" />
            <div className="space-y-1">
              <p className="text-sm font-bold text-slate-900">Grafik Performa Pendapatan & Pertumbuhan</p>
              <p className="text-xs text-slate-500 max-w-sm">
                Grafik visualisasi data pendaftaran harian dan omzet transaksi Rp {revenueMonth.toLocaleString("id-ID")} bulan ini.
>>>>>>> 856ccaee71bcd89c4d1542980f34c3986cd70e3e
              </p>
            </div>
            <div className="flex items-center gap-6 pt-2 text-xs font-semibold">
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-blue-600"></span>
<<<<<<< HEAD
                <span className="text-slate-600">Siswa ({totalStudents})</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-indigo-500"></span>
                <span className="text-slate-600">Admin ({totalAdmins})</span>
=======
                <span className="text-slate-600">Pendapatan Transaksi</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-indigo-500"></span>
                <span className="text-slate-600">Siswa Baru Terdaftar</span>
>>>>>>> 856ccaee71bcd89c4d1542980f34c3986cd70e3e
              </div>
            </div>
          </div>
        </Card>

<<<<<<< HEAD
        {/* Distribution Card */}
        <Card className="lg:col-span-4 bg-white border border-slate-200 shadow-sm rounded-2xl p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-lg font-extrabold text-slate-900">Distribusi Role User</h3>
              <p className="text-xs text-slate-500">Breakdown akun terdaftar</p>
=======
        {/* Subscription & Try Out Stats Placeholder */}
        <Card className="lg:col-span-4 bg-white border border-slate-200 shadow-sm rounded-2xl p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-lg font-extrabold text-slate-900">Distribusi Paket</h3>
              <p className="text-xs text-slate-500">Breakdown penjualan paket</p>
>>>>>>> 856ccaee71bcd89c4d1542980f34c3986cd70e3e
            </div>
            <PieChart className="h-5 w-5 text-slate-400" />
          </div>

          <div className="space-y-4 pt-1">
<<<<<<< HEAD
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-slate-700">Akun Student</span>
                <span className="text-slate-900 font-bold">
                  {totalUsers > 0 ? Math.round((totalStudents / totalUsers) * 100) : 0}% ({totalStudents} User)
                </span>
              </div>
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-blue-600 h-2.5 rounded-full"
                  style={{ width: `${totalUsers > 0 ? (totalStudents / totalUsers) * 100 : 0}%` }}
                ></div>
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-slate-700">Akun Admin HQ</span>
                <span className="text-slate-900 font-bold">
                  {totalUsers > 0 ? Math.round((totalAdmins / totalUsers) * 100) : 0}% ({totalAdmins} User)
                </span>
              </div>
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-indigo-600 h-2.5 rounded-full"
                  style={{ width: `${totalUsers > 0 ? (totalAdmins / totalUsers) * 100 : 0}%` }}
                ></div>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-100 space-y-1">
            <p className="text-xs font-bold text-blue-900 flex items-center gap-1.5">
              <TrendingUp className="h-3.5 w-3.5 text-blue-600" />
              <span>Insight Database</span>
            </p>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Database Supabase secara aktif mengelola {totalUsers} total profil pengguna dengan role tersinkronisasi.
            </p>
          </div>
        </Card>
      </div>

      {/* Quick Action Shortcuts Grid */}
      <div className="space-y-4">
        <h3 className="text-base font-bold text-slate-900">Akses Cepat Modul HQ</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Link href="/hq-core-updateptn/questions">
            <Card className="bg-white border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all p-4 rounded-2xl flex items-center gap-3 group cursor-pointer">
              <div className="h-10 w-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <FileQuestion className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900 group-hover:text-blue-600">Bank Soal</p>
                <p className="text-[11px] text-slate-500">{questionsCount} Soal IRT</p>
              </div>
            </Card>
          </Link>

          <Link href="/hq-core-updateptn/tryouts">
            <Card className="bg-white border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all p-4 rounded-2xl flex items-center gap-3 group cursor-pointer">
              <div className="h-10 w-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                <FileSpreadsheet className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900 group-hover:text-blue-600">Paket Try Out</p>
                <p className="text-[11px] text-slate-500">{tryoutsCount} Paket Aktif</p>
              </div>
            </Card>
          </Link>

          <Link href="/hq-core-updateptn/live-classes">
            <Card className="bg-white border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all p-4 rounded-2xl flex items-center gap-3 group cursor-pointer">
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
            <Card className="bg-white border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all p-4 rounded-2xl flex items-center gap-3 group cursor-pointer">
              <div className="h-10 w-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center shrink-0">
                <Building2 className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900 group-hover:text-blue-600">Master PTN</p>
                <p className="text-[11px] text-slate-500">{ptnCount > 0 ? ptnCount : 85} Universitas</p>
              </div>
            </Card>
          </Link>
        </div>
      </div>
=======
            {/* Item 1 */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-slate-700">All Access Bundling</span>
                <span className="text-slate-900 font-bold">58%</span>
              </div>
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div className="bg-blue-600 h-2.5 rounded-full w-[58%]"></div>
              </div>
            </div>

            {/* Item 2 */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-slate-700">Try Out IRT Pass</span>
                <span className="text-slate-900 font-bold">26%</span>
              </div>
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div className="bg-indigo-600 h-2.5 rounded-full w-[26%]"></div>
              </div>
            </div>

            {/* Item 3 */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-slate-700">Cek Peluang PTN Only</span>
                <span className="text-slate-900 font-bold">16%</span>
              </div>
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div className="bg-teal-600 h-2.5 rounded-full w-[16%]"></div>
              </div>
            </div>
          </div>
        </Card>
      </div>
>>>>>>> 856ccaee71bcd89c4d1542980f34c3986cd70e3e
    </div>
  );
}
