import React, { useState, useEffect, useCallback } from 'react';
import { Loader2 } from 'lucide-react';
import axios from 'axios';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

/**
 * StickyActionBar - Filtreleme durumunda altta sabit CTA bar
 * 
 * Props:
 * - selectedCount: Seçili mağaza sayısı
 * - selectedBrandIds: Seçili brand ID'leri (array)
 * - categoryId: Kategori ID (opsiyonel, kategori sayfası için)
 * - onShowDeals: CTA tıklandığında çağrılacak fonksiyon
 * - onClear: Temizle butonu için
 * - variant: "A" | "B" - CTA metin varyantı
 */
const StickyActionBar = ({ 
  selectedCount = 0, 
  selectedBrandIds = [], 
  categoryId = null,
  onShowDeals, 
  onClear,
  variant = "A",
  isEnabled = true
}) => {
  const [dealCount, setDealCount] = useState(null);
  const [loading, setLoading] = useState(false);

  // Debounced fetch for deal count
  const fetchDealCount = useCallback(async () => {
    if (selectedBrandIds.length === 0 && !categoryId) {
      setDealCount(null);
      return;
    }

    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedBrandIds.length > 0) {
        params.append('brand_ids', selectedBrandIds.join(','));
      }
      if (categoryId) {
        params.append('category_id', categoryId);
      }
      
      const response = await axios.get(`${API}/deals/count?${params.toString()}`);
      setDealCount(response.data.count);
    } catch (error) {
      console.error('Failed to fetch deal count:', error);
      setDealCount(null);
    } finally {
      setLoading(false);
    }
  }, [selectedBrandIds, categoryId]);

  // Debounce effect
  useEffect(() => {
    if (selectedBrandIds.length === 0) {
      setDealCount(null);
      return;
    }

    const timer = setTimeout(() => {
      fetchDealCount();
    }, 300); // 300ms debounce

    return () => clearTimeout(timer);
  }, [selectedBrandIds, fetchDealCount]);

  // Don't render if disabled or no selection
  if (!isEnabled || selectedCount === 0) {
    return null;
  }

  // Format count display
  const formatCount = (count) => {
    if (count === null) return '';
    if (count > 99) return '99+';
    return count.toString();
  };

  // Get CTA text based on variant
  const getCtaText = () => {
    if (loading) {
      return 'İndirimleri Göster';
    }
    
    if (dealCount === 0) {
      return 'Sonuç Bulunamadı';
    }

    const countText = formatCount(dealCount);
    
    if (variant === "B") {
      return countText ? `${countText} Sonucu Gör` : 'Sonuçları Gör';
    }
    
    // Variant A (default)
    return countText ? `İndirimleri Göster (${countText})` : 'İndirimleri Göster';
  };

  // Handle CTA click with tracking
  const handleCtaClick = () => {
    // Track click event with variant
    if (window.gtag) {
      window.gtag('event', 'sticky_cta_click', {
        variant: variant,
        deal_count: dealCount,
        selected_stores: selectedCount
      });
    }
    
    // Console log for debugging/analytics
    console.log('Sticky CTA Click:', { variant, dealCount, selectedCount });
    
    onShowDeals?.();
  };

  const isDisabled = dealCount === 0;

  return (
    <div 
      className="
        fixed bottom-0 inset-x-0 z-50
        bg-white dark:bg-neutral-900/90
        border-t border-black/5 dark:border-white/10
        shadow-[0_-4px_12px_rgba(0,0,0,0.06)] dark:shadow-none
        backdrop-blur-lg
        transition-all duration-200
      "
      style={{ 
        paddingBottom: 'env(safe-area-inset-bottom, 0px)' 
      }}
    >
      <div className="max-w-screen-xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Sol taraf - Seçim bilgisi */}
        <span className="text-sm text-gray-600 dark:text-gray-300">
          {selectedCount} mağaza seçildi
        </span>

        {/* Sağ taraf - CTA */}
        <div className="flex items-center gap-2">
          {/* Temizle butonu */}
          {onClear && (
            <button
              onClick={onClear}
              className="px-3 py-2 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
            >
              Temizle
            </button>
          )}

          {/* Primary CTA */}
          <button
            onClick={handleCtaClick}
            disabled={isDisabled || loading}
            className={`
              px-4 py-2.5
              rounded-xl
              text-sm font-semibold
              transition-all duration-200
              flex items-center gap-2
              ${isDisabled 
                ? 'bg-gray-300 dark:bg-white/20 text-gray-500 dark:text-gray-400 cursor-not-allowed' 
                : 'bg-primary hover:bg-primary/90 text-white shadow-sm hover:shadow-md'
              }
            `}
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {getCtaText()}
          </button>
        </div>
      </div>
    </div>
  );
};

export default StickyActionBar;
