"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import CrudLayout from "@/components/admin/CrudLayout";
import { Badge } from "@/components/ui/badge";
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
import { MoreHorizontal, Receipt, AlertTriangle, X } from "lucide-react";

interface PaymentRecord {
  id: string;
  order_id: string;
  user_id: string;
  amount: number;
  original_amount: number;
  discount_amount: number;
  voucher_code: string | null;
  status: string; // pending, settlement, cancel, expire, deny
  payment_method: string;
  payment_type: string | null;
  transaction_status: string | null;
  fraud_status: string | null;
  metadata: any;
  created_at: string;
  updated_at: string;
  // Joined data
  user_email?: string;
  user_name?: string;
}

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDemoMode, setIsDemoMode] = useState(false);

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const supabase = createClient();
      
      // Fetch payments
      const { data, error } = await supabase
        .from("payments")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching payments:", error);
        setIsDemoMode(true);
        setPayments([]);
      } else if (data) {
        // Fetch user emails from profiles
        const userIds = [...new Set(data.map((p: any) => p.user_id))];
        const { data: profiles } = await supabase
          .from("profiles")
          .select("id, email, full_name")
          .in("id", userIds);

        const profileMap = new Map(profiles?.map((p: any) => [p.id, p]) || []);

        const enrichedData = data.map((payment: any) => ({
          ...payment,
          user_email: profileMap.get(payment.user_id)?.email || "N/A",
          user_name: profileMap.get(payment.user_id)?.full_name || "Unknown User",
        }));

        setPayments(enrichedData as PaymentRecord[]);
        setIsDemoMode(false);
      }
    } catch (err) {
      console.error(err);
      setIsDemoMode(true);
      setPayments([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (payment: PaymentRecord) => {
    if (!confirm(`Batalkan transaksi ${payment.order_id}?\n\nIni akan membatalkan payment di Midtrans dan menandai status sebagai 'cancel'.`)) {
      return;
    }
    
    try {
      // Call Midtrans cancel API
      const response = await fetch("/api/midtrans/cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order_id: payment.order_id }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Gagal membatalkan transaksi");
      }

      alert("✅ Transaksi berhasil dibatalkan di Midtrans");
      fetchPayments();
    } catch (err) {
      alert("❌ Gagal membatalkan transaksi: " + (err as Error).message);
    }
  };

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
    if (status === "settlement") {
      return (
        <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 font-bold text-[11px] px-2.5">
          SETTLEMENT
        </Badge>
      );
    } else if (status === "pending") {
      return (
        <Badge className="bg-amber-100 text-amber-800 border-amber-200 font-bold text-[11px] px-2.5">
          PENDING
        </Badge>
      );
    } else if (status === "cancel" || status === "expire") {
      return (
        <Badge className="bg-rose-100 text-rose-800 border-rose-200 font-bold text-[11px] px-2.5">
          {status.toUpperCase()}
        </Badge>
      );
    } else if (status === "deny") {
      return (
        <Badge className="bg-red-100 text-red-800 border-red-200 font-bold text-[11px] px-2.5">
          DENIED
        </Badge>
      );
    }
    return (
      <Badge className="bg-slate-100 text-slate-800 border-slate-200 font-bold text-[11px] px-2.5">
        {status.toUpperCase()}
      </Badge>
    );
  };

  return (
    <div className="space-y-4">
      {isDemoMode && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <h4 className="text-xs font-bold text-amber-900">Mode Demonstrasi Aktif</h4>
            <p className="text-[11px] text-amber-700">Tabel payments tidak ditemukan di database Supabase Anda, menggunakan data demo.</p>
          </div>
        </div>
      )}

      <CrudLayout
        title="Transaksi Payment"
        description="Pantau log pembayaran dari Midtrans, status billing, dan laporan keuangan. Payment dibuat otomatis saat user checkout."
        searchPlaceholder="Cari order ID..."
        totalItems={payments.length}
        currentPage={1}
        totalPages={1}
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
                <TableCell colSpan={7} className="text-center py-8 text-xs text-slate-500">Memuat data...</TableCell>
              </TableRow>
            ) : payments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-xs text-slate-500">
                  Belum ada transaksi. Payment akan muncul otomatis saat user melakukan pembelian paket.
                </TableCell>
              </TableRow>
            ) : (
              payments.map((payment) => (
                <TableRow key={payment.id} className="border-slate-100 hover:bg-slate-50/60 transition-colors">
                  <TableCell className="font-mono text-xs font-bold text-slate-900">{payment.order_id}</TableCell>
                  <TableCell className="py-3">
                    <div>
                      <p className="text-sm font-bold text-slate-900 leading-tight">{payment.user_name || "Unknown"}</p>
                      <p className="text-xs text-slate-500">{payment.user_email || "N/A"}</p>
                    </div>
                  </TableCell>
                  <TableCell className="text-xs font-semibold text-slate-600">
                    {payment.payment_type || payment.payment_method || "N/A"}
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="text-xs font-black text-slate-900">{formatRupiah(payment.amount)}</p>
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
                  <TableCell className="text-xs text-slate-500">{formatDate(payment.created_at)}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-xl border border-slate-200 hover:bg-slate-100">
                          <MoreHorizontal className="h-4 w-4 text-slate-600" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-52 bg-white border border-slate-200 rounded-xl p-1 shadow-md">
                        <DropdownMenuLabel className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Opsi</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          onClick={() => {
                            const info = [
                              `Order ID: ${payment.order_id}`,
                              `Status: ${payment.status}`,
                              `Amount: ${formatRupiah(payment.amount)}`,
                              `Original Amount: ${formatRupiah(payment.original_amount)}`,
                              `Discount: ${formatRupiah(payment.discount_amount)}`,
                              `Voucher: ${payment.voucher_code || "None"}`,
                              `Payment Method: ${payment.payment_method}`,
                              `Payment Type: ${payment.payment_type || "N/A"}`,
                              `Transaction Status: ${payment.transaction_status || "N/A"}`,
                              `Fraud Status: ${payment.fraud_status || "N/A"}`,
                            ];
                            alert(info.join("\n"));
                          }} 
                          className="text-xs font-semibold text-slate-700 cursor-pointer rounded-lg gap-2"
                        >
                          <Receipt className="h-3.5 w-3.5 text-blue-600" />
                          <span>Lihat Detail</span>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        {payment.status === "pending" ? (
                          <DropdownMenuItem 
                            onClick={() => handleCancel(payment)} 
                            className="text-xs font-semibold text-rose-600 cursor-pointer rounded-lg gap-2 focus:bg-rose-50"
                          >
                            <X className="h-3.5 w-3.5 text-rose-600" />
                            <span>Batalkan Transaksi</span>
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem disabled className="text-xs text-slate-400 gap-2">
                            <X className="h-3.5 w-3.5" />
                            <span>Hanya pending bisa dibatalkan</span>
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CrudLayout>
    </div>
  );
}
