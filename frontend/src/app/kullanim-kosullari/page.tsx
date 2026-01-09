import { Metadata } from 'next';
import { FileText, ShoppingBag, AlertTriangle, Shield, Link2, Scale, Ban, RefreshCw } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Kullanım Koşulları',
  description: 'İndirimKeşfet.com kullanım koşulları - Site kullanımı, içerik politikası ve sorumluluk reddi.',
  alternates: {
    canonical: '/kullanim-kosullari',
  },
};

export default function TermsPage() {
  const currentDate = new Date().toLocaleDateString('tr-TR', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <section className="bg-gradient-to-r from-blue-700 to-blue-800 text-white">
        <div className="container mx-auto px-4 py-12">
          <div className="flex items-center gap-4 mb-4">
            <FileText className="w-10 h-10" />
            <h1 className="text-3xl font-bold">Kullanım Koşulları</h1>
          </div>
          <p className="text-blue-200">Son Güncelleme: {currentDate}</p>
        </div>
      </section>

      <div className="container mx-auto px-4 py-10">
        <div className="max-w-4xl mx-auto">
          {/* Intro */}
          <div className="bg-white rounded-2xl shadow-sm p-8 mb-6">
            <p className="text-gray-700 text-lg leading-relaxed">
              İndirimKeşfet.com (&quot;Site&quot;) bir kupon kodu ve indirim fırsatları listeleme platformudur. 
              Siteyi kullanarak aşağıdaki koşulları kabul etmiş sayılırsınız. Lütfen bu koşulları dikkatlice okuyunuz.
            </p>
          </div>

          {/* Sections */}
          <div className="space-y-6">
            {/* Section 1 */}
            <section className="bg-white rounded-2xl shadow-sm p-8">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <ShoppingBag className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-800 mb-3">1. Hizmetin Tanımı</h2>
                  <p className="text-gray-600 leading-relaxed mb-3">
                    İndirimKeşfet.com, çeşitli mağaza ve markaların sunduğu indirim kampanyaları, kupon kodları, 
                    promosyonlar ve fırsatları kullanıcılarla buluşturan bir bilgilendirme platformudur.
                  </p>
                  <div className="bg-blue-50 rounded-xl p-4">
                    <p className="text-blue-800 font-medium">Önemli:</p>
                    <ul className="text-blue-700 text-sm mt-2 space-y-1">
                      <li>• Site bir e-ticaret platformu değildir</li>
                      <li>• Herhangi bir ürün veya hizmet satışı yapılmamaktadır</li>
                      <li>• Kullanıcılardan ödeme alınmamaktadır</li>
                    </ul>
                  </div>
                </div>
              </div>
            </section>

            {/* Section 2 */}
            <section className="bg-white rounded-2xl shadow-sm p-8">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <AlertTriangle className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-800 mb-3">2. İçeriklerin Doğruluğu</h2>
                  <p className="text-gray-600 leading-relaxed mb-3">
                    Sitede yayınlanan kupon kodları, indirim oranları ve kampanya bilgileri ilgili mağazalar 
                    tarafından sağlanmakta veya kamuya açık kaynaklardan derlenmektedir.
                  </p>
                  <ul className="space-y-2 text-gray-600">
                    <li className="flex items-start gap-2">
                      <span className="w-2 h-2 bg-amber-500 rounded-full mt-2"></span>
                      Kupon kodları ve kampanyalar önceden haber verilmeksizin değişebilir veya sona erebilir
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-2 h-2 bg-amber-500 rounded-full mt-2"></span>
                      Bazı kuponlar belirli ürünler, minimum sepet tutarı veya kullanıcı grupları için geçerli olabilir
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-2 h-2 bg-amber-500 rounded-full mt-2"></span>
                      Site, içeriklerin %100 güncel ve doğru olduğunu garanti etmez
                    </li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Section 3 */}
            <section className="bg-white rounded-2xl shadow-sm p-8">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Shield className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-800 mb-3">3. Sorumluluk Reddi</h2>
                  <p className="text-gray-600 leading-relaxed mb-3">
                    İndirimKeşfet.com aşağıdaki konularda sorumluluk kabul etmez:
                  </p>
                  <ul className="space-y-2 text-gray-600">
                    <li className="flex items-start gap-2">
                      <span className="w-2 h-2 bg-red-500 rounded-full mt-2"></span>
                      Mağazalardan satın alınan ürün ve hizmetlerin kalitesi, fiyatı veya teslimatı
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-2 h-2 bg-red-500 rounded-full mt-2"></span>
                      Kupon kodlarının çalışmaması veya reddedilmesi
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-2 h-2 bg-red-500 rounded-full mt-2"></span>
                      Kampanya koşullarındaki değişiklikler
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-2 h-2 bg-red-500 rounded-full mt-2"></span>
                      Mağazaların iade, değişim veya müşteri hizmetleri politikaları
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-2 h-2 bg-red-500 rounded-full mt-2"></span>
                      Yönlendirilen sitelerdeki güvenlik sorunları
                    </li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Section 4 */}
            <section className="bg-white rounded-2xl shadow-sm p-8">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Link2 className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-800 mb-3">4. Üçüncü Taraf Bağlantılar</h2>
                  <p className="text-gray-600 leading-relaxed mb-3">
                    Site, kullanıcıları mağazaların kendi web sitelerine yönlendiren bağlantılar içerir.
                  </p>
                  <ul className="space-y-2 text-gray-600">
                    <li className="flex items-start gap-2">
                      <span className="w-2 h-2 bg-purple-500 rounded-full mt-2"></span>
                      Bu sitelerin içerik, gizlilik politikası ve kullanım koşullarından İndirimKeşfet.com sorumlu değildir
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-2 h-2 bg-purple-500 rounded-full mt-2"></span>
                      Yönlendirilen sitelerde yapacağınız işlemler tamamen sizin sorumluluğunuzdadır
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-2 h-2 bg-purple-500 rounded-full mt-2"></span>
                      Alışveriş yapmadan önce mağazanın kendi koşullarını okumanızı öneririz
                    </li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Section 5 */}
            <section className="bg-white rounded-2xl shadow-sm p-8">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Scale className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-800 mb-3">5. Affiliate (Satış Ortaklığı) Açıklaması</h2>
                  <p className="text-gray-600 leading-relaxed mb-3">
                    İndirimKeşfet.com, bazı mağazalarla affiliate (satış ortaklığı) anlaşmasına sahip olabilir.
                  </p>
                  <div className="bg-green-50 rounded-xl p-4">
                    <p className="text-green-800 text-sm leading-relaxed">
                      Bu, sitedeki bazı bağlantılar üzerinden yapılan alışverişlerden komisyon kazanabileceğimiz 
                      anlamına gelir. Ancak bu durum, listelenen fırsatların seçimini veya sıralamasını 
                      etkilememektedir. Amacımız her zaman kullanıcılarımıza en iyi fırsatları sunmaktır.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Section 6 */}
            <section className="bg-white rounded-2xl shadow-sm p-8">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Ban className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-800 mb-3">6. Yasak Kullanımlar</h2>
                  <p className="text-gray-600 leading-relaxed mb-3">
                    Aşağıdaki kullanımlar kesinlikle yasaktır:
                  </p>
                  <ul className="space-y-2 text-gray-600">
                    <li className="flex items-start gap-2">
                      <span className="w-2 h-2 bg-orange-500 rounded-full mt-2"></span>
                      Site içeriklerinin ticari amaçla kopyalanması, çoğaltılması veya yeniden yayınlanması
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-2 h-2 bg-orange-500 rounded-full mt-2"></span>
                      Otomatik botlar veya scraping araçları kullanılması
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-2 h-2 bg-orange-500 rounded-full mt-2"></span>
                      Sahte veya yanıltıcı kupon kodları paylaşılması
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-2 h-2 bg-orange-500 rounded-full mt-2"></span>
                      Site altyapısına zarar vermeye çalışılması
                    </li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Section 7 */}
            <section className="bg-white rounded-2xl shadow-sm p-8">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-cyan-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Shield className="w-5 h-5 text-cyan-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-800 mb-3">7. Fikri Mülkiyet</h2>
                  <p className="text-gray-600 leading-relaxed mb-3">
                    Sitede yer alan marka logoları, isimleri ve görseller ilgili hak sahiplerine aittir ve 
                    yalnızca tanıtım amacıyla kullanılmaktadır.
                  </p>
                  <p className="text-gray-600 leading-relaxed">
                    Hak sahipleri, içeriklerin kaldırılması için{' '}
                    <a href="mailto:hello@indirimkesfet.com" className="text-purple-600 hover:underline">
                      hello@indirimkesfet.com
                    </a>{' '}
                    adresinden bizimle iletişime geçebilir.
                  </p>
                </div>
              </div>
            </section>

            {/* Section 8 */}
            <section className="bg-white rounded-2xl shadow-sm p-8">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <RefreshCw className="w-5 h-5 text-slate-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-800 mb-3">8. Değişiklikler</h2>
                  <p className="text-gray-600 leading-relaxed">
                    İndirimKeşfet.com, bu kullanım koşullarını önceden haber vermeksizin güncelleme hakkını 
                    saklı tutar. Güncellemeler sitede yayınlandığı anda yürürlüğe girer. Siteyi kullanmaya 
                    devam etmeniz, güncel koşulları kabul ettiğiniz anlamına gelir.
                  </p>
                </div>
              </div>
            </section>
          </div>

          {/* Contact */}
          <div className="bg-purple-50 rounded-2xl p-6 mt-8 text-center">
            <p className="text-gray-700">
              Sorularınız için:{' '}
              <a href="mailto:hello@indirimkesfet.com" className="text-purple-600 font-semibold hover:underline">
                hello@indirimkesfet.com
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
