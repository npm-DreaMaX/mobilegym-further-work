import React from 'react';
import { useParams } from 'react-router-dom';
import { IcLocation, IcChevronRight } from '../res/icons';
import * as TimeService from '@/os/TimeService';
import { SHOP_BY_ID } from '../data';
import { useMeituanLiteStore } from '../state';
import { useAppStrings } from '@/os/useAppStrings';
import { strings } from '../res/strings';
import { stringsEn } from '../res/strings.en';
import { useMeituanLiteGestures } from '../hooks/useMeituanLiteGestures';
import { formatPrice } from '../components/Price';
import type { OrderStatus, PaymentMethod } from '../types';

const STATUS_COLOR: Record<string, string> = {
  待支付: '#FF8C00',
  商家已接单: '#26C261',
  骑手待接单: '#3B8BFF',
  配送中: '#3B8BFF',
  已完成: '#9B9B9B',
};

const PAY_LABEL: Record<PaymentMethod, string> = {
  balance: 'pay_method_balance',
  bankcard: 'pay_method_bankcard',
  wechat: 'pay_method_wechat',
  alipay: 'pay_method_alipay',
} as const;

const OrderDetailPage: React.FC = () => {
  const s = useAppStrings(strings, stringsEn);
  const { bindBack, go } = useMeituanLiteGestures();
  const { orderId } = useParams<{ orderId: string }>();

  const order = useMeituanLiteStore((st) => st.orders.find((o) => o.id === orderId));
  const shop = order ? SHOP_BY_ID[order.shopId] : undefined;

  if (!order) {
    return (
      <div className="h-full flex flex-col bg-gray-50" data-status-bar-foreground="dark">
        <div className="pt-10 px-3 pb-2 flex items-center">
          <button type="button" {...bindBack<HTMLButtonElement>()} className="p-1 text-gray-700">
            {s.back}
          </button>
        </div>
        <div className="flex-1 flex items-center justify-center text-gray-400">{s.empty}</div>
      </div>
    );
  }

  const status = order.status as OrderStatus;
  const payLabelKey = PAY_LABEL[order.paymentMethod] as keyof typeof strings;

  // 下单时间用 TimeService 格式化
  const created = TimeService.fromTimestamp(order.createdAt);
  const timeStr = `${created.getMonth() + 1}-${created.getDate()} ${String(created.getHours()).padStart(2, '0')}:${String(created.getMinutes()).padStart(2, '0')}`;

  return (
    <div className="h-full flex flex-col bg-gray-50" data-status-bar-foreground="dark">
      {/* 顶部栏 */}
      <div className="flex-shrink-0 bg-white pt-10 px-3 pb-2 flex items-center border-b border-gray-100">
        <button type="button" {...bindBack<HTMLButtonElement>()} className="p-1">
          <span className="text-[16px] text-gray-800">{s.back}</span>
        </button>
        <span className="text-[15px] font-bold text-gray-900 flex-1 text-center">
          {s.order_detail_title}
        </span>
        <span className="w-8" />
      </div>

      <div
        className="flex-1 overflow-y-auto"
        data-scroll-container="main"
        data-scroll-direction="vertical"
      >
        {/* 状态卡 */}
        <div className="bg-white px-3 py-4 flex items-center justify-between">
          <div>
            <div className="text-[16px] font-bold" style={{ color: STATUS_COLOR[status] ?? '#9B9B9B' }}>
              {status}
            </div>
            <div className="text-[12px] text-gray-400 mt-0.5">{order.etaText}</div>
          </div>
        </div>

        {/* 商家 */}
        <div className="bg-white mt-2 px-3 py-3 flex items-center gap-2">
          <span className="w-9 h-9 rounded bg-gray-100 flex items-center justify-center text-xl">
            {order.shopEmoji}
          </span>
          <span className="text-[14px] font-semibold text-gray-800 flex-1">{order.shopName}</span>
        </div>

        {/* 商品明细 */}
        <div className="bg-white mt-2 px-3 py-3">
          {order.items.map((it) => (
            <div key={it.productId} className="flex items-center justify-between py-1.5">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <span className="text-[13px] text-gray-700 truncate">{it.name}</span>
                <span className="text-[11px] text-gray-400">×{it.qty}</span>
              </div>
              <span className="text-[13px] text-gray-800">¥{formatPrice(it.price * it.qty)}</span>
            </div>
          ))}
          <div className="border-t border-gray-100 mt-2 pt-2 space-y-1 text-[12px] text-gray-500">
            <div className="flex justify-between">
              <span>{s.cart_subtotal}</span>
              <span>¥{formatPrice(order.subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span>{s.cart_packing}</span>
              <span>¥{formatPrice(order.packingFee)}</span>
            </div>
            <div className="flex justify-between">
              <span>{s.cart_delivery}</span>
              <span>{order.deliveryFee === 0 ? s.free : `¥${formatPrice(order.deliveryFee)}`}</span>
            </div>
            {order.discount > 0 && (
              <div className="flex justify-between text-[#FF5339]">
                <span>{s.cart_discount}</span>
                <span>-¥{formatPrice(order.discount)}</span>
              </div>
            )}
            <div className="flex justify-between pt-1">
              <span className="text-gray-700 font-semibold">{s.order_total}</span>
              <span className="text-[#FF5339] font-bold">¥{formatPrice(order.totalPayable)}</span>
            </div>
          </div>
        </div>

        {/* 配送地址 */}
        <div className="bg-white mt-2 px-3 py-3 flex items-start gap-2">
          <IcLocation size={16} className="text-[#FFC300] mt-0.5 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-[13px] font-semibold text-gray-800">{order.contact}</span>
              <span className="text-[12px] text-gray-500">{order.phone}</span>
            </div>
            <div className="text-[12px] text-gray-500 mt-0.5">{order.addressDetail}</div>
          </div>
        </div>

        {/* 订单信息 */}
        <div className="bg-white mt-2 px-3 py-3 text-[12px] text-gray-500 space-y-1.5">
          <div className="flex justify-between">
            <span>{s.order_pay_method}</span>
            <span className="text-gray-700">{s[payLabelKey]}</span>
          </div>
          <div className="flex justify-between">
            <span>{s.order_time}</span>
            <span className="text-gray-700">{timeStr}</span>
          </div>
          <div className="flex justify-between">
            <span>{s.pay_success_order_no}</span>
            <span className="text-gray-700">{order.id}</span>
          </div>
          {order.remark && (
            <div className="flex justify-between">
              <span>{s.checkout_remark}</span>
              <span className="text-gray-700">{order.remark}</span>
            </div>
          )}
        </div>

        {/* 再来一单 */}
        {shop && (
          <div className="bg-white mt-2 px-3 py-3 flex items-center justify-between">
            <span className="text-[13px] text-gray-700">{s.order_again}</span>
            <button
              type="button"
              onClick={() => go('shop.open', { shopId: shop.id })}
              className="flex items-center gap-1 text-[13px] text-[#FFB000]"
            >
              {s.shop_back_to_home}
              <IcChevronRight size={14} className="text-[#FFB000]" />
            </button>
          </div>
        )}
        <div className="h-3" />
      </div>
    </div>
  );
};

export default OrderDetailPage;
