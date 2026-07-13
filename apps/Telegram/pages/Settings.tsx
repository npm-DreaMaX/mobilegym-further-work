// apps/Telegram/pages/Settings.tsx
// Telegram 设置页面

import React, { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTelegramStore } from '../state';
import { useShallow } from 'zustand/react/shallow';
import { IcBellOff, IcChevronLeft, IcLock, IcEye, IcDatabase, IcEdit, IcCheck, IcX } from '../res/icons';

export default function Settings() {
  const navigate = useNavigate();
  const { user, settings, updateSettings } = useTelegramStore(
    useShallow((s) => ({
      user: s.user,
      settings: s.settings,
      updateSettings: s.updateSettings,
    })),
  );

  // Local state for editing profile
  const [editingProfile, setEditingProfile] = useState(false);
  const [newName, setNewName] = useState(user.name);

  // Back to chat list (explicit)
  const handleBack = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    navigate('/', { replace: true });
  }, [navigate]);

  // Toggle handlers
  const handleToggleNotifications = useCallback(() => {
    updateSettings({
      notifications: {
        ...settings.notifications,
        messageAlert: !settings.notifications.messageAlert,
      },
    });
  }, [settings.notifications, updateSettings]);

  const handleToggleAppearance = useCallback(() => {
    updateSettings({
      appearance: {
        ...settings.appearance,
        themeId: settings.appearance.themeId === 'dark' ? 'light' : 'dark',
      },
    });
  }, [settings.appearance, updateSettings]);

  const handleSaveName = useCallback(() => {
    if (newName.trim()) {
      // Direct state mutation for user name (since there's no updateUser action)
      useTelegramStore.setState((s) => ({
        user: { ...s.user, name: newName.trim() },
      }));
    }
    setEditingProfile(false);
  }, [newName]);

  return (
    <div className="flex flex-col h-full bg-white" data-page="settings" data-status-bar-foreground="dark">
      {/* Header */}
      <div className="flex items-center px-3 pt-10 pb-3 border-b border-gray-200 flex-shrink-0">
        <button
          onClick={handleBack}
          className="p-2.5 mr-2 rounded-full hover:bg-gray-100 active:bg-gray-200"
          aria-label="Back to chats"
        >
          <IcChevronLeft size={24} className="text-[#2AABEE]" />
        </button>
        <h1 className="text-[18px] font-semibold flex-1">Settings</h1>
      </div>

      <div className="flex-1 overflow-y-auto" data-scroll-container="main" data-scroll-direction="vertical">
        {/* User profile */}
        <div className="flex items-center px-4 py-5 border-b border-gray-100">
          <img
            src={user.avatar}
            alt={user.name}
            className="w-16 h-16 rounded-full mr-4 object-cover bg-gray-200 flex-shrink-0"
          />
          <div className="flex-1 min-w-0">
            {editingProfile ? (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="text-[18px] font-bold outline-none border-b border-[#2AABEE] px-1 py-0.5 bg-transparent flex-1"
                  autoFocus
                  data-keep-keyboard="true"
                />
                <button onClick={handleSaveName} className="text-[#2AABEE] p-1">
                  <IcCheck size={18} />
                </button>
                <button onClick={() => setEditingProfile(false)} className="text-gray-400 p-1">
                  <IcX size={18} />
                </button>
              </div>
            ) : (
              <>
                <h2 className="text-[18px] font-bold">{user.name}</h2>
                <p className="text-[14px] text-gray-500">{user.phone}</p>
                <p className="text-[13px] text-[#2AABEE]">{user.username}</p>
              </>
            )}
          </div>
        </div>

        {/* Settings items — all with real onClick */}
        <div className="py-2">
          {/* Notifications — toggle */}
          <button
            className="flex items-center w-full px-4 py-3.5 hover:bg-gray-50 active:bg-gray-100"
            onClick={handleToggleNotifications}
          >
            <IcBellOff size={22} className="mr-3 text-gray-600" />
            <span className="text-[15px] flex-1 text-left">Notifications and Sounds</span>
            <span className="text-[13px] text-gray-400">
              {settings.notifications.messageAlert ? 'On' : 'Off'}
            </span>
            <span
              className={`ml-2 w-11 h-6 rounded-full flex items-center px-0.5 transition-colors ${
                settings.notifications.messageAlert ? 'bg-[#2AABEE]' : 'bg-gray-300'
              }`}
            >
              <span
                className={`w-5 h-5 rounded-full bg-white shadow transition-transform ${
                  settings.notifications.messageAlert ? 'translate-x-5' : ''
                }`}
              />
            </span>
          </button>

          {/* Privacy — shows current setting */}
          <button
            className="flex items-center w-full px-4 py-3.5 hover:bg-gray-50 active:bg-gray-100"
            onClick={() => {
              // Cycle through privacy options
              const next = settings.privacy.lastSeen === 'everyone'
                ? 'contacts'
                : settings.privacy.lastSeen === 'contacts'
                ? 'nobody'
                : 'everyone';
              updateSettings({ privacy: { ...settings.privacy, lastSeen: next } });
            }}
          >
            <IcLock size={22} className="mr-3 text-gray-600" />
            <span className="text-[15px] flex-1 text-left">Privacy and Security</span>
            <span className="text-[13px] text-gray-400">{settings.privacy.lastSeen}</span>
          </button>

          {/* Data and Storage — toggle auto-download */}
          <button
            className="flex items-center w-full px-4 py-3.5 hover:bg-gray-50 active:bg-gray-100"
            onClick={() => {
              updateSettings({
                data: {
                  ...settings.data,
                  autoDownloadPhotos: !settings.data.autoDownloadPhotos,
                },
              });
            }}
          >
            <IcDatabase size={22} className="mr-3 text-gray-600" />
            <span className="text-[15px] flex-1 text-left">Data and Storage</span>
            <span className="text-[13px] text-gray-400">
              {settings.data.autoDownloadPhotos ? 'Auto-download' : 'Manual'}
            </span>
          </button>

          {/* Appearance — toggle theme */}
          <button
            className="flex items-center w-full px-4 py-3.5 hover:bg-gray-50 active:bg-gray-100"
            onClick={handleToggleAppearance}
          >
            <IcEye size={22} className="mr-3 text-gray-600" />
            <span className="text-[15px] flex-1 text-left">Appearance</span>
            <span className="text-[13px] text-gray-400">{settings.appearance.themeId}</span>
            <span
              className={`ml-2 w-11 h-6 rounded-full flex items-center px-0.5 transition-colors ${
                settings.appearance.themeId === 'dark' ? 'bg-[#2AABEE]' : 'bg-gray-300'
              }`}
            >
              <span
                className={`w-5 h-5 rounded-full bg-white shadow transition-transform ${
                  settings.appearance.themeId === 'dark' ? 'translate-x-5' : ''
                }`}
              />
            </span>
          </button>

          {/* Edit Profile */}
          <button
            className="flex items-center w-full px-4 py-3.5 hover:bg-gray-50 active:bg-gray-100"
            onClick={() => {
              setNewName(user.name);
              setEditingProfile(true);
            }}
          >
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
