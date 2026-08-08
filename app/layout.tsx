import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import SecurityGuard from "@/components/SecurityGuard";

const inter = Inter({ subsets: ["latin"] });

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
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className="scroll-smooth">
      <body className={`${inter.className} antialiased bg-slate-50 text-slate-900 select-none`}>
        <SecurityGuard />
        {children}
      </body>
    </html>
  );
}
