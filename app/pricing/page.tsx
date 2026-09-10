"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/client";
import { createSubscription, getUserSubscription } from "@/actions/subscription";
import { createSubscriptionPayment } from "@/actions/payment-midtrans";
import { activateSuccessfulPaymentAction } from "@/actions/payment-activation";
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
  FileText,
  Star,
  Flame,
  BookOpen,
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

// Extend Window type for Midtrans Snap
declare global {
  interface Window {
    snap?: {
      pay: (token: string, options: {
        onSuccess?: (result: any) => void;
        onPending?: (result: any) => void;
        onError?: (result: any) => void;
        onClose?: () => void;
      }) => void;
    };
  }
}

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
  type: "subscription" | "bimbel" | "tryout";
  quantity?: string;
  pertemuan?: string;
}

export default function PricingPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [currentSubscription, setCurrentSubscription] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [processingPlan, setProcessingPlan] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"subscription" | "bimbel" | "tryout">("subscription");
  const [expandedPlan, setExpandedPlan] = useState<string | null>(null);

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

  // ── SUBSCRIPTION PLANS ────────────────────────────────────────────────
  const subscriptionPlans: PricingPlan[] = [
    // Trial / Gratis
    {
      id: "trial",
      name: "Trial / Gratis",
      subtitle: "Coba Dulu Tanpa Bayar",
      price: 0,
      priceDisplay: "Gratis",
      duration: "selamanya",
      icon: Shield,
      type: "subscription",
      features: [
        { name: "1x Cek Rasionalisasi SNBP", included: true },
        { name: "3x Cek Rasionalisasi SNBT", included: true },
        { name: "1x Cek Rasionalisasi Mandiri", included: true },
        { name: "Akses Direktori Kampus", included: true },
        { name: "Cek Peluang PTN Premium", included: false },
        { name: "Try Out Tak Terbatas", included: false },
        { name: "Live Class & Materi Replay", included: false },
        { name: "Konsultasi Jurusan", included: false },
      ],
      buttonText: "Mulai Gratis",
      buttonVariant: "outline",
    },
    // Premium SNBT
    {
      id: "premium-snbt-7hari",
      name: "Premium SNBT",
      subtitle: "7 Hari",
      price: 29000,
      priceDisplay: "Rp 29.000",
      duration: "7 hari",
      badge: "SNBT",
      badgeColor: "bg-blue-100 text-blue-700 border-blue-200",
      icon: BookOpen,
      type: "subscription",
      features: [
        { name: "Cek Rasionalisasi SNBT Tak Terbatas", included: true },
        { name: "Modul Belajar:\nAkses Materi SNBT Lengkap", included: true },
        { name: "Bank Soal SNBT HOTS", included: true },
        { name: "Timer CBT Standard", included: true },
        { name: "Cek Rasionalisasi SNBP", included: false },
        { name: "Cek Rasionalisasi Mandiri", included: false },
        { name: "Konsultasi Jurusan", included: false },
        { name: "Priority Support", included: false },
      ],
      buttonText: "Pilih 7 Hari",
    },
    {
      id: "premium-snbt-1bulan",
      name: "Premium SNBT",
      subtitle: "1 Bulan",
      price: 79000,
      priceDisplay: "Rp 79.000",
      duration: "1 bulan",
      badge: "HEMAT",
      badgeColor: "bg-emerald-100 text-emerald-700 border-emerald-200",
      popular: true,
      icon: BookOpen,
      type: "subscription",
      features: [
        { name: "Cek Rasionalisasi SNBT Tak Terbatas", included: true },
        { name: "Modul Belajar:\nAkses Materi SNBT Lengkap", included: true },
        { name: "Bank Soal SNBT HOTS", included: true },
        { name: "Timer CBT Standard", included: true },
        { name: "Download Rekaman HD", included: true },
        { name: "Cek Rasionalisasi SNBP", included: false },
        { name: "Cek Rasionalisasi Mandiri", included: false },
        { name: "Priority Support", included: false },
      ],
      buttonText: "Pilih 1 Bulan",
    },
    {
      id: "premium-snbt-3bulan",
      name: "Premium SNBT",
      subtitle: "3 Bulan",
      price: 149000,
      priceDisplay: "Rp 149.000",
      duration: "3 bulan",
      badge: "BEST VALUE",
      badgeColor: "bg-purple-100 text-purple-700 border-purple-200",
      icon: BookOpen,
      type: "subscription",
      features: [
        { name: "Cek Rasionalisasi SNBT Tak Terbatas", included: true },
        { name: "Modul Belajar:\nAkses Materi SNBT Lengkap", included: true },
        { name: "Bank Soal SNBT HOTS", included: true },
        { name: "Timer CBT Standard", included: true },
        { name: "Download Rekaman HD", included: true },
        { name: "Live Class & Materi Replay 24/7", included: true },
        { name: "Cek Rasionalisasi SNBP", included: false },
        { name: "Priority Support", included: false },
      ],
      buttonText: "Pilih 3 Bulan",
    },
    // Premium SNBP
    {
      id: "premium-snbp-7hari",
      name: "Premium SNBP",
      subtitle: "7 Hari",
      price: 35000,
      priceDisplay: "Rp 35.000",
      duration: "7 hari",
      badge: "SNBP",
      badgeColor: "bg-orange-100 text-orange-700 border-orange-200",
      icon: Star,
      type: "subscription",
      features: [
        { name: "Cek Rasionalisasi SNBP Tak Terbatas", included: true },
        { name: "Modul Belajar:\nAkses Materi SNBP Lengkap", included: true },
        { name: "Analisis Nilai Rapor", included: true },
        { name: "Timer CBT Standard", included: true },
        { name: "Cek Rasionalisasi SNBT", included: false },
        { name: "Cek Rasionalisasi Mandiri", included: false },
        { name: "Konsultasi Jurusan", included: false },
        { name: "Priority Support", included: false },
      ],
      buttonText: "Pilih 7 Hari",
    },
    {
      id: "premium-snbp-1bulan",
      name: "Premium SNBP",
      subtitle: "1 Bulan",
      price: 85000,
      priceDisplay: "Rp 85.000",
      duration: "1 bulan",
      badge: "HEMAT",
      badgeColor: "bg-emerald-100 text-emerald-700 border-emerald-200",
      icon: Star,
      type: "subscription",
      features: [
        { name: "Cek Rasionalisasi SNBP Tak Terbatas", included: true },
        { name: "Modul Belajar:\nAkses Materi SNBP Lengkap", included: true },
        { name: "Analisis Nilai Rapor", included: true },
        { name: "Timer CBT Standard", included: true },
        { name: "Download Rekaman HD", included: true },
        { name: "Cek Rasionalisasi SNBT", included: false },
        { name: "Cek Rasionalisasi Mandiri", included: false },
        { name: "Priority Support", included: false },
      ],
      buttonText: "Pilih 1 Bulan",
    },
    {
      id: "premium-snbp-3bulan",
      name: "Premium SNBP",
      subtitle: "3 Bulan",
      price: 160000,
      priceDisplay: "Rp 160.000",
      duration: "3 bulan",
      badge: "BEST VALUE",
      badgeColor: "bg-purple-100 text-purple-700 border-purple-200",
      icon: Star,
      type: "subscription",
      features: [
        { name: "Cek Rasionalisasi SNBP Tak Terbatas", included: true },
        { name: "Modul Belajar:\nAkses Materi SNBP Lengkap", included: true },
        { name: "Analisis Nilai Rapor", included: true },
        { name: "Timer CBT Standard", included: true },
        { name: "Download Rekaman HD", included: true },
        { name: "Live Class:\nMateri & Replay 24/7", included: true },
        { name: "Cek Rasionalisasi SNBT", included: false },
        { name: "Priority Support", included: false },
      ],
      buttonText: "Pilih 3 Bulan",
    },
    // Premium Mandiri
    {
      id: "premium-mandiri-7hari",
      name: "Premium Mandiri",
      subtitle: "7 Hari",
      price: 35000,
      priceDisplay: "Rp 35.000",
      duration: "7 hari",
      badge: "MANDIRI",
      badgeColor: "bg-teal-100 text-teal-700 border-teal-200",
      icon: Zap,
      type: "subscription",
      features: [
        { name: "Cek Rasionalisasi Mandiri Tak Terbatas", included: true },
        { name: "Fokus UI / UGM", included: true },
        { name: "Cek Skor Mandiri", included: true },
        { name: "Timer CBT Standard", included: true },
        { name: "Cek Rasionalisasi SNBT", included: false },
        { name: "Cek Rasionalisasi SNBP", included: false },
        { name: "Konsultasi Jurusan", included: false },
        { name: "Priority Support", included: false },
      ],
      buttonText: "Pilih 7 Hari",
    },
    {
      id: "premium-mandiri-1bulan",
      name: "Premium Mandiri",
      subtitle: "1 Bulan",
      price: 85000,
      priceDisplay: "Rp 85.000",
      duration: "1 bulan",
      badge: "HEMAT",
      badgeColor: "bg-emerald-100 text-emerald-700 border-emerald-200",
      icon: Zap,
      type: "subscription",
      features: [
        { name: "Cek Rasionalisasi Mandiri Tak Terbatas", included: true },
        { name: "Fokus UI / UGM", included: true },
        { name: "Cek Skor Mandiri", included: true },
        { name: "Timer CBT Standard", included: true },
        { name: "Download Rekaman HD", included: true },
        { name: "Cek Rasionalisasi SNBT", included: false },
        { name: "Cek Rasionalisasi SNBP", included: false },
        { name: "Priority Support", included: false },
      ],
      buttonText: "Pilih 1 Bulan",
    },
    {
      id: "premium-mandiri-3bulan",
      name: "Premium Mandiri",
      subtitle: "3 Bulan",
      price: 160000,
      priceDisplay: "Rp 160.000",
      duration: "3 bulan",
      badge: "BEST VALUE",
      badgeColor: "bg-purple-100 text-purple-700 border-purple-200",
      icon: Zap,
      type: "subscription",
      features: [
        { name: "Cek Rasionalisasi Mandiri Tak Terbatas", included: true },
        { name: "Fokus UI / UGM", included: true },
        { name: "Cek Skor Mandiri", included: true },
        { name: "Timer CBT Standard", included: true },
        { name: "Download Rekaman HD", included: true },
        { name: "Live Class:\nMateri & Replay 24/7", included: true },
        { name: "Cek Rasionalisasi SNBT", included: false },
        { name: "Priority Support", included: false },
      ],
      buttonText: "Pilih 3 Bulan",
    },
    // VIP — Semua Produk
    {
      id: "vip-1hari",
      name: "VIP All-in-One",
      subtitle: "SNBT + SNBP + Mandiri",
      price: 15000,
      priceDisplay: "Rp 15.000",
      duration: "1 hari",
      badge: "ALL-IN-ONE",
      badgeColor: "bg-amber-500 text-white border-amber-600",
      icon: Crown,
      type: "subscription",
      features: [
        { name: "Cek Rasionalisasi SNBP, SNBT & Mandiri", included: true },
        { name: "Modul Belajar:\nSemua Materi & Bank Soal", included: true },
        { name: "Timer CBT Full", included: true },
        { name: "Akses Direktori Kampus", included: true },
        { name: "Live Class & Materi Replay", included: false },
        { name: "Download Rekaman HD", included: false },
        { name: "Konsultasi Jurusan", included: false },
        { name: "Priority Support", included: false },
      ],
      buttonText: "Pilih 1 Hari",
    },
    {
      id: "vip-7hari",
      name: "VIP All-in-One",
      subtitle: "SNBT + SNBP + Mandiri",
      price: 49000,
      priceDisplay: "Rp 49.000",
      duration: "7 hari",
      badge: "ALL-IN-ONE",
      badgeColor: "bg-amber-500 text-white border-amber-600",
      icon: Crown,
      type: "subscription",
      features: [
        { name: "Cek Rasionalisasi SNBP, SNBT & Mandiri", included: true },
        { name: "Semua Materi & Bank Soal", included: true },
        { name: "Timer CBT Full", included: true },
        { name: "Akses Direktori Kampus", included: true },
        { name: "Download Rekaman HD", included: true },
        { name: "Live Class & Materi Replay", included: false },
        { name: "Konsultasi Jurusan", included: false },
        { name: "Priority Support", included: false },
      ],
      buttonText: "Pilih 7 Hari",
    },
    {
      id: "vip-1bulan",
      name: "VIP All-in-One",
      subtitle: "SNBT + SNBP + Mandiri",
      price: 149000,
      priceDisplay: "Rp 149.000",
      duration: "1 bulan",
      badge: "POPULER",
      badgeColor: "bg-blue-600 text-white",
      popular: true,
      icon: Crown,
      type: "subscription",
      features: [
        { name: "Cek Rasionalisasi SNBP, SNBT & Mandiri", included: true },
        { name: "Semua Materi & Bank Soal", included: true },
        { name: "Timer CBT Full", included: true },
        { name: "Akses Direktori Kampus", included: true },
        { name: "Download Rekaman HD", included: true },
        { name: "Live Class & Materi Replay 24/7", included: true },
        { name: "Konsultasi Jurusan", included: true },
        { name: "Priority Support", included: false },
      ],
      buttonText: "Pilih 1 Bulan",
    },
    {
      id: "vip-3bulan",
      name: "VIP All-in-One",
      subtitle: "SNBT + SNBP + Mandiri",
      price: 249000,
      priceDisplay: "Rp 249.000",
      duration: "3 bulan",
      badge: "BEST VALUE",
      badgeColor: "bg-purple-100 text-purple-700 border-purple-200",
      icon: Crown,
      type: "subscription",
      features: [
        { name: "Cek Rasionalisasi SNBP, SNBT & Mandiri", included: true },
        { name: "Semua Materi & Bank Soal", included: true },
        { name: "Timer CBT Full", included: true },
        { name: "Akses Direktori Kampus", included: true },
        { name: "Download Rekaman HD", included: true },
        { name: "Live Class & Materi Replay 24/7", included: true },
        { name: "Konsultasi Pemilihan Jurusan", included: true },
        { name: "Priority Support 24/7", included: true },
      ],
      buttonText: "Pilih 3 Bulan",
    },
  ];

  // ── TRY OUT PLANS ─────────────────────────────────────────────────────
  const tryoutPlans: PricingPlan[] = [
    {
      id: "to-1x",
      name: "Paket Satu",
      subtitle: "Coba Dulu",
      price: 59000,
      priceDisplay: "Rp 59.000",
      duration: "1x Try Out",
      quantity: "1x",
      icon: FileText,
      type: "tryout",
      features: [
        { name: "1x Try Out Full Subtes", included: true },
        { name: "Pembahasan Soal Lengkap", included: true },
        { name: "Skor & Rangking Nasional", included: true },
        { name: "Timer CBT IRT", included: true },
        { name: "Diskon Paket Hemat", included: false },
        { name: "Akses Statistik Lanjutan", included: false },
        { name: "Voucher Eksklusif Alumni", included: false },
        { name: "Priority Grading", included: false },
      ],
      buttonText: "Beli 1x Try Out",
      buttonVariant: "outline",
    },
    {
      id: "to-4x",
      name: "Paket Hemat",
      subtitle: "Latihan Rutin",
      price: 199000,
      priceDisplay: "Rp 199.000",
      duration: "4x Try Out",
      quantity: "4x",
      badge: "HEMAT",
      badgeColor: "bg-emerald-100 text-emerald-700 border-emerald-200",
      icon: Zap,
      type: "tryout",
      features: [
        { name: "4x Try Out Full Subtes", included: true },
        { name: "Pembahasan Soal Lengkap", included: true },
        { name: "Skor & Rangking Nasional", included: true },
        { name: "Timer CBT IRT", included: true },
        { name: "Diskon Paket Hemat", included: true },
        { name: "Akses Statistik Lanjutan", included: true },
        { name: "Voucher Eksklusif Alumni", included: false },
        { name: "Priority Grading", included: false },
      ],
      buttonText: "Beli 4x Try Out",
    },
    {
      id: "to-8x",
      name: "Paket Ambiss",
      subtitle: "Paling Populer",
      price: 379000,
      priceDisplay: "Rp 379.000",
      duration: "8x Try Out",
      quantity: "8x",
      badge: "TERPOPULER",
      badgeColor: "bg-blue-600 text-white",
      popular: true,
      icon: Flame,
      type: "tryout",
      features: [
        { name: "8x Try Out Full Subtes", included: true },
        { name: "Pembahasan Soal Lengkap", included: true },
        { name: "Skor & Rangking Nasional", included: true },
        { name: "Timer CBT IRT", included: true },
        { name: "Diskon Paket Hemat", included: true },
        { name: "Akses Statistik Lanjutan", included: true },
        { name: "Voucher Eksklusif Alumni", included: true },
        { name: "Priority Grading", included: false },
      ],
      buttonText: "Beli 8x Try Out",
    },
    {
      id: "to-10x",
      name: "Paket Super",
      subtitle: "Persiapan Maksimal",
      price: 400000,
      priceDisplay: "Rp 400.000",
      duration: "10x Try Out",
      quantity: "10x",
      badge: "SUPER",
      badgeColor: "bg-purple-100 text-purple-700 border-purple-200",
      icon: Sparkles,
      type: "tryout",
      features: [
        { name: "10x Try Out Full Subtes", included: true },
        { name: "Pembahasan Soal Lengkap", included: true },
        { name: "Skor & Rangking Nasional", included: true },
        { name: "Timer CBT IRT", included: true },
        { name: "Diskon Paket Hemat", included: true },
        { name: "Akses Statistik Lanjutan", included: true },
        { name: "Voucher Eksklusif Alumni", included: true },
        { name: "Priority Grading", included: true },
      ],
      buttonText: "Beli 10x Try Out",
    },
  ];

  // ── PAKET BIMBEL 2027 ──────────────────────────────────────────────────
  const bimbelPlans: PricingPlan[] = [
    {
      id: "bimbel-hemat",
      name: "Paket Hemat",
      subtitle: "Bimbel 2027",
      price: 175000,
      priceDisplay: "Rp 175.000",
      duration: "bulan",
      pertemuan: "4x Pertemuan",
      icon: Users,
      type: "bimbel",
      features: [
        { name: "4x Pertemuan Interaktif", included: true },
        { name: "2x TO & Pembahasan IRT", included: true },
        { name: "Mentoring Grup Eksklusif", included: true },
        { name: "Akses Rekaman Kelas", included: true },
        { name: "Seminar Motivasi", included: false },
        { name: "Sesi Private 1-on-1", included: false },
      ],
      buttonText: "Pilih Paket Hemat",
      buttonVariant: "outline",
    },
    {
      id: "bimbel-eksklusif",
      name: "Paket Eksklusif",
      subtitle: "Bimbel 2027",
      price: 325000,
      priceDisplay: "Rp 325.000",
      duration: "bulan",
      pertemuan: "12x Pertemuan",
      badge: "POPULER",
      badgeColor: "bg-blue-600 text-white",
      popular: true,
      icon: Star,
      type: "bimbel",
      features: [
        { name: "12x Pertemuan Interaktif", included: true },
        { name: "4x TO & Pembahasan IRT", included: true },
        { name: "Seminar Motivasi & Strategy", included: true },
        { name: "Ranking Nasional Presisi", included: true },
        { name: "Mentoring Grup Eksklusif", included: true },
        { name: "Sesi Private 1-on-1", included: false },
      ],
      buttonText: "Pilih Paket Eksklusif",
    },
    {
      id: "bimbel-intensif",
      name: "Premium Intensif",
      subtitle: "Bimbel 2027",
      price: 1035000,
      priceDisplay: "Rp 1.035.000",
      duration: "3 bulan",
      pertemuan: "36x Pertemuan",
      badge: "PREMIUM",
      badgeColor: "bg-purple-100 text-purple-700 border-purple-200",
      icon: Crown,
      type: "bimbel",
      features: [
        { name: "36x Pertemuan Intensive", included: true },
        { name: "3x Sesi Private 1-on-1", included: true },
        { name: "12x TO IRT & Analisis IRT", included: true },
        { name: "Full Support 24/7", included: true },
        { name: "Seminar Motivasi & Strategy", included: true },
        { name: "Garansi Pembahasan Modul", included: true },
      ],
      buttonText: "Pilih Premium Intensif",
    },
    {
      id: "bimbel-mandiri",
      name: "Bimbel Mandiri",
      subtitle: "Fokus UI / UGM",
      price: 150000,
      priceDisplay: "Rp 150.000",
      duration: "bulan",
      pertemuan: "8x Pertemuan",
      badge: "MANDIRI",
      badgeColor: "bg-teal-100 text-teal-700 border-teal-200",
      icon: Zap,
      type: "bimbel",
      features: [
        { name: "8x Pertemuan Spesifik Ujian Mandiri", included: true },
        { name: "Fokus Soal UI / UGM / ITB", included: true },
        { name: "Cek Skor & Peluang Mandiri", included: true },
        { name: "Bank Soal Simak UI & Utul UGM", included: true },
        { name: "Mentoring Latihan Mandiri", included: true },
      ],
      buttonText: "Pilih Bimbel Mandiri",
    },
  ];

  // ── PAKET CEK PELUANG PTN ──────────────────────────────────────────────
  const cekPeluangPlans: PricingPlan[] = [
    {
      id: "cek-peluang-3x",
      name: "Paket Cek 3x",
      subtitle: "Coba Dulu",
      price: 20000,
      priceDisplay: "Rp 20.000",
      duration: "3x Cek",
      quantity: "3x",
      icon: CheckCircle2,
      type: "subscription",
      features: [
        { name: "3x Cek Rasionalisasi SNBT / SNBP", included: true },
        { name: "Analisis Peluang Lolos", included: true },
        { name: "Rekomendasi Jurusan", included: true },
      ],
      buttonText: "Beli 3x Cek",
      buttonVariant: "outline",
    },
    {
      id: "cek-peluang-5x",
      name: "Paket Cek 5x",
      subtitle: "Lebih Hemat",
      price: 35000,
      priceDisplay: "Rp 35.000",
      duration: "5x Cek",
      quantity: "5x",
      badge: "HEMAT",
      badgeColor: "bg-emerald-100 text-emerald-700 border-emerald-200",
      icon: Star,
      type: "subscription",
      features: [
        { name: "5x Cek Rasionalisasi SNBT / SNBP", included: true },
        { name: "Analisis Peluang Lolos", included: true },
        { name: "Rekomendasi Jurusan", included: true },
      ],
      buttonText: "Beli 5x Cek",
    },
    {
      id: "cek-peluang-10x",
      name: "Paket Cek 10x",
      subtitle: "Paling Populer",
      price: 60000,
      priceDisplay: "Rp 60.000",
      duration: "10x Cek",
      quantity: "10x",
      badge: "POPULER",
      badgeColor: "bg-blue-600 text-white",
      popular: true,
      icon: Flame,
      type: "subscription",
      features: [
        { name: "10x Cek Rasionalisasi SNBT / SNBP", included: true },
        { name: "Analisis Peluang Lolos", included: true },
        { name: "Rekomendasi Jurusan", included: true },
      ],
      buttonText: "Beli 10x Cek",
    },
  ];

  const [selectedCekPeluangPlan, setSelectedCekPeluangPlan] = useState<PricingPlan | null>(null);
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

  const handleSelectTrack = (track: "snbp" | "snbt") => {
    if (!selectedCekPeluangPlan) return;

    const trackLabel = track.toUpperCase();
    const updatedPlan: PricingPlan = {
      ...selectedCekPeluangPlan,
      id: `${selectedCekPeluangPlan.id}-${track}`,
      name: `${selectedCekPeluangPlan.name} (${trackLabel})`,
      features: selectedCekPeluangPlan.features.map((feature) => ({
        ...feature,
        name: feature.name.replace("SNBT / SNBP", trackLabel).replace("SNBT / Mandiri", trackLabel),
      })),
    };

    setSelectedCekPeluangPlan(null);
    handleSelectPlan(updatedPlan);
  };

  const handleSelectPlan = async (plan: PricingPlan) => {
    if (plan.id === "trial") {
      router.push("/register");
      return;
    }

    if (!currentUser) {
      router.push(`/login?redirect=/pricing&plan=${plan.id}`);
      return;
    }

    // Buka modal pemilihan jalur (SNBP / SNBT) jika paket cek peluang satuan
    if (plan.id.startsWith("cek-peluang-") && !plan.id.includes("-snbp") && !plan.id.includes("-snbt")) {
      setSelectedCekPeluangPlan(plan);
      return;
    }

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
      let vCat = "universal";

      if (!error && data) {
        vType = data.discount_type || "percentage";
        // Hapus semua karakter non-angka agar "15%" menjadi 15 atau "Rp 50.000" menjadi 50000
        vVal = parseInt(String(data.value || "0").replace(/\D/g, "")) || 0;
        vCat = data.category || "universal";
      } else {
        // Fallback demo codes if DB voucher doesn't match
        if (codeUpper === "UPDATEPTN" || codeUpper === "UPDATEPTN2026") {
          vType = "percentage";
          vVal = 20;
        } else if (codeUpper === "SNBT50" || codeUpper === "HEMAT50") {
          vType = "percentage";
          vVal = 50;
          vCat = "snbt";
        } else if (codeUpper === "PEJUANG") {
          vType = "fixed";
          vVal = 25000;
        } else {
          setVoucherError("Kode voucher tidak ditemukan atau sudah kadaluarsa.");
          setIsValidatingVoucher(false);
          return;
        }
      }

      // Validasi Kategori Voucher
      if (vCat !== "universal") {
        let isEligible = false;
        const planId = checkoutPlan.id.toLowerCase();
        
        if (vCat === "snbt" && planId.includes("snbt")) isEligible = true;
        if (vCat === "snbp" && planId.includes("snbp")) isEligible = true;
        if (vCat === "mandiri" && planId.includes("mandiri")) isEligible = true;
        if (vCat === "tryout" && checkoutPlan.type === "tryout") isEligible = true;
        if (vCat === "bimbel" && checkoutPlan.type === "bimbel") isEligible = true;
        if (vCat === "cek-peluang" && planId.includes("cek-peluang")) isEligible = true;

        if (!isEligible) {
          let catName = vCat.toUpperCase();
          if (vCat === "tryout") catName = "Try Out";
          if (vCat === "bimbel") catName = "Bimbel";
          if (vCat === "cek-peluang") catName = "Cek Peluang PTN";
          
          setVoucherError(`Voucher ini khusus untuk paket ${catName}.`);
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

      // Use tier name from plan directly
      const tierName = checkoutPlan.name;

      // Create payment with Midtrans
      const result = await createSubscriptionPayment({
        tier: tierName,
        duration: checkoutPlan.duration,
        price: checkoutPlan.price,
        voucherCode: appliedVoucher?.code,
      });

      if (result.success && result.data) {
        // Load Midtrans Snap script if not already loaded
        if (!window.snap) {
          const script = document.createElement('script');
          script.src = process.env.NEXT_PUBLIC_MIDTRANS_SNAP_URL || 'https://app.sandbox.midtrans.com/snap/snap.js';
          script.setAttribute('data-client-key', process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || '');
          document.head.appendChild(script);
          
          await new Promise((resolve) => {
            script.onload = resolve;
          });
        }

        // Open Midtrans Snap popup
        window.snap?.pay(result.data.token, {
          onSuccess: async function(snapResult: any) {
            console.log('Payment success:', snapResult);
            const targetOrderId = snapResult?.order_id || result.data.orderId;
            try {
              if (targetOrderId) {
                await activateSuccessfulPaymentAction(targetOrderId);
              }
            } catch (actErr) {
              console.error('Error auto-activating payment:', actErr);
            }
            alert('Pembayaran berhasil! Paket Anda telah otomatis aktif.');
            setCheckoutPlan(null);
            window.location.href = '/dashboard/student';
          },
          onPending: function(result: any) {
            console.log('Payment pending:', result);
            alert('Pembayaran tertunda. Silakan selesaikan pembayaran Anda.');
            setCheckoutPlan(null);
          },
          onError: function(result: any) {
            console.error('Payment error:', result);
            alert('Terjadi kesalahan dalam pembayaran. Silakan coba lagi.');
          },
          onClose: function() {
            console.log('Payment popup closed');
            setProcessingPlan(null);
          }
        });
      } else {
        throw new Error(result.error || "Gagal membuat transaksi pembayaran");
      }
    } catch (error: any) {
      console.error("Error creating purchase:", error);
      alert(`Terjadi kesalahan: ${error.message}`);
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
      <section className="py-16 md:py-24 bg-blue-50 border-b border-slate-200/80">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <FadeIn className="space-y-4">
            <Badge variant="outline" className="px-4 py-1.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border-blue-200/80 inline-flex items-center gap-2">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Harga Transparan — Tanpa Biaya Tersembunyi</span>
            </Badge>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight text-slate-950 leading-[1.15]">
              Investasi Terbaik untuk{" "}
              <span className="text-blue-600">Masa Depan PTN</span>
            </h1>

            <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
              Pilih paket CEK PELUANG PTN atau beli Try Out satuan sesuai kebutuhanmu.
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

      {/* Tab Switcher */}
      <section className="py-6 bg-white border-b border-slate-200/80 sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap gap-3 justify-center">
            <button
              onClick={() => setActiveTab("subscription")}
              className={`px-5 py-2.5 sm:px-6 sm:py-3 rounded-2xl font-bold text-xs sm:text-sm transition-all ${
                activeTab === "subscription"
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-500/25"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              CEK PELUANG PTN
            </button>
            <button
              onClick={() => setActiveTab("bimbel")}
              className={`px-5 py-2.5 sm:px-6 sm:py-3 rounded-2xl font-bold text-xs sm:text-sm transition-all ${
                activeTab === "bimbel"
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-500/25"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              Paket Bimbel 2027
            </button>
            <button
              onClick={() => setActiveTab("tryout")}
              className={`px-5 py-2.5 sm:px-6 sm:py-3 rounded-2xl font-bold text-xs sm:text-sm transition-all ${
                activeTab === "tryout"
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-500/25"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              Paket Try Out
            </button>
          </div>
        </div>
      </section>

      {/* SUBSCRIPTION PLANS */}
      {activeTab === "subscription" && (
        <section className="py-16 md:py-20 bg-slate-50/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
            {[
              { key: "cek-peluang", label: "🎯 Paket Cek Peluang PTN Satuan", color: "bg-indigo-500 text-white border-indigo-600", plans: cekPeluangPlans },
              { key: "trial", label: "Trial / Gratis", color: "bg-slate-100 text-slate-700 border-slate-200", plans: subscriptionPlans.filter((p) => p.id === "trial") },
              { key: "snbp", label: "🟠 Premium SNBP", color: "bg-orange-500 text-white border-orange-600", plans: subscriptionPlans.filter((p) => p.id.startsWith("premium-snbp")) },
              { key: "snbt", label: "🔵 Premium SNBT", color: "bg-blue-500 text-white border-blue-600", plans: subscriptionPlans.filter((p) => p.id.startsWith("premium-snbt")) },
              { key: "mandiri", label: "🟢 Premium Mandiri", color: "bg-teal-500 text-white border-teal-600", plans: subscriptionPlans.filter((p) => p.id.startsWith("premium-mandiri")) },
              { key: "vip", label: "👑 VIP All-in-One (SNBT + SNBP + Mandiri)", color: "bg-amber-500 text-white border-amber-600", plans: subscriptionPlans.filter((p) => p.id.startsWith("vip")) },
            ].map((group) => (
              <div key={group.key} className="space-y-6">
                <div className="flex items-center gap-3">
                  <Badge className={`px-3 py-1 text-xs font-bold border ${group.color}`}>{group.label}</Badge>
                  <div className="flex-1 h-px bg-slate-200" />
                </div>
                <StaggerContainer
                  className={`grid gap-6 ${
                    group.plans.length === 1
                      ? "grid-cols-1 max-w-sm"
                      : "grid-cols-2 lg:grid-cols-3"
                  }`}
                  staggerDelay={0.08}
                >
                  {group.plans.map((plan) => {
                    const Icon = plan.icon;
                    const isExpanded = expandedPlan === plan.id;
                    return (
                      <StaggerItem key={plan.id}>
                        <MotionCard className="h-full">
                          <Card className={`p-3 md:p-4 rounded-lg flex flex-col ${
                            plan.popular
                              ? "bg-slate-950 text-white border-slate-800 shadow-2xl ring-2 ring-blue-500/20"
                              : "bg-white border-slate-200 shadow-sm hover:shadow-md transition-shadow"
                          }`}>
                            {/* Header - Always Visible */}
                            <div className="space-y-2 pb-2 border-b border-slate-200/20">
                              <div className="flex items-center justify-between">
                                <div className={`h-7 w-7 md:h-9 md:w-9 rounded-lg flex items-center justify-center ${
                                  plan.popular ? "bg-blue-600/20 text-blue-400" : "bg-blue-50 text-blue-600"
                                }`}>
                                  <Icon className="h-3.5 w-3.5 md:h-4 md:w-4" />
                                </div>
                                {plan.badge && (
                                  <Badge className={`text-[9px] md:text-[10px] font-bold ${plan.badgeColor} px-1.5 py-0.5`}>{plan.badge}</Badge>
                                )}
                              </div>
                              <div>
                                <h3 className={`text-sm md:text-base font-black ${plan.popular ? "text-white" : "text-slate-900"} line-clamp-1`}>{plan.name}</h3>
                                <p className={`text-[10px] md:text-xs ${plan.popular ? "text-slate-400" : "text-slate-500"}`}>{plan.subtitle}</p>
                              </div>
                              <div className="flex items-baseline gap-1">
                                <span className={`text-base md:text-2xl font-black ${plan.popular ? "text-white" : "text-slate-900"}`}>{plan.priceDisplay}</span>
                                <span className={`text-[9px] md:text-xs font-semibold ${plan.popular ? "text-slate-400" : "text-slate-500"}`}>/ {plan.duration}</span>
                              </div>
                            </div>

                            {/* Features - Collapsible */}
                            {isExpanded && (
                              <ul className="space-y-2 py-3 border-b border-slate-200/20">
                                {plan.features.slice(0, 4).map((feature, idx) => (
                                  <li key={idx} className="flex items-start gap-2">
                                    {feature.included
                                      ? <CheckCircle2 className={`h-3.5 w-3.5 md:h-4 md:w-4 shrink-0 mt-0.5 ${plan.popular ? "text-blue-400" : "text-emerald-600"}`} />
                                      : <X className={`h-3.5 w-3.5 md:h-4 md:w-4 shrink-0 mt-0.5 ${plan.popular ? "text-slate-600" : "text-slate-300"}`} />}
                                    <span className={`text-xs md:text-sm leading-[1.6] ${
                                      feature.included
                                        ? plan.popular ? "text-slate-200 font-medium" : "text-slate-700 font-medium"
                                        : plan.popular ? "text-slate-600" : "text-slate-400"
                                    }`}>{feature.name}</span>
                                  </li>
                                ))}
                              </ul>
                            )}

                            {/* Action Buttons */}
                            <div className="space-y-1.5 pt-2">
                              <Button
                                onClick={() => setExpandedPlan(isExpanded ? null : plan.id)}
                                variant="ghost"
                                className={`w-full h-8 text-[10px] md:text-xs font-semibold ${
                                  plan.popular ? "text-slate-300 hover:text-white hover:bg-slate-800" : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                                }`}
                              >
                                {isExpanded ? "Sembunyikan Detail" : "Lihat Detail Fitur"}
                              </Button>
                              
                              <Button
                                onClick={() => {
                                  if (group.key === "cek-peluang" || plan.id.startsWith("cek-peluang")) {
                                    setSelectedCekPeluangPlan(plan);
                                  } else {
                                    handleSelectPlan(plan);
                                  }
                                }}
                                disabled={processingPlan === plan.id}
                                className={`w-full h-9 md:h-10 font-bold text-xs md:text-sm rounded-lg touch-manipulation ${
                                  plan.popular
                                    ? "bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white shadow-lg shadow-blue-500/25"
                                    : plan.buttonVariant === "outline"
                                    ? "border-2 border-slate-200 bg-white text-slate-700 hover:bg-slate-50 active:bg-slate-100"
                                    : "bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white"
                                }`}
                              >
                                {processingPlan === plan.id
                                  ? <><Loader2 className="h-3.5 w-3.5 animate-spin" /><span>Memproses...</span></>
                                  : <span>{plan.buttonText}</span>}
                              </Button>
                            </div>
                          </Card>
                        </MotionCard>
                      </StaggerItem>
                    );
                  })}
                </StaggerContainer>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* PAKET BIMBEL 2027 */}
      {activeTab === "bimbel" && (
        <section className="py-16 md:py-20 bg-slate-50/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
            <FadeIn className="text-center space-y-3">
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900">Perbandingan Paket Bimbel 2027</h2>
              <p className="text-sm text-slate-500 max-w-xl mx-auto">
                Program bimbingan belajar intensif dengan jumlah pertemuan, Try Out, dan pendampingan mentor.
              </p>
            </FadeIn>

            <StaggerContainer className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6" staggerDelay={0.1}>
              {bimbelPlans.map((plan) => {
                const Icon = plan.icon;
                const isExpanded = expandedPlan === plan.id;
                return (
                  <StaggerItem key={plan.id}>
                    <MotionCard className="h-full">
                      <Card className={`p-3 md:p-4 rounded-lg flex flex-col ${
                        plan.popular
                          ? "bg-slate-950 text-white border-slate-800 shadow-2xl ring-2 ring-blue-500/20"
                          : "bg-white border-slate-200 shadow-sm hover:shadow-md transition-shadow"
                      }`}>
                        {/* Header */}
                        <div className="space-y-2 pb-2 border-b border-slate-200/20">
                          <div className="flex items-center justify-between">
                            <div className={`h-7 w-7 md:h-9 md:w-9 rounded-lg flex items-center justify-center ${
                              plan.popular ? "bg-blue-600/20 text-blue-400" : "bg-blue-50 text-blue-600"
                            }`}>
                              <Icon className="h-3.5 w-3.5 md:h-4 md:w-4" />
                            </div>
                            {plan.badge && <Badge className={`text-[9px] md:text-[10px] font-bold ${plan.badgeColor} px-1.5 py-0.5`}>{plan.badge}</Badge>}
                          </div>
                          <div>
                            <h3 className={`text-sm md:text-base font-black ${plan.popular ? "text-white" : "text-slate-900"} line-clamp-1`}>{plan.name}</h3>
                            <p className={`text-[10px] md:text-xs ${plan.popular ? "text-slate-400" : "text-slate-500"}`}>{plan.subtitle}</p>
                          </div>
                          <Badge variant="outline" className={`text-[9px] md:text-[10px] font-semibold ${plan.popular ? "border-blue-500/40 bg-blue-500/10 text-blue-300" : "border-blue-200 bg-blue-50 text-blue-700"}`}>
                            {plan.pertemuan}
                          </Badge>
                          <div className="flex items-baseline gap-1">
                            <span className={`text-base md:text-2xl font-black ${plan.popular ? "text-white" : "text-slate-900"}`}>{plan.priceDisplay}</span>
                            <span className={`text-[9px] md:text-xs font-semibold ${plan.popular ? "text-slate-400" : "text-slate-500"}`}>/ {plan.duration}</span>
                          </div>
                        </div>

                        {/* Features - Collapsible */}
                        {isExpanded && (
                          <ul className="space-y-2 py-3 border-b border-slate-200/20">
                            {plan.features.map((feature, idx) => (
                              <li key={idx} className="flex items-start gap-2">
                                {feature.included
                                  ? <CheckCircle2 className={`h-3.5 w-3.5 md:h-4 md:w-4 shrink-0 mt-0.5 ${plan.popular ? "text-blue-400" : "text-emerald-600"}`} />
                                  : <X className={`h-3.5 w-3.5 md:h-4 md:w-4 shrink-0 mt-0.5 ${plan.popular ? "text-slate-600" : "text-slate-300"}`} />}
                                <span className={`text-xs md:text-sm leading-[1.6] ${
                                  feature.included
                                    ? plan.popular ? "text-slate-200 font-medium" : "text-slate-700 font-medium"
                                    : plan.popular ? "text-slate-600" : "text-slate-400"
                                }`}>{feature.name}</span>
                              </li>
                            ))}
                          </ul>
                        )}

                        {/* Action Buttons */}
                        <div className="space-y-1.5 pt-2">
                          <Button
                            onClick={() => setExpandedPlan(isExpanded ? null : plan.id)}
                            variant="ghost"
                            className={`w-full h-8 text-[10px] md:text-xs font-semibold ${
                              plan.popular ? "text-slate-300 hover:text-white hover:bg-slate-800" : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                            }`}
                          >
                            {isExpanded ? "Sembunyikan Detail" : "Lihat Detail Fitur"}
                          </Button>
                          
                          <Button
                            onClick={() => handleSelectPlan(plan)}
                            disabled={processingPlan === plan.id}
                            className={`w-full h-9 md:h-10 font-bold text-xs md:text-sm rounded-lg touch-manipulation ${
                              plan.popular
                                ? "bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white shadow-lg shadow-blue-500/25"
                                : plan.buttonVariant === "outline"
                                ? "border-2 border-slate-200 bg-white text-slate-700 hover:bg-slate-50 active:bg-slate-100"
                                : "bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white"
                            }`}
                          >
                            {processingPlan === plan.id
                              ? <><Loader2 className="h-3.5 w-3.5 animate-spin" /><span>Memproses...</span></>
                              : <span>{plan.buttonText}</span>}
                          </Button>
                        </div>
                      </Card>
                    </MotionCard>
                  </StaggerItem>
                );
              })}
            </StaggerContainer>
          </div>
        </section>
      )}

      {/* TRY OUT PLANS */}
      {activeTab === "tryout" && (
        <section className="py-16 md:py-20 bg-slate-50/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
            <FadeIn className="text-center space-y-3">
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900">Paket Try Out — Beli Satuan</h2>
              <p className="text-sm text-slate-500 max-w-xl mx-auto">
                Tidak perlu berlangganan. Beli Try Out sesuai kebutuhan dan kerjakan kapan saja.
              </p>
            </FadeIn>
            <StaggerContainer className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6" staggerDelay={0.1}>
              {tryoutPlans.map((plan) => {
                const Icon = plan.icon;
                const isExpanded = expandedPlan === plan.id;
                return (
                  <StaggerItem key={plan.id}>
                    <MotionCard className="h-full">
                      <Card className={`p-3 md:p-4 rounded-lg flex flex-col ${
                        plan.popular
                          ? "bg-slate-950 text-white border-slate-800 shadow-2xl ring-2 ring-blue-500/20"
                          : "bg-white border-slate-200 shadow-sm hover:shadow-md transition-shadow"
                      }`}>
                        {/* Header */}
                        <div className="space-y-2 pb-2 border-b border-slate-200/20">
                          <div className="flex items-center justify-between">
                            <div className={`h-7 w-7 md:h-9 md:w-9 rounded-lg flex items-center justify-center ${
                              plan.popular ? "bg-blue-600/20 text-blue-400" : "bg-blue-50 text-blue-600"
                            }`}>
                              <Icon className="h-3.5 w-3.5 md:h-4 md:w-4" />
                            </div>
                            {plan.badge && <Badge className={`text-[9px] md:text-[10px] font-bold ${plan.badgeColor} px-1.5 py-0.5`}>{plan.badge}</Badge>}
                          </div>
                          <div className={`text-2xl md:text-4xl font-black ${plan.popular ? "text-blue-400" : "text-blue-600"}`}>{plan.quantity}</div>
                          <p className={`text-[10px] md:text-xs ${plan.popular ? "text-slate-400" : "text-slate-500"}`}>Try Out</p>
                          <div>
                            <h3 className={`text-sm md:text-base font-black ${plan.popular ? "text-white" : "text-slate-900"} line-clamp-1`}>{plan.name}</h3>
                            <p className={`text-[10px] md:text-xs ${plan.popular ? "text-slate-400" : "text-slate-500"}`}>{plan.subtitle}</p>
                          </div>
                          <div className={`text-base md:text-2xl font-black ${plan.popular ? "text-white" : "text-slate-900"}`}>{plan.priceDisplay}</div>
                        </div>

                        {/* Features - Collapsible */}
                        {isExpanded && (
                          <ul className="space-y-2 py-3 border-b border-slate-200/20">
                            {plan.features.map((feature, idx) => (
                              <li key={idx} className="flex items-start gap-2">
                                {feature.included
                                  ? <CheckCircle2 className={`h-3.5 w-3.5 md:h-4 md:w-4 shrink-0 mt-0.5 ${plan.popular ? "text-blue-400" : "text-emerald-600"}`} />
                                  : <X className={`h-3.5 w-3.5 md:h-4 md:w-4 shrink-0 mt-0.5 ${plan.popular ? "text-slate-600" : "text-slate-300"}`} />}
                                <span className={`text-xs md:text-sm leading-[1.6] ${
                                  feature.included
                                    ? plan.popular ? "text-slate-200 font-medium" : "text-slate-700 font-medium"
                                    : plan.popular ? "text-slate-600" : "text-slate-400"
                                }`}>{feature.name}</span>
                              </li>
                            ))}
                          </ul>
                        )}

                        {/* Action Buttons */}
                        <div className="space-y-1.5 pt-2">
                          <Button
                            onClick={() => setExpandedPlan(isExpanded ? null : plan.id)}
                            variant="ghost"
                            className={`w-full h-8 text-[10px] md:text-xs font-semibold ${
                              plan.popular ? "text-slate-300 hover:text-white hover:bg-slate-800" : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                            }`}
                          >
                            {isExpanded ? "Sembunyikan Detail" : "Lihat Detail Fitur"}
                          </Button>
                          
                          <Button
                            onClick={() => handleSelectPlan(plan)}
                            disabled={processingPlan === plan.id}
                            className={`w-full h-9 md:h-10 font-bold text-xs md:text-sm rounded-lg touch-manipulation ${
                              plan.popular
                                ? "bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white shadow-lg shadow-blue-500/25"
                                : plan.buttonVariant === "outline"
                                ? "border-2 border-slate-200 bg-white text-slate-700 hover:bg-slate-50 active:bg-slate-100"
                                : "bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white"
                            }`}
                          >
                            {processingPlan === plan.id
                              ? <><Loader2 className="h-3.5 w-3.5 animate-spin" /><span>Memproses...</span></>
                              : <span>{plan.buttonText}</span>}
                          </Button>
                        </div>
                      </Card>
                    </MotionCard>
                  </StaggerItem>
                );
              })}
            </StaggerContainer>
          </div>
        </section>
      )}

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

      {/* Modal Pemilihan Jalur (SNBP / SNBT) untuk Paket Cek Peluang */}
      {selectedCekPeluangPlan && (
        <Dialog
          open={!!selectedCekPeluangPlan}
          onOpenChange={(open) => {
            if (!open) setSelectedCekPeluangPlan(null);
          }}
        >
          <DialogContent className="max-w-md rounded-3xl p-6 sm:p-7">
            <DialogHeader>
              <div className="flex items-center gap-2 mb-1">
                <Badge className="bg-indigo-100 text-indigo-700 border-indigo-200 text-xs font-extrabold">
                  🎯 Cek Peluang PTN
                </Badge>
              </div>
              <DialogTitle className="text-xl font-black text-slate-900">
                Pilih Jalur Cek Peluang
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500">
                Pilih jalur seleksi yang ingin kamu analisis untuk{" "}
                <span className="font-bold text-slate-800">
                  {selectedCekPeluangPlan.name}
                </span>{" "}
                ({selectedCekPeluangPlan.priceDisplay}).
              </DialogDescription>
            </DialogHeader>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 py-3">
              {/* Pilihan SNBP */}
              <button
                type="button"
                onClick={() => handleSelectTrack("snbp")}
                className="group relative flex flex-col justify-between p-4 rounded-2xl border-2 border-orange-200 hover:border-orange-500 bg-orange-50/40 hover:bg-orange-50/90 transition-all text-left shadow-xs hover:shadow-md active:scale-[0.98] cursor-pointer"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-lg">🟠</span>
                    <Badge className="bg-orange-500 text-white border-orange-600 text-[10px] font-bold">
                      Jalur Rapor
                    </Badge>
                  </div>
                  <div>
                    <h4 className="text-base font-black text-slate-900 group-hover:text-orange-600 transition-colors">
                      SNBP
                    </h4>
                    <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">
                      Analisis peluang lolos berbasis <strong>nilai rapor semester 1-5</strong> & sertifikat prestasi.
                    </p>
                  </div>
                </div>
                <div className="pt-3 mt-2 border-t border-orange-200/60 flex items-center justify-between text-xs font-bold text-orange-600">
                  <span>Pilih SNBP</span>
                  <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                </div>
              </button>

              {/* Jalur SNBT */}
              <button
                type="button"
                onClick={() => handleSelectTrack("snbt")}
                className="group relative flex flex-col justify-between p-4 rounded-2xl border-2 border-blue-200 hover:border-blue-500 bg-blue-50/40 hover:bg-blue-50/90 transition-all text-left shadow-xs hover:shadow-md active:scale-[0.98] cursor-pointer"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-lg">🔵</span>
                    <Badge className="bg-blue-600 text-white border-blue-600 text-[10px] font-bold">
                      Jalur UTBK
                    </Badge>
                  </div>
                  <div>
                    <h4 className="text-base font-black text-slate-900 group-hover:text-blue-600 transition-colors">
                      SNBT
                    </h4>
                    <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">
                      Rasionalisasi peluang lolos berbasis <strong>skor UTBK & Try Out</strong> subtes lengkap.
                    </p>
                  </div>
                </div>
                <div className="pt-3 mt-2 border-t border-blue-200/60 flex items-center justify-between text-xs font-bold text-blue-600">
                  <span>Pilih SNBT</span>
                  <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                </div>
              </button>
            </div>

            <DialogFooter className="pt-1">
              <Button
                variant="outline"
                type="button"
                onClick={() => setSelectedCekPeluangPlan(null)}
                className="w-full sm:w-auto h-10 text-xs font-bold border-slate-200 rounded-xl"
              >
                Batal
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

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
