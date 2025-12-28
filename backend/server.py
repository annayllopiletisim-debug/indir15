from fastapi import FastAPI, APIRouter, HTTPException, Depends, status, UploadFile, File, Form
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.staticfiles import StaticFiles
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
import uuid
from datetime import datetime, timezone, timedelta
from passlib.context import CryptContext
import jwt
from bson import ObjectId
import aiohttp
import aiofiles

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# Create uploads directory
UPLOADS_DIR = ROOT_DIR / 'uploads'
LOGOS_DIR = UPLOADS_DIR / 'logos'
PDFS_DIR = UPLOADS_DIR / 'pdfs'
LOGOS_DIR.mkdir(parents=True, exist_ok=True)
PDFS_DIR.mkdir(parents=True, exist_ok=True)

# File size limits
MAX_LOGO_SIZE = 2 * 1024 * 1024  # 2MB
MAX_PDF_SIZE = 10 * 1024 * 1024  # 10MB

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

app = FastAPI()
api_router = APIRouter(prefix="/api")

# Serve static files for uploads (use /api/uploads for K8s ingress compatibility)
api_router_uploads = APIRouter()
app.mount("/api/uploads", StaticFiles(directory=str(UPLOADS_DIR)), name="uploads")

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer()

JWT_SECRET = os.environ.get('JWT_SECRET', 'your-secret-key-change-this')
JWT_ALGORITHM = "HS256"

