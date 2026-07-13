import React from 'react';
import { dimensToCssVars, themeToCssVars } from '../../os/utils/themeToCssVars';
import { applySkinToThemeColors } from '../../os/SkinService';
import { useDarkMode } from '../../os/hooks/useDarkMode';
import { manifest } from './manifest';
import { MemoryRouter, Routes, Route, Navigate } from 'react-router-dom';
import { PlayStoreNavigationHandler } from './components/PlayStoreNavigationHandler';
import { TabBar } from './components/TabBar';
import { TAB_BAR_ITEMS } from './constants';
import { usePlayStoreNavigate } from './navigation';
import HomePage from './pages/HomePage';
import SearchPage from './pages/SearchPage';
import CategoriesPage from './pages/CategoriesPage';
import CategoryDetailPage from './pages/CategoryDetailPage';
import ChartsPage from './pages/ChartsPage';
import AppDetailPage from './pages/AppDetailPage';
import ReviewsPage from './pages/ReviewsPage';
import ReviewEditPage from './pages/ReviewEditPage';
import MyAppsPage from './pages/MyAppsPage';
import WishlistPage from './pages/WishlistPage';
import SettingsPage from './pages/SettingsPage';

const AppShell: React.FC = () => {
  const { go } = usePlayStoreNavigate();
  const { pathname } = window.location.hash
    ? { pathname: window.location.hash.replace('#', '') || '/' }
    : { pathname: '/' };

  // Determine active tab
  const getActiveTab = () => {
    const path = window.location.hash ? window.location.hash.replace('#', '') : '/';
    if (path === '/' || path.startsWith('/?') || path === '') return 'home';
    if (path.startsWith('/myapps')) return 'myapps';
    if (path.startsWith('/wishlist')) return 'wishlist';
    return 'home';
  };

  // Only show TabBar on main tab routes
  const showTabBar = () => {
    const path = window.location.hash ? window.location.hash.replace('#', '') : '/';
    const mainRoutes = ['/', '/myapps', '/wishlist'];
    return mainRoutes.some(r => path === r || path.startsWith(r + '?'));
  };

  const handleTabSelect = (tabId: string, route: string) => {
    go(`tab.${tabId}`);
  };

  return (
    <div className="flex flex-col h-full w-full">
      <div className="flex-1 overflow-hidden">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/categories" element={<CategoriesPage />} />
          <Route path="/categories/:categoryId" element={<CategoryDetailPage />} />
          <Route path="/charts" element={<ChartsPage />} />
          <Route path="/app/:appId" element={<AppDetailPage />} />
          <Route path="/app/:appId/reviews" element={<ReviewsPage />} />
          <Route path="/app/:appId/review/edit" element={<ReviewEditPage />} />
          <Route path="/myapps" element={<MyAppsPage />} />
          <Route path="/wishlist" element={<WishlistPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
      {showTabBar() && (
        <TabBar
          items={TAB_BAR_ITEMS}
          activeTab={getActiveTab()}
          onTabSelect={handleTabSelect}
        />
      )}
    </div>
  );
};

export const PlayStoreApp: React.FC = () => {
  const { isDark } = useDarkMode();
  const themeColors = isDark
    ? { ...manifest.theme.colors, ...(manifest.theme.colorsDark ?? {}) }
    : manifest.theme.colors;
  const cssVars = {
    ...themeToCssVars(applySkinToThemeColors(themeColors)),
  };
  return (
    <div className="h-full w-full" style={cssVars as React.CSSProperties}>
      <MemoryRouter initialEntries={['/']}>
        <PlayStoreNavigationHandler />
        <AppShell />
      </MemoryRouter>
    </div>
  );
};

export default PlayStoreApp;
