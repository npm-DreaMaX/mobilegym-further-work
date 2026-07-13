import React, { useMemo } from 'react';
import { useWalletStore } from '../state';
import { useWalletGestures } from '../hooks/useWalletGestures';
import { useAppStrings } from '../../../os/useAppStrings';
import { strings } from '../res/strings';
import { stringsEn } from '../res/strings.en';
import { FILTER_OPTIONS } from '../constants';
import { IcSearch, IcAdd, IcSort, IcTicket } from '../res/icons';

export const HomePage: React.FC = () => {
  const s = useAppStrings(strings, stringsEn);
  const { bindTap, go, back } = useWalletGestures();
  const cards = useWalletStore((state) => state.cards);
  const coupons = useWalletStore((state) => state.coupons);
  const tickets = useWalletStore((state) => state.tickets);
  const searchQuery = useWalletStore((state) => state._temp.searchQuery);
  const filterType = useWalletStore((state) => state._temp.filterType);
  const updateTemp = useWalletStore((state) => state.updateTemp);
  const addSearchHistory = useWalletStore((state) => state.addSearchHistory);

  const filteredCards = useMemo(() => {
    let result = cards;
    if (filterType !== 'all') {
      result = cards.filter((c) => c.type === filterType);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          (c.issuer && c.issuer.toLowerCase().includes(q)) ||
          (c.memberNumber && c.memberNumber.toLowerCase().includes(q)) ||
          (c.city && c.city.toLowerCase().includes(q)),
      );
    }
    return result;
  }, [cards, filterType, searchQuery]);

  const handleSearch = (value: string) => {
    updateTemp({ searchQuery: value });
    if (value.trim()) addSearchHistory(value);
  };

  return (
    <div className="h-full w-full flex flex-col">
      <div className="pt-10 px-4 pb-3 bg-app-surface">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-xl font-bold text-app-text-primary">{s.appName}</h1>
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="p-2 rounded-full bg-app-bg"
              {...bindTap<HTMLButtonElement>('add.bank.open')}
            >
              <IcAdd size={20} className="text-app-primary" />
            </button>
            <button
              type="button"
              className="p-2 rounded-full bg-app-bg"
              onClick={() => go('sort.open')}
            >
              <IcSort size={20} className="text-app-primary" />
            </button>
          </div>
        </div>
        <div className="relative">
          <IcSearch size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder={s.search}
            className="w-full pl-9 pr-3 py-2 rounded-lg bg-app-bg text-sm outline-none"
          />
        </div>
      </div>

      <div className="flex gap-2 px-4 py-3 overflow-x-auto no-scrollbar bg-app-surface">
        {FILTER_OPTIONS.map((opt) => (
          <button
            key={opt.id}
            type="button"
            onClick={() => updateTemp({ filterType: opt.id as typeof filterType })}
            className={`px-3 py-1.5 rounded-full text-sm whitespace-nowrap ${
              filterType === opt.id
                ? 'bg-app-primary text-white'
                : 'bg-app-bg text-app-text-secondary'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3" data-scroll-container="main" data-scroll-direction="vertical">
        {filteredCards.length === 0 ? (
          <div className="text-center py-20 text-app-text-secondary">{s.emptyState}</div>
        ) : (
          filteredCards.map((card) => (
            <div
              key={card.id}
              className="bg-white rounded-xl p-4 shadow-sm border border-app-border cursor-pointer"
              onClick={() => go('card.detail.open', { id: card.id })}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm"
                    style={{
                      backgroundColor:
                        card.type === 'bank'
                          ? '#2B7DE9'
                          : card.type === 'transit'
                          ? '#34C759'
                          : '#FF9500',
                    }}
                  >
                    {card.type === 'bank' ? '卡' : card.type === 'transit' ? '交' : '会'}
                  </div>
                  <div>
                    <div className="font-medium text-app-text-primary">
                      {card.name}
                      {card.isDefault && (
                        <span className="ml-2 text-xs bg-app-primary text-white px-1.5 py-0.5 rounded">
                          {s.defaultCard}
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-app-text-secondary">
                      {card.issuer}
                      {card.last4 && ` ··· ${card.last4}`}
                      {card.city && ` · ${card.city}`}
                      {card.memberNumber && ` · ${card.memberNumber}`}
                    </div>
                  </div>
                </div>
                {card.frozen && (
                  <span className="text-xs px-2 py-0.5 rounded bg-gray-200 text-gray-600">
                    {s.freeze}
                  </span>
                )}
              </div>
              {(card.balance > 0 || (card.points != null && card.points > 0)) && (
                <div className="mt-3 flex gap-4 text-sm">
                  {card.balance > 0 && (
                    <div>
                      <span className="text-app-text-secondary">{s.balance}</span>
                      <span className="ml-1 font-medium">¥{card.balance.toFixed(2)}</span>
                    </div>
                  )}
                  {card.points != null && card.points > 0 && (
                    <div>
                      <span className="text-app-text-secondary">{s.points}</span>
                      <span className="ml-1 font-medium">{card.points}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))
        )}

        <div className="grid grid-cols-2 gap-3 pt-4">
          <button
            type="button"
            onClick={() => go('add.transit.open')}
            className="bg-white rounded-xl p-4 text-left border border-app-border"
          >
            <div className="text-sm font-medium text-app-text-primary">{s.addTransitCard}</div>
          </button>
          <button
            type="button"
            onClick={() => go('add.membership.open')}
            className="bg-white rounded-xl p-4 text-left border border-app-border"
          >
            <div className="text-sm font-medium text-app-text-primary">{s.addMembershipCard}</div>
          </button>
        </div>

        <button
          type="button"
          onClick={() => go('tickets.open')}
          className="w-full bg-white rounded-xl p-4 text-left border border-app-border flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <IcTicket size={20} className="text-app-primary" />
            <div className="text-sm font-medium text-app-text-primary">{s.ticketsTitle}</div>
          </div>
          {tickets.length > 0 && (
            <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full">
              {tickets.length}
            </span>
          )}
        </button>
      </div>
    </div>
  );
};
