// apps/Telegram/TelegramApp.tsx
// Telegram App 入口组件

import React, { useMemo } from 'react';
import { MemoryRouter, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { useAppNavigationHandler } from '@/os/hooks/useAppNavigationHandler';
import { useTelegramStore } from './state';
import { useShallow } from 'zustand/react/shallow';
import { useTelegramGestures } from './hooks/useTelegramGestures';

// Pages
import ChatList from './pages/ChatList';
import Contacts from './pages/Contacts';
import ChatDetail from './pages/ChatDetail';
import ChatInfo from './pages/ChatInfo';
import GroupCreate from './pages/GroupCreate';
import Settings from './pages/Settings';
import ArchivedChats from './pages/ArchivedChats';

// Icons
import { IcMessageCircle, IcUsers, IcSettings } from './res/icons';
import { manifest } from './manifest';

// ── Main Tab Layout ────────────────────────────────────────────────
function TelegramLayout() {
  const { back } = useTelegramGestures();
  useAppNavigationHandler(manifest.id, {
    onBack: () => back(),
  });

  const location = useLocation();
  const path = location.pathname;

  // Determine which tab is active
  const isChatList = path === '/';
  const isContacts = path === '/contacts';
  const isSettings = path === '/settings';
  const isSubPage = !isChatList && !isContacts && !isSettings;

  return (
    <div className="flex flex-col h-full bg-white" data-status-bar-foreground="dark">
      {/* Main tabs (always mounted, show/hide with CSS) */}
      <div className={`flex-1 flex flex-col ${isSubPage ? 'hidden' : ''}`}>
        <div className={`flex-1 flex flex-col ${isChatList ? '' : 'hidden'}`} style={{ display: isChatList ? 'flex' : 'none' }}>
          <ChatList />
        </div>
        <div className={`flex-1 flex flex-col ${isContacts ? '' : 'hidden'}`} style={{ display: isContacts ? 'flex' : 'none' }}>
          <Contacts />
        </div>
        <div className={`flex-1 flex flex-col ${isSettings ? '' : 'hidden'}`} style={{ display: isSettings ? 'flex' : 'none' }}>
          <Settings />
        </div>
      </div>

      {/* Sub-pages (exclusive) */}
      {isSubPage && (
        <div className="flex-1 flex flex-col">
          <Routes>
            <Route path="/chat/:chatId" element={<ChatDetail />} />
            <Route path="/chat/:chatId/info" element={<ChatInfo />} />
            <Route path="/group/create" element={<GroupCreate />} />
            <Route path="/archived" element={<ArchivedChats />} />
          </Routes>
        </div>
      )}
    </div>
  );
}

// ── App Component ──────────────────────────────────────────────────
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
    <div className="h-full w-full" style={themeColors}>
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route path="/*" element={<TelegramLayout />} />
        </Routes>
      </MemoryRouter>
    </div>
  );
}
