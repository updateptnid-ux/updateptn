import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { checkAdminAccess } from "@/lib/check-admin";
import { createClient } from "@/lib/supabase/server";
import PendingClaimsWidget from "@/components/admin/PendingClaimsWidget";
import AdminDashboardRealtime from "@/components/admin/AdminDashboardRealtime";
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
  let totalPayments = 0;
  try {
    const { data: paymentsData } = await supabase
      .from("payments")
      .select("amount, status, transaction_status");

    if (paymentsData && paymentsData.length > 0) {
      const isSuccessful = (p: any) =>
        ["settlement", "success", "capture"].includes(p.status) ||
        ["settlement", "capture"].includes(p.transaction_status);

      const successfulPayments = paymentsData.filter(isSuccessful);
      monthlyRevenue = successfulPayments.reduce(
        (sum, row) => sum + (Number(row.amount) || 0),
        0
      );
      totalPayments = successfulPayments.length;
    }
  } catch (err) {
    console.error("Error fetching payments:", err);
    monthlyRevenue = 0;
    totalPayments = 0;
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

      {/* Realtime 8 Metric Widgets & Growth/Role Visualization */}
      <AdminDashboardRealtime
        initialMetrics={{
          totalUsers,
          totalStudents,
          totalAdmins,
          monthlyRevenue,
          totalPayments,
          affiliatesCount,
          activeAffiliates,
          pendingAffiliates,
          pendingWithdrawals,
          totalCommissions,
          tryoutsCount,
          questionsCount,
          ptnCount,
        }}
      />

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
