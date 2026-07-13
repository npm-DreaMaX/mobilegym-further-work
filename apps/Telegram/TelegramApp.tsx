// apps/Telegram/TelegramApp.tsx
// Telegram App 入口组件

import React, { useMemo, useCallback, useEffect } from 'react';
import { MemoryRouter, Routes, Route, useLocation, useNavigate, Outlet } from 'react-router-dom';
import { useAppNavigationHandler } from '@/os/hooks/useAppNavigationHandler';
import { useAppNavigate } from './navigation';
import { useTelegramGestures } from './hooks/useTelegramGestures';
import { manifest } from './manifest';
import { IcMessageCircle, IcUsers, IcSettings } from './res/icons';

// Pages
import ChatList from './pages/ChatList';
import Contacts from './pages/Contacts';
import ChatDetail from './pages/ChatDetail';
import ChatInfo from './pages/ChatInfo';
import ChatSearch from './pages/ChatSearch';
import GlobalSearch from './pages/GlobalSearch';
import GroupCreate from './pages/GroupCreate';
import Settings from './pages/Settings';
import ArchivedChats from './pages/ArchivedChats';

// ── Bottom TabBar ──────────────────────────────────────────────────
function TabBar() {
  const location = useLocation();
  const path = location.pathname;
  const { go } = useAppNavigate();

  const tabs = [
    { id: 'tab.chats' as const, label: 'Chats', Icon: IcMessageCircle, matchPath: '/' },
    { id: 'tab.contacts' as const, label: 'Contacts', Icon: IcUsers, matchPath: '/contacts' },
    { id: 'tab.settings' as const, label: 'Settings', Icon: IcSettings, matchPath: '/settings' },
  ];

  return (
    <div data-navigation-bar-foreground="dark" data-hide-on-keyboard>
      <div className="h-px bg-gray-200" />
      <div className="bg-white flex justify-around items-center pt-[7px] pb-3">
        {tabs.map((tab) => {
          const active = path === tab.matchPath;
          const { Icon } = tab;
          return (
            <button
              key={tab.id}
              className="flex flex-col items-center justify-center flex-1 active:opacity-70"
              onClick={() => go(tab.id, {})}
            >
              <Icon size={22} className={active ? 'text-[#2AABEE]' : 'text-gray-400'} />
              <span className={`text-[11px] mt-[2px] ${active ? 'text-[#2AABEE] font-medium' : 'text-gray-400'}`}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ── Layout ─────────────────────────────────────────────────────────
function TelegramLayout() {
  const location = useLocation();
  const path = location.pathname;
  const { back: appBack } = useAppNavigate();

  // Only root page (ChatList) allows system back to exit
  const handleBackPress = useCallback((): boolean => {
    if (path !== '/') {
      // Navigate to parent based on current path
      if (path.startsWith('/chat/') && path.endsWith('/search')) {
        // ChatSearch → ChatDetail
        const chatId = path.split('/')[2];
        window.history.pushState(null, '', `/chat/${chatId}`);
      }
      appBack();
      return true;
    }
    // At root, allow system back to exit the app
    return false;
  }, [path, appBack]);

  useAppNavigationHandler(manifest.id, {
    onBack: handleBackPress,
  });

  const isMainTab = path === '/' || path === '/contacts' || path === '/settings';

  return (
    <div className="relative w-full h-full bg-white flex flex-col overflow-hidden" data-status-bar-foreground="dark">
      <div className="flex-1 relative w-full overflow-hidden">
        {path === '/' && <ChatList />}
        {path === '/contacts' && <Contacts />}
        {path === '/settings' && <Settings />}
        {!isMainTab && <Outlet />}
      </div>
      {isMainTab && <TabBar />}
    </div>
  );
}

// ── App Root ───────────────────────────────────────────────────────
export default function TelegramApp() {
  const themeColors = useMemo(
    () => ({
      '--app-primary': '#2AABEE',
      '--app-primary-dark': '#229ED9',
      '--app-background': '#ffffff',
      '--app-surface': '#ffffff',
      '--app-text-primary': '#000000',
      '--app-text-secondary': '#8e8e93',
      '--app-border': '#e5e5ea',
    }),
    [],
  );

  return (
    <div className="h-full w-full" style={themeColors as React.CSSProperties}>
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route path="/" element={<TelegramLayout />}>
            <Route index element={null} />
            <Route path="contacts" element={null} />
            <Route path="settings" element={null} />
            <Route path="search" element={<GlobalSearch />} />
            <Route path="chat/:chatId" element={<ChatDetail />} />
            <Route path="chat/:chatId/search" element={<ChatSearch />} />
            <Route path="chat/:chatId/info" element={<ChatInfo />} />
            <Route path="group/create" element={<GroupCreate />} />
            <Route path="archived" element={<ArchivedChats />} />
          </Route>
        </Routes>
      </MemoryRouter>
    </div>
  );
}
