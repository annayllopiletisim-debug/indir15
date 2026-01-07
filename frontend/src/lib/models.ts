import mongoose, { Schema, models } from 'mongoose';

// Brand Schema
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

// Discount Schema
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

// Coupon Schema
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

// Giveaway Schema
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

// Category Schema
const CategorySchema = new Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  description: String,
  icon: String,
  order: { type: Number, default: 0 },
  created_at: { type: Date, default: Date.now },
}, { collection: 'categories' });

// Newsletter Subscriber Schema
const NewsletterSchema = new Schema({
  email: { type: String, required: true, unique: true },
  is_active: { type: Boolean, default: true },
  subscribed_at: { type: Date, default: Date.now },
}, { collection: 'newsletter_subscribers' });

// Blog Post Schema
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

// Contact Message Schema
const ContactMessageSchema = new Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String, required: true },
  subject: String,
  message: { type: String, required: true },
  is_read: { type: Boolean, default: false },
  created_at: { type: Date, default: Date.now },
}, { collection: 'contact_messages' });

export const Brand = models.Brand || mongoose.model('Brand', BrandSchema);
export const Discount = models.Discount || mongoose.model('Discount', DiscountSchema);
export const Coupon = models.Coupon || mongoose.model('Coupon', CouponSchema);
export const Giveaway = models.Giveaway || mongoose.model('Giveaway', GiveawaySchema);
export const Category = models.Category || mongoose.model('Category', CategorySchema);
export const Newsletter = models.Newsletter || mongoose.model('Newsletter', NewsletterSchema);
export const BlogPost = models.BlogPost || mongoose.model('BlogPost', BlogPostSchema);
export const ContactMessage = models.ContactMessage || mongoose.model('ContactMessage', ContactMessageSchema);
