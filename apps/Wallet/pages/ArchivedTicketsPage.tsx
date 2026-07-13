import React from 'react';
import { useWalletStore } from '../state';
import { useWalletGestures } from '../hooks/useWalletGestures';
import { useAppStrings } from '../../../os/useAppStrings';
import { strings } from '../res/strings';
import { stringsEn } from '../res/strings.en';
import { IcNavBack } from '../res/icons';

export const ArchivedTicketsPage: React.FC = () => {
  const s = useAppStrings(strings, stringsEn);
  const { bindBack } = useWalletGestures();
  const archivedTickets = useWalletStore((state) => state.archivedTickets);

  return (
    <div className="h-full w-full flex flex-col bg-app-bg">
      <div className="pt-10 px-4 pb-3 bg-app-surface flex items-center">
        <button type="button" className="p-2 -ml-2" {...bindBack<HTMLButtonElement>()}>
          <IcNavBack size={24} className="text-app-text-primary" />
        </button>
        <h1 className="text-lg font-bold text-app-text-primary ml-2">{s.archived}</h1>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-3" data-scroll-container="main" data-scroll-direction="vertical">
        {archivedTickets.length === 0 ? (
          <div className="text-center py-20 text-app-text-secondary">{s.emptyState}</div>
        ) : (
          archivedTickets.map((ticket) => (
            <div
              key={ticket.id}
              className="bg-white rounded-xl p-4 mb-3 border border-app-border opacity-70"
            >
              <div className="font-medium text-app-text-primary">{ticket.title}</div>
              <div className="text-sm text-app-text-secondary">
                {ticket.merchant} · {s.couponCode}: {ticket.code}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
