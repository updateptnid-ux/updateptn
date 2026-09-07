import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * DELETE USER BY ADMIN
 * Only accessible by admin users
 * Uses Service Role Key to bypass RLS
 */
export async function POST(request: NextRequest) {
  try {
    // 1. Verify admin authentication
    const supabase = await createClient();
    const { data: { user: adminUser } } = await supabase.auth.getUser();

    if (!adminUser) {
      return NextResponse.json(
        { error: 'Unauthorized - Not logged in' },
        { status: 401 }
      );
    }

    // 2. Check if admin
    const ADMIN_EMAILS = ['updateptnid@gmail.com', 'admin@updateptn.id'];
    const isAdmin = ADMIN_EMAILS.includes(adminUser.email?.toLowerCase() || '');

    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      );
    }

    // 3. Get userId from request body
    const body = await request.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }

    // 4. Prevent admin from deleting themselves
    if (userId === adminUser.id) {
      return NextResponse.json(
        { error: 'Cannot delete your own admin account' },
        { status: 400 }
      );
    }

    // 5. Create admin client with Service Role Key
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

    if (!serviceRoleKey) {
      return NextResponse.json(
        { error: 'Service Role Key not configured' },
        { status: 500 }
      );
    }

    const adminClient = createSupabaseClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    console.log(`🗑️ Admin ${adminUser.email} deleting user ${userId}`);

    // 6. Get user info before deletion (for logging)
    const { data: profileData } = await adminClient
      .from('profiles')
      .select('full_name, email')
      .eq('id', userId)
      .single();

    const userName = profileData?.full_name || profileData?.email || userId;

    // 7. Delete related data (in order to respect foreign keys)
    
    // a. Delete tryout results
    const { error: resultsError } = await adminClient
      .from('results')
      .delete()
      .eq('user_id', userId);

    if (resultsError) {
      console.error('Error deleting results:', resultsError);
    }

    // b. Delete results_mandiri
    const { error: resultsMandiriError } = await adminClient
      .from('results_mandiri')
      .delete()
      .eq('user_id', userId);

    if (resultsMandiriError) {
      console.error('Error deleting results_mandiri:', resultsMandiriError);
    }

    // c. Delete subscriptions
    const { error: subscriptionsError } = await adminClient
      .from('subscriptions')
      .delete()
      .eq('user_id', userId);

    if (subscriptionsError) {
      console.error('Error deleting subscriptions:', subscriptionsError);
    }

    // d. Delete payments
    const { error: paymentsError } = await adminClient
      .from('payments')
      .delete()
      .eq('user_id', userId);

    if (paymentsError) {
      console.error('Error deleting payments:', paymentsError);
    }

    // e. Delete free_claims
    const { error: freeClaimsError } = await adminClient
      .from('free_claims')
      .delete()
      .eq('user_id', userId);

    if (freeClaimsError) {
      console.error('Error deleting free_claims:', freeClaimsError);
    }

    // f. Delete affiliate data
    const { error: affiliateClicksError } = await adminClient
      .from('affiliate_clicks')
      .delete()
      .eq('user_id', userId);

    if (affiliateClicksError) {
      console.error('Error deleting affiliate_clicks:', affiliateClicksError);
    }

    const { error: affiliateConversionsError } = await adminClient
      .from('affiliate_conversions')
      .delete()
      .eq('user_id', userId);

    if (affiliateConversionsError) {
      console.error('Error deleting affiliate_conversions:', affiliateConversionsError);
    }

    const { error: affiliateWithdrawalsError } = await adminClient
      .from('affiliate_withdrawals')
      .delete()
      .eq('affiliate_id', userId);

    if (affiliateWithdrawalsError) {
      console.error('Error deleting affiliate_withdrawals:', affiliateWithdrawalsError);
    }

    // g. Delete prediction history
    const { error: predictionsError } = await adminClient
      .from('prediction_history')
      .delete()
      .eq('user_id', userId);

    if (predictionsError) {
      console.error('Error deleting prediction_history:', predictionsError);
    }

    // h. Delete articles (if any)
    const { error: articlesError } = await adminClient
      .from('articles')
      .delete()
      .eq('author_id', userId);

    if (articlesError) {
      console.error('Error deleting articles:', articlesError);
    }

    // 8. Delete profile
    const { error: profileError } = await adminClient
      .from('profiles')
      .delete()
      .eq('id', userId);

    if (profileError) {
      console.error('Error deleting profile:', profileError);
      return NextResponse.json(
        { error: `Failed to delete profile: ${profileError.message}` },
        { status: 500 }
      );
    }

    // 9. Delete auth user (this will cascade delete everything else)
    const { error: authError } = await adminClient.auth.admin.deleteUser(userId);

    if (authError) {
      console.error('Error deleting auth user:', authError);
      return NextResponse.json(
        { error: `Failed to delete auth user: ${authError.message}` },
        { status: 500 }
      );
    }

    console.log(`✅ User ${userName} (${userId}) successfully deleted by admin ${adminUser.email}`);

    // 10. Log audit trail (optional - you can add to audit_logs table)
    await adminClient.from('audit_logs').insert({
      action: 'DELETE_USER',
      actor_id: adminUser.id,
      actor_email: adminUser.email,
      target_id: userId,
      target_name: userName,
      metadata: {
        deleted_at: new Date().toISOString(),
        deleted_by: adminUser.email
      }
    });

    return NextResponse.json({
      success: true,
      message: `User ${userName} successfully deleted`,
      deletedUserId: userId
    });

  } catch (error: any) {
    console.error('Unexpected error in delete-user:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
