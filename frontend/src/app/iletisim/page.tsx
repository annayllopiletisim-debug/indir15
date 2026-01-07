import { Metadata } from 'next';
import { Mail, MessageSquare, MapPin, Phone } from 'lucide-react';

export const metadata: Metadata = {
  title: 'İletişim | İndirim Keşfet',
  description: 'Bizimle iletişime geçin. Sorularınız, önerileriniz veya iş birliği teklifleriniz için bize ulaşın.',
};

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">İletişim</h1>
            <p className="text-gray-600 text-lg">Sorularınız veya önerileriniz için bize ulaşın</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Contact Form */}
            <div className="bg-white rounded-2xl shadow-sm p-8">
              <h2 className="text-xl font-bold text-gray-800 mb-6">Mesaj Gönderin</h2>
              <form className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Adınız</label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Adınızı girin"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">E-posta</label>
                  <input
                    type="email"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="E-posta adresiniz"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Konu</label>
                  <select className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent">
                    <option>Genel Soru</option>
                    <option>İş Birliği Teklifi</option>
                    <option>Hata Bildirimi</option>
                    <option>Öneri</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mesajınız</label>
                  <textarea
                    rows={5}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                    placeholder="Mesajınızı yazın..."
                  ></textarea>
                </div>
                <button
                  type="submit"
                  className="w-full px-6 py-3 bg-purple-600 text-white rounded-xl font-semibold hover:bg-purple-700 transition-colors"
                >
                  Gönder
                </button>
              </form>
            </div>

            {/* Contact Info */}
            <div className="space-y-6">
              <div className="bg-white rounded-2xl shadow-sm p-8">
                <h2 className="text-xl font-bold text-gray-800 mb-6">İletişim Bilgileri</h2>
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center flex-shrink-0">
                      <Mail className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800">E-posta</h3>
                      <a href="mailto:info@indirimkesfet.com" className="text-purple-600 hover:underline">
                        info@indirimkesfet.com
                      </a>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center flex-shrink-0">
                      <MessageSquare className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800">Sosyal Medya</h3>
                      <p className="text-gray-600">@indirimkesfet</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl shadow-sm p-8 text-white">
                <h2 className="text-xl font-bold mb-4">İş Birliği</h2>
                <p className="text-white/90 mb-4">
                  Markanızı platformumuzda öne çıkarmak veya özel kampanyalar düzenlemek ister misiniz?
                </p>
                <a
                  href="mailto:isbirligi@indirimkesfet.com"
                  className="inline-block px-6 py-3 bg-white text-purple-600 rounded-xl font-semibold hover:bg-gray-100 transition-colors"
                >
                  Bize Ulaşın
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
