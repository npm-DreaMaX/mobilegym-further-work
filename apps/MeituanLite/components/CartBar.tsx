import React from 'react';
import { IcCart } from '../res/icons';
import {
  useMeituanLiteStore,
  selectCartCount,
  selectCartSubtotal,
  computeDeliveryFee,
  computeDiscount,
} from '../state';
import { useAppStrings } from '@/os/useAppStrings';
import { strings } from '../res/strings';
import { stringsEn } from '../res/strings.en';
import { useMeituanLiteGestures } from '../hooks/useMeituanLiteGestures';
import { formatPrice } from './Price';
import type { Shop } from '../types';

interface CartBarProps {
  shop: Shop;
}

/** 商家详情底部购物车栏：购物车图标 + 起送/去结算 */
const CartBar: React.FC<CartBarProps> = ({ shop }) => {
  const s = useAppStrings(strings, stringsEn);
  const { go } = useMeituanLiteGestures();
  const count = useMeituanLiteStore(selectCartCount);
  const subtotal = useMeituanLiteStore(selectCartSubtotal);
  const cartShopId = useMeituanLiteStore((st) => st.cartShopId);

  const belongsHere = cartShopId === shop.id;
  const effectiveCount = belongsHere ? count : 0;
  const effectiveSubtotal = belongsHere ? subtotal : 0;

  const diff = Math.max(0, shop.minOrder - effectiveSubtotal);
  const canCheckout = effectiveCount > 0 && diff === 0;
  const deliveryFee = computeDeliveryFee(shop, effectiveSubtotal);
  const discount = computeDiscount(shop.promotions, effectiveSubtotal);
  // 实付用于按钮旁的小提示（不展示，避免过度）；此处仅用 subtotal 判断
  void deliveryFee;
  void discount;

  const openCart = () => {
    if (effectiveCount > 0) go('shop.cart.open', { shopId: shop.id });
  };

  const checkout = () => {
    if (canCheckout) go('cart.checkout');
  };

  return (
    <div className="flex-shrink-0 bg-[#1a1a1a] text-white flex items-stretch">
      {/* 购物车图标 */}
      <button
        type="button"
        onClick={openCart}
        className="relative -mt-5 ml-3 w-14 h-14 rounded-full bg-[#3a3a3a] border-2 border-[#1a1a1a] flex items-center justify-center flex-shrink-0"
      >
        <IcCart
          size={26}
          className={effectiveCount > 0 ? 'text-[#FFC300]' : 'text-gray-500'}
        />
        {effectiveCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-[#FF5339] text-white text-[10px] font-bold flex items-center justify-center">
            {effectiveCount}
          </span>
        )}
      </button>

      {/* 中间价格/提示 */}
      <div className="flex-1 flex flex-col justify-center ml-2 min-w-0">
        {effectiveCount > 0 ? (
          <>
            <span className="text-base font-bold leading-tight">¥{formatPrice(effectiveSubtotal)}</span>
            {diff > 0 ? (
              <span className="text-[11px] text-gray-400 leading-tight">
                {s.cart_diff_to_min.replace('{0}', formatPrice(diff))}
              </span>
            ) : (
              <span className="text-[11px] text-gray-400 leading-tight">
                {s.cart_delivery}¥{shop.deliveryFee}
              </span>
            )}
          </>
        ) : (
          <span className="text-sm text-gray-400">
            {s.cart_diff_to_min.replace('{0}', String(shop.minOrder))}
          </span>
        )}
      </div>

      {/* 右侧按钮 */}
      <button
        type="button"
        onClick={checkout}
        disabled={!canCheckout}
        className={`px-6 text-sm font-bold flex items-center justify-center ${
          canCheckout ? 'bg-[#FFC300] text-[#1a1a1a] active:brightness-95' : 'bg-[#444] text-gray-400'
        }`}
      >
        {canCheckout ? s.cart_go_checkout : s.cart_diff_to_min.replace('{0}', formatPrice(diff))}
      </button>
    </div>
  );
};

export default CartBar;
