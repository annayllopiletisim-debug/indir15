// Models will be initialized dynamically
let mongoose: any = null;
let modelsInitialized = false;

// Schema definitions
const schemas: Record<string, any> = {};

async function initModels() {
  if (modelsInitialized && mongoose) {
    return;
  }
  
  const mongooseModule = await import('mongoose');
  mongoose = mongooseModule.default || mongooseModule;
  const Schema = mongoose.Schema;
  
  // Brand Schema
  schemas.BrandSchema = new Schema({
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    description: String,
    logo_url: String,
    website_url: String,
    affiliate_url: String,
    category_ids: [String],
    is_featured: { type: Boolean, default: false },
    deal_count: { type: Number, default: 0 },
    default_deal_image: String,
    created_at: { type: Date, default: Date.now },
  }, { collection: 'brands' });

  // Discount Schema
  schemas.DiscountSchema = new Schema({
    id: { type: String, required: true, unique: true },
    brand_id: { type: String, required: true },
    title: { type: String, required: true },
    description: String,
    long_description: String,
    terms_conditions: String,
    discount_text: String,
    expiry_date: Date,
    is_featured: { type: Boolean, default: false },
    destination_url: String,
    image_url: String,
    click_count: { type: Number, default: 0 },
    created_at: { type: Date, default: Date.now },
  }, { collection: 'discounts' });

  // Coupon Schema
  schemas.CouponSchema = new Schema({
    id: { type: String, required: true, unique: true },
    brand_id: { type: String, required: true },
    title: { type: String, required: true },
    description: String,
    code: { type: String, required: true },
    discount_text: String,
    expiry_date: Date,
    is_featured: { type: Boolean, default: false },
    destination_url: String,
    is_active: { type: Boolean, default: true },
    click_count: { type: Number, default: 0 },
    created_at: { type: Date, default: Date.now },
  }, { collection: 'coupons' });

  // Giveaway Schema
  schemas.GiveawaySchema = new Schema({
    id: { type: String, required: true, unique: true },
    brand_id: { type: String, required: true },
    title: { type: String, required: true },
    description: String,
    expiry_date: Date,
    destination_url: String,
    image_url: String,
    click_count: { type: Number, default: 0 },
    created_at: { type: Date, default: Date.now },
  }, { collection: 'giveaways' });

  // Category Schema
  schemas.CategorySchema = new Schema({
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    description: String,
    icon: String,
    order: { type: Number, default: 0 },
    created_at: { type: Date, default: Date.now },
  }, { collection: 'categories' });

  // Newsletter Subscriber Schema
  schemas.NewsletterSchema = new Schema({
    email: { type: String, required: true, unique: true },
    is_active: { type: Boolean, default: true },
    subscribed_at: { type: Date, default: Date.now },
  }, { collection: 'newsletter_subscribers' });

  // Blog Post Schema
  schemas.BlogPostSchema = new Schema({
    id: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    excerpt: String,
    content: { type: String, required: true },
    featured_image: String,
    author: { type: String, default: 'Admin' },
    category: String,
    tags: [String],
    is_published: { type: Boolean, default: false },
    view_count: { type: Number, default: 0 },
    meta_title: String,
    meta_description: String,
    published_at: Date,
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now },
  }, { collection: 'blog_posts' });

  // Contact Message Schema
  schemas.ContactMessageSchema = new Schema({
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    email: { type: String, required: true },
    subject: String,
    message: { type: String, required: true },
    is_read: { type: Boolean, default: false },
    created_at: { type: Date, default: Date.now },
  }, { collection: 'contact_messages' });
  
  modelsInitialized = true;
}

// Helper function to get model
async function getModel(name: string, schemaName: string) {
  await initModels();
  return mongoose.models[name] || mongoose.model(name, schemas[schemaName]);
}

// Export getter functions for models
export const getBrand = () => getModel('Brand', 'BrandSchema');
export const getDiscount = () => getModel('Discount', 'DiscountSchema');
export const getCoupon = () => getModel('Coupon', 'CouponSchema');
export const getGiveaway = () => getModel('Giveaway', 'GiveawaySchema');
export const getCategory = () => getModel('Category', 'CategorySchema');
export const getNewsletter = () => getModel('Newsletter', 'NewsletterSchema');
export const getBlogPost = () => getModel('BlogPost', 'BlogPostSchema');
export const getContactMessage = () => getModel('ContactMessage', 'ContactMessageSchema');

// For backward compatibility - these will be initialized on first use
export let Brand: any = null;
export let Discount: any = null;
export let Coupon: any = null;
export let Giveaway: any = null;
export let Category: any = null;
export let Newsletter: any = null;
export let BlogPost: any = null;
export let ContactMessage: any = null;

