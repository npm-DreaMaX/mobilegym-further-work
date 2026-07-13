import React from 'react';
import { useWalletStore } from '../state';
import { useWalletGestures } from '../hooks/useWalletGestures';
import { useAppStrings } from '../../../os/useAppStrings';
import { strings } from '../res/strings';
import { stringsEn } from '../res/strings.en';
import { IcNavBack } from '../res/icons';

export const TicketsPage: React.FC = () => {
  const s = useAppStrings(strings, stringsEn);
  const { bindBack, go } = useWalletGestures();
  const tickets = useWalletStore((state) => state.tickets);
  const archivedTickets = useWalletStore((state) => state.archivedTickets);
  const archiveTicket = useWalletStore((state) => state.archiveTicket);

  return (
    <div className="h-full w-full flex flex-col bg-app-bg">
      <div className="pt-10 px-4 pb-3 bg-app-surface flex items-center justify-between">
        <button type="button" className="p-2 -ml-2" {...bindBack<HTMLButtonElement>()}>
          <IcNavBack size={24} className="text-app-text-primary" />
        </button>
        <h1 className="text-lg font-bold text-app-text-primary">{s.ticketsTitle}</h1>
        <button
          type="button"
          onClick={() => go('archived.open')}
          className="text-sm text-app-primary"
        >
          {s.archived}({archivedTickets.length})
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-3" data-scroll-container="main" data-scroll-direction="vertical">
        {tickets.length === 0 ? (
          <div className="text-center py-20 text-app-text-secondary">{s.emptyState}</div>
        ) : (
          tickets.map((ticket) => (
            <div
              key={ticket.id}
              className="bg-white rounded-xl p-4 mb-3 border border-app-border"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="font-medium text-app-text-primary">{ticket.title}</div>
              </div>
              <div className="text-sm text-app-text-secondary mb-3">
                {ticket.merchant} · {s.couponCode}: {ticket.code}
              </div>
              <button
                type="button"
                onClick={() => archiveTicket(ticket.id)}
                className="w-full py-2 rounded-lg bg-app-primary text-white text-sm"
              >
                {s.archive}
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
