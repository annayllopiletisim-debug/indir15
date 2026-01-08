import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { Brand, Discount, Coupon } from '@/lib/models';

// Turkish character normalization for better search
function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .replace(/[ıİ]/g, 'i')
    .replace(/[ğĞ]/g, 'g')
    .replace(/[üÜ]/g, 'u')
    .replace(/[şŞ]/g, 's')
    .replace(/[öÖ]/g, 'o')
    .replace(/[çÇ]/g, 'c');
}

// Calculate Levenshtein distance for fuzzy matching
function levenshtein(a: string, b: string): number {
  const matrix: number[][] = [];
  
  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }
  
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }
  
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }
  
  return matrix[b.length][a.length];
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q')?.trim() || '';
  
  if (query.length < 2) {
    return NextResponse.json({ brands: [], discounts: [], suggestions: [] });
  }
  
  await connectDB();
  
  const normalizedQuery = normalizeText(query);
  console.log('Search query:', query, 'normalized:', normalizedQuery);
  
  // Get all brands and discounts for searching
  const [allBrands, allDiscounts, allCoupons] = await Promise.all([
    Brand.find({}).lean(),
    Discount.find({}).limit(100).lean(),
    Coupon.find({ is_active: true }).limit(100).lean(),
  ]);
  
  // Count deals per brand
  const brandDealCount: Record<string, number> = {};
  allDiscounts.forEach((d: any) => {
    if (d.brand_id) {
      brandDealCount[d.brand_id] = (brandDealCount[d.brand_id] || 0) + 1;
    }
  });
  allCoupons.forEach((c: any) => {
    if (c.brand_id) {
      brandDealCount[c.brand_id] = (brandDealCount[c.brand_id] || 0) + 1;
    }
  });
  
  // Search brands with fuzzy matching
  const brandMatches: any[] = [];
  const suggestions: string[] = [];
  
  allBrands.forEach((brand: any) => {
    const normalizedName = normalizeText(brand.name);
    
    // Exact or partial match
    if (normalizedName.includes(normalizedQuery) || normalizedQuery.includes(normalizedName)) {
      brandMatches.push({
        ...brand,
        _id: undefined,
        deal_count: brandDealCount[brand.id] || 0,
        relevance: normalizedName.startsWith(normalizedQuery) ? 2 : 1
      });
    }
    // Fuzzy match - check if close enough
    else if (query.length >= 3) {
      const distance = levenshtein(normalizedQuery, normalizedName.substring(0, normalizedQuery.length + 2));
      if (distance <= 2) {
        // This is a potential "did you mean" suggestion
        if (suggestions.length < 3 && !suggestions.includes(brand.name)) {
          suggestions.push(brand.name);
        }
      }
    }
  });
  
  // Sort brands by relevance
  brandMatches.sort((a, b) => {
    if (b.relevance !== a.relevance) return b.relevance - a.relevance;
    return (b.deal_count || 0) - (a.deal_count || 0);
  });
  
  // Search discounts
  const discountMatches = allDiscounts
    .filter((d: any) => {
      const normalizedTitle = normalizeText(d.title);
      return normalizedTitle.includes(normalizedQuery);
    })
    .slice(0, 10)
    .map((d: any) => {
      const brand = allBrands.find((b: any) => b.id === d.brand_id);
      return {
        id: d.id,
        title: d.title,
        discount_text: d.discount_text,
        brand: brand ? { name: brand.name, slug: brand.slug } : null
      };
    });
  
  return NextResponse.json({
    brands: brandMatches.slice(0, 5),
    discounts: discountMatches.slice(0, 5),
    suggestions: brandMatches.length === 0 ? suggestions : []
  });
}
