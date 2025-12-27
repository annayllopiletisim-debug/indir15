import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  ArrowLeft, 
  Clock, 
  AlertTriangle, 
  Copy, 
  Check, 
  ArrowRight,
  Scissors,
  ExternalLink,
  ChevronRight,
  Store,
  Gift,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import BrandLogo from '../components/BrandLogo';
import { trackClick, buildUTMLink } from '../utils/helpers';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

// Helper for time remaining
const getTimeRemaining = (expiryDate) => {
  if (!expiryDate) return null;
  const now = new Date();
  const expiry = new Date(expiryDate);
  const diff = expiry - now;

  if (diff <= 0) return { expired: true, text: 'Süresi Doldu' };

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  if (days > 0) return { expired: false, text: `${days}g ${hours}s kaldı` };
  if (hours > 0) return { expired: false, text: `${hours}s ${minutes}dk kaldı` };
  return { expired: false, text: `${minutes}dk kaldı` };
};

const DealDetailPage = () => {
  const { brandSlug, dealSlug } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);
  const [showModal, setShowModal] = useState(false);

  // Extract ID from slug (format: title-slug-uuid where uuid is like xxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx)
  // UUID has 5 parts separated by hyphens
  const extractIdFromSlug = (slug) => {
    if (!slug) return null;
    const parts = slug.split('-');
    // UUID is 36 chars: 8-4-4-4-12
    // Take last 5 parts and join them
    if (parts.length >= 5) {
      const uuidParts = parts.slice(-5);
      const potentialUuid = uuidParts.join('-');
      // Validate UUID format (8-4-4-4-12)
      if (/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i.test(potentialUuid)) {
        return potentialUuid;
      }
    }
    // Fallback: try to find UUID pattern anywhere in slug
    const uuidMatch = slug.match(/[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}/i);
    return uuidMatch ? uuidMatch[0] : null;
  };
  
  const dealId = extractIdFromSlug(dealSlug);
  
  // Determine type from URL path
  const currentPath = window.location.pathname;
  const dealType = currentPath.includes('/kupon/') ? 'coupon' 
    : currentPath.includes('/cekilis/') ? 'giveaway' 
    : 'discount';

  useEffect(() => {
    const fetchData = async () => {
      if (!dealId) {
        setError('Geçersiz URL');
        setLoading(false);
        return;
      }

      try {
        const endpoint = dealType === 'coupon' 
          ? `${API}/coupon/${dealId}/detail`
          : dealType === 'giveaway'
          ? `${API}/giveaway/${dealId}/detail`
          : `${API}/discount/${dealId}/detail`;
        
        const response = await axios.get(endpoint);
        setData(response.data);

        // Set SEO meta tags
        const { seo_meta, structured_data } = response.data;
        
        document.title = seo_meta.title;
        
        // Meta description
        let metaDesc = document.querySelector('meta[name="description"]');
        if (!metaDesc) {
          metaDesc = document.createElement('meta');
          metaDesc.setAttribute('name', 'description');
          document.head.appendChild(metaDesc);
        }
        metaDesc.setAttribute('content', seo_meta.description);

        // Canonical
        let canonical = document.querySelector('link[rel="canonical"]');
        if (!canonical) {
          canonical = document.createElement('link');
          canonical.setAttribute('rel', 'canonical');
          document.head.appendChild(canonical);
        }
        canonical.setAttribute('href', seo_meta.canonical);

        // Robots
        let robots = document.querySelector('meta[name="robots"]');
        if (!robots) {
          robots = document.createElement('meta');
          robots.setAttribute('name', 'robots');
          document.head.appendChild(robots);
        }
        robots.setAttribute('content', seo_meta.robots);

        // OpenGraph
        const ogTags = {
          'og:title': seo_meta.og_title,
          'og:description': seo_meta.og_description,
          'og:type': seo_meta.og_type,
          'og:url': seo_meta.canonical
        };
        Object.entries(ogTags).forEach(([property, content]) => {
          let tag = document.querySelector(`meta[property="${property}"]`);
          if (!tag) {
            tag = document.createElement('meta');
            tag.setAttribute('property', property);
            document.head.appendChild(tag);
          }
          tag.setAttribute('content', content);
        });

        // Structured Data (JSON-LD)
        let jsonLd = document.querySelector('script[type="application/ld+json"]');
        if (!jsonLd) {
          jsonLd = document.createElement('script');
          jsonLd.setAttribute('type', 'application/ld+json');
          document.head.appendChild(jsonLd);
        }
        jsonLd.textContent = JSON.stringify(structured_data);

      } catch (err) {
        console.error('Failed to fetch deal:', err);
        setError(err.response?.data?.detail || 'Fırsat bulunamadı');
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // Cleanup
    return () => {
      document.title = 'İndirim Keşfet - Kupon Kodları ve İndirim Fırsatları';
    };
  }, [dealId, dealType]);

  const handleCopyCode = async () => {
    if (!data?.item?.code) return;
    try {
      // Try modern Clipboard API first
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(data.item.code);
      } else {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = data.item.code;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }
      setCopied(true);
      trackClick('coupon_copy', data.item.id, data.brand.id);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Clipboard API failed, trying fallback:', err);
      try {
        const textArea = document.createElement('textarea');
        textArea.value = data.item.code;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (fallbackErr) {
        console.error('Fallback copy also failed:', fallbackErr);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    }
  };

  const handleGoToStore = () => {
    const item = data?.item;
    if (!item?.destination_url) return;
    
    trackClick('coupon_store_click', item.id, data.brand.id);
    const finalUrl = buildUTMLink(item.destination_url, item.utm_template, item.id);
    window.open(finalUrl, '_blank');
  };

  const handleShowCode = () => {
    trackClick('coupon_view', data.item.id, data.brand.id);
    setShowModal(true);
    // No auto redirect - user will click "Mağazaya Git" manually
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-lg">Yükleniyor...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <h1 className="text-2xl font-heading font-bold mb-2">Fırsat Bulunamadı</h1>
          <p className="text-muted-foreground mb-6">{error}</p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Ana Sayfaya Dön
          </Link>
        </div>
      </div>
    );
  }

  const { item, brand, is_expired, related_deals, total_brand_deals } = data;
  const timeLeft = getTimeRemaining(item.expiry_date);
  const isCoupon = dealType === 'coupon';
  const isGiveaway = dealType === 'giveaway';

  return (
    <div className="min-h-screen pb-12">
      {/* Breadcrumb */}
      <div className="bg-card border-b border-border">
        <div className="container mx-auto px-4 py-3">
          <nav className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link to="/" className="hover:text-foreground transition-colors">Ana Sayfa</Link>
            <ChevronRight className="w-4 h-4" />
            <Link to={`/magaza/${brand.slug}`} className="hover:text-foreground transition-colors">
              {brand.name}
            </Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-foreground truncate max-w-[200px]">{item.title}</span>
          </nav>
        </div>
      </div>

      {/* Expired Banner */}
      {is_expired && (
        <div className="bg-orange-500/10 border-b border-orange-500/20">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center gap-3 text-orange-500">
              <AlertTriangle className="w-5 h-5 flex-shrink-0" />
              <div>
                <p className="font-medium">Bu fırsatın süresi doldu</p>
                <p className="text-sm text-orange-400">
                  Aşağıda {brand.name} mağazasındaki güncel fırsatları görebilirsiniz.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Main Content Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`glass-effect rounded-2xl p-6 md:p-8 mb-8 ${is_expired ? 'opacity-75' : ''}`}
          >
            {/* Brand Header */}
            <div className="flex items-center gap-4 mb-6 pb-6 border-b border-border">
              <Link 
                to={`/magaza/${brand.slug}`}
                className="flex-shrink-0"
              >
                <BrandLogo logoUrl={brand.logo_url} brandName={brand.name} size="lg" />
              </Link>
              <div className="flex-1 min-w-0">
                <Link 
                  to={`/magaza/${brand.slug}`}
                  className="text-lg font-medium hover:text-primary transition-colors"
                >
                  {brand.name}
                </Link>
                {timeLeft && (
                  <div className={`flex items-center gap-1 mt-1 text-sm ${
                    is_expired ? 'text-destructive' : 'text-muted-foreground'
                  }`}>
                    <Clock className="w-4 h-4" />
                    {timeLeft.text}
                  </div>
                )}
              </div>
            </div>

            {/* H1 - Title */}
            <h1 className="text-2xl md:text-3xl font-heading font-bold mb-4">
              {item.title}
            </h1>

            {/* Discount Text */}
            {item.discount_text && (
              <div className="text-3xl md:text-4xl font-heading font-bold text-primary mb-6">
                {item.discount_text}
              </div>
            )}

            {/* Short Description (Kısa Açıklama) */}
            {item.description && (
              <p className="text-muted-foreground mb-4 leading-relaxed">
                {item.description}
              </p>
            )}

            {/* Long Description (Uzun Açıklama) - Sadece doluysa göster */}
            {item.long_description && (
              <div className="mb-6">
                <h2 className="text-lg font-heading font-semibold mb-2">Kampanya Detayı</h2>
                <div className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                  {item.long_description}
                </div>
              </div>
            )}

            {/* Terms & Conditions (Kullanım Koşulları) - Sadece doluysa göster */}
            {item.terms_conditions && (
              <div className="mb-6 p-4 bg-muted/50 rounded-xl">
                <h2 className="text-base font-heading font-semibold mb-2 flex items-center gap-2">
                  <svg className="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Kullanım Koşulları
                </h2>
                <div className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                  {item.terms_conditions}
                </div>
              </div>
            )}

            {/* CTA Section */}
            <div className="mt-8">
              {isCoupon ? (
                // Coupon CTA
                <div className="space-y-4">
                  {showCode ? (
                    // Show code after click
                    <div className="bg-muted rounded-xl p-6 text-center">
                      <p className="text-sm text-muted-foreground mb-2">Kupon Kodu:</p>
                      <div className="font-mono text-2xl md:text-3xl font-bold tracking-wider mb-4">
                        {item.code}
                      </div>
                      <button
                        onClick={handleCopyCode}
                        disabled={is_expired}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
                      >
                        {copied ? (
                          <>
                            <Check className="w-5 h-5" />
                            Kopyalandı!
                          </>
                        ) : (
                          <>
                            <Copy className="w-5 h-5" />
                            Kodu Kopyala
                          </>
                        )}
                      </button>
                    </div>
                  ) : (
                    // Initial state - show button
                    <button
                      onClick={handleShowCode}
                      disabled={is_expired}
                      className="w-full py-4 bg-gradient-to-r from-primary to-pink-500 rounded-xl font-medium text-lg hover:shadow-lg hover:shadow-primary/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden group"
                    >
                      <span className="flex items-center justify-center gap-2">
                        <Scissors className="w-5 h-5" />
                        {is_expired ? 'Süresi Doldu' : 'Kodu Göster ve Mağazaya Git'}
                      </span>
                      {/* Peek effect */}
                      {!is_expired && item.code && (
                        <span className="absolute right-0 top-0 bottom-0 w-20 bg-white/10 flex items-center justify-center border-l border-white/20 rounded-r-xl">
                          <span className="font-mono text-sm opacity-80">
                            {item.code.substring(0, 3)}...
                          </span>
                        </span>
                      )}
                    </button>
                  )}
                </div>
              ) : isGiveaway ? (
                // Giveaway CTA
                <button
                  onClick={handleGoToStore}
                  disabled={is_expired}
                  className="w-full py-4 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl font-medium text-lg hover:shadow-lg hover:shadow-emerald-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {is_expired ? (
                    'Çekiliş Sona Erdi'
                  ) : (
                    <>
                      <Gift className="w-5 h-5" />
                      Çekilişe Katıl
                    </>
                  )}
                </button>
              ) : (
                // Discount CTA
                <button
                  onClick={handleGoToStore}
                  disabled={is_expired}
                  className="w-full py-4 bg-gradient-to-r from-primary to-pink-500 rounded-xl font-medium text-lg hover:shadow-lg hover:shadow-primary/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {is_expired ? (
                    'Süresi Doldu'
                  ) : (
                    <>
                      Mağazaya Git
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>
              )}

              {/* Alternative CTA for expired */}
              {is_expired && (
                <Link
                  to={`/magaza/${brand.slug}`}
                  className="mt-4 w-full py-3 border border-primary text-primary rounded-xl font-medium hover:bg-primary/10 transition-colors flex items-center justify-center gap-2"
                >
                  <Store className="w-5 h-5" />
                  {brand.name} Güncel Fırsatlarını Gör
                </Link>
              )}
            </div>
          </motion.div>

          {/* Related Deals Section */}
          {related_deals && related_deals.length > 0 && (
            <section className="mt-12">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-heading font-bold">
                  {brand.name} Mağazasındaki Diğer Fırsatlar
                </h2>
                <Link
                  to={`/magaza/${brand.slug}`}
                  className="text-sm text-primary hover:underline flex items-center gap-1"
                >
                  Tümünü Gör ({total_brand_deals})
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {related_deals.slice(0, 6).map((deal) => (
                  <Link
                    key={deal.id}
                    to={`/magaza/${brand.slug}/${deal.item_type === 'coupon' ? 'kupon' : 'indirim'}/${deal.id}`}
                    className="glass-effect rounded-xl p-4 hover:border-primary/30 transition-all group"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <span className={`inline-block px-2 py-0.5 rounded text-xs mb-2 ${
                          deal.item_type === 'coupon' 
                            ? 'bg-purple-500/10 text-purple-400' 
                            : 'bg-blue-500/10 text-blue-400'
                        }`}>
                          {deal.item_type === 'coupon' ? 'Kupon' : 'İndirim'}
                        </span>
                        <h3 className="font-medium text-sm line-clamp-2 group-hover:text-primary transition-colors">
                          {deal.title}
                        </h3>
                        {deal.discount_text && (
                          <p className="text-primary font-semibold mt-1">
                            {deal.discount_text}
                          </p>
                        )}
                      </div>
                      <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
};

export default DealDetailPage;
