"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export interface FeedbackForm {
  easeOfNavigation: number;
  predictionAccuracy: number;
  accuracyReason?: string;
  hasTechnicalIssue: boolean;
  technicalIssueDetail?: string;
  mostAttractiveFeature: string;
  nextAction: string;
  premiumInterest: number;
  expectedPrice: string;
  willingToBeContacted: boolean;
  contactInfo?: string;
}

export async function submitFeedbackAction(data: FeedbackForm) {
  try {
    const supabase = await createClient();
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return { success: false, error: "Unauthorized" };
    }

    // Check if user already submitted feedback
    const { data: existing } = await supabase
      .from("feedback")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (existing) {
      return { success: false, error: "Kamu sudah mengisi feedback sebelumnya. Terima kasih!" };
    }

    // Insert feedback
    const { error: insertError } = await supabase
      .from("feedback")
      .insert({
        user_id: user.id,
        ease_of_navigation: data.easeOfNavigation,
        prediction_accuracy: data.predictionAccuracy,
        accuracy_reason: data.accuracyReason || null,
        has_technical_issue: data.hasTechnicalIssue,
        technical_issue_detail: data.technicalIssueDetail || null,
        most_attractive_feature: data.mostAttractiveFeature,
        next_action: data.nextAction,
        premium_interest: data.premiumInterest,
        expected_price: data.expectedPrice,
        willing_to_be_contacted: data.willingToBeContacted,
        contact_info: data.contactInfo || null,
      });

    if (insertError) {
      console.error("Insert feedback error:", insertError);
      return { success: false, error: insertError.message };
    }

    revalidatePath("/dashboard/student");
    return { success: true };
    
  } catch (err: any) {
    console.error("Submit feedback error:", err);
    return { success: false, error: err.message || "Terjadi kesalahan" };
  }
}

// Admin: Get all feedback with user details
export async function getAllFeedbackAction() {
  try {
    const supabase = await createClient();
    
    // Check if user is admin
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Unauthorized" };

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role !== "admin") {
      return { success: false, error: "Admin access required" };
    }

    // Get all feedback with user info
    const { data, error } = await supabase
      .from("feedback")
      .select(`
        *,
        profiles!inner (
          full_name,
          email
        )
      `)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Get feedback error:", error);
      return { success: false, error: error.message };
    }

    return { success: true, data };
    
  } catch (err: any) {
    console.error("Get feedback error:", err);
    return { success: false, error: err.message };
  }
}
