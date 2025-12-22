import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * SEO Meta Tags Component
 * Sets default robots meta tag for admin/search pages only.
 * Regular pages should use Helmet for their own SEO tags.
 */
const SEOMetaTags = () => {
  const location = useLocation();

  useEffect(() => {
    const pathname = location.pathname;
    const search = location.search;

    // Only intervene for admin and search pages
    // Let Helmet handle SEO for programmatic pages
    if (pathname.startsWith('/admin') || search.includes('q=')) {
      // Remove existing robots meta tag
      const existingRobots = document.querySelector('meta[name="robots"]');
      if (existingRobots) {
        existingRobots.remove();
      }

      // Create new robots meta tag
      const robotsMeta = document.createElement('meta');
      robotsMeta.name = 'robots';
      robotsMeta.setAttribute('data-seo-component', 'true');

      if (pathname.startsWith('/admin')) {
        robotsMeta.content = 'noindex, nofollow';
      } else {
        robotsMeta.content = 'noindex, follow';
      }

      document.head.appendChild(robotsMeta);

      return () => {
        // Only cleanup tags we created
        const meta = document.querySelector('meta[name="robots"][data-seo-component="true"]');
        if (meta) {
          meta.remove();
        }
      };
    }
  }, [location]);

  return null;
};

export default SEOMetaTags;
