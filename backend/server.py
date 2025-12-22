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

# Serve static files for uploads
app.mount("/uploads", StaticFiles(directory=str(UPLOADS_DIR)), name="uploads")

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
    code: str
    discount_text: str
    expiry_date: Optional[datetime] = None
    is_active: bool = True
    utm_template: Optional[str] = None
    destination_url: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class CouponCreate(BaseModel):
    brand_id: str
    title: str
    description: Optional[str] = None
    code: str
    discount_text: str
    expiry_date: Optional[datetime] = None
    is_active: bool = True
    utm_template: Optional[str] = None
    destination_url: str

class Discount(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    brand_id: str
    title: str
    description: str
    discount_text: str
    expiry_date: Optional[datetime] = None
    utm_template: Optional[str] = None
    destination_url: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class DiscountCreate(BaseModel):
    brand_id: str
    title: str
    description: str
    discount_text: str
    expiry_date: Optional[datetime] = None
    utm_template: Optional[str] = None
    destination_url: str

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
    
    return UploadResponse(url=f"/uploads/logos/{filename}", filename=filename)

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
                
                return UploadResponse(url=f"/uploads/logos/{filename}", filename=filename)
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
    
    return UploadResponse(url=f"/uploads/pdfs/{filename}", filename=filename)

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

@api_router.get("/brands/{slug}", response_model=Brand)
async def get_brand_by_slug(slug: str):
    brand = await db.brands.find_one({'slug': slug}, {'_id': 0})
    if not brand:
        raise HTTPException(status_code=404, detail="Brand not found")
    if isinstance(brand.get('created_at'), str):
        brand['created_at'] = datetime.fromisoformat(brand['created_at'])
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
    """Generate dynamic sitemap.xml"""
    base_url = os.environ.get('SITE_URL', 'https://indirimli.mi')
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
    
    # Categories
    categories = await db.categories.find({}, {'_id': 0, 'slug': 1}).to_list(1000)
    for cat in categories:
        urls.append(f'''  <url>
    <loc>{base_url}/kategori/{cat['slug']}</loc>
    <lastmod>{now}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>''')
    
    # Brands
    brands = await db.brands.find({}, {'_id': 0, 'slug': 1}).to_list(1000)
    for brand in brands:
        urls.append(f'''  <url>
    <loc>{base_url}/magaza/{brand['slug']}</loc>
    <lastmod>{now}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
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