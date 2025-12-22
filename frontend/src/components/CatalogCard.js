import React from 'react';
import { FileText, Calendar, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';
import BrandLogo from './BrandLogo';
import { formatDate } from '../utils/helpers';

const CatalogCard = ({ catalog, brand, onView }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-effect rounded-2xl overflow-hidden hover:border-neon-purple/50 transition-all duration-300 group"
      data-testid={`catalog-card-${catalog.id}`}
    >
      {/* Thumbnail */}
      <div className="relative h-48 bg-void-subtle">
        {catalog.thumbnail_url ? (
          <img
            src={catalog.thumbnail_url.startsWith('/uploads/') 
              ? `${process.env.REACT_APP_BACKEND_URL}${catalog.thumbnail_url}` 
              : catalog.thumbnail_url}
            alt={catalog.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <FileText className="w-16 h-16 text-muted-foreground" />
          </div>
        )}
        
        {/* Brand Logo Overlay */}
        {brand && (
          <div className="absolute top-3 left-3">
            <BrandLogo logoUrl={brand.logo_url} brandName={brand.name} size="sm" />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-heading font-bold mb-1 line-clamp-1">{catalog.title}</h3>
        {catalog.description && (
          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{catalog.description}</p>
        )}

        {/* Validity */}
        {(catalog.valid_from || catalog.valid_until) && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
            <Calendar className="w-3 h-3" />
            <span>
              {catalog.valid_from && formatDate(catalog.valid_from)}
              {catalog.valid_from && catalog.valid_until && ' - '}
              {catalog.valid_until && formatDate(catalog.valid_until)}
            </span>
          </div>
        )}

        {/* Action */}
        <button
          onClick={() => onView(catalog)}
          className="w-full px-4 py-2.5 bg-gradient-to-r from-neon-purple to-neon-pink rounded-lg font-medium text-sm hover:shadow-lg hover:shadow-neon-purple/50 transition-all flex items-center justify-center gap-2"
        >
          <FileText className="w-4 h-4" />
          Kataloğu Görüntüle
        </button>
      </div>
    </motion.div>
  );
};

export default CatalogCard;
