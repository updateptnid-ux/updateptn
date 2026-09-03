// Enhanced Article Types for UpdatePTN Platform

export type ArticleStatus = 'published' | 'draft';

export interface Article {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string | null;
  category: string;
  tags: string[] | null;
  
  // Author
  author: string | null;
  author_id: string | null;
  
  // Media
  featured_image: string | null;
  
  // SEO
  seo_title: string | null;
  seo_description: string | null;
  
  // Metadata
  status: ArticleStatus;
  views_count: number;
  read_time: number;
  is_featured: boolean;
  
  // Timestamps
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ArticleFormData {
  title: string;
  slug?: string;
  content: string;
  excerpt?: string;
  category: string;
  tags?: string[];
  author?: string;
  featured_image?: string;
  seo_title?: string;
  seo_description?: string;
  status: ArticleStatus;
  is_featured?: boolean;
}

export interface ArticleListItem {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  category: string;
  tags: string[] | null;
  author: string | null;
  featured_image: string | null;
  status: ArticleStatus;
  views_count: number;
  read_time: number;
  is_featured: boolean;
  published_at: string | null;
}

export interface ArticleFilters {
  category?: string;
  tags?: string[];
  status?: ArticleStatus;
  is_featured?: boolean;
  search?: string;
}

export interface ArticlesPaginationMeta {
  page: number;
  per_page: number;
  total: number;
  total_pages: number;
}
