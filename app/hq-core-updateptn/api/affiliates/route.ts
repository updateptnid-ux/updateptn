import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * GET AFFILIATES DATA FOR ADMIN
 * Bypasses RLS to show all affiliate applications
 */
export async function GET(request: NextRequest) {
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

    // 3. Create admin client with Service Role Key
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

    // 4. Fetch all affiliates
    const { data: affiliates, error: affiliatesError } = await adminClient
      .from('affiliates')
      .select('*')
      .order('created_at', { ascending: false });

    if (affiliatesError) {
      console.error('Error fetching affiliates:', affiliatesError);
      return NextResponse.json(
        { error: `Failed to fetch affiliates: ${affiliatesError.message}` },
        { status: 500 }
      );
    }

    // 5. Fetch commissions with affiliate info
    const { data: commissions, error: commissionsError } = await adminClient
      .from('commissions')
      .select(`
        *,
        affiliates:affiliate_id (
          full_name,
          affiliate_code
        )
      `)
      .order('created_at', { ascending: false });

    if (commissionsError) {
      console.error('Error fetching commissions:', commissionsError);
    }

    // 6. Fetch withdrawals with affiliate info
    const { data: withdrawals, error: withdrawalsError } = await adminClient
      .from('withdrawals')
      .select(`
        *,
        affiliates:affiliate_id (
          full_name,
          affiliate_code,
          email
        )
      `)
      .order('created_at', { ascending: false });

    if (withdrawalsError) {
      console.error('Error fetching withdrawals:', withdrawalsError);
    }

    return NextResponse.json({
      success: true,
      data: {
        affiliates: affiliates || [],
        commissions: commissions || [],
        withdrawals: withdrawals || []
      }
    });

  } catch (error: any) {
    console.error('Unexpected error in affiliates API:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
