import React from 'react';
import { MemoryRouter, Routes, Route, useLocation, Outlet } from 'react-router-dom';
import { useAppNavigationHandler } from '../../os/hooks/useAppNavigationHandler';
import { useDarkMode } from '../../os/hooks/useDarkMode';
import { manifest } from './manifest';
import { useWalletStore } from './state';
import { useAppStrings } from '../../os/useAppStrings';
import { strings } from './res/strings';
import { stringsEn } from './res/strings.en';
import { useWalletGestures } from './hooks/useWalletGestures';
import { dimensToCssVars, themeToCssVars } from '../../os/utils/themeToCssVars';
import { applySkinToThemeColors } from '../../os/SkinService';

import { HomePage } from './pages/HomePage';
import { CardDetailPage } from './pages/CardDetailPage';
import { CodePage } from './pages/CodePage';
import { AddBankCardPage } from './pages/AddBankCardPage';
import { AddTransitCardPage } from './pages/AddTransitCardPage';
import { AddMembershipCardPage } from './pages/AddMembershipCardPage';
import { AddCouponPage } from './pages/AddCouponPage';
import { SortCardsPage } from './pages/SortCardsPage';
import { CouponsPage } from './pages/CouponsPage';
import { TicketsPage } from './pages/TicketsPage';
import { ArchivedTicketsPage } from './pages/ArchivedTicketsPage';
import { MePage } from './pages/MePage';
import { SettingsPage } from './pages/SettingsPage';

import { IcWallet, IcCoupon, IcMe } from './res/icons';

const TAB_PATH_TO_ID: Record<string, string> = { '/': 'home', '/coupons': 'coupons', '/me': 'me' };

const TabBar: React.FC = () => {
  const { pathname } = useLocation();
  const activeTab = TAB_PATH_TO_ID[pathname] ?? '';
  const { bindTap } = useWalletGestures();
  const s = useAppStrings(strings, stringsEn);

  const tabs = [
    { id: 'home', name: s.home, icon: IcWallet, path: '/' },
    { id: 'coupons', name: s.coupons, icon: IcCoupon, path: '/coupons' },
    { id: 'me', name: s.me, icon: IcMe, path: '/me' },
  ];

  return (
    <div
      data-hide-on-keyboard
      className="flex-shrink-0 bg-white border-t border-app-border flex justify-around items-center py-2 pb-safe"
    >
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        const tapProps =
          tab.id === 'home'
            ? bindTap<HTMLButtonElement>('tab.home')
            : tab.id === 'coupons'
            ? bindTap<HTMLButtonElement>('tab.coupons')
            : bindTap<HTMLButtonElement>('tab.me');
        return (
          <button
            key={tab.id}
            className="flex flex-col items-center justify-center py-1 px-2 relative"
            {...tapProps}
          >
            <Icon
              size={24}
              className={`mb-1 ${isActive ? 'text-app-primary' : 'text-gray-500'}`}
              strokeWidth={isActive ? 2.5 : 2}
            />
            <span
              className={`text-[10px] ${
                isActive ? 'text-app-primary font-medium' : 'text-gray-500'
              }`}
            >
              {tab.name}
            </span>
          </button>
        );
      })}
    </div>
  );
};

const Layout: React.FC = () => {
  const { pathname } = useLocation();
  const isMainTab = ['/', '/coupons', '/me'].includes(pathname);
  const showTabBar = isMainTab;

  return (
    <div className="h-full w-full flex flex-col">
      <div className="flex-1 overflow-y-auto overflow-x-hidden no-scrollbar" data-scroll-container="main" data-scroll-direction="vertical">
        <Outlet />
      </div>
      {showTabBar && <TabBar />}
    </div>
  );
};

const WalletNavigationHandler: React.FC = () => {
  useAppNavigationHandler('wallet', { onBack: () => false });
  return null;
};

const WalletAppContent: React.FC = () => {
  return (
    <MemoryRouter>
      <WalletNavigationHandler />
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="coupons" element={<CouponsPage />} />
          <Route path="me" element={<MePage />} />
        </Route>
        <Route path="/card/:id" element={<CardDetailPage />} />
        <Route path="/card/:id/code" element={<CodePage />} />
        <Route path="/add/bank" element={<AddBankCardPage />} />
        <Route path="/add/transit" element={<AddTransitCardPage />} />
        <Route path="/add/membership" element={<AddMembershipCardPage />} />
        <Route path="/add/coupon" element={<AddCouponPage />} />
        <Route path="/sort" element={<SortCardsPage />} />
        <Route path="/tickets" element={<TicketsPage />} />
        <Route path="/archived" element={<ArchivedTicketsPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Routes>
    </MemoryRouter>
  );
};

export const WalletApp: React.FC = () => {
  const { isDark } = useDarkMode();
  const themeColors = isDark
    ? { ...manifest.theme.colors, ...(manifest.theme.colorsDark ?? {}) }
    : manifest.theme.colors;
  const cssVars = themeToCssVars(applySkinToThemeColors(themeColors));
  return (
    <div className="h-full w-full bg-app-bg" style={cssVars as React.CSSProperties}>
      <WalletAppContent />
    </div>
  );
};

export default WalletApp;
