"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/client";
import { createSubscription, getUserSubscription } from "@/actions/subscription";
import {
  Check,
  ArrowRight,
  Crown,
  Sparkles,
  Zap,
  Shield,
  Users,
  Clock,
  CheckCircle2,
  X,
  Loader2,
  ArrowLeft,
  Ticket,
  Tag,
} from "lucide-react";
import { FadeIn, MotionCard, StaggerContainer, StaggerItem } from "@/components/ui/fade-in";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface PricingPlan {
  id: string;
  name: string;
  subtitle: string;
  price: number;
  priceDisplay: string;
  duration: string;
  badge?: string;
  badgeColor?: string;
  popular?: boolean;
  icon: any;
  features: Array<{
    name: string;
    included: boolean;
  }>;
  buttonText: string;
  buttonVariant?: "default" | "outline";
}

export default function PricingPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [currentSubscription, setCurrentSubscription] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [processingPlan, setProcessingPlan] = useState<string | null>(null);

  useEffect(() => {
    const loadUserData = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        setCurrentUser(user);
        
        // Get user profile
        const { data: profile } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();
        
        if (profile) {
          setUserProfile(profile);
        }

        // Get current subscription
        const subResult = await getUserSubscription(user.id);
        if (subResult.success && subResult.data) {
          setCurrentSubscription(subResult.data);
        }
      }
      
      setLoading(false);
    };

    loadUserData();
  }, []);

  const plans: PricingPlan[] = [
    {
      id: "starter",
      name: "Starter",
      subtitle: "Gratis Selamanya",
      price: 0,
      priceDisplay: "Rp 0",
      duration: "selamanya",
      icon: Shield,
      features: [
        { name: "1x Try Out IRT Full Subtes", included: true },
        { name: "Basic Cek Peluang PTN", included: true },
        { name: "Akses Direktori Kampus", included: true },
        { name: "Timer CBT Standard", included: true },
        { name: "Unlimited Try Out", included: false },
        { name: "Live Class & Replay", included: false },
        { name: "Modul PDF Premium", included: false },
        { name: "Konsultasi Jurusan", included: false },
      ],
      buttonText: "Mulai Gratis",
      buttonVariant: "outline",
    },
    {
      id: "premium-1-month",
      name: "Premium 1 Bulan",
      subtitle: "Persiapan Sprint",
      price: 99000,
      priceDisplay: "Rp 99.000",
      duration: "1 bulan",
      badge: "HEMAT",
      badgeColor: "bg-emerald-100 text-emerald-700 border-emerald-200",
      icon: Zap,
      features: [
        { name: "Unlimited Try Out IRT Seri 01-20", included: true },
        { name: "Cek Peluang PTN Presisi", included: true },
        { name: "Akses Live Class 24/7", included: true },
        { name: "Download Rekaman HD", included: true },
        { name: "Bank Soal HOTS", included: true },
        { name: "Modul PDF Pembahasan", included: true },
        { name: "Konsultasi Basic", included: true },
        { name: "Priority Support", included: false },
      ],
      buttonText: "Pilih Paket",
    },
    {
      id: "premium-3-month",
      name: "All Access Pass",
      subtitle: "Paling Populer",
      price: 199000,
      priceDisplay: "Rp 199.000",
      duration: "hingga SNBT",
      badge: "TERPOPULER",
      badgeColor: "bg-blue-600 text-white",
      popular: true,
      icon: Crown,
      features: [
        { name: "Unlimited Try Out IRT Seri 01-20", included: true },
        { name: "Cek Peluang PTN Presisi Tanpa Batas", included: true },
        { name: "Akses Live Class & Replay 24/7", included: true },
        { name: "Download Rekaman HD", included: true },
        { name: "Modul PDF Pembahasan Lengkap", included: true },
        { name: "Bank Soal HOTS Premium", included: true },
        { name: "Konsultasi Pemilihan Jurusan", included: true },
        { name: "Priority Support", included: true },
      ],
      buttonText: "Pilih Paket Premium",
    },
    {
      id: "platinum",
      name: "Platinum VIP",
      subtitle: "Persiapan Maksimal",
      price: 349000,
      priceDisplay: "Rp 349.000",
      duration: "1 tahun penuh",
      badge: "BEST VALUE",
      badgeColor: "bg-purple-100 text-purple-700 border-purple-200",
      icon: Sparkles,
      features: [
        { name: "Semua fitur All Access Pass", included: true },
        { name: "Mentoring 1-on-1 dengan Tutor", included: true },
        { name: "Analisis Personalized", included: true },
        { name: "Akses Early Bird Try Out Baru", included: true },
        { name: "Sertifikat Kelulusan Digital", included: true },
        { name: "Grup Eksklusif Alumni PTN", included: true },
        { name: "Garansi Uang Kembali 100%", included: true },
        { name: "24/7 Priority WhatsApp Support", included: true },
      ],
      buttonText: "Pilih Platinum VIP",
    },
  ];

  const [checkoutPlan, setCheckoutPlan] = useState<PricingPlan | null>(null);
  const [voucherInput, setVoucherInput] = useState("");
  const [appliedVoucher, setAppliedVoucher] = useState<{
    code: string;
    discountType: "percentage" | "fixed";
    value: number;
    discountAmount: number;
  } | null>(null);
  const [voucherError, setVoucherError] = useState("");
  const [voucherSuccess, setVoucherSuccess] = useState("");
  const [isValidatingVoucher, setIsValidatingVoucher] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("qris");

  const handleSelectPlan = async (plan: PricingPlan) => {
    // Free plan - just register
    if (plan.id === "starter") {
      router.push("/register");
      return;
    }

    // Require authentication for paid plans
    if (!currentUser) {
      router.push(`/login?redirect=/pricing&plan=${plan.id}`);
      return;
    }

    // Reset voucher state & open checkout modal
    setVoucherInput("");
    setAppliedVoucher(null);
    setVoucherError("");
    setVoucherSuccess("");
    setSelectedPaymentMethod("qris");
    setCheckoutPlan(plan);
  };

  const handleApplyVoucher = async () => {
    if (!voucherInput.trim() || !checkoutPlan) return;

    setIsValidatingVoucher(true);
    setVoucherError("");
    setVoucherSuccess("");

    const codeUpper = voucherInput.trim().toUpperCase();

    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("vouchers")
        .select("*")
        .ilike("code", codeUpper)
        .eq("status", "active")
        .single();

      let vType: "percentage" | "fixed" = "percentage";
      let vVal = 0;

      if (!error && data) {
        vType = data.discount_type || "percentage";
        vVal = Number(data.value || 0);
      } else {
        // Fallback demo codes if DB voucher doesn't match
        if (codeUpper === "UPDATEPTN" || codeUpper === "UPDATEPTN2026") {
          vType = "percentage";
          vVal = 20;
        } else if (codeUpper === "SNBT50" || codeUpper === "HEMAT50") {
          vType = "percentage";
          vVal = 50;
        } else if (codeUpper === "PEJUANG") {
          vType = "fixed";
          vVal = 25000;
        } else {
          setVoucherError("Kode voucher tidak ditemukan atau sudah kadaluarsa.");
          setIsValidatingVoucher(false);
          return;
        }
      }

      let discount = 0;
      if (vType === "percentage") {
        discount = Math.round((checkoutPlan.price * vVal) / 100);
      } else {
        discount = vVal;
      }
      discount = Math.min(discount, checkoutPlan.price);

      setAppliedVoucher({
        code: codeUpper,
        discountType: vType,
        value: vVal,
        discountAmount: discount,
      });
      setVoucherSuccess(
        vType === "percentage"
          ? `Voucher "${codeUpper}" berhasil dipasang! Diskon ${vVal}%.`
          : `Voucher "${codeUpper}" berhasil dipasang! Potongan Rp ${vVal.toLocaleString("id-ID")}.`
      );
    } catch {
      setVoucherError("Gagal memverifikasi voucher. Silakan coba lagi.");
    } finally {
      setIsValidatingVoucher(false);
    }
  };

  const handleRemoveVoucher = () => {
    setAppliedVoucher(null);
    setVoucherInput("");
    setVoucherSuccess("");
    setVoucherError("");
  };

  const handleConfirmPurchase = async () => {
    if (!checkoutPlan || !currentUser) return;

    setProcessingPlan(checkoutPlan.id);

    try {
      const finalPrice = appliedVoucher
        ? Math.max(0, checkoutPlan.price - appliedVoucher.discountAmount)
        : checkoutPlan.price;

      const subscriptionData = {
        user_id: currentUser.id,
        user_name: userProfile?.full_name || currentUser.email?.split("@")[0] || "User",
        user_email: currentUser.email || "",
        tier: (checkoutPlan.id.includes("platinum") ? "Platinum" : "Premium") as "Platinum" | "Premium" | "Basic",
        status: "pending" as const,
        price_paid: `Rp ${finalPrice.toLocaleString("id-ID")}`,
        duration_months: checkoutPlan.id === "premium-1-month" ? 1 : checkoutPlan.id === "premium-3-month" ? 3 : 12,
        payment_method: selectedPaymentMethod,
      };

      const result = await createSubscription(subscriptionData);

      if (result.success) {
        alert(
          `Pesanan Paket ${checkoutPlan.name} Berhasil Dibuat!\n\n` +
          `Total Bayar: Rp ${finalPrice.toLocaleString("id-ID")}${appliedVoucher ? ` (Hemat Rp ${appliedVoucher.discountAmount.toLocaleString("id-ID")})` : ""}\n` +
          `Metode Pembayaran: ${selectedPaymentMethod.toUpperCase()}\n\n` +
          `Silakan lakukan pembayaran. Akun kamu akan langsung aktif setelah konfirmasi.`
        );
        setCheckoutPlan(null);
        window.location.reload();
      } else {
        throw new Error(result.error || "Gagal membuat subscription");
      }
    } catch (error: any) {
      console.error("Error creating purchase:", error);
      alert(`Terjadi kesalahan: ${error.message}`);
    } finally {
      setProcessingPlan(null);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation Bar */}
      <header className="sticky top-0 z-50 bg-white/85 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3 sm:gap-4">
            <Button variant="ghost" onClick={() => router.back()} className="rounded-full shrink-0 hover:bg-slate-100 gap-2 px-3">
              <ArrowLeft className="h-4 w-4 text-slate-700" />
              <span className="text-sm font-semibold text-slate-700 hidden sm:inline">Kembali</span>
            </Button>
            <Link href="/" className="flex items-center gap-2.5 group">
              <span className="font-extrabold text-xl tracking-tight text-slate-900">
                Update<span className="text-blue-600">PTN</span>
              </span>
            </Link>
          </div>

          <div className="flex items-center gap-3">
            {currentUser ? (
              <Link href="/dashboard/student">
                <Button variant="ghost" className="font-semibold text-sm">
                  Dashboard
                </Button>
              </Link>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost" className="font-semibold text-sm">
                    Masuk
                  </Button>
                </Link>
                <Link href="/register">
                  <Button className="font-semibold text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-xl">
                    Daftar Gratis
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 md:py-24 bg-gradient-to-b from-blue-50/50 via-white to-white border-b border-slate-200/80">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <FadeIn className="space-y-4">
            <Badge variant="outline" className="px-4 py-1.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border-blue-200/80 inline-flex items-center gap-2">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Pilihan Paket Fleksibel untuk Setiap Kebutuhan</span>
            </Badge>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight text-slate-950 leading-[1.15]">
              Investasi Terbaik untuk{" "}
              <span className="text-blue-600">Masa Depan PTN</span>
            </h1>

            <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
              Tanpa biaya tersembunyi. Pilih paket yang sesuai dengan timeline persiapan UTBK kamu.
            </p>

            {/* Show current subscription if exists */}
            {currentSubscription && currentSubscription.status === "active" && (
              <div className="pt-4">
                <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 px-4 py-2 text-sm font-bold">
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Paket {currentSubscription.tier} Aktif hingga {new Date(currentSubscription.expires_at).toLocaleDateString("id-ID")}
                </Badge>
              </div>
            )}
          </FadeIn>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-16 md:py-20 bg-slate-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6" staggerDelay={0.1}>
            {plans.map((plan) => {
              const Icon = plan.icon;
              return (
                <StaggerItem key={plan.id}>
                  <MotionCard className="h-full">
                    <Card
                      className={`
                        p-6 rounded-3xl flex flex-col h-full
                        ${
                          plan.popular
                            ? "bg-slate-950 text-white border-slate-800 shadow-2xl ring-4 ring-blue-500/20 scale-105"
                            : "bg-white border-slate-200/80 shadow-sm hover:shadow-lg transition-shadow"
                        }
                      `}
                    >
                      {/* Header */}
                      <div className="space-y-4 pb-6 border-b border-slate-200/20">
                        <div className="flex items-center justify-between">
                          <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${
                            plan.popular ? "bg-blue-600/20 text-blue-400" : "bg-blue-50 text-blue-600"
                          }`}>
                            <Icon className="h-5 w-5" />
                          </div>
                          {plan.badge && (
                            <Badge className={`text-[10px] font-bold ${plan.badgeColor}`}>
                              {plan.badge}
                            </Badge>
                          )}
                        </div>

                        <div>
                          <h3 className={`text-xl font-black ${plan.popular ? "text-white" : "text-slate-900"}`}>
                            {plan.name}
                          </h3>
                          <p className={`text-xs ${plan.popular ? "text-slate-400" : "text-slate-500"}`}>
                            {plan.subtitle}
                          </p>
                        </div>

                        <div className="flex items-baseline gap-1">
                          <span className={`text-4xl font-black ${plan.popular ? "text-white" : "text-slate-900"}`}>
                            {plan.priceDisplay}
                          </span>
                          <span className={`text-xs font-semibold ${plan.popular ? "text-slate-400" : "text-slate-500"}`}>
                            / {plan.duration}
                          </span>
                        </div>
                      </div>

                      {/* Features */}
                      <ul className="space-y-3 py-6 flex-1">
                        {plan.features.map((feature, idx) => (
                          <li key={idx} className="flex items-start gap-2.5">
                            {feature.included ? (
                              <CheckCircle2 className={`h-4 w-4 shrink-0 mt-0.5 ${
                                plan.popular ? "text-blue-400" : "text-emerald-600"
                              }`} />
                            ) : (
                              <X className={`h-4 w-4 shrink-0 mt-0.5 ${
                                plan.popular ? "text-slate-600" : "text-slate-300"
                              }`} />
                            )}
                            <span className={`text-xs leading-relaxed ${
                              feature.included
                                ? plan.popular ? "text-slate-200" : "text-slate-700"
                                : plan.popular ? "text-slate-600" : "text-slate-400"
                            }`}>
                              {feature.name}
                            </span>
                          </li>
                        ))}
                      </ul>

                      {/* CTA Button */}
                      <Button
                        onClick={() => handleSelectPlan(plan)}
                        disabled={processingPlan === plan.id}
                        className={`w-full h-12 font-bold text-sm rounded-xl gap-2 ${
                          plan.popular
                            ? "bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/25"
                            : plan.buttonVariant === "outline"
                            ? "border-2 border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                            : "bg-blue-600 hover:bg-blue-700 text-white"
                        }`}
                      >
                        {processingPlan === plan.id ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <span>Memproses...</span>
                          </>
                        ) : (
                          <>
                            <span>{plan.buttonText}</span>
                            <ArrowRight className="h-4 w-4" />
                          </>
                        )}
                      </Button>
                    </Card>
                  </MotionCard>
                </StaggerItem>
              );
            })}
          </StaggerContainer>
        </div>
      </section>

      {/* Trust Signals */}
      <section className="py-16 bg-white border-t border-slate-200/80">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="space-y-2">
              <div className="h-12 w-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
                <Shield className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Pembayaran Aman</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Transaksi terenkripsi SSL dengan payment gateway terpercaya
              </p>
            </div>

            <div className="space-y-2">
              <div className="h-12 w-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
                <Users className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">50.000+ Siswa</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Dipercaya ribuan pejuang UTBK di seluruh Indonesia
              </p>
            </div>

            <div className="space-y-2">
              <div className="h-12 w-12 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
                <Clock className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Akses Instant</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Langsung aktif setelah pembayaran dikonfirmasi
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-slate-50/50 border-t border-slate-200/80">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="text-center space-y-3">
            <h2 className="text-3xl font-extrabold text-slate-950">
              Pertanyaan Umum
            </h2>
            <p className="text-slate-600">
              Pertanyaan yang sering ditanyakan seputar paket belajar
            </p>
          </div>

          <div className="space-y-4">
            <Card className="p-6 bg-white border-slate-200/80 rounded-2xl">
              <h3 className="text-sm font-bold text-slate-900 mb-2">
                Apakah ada biaya berlangganan bulanan?
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Tidak ada. Semua paket bersifat one-time payment dan aktif sesuai durasi yang dipilih.
              </p>
            </Card>

            <Card className="p-6 bg-white border-slate-200/80 rounded-2xl">
              <h3 className="text-sm font-bold text-slate-900 mb-2">
                Bagaimana cara pembayaran?
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Kami menerima pembayaran melalui transfer bank, e-wallet (GoPay, OVO, DANA), dan kartu kredit/debit.
              </p>
            </Card>

            <Card className="p-6 bg-white border-slate-200/80 rounded-2xl">
              <h3 className="text-sm font-bold text-slate-900 mb-2">
                Apakah bisa upgrade paket di tengah jalan?
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Ya, kamu bisa upgrade ke paket yang lebih tinggi kapan saja dengan membayar selisih harga.
              </p>
            </Card>

            <Card className="p-6 bg-white border-slate-200/80 rounded-2xl">
              <h3 className="text-sm font-bold text-slate-900 mb-2">
                Apakah ada garansi uang kembali?
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Paket Platinum VIP dilengkapi dengan garansi uang kembali 100% jika tidak lulus SNBT (dengan syarat dan ketentuan berlaku).
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-slate-950 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <h2 className="text-3xl sm:text-4xl font-extrabold">
            Masih Ragu? Coba Dulu Paket Starter Gratis!
          </h2>
          <p className="text-slate-400 text-base max-w-2xl mx-auto">
            Rasakan sendiri pengalaman Try Out IRT dan fitur Cek Peluang PTN tanpa biaya apapun.
          </p>
          <Link href="/register">
            <Button size="lg" className="h-13 px-9 text-base font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-lg shadow-blue-500/25 gap-2.5">
              <span>Daftar Gratis Sekarang</span>
              <ArrowRight className="h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Checkout Modal with Optional Voucher Input */}
      {checkoutPlan && (
        <Dialog open={!!checkoutPlan} onOpenChange={() => setCheckoutPlan(null)}>
          <DialogContent className="max-w-lg rounded-3xl p-6">
            <DialogHeader>
              <div className="flex items-center gap-2 mb-1">
                <Badge className="bg-blue-100 text-blue-800 border-blue-200 text-xs font-extrabold">
                  Checkout Paket
                </Badge>
              </div>
              <DialogTitle className="text-xl font-black text-slate-900">
                Konfirmasi Pembelian {checkoutPlan.name}
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500">
                Lengkapi rincian pemesanan dan masukkan kode voucher diskon (opsional).
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-5 py-2">
              {/* Plan Summary Card */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-extrabold text-slate-900">{checkoutPlan.name}</span>
                  <span className="text-xs font-bold text-slate-500">{checkoutPlan.duration}</span>
                </div>
                <div className="flex justify-between items-center pt-1 border-t border-slate-200/60 text-xs">
                  <span className="text-slate-600">Harga Paket Normal:</span>
                  <span className="font-bold text-slate-900">{checkoutPlan.priceDisplay}</span>
                </div>
                {appliedVoucher && (
                  <div className="flex justify-between items-center text-xs text-emerald-600 font-bold">
                    <span>Diskon Voucher ({appliedVoucher.code}):</span>
                    <span>- Rp {appliedVoucher.discountAmount.toLocaleString("id-ID")}</span>
                  </div>
                )}
                <div className="flex justify-between items-center pt-2 border-t border-slate-300 font-black text-sm text-slate-950">
                  <span>Total Bayar:</span>
                  <span className="text-blue-600 text-base">
                    Rp {appliedVoucher
                      ? Math.max(0, checkoutPlan.price - appliedVoucher.discountAmount).toLocaleString("id-ID")
                      : checkoutPlan.price.toLocaleString("id-ID")}
                  </span>
                </div>
              </div>

              {/* Voucher Code Input Field (Opsional) */}
              <div className="space-y-2">
                <Label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Ticket className="h-3.5 w-3.5 text-blue-600" />
                    Kode Voucher Diskon <span className="text-slate-400 font-normal">(Opsional)</span>
                  </span>
                  {appliedVoucher && (
                    <button
                      type="button"
                      onClick={handleRemoveVoucher}
                      className="text-[11px] text-rose-600 hover:underline font-semibold"
                    >
                      Hapus Voucher
                    </button>
                  )}
                </Label>

                {!appliedVoucher ? (
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Tag className="h-4 w-4 text-slate-400 absolute left-3 top-3.5" />
                      <Input
                        value={voucherInput}
                        onChange={(e) => setVoucherInput(e.target.value.toUpperCase())}
                        placeholder="Contoh: UPDATEPTN, SNBT50..."
                        className="pl-9 h-11 text-xs font-bold tracking-wider rounded-xl uppercase border-slate-200 focus:border-blue-500"
                      />
                    </div>
                    <Button
                      type="button"
                      disabled={!voucherInput.trim() || isValidatingVoucher}
                      onClick={handleApplyVoucher}
                      className="h-11 px-4 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shrink-0"
                    >
                      {isValidatingVoucher ? <Loader2 className="h-4 w-4 animate-spin" /> : "Gunakan"}
                    </Button>
                  </div>
                ) : (
                  <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                      <span className="font-bold">Kode "{appliedVoucher.code}" Digunakan</span>
                    </div>
                    <span className="text-emerald-700 font-extrabold">
                      -Rp {appliedVoucher.discountAmount.toLocaleString("id-ID")}
                    </span>
                  </div>
                )}

                {voucherError && (
                  <p className="text-[11px] font-semibold text-rose-600 mt-1">{voucherError}</p>
                )}
                {voucherSuccess && (
                  <p className="text-[11px] font-semibold text-emerald-600 mt-1">{voucherSuccess}</p>
                )}
              </div>

              {/* Payment Method Selector */}
              <div className="space-y-2">
                <Label className="text-xs font-bold text-slate-700 block">Metode Pembayaran</Label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: "qris", name: "QRIS", desc: "All E-Wallet & Bank" },
                    { id: "gopay", name: "GoPay / DANA", desc: "Instan" },
                    { id: "bank_transfer", name: "Transfer Bank", desc: "VA 24 Jam" },
                  ].map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setSelectedPaymentMethod(m.id)}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        selectedPaymentMethod === m.id
                          ? "border-blue-600 bg-blue-50/70 text-blue-900 font-bold ring-2 ring-blue-500/20"
                          : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
                      }`}
                    >
                      <span className="text-xs block font-bold">{m.name}</span>
                      <span className="text-[10px] block text-slate-400 font-normal truncate">{m.desc}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <DialogFooter className="gap-2 sm:gap-0 pt-2 border-t border-slate-100">
              <Button
                variant="outline"
                onClick={() => setCheckoutPlan(null)}
                className="h-11 text-xs font-bold border-slate-200 rounded-xl"
              >
                Batal
              </Button>
              <Button
                onClick={handleConfirmPurchase}
                disabled={processingPlan === checkoutPlan.id}
                className="h-11 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl gap-2 shadow-md"
              >
                {processingPlan === checkoutPlan.id ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Memproses...</span>
                  </>
                ) : (
                  <>
                    <Check className="h-4 w-4" />
                    <span>
                      Lanjutkan Pembayaran (Rp{" "}
                      {appliedVoucher
                        ? Math.max(0, checkoutPlan.price - appliedVoucher.discountAmount).toLocaleString("id-ID")
                        : checkoutPlan.price.toLocaleString("id-ID")}
                      )
                    </span>
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
