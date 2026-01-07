import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import connectDB from '@/lib/db';
import { Brand, Discount } from '@/lib/models';
import { verifyAuth } from '@/lib/auth';

// Helper to generate slug from Turkish text
function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[ıİ]/g, 'i')
    .replace(/[ğĞ]/g, 'g')
    .replace(/[üÜ]/g, 'u')
    .replace(/[şŞ]/g, 's')
    .replace(/[öÖ]/g, 'o')
    .replace(/[çÇ]/g, 'c')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

// Helper to parse various date formats
function parseDate(dateStr: string): Date | null {
  if (!dateStr || dateStr.trim() === '') return null;
  
  const cleaned = dateStr.trim();
  
  // Try DD.MM.YYYY or DD/MM/YYYY (Turkish format)
  const turkishMatch = cleaned.match(/^(\d{1,2})[.\/](\d{1,2})[.\/](\d{4})$/);
  if (turkishMatch) {
    const [, day, month, year] = turkishMatch;
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    if (!isNaN(date.getTime())) return date;
  }
  
  // Try YYYY-MM-DD (ISO format)
  const isoMatch = cleaned.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  if (isoMatch) {
    const [, year, month, day] = isoMatch;
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    if (!isNaN(date.getTime())) return date;
  }
  
  // Try MM/DD/YYYY (US format)
  const usMatch = cleaned.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (usMatch) {
    const [, month, day, year] = usMatch;
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    if (!isNaN(date.getTime())) return date;
  }
  
  // Try native Date parsing as fallback
  const parsed = new Date(cleaned);
  if (!isNaN(parsed.getTime())) return parsed;
  
  return null;
}

// Extract Google Sheets ID from URL
function extractSheetId(url: string): string | null {
  const match = url.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  return match ? match[1] : null;
}

export async function POST(request: Request) {
  try {
    const { authenticated } = await verifyAuth();
    if (!authenticated) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });
    }

    const { sheetUrl } = await request.json();
    
    if (!sheetUrl) {
      return NextResponse.json({ error: 'Sheet URL gerekli' }, { status: 400 });
    }

    const sheetId = extractSheetId(sheetUrl);
    if (!sheetId) {
      return NextResponse.json({ error: 'Geçersiz Google Sheets URL' }, { status: 400 });
    }

    // Fetch data from Google Sheets (CSV export)
    const csvUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv`;
    const response = await fetch(csvUrl);
    
    if (!response.ok) {
      return NextResponse.json({ 
        error: 'Google Sheets\'e erişilemedi. Dosyanın herkese açık olduğundan emin olun.' 
      }, { status: 400 });
    }

    const csvText = await response.text();
    const rows = parseCSV(csvText);
    
    if (rows.length < 2) {
      return NextResponse.json({ error: 'Veri bulunamadı' }, { status: 400 });
    }

    const headers = rows[0].map((h: string) => h.toLowerCase().trim());
    const dataRows = rows.slice(1);

    await connectDB();

    // Get or create brands
    const brandCache = new Map<string, string>();
    const existingBrands = await Brand.find({}).lean();
    existingBrands.forEach((b: any) => {
      brandCache.set(b.name.toLowerCase(), b.id);
    });

    const errors: string[] = [];
    let imported = 0;

    for (let i = 0; i < dataRows.length; i++) {
      const row = dataRows[i];
      const rowNum = i + 2; // Excel row number

      try {
        const data: Record<string, string> = {};
        headers.forEach((h: string, idx: number) => {
          data[h] = row[idx]?.trim() || '';
        });

        const brandName = data['brand_name'] || data['marka'] || data['magaza'];
        const title = data['title'] || data['baslik'] || data['başlık'];

        if (!brandName || !title) {
          errors.push(`Satır ${rowNum}: Mağaza adı veya başlık eksik`);
          continue;
        }

        // Get or create brand
        let brandId = brandCache.get(brandName.toLowerCase());
        if (!brandId) {
          brandId = uuidv4();
          const newBrand = new Brand({
            id: brandId,
            name: brandName,
            slug: generateSlug(brandName),
            deal_count: 0,
            created_at: new Date(),
          });
          await newBrand.save();
          brandCache.set(brandName.toLowerCase(), brandId);
        }

        // Parse expiry date with multiple format support
        const rawDate = data['expiry_date'] || data['bitis'] || data['bitiş'] || data['bitis_tarihi'] || data['bitiş_tarihi'] || '';
        const expiryDate = parseDate(rawDate);

        // Create discount
        const discount = new Discount({
          id: uuidv4(),
          brand_id: brandId,
          title: title,
          description: data['description'] || data['aciklama'] || data['açıklama'] || '',
          discount_text: data['discount_text'] || data['indirim'] || '',
          destination_url: data['destination_url'] || data['url'] || data['link'] || '',
          image_url: data['image_url'] || data['gorsel'] || data['görsel'] || '',
          expiry_date: expiryDate,
          is_featured: false,
          created_at: new Date(),
        });

        await discount.save();

        // Update brand deal count
        await Brand.updateOne({ id: brandId }, { $inc: { deal_count: 1 } });

        imported++;
      } catch (err: any) {
        errors.push(`Satır ${rowNum}: ${err.message || 'Bilinmeyen hata'}`);
      }
    }

    return NextResponse.json({
      success: imported > 0,
      imported,
      errors: errors.slice(0, 10), // Limit errors to show
    });
  } catch (error: any) {
    console.error('Import error:', error);
    return NextResponse.json({ 
      success: false, 
      imported: 0, 
      errors: [error.message || 'İçe aktarma hatası'] 
    }, { status: 500 });
  }
}

// Simple CSV parser
function parseCSV(text: string): string[][] {
  const rows: string[][] = [];
  const lines = text.split('\n');
  
  for (const line of lines) {
    if (!line.trim()) continue;
    
    const cells: string[] = [];
    let cell = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        cells.push(cell);
        cell = '';
      } else {
        cell += char;
      }
    }
    cells.push(cell);
    rows.push(cells);
  }
  
  return rows;
}
