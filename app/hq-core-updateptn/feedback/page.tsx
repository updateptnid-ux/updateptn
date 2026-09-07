"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { 
  MessageSquare, Star, TrendingUp, DollarSign, 
  Users, CheckCircle, XCircle, Loader2, Download,
  BarChart3, Filter
} from "lucide-react";

interface FeedbackData {
  id: string;
  user_id: string;
  ease_of_navigation: number;
  prediction_accuracy: number;
  accuracy_reason: string | null;
  has_technical_issue: boolean;
  technical_issue_detail: string | null;
  most_attractive_feature: string;
  next_action: string;
  premium_interest: number;
  expected_price: string;
  willing_to_be_contacted: boolean;
  contact_info: string | null;
  created_at: string;
  profiles: {
    full_name: string;
    email: string;
  };
}

export default function AdminFeedbackPage() {
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState<FeedbackData[]>([]);
  const [filter, setFilter] = useState<string>("all");

  useEffect(() => {
    loadFeedback();
  }, []);

  async function loadFeedback() {
    try {
      const res = await fetch("/api/admin/feedback");
      const data = await res.json();
      if (data.success) {
        setFeedback(data.data || []);
      }
    } catch (err) {
      console.error("Load feedback error:", err);
    } finally {
      setLoading(false);
    }
  }

  const getNextActionLabel = (action: string) => {
    const labels: Record<string, string> = {
      improve_scores: "Memperbaiki nilai",
      search_majors: "Cari jurusan lain",
      practice_tests: "Latihan soal",
      no_action: "Tidak ada tindakan"
    };
    return labels[action] || action;
  };

  const getPriceLabel = (price: string) => {
    const labels: Record<string, string> = {
      "0-50k": "Rp 0 - 50k",
      "50k-100k": "Rp 50k - 100k",
      "100k-200k": "Rp 100k - 200k",
      "200k-500k": "Rp 200k - 500k",
      "500k+": "Rp 500k+"
    };
    return labels[price] || price;
  };

  // Calculate statistics
  const stats = {
    total: feedback.length,
    avgNavigation: feedback.length > 0 
      ? (feedback.reduce((sum, f) => sum + f.ease_of_navigation, 0) / feedback.length).toFixed(1)
      : "0",
    avgAccuracy: feedback.length > 0
      ? (feedback.reduce((sum, f) => sum + f.prediction_accuracy, 0) / feedback.length).toFixed(1)
      : "0",
    avgPremiumInterest: feedback.length > 0
      ? (feedback.reduce((sum, f) => sum + f.premium_interest, 0) / feedback.length).toFixed(1)
      : "0",
    technicalIssues: feedback.filter(f => f.has_technical_issue).length,
    willingToContact: feedback.filter(f => f.willing_to_be_contacted).length,
  };

  // Price distribution
  const priceDistribution = feedback.reduce((acc, f) => {
    acc[f.expected_price] = (acc[f.expected_price] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Next action distribution
  const actionDistribution = feedback.reduce((acc, f) => {
    acc[f.next_action] = (acc[f.next_action] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const exportToCSV = () => {
    const headers = [
      "Timestamp", "Nama", "Email", "Ease Navigation", "Accuracy", 
      "Accuracy Reason", "Technical Issue", "Issue Detail",
      "Most Attractive", "Next Action", "Premium Interest",
      "Expected Price", "Willing Contact", "Contact Info"
    ];
    
    const rows = feedback.map(f => [
      new Date(f.created_at).toLocaleString("id-ID"),
      f.profiles.full_name,
      f.profiles.email,
      f.ease_of_navigation,
      f.prediction_accuracy,
      f.accuracy_reason || "-",
      f.has_technical_issue ? "Ya" : "Tidak",
      f.technical_issue_detail || "-",
      f.most_attractive_feature,
      getNextActionLabel(f.next_action),
      f.premium_interest,
      getPriceLabel(f.expected_price),
      f.willing_to_be_contacted ? "Ya" : "Tidak",
      f.contact_info || "-"
    ]);

    const csv = [
      headers.join(","),
      ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(","))
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `feedback_${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
            <MessageSquare className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Customer Feedback</h1>
            <p className="text-sm text-slate-500">Survey responses & insights</p>
          </div>
        </div>
        <button
          onClick={exportToCSV}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-bold transition-colors"
        >
          <Download className="h-4 w-4" />
          Export CSV
        </button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card className="p-4 rounded-xl">
          <div className="flex items-center gap-2 mb-2">
            <Users className="h-4 w-4 text-blue-600" />
            <span className="text-xs font-bold text-slate-600">Total</span>
          </div>
          <p className="text-2xl font-black text-slate-900">{stats.total}</p>
        </Card>

        <Card className="p-4 rounded-xl">
          <div className="flex items-center gap-2 mb-2">
            <Star className="h-4 w-4 text-amber-500" />
            <span className="text-xs font-bold text-slate-600">Avg Navigation</span>
          </div>
          <p className="text-2xl font-black text-slate-900">{stats.avgNavigation}/5</p>
        </Card>

        <Card className="p-4 rounded-xl">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="h-4 w-4 text-emerald-500" />
            <span className="text-xs font-bold text-slate-600">Avg Accuracy</span>
          </div>
          <p className="text-2xl font-black text-slate-900">{stats.avgAccuracy}/5</p>
        </Card>

        <Card className="p-4 rounded-xl">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="h-4 w-4 text-indigo-500" />
            <span className="text-xs font-bold text-slate-600">Premium Interest</span>
          </div>
          <p className="text-2xl font-black text-slate-900">{stats.avgPremiumInterest}/5</p>
        </Card>

        <Card className="p-4 rounded-xl">
          <div className="flex items-center gap-2 mb-2">
            <XCircle className="h-4 w-4 text-rose-500" />
            <span className="text-xs font-bold text-slate-600">Tech Issues</span>
          </div>
          <p className="text-2xl font-black text-slate-900">{stats.technicalIssues}</p>
        </Card>

        <Card className="p-4 rounded-xl">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="h-4 w-4 text-blue-500" />
            <span className="text-xs font-bold text-slate-600">Willing Contact</span>
          </div>
          <p className="text-2xl font-black text-slate-900">{stats.willingToContact}</p>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Price Distribution */}
        <Card className="p-6 rounded-xl">
          <div className="flex items-center gap-2 mb-4">
            <DollarSign className="h-5 w-5 text-emerald-600" />
            <h3 className="text-base font-bold text-slate-900">Expected Price Distribution</h3>
          </div>
          <div className="space-y-3">
            {Object.entries(priceDistribution).map(([price, count]) => (
              <div key={price} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-bold text-slate-700">{getPriceLabel(price)}</span>
                  <span className="font-bold text-slate-900">{count} ({((count / stats.total) * 100).toFixed(0)}%)</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                  <div 
                    className="bg-emerald-500 h-2 rounded-full transition-all"
                    style={{ width: `${(count / stats.total) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Action Distribution */}
        <Card className="p-6 rounded-xl">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="h-5 w-5 text-indigo-600" />
            <h3 className="text-base font-bold text-slate-900">Next Action Distribution</h3>
          </div>
          <div className="space-y-3">
            {Object.entries(actionDistribution).map(([action, count]) => (
              <div key={action} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-bold text-slate-700">{getNextActionLabel(action)}</span>
                  <span className="font-bold text-slate-900">{count} ({((count / stats.total) * 100).toFixed(0)}%)</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                  <div 
                    className="bg-indigo-500 h-2 rounded-full transition-all"
                    style={{ width: `${(count / stats.total) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Detailed Feedback List */}
      <Card className="p-6 rounded-xl">
        <h3 className="text-lg font-bold text-slate-900 mb-4">Detailed Responses</h3>
        <div className="space-y-4">
          {feedback.map((f) => (
            <div key={f.id} className="border border-slate-200 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold text-slate-900">{f.profiles.full_name}</p>
                  <p className="text-xs text-slate-500">{f.profiles.email}</p>
                </div>
                <span className="text-xs text-slate-400">
                  {new Date(f.created_at).toLocaleDateString("id-ID")}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-4 py-3 border-y border-slate-100">
                <div>
                  <p className="text-xs text-slate-500 mb-1">Navigation</p>
                  <p className="text-lg font-bold text-slate-900">{f.ease_of_navigation}/5</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-1">Accuracy</p>
                  <p className="text-lg font-bold text-slate-900">{f.prediction_accuracy}/5</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-1">Premium Interest</p>
                  <p className="text-lg font-bold text-slate-900">{f.premium_interest}/5</p>
                </div>
              </div>

              {f.accuracy_reason && (
                <div>
                  <p className="text-xs font-bold text-slate-600 mb-1">Alasan Rating:</p>
                  <p className="text-sm text-slate-700">{f.accuracy_reason}</p>
                </div>
              )}

              <div>
                <p className="text-xs font-bold text-slate-600 mb-1">Fitur Paling Menarik:</p>
                <p className="text-sm text-slate-700">{f.most_attractive_feature}</p>
              </div>

              {f.has_technical_issue && f.technical_issue_detail && (
                <div className="bg-rose-50 rounded-lg p-3">
                  <p className="text-xs font-bold text-rose-700 mb-1">⚠️ Kendala Teknis:</p>
                  <p className="text-sm text-rose-600">{f.technical_issue_detail}</p>
                </div>
              )}

              <div className="flex items-center gap-4 text-xs">
                <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-lg font-bold">
                  {getNextActionLabel(f.next_action)}
                </span>
                <span className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded-lg font-bold">
                  {getPriceLabel(f.expected_price)}
                </span>
                {f.willing_to_be_contacted && (
                  <span className="px-2 py-1 bg-amber-100 text-amber-700 rounded-lg font-bold">
                    📞 {f.contact_info}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
