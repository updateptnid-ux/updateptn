"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { signOutAction } from "@/actions/auth";
import {
  GraduationCap,
  LayoutDashboard,
  Users,
  UserCheck,
  CreditCard,
  Receipt,
  Ticket,
  Building2,
  GitBranch,
  BookOpen,
  PieChart,
  BookCheck,
  Bookmark,
  Layers,
  FileQuestion,
  FileSpreadsheet,
  BarChart3,
  Video,
  PlaySquare,
  FileText,
  Image as ImageIcon,
  HelpCircle,
  Bell,
  FolderArchive,
  ShieldAlert,
  Settings,
  LogOut,
  Menu,
  ChevronDown,
  ChevronRight,
  ShieldCheck,
  Search,
} from "lucide-react";

interface MenuItem {
  name: string;
  href: string;
  icon: any;
  badge?: string;
}

interface MenuGroup {
  groupName: string;
  items: MenuItem[];
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({
    "Main": true,
    "Users & Roles": true,
    "Sales": true,
    "Master Data": true,
    "Academic Core": true,
    "Content & Comms": true,
    "System": true,
  });

  const toggleGroup = (groupName: string) => {
    setOpenGroups((prev) => ({ ...prev, [groupName]: !prev[groupName] }));
  };

  // Obscure route paths matching /hq-core-updateptn
  const menuGroups: MenuGroup[] = [
    {
      groupName: "Main",
      items: [
        { name: "Dashboard Overview", href: "/hq-core-updateptn", icon: LayoutDashboard },
      ],
    },
    {
      groupName: "Users & Roles",
      items: [
        { name: "Siswa & Pengguna", href: "/hq-core-updateptn/users", icon: Users },
        { name: "Master Tutor & Mentor", href: "/hq-core-updateptn/mentors", icon: UserCheck },
      ],
    },
    {
      groupName: "Sales & Finance",
      items: [
        { name: "Langganan Active", href: "/hq-core-updateptn/subscriptions", icon: CreditCard },
        { name: "Transaksi Payment", href: "/hq-core-updateptn/payments", icon: Receipt },
        { name: "Voucher Diskon", href: "/hq-core-updateptn/vouchers", icon: Ticket },
      ],
    },
    {
      groupName: "Master Data PTN",
      items: [
        { name: "Universitas (PTN)", href: "/hq-core-updateptn/universities", icon: Building2 },
        { name: "Fakultas", href: "/hq-core-updateptn/faculties", icon: GitBranch },
        { name: "Program Studi (Major)", href: "/hq-core-updateptn/majors", icon: BookOpen },
        { name: "Kuota & Keketatan", href: "/hq-core-updateptn/quotas", icon: PieChart },
      ],
    },
    {
      groupName: "Academic Core",
      items: [
        { name: "Mata Pelajaran (Mapel)", href: "/hq-core-updateptn/subjects", icon: BookCheck },
        { name: "Bab Pelajaran", href: "/hq-core-updateptn/chapters", icon: Bookmark },
        { name: "Sub Bab Pelajaran", href: "/hq-core-updateptn/subchapters", icon: Layers },
        { name: "Bank Soal UTBK", href: "/hq-core-updateptn/questions", icon: FileQuestion },
        { name: "Paket Try Out", href: "/hq-core-updateptn/tryouts", icon: FileSpreadsheet },
        { name: "Hasil & Skor IRT", href: "/hq-core-updateptn/results", icon: BarChart3 },
        { name: "Modul Belajar", href: "/hq-core-updateptn/moduls", icon: FileText },
        { name: "Live Class Sesi", href: "/hq-core-updateptn/live-classes", icon: Video },
        { name: "Video Learning", href: "/hq-core-updateptn/videos", icon: PlaySquare },
      ],
    },
    {
      groupName: "Content & Comms",
      items: [
        { name: "Artikel & Berita", href: "/hq-core-updateptn/articles", icon: FileText },
        { name: "Banner Promosi", href: "/hq-core-updateptn/banners", icon: ImageIcon },
        { name: "FAQ Assistance", href: "/hq-core-updateptn/faqs", icon: HelpCircle },
        { name: "Broadcast Notifikasi", href: "/hq-core-updateptn/notifications", icon: Bell },
        { name: "Media Library", href: "/hq-core-updateptn/media", icon: FolderArchive },
      ],
    },
    {
      groupName: "System Control",
      items: [
        { name: "Audit Logs", href: "/hq-core-updateptn/audit-logs", icon: ShieldAlert },
        { name: "Pengaturan Sistem", href: "/hq-core-updateptn/settings", icon: Settings },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row font-sans">
      {/* Mobile Top Navbar */}
      <header className="md:hidden bg-white border-b border-slate-200 h-16 px-4 flex items-center justify-between sticky top-0 z-40">
        <Link href="/hq-core-updateptn" className="flex items-center gap-2">
          <Image
            src="/logo.svg"
            alt="UpdatePTN Logo"
            width={32}
            height={32}
            className="h-8 w-auto object-contain"
          />
          <span className="font-extrabold text-base text-slate-900">
            UpdatePTN <span className="text-blue-600 text-xs uppercase font-bold">HQ</span>
          </span>
        </Link>

        <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
          <SheetTrigger render={
            <Button variant="outline" size="icon" className="rounded-xl border-slate-200">
              <Menu className="h-5 w-5 text-slate-700" />
            </Button>
          } />
          <SheetContent side="left" className="w-75 p-4 bg-white flex flex-col justify-between overflow-y-auto">
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
                    HQ Core Console
                  </span>
                </SheetTitle>
              </SheetHeader>

              <nav className="space-y-4">
                {menuGroups.map((group) => (
                  <div key={group.groupName} className="space-y-1">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-3">
                      {group.groupName}
                    </p>
                    {group.items.map((item) => {
                      const Icon = item.icon;
                      const isActive = pathname === item.href;
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={() => setIsMobileOpen(false)}
                          className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${
                            isActive
                              ? "bg-blue-50 text-blue-600"
                              : "text-slate-600 hover:bg-slate-100"
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <Icon className={`h-4 w-4 ${isActive ? "text-blue-600" : "text-slate-400"}`} />
                            <span>{item.name}</span>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                ))}
              </nav>
            </div>

            <form action={signOutAction} className="pt-4 border-t border-slate-200 mt-6">
              <Button variant="ghost" className="w-full justify-start text-rose-600 hover:bg-rose-50 rounded-xl gap-3 text-xs">
                <LogOut className="h-4 w-4" />
                <span>Keluar HQ</span>
              </Button>
            </form>
          </SheetContent>
        </Sheet>
      </header>

      {/* Desktop Collapsible Left Sidebar */}
      <aside className="hidden md:flex flex-col w-72 bg-white border-r border-slate-200 justify-between shrink-0 sticky top-0 h-screen overflow-y-auto p-4 space-y-6">
        <div className="space-y-6">
          {/* Admin Brand */}
          <Link href="/hq-core-updateptn" className="flex items-center gap-3 px-2 pt-2">
            <Image
              src="/logo.svg"
              alt="UpdatePTN Logo"
              width={36}
              height={36}
              className="h-9 w-auto object-contain"
            />
            <div>
              <span className="font-extrabold text-lg tracking-tight text-slate-900 block leading-tight">
                Update<span className="text-blue-600">PTN</span>
              </span>
              <Badge variant="outline" className="text-[10px] bg-blue-50 text-blue-700 border-blue-200 font-bold px-1.5 py-0">
                HQ CORE CONSOLE
              </Badge>
            </div>
          </Link>

          {/* Grouped Sidebar Menu */}
          <div className="space-y-5">
            {menuGroups.map((group) => {
              const isOpen = openGroups[group.groupName] ?? true;
              return (
                <div key={group.groupName} className="space-y-1">
                  <button
                    onClick={() => toggleGroup(group.groupName)}
                    className="w-full flex items-center justify-between px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-slate-400 hover:text-slate-700 transition-colors"
                  >
                    <span>{group.groupName}</span>
                    {isOpen ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
                  </button>

                  {isOpen && (
                    <nav className="space-y-0.5 pt-1">
                      {group.items.map((item) => {
                        const Icon = item.icon;
                        const isActive = pathname === item.href;
                        return (
                          <Link
                            key={item.href}
                            href={item.href}
                            className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                              isActive
                                ? "bg-blue-50 text-blue-600 font-bold shadow-2xs"
                                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                            }`}
                          >
                            <div className="flex items-center gap-2.5">
                              <Icon className={`h-4 w-4 ${isActive ? "text-blue-600" : "text-slate-400"}`} />
                              <span>{item.name}</span>
                            </div>
                          </Link>
                        );
                      })}
                    </nav>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Admin Footer Profile & Logout */}
        <div className="pt-4 border-t border-slate-200 space-y-3 shrink-0">
          <div className="flex items-center gap-3 px-2">
            <Avatar className="h-9 w-9 border border-slate-200">
              <AvatarFallback className="bg-blue-600 text-white font-bold text-xs">HQ</AvatarFallback>
            </Avatar>
            <div className="overflow-hidden">
              <p className="text-xs font-bold text-slate-900 truncate">Super Admin</p>
              <p className="text-[11px] text-slate-400 truncate">admin@updateptn.id</p>
            </div>
          </div>

          <form action={signOutAction}>
            <Button
              type="submit"
              variant="outline"
              className="w-full h-9 justify-center border-slate-200 text-rose-600 hover:bg-rose-50 text-xs font-semibold rounded-xl gap-2"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span>Keluar HQ</span>
            </Button>
          </form>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header Bar */}
        <header className="hidden md:flex bg-white border-b border-slate-200 h-16 px-8 items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-3 w-80">
            <div className="relative w-full">
              <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Cari modul admin, pengguna, atau soal..."
                className="w-full pl-10 pr-4 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-900"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="rounded-xl relative text-slate-600 hover:bg-slate-100">
              <Bell className="h-4 w-4" />
              <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-rose-600"></span>
            </Button>
            <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 text-xs font-semibold gap-1.5 px-3 py-1">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
              <span>System Live: Supabase Connected</span>
            </Badge>
          </div>
        </header>

        {/* Content Viewport */}
        <main className="flex-1 p-4 sm:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
