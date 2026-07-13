import React, { useState } from 'react';
import { useWalletStore } from '../state';
import { useWalletGestures } from '../hooks/useWalletGestures';
import { useAppStrings } from '../../../os/useAppStrings';
import { strings } from '../res/strings';
import { stringsEn } from '../res/strings.en';
import { IcNavBack, IcCheck } from '../res/icons';

export const SortCardsPage: React.FC = () => {
  const s = useAppStrings(strings, stringsEn);
  const { bindBack, back } = useWalletGestures();
  const cards = useWalletStore((state) => state.cards);
  const reorderCards = useWalletStore((state) => state.reorderCards);
  const [orderedIds, setOrderedIds] = useState<string[]>(cards.map((c) => c.id));

  const moveUp = (index: number) => {
    if (index <= 0) return;
    const newIds = [...orderedIds];
    [newIds[index - 1], newIds[index]] = [newIds[index], newIds[index - 1]];
    setOrderedIds(newIds);
  };

  const moveDown = (index: number) => {
    if (index >= orderedIds.length - 1) return;
    const newIds = [...orderedIds];
    [newIds[index], newIds[index + 1]] = [newIds[index + 1], newIds[index]];
    setOrderedIds(newIds);
  };

  const handleSave = () => {
    reorderCards(orderedIds);
    back();
  };

  const orderedCards = orderedIds
    .map((id) => cards.find((c) => c.id === id))
    .filter(Boolean);

  return (
    <div className="h-full w-full flex flex-col bg-app-bg">
      <div className="pt-10 px-4 pb-3 bg-app-surface flex items-center justify-between">
        <button type="button" className="p-2 -ml-2" {...bindBack<HTMLButtonElement>()}>
          <IcNavBack size={24} className="text-app-text-primary" />
        </button>
        <h1 className="text-lg font-bold text-app-text-primary">{s.sort}</h1>
        <button type="button" onClick={handleSave} className="text-app-primary font-medium">
          {s.save}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4" data-scroll-container="main" data-scroll-direction="vertical">
        {orderedCards.map((card, index) =>
          card ? (
            <div
              key={card.id}
              className="bg-white rounded-xl p-4 mb-3 flex items-center justify-between"
            >
              <div>
                <div className="font-medium text-app-text-primary">{card.name}</div>
                <div className="text-xs text-app-text-secondary">{card.issuer}</div>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => moveUp(index)}
                  disabled={index === 0}
                  className="px-3 py-1 rounded bg-app-bg text-app-text-primary disabled:opacity-30"
                >
                  ↑
                </button>
                <button
                  type="button"
                  onClick={() => moveDown(index)}
                  disabled={index === orderedCards.length - 1}
                  className="px-3 py-1 rounded bg-app-bg text-app-text-primary disabled:opacity-30"
                >
                  ↓
                </button>
              </div>
            </div>
          ) : null,
        )}
      </div>
    </div>
  );
};
