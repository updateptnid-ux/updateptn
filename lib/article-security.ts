/**
 * Article Security Utilities
 * Provides validation, sanitization, and security checks for article operations
 */

import DOMPurify from 'isomorphic-dompurify';
import slugify from 'slugify';

// Validation constants
export const ARTICLE_CONSTRAINTS = {
  TITLE_MIN: 5,
  TITLE_MAX: 200,
  EXCERPT_MAX: 300,
  CONTENT_MIN: 50,
  CONTENT_MAX: 100000, // ~100KB
  SLUG_MAX: 250,
  CATEGORY_MAX: 50,
  TAG_MAX: 30,
  TAGS_LIMIT: 10,
  SEO_TITLE_MAX: 70,
  SEO_DESC_MAX: 160,
  IMAGE_MAX_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'] as const,
} as const;

// DOMPurify configuration for rich text content
const PURIFY_CONFIG = {
  ALLOWED_TAGS: [
    'p', 'br', 'strong', 'em', 'u', 's', 'a', 'ul', 'ol', 'li',
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'blockquote', 'code', 'pre',
    'img', 'figure', 'figcaption',
    'table', 'thead', 'tbody', 'tr', 'th', 'td',
    'span', 'div',
  ],
  ALLOWED_ATTR: [
    'href', 'target', 'rel', 'src', 'alt', 'title',
    'class', 'id', 'width', 'height',
  ],
  ALLOWED_URI_REGEXP: /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|cid|xmpp|data):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i,
};

/**
 * Sanitize HTML content to prevent XSS attacks
 */
export function sanitizeHTML(html: string): string {
  if (!html || typeof html !== 'string') return '';
  
  return DOMPurify.sanitize(html, PURIFY_CONFIG);
}

/**
 * Validate article title
 */
export function validateTitle(title: string): { valid: boolean; error?: string } {
  if (!title || typeof title !== 'string') {
    return { valid: false, error: 'Title is required' };
  }

  const trimmed = title.trim();
  
  if (trimmed.length < ARTICLE_CONSTRAINTS.TITLE_MIN) {
    return { valid: false, error: `Title must be at least ${ARTICLE_CONSTRAINTS.TITLE_MIN} characters` };
  }

  if (trimmed.length > ARTICLE_CONSTRAINTS.TITLE_MAX) {
    return { valid: false, error: `Title must not exceed ${ARTICLE_CONSTRAINTS.TITLE_MAX} characters` };
  }

  // Check for suspicious patterns
  if (/<script|javascript:|onerror=/i.test(trimmed)) {
    return { valid: false, error: 'Title contains invalid content' };
  }

  return { valid: true };
}

/**
 * Validate article content
 */
export function validateContent(content: string): { valid: boolean; error?: string } {
  if (!content || typeof content !== 'string') {
    return { valid: false, error: 'Content is required' };
  }

  // Strip HTML tags for length check
  const textOnly = content.replace(/<[^>]*>/g, '').trim();

  if (textOnly.length < ARTICLE_CONSTRAINTS.CONTENT_MIN) {
    return { valid: false, error: `Content must be at least ${ARTICLE_CONSTRAINTS.CONTENT_MIN} characters` };
  }

  if (content.length > ARTICLE_CONSTRAINTS.CONTENT_MAX) {
    return { valid: false, error: `Content is too large (max ${ARTICLE_CONSTRAINTS.CONTENT_MAX / 1000}KB)` };
  }

  return { valid: true };
}

/**
 * Validate and sanitize excerpt
 */
export function validateExcerpt(excerpt: string | null | undefined): { valid: boolean; error?: string; sanitized?: string } {
  if (!excerpt) return { valid: true, sanitized: '' };

  if (typeof excerpt !== 'string') {
    return { valid: false, error: 'Invalid excerpt format' };
  }

  const trimmed = excerpt.trim();

  if (trimmed.length > ARTICLE_CONSTRAINTS.EXCERPT_MAX) {
    return { valid: false, error: `Excerpt must not exceed ${ARTICLE_CONSTRAINTS.EXCERPT_MAX} characters` };
  }

  // Strip HTML and sanitize
  const sanitized = trimmed.replace(/<[^>]*>/g, '');

  return { valid: true, sanitized };
}

/**
 * Generate secure slug from title
 */
export function generateSlug(title: string, existingSlugs: string[] = []): string {
  if (!title || typeof title !== 'string') {
    throw new Error('Invalid title for slug generation');
  }

  let slug = slugify(title, {
    lower: true,
    strict: true,
    remove: /[*+~.()'"!:@]/g,
  });

  // Truncate if too long
  if (slug.length > ARTICLE_CONSTRAINTS.SLUG_MAX) {
    slug = slug.substring(0, ARTICLE_CONSTRAINTS.SLUG_MAX);
  }

  // Handle duplicates
  let finalSlug = slug;
  let counter = 1;
  
  while (existingSlugs.includes(finalSlug)) {
    finalSlug = `${slug}-${counter}`;
    counter++;
    
    // Safety limit
    if (counter > 1000) {
      finalSlug = `${slug}-${Date.now()}`;
      break;
    }
  }

  return finalSlug;
}

/**
 * Validate slug format
 */
export function validateSlug(slug: string): { valid: boolean; error?: string } {
  if (!slug || typeof slug !== 'string') {
    return { valid: false, error: 'Slug is required' };
  }

  // Slug must be lowercase alphanumeric with hyphens only
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    return { valid: false, error: 'Slug must contain only lowercase letters, numbers, and hyphens' };
  }

  if (slug.length > ARTICLE_CONSTRAINTS.SLUG_MAX) {
    return { valid: false, error: `Slug must not exceed ${ARTICLE_CONSTRAINTS.SLUG_MAX} characters` };
  }

  return { valid: true };
}

