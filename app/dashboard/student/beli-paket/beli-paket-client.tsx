"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { createSubscriptionPayment } from "@/actions/payment-midtrans";
import { toast } from "sonner";

export default function BeliPaketClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const tierParam = searchParams.get("tier") || "Premium SNBT";
  const durationParam = searchParams.get("duration") || "1 bulan";
  const priceParam = parseInt(searchParams.get("price") || "79000");
  
  // Package info for display
  const selectedPlan = {
    tier: tierParam,
    duration: durationParam,
    price: priceParam,
    name: tierParam,
  };
  
  const [step, setStep] = useState<"payment" | "confirmation">("payment");
  const [loading, setLoading] = useState(false);
  const [snapLoaded, setSnapLoaded] = useState(false);
  const [voucherCode, setVoucherCode] = useState("");
  const [voucherApplied, setVoucherApplied] = useState(false);
  const [discount, setDiscount] = useState(0);
  const [checkingVoucher, setCheckingVoucher] = useState(false);

  // Load Midtrans Snap script
  useEffect(() => {
    const script = document.createElement('script');
    const isProduction = process.env.NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION === 'true';
    
    script.src = isProduction
      ? 'https://app.midtrans.com/snap/snap.js'
      : 'https://app.sandbox.midtrans.com/snap/snap.js';
    
    script.setAttribute('data-client-key', process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || '');
    
    script.onload = () => {
      console.log('Midtrans Snap loaded successfully');
      setSnapLoaded(true);
    };
    
    script.onerror = () => {
      console.error('Failed to load Midtrans Snap');
      toast.error('Gagal memuat sistem pembayaran');
    };
    
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  // Check voucher/affiliate code using server action
  async function checkVoucher() {
    if (!voucherCode.trim()) {
      toast.error('Masukkan kode promo terlebih dahulu');
      return;
    }
    
    setCheckingVoucher(true);
    try {
      // Import the server action
      const { validatePromoCodeAction } = await import("@/actions/affiliate");
      
      // Validate promo code
      const result = await validatePromoCodeAction(voucherCode.trim());
      
      if (result.success && result.affiliate) {
        // Promo code valid - calculate discount
        const discountPercent = result.affiliate.discountPercent || 10;
        const discountAmount = Math.round((priceParam * discountPercent) / 100);
        
        setDiscount(discountAmount);
        setVoucherApplied(true);
        toast.success(`✅ ${result.message} - Diskon ${discountPercent}% (Rp ${discountAmount.toLocaleString('id-ID')})`);
        
        console.log('✅ Promo code applied:', {
          code: result.affiliate.code,
          affiliateName: result.affiliate.name,
          discountPercent,
          discountAmount,
        });
      } else {
        // Invalid promo code
        toast.error(result.message || 'Kode promo tidak valid');
        setVoucherApplied(false);
        setDiscount(0);
      }
    } catch (error) {
      console.error('Error checking promo code:', error);
      toast.error('Gagal memvalidasi kode promo');
      setVoucherApplied(false);
      setDiscount(0);
    } finally {
      setCheckingVoucher(false);
    }
  }

  const handlePayment = async () => {
    if (!snapLoaded) {
      toast.error('Sistem pembayaran belum siap, coba lagi');
      return;
    }

    setLoading(true);

    try {
      const result = await createSubscriptionPayment({
        tier: tierParam,
        duration: durationParam,
        price: priceParam,
        voucherCode: voucherCode || undefined,
      });

      if (!result.success || !result.data) {
        toast.error(result.error || 'Gagal membuat pembayaran');
        setLoading(false);
        return;
      }

      console.log('✅ Payment created, token:', result.data.token);

      // Open Snap payment modal
      window.snap.pay(result.data.token, {
        onSuccess: function(result: any) {
          console.log('✅ Payment success:', result);
          toast.success('Pembayaran berhasil!');
          setStep("confirmation");
        },
        onPending: function(result: any) {
          console.log('⏳ Payment pending:', result);
          toast.info('Pembayaran menunggu konfirmasi');
          setStep("confirmation");
        },
        onError: function(result: any) {
          console.error('❌ Payment error:', result);
          toast.error('Pembayaran gagal, coba lagi');
          setLoading(false);
        },
        onClose: function() {
          console.log('🚪 Payment modal closed');
          setLoading(false);
        }
      });
    } catch (error) {
      console.error('❌ Payment error:', error);
      toast.error('Terjadi kesalahan: ' + (error as Error).message);
      setLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0
    }).format(price);
  };

  const finalPrice = priceParam - discount;

  if (step === "confirmation") {
    return (
      <div className="w-full min-h-screen bg-slate-50">
        <div className="max-w-3xl mx-auto p-3 md:p-4 space-y-2.5 md:space-y-4">
          <Card className="bg-white p-4 md:p-6 rounded-lg md:rounded-xl text-center space-y-2.5 md:space-y-4">
            <div className="flex justify-center">
              <div className="h-10 w-10 md:h-16 md:w-16 rounded-full bg-emerald-50 flex items-center justify-center">
                <CheckCircle2 className="h-5 w-5 md:h-8 md:w-8 text-emerald-600" />
              </div>
            </div>
            <div>
              <h2 className="text-xs md:text-lg font-bold mb-1 text-slate-900">Pembayaran Dikonfirmasi!</h2>
              <p className="text-[10px] md:text-sm text-slate-600">
                Tim kami akan memverifikasi pembayaran dalam 1x24 jam
              </p>
            </div>
            <Link href="/dashboard/student">
              <Button className="w-full bg-blue-600 hover:bg-blue-700 active:bg-blue-800 h-9 md:h-11 text-xs md:text-base font-bold rounded-lg md:rounded-xl touch-manipulation">
                Kembali ke Dashboard
              </Button>
            </Link>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-slate-50">
      <div className="max-w-3xl mx-auto p-3 md:p-4 space-y-2.5 md:space-y-4">
        {/* Header */}
        <Card className="bg-white p-2.5 md:p-4 rounded-lg md:rounded-xl shadow-sm">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 md:h-8 md:w-8 p-0 hover:bg-slate-100 rounded-lg"
              onClick={() => router.back()}
            >
              <ArrowLeft className="h-3.5 w-3.5 md:h-4 md:w-4" />
            </Button>
            <div>
              <h1 className="text-xs md:text-lg font-bold text-slate-900">Beli {selectedPlan?.name || 'Paket'}</h1>
              <p className="text-[9px] md:text-xs text-slate-600">Pilih metode pembayaran</p>
            </div>
          </div>
        </Card>

        {/* Package Info */}
        <Card className={`p-3 md:p-5 rounded-lg md:rounded-xl shadow-sm bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200`}>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm md:text-lg font-bold text-slate-900">⭐ {tierParam}</h3>
                <p className="text-[10px] md:text-sm text-slate-600">{durationParam} akses premium</p>
              </div>
              <div className="text-right">
                {discount > 0 && (
                  <p className="text-xs md:text-sm text-slate-500 line-through">
                    {formatPrice(priceParam)}
                  </p>
                )}
                <p className="text-base md:text-xl font-extrabold text-slate-900">
                  {formatPrice(finalPrice)}
                </p>
              </div>
            </div>
            {discount > 0 && (
              <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-2">
                <p className="text-[10px] md:text-xs text-emerald-700 font-medium">
                  ✅ Diskon {formatPrice(discount)} diterapkan!
                </p>
              </div>
            )}
          </div>
        </Card>

        {/* Voucher Section */}
        <Card className="bg-white p-3 md:p-5 space-y-2 rounded-lg md:rounded-xl shadow-sm">
          <h3 className="text-xs md:text-base font-bold text-slate-900">Kode Promo / Voucher</h3>
          <div className="flex gap-2">
            <input
              type="text"
              value={voucherCode}
              onChange={(e) => {
                setVoucherCode(e.target.value.toUpperCase());
                setVoucherApplied(false);
                setDiscount(0);
              }}
              placeholder="Masukkan kode"
              className="flex-1 h-9 md:h-11 px-3 border border-slate-200 rounded-lg text-xs md:text-sm"
              style={{ fontSize: '16px' }}
              disabled={voucherApplied}
            />
            {!voucherApplied ? (
              <Button
                onClick={checkVoucher}
                disabled={checkingVoucher || !voucherCode.trim()}
                variant="outline"
                className="h-9 md:h-11 px-3 md:px-4 text-xs md:text-sm font-bold"
              >
                {checkingVoucher ? "Cek..." : "Terapkan"}
              </Button>
            ) : (
              <Button
                onClick={() => {
                  setVoucherCode("");
                  setVoucherApplied(false);
                  setDiscount(0);
                }}
                variant="outline"
                className="h-9 md:h-11 px-3 md:px-4 text-xs md:text-sm font-bold text-rose-600"
              >
                Hapus
              </Button>
            )}
          </div>
          <p className="text-[9px] md:text-xs text-slate-500">
            Punya kode promo affiliate atau voucher? Masukkan untuk mendapatkan diskon.
          </p>
        </Card>

        {/* Payment Info */}
        <Card className="bg-white p-3 md:p-5 space-y-2.5 md:space-y-4 rounded-lg md:rounded-xl shadow-sm">
          <h3 className="text-xs md:text-base font-bold text-slate-900">Metode Pembayaran:</h3>
          
          <div className="space-y-2 md:space-y-3">
            <div className="bg-blue-50 border border-blue-200 p-2.5 md:p-4 rounded-lg">
              <p className="text-[9px] md:text-xs font-bold text-blue-900 mb-1 md:mb-2 flex items-center gap-1">
                <span className="text-xs md:text-base">💳</span> Pembayaran Online
              </p>
              <ul className="text-[9px] md:text-xs text-blue-900 space-y-0.5 md:space-y-1 list-disc list-inside leading-relaxed">
                <li>Kartu Kredit / Debit</li>
                <li>Transfer Bank (BCA, Mandiri, BNI, BRI, dll)</li>
                <li>E-Wallet (GoPay, OVO, DANA, ShopeePay)</li>
                <li>Convenience Store (Indomaret, Alfamart)</li>
              </ul>
            </div>

            <div className="bg-amber-50 border border-amber-200 p-2.5 md:p-4 rounded-lg">
              <p className="text-[9px] md:text-xs text-amber-900">
                <span className="font-bold">Aman & Terpercaya</span> - Pembayaran diproses oleh Midtrans
              </p>
            </div>
          </div>

          <Button 
            className="w-full bg-blue-600 hover:bg-blue-700 active:bg-blue-800 h-9 md:h-11 text-xs md:text-base font-bold rounded-lg md:rounded-xl touch-manipulation shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={handlePayment}
            disabled={loading || !snapLoaded}
          >
            {loading ? 'Memproses...' : !snapLoaded ? 'Loading...' : 'Bayar Sekarang'}
          </Button>
        </Card>
      </div>
    </div>
  );
}