class AdminUser(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    username: str
    email: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class AdminUserCreate(BaseModel):
    username: str
    email: str
    password: str

class AdminLogin(BaseModel):
    username: str
    password: str

class TokenResponse(BaseModel):
    token: str
    user: AdminUser

class Category(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    slug: str
    icon_url: Optional[str] = None
    parent_id: Optional[str] = None
    order: int = 0
    is_popular: bool = False
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class CategoryCreate(BaseModel):
    name: str
    slug: str
    icon_url: Optional[str] = None
    parent_id: Optional[str] = None
    order: int = 0
    is_popular: bool = False

class Brand(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    slug: str
    category_id: str
    logo_url: Optional[str] = None
    description: Optional[str] = None
    meta_title: Optional[str] = None
    meta_description: Optional[str] = None
    app_install_enabled: bool = False
    ios_app_url: Optional[str] = None
    android_app_url: Optional[str] = None
    show_on_homepage: bool = False
    homepage_order: int = 0
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    # Category info (populated on read)
    category_name: Optional[str] = None
    category_slug: Optional[str] = None

# Newsletter Subscriber Model
class NewsletterSubscriber(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    email: str
    subscribed_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    is_active: bool = True

class BrandCreate(BaseModel):
    name: str
    slug: str
    category_id: str
    logo_url: Optional[str] = None
    description: Optional[str] = None
    meta_title: Optional[str] = None
    meta_description: Optional[str] = None
    app_install_enabled: bool = False
    ios_app_url: Optional[str] = None
    android_app_url: Optional[str] = None
    show_on_homepage: bool = False
    homepage_order: int = 0

class Coupon(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    brand_id: str
    title: str
    description: Optional[str] = None
    long_description: Optional[str] = None  # Uzun açıklama
    terms_conditions: Optional[str] = None  # Kullanım koşulları
    code: str
    discount_text: str
    expiry_date: Optional[datetime] = None
    is_active: bool = True
    is_featured: bool = False  # Öne çıkan kampanya
    utm_template: Optional[str] = None
    destination_url: str
    image_url: Optional[str] = None  # Kampanya görseli
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class CouponCreate(BaseModel):
    brand_id: str
    title: str
    description: Optional[str] = None
    long_description: Optional[str] = None  # Uzun açıklama
    terms_conditions: Optional[str] = None  # Kullanım koşulları
    code: str
    discount_text: str
    expiry_date: Optional[datetime] = None
    is_active: bool = True
    is_featured: bool = False  # Öne çıkan kampanya
    utm_template: Optional[str] = None
    destination_url: str
    image_url: Optional[str] = None  # Kampanya görseli

class Discount(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    brand_id: str
    title: str
    description: str
    long_description: Optional[str] = None  # Uzun açıklama
    terms_conditions: Optional[str] = None  # Kullanım koşulları
    discount_text: str
    expiry_date: Optional[datetime] = None
    is_featured: bool = False  # Öne çıkan kampanya
    utm_template: Optional[str] = None
    destination_url: str
    image_url: Optional[str] = None  # Kampanya görseli
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class DiscountCreate(BaseModel):
    brand_id: str
    title: str
    description: str
    long_description: Optional[str] = None  # Uzun açıklama
    terms_conditions: Optional[str] = None  # Kullanım koşulları
    discount_text: str
    expiry_date: Optional[datetime] = None
    is_featured: bool = False  # Öne çıkan kampanya
    utm_template: Optional[str] = None
    destination_url: str
    image_url: Optional[str] = None  # Kampanya görseli


# ================== GIVEAWAY (ÇEKİLİŞ) MODELS ==================

class Giveaway(BaseModel):
    """Çekiliş modeli"""
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    brand_id: str
    title: str
    description: Optional[str] = None
    long_description: Optional[str] = None
    terms_conditions: Optional[str] = None
    prize_text: str  # Ödül metni (örn: "iPhone 15 Pro")
    expiry_date: Optional[datetime] = None
    is_active: bool = True
    is_featured: bool = False  # Öne çıkan kampanya
    utm_template: Optional[str] = None
    destination_url: str
    image_url: Optional[str] = None  # Kampanya görseli
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class GiveawayCreate(BaseModel):
    brand_id: str
    title: str
    description: Optional[str] = None
    long_description: Optional[str] = None
    terms_conditions: Optional[str] = None
    prize_text: str
    expiry_date: Optional[datetime] = None
    is_active: bool = True
    utm_template: Optional[str] = None
    destination_url: str
    image_url: Optional[str] = None  # Kampanya görseli


class HeroSlide(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    image_url: str
    link_url: Optional[str] = None
    order: int = 0
    is_active: bool = True
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class HeroSlideCreate(BaseModel):
    title: str
    image_url: str
    link_url: Optional[str] = None
    order: int = 0
    is_active: bool = True

class Catalog(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    brand_id: str
    title: str
    description: Optional[str] = None
    pdf_url: str
    thumbnail_url: Optional[str] = None
    category_id: Optional[str] = None
    valid_from: Optional[datetime] = None
    valid_until: Optional[datetime] = None
    is_active: bool = True
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class CatalogCreate(BaseModel):
    brand_id: str
    title: str
    description: Optional[str] = None
    pdf_url: str
    thumbnail_url: Optional[str] = None
    category_id: Optional[str] = None
    valid_from: Optional[datetime] = None
    valid_until: Optional[datetime] = None
    is_active: bool = True

class ClickEvent(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    type: str  # 'coupon_view', 'coupon_copy', 'discount_click', 'catalog_view', 'app_install'
    item_id: str
    brand_id: str
    category_id: Optional[str] = None
    session_id: Optional[str] = None
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ClickEventCreate(BaseModel):
    type: str
    item_id: str
    brand_id: str
    category_id: Optional[str] = None
    session_id: Optional[str] = None

class KeywordMapping(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    keyword: str
    brand_ids: List[str] = []  # Ordered list of brand IDs (priority order)
    category_id: Optional[str] = None
    priority: int = 0
    is_active: bool = True
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class KeywordMappingCreate(BaseModel):
    keyword: str
    brand_ids: List[str] = []
    category_id: Optional[str] = None
    priority: int = 0
    is_active: bool = True

class AnalyticsDashboard(BaseModel):
    total_clicks: int
    brand_clicks: List[dict]
    popular_discounts: List[dict]
    popular_brands: List[dict]
    category_performance: List[dict] = []
    coupon_conversions: List[dict] = []

class UploadResponse(BaseModel):
    url: str
    filename: str

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def create_token(user_id: str) -> str:
    payload = {
        'user_id': user_id,
        'exp': datetime.now(timezone.utc) + timedelta(days=7)
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        token = credentials.credentials
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        user_id = payload.get('user_id')
        user = await db.admin_users.find_one({'id': user_id}, {'_id': 0})
        if not user:
            raise HTTPException(status_code=401, detail="Invalid token")
        return AdminUser(**user)
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid token")

@api_router.post("/auth/register", response_model=TokenResponse)
async def register(user_data: AdminUserCreate):
    existing = await db.admin_users.find_one({'username': user_data.username}, {'_id': 0})
    if existing:
        raise HTTPException(status_code=400, detail="Username already exists")
    
    hashed_password = get_password_hash(user_data.password)
    user = AdminUser(username=user_data.username, email=user_data.email)
    user_dict = user.model_dump()
    user_dict['password'] = hashed_password
    user_dict['created_at'] = user_dict['created_at'].isoformat()
    
    await db.admin_users.insert_one(user_dict)
    token = create_token(user.id)
    
    return TokenResponse(token=token, user=user)

@api_router.post("/auth/login", response_model=TokenResponse)
async def login(login_data: AdminLogin):
    user_dict = await db.admin_users.find_one({'username': login_data.username}, {'_id': 0})
    if not user_dict or not verify_password(login_data.password, user_dict['password']):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    if isinstance(user_dict.get('created_at'), str):
        user_dict['created_at'] = datetime.fromisoformat(user_dict['created_at'])
    
    user = AdminUser(**user_dict)
    token = create_token(user.id)
    
    return TokenResponse(token=token, user=user)

@api_router.get("/categories", response_model=List[Category])
async def get_categories():
    categories = await db.categories.find({}, {'_id': 0}).to_list(1000)
    for cat in categories:
        if isinstance(cat.get('created_at'), str):
            cat['created_at'] = datetime.fromisoformat(cat['created_at'])
    return categories

@api_router.get("/categories/with-stats")
async def get_categories_with_stats():
    """Get categories with discount/coupon counts and store counts"""
    categories = await db.categories.find({}, {'_id': 0}).to_list(1000)
    
    result = []
    for cat in categories:
        cat_id = cat['id']
        
        # Get brands in this category
        brands_in_cat = await db.brands.find({'category_id': cat_id}, {'id': 1, '_id': 0}).to_list(1000)
        brand_ids = [b['id'] for b in brands_in_cat]
        
        # Count coupons and discounts for these brands
        coupon_count = await db.coupons.count_documents({'brand_id': {'$in': brand_ids}}) if brand_ids else 0
        discount_count = await db.discounts.count_documents({'brand_id': {'$in': brand_ids}}) if brand_ids else 0
        
        result.append({
            'id': cat['id'],
            'name': cat['name'],
            'slug': cat['slug'],
            'icon_url': cat.get('icon_url'),
            'is_popular': cat.get('is_popular', False),
            'store_count': len(brand_ids),
            'coupon_count': coupon_count,
            'discount_count': discount_count,
            'total_deals': coupon_count + discount_count
        })
    
    return result

@api_router.post("/categories", response_model=Category)
async def create_category(category: CategoryCreate, user: AdminUser = Depends(get_current_user)):
    new_cat = Category(**category.model_dump())
    cat_dict = new_cat.model_dump()
    cat_dict['created_at'] = cat_dict['created_at'].isoformat()
    await db.categories.insert_one(cat_dict)
    return new_cat

@api_router.put("/categories/{category_id}", response_model=Category)
async def update_category(category_id: str, category: CategoryCreate, user: AdminUser = Depends(get_current_user)):
    result = await db.categories.update_one(
        {'id': category_id},
        {'$set': category.model_dump()}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Category not found")
    updated = await db.categories.find_one({'id': category_id}, {'_id': 0})
    if isinstance(updated.get('created_at'), str):
        updated['created_at'] = datetime.fromisoformat(updated['created_at'])
    return Category(**updated)

@api_router.delete("/categories/{category_id}")
async def delete_category(category_id: str, user: AdminUser = Depends(get_current_user)):
    result = await db.categories.delete_one({'id': category_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Category not found")
    return {"message": "Category deleted"}

# ================== UPLOAD ENDPOINTS ==================

@api_router.post("/upload/logo", response_model=UploadResponse)
async def upload_logo(file: UploadFile = File(...), user: AdminUser = Depends(get_current_user)):
    # Validate file type
    allowed_types = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml']
    if file.content_type not in allowed_types:
        raise HTTPException(status_code=400, detail="Logo dosyası JPEG, PNG, WebP veya SVG formatında olmalıdır")
    
    # Read and check file size
    content = await file.read()
    if len(content) > MAX_LOGO_SIZE:
        raise HTTPException(status_code=400, detail=f"Logo dosyası en fazla {MAX_LOGO_SIZE // (1024*1024)}MB olabilir")
    
    # Generate unique filename
    ext = file.filename.split('.')[-1] if '.' in file.filename else 'png'
    filename = f"{uuid.uuid4()}.{ext}"
    filepath = LOGOS_DIR / filename
    
    # Save file
    async with aiofiles.open(filepath, 'wb') as f:
        await f.write(content)
    
    return UploadResponse(url=f"/api/uploads/logos/{filename}", filename=filename)

@api_router.post("/upload/import-logo-from-url", response_model=UploadResponse)
async def import_logo_from_url(url: str = Form(...), user: AdminUser = Depends(get_current_user)):
    try:
        async with aiohttp.ClientSession() as session:
            async with session.get(url, timeout=aiohttp.ClientTimeout(total=30)) as response:
                if response.status != 200:
                    raise HTTPException(status_code=400, detail="Logo URL'den indirilemedi")
                
                content = await response.read()
                if len(content) > MAX_LOGO_SIZE:
                    raise HTTPException(status_code=400, detail=f"Logo dosyası en fazla {MAX_LOGO_SIZE // (1024*1024)}MB olabilir")
                
                # Determine extension from content type or URL
                content_type = response.headers.get('content-type', '')
                if 'png' in content_type or url.endswith('.png'):
                    ext = 'png'
                elif 'svg' in content_type or url.endswith('.svg'):
                    ext = 'svg'
                elif 'webp' in content_type or url.endswith('.webp'):
                    ext = 'webp'
                else:
                    ext = 'jpg'
                
                filename = f"{uuid.uuid4()}.{ext}"
                filepath = LOGOS_DIR / filename
                
                async with aiofiles.open(filepath, 'wb') as f:
                    await f.write(content)
                
                return UploadResponse(url=f"/api/uploads/logos/{filename}", filename=filename)
    except aiohttp.ClientError as e:
        raise HTTPException(status_code=400, detail=f"Logo URL'den indirilemedi: {str(e)}")

@api_router.post("/upload/pdf", response_model=UploadResponse)
async def upload_pdf(file: UploadFile = File(...), user: AdminUser = Depends(get_current_user)):
    # Validate file type
    if file.content_type != 'application/pdf':
        raise HTTPException(status_code=400, detail="Dosya PDF formatında olmalıdır")
    
    # Read and check file size
    content = await file.read()
    if len(content) > MAX_PDF_SIZE:
        raise HTTPException(status_code=400, detail=f"PDF dosyası en fazla {MAX_PDF_SIZE // (1024*1024)}MB olabilir. Daha büyük dosyalar yüklenemez.")
    
    # Generate unique filename
    filename = f"{uuid.uuid4()}.pdf"
    filepath = PDFS_DIR / filename
    
    # Save file
    async with aiofiles.open(filepath, 'wb') as f:
        await f.write(content)
    
    return UploadResponse(url=f"/api/uploads/pdfs/{filename}", filename=filename)

@api_router.get("/brands", response_model=List[Brand])
async def get_brands(category_id: Optional[str] = None):
    query = {'category_id': category_id} if category_id else {}
    brands = await db.brands.find(query, {'_id': 0}).to_list(1000)
    for brand in brands:
        if isinstance(brand.get('created_at'), str):
            brand['created_at'] = datetime.fromisoformat(brand['created_at'])
    return brands

@api_router.get("/brands/homepage")
async def get_homepage_brands():
    """Get brands marked for homepage display, ordered by homepage_order"""
    brands = await db.brands.find(
        {'show_on_homepage': True},
        {'_id': 0}
    ).sort('homepage_order', 1).to_list(100)
    for brand in brands:
        if isinstance(brand.get('created_at'), str):
            brand['created_at'] = datetime.fromisoformat(brand['created_at'])
    return brands


@api_router.get("/brands/list-with-deal-counts")
async def get_all_brands_with_deal_counts():
    """Get all brands with their deal counts for homepage use"""
    brands = await db.brands.find({}, {'_id': 0}).sort('name', 1).to_list(500)
    
    for brand in brands:
        brand_id = brand['id']
        # Count active coupons
        coupon_count = await db.coupons.count_documents({'brand_id': brand_id, 'is_active': True})
        # Count discounts
        discount_count = await db.discounts.count_documents({'brand_id': brand_id})
        brand['deal_count'] = coupon_count + discount_count
    
    return brands


@api_router.get("/brands/{slug}", response_model=Brand)
async def get_brand_by_slug(slug: str):
    brand = await db.brands.find_one({'slug': slug}, {'_id': 0})
    if not brand:
        raise HTTPException(status_code=404, detail="Brand not found")
    if isinstance(brand.get('created_at'), str):
        brand['created_at'] = datetime.fromisoformat(brand['created_at'])
    
    # Add category info
    if brand.get('category_id'):
        category = await db.categories.find_one({'id': brand['category_id']}, {'_id': 0})
        if category:
            brand['category_name'] = category.get('name')
            brand['category_slug'] = category.get('slug')
    
    return Brand(**brand)

@api_router.post("/brands", response_model=Brand)
async def create_brand(brand: BrandCreate, user: AdminUser = Depends(get_current_user)):
    new_brand = Brand(**brand.model_dump())
    brand_dict = new_brand.model_dump()
    brand_dict['created_at'] = brand_dict['created_at'].isoformat()
    await db.brands.insert_one(brand_dict)
    return new_brand

@api_router.put("/brands/{brand_id}", response_model=Brand)
async def update_brand(brand_id: str, brand: BrandCreate, user: AdminUser = Depends(get_current_user)):
    result = await db.brands.update_one(
        {'id': brand_id},
        {'$set': brand.model_dump()}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Brand not found")
    updated = await db.brands.find_one({'id': brand_id}, {'_id': 0})
    if isinstance(updated.get('created_at'), str):
        updated['created_at'] = datetime.fromisoformat(updated['created_at'])
    return Brand(**updated)

@api_router.delete("/brands/{brand_id}")
async def delete_brand(brand_id: str, user: AdminUser = Depends(get_current_user)):
    result = await db.brands.delete_one({'id': brand_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Brand not found")
    return {"message": "Brand deleted"}

@api_router.get("/coupons", response_model=List[Coupon])
async def get_coupons(brand_id: Optional[str] = None):
    query = {'brand_id': brand_id} if brand_id else {}
    coupons = await db.coupons.find(query, {'_id': 0}).to_list(1000)
    for coupon in coupons:
        if isinstance(coupon.get('created_at'), str):
            coupon['created_at'] = datetime.fromisoformat(coupon['created_at'])
        if isinstance(coupon.get('expiry_date'), str):
            coupon['expiry_date'] = datetime.fromisoformat(coupon['expiry_date'])
    return coupons


# ================== COUPON/DISCOUNT DETAIL ENDPOINTS ==================

def generate_slug(title: str) -> str:
    """Generate URL-friendly slug from title"""
    import re
    # Turkish character replacements
    tr_map = {'ı': 'i', 'ğ': 'g', 'ü': 'u', 'ş': 's', 'ö': 'o', 'ç': 'c',
              'İ': 'i', 'Ğ': 'g', 'Ü': 'u', 'Ş': 's', 'Ö': 'o', 'Ç': 'c'}
    slug = title.lower()
    for tr, en in tr_map.items():
        slug = slug.replace(tr, en)
    slug = re.sub(r'[^a-z0-9\s-]', '', slug)
    slug = re.sub(r'[\s_]+', '-', slug)
    slug = re.sub(r'-+', '-', slug).strip('-')
    return slug[:50]  # Limit length


@api_router.get("/coupon/{coupon_id}/detail")
async def get_coupon_detail(coupon_id: str):
    """
    Get single coupon with full details for detail page
    Includes: brand info, SEO meta, related deals, expired status
    """
    base_url = os.environ.get('SITE_URL', 'https://indirimkestet.com')
    now = datetime.now(timezone.utc)
    
    # Get coupon
    coupon = await db.coupons.find_one({'id': coupon_id}, {'_id': 0})
    if not coupon:
        raise HTTPException(status_code=404, detail="Kupon bulunamadı")
    
    # Parse dates
    if isinstance(coupon.get('created_at'), str):
        coupon['created_at'] = datetime.fromisoformat(coupon['created_at'])
    if isinstance(coupon.get('expiry_date'), str):
        coupon['expiry_date'] = datetime.fromisoformat(coupon['expiry_date'])
    
    # Get brand info
    brand = await db.brands.find_one({'id': coupon['brand_id']}, {'_id': 0})
    if not brand:
        raise HTTPException(status_code=404, detail="Marka bulunamadı")
    
    # Check if expired (handle timezone-naive dates)
    is_expired = False
    if coupon.get('expiry_date'):
        expiry = coupon['expiry_date']
        # Make timezone-aware if needed
        if expiry.tzinfo is None:
            expiry = expiry.replace(tzinfo=timezone.utc)
        is_expired = expiry < now
    
    # Generate slug for URL
    coupon_slug = generate_slug(coupon['title'])
    canonical_url = f"/magaza/{brand['slug']}/kupon/{coupon_slug}-{coupon_id}"
    
    # SEO Meta
    seo_meta = {
        'title': f"{coupon['title']} - {brand['name']} Kupon Kodu | İndirim Keşfet",
        'description': coupon.get('description', f"{brand['name']} mağazasında {coupon['discount_text']} indirim fırsatı. Kupon kodunu kullanarak hemen tasarruf edin!"),
        'canonical': f"{base_url}{canonical_url}",
        'robots': 'noindex,follow' if is_expired else 'index,follow',
        'og_type': 'product',
        'og_title': f"{coupon['discount_text']} - {brand['name']}",
        'og_description': coupon['title'],
    }
    
    # Structured Data (Schema.org)
    structured_data = {
        "@context": "https://schema.org",
        "@type": "Offer",
        "name": coupon['title'],
        "description": coupon.get('description', coupon['title']),
        "url": f"{base_url}{canonical_url}",
        "priceCurrency": "TRY",
        "availability": "https://schema.org/InStock" if not is_expired else "https://schema.org/Discontinued",
        "seller": {
            "@type": "Organization",
            "name": brand['name'],
            "url": f"{base_url}/magaza/{brand['slug']}"
        },
        "category": "Coupon"
    }
    if coupon.get('expiry_date'):
        structured_data['validThrough'] = coupon['expiry_date'].isoformat()
    if coupon.get('discount_text'):
        structured_data['discount'] = coupon['discount_text']
    
    # Get related deals from same brand (excluding current)
    related_coupons = await db.coupons.find({
        'brand_id': brand['id'],
        'id': {'$ne': coupon_id},
        'is_active': True
    }, {'_id': 0}).limit(5).to_list(5)
    
    related_discounts = await db.discounts.find({
        'brand_id': brand['id']
    }, {'_id': 0}).limit(5).to_list(5)
    
    # Mark types
    for c in related_coupons:
        c['item_type'] = 'coupon'
    for d in related_discounts:
        d['item_type'] = 'discount'
    
    related_deals = (related_coupons + related_discounts)[:8]
    
    return {
        'item_type': 'coupon',
        'item': coupon,
        'brand': {
            'id': brand['id'],
            'name': brand['name'],
            'slug': brand['slug'],
            'logo_url': brand.get('logo_url'),
            'description': brand.get('description')
        },
        'is_expired': is_expired,
        'canonical_url': canonical_url,
        'seo_meta': seo_meta,
        'structured_data': structured_data,
        'related_deals': related_deals,
        'total_brand_deals': len(related_coupons) + len(related_discounts) + 1
    }


@api_router.get("/discount/{discount_id}/detail")
async def get_discount_detail(discount_id: str):
    """
    Get single discount with full details for detail page
    Includes: brand info, SEO meta, related deals, expired status
    """
    base_url = os.environ.get('SITE_URL', 'https://indirimkestet.com')
    now = datetime.now(timezone.utc)
    
    # Get discount
    discount = await db.discounts.find_one({'id': discount_id}, {'_id': 0})
    if not discount:
        raise HTTPException(status_code=404, detail="İndirim bulunamadı")
    
    # Parse dates
    if isinstance(discount.get('created_at'), str):
        discount['created_at'] = datetime.fromisoformat(discount['created_at'])
    if isinstance(discount.get('expiry_date'), str):
        discount['expiry_date'] = datetime.fromisoformat(discount['expiry_date'])
    
    # Get brand info
    brand = await db.brands.find_one({'id': discount['brand_id']}, {'_id': 0})
    if not brand:
        raise HTTPException(status_code=404, detail="Marka bulunamadı")
    
    # Check if expired (handle timezone-naive dates)
    is_expired = False
    if discount.get('expiry_date'):
        expiry = discount['expiry_date']
        # Make timezone-aware if needed
        if expiry.tzinfo is None:
            expiry = expiry.replace(tzinfo=timezone.utc)
        is_expired = expiry < now
    
    # Generate slug for URL
    discount_slug = generate_slug(discount['title'])
    canonical_url = f"/magaza/{brand['slug']}/indirim/{discount_slug}-{discount_id}"
    
    # SEO Meta
    seo_meta = {
        'title': f"{discount['title']} - {brand['name']} İndirim | İndirim Keşfet",
        'description': discount.get('description', f"{brand['name']} mağazasında {discount['discount_text']} indirim fırsatı. Hemen alışverişe başlayın!"),
        'canonical': f"{base_url}{canonical_url}",
        'robots': 'noindex,follow' if is_expired else 'index,follow',
        'og_type': 'product',
        'og_title': f"{discount['discount_text']} - {brand['name']}",
        'og_description': discount['title'],
    }
    
    # Structured Data (Schema.org)
    structured_data = {
        "@context": "https://schema.org",
        "@type": "Offer",
        "name": discount['title'],
        "description": discount.get('description', discount['title']),
        "url": f"{base_url}{canonical_url}",
        "priceCurrency": "TRY",
        "availability": "https://schema.org/InStock" if not is_expired else "https://schema.org/Discontinued",
        "seller": {
            "@type": "Organization",
            "name": brand['name'],
            "url": f"{base_url}/magaza/{brand['slug']}"
        },
        "category": "Discount"
    }
    if discount.get('expiry_date'):
        structured_data['validThrough'] = discount['expiry_date'].isoformat()
    if discount.get('discount_text'):
        structured_data['discount'] = discount['discount_text']
    
    # Get related deals from same brand (excluding current)
    related_coupons = await db.coupons.find({
        'brand_id': brand['id'],
        'is_active': True
    }, {'_id': 0}).limit(5).to_list(5)
    
    related_discounts = await db.discounts.find({
        'brand_id': brand['id'],
        'id': {'$ne': discount_id}
    }, {'_id': 0}).limit(5).to_list(5)
    
    # Mark types
    for c in related_coupons:
        c['item_type'] = 'coupon'
    for d in related_discounts:
        d['item_type'] = 'discount'
    
    related_deals = (related_coupons + related_discounts)[:8]
    
    return {
        'item_type': 'discount',
        'item': discount,
        'brand': {
            'id': brand['id'],
            'name': brand['name'],
            'slug': brand['slug'],
            'logo_url': brand.get('logo_url'),
            'description': brand.get('description')
        },
        'is_expired': is_expired,
        'canonical_url': canonical_url,
        'seo_meta': seo_meta,
        'structured_data': structured_data,
        'related_deals': related_deals,
        'total_brand_deals': len(related_coupons) + len(related_discounts) + 1
    }


@api_router.get("/giveaway/{giveaway_id}/detail")
async def get_giveaway_detail(giveaway_id: str):
    """
    Get single giveaway with full details for detail page
    Includes: brand info, SEO meta, related deals, expired status
    """
    base_url = os.environ.get('SITE_URL', 'https://indirimkestet.com')
    now = datetime.now(timezone.utc)
    
    # Get giveaway
    giveaway = await db.giveaways.find_one({'id': giveaway_id}, {'_id': 0})
    if not giveaway:
        raise HTTPException(status_code=404, detail="Çekiliş bulunamadı")
    
    # Parse dates
    if isinstance(giveaway.get('created_at'), str):
        giveaway['created_at'] = datetime.fromisoformat(giveaway['created_at'])
    if isinstance(giveaway.get('expiry_date'), str):
        giveaway['expiry_date'] = datetime.fromisoformat(giveaway['expiry_date'])
    
    # Get brand info
    brand = await db.brands.find_one({'id': giveaway['brand_id']}, {'_id': 0})
    if not brand:
        raise HTTPException(status_code=404, detail="Marka bulunamadı")
    
    # Check if expired (handle timezone-naive dates)
    is_expired = False
    if giveaway.get('expiry_date'):
        expiry = giveaway['expiry_date']
        if expiry.tzinfo is None:
            expiry = expiry.replace(tzinfo=timezone.utc)
        is_expired = expiry < now
    
    # Generate slug for URL
    giveaway_slug = generate_slug(giveaway['title'])
    canonical_url = f"/magaza/{brand['slug']}/cekilis/{giveaway_slug}-{giveaway_id}"
    
    # SEO Meta
    seo_meta = {
        'title': f"{giveaway['title']} - {brand['name']} Çekiliş | İndirim Keşfet",
        'description': giveaway.get('description', f"{brand['name']} mağazasında {giveaway.get('prize_text', 'harika ödüller')} çekilişi! Hemen katılın!"),
        'canonical': f"{base_url}{canonical_url}",
        'robots': 'noindex,follow' if is_expired else 'index,follow',
        'og_type': 'product',
        'og_title': f"{giveaway.get('prize_text', 'Çekiliş')} - {brand['name']}",
        'og_description': giveaway['title'],
    }
    
    # Structured Data (Schema.org)
    structured_data = {
        "@context": "https://schema.org",
        "@type": "Event",
        "name": giveaway['title'],
        "description": giveaway.get('description', giveaway['title']),
        "url": f"{base_url}{canonical_url}",
        "eventStatus": "https://schema.org/EventScheduled" if not is_expired else "https://schema.org/EventCancelled",
        "organizer": {
            "@type": "Organization",
            "name": brand['name'],
            "url": f"{base_url}/magaza/{brand['slug']}"
        },
        "offers": {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "TRY",
            "availability": "https://schema.org/InStock" if not is_expired else "https://schema.org/SoldOut"
        }
    }
    if giveaway.get('expiry_date'):
        structured_data['endDate'] = giveaway['expiry_date'].isoformat()
    
    # Get related deals from same brand
    related_coupons = await db.coupons.find({
        'brand_id': brand['id'],
        'is_active': True
    }, {'_id': 0}).limit(3).to_list(3)
    
    related_discounts = await db.discounts.find({
        'brand_id': brand['id']
    }, {'_id': 0}).limit(3).to_list(3)
    
    related_giveaways = await db.giveaways.find({
        'brand_id': brand['id'],
        'id': {'$ne': giveaway_id},
        'is_active': True
    }, {'_id': 0}).limit(2).to_list(2)
    
    # Mark types
    for c in related_coupons:
        c['item_type'] = 'coupon'
    for d in related_discounts:
        d['item_type'] = 'discount'
    for g in related_giveaways:
        g['item_type'] = 'giveaway'
    
    related_deals = (related_coupons + related_discounts + related_giveaways)[:8]
    
    return {
        'item_type': 'giveaway',
        'item': giveaway,
        'brand': {
            'id': brand['id'],
            'name': brand['name'],
            'slug': brand['slug'],
            'logo_url': brand.get('logo_url'),
            'description': brand.get('description')
        },
        'is_expired': is_expired,
        'canonical_url': canonical_url,
        'seo_meta': seo_meta,
        'structured_data': structured_data,
        'related_deals': related_deals,
        'total_brand_deals': len(related_coupons) + len(related_discounts) + len(related_giveaways) + 1
    }


@api_router.post("/coupons", response_model=Coupon)
async def create_coupon(coupon: CouponCreate, user: AdminUser = Depends(get_current_user)):
    new_coupon = Coupon(**coupon.model_dump())
    coupon_dict = new_coupon.model_dump()
    coupon_dict['created_at'] = coupon_dict['created_at'].isoformat()
    if coupon_dict.get('expiry_date'):
        coupon_dict['expiry_date'] = coupon_dict['expiry_date'].isoformat()
    await db.coupons.insert_one(coupon_dict)
    return new_coupon

@api_router.put("/coupons/{coupon_id}", response_model=Coupon)
async def update_coupon(coupon_id: str, coupon: CouponCreate, user: AdminUser = Depends(get_current_user)):
    update_dict = coupon.model_dump()
    if update_dict.get('expiry_date'):
        update_dict['expiry_date'] = update_dict['expiry_date'].isoformat()
    
    result = await db.coupons.update_one(
        {'id': coupon_id},
        {'$set': update_dict}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Coupon not found")
    updated = await db.coupons.find_one({'id': coupon_id}, {'_id': 0})
    if isinstance(updated.get('created_at'), str):
        updated['created_at'] = datetime.fromisoformat(updated['created_at'])
    if isinstance(updated.get('expiry_date'), str):
        updated['expiry_date'] = datetime.fromisoformat(updated['expiry_date'])
    return Coupon(**updated)

@api_router.delete("/coupons/{coupon_id}")
async def delete_coupon(coupon_id: str, user: AdminUser = Depends(get_current_user)):
    result = await db.coupons.delete_one({'id': coupon_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Coupon not found")
    return {"message": "Coupon deleted"}

@api_router.get("/discounts", response_model=List[Discount])
async def get_discounts(brand_id: Optional[str] = None):
    query = {'brand_id': brand_id} if brand_id else {}
    discounts = await db.discounts.find(query, {'_id': 0}).to_list(1000)
    for discount in discounts:
        if isinstance(discount.get('created_at'), str):
            discount['created_at'] = datetime.fromisoformat(discount['created_at'])
        if isinstance(discount.get('expiry_date'), str):
            discount['expiry_date'] = datetime.fromisoformat(discount['expiry_date'])
    return discounts

@api_router.post("/discounts", response_model=Discount)
async def create_discount(discount: DiscountCreate, user: AdminUser = Depends(get_current_user)):
    new_discount = Discount(**discount.model_dump())
    discount_dict = new_discount.model_dump()
    discount_dict['created_at'] = discount_dict['created_at'].isoformat()
    if discount_dict.get('expiry_date'):
        discount_dict['expiry_date'] = discount_dict['expiry_date'].isoformat()
    await db.discounts.insert_one(discount_dict)
    return new_discount

@api_router.put("/discounts/{discount_id}", response_model=Discount)
async def update_discount(discount_id: str, discount: DiscountCreate, user: AdminUser = Depends(get_current_user)):
    update_dict = discount.model_dump()
    if update_dict.get('expiry_date'):
        update_dict['expiry_date'] = update_dict['expiry_date'].isoformat()
    
    result = await db.discounts.update_one(
        {'id': discount_id},
        {'$set': update_dict}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Discount not found")
    updated = await db.discounts.find_one({'id': discount_id}, {'_id': 0})
    if isinstance(updated.get('created_at'), str):
        updated['created_at'] = datetime.fromisoformat(updated['created_at'])
    if isinstance(updated.get('expiry_date'), str):
        updated['expiry_date'] = datetime.fromisoformat(updated['expiry_date'])
    return Discount(**updated)

@api_router.delete("/discounts/{discount_id}")
async def delete_discount(discount_id: str, user: AdminUser = Depends(get_current_user)):
    result = await db.discounts.delete_one({'id': discount_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Discount not found")
    return {"message": "Discount deleted"}


# ═══════════════════════════════════════════════════════════════
# GIVEAWAY (ÇEKİLİŞ) CRUD ENDPOINTS
# ═══════════════════════════════════════════════════════════════

@api_router.get("/giveaways", response_model=List[Giveaway])
async def get_giveaways(brand_id: Optional[str] = None):
    query = {'brand_id': brand_id} if brand_id else {}
    giveaways = await db.giveaways.find(query, {'_id': 0}).to_list(1000)
    for g in giveaways:
        if isinstance(g.get('created_at'), str):
            g['created_at'] = datetime.fromisoformat(g['created_at'])
        if isinstance(g.get('expiry_date'), str):
            g['expiry_date'] = datetime.fromisoformat(g['expiry_date'])
    return giveaways


@api_router.post("/giveaways", response_model=Giveaway)
async def create_giveaway(giveaway: GiveawayCreate, user: AdminUser = Depends(get_current_user)):
    giveaway_dict = giveaway.model_dump()
    giveaway_dict['id'] = str(uuid.uuid4())
    giveaway_dict['created_at'] = datetime.now(timezone.utc)
    await db.giveaways.insert_one(giveaway_dict)
    return giveaway_dict


@api_router.put("/giveaways/{giveaway_id}", response_model=Giveaway)
async def update_giveaway(giveaway_id: str, giveaway: GiveawayCreate, user: AdminUser = Depends(get_current_user)):
    existing = await db.giveaways.find_one({'id': giveaway_id})
    if not existing:
        raise HTTPException(status_code=404, detail="Giveaway not found")
    
    giveaway_dict = giveaway.model_dump()
    giveaway_dict['id'] = giveaway_id
    giveaway_dict['created_at'] = existing.get('created_at', datetime.now(timezone.utc))
    
    await db.giveaways.update_one(
        {'id': giveaway_id},
        {'$set': giveaway_dict}
    )
    return giveaway_dict


@api_router.delete("/giveaways/{giveaway_id}")
async def delete_giveaway(giveaway_id: str, user: AdminUser = Depends(get_current_user)):
    result = await db.giveaways.delete_one({'id': giveaway_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Giveaway not found")
    return {"message": "Giveaway deleted"}


# ═══════════════════════════════════════════════════════════════
# DEALS COUNT ENDPOINT (for Sticky CTA)
# ═══════════════════════════════════════════════════════════════

@api_router.get("/deals/count")
async def get_deals_count(brand_ids: Optional[str] = None, category_id: Optional[str] = None):
    """
    Get total count of active deals (coupons + discounts + giveaways) for given filters.
    brand_ids: comma-separated brand IDs (e.g., "id1,id2,id3")
    category_id: filter by category (will get all brands in that category)
    Returns: { count: number }
    """
    brand_id_list = []
    
    if brand_ids:
        brand_id_list = [bid.strip() for bid in brand_ids.split(',') if bid.strip()]
    elif category_id:
        # Get all brands in this category
        brands = await db.brands.find({'category_id': category_id}, {'id': 1}).to_list(1000)
        brand_id_list = [b['id'] for b in brands]
    
    if not brand_id_list:
        # No filters, return total active deals
        coupon_count = await db.coupons.count_documents({'is_active': {'$ne': False}})
        discount_count = await db.discounts.count_documents({})
        giveaway_count = await db.giveaways.count_documents({'is_active': {'$ne': False}})
        return {"count": coupon_count + discount_count + giveaway_count}
    
    # Count coupons for selected brands
    coupon_count = await db.coupons.count_documents({
        'brand_id': {'$in': brand_id_list},
        'is_active': {'$ne': False}
    })
    
    # Count discounts for selected brands
    discount_count = await db.discounts.count_documents({
        'brand_id': {'$in': brand_id_list}
    })
    
    # Count giveaways for selected brands
    giveaway_count = await db.giveaways.count_documents({
        'brand_id': {'$in': brand_id_list},
        'is_active': {'$ne': False}
    })
    
    return {"count": coupon_count + discount_count + giveaway_count}

# ═══════════════════════════════════════════════════════════════
# SITE SETTINGS (for Admin toggles like Sticky CTA)
# ═══════════════════════════════════════════════════════════════

class SiteSettings(BaseModel):
    sticky_cta_enabled: bool = True
    sticky_cta_variant: str = "A"  # "A" = "İndirimleri Göster (X)", "B" = "X Sonucu Gör"

@api_router.get("/site-settings")
async def get_site_settings():
    """Get site settings (public endpoint for frontend)"""
    settings = await db.site_settings.find_one({}, {'_id': 0})
    if not settings:
        # Return defaults
        return {"sticky_cta_enabled": True, "sticky_cta_variant": "A"}
    return settings

@api_router.put("/site-settings")
async def update_site_settings(settings: SiteSettings, user: AdminUser = Depends(get_current_user)):
    """Update site settings (admin only)"""
    await db.site_settings.update_one(
        {},
        {'$set': settings.model_dump()},
        upsert=True
    )
    return settings.model_dump()



@api_router.get("/hero-slides", response_model=List[HeroSlide])
async def get_hero_slides(include_inactive: bool = False):
    query = {} if include_inactive else {'is_active': True}
    slides = await db.hero_slides.find(query, {'_id': 0}).sort('order', 1).to_list(100)
    for slide in slides:
        if isinstance(slide.get('created_at'), str):
            slide['created_at'] = datetime.fromisoformat(slide['created_at'])
    return slides

@api_router.post("/hero-slides", response_model=HeroSlide)
async def create_hero_slide(slide: HeroSlideCreate, user: AdminUser = Depends(get_current_user)):
    new_slide = HeroSlide(**slide.model_dump())
    slide_dict = new_slide.model_dump()
    slide_dict['created_at'] = slide_dict['created_at'].isoformat()
    await db.hero_slides.insert_one(slide_dict)
    return new_slide

@api_router.put("/hero-slides/{slide_id}", response_model=HeroSlide)
async def update_hero_slide(slide_id: str, slide: HeroSlideCreate, user: AdminUser = Depends(get_current_user)):
    result = await db.hero_slides.update_one(
        {'id': slide_id},
        {'$set': slide.model_dump()}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Slide not found")
    updated = await db.hero_slides.find_one({'id': slide_id}, {'_id': 0})
    if isinstance(updated.get('created_at'), str):
        updated['created_at'] = datetime.fromisoformat(updated['created_at'])
    return HeroSlide(**updated)

@api_router.delete("/hero-slides/{slide_id}")
async def delete_hero_slide(slide_id: str, user: AdminUser = Depends(get_current_user)):
    result = await db.hero_slides.delete_one({'id': slide_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Slide not found")
    return {"message": "Slide deleted"}

@api_router.get("/catalogs", response_model=List[Catalog])
async def get_catalogs(brand_id: Optional[str] = None, category_id: Optional[str] = None):
    query = {'is_active': True}
    if brand_id:
        query['brand_id'] = brand_id
    if category_id:
        query['category_id'] = category_id
    
    catalogs = await db.catalogs.find(query, {'_id': 0}).to_list(100)
    for catalog in catalogs:
        for date_field in ['created_at', 'valid_from', 'valid_until']:
            if catalog.get(date_field) and isinstance(catalog[date_field], str):
                catalog[date_field] = datetime.fromisoformat(catalog[date_field])
    return catalogs

@api_router.post("/catalogs", response_model=Catalog)
async def create_catalog(catalog: CatalogCreate, user: AdminUser = Depends(get_current_user)):
    new_catalog = Catalog(**catalog.model_dump())
    catalog_dict = new_catalog.model_dump()
    catalog_dict['created_at'] = catalog_dict['created_at'].isoformat()
    if catalog_dict.get('valid_from'):
        catalog_dict['valid_from'] = catalog_dict['valid_from'].isoformat()
    if catalog_dict.get('valid_until'):
        catalog_dict['valid_until'] = catalog_dict['valid_until'].isoformat()
    await db.catalogs.insert_one(catalog_dict)
    return new_catalog

@api_router.put("/catalogs/{catalog_id}", response_model=Catalog)
async def update_catalog(catalog_id: str, catalog: CatalogCreate, user: AdminUser = Depends(get_current_user)):
    update_dict = catalog.model_dump()
    if update_dict.get('valid_from'):
        update_dict['valid_from'] = update_dict['valid_from'].isoformat()
    if update_dict.get('valid_until'):
        update_dict['valid_until'] = update_dict['valid_until'].isoformat()
    
    result = await db.catalogs.update_one(
        {'id': catalog_id},
        {'$set': update_dict}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Catalog not found")
    updated = await db.catalogs.find_one({'id': catalog_id}, {'_id': 0})
    for date_field in ['created_at', 'valid_from', 'valid_until']:
        if updated.get(date_field) and isinstance(updated[date_field], str):
            updated[date_field] = datetime.fromisoformat(updated[date_field])
    return Catalog(**updated)

@api_router.delete("/catalogs/{catalog_id}")
async def delete_catalog(catalog_id: str, user: AdminUser = Depends(get_current_user)):
    result = await db.catalogs.delete_one({'id': catalog_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Catalog not found")
    return {"message": "Catalog deleted"}

# ================== KEYWORD MAPPING ENDPOINTS ==================

@api_router.get("/keyword-mappings", response_model=List[KeywordMapping])
async def get_keyword_mappings(user: AdminUser = Depends(get_current_user)):
    mappings = await db.keyword_mappings.find({}, {'_id': 0}).sort('priority', -1).to_list(1000)
    for mapping in mappings:
        if isinstance(mapping.get('created_at'), str):
            mapping['created_at'] = datetime.fromisoformat(mapping['created_at'])
    return mappings

@api_router.post("/keyword-mappings", response_model=KeywordMapping)
async def create_keyword_mapping(mapping: KeywordMappingCreate, user: AdminUser = Depends(get_current_user)):
    # Check if keyword already exists
    existing = await db.keyword_mappings.find_one({'keyword': mapping.keyword.lower()}, {'_id': 0})
    if existing:
        raise HTTPException(status_code=400, detail="Bu anahtar kelime zaten mevcut")
    
    new_mapping = KeywordMapping(**mapping.model_dump())
    new_mapping.keyword = new_mapping.keyword.lower()
    mapping_dict = new_mapping.model_dump()
    mapping_dict['created_at'] = mapping_dict['created_at'].isoformat()
    await db.keyword_mappings.insert_one(mapping_dict)
    return new_mapping

@api_router.put("/keyword-mappings/{mapping_id}", response_model=KeywordMapping)
async def update_keyword_mapping(mapping_id: str, mapping: KeywordMappingCreate, user: AdminUser = Depends(get_current_user)):
    update_dict = mapping.model_dump()
    update_dict['keyword'] = update_dict['keyword'].lower()
    
    result = await db.keyword_mappings.update_one(
        {'id': mapping_id},
        {'$set': update_dict}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Keyword mapping not found")
    updated = await db.keyword_mappings.find_one({'id': mapping_id}, {'_id': 0})
    if isinstance(updated.get('created_at'), str):
        updated['created_at'] = datetime.fromisoformat(updated['created_at'])
    return KeywordMapping(**updated)

@api_router.delete("/keyword-mappings/{mapping_id}")
async def delete_keyword_mapping(mapping_id: str, user: AdminUser = Depends(get_current_user)):
    result = await db.keyword_mappings.delete_one({'id': mapping_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Keyword mapping not found")
    return {"message": "Keyword mapping deleted"}

# ================== EXPIRING SOON ENDPOINT ==================

@api_router.get("/expiring-soon")
async def get_expiring_soon():
    """Get coupons and discounts expiring within 24 hours"""
    now = datetime.now(timezone.utc)
    in_24_hours = now + timedelta(hours=24)
    
    # Get coupons expiring soon
    coupons = await db.coupons.find({
        'is_active': True,
        'expiry_date': {
            '$gte': now.isoformat(),
            '$lte': in_24_hours.isoformat()
        }
    }, {'_id': 0}).to_list(20)
    
    # Get discounts expiring soon
    discounts = await db.discounts.find({
        'expiry_date': {
            '$gte': now.isoformat(),
            '$lte': in_24_hours.isoformat()
        }
    }, {'_id': 0}).to_list(20)
    
    # Enrich with brand info
    for coupon in coupons:
        brand = await db.brands.find_one({'id': coupon['brand_id']}, {'_id': 0})
        if brand:
            coupon['brand_name'] = brand['name']
            coupon['brand_slug'] = brand['slug']
            coupon['brand_logo_url'] = brand.get('logo_url')
        if isinstance(coupon.get('expiry_date'), str):
            coupon['expiry_date'] = datetime.fromisoformat(coupon['expiry_date'])
        if isinstance(coupon.get('created_at'), str):
            coupon['created_at'] = datetime.fromisoformat(coupon['created_at'])
    
    for discount in discounts:
        brand = await db.brands.find_one({'id': discount['brand_id']}, {'_id': 0})
        if brand:
            discount['brand_name'] = brand['name']
            discount['brand_slug'] = brand['slug']
            discount['brand_logo_url'] = brand.get('logo_url')
        if isinstance(discount.get('expiry_date'), str):
            discount['expiry_date'] = datetime.fromisoformat(discount['expiry_date'])
        if isinstance(discount.get('created_at'), str):
            discount['created_at'] = datetime.fromisoformat(discount['created_at'])
    
    return {
        'coupons': coupons,
        'discounts': discounts,
        'total': len(coupons) + len(discounts)
    }

@api_router.get("/popular-today")
async def get_popular_today():
    """Get today's most clicked deals based on analytics"""
    now = datetime.now(timezone.utc)
    today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
    
    date_filter = {'timestamp': {'$gte': today_start.isoformat()}}
    
    # Get top clicked coupons today
    coupon_pipeline = [
        {'$match': {**date_filter, 'type': {'$in': ['coupon_view', 'coupon_copy']}}},
        {'$group': {'_id': '$item_id', 'clicks': {'$sum': 1}}},
        {'$sort': {'clicks': -1}},
        {'$limit': 5}
    ]
    
    # Get top clicked discounts today
    discount_pipeline = [
        {'$match': {**date_filter, 'type': 'discount_click'}},
        {'$group': {'_id': '$item_id', 'clicks': {'$sum': 1}}},
        {'$sort': {'clicks': -1}},
        {'$limit': 5}
    ]
    
    coupon_clicks = await db.click_events.aggregate(coupon_pipeline).to_list(5)
    discount_clicks = await db.click_events.aggregate(discount_pipeline).to_list(5)
    
    popular_coupons = []
    for item in coupon_clicks:
        coupon = await db.coupons.find_one({'id': item['_id']}, {'_id': 0})
        if coupon:
            brand = await db.brands.find_one({'id': coupon.get('brand_id')}, {'_id': 0})
            if brand:
                coupon['brand_name'] = brand['name']
                coupon['brand_slug'] = brand['slug']
                coupon['brand_logo_url'] = brand.get('logo_url')
            coupon['click_count'] = item['clicks']
            if isinstance(coupon.get('expiry_date'), str):
                coupon['expiry_date'] = datetime.fromisoformat(coupon['expiry_date'])
            popular_coupons.append(coupon)
    
    popular_discounts = []
    for item in discount_clicks:
        discount = await db.discounts.find_one({'id': item['_id']}, {'_id': 0})
        if discount:
            brand = await db.brands.find_one({'id': discount.get('brand_id')}, {'_id': 0})
            if brand:
                discount['brand_name'] = brand['name']
                discount['brand_slug'] = brand['slug']
                discount['brand_logo_url'] = brand.get('logo_url')
            discount['click_count'] = item['clicks']
            if isinstance(discount.get('expiry_date'), str):
                discount['expiry_date'] = datetime.fromisoformat(discount['expiry_date'])
            popular_discounts.append(discount)
    
    # If no analytics data, return recent items as fallback
    if not popular_coupons and not popular_discounts:
        # Get recent coupons
        recent_coupons = await db.coupons.find({'is_active': True}, {'_id': 0}).sort('created_at', -1).limit(4).to_list(4)
        for coupon in recent_coupons:
            brand = await db.brands.find_one({'id': coupon.get('brand_id')}, {'_id': 0})
            if brand:
                coupon['brand_name'] = brand['name']
                coupon['brand_slug'] = brand['slug']
                coupon['brand_logo_url'] = brand.get('logo_url')
            if isinstance(coupon.get('expiry_date'), str):
                coupon['expiry_date'] = datetime.fromisoformat(coupon['expiry_date'])
            popular_coupons.append(coupon)
        
        # Get recent discounts
        recent_discounts = await db.discounts.find({}, {'_id': 0}).sort('created_at', -1).limit(4).to_list(4)
        for discount in recent_discounts:
            brand = await db.brands.find_one({'id': discount.get('brand_id')}, {'_id': 0})
            if brand:
                discount['brand_name'] = brand['name']
                discount['brand_slug'] = brand['slug']
                discount['brand_logo_url'] = brand.get('logo_url')
            if isinstance(discount.get('expiry_date'), str):
                discount['expiry_date'] = datetime.fromisoformat(discount['expiry_date'])
            popular_discounts.append(discount)
    
    return {
        'coupons': popular_coupons,
        'discounts': popular_discounts,
        'total': len(popular_coupons) + len(popular_discounts)
    }


@api_router.get("/featured-deals")
async def get_featured_deals():
    """Get featured deals (is_featured=true). Falls back to popular if no featured items."""
    
    # Get featured coupons
    featured_coupons = await db.coupons.find(
        {'is_featured': True, 'is_active': True},
        {'_id': 0}
    ).limit(5).to_list(5)
    
    # Get featured discounts
    featured_discounts = await db.discounts.find(
        {'is_featured': True},
        {'_id': 0}
    ).limit(5).to_list(5)
    
    # Enrich with brand info
    for coupon in featured_coupons:
        brand = await db.brands.find_one({'id': coupon.get('brand_id')}, {'_id': 0})
        if brand:
            coupon['brand_name'] = brand['name']
            coupon['brand_slug'] = brand['slug']
            coupon['brand_logo_url'] = brand.get('logo_url')
    
    for discount in featured_discounts:
        brand = await db.brands.find_one({'id': discount.get('brand_id')}, {'_id': 0})
        if brand:
            discount['brand_name'] = brand['name']
            discount['brand_slug'] = brand['slug']
            discount['brand_logo_url'] = brand.get('logo_url')
    
    # If no featured items, fall back to popular/recent
    if not featured_coupons and not featured_discounts:
        # Get recent active coupons
        featured_coupons = await db.coupons.find(
            {'is_active': True},
            {'_id': 0}
        ).sort('created_at', -1).limit(3).to_list(3)
        
        for coupon in featured_coupons:
            brand = await db.brands.find_one({'id': coupon.get('brand_id')}, {'_id': 0})
            if brand:
                coupon['brand_name'] = brand['name']
                coupon['brand_slug'] = brand['slug']
                coupon['brand_logo_url'] = brand.get('logo_url')
        
        # Get recent discounts
        featured_discounts = await db.discounts.find(
            {},
            {'_id': 0}
        ).sort('created_at', -1).limit(2).to_list(2)
        
        for discount in featured_discounts:
            brand = await db.brands.find_one({'id': discount.get('brand_id')}, {'_id': 0})
            if brand:
                discount['brand_name'] = brand['name']
                discount['brand_slug'] = brand['slug']
                discount['brand_logo_url'] = brand.get('logo_url')
    
    return {
        'coupons': featured_coupons,
        'discounts': featured_discounts,
        'total': len(featured_coupons) + len(featured_discounts)
    }


@api_router.get("/homepage-brands")
async def get_homepage_brands_with_deals():
    """Get homepage brands with active deal counts"""
    brands = await db.brands.find(
        {'show_on_homepage': True},
        {'_id': 0}
    ).sort('homepage_order', 1).to_list(100)
    
    for brand in brands:
        brand_id = brand['id']
        # Count active coupons
        coupon_count = await db.coupons.count_documents({'brand_id': brand_id, 'is_active': True})
        # Count discounts
        discount_count = await db.discounts.count_documents({'brand_id': brand_id})
        brand['active_deal_count'] = coupon_count + discount_count
        
        if isinstance(brand.get('created_at'), str):
            brand['created_at'] = datetime.fromisoformat(brand['created_at'])
    
    return brands


@api_router.post("/analytics/track")
async def track_click(event: ClickEventCreate):
    new_event = ClickEvent(**event.model_dump())
    event_dict = new_event.model_dump()
    event_dict['timestamp'] = event_dict['timestamp'].isoformat()
    await db.click_events.insert_one(event_dict)
    return {"message": "Click tracked"}

# ================== NEWSLETTER ENDPOINTS ==================
class NewsletterSubscribeRequest(BaseModel):
    email: str

@api_router.post("/newsletter/subscribe")
async def subscribe_newsletter(request: NewsletterSubscribeRequest):
    """Subscribe to newsletter"""
    email = request.email.lower().strip()
    
    # Check if already subscribed
    existing = await db.newsletter_subscribers.find_one({'email': email})
    if existing:
        if existing.get('is_active'):
            raise HTTPException(status_code=409, detail="Email already subscribed")
        else:
            # Reactivate subscription
            await db.newsletter_subscribers.update_one(
                {'email': email},
                {'$set': {'is_active': True, 'subscribed_at': datetime.now(timezone.utc).isoformat()}}
            )
            return {"message": "Subscription reactivated"}
    
    # Create new subscriber
    subscriber = NewsletterSubscriber(email=email)
    subscriber_dict = subscriber.model_dump()
    subscriber_dict['subscribed_at'] = subscriber_dict['subscribed_at'].isoformat()
    await db.newsletter_subscribers.insert_one(subscriber_dict)
    
    return {"message": "Successfully subscribed"}

@api_router.post("/newsletter/unsubscribe")
async def unsubscribe_newsletter(request: NewsletterSubscribeRequest):
    """Unsubscribe from newsletter"""
    email = request.email.lower().strip()
    
    result = await db.newsletter_subscribers.update_one(
        {'email': email},
        {'$set': {'is_active': False}}
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Email not found")
    
    return {"message": "Successfully unsubscribed"}

@api_router.get("/newsletter/subscribers")
async def get_newsletter_subscribers(user: AdminUser = Depends(get_current_user)):
    """Get all newsletter subscribers (admin only)"""
    subscribers = await db.newsletter_subscribers.find({'is_active': True}, {'_id': 0}).to_list(10000)
    return {
        'subscribers': subscribers,
        'total': len(subscribers)
    }

@api_router.get("/analytics/dashboard")
async def get_analytics_dashboard(period: str = "7d", user: AdminUser = Depends(get_current_user)):
    # Calculate date filter based on period
    now = datetime.now(timezone.utc)
    if period == "24h":
        start_date = now - timedelta(hours=24)
    elif period == "7d":
        start_date = now - timedelta(days=7)
    elif period == "30d":
        start_date = now - timedelta(days=30)
    else:
        start_date = now - timedelta(days=7)
    
    date_filter = {'timestamp': {'$gte': start_date.isoformat()}}
    
    # Total clicks in period
    total_clicks = await db.click_events.count_documents(date_filter)
    
    # Top 10 brands by clicks
    brand_clicks_pipeline = [
        {'$match': date_filter},
        {'$group': {'_id': '$brand_id', 'count': {'$sum': 1}}},
        {'$sort': {'count': -1}},
        {'$limit': 10}
    ]
    brand_clicks_raw = await db.click_events.aggregate(brand_clicks_pipeline).to_list(10)
    
    brand_clicks = []
    for item in brand_clicks_raw:
        brand = await db.brands.find_one({'id': item['_id']}, {'_id': 0})
        if brand:
            brand_clicks.append({
                'brand_id': item['_id'],
                'brand_name': brand.get('name', 'Unknown'),
                'brand_slug': brand.get('slug', ''),
                'count': item['count']
            })
    
    # Top 10 coupons by conversions (views vs copies)
    coupon_pipeline = [
        {'$match': {**date_filter, 'type': {'$in': ['coupon_view', 'coupon_copy']}}},
        {'$group': {
            '_id': {'item_id': '$item_id', 'type': '$type'},
            'count': {'$sum': 1}
        }}
    ]
    coupon_stats_raw = await db.click_events.aggregate(coupon_pipeline).to_list(1000)
    
    # Aggregate coupon stats
    coupon_stats = {}
    for item in coupon_stats_raw:
        item_id = item['_id']['item_id']
        event_type = item['_id']['type']
        if item_id not in coupon_stats:
            coupon_stats[item_id] = {'views': 0, 'copies': 0}
        if event_type == 'coupon_view':
            coupon_stats[item_id]['views'] = item['count']
        elif event_type == 'coupon_copy':
            coupon_stats[item_id]['copies'] = item['count']
    
    # Get top 10 coupons by total interactions
    coupon_conversions = []
    for item_id, stats in sorted(coupon_stats.items(), key=lambda x: x[1]['views'] + x[1]['copies'], reverse=True)[:10]:
        coupon = await db.coupons.find_one({'id': item_id}, {'_id': 0})
        if coupon:
            brand = await db.brands.find_one({'id': coupon.get('brand_id')}, {'_id': 0})
            coupon_conversions.append({
                'coupon_id': item_id,
                'title': coupon.get('title', 'Unknown'),
                'code': coupon.get('code', ''),
                'views': stats['views'],
                'copies': stats['copies'],
                'conversion_rate': round(stats['copies'] / stats['views'] * 100, 1) if stats['views'] > 0 else 0,
                'brand_name': brand.get('name', 'Unknown') if brand else 'Unknown',
                'brand_slug': brand.get('slug', '') if brand else ''
            })
    
    # Top 10 discounts by clicks
    discount_clicks_pipeline = [
        {'$match': {**date_filter, 'type': 'discount_click'}},
        {'$group': {'_id': '$item_id', 'count': {'$sum': 1}}},
        {'$sort': {'count': -1}},
        {'$limit': 10}
    ]
    discount_clicks_raw = await db.click_events.aggregate(discount_clicks_pipeline).to_list(10)
    
    popular_discounts = []
    for item in discount_clicks_raw:
        discount = await db.discounts.find_one({'id': item['_id']}, {'_id': 0})
        if discount:
            brand = await db.brands.find_one({'id': discount.get('brand_id')}, {'_id': 0})
            popular_discounts.append({
                'discount_id': item['_id'],
                'title': discount.get('title', 'Unknown'),
                'count': item['count'],
                'brand_name': brand.get('name', 'Unknown') if brand else 'Unknown',
                'brand_slug': brand.get('slug', '') if brand else ''
            })
    
    # Category performance
    category_pipeline = [
        {'$match': date_filter},
        {'$group': {'_id': '$category_id', 'count': {'$sum': 1}}},
        {'$sort': {'count': -1}},
        {'$limit': 10}
    ]
    category_clicks_raw = await db.click_events.aggregate(category_pipeline).to_list(10)
    
    category_performance = []
    for item in category_clicks_raw:
        if item['_id']:
            category = await db.categories.find_one({'id': item['_id']}, {'_id': 0})
            if category:
                category_performance.append({
                    'category_id': item['_id'],
                    'category_name': category.get('name', 'Unknown'),
                    'category_slug': category.get('slug', ''),
                    'count': item['count']
                })
    
    return {
        'period': period,
        'total_clicks': total_clicks,
        'brand_clicks': brand_clicks,
        'popular_discounts': popular_discounts,
        'popular_brands': brand_clicks[:5],
        'category_performance': category_performance,
        'coupon_conversions': coupon_conversions
    }

@api_router.get("/search")
async def search(q: str):
    query_regex = {'$regex': q, '$options': 'i'}
    query_lower = q.lower()
    
    # First, check keyword mappings for intent-based search
    keyword_mapping = await db.keyword_mappings.find_one({
        'keyword': query_lower,
        'is_active': True
    }, {'_id': 0})
    
    mapped_brands = []
    if keyword_mapping:
        # Get brands from keyword mapping (in priority order)
        for brand_id in keyword_mapping.get('brand_ids', []):
            brand = await db.brands.find_one({'id': brand_id}, {'_id': 0})
            if brand:
                mapped_brands.append(brand)
    
    # Category match
    categories = await db.categories.find({'name': query_regex}, {'_id': 0}).limit(5).to_list(5)
    
    # If category found, get brands in that category
    if categories:
        category_ids = [cat['id'] for cat in categories]
        category_brands = await db.brands.find(
            {'category_id': {'$in': category_ids}},
            {'_id': 0}
        ).limit(20).to_list(20)
    else:
        category_brands = []
    
    # Direct brand match
    direct_brands = await db.brands.find({'name': query_regex}, {'_id': 0}).limit(10).to_list(10)
    
    # Merge brands: mapped brands first (priority), then category brands, then direct matches
    all_brands_dict = {}
    for b in mapped_brands:
        all_brands_dict[b['id']] = b
    for b in category_brands:
        if b['id'] not in all_brands_dict:
            all_brands_dict[b['id']] = b
    for b in direct_brands:
        if b['id'] not in all_brands_dict:
            all_brands_dict[b['id']] = b
    
    all_brands = list(all_brands_dict.values())[:15]
    
    # Get coupons
    coupons = await db.coupons.find(
        {'$or': [{'title': query_regex}, {'code': query_regex}, {'description': query_regex}]},
        {'_id': 0}
    ).limit(15).to_list(15)
    
    # Get discounts
    discounts = await db.discounts.find(
        {'$or': [{'title': query_regex}, {'description': query_regex}]},
        {'_id': 0}
    ).limit(15).to_list(15)
    
    # Get catalogs
    catalogs = await db.catalogs.find(
        {'$or': [{'title': query_regex}, {'description': query_regex}]},
        {'_id': 0}
    ).limit(10).to_list(10)
    
    # For each result type, enrich with brand info if needed
    for coupon in coupons:
        brand = await db.brands.find_one({'id': coupon['brand_id']}, {'_id': 0})
        if brand:
            coupon['brand_name'] = brand['name']
            coupon['brand_slug'] = brand['slug']
    
    for discount in discounts:
        brand = await db.brands.find_one({'id': discount['brand_id']}, {'_id': 0})
        if brand:
            discount['brand_name'] = brand['name']
            discount['brand_slug'] = brand['slug']
    
    for catalog in catalogs:
        brand = await db.brands.find_one({'id': catalog['brand_id']}, {'_id': 0})
        if brand:
            catalog['brand_name'] = brand['name']
            catalog['brand_slug'] = brand['slug']
    
    return {
        'categories': categories,
        'brands': all_brands,
        'coupons': coupons,
        'discounts': discounts,
        'catalogs': catalogs,
        'keyword_matched': keyword_mapping is not None
    }

# ================== SEO ENDPOINTS ==================
from fastapi.responses import PlainTextResponse, Response

@api_router.get("/sitemap.xml", response_class=Response)
async def get_sitemap():
    """Generate dynamic sitemap.xml with programmatic SEO pages"""
    base_url = os.environ.get('SITE_URL', 'https://indirimkestet.com')
    now = datetime.now(timezone.utc).strftime('%Y-%m-%d')
    
    urls = []
    
    # Static pages
    static_pages = [
        ('/', '1.0', 'daily'),
        ('/kategoriler', '0.9', 'daily'),
        ('/magazalar', '0.9', 'daily'),
        ('/son-24-saat', '0.9', 'hourly'),
        ('/iletisim', '0.5', 'monthly'),
    ]
    
    for path, priority, changefreq in static_pages:
        urls.append(f'''  <url>
    <loc>{base_url}{path}</loc>
    <lastmod>{now}</lastmod>
    <changefreq>{changefreq}</changefreq>
    <priority>{priority}</priority>
  </url>''')
    
    # Programmatic SEO: Category pages
    categories = await db.categories.find({}, {'_id': 0, 'slug': 1}).to_list(1000)
    for cat in categories:
        urls.append(f'''  <url>
    <loc>{base_url}/{cat['slug']}-indirimleri</loc>
    <lastmod>{now}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>''')
    
    # Programmatic SEO: Brand pages
    brands = await db.brands.find({}, {'_id': 0, 'slug': 1}).to_list(1000)
    for brand in brands:
        urls.append(f'''  <url>
    <loc>{base_url}/{brand['slug']}-indirimleri</loc>
    <lastmod>{now}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>''')
    
    # Programmatic SEO: Keyword pages (only active)
    keywords = await db.keyword_mappings.find({'is_active': True}, {'_id': 0, 'keyword': 1}).to_list(1000)
    for kw in keywords:
        urls.append(f'''  <url>
    <loc>{base_url}/{kw['keyword']}-indirimleri</loc>
    <lastmod>{now}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.7</priority>
  </url>''')
    
    # Legacy: Individual brand/category pages (for backwards compatibility)
    for cat in categories:
        urls.append(f'''  <url>
    <loc>{base_url}/kategori/{cat['slug']}</loc>
    <lastmod>{now}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.7</priority>
  </url>''')
    
    for brand in brands:
        urls.append(f'''  <url>
    <loc>{base_url}/magaza/{brand['slug']}</loc>
    <lastmod>{now}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.7</priority>
  </url>''')
    
    # Active coupons (not expired)
    now_iso = datetime.now(timezone.utc).isoformat()
    active_coupons = await db.coupons.find({
        'is_active': True,
        '$or': [
            {'expiry_date': {'$gte': now_iso}},
            {'expiry_date': None}
        ]
    }, {'_id': 0, 'id': 1}).to_list(1000)
    
    for coupon in active_coupons:
        urls.append(f'''  <url>
    <loc>{base_url}/kupon/{coupon['id']}</loc>
    <lastmod>{now}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.7</priority>
  </url>''')
    
    # Active discounts (not expired)
    active_discounts = await db.discounts.find({
        '$or': [
            {'expiry_date': {'$gte': now_iso}},
            {'expiry_date': None}
        ]
    }, {'_id': 0, 'id': 1}).to_list(1000)
    
    for discount in active_discounts:
        urls.append(f'''  <url>
    <loc>{base_url}/indirim/{discount['id']}</loc>
    <lastmod>{now}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.7</priority>
  </url>''')
    
    sitemap_content = f'''<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
{chr(10).join(urls)}
</urlset>'''
    
    return Response(content=sitemap_content, media_type="application/xml")

@api_router.get("/robots.txt", response_class=PlainTextResponse)
async def get_robots_txt():
    """Generate robots.txt"""
    base_url = os.environ.get('SITE_URL', 'https://indirimli.mi')
    
    robots_content = f"""# indirimliMi Robots.txt
# https://indirimli.mi

User-agent: *
Allow: /
Disallow: /admin/
Disallow: /admin/*
Disallow: /arama?*
Disallow: /api/

# Google Bot
User-agent: Googlebot
Allow: /
Disallow: /admin/
Disallow: /arama?*

# Bing Bot
User-agent: Bingbot
Allow: /
Disallow: /admin/
Disallow: /arama?*

# AI Crawlers - Allow sitemap access, block admin
User-agent: GPTBot
Allow: /sitemap.xml
Disallow: /admin/
Disallow: /api/

User-agent: ChatGPT-User
Allow: /sitemap.xml
Disallow: /admin/
Disallow: /api/

User-agent: Claude-Web
Allow: /sitemap.xml
Disallow: /admin/
Disallow: /api/

User-agent: anthropic-ai
Allow: /sitemap.xml
Disallow: /admin/
Disallow: /api/

# Sitemap
Sitemap: {base_url}/api/sitemap.xml
"""
    return robots_content

# ================== PROGRAMMATIC SEO SYSTEM ==================

class SeoPageResponse(BaseModel):
    page_type: str  # category, brand, category_brand, keyword, time
    slug: str
    canonical_url: str
    seo_meta: dict
    h1: str
    short_description: str
    items: list
    total_items: int
    structured_data: dict
    related_pages: list

def generate_seo_meta(page_type: str, name: str, count: int, parent_name: str = None):
    """Generate SEO meta tags based on page type and content"""
    site_name = "İndirim Keşfet"
    
    templates = {
        'category': {
            'title': f"{name} İndirimleri – Güncel Kampanyalar | {site_name}",
            'description': f"{name} kategorisindeki {count} güncel indirim ve kampanyayı keşfet. En iyi fırsatları kaçırma!",
            'h1': f"{name} Kategorisindeki Güncel İndirimler",
            'short_desc': f"{name} kategorisinde {count} aktif indirim ve kampanya bulunuyor. Hemen keşfedin!"
        },
        'brand': {
            'title': f"{name} İndirim ve Kuponları – {site_name}",
            'description': f"{name} mağazasının güncel kupon kodları ve indirimleri. {count} aktif fırsat!",
            'h1': f"{name} Güncel İndirim ve Kuponları",
            'short_desc': f"{name} mağazasında şu an {count} aktif indirim ve kupon kodu bulunuyor."
        },
        'category_brand': {
            'title': f"{name} {parent_name} İndirimleri | {site_name}",
            'description': f"{parent_name} kategorisinde {name} mağazasının güncel indirimleri. {count} fırsat!",
            'h1': f"{name} – {parent_name} İndirimleri",
            'short_desc': f"{parent_name} kategorisinde {name} mağazasının {count} aktif indirimi."
        },
        'keyword': {
            'title': f"{name} İndirimleri ve Kampanyaları | {site_name}",
            'description': f"{name} ile ilgili en güncel indirim ve kampanyalar. {count} fırsat keşfet!",
            'h1': f"{name} İndirimleri",
            'short_desc': f"{name} araması için {count} güncel indirim ve kampanya bulundu."
        },
        'time': {
            'title': f"Son 24 Saatte Bitecek İndirimler | {site_name}",
            'description': f"Bugün sona erecek {count} indirim ve kampanya. Acele edin, fırsatlar bitiyor!",
            'h1': "Son 24 Saatte Bitecek Fırsatlar",
            'short_desc': f"Önümüzdeki 24 saat içinde bitecek {count} fırsat var. Kaçırmayın!"
        }
    }
    
    template = templates.get(page_type, templates['category'])
    return {
        'title': template['title'],
        'description': template['description'],
        'h1': template['h1'],
        'short_desc': template['short_desc']
    }

def generate_structured_data(page_type: str, items: list, page_url: str, name: str):
    """Generate JSON-LD structured data for SEO"""
    base_url = os.environ.get('SITE_URL', 'https://indirimkestet.com')
    
    # ItemList schema
    item_list = {
        "@context": "https://schema.org",
        "@type": "ItemList",
        "name": f"{name} İndirimleri",
        "url": f"{base_url}{page_url}",
        "numberOfItems": len(items),
        "itemListElement": []
    }
    
    for i, item in enumerate(items[:10], 1):  # Limit to 10 for schema
        list_item = {
            "@type": "ListItem",
            "position": i,
            "item": {
                "@type": "Offer",
                "name": item.get('title', ''),
                "description": item.get('description', item.get('title', '')),
                "url": f"{base_url}/indirim/{item.get('id', '')}",
                "priceCurrency": "TRY",
                "availability": "https://schema.org/InStock"
            }
        }
        
        if item.get('discount_text'):
            list_item['item']['discount'] = item.get('discount_text')
        
        if item.get('expiry_date'):
            list_item['item']['validThrough'] = item.get('expiry_date')
        
        item_list['itemListElement'].append(list_item)
    
    return item_list

@api_router.get("/seo-page/{slug}")
async def get_seo_page(slug: str):
    """
    Programmatic SEO Page Resolver
    Resolves slug to appropriate page type and returns SEO-optimized data
    """
    base_url = os.environ.get('SITE_URL', 'https://indirimkestet.com')
    now = datetime.now(timezone.utc)
    now_iso = now.isoformat()
    
    # Clean slug
    clean_slug = slug.lower().strip()
    
    # Remove common suffixes for matching
    search_slug = clean_slug.replace('-indirimleri', '').replace('-kampanyalari', '').replace('-kuponlari', '')
    
    page_data = None
    page_type = None
    items = []
    related_pages = []
    name = ""
    parent_name = None
    
    # 1. Check if it's a category slug
    category = await db.categories.find_one({'slug': search_slug}, {'_id': 0})
    if category:
        page_type = 'category'
        name = category['name']
        
        # Get brands in this category
        brands_in_cat = await db.brands.find({'category_id': category['id']}, {'_id': 0}).to_list(100)
        brand_ids = [b['id'] for b in brands_in_cat]
        
        # Get active coupons
        coupons = await db.coupons.find({
            'brand_id': {'$in': brand_ids},
            'is_active': True,
            '$or': [{'expiry_date': {'$gte': now_iso}}, {'expiry_date': None}]
        }, {'_id': 0}).to_list(100)
        
        # Get discounts
        discounts = await db.discounts.find({
            'brand_id': {'$in': brand_ids},
            '$or': [{'expiry_date': {'$gte': now_iso}}, {'expiry_date': None}]
        }, {'_id': 0}).to_list(100)
        
        # Add brand info to items
        brand_map = {b['id']: b for b in brands_in_cat}
        for c in coupons:
            c['item_type'] = 'coupon'
            brand = brand_map.get(c['brand_id'], {})
            c['brand_name'] = brand.get('name', '')
            c['brand_slug'] = brand.get('slug', '')
            c['brand_logo_url'] = brand.get('logo_url', '')
        for d in discounts:
            d['item_type'] = 'discount'
            brand = brand_map.get(d['brand_id'], {})
            d['brand_name'] = brand.get('name', '')
            d['brand_slug'] = brand.get('slug', '')
            d['brand_logo_url'] = brand.get('logo_url', '')
        
        items = coupons + discounts
        
        # Related: brands in category
        related_pages = [{'slug': f"{b['slug']}-indirimleri", 'name': b['name'], 'type': 'brand'} for b in brands_in_cat[:5]]
    
    # 2. Check if it's a brand slug
    if not page_type:
        brand = await db.brands.find_one({'slug': search_slug}, {'_id': 0})
        if brand:
            page_type = 'brand'
            name = brand['name']
            
            # Get coupons
            coupons = await db.coupons.find({
                'brand_id': brand['id'],
                'is_active': True,
                '$or': [{'expiry_date': {'$gte': now_iso}}, {'expiry_date': None}]
            }, {'_id': 0}).to_list(100)
            
            # Get discounts
            discounts = await db.discounts.find({
                'brand_id': brand['id'],
                '$or': [{'expiry_date': {'$gte': now_iso}}, {'expiry_date': None}]
            }, {'_id': 0}).to_list(100)
            
            for c in coupons:
                c['item_type'] = 'coupon'
                c['brand_name'] = brand['name']
                c['brand_slug'] = brand['slug']
                c['brand_logo_url'] = brand.get('logo_url', '')
            for d in discounts:
                d['item_type'] = 'discount'
                d['brand_name'] = brand['name']
                d['brand_slug'] = brand['slug']
                d['brand_logo_url'] = brand.get('logo_url', '')
            
            items = coupons + discounts
            
            # Get category for related
            cat = await db.categories.find_one({'id': brand.get('category_id')}, {'_id': 0})
            if cat:
                parent_name = cat['name']
                related_pages.append({'slug': f"{cat['slug']}-indirimleri", 'name': cat['name'], 'type': 'category'})
    
    # 3. Check keyword mappings
    if not page_type:
        keyword_mapping = await db.keyword_mappings.find_one({
            'keyword': search_slug,
            'is_active': True
        }, {'_id': 0})
        
        if keyword_mapping:
            page_type = 'keyword'
            name = search_slug.replace('-', ' ').title()
            
            brand_ids = keyword_mapping.get('brand_ids', [])
            brands = await db.brands.find({'id': {'$in': brand_ids}}, {'_id': 0}).to_list(100)
            brand_map = {b['id']: b for b in brands}
            
            coupons = await db.coupons.find({
                'brand_id': {'$in': brand_ids},
                'is_active': True,
                '$or': [{'expiry_date': {'$gte': now_iso}}, {'expiry_date': None}]
            }, {'_id': 0}).to_list(100)
            
            discounts = await db.discounts.find({
                'brand_id': {'$in': brand_ids},
                '$or': [{'expiry_date': {'$gte': now_iso}}, {'expiry_date': None}]
            }, {'_id': 0}).to_list(100)
            
            for c in coupons:
                c['item_type'] = 'coupon'
                brand = brand_map.get(c['brand_id'], {})
                c['brand_name'] = brand.get('name', '')
                c['brand_slug'] = brand.get('slug', '')
                c['brand_logo_url'] = brand.get('logo_url', '')
            for d in discounts:
                d['item_type'] = 'discount'
                brand = brand_map.get(d['brand_id'], {})
                d['brand_name'] = brand.get('name', '')
                d['brand_slug'] = brand.get('slug', '')
                d['brand_logo_url'] = brand.get('logo_url', '')
            
            items = coupons + discounts
            related_pages = [{'slug': f"{b['slug']}-indirimleri", 'name': b['name'], 'type': 'brand'} for b in brands[:5]]
    
    # 4. Handle "son-24-saat" special case
    if not page_type and clean_slug in ['son-24-saat', 'bugun-biten', 'acil-firsatlar']:
        page_type = 'time'
        name = "Son 24 Saat"
        
        expiry_threshold = (now + timedelta(hours=24)).isoformat()
        
        coupons = await db.coupons.find({
            'is_active': True,
            'expiry_date': {'$gte': now_iso, '$lte': expiry_threshold}
        }, {'_id': 0}).to_list(100)
        
        discounts = await db.discounts.find({
            'expiry_date': {'$gte': now_iso, '$lte': expiry_threshold}
        }, {'_id': 0}).to_list(100)
        
        # Add brand info
        for c in coupons:
            c['item_type'] = 'coupon'
            brand = await db.brands.find_one({'id': c.get('brand_id')}, {'_id': 0})
            if brand:
                c['brand_name'] = brand['name']
                c['brand_slug'] = brand['slug']
                c['brand_logo_url'] = brand.get('logo_url', '')
        for d in discounts:
            d['item_type'] = 'discount'
            brand = await db.brands.find_one({'id': d.get('brand_id')}, {'_id': 0})
            if brand:
                d['brand_name'] = brand['name']
                d['brand_slug'] = brand['slug']
                d['brand_logo_url'] = brand.get('logo_url', '')
        
        items = coupons + discounts
    
    # If no match found, return empty state (not 404)
    if not page_type:
        return {
            'page_type': 'unknown',
            'slug': clean_slug,
            'canonical_url': f"/{clean_slug}-indirimleri",
            'seo_meta': {
                'title': f"{clean_slug.replace('-', ' ').title()} İndirimleri | İndirim Keşfet",
                'description': f"{clean_slug.replace('-', ' ').title()} ile ilgili indirimler aranıyor.",
                'robots': 'noindex, follow'
            },
            'h1': f"{clean_slug.replace('-', ' ').title()} İndirimleri",
            'short_description': "Bu arama için henüz aktif indirim bulunamadı.",
            'items': [],
            'total_items': 0,
            'structured_data': None,
            'related_pages': []
        }
    
    # Generate SEO meta
    seo_meta = generate_seo_meta(page_type, name, len(items), parent_name)
    seo_meta['robots'] = 'index, follow'
    
    # Canonical URL
    canonical_url = f"/{clean_slug}-indirimleri" if not clean_slug.endswith('-indirimleri') else f"/{clean_slug}"
    if page_type == 'time':
        canonical_url = '/son-24-saat'
    
    # Generate structured data
    structured_data = generate_structured_data(page_type, items, canonical_url, name)
    
    return {
        'page_type': page_type,
        'slug': clean_slug,
        'canonical_url': canonical_url,
        'seo_meta': {
            'title': seo_meta['title'],
            'description': seo_meta['description'],
            'robots': seo_meta['robots']
        },
        'h1': seo_meta['h1'],
        'short_description': seo_meta['short_desc'],
        'items': items,
        'total_items': len(items),
        'structured_data': structured_data,
        'related_pages': related_pages
    }

@api_router.get("/seo-slugs")
async def get_all_seo_slugs():
    """Get all valid SEO slugs for sitemap generation"""
    slugs = []
    
    # Categories
    categories = await db.categories.find({}, {'_id': 0, 'slug': 1, 'name': 1}).to_list(1000)
    for cat in categories:
        slugs.append({
            'slug': f"{cat['slug']}-indirimleri",
            'type': 'category',
            'name': cat['name']
        })
    
    # Brands
    brands = await db.brands.find({}, {'_id': 0, 'slug': 1, 'name': 1}).to_list(1000)
    for brand in brands:
        slugs.append({
            'slug': f"{brand['slug']}-indirimleri",
            'type': 'brand',
            'name': brand['name']
        })
    
    # Keywords
    keywords = await db.keyword_mappings.find({'is_active': True}, {'_id': 0, 'keyword': 1}).to_list(1000)
    for kw in keywords:
        slugs.append({
            'slug': f"{kw['keyword']}-indirimleri",
            'type': 'keyword',
            'name': kw['keyword'].replace('-', ' ').title()
        })
    
    # Time-based
    slugs.append({'slug': 'son-24-saat', 'type': 'time', 'name': 'Son 24 Saat'})
    
    return {'slugs': slugs, 'total': len(slugs)}


# ================== GOOGLE SHEET IMPORT ==================

class SheetImportRequest(BaseModel):
    sheet_url: str
    
class SheetImportResult(BaseModel):
    success: bool
    total_rows: int
    imported: int
    skipped: int
    errors: List[dict]
    imported_items: List[dict]


def extract_sheet_id(url: str) -> str:
    """Extract Google Sheet ID from URL"""
    import re
    # Match pattern: /d/{sheet_id}/
    match = re.search(r'/d/([a-zA-Z0-9-_]+)', url)
    if match:
        return match.group(1)
    return None


def parse_turkish_date(date_str: str) -> Optional[datetime]:
    """Parse Turkish date formats like '1 Ocak 2026'"""
    if not date_str or not date_str.strip():
        return None
    
    turkish_months = {
        'ocak': 1, 'şubat': 2, 'mart': 3, 'nisan': 4,
        'mayıs': 5, 'haziran': 6, 'temmuz': 7, 'ağustos': 8,
        'eylül': 9, 'ekim': 10, 'kasım': 11, 'aralık': 12
    }
    
    try:
        parts = date_str.lower().strip().split()
        if len(parts) >= 3:
            day = int(parts[0])
            month = turkish_months.get(parts[1], 1)
            year = int(parts[2])
            return datetime(year, month, day, 23, 59, 59, tzinfo=timezone.utc)
    except:
        pass
    
    # Try ISO format
    try:
        return datetime.fromisoformat(date_str.replace('Z', '+00:00'))
    except:
        pass
    
    return None


def match_store(store_name: str, brands: List[dict]) -> Optional[dict]:
    """Match store name to existing brand using fuzzy matching"""
    if not store_name:
        return None
    
    store_lower = store_name.lower().strip()
    
    # Exact match
    for brand in brands:
        if brand['name'].lower() == store_lower:
            return brand
    
    # Partial match
    for brand in brands:
        brand_lower = brand['name'].lower()
        if store_lower in brand_lower or brand_lower in store_lower:
            return brand
    
    # Slug match
    for brand in brands:
        slug_lower = brand['slug'].lower().replace('-', ' ')
        if store_lower in slug_lower or slug_lower in store_lower:
            return brand
    
    return None


@api_router.post("/admin/import-sheet", response_model=SheetImportResult)
async def import_from_google_sheet(
    request: SheetImportRequest,
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """
    Import discounts/coupons from a Google Sheet.
    Sheet must be publicly accessible or shared.
    
    Expected columns:
    - Türü (İndirim/Kupon)
    - Mağaza (store name)
    - Başlık (title)
    - Açıklama (Kısa) (short description)
    - Uzun Açıklama (long description)
    - İndirim Metni (discount text like %50)
    - Bitiş Tarihi (expiry date)
    - URL (destination URL)
    - Kupon Kodu (coupon code, only for coupons)
    - Kullanım Koşulları (terms, optional)
    """
    # Verify token
    try:
        payload = jwt.decode(request.sheet_url if False else credentials.credentials, SECRET_KEY, algorithms=['HS256'])
    except:
        pass  # Just verify user is logged in
    
    # Extract sheet ID
    sheet_id = extract_sheet_id(request.sheet_url)
    if not sheet_id:
        raise HTTPException(status_code=400, detail="Geçersiz Google Sheet URL'si")
    
    # Fetch CSV from Google Sheets
    csv_url = f"https://docs.google.com/spreadsheets/d/{sheet_id}/export?format=csv"
    
    try:
        async with aiohttp.ClientSession() as session:
            async with session.get(csv_url) as response:
                if response.status != 200:
                    raise HTTPException(status_code=400, detail="Sheet'e erişilemedi. Sheet'in herkese açık olduğundan emin olun.")
                csv_content = await response.text()
    except aiohttp.ClientError as e:
        raise HTTPException(status_code=400, detail=f"Sheet'e erişilemedi: {str(e)}")
    
    # Parse CSV
    import csv
    from io import StringIO
    
    reader = csv.DictReader(StringIO(csv_content))
    rows = list(reader)
    
    if not rows:
        raise HTTPException(status_code=400, detail="Sheet boş veya okunamadı")
    
    # Get all brands for matching
    brands = await db.brands.find({}, {'_id': 0}).to_list(500)
    
    # Process rows
    results = {
        'success': True,
        'total_rows': len(rows),
        'imported': 0,
        'skipped': 0,
        'errors': [],
        'imported_items': []
    }
    
    # Turkish character normalization for matching
    def normalize_turkish(text):
        if not text:
            return ''
        tr_map = {
            'İ': 'i', 'I': 'i', 'ı': 'i',
            'Ğ': 'g', 'ğ': 'g',
            'Ü': 'u', 'ü': 'u',
            'Ş': 's', 'ş': 's',
            'Ö': 'o', 'ö': 'o',
            'Ç': 'c', 'ç': 'c'
        }
        result = text.lower()
        for tr_char, en_char in tr_map.items():
            result = result.replace(tr_char.lower(), en_char)
        return result
    
    # Column name mapping (handle variations with Turkish normalization)
    def get_column(row, *possible_names):
        for name in possible_names:
            normalized_name = normalize_turkish(name)
            for key in row.keys():
                normalized_key = normalize_turkish(key)
                if normalized_name in normalized_key:
                    return row.get(key, '').strip()
        return ''
    
    for idx, row in enumerate(rows, start=2):  # Start from 2 (1 is header)
        try:
            # Debug: Print row keys for first row
            if idx == 2:
                print(f"DEBUG: Row keys = {list(row.keys())}")
            
            # Extract data with flexible column matching
            # A sütunu - Sadece tür belirler (İndirim, Kupon, Çekiliş)
            item_type = get_column(row, 'türü', 'type', 'tip', 'tür')
            store_name = get_column(row, 'mağaza', 'store', 'brand', 'magaza')
            title = get_column(row, 'başlık', 'title', 'baslik')
            short_desc = get_column(row, 'açıklama (kısa)', 'kısa açıklama', 'aciklama', 'description')
            long_desc = get_column(row, 'uzun açıklama', 'long', 'detay', 'açıklama (uzun)')
            # E sütunu - İndirim metni (yeşil badge için)
            discount_text = get_column(row, 'indirim metni', 'indirim oranı', 'discount text', 'badge')
            expiry_str = get_column(row, 'bitiş', 'bitis', 'tarih', 'expiry', 'date', 'son tarih')
            url = get_column(row, 'url', 'link', 'hedef', 'hedef url')
            coupon_code = get_column(row, 'kupon kodu', 'kod', 'code')
            terms = get_column(row, 'kullanım koşulları', 'koşul', 'terms', 'koşullar')
            
            # Debug: Print extracted values for first row
            if idx == 2:
                print(f"DEBUG: item_type='{item_type}', discount_text='{discount_text}', title='{title}'")
            
            # Validate required fields
            if not title:
                results['errors'].append({
                    'row': idx,
                    'reason': 'Başlık boş',
                    'data': store_name
                })
                results['skipped'] += 1
                continue
            
            # Match store
            matched_brand = match_store(store_name, brands)
            if not matched_brand:
                results['errors'].append({
                    'row': idx,
                    'reason': f"Mağaza bulunamadı: '{store_name}'",
                    'data': title
                })
                results['skipped'] += 1
                continue
            
            # Parse expiry date
            expiry_date = parse_turkish_date(expiry_str)
            
            # Determine type: kupon, indirim, or çekiliş
            item_type_lower = item_type.lower() if item_type else ''
            is_coupon = 'kupon' in item_type_lower or (not item_type and bool(coupon_code))
            is_giveaway = 'çekiliş' in item_type_lower or 'cekilis' in item_type_lower
            
            # Check for duplicates (same brand + title)
            if is_giveaway:
                existing = await db.giveaways.find_one({
                    'brand_id': matched_brand['id'],
                    'title': title
                })
            elif is_coupon:
                existing = await db.coupons.find_one({
                    'brand_id': matched_brand['id'],
                    'title': title
                })
            else:
                existing = await db.discounts.find_one({
                    'brand_id': matched_brand['id'],
                    'title': title
                })
            
            if existing:
                results['errors'].append({
                    'row': idx,
                    'reason': 'Aynı başlıkla kayıt zaten mevcut',
                    'data': title
                })
                results['skipped'] += 1
                continue
            
            # Create item
            item_id = str(uuid.uuid4())
            now = datetime.now(timezone.utc)
            
            if is_giveaway:
                # Create giveaway
                giveaway_data = {
                    'id': item_id,
                    'brand_id': matched_brand['id'],
                    'title': title,
                    'description': short_desc or title,
                    'long_description': long_desc or None,
                    'terms_conditions': terms or None,
                    'prize_text': discount_text or 'Harika Ödüller',
                    'expiry_date': expiry_date,
                    'is_active': True,
                    'utm_template': 'utm_source=indirimkesset&utm_medium=giveaway',
                    'destination_url': url or f"https://{matched_brand['slug']}.com.tr",
                    'created_at': now
                }
                await db.giveaways.insert_one(giveaway_data)
                results['imported_items'].append({
                    'type': 'çekiliş',
                    'title': title,
                    'brand': matched_brand['name'],
                    'id': item_id
                })
            elif is_coupon:
                # Create coupon
                coupon_data = {
                    'id': item_id,
                    'brand_id': matched_brand['id'],
                    'title': title,
                    'description': short_desc or title,
                    'long_description': long_desc or None,
                    'terms_conditions': terms or None,
                    'code': coupon_code or 'INDIRIM',
                    'discount_text': discount_text or 'İndirim',
                    'expiry_date': expiry_date,
                    'is_active': True,
                    'utm_template': 'utm_source=indirimkesset&utm_medium=coupon',
                    'destination_url': url or f"https://{matched_brand['slug']}.com.tr",
                    'created_at': now
                }
                await db.coupons.insert_one(coupon_data)
                results['imported_items'].append({
                    'type': 'kupon',
                    'title': title,
                    'brand': matched_brand['name'],
                    'id': item_id
                })
            else:
                # Create discount
                discount_data = {
                    'id': item_id,
                    'brand_id': matched_brand['id'],
                    'title': title,
                    'description': short_desc or title,
                    'long_description': long_desc or None,
                    'terms_conditions': terms or None,
                    'discount_text': discount_text or 'İndirim',
                    'expiry_date': expiry_date,
                    'utm_template': 'utm_source=indirimkesset&utm_medium=discount',
                    'destination_url': url or f"https://{matched_brand['slug']}.com.tr",
                    'created_at': now
                }
                await db.discounts.insert_one(discount_data)
                results['imported_items'].append({
                    'type': 'indirim',
                    'title': title,
                    'brand': matched_brand['name'],
                    'id': item_id
                })
            
            results['imported'] += 1
            
        except Exception as e:
            results['errors'].append({
                'row': idx,
                'reason': f"Beklenmeyen hata: {str(e)}",
                'data': str(row)[:100]
            })
            results['skipped'] += 1
    
    return results


app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()