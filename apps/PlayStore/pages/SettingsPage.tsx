import React from 'react';
import { usePlayStoreNavigate } from '../navigation';
import { usePlayStoreStore } from '../state';
import { IconRenderer } from '../res/icons';
import { GLOBAL_UPDATE_OPTIONS } from '../constants';
import type { GlobalUpdateSetting } from '../types';

const SettingsPage: React.FC = () => {
  const { back } = usePlayStoreNavigate();
  const settings = usePlayStoreStore(s => s.settings);
  const setGlobalUpdate = usePlayStoreStore(s => s.setGlobalUpdate);
  const autoUpdate = usePlayStoreStore(s => s.autoUpdate);
  const setAutoUpdate = usePlayStoreStore(s => s.setAutoUpdate);
  const installedApps = usePlayStoreStore(s => s.installedApps);

  const handleGlobalUpdateChange = (setting: GlobalUpdateSetting) => {
    setGlobalUpdate(setting);
  };

  const installedAppIds = Object.keys(installedApps);

  return (
    <div className="flex flex-col h-full bg-gray-50" data-status-bar-foreground="dark">
      {/* Header */}
      <div className="bg-white pt-10 pb-3 px-4 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <button
            className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100"
            onClick={() => back()}
            data-trigger="system.back"
          >
            <IconRenderer name="IcBack" size={20} />
          </button>
          <span className="text-lg font-semibold text-gray-900">设置</span>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto pb-20" data-scroll-container="main" data-scroll-direction="vertical">
        {/* Global Auto-update */}
        <div className="px-4 pt-4">
          <h4 className="text-xs font-semibold text-gray-500 uppercase px-1 mb-2">全局自动更新</h4>
          <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
            {GLOBAL_UPDATE_OPTIONS.map((opt, idx) => (
              <button
                key={opt.id}
                className={`w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 ${
                  idx < GLOBAL_UPDATE_OPTIONS.length - 1 ? 'border-b border-gray-50' : ''
                }`}
                onClick={() => handleGlobalUpdateChange(opt.id)}
                data-action="settings.globalUpdate.select.option"
              >
                <span className="text-sm text-gray-900">{opt.label}</span>
                {settings.globalUpdate === opt.id && (
                  <IconRenderer name="IcCheck" size={18} />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Per-app Auto-update */}
        {installedAppIds.length > 0 && (
          <div className="px-4 pt-6 pb-20">
            <h4 className="text-xs font-semibold text-gray-500 uppercase px-1 mb-2">应用自动更新</h4>
            <div className="bg-white rounded-xl border border-gray-100 divide-y divide-gray-50">
              {installedAppIds.map(appId => {
                const isEnabled = autoUpdate[appId] === true;
                return (
                  <div
                    key={appId}
                    className="flex items-center justify-between px-4 py-3"
                  >
                    <span className="text-sm text-gray-900">{appId}</span>
                    <button
                      className={`w-12 h-6 rounded-full transition-colors relative ${
                        isEnabled ? 'bg-app-primary' : 'bg-gray-300'
                      }`}
                      onClick={() => setAutoUpdate(appId, !isEnabled)}
                      data-action="appDetail.autoUpdate.toggle"
                    >
                      <div
                        className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform ${
                          isEnabled ? 'translate-x-6' : 'translate-x-0.5'
                        }`}
                      />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SettingsPage;
