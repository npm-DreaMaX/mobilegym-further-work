import React from 'react';
import { useWalletStore } from '../state';
import { useWalletGestures } from '../hooks/useWalletGestures';
import { useAppStrings } from '../../../os/useAppStrings';
import { strings } from '../res/strings';
import { stringsEn } from '../res/strings.en';
import { IcNavBack } from '../res/icons';

export const SettingsPage: React.FC = () => {
  const s = useAppStrings(strings, stringsEn);
  const { bindBack } = useWalletGestures();
  const settings = useWalletStore((state) => state.settings);
  const updateSettings = useWalletStore((state) => state.updateSettings);

  return (
    <div className="h-full w-full flex flex-col bg-app-bg">
      <div className="pt-10 px-4 pb-3 bg-app-surface flex items-center">
        <button type="button" className="p-2 -ml-2" {...bindBack<HTMLButtonElement>()}>
          <IcNavBack size={24} className="text-app-text-primary" />
        </button>
        <h1 className="text-lg font-bold text-app-text-primary ml-2">{s.settings}</h1>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4" data-scroll-container="main" data-scroll-direction="vertical">
        <div className="bg-white rounded-xl p-4 mb-4">
          <div className="flex items-center justify-between py-2">
            <span className="text-app-text-primary">{s.notifications}</span>
            <button
              type="button"
              onClick={() => updateSettings({ notifications: !settings.notifications })}
              className={`w-12 h-6 rounded-full transition-colors relative ${
                settings.notifications ? 'bg-app-primary' : 'bg-gray-300'
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                  settings.notifications ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4">
          <div className="text-sm text-app-text-secondary mb-2">{s.theme}</div>
          <div className="flex gap-2">
            {['light', 'dark'].map((theme) => (
              <button
                key={theme}
                type="button"
                onClick={() => updateSettings({ themeId: theme })}
                className={`flex-1 py-2 rounded-lg border ${
                  settings.themeId === theme
                    ? 'bg-app-primary text-white border-app-primary'
                    : 'bg-white text-app-text-primary border-app-border'
                }`}
              >
                {theme === 'light' ? '浅色' : '深色'}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
