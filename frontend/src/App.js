import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { ThemeProvider } from './context/ThemeContext';
import Header from './components/Header';
import Footer from './components/Footer';
import CategoryNav from './components/CategoryNav';
import MobileSearchBar from './components/MobileSearchBar';
import SEOMetaTags from './components/SEOMetaTags';
import HomePage from './pages/HomePage';
import BrandPage from './pages/BrandPage';
import StoresPage from './pages/StoresPage';
import CategoryPage from './pages/CategoryPage';
import CategoriesPage from './pages/CategoriesPage';
import ExpiringSoonPage from './pages/ExpiringSoonPage';
import ContactPage from './pages/ContactPage';
import SearchResultsPage from './pages/SearchResultsPage';
import ProgrammaticSeoPage from './pages/ProgrammaticSeoPage';
import DealDetailPage from './pages/DealDetailPage';
import AdminLoginPage from './pages/admin/AdminLoginPage';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminBrandsPage from './pages/admin/AdminBrandsPage';
import AdminCouponsPage from './pages/admin/AdminCouponsPage';
import AdminDiscountsPage from './pages/admin/AdminDiscountsPage';
import AdminKeywordsPage from './pages/admin/AdminKeywordsPage';
import AdminHeroSlidesPage from './pages/admin/AdminHeroSlidesPage';
import AdminCategoriesPage from './pages/admin/AdminCategoriesPage';
import AdminSettingsPage from './pages/admin/AdminSettingsPage';
import AdminImportPage from './pages/admin/AdminImportPage';
import AdminGiveawaysPage from './pages/admin/AdminGiveawaysPage';
import AdminLayout from './components/AdminLayout';
import { isAuthenticated } from './utils/auth';
import '@/App.css';

// Force webpack rebuild - v6

const ProtectedRoute = ({ children }) => {
  return isAuthenticated() ? children : <Navigate to="/admin/login" />;
};

const PublicLayout = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <CategoryNav />
      <MobileSearchBar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
};

// Layout for category page - no header/search on mobile (has bottom nav)
const CategoryPageLayout = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header only on desktop */}
      <div className="hidden lg:block">
        <Header />
        <CategoryNav />
      </div>
      <main className="flex-1">{children}</main>
      {/* Footer - always visible, but add padding for mobile bottom nav */}
      <div className="pb-20 lg:pb-0">
        <Footer />
      </div>
    </div>
  );
};

// Layout for brand/store detail page - no header/search on mobile (has bottom nav)
const BrandPageLayout = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header only on desktop */}
      <div className="hidden lg:block">
        <Header />
        <CategoryNav />
      </div>
      <main className="flex-1">{children}</main>
      {/* Footer - always visible, but add padding for mobile bottom nav */}
      <div className="pb-20 lg:pb-0">
        <Footer />
      </div>
    </div>
  );
};
        <Footer />
      </div>
    </div>
  );
};

function App() {
  return (
    <ThemeProvider>
      <HelmetProvider>
        <BrowserRouter>
          <SEOMetaTags />
          <Routes>
          <Route
            path="/"
            element={
              <PublicLayout>
                <HomePage />
              </PublicLayout>
            }
          />
          <Route
            path="/magaza/:slug"
            element={
              <BrandPageLayout>
                <BrandPage />
              </BrandPageLayout>
            }
          />
          <Route
            path="/magazalar"
            element={
              <PublicLayout>
                <StoresPage />
              </PublicLayout>
            }
          />
          <Route
            path="/kategori/:slug"
            element={
              <CategoryPageLayout>
                <CategoryPage />
              </CategoryPageLayout>
            }
          />
          <Route
            path="/kategoriler"
            element={
              <PublicLayout>
                <CategoriesPage />
              </PublicLayout>
            }
          />
          <Route
            path="/son-24-saat"
            element={
              <PublicLayout>
                <ExpiringSoonPage />
              </PublicLayout>
            }
          />
          <Route
            path="/iletisim"
            element={
              <PublicLayout>
                <ContactPage />
              </PublicLayout>
            }
          />
          <Route
            path="/arama"
            element={
              <PublicLayout>
                <SearchResultsPage />
              </PublicLayout>
            }
          />

          {/* ═══════════════════════════════════════════════════════════
              DEAL DETAIL PAGES (Kupon/İndirim/Çekiliş Detay)
              SEO-friendly URLs: /magaza/{brand}/kupon/{slug}-{id}
                                 /magaza/{brand}/indirim/{slug}-{id}
                                 /magaza/{brand}/cekilis/{slug}-{id}
          ═══════════════════════════════════════════════════════════ */}
          <Route
            path="/magaza/:brandSlug/kupon/:dealSlug"
            element={
              <PublicLayout>
                <DealDetailPage />
              </PublicLayout>
            }
          />
          <Route
            path="/magaza/:brandSlug/indirim/:dealSlug"
            element={
              <PublicLayout>
                <DealDetailPage />
              </PublicLayout>
            }
          />
          <Route
            path="/magaza/:brandSlug/cekilis/:dealSlug"
            element={
              <PublicLayout>
                <DealDetailPage />
              </PublicLayout>
            }
          />

          {/* ═══════════════════════════════════════════════════════════
              PROGRAMMATIC SEO ROUTES
              Tek template ile 1000+ sayfa
              Pattern: /nike-indirimleri, /spor-indirimleri etc.
          ═══════════════════════════════════════════════════════════ */}
          <Route
            path="/:slug"
            element={
              <PublicLayout>
                <ProgrammaticSeoPage />
              </PublicLayout>
            }
          />

          <Route path="/admin/login" element={<AdminLoginPage />} />
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/admin/dashboard" />} />
            <Route path="dashboard" element={<AdminDashboardPage />} />
            <Route path="categories" element={<AdminCategoriesPage />} />
            <Route path="brands" element={<AdminBrandsPage />} />
            <Route path="coupons" element={<AdminCouponsPage />} />
            <Route path="discounts" element={<AdminDiscountsPage />} />
            <Route path="giveaways" element={<AdminGiveawaysPage />} />
            <Route path="import" element={<AdminImportPage />} />
            <Route path="keywords" element={<AdminKeywordsPage />} />
            <Route path="hero-slides" element={<AdminHeroSlidesPage />} />
            <Route path="settings" element={<AdminSettingsPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </HelmetProvider>
    </ThemeProvider>
  );
}

export default App;