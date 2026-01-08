// JSON-LD Structured Data Components for SEO

export interface BreadcrumbItem {
  name: string;
  url: string;
}

export interface ProductOffer {
  name: string;
  description?: string;
  url: string;
  image?: string;
  brand?: string;
  discount?: string;
  validFrom?: string;
  validThrough?: string;
  seller?: string;
}

// Organization Schema - Site geneli için
export function OrganizationSchema() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "İndirim Keşfet",
    "url": "https://indirimkesfet.com",
    "logo": "https://indirimkesfet.com/logo.png",
    "description": "Türkiye'nin en kapsamlı kupon ve indirim platformu",
    "foundingDate": "2024",
    "sameAs": [
      "https://twitter.com/indirimkesfetcom",
      "https://instagram.com/indirimkesfetcom",
      "https://facebook.com/indirimkesfetcom"
    ],
    "contactPoint": {
      "@type": "ContactPoint",
      "email": "hello@indirimkesfet.com",
      "contactType": "customer service",
      "availableLanguage": "Turkish"
    }
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

// WebSite Schema - Arama özelliği için
export function WebSiteSchema() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "İndirim Keşfet",
    "url": "https://indirimkesfet.com",
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": "https://indirimkesfet.com/ara?q={search_term_string}"
      },
      "query-input": "required name=search_term_string"
    }
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

// Breadcrumb Schema
export function BreadcrumbSchema({ items }: { items: BreadcrumbItem[] }) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      "item": item.url
    }))
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

// Product/Offer Schema - İndirim ve kuponlar için
export function OfferSchema({ offer }: { offer: ProductOffer }) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Offer",
    "name": offer.name,
    "description": offer.description,
    "url": offer.url,
    "image": offer.image,
    "seller": offer.seller ? {
      "@type": "Organization",
      "name": offer.seller
    } : undefined,
    "priceSpecification": offer.discount ? {
      "@type": "PriceSpecification",
      "discount": offer.discount
    } : undefined,
    "validFrom": offer.validFrom,
    "priceValidUntil": offer.validThrough,
    "availability": "https://schema.org/InStock",
    "itemCondition": "https://schema.org/NewCondition"
  };

  // Remove undefined values
  const cleanSchema = JSON.parse(JSON.stringify(schema));

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(cleanSchema) }}
    />
  );
}

// Store/Brand Schema
export function LocalBusinessSchema({ 
  name, 
  description, 
  url, 
  logo 
}: { 
  name: string; 
  description?: string; 
  url: string; 
  logo?: string;
}) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Store",
    "name": name,
    "description": description,
    "url": url,
    "image": logo,
    "priceRange": "₺₺"
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

// Blog/Article Schema
export function ArticleSchema({
  title,
  description,
  url,
  image,
  datePublished,
  dateModified,
  author
}: {
  title: string;
  description?: string;
  url: string;
  image?: string;
  datePublished?: string;
  dateModified?: string;
  author?: string;
}) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": title,
    "description": description,
    "url": url,
    "image": image,
    "datePublished": datePublished,
    "dateModified": dateModified || datePublished,
    "author": {
      "@type": "Person",
      "name": author || "İndirim Keşfet"
    },
    "publisher": {
      "@type": "Organization",
      "name": "İndirim Keşfet",
      "logo": {
        "@type": "ImageObject",
        "url": "https://indirimkesfet.com/logo.png"
      }
    }
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

// ItemList Schema - Listeleme sayfaları için
export function ItemListSchema({
  name,
  description,
  items
}: {
  name: string;
  description?: string;
  items: { name: string; url: string; position: number }[];
}) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": name,
    "description": description,
    "numberOfItems": items.length,
    "itemListElement": items.map(item => ({
      "@type": "ListItem",
      "position": item.position,
      "name": item.name,
      "url": item.url
    }))
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

// FAQ Schema - SSS için
export function FAQSchema({ faqs }: { faqs: { question: string; answer: string }[] }) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
