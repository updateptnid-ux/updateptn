import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { checkAdminAccess } from "@/lib/check-admin";
import { createClient } from "@/lib/supabase/server";
import PendingClaimsWidget from "@/components/admin/PendingClaimsWidget";
import {
  Users,
  UserCheck,
  CreditCard,
  TrendingUp,
  FileSpreadsheet,
  FileQuestion,
  Building2,
  Video,
  Plus,
  ArrowUpRight,
  ShieldCheck,
  PieChart,
  BarChart3,
  Share2,
  DollarSign,
} from "lucide-react";

export default async function AdminDashboardPage() {
  await checkAdminAccess();

  const supabase = await createClient();

  // 1. Fetch user counts from profiles table
  const { count: realTotalUsersCount } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true });

  const { count: realStudentCount } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true })
    .neq("role", "admin");

  const { count: realAdminCount } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true })
    .eq("role", "admin");

  let tryoutsCount = 0;
  try {
    const { count } = await supabase
      .from("tryouts")
      .select("*", { count: "exact", head: true });
    if (count !== null) tryoutsCount = count;
  } catch {
    tryoutsCount = 0;
  }

  let questionsCount = 0;
  try {
    const { count } = await supabase
      .from("questions")
      .select("*", { count: "exact", head: true });
    if (count !== null) questionsCount = count;
  } catch {
    questionsCount = 0;
  }

  let ptnCount = 0;
  try {
    const { count } = await supabase
      .from("prodi_reference")
      .select("*", { count: "exact", head: true });
    if (count !== null) ptnCount = count;
  } catch {
    ptnCount = 0;
  }

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

  // 5. Fetch pending free access claims
  let pendingClaims: any[] = [];
  try {
    const { data: claimsData } = await supabase
      .from("free_access_requests")
      .select("*, tryouts(title)")
      .eq("status", "pending")
      .order("created_at", { ascending: false });

    if (claimsData && claimsData.length > 0) {
      const userIds = [...new Set(claimsData.map((d: any) => d.user_id))];
      const { data: userData } = await supabase
        .from("profiles")
        .select("id, email, full_name")
        .in("id", userIds);
      const userMap: Record<string, string> = {};
      userData?.forEach((u: any) => {
        userMap[u.id] = u.email || u.full_name || u.id;
      });
      pendingClaims = claimsData.map((item: any) => ({
        id: item.id,
        user_id: item.user_id,
        tryout_id: item.tryout_id,
        username_ig: item.username_ig || "-",
        username_tt: item.username_tt || "-",
        proof_url: item.proof_url || "",
        created_at: item.created_at,
        user_email: userMap[item.user_id] || item.user_id,
        tryout_title: item.tryouts?.title || item.tryout_id,
      }));
    }
  } catch {
    pendingClaims = [];
  }

  // 6. Fetch affiliate stats
  let affiliatesCount = 0;
  let pendingAffiliates = 0;
  let activeAffiliates = 0;
  let pendingWithdrawals = 0;
  let totalCommissions = 0;
  try {
    const { count: totalAff } = await supabase
      .from("affiliates")
      .select("*", { count: "exact", head: true });
    affiliatesCount = totalAff || 0;

    const { count: pending } = await supabase
      .from("affiliates")
      .select("*", { count: "exact", head: true })
      .eq("status", "pending");
    pendingAffiliates = pending || 0;

    const { count: active } = await supabase
      .from("affiliates")
      .select("*", { count: "exact", head: true })
      .eq("status", "active");
    activeAffiliates = active || 0;

    const { count: pendingWithdraw } = await supabase
      .from("withdrawals")
      .select("*", { count: "exact", head: true })
      .eq("status", "pending");
    pendingWithdrawals = pendingWithdraw || 0;

    const { data: commissions } = await supabase
      .from("commissions")
      .select("commission_amount")
      .in("status", ["approved", "paid"]);
    totalCommissions = commissions?.reduce((sum, c) => sum + Number(c.commission_amount), 0) || 0;
  } catch {
    // Affiliate tables might not exist yet
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
      title: "Total Pengguna",
      value: totalUsers.toLocaleString("id-ID"),
      change: `${totalStudents} Siswa & ${totalAdmins} Admin`,
      isPositive: true,
      icon: Users,
      color: "text-blue-600 bg-blue-50 border-blue-100",
    },
    {
      title: "Siswa Aktif",
      value: totalStudents.toLocaleString("id-ID"),
      change: "Pejuang PTN",
      isPositive: true,
      icon: UserCheck,
      color: "text-indigo-600 bg-indigo-50 border-indigo-100",
    },
    {
      title: "Pendapatan Transaksi",
      value: monthlyRevenue > 0 ? formatRupiah(monthlyRevenue) : "Rp 0",
      change: "Transaksi Berhasil",
      isPositive: true,
      icon: CreditCard,
      color: "text-emerald-600 bg-emerald-50 border-emerald-100",
    },
    {
      title: "Mitra Afiliasi",
      value: affiliatesCount.toString(),
      change: `${activeAffiliates} Aktif • ${pendingAffiliates} Pending`,
      isPositive: true,
      icon: Share2,
      color: "text-purple-600 bg-purple-50 border-purple-100",
    },
    {
      title: "Total Try Out",
      value: tryoutsCount > 0 ? tryoutsCount.toString() : "0",
      change: "Paket Aktif",
      isPositive: true,
      icon: FileSpreadsheet,
      color: "text-amber-600 bg-amber-50 border-amber-100",
    },
    {
      title: "Jumlah Soal IRT",
      value: questionsCount > 0 ? questionsCount.toString() : "0",
      change: "Bank Soal",
      isPositive: true,
      icon: FileQuestion,
      color: "text-violet-600 bg-violet-50 border-violet-100",
    },
    {
      title: "PTN Terdaftar",
      value: ptnCount > 0 ? ptnCount.toString() : "85",
      change: "Universitas & Prodi",
      isPositive: true,
      icon: Building2,
      color: "text-sky-600 bg-sky-50 border-sky-100",
    },
    {
      title: "Live Class Sesi",
      value: "3 Sesi",
      change: "Jadwal Hari Ini",
      isPositive: true,
      icon: Video,
      color: "text-rose-600 bg-rose-50 border-rose-100",
    },
  ];

  return (
    <div className="space-y-8 font-sans">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Dashboard Admin
          </h1>
          <p className="text-sm text-slate-500">
            Pantau perkembangan pengguna, pendapatan transaksi, paket Try Out, dan master data PTN.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/hq-core-updateptn/questions">
            <Button className="bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl gap-2 shadow-xs text-xs h-10 px-4">
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
            <Card key={idx} className="bg-white border border-slate-200 p-5 rounded-2xl shadow-xs space-y-3">
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

      {/* Analytics Visualization Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Growth Chart */}
        <Card className="lg:col-span-8 bg-white border border-slate-200 shadow-xs rounded-2xl p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-lg font-extrabold text-slate-900">Pertumbuhan Pengguna</h3>
              <p className="text-xs text-slate-500">Ringkasan pendaftaran siswa dan aktivitas platform</p>
            </div>
          </div>

          <div className="h-64 bg-slate-50 rounded-xl border border-dashed border-slate-200 flex flex-col items-center justify-center p-6 space-y-3 text-center">
            <BarChart3 className="h-10 w-10 text-blue-600 opacity-60" />
            <div className="space-y-1">
              <p className="text-sm font-bold text-slate-900">Grafik Pertumbuhan Pengguna</p>
              <p className="text-xs text-slate-500 max-w-sm">
                Visualisasi data {totalUsers} total akun terdaftar di platform.
              </p>
            </div>
            <div className="flex items-center gap-6 pt-2 text-xs font-semibold">
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-blue-600"></span>
                <span className="text-slate-600">Siswa ({totalStudents})</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-indigo-500"></span>
                <span className="text-slate-600">Admin ({totalAdmins})</span>
              </div>
            </div>
          </div>
        </Card>

        {/* Role Distribution Card */}
        <Card className="lg:col-span-4 bg-white border border-slate-200 shadow-xs rounded-2xl p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-lg font-extrabold text-slate-900">Distribusi Pengguna</h3>
              <p className="text-xs text-slate-500">Komposisi role akun terdaftar</p>
            </div>
            <PieChart className="h-5 w-5 text-slate-400" />
          </div>

          <div className="space-y-4 pt-1">
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-slate-700">Akun Siswa</span>
                <span className="text-slate-900 font-bold">
                  {totalUsers > 0 ? Math.round((totalStudents / totalUsers) * 100) : 0}% ({totalStudents})
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
                <span className="text-slate-700">Akun Admin</span>
                <span className="text-slate-900 font-bold">
                  {totalUsers > 0 ? Math.round((totalAdmins / totalUsers) * 100) : 0}% ({totalAdmins})
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
              <span>Ringkasan Akun</span>
            </p>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Total {totalUsers} pengguna terverifikasi telah aktif dalam sistem UpdatePTN.
            </p>
          </div>
        </Card>
      </div>

      {/* Affiliate Management Section */}
      {(pendingAffiliates > 0 || pendingWithdrawals > 0 || affiliatesCount > 0) && (
        <Card className="bg-gradient-to-br from-purple-50 to-purple-100/50 border border-purple-200 shadow-xs rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                <Share2 className="h-5 w-5 text-purple-600" />
                <span>Program Afiliasi</span>
              </h3>
              <p className="text-xs text-slate-600">Kelola mitra afiliasi, komisi, dan penarikan</p>
            </div>
            <Link href="/hq-core-updateptn/affiliates">
              <Button className="bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs h-9 px-4">
                Kelola Semua
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl p-4 border border-purple-100">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-400">TOTAL MITRA</span>
                <Users className="h-4 w-4 text-purple-600" />
              </div>
              <p className="text-2xl font-black text-slate-900">{affiliatesCount}</p>
              <p className="text-xs text-slate-600 mt-1">
                {activeAffiliates} aktif • {pendingAffiliates} pending
              </p>
            </div>

            <div className="bg-white rounded-xl p-4 border border-amber-100">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-400">PERLU REVIEW</span>
                <Badge className="bg-amber-100 text-amber-700 text-xs">
                  {pendingAffiliates}
                </Badge>
              </div>
              <p className="text-lg font-black text-slate-900">
                {pendingAffiliates} Aplikasi
              </p>
              <Link href="/hq-core-updateptn/affiliates">
                <p className="text-xs text-amber-600 hover:text-amber-700 font-semibold mt-1">
                  Tinjau sekarang →
                </p>
              </Link>
            </div>

            <div className="bg-white rounded-xl p-4 border border-emerald-100">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-400">PENARIKAN</span>
                <DollarSign className="h-4 w-4 text-emerald-600" />
              </div>
              <p className="text-lg font-black text-slate-900">
                {pendingWithdrawals} Pending
              </p>
              {pendingWithdrawals > 0 && (
                <Link href="/hq-core-updateptn/affiliates">
                  <p className="text-xs text-emerald-600 hover:text-emerald-700 font-semibold mt-1">
                    Proses penarikan →
                  </p>
                </Link>
              )}
            </div>

            <div className="bg-white rounded-xl p-4 border border-blue-100">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-400">TOTAL KOMISI</span>
                <DollarSign className="h-4 w-4 text-blue-600" />
              </div>
              <p className="text-lg font-black text-slate-900">
                {formatRupiah(totalCommissions)}
              </p>
              <p className="text-xs text-slate-600 mt-1">Dibayarkan ke mitra</p>
            </div>
          </div>
        </Card>
      )}

      {/* Quick Action Shortcuts Grid */}
      <div className="space-y-4">
        <h3 className="text-base font-bold text-slate-900">Akses Cepat Modul Admin</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Link href="/hq-core-updateptn/questions">
            <Card className="bg-white border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all p-4 rounded-2xl flex items-center gap-3 group cursor-pointer">
              <div className="h-10 w-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <FileQuestion className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900 group-hover:text-blue-600">Bank Soal</p>
                <p className="text-[11px] text-slate-500">{questionsCount} Soal</p>
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
                <p className="text-[11px] text-slate-500">{tryoutsCount} Paket</p>
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
                <p className="text-[11px] text-slate-500">{ptnCount > 0 ? ptnCount : 85} PTN</p>
              </div>
            </Card>
          </Link>

          <Link href="/hq-core-updateptn/affiliates">
            <Card className="bg-white border border-slate-200 hover:border-purple-300 hover:shadow-md transition-all p-4 rounded-2xl flex items-center gap-3 group cursor-pointer">
              <div className="h-10 w-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                <Share2 className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900 group-hover:text-purple-600">Afiliasi</p>
                <p className="text-[11px] text-slate-500">{affiliatesCount} Mitra</p>
              </div>
            </Card>
          </Link>
        </div>
      </div>

      {/* Pending Free Claims Section */}
      <PendingClaimsWidget initialClaims={pendingClaims} />
    </div>
  );
}
