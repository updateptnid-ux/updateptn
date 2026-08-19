import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import SecurityGuard from "@/components/SecurityGuard";

const inter = Inter({ 
  subsets: ["latin"],
  display: 'swap',
  fallback: ['-apple-system', 'BlinkMacSystemFont', 'Roboto', 'Noto Sans', 'sans-serif'],
});

// Force dynamic rendering for all routes
export const dynamic = "force-dynamic";
export const dynamicParams = true;

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0f172a' },
  ],
  viewportFit: 'cover', // Support iOS safe area
};

export const metadata: Metadata = {
  title: "UpdatePTN - Platform Persiapan SNBT #1",
  description: "Lulus PTN Impianmu dengan Persiapan UTBK Terarah & Terukur",
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/icon.png", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'UpdatePTN',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className="scroll-smooth" data-scroll-behavior="smooth">
      <body className={`${inter.className} antialiased bg-slate-50 text-slate-900 select-none`}>
        <SecurityGuard />
        {children}
      </body>
    </html>
  );
}
