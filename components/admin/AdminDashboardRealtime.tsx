"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";
import {
  Users,
  UserCheck,
  CreditCard,
  Share2,
  FileSpreadsheet,
  FileQuestion,
  Building2,
  Video,
  ArrowUpRight,
  BarChart3,
  PieChart,
  TrendingUp,
} from "lucide-react";

export interface DashboardMetrics {
  totalUsers: number;
  totalStudents: number;
  totalAdmins: number;
  monthlyRevenue: number;
  totalPayments: number;
  affiliatesCount: number;
  activeAffiliates: number;
  pendingAffiliates: number;
  pendingWithdrawals: number;
  totalCommissions: number;
  tryoutsCount: number;
  questionsCount: number;
  ptnCount: number;
}

interface AdminDashboardRealtimeProps {
  initialMetrics: DashboardMetrics;
}

const formatRupiah = (amount: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(amount);
};

export default function AdminDashboardRealtime({
  initialMetrics,
}: AdminDashboardRealtimeProps) {
  const [metrics, setMetrics] = useState<DashboardMetrics>(initialMetrics);

  const fetchMetrics = async () => {
    try {
      const res = await fetch("/hq-core-updateptn/api/metrics", { cache: "no-store" });
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          setMetrics(json.data);
        }
      }
    } catch (err) {
      console.error("Failed to poll dashboard metrics:", err);
    }
  };

  useEffect(() => {
    // 1. Supabase Realtime Subscription
    const supabase = createClient();
    const channel = supabase
      .channel("admin-dashboard-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "profiles" },
        () => {
          fetchMetrics();
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "payments" },
        () => {
          fetchMetrics();
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "subscriptions" },
        () => {
          fetchMetrics();
        }
      )
      .subscribe();

    // 2. Fallback auto-refresh polling every 5 seconds for instant updates
    const interval = setInterval(() => {
      fetchMetrics();
    }, 5000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(interval);
    };
  }, []);

  const totalUsers = metrics.totalUsers;
  const totalStudents = metrics.totalStudents;
  const totalAdmins = metrics.totalAdmins;

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
      value: metrics.monthlyRevenue > 0 ? formatRupiah(metrics.monthlyRevenue) : "Rp 0",
      change: `${metrics.totalPayments} Transaksi Berhasil`,
      isPositive: true,
      icon: CreditCard,
      color: "text-emerald-600 bg-emerald-50 border-emerald-100",
    },
    {
      title: "Mitra Afiliasi",
      value: metrics.affiliatesCount.toString(),
      change: `${metrics.activeAffiliates} Aktif • ${metrics.pendingAffiliates} Pending`,
      isPositive: true,
      icon: Share2,
      color: "text-purple-600 bg-purple-50 border-purple-100",
    },
    {
      title: "Total Try Out",
      value: metrics.tryoutsCount > 0 ? metrics.tryoutsCount.toString() : "0",
      change: "Paket Aktif",
      isPositive: true,
      icon: FileSpreadsheet,
      color: "text-amber-600 bg-amber-50 border-amber-100",
    },
    {
      title: "Jumlah Soal IRT",
      value: metrics.questionsCount > 0 ? metrics.questionsCount.toString() : "0",
      change: "Bank Soal",
      isPositive: true,
      icon: FileQuestion,
      color: "text-violet-600 bg-violet-50 border-violet-100",
    },
    {
      title: "PTN Terdaftar",
      value: metrics.ptnCount > 0 ? metrics.ptnCount.toString() : "85",
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
    <>
      {/* 8 Summary Metric Widgets Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {summaryWidgets.map((item, idx) => {
          const Icon = item.icon;
          return (
            <Card
              key={idx}
              className="bg-white border border-slate-200 p-5 rounded-2xl shadow-xs space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  {item.title}
                </span>
                <div
                  className={`h-9 w-9 rounded-xl flex items-center justify-center border ${item.color}`}
                >
                  <Icon className="h-5 w-5" />
                </div>
              </div>
              <div>
                <p className="text-2xl font-black text-slate-900 tracking-tight">
                  {item.value}
                </p>
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
              <h3 className="text-lg font-extrabold text-slate-900">
                Pertumbuhan Pengguna
              </h3>
              <p className="text-xs text-slate-500">
                Ringkasan pendaftaran siswa dan aktivitas platform
              </p>
            </div>
          </div>

          <div className="h-64 bg-slate-50 rounded-xl border border-dashed border-slate-200 flex flex-col items-center justify-center p-6 space-y-3 text-center">
            <BarChart3 className="h-10 w-10 text-blue-600 opacity-60" />
            <div className="space-y-1">
              <p className="text-sm font-bold text-slate-900">
                Grafik Pertumbuhan Pengguna
              </p>
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
              <h3 className="text-lg font-extrabold text-slate-900">
                Distribusi Pengguna
              </h3>
              <p className="text-xs text-slate-500">
                Komposisi role akun terdaftar
              </p>
            </div>
            <PieChart className="h-5 w-5 text-slate-400" />
          </div>

          <div className="space-y-4 pt-1">
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-slate-700">Akun Siswa</span>
                <span className="text-slate-900 font-bold">
                  {totalUsers > 0
                    ? Math.round((totalStudents / totalUsers) * 100)
                    : 0}
                  % ({totalStudents})
                </span>
              </div>
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-blue-600 h-2.5 rounded-full transition-all duration-500"
                  style={{
                    width: `${
                      totalUsers > 0
                        ? (totalStudents / totalUsers) * 100
                        : 0
                    }%`,
                  }}
                ></div>
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-slate-700">Akun Admin</span>
                <span className="text-slate-900 font-bold">
                  {totalUsers > 0
                    ? Math.round((totalAdmins / totalUsers) * 100)
                    : 0}
                  % ({totalAdmins})
                </span>
              </div>
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-indigo-600 h-2.5 rounded-full transition-all duration-500"
                  style={{
                    width: `${
                      totalUsers > 0 ? (totalAdmins / totalUsers) * 100 : 0
                    }%`,
                  }}
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
    </>
  );
}
