"use client";

import React from "react";
import { sanitizeHTML } from "@/lib/article-security";

interface FormattedContentProps {
  content?: string | null;
  className?: string;
  inline?: boolean;
}

export function FormattedContent({
  content,
  className = "",
  inline = false,
}: FormattedContentProps) {
  if (!content) return null;

  // Deteksi apakah teks memuat tag HTML
  const hasHtml = /<[a-z][\s\S]*>/i.test(content);

  if (hasHtml) {
    const cleanHtml = sanitizeHTML(content);
    if (inline) {
      return (
        <span
          className={`inline-block [&_p]:inline [&_p]:m-0 [&_p]:p-0 [&_strong]:font-bold [&_b]:font-bold [&_em]:italic [&_i]:italic [&_u]:underline ${className}`}
          dangerouslySetInnerHTML={{ __html: cleanHtml }}
        />
      );
    }
    return (
      <div
        className={`[&_p]:mb-2 last:[&_p]:mb-0 [&_strong]:font-bold [&_b]:font-bold [&_em]:italic [&_i]:italic [&_u]:underline ${className}`}
        dangerouslySetInnerHTML={{ __html: cleanHtml }}
      />
    );
  }

  if (inline) {
    return <span className={className}>{content}</span>;
  }

  return <div className={className}>{content}</div>;
}
