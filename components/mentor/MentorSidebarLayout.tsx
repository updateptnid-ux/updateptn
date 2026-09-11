"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { signOutAction } from "@/actions/auth";
import {
  LayoutDashboard,
  Video,
  PlaySquare,
  BookOpen,
  CalendarDays,
  UserCircle2,
  LogOut,
  Menu,
  ChevronRight,
  GraduationCap,
  Home,
  ShieldCheck,
} from "lucide-react";

interface MentorSidebarLayoutProps {
  children: React.ReactNode;
  user: {
    name: string;
    email: string;
  };
}

const navItems = [
  { name: "Beranda", href: "/mentor", icon: LayoutDashboard, exact: true },
  { name: "Live Class", href: "/mentor/live-class", icon: Video, exact: false },
  { name: "Modul Belajar", href: "/mentor/modul", icon: BookOpen, exact: false },
  { name: "Jadwal Mengajar", href: "/mentor/jadwal", icon: CalendarDays, exact: false },
  { name: "Profil Saya", href: "/mentor/profil", icon: UserCircle2, exact: false },
];

const EASE = [0.25, 0.46, 0.45, 0.94] as [number, number, number, number];

function NavLink({ item, pathname, onClick }: {
  item: (typeof navItems)[0];
  pathname: string;
  onClick?: () => void;
}) {
  const isActive = item.exact ? pathname === item.href : pathname.startsWith(item.href);
  const Icon = item.icon;

  return (
    <motion.div
      whileHover={{ scale: 1.02, x: 3 }}
      whileTap={{ scale: 0.97 }}
      transition={{ duration: 0.18, ease: EASE }}
    >
      <Link
        href={item.href}
        onClick={onClick}
        className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
          isActive
            ? "bg-blue-600/10 text-blue-700 shadow-xs border border-blue-500/20 font-bold"
            : "text-slate-600 hover:bg-slate-100/80 hover:text-slate-900"
        }`}
      >
        <div className="flex items-center gap-3">
          <div className={`p-1.5 rounded-lg transition-colors ${isActive ? "bg-blue-600/15" : "bg-transparent"}`}>
            <Icon className={`h-4 w-4 ${isActive ? "text-blue-600" : "text-slate-400"}`} />
          </div>
          <span>{item.name}</span>
        </div>
        {isActive && <ChevronRight className="h-3.5 w-3.5 text-blue-400" />}
      </Link>
    </motion.div>
  );
}

function getInitials(name: string) {
  return name.split(" ").map((n) => n[0]).join("").substring(0, 2).toUpperCase();
}

export default function MentorSidebarLayout({ children, user }: MentorSidebarLayoutProps) {
  const pathname = usePathname();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  // Check if user is actually admin
  useEffect(() => {
    async function checkAdminAccess() {
      try {
        const { createClient } = await import("@/lib/supabase/client");
        const supabase = createClient();
        
        const { data: { user: currentUser } } = await supabase.auth.getUser();
        if (!currentUser) {
          console.log("[Mentor Panel] No user found");
          return;
        }

        const ADMIN_EMAILS = ["updateptnid@gmail.com", "admin@updateptn.id"];
        const isAdminEmail = ADMIN_EMAILS.includes(currentUser.email?.toLowerCase() || "");

        console.log("[Mentor Panel] Email:", currentUser.email);
        console.log("[Mentor Panel] Is admin email:", isAdminEmail);

        if (isAdminEmail) {
          setIsAdmin(true);
          console.log("[Mentor Panel] Admin access: TRUE (email match)");
          return;
        }

        // Check if user has admin role in profiles
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", currentUser.id)
          .maybeSingle();

        const hasAdminRole = profile?.role === "admin";
        console.log("[Mentor Panel] Profile role:", profile?.role);
        console.log("[Mentor Panel] Admin access: ", hasAdminRole);
        
        setIsAdmin(hasAdminRole);
      } catch (err) {
        console.error("Error checking admin access:", err);
      }
    }

    checkAdminAccess();
  }, []);

  return (
    <div className="h-screen overflow-hidden bg-slate-50/70 flex flex-col md:flex-row font-sans">
      {/* Mobile Header */}
      <header className="md:hidden bg-white/80 backdrop-blur-md border-b border-slate-200/80 h-16 px-4 flex items-center justify-between sticky top-0 z-40 shadow-xs shrink-0">
        <Link href="/mentor" className="flex items-center gap-2">
          <Image src="/logo.svg" alt="UpdatePTN" width={32} height={32} className="h-8 w-auto object-contain" />
          <span className="font-extrabold text-lg text-slate-900">
            Update<span className="text-blue-600">PTN</span>
          </span>
        </Link>
        <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
          <SheetTrigger render={
            <Button variant="outline" size="icon" className="rounded-xl border-slate-200/80 touch-manipulation">
              <Menu className="h-5 w-5 text-slate-700" />
            </Button>
          } />
          <SheetContent side="left" className="w-[85vw] max-w-xs sm:w-80 p-6 bg-white/95 backdrop-blur-xl flex flex-col justify-between border-r border-slate-200/80">
            <div className="space-y-6">
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2 text-left">
                  <Image src="/logo.svg" alt="UpdatePTN" width={32} height={32} className="h-8 w-auto object-contain" />
                  <div>
                    <span className="font-extrabold text-lg text-slate-900 block">
                      Update<span className="text-blue-600">PTN</span>
                    </span>
                    <span className="text-[11px] font-semibold text-blue-500 block">Panel Tentor</span>
                  </div>
                </SheetTitle>
              </SheetHeader>
              <nav className="space-y-1">
                {navItems.map((item) => (
                  <NavLink key={item.href} item={item} pathname={pathname} onClick={() => setIsMobileOpen(false)} />
                ))}
              </nav>
            </div>
            {/* Mobile: Role Switcher & Logout */}
            <div className="space-y-3 pt-6 border-t border-slate-200/80">
              <div className="space-y-2">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-3">
                  Pindah Menu
                </p>
                <Link
                  href="/dashboard/student"
                  className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors touch-manipulation"
                >
                  <Home className="h-4 w-4 text-slate-400" />
                  <span>Menu Siswa</span>
                </Link>
                {isAdmin && (
                  <Link
                    href="/hq-core-updateptn"
                    className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors touch-manipulation"
                  >
                    <ShieldCheck className="h-4 w-4 text-slate-400" />
                    <span>Menu Admin</span>
                  </Link>
                )}
              </div>
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

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-slate-200 p-6 justify-between shrink-0 h-screen">
        <div className="space-y-8">
          {/* Brand */}
          <Link href="/mentor" className="flex items-center gap-2.5 group">
            <Image
              src="/logo.svg"
              alt="UpdatePTN"
              width={36}
              height={36}
              className="h-9 w-auto object-contain transition-transform group-hover:scale-105"
            />
            <div>
              <span className="font-extrabold text-xl tracking-tight text-slate-900 block leading-tight">
                Update<span className="text-blue-600">PTN</span>
              </span>
              <span className="text-[11px] font-semibold text-blue-500 block">Panel Tentor</span>
            </div>
          </Link>

          {/* Tentor Badge */}
          <div className="flex items-center gap-2 bg-blue-50 border border-blue-200/70 rounded-xl px-3 py-2">
            <GraduationCap className="h-3.5 w-3.5 text-blue-500 shrink-0" />
            <span className="text-[11px] font-bold text-blue-600 leading-tight">Panel Khusus Tentor</span>
          </div>

          {/* Nav */}
          <div className="space-y-2">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-1">
              Menu Pembelajaran
            </p>
            <nav className="space-y-1">
              {navItems.map((item) => (
                <NavLink key={item.href} item={item} pathname={pathname} />
              ))}
            </nav>
          </div>
        </div>

        {/* Footer: Role Switcher, Profile & Logout */}
        <div className="space-y-4 pt-6 border-t border-slate-200">
          <div className="flex items-center gap-3 p-2 rounded-xl bg-blue-50/60 border border-blue-200/60">
            <Avatar className="h-9 w-9 border-2 border-blue-200">
              <AvatarFallback className="bg-blue-600 text-white font-bold text-xs">
                {getInitials(user.name)}
              </AvatarFallback>
            </Avatar>
            <div className="overflow-hidden">
              <p className="text-xs font-bold text-slate-900 truncate">{user.name}</p>
              <p className="text-[11px] text-blue-500 truncate font-semibold">Tentor</p>
            </div>
          </div>
          
          {/* Role Switcher */}
          <div className="space-y-1">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2">
              Pindah Menu
            </p>
            <Link
              href="/dashboard/student"
              className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <Home className="h-3.5 w-3.5 text-slate-400" />
              <span>Menu Siswa</span>
            </Link>
            {isAdmin && (
              <Link
                href="/hq-core-updateptn"
                className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <ShieldCheck className="h-3.5 w-3.5 text-slate-400" />
                <span>Menu Admin</span>
              </Link>
            )}
          </div>

          <form action={signOutAction}>
            <Button
              type="submit"
              variant="outline"
              className="w-full h-10 justify-center border-slate-200 text-rose-600 hover:bg-rose-50 active:bg-rose-100 text-xs font-semibold rounded-xl gap-2 touch-manipulation transition-colors"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span>Keluar</span>
            </Button>
          </form>
        </div>
      </aside>

      {/* Content */}
      <main className="flex-1 min-w-0 max-w-full h-full md:h-screen p-3 sm:p-6 lg:p-8 pb-20 md:pb-12 overflow-y-auto custom-scrollbar overscroll-auto [&_*]:overscroll-auto">
        {children}
      </main>
    </div>
  );
}
