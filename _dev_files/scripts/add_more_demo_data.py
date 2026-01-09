import sys
sys.path.append('/app/backend')

import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime, timezone, timedelta
import uuid

async def add_more_data():
    mongo_url = "mongodb://localhost:27017"
    client = AsyncIOMotorClient(mongo_url)
    db = client["savvy_saver_db"]
    
    # Get existing data
    brands = await db.brands.find({}, {'_id': 0}).to_list(100)
    categories = await db.categories.find({}, {'_id': 0}).to_list(100)
    
    if not brands:
        print("No brands found. Run seed_demo_data.py first.")
        return
    
    print(f"Found {len(brands)} brands and {len(categories)} categories")
    
    # Add keyword mappings
    await db.keyword_mappings.delete_many({})
    
    keyword_mappings = [
        {'id': str(uuid.uuid4()), 'keyword': 'ayakkabı', 'brand_ids': [b['id'] for b in brands if b['name'] in ['Nike', 'Adidas', 'Puma', 'Converse']], 'priority': 10, 'is_active': True, 'created_at': datetime.now(timezone.utc).isoformat()},
        {'id': str(uuid.uuid4()), 'keyword': 'spor', 'brand_ids': [b['id'] for b in brands if b['name'] in ['Nike', 'Adidas', 'Under Armour', 'Reebok']], 'priority': 9, 'is_active': True, 'created_at': datetime.now(timezone.utc).isoformat()},
        {'id': str(uuid.uuid4()), 'keyword': 'koşu', 'brand_ids': [b['id'] for b in brands if b['name'] in ['Nike', 'Adidas', 'New Balance', 'Skechers']], 'priority': 8, 'is_active': True, 'created_at': datetime.now(timezone.utc).isoformat()},
        {'id': str(uuid.uuid4()), 'keyword': 'tişört', 'brand_ids': [b['id'] for b in brands if b['name'] in ['Lacoste', 'Nike', 'Adidas']], 'priority': 7, 'is_active': True, 'created_at': datetime.now(timezone.utc).isoformat()},
        {'id': str(uuid.uuid4()), 'keyword': 'sneaker', 'brand_ids': [b['id'] for b in brands if b['name'] in ['Vans', 'Converse', 'Nike', 'Adidas']], 'priority': 6, 'is_active': True, 'created_at': datetime.now(timezone.utc).isoformat()},
    ]
    
    await db.keyword_mappings.insert_many(keyword_mappings)
    print(f"✓ {len(keyword_mappings)} keyword mappings created")
    
    # Add expiring soon coupons (within 24 hours)
    nike_id = next((b['id'] for b in brands if b['name'] == 'Nike'), None)
    adidas_id = next((b['id'] for b in brands if b['name'] == 'Adidas'), None)
    
    if nike_id and adidas_id:
        expiring_coupons = [
            {
                'id': str(uuid.uuid4()),
                'brand_id': nike_id,
                'title': '🔥 Son Fırsat! Nike İndirim Kodu',
                'description': 'Sadece bugün geçerli!',
                'code': 'SONGUN20',
                'discount_text': '%20 İndirim',
                'expiry_date': (datetime.now(timezone.utc) + timedelta(hours=12)).isoformat(),
                'is_active': True,
                'utm_template': 'utm_source=savvysaver&utm_medium=coupon',
                'destination_url': 'https://nike.com',
                'created_at': datetime.now(timezone.utc).isoformat()
            },
            {
                'id': str(uuid.uuid4()),
                'brand_id': adidas_id,
                'title': '⏰ Kaçırmayın! Adidas Flash Sale',
                'description': 'Son saatler!',
                'code': 'FLASH30',
                'discount_text': '%30 İndirim',
                'expiry_date': (datetime.now(timezone.utc) + timedelta(hours=18)).isoformat(),
                'is_active': True,
                'utm_template': 'utm_source=savvysaver&utm_medium=coupon',
                'destination_url': 'https://adidas.com',
                'created_at': datetime.now(timezone.utc).isoformat()
            }
        ]
        
        await db.coupons.insert_many(expiring_coupons)
        print(f"✓ {len(expiring_coupons)} expiring soon coupons created")
    
    # Add hero slides
    await db.hero_slides.delete_many({})
    
    hero_slides = [
        {
            'id': str(uuid.uuid4()),
            'title': 'Yaz İndirimleri Başladı!',
            'subtitle': 'Tüm spor ürünlerinde %50\'ye varan indirimler',
            'image_url': 'https://images.unsplash.com/photo-1556906781-9a412961c28c?w=1200',
            'link_url': '/kategori/spor',
            'button_text': 'Keşfet',
            'order': 1,
            'is_active': True
        },
        {
            'id': str(uuid.uuid4()),
            'title': 'Nike Özel Fırsatlar',
            'subtitle': 'Seçili ürünlerde ekstra %20 indirim',
            'image_url': 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=1200',
            'link_url': '/magaza/nike',
            'button_text': 'Alışverişe Başla',
            'order': 2,
            'is_active': True
        },
        {
            'id': str(uuid.uuid4()),
            'title': 'Yeni Sezon Koleksiyonu',
            'subtitle': 'En yeni modeller şimdi indirimde',
            'image_url': 'https://images.unsplash.com/photo-1460353581641-37baddab0fa2?w=1200',
            'link_url': '/kategori/moda',
            'button_text': 'İncele',
            'order': 3,
            'is_active': True
        }
    ]
    
    await db.hero_slides.insert_many(hero_slides)
    print(f"✓ {len(hero_slides)} hero slides created")
    
    # Add sample catalogs
    await db.catalogs.delete_many({})
    
    catalogs = [
        {
            'id': str(uuid.uuid4()),
            'brand_id': nike_id,
            'title': 'Nike Yaz 2024 Kataloğu',
            'description': 'Yeni sezon ürünleri',
            'pdf_url': 'https://www.w3.org/WAI/WCAG21/Techniques/pdf/img/table-word.pdf',
            'thumbnail_url': 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400',
            'valid_from': datetime.now(timezone.utc).isoformat(),
            'valid_until': (datetime.now(timezone.utc) + timedelta(days=30)).isoformat(),
            'is_active': True,
            'created_at': datetime.now(timezone.utc).isoformat()
        }
    ]
    
    if nike_id:
        await db.catalogs.insert_many(catalogs)
        print(f"✓ {len(catalogs)} catalogs created")
    
    print("\n✅ Demo data added successfully!")
    client.close()

if __name__ == "__main__":
    asyncio.run(add_more_data())
