import React from 'react';
import {
  useMeituanLiteStore,
  selectCartLines,
  selectCartSubtotal,
  computeDeliveryFee,
  computeDiscount,
  computePackingFee,
} from '../state';
import { useAppStrings } from '@/os/useAppStrings';
import { strings } from '../res/strings';
import { stringsEn } from '../res/strings.en';
import { useMeituanLiteGestures } from '../hooks/useMeituanLiteGestures';
import Price, { formatPrice } from './Price';
import Stepper from './Stepper';
import type { Shop } from '../types';

interface CartSheetProps {
  shop: Shop;
}

/** 购物车弹层：列表 + 增减 + 清空 + 费用明细 */
const CartSheet: React.FC<CartSheetProps> = ({ shop }) => {
  const s = useAppStrings(strings, stringsEn);
  const { back } = useMeituanLiteGestures();
  const lines = useMeituanLiteStore(selectCartLines);
  const subtotal = useMeituanLiteStore(selectCartSubtotal);
  const changeQty = useMeituanLiteStore((st) => st.changeQty);
  const clearCart = useMeituanLiteStore((st) => st.clearCart);

  const deliveryFee = computeDeliveryFee(shop, subtotal);
  const packingFee = computePackingFee(lines);
  const discount = computeDiscount(shop.promotions, subtotal);

  return (
    <>
      {/* 遮罩：点击 back() 关闭 */}
      <div className="absolute inset-0 bg-black/50 z-30" onClick={() => back()} />

      {/* 弹层主体 */}
      <div className="absolute left-0 right-0 bottom-0 bg-[#f5f5f5] rounded-t-2xl z-40 max-h-[60%] flex flex-col">
        {/* 头部 */}
        <div className="flex items-center justify-between px-4 py-3 bg-white rounded-t-2xl">
          <span className="text-sm font-semibold text-gray-800">{s.cart_title}</span>
          <button
            type="button"
            onClick={() => clearCart()}
            className="flex items-center gap-1 text-[12px] text-gray-400 active:text-gray-600"
          >
            <span>{s.cart_clear}</span>
          </button>
        </div>

        {/* 商品列表 */}
        <div className="flex-1 overflow-y-auto py-1">
          {lines.length === 0 ? (
            <div className="py-12 text-center text-sm text-gray-400">{s.cart_empty}</div>
          ) : (
            lines.map((l) => (
              <div
                key={l.productId}
                className="flex items-center gap-3 px-4 py-2.5 bg-white border-b border-gray-50"
              >
                <span className="w-9 h-9 rounded bg-gray-100 flex items-center justify-center text-2xl">
                  {l.emoji}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-gray-800 truncate">{l.name}</div>
                  <Price value={l.price} size="sm" />
                </div>
                <Stepper
                  qty={l.qty}
                  onDecrease={() => changeQty(l.productId, -1)}
                  onIncrease={() => changeQty(l.productId, 1)}
                  size="sm"
                />
              </div>
            ))
          )}
        </div>

        {/* 费用明细 */}
        {lines.length > 0 && (
          <div className="bg-white px-4 py-3 border-t border-gray-100 text-[12px] text-gray-500 space-y-1">
            <div className="flex justify-between">
              <span>{s.cart_subtotal}</span>
              <span>¥{formatPrice(subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span>{s.cart_packing}</span>
              <span>¥{formatPrice(packingFee)}</span>
            </div>
            <div className="flex justify-between">
              <span>{s.cart_delivery}</span>
              <span>{deliveryFee === 0 ? s.free : `¥${formatPrice(deliveryFee)}`}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-[#FF5339]">
                <span>{s.cart_discount}</span>
                <span>-¥{formatPrice(discount)}</span>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
};

export default CartSheet;
