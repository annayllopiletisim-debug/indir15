import { revalidatePath } from 'next/cache';

// Paths that should be revalidated when content changes
const REVALIDATE_PATHS = {
  discounts: ['/', '/indirimler', '/en-cok-tiklanan', '/yeni-eklenen', '/bitmek-uzere', '/son-24-saat'],
  coupons: ['/', '/kuponlar'],
  giveaways: ['/', '/cekilisler'],
  brands: ['/', '/magazalar'],
  categories: ['/', '/kategoriler'],
  blog: ['/blog'],
} as const;

type ContentType = keyof typeof REVALIDATE_PATHS;

/**
 * Revalidate all related paths when content changes
 * Call this after any CRUD operation in admin
 */
export function revalidateContent(type: ContentType, brandSlug?: string) {
  const paths = REVALIDATE_PATHS[type] || [];
  
  paths.forEach(path => {
    try {
      revalidatePath(path);
    } catch (e) {
      console.error(`Failed to revalidate ${path}:`, e);
    }
  });
  
  // Also revalidate specific brand page if provided
  if (brandSlug) {
    try {
      revalidatePath(`/magaza/${brandSlug}`);
    } catch (e) {
      console.error(`Failed to revalidate brand page:`, e);
    }
  }
}

/**
 * Revalidate a specific path
 */
export function revalidateSinglePath(path: string) {
  try {
    revalidatePath(path);
  } catch (e) {
    console.error(`Failed to revalidate ${path}:`, e);
  }
}
