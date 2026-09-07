"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { signOutAction } from "@/actions/auth";
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
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [userRole, setUserRole] = useState<UserRole>({ isAdmin: false, isMentor: false });
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Helper to check if menu item is active
  const isMenuItemActive = (item: any) => {
    if ('divider' in item) return false;
    
    const currentUrl = pathname + (searchParams.toString() ? `?${searchParams.toString()}` : '');
    const itemUrl = item.href;
    
    if (item.exact) {
      return currentUrl === itemUrl;
    }
    
    // For items with query params, do exact match including query string
    if (itemUrl.includes('?')) {
      return currentUrl === itemUrl;
    }
    
    // For items without query params, check pathname only (ignore search params)
    // AND make sure current URL doesn't have conflicting query params
    if (pathname.startsWith(itemUrl)) {
      // If pathname matches but there are search params, it's not active
      // (because this means another menu item with query params should be active)
      return searchParams.toString() === '';
    }
    
    return false;
  };

  // Check user role on mount
  useEffect(() => {
    async function checkUserRole() {
      try {
        const { createClient } = await import("@/lib/supabase/client");
        const supabase = createClient();
        
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const ADMIN_EMAILS = ["updateptnid@gmail.com", "admin@updateptn.id"];
        const isAdminEmail = ADMIN_EMAILS.includes(user.email?.toLowerCase() || "");

        // Check if user is in mentors table
        const { data: mentorRecord } = await supabase
          .from("mentors")
          .select("id")
          .eq("email", user.email!)
          .eq("status", "active")
          .maybeSingle();

        // Check if user has admin role in profiles
        let isAdminRole = false;
        if (!isAdminEmail) {
          const { data: profile } = await supabase
            .from("profiles")
            .select("role")
            .eq("id", user.id)
            .maybeSingle();
          isAdminRole = profile?.role === "admin";
        }

        setUserRole({
          isAdmin: isAdminEmail || isAdminRole,
          isMentor: !!mentorRecord,
        });
      } catch (err) {
        console.error("Error checking user role:", err);
      }
    }

    checkUserRole();
  }, []);

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
      name: "Cek Peluang SNBT",
      href: "/dashboard/student/cek-peluang",
      icon: Target,
    },
    {
      name: "Cek Peluang SNBP",
      href: "/dashboard/student/cek-peluang?type=snbp",
      icon: Target,
    },
    {
      name: "Kalkulator SNBP",
      href: "/dashboard/student/kalkulator-snbp",
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

  return (
    <div className="min-h-screen bg-slate-50/70 flex flex-col md:flex-row font-sans">
      {/* Mobile Top Header (Glassmorphic Layer) */}
      <header className="md:hidden bg-white/80 backdrop-blur-md border-b border-slate-200/80 h-16 px-4 flex items-center justify-between sticky top-0 z-40 shadow-xs">
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
          <SheetContent side="left" className="w-72 p-0 bg-white/95 backdrop-blur-xl flex flex-col border-r border-slate-200/80">
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
            <div className="flex-1 overflow-y-auto overscroll-contain px-4 py-4 custom-scrollbar-thin smooth-scroll min-h-0">
              <nav className="space-y-1 pb-4">
                {navItems.map((item) => {
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
              {(userRole.isAdmin || userRole.isMentor) && (
                <div className="space-y-2">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-3">
                    Pindah Menu
                  </p>
                  {userRole.isMentor && (
                    <Link
                      href="/mentor"
                      className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors touch-manipulation"
                    >
                      <UserCog className="h-4 w-4 text-slate-400" />
                      <span>Menu Tentor</span>
                    </Link>
                  )}
                  {userRole.isAdmin && (
                    <Link
                      href="/hq-core-updateptn"
                      className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors touch-manipulation"
                    >
                      <ShieldCheck className="h-4 w-4 text-slate-400" />
                      <span>Menu Admin</span>
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
      <aside className="hidden md:flex flex-col w-64 bg-white/80 backdrop-blur-md border-r border-slate-200/80 shrink-0 sticky top-0 h-screen shadow-xs">
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
        <div className="flex-1 overflow-y-auto overscroll-contain p-4 custom-scrollbar-thin smooth-scroll min-h-0">
          <nav className="space-y-0.5 pb-4">
            {navItems.map((item) => {
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
              <AvatarFallback className="bg-blue-600/10 text-blue-600 font-bold text-[10px]">AZ</AvatarFallback>
            </Avatar>
            <div className="overflow-hidden">
              <p className="text-[11px] font-bold text-slate-900 truncate">Siswa Pejuang PTN</p>
              <p className="text-[10px] text-slate-500 truncate">Paket Starter</p>
            </div>
          </div>

          {/* Role Switcher */}
          {(userRole.isAdmin || userRole.isMentor) && (
            <div className="space-y-0.5">
              <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400 px-2 mb-1">
                Pindah Menu
              </p>
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
                  className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  <ShieldCheck className="h-3 w-3 text-slate-400" />
                  <span>Menu Admin</span>
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

      {/* Main Content Viewport - Fixed Scrolling */}
      <main className="flex-1 overflow-y-auto overscroll-contain h-screen md:h-screen custom-scrollbar smooth-scroll">
        <div className="p-0">
          {children}
        </div>
      </main>
    </div>
  );
}
