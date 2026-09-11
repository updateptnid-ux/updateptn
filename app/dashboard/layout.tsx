"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useSearchParams } from "next/navigation";
import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { signOutAction } from "@/actions/auth";
import { createClient } from "@/lib/supabase/client";
import { PREMIUM_EASE } from "@/components/ui/fade-in";
import {
  GraduationCap,
  LayoutDashboard,
  Target,
  CalendarDays,
  Video,
  LogOut,
  Menu,
  ChevronRight,
  BookOpen,
  Trophy,
  UserCircle2,
  ShoppingCart,
  ShieldCheck,
  UserCog,
  FileText,
  MessageSquare,
  Users,
} from "lucide-react";

interface UserRole {
  isAdmin: boolean;
  isMentor: boolean;
  isKol: boolean;
  isBa: boolean;
  isMarketing: boolean;
  rawRole: string;
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [userRole, setUserRole] = useState<UserRole>({
    isAdmin: false,
    isMentor: false,
    isKol: false,
    isBa: false,
    isMarketing: false,
    rawRole: "student",
  });
  const [isActiveAffiliate, setIsActiveAffiliate] = useState(false);
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Helper to check if menu item is active
  const isMenuItemActive = (item: any) => {
    if ('divider' in item) return false;
    
    const currentUrl = pathname + (searchParams.toString() ? `?${searchParams.toString()}` : '');
    const itemUrl = item.href;
    
    // Exact match for items marked as exact
    if (item.exact) {
      return currentUrl === itemUrl;
    }
    
    // For items with query params, do exact match including query string
    if (itemUrl.includes('?')) {
      return currentUrl === itemUrl;
    }
    
    // FIXED: Do exact pathname match, not startsWith
    // This prevents /cek-peluang-snbp from matching /cek-peluang
    if (pathname === itemUrl && searchParams.toString() === '') {
      return true;
    }
    
    return false;
  };

