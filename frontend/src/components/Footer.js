import React from 'react';
import { Link } from 'react-router-dom';
import { Instagram } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-card border-t border-border mt-24">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <h3 className="text-lg font-heading font-bold mb-4 text-gradient">indirimliMi</h3>
            <p className="text-sm text-muted-foreground">
              En güncel kupon ve indirimlerle tasarruf edin.
            </p>
          </div>
          
          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-heading font-bold mb-4 text-foreground">Hızlı Linkler</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/magazalar" className="text-muted-foreground hover:text-primary transition-colors">Mağazalar</Link></li>
              <li><Link to="/kategoriler" className="text-muted-foreground hover:text-primary transition-colors">Kategoriler</Link></li>
              <li><Link to="/son-24-saat" className="text-muted-foreground hover:text-primary transition-colors">Son 24 Saat</Link></li>
              <li><a href="https://forms.google.com/" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">Kupon Gönder</a></li>
            </ul>
          </div>
          
          {/* Categories */}
          <div>
            <h4 className="text-sm font-heading font-bold mb-4 text-foreground">Kategoriler</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/kategori/spor" className="text-muted-foreground hover:text-primary transition-colors">Spor</Link></li>
              <li><Link to="/kategori/moda" className="text-muted-foreground hover:text-primary transition-colors">Moda</Link></li>
              <li><Link to="/kategori/elektronik" className="text-muted-foreground hover:text-primary transition-colors">Elektronik</Link></li>
              <li><Link to="/kategori/gida" className="text-muted-foreground hover:text-primary transition-colors">Gıda</Link></li>
            </ul>
          </div>
          
          {/* Social - Only Instagram */}
          <div>
            <h4 className="text-sm font-heading font-bold mb-4 text-foreground">Takip Edin</h4>
            <div className="flex">
              <a 
                href="https://instagram.com/indirimli.mi" 
                target="_blank" 
                rel="noopener noreferrer"
                className="p-3 rounded-xl bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 hover:scale-110 transition-transform" 
                aria-label="Instagram"
              >
                <Instagram className="w-5 h-5 text-white" />
              </a>
            </div>
          </div>
        </div>
        
        {/* Copyright */}
        <div className="mt-12 pt-8 border-t border-border text-center text-sm text-muted-foreground">
          <p>&copy; 2025 indirimliMi. Tüm hakları saklıdır.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
