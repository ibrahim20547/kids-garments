import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation, Navigate } from 'react-router-dom';

// Context Providers
import { ToastProvider } from './context/ToastContext';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';

// API
import { getAdminToken } from './services/api';

// Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import CartDrawer from './components/CartDrawer';
import WhatsAppButton from './components/WhatsAppButton';

// Customer Pages
import HomePage from './pages/HomePage';
import ShopPage from './pages/ShopPage';
import BoysPage from './pages/BoysPage';
import GirlsPage from './pages/GirlsPage';
import BabyPage from './pages/BabyPage';
import NewArrivalsPage from './pages/NewArrivalsPage';
import SalePage from './pages/SalePage';
import ProductDetailsPage from './pages/ProductDetailsPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import OrderConfirmationPage from './pages/OrderConfirmationPage';
import OrderTrackingPage from './pages/OrderTrackingPage';
import MyAccountPage from './pages/MyAccountPage';
import WishlistPage from './pages/WishlistPage';
import AboutUsPage from './pages/AboutUsPage';
import ContactUsPage from './pages/ContactUsPage';
import AuthPage from './pages/AuthPage';
import NotFoundPage from './pages/NotFoundPage';

// Admin Pages & Layout
import AdminLoginPage from './pages/admin/AdminLoginPage';
import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminProductsPage from './pages/admin/AdminProductsPage';
import AdminCategoriesPage from './pages/admin/AdminCategoriesPage';
import AdminAttributesPage from './pages/admin/AdminAttributesPage';
import AdminInventoryPage from './pages/admin/AdminInventoryPage';
import AdminOrdersPage from './pages/admin/AdminOrdersPage';
import AdminCustomersPage from './pages/admin/AdminCustomersPage';
import AdminCouponsPage from './pages/admin/AdminCouponsPage';
import AdminReviewsPage from './pages/admin/AdminReviewsPage';
import AdminReturnsPage from './pages/admin/AdminReturnsPage';
import AdminContentPage from './pages/admin/AdminContentPage';

// Scroll to top on navigation change
function ScrollToTop() {
  const { pathname, search } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname, search]);
  return null;
}

// Layout wrapper for customer storefront pages
function StorefrontLayout({ children }) {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />
      <main style={{ flex: 1 }}>
        {children}
      </main>
      <Footer />
      <CartDrawer />
      <WhatsAppButton />
    </div>
  );
}

// Admin Entry Router Gate
function AdminEntry() {
  const token = getAdminToken();
  if (token) {
    return <Navigate to="/admin/dashboard" replace />;
  }
  return <AdminLoginPage />;
}

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <WishlistProvider>
            <CartProvider>
              <ScrollToTop />
              <Routes>
                {/* Admin Entry Gate (Login if unauthenticated, redirect to dashboard if authenticated) */}
                <Route path="/admin" element={<AdminEntry />} />
                <Route path="/admin/login" element={<AdminEntry />} />

                {/* Admin Protected Dashboard Routes */}
                <Route path="/admin" element={<AdminLayout />}>
                  <Route path="dashboard" element={<AdminDashboardPage />} />
                  <Route path="products" element={<AdminProductsPage />} />
                  <Route path="categories" element={<AdminCategoriesPage />} />
                  <Route path="attributes" element={<AdminAttributesPage />} />
                  <Route path="inventory" element={<AdminInventoryPage />} />
                  <Route path="orders" element={<AdminOrdersPage />} />
                  <Route path="customers" element={<AdminCustomersPage />} />
                  <Route path="coupons" element={<AdminCouponsPage />} />
                  <Route path="reviews" element={<AdminReviewsPage />} />
                  <Route path="returns" element={<AdminReturnsPage />} />
                  <Route path="content" element={<AdminContentPage />} />
                </Route>

                {/* Customer Storefront Routes */}
                <Route
                  path="/*"
                  element={
                    <StorefrontLayout>
                      <Routes>
                        <Route path="/" element={<HomePage />} />
                        <Route path="/shop" element={<ShopPage />} />
                        <Route path="/boys" element={<BoysPage />} />
                        <Route path="/girls" element={<GirlsPage />} />
                        <Route path="/baby" element={<BabyPage />} />
                        <Route path="/new-arrivals" element={<NewArrivalsPage />} />
                        <Route path="/sale" element={<SalePage />} />
                        <Route path="/product/:idOrSlug" element={<ProductDetailsPage />} />
                        <Route path="/cart" element={<CartPage />} />
                        <Route path="/checkout" element={<CheckoutPage />} />
                        <Route path="/order-confirmed/:orderNumber" element={<OrderConfirmationPage />} />
                        <Route path="/track-order" element={<OrderTrackingPage />} />
                        <Route path="/account" element={<MyAccountPage />} />
                        <Route path="/wishlist" element={<WishlistPage />} />
                        <Route path="/about" element={<AboutUsPage />} />
                        <Route path="/contact" element={<ContactUsPage />} />
                        <Route path="/auth" element={<AuthPage />} />
                        <Route path="/login" element={<AuthPage />} />
                        <Route path="/register" element={<AuthPage />} />
                        <Route path="*" element={<NotFoundPage />} />
                      </Routes>
                    </StorefrontLayout>
                  }
                />
              </Routes>
            </CartProvider>
          </WishlistProvider>
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}
