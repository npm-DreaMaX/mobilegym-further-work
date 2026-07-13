import React from 'react';
import { useParams } from 'react-router-dom';
import { useWalletStore } from '../state';
import { useWalletGestures } from '../hooks/useWalletGestures';
import { useAppStrings } from '../../../os/useAppStrings';
import { strings } from '../res/strings';
import { stringsEn } from '../res/strings.en';
import { RealisticQRCode } from '../components/RealisticQRCode';
import { IcNavBack } from '../res/icons';

export const CodePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const s = useAppStrings(strings, stringsEn);
  const { bindBack } = useWalletGestures();
  const cards = useWalletStore((state) => state.cards);
  const card = cards.find((c) => c.id === id);

  if (!card) {
    return (
      <div className="h-full w-full pt-10 px-4">
        <div className="text-center py-20 text-app-text-secondary">{s.noResults}</div>
      </div>
    );
  }

  return (
    <div className="h-full w-full flex flex-col bg-white">
      <div className="pt-10 px-4 pb-3 flex items-center">
        <button type="button" className="p-2 -ml-2" {...bindBack<HTMLButtonElement>()}>
          <IcNavBack size={24} className="text-app-text-primary" />
        </button>
        <h1 className="text-lg font-bold text-app-text-primary ml-2">{s.code}</h1>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-6">
        <div className="text-app-text-secondary mb-6 text-center">
          <div className="text-lg font-medium text-app-text-primary mb-1">{card.name}</div>
          <div className="text-sm">{card.issuer}</div>
        </div>
        <div className="p-4 bg-white rounded-2xl shadow-lg border border-app-border">
          <RealisticQRCode value={card.barcode} size={220} />
        </div>
        <div className="mt-6 text-sm text-app-text-secondary">{card.barcode}</div>
      </div>
    </div>
  );
};
