import React, { useCallback, useEffect, useRef } from 'react';
import {
  MemoryRouter, Routes, Route, Navigate, useLocation, useNavigate, Outlet,
  UNSAFE_NavigationContext,
} from 'react-router-dom';
import { useAppNavigate } from './navigation';
import { useChinaMobileGestures } from './hooks/useChinaMobileGestures';
import { useAppNavigationHandler } from '../../os/hooks/useAppNavigationHandler';
import { AppNavigatorRegistry } from '../../os/AppNavigatorRegistry';
import { useActivityContext } from '../../os/ActivityContext';
import { useAppStrings } from '../../os/useAppStrings';
import { strings } from './res/strings';
import { stringsEn } from './res/strings.en';
import { manifest } from './manifest';
import { themeToCssVars } from '../../os/utils/themeToCssVars';
import { IcTabHome, IcTabMall, IcTabMe } from './res/icons';

import { HomePage } from './pages/HomePage';
import { MallPage } from './pages/MallPage';
import { MePage } from './pages/MePage';
import { BalancePage } from './pages/BalancePage';
import { DataUsagePage } from './pages/DataUsagePage';
import { VoiceUsagePage } from './pages/VoiceUsagePage';
import { PlanDetailPage } from './pages/PlanDetailPage';
import { PlanChangePage } from './pages/PlanChangePage';
import { BillPage } from './pages/BillPage';
import { BillDetailPage } from './pages/BillDetailPage';
import { RechargePage } from './pages/RechargePage';
import { SubscribedServicesPage } from './pages/SubscribedServicesPage';
import { RoamingPage } from './pages/RoamingPage';
import { AutopayPage } from './pages/AutopayPage';
import { FamilyPage } from './pages/FamilyPage';
import { ServiceSearchPage } from './pages/ServiceSearchPage';
import { ProfilePage } from './pages/ProfilePage';
import { EmailEditPage } from './pages/EmailEditPage';
import { OrdersPage } from './pages/OrdersPage';
import { SettingsPage } from './pages/SettingsPage';

// ─── NavigationHandler ──────────────────────────────────────────
const ChinaMobileNavigationHandler: React.FC = () => {
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
    AppNavigatorRegistry.registerActivity(activityId, { navigate: navFn, back: handleBackPress }, 'chinamobile');
    return () => {
      AppNavigatorRegistry.unregisterActivity(activityId);
    };
  }, [activityId, handleBackPress, navigate]);

  useAppNavigationHandler('chinamobile', { onBack: handleBackPress });
  return null;
};

// ─── TabBar ─────────────────────────────────────────────────────
const TabBar: React.FC = () => {
  const { pathname } = useLocation();
  const { bindTap } = useChinaMobileGestures();
  const s = useAppStrings(strings, stringsEn);

  const tabs = [
    { id: 'tab.home' as const, name: s.tab_home, Icon: IcTabHome, path: '/' },
    { id: 'tab.mall' as const, name: s.tab_mall, Icon: IcTabMall, path: '/mall' },
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
              <Icon size={22} className={active ? 'text-[#0066B3]' : 'text-[#8A8F99]'} />
              <span className={`text-[12px] mt-[2px] ${active ? 'text-[#0066B3]' : 'text-[#8A8F99]'}`}>
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
  const isMainTab = ['/', '/mall', '/me'].includes(pathname);

  return (
    <div className="relative w-full h-full bg-app-bg flex flex-col overflow-hidden">
      <div className="flex-1 relative w-full overflow-hidden">
        {pathname === '/' && (
          <div data-scroll-container="main" data-scroll-direction="vertical" className="h-full overflow-y-auto no-scrollbar">
            <HomePage />
          </div>
        )}
        {pathname === '/mall' && (
          <div data-scroll-container="main" data-scroll-direction="vertical" className="h-full overflow-y-auto no-scrollbar">
            <MallPage />
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
const ChinaMobileApp: React.FC = () => {
  const cssVars = themeToCssVars(manifest.theme.colors);
  return (
    <div className="h-full w-full" style={cssVars as React.CSSProperties}>
      <div className="w-full h-full overflow-hidden">
        <MemoryRouter>
          <ChinaMobileNavigationHandler />
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={null} />
              <Route path="mall" element={null} />
              <Route path="me" element={null} />
              <Route path="balance" element={<BalancePage />} />
              <Route path="data" element={<DataUsagePage />} />
              <Route path="voice" element={<VoiceUsagePage />} />
              <Route path="plan" element={<PlanDetailPage />} />
              <Route path="plan/change" element={<PlanChangePage />} />
              <Route path="bill" element={<BillPage />} />
              <Route path="bill/detail/:id" element={<BillDetailPage />} />
              <Route path="recharge" element={<RechargePage />} />
              <Route path="services" element={<SubscribedServicesPage />} />
              <Route path="roaming" element={<RoamingPage />} />
              <Route path="autopay" element={<AutopayPage />} />
              <Route path="family" element={<FamilyPage />} />
              <Route path="search" element={<ServiceSearchPage />} />
              <Route path="profile" element={<ProfilePage />} />
              <Route path="profile/email" element={<EmailEditPage />} />
              <Route path="orders" element={<OrdersPage />} />
              <Route path="settings" element={<SettingsPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        </MemoryRouter>
      </div>
    </div>
  );
};

export default ChinaMobileApp;
