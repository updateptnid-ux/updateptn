import DashboardLayout from "@/app/dashboard/layout";
import type { Metadata, Viewport } from 'next';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export const metadata: Metadata = {
  title: 'Direktori Prodi & Kampus',
  description: 'Cari informasi lengkap jurusan dan universitas',
}

export default function DirektoriProdiLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DashboardLayout>{children}</DashboardLayout>;
}
