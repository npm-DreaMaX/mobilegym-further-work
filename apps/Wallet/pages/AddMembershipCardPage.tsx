import React, { useState } from 'react';
import { useWalletStore } from '../state';
import { useWalletGestures } from '../hooks/useWalletGestures';
import { useAppStrings } from '../../../os/useAppStrings';
import { strings } from '../res/strings';
import { stringsEn } from '../res/strings.en';
import { MEMBERSHIP_BRANDS } from '../constants';
import { IcNavBack } from '../res/icons';

export const AddMembershipCardPage: React.FC = () => {
  const s = useAppStrings(strings, stringsEn);
  const { bindBack, back } = useWalletGestures();
  const addMembershipCard = useWalletStore((state) => state.addMembershipCard);
  const [brand, setBrand] = useState(MEMBERSHIP_BRANDS[0]);
  const [memberNumber, setMemberNumber] = useState('');
  const [points, setPoints] = useState('');

  const handleSave = () => {
    if (!memberNumber.trim()) return;
    addMembershipCard({
      name: `${brand}会员`,
      issuer: brand,
      memberNumber: memberNumber.trim(),
      points: points.trim() ? Number(points.trim()) : 0,
    });
    back();
  };

  return (
    <div className="h-full w-full flex flex-col bg-app-bg">
      <div className="pt-10 px-4 pb-3 bg-app-surface flex items-center justify-between">
        <button type="button" className="p-2 -ml-2" {...bindBack<HTMLButtonElement>()}>
          <IcNavBack size={24} className="text-app-text-primary" />
        </button>
        <h1 className="text-lg font-bold text-app-text-primary">{s.addMembershipCard}</h1>
        <button type="button" onClick={handleSave} className="text-app-primary font-medium">
          {s.save}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4" data-scroll-container="main" data-scroll-direction="vertical">
        <div className="bg-white rounded-xl p-4">
          <label className="block text-sm text-app-text-secondary mb-1">{s.merchant}</label>
          <select
            value={brand}
            onChange={(e) => setBrand(e.target.value)}
            className="w-full border border-app-border rounded-lg px-3 py-2 text-sm"
          >
            {MEMBERSHIP_BRANDS.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
        </div>

        <div className="bg-white rounded-xl p-4">
          <label className="block text-sm text-app-text-secondary mb-1">{s.memberNumber}</label>
          <input
            type="text"
            value={memberNumber}
            onChange={(e) => setMemberNumber(e.target.value)}
            placeholder={s.memberNumber}
            className="w-full border border-app-border rounded-lg px-3 py-2 text-sm"
          />
        </div>

        <div className="bg-white rounded-xl p-4">
          <label className="block text-sm text-app-text-secondary mb-1">{s.points}</label>
          <input
            type="number"
            value={points}
            onChange={(e) => setPoints(e.target.value)}
            placeholder={s.points}
            className="w-full border border-app-border rounded-lg px-3 py-2 text-sm"
          />
        </div>
      </div>
    </div>
  );
};
