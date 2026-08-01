"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import CrudLayout from "@/components/admin/CrudLayout";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Clock, Terminal, AlertTriangle } from "lucide-react";

interface AuditLogRecord {
  id: string;
  admin_name: string;
  admin_email: string;
  action: string;
  module: string;
  ip_address: string;
  created_at: string;
}

export default function AdminAuditLogsPage() {
  const [logs, setLogs] = useState<AuditLogRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDemoMode, setIsDemoMode] = useState(false);

  const mockLogs: AuditLogRecord[] = [
    {
      id: "log1",
      admin_name: "Super Admin",
      admin_email: "admin@updateptn.id",
      action: "Memperbarui jadwal Try Out Episode 1",
      module: "Try Out",
      ip_address: "182.253.140.21",
      created_at: new Date().toISOString(),
    },
    {
      id: "log2",
      admin_name: "Super Admin",
      admin_email: "admin@updateptn.id",
      action: "Mengubah status akun user budi.pratama@yahoo.com menjadi Premium",
      module: "Langganan / User",
      ip_address: "182.253.140.21",
      created_at: new Date(Date.now() - 7200000).toISOString(),
    },
  ];

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const supabase = createClient();
      const { data, error } = await supabase.from("audit_logs").select("*").order("created_at", { ascending: false });

      if (error) {
        setIsDemoMode(true);
        setLogs(mockLogs);
      } else if (data) {
        setLogs(data as AuditLogRecord[]);
        setIsDemoMode(false);
      }
    } catch (err) {
      console.error(err);
      setIsDemoMode(true);
      setLogs(mockLogs);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="space-y-4">
      {isDemoMode && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <h4 className="text-xs font-bold text-amber-900">Mode Demonstrasi Aktif</h4>
            <p className="text-[11px] text-amber-700">Tabel audit_logs tidak ditemukan, menggunakan data demo.</p>
          </div>
        </div>
      )}

      <CrudLayout
        title="Audit Logs"
        description="Rekaman jejak aktivitas admin, perubahan data sensitif, dan log akses keamanan sistem."
        searchPlaceholder="Cari berdasarkan aksi atau admin..."
        totalItems={logs.length}
        currentPage={1}
        totalPages={1}
      >
        <Table>
          <TableHeader>
            <TableRow className="border-slate-200 bg-slate-50/50">
              <TableHead className="font-bold text-slate-700">Waktu</TableHead>
              <TableHead className="font-bold text-slate-700">Admin</TableHead>
              <TableHead className="font-bold text-slate-700">Aksi / Aktivitas</TableHead>
              <TableHead className="font-bold text-slate-700">Modul</TableHead>
              <TableHead className="font-bold text-slate-700">IP Address</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-xs text-slate-500">Memuat data...</TableCell>
              </TableRow>
            ) : logs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-xs text-slate-500">Belum ada data.</TableCell>
              </TableRow>
            ) : (
              logs.map((log) => (
                <TableRow key={log.id} className="border-slate-100 hover:bg-slate-50/60 transition-colors">
                  <TableCell className="text-xs text-slate-500 whitespace-nowrap">
                    <div className="flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5 text-slate-400" />
                      <span>{formatDate(log.created_at)}</span>
                    </div>
                  </TableCell>
                  <TableCell className="py-3">
                    <div>
                      <p className="text-xs font-bold text-slate-900 leading-tight">{log.admin_name}</p>
                      <p className="text-[10px] text-slate-500">{log.admin_email}</p>
                    </div>
                  </TableCell>
                  <TableCell className="text-xs text-slate-800 font-medium">
                    <div className="flex items-center gap-1.5">
                      <Terminal className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                      <span>{log.action}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="bg-slate-50 text-slate-700 border-slate-200 font-semibold text-[10px] uppercase">
                      {log.module}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs font-mono text-slate-500">{log.ip_address}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CrudLayout>
    </div>
  );
}
