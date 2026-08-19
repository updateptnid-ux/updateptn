"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState } from "react";
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
} from "lucide-react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const navItems = [
    {
      name: "Dashboard & Try Out",
      href: "/dashboard/student",
      icon: LayoutDashboard,
    },
    {
      name: "Kalender",
      href: "/dashboard/student/kalender",
      icon: CalendarDays,
    },
    {
      name: "Latihan Per Subtes",
      href: "/dashboard/student/latihan-subtes",
      icon: BookOpen,
    },
    {
      name: "Beli Paket",
      href: "/pricing",
      icon: ShoppingCart,
    },
    {
      name: "Modul Belajar",
      href: "/dashboard/student/modul",
      icon: GraduationCap,
    },
    {
      name: "Live Class & Rekaman",
      href: "/dashboard/student/live-class",
      icon: Video,
    },
    {
      name: "Cek Peluang PTN",
      href: "/dashboard/student/cek-peluang",
      icon: Target,
    },
    {
      name: "Direktori PTN & Prodi",
      href: "/direktori-prodi",
      icon: BookOpen,
    },
    {
      name: "Live Rank SNBT",
      href: "/leaderboard",
      icon: Trophy,
    },
    {
      name: "Profil & Sandi",
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
          <SheetContent side="left" className="w-70 p-6 bg-white/95 backdrop-blur-xl flex flex-col justify-between border-r border-slate-200/80">
            <div className="space-y-6">
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

              <nav className="space-y-1.5">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;
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
                        className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
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

            <form action={signOutAction} className="pt-6 border-t border-slate-200/80">
              <Button variant="ghost" className="w-full justify-start text-rose-600 hover:bg-rose-50 rounded-xl gap-3">
                <LogOut className="h-4 w-4" />
                <span>Keluar Akun</span>
              </Button>
            </form>
          </SheetContent>
        </Sheet>
      </header>

      {/* Desktop Sidebar (Glassmorphic Layering & Pseudo-3D Depth) */}
      <aside className="hidden md:flex flex-col w-64 bg-white/80 backdrop-blur-md border-r border-slate-200/80 p-6 justify-between shrink-0 sticky top-0 h-screen shadow-xs">
        <div className="space-y-8">
          {/* Logo */}
          <Link href="/dashboard/student" className="flex items-center gap-2.5 group">
            <Image
              src="/logo.svg"
              alt="UpdatePTN Logo"
              width={36}
              height={36}
              className="h-9 w-auto object-contain transition-transform group-hover:scale-105"
            />
            <span className="font-extrabold text-xl tracking-tight text-slate-900">
              Update<span className="text-blue-600">PTN</span>
            </span>
          </Link>

          {/* Navigation Links */}
          <div className="space-y-2">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-3">
              Menu Utama
            </p>
            <nav className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <motion.div
                    key={item.href}
                    whileHover={{ scale: 1.02, x: 2 }}
                    whileTap={{ scale: 0.98 }}
                    transition={{ duration: 0.2, ease: PREMIUM_EASE }}
                  >
                    <Link
                      href={item.href}
                      className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                        isActive
                          ? "bg-blue-600/10 text-blue-600 shadow-xs border border-blue-600/20 font-bold"
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
        </div>

        {/* User Footer Profile & Sign Out */}
        <div className="space-y-4 pt-6 border-t border-slate-200/80">
          <div className="flex items-center gap-3 p-2 rounded-xl bg-slate-50/60 border border-slate-200/60">
            <Avatar className="h-9 w-9 border border-slate-200">
              <AvatarFallback className="bg-blue-600/10 text-blue-600 font-bold text-xs">AZ</AvatarFallback>
            </Avatar>
            <div className="overflow-hidden">
              <p className="text-xs font-bold text-slate-900 truncate">Siswa Pejuang PTN</p>
              <p className="text-[11px] text-slate-500 truncate">Paket Starter Active</p>
            </div>
          </div>

          <form action={signOutAction}>
            <Button
              type="submit"
              variant="outline"
              className="w-full h-9 justify-center border-slate-200/80 text-rose-600 hover:bg-rose-50/80 text-xs font-semibold rounded-xl gap-2 transition-all hover:shadow-xs"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span>Keluar</span>
            </Button>
          </form>
        </div>
      </aside>

      {/* Main Content Viewport */}
      <main className="flex-1 overflow-visible p-4 sm:p-8">
        {children}
      </main>
    </div>
  );
}
