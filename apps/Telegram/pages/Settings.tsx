// apps/Telegram/pages/Settings.tsx
// Telegram 设置页面

import React from 'react';
import { useTelegramStore } from '../state';
import { useShallow } from 'zustand/react/shallow';
import { useTelegramGestures } from '../hooks/useTelegramGestures';
import { IcBellOff, IcChevronLeft, IcEdit, IcEye, IcLock, IcUsers } from '../res/icons';

export default function Settings() {
  const { back, bindBack } = useTelegramGestures();
  const { user, settings, updateSettings } = useTelegramStore(
    useShallow((s) => ({
      user: s.user,
      settings: s.settings,
      updateSettings: s.updateSettings,
    })),
  );

  return (
    <div className="flex flex-col h-full bg-white" data-page="settings">
      {/* Header */}
      <div className="flex items-center px-3 py-3 border-b border-gray-200">
        <button onClick={() => back()} className="p-1.5 mr-2 rounded-full hover:bg-gray-100" {...bindBack()}>
          <IcChevronLeft size={24} className="text-[#2AABEE]" />
        </button>
        <h1 className="text-[18px] font-semibold flex-1">Settings</h1>
      </div>

      <div className="flex-1 overflow-y-auto" data-scroll-container="main" data-scroll-direction="vertical">
        {/* User profile */}
        <div className="flex items-center px-4 py-5 border-b border-gray-100">
          <img src={user.avatar} alt={user.name} className="w-16 h-16 rounded-full mr-4 object-cover bg-gray-200" />
          <div>
            <h2 className="text-[18px] font-bold">{user.name}</h2>
            <p className="text-[14px] text-gray-500">{user.phone}</p>
            <p className="text-[13px] text-[#2AABEE]">{user.username}</p>
          </div>
        </div>

        {/* Settings items */}
        <div className="py-2">
          <button className="flex items-center w-full px-4 py-3.5 hover:bg-gray-50 active:bg-gray-100">
            <IcBellOff size={22} className="mr-3 text-gray-600" />
            <span className="text-[15px] flex-1 text-left">Notifications and Sounds</span>
            <span className="text-[13px] text-gray-400">
              {settings.notifications.messageAlert ? 'On' : 'Off'}
            </span>
          </button>

          <button className="flex items-center w-full px-4 py-3.5 hover:bg-gray-50 active:bg-gray-100">
            <IcLock size={22} className="mr-3 text-gray-600" />
            <span className="text-[15px] flex-1 text-left">Privacy and Security</span>
            <span className="text-[13px] text-gray-400">{settings.privacy.lastSeen}</span>
          </button>

          <button className="flex items-center w-full px-4 py-3.5 hover:bg-gray-50 active:bg-gray-100">
            <IcUsers size={22} className="mr-3 text-gray-600" />
            <span className="text-[15px] flex-1 text-left">Data and Storage</span>
          </button>

          <button className="flex items-center w-full px-4 py-3.5 hover:bg-gray-50 active:bg-gray-100">
            <IcEye size={22} className="mr-3 text-gray-600" />
            <span className="text-[15px] flex-1 text-left">Appearance</span>
            <span className="text-[13px] text-gray-400">{settings.appearance.themeId}</span>
          </button>

          <button className="flex items-center w-full px-4 py-3.5 hover:bg-gray-50 active:bg-gray-100">
            <IcEdit size={22} className="mr-3 text-gray-600" />
            <span className="text-[15px] flex-1 text-left">Edit Profile</span>
          </button>
        </div>

        {/* App info */}
        <div className="px-4 py-4 text-center text-[12px] text-gray-400 border-t border-gray-100">
          <p>Telegram for Android</p>
          <p>Version 10.10.0</p>
        </div>
      </div>
    </div>
  );
}
