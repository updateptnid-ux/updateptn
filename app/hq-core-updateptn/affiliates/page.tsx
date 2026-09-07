"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import {
  Users,
  Check,
  X,
  DollarSign,
  Loader2,
  Search,
  ExternalLink,
} from "lucide-react";

export default function AdminAffiliatesPage() {
  const [loading, setLoading] = useState(true);
  const [affiliates, setAffiliates] = useState<any[]>([]);
  const [commissions, setCommissions] = useState<any[]>([]);
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [processing, setProcessing] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    
    try {
      const response = await fetch('/hq-core-updateptn/api/affiliates');
      
      if (!response.ok) {
        throw new Error('Failed to fetch affiliates data');
      }

      const result = await response.json();
      
      if (result.success && result.data) {
        setAffiliates(result.data.affiliates || []);
        setCommissions(result.data.commissions || []);
        setWithdrawals(result.data.withdrawals || []);
      }
    } catch (error) {
      console.error('Error loading affiliate data:', error);
      alert('Gagal memuat data afiliasi. Silakan refresh halaman.');
    } finally {
      setLoading(false);
    }
  }

  async function handleAffiliateStatus(affiliateId: string, status: "active" | "rejected") {
    setProcessing(affiliateId);

    try {
      const response = await fetch('/hq-core-updateptn/api/affiliates/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ affiliateId, status }),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to update status');
      }

      if (status === "active" && result.promoCode) {
        alert(`✅ Affiliate disetujui!\n\nKode Promo: ${result.promoCode}\n\nKode promo sudah otomatis di-generate dan bisa langsung digunakan.`);
      } else {
        alert(`Affiliate ${status === "active" ? "disetujui" : "ditolak"}!`);
      }
      
      loadData();
    } catch (error: any) {
      console.error('Error updating affiliate status:', error);
      alert("Gagal memperbarui status: " + error.message);
    } finally {
      setProcessing(null);
    }
  }

  async function handleDeleteAffiliate(affiliateId: string, affiliateName: string) {
    if (!confirm(`Yakin ingin menghapus affiliate "${affiliateName}"?\n\nSemua data komisi dan penarikan juga akan terhapus!`)) {
      return;
    }

    setProcessing(affiliateId);

    try {
      const response = await fetch('/hq-core-updateptn/api/affiliates/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ affiliateId }),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to delete affiliate');
      }

      alert('Affiliate berhasil dihapus!');
      loadData();
    } catch (error: any) {
      console.error('Error deleting affiliate:', error);
      alert("Gagal menghapus affiliate: " + error.message);
    } finally {
      setProcessing(null);
    }
  }

  async function handleWithdrawalStatus(
    withdrawalId: string,
    affiliateId: string,
    status: "completed" | "rejected",
    amount: number
  ) {
    setProcessing(withdrawalId);

    let rejectionReason = "";
    if (status === "rejected") {
      const reason = prompt("Alasan penolakan (opsional):");
      if (reason) rejectionReason = reason;
    }

    try {
      const response = await fetch('/hq-core-updateptn/api/affiliates/withdrawal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ withdrawalId, status, rejectionReason }),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to update withdrawal');
      }

      alert(`Withdrawal ${status === "completed" ? "diselesaikan" : "ditolak"}!`);
      loadData();
    } catch (error: any) {
      console.error('Error updating withdrawal:', error);
      alert("Gagal memperbarui withdrawal: " + error.message);
    } finally {
      setProcessing(null);
    }
  }

  const filteredAffiliates = affiliates.filter((a) =>
    a.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.affiliate_code?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const pendingAffiliates = filteredAffiliates.filter((a) => a.status === "pending");
  const activeAffiliates = filteredAffiliates.filter((a) => a.status === "active");

  const pendingWithdrawals = withdrawals.filter((w) => w.status === "pending");
  const completedWithdrawals = withdrawals.filter((w) => w.status === "completed");

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Manajemen Afiliasi</h1>
          <p className="text-sm text-slate-600">Kelola mitra afiliasi, komisi, dan penarikan</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-400">TOTAL MITRA</span>
            <Users className="h-4 w-4 text-blue-600" />
          </div>
          <p className="text-2xl font-bold text-slate-900">{affiliates.length}</p>
          <p className="text-xs text-slate-600 mt-1">
            {activeAffiliates.length} aktif • {pendingAffiliates.length} pending
          </p>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-400">PENDING APPROVAL</span>
            <Users className="h-4 w-4 text-amber-600" />
          </div>
          <p className="text-2xl font-bold text-slate-900">{pendingAffiliates.length}</p>
          <p className="text-xs text-slate-600 mt-1">Perlu ditinjau</p>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-400">PENDING WITHDRAWAL</span>
            <DollarSign className="h-4 w-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-bold text-slate-900">{pendingWithdrawals.length}</p>
          <p className="text-xs text-slate-600 mt-1">
            Rp{" "}
            {pendingWithdrawals
              .reduce((sum, w) => sum + Number(w.amount), 0)
              .toLocaleString("id-ID")}
          </p>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-400">TOTAL KOMISI</span>
            <DollarSign className="h-4 w-4 text-blue-600" />
          </div>
          <p className="text-2xl font-bold text-slate-900">
            Rp{" "}
            {commissions
              .filter((c) => c.status === "approved" || c.status === "paid")
              .reduce((sum, c) => sum + Number(c.commission_amount), 0)
              .toLocaleString("id-ID")}
          </p>
          <p className="text-xs text-slate-600 mt-1">{commissions.length} transaksi</p>
        </Card>
      </div>

      {/* Search */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Cari nama, email, atau kode afiliasi..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="pending" className="space-y-4">
        <TabsList className="bg-white border">
          <TabsTrigger value="pending">
            Pending Approval ({pendingAffiliates.length})
          </TabsTrigger>
          <TabsTrigger value="active">
            Aktif ({activeAffiliates.length})
          </TabsTrigger>
          <TabsTrigger value="withdrawals">
            Penarikan ({pendingWithdrawals.length})
          </TabsTrigger>
          <TabsTrigger value="commissions">
            Komisi ({commissions.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending">
          <Card className="p-4">
            <h3 className="font-bold text-slate-900 mb-4">Aplikasi Pending</h3>
            {pendingAffiliates.length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-8">
                Tidak ada aplikasi pending
              </p>
            ) : (
              <div className="space-y-3">
                {pendingAffiliates.map((affiliate) => (
                  <div
                    key={affiliate.id}
                    className="flex items-center justify-between p-4 bg-slate-50 rounded-lg"
                  >
                    <div className="flex-1">
                      <p className="font-bold text-slate-900">{affiliate.full_name}</p>
                      <p className="text-sm text-slate-600">{affiliate.email}</p>
                      <p className="text-xs text-slate-500 mt-1">
                        📱 {affiliate.phone} {affiliate.institution && `• 🏫 ${affiliate.institution}`}
                      </p>
                      <p className="text-xs text-slate-400 mt-1">
                        Applied: {new Date(affiliate.applied_at).toLocaleDateString("id-ID")}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleAffiliateStatus(affiliate.id, "active")}
                        disabled={processing === affiliate.id}
                        className="bg-emerald-600 hover:bg-emerald-700"
                      >
                        {processing === affiliate.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <>
                            <Check className="h-4 w-4 mr-1" />
                            Setujui
                          </>
                        )}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleAffiliateStatus(affiliate.id, "rejected")}
                        disabled={processing === affiliate.id}
                        className="border-rose-200 text-rose-600 hover:bg-rose-50"
                      >
                        <X className="h-4 w-4 mr-1" />
                        Tolak
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDeleteAffiliate(affiliate.id, affiliate.full_name)}
                        disabled={processing === affiliate.id}
                        className="border-slate-200 text-slate-600 hover:bg-slate-100"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="active">
          <Card className="p-4">
            <h3 className="font-bold text-slate-900 mb-4">Mitra Aktif</h3>
            {activeAffiliates.length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-8">
                Belum ada mitra aktif
              </p>
            ) : (
              <div className="space-y-3">
                {activeAffiliates.map((affiliate) => (
                  <div
                    key={affiliate.id}
                    className="flex items-center justify-between p-4 bg-slate-50 rounded-lg"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-bold text-slate-900">{affiliate.full_name}</p>
                        <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">
                          {affiliate.affiliate_code}
                        </Badge>
                      </div>
                      <p className="text-sm text-slate-600">{affiliate.email}</p>
                      <div className="grid grid-cols-3 gap-3 mt-2 text-xs">
                        <div>
                          <span className="text-slate-500">Total Referral:</span>
                          <span className="font-bold text-slate-900 ml-1">
                            {affiliate.total_referrals || 0}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-500">Konversi:</span>
                          <span className="font-bold text-slate-900 ml-1">
                            {affiliate.total_conversions || 0}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-500">Earnings:</span>
                          <span className="font-bold text-emerald-600 ml-1">
                            Rp {Number(affiliate.total_earnings || 0).toLocaleString("id-ID")}
                          </span>
                        </div>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDeleteAffiliate(affiliate.id, affiliate.full_name)}
                      disabled={processing === affiliate.id}
                      className="border-rose-200 text-rose-600 hover:bg-rose-50 ml-3"
                    >
                      {processing === affiliate.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          <X className="h-4 w-4 mr-1" />
                          Hapus
                        </>
                      )}
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="withdrawals">
          <Card className="p-4">
            <h3 className="font-bold text-slate-900 mb-4">Permintaan Penarikan</h3>
            {pendingWithdrawals.length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-8">
                Tidak ada permintaan penarikan pending
              </p>
            ) : (
              <div className="space-y-3">
                {pendingWithdrawals.map((withdrawal) => (
                  <div
                    key={withdrawal.id}
                    className="flex items-center justify-between p-4 bg-slate-50 rounded-lg"
                  >
                    <div className="flex-1">
                      <p className="font-bold text-slate-900">
                        Rp {Number(withdrawal.amount).toLocaleString("id-ID")}
                      </p>
                      <p className="text-sm text-slate-600 mt-1">
                        {withdrawal.affiliates?.full_name} ({withdrawal.affiliates?.affiliate_code})
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        🏦 {withdrawal.bank_name} • {withdrawal.bank_account_number} • {withdrawal.bank_account_name}
                      </p>
                      <p className="text-xs text-slate-400 mt-1">
                        Request: {new Date(withdrawal.created_at).toLocaleDateString("id-ID")}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() =>
                          handleWithdrawalStatus(
                            withdrawal.id,
                            withdrawal.affiliate_id,
                            "completed",
                            withdrawal.amount
                          )
                        }
                        disabled={processing === withdrawal.id}
                        className="bg-emerald-600 hover:bg-emerald-700"
                      >
                        {processing === withdrawal.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <>
                            <Check className="h-4 w-4 mr-1" />
                            Selesai
                          </>
                        )}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          handleWithdrawalStatus(
                            withdrawal.id,
                            withdrawal.affiliate_id,
                            "rejected",
                            withdrawal.amount
                          )
                        }
                        disabled={processing === withdrawal.id}
                        className="border-rose-200 text-rose-600 hover:bg-rose-50"
                      >
                        <X className="h-4 w-4 mr-1" />
                        Tolak
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="commissions">
          <Card className="p-4">
            <h3 className="font-bold text-slate-900 mb-4">Riwayat Komisi</h3>
            {commissions.length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-8">
                Belum ada komisi
              </p>
            ) : (
              <div className="space-y-2">
                {commissions.slice(0, 50).map((comm) => (
                  <div
                    key={comm.id}
                    className="flex items-center justify-between p-3 bg-slate-50 rounded-lg text-sm"
                  >
                    <div className="flex-1">
                      <p className="font-bold text-slate-900">
                        Rp {Number(comm.commission_amount).toLocaleString("id-ID")}
                      </p>
                      <p className="text-xs text-slate-600">
                        {comm.affiliates?.full_name} ({comm.affiliates?.affiliate_code}) • {comm.customer_email}
                      </p>
                      <p className="text-xs text-slate-400">
                        {new Date(comm.created_at).toLocaleDateString("id-ID")}
                      </p>
                    </div>
                    <Badge
                      className={
                        comm.status === "approved" || comm.status === "paid"
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-amber-100 text-amber-700"
                      }
                    >
                      {comm.status}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