// Initialize models synchronously for imports (will be properly initialized on first DB call)
if (typeof window === 'undefined') {
  // Server-side only
  import('mongoose').then((mongooseModule) => {
    mongoose = mongooseModule.default || mongooseModule;
    const Schema = mongoose.Schema;
    
    const BrandSchema = new Schema({
      id: { type: String, required: true, unique: true },
      name: { type: String, required: true },
      slug: { type: String, required: true, unique: true },
      description: String,
      logo_url: String,
      website_url: String,
      affiliate_url: String,
      category_ids: [String],
      is_featured: { type: Boolean, default: false },
      deal_count: { type: Number, default: 0 },
      default_deal_image: String,
      created_at: { type: Date, default: Date.now },
    }, { collection: 'brands' });

    const DiscountSchema = new Schema({
      id: { type: String, required: true, unique: true },
      brand_id: { type: String, required: true },
      title: { type: String, required: true },
      description: String,
      long_description: String,
      terms_conditions: String,
      discount_text: String,
      expiry_date: Date,
      is_featured: { type: Boolean, default: false },
      destination_url: String,
      image_url: String,
      click_count: { type: Number, default: 0 },
      created_at: { type: Date, default: Date.now },
    }, { collection: 'discounts' });

    const CouponSchema = new Schema({
      id: { type: String, required: true, unique: true },
      brand_id: { type: String, required: true },
      title: { type: String, required: true },
      description: String,
      code: { type: String, required: true },
      discount_text: String,
      expiry_date: Date,
      is_featured: { type: Boolean, default: false },
      destination_url: String,
      is_active: { type: Boolean, default: true },
      click_count: { type: Number, default: 0 },
      created_at: { type: Date, default: Date.now },
    }, { collection: 'coupons' });

    const GiveawaySchema = new Schema({
      id: { type: String, required: true, unique: true },
      brand_id: { type: String, required: true },
      title: { type: String, required: true },
      description: String,
      expiry_date: Date,
      destination_url: String,
      image_url: String,
      click_count: { type: Number, default: 0 },
      created_at: { type: Date, default: Date.now },
    }, { collection: 'giveaways' });

    const CategorySchema = new Schema({
      id: { type: String, required: true, unique: true },
      name: { type: String, required: true },
      slug: { type: String, required: true, unique: true },
      description: String,
      icon: String,
      order: { type: Number, default: 0 },
      created_at: { type: Date, default: Date.now },
    }, { collection: 'categories' });

    const NewsletterSchema = new Schema({
      email: { type: String, required: true, unique: true },
      is_active: { type: Boolean, default: true },
      subscribed_at: { type: Date, default: Date.now },
    }, { collection: 'newsletter_subscribers' });

    const BlogPostSchema = new Schema({
      id: { type: String, required: true, unique: true },
      title: { type: String, required: true },
      slug: { type: String, required: true, unique: true },
      excerpt: String,
      content: { type: String, required: true },
      featured_image: String,
      author: { type: String, default: 'Admin' },
      category: String,
      tags: [String],
      is_published: { type: Boolean, default: false },
      view_count: { type: Number, default: 0 },
      meta_title: String,
      meta_description: String,
      published_at: Date,
      created_at: { type: Date, default: Date.now },
      updated_at: { type: Date, default: Date.now },
    }, { collection: 'blog_posts' });

    const ContactMessageSchema = new Schema({
      id: { type: String, required: true, unique: true },
      name: { type: String, required: true },
      email: { type: String, required: true },
      subject: String,
      message: { type: String, required: true },
      is_read: { type: Boolean, default: false },
      created_at: { type: Date, default: Date.now },
    }, { collection: 'contact_messages' });

    Brand = mongoose.models.Brand || mongoose.model('Brand', BrandSchema);
    Discount = mongoose.models.Discount || mongoose.model('Discount', DiscountSchema);
    Coupon = mongoose.models.Coupon || mongoose.model('Coupon', CouponSchema);
    Giveaway = mongoose.models.Giveaway || mongoose.model('Giveaway', GiveawaySchema);
    Category = mongoose.models.Category || mongoose.model('Category', CategorySchema);
    Newsletter = mongoose.models.Newsletter || mongoose.model('Newsletter', NewsletterSchema);
    BlogPost = mongoose.models.BlogPost || mongoose.model('BlogPost', BlogPostSchema);
    ContactMessage = mongoose.models.ContactMessage || mongoose.model('ContactMessage', ContactMessageSchema);
  }).catch(() => {
    // Ignore errors during build
  });
}
