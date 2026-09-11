"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import CrudLayout from "@/components/admin/CrudLayout";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import {
  MoreHorizontal,
  Receipt,
  AlertTriangle,
  X,
  DollarSign,
  CreditCard,
  TrendingUp,
  Users,
  Trash2,
  RefreshCw,
  Loader2,
} from "lucide-react";
import { toast, Toaster } from "sonner";

interface PaymentRecord {
  id: string;
  order_id: string;
  user_id: string;
  amount: number;
  original_amount: number;
  discount_amount: number;
  voucher_code: string | null;
  status: string; // pending, settlement, cancel, cancelled, expire, deny
  payment_method: string;
  payment_type: string | null;
  transaction_status: string | null;
  fraud_status: string | null;
  metadata: any;
  created_at: string;
  updated_at: string;
  // Joined profile fields
  user_email?: string;
  user_name?: string;
}

export default function AdminPaymentsPage() {
  const router = useRouter();
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDemoMode, setIsDemoMode] = useState(false);

  // Statistics
  const [stats, setStats] = useState({
    totalRevenue: 0,
    pendingRevenue: 0,
    successfulTransactions: 0,
    pendingTransactions: 0,
  });

  // Calculate statistics from payments array
  const calculateStats = useCallback((data: PaymentRecord[]) => {
    const isSuccessful = (p: PaymentRecord) => {
      const s = (p.status || "").toLowerCase();
      const ts = (p.transaction_status || "").toLowerCase();
      return (
        ["settlement", "success", "capture"].includes(s) ||
        ["settlement", "capture"].includes(ts)
      );
    };

    const isPending = (p: PaymentRecord) => {
      const s = (p.status || "").toLowerCase();
      return s === "pending" && !isSuccessful(p);
    };

    const totalRevenue = data
      .filter(isSuccessful)
      .reduce((sum, p) => sum + Number(p.amount || 0), 0);

    const pendingRevenue = data
      .filter(isPending)
      .reduce((sum, p) => sum + Number(p.amount || 0), 0);

    const successfulTransactions = data.filter(isSuccessful).length;
    const pendingTransactions = data.filter(isPending).length;

    setStats({
      totalRevenue,
      pendingRevenue,
      successfulTransactions,
      pendingTransactions,
    });
  }, []);

  /**
   * Fetch payments from dedicated admin API (service role powered)
   * with fallback to client-side Supabase query
   */
  const fetchPayments = useCallback(async (isSilent = false) => {
    try {
      if (!isSilent) {
        setLoading(true);
      } else {
        setIsRefreshing(true);
      }

      // 1. Try server-side admin API endpoint first (uses SUPABASE_SERVICE_ROLE_KEY to bypass RLS)
      // Use timestamp query & no-cache headers to prevent browser from returning stale cached response
      const res = await fetch(`/hq-core-updateptn/api/payments?t=${Date.now()}`, {
        cache: "no-store",
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate",
          Pragma: "no-cache",
        },
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          setPayments(json.data);
          calculateStats(json.data);
          setIsDemoMode(false);
          return;
        }
      }

      // 2. Fallback: Direct Supabase client query
      const supabase = createClient();
      const { data, error } = await supabase
        .from("payments")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching payments via client:", error);
        setIsDemoMode(true);
      } else if (data) {
        const userIds = [...new Set(data.map((p: any) => p.user_id).filter(Boolean))];
        let profileMap = new Map();

        if (userIds.length > 0) {
          const { data: profiles } = await supabase
            .from("profiles")
            .select("id, email, full_name")
            .in("id", userIds);

          profileMap = new Map(profiles?.map((p: any) => [p.id, p]) || []);
        }

        const enrichedData: PaymentRecord[] = data.map((payment: any) => ({
          ...payment,
          user_email: profileMap.get(payment.user_id)?.email || "N/A",
          user_name: profileMap.get(payment.user_id)?.full_name || "Unknown User",
        }));

        setPayments(enrichedData);
        calculateStats(enrichedData);
        setIsDemoMode(false);
      }
    } catch (err) {
      console.error("Exception fetching payments:", err);
      setIsDemoMode(true);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, [calculateStats]);

  useEffect(() => {
    fetchPayments();

    // Setup Supabase Realtime Subscription for automatic updates
    const supabase = createClient();
    const channel = supabase
      .channel("admin-payments-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "payments" },
        (payload) => {
          if (payload.eventType === "DELETE") {
            const oldId = (payload.old as any)?.order_id || (payload.old as any)?.id;
            if (oldId) {
              setPayments((prev) => prev.filter((p) => p.order_id !== oldId && p.id !== oldId));
            }
          } else if (payload.eventType === "UPDATE") {
            const newRecord = payload.new as any;
            if (newRecord?.order_id) {
              setPayments((prev) =>
                prev.map((p) =>
                  p.order_id === newRecord.order_id ? { ...p, ...newRecord } : p
                )
              );
            }
          }
          // Silent background sync
          fetchPayments(true);
        }
      )
      .subscribe();

    // Fallback polling every 10 seconds
    const interval = setInterval(() => {
      fetchPayments(true);
    }, 10000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(interval);
    };
  }, [fetchPayments]);

  /**
   * Optimistic Cancel Handler
   * Instantly updates UI to cancelled status and adjusts statistics without page reload.
   * Rolls back if backend request fails.
   */
  const handleCancel = async (payment: PaymentRecord) => {
    if (
      !confirm(
        `Batalkan transaksi ${payment.order_id}?\n\nStatus akan langsung diubah menjadi 'CANCEL' dan pemesanan di Midtrans dibatalkan.`
      )
    ) {
      return;
    }

    const orderId = payment.order_id;
    setProcessingId(orderId);

    // 1. Snapshot previous state for rollback
    const prevPayments = [...payments];
    const prevStats = { ...stats };

    // 2. Optimistic UI update: Immediately mark status as 'cancelled'
    const updatedPayments = payments.map((p) =>
      p.order_id === orderId
        ? {
            ...p,
            status: "cancelled",
            transaction_status: "cancel",
            updated_at: new Date().toISOString(),
          }
        : p
    );
    setPayments(updatedPayments);

    // Optimistically update pending stats
    if (payment.status === "pending") {
      setStats((prev) => ({
        ...prev,
        pendingTransactions: Math.max(0, prev.pendingTransactions - 1),
        pendingRevenue: Math.max(0, prev.pendingRevenue - Number(payment.amount || 0)),
      }));
    }

    toast.loading(`Membatalkan transaksi ${orderId}...`, { id: `cancel-${orderId}` });

    try {
      // 3. Call backend endpoint
      const response = await fetch("/hq-core-updateptn/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order_id: orderId, action: "cancel" }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Gagal membatalkan transaksi di server");
      }

      toast.success(`Transaksi ${orderId} berhasil dibatalkan!`, {
        id: `cancel-${orderId}`,
      });

      router.refresh();

      // Background re-sync after brief commit buffer
      setTimeout(() => {
        fetchPayments(true);
      }, 300);
    } catch (err: any) {
      // 5. Rollback on failure
      setPayments(prevPayments);
      setStats(prevStats);
      toast.error(`Gagal membatalkan transaksi: ${err.message}`, {
        id: `cancel-${orderId}`,
      });
    } finally {
      setProcessingId(null);
    }
  };

  /**
   * Optimistic Delete Handler
   * Instantly removes the transaction row from UI and deletes permanently from database.
   * Rolls back if request fails.
   */
  const handleDelete = async (payment: PaymentRecord) => {
    if (
      !confirm(
        `HAPUS PERMANEN transaksi ${payment.order_id}?\n\nPerhatian: Baris ini akan langsung dihapus dari database beserta relasi komisi/langganan terkait.`
      )
    ) {
      return;
    }

    const orderId = payment.order_id;
    setProcessingId(orderId);

    // 1. Snapshot previous state
    const prevPayments = [...payments];
    const prevStats = { ...stats };

    // 2. Optimistic UI update: Immediately remove row
    const filteredPayments = payments.filter((p) => p.order_id !== orderId);
    setPayments(filteredPayments);
    calculateStats(filteredPayments);

    toast.loading(`Menghapus transaksi ${orderId}...`, { id: `delete-${orderId}` });

    try {
      const response = await fetch("/hq-core-updateptn/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order_id: orderId, action: "delete" }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Gagal menghapus transaksi dari database");
      }

      toast.success(`Transaksi ${orderId} berhasil dihapus permanen!`, {
        id: `delete-${orderId}`,
      });

      router.refresh();

      setTimeout(() => {
        fetchPayments(true);
      }, 300);
    } catch (err: any) {
      // Rollback
      setPayments(prevPayments);
      setStats(prevStats);
      toast.error(`Gagal menghapus transaksi: ${err.message}`, {
        id: `delete-${orderId}`,
      });
    } finally {
      setProcessingId(null);
    }
  };

  // Filter payments based on search input
  const filteredPayments = useMemo(() => {
    if (!searchQuery.trim()) return payments;
    const q = searchQuery.toLowerCase().trim();
    return payments.filter(
      (p) =>
        p.order_id?.toLowerCase().includes(q) ||
        p.user_email?.toLowerCase().includes(q) ||
        p.user_name?.toLowerCase().includes(q) ||
        p.status?.toLowerCase().includes(q) ||
        p.payment_method?.toLowerCase().includes(q)
    );
  }, [payments, searchQuery]);

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateStr;
    }
  };

  const formatRupiah = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    const s = (status || "").toLowerCase();
    if (s === "settlement" || s === "success" || s === "capture") {
      return (
        <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 font-bold text-[11px] px-2.5">
          SETTLEMENT
        </Badge>
      );
    } else if (s === "pending") {
      return (
        <Badge className="bg-amber-100 text-amber-800 border-amber-200 font-bold text-[11px] px-2.5">
          PENDING
        </Badge>
      );
    } else if (
      s === "cancel" ||
      s === "cancelled" ||
      s === "canceled" ||
      s === "expire" ||
      s === "expired" ||
      s === "failed"
    ) {
      const label = s === "failed" ? "FAILED" : s.includes("expire") ? "EXPIRED" : "CANCELLED";
      return (
        <Badge className="bg-rose-100 text-rose-800 border-rose-200 font-bold text-[11px] px-2.5">
          {label}
        </Badge>
      );
    } else if (s === "deny") {
      return (
        <Badge className="bg-red-100 text-red-800 border-red-200 font-bold text-[11px] px-2.5">
          DENIED
        </Badge>
      );
    }
    return (
      <Badge className="bg-slate-100 text-slate-800 border-slate-200 font-bold text-[11px] px-2.5">
        {(status || "UNKNOWN").toUpperCase()}
      </Badge>
    );
  };

  return (
    <div className="space-y-4">
      <Toaster richColors position="top-right" />

      {isDemoMode && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <h4 className="text-xs font-bold text-amber-900">Perhatian Izin Database (RLS)</h4>
            <p className="text-[11px] text-amber-700">
              Jalankan migrasi RLS policies di Supabase SQL Editor agar akun admin dapat mengakses dan memodifikasi semua data pembayaran.
            </p>
          </div>
        </div>
      )}

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4 bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-emerald-700">TOTAL PEMASUKAN</span>
            <DollarSign className="h-5 w-5 text-emerald-600" />
          </div>
          <p className="text-2xl font-black text-emerald-900">
            {formatRupiah(stats.totalRevenue)}
          </p>
          <p className="text-xs text-emerald-600 mt-1">
            Dari transaksi berhasil (settlement)
          </p>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-amber-700">PENDING</span>
            <CreditCard className="h-5 w-5 text-amber-600" />
          </div>
          <p className="text-2xl font-black text-amber-900">
            {formatRupiah(stats.pendingRevenue)}
          </p>
          <p className="text-xs text-amber-600 mt-1">
            Menunggu pembayaran ({stats.pendingTransactions} transaksi)
          </p>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-blue-700">TRANSAKSI SUKSES</span>
            <TrendingUp className="h-5 w-5 text-blue-600" />
          </div>
          <p className="text-2xl font-black text-blue-900">
            {stats.successfulTransactions}
          </p>
          <p className="text-xs text-blue-600 mt-1">
            Total transaksi berhasil
          </p>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-purple-700">AVG. TRANSAKSI</span>
            <Users className="h-5 w-5 text-purple-600" />
          </div>
          <p className="text-2xl font-black text-purple-900">
            {stats.successfulTransactions > 0
              ? formatRupiah(Math.round(stats.totalRevenue / stats.successfulTransactions))
              : formatRupiah(0)}
          </p>
          <p className="text-xs text-purple-600 mt-1">
            Rata-rata per transaksi
          </p>
        </Card>
      </div>

      <CrudLayout
        title="Transaksi Payment"
        description="Pantau log pembayaran dari Midtrans, status billing, dan kelola pembatalan transaksi secara real-time."
        searchPlaceholder="Cari order ID, nama, atau email siswa..."
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        totalItems={filteredPayments.length}
        currentPage={1}
        totalPages={1}
        filterComponent={
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchPayments(true)}
            disabled={isRefreshing || loading}
            className="rounded-xl border-slate-200 text-xs font-semibold gap-2 h-9"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? "animate-spin text-blue-600" : "text-slate-600"}`} />
            <span>{isRefreshing ? "Menyinkron..." : "Segarkan"}</span>
          </Button>
        }
      >
        <Table>
          <TableHeader>
            <TableRow className="border-slate-200 bg-slate-50/50">
              <TableHead className="font-bold text-slate-700">Order ID</TableHead>
              <TableHead className="font-bold text-slate-700">Siswa</TableHead>
              <TableHead className="font-bold text-slate-700">Metode</TableHead>
              <TableHead className="font-bold text-slate-700">Total Nominal</TableHead>
              <TableHead className="font-bold text-slate-700">Status</TableHead>
              <TableHead className="font-bold text-slate-700">Waktu Transaksi</TableHead>
              <TableHead className="font-bold text-slate-700 text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-12 text-xs text-slate-500">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                    <span>Memuat data transaksi...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : filteredPayments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-10 text-xs text-slate-500">
                  {searchQuery
                    ? `Tidak ada transaksi yang cocok dengan "${searchQuery}"`
                    : "Belum ada transaksi tercatat di database."}
                </TableCell>
              </TableRow>
            ) : (
              filteredPayments.map((payment) => {
                const isProcessing = processingId === payment.order_id;
                const isPending = (payment.status || "").toLowerCase() === "pending";

                return (
                  <TableRow
                    key={payment.id || payment.order_id}
                    className={`border-slate-100 hover:bg-slate-50/60 transition-colors ${
                      isProcessing ? "opacity-60 pointer-events-none" : ""
                    }`}
                  >
                    <TableCell className="font-mono text-xs font-bold text-slate-900">
                      {payment.order_id}
                    </TableCell>
                    <TableCell className="py-3">
                      <div>
                        <p className="text-sm font-bold text-slate-900 leading-tight">
                          {payment.user_name || "Unknown"}
                        </p>
                        <p className="text-xs text-slate-500">{payment.user_email || "N/A"}</p>
                      </div>
                    </TableCell>
                    <TableCell className="text-xs font-semibold text-slate-600">
                      {payment.payment_type || payment.payment_method || "N/A"}
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="text-xs font-black text-slate-900">
                          {formatRupiah(payment.amount)}
                        </p>
                        {payment.discount_amount > 0 && (
                          <p className="text-[10px] text-emerald-600 font-semibold">
                            Diskon: {formatRupiah(payment.discount_amount)}
                          </p>
                        )}
                        {payment.voucher_code && (
                          <p className="text-[10px] text-blue-600 font-semibold">
                            Voucher: {payment.voucher_code}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(payment.status)}</TableCell>
                    <TableCell className="text-xs text-slate-500">
                      {formatDate(payment.created_at)}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            disabled={isProcessing}
                            className="h-8 w-8 rounded-xl border border-slate-200 hover:bg-slate-100"
                          >
                            {isProcessing ? (
                              <Loader2 className="h-4 w-4 animate-spin text-slate-600" />
                            ) : (
                              <MoreHorizontal className="h-4 w-4 text-slate-600" />
                            )}
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                          align="end"
                          className="w-56 bg-white border border-slate-200 rounded-xl p-1 shadow-md"
                        >
                          <DropdownMenuLabel className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                            Opsi Transaksi
                          </DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          
                          {/* Detail Info */}
                          <DropdownMenuItem
                            onClick={() => {
                              const info = [
                                `Order ID: ${payment.order_id}`,
                                `Siswa: ${payment.user_name} (${payment.user_email})`,
                                `Status: ${payment.status}`,
                                `Total Amount: ${formatRupiah(payment.amount)}`,
                                `Original Amount: ${formatRupiah(payment.original_amount || payment.amount)}`,
                                `Discount: ${formatRupiah(payment.discount_amount || 0)}`,
                                `Voucher: ${payment.voucher_code || "None"}`,
                                `Payment Method: ${payment.payment_method || "N/A"}`,
                                `Payment Type: ${payment.payment_type || "N/A"}`,
                                `Transaction Status: ${payment.transaction_status || "N/A"}`,
                                `Waktu: ${formatDate(payment.created_at)}`,
                              ];
                              alert(info.join("\n"));
                            }}
                            className="text-xs font-semibold text-slate-700 cursor-pointer rounded-lg gap-2"
                          >
                            <Receipt className="h-3.5 w-3.5 text-blue-600" />
                            <span>Lihat Detail</span>
                          </DropdownMenuItem>

                          <DropdownMenuSeparator />

                          {/* Cancel Action */}
                          {isPending ? (
                            <DropdownMenuItem
                              onClick={() => handleCancel(payment)}
                              className="text-xs font-semibold text-amber-600 cursor-pointer rounded-lg gap-2 focus:bg-amber-50"
                            >
                              <X className="h-3.5 w-3.5 text-amber-600" />
                              <span>Batalkan Transaksi</span>
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem
                              disabled
                              className="text-xs text-slate-400 gap-2 cursor-not-allowed"
                            >
                              <X className="h-3.5 w-3.5" />
                              <span>Hanya pending bisa dibatalkan</span>
                            </DropdownMenuItem>
                          )}

                          {/* Permanent Delete Action */}
                          <DropdownMenuItem
                            onClick={() => handleDelete(payment)}
                            className="text-xs font-semibold text-rose-600 cursor-pointer rounded-lg gap-2 focus:bg-rose-50"
                          >
                            <Trash2 className="h-3.5 w-3.5 text-rose-600" />
                            <span>Hapus Transaksi Permanen</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </CrudLayout>
    </div>
  );
}
