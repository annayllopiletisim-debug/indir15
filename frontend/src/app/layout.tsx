import type { Metadata, Viewport } from "next";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CategoryBarWrapper from "@/components/CategoryBarWrapper";
import { OrganizationSchema, WebSiteSchema } from "@/components/StructuredData";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://indirimkesfet.com";

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#6366f1',
};

export const metadata: Metadata = {
  title: {
    default: "İndirim Keşfet - Kupon Kodları ve İndirim Fırsatları",
    template: "%s | İndirim Keşfet"
  },
  description: "İndirim Keşfet - Türkiye'nin en güncel kupon kodları ve indirim fırsatları. Binlerce mağazadan kampanyaları keşfedin!",
  keywords: ["indirim", "kupon", "kampanya", "fırsat", "alışveriş", "indirim kodu"],
  authors: [{ name: "İndirim Keşfet" }],
  metadataBase: new URL(siteUrl),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "tr_TR",
    siteName: "İndirim Keşfet",
    url: siteUrl,
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "İndirim Keşfet - Türkiye'nin En Güncel İndirim Platformu",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@indirimkesfetcom",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/icon.svg",
  },
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <head>
        {/* Preconnect to external domains for faster loading */}
        <link rel="preconnect" href="https://www.googletagmanager.com" />
        <link rel="preconnect" href="https://www.google-analytics.com" />
        <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
        
        {/* JSON-LD Structured Data */}
        <OrganizationSchema />
        <WebSiteSchema />
        
        {/* Google Tag Manager - loaded async */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
            new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
            j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
            'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer','GTM-NKHBV7L4');`
          }}
        />
      </head>
      <body className="min-h-screen bg-background text-foreground antialiased">
        {/* Google Tag Manager (noscript) */}
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-NKHBV7L4"
            height="0"
            width="0"
            style={{ display: 'none', visibility: 'hidden' }}
          />
        </noscript>
        <Header />
        <CategoryBarWrapper />
        <main className="min-h-[calc(100vh-200px)]">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
