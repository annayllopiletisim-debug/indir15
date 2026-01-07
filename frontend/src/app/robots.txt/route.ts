export async function GET() {
  const robotsTxt = `User-agent: *
Allow: /

Sitemap: ${process.env.NEXT_PUBLIC_SITE_URL || 'https://indirimkesfet.com'}/sitemap.xml

# Disallow admin pages
Disallow: /admin/
Disallow: /api/
`;

  return new Response(robotsTxt, {
    headers: {
      'Content-Type': 'text/plain',
    },
  });
}
