import { Metadata } from 'next';
import { Shield, FileText, Lock, Users, Cookie, Link2, Building, RefreshCw } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Kullanım Koşulları ve Gizlilik Politikası',
  description: 'İndirimKeşfet.com kullanım koşulları, gizlilik politikası ve kişisel verilerin korunması hakkında bilgilendirme.',
  alternates: {
    canonical: '/gizlilik',
  },
};

export default function PrivacyPage() {
  const currentDate = new Date().toLocaleDateString('tr-TR', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <section className="bg-gradient-to-r from-slate-700 to-slate-800 text-white">
        <div className="container mx-auto px-4 py-12">
          <div className="flex items-center gap-4 mb-4">
            <Shield className="w-10 h-10" />
            <h1 className="text-3xl font-bold">Kullanım Koşulları ve Gizlilik Politikası</h1>
          </div>
          <p className="text-slate-300">Son Güncelleme: {currentDate}</p>
        </div>
      </section>

      <div className="container mx-auto px-4 py-10">
        <div className="max-w-4xl mx-auto">
          {/* Intro */}
          <div className="bg-white rounded-2xl shadow-sm p-8 mb-6">
            <p className="text-gray-700 text-lg leading-relaxed">
              İndirimKeşfet.com, internet ortamında yer alan indirim, kampanya, kupon ve fırsat bilgilerini 
              kullanıcılarına fayda sağlamak amacıyla bir araya getiren ücretsiz ve herkese açık bir bilgilendirme 
              platformudur. Siteyi ziyaret eden ve kullanan herkes, aşağıda yer alan şartları peşinen kabul etmiş sayılır.
            </p>
          </div>

          {/* Sections */}
          <div className="space-y-6">
            {/* Section 1 */}
            <section className="bg-white rounded-2xl shadow-sm p-8">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <FileText className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-800 mb-3">1) Hizmetin Kapsamı</h2>
                  <p className="text-gray-600 leading-relaxed">
                    İndirimKeşfet.com; mağazalar tarafından sunulan indirim, kampanya, promosyon, kupon kodu, 
                    hediye çeki ve benzeri avantajları kullanıcılarla buluşturmak amacıyla kurulmuştur.
                  </p>
                </div>
              </div>
            </section>

            {/* Section 2 */}
            <section className="bg-white rounded-2xl shadow-sm p-8">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Building className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-800 mb-3">2) Ticari Faaliyet Durumu</h2>
                  <p className="text-gray-600 leading-relaxed">
                    İndirimKeşfet.com bir e-ticaret sitesi değildir. Site üzerinden herhangi bir ürün satışı 
                    yapılmaz ve kullanıcıdan hiçbir ödeme talep edilmez.
                  </p>
                </div>
              </div>
            </section>

            {/* Section 3 */}
            <section className="bg-white rounded-2xl shadow-sm p-8">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <FileText className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-800 mb-3">3) Sunulan İçerikler</h2>
                  <p className="text-gray-600 leading-relaxed">
                    Sitede; indirim kodları, kuponlar, promosyonlar, kampanyalar, alışveriş fırsatları ve benzeri 
                    tasarruf sağlayan bilgiler yayınlanmaktadır. Bu içerikler yalnızca bilgilendirme amaçlıdır.
                  </p>
                </div>
              </div>
            </section>

            {/* Section 4 */}
            <section className="bg-white rounded-2xl shadow-sm p-8">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Users className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-800 mb-3">4) Kişisel Kullanım Şartı</h2>
                  <p className="text-gray-600 leading-relaxed">
                    Sitede yer alan tüm içerikler bireysel kullanım içindir. İndirimKeşfet.com'daki içeriklerin 
                    ticari amaçlarla kopyalanması, çoğaltılması, yeniden yayınlanması veya farklı platformlarda 
                    kullanılması kesinlikle yasaktır.
                  </p>
                </div>
              </div>
            </section>

            {/* Section 5 */}
            <section className="bg-white rounded-2xl shadow-sm p-8">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-pink-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <FileText className="w-5 h-5 text-pink-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-800 mb-3">5) İçerik Seçimi</h2>
                  <p className="text-gray-600 leading-relaxed">
                    İndirimKeşfet.com, piyasadaki tüm kampanya ve indirimleri yayınlamak zorunda değildir. 
                    Sitede yalnızca seçilmiş ve uygun görülen içerikler yer alır. Sitede bulunmayan kampanyalar 
                    nedeniyle site sorumluluk kabul etmez.
                  </p>
                </div>
              </div>
            </section>

            {/* Section 6 */}
            <section className="bg-white rounded-2xl shadow-sm p-8">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-yellow-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <RefreshCw className="w-5 h-5 text-yellow-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-800 mb-3">6) İçeriklerin Geçerliliği</h2>
                  <p className="text-gray-600 leading-relaxed mb-3">
                    Yayınlanan kuponlar ve kampanyalar zaman içinde sona erebilir, değiştirilebilir veya iptal edilebilir.
                  </p>
                  <p className="text-gray-600 leading-relaxed mb-3">
                    İndirimKeşfet.com, paylaşılan bilgilerin güncelliğini veya doğruluğunu garanti etmez.
                  </p>
                  <p className="text-gray-600 leading-relaxed">
                    Kampanyalarla ilgili yaşanabilecek sorunlarda kullanıcıların doğrudan ilgili mağaza ile 
                    iletişime geçmesi gerekir.
                  </p>
                </div>
              </div>
            </section>

            {/* Section 7 */}
            <section className="bg-white rounded-2xl shadow-sm p-8">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Shield className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-800 mb-3">7) Alışveriş Sorumluluğu</h2>
                  <p className="text-gray-600 leading-relaxed mb-3">
                    İndirimKeşfet.com, sitede yer alan mağazalardan satın alınan ürün veya hizmetlerin;
                  </p>
                  <ul className="list-disc list-inside text-gray-600 space-y-1 ml-4 mb-3">
                    <li>Kalitesi</li>
                    <li>Fiyatı</li>
                    <li>Garanti koşulları</li>
                    <li>Satış süreçleri</li>
                  </ul>
                  <p className="text-gray-600 leading-relaxed">
                    konularında hiçbir sorumluluk taşımaz. Site, alışverişin hiçbir aşamasında taraf değildir.
                  </p>
                </div>
              </div>
            </section>

            {/* Section 8 */}
            <section className="bg-white rounded-2xl shadow-sm p-8">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Lock className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-800 mb-3">8) Kişisel Verilerin Korunması</h2>
                  <p className="text-gray-600 leading-relaxed mb-3">
                    Kullanıcıların site üzerinden paylaştığı kişisel bilgiler, güvenli altyapılar ile korunur.
                  </p>
                  <p className="text-gray-600 leading-relaxed mb-3">
                    Bu bilgiler üçüncü kişilerle paylaşılmaz, satılmaz veya kiralanmaz.
                  </p>
                  <p className="text-gray-600 leading-relaxed">
                    İndirimKeşfet.com, gizlilik ve kişisel haklara saygıyı temel ilke olarak benimser.
                  </p>
                </div>
              </div>
            </section>

            {/* Section 9 */}
            <section className="bg-white rounded-2xl shadow-sm p-8">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Users className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-800 mb-3">9) Üyelik ve Bildirimler</h2>
                  <p className="text-gray-600 leading-relaxed mb-3">
                    Üyelik sırasında paylaşılan bilgiler, kullanıcıya daha iyi hizmet sunmak amacıyla kullanılır.
                  </p>
                  <p className="text-gray-600 leading-relaxed mb-3">
                    Kullanıcılar, isteğe bağlı olarak e-posta bültenleri ve indirim bildirimleri alabilir.
                  </p>
                  <p className="text-gray-600 leading-relaxed">
                    Dileyen kullanıcılar istedikleri zaman üyeliklerini iptal edebilir veya bildirimleri durdurabilir.
                  </p>
                </div>
              </div>
            </section>

            {/* Section 10 */}
            <section className="bg-white rounded-2xl shadow-sm p-8">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Cookie className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-800 mb-3">10) Çerez (Cookie) Kullanımı</h2>
                  <p className="text-gray-600 leading-relaxed mb-3">
                    İndirimKeşfet.com, kullanıcı deneyimini geliştirmek ve tercihleri hatırlamak amacıyla 
                    çerezlerden faydalanabilir.
                  </p>
                  <p className="text-gray-600 leading-relaxed">
                    Tarayıcı ayarları üzerinden çerez kullanımı kontrol edilebilir.
                  </p>
                </div>
              </div>
            </section>

            {/* Section 11 */}
            <section className="bg-white rounded-2xl shadow-sm p-8">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-cyan-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Link2 className="w-5 h-5 text-cyan-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-800 mb-3">11) Üçüncü Taraf Bağlantılar</h2>
                  <p className="text-gray-600 leading-relaxed mb-3">
                    Site, kullanıcıları farklı internet sitelerine yönlendiren bağlantılar veya reklamlar içerebilir.
                  </p>
                  <p className="text-gray-600 leading-relaxed">
                    Yönlendirilen sitelerin içeriklerinden, kullanım şartlarından veya gizlilik politikalarından 
                    İndirimKeşfet.com sorumlu değildir.
                  </p>
                </div>
              </div>
            </section>

            {/* Section 12 */}
            <section className="bg-white rounded-2xl shadow-sm p-8">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Shield className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-800 mb-3">12) Marka ve Haklar</h2>
                  <p className="text-gray-600 leading-relaxed mb-3">
                    Sitede yer alan tüm marka, logo, isim ve görseller ilgili hak sahiplerine aittir.
                  </p>
                  <p className="text-gray-600 leading-relaxed">
                    Hak sahipleri, gerekli gördükleri durumlarda site yönetimiyle iletişime geçerek düzenleme 
                    veya kaldırma talebinde bulunabilir.
                  </p>
                </div>
              </div>
            </section>

            {/* Section 13 */}
            <section className="bg-white rounded-2xl shadow-sm p-8">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-violet-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Building className="w-5 h-5 text-violet-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-800 mb-3">13) Reklam ve İş Birlikleri</h2>
                  <p className="text-gray-600 leading-relaxed mb-3">
                    İndirimKeşfet.com; mağazalarla reklam, sponsorluk veya affiliate (satış ortaklığı) 
                    çalışmaları yapabilir.
                  </p>
                  <p className="text-gray-600 leading-relaxed">
                    Site üzerindeki bazı bağlantılar gelir getirici olabilir. Bu iş birlikleri kullanıcı 
                    deneyimini olumsuz etkilemeyecek şekilde sunulur.
                  </p>
                </div>
              </div>
            </section>

            {/* Section 14 */}
            <section className="bg-white rounded-2xl shadow-sm p-8">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <RefreshCw className="w-5 h-5 text-slate-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-800 mb-3">14) Değişiklik Hakkı</h2>
                  <p className="text-gray-600 leading-relaxed">
                    İndirimKeşfet.com, bu kullanım koşullarını ve gizlilik politikasını önceden haber 
                    vermeksizin güncelleme veya değiştirme hakkını saklı tutar.
                  </p>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
