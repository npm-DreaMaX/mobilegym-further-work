import React from 'react';
import { useTaobaoStore } from '../state';
import { useTaobaoGestures } from '../navigation';
import { useTaobaoStrings } from '../hooks/useTaobaoStrings';
import { IcNavBack, IcSun, IcMoon, IcBell, IcInfo } from '../res/icons';
import type { TaobaoSettings } from '../types';

const SettingsPage: React.FC = () => {
  const s = useTaobaoStrings();
  const { bindBack } = useTaobaoGestures();

  const settings = useTaobaoStore(st => st.settings) as TaobaoSettings;
  const updateSettings = useTaobaoStore(st => st.updateSettings);

  const handleThemeToggle = () => {
    updateSettings({
      theme: settings.theme === 'light' ? 'dark' : 'light',
    });
  };

  const handleNotificationToggle = () => {
    updateSettings({
      notification: !settings.notification,
    });
  };

  return (
    <div className="h-full w-full flex flex-col bg-gray-50" data-status-bar-foreground="dark">
      {/* Header */}
      <div className="bg-white px-4 pt-10 pb-3 flex items-center border-b border-gray-100">
        <button {...bindBack()} className="mr-3 p-1 -ml-1">
          <IcNavBack size={22} className="text-gray-800" />
        </button>
        <h1 className="text-lg font-bold text-gray-800">{s.settings_title}</h1>
      </div>

      <div data-scroll-container="main" data-scroll-direction="vertical" className="flex-1 overflow-y-auto">
        {/* Theme setting */}
        <div className="mt-3 bg-white">
          <div className="flex items-center justify-between px-4 py-4 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <IcSun size={20} className="text-gray-500" />
              <span className="text-sm text-gray-800">{s.settings_theme}</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                className={`px-4 py-1.5 text-xs rounded-full transition-colors ${
                  settings.theme === 'light'
                    ? 'bg-orange-500 text-white'
                    : 'bg-gray-100 text-gray-500'
                }`}
                onClick={() => settings.theme !== 'light' && updateSettings({ theme: 'light' })}
              >
                <span className="flex items-center gap-1">
                  <IcSun size={12} />
                  {s.settings_theme_light}
                </span>
              </button>
              <button
                className={`px-4 py-1.5 text-xs rounded-full transition-colors ${
                  settings.theme === 'dark'
                    ? 'bg-orange-500 text-white'
                    : 'bg-gray-100 text-gray-500'
                }`}
                onClick={() => settings.theme !== 'dark' && updateSettings({ theme: 'dark' })}
              >
                <span className="flex items-center gap-1">
                  <IcMoon size={12} />
                  {s.settings_theme_dark}
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Notification setting */}
        <div className="mt-1 bg-white">
          <div className="flex items-center justify-between px-4 py-4">
            <div className="flex items-center gap-3">
              <IcBell size={20} className="text-gray-500" />
              <span className="text-sm text-gray-800">{s.settings_notification}</span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={settings.notification}
                onChange={handleNotificationToggle}
              />
              <div className="w-10 h-5 bg-gray-200 rounded-full peer peer-checked:bg-orange-400 peer-checked:after:translate-x-5 after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all" />
            </label>
          </div>
        </div>

        {/* About section */}
        <div className="mt-3 bg-white">
          <div className="flex items-center gap-3 px-4 py-4">
            <IcInfo size={20} className="text-gray-500" />
            <div className="flex-1">
              <span className="text-sm text-gray-800">{s.settings_about}</span>
            </div>
          </div>
          <div className="px-4 pb-4">
            <div className="bg-gray-50 rounded-lg px-4 py-3">
              <p className="text-xs text-gray-500 leading-relaxed">
                Taobao Mobile v1.0.0
              </p>
              <p className="text-xs text-gray-400 leading-relaxed mt-1">
                This is a simulated Taobao mobile e-commerce application for GUI agent training and benchmarking.
              </p>
              <p className="text-xs text-gray-400 leading-relaxed mt-1">
                Built with React + Tailwind CSS. All data is simulated and for demonstration purposes only.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom spacer */}
        <div className="h-8" />
      </div>
    </div>
  );
};

export default SettingsPage;
