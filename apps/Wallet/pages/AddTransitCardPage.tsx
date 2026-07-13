import React, { useState } from 'react';
import { useWalletStore } from '../state';
import { useWalletGestures } from '../hooks/useWalletGestures';
import { useAppStrings } from '../../../os/useAppStrings';
import { strings } from '../res/strings';
import { stringsEn } from '../res/strings.en';
import { TRANSIT_CITIES } from '../constants';
import { IcNavBack } from '../res/icons';

export const AddTransitCardPage: React.FC = () => {
  const s = useAppStrings(strings, stringsEn);
  const { bindBack, back } = useWalletGestures();
  const addTransitCard = useWalletStore((state) => state.addTransitCard);
  const [city, setCity] = useState(TRANSIT_CITIES[0]);

  const handleSave = () => {
    addTransitCard({ name: `${city}一卡通`, city });
    back();
  };

  return (
    <div className="h-full w-full flex flex-col bg-app-bg">
      <div className="pt-10 px-4 pb-3 bg-app-surface flex items-center justify-between">
        <button type="button" className="p-2 -ml-2" {...bindBack<HTMLButtonElement>()}>
          <IcNavBack size={24} className="text-app-text-primary" />
        </button>
        <h1 className="text-lg font-bold text-app-text-primary">{s.addTransitCard}</h1>
        <button type="button" onClick={handleSave} className="text-app-primary font-medium">
          {s.save}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4" data-scroll-container="main" data-scroll-direction="vertical">
        <div className="bg-white rounded-xl p-4">
          <label className="block text-sm text-app-text-secondary mb-1">{s.city}</label>
          <select
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="w-full border border-app-border rounded-lg px-3 py-2 text-sm"
          >
            {TRANSIT_CITIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};
