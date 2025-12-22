import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-void-paper border-t border-white/5 mt-24">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-lg font-heading font-bold mb-4 text-gradient">SavvySaver</h3>
            <p className="text-sm text-muted-foreground">
              En güncel kupon ve indirimlerle tasarruf edin.
            </p>
          </div>
          
          <div>
            <h4 className="text-sm font-heading font-bold mb-4">Hızlı Linkler</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/magazalar" className="hover:text-neon-purple transition-colors">Mağazalar</Link></li>
              <li><a href="https://forms.google.com/" target="_blank" rel="noopener noreferrer" className="hover:text-neon-purple transition-colors">Kupon Gönder</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-sm font-heading font-bold mb-4">Kategoriler</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/" className="hover:text-neon-purple transition-colors">Spor</Link></li>
              <li><Link to="/" className="hover:text-neon-purple transition-colors">Teknoloji</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-sm font-heading font-bold mb-4">Sosyal Medya</h4>
            <div className="flex space-x-4">
              <a href="#" className="p-2 rounded-lg bg-void-subtle hover:bg-neon-purple/20 transition-colors" aria-label="Facebook">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="p-2 rounded-lg bg-void-subtle hover:bg-neon-purple/20 transition-colors" aria-label="Twitter">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="p-2 rounded-lg bg-void-subtle hover:bg-neon-purple/20 transition-colors" aria-label="Instagram">
                <Instagram className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>
        
        <div className="mt-12 pt-8 border-t border-white/5 text-center text-sm text-muted-foreground">
          <p>&copy; 2025 SavvySaver. Tüm hakları saklıdır.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;