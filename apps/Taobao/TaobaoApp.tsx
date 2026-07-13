import React from 'react';
import { dimensToCssVars, themeToCssVars } from '../../os/utils/themeToCssVars';
import { useDarkMode } from '../../os/hooks/useDarkMode';
import { manifest } from './manifest';
import { MemoryRouter, Routes, Route, Navigate } from 'react-router-dom';
import { TaobaoNavigationHandler } from './components/TaobaoNavigationHandler';
import HomePage from './pages/HomePage';
import SearchPage from './pages/SearchPage';
import CategoriesPage from './pages/CategoriesPage';
import ProductDetailPage from './pages/ProductDetailPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import PaymentPage from './pages/PaymentPage';
import OrdersPage from './pages/OrdersPage';
import OrderDetailPage from './pages/OrderDetailPage';
import LogisticsPage from './pages/LogisticsPage';
import RefundPage from './pages/RefundPage';
import ReviewPage from './pages/ReviewPage';
import MePage from './pages/MePage';
import FavoritesPage from './pages/FavoritesPage';
import CouponsPage from './pages/CouponsPage';
import AddressesPage from './pages/AddressesPage';
import AddressEditPage from './pages/AddressEditPage';
import SettingsPage from './pages/SettingsPage';
import ShopPage from './pages/ShopPage';

export const TaobaoApp: React.FC = () => {
  const { isDark } = useDarkMode();
  const themeColors = isDark
    ? { ...manifest.theme.colors, ...(manifest.theme.colorsDark ?? {}) }
    : manifest.theme.colors;
  const cssVars = {
    ...themeToCssVars(themeColors),
  };
  return (
    <div className="h-full w-full" style={cssVars as React.CSSProperties}>
      <MemoryRouter initialEntries={['/']}>
        <TaobaoNavigationHandler />
        <div className="h-full w-full">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/categories" element={<CategoriesPage />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/item/:id" element={<ProductDetailPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/payment/:orderId" element={<PaymentPage />} />
            <Route path="/orders" element={<OrdersPage />} />
            <Route path="/order/:id" element={<OrderDetailPage />} />
            <Route path="/logistics/:orderId" element={<LogisticsPage />} />
            <Route path="/refund/:orderId/:itemId" element={<RefundPage />} />
            <Route path="/review/:orderId/:itemId" element={<ReviewPage />} />
            <Route path="/me" element={<MePage />} />
            <Route path="/favorites" element={<FavoritesPage />} />
            <Route path="/coupons" element={<CouponsPage />} />
            <Route path="/addresses" element={<AddressesPage />} />
            <Route path="/address/edit" element={<AddressEditPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/shop/:id" element={<ShopPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </MemoryRouter>
    </div>
  );
};

export default TaobaoApp;
