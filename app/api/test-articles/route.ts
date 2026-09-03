import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

/**
 * Test endpoint to check articles table and data
 * Access: /api/test-articles
 */
export async function GET() {
  try {
    const supabase = await createClient();

    // Test 1: Check if articles table exists
    const { data: articles, error: articlesError } = await supabase
      .from('articles')
      .select('id, title, slug, status, created_at')
      .limit(5);

    if (articlesError) {
      return NextResponse.json({
        success: false,
        error: 'Articles table error',
        details: articlesError.message,
        code: articlesError.code,
      }, { status: 500 });
    }

    // Test 2: Check published articles
    const { data: published, error: publishedError } = await supabase
      .from('articles')
      .select('id, title, slug, status')
      .eq('status', 'published');

    // Test 3: Check database connection
    const { data: connection } = await supabase
      .from('profiles')
      .select('count')
      .limit(1);

    return NextResponse.json({
      success: true,
      data: {
        total_articles: articles?.length || 0,
        articles: articles || [],
        published_count: published?.length || 0,
        published_articles: published || [],
        database_connected: !!connection,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      message: error.message,
    }, { status: 500 });
  }
}
