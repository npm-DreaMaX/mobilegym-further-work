import React from 'react';
import { useBaicizhanStore } from '../state';
import { useBaicizhanGestures } from '../navigation';
import type { BaicizhanSettings } from '../types';

const SettingsPage: React.FC = () => {
  const settings = useBaicizhanStore(s => s.settings);
  const updateSettings = useBaicizhanStore(s => s.updateSettings);

  const { bindTap, bindBack } = useBaicizhanGestures();

  const handleThemeToggle = () => {
    updateSettings({ themeId: settings.themeId === 'light' ? 'dark' : 'light' });
  };

  const handleFontSize = (size: BaicizhanSettings['fontSize']) => {
    updateSettings({ fontSize: size });
  };

  const handleAutoPlayToggle = () => {
    updateSettings({ autoPlayPronunciation: !settings.autoPlayPronunciation });
  };

  const fontSizes: { label: string; value: BaicizhanSettings['fontSize'] }[] = [
    { label: '小', value: 'small' },
    { label: '中', value: 'medium' },
    { label: '大', value: 'large' },
  ];

  return (
    <div className="pt-10 min-h-full bg-gray-50" data-status-bar-foreground="dark">
      {/* Top Bar */}
      <div className="flex items-center px-4 py-3 bg-white border-b border-gray-100">
        <button {...bindBack()} className="p-1 mr-3" aria-label="返回">
          <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-lg font-semibold text-gray-900">设置</h1>
      </div>

      <div className="p-4 space-y-4">
        {/* Theme Toggle */}
        <div className="bg-white rounded-xl p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">主题</h3>
          <button
            onClick={handleThemeToggle}
            className="w-full flex items-center justify-between py-2"
            data-action="settings.theme.toggle"
            data-action-type="tap"
          >
            <span className="text-sm text-gray-600">深色模式</span>
            <div className={`w-12 h-6 rounded-full p-0.5 transition-colors ${
              settings.themeId === 'dark' ? 'bg-orange-500' : 'bg-gray-200'
            }`}>
              <div className={`w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${
                settings.themeId === 'dark' ? 'translate-x-6' : 'translate-x-0'
              }`} />
            </div>
          </button>
        </div>

        {/* Font Size */}
        <div className="bg-white rounded-xl p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">字体大小</h3>
          <div className="flex gap-3">
            {fontSizes.map(item => (
              <button
                key={item.value}
                onClick={() => handleFontSize(item.value)}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                  settings.fontSize === item.value
                    ? 'bg-orange-500 text-white'
                    : 'bg-gray-100 text-gray-600 active:bg-gray-200'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* Auto-play Pronunciation */}
        <div className="bg-white rounded-xl p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">发音</h3>
          <button
            onClick={handleAutoPlayToggle}
            className="w-full flex items-center justify-between py-2"
          >
            <span className="text-sm text-gray-600">自动播放发音</span>
            <div className={`w-12 h-6 rounded-full p-0.5 transition-colors ${
              settings.autoPlayPronunciation ? 'bg-orange-500' : 'bg-gray-200'
            }`}>
              <div className={`w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${
                settings.autoPlayPronunciation ? 'translate-x-6' : 'translate-x-0'
              }`} />
            </div>
          </button>
        </div>

        {/* Reminder Settings Link */}
        <div className="bg-white rounded-xl p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">通知</h3>
          <button
            {...bindTap('settings.reminder.open')}
            className="w-full flex items-center justify-between py-2"
          >
            <span className="text-sm text-gray-600">学习提醒</span>
            <svg className="w-4 h-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
