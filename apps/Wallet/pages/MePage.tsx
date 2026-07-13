import React from 'react';
import { useWalletStore } from '../state';
import { useWalletGestures } from '../hooks/useWalletGestures';
import { useAppStrings } from '../../../os/useAppStrings';
import { strings } from '../res/strings';
import { stringsEn } from '../res/strings.en';
import { IcSettings } from '../res/icons';

export const MePage: React.FC = () => {
  const s = useAppStrings(strings, stringsEn);
  const { bindTap, go } = useWalletGestures();
  const user = useWalletStore((state) => state.user);
  const cards = useWalletStore((state) => state.cards);
  const coupons = useWalletStore((state) => state.coupons);

  return (
    <div className="h-full w-full flex flex-col bg-app-bg">
      <div className="pt-10 px-4 pb-4 bg-app-surface flex items-center justify-between">
        <h1 className="text-xl font-bold text-app-text-primary">{s.me}</h1>
        <button type="button" {...bindTap<HTMLButtonElement>('settings.open')}>
          <IcSettings size={24} className="text-app-text-primary" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4" data-scroll-container="main" data-scroll-direction="vertical">
        <div className="bg-white rounded-xl p-4 mb-4 flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-app-primary flex items-center justify-center text-white text-xl font-bold">
            {user.name.charAt(0)}
          </div>
          <div>
            <div className="text-lg font-bold text-app-text-primary">{user.name}</div>
            <div className="text-sm text-app-text-secondary">{user.phone}</div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-white rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-app-primary">{cards.length}</div>
            <div className="text-xs text-app-text-secondary">{s.home}</div>
          </div>
          <div className="bg-white rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-app-primary">{coupons.length}</div>
            <div className="text-xs text-app-text-secondary">{s.couponsTitle}</div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => go('tickets.open')}
          className="w-full bg-white rounded-xl p-4 text-left border border-app-border mb-3"
        >
          <div className="text-sm font-medium text-app-text-primary">{s.ticketsTitle}</div>
        </button>

        <button
          type="button"
          onClick={() => go('settings.open')}
          className="w-full bg-white rounded-xl p-4 text-left border border-app-border flex items-center justify-between"
        >
          <div className="text-sm font-medium text-app-text-primary">{s.settings}</div>
          <IcSettings size={20} className="text-app-text-secondary" />
        </button>
      </div>
    </div>
  );
};
