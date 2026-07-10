import React from 'react';
import { IcChevronRight } from '../res/icons';
import { useMeituanLiteStore } from '../state';
import { useAppStrings } from '@/os/useAppStrings';
import { strings } from '../res/strings';
import { stringsEn } from '../res/strings.en';
import { useMeituanLiteGestures } from '../hooks/useMeituanLiteGestures';
import { formatPrice } from '../components/Price';
import TabBar from '../components/TabBar';
import type { OrderStatus } from '../types';

const STATUS_COLOR: Record<string, string> = {
  待支付: '#FF8C00',
  商家已接单: '#26C261',
  骑手待接单: '#3B8BFF',
  配送中: '#3B8BFF',
  已完成: '#9B9B9B',
};

const OrdersPage: React.FC = () => {
  const s = useAppStrings(strings, stringsEn);
  const { go } = useMeituanLiteGestures();
  const orders = useMeituanLiteStore((st) => st.orders);

  return (
    <div className="h-full flex flex-col bg-gray-50" data-status-bar-foreground="dark">
      {/* 顶部栏 */}
      <div className="flex-shrink-0 bg-white pt-10 px-3 pb-3 border-b border-gray-100">
        <span className="text-[16px] font-bold text-gray-900">{s.orders_title}</span>
      </div>

      {/* 列表 */}
      <div
        className="flex-1 overflow-y-auto"
        data-scroll-container="main"
        data-scroll-direction="vertical"
      >
        {orders.length === 0 ? (
          <div className="py-24 text-center text-sm text-gray-400">{s.orders_empty}</div>
        ) : (
          <div className="py-2 space-y-2">
            {orders.map((o) => {
              const status = o.status as OrderStatus;
              return (
                <button
                  key={o.id}
                  type="button"
                  onClick={() => go('orders.openOrder', { orderId: o.id })}
                  className="w-full text-left bg-white mx-0 px-3 py-3 active:bg-gray-50"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <span className="w-8 h-8 rounded bg-gray-100 flex items-center justify-center text-lg">
                        {o.shopEmoji}
                      </span>
                      <span className="text-[14px] font-semibold text-gray-800 truncate">
                        {o.shopName}
                      </span>
                    </div>
                    <span
                      className="text-[12px] font-semibold flex-shrink-0"
                      style={{ color: STATUS_COLOR[status] ?? '#9B9B9B' }}
                    >
                      {status}
                    </span>
                  </div>

                  <div className="text-[12px] text-gray-400 mt-2 truncate">
                    {o.items.map((it) => `${it.name}×${it.qty}`).join(' ')}
                  </div>

                  <div className="flex items-center justify-between mt-2">
                    <span className="text-[12px] text-gray-500">
                      {s.order_total}：
                      <span className="text-[#FF5339] font-semibold">¥{formatPrice(o.totalPayable)}</span>
                    </span>
                    <IcChevronRight size={14} className="text-gray-300" />
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      <TabBar />
    </div>
  );
};

export default OrdersPage;
