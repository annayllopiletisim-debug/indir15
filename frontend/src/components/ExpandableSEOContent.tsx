'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

export default function ExpandableSEOContent() {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="prose prose-purple max-w-none">
      <p className="text-gray-600 leading-relaxed mb-4">
        Online alışveriş yaparken en uygun fiyatları yakalamak ve bütçenizi korumak her zamankinden daha önemli. 
        İndirim Keşfet, Türkiye genelindeki yüzlerce markanın güncel indirimlerini, kampanyalarını ve kupon kodlarını 
        tek bir platformda toplayarak kullanıcılarına kolay, hızlı ve avantajlı bir alışveriş deneyimi sunar. 
        Farklı kategorilerde yer alan fırsatları tek tek araştırmak yerine, en güncel ve doğrulanmış indirimleri 
        tek bir adreste bulabilirsiniz.
      </p>
      
      {isExpanded && (
        <>
          <p className="text-gray-600 leading-relaxed mb-4">
            İndirim Keşfet'te; moda, elektronik, market, kozmetik, ev & yaşam ve daha birçok kategoride online alışveriş 
            indirimleri düzenli olarak güncellenir. Platformumuzda yer alan kampanyalar, kullanıcıların gerçek anlamda 
            tasarruf etmesini hedefler. Süresi dolmuş ya da geçerliliğini kaybetmiş kuponlar yerine, aktif ve kullanılabilir 
            fırsatlar ön planda tutulur. Böylece alışveriş yaparken zaman kaybetmeden doğru indirime ulaşmanız sağlanır.
          </p>
          
          <p className="text-gray-600 leading-relaxed mb-4">
            Her gün yenilenen içeriklerimiz sayesinde sezon indirimleri, özel gün kampanyaları, özel kupon kodları ve 
            sınırlı süreli fırsatları kaçırmadan takip edebilirsiniz. İndirim Keşfet, yalnızca indirim listeleyen bir site 
            değil; aynı zamanda kullanıcıların bilinçli alışveriş yapmasına yardımcı olan bir keşif platformudur. 
            Kampanya detayları, indirim oranları ve kullanım koşulları açık ve anlaşılır şekilde sunulur.
          </p>
          
          <p className="text-gray-600 leading-relaxed">
            Amacımız, online alışverişte tasarrufu kolaylaştırmak ve kullanıcıların en iyi fırsatlara zahmetsizce ulaşmasını 
            sağlamaktır. İster günlük ihtiyaçlarınız için ister büyük alışverişlerinizde, en güncel indirimleri ve kupon 
            kodlarını tek bir merkezden takip edebilir, alışveriş deneyiminizi daha avantajlı hale getirebilirsiniz. 
            İndirim Keşfet ile fırsatları kaçırmadan, akıllı ve hesaplı alışverişin keyfini çıkarın.
          </p>
        </>
      )}
      
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="inline-flex items-center gap-1 text-purple-600 font-medium hover:text-purple-700 transition-colors mt-2"
        data-testid="seo-content-toggle"
      >
        {isExpanded ? (
          <>
            Daha Az Göster <ChevronUp className="w-4 h-4" />
          </>
        ) : (
          <>
            Devamını Göster <ChevronDown className="w-4 h-4" />
          </>
        )}
      </button>
    </div>
  );
}
