import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useWalletStore } from '../state';
import { useWalletGestures } from '../hooks/useWalletGestures';
import { useAppStrings } from '../../../os/useAppStrings';
import { strings } from '../res/strings';
import { stringsEn } from '../res/strings.en';
import { IcNavBack, IcQrCode, IcEdit, IcDelete, IcLock, IcUnlock, IcCheck } from '../res/icons';

export const CardDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const s = useAppStrings(strings, stringsEn);
  const { bindBack, go, back } = useWalletGestures();
  const cards = useWalletStore((state) => state.cards);
  const card = cards.find((c) => c.id === id);
  const setDefaultCard = useWalletStore((state) => state.setDefaultCard);
  const renameCard = useWalletStore((state) => state.renameCard);
  const freezeCard = useWalletStore((state) => state.freezeCard);
  const unfreezeCard = useWalletStore((state) => state.unfreezeCard);
  const deleteCard = useWalletStore((state) => state.deleteCard);
  const [isRenaming, setIsRenaming] = React.useState(false);
  const [newName, setNewName] = React.useState('');
  const [showDelete, setShowDelete] = useState(false);

  if (!card) {
    return (
      <div className="h-full w-full pt-10 px-4">
        <div className="text-center py-20 text-app-text-secondary">{s.noResults}</div>
      </div>
    );
  }

  const handleRename = () => {
    if (newName.trim()) {
      renameCard(card.id, newName.trim());
      setIsRenaming(false);
    }
  };

  const handleDelete = () => {
    deleteCard(card.id);
    setShowDelete(false);
    back();
  };

  return (
    <div className="h-full w-full flex flex-col bg-app-bg">
      <div className="pt-10 px-4 pb-3 bg-app-surface flex items-center justify-between">
        <button type="button" className="p-2 -ml-2" {...bindBack<HTMLButtonElement>()}>
          <IcNavBack size={24} className="text-app-text-primary" />
        </button>
        <h1 className="text-lg font-bold text-app-text-primary">{s.cardDetail}</h1>
        <div className="w-8" />
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4" data-scroll-container="main" data-scroll-direction="vertical">
        <div
          className="rounded-2xl p-6 text-white mb-4"
          style={{
            background:
              card.type === 'bank'
                ? 'linear-gradient(135deg, #2B7DE9, #1a5fc7)'
                : card.type === 'transit'
                ? 'linear-gradient(135deg, #34C759, #0e8f34)'
                : 'linear-gradient(135deg, #FF9500, #d67b00)',
          }}
        >
          <div className="text-2xl font-bold mb-4">{card.name}</div>
          <div className="text-white/80 text-sm mb-1">{card.issuer}</div>
          {card.last4 && <div className="text-white/90 text-lg tracking-widest">**** {card.last4}</div>}
          {card.memberNumber && <div className="text-white/90 text-lg">{card.memberNumber}</div>}
          {card.city && <div className="text-white/90 text-lg">{card.city}</div>}
          {card.frozen && <div className="mt-2 inline-block px-2 py-1 rounded bg-white/20 text-xs">{s.freeze}</div>}
        </div>

        <div className="bg-white rounded-xl p-4 mb-4">
          {card.balance > 0 && (
            <div className="flex justify-between py-2 border-b border-app-border">
              <span className="text-app-text-secondary">{s.balance}</span>
              <span className="font-medium">¥{card.balance.toFixed(2)}</span>
            </div>
          )}
          {card.points != null && card.points > 0 && (
            <div className="flex justify-between py-2 border-b border-app-border">
              <span className="text-app-text-secondary">{s.points}</span>
              <span className="font-medium">{card.points}</span>
            </div>
          )}
          {card.holder && (
            <div className="flex justify-between py-2">
              <span className="text-app-text-secondary">{s.cardHolder}</span>
              <span className="font-medium">{card.holder}</span>
            </div>
          )}
        </div>

        {isRenaming ? (
          <div className="bg-white rounded-xl p-4 mb-4">
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder={s.cardName}
              className="w-full border border-app-border rounded-lg px-3 py-2 text-sm mb-3"
            />
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setIsRenaming(false)}
                className="flex-1 py-2 rounded-lg border border-app-border text-app-text-secondary"
              >
                {s.cancel}
              </button>
              <button
                type="button"
                onClick={handleRename}
                className="flex-1 py-2 rounded-lg bg-app-primary text-white"
              >
                {s.save}
              </button>
            </div>
          </div>
        ) : null}

        <div className="space-y-3">
          {!card.isDefault && card.type === 'bank' && (
            <button
              type="button"
              onClick={() => setDefaultCard(card.id)}
              className="w-full bg-white rounded-xl p-4 flex items-center justify-between"
            >
              <span className="text-app-text-primary">{s.setDefault}</span>
              <IcCheck size={20} className="text-app-primary" />
            </button>
          )}

          <button
            type="button"
            onClick={() => {
              setNewName(card.name);
              setIsRenaming(true);
            }}
            className="w-full bg-white rounded-xl p-4 flex items-center justify-between"
          >
            <span className="text-app-text-primary">{s.rename}</span>
            <IcEdit size={20} className="text-app-primary" />
          </button>

          {card.frozen ? (
            <button
              type="button"
              onClick={() => unfreezeCard(card.id)}
              className="w-full bg-white rounded-xl p-4 flex items-center justify-between"
            >
              <span className="text-app-text-primary">{s.unfreeze}</span>
              <IcUnlock size={20} className="text-app-primary" />
            </button>
          ) : (
            <button
              type="button"
              onClick={() => freezeCard(card.id)}
              className="w-full bg-white rounded-xl p-4 flex items-center justify-between"
            >
              <span className="text-app-text-primary">{s.freeze}</span>
              <IcLock size={20} className="text-app-primary" />
            </button>
          )}

          <button
            type="button"
            onClick={() => go('card.code.open', { id: card.id })}
            className="w-full bg-white rounded-xl p-4 flex items-center justify-between"
          >
            <span className="text-app-text-primary">{s.showCode}</span>
            <IcQrCode size={20} className="text-app-primary" />
          </button>

          <button
            type="button"
            onClick={() => setShowDelete(true)}
            className="w-full bg-white rounded-xl p-4 flex items-center justify-between text-red-500"
          >
            <span>{s.delete}</span>
            <IcDelete size={20} />
          </button>
        </div>
      </div>

      {showDelete && (
        <>
          <div className="absolute inset-0 bg-black/40 z-40" onClick={() => setShowDelete(false)} />
          <div className="absolute left-4 right-4 top-1/2 -translate-y-1/2 bg-white rounded-2xl p-5 z-50">
            <div className="text-lg font-bold mb-2 text-app-text-primary">{s.confirmDelete}</div>
            <div className="text-app-text-secondary text-sm mb-4">{s.deleteConfirmMessage}</div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowDelete(false)}
                className="flex-1 py-2 rounded-lg border border-app-border text-app-text-secondary"
              >
                {s.cancel}
              </button>
              <button
                type="button"
                onClick={handleDelete}
                className="flex-1 py-2 rounded-lg bg-red-500 text-white"
              >
                {s.confirm}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
