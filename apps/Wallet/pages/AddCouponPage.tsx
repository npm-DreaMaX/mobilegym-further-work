import React, { useState } from 'react';
import { useWalletStore } from '../state';
import { useWalletGestures } from '../hooks/useWalletGestures';
import { useAppStrings } from '../../../os/useAppStrings';
import { strings } from '../res/strings';
import { stringsEn } from '../res/strings.en';
import { COUPON_MERCHANTS } from '../constants';
import { parseToTimestamp } from '../../../os/TimeService';
import { IcNavBack } from '../res/icons';

export const AddCouponPage: React.FC = () => {
  const s = useAppStrings(strings, stringsEn);
  const { bindBack, back } = useWalletGestures();
  const addCoupon = useWalletStore((state) => state.addCoupon);
  const [merchant, setMerchant] = useState(COUPON_MERCHANTS[0]);
  const [code, setCode] = useState('');
  const [value, setValue] = useState('');
  const [expiry, setExpiry] = useState('');

  const handleSave = () => {
    if (!code.trim()) return;
    const expiryTimestamp = expiry.trim()
      ? parseToTimestamp(expiry.trim())
      : 1799366400000;
    addCoupon({
      merchant,
      code: code.trim(),
      value: value.trim() ? Number(value.trim()) : 0,
      expiry: expiryTimestamp,
    });
    back();
  };

  return (
    <div className="h-full w-full flex flex-col bg-app-bg">
      <div className="pt-10 px-4 pb-3 bg-app-surface flex items-center justify-between">
        <button type="button" className="p-2 -ml-2" {...bindBack<HTMLButtonElement>()}>
          <IcNavBack size={24} className="text-app-text-primary" />
        </button>
        <h1 className="text-lg font-bold text-app-text-primary">{s.addCoupon}</h1>
        <button type="button" onClick={handleSave} className="text-app-primary font-medium">
          {s.save}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4" data-scroll-container="main" data-scroll-direction="vertical">
        <div className="bg-white rounded-xl p-4">
          <label className="block text-sm text-app-text-secondary mb-1">{s.merchant}</label>
          <select
            value={merchant}
            onChange={(e) => setMerchant(e.target.value)}
            className="w-full border border-app-border rounded-lg px-3 py-2 text-sm"
          >
            {COUPON_MERCHANTS.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </div>

        <div className="bg-white rounded-xl p-4">
          <label className="block text-sm text-app-text-secondary mb-1">{s.couponCode}</label>
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder={s.couponCode}
            className="w-full border border-app-border rounded-lg px-3 py-2 text-sm"
          />
        </div>

        <div className="bg-white rounded-xl p-4">
          <label className="block text-sm text-app-text-secondary mb-1">{s.value}</label>
          <input
            type="number"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder={s.value}
            className="w-full border border-app-border rounded-lg px-3 py-2 text-sm"
          />
        </div>

        <div className="bg-white rounded-xl p-4">
          <label className="block text-sm text-app-text-secondary mb-1">{s.expiry}</label>
          <input
            type="date"
            value={expiry}
            onChange={(e) => setExpiry(e.target.value)}
            className="w-full border border-app-border rounded-lg px-3 py-2 text-sm"
          />
        </div>
      </div>
    </div>
  );
};
