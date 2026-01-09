import { Metadata } from 'next';
import { Shield, User, Database, Target, Share2, Clock, Scale, Cookie, Mail } from 'lucide-react';

export const metadata: Metadata = {
  title: 'KVKK Aydınlatma Metni',
  description: 'İndirimKeşfet.com KVKK Aydınlatma Metni - 6698 sayılı Kişisel Verilerin Korunması Kanunu kapsamında bilgilendirme.',
  alternates: {
    canonical: '/kvkk',
  },
};

export default function KVKKPage() {
  const currentDate = new Date().toLocaleDateString('tr-TR', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <section className="bg-gradient-to-r from-indigo-700 to-indigo-800 text-white">
        <div className="container mx-auto px-4 py-12">
          <div className="flex items-center gap-4 mb-4">
            <Shield className="w-10 h-10" />
            <h1 className="text-3xl font-bold">KVKK Aydınlatma Metni</h1>
          </div>
          <p className="text-indigo-200">Son Güncelleme: {currentDate}</p>
        </div>
      </section>

      <div className="container mx-auto px-4 py-10">
        <div className="max-w-4xl mx-auto">
          {/* Intro */}
          <div className="bg-white rounded-2xl shadow-sm p-8 mb-6">
            <p className="text-gray-700 text-lg leading-relaxed">
              Bu Aydınlatma Metni, indirimkesfet.com (&quot;Site&quot;) üzerinden sunulan hizmetler kapsamında, 
              6698 sayılı Kişisel Verilerin Korunması Kanunu (KVKK) uyarınca kişisel verilerin işlenmesine 
              ilişkin kullanıcıların bilgilendirilmesi amacıyla hazırlanmıştır.
            </p>
          </div>

          {/* Sections */}
          <div className="space-y-6">
            {/* Section 1 - Veri Sorumlusu */}
            <section className="bg-white rounded-2xl shadow-sm p-8">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <User className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-800 mb-3">1. Veri Sorumlusu</h2>
                  <p className="text-gray-600 leading-relaxed mb-4">
                    KVKK uyarınca kişisel verileriniz, veri sorumlusu sıfatıyla indirimkesfet.com tarafından 
                    işlenmektedir.
                  </p>
                  <div className="bg-indigo-50 rounded-xl p-4">
                    <p className="font-semibold text-gray-800 mb-2">İletişim:</p>
                    <p className="text-gray-600 flex items-center gap-2">
                      <Mail className="w-4 h-4 text-indigo-600" />
                      E-posta: hello@indirimkesfet.com
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Section 2 - İşlenen Kişisel Veriler */}
            <section className="bg-white rounded-2xl shadow-sm p-8">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Database className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-800 mb-3">2. İşlenen Kişisel Veriler</h2>
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-4">
                    <p className="text-amber-800 font-medium">
                      Site üzerinde üyelik sistemi bulunmamaktadır.
                    </p>
                    <p className="text-amber-700 text-sm mt-1">
                      Bu nedenle doğrudan kimlik bilgisi (ad, soyad vb.) toplanmaz.
                    </p>
                  </div>
                  <p className="text-gray-600 leading-relaxed mb-3">
                    Ancak site kullanımı sırasında aşağıdaki sınırlı veriler otomatik olarak işlenebilir:
                  </p>
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2 text-gray-600">
                      <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                      IP adresi
                    </li>
                    <li className="flex items-center gap-2 text-gray-600">
                      <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                      Tarayıcı ve cihaz bilgileri
                    </li>
                    <li className="flex items-center gap-2 text-gray-600">
                      <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                      Ziyaret zamanı ve sayfa görüntüleme bilgileri
                    </li>
                    <li className="flex items-center gap-2 text-gray-600">
                      <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                      Çerez (cookie) verileri
                    </li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Section 3 - İşlenme Amaçları */}
            <section className="bg-white rounded-2xl shadow-sm p-8">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Target className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-800 mb-3">3. Kişisel Verilerin İşlenme Amaçları</h2>
                  <p className="text-gray-600 leading-relaxed mb-3">
                    Toplanan veriler aşağıdaki amaçlarla işlenmektedir:
                  </p>
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2 text-gray-600">
                      <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                      Sitenin çalışmasını sağlamak
                    </li>
                    <li className="flex items-center gap-2 text-gray-600">
                      <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                      Site performansını ve güvenliğini artırmak
                    </li>
                    <li className="flex items-center gap-2 text-gray-600">
                      <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                      Kullanıcı deneyimini iyileştirmek
                    </li>
                    <li className="flex items-center gap-2 text-gray-600">
                      <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                      Trafik analizi ve istatistik oluşturmak
                    </li>
                    <li className="flex items-center gap-2 text-gray-600">
                      <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                      Hukuki yükümlülüklerin yerine getirilmesi
                    </li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Section 4 - Verilerin Aktarılması */}
            <section className="bg-white rounded-2xl shadow-sm p-8">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Share2 className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-800 mb-3">4. Kişisel Verilerin Aktarılması</h2>
                  <p className="text-gray-600 leading-relaxed mb-3">
                    Kişisel verileriniz;
                  </p>
                  <ul className="space-y-2 mb-4">
                    <li className="flex items-start gap-2 text-gray-600">
                      <span className="w-2 h-2 bg-purple-500 rounded-full mt-2"></span>
                      Yasal yükümlülükler kapsamında yetkili kamu kurum ve kuruluşlarına
                    </li>
                    <li className="flex items-start gap-2 text-gray-600">
                      <span className="w-2 h-2 bg-purple-500 rounded-full mt-2"></span>
                      Teknik altyapı ve analiz hizmeti alınan yurt içi veya yurt dışı hizmet sağlayıcılara
                    </li>
                  </ul>
                  <p className="text-gray-600 leading-relaxed">
                    KVKK&apos;ya uygun şekilde ve gerekli güvenlik önlemleri alınarak aktarılabilir.
                  </p>
                </div>
              </div>
            </section>

            {/* Section 5 - Toplanma Yöntemi */}
            <section className="bg-white rounded-2xl shadow-sm p-8">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Database className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-800 mb-3">5. Kişisel Verilerin Toplanma Yöntemi ve Hukuki Sebebi</h2>
                  <p className="text-gray-600 leading-relaxed mb-3">
                    Kişisel verileriniz;
                  </p>
                  <ul className="space-y-2 mb-4">
                    <li className="flex items-center gap-2 text-gray-600">
                      <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                      Siteyi ziyaret etmeniz sırasında
                    </li>
                    <li className="flex items-center gap-2 text-gray-600">
                      <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                      Çerezler ve benzeri teknolojiler aracılığıyla
                    </li>
                  </ul>
                  <p className="text-gray-600 leading-relaxed mb-4">
                    otomatik yollarla toplanmaktadır.
                  </p>
                  <div className="bg-orange-50 rounded-xl p-4">
                    <p className="font-semibold text-gray-800 mb-2">Hukuki sebepler:</p>
                    <ul className="space-y-1 text-gray-600 text-sm">
                      <li>• KVKK madde 5/2-f: Veri sorumlusunun meşru menfaati</li>
                      <li>• KVKK madde 5/2-ç: Hukuki yükümlülüklerin yerine getirilmesi</li>
                    </ul>
                  </div>
                </div>
              </div>
            </section>

            {/* Section 6 - Saklama Süresi */}
            <section className="bg-white rounded-2xl shadow-sm p-8">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-cyan-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Clock className="w-5 h-5 text-cyan-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-800 mb-3">6. Veri Saklama Süresi</h2>
                  <p className="text-gray-600 leading-relaxed mb-3">
                    Toplanan kişisel veriler, işlenme amaçları için gerekli olan süre boyunca saklanır.
                  </p>
                  <p className="text-gray-600 leading-relaxed">
                    Süre sonunda veriler silinir, yok edilir veya anonim hale getirilir.
                  </p>
                </div>
              </div>
            </section>

            {/* Section 7 - Haklarınız */}
            <section className="bg-white rounded-2xl shadow-sm p-8">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Scale className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-800 mb-3">7. KVKK Kapsamındaki Haklarınız</h2>
                  <p className="text-gray-600 leading-relaxed mb-3">
                    KVKK&apos;nın 11. maddesi uyarınca veri sahipleri olarak:
                  </p>
                  <ul className="space-y-2 mb-4">
                    <li className="flex items-start gap-2 text-gray-600">
                      <span className="w-2 h-2 bg-emerald-500 rounded-full mt-2"></span>
                      Kişisel verilerinizin işlenip işlenmediğini öğrenme
                    </li>
                    <li className="flex items-start gap-2 text-gray-600">
                      <span className="w-2 h-2 bg-emerald-500 rounded-full mt-2"></span>
                      İşlenmişse buna ilişkin bilgi talep etme
                    </li>
                    <li className="flex items-start gap-2 text-gray-600">
                      <span className="w-2 h-2 bg-emerald-500 rounded-full mt-2"></span>
                      Yanlış veya eksik verilerin düzeltilmesini isteme
                    </li>
                    <li className="flex items-start gap-2 text-gray-600">
                      <span className="w-2 h-2 bg-emerald-500 rounded-full mt-2"></span>
                      Verilerin silinmesini veya yok edilmesini talep etme
                    </li>
                    <li className="flex items-start gap-2 text-gray-600">
                      <span className="w-2 h-2 bg-emerald-500 rounded-full mt-2"></span>
                      İşleme itiraz etme
                    </li>
                  </ul>
                  <p className="text-gray-600 leading-relaxed">
                    haklarına sahipsiniz.
                  </p>
                  <div className="bg-emerald-50 rounded-xl p-4 mt-4">
                    <p className="text-gray-700">
                      Taleplerinizi <span className="font-semibold">hello@indirimkesfet.com</span> adresi 
                      üzerinden iletebilirsiniz.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Section 8 - Çerez Kullanımı */}
            <section className="bg-white rounded-2xl shadow-sm p-8">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Cookie className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-800 mb-3">8. Çerez (Cookie) Kullanımı</h2>
                  <p className="text-gray-600 leading-relaxed mb-3">
                    Site, kullanıcı deneyimini geliştirmek amacıyla çerezler kullanabilir.
                  </p>
                  <p className="text-gray-600 leading-relaxed">
                    Çerezler aracılığıyla kişisel veri toplanmasını istemiyorsanız tarayıcı ayarlarınızdan 
                    çerezleri devre dışı bırakabilirsiniz.
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
