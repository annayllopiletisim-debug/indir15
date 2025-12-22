import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const BrandCard = ({ brand, index }) => {
  return (
    <Link to={`/magaza/${brand.slug}`} data-testid={`brand-card-${brand.slug}`}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05 }}
        className="group relative aspect-square rounded-xl bg-void-subtle border border-white/5 overflow-hidden hover:border-neon-purple/50 transition-all duration-300"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-neon-purple/0 to-neon-pink/0 group-hover:from-neon-purple/10 group-hover:to-neon-pink/10 transition-all duration-300" />
        
        <div className="relative h-full flex items-center justify-center p-4">
          {brand.logo_url ? (
            <img
              src={brand.logo_url}
              alt={brand.name}
              className="max-w-full max-h-full object-contain group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-2 rounded-full bg-gradient-to-br from-neon-purple to-neon-pink flex items-center justify-center">
                <span className="text-2xl font-heading font-bold">
                  {brand.name.charAt(0)}
                </span>
              </div>
              <p className="text-sm font-medium">{brand.name}</p>
            </div>
          )}
        </div>
      </motion.div>
    </Link>
  );
};

export default BrandCard;