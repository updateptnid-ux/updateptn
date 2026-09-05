"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  CreditCard,
  Receipt,
  AlertCircle,
  RefreshCw
} from "lucide-react";
import Link from "next/link";
import { getPendingPayments, getPaymentHistory, cancelPendingPayment } from "@/actions/payment-history";
import { createSubscriptionPayment } from "@/actions/payment-midtrans";
import { toast } from "sonner";

declare global {
  interface Window {
    snap: any;
  }
}

interface Payment {
  id: string;
  order_id: string;
  invoice_no?: string;
  amount: number;
  original_amount: number;
  discount_amount: number;
  voucher_code?: string;
  method: string;
  status: string;
  metadata?: {
    tier: string;
    duration: string;
    user_name: string;
    user_email: string;
    subscription_id: string;
  };
  created_at: string;
  updated_at: string;
}

export default function PaymentsClient() {
  const router = useRouter();
  const [pendingPayments, setPendingPayments] = useState<Payment[]>([]);
  const [allPayments, setAllPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [snapLoaded, setSnapLoaded] = useState(false);
  const [activeTab, setActiveTab] = useState<'pending' | 'history'>('pending');

  useEffect(() => {
    loadPayments();
    loadSnapScript();
  }, []);

  const loadSnapScript = () => {
    const script = document.createElement('script');
    const isProduction = process.env.NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION === 'true';
    
    script.src = isProduction
      ? 'https://app.midtrans.com/snap/snap.js'
      : 'https://app.sandbox.midtrans.com/snap/snap.js';
    
    script.setAttribute('data-client-key', process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || '');
    
    script.onload = () => {
      console.log('✅ Midtrans Snap loaded');
      setSnapLoaded(true);
    };
    
    script.onerror = () => {
      console.error('❌ Failed to load Midtrans Snap');
      toast.error('Gagal memuat sistem pembayaran');
    };
    
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  };

  const loadPayments = async () => {
    setLoading(true);
    
    const [pendingResult, historyResult] = await Promise.all([
      getPendingPayments(),
      getPaymentHistory()
    ]);

    if (pendingResult.success) {
      setPendingPayments(pendingResult.data as Payment[]);
    }

    if (historyResult.success) {
      setAllPayments(historyResult.data as Payment[]);
    }

    setLoading(false);
  };

  const handleResumePayment = async (payment: Payment) => {
    if (!snapLoaded) {
      toast.error('Sistem pembayaran belum siap');
      return;
    }

    setProcessingId(payment.order_id);

    try {
      // Create new payment with same details
      const metadata = payment.metadata;
      if (!metadata) {
        toast.error('Data pembayaran tidak lengkap');
        setProcessingId(null);
        return;
      }

      const result = await createSubscriptionPayment({
        tier: metadata.tier,
        duration: metadata.duration,
        price: payment.original_amount,
        voucherCode: payment.voucher_code,
      });

      if (!result.success || !result.data) {
        toast.error(result.error || 'Gagal melanjutkan pembayaran');
        setProcessingId(null);
        return;
      }

      // Cancel old payment
      await cancelPendingPayment(payment.order_id);

      // Open Snap modal with new token
      window.snap.pay(result.data.token, {
        onSuccess: function(result: any) {
          console.log('✅ Payment success:', result);
          toast.success('Pembayaran berhasil!');
          loadPayments();
          setProcessingId(null);
        },
        onPending: function(result: any) {
          console.log('⏳ Payment pending:', result);
          toast.info('Pembayaran menunggu konfirmasi');
          loadPayments();
          setProcessingId(null);
        },
        onError: function(result: any) {
          console.error('❌ Payment error:', result);
          toast.error('Pembayaran gagal');
          setProcessingId(null);
        },
        onClose: function() {
          console.log('🚪 Payment modal closed');
          setProcessingId(null);
        }
      });
    } catch (error) {
      console.error('❌ Resume payment error:', error);
      toast.error('Terjadi kesalahan');
      setProcessingId(null);
    }
  };

  const handleCancelPayment = async (orderId: string) => {
    const confirmed = window.confirm(
      '⚠️ Batalkan Pembayaran?\n\n' +
      'Pembayaran ini akan dibatalkan secara permanen. ' +
      'Anda perlu membuat pesanan baru jika ingin berlangganan.\n\n' +
      'Lanjutkan?'
    );
    
    if (!confirmed) {
      return;
    }

    setProcessingId(orderId);

    try {
      const result = await cancelPendingPayment(orderId);

      if (result.success) {
        toast.success('Pembayaran berhasil dibatalkan');
        // Optimistically remove from pending list
        setPendingPayments(prev => prev.filter(p => p.order_id !== orderId));
        // Refresh payments to update history tab
        loadPayments();
      } else {
        toast.error(result.error || 'Gagal membatalkan pembayaran');
      }
    } catch (error) {
      console.error('Cancel error:', error);
      toast.error('Terjadi kesalahan');
    } finally {
      setProcessingId(null);
    }
  };

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    }).format(date);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge className="bg-amber-100 text-amber-700 border-amber-200"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
      case 'success':
      case 'settlement':
        return <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200"><CheckCircle2 className="h-3 w-3 mr-1" />Berhasil</Badge>;
      case 'failed':
      case 'cancelled':
      case 'deny':
      case 'expire':
        return <Badge className="bg-red-100 text-red-700 border-red-200"><XCircle className="h-3 w-3 mr-1" />Gagal</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="w-full min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-2" />
          <p className="text-sm text-slate-600">Memuat riwayat pembayaran...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-slate-50">
      <div className="max-w-4xl mx-auto p-3 md:p-4 space-y-3 md:space-y-4">
        {/* Header */}
        <Card className="bg-white p-3 md:p-4 rounded-lg md:rounded-xl shadow-sm">
          <div className="flex items-center gap-2 mb-3 md:mb-4">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => router.back()}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-base md:text-xl font-bold text-slate-900">Riwayat Pembayaran</h1>
              <p className="text-[10px] md:text-xs text-slate-600">Kelola pembayaran Anda</p>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2">
            <Button
              variant={activeTab === 'pending' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveTab('pending')}
              className="flex-1 h-8 md:h-9 text-xs md:text-sm"
            >
              <Clock className="h-3 w-3 md:h-4 md:w-4 mr-1" />
              Pending ({pendingPayments.length})
            </Button>
            <Button
              variant={activeTab === 'history' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveTab('history')}
              className="flex-1 h-8 md:h-9 text-xs md:text-sm"
            >
              <Receipt className="h-3 w-3 md:h-4 md:w-4 mr-1" />
              Semua ({allPayments.length})
            </Button>
          </div>
        </Card>

        {/* Pending Payments */}
        {activeTab === 'pending' && (
          <>
            {pendingPayments.length === 0 ? (
              <Card className="bg-white p-6 md:p-8 text-center rounded-lg md:rounded-xl">
                <AlertCircle className="h-10 w-10 md:h-12 md:w-12 text-slate-400 mx-auto mb-3" />
                <h3 className="text-sm md:text-base font-bold text-slate-900 mb-2">Tidak Ada Pembayaran Pending</h3>
                <p className="text-xs md:text-sm text-slate-600 mb-4">
                  Semua pembayaran Anda sudah selesai atau dibatalkan
                </p>
                <Link href="/pricing">
                  <Button className="h-9 md:h-10 text-xs md:text-sm">
                    Lihat Paket
                  </Button>
                </Link>
              </Card>
            ) : (
              <div className="space-y-3">
                {pendingPayments.map((payment) => (
                  <Card key={payment.id} className="bg-white p-3 md:p-4 rounded-lg md:rounded-xl">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <CreditCard className="h-4 w-4 text-blue-600" />
                          <h3 className="text-sm md:text-base font-bold text-slate-900">
                            {payment.metadata?.tier || 'Paket Premium'}
                          </h3>
                        </div>
                        <p className="text-[10px] md:text-xs text-slate-600">
                          {payment.metadata?.duration || '1 bulan'}
                        </p>
                      </div>
                      {getStatusBadge(payment.status)}
                    </div>

                    <div className="space-y-2 mb-3">
                      <div className="flex justify-between text-xs md:text-sm">
                        <span className="text-slate-600">Order ID</span>
                        <span className="font-mono text-slate-900">{payment.order_id}</span>
                      </div>
                      <div className="flex justify-between text-xs md:text-sm">
                        <span className="text-slate-600">Dibuat</span>
                        <span className="text-slate-900">{formatDate(payment.created_at)}</span>
                      </div>
                      <div className="flex justify-between text-sm md:text-base font-bold">
                        <span className="text-slate-900">Total</span>
                        <span className="text-blue-600">{formatPrice(payment.amount)}</span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleResumePayment(payment)}
                        disabled={processingId === payment.order_id || !snapLoaded}
                        className="flex-1 h-9 md:h-10 text-xs md:text-sm bg-blue-600 hover:bg-blue-700"
                      >
                        {processingId === payment.order_id ? 'Memproses...' : 'Lanjutkan Bayar'}
                      </Button>
                      <Button
                        onClick={() => handleCancelPayment(payment.order_id)}
                        disabled={processingId === payment.order_id}
                        variant="outline"
                        className="h-9 md:h-10 px-3 text-xs md:text-sm"
                      >
                        Batalkan
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </>
        )}

        {/* All Payments History */}
        {activeTab === 'history' && (
          <>
            {allPayments.length === 0 ? (
              <Card className="bg-white p-6 md:p-8 text-center rounded-lg md:rounded-xl">
                <Receipt className="h-10 w-10 md:h-12 md:w-12 text-slate-400 mx-auto mb-3" />
                <h3 className="text-sm md:text-base font-bold text-slate-900 mb-2">Belum Ada Riwayat</h3>
                <p className="text-xs md:text-sm text-slate-600">
                  Anda belum pernah melakukan pembayaran
                </p>
              </Card>
            ) : (
              <div className="space-y-3">
                {allPayments.map((payment) => (
                  <Card key={payment.id} className="bg-white p-3 md:p-4 rounded-lg md:rounded-xl">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Receipt className="h-4 w-4 text-slate-600" />
                          <h3 className="text-sm md:text-base font-bold text-slate-900">
                            {payment.metadata?.tier || 'Paket Premium'}
                          </h3>
                        </div>
                        <p className="text-[10px] md:text-xs text-slate-600">
                          {formatDate(payment.created_at)}
                        </p>
                      </div>
                      {getStatusBadge(payment.status)}
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-xs md:text-sm">
                        <span className="text-slate-600">Order ID</span>
                        <span className="font-mono text-slate-900 text-[10px] md:text-xs">{payment.order_id}</span>
                      </div>
                      <div className="flex justify-between text-sm md:text-base font-bold">
                        <span className="text-slate-900">Total</span>
                        <span className={payment.status === 'success' || payment.status === 'settlement' ? 'text-emerald-600' : 'text-slate-900'}>
                          {formatPrice(payment.amount)}
                        </span>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
