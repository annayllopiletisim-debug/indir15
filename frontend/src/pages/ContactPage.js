import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Mail, MessageSquare, Send } from 'lucide-react';

const ContactPage = () => {
  return (
    <>
      <Helmet>
        <title>İletişim - İndirim Keşfet</title>
        <meta name="description" content="İndirim Keşfet ile iletişime geçin. Sorularınız, önerileriniz için bizimle iletişime geçebilirsiniz." />
      </Helmet>

      <div className="min-h-screen" data-testid="contact-page">
        <div className="bg-void-paper dark:bg-void-paper border-b border-white/5">
          <div className="container mx-auto px-4 py-12">
            <h1 className="text-4xl lg:text-5xl font-heading font-bold mb-4">İletişim</h1>
            <p className="text-lg text-muted-foreground">Size nasıl yardımcı olabiliriz?</p>
          </div>
        </div>

        <div className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              <div className="glass-effect p-6 rounded-2xl text-center">
                <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-neon-purple/20 flex items-center justify-center">
                  <Mail className="w-6 h-6 text-neon-purple" />
                </div>
                <h3 className="font-heading font-bold mb-2">E-posta</h3>
                <p className="text-sm text-muted-foreground">info@İndirim Keşfet.com</p>
              </div>

              <div className="glass-effect p-6 rounded-2xl text-center">
                <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-neon-blue/20 flex items-center justify-center">
                  <MessageSquare className="w-6 h-6 text-neon-blue" />
                </div>
                <h3 className="font-heading font-bold mb-2">Destek</h3>
                <p className="text-sm text-muted-foreground">7/24 online destek</p>
              </div>

              <div className="glass-effect p-6 rounded-2xl text-center">
                <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-neon-pink/20 flex items-center justify-center">
                  <Send className="w-6 h-6 text-neon-pink" />
                </div>
                <h3 className="font-heading font-bold mb-2">Sosyal Medya</h3>
                <p className="text-sm text-muted-foreground">Bizi takip edin</p>
              </div>
            </div>

            <div className="glass-effect p-8 lg:p-12 rounded-3xl">
              <h2 className="text-2xl font-heading font-bold mb-6">Bize Ulaşın</h2>
              <form className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">Adınız</label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 bg-void-subtle dark:bg-void-subtle rounded-lg focus:outline-none focus:ring-2 focus:ring-neon-purple"
                      placeholder="Ad Soyad"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">E-posta</label>
                    <input
                      type="email"
                      className="w-full px-4 py-3 bg-void-subtle dark:bg-void-subtle rounded-lg focus:outline-none focus:ring-2 focus:ring-neon-purple"
                      placeholder="email@example.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Konu</label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 bg-void-subtle dark:bg-void-subtle rounded-lg focus:outline-none focus:ring-2 focus:ring-neon-purple"
                    placeholder="Mesajınızın konusu"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Mesajınız</label>
                  <textarea
                    rows="6"
                    className="w-full px-4 py-3 bg-void-subtle dark:bg-void-subtle rounded-lg focus:outline-none focus:ring-2 focus:ring-neon-purple resize-none"
                    placeholder="Mesajınızı buraya yazın..."
                  ></textarea>
                </div>

                <button
                  type="submit"
                  className="w-full md:w-auto px-8 py-3 bg-gradient-to-r from-neon-purple to-neon-pink rounded-lg font-medium hover:shadow-lg hover:shadow-neon-purple/50 transition-all"
                >
                  Gönder
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ContactPage;
