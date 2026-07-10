import React, { useState } from 'react';
import { IcLocation, IcChevronRight, IcClock, IcCheck } from '../res/icons';
import { SHOP_BY_ID } from '../data';
import {
  useMeituanLiteStore,
  selectCartLines,
  selectAddress,
  computeDeliveryFee,
  computeDiscount,
  computePackingFee,
} from '../state';
import { useAppStrings } from '@/os/useAppStrings';
import { strings } from '../res/strings';
import { stringsEn } from '../res/strings.en';
import { useMeituanLiteGestures } from '../hooks/useMeituanLiteGestures';
import { formatPrice } from '../components/Price';
import type { OrderItem, SubmitOrderInput } from '../types';

const CheckoutPage: React.FC = () => {
  const s = useAppStrings(strings, stringsEn);
  const { bindBack, go } = useMeituanLiteGestures();

  const lines = useMeituanLiteStore(selectCartLines);
  const cartShopId = useMeituanLiteStore((st) => st.cartShopId);
  const address = useMeituanLiteStore(selectAddress);
  const submitOrder = useMeituanLiteStore((st) => st.submitOrder);

  const shop = cartShopId ? SHOP_BY_ID[cartShopId] : undefined;

  const [remark, setRemark] = useState('');
  const [utensils, setUtensils] = useState(0);

  // 费用计算
  const items: OrderItem[] = lines.map((l) => ({
    productId: l.productId,
    name: l.name,
    price: l.price,
    qty: l.qty,
    packingFee: l.packingFee,
  }));
  const subtotal = items.reduce((sum, it) => sum + it.price * it.qty, 0);
  const packingFee = computePackingFee(lines);
  const deliveryFee = shop ? computeDeliveryFee(shop, subtotal) : 0;
  const discount = shop ? computeDiscount(shop.promotions, subtotal) : 0;
  const totalPayable = Math.max(0, subtotal + deliveryFee + packingFee - discount);

  const handleSubmit = () => {
    if (!shop || items.length === 0) return;
    const input: SubmitOrderInput = {
      shopId: shop.id,
      shopName: shop.name,
      shopEmoji: shop.emoji,
      items,
      subtotal,
      deliveryFee,
      packingFee,
      discount,
      totalPayable,
      addressId: address.id,
      addressDetail: address.detail,
      contact: address.contact,
      phone: address.phone,
      remark,
      utensils,
      etaText: `${shop.deliveryTime}${s.shop_delivery_time}内送达`,
    };
    const id = submitOrder(input);
    go('checkout.toPayment', { orderId: id });
  };

  if (!shop || items.length === 0) {
    return (
      <div className="h-full flex flex-col bg-gray-50" data-status-bar-foreground="dark">
        <div className="pt-10 px-3 pb-2 flex items-center">
          <button type="button" {...bindBack<HTMLButtonElement>()} className="p-1 text-gray-700">
            {s.back}
          </button>
        </div>
        <div className="flex-1 flex items-center justify-center text-gray-400">{s.cart_empty}</div>
      </div>
    );
  }

  const utensilOptions = [0, 1, 2, 3];

  return (
    <div className="h-full flex flex-col bg-gray-50" data-status-bar-foreground="dark">
      {/* 顶部栏 */}
      <div className="flex-shrink-0 bg-white pt-10 px-3 pb-2 flex items-center border-b border-gray-100">
        <button type="button" {...bindBack<HTMLButtonElement>()} className="p-1">
          <span className="text-[16px] text-gray-800">{s.back}</span>
        </button>
        <span className="text-[15px] font-bold text-gray-900 flex-1 text-center">
          {s.checkout_title}
        </span>
        <span className="w-8" />
      </div>

      {/* 内容 */}
      <div
        className="flex-1 overflow-y-auto"
        data-scroll-container="main"
        data-scroll-direction="vertical"
      >
        {/* 收货地址 */}
        <div className="bg-white px-3 py-3 mt-2 flex items-start gap-2">
          <IcLocation size={18} className="text-[#FFC300] mt-0.5 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-[14px] font-semibold text-gray-900">{address.contact}</span>
              <span className="text-[12px] text-gray-500">{address.phone}</span>
              <span className="text-[10px] text-[#FFB000] border border-[#FFC300] px-1 rounded-sm">
                {address.tag}
              </span>
            </div>
            <div className="text-[12px] text-gray-500 mt-0.5">{address.detail}</div>
          </div>
          <IcChevronRight size={16} className="text-gray-300 mt-1" />
        </div>

        {/* 配送时间 */}
        <div className="bg-white px-3 py-3 mt-2 flex items-center justify-between">
          <span className="flex items-center gap-2 text-[13px] text-gray-700">
            <IcClock size={16} className="text-gray-400" />
            {s.checkout_delivery_time}
          </span>
          <span className="text-[13px] text-[#FFB000] flex items-center gap-0.5">
            {s.checkout_asap}
            <IcChevronRight size={14} className="text-gray-300" />
          </span>
        </div>

        {/* 商品明细 */}
        <div className="bg-white px-3 py-3 mt-2">
          <div className="flex items-center gap-2 mb-2">
            <span className="w-7 h-7 rounded bg-gray-100 flex items-center justify-center text-lg">
              {shop.emoji}
            </span>
            <span className="text-[13px] font-semibold text-gray-800">{shop.name}</span>
          </div>
          {items.map((it) => (
            <div key={it.productId} className="flex items-center justify-between py-1.5">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <span className="text-[13px] text-gray-700 truncate">{it.name}</span>
                <span className="text-[11px] text-gray-400">×{it.qty}</span>
              </div>
              <span className="text-[13px] text-gray-800">¥{formatPrice(it.price * it.qty)}</span>
            </div>
          ))}
        </div>

        {/* 备注 + 餐具 */}
        <div className="bg-white px-3 py-3 mt-2 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[13px] text-gray-700">{s.checkout_remark}</span>
            <input
              value={remark}
              onChange={(e) => setRemark(e.target.value)}
              placeholder={s.checkout_remark_placeholder}
              className="flex-1 ml-3 text-right text-[13px] text-gray-800 outline-none placeholder:text-gray-300"
            />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[13px] text-gray-700">{s.checkout_utensils}</span>
            <div className="flex items-center gap-1.5">
              {utensilOptions.map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setUtensils(n)}
                  className={`px-2 py-1 rounded text-[11px] border ${
                    utensils === n
                      ? 'border-[#FFC300] text-[#FFB000] bg-[#FFF3D6]'
                      : 'border-gray-200 text-gray-500'
                  }`}
                >
                  {n === 0 ? s.checkout_utensils_none : s.checkout_utensils_n.replace('{0}', String(n))}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 费用明细 */}
        <div className="bg-white px-3 py-3 mt-2 text-[12px] text-gray-500 space-y-1.5">
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
        <div className="h-2" />
      </div>

      {/* 底部提交栏 */}
      <div className="flex-shrink-0 bg-white px-3 py-2 border-t border-gray-100 flex items-center justify-between">
        <div className="flex flex-col">
          <span className="text-[16px] font-bold text-[#FF5339]">¥{formatPrice(totalPayable)}</span>
          {discount > 0 && (
            <span className="text-[10px] text-gray-400">
              {s.cart_discount} -¥{formatPrice(discount)}
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={handleSubmit}
          className="px-7 py-2.5 rounded-full bg-[#FFC300] text-[#1a1a1a] text-[14px] font-bold active:brightness-95"
        >
          {s.checkout_submit}
        </button>
      </div>
    </div>
  );
};

export default CheckoutPage;