  // Check user role real-time and synchronize session
  useEffect(() => {
    let isMounted = true;
    const supabase = createClient();
    let channel: any = null;

    async function checkUserRole() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user || !isMounted) return;

        const ADMIN_EMAILS = ["updateptnid@gmail.com", "admin@updateptn.id"];
        const isAdminEmail = ADMIN_EMAILS.includes(user.email?.toLowerCase() || "");

        // 1. Direct query to profiles table in real-time
        const { data: profile } = await supabase
          .from("profiles")
          .select("role, is_marketing, free_access")
          .eq("id", user.id)
          .maybeSingle();

        // 2. Also query /api/auth/sync-role for authoritative server check & session sync
        let serverRoleData: any = null;
        try {
          const syncRes = await fetch("/api/auth/sync-role", {
            method: "POST",
            headers: { "Cache-Control": "no-cache" },
          });
          if (syncRes.ok) {
            serverRoleData = await syncRes.json();
          }
        } catch (syncErr) {
          console.warn("[Dashboard] Background sync-role warning:", syncErr);
        }

        // Determine effective role
        const roleStr = (
          serverRoleData?.role ||
          profile?.role ||
          user.app_metadata?.role ||
          user.user_metadata?.role ||
          "student"
        ).toLowerCase();

        const isAdminRole = roleStr === "admin" || Boolean(serverRoleData?.isAdmin);
        const isKolRole = roleStr === "kol";
        const isBaRole = roleStr === "ba";
        const isMarketingRole = Boolean(
          serverRoleData?.isMarketing ||
          serverRoleData?.freeAccess ||
          profile?.is_marketing ||
          profile?.free_access
        );

        // KOL and BA cannot be admin or mentor
        const finalIsAdmin = (isAdminEmail || isAdminRole) && !isKolRole && !isBaRole;

        // Auto-refresh session token if role is admin but user app_metadata didn't have it
        if (finalIsAdmin && user.app_metadata?.role !== "admin") {
          try {
            await supabase.auth.refreshSession();
          } catch (refErr) {
            console.warn("[Dashboard] Session refresh warning:", refErr);
          }
        }

        // Check if user is in mentors table (KOL/BA cannot access mentor)
        let isMentorUser = false;
        if (!isKolRole && !isBaRole) {
          const { data: mentorRecord } = await supabase
            .from("mentors")
            .select("id")
            .eq("email", user.email!)
            .eq("status", "active")
            .maybeSingle();
          isMentorUser = !!mentorRecord;
        }

        if (isMounted) {
          setUserRole({
            isAdmin: finalIsAdmin,
            isMentor: isMentorUser,
            isKol: isKolRole,
            isBa: isBaRole,
            isMarketing: isMarketingRole,
            rawRole: roleStr,
          });
        }

        // Check if user is active affiliate (hidden for KOL / BA)
        if (isKolRole || isBaRole) {
          if (isMounted) setIsActiveAffiliate(false);
        } else {
          const { data: affiliate } = await supabase
            .from("affiliates")
            .select("status")
            .eq("user_id", user.id)
            .maybeSingle();

          if (isMounted) {
            setIsActiveAffiliate(affiliate?.status === "active");
          }
        }

        // Setup real-time listener on public:profiles for this user
        if (!channel && user.id) {
          channel = supabase
            .channel(`dashboard-profile-sync-${user.id}`)
            .on(
              "postgres_changes",
              {
                event: "*",
                schema: "public",
                table: "profiles",
                filter: `id=eq.${user.id}`,
              },
              () => {
                checkUserRole();
              }
            )
            .subscribe();
        }
      } catch (err) {
        console.error("Error checking user role in DashboardLayout:", err);
      }
    }

    checkUserRole();

    const handleFocus = () => checkUserRole();
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") checkUserRole();
    };

    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      isMounted = false;
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [pathname]);

  const navItems = [
    {
      name: "Dashboard",
      href: "/dashboard/student",
      icon: LayoutDashboard,
      exact: true,
    },
    {
      name: "Beli Paket",
      href: "/pricing",
      icon: ShoppingCart,
    },
    // SECTION DIVIDER
    { divider: "TRY OUT" },
    {
      name: "Try Out SNBT",
      href: "/dashboard/student/tryout-snbt",
      icon: FileText,
    },
    {
      name: "Try Out Mandiri",
      href: "/dashboard/student/tryout-mandiri",
      icon: GraduationCap,
    },
    {
      name: "Latihan Subtes",
      href: "/dashboard/student/latihan-subtes",
      icon: BookOpen,
    },
    // SECTION DIVIDER
    { divider: "CEK PELUANG" },
    {
      name: "Cek Peluang SNBP",
      href: "/dashboard/student/cek-peluang-snbp",
      icon: Target,
    },
    {
      name: "Cek Peluang SNBT",
      href: "/dashboard/student/cek-peluang",
      icon: Target,
    },
    // SECTION DIVIDER
    { divider: "BELAJAR" },
    {
      name: "Modul Belajar",
      href: "/dashboard/student/modul",
      icon: BookOpen,
    },
    {
      name: "Live Class",
      href: "/dashboard/student/live-class",
      icon: Video,
    },
    {
      name: "Kalender",
      href: "/dashboard/student/kalender",
      icon: CalendarDays,
    },
    // SECTION DIVIDER
    { divider: "LAINNYA" },
    {
      name: "Berikan Feedback",
      href: "/dashboard/student/feedback",
      icon: MessageSquare,
    },
    {
      name: "Profil",
      href: "/profile",
      icon: UserCircle2,
    },
  ];

  // Filter out transaction/pricing navigation for KOL and BA roles
  const displayedNavItems = useMemo(() => {
    if (userRole.isKol || userRole.isBa) {
      return navItems.filter((item) => !('href' in item && item.href === '/pricing'));
    }
    return navItems;
  }, [userRole.isKol, userRole.isBa]);

  return (
    <div className="h-screen overflow-hidden bg-slate-50/70 flex flex-col md:flex-row font-sans">
      {/* Mobile Top Header (Glassmorphic Layer) */}
      <header className="md:hidden bg-white/80 backdrop-blur-md border-b border-slate-200/80 h-16 px-4 flex items-center justify-between sticky top-0 z-40 shadow-xs shrink-0">
        <Link href="/dashboard/student" className="flex items-center gap-2">
          <Image
            src="/logo.svg"
            alt="UpdatePTN Logo"
            width={32}
            height={32}
            className="h-8 w-auto object-contain"
          />
          <span className="font-extrabold text-lg text-slate-900">
            Update<span className="text-blue-600">PTN</span>
          </span>
        </Link>

        <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
          <SheetTrigger render={
            <Button variant="outline" size="icon" className="rounded-xl border-slate-200/80 bg-white/50 backdrop-blur-xs hover:bg-slate-100">
              <Menu className="h-5 w-5 text-slate-700" />
            </Button>
          } />
          <SheetContent side="left" className="w-[85vw] max-w-xs sm:w-80 p-0 bg-white/95 backdrop-blur-xl flex flex-col border-r border-slate-200/80">
            {/* Fixed Header */}
            <div className="shrink-0 p-6 pb-4 border-b border-slate-200/80">
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2 text-left">
                  <Image
                    src="/logo.svg"
                    alt="UpdatePTN Logo"
                    width={32}
                    height={32}
                    className="h-8 w-auto object-contain"
                  />
                  <span className="font-extrabold text-lg text-slate-900">
                    Update<span className="text-blue-600">PTN</span>
                  </span>
                </SheetTitle>
              </SheetHeader>
            </div>

            {/* Scrollable Menu */}
            <div className="flex-1 overflow-y-auto overscroll-contain px-4 py-4 min-h-0" style={{ WebkitOverflowScrolling: 'touch' }}>
              <nav className="space-y-1 pb-4">
                {displayedNavItems.map((item) => {
                  // Render divider
                  if ('divider' in item) {
                    return (
                      <div key={item.divider} className="pt-4 pb-2 px-2">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          {item.divider}
                        </p>
                      </div>
                    );
                  }

                  const Icon = item.icon;
                  const isActive = isMenuItemActive(item);
                  return (
                    <motion.div
                      key={item.href}
                      whileHover={{ scale: 1.02, x: 2 }}
                      whileTap={{ scale: 0.98 }}
                      transition={{ duration: 0.2, ease: PREMIUM_EASE }}
                    >
                      <Link
                        href={item.href}
                        onClick={() => setIsMobileOpen(false)}
                        className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                          isActive
                            ? "bg-blue-600/10 text-blue-600 shadow-xs border border-blue-600/20"
                            : "text-slate-600 hover:bg-slate-100/80 hover:text-slate-900"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Icon className={`h-4 w-4 ${isActive ? "text-blue-600" : "text-slate-400"}`} />
                          <span>{item.name}</span>
                        </div>
                      </Link>
                    </motion.div>
                  );
                })}
              </nav>
            </div>

            {/* Fixed Footer */}
            <div className="shrink-0 space-y-3 p-4 border-t border-slate-200/80 bg-white/95">
              {(userRole.isAdmin || userRole.isMentor || isActiveAffiliate) && (
                <div className="space-y-2">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-3">
                    Pindah Menu
                  </p>
                  {isActiveAffiliate && (
                    <Link
                      href="/dashboard/affiliate"
                      onClick={() => setIsMobileOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors touch-manipulation"
                    >
                      <Users className="h-4 w-4 text-slate-400" />
                      <span>Dashboard Affiliate</span>
                    </Link>
                  )}
                  {userRole.isMentor && (
                    <Link
                      href="/mentor"
                      onClick={() => setIsMobileOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors touch-manipulation"
                    >
                      <UserCog className="h-4 w-4 text-slate-400" />
                      <span>Menu Tentor</span>
                    </Link>
                  )}
                  {userRole.isAdmin && (
                    <Link
                      href="/hq-core-updateptn"
                      onClick={() => setIsMobileOpen(false)}
                      className="flex items-center justify-between gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100/80 border border-blue-200/80 transition-colors touch-manipulation"
                    >
                      <div className="flex items-center gap-2.5">
                        <ShieldCheck className="h-4 w-4 text-blue-600" />
                        <span>Menu Admin</span>
                      </div>
                      <span className="text-[10px] bg-blue-600 text-white px-2 py-0.5 rounded font-extrabold uppercase tracking-wider">
                        ADMIN HQ
                      </span>
                    </Link>
                  )}
                </div>
              )}
              <form action={signOutAction}>
                <Button 
                  type="submit"
                  variant="ghost" 
                  className="w-full h-12 justify-start text-rose-600 hover:bg-rose-50 active:bg-rose-100 rounded-xl gap-3 font-semibold touch-manipulation transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Keluar Akun</span>
                </Button>
              </form>
            </div>
          </SheetContent>
        </Sheet>
      </header>

      {/* Desktop Sidebar (Glassmorphic Layering & Pseudo-3D Depth) */}
      <aside className="hidden md:flex flex-col w-64 bg-white/80 backdrop-blur-md border-r border-slate-200/80 shrink-0 h-screen shadow-xs">
        {/* Fixed Header with Logo */}
        <div className="p-4 border-b border-slate-200/80 shrink-0">
          <Link href="/dashboard/student" className="flex items-center gap-2 group">
            <Image
              src="/logo.svg"
              alt="UpdatePTN Logo"
              width={28}
              height={28}
              className="h-7 w-auto object-contain transition-transform group-hover:scale-105"
            />
            <span className="font-extrabold text-lg tracking-tight text-slate-900">
              Update<span className="text-blue-600">PTN</span>
            </span>
          </Link>
        </div>

        {/* Scrollable Navigation Links */}
        <div className="flex-1 overflow-y-auto overscroll-contain p-4 min-h-0" style={{ WebkitOverflowScrolling: 'touch' }}>
          <nav className="space-y-0.5 pb-4">
            {displayedNavItems.map((item) => {
              // Render divider
              if ('divider' in item) {
                return (
                  <div key={item.divider} className="pt-3 pb-1 px-2">
                    <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
                      {item.divider}
                    </p>
                  </div>
                );
              }

              const Icon = item.icon;
              const isActive = isMenuItemActive(item);
              return (
                <motion.div
                  key={item.href}
                  whileHover={{ scale: 1.01, x: 1 }}
                  whileTap={{ scale: 0.99 }}
                  transition={{ duration: 0.15, ease: PREMIUM_EASE }}
                >
                  <Link
                    href={item.href}
                    className={`flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-semibold transition-all ${
                      isActive
                        ? "bg-blue-600/10 text-blue-600 shadow-xs border border-blue-600/20"
                        : "text-slate-600 hover:bg-slate-100/80 hover:text-slate-900"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className={`h-3.5 w-3.5 ${isActive ? "text-blue-600" : "text-slate-400"}`} />
                      <span>{item.name}</span>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </nav>
        </div>

        {/* Fixed Footer: User Info & Sign Out */}
        <div className="p-4 space-y-3 border-t border-slate-200/80 shrink-0">
          <div className="flex items-center gap-2.5 p-2 rounded-lg bg-slate-50/60 border border-slate-200/60">
            <Avatar className="h-8 w-8 border border-slate-200">
              <AvatarFallback className="bg-blue-600/10 text-blue-600 font-bold text-[10px]">
                {userRole.isKol ? "KOL" : userRole.isBa ? "BA" : userRole.isAdmin ? "HQ" : "AZ"}
              </AvatarFallback>
            </Avatar>
            <div className="overflow-hidden">
              <p className="text-[11px] font-bold text-slate-900 truncate">
                {userRole.isKol
                  ? "Partner KOL"
                  : userRole.isBa
                  ? "Brand Ambassador"
                  : userRole.isAdmin
                  ? "Admin UpdatePTN"
                  : "Siswa Pejuang PTN"}
              </p>
              <p className="text-[10px] text-slate-500 truncate">
                {userRole.isKol || userRole.isBa
                  ? "Akses Khusus Tools"
                  : userRole.isMarketing
                  ? "Marketing VIP Pass"
                  : "Paket Starter"}
              </p>
            </div>
          </div>

          {/* Role Switcher */}
          {(userRole.isAdmin || userRole.isMentor || isActiveAffiliate) && (
            <div className="space-y-0.5">
              <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400 px-2 mb-1">
                Pindah Menu
              </p>
              {isActiveAffiliate && (
                <Link
                  href="/dashboard/affiliate"
                  className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  <Users className="h-3 w-3 text-slate-400" />
                  <span>Dashboard Affiliate</span>
                </Link>
              )}
              {userRole.isMentor && (
                <Link
                  href="/mentor"
                  className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  <UserCog className="h-3 w-3 text-slate-400" />
                  <span>Menu Tentor</span>
                </Link>
              )}
              {userRole.isAdmin && (
                <Link
                  href="/hq-core-updateptn"
                  className="flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-lg text-[11px] font-bold text-blue-700 bg-blue-50/80 hover:bg-blue-100/80 border border-blue-200/60 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="h-3.5 w-3.5 text-blue-600" />
                    <span>Menu Admin</span>
                  </div>
                  <span className="text-[9px] bg-blue-600 text-white px-1.5 py-0.5 rounded font-extrabold uppercase tracking-wider">
                    ADMIN HQ
                  </span>
                </Link>
              )}
            </div>
          )}

          <form action={signOutAction}>
            <Button
              type="submit"
              variant="outline"
              className="w-full h-9 justify-center border-slate-200/80 text-rose-600 hover:bg-rose-50/80 active:bg-rose-100 text-[11px] font-semibold rounded-lg gap-2 transition-all"
            >
              <LogOut className="h-3 w-3" />
              <span>Keluar</span>
            </Button>
          </form>
        </div>
      </aside>

      {/* Main Content Viewport - Fixed Sidebar Layout with Touchpad & Mouse Scroll */}
      <main className="flex-1 min-w-0 max-w-full h-full md:h-screen overflow-y-auto custom-scrollbar overscroll-auto [&_*]:overscroll-auto">
        <div className="p-0 pb-20 md:pb-12 w-full max-w-full min-h-full">
          {children}
        </div>
      </main>
    </div>
  );
}
