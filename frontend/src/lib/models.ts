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

export const Brand = models.Brand || mongoose.model('Brand', BrandSchema);
export const Discount = models.Discount || mongoose.model('Discount', DiscountSchema);
export const Coupon = models.Coupon || mongoose.model('Coupon', CouponSchema);
export const Giveaway = models.Giveaway || mongoose.model('Giveaway', GiveawaySchema);
export const Category = models.Category || mongoose.model('Category', CategorySchema);
export const Newsletter = models.Newsletter || mongoose.model('Newsletter', NewsletterSchema);
