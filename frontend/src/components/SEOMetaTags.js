import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * SEO Meta Tags Component
 * Dynamically sets robots meta tag based on current route
 */
const SEOMetaTags = () => {
  const location = useLocation();

  useEffect(() => {
    // Remove existing robots meta tag
    const existingRobots = document.querySelector('meta[name="robots"]');
    if (existingRobots) {
      existingRobots.remove();
    }

    // Create new robots meta tag
    const robotsMeta = document.createElement('meta');
    robotsMeta.name = 'robots';

    // Check route and set appropriate robots directive
    const pathname = location.pathname;
    const search = location.search;

    if (pathname.startsWith('/admin')) {
      // Admin pages - noindex, nofollow
      robotsMeta.content = 'noindex, nofollow';
    } else if (search.includes('q=')) {
      // Search pages with query params - noindex, follow
      robotsMeta.content = 'noindex, follow';
    } else {
      // All other public pages - index, follow
      robotsMeta.content = 'index, follow';
    }

    document.head.appendChild(robotsMeta);

    return () => {
      // Cleanup on unmount
      const meta = document.querySelector('meta[name="robots"]');
      if (meta) {
        meta.remove();
      }
    };
  }, [location]);

  return null;
};

export default SEOMetaTags;
