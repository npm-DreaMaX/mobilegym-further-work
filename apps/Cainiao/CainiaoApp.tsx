import React, { useCallback, useEffect, useRef } from 'react';
import {
  MemoryRouter, Routes, Route, Navigate, useLocation, useNavigate, Outlet,
  UNSAFE_NavigationContext,
} from 'react-router-dom';
import { useAppNavigate } from './navigation';
import { useCainiaoGestures } from './hooks/useCainiaoGestures';
import { useAppNavigationHandler } from '../../os/hooks/useAppNavigationHandler';
import { AppNavigatorRegistry } from '../../os/AppNavigatorRegistry';
import { useActivityContext } from '../../os/ActivityContext';
import { useAppStrings } from '../../os/useAppStrings';
import { strings } from './res/strings';
import { stringsEn } from './res/strings.en';
import { manifest } from './manifest';
import { themeToCssVars } from '../../os/utils/themeToCssVars';
import { IcTabHome, IcTabSend, IcTabMe } from './res/icons';

import { HomePage } from './pages/HomePage';
import { SearchPage } from './pages/SearchPage';
import { PackageDetailPage } from './pages/PackageDetailPage';
import { SendPage } from './pages/SendPage';
import { SendCreatePage } from './pages/SendCreatePage';
import { SendRecordsPage } from './pages/SendRecordsPage';
import { SendRecordDetailPage } from './pages/SendRecordDetailPage';
import { MePage } from './pages/MePage';
import { AddressBookPage } from './pages/AddressBookPage';
import { AddressEditPage } from './pages/AddressEditPage';
import { NotificationsPage } from './pages/NotificationsPage';
import { NotificationDetailPage } from './pages/NotificationDetailPage';
import { ProfileEditPage } from './pages/ProfileEditPage';
import { SettingsPage } from './pages/SettingsPage';

// ─── NavigationHandler ──────────────────────────────────────────
const CainiaoNavigationHandler: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { back } = useAppNavigate();
  const { activityId } = useActivityContext();
  const { navigator } = React.useContext(UNSAFE_NavigationContext);
  const historyIndexRef = useRef(0);

  useEffect(() => {
    const mem = navigator as any;
    if (typeof mem.index === 'number') historyIndexRef.current = mem.index;
  }, [location, navigator]);

  const handleBackPress = useCallback((): boolean => {
    const mem = navigator as any;
    const idx = typeof mem.index === 'number' ? mem.index : historyIndexRef.current;
    if (idx > 0) {
      back();
      return true;
    }
    return false;
  }, [back, navigator]);

  useEffect(() => {
    const navFn = (path: string, opts?: { replace?: boolean }) => navigate(path, { replace: opts?.replace ?? true });
    AppNavigatorRegistry.registerActivity(activityId, { navigate: navFn, back: handleBackPress }, 'cainiao');
    return () => {
      AppNavigatorRegistry.unregisterActivity(activityId);
    };
  }, [activityId, handleBackPress, navigate]);

  useAppNavigationHandler('cainiao', { onBack: handleBackPress });
  return null;
};

// ─── TabBar ─────────────────────────────────────────────────────
const TabBar: React.FC = () => {
  const { pathname } = useLocation();
  const { bindTap } = useCainiaoGestures();
  const s = useAppStrings(strings, stringsEn);

  const tabs = [
    { id: 'tab.home' as const, name: s.tab_home, Icon: IcTabHome, path: '/' },
    { id: 'tab.send' as const, name: s.tab_send, Icon: IcTabSend, path: '/send' },
    { id: 'tab.me' as const, name: s.tab_me, Icon: IcTabMe, path: '/me' },
  ];

  return (
    <div data-navigation-bar-foreground="dark" data-hide-on-keyboard>
      <div className="h-px bg-[#EEF0F2]" />
      <div className="bg-[#FFFFFF] flex justify-around items-center pt-[7px] pb-3">
        {tabs.map(tab => {
          const active = pathname === tab.path;
          const { Icon } = tab;
          return (
            <button
              key={tab.id}
              className="flex flex-col items-center justify-center flex-1"
              {...bindTap<HTMLButtonElement>(tab.id)}
            >
              <Icon size={22} className={active ? 'text-[#FF6A00]' : 'text-[#8A8F99]'} />
              <span className={`text-[12px] mt-[2px] ${active ? 'text-[#FF6A00]' : 'text-[#8A8F99]'}`}>
                {tab.name}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

// ─── Layout ─────────────────────────────────────────────────────
const Layout: React.FC = () => {
  const { pathname } = useLocation();
  const isMainTab = ['/', '/send', '/me'].includes(pathname);

  return (
    <div className="relative w-full h-full bg-app-bg flex flex-col overflow-hidden">
      <div className="flex-1 relative w-full overflow-hidden">
        {pathname === '/' && (
          <div data-scroll-container="main" data-scroll-direction="vertical" className="h-full overflow-y-auto no-scrollbar">
            <HomePage />
          </div>
        )}
        {pathname === '/send' && (
          <div data-scroll-container="main" data-scroll-direction="vertical" className="h-full overflow-y-auto no-scrollbar">
            <SendPage />
          </div>
        )}
        {pathname === '/me' && (
          <div data-scroll-container="main" data-scroll-direction="vertical" className="h-full overflow-y-auto no-scrollbar">
            <MePage />
          </div>
        )}
        {!isMainTab && (
          <div data-scroll-container="main" data-scroll-direction="vertical" className="h-full overflow-y-auto no-scrollbar">
            <Outlet />
          </div>
        )}
      </div>
      {isMainTab && <TabBar />}
    </div>
  );
};

// ─── App Root ───────────────────────────────────────────────────
const CainiaoApp: React.FC = () => {
  const cssVars = themeToCssVars(manifest.theme.colors);
  return (
    <div className="h-full w-full" style={cssVars as React.CSSProperties}>
      <div className="w-full h-full overflow-hidden">
        <MemoryRouter>
          <CainiaoNavigationHandler />
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={null} />
              <Route path="send" element={null} />
              <Route path="me" element={null} />
              <Route path="search" element={<SearchPage />} />
              <Route path="package/:id" element={<PackageDetailPage />} />
              <Route path="send/create" element={<SendCreatePage />} />
              <Route path="send/records" element={<SendRecordsPage />} />
              <Route path="send/record/:id" element={<SendRecordDetailPage />} />
              <Route path="address" element={<AddressBookPage />} />
              <Route path="address/edit" element={<AddressEditPage />} />
              <Route path="address/edit/:id" element={<AddressEditPage />} />
              <Route path="notifications" element={<NotificationsPage />} />
              <Route path="notification/:id" element={<NotificationDetailPage />} />
              <Route path="profile/edit" element={<ProfileEditPage />} />
              <Route path="settings" element={<SettingsPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        </MemoryRouter>
      </div>
    </div>
  );
};

export default CainiaoApp;
