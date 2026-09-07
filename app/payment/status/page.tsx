"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Clock, XCircle, Loader2 } from "lucide-react";
import Link from "next/link";
import confetti from "canvas-confetti";

export default function PaymentStatusPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [countdown, setCountdown] = useState(5);

  const orderId = searchParams.get('order_id');
  const status = searchParams.get('status') || searchParams.get('transaction_status') || 'pending';

  // Determine final status
  const isSuccess = status === 'settlement' || status === 'capture' || status === 'success';
  const isPending = status === 'pending';
  const isError = status === 'deny' || status === 'cancel' || status === 'expire' || status === 'error' || status === 'failed';

  useEffect(() => {
    // Success confetti
    if (isSuccess) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });

      // Auto redirect
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            router.push('/dashboard/student');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [isSuccess, router]);

  return (
    <div className="w-full min-h-screen bg-slate-50 flex items-center justify-center p-3 md:p-4">
      <Card className="max-w-md w-full bg-white p-4 md:p-6 rounded-lg md:rounded-xl shadow-sm">
        {/* Status Icon */}
        <div className="flex justify-center mb-4">
          {isSuccess && (
            <div className="h-16 w-16 md:h-20 md:w-20 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle2 className="h-8 w-8 md:h-10 md:w-10 text-green-600" />
            </div>
          )}
          {isPending && (
            <div className="h-16 w-16 md:h-20 md:w-20 rounded-full bg-amber-100 flex items-center justify-center">
              <Clock className="h-8 w-8 md:h-10 md:w-10 text-amber-600" />
            </div>
          )}
          {isError && (
            <div className="h-16 w-16 md:h-20 md:w-20 rounded-full bg-red-100 flex items-center justify-center">
              <XCircle className="h-8 w-8 md:h-10 md:w-10 text-red-600" />
            </div>
          )}
        </div>

        {/* Status Message */}
        <div className="text-center mb-4">
          {isSuccess && (
            <>
              <h1 className="text-lg md:text-xl font-bold text-slate-900 mb-2">
                Pembayaran Berhasil! 🎉
              </h1>
              <p className="text-xs md:text-sm text-slate-600">
                Akun premium Anda sudah aktif
              </p>
            </>
          )}
          {isPending && (
            <>
              <h1 className="text-lg md:text-xl font-bold text-slate-900 mb-2">
                Menunggu Pembayaran
              </h1>
              <p className="text-xs md:text-sm text-slate-600">
                Selesaikan pembayaran Anda
              </p>
            </>
          )}
          {isError && (
            <>
              <h1 className="text-lg md:text-xl font-bold text-slate-900 mb-2">
                Pembayaran Gagal
              </h1>
              <p className="text-xs md:text-sm text-slate-600">
                Silakan coba lagi
              </p>
            </>
          )}
        </div>

        {/* Order Details */}
        {orderId && (
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 mb-4">
            <div className="flex justify-between text-xs md:text-sm mb-2">
              <span className="text-slate-600">Order ID</span>
              <span className="font-mono text-slate-900 text-[10px] md:text-xs">{orderId}</span>
            </div>
            <div className="flex justify-between text-xs md:text-sm">
              <span className="text-slate-600">Status</span>
              <span className={`font-bold ${
                isSuccess ? 'text-green-600' : 
                isPending ? 'text-amber-600' : 
                'text-red-600'
              }`}>
                {isSuccess ? 'BERHASIL' : isPending ? 'PENDING' : 'GAGAL'}
              </span>
            </div>
          </div>
        )}

        {/* Info Box */}
        {isPending && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4">
            <p className="text-xs md:text-sm text-amber-900">
              Selesaikan pembayaran melalui metode yang Anda pilih. 
              Akses premium akan aktif otomatis setelah pembayaran dikonfirmasi.
            </p>
          </div>
        )}

        {/* Success Countdown */}
        {isSuccess && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4 text-center">
            <p className="text-xs md:text-sm text-blue-900">
              Redirect ke dashboard dalam <span className="font-bold">{countdown}s</span>
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col gap-2">
          {isSuccess && (
            <>
              <Link href="/dashboard/student" className="w-full">
                <Button className="w-full bg-blue-600 hover:bg-blue-700 h-10 md:h-11 text-xs md:text-sm font-bold rounded-lg">
                  Ke Dashboard
                </Button>
              </Link>
              <Link href="/dashboard/student/payments" className="w-full">
                <Button variant="outline" className="w-full h-10 md:h-11 text-xs md:text-sm font-bold rounded-lg">
                  Lihat Invoice
                </Button>
              </Link>
            </>
          )}

          {isPending && (
            <>
              <Link href="/dashboard/student/payments" className="w-full">
                <Button className="w-full bg-amber-600 hover:bg-amber-700 h-10 md:h-11 text-xs md:text-sm font-bold rounded-lg">
                  Cek Status Pembayaran
                </Button>
              </Link>
              <Link href="/dashboard/student" className="w-full">
                <Button variant="outline" className="w-full h-10 md:h-11 text-xs md:text-sm font-bold rounded-lg">
                  Kembali ke Dashboard
                </Button>
              </Link>
            </>
          )}

          {isError && (
            <>
              <Link href="/pricing" className="w-full">
                <Button className="w-full bg-blue-600 hover:bg-blue-700 h-10 md:h-11 text-xs md:text-sm font-bold rounded-lg">
                  Coba Lagi
                </Button>
              </Link>
              <Link href="/dashboard/student" className="w-full">
                <Button variant="outline" className="w-full h-10 md:h-11 text-xs md:text-sm font-bold rounded-lg">
                  Kembali ke Dashboard
                </Button>
              </Link>
            </>
          )}
        </div>
      </Card>
    </div>
  );
}
