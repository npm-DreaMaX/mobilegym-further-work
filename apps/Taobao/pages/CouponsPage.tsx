import React, { useMemo } from 'react';
import * as TimeService from '../../../os/TimeService';
import { TAOBAO_CONFIG } from '../data';
import { useTaobaoStore } from '../state';
import { useTaobaoGestures } from '../navigation';
import { useTaobaoStrings } from '../hooks/useTaobaoStrings';
import { useSearchParams } from 'react-router-dom';
import {
  IcNavBack, IcCoupon, IcCheck, IcTag,
} from '../res/icons';
import type { Coupon, UserCoupon } from '../types';

const CouponsPage: React.FC = () => {
  const s = useTaobaoStrings();
  const { bindBack, go, back } = useTaobaoGestures();
  const [searchParams] = useSearchParams();
  const isSelectMode = searchParams.get('select') === 'true';

  const userCoupons = useTaobaoStore(st => st.userCoupons) as UserCoupon[];
  const claimCoupon = useTaobaoStore(st => st.claimCoupon);
  const applyCouponToCheckout = useTaobaoStore(st => st.applyCouponToCheckout);

  const coupons = TAOBAO_CONFIG.coupons as Record<string, Coupon> | undefined;
  const allCoupons = Object.values(coupons ?? {}).filter(c => c.enabled);

  // Split into available (not claimed) and user coupons
  const userCouponIds = new Set(userCoupons.map(uc => uc.couponId));
  const availableCoupons = allCoupons.filter(c => !userCouponIds.has(c.id));

  // Find coupon details for user coupons
  const myCouponsWithDetails = useMemo(() => {
    return userCoupons.map(uc => {
      const detail = allCoupons.find(c => c.id === uc.couponId);
      return { ...uc, detail };
    }).filter(uc => uc.detail);
  }, [userCoupons, allCoupons]);

  const handleClaim = (couponId: string) => {
    claimCoupon(couponId);
  };

  const handleSelectCoupon = (couponId: string, used: boolean) => {
    if (!used) {
      applyCouponToCheckout(couponId);
      back();
    }
  };

  const formatDiscount = (coupon: Coupon): string => {
    if (coupon.threshold > 0) {
      return `满${coupon.threshold}减${coupon.discount}`;
    }
    return `立减${coupon.discount}元`;
  };

  const renderCouponCard = (
    coupon: Coupon,
    status: 'available' | 'claimed' | 'used',
    onAction?: () => void,
  ) => {
    const isUsed = status === 'used';
    const isClaimed = status === 'claimed';
    const isAvailable = status === 'available';

    return (
      <div
        key={coupon.id}
        className={`bg-white rounded-lg mx-4 mb-3 overflow-hidden border ${
          isSelectMode && !isUsed ? 'border-orange-300 cursor-pointer' : 'border-gray-200'
        } ${isUsed ? 'opacity-60' : ''}`}
        onClick={() => {
          if (isSelectMode && (isAvailable || isClaimed) && onAction) {
            onAction();
          }
        }}
      >
        <div className="flex items-stretch">
          {/* Left decorative stripe */}
          <div className={`w-2 flex-shrink-0 ${
            coupon.type === 'platform' ? 'bg-red-400' : 'bg-blue-400'
          }`} />

          {/* Main content */}
          <div className="flex-1 px-3 py-3">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-1.5">
                  <span className={`text-xs px-1.5 py-0.5 rounded ${
                    coupon.type === 'platform' ? 'bg-red-50 text-red-500' : 'bg-blue-50 text-blue-500'
                  }`}>
                    {coupon.type === 'platform' ? s.coupon_platform : s.coupon_shop}
                  </span>
                  <span className="text-sm font-bold text-gray-800">{coupon.name}</span>
                </div>
                <div className="mt-1">
                  <span className="text-lg font-bold text-red-500">¥{coupon.discount}</span>
                  <span className="text-xs text-gray-500 ml-1">{formatDiscount(coupon)}</span>
                </div>
                <p className="text-xs text-gray-400 mt-0.5">{coupon.description}</p>
              </div>

              {/* Action button */}
              <div className="flex items-center">
                {isAvailable && (
                  <button
                    className="px-3 py-1.5 bg-red-500 text-white text-xs rounded-full font-medium active:bg-red-600"
                    onClick={(e) => { e.stopPropagation(); handleClaim(coupon.id); }}
                    data-action="coupon.item.claim.submit"
                    data-action-params={JSON.stringify({ couponId: coupon.id })}
                  >
                    {s.coupon_claim}
                  </button>
                )}
                {isClaimed && !isSelectMode && (
                  <span className="px-3 py-1.5 bg-gray-100 text-gray-400 text-xs rounded-full">
                    {s.coupon_claimed}
                  </span>
                )}
                {isUsed && (
                  <span className="px-3 py-1.5 bg-gray-100 text-gray-400 text-xs rounded-full flex items-center gap-1">
                    <IcCheck size={12} />
                    {s.coupon_used}
                  </span>
                )}
                {isSelectMode && (isAvailable || isClaimed) && !isUsed && (
                  <span className="px-3 py-1.5 bg-orange-500 text-white text-xs rounded-full">
                    {s.coupon_use}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Expiry */}
        <div className="bg-gray-50 px-3 py-1.5 flex items-center justify-between">
          <span className="text-[10px] text-gray-400">
            {TimeService.fromTimestamp(coupon.validFrom).toLocaleDateString()} ~ {TimeService.fromTimestamp(coupon.validTo).toLocaleDateString()}
          </span>
          {isSelectMode && !isUsed && (
            <IcCheck size={14} className="text-orange-500" />
          )}
        </div>
      </div>
    );
  };

  const pageTitle = isSelectMode ? s.coupon_select : s.coupon_title;

  return (
    <div className="h-full w-full flex flex-col bg-gray-50" data-status-bar-foreground="dark">
      {/* Header */}
      <div className="bg-white px-4 pt-10 pb-3 flex items-center border-b border-gray-100">
        <button {...bindBack()} className="mr-3 p-1 -ml-1">
          <IcNavBack size={22} className="text-gray-800" />
        </button>
        <h1 className="text-lg font-bold text-gray-800 flex-1">{pageTitle}</h1>
      </div>

      <div data-scroll-container="main" data-scroll-direction="vertical" className="flex-1 overflow-y-auto">
        {/* Available coupons */}
        <div className="pt-4">
          <h2 className="px-4 text-sm font-bold text-gray-700 mb-3 flex items-center gap-1.5">
            <IcCoupon size={16} className="text-orange-500" />
            可领取
          </h2>
          {availableCoupons.length === 0 ? (
            <p className="px-4 text-xs text-gray-400 py-4 text-center">{s.coupon_no_available}</p>
          ) : (
            availableCoupons.map(c => renderCouponCard(c, 'available'))
          )}
        </div>

        {/* My coupons */}
        <div className="pb-4">
          <h2 className="px-4 pt-4 text-sm font-bold text-gray-700 mb-3 flex items-center gap-1.5">
            <IcTag size={16} className="text-orange-500" />
            我的优惠券
          </h2>
          {myCouponsWithDetails.length === 0 ? (
            <p className="px-4 text-xs text-gray-400 py-4 text-center">{s.coupon_no_available}</p>
          ) : (
            myCouponsWithDetails.map(uc => {
              if (!uc.detail) return null;
              const status = uc.used ? 'used' : 'claimed';
              return renderCouponCard(uc.detail, status, () => {
                if (!uc.used) {
                  handleSelectCoupon(uc.couponId, uc.used);
                }
              });
            })
          )}
        </div>

        <div className="h-8" />
      </div>
    </div>
  );
};

export default CouponsPage;
