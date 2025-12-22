import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { ThemeProvider } from './context/ThemeContext';
import Header from './components/Header';
import Footer from './components/Footer';
import CategoryNav from './components/CategoryNav';
import CategorySlider from './components/CategorySlider';
import HomePage from './pages/HomePage';
import BrandPage from './pages/BrandPage';
import StoresPage from './pages/StoresPage';
import CategoryPage from './pages/CategoryPage';
import CategoriesPage from './pages/CategoriesPage';
import ExpiringSoonPage from './pages/ExpiringSoonPage';
import ContactPage from './pages/ContactPage';
import AdminLoginPage from './pages/admin/AdminLoginPage';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminBrandsPage from './pages/admin/AdminBrandsPage';
import AdminCouponsPage from './pages/admin/AdminCouponsPage';
import AdminDiscountsPage from './pages/admin/AdminDiscountsPage';
import AdminKeywordsPage from './pages/admin/AdminKeywordsPage';
import AdminHeroSlidesPage from './pages/admin/AdminHeroSlidesPage';
import AdminCategoriesPage from './pages/admin/AdminCategoriesPage';
import AdminLayout from './components/AdminLayout';
import { isAuthenticated } from './utils/auth';
import '@/App.css';

// Force webpack rebuild - v5

const ProtectedRoute = ({ children }) => {
  return isAuthenticated() ? children : <Navigate to="/admin/login" />;
};

const PublicLayout = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <CategoryNav />
      <CategorySlider />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
};

function App() {
  return (
    <ThemeProvider>
      <HelmetProvider>
        <BrowserRouter>
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
              <PublicLayout>
                <BrandPage />
              </PublicLayout>
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
              <PublicLayout>
                <CategoryPage />
              </PublicLayout>
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
            path="/iletisim"
            element={
              <PublicLayout>
                <ContactPage />
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
            <Route path="keywords" element={<AdminKeywordsPage />} />
            <Route path="hero-slides" element={<AdminHeroSlidesPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </HelmetProvider>
    </ThemeProvider>
  );
}

export default App;