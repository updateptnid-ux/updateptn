import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const supabase = await createClient();

    // 1. Fetch user counts from profiles table
    const [
      { count: totalUsersCount },
      { count: studentCount },
      { count: adminCount },
    ] = await Promise.all([
      supabase.from("profiles").select("*", { count: "exact", head: true }),
      supabase.from("profiles").select("*", { count: "exact", head: true }).neq("role", "admin"),
      supabase.from("profiles").select("*", { count: "exact", head: true }).eq("role", "admin"),
    ]);

    const totalUsers = totalUsersCount || 0;
    const totalStudents = studentCount || 0;
    const totalAdmins = adminCount || 0;

    // 2. Fetch payments & calculate revenue (accurate status check)
    let monthlyRevenue = 0;
    let totalPayments = 0;
    try {
      const { data: paymentsData } = await supabase
        .from("payments")
        .select("amount, status, transaction_status");

      if (paymentsData && paymentsData.length > 0) {
        const isSuccessful = (p: any) =>
          ["settlement", "success", "capture"].includes(p.status) ||
          ["settlement", "capture"].includes(p.transaction_status);

        const successfulPayments = paymentsData.filter(isSuccessful);
        monthlyRevenue = successfulPayments.reduce(
          (sum, row) => sum + (Number(row.amount) || 0),
          0
        );
        totalPayments = successfulPayments.length;
      }
    } catch (err) {
      console.error("Error fetching payments in metrics API:", err);
    }

    // 3. Tryouts & questions count
    let tryoutsCount = 0;
    try {
      const { count } = await supabase
        .from("tryouts")
        .select("*", { count: "exact", head: true });
      if (count !== null) tryoutsCount = count;
    } catch {
      tryoutsCount = 0;
    }

    let questionsCount = 0;
    try {
      const { count } = await supabase
        .from("questions")
        .select("*", { count: "exact", head: true });
      if (count !== null) questionsCount = count;
    } catch {
      questionsCount = 0;
    }

    let ptnCount = 0;
    try {
      const { count } = await supabase
        .from("prodi_reference")
        .select("*", { count: "exact", head: true });
      if (count !== null) ptnCount = count;
    } catch {
      ptnCount = 0;
    }

    // 4. Affiliate statistics
    let affiliatesCount = 0;
    let pendingAffiliates = 0;
    let activeAffiliates = 0;
    let pendingWithdrawals = 0;
    let totalCommissions = 0;
    try {
      const [
        { count: totalAff },
        { count: activeAff },
        { count: pendingAff },
        { count: pendingWd },
        { data: commissionsData },
      ] = await Promise.all([
        supabase.from("affiliates").select("*", { count: "exact", head: true }),
        supabase.from("affiliates").select("*", { count: "exact", head: true }).eq("status", "active"),
        supabase.from("affiliates").select("*", { count: "exact", head: true }).eq("status", "pending"),
        supabase.from("commissions").select("*", { count: "exact", head: true }).eq("status", "pending"),
        supabase.from("commissions").select("amount").eq("status", "paid"),
      ]);

      affiliatesCount = totalAff || 0;
      activeAffiliates = activeAff || 0;
      pendingAffiliates = pendingAff || 0;
      pendingWithdrawals = pendingWd || 0;

      if (commissionsData && commissionsData.length > 0) {
        totalCommissions = commissionsData.reduce((sum, row) => sum + (row.amount || 0), 0);
      }
    } catch (err) {
      console.error("Error fetching affiliate metrics:", err);
    }

    return NextResponse.json({
      success: true,
      data: {
        totalUsers,
        totalStudents,
        totalAdmins,
        monthlyRevenue,
        totalPayments,
        tryoutsCount,
        questionsCount,
        ptnCount,
        affiliatesCount,
        activeAffiliates,
        pendingAffiliates,
        pendingWithdrawals,
        totalCommissions,
      },
    });
  } catch (error: any) {
    console.error("Error in metrics API:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch metrics" },
      { status: 500 }
    );
  }
}