/**
 * Validate category
 */
export function validateCategory(category: string): { valid: boolean; error?: string } {
  if (!category || typeof category !== 'string') {
    return { valid: false, error: 'Category is required' };
  }

  const trimmed = category.trim();

  if (trimmed.length === 0) {
    return { valid: false, error: 'Category cannot be empty' };
  }

  if (trimmed.length > ARTICLE_CONSTRAINTS.CATEGORY_MAX) {
    return { valid: false, error: `Category must not exceed ${ARTICLE_CONSTRAINTS.CATEGORY_MAX} characters` };
  }

  return { valid: true };
}

/**
 * Validate and sanitize tags
 */
export function validateTags(tags: string[] | null | undefined): { valid: boolean; error?: string; sanitized?: string[] } {
  if (!tags || tags.length === 0) {
    return { valid: true, sanitized: [] };
  }

  if (!Array.isArray(tags)) {
    return { valid: false, error: 'Tags must be an array' };
  }

  if (tags.length > ARTICLE_CONSTRAINTS.TAGS_LIMIT) {
    return { valid: false, error: `Maximum ${ARTICLE_CONSTRAINTS.TAGS_LIMIT} tags allowed` };
  }

  const sanitized: string[] = [];

  for (const tag of tags) {
    if (typeof tag !== 'string') {
      return { valid: false, error: 'All tags must be strings' };
    }

    const trimmed = tag.trim();

    if (trimmed.length === 0) continue;

    if (trimmed.length > ARTICLE_CONSTRAINTS.TAG_MAX) {
      return { valid: false, error: `Tag "${trimmed}" exceeds ${ARTICLE_CONSTRAINTS.TAG_MAX} characters` };
    }

    // Check for suspicious content
    if (/<|>|script/i.test(trimmed)) {
      return { valid: false, error: 'Tags contain invalid characters' };
    }

    sanitized.push(trimmed);
  }

  return { valid: true, sanitized };
}

/**
 * Validate image file for upload
 */
export function validateImageFile(file: File): { valid: boolean; error?: string } {
  if (!file) {
    return { valid: false, error: 'No file provided' };
  }

  // Check file type
  const allowedTypes = ARTICLE_CONSTRAINTS.ALLOWED_IMAGE_TYPES as readonly string[];
  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: `Invalid file type. Allowed: ${allowedTypes.join(', ')}`,
    };
  }

  // Check file size
  if (file.size > ARTICLE_CONSTRAINTS.IMAGE_MAX_SIZE) {
    return {
      valid: false,
      error: `File too large. Maximum size: ${ARTICLE_CONSTRAINTS.IMAGE_MAX_SIZE / (1024 * 1024)}MB`,
    };
  }

  // Check file name
  if (!/^[a-zA-Z0-9_\-\.]+$/.test(file.name)) {
    return { valid: false, error: 'File name contains invalid characters' };
  }

  return { valid: true };
}

/**
 * Validate SEO fields
 */
export function validateSEO(
  seoTitle: string | null | undefined,
  seoDescription: string | null | undefined
): { valid: boolean; error?: string } {
  if (seoTitle && typeof seoTitle === 'string') {
    if (seoTitle.length > ARTICLE_CONSTRAINTS.SEO_TITLE_MAX) {
      return { valid: false, error: `SEO title must not exceed ${ARTICLE_CONSTRAINTS.SEO_TITLE_MAX} characters` };
    }
  }

  if (seoDescription && typeof seoDescription === 'string') {
    if (seoDescription.length > ARTICLE_CONSTRAINTS.SEO_DESC_MAX) {
      return { valid: false, error: `SEO description must not exceed ${ARTICLE_CONSTRAINTS.SEO_DESC_MAX} characters` };
    }
  }

  return { valid: true };
}

/**
 * Calculate estimated read time (words per minute = 200)
 */
export function calculateReadTime(content: string): number {
  if (!content) return 1;

  // Strip HTML tags
  const text = content.replace(/<[^>]*>/g, ' ');
  
  // Count words
  const words = text.trim().split(/\s+/).length;
  
  // Calculate minutes (minimum 1 minute)
  const minutes = Math.ceil(words / 200);
  
  return Math.max(1, minutes);
}

/**
 * Comprehensive article validation
 */
export function validateArticle(data: {
  title: string;
  content: string;
  slug?: string;
  excerpt?: string;
  category: string;
  tags?: string[];
  seoTitle?: string;
  seoDescription?: string;
}): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Validate title
  const titleCheck = validateTitle(data.title);
  if (!titleCheck.valid) errors.push(titleCheck.error!);

  // Validate content
  const contentCheck = validateContent(data.content);
  if (!contentCheck.valid) errors.push(contentCheck.error!);

  // Validate slug if provided
  if (data.slug) {
    const slugCheck = validateSlug(data.slug);
    if (!slugCheck.valid) errors.push(slugCheck.error!);
  }

  // Validate excerpt if provided
  if (data.excerpt) {
    const excerptCheck = validateExcerpt(data.excerpt);
    if (!excerptCheck.valid) errors.push(excerptCheck.error!);
  }

  // Validate category
  const categoryCheck = validateCategory(data.category);
  if (!categoryCheck.valid) errors.push(categoryCheck.error!);

  // Validate tags if provided
  if (data.tags) {
    const tagsCheck = validateTags(data.tags);
    if (!tagsCheck.valid) errors.push(tagsCheck.error!);
  }

  // Validate SEO fields
  const seoCheck = validateSEO(data.seoTitle, data.seoDescription);
  if (!seoCheck.valid) errors.push(seoCheck.error!);

  return {
    valid: errors.length === 0,
    errors,
  };
}
