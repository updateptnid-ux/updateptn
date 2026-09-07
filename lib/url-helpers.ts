/**
 * Get the base URL of the application
 * Works in both server and client environments
 * Automatically detects production vs development
 */
export function getBaseUrl(): string {
  // Browser environment
  if (typeof window !== "undefined") {
    return window.location.origin;
  }

  // Server environment
  // 1. Check for Vercel deployment
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

  // 2. Check for custom domain in production
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL;
  }

  // 3. Fallback to localhost
  return "http://localhost:3000";
}

/**
 * Get the full URL for a given path
 */
export function getFullUrl(path: string): string {
  const baseUrl = getBaseUrl();
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `${baseUrl}${cleanPath}`;
}
