import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: {
    default: "İndirim Keşfet - Kupon Kodları ve İndirim Fırsatları",
    template: "%s | İndirim Keşfet"
  },
  description: "İndirim Keşfet - Türkiye'nin en güncel kupon kodları ve indirim fırsatları. Binlerce mağazadan kampanyaları keşfedin!",
  keywords: ["indirim", "kupon", "kampanya", "fırsat", "alışveriş", "indirim kodu"],
  authors: [{ name: "İndirim Keşfet" }],
  openGraph: {
    type: "website",
    locale: "tr_TR",
    siteName: "İndirim Keşfet",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <head>
        {/* Google Tag Manager */}
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
        <main className="min-h-[calc(100vh-200px)]">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
