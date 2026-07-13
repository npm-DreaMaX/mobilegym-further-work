import React from 'react';
import { useWalletStore } from '../state';
import { useWalletGestures } from '../hooks/useWalletGestures';
import { useAppStrings } from '../../../os/useAppStrings';
import { strings } from '../res/strings';
import { stringsEn } from '../res/strings.en';
import { IcNavBack, IcAdd } from '../res/icons';

export const CouponsPage: React.FC = () => {
  const s = useAppStrings(strings, stringsEn);
  const { bindBack, go } = useWalletGestures();
  const coupons = useWalletStore((state) => state.coupons);
  const redeemCoupon = useWalletStore((state) => state.redeemCoupon);

  return (
    <div className="h-full w-full flex flex-col bg-app-bg">
      <div className="pt-10 px-4 pb-3 bg-app-surface flex items-center justify-between">
        <button type="button" className="p-2 -ml-2" {...bindBack<HTMLButtonElement>()}>
          <IcNavBack size={24} className="text-app-text-primary" />
        </button>
        <h1 className="text-lg font-bold text-app-text-primary">{s.couponsTitle}</h1>
        <button type="button" className="p-2 -mr-2" onClick={() => go('add.coupon.open')}>
          <IcAdd size={24} className="text-app-primary" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-3" data-scroll-container="main" data-scroll-direction="vertical">
        {coupons.length === 0 ? (
          <div className="text-center py-20 text-app-text-secondary">{s.emptyState}</div>
        ) : (
          coupons.map((coupon) => (
            <div
              key={coupon.id}
              className="bg-white rounded-xl p-4 mb-3 border border-app-border"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="font-medium text-app-text-primary">{coupon.merchant}</div>
                <span
                  className={`text-xs px-2 py-0.5 rounded ${
                    coupon.redeemed
                      ? 'bg-gray-100 text-gray-500'
                      : 'bg-app-primary/10 text-app-primary'
                  }`}
                >
                  {coupon.redeemed ? '已使用' : '未使用'}
                </span>
              </div>
              <div className="text-sm text-app-text-secondary mb-2">
                {s.couponCode}: {coupon.code} · {s.value} ¥{coupon.value}
              </div>
              {!coupon.redeemed && (
                <button
                  type="button"
                  onClick={() => redeemCoupon(coupon.id)}
                  className="w-full py-2 rounded-lg bg-app-primary text-white text-sm"
                >
                  {s.redeem}
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
