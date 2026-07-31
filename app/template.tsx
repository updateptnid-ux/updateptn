"use client";

import { PageTransition } from "@/components/ui/fade-in";

export default function Template({ children }: { children: React.ReactNode }) {
  return <PageTransition>{children}</PageTransition>;
}
