import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Settings, Save, ShieldCheck, Database, Sliders, Globe } from "lucide-react";

export default async function AdminSettingsPage() {
  return (
    <div className="space-y-6 font-sans">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Pengaturan Sistem</h1>
        <p className="text-sm text-slate-500">
          Ubah konfigurasi global platform, integrasi Midtrans, dan limitasi sistem.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left column - categories */}
        <div className="space-y-2">
          <Button variant="ghost" className="w-full justify-start text-xs font-bold text-blue-600 bg-blue-50/60 rounded-xl gap-2 h-11">
            <Sliders className="h-4 w-4" />
            <span>Konfigurasi Umum</span>
          </Button>
          <Button variant="ghost" className="w-full justify-start text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl gap-2 h-11">
            <Database className="h-4 w-4 text-slate-400" />
            <span>Koneksi Database</span>
          </Button>
          <Button variant="ghost" className="w-full justify-start text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl gap-2 h-11">
            <Globe className="h-4 w-4 text-slate-400" />
            <span>Midtrans Payment Gateway</span>
          </Button>
        </div>

        {/* Right column - settings forms */}
        <div className="md:col-span-2 space-y-6">
          <Card className="bg-white border border-slate-200 shadow-sm rounded-2xl">
            <CardHeader className="border-b border-slate-100 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg font-bold text-slate-900">Konfigurasi Umum</CardTitle>
                  <CardDescription className="text-xs">Pengaturan nama platform, kuota gratis, dan email cs.</CardDescription>
                </div>
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 text-xs font-semibold">
                  Sistem Aktif
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="p-6 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="app_name" className="text-xs font-bold text-slate-700">Nama Aplikasi / Brand</Label>
                <Input id="app_name" defaultValue="UpdatePTN" className="rounded-xl border-slate-200 focus:border-blue-500 text-sm h-10" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="free_to_limit" className="text-xs font-bold text-slate-700">Limit Try Out Gratis (per user)</Label>
                  <Input id="free_to_limit" type="number" defaultValue="2" className="rounded-xl border-slate-200 focus:border-blue-500 text-sm h-10" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cs_email" className="text-xs font-bold text-slate-700">Email Customer Service</Label>
                  <Input id="cs_email" type="email" defaultValue="support@updateptn.id" className="rounded-xl border-slate-200 focus:border-blue-500 text-sm h-10" />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <p className="text-[11px] text-slate-400">Terakhir diperbarui oleh Super Admin pada hari ini.</p>
                <Button className="bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl gap-2 shadow-sm text-xs h-10 px-4">
                  <Save className="h-4 w-4" />
                  <span>Simpan Perubahan</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
