import sys
sys.path.append('/app/backend')

import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os
from datetime import datetime, timezone, timedelta
import uuid

async def seed_data():
    mongo_url = "mongodb://localhost:27017"
    client = AsyncIOMotorClient(mongo_url)
    db = client["savvy_saver_db"]
    
    await db.categories.delete_many({})
    await db.brands.delete_many({})
    await db.coupons.delete_many({})
    await db.discounts.delete_many({})
    await db.hero_slides.delete_many({})
    
    print("Creating expanded demo data...")
    
    # Categories
    categories = [
        {'id': str(uuid.uuid4()), 'name': 'Spor', 'slug': 'spor', 'icon_url': None, 'parent_id': None, 'order': 0, 'is_popular': True, 'created_at': datetime.now(timezone.utc).isoformat()},
        {'id': str(uuid.uuid4()), 'name': 'Moda', 'slug': 'moda', 'icon_url': None, 'parent_id': None, 'order': 1, 'is_popular': True, 'created_at': datetime.now(timezone.utc).isoformat()},
        {'id': str(uuid.uuid4()), 'name': 'Elektronik', 'slug': 'elektronik', 'icon_url': None, 'parent_id': None, 'order': 2, 'is_popular': True, 'created_at': datetime.now(timezone.utc).isoformat()},
        {'id': str(uuid.uuid4()), 'name': 'Gıda', 'slug': 'gida', 'icon_url': None, 'parent_id': None, 'order': 3, 'is_popular': True, 'created_at': datetime.now(timezone.utc).isoformat()},
    ]
    
    await db.categories.insert_many(categories)
    sport_cat_id = categories[0]['id']
    fashion_cat_id = categories[1]['id']
    print(f"✓ {len(categories)} categories created")
    
    # 10 Brands
    brands_data = [
        {'name': 'Nike', 'slug': 'nike', 'category_id': sport_cat_id, 'logo': 'https://images.unsplash.com/photo-1637844528447-aee837ccfc7f?w=200', 'desc': 'Dünya çapında önde gelen spor markası'},
        {'name': 'Adidas', 'slug': 'adidas', 'category_id': sport_cat_id, 'logo': 'https://images.unsplash.com/photo-1556906781-9a412961c28c?w=200', 'desc': 'Alman spor giyim devi'},
        {'name': 'Puma', 'slug': 'puma', 'category_id': sport_cat_id, 'logo': 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=200', 'desc': 'Performans ve stil bir arada'},
        {'name': 'Converse', 'slug': 'converse', 'category_id': fashion_cat_id, 'logo': 'https://images.unsplash.com/photo-1605812860427-4024433a70fd?w=200', 'desc': 'İkonik spor ayakkabı markası'},
        {'name': 'Skechers', 'slug': 'skechers', 'category_id': sport_cat_id, 'logo': 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=200', 'desc': 'Konfor odaklı ayakkabılar'},
        {'name': 'Lacoste', 'slug': 'lacoste', 'category_id': fashion_cat_id, 'logo': 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=200', 'desc': 'Fransız şıklığı'},
        {'name': 'New Balance', 'slug': 'new-balance', 'category_id': sport_cat_id, 'logo': 'https://images.unsplash.com/photo-1539185441755-769473a23570?w=200', 'desc': 'Amerikan spor ayakkabı markası'},
        {'name': 'Under Armour', 'slug': 'under-armour', 'category_id': sport_cat_id, 'logo': 'https://images.unsplash.com/photo-1556906781-9a412961c28c?w=200', 'desc': 'Performans giyim ve ekipmanlar'},
        {'name': 'Vans', 'slug': 'vans', 'category_id': fashion_cat_id, 'logo': 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=200', 'desc': 'Sokak kültürü ve skateboard'},
        {'name': 'Reebok', 'slug': 'reebok', 'category_id': sport_cat_id, 'logo': 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=200', 'desc': 'Fitness ve crossfit uzmanı'},
    ]
    
    brands = []
    for brand_data in brands_data:
        brand = {
            'id': str(uuid.uuid4()),
            'name': brand_data['name'],
            'slug': brand_data['slug'],
            'category_id': brand_data['category_id'],
            'logo_url': brand_data['logo'],
            'description': brand_data['desc'],
            'meta_title': f"{brand_data['name']} Kupon ve İndirimler - %50'ye Varan Fırsatlar",
            'meta_description': f"{brand_data['name']} ürünlerinde geçerli en güncel kupon kodları ve indirimler.",
            'app_install_enabled': brand_data['name'] in ['Nike', 'Adidas', 'Puma'],
            'ios_app_url': f'https://apps.apple.com/app/{brand_data["slug"]}' if brand_data['name'] in ['Nike', 'Adidas', 'Puma'] else None,
            'android_app_url': f'https://play.google.com/store/apps/{brand_data["slug"]}' if brand_data['name'] in ['Nike', 'Adidas', 'Puma'] else None,
            'created_at': datetime.now(timezone.utc).isoformat()
        }
        brands.append(brand)
    
    await db.brands.insert_many(brands)
    print(f"✓ {len(brands)} brands created")
    
    # Coupons for each brand
    all_coupons = []
    coupon_templates = [
        {'title': 'Yeni Üyelere Özel %20 İndirim', 'desc': 'İlk alışverişinizde %20 indirim!', 'code_suffix': 'YENİ', 'discount': '%20 İndirim', 'days': 30},
        {'title': 'Sepette %15 İndirim', 'desc': 'Tüm ürünlerde geçerli', 'code_suffix': '15', 'discount': '%15 İndirim', 'days': 20},
    ]
    
    for brand in brands:
        for i, template in enumerate(coupon_templates):
            coupon = {
                'id': str(uuid.uuid4()),
                'brand_id': brand['id'],
                'title': template['title'],
                'description': template['desc'],
                'code': f"{brand['name'].upper()}{template['code_suffix']}",
                'discount_text': template['discount'],
                'expiry_date': (datetime.now(timezone.utc) + timedelta(days=template['days'])).isoformat(),
                'is_active': True,
                'utm_template': f'utm_source=savvysaver&utm_medium=coupon&utm_campaign={brand["slug"]}',
                'destination_url': f'https://www.{brand["slug"]}.com',
                'created_at': datetime.now(timezone.utc).isoformat()
            }
            all_coupons.append(coupon)
    
    await db.coupons.insert_many(all_coupons)
    print(f"✓ {len(all_coupons)} coupons created")
    
    # Discounts for each brand
    all_discounts = []
    discount_templates = [
        {'title': 'Sezonun Sonu İndirimi', 'desc': 'Seçili ürünlerde %50\'ye varan indirimler!', 'discount': '%50\'ye Varan', 'days': 15},
        {'title': 'Outlet Ürünlerinde Ekstra İndirim', 'desc': 'Outlet kategorisinde ek indirim fırsatı', 'discount': 'Ekstra İndirim', 'days': 25},
    ]
    
    for brand in brands:
        for template in discount_templates:
            discount = {
                'id': str(uuid.uuid4()),
                'brand_id': brand['id'],
                'title': template['title'],
                'description': template['desc'],
                'discount_text': template['discount'],
                'expiry_date': (datetime.now(timezone.utc) + timedelta(days=template['days'])).isoformat(),
                'utm_template': f'utm_source=savvysaver&utm_medium=discount&utm_campaign={brand["slug"]}',
                'destination_url': f'https://www.{brand["slug"]}.com/indirim',
                'created_at': datetime.now(timezone.utc).isoformat()
            }
            all_discounts.append(discount)
    
    await db.discounts.insert_many(all_discounts)
    print(f"✓ {len(all_discounts)} discounts created")
    
    # Hero Slides
    slides = [
        {
            'id': str(uuid.uuid4()),
            'title': 'En Güncel Kupon ve İndirimler',
            'image_url': 'https://images.unsplash.com/photo-1758401690227-c1e8ab0fb456?w=1920&h=1080&fit=crop',
            'link_url': '/magazalar',
            'order': 0,
            'is_active': True,
            'created_at': datetime.now(timezone.utc).isoformat()
        },
        {
            'id': str(uuid.uuid4()),
            'title': 'Spor Ayakkabılarda %50\'ye Varan Fırsatlar',
            'image_url': 'https://images.unsplash.com/photo-1765496307009-b1b7ec9fc7cf?w=1920&h=1080&fit=crop',
            'link_url': '/magazalar',
            'order': 1,
            'is_active': True,
            'created_at': datetime.now(timezone.utc).isoformat()
        }
    ]
    
    await db.hero_slides.insert_many(slides)
    print(f"✓ {len(slides)} hero slides created")
    
    print("\n✅ Demo data seeded successfully!")
    print(f"\n📊 Summary:")
    print(f"   Categories: {len(categories)}")
    print(f"   Brands: {len(brands)}")
    print(f"   Coupons: {len(all_coupons)}")
    print(f"   Discounts: {len(all_discounts)}")
    print(f"   Hero Slides: {len(slides)}")
    
    client.close()

if __name__ == "__main__":
    asyncio.run(seed_data())
