import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { Brand, Discount, Coupon, Category } from '@/lib/models';

// This endpoint will associate existing brands with categories based on the deals they have
// Run this once to fix historical data
export async function POST(request: Request) {
  try {
    // Check for admin auth (simple check)
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.includes('admin')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    
    const results = {
      brandsProcessed: 0,
      brandsUpdated: 0,
      associations: [] as { brand: string; categories: string[] }[],
      errors: [] as string[],
    };

    // Get all brands without category_ids or with empty array
    const brands = await Brand.find({
      $or: [
        { category_ids: { $exists: false } },
        { category_ids: { $size: 0 } },
        { category_ids: null }
      ]
    }).lean();

    // Get all categories
    const categories = await Category.find({}).lean();
    const categoryMap = new Map(categories.map((c: any) => [c.id, c]));

    for (const brand of brands) {
      results.brandsProcessed++;
      const brandId = (brand as any).id;
      
      try {
        // Find discounts for this brand and get unique category IDs from their associated brands
        // Since deals don't have category_id directly, we need to infer from brand industry/name
        // Alternative: Look at other brands in the same industry that do have categories
        
        // For now, let's try to match based on brand name patterns
        const brandName = (brand as any).name.toLowerCase();
        const matchedCategories: string[] = [];
        
        for (const category of categories) {
          const catData = category as any;
          const catName = catData.name.toLowerCase();
          const catSlug = catData.slug.toLowerCase();
          
          // Simple keyword matching - can be expanded
          const keywords: Record<string, string[]> = {
            'elektronik': ['teknosa', 'mediamarkt', 'vatan', 'apple', 'samsung', 'xiaomi', 'huawei', 'dell', 'hp', 'lenovo', 'asus', 'monster', 'jbl', 'sony'],
            'moda': ['koton', 'lcw', 'zara', 'h&m', 'mango', 'pull', 'boyner', 'network', 'vakko', 'mavi', 'colins', 'defacto', 'ipekyol', 'twist'],
            'gida': ['migros', 'carrefour', 'a101', 'bim', 'şok', 'getir', 'yemeksepeti', 'trendyol yemek'],
            'kozmetik': ['gratis', 'sephora', 'watsons', 'rossmann', 'mac', 'loreal', 'flormar', 'golden rose'],
            'ev-yasam': ['ikea', 'koctas', 'english home', 'madame coco', 'karaca', 'bernardo', 'taç'],
            'spor': ['decathlon', 'nike', 'adidas', 'puma', 'under armour', 'intersport', 'sportive'],
            'kitap': ['d&r', 'kitapyurdu', 'idefix', 'bkmkitap', 'pandora'],
            'saglik': ['eczane', 'vitaminler', 'iherb', 'supplementler'],
          };
          
          for (const [catKey, brandKeywords] of Object.entries(keywords)) {
            if (catSlug.includes(catKey) || catName.includes(catKey)) {
              for (const keyword of brandKeywords) {
                if (brandName.includes(keyword)) {
                  if (!matchedCategories.includes(catData.id)) {
                    matchedCategories.push(catData.id);
                  }
                  break;
                }
              }
            }
          }
        }
        
        if (matchedCategories.length > 0) {
          await Brand.updateOne(
            { id: brandId },
            { $set: { category_ids: matchedCategories } }
          );
          results.brandsUpdated++;
          results.associations.push({
            brand: (brand as any).name,
            categories: matchedCategories.map(cid => {
              const cat = categoryMap.get(cid);
              return cat ? (cat as any).name : cid;
            }),
          });
        }
      } catch (err) {
        results.errors.push(`Error processing brand ${(brand as any).name}: ${err}`);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Processed ${results.brandsProcessed} brands, updated ${results.brandsUpdated}`,
      results,
    });
  } catch (error) {
    console.error('Migration error:', error);
    return NextResponse.json({ error: 'Migration failed' }, { status: 500 });
  }
}

// GET endpoint to check status without making changes
export async function GET() {
  try {
    await connectDB();
    
    const [totalBrands, brandsWithCategories, brandsWithoutCategories] = await Promise.all([
      Brand.countDocuments({}),
      Brand.countDocuments({ category_ids: { $exists: true, $not: { $size: 0 } } }),
      Brand.countDocuments({
        $or: [
          { category_ids: { $exists: false } },
          { category_ids: { $size: 0 } },
          { category_ids: null }
        ]
      }),
    ]);

    return NextResponse.json({
      totalBrands,
      brandsWithCategories,
      brandsWithoutCategories,
      percentage: totalBrands > 0 ? Math.round((brandsWithCategories / totalBrands) * 100) : 0,
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to get status' }, { status: 500 });
  }
}
