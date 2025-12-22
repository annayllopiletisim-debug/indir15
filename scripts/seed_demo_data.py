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
    
    # Clear existing data
    await db.categories.delete_many({})
    await db.brands.delete_many({})
    await db.coupons.delete_many({})
    await db.discounts.delete_many({})
    await db.hero_slides.delete_many({})
    await db.admin_users.delete_many({})
    
    print("Creating demo data...")
    
    # Admin user
    from passlib.context import CryptContext
    pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
    
    admin_id = str(uuid.uuid4())
    admin_user = {
        'id': admin_id,
        'username': 'admin',
        'email': 'admin@savvysaver.com',
        'password': pwd_context.hash('admin123'),
        'created_at': datetime.now(timezone.utc).isoformat()
    }
    await db.admin_users.insert_one(admin_user)
    print(f"✓ Admin user created (username: admin, password: admin123)")
    
    # Category
    category_id = str(uuid.uuid4())
    category = {
        'id': category_id,
        'name': 'Spor',
        'slug': 'spor',
        'created_at': datetime.now(timezone.utc).isoformat()
    }
    await db.categories.insert_one(category)
    print(f"✓ Category created: Spor")
    
    # Brand - Nike
    brand_id = str(uuid.uuid4())
    brand = {
        'id': brand_id,
        'name': 'Nike',
        'slug': 'nike',
        'category_id': category_id,
        'logo_url': 'https://images.unsplash.com/photo-1637844528447-aee837ccfc7f?w=200&h=200&fit=crop',
        'description': 'Dünya çapında önde gelen spor markası Nike için özel indirimler ve kuponlar.',
        'meta_title': 'Nike Kupon ve İndirimler - %50\'ye Varan Fırsatlar',
        'meta_description': 'Nike ürünlerinde geçerli en güncel kupon kodları ve indirimler. Spor ayakkabı, giyim ve aksesuarlarda büyük tasarruf!',
        'app_install_enabled': True,
        'ios_app_url': 'https://apps.apple.com/app/nike',
        'android_app_url': 'https://play.google.com/store/apps/nike',
        'created_at': datetime.now(timezone.utc).isoformat()
    }
    await db.brands.insert_one(brand)
    print(f"✓ Brand created: Nike")
    
    # Coupons
    coupons = [
        {
            'id': str(uuid.uuid4()),
            'brand_id': brand_id,
            'title': 'Yeni Üyelere Özel %20 İndirim',
            'description': 'İlk alışverişinizde %20 indirim kazanın!',
            'code': 'NIKE20YENİ',
            'discount_text': '%20 İndirim',
            'expiry_date': (datetime.now(timezone.utc) + timedelta(days=30)).isoformat(),
            'is_active': True,
            'utm_template': 'utm_source=savvysaver&utm_medium=coupon&utm_campaign=nike_new',
            'destination_url': 'https://www.nike.com.tr',
            'created_at': datetime.now(timezone.utc).isoformat()
        },
        {
            'id': str(uuid.uuid4()),
            'brand_id': brand_id,
            'title': 'Spor Ayakkabılarda %15 İndirim',
            'description': 'Tüm spor ayakkabı modellerinde geçerli.',
            'code': 'AYAKKABI15',
            'discount_text': '%15 İndirim',
            'expiry_date': (datetime.now(timezone.utc) + timedelta(days=15)).isoformat(),
            'is_active': True,
            'utm_template': 'utm_source=savvysaver&utm_medium=coupon&utm_campaign=nike_shoes',
            'destination_url': 'https://www.nike.com.tr/ayakkabi',
            'created_at': datetime.now(timezone.utc).isoformat()
        },
        {
            'id': str(uuid.uuid4()),
            'brand_id': brand_id,
            'title': '500 TL ve Üzeri Alışverişlerde Kargo Bedava',
            'description': 'Minimum 500 TL alışverişte ücretsiz kargo.',
            'code': 'KARGOBEDAVA',
            'discount_text': 'Ücretsiz Kargo',
            'expiry_date': (datetime.now(timezone.utc) + timedelta(days=45)).isoformat(),
            'is_active': True,
            'utm_template': 'utm_source=savvysaver&utm_medium=coupon&utm_campaign=nike_freeship',
            'destination_url': 'https://www.nike.com.tr',
            'created_at': datetime.now(timezone.utc).isoformat()
        }
    ]
    
    for coupon in coupons:
        await db.coupons.insert_one(coupon)
    print(f"✓ {len(coupons)} coupons created")
    
    # Discounts
    discounts = [
        {
            'id': str(uuid.uuid4()),
            'brand_id': brand_id,
            'title': 'Sezonun Sonu İndirimi',
            'description': 'Seçili ürünlerde %50\'ye varan indirimler!',
            'discount_text': '%50\'ye Varan',
            'expiry_date': (datetime.now(timezone.utc) + timedelta(days=20)).isoformat(),
            'utm_template': 'utm_source=savvysaver&utm_medium=discount&utm_campaign=nike_season',
            'destination_url': 'https://www.nike.com.tr/indirim',
            'created_at': datetime.now(timezone.utc).isoformat()
        },
        {
            'id': str(uuid.uuid4()),
            'brand_id': brand_id,
            'title': 'Koşu Ekipmanlarında %30 İndirim',
            'description': 'Koşu ayakkabıları ve aksesuarlarında özel fiyatlar.',
            'discount_text': '%30 İndirim',
            'expiry_date': (datetime.now(timezone.utc) + timedelta(days=25)).isoformat(),
            'utm_template': 'utm_source=savvysaver&utm_medium=discount&utm_campaign=nike_running',
            'destination_url': 'https://www.nike.com.tr/kosu',
            'created_at': datetime.now(timezone.utc).isoformat()
        },
        {
            'id': str(uuid.uuid4()),
            'brand_id': brand_id,
            'title': 'Outlet Ürünlerinde Ekstra İndirim',
            'description': 'Outlet kategorisindeki tüm ürünlerde ek indirimler.',
            'discount_text': 'Ekstra İndirim',
            'expiry_date': (datetime.now(timezone.utc) + timedelta(days=10)).isoformat(),
            'utm_template': 'utm_source=savvysaver&utm_medium=discount&utm_campaign=nike_outlet',
            'destination_url': 'https://www.nike.com.tr/outlet',
            'created_at': datetime.now(timezone.utc).isoformat()
        }
    ]
    
    for discount in discounts:
        await db.discounts.insert_one(discount)
    print(f"✓ {len(discounts)} discounts created")
    
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
            'title': 'Nike\'da %50\'ye Varan Fırsatlar',
            'image_url': 'https://images.unsplash.com/photo-1765496307009-b1b7ec9fc7cf?w=1920&h=1080&fit=crop',
            'link_url': '/magaza/nike',
            'order': 1,
            'is_active': True,
            'created_at': datetime.now(timezone.utc).isoformat()
        }
    ]
    
    for slide in slides:
        await db.hero_slides.insert_one(slide)
    print(f"✓ {len(slides)} hero slides created")
    
    print("\n✅ Demo data seeded successfully!")
    print("\n📝 Admin credentials:")
    print("   Username: admin")
    print("   Password: admin123")
    
    client.close()

if __name__ == "__main__":
    asyncio.run(seed_data())
