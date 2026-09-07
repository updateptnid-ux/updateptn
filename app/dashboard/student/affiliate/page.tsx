"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { applyForAffiliateAction } from "@/actions/affiliate";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Users,
  Loader2,
  AlertCircle,
  ArrowLeft,
  CheckCircle,
  Globe,
} from "lucide-react";

export default function ApplyAffiliatePage() {
  const router = useRouter();
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    socialMedia: "", // Instagram, TikTok, LinkedIn, etc
    socialMediaUsername: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(true);

  // Load user data on mount
  useEffect(() => {
    async function loadUserData() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        // Auto-fill email from auth
        setForm(prev => ({
          ...prev,
          email: user.email || ""
        }));

        // Try to get name from profile
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('id', user.id)
          .single();

        if (profile?.full_name) {
          setForm(prev => ({
            ...prev,
            fullName: profile.full_name || ""
          }));
        }
      }
      setLoading(false);
    }

    loadUserData();
  }, []);

  const socialPlatforms = [
    { 
      id: "instagram", 
      name: "Instagram", 
      icon: "/social-icons/instagram.png",
      placeholder: "https://instagram.com/username"
    },
    { 
      id: "tiktok", 
      name: "TikTok", 
      icon: "/social-icons/tik-tok.png",
      placeholder: "https://tiktok.com/@username"
    },
    { 
      id: "twitter", 
      name: "Twitter / X", 
      iconComponent: <Globe className="h-4 w-4 text-blue-400" />,
      placeholder: "https://twitter.com/username"
    },
    { 
      id: "linkedin", 
      name: "LinkedIn", 
      icon: "/social-icons/linkedin.png",
      placeholder: "https://linkedin.com/in/username"
    },
    { 
      id: "youtube", 
      name: "YouTube", 
      iconComponent: <Globe className="h-4 w-4 text-red-600" />,
      placeholder: "https://youtube.com/@username"
    },
    { 
      id: "facebook", 
      name: "Facebook", 
      icon: "/social-icons/communication.png",
      placeholder: "https://facebook.com/username"
    },
    { 
      id: "other", 
      name: "Lainnya", 
      iconComponent: <Globe className="h-4 w-4 text-slate-600" />,
      placeholder: "https://..."
    },
  ];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    const result = await applyForAffiliateAction(form);

    if (result.success) {
      setSuccess(true);
    } else {
      setError(result.message || "Gagal mendaftar");
    }
    setSubmitting(false);
  }

  if (success) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full p-8 text-center space-y-4">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-100 mb-2">
            <CheckCircle className="h-8 w-8 text-emerald-600" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">Aplikasi Terkirim!</h2>
          <p className="text-sm text-slate-600">
            Terima kasih sudah mendaftar sebagai mitra afiliasi. Tim kami akan meninjau aplikasi Anda dalam 1-2 hari kerja.
          </p>
          <p className="text-xs text-slate-500">
            Kami akan mengirim email konfirmasi setelah aplikasi Anda disetujui.
          </p>
          <Button
            onClick={() => router.push("/dashboard/student")}
            className="mt-4 w-full"
          >
            Kembali ke Dashboard
          </Button>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-6">
      <div className="max-w-2xl mx-auto space-y-4">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.back()}
            className="rounded-lg"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Kembali
          </Button>
        </div>

        <Card className="p-6 md:p-8 space-y-6">
          <div className="text-center space-y-3">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 mb-2">
              <Users className="h-8 w-8 text-blue-600" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900">
              Gabung Program Afiliasi Update PTN
            </h1>
            <p className="text-sm text-slate-600 max-w-lg mx-auto">
              Ajak teman dan raih komisi <strong className="text-blue-600">10%</strong> dari setiap transaksi sukses. 
              Unlimited earning potential!
            </p>
          </div>

          {/* Benefits */}
          <div className="bg-blue-50 rounded-xl p-4 space-y-2">
            <p className="text-xs font-bold text-blue-900 mb-2">✨ Keuntungan Menjadi Mitra:</p>
            <ul className="text-xs text-blue-700 space-y-1.5">
              <li className="flex items-start gap-2">
                <span className="text-blue-600 shrink-0">✓</span>
                <span>Komisi 10% dari setiap pembelian paket (SNBT, SNBP, Mandiri, VIP)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 shrink-0">✓</span>
                <span>Dashboard tracking real-time untuk monitor performa</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 shrink-0">✓</span>
                <span>Kode referral unik yang mudah dibagikan</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 shrink-0">✓</span>
                <span>Penarikan dana mulai dari Rp 100.000</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 shrink-0">✓</span>
                <span>Gratis bergabung, tidak ada biaya pendaftaran</span>
              </li>
            </ul>
          </div>

          {error && (
            <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
              <p className="text-xs text-rose-700">{error}</p>
            </div>
          )}

          {/* Application Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName" className="text-xs font-bold text-slate-700">
                Nama Lengkap *
              </Label>
              <Input
                id="fullName"
                type="text"
                required
                value={form.fullName}
                onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                placeholder="Nama lengkap Anda"
                className="h-11 text-sm"
                style={{ fontSize: "16px" }}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-xs font-bold text-slate-700 flex items-center gap-2">
                Email *
                <span className="text-[10px] font-normal text-slate-500">(dari akun Anda)</span>
              </Label>
              <Input
                id="email"
                type="email"
                required
                value={form.email}
                disabled
                readOnly
                placeholder="email@example.com"
                className="h-11 text-sm bg-slate-50 cursor-not-allowed"
                style={{ fontSize: "16px" }}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone" className="text-xs font-bold text-slate-700">
                Nomor WhatsApp *
              </Label>
              <Input
                id="phone"
                type="tel"
                required
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="08123456789"
                className="h-11 text-sm"
                style={{ fontSize: "16px" }}
              />
            </div>

            {/* Social Media Section */}
            <div className="space-y-3 pt-3">
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-4 border border-blue-100">
                <Label className="text-sm font-bold text-slate-800 mb-1 block">
                  Media Sosial Promosi
                </Label>
                <p className="text-xs text-slate-600">
                  Pilih platform utama untuk mempromosikan referral link kamu
                </p>
              </div>

              {/* Elegant Platform Selection */}
              <div className="grid grid-cols-2 gap-3">
                {socialPlatforms.map((platform) => {
                  const isSelected = form.socialMedia === platform.id;
                  return (
                    <button
                      key={platform.id}
                      type="button"
                      onClick={() => setForm({ ...form, socialMedia: platform.id, socialMediaUsername: "" })}
                      className={`
                        group relative overflow-hidden
                        p-4 rounded-2xl border-2 
                        transition-all duration-300 ease-out
                        ${isSelected 
                          ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-blue-100 shadow-lg shadow-blue-200/50 scale-[1.02]' 
                          : 'border-slate-200 bg-white hover:border-blue-300 hover:shadow-md hover:scale-[1.01]'
                        }
                      `}
                    >
                      {/* Gradient Overlay on Hover */}
                      <div className={`
                        absolute inset-0 bg-gradient-to-br from-blue-500/5 to-indigo-500/5 
                        opacity-0 group-hover:opacity-100 transition-opacity duration-300
                        ${isSelected ? 'opacity-100' : ''}
                      `} />
                      
                      <div className="relative flex items-center gap-3">
                        {/* Icon */}
                        <div className={`
                          flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center
                          transition-all duration-300
                          ${isSelected 
                            ? 'bg-blue-500 shadow-md' 
                            : 'bg-slate-100 group-hover:bg-slate-200'
                          }
                        `}>
                          {platform.icon ? (
                            <Image 
                              src={platform.icon} 
                              alt={platform.name} 
                              width={20} 
                              height={20} 
                              className="object-contain"
                            />
                          ) : (
                            <div className={isSelected ? 'text-white' : ''}>
                              {platform.iconComponent}
                            </div>
                          )}
                        </div>
                        
                        {/* Name */}
                        <div className="flex-1 text-left">
                          <span className={`
                            text-sm font-bold transition-colors
                            ${isSelected ? 'text-blue-700' : 'text-slate-700 group-hover:text-blue-600'}
                          `}>
                            {platform.name}
                          </span>
                        </div>

                        {/* Checkmark */}
                        {isSelected && (
                          <div className="flex-shrink-0">
                            <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center animate-in zoom-in duration-200">
                              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                              </svg>
                            </div>
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Username Input with Elegant Design */}
              {form.socialMedia && (
                <div className="space-y-2 animate-in slide-in-from-top-2 duration-300">
                  <Label htmlFor="socialMediaUsername" className="text-xs font-bold text-slate-700 flex items-center gap-2">
                    {socialPlatforms.find(p => p.id === form.socialMedia)?.icon ? (
                      <div className="w-5 h-5 rounded-lg bg-slate-100 flex items-center justify-center">
                        <Image 
                          src={socialPlatforms.find(p => p.id === form.socialMedia)!.icon!} 
                          alt="Icon" 
                          width={14} 
                          height={14} 
                          className="object-contain" 
                        />
                      </div>
                    ) : (
                      <div className="w-5 h-5 rounded-lg bg-slate-100 flex items-center justify-center">
                        {socialPlatforms.find(p => p.id === form.socialMedia)?.iconComponent}
                      </div>
                    )}
                    <span>
                      {form.socialMedia === "instagram" && "Link Instagram"}
                      {form.socialMedia === "tiktok" && "Link TikTok"}
                      {form.socialMedia === "twitter" && "Link Twitter/X"}
                      {form.socialMedia === "linkedin" && "Link LinkedIn"}
                      {form.socialMedia === "youtube" && "Link YouTube"}
                      {form.socialMedia === "facebook" && "Link Facebook"}
                      {form.socialMedia === "other" && "Link Lainnya"}
                    </span>
                  </Label>
                  <Input
                    id="socialMediaUsername"
                    type="url"
                    value={form.socialMediaUsername}
                    onChange={(e) => setForm({ ...form, socialMediaUsername: e.target.value })}
                    placeholder={socialPlatforms.find(p => p.id === form.socialMedia)?.placeholder}
                    className="h-12 text-sm border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all"
                    style={{ fontSize: "16px" }}
                  />
                </div>
              )}
            </div>

            <Button
              type="submit"
              disabled={submitting}
              className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Mengirim Aplikasi...
                </>
              ) : (
                "Daftar Sekarang (Gratis)"
              )}
            </Button>
          </form>

          <p className="text-xs text-slate-500 text-center">
            Dengan mendaftar, Anda menyetujui syarat dan ketentuan program afiliasi kami.
          </p>
        </Card>
      </div>
    </div>
  );
}
