import React, { useState } from 'react';
import { useWalletStore } from '../state';
import { useWalletGestures } from '../hooks/useWalletGestures';
import { useAppStrings } from '../../../os/useAppStrings';
import { strings } from '../res/strings';
import { stringsEn } from '../res/strings.en';
import { BANK_OPTIONS } from '../constants';
import { IcNavBack } from '../res/icons';

export const AddBankCardPage: React.FC = () => {
  const s = useAppStrings(strings, stringsEn);
  const { bindBack, back } = useWalletGestures();
  const addBankCard = useWalletStore((state) => state.addBankCard);
  const [bank, setBank] = useState(BANK_OPTIONS[0]);
  const [holder, setHolder] = useState('');
  const [last4, setLast4] = useState('');
  const [name, setName] = useState('');
  const [number, setNumber] = useState('');

  const handleSave = () => {
    if (!name.trim() || !last4.trim()) return;
    addBankCard({
      name: name.trim(),
      issuer: bank,
      holder: holder.trim() || '张伟',
      last4: last4.trim(),
      number: number.trim() || undefined,
    });
    back();
  };

  return (
    <div className="h-full w-full flex flex-col bg-app-bg">
      <div className="pt-10 px-4 pb-3 bg-app-surface flex items-center justify-between">
        <button type="button" className="p-2 -ml-2" {...bindBack<HTMLButtonElement>()}>
          <IcNavBack size={24} className="text-app-text-primary" />
        </button>
        <h1 className="text-lg font-bold text-app-text-primary">{s.addBankCard}</h1>
        <button type="button" onClick={handleSave} className="text-app-primary font-medium">
          {s.save}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4" data-scroll-container="main" data-scroll-direction="vertical">
        <div className="bg-white rounded-xl p-4">
          <label className="block text-sm text-app-text-secondary mb-1">{s.bankName}</label>
          <select
            value={bank}
            onChange={(e) => setBank(e.target.value)}
            className="w-full border border-app-border rounded-lg px-3 py-2 text-sm"
          >
            {BANK_OPTIONS.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
        </div>

        <div className="bg-white rounded-xl p-4">
          <label className="block text-sm text-app-text-secondary mb-1">{s.cardName}</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={s.cardName}
            className="w-full border border-app-border rounded-lg px-3 py-2 text-sm"
          />
        </div>

        <div className="bg-white rounded-xl p-4">
          <label className="block text-sm text-app-text-secondary mb-1">{s.cardHolder}</label>
          <input
            type="text"
            value={holder}
            onChange={(e) => setHolder(e.target.value)}
            placeholder={s.cardHolder}
            className="w-full border border-app-border rounded-lg px-3 py-2 text-sm"
          />
        </div>

        <div className="bg-white rounded-xl p-4">
          <label className="block text-sm text-app-text-secondary mb-1">{s.last4}</label>
          <input
            type="text"
            value={last4}
            onChange={(e) => setLast4(e.target.value)}
            placeholder={s.last4}
            maxLength={4}
            className="w-full border border-app-border rounded-lg px-3 py-2 text-sm"
          />
        </div>

        <div className="bg-white rounded-xl p-4">
          <label className="block text-sm text-app-text-secondary mb-1">{s.cardNumber}</label>
          <input
            type="text"
            value={number}
            onChange={(e) => setNumber(e.target.value)}
            placeholder={s.cardNumber}
            className="w-full border border-app-border rounded-lg px-3 py-2 text-sm"
          />
        </div>
      </div>
    </div>
  );
};
