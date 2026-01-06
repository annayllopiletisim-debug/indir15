import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import BrandLogo from './BrandLogo';

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
        
        <div className="relative h-full flex flex-col items-center justify-center p-4">
          <div className="group-hover:scale-105 transition-transform duration-300">
            <BrandLogo 
              logoUrl={brand.logo_url} 
              brandName={brand.name} 
              size="lg"
              className="shadow-lg"
            />
          </div>
          <p className="mt-2 text-sm font-medium text-center line-clamp-1">{brand.name}</p>
        </div>
      </motion.div>
    </Link>
  );
};

export default BrandCard;
