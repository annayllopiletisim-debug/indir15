import { Metadata } from 'next';
import { Mail, Phone, MapPin, Send } from 'lucide-react';

export const metadata: Metadata = {
  title: 'İletişim - İndirim Keşfet',
  description: 'İndirim Keşfet ile iletişime geçin. Sorularınız, önerileriniz ve işbirliği teklifleriniz için bize ulaşın.',
};

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <section className="bg-gradient-to-r from-violet-600 to-purple-600 text-white">
        <div className="container mx-auto px-4 py-12">
          <h1 className="text-3xl font-bold mb-2">İletişim</h1>
          <p className="text-violet-100">Sizden haber almak isteriz</p>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Info */}
          <div>
            <h2 className="text-2xl font-bold mb-6">Bize Ulaşın</h2>
            <p className="text-muted-foreground mb-8">
              Sorularınız, önerileriniz veya işbirliği teklifleriniz için 
              bizimle iletişime geçebilirsiniz.
            </p>

            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Mail className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">E-posta</h3>
                  <a href="mailto:hello@indirimkesfet.com" className="text-primary hover:underline">
                    hello@indirimkesfet.com
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Adres</h3>
                  <p className="text-muted-foreground">
                    İstanbul, Türkiye
                  </p>
                </div>
              </div>
            </div>

            {/* FAQ */}
            <div className="mt-12">
              <h3 className="text-xl font-bold mb-4">Sık Sorulan Sorular</h3>
              <div className="space-y-4">
                <div className="bg-white rounded-xl p-4 border">
                  <h4 className="font-semibold mb-2">Kupon kodları nasıl kullanılır?</h4>
                  <p className="text-sm text-muted-foreground">
                    Kupon kodunu kopyalayıp, ödeme sayfasında ilgili alana yapıştırmanız yeterlidir.
                  </p>
                </div>
                <div className="bg-white rounded-xl p-4 border">
                  <h4 className="font-semibold mb-2">Mağazamı nasıl ekleyebilirim?</h4>
                  <p className="text-sm text-muted-foreground">
                    İşbirliği için hello@indirimkesfet.com adresine mail atabilirsiniz.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-white rounded-2xl p-8 shadow-sm border">
            <h2 className="text-xl font-bold mb-6">Mesaj Gönderin</h2>
            <form className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">Ad Soyad</label>
                <input
                  type="text"
                  className="w-full px-4 py-3 rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-primary/50"
                  placeholder="Adınız Soyadınız"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">E-posta</label>
                <input
                  type="email"
                  className="w-full px-4 py-3 rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-primary/50"
                  placeholder="ornek@email.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Konu</label>
                <select className="w-full px-4 py-3 rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-primary/50">
                  <option>Genel Soru</option>
                  <option>İşbirliği Teklifi</option>
                  <option>Hata Bildirimi</option>
                  <option>Diğer</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Mesajınız</label>
                <textarea
                  rows={5}
                  className="w-full px-4 py-3 rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                  placeholder="Mesajınızı yazın..."
                />
              </div>
              <button
                type="submit"
                className="w-full py-3 bg-primary text-white rounded-xl font-semibold hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                Gönder
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
