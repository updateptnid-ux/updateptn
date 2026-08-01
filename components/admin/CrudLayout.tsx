"use client";

import { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Plus, Search, Filter, RefreshCw, ChevronLeft, ChevronRight } from "lucide-react";

interface CrudLayoutProps {
  title: string;
  description: string;
  onAddClick?: () => void;
  addButtonLabel?: string;
  searchValue?: string;
  onSearchChange?: (val: string) => void;
  searchPlaceholder?: string;
  filterComponent?: ReactNode;
  children: ReactNode;
  totalItems?: number;
  currentPage?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
}

export default function CrudLayout({
  title,
  description,
  onAddClick,
  addButtonLabel = "Tambah Data",
  searchValue = "",
  onSearchChange,
  searchPlaceholder = "Cari data...",
  filterComponent,
  children,
  totalItems = 0,
  currentPage = 1,
  totalPages = 1,
  onPageChange,
}: CrudLayoutProps) {
  return (
    <div className="space-y-6 font-sans">
      {/* Module Title & Primary Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">{title}</h1>
          <p className="text-sm text-slate-500">{description}</p>
        </div>

        {onAddClick && (
          <Button
            onClick={onAddClick}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl gap-2 shadow-sm shrink-0 h-10 px-4"
          >
            <Plus className="h-4 w-4" />
            <span>{addButtonLabel}</span>
          </Button>
        )}
      </div>

      {/* Filter & Data Container */}
      <Card className="bg-white border border-slate-200 shadow-sm rounded-2xl overflow-hidden p-6 space-y-6">
        {/* Search & Filter Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
            <Input
              value={searchValue}
              onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
              placeholder={searchPlaceholder}
              className="pl-10 h-10 rounded-xl border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-sm"
            />
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            {filterComponent}
            <Button
              variant="outline"
              size="icon"
              className="rounded-xl border-slate-200 shrink-0"
              title="Refresh Data"
            >
              <RefreshCw className="h-4 w-4 text-slate-500" />
            </Button>
          </div>
        </div>

        {/* Data Table / Content Slot */}
        <div className="overflow-x-auto min-h-75">
          {children}
        </div>

        {/* Pagination Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-100 text-xs text-slate-500 font-medium">
          <div>
            Menampilkan <strong className="text-slate-900">{totalItems > 0 ? (currentPage - 1) * 10 + 1 : 0}</strong> -{" "}
            <strong className="text-slate-900">{Math.min(currentPage * 10, totalItems)}</strong> dari{" "}
            <strong className="text-slate-900">{totalItems}</strong> data
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage <= 1}
              onClick={() => onPageChange && onPageChange(currentPage - 1)}
              className="rounded-xl border-slate-200 text-xs font-semibold h-8 gap-1"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
              <span>Sebelumnya</span>
            </Button>

            <span className="px-2 text-xs font-bold text-slate-900">
              Halaman {currentPage} dari {totalPages}
            </span>

            <Button
              variant="outline"
              size="sm"
              disabled={currentPage >= totalPages}
              onClick={() => onPageChange && onPageChange(currentPage + 1)}
              className="rounded-xl border-slate-200 text-xs font-semibold h-8 gap-1"
            >
              <span>Berikutnya</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
