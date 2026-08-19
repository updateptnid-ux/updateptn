"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import Link from "next/link";

const PACKAGES = {
  premium: {
    name: "Premium",
    price: 150000,
    duration: "1 Bulan",
    color: "blue",
    icon: "⭐"
  },
  gold: {
    name: "Gold",
    price: 300000,
    duration: "3 Bulan",
    color: "yellow",
    icon: "👑",
    badge: "BEST VALUE"
  }
};

export default function BeliPaketClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const tier = (searchParams.get("tier") || "premium") as "premium" | "gold";
  const pkg = PACKAGES[tier];

  const [step, setStep] = useState<"payment" | "confirmation">("payment");

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0
    }).format(price);
  };

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
              <h1 className="text-xs md:text-lg font-bold text-slate-900">Beli Paket {pkg.name}</h1>
              <p className="text-[9px] md:text-xs text-slate-600">Transfer manual ke rekening di bawah</p>
            </div>
          </div>
        </Card>

        {/* Package Info */}
        <Card className={`p-3 md:p-5 rounded-lg md:rounded-xl shadow-sm ${
          pkg.color === "yellow" 
            ? "bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200" 
            : "bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200"
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm md:text-lg font-bold text-slate-900">{pkg.icon} Paket {pkg.name}</h3>
              <p className="text-[10px] md:text-sm text-slate-600">{pkg.duration} akses premium</p>
            </div>
            <div className="text-base md:text-xl font-extrabold text-slate-900">{formatPrice(pkg.price)}</div>
          </div>
        </Card>

        {/* Payment Info */}
        <Card className="bg-white p-3 md:p-5 space-y-2.5 md:space-y-4 rounded-lg md:rounded-xl shadow-sm">
          <h3 className="text-xs md:text-base font-bold text-slate-900">Transfer ke Rekening:</h3>
          
          <div className="space-y-2 md:space-y-3">
            <div className="bg-slate-50 p-2.5 md:p-4 rounded-lg border border-slate-200">
              <p className="text-[9px] md:text-xs text-slate-600 mb-0.5 md:mb-1 font-semibold">Bank BCA</p>
              <p className="text-sm md:text-xl font-bold font-mono text-slate-900 tracking-wider">1234567890</p>
              <p className="text-[9px] md:text-xs text-slate-600 mt-0.5">a.n. UpdatePTN Platform</p>
            </div>

            <div className="bg-amber-50 border border-amber-200 md:border-2 p-2.5 md:p-4 rounded-lg">
              <p className="text-[9px] md:text-xs font-bold text-amber-900 mb-1 md:mb-2 flex items-center gap-1">
                <span className="text-xs md:text-base">⚠️</span> Instruksi Pembayaran:
              </p>
              <ol className="text-[9px] md:text-xs text-amber-900 space-y-0.5 md:space-y-1 list-decimal list-inside leading-relaxed">
                <li>Transfer <span className="font-bold">tepat {formatPrice(pkg.price)}</span></li>
                <li>Screenshot bukti transfer</li>
                <li>Kirim ke WhatsApp: <span className="font-bold">081234567890</span></li>
                <li>Sertakan <span className="font-bold">email akun</span> untuk verifikasi</li>
              </ol>
            </div>
          </div>

          <Button 
            className="w-full bg-blue-600 hover:bg-blue-700 active:bg-blue-800 h-9 md:h-11 text-xs md:text-base font-bold rounded-lg md:rounded-xl touch-manipulation shadow-sm"
            onClick={() => setStep("confirmation")}
          >
            Sudah Transfer
          </Button>
        </Card>
      </div>
    </div>
  );
}
