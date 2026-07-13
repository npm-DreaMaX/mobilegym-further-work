import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { IcNavBack, IcOrder } from '../res/icons';
import { useTaobaoGestures } from '../navigation';
import { useTaobaoStrings } from '../hooks/useTaobaoStrings';
import { useTaobaoStore } from '../state';
import TabBar from '../components/TabBar';
import type { Order } from '../types';

const ORDER_TABS: { key: string; labelKey: string }[] = [
  { key: 'all', labelKey: 'order_all' },
  { key: 'pending_payment', labelKey: 'order_pending_payment' },
  { key: 'to_ship', labelKey: 'order_to_ship' },
  { key: 'shipped', labelKey: 'order_shipped' },
  { key: 'received', labelKey: 'order_received' },
];

const STATUS_LABEL: Record<string, string> = {
  pending_payment: '待付款',
  paid: '已付款',
  to_ship: '待发货',
  shipped: '待收货',
  delivered: '已送达',
  received: '已完成',
  cancelled: '已取消',
};

const STATUS_COLOR: Record<string, string> = {
  pending_payment: '#FF6A00',
  paid: '#3B8BFF',
  to_ship: '#3B8BFF',
  shipped: '#FF6A00',
  delivered: '#26C261',
  received: '#9B9B9B',
  cancelled: '#9B9B9B',
};

const OrdersPage: React.FC = () => {
  const s = useTaobaoStrings();
  const { go, bindBack } = useTaobaoGestures();
  const [searchParams, setSearchParams] = useSearchParams();
  const currentTab = searchParams.get('tab') || 'all';
  const orders = useTaobaoStore((st) => st.orders);
  const products = useTaobaoStore((st) => st.products);
  const cancelOrder = useTaobaoStore((st) => st.cancelOrder);

  const filteredOrders = orders.filter((o: Order) => {
    if (currentTab === 'all') return true;
    return o.status === currentTab;
  });

  const handleTabSwitch = (tabKey: string) => {
    setSearchParams(tabKey === 'all' ? {} : { tab: tabKey });
  };

  const handleCancel = (e: React.MouseEvent, orderId: string) => {
    e.stopPropagation();
    const confirmed = window.confirm(s.order_cancel_confirm);
    if (confirmed) {
      cancelOrder(orderId);
    }
  };

  const orderCounts = orders.reduce<Record<string, number>>((acc, o: Order) => {
    acc[o.status] = (acc[o.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="h-full flex flex-col bg-gray-50" data-status-bar-foreground="dark">
      {/* Header */}
      <div className="flex-shrink-0 bg-white pt-10 px-3 pb-3 border-b border-gray-100 flex items-center gap-3">
        <button type="button" {...bindBack()} className="p-1 -ml-1">
          <IcNavBack size={22} className="text-gray-800" />
        </button>
        <span className="text-[17px] font-bold text-gray-900">{s.order_title}</span>
      </div>

      {/* Tabs */}
      <div className="flex-shrink-0 bg-white border-b border-gray-100 flex overflow-x-auto">
        {ORDER_TABS.map((tab) => {
          const isActive = currentTab === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => handleTabSwitch(tab.key)}
              className={`flex-shrink-0 px-4 py-3 text-[13px] font-medium relative ${
                isActive ? 'text-app-primary' : 'text-gray-600'
              }`}
            >
              {s[tab.labelKey as keyof typeof s] as string}
              {tab.key !== 'all' && orderCounts[tab.key] ? (
                <span className="ml-1 text-[10px] text-gray-400">({orderCounts[tab.key]})</span>
              ) : null}
              {isActive && (
                <div className="absolute bottom-0 left-1/4 right-1/4 h-[2px] bg-app-primary rounded-full" />
              )}
            </button>
          );
        })}
      </div>

      {/* Order list */}
      <div
        className="flex-1 overflow-y-auto"
        data-scroll-container="main"
        data-scroll-direction="vertical"
      >
        {filteredOrders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24">
            <IcOrder size={48} className="text-gray-300 mb-3" />
            <span className="text-[13px] text-gray-400">暂无订单</span>
          </div>
        ) : (
          <div className="py-2 space-y-2 px-3">
            {filteredOrders.map((order: Order) => {
              const firstItem = order.items[0];
              const product = firstItem ? products[firstItem.productId] : null;
              const otherCount = order.items.length - 1;

              return (
                <button
                  key={order.id}
                  type="button"
                  onClick={() => go('order.detail.open', { id: order.id })}
                  className="w-full text-left bg-white rounded-lg overflow-hidden active:bg-gray-50"
                >
                  {/* Header: order id + status */}
                  <div className="flex items-center justify-between px-3 pt-3 pb-2">
                    <span className="text-[11px] text-gray-500">
                      {order.id.slice(0, 12)}...
                    </span>
                    <span
                      className="text-[12px] font-semibold"
                      style={{ color: STATUS_COLOR[order.status] ?? '#9B9B9B' }}
                    >
                      {STATUS_LABEL[order.status] || order.status}
                    </span>
                  </div>

                  {/* Items summary */}
                  <div className="px-3 pb-2 flex items-center gap-2">
                    <div className="w-16 h-16 bg-gray-100 rounded flex items-center justify-center flex-shrink-0">
                      <IcOrder size={24} className="text-gray-300" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] text-gray-800 truncate">{firstItem?.productTitle ?? '商品'}</p>
                      <p className="text-[11px] text-gray-400 mt-0.5">
                        {firstItem ? (
                          <>
                            {Object.values(firstItem.skuAttributes).join(' / ')}
                            {' x'}
                            {firstItem.quantity}
                          </>
                        ) : null}
                      </p>
                      {otherCount > 0 && (
                        <p className="text-[11px] text-gray-400 mt-0.5">等{order.items.length}件商品</p>
                      )}
                    </div>
                  </div>

                  {/* Totals */}
                  <div className="flex items-center justify-between px-3 py-2 border-t border-gray-50">
                    <span className="text-[12px] text-gray-500">
                      共{order.items.reduce((sum, it) => sum + it.quantity, 0)}件商品
                    </span>
                    <span className="text-[12px] text-gray-500">
                      实付：<span className="text-[15px] font-bold text-[#FF5339]">¥{order.payable}</span>
                    </span>
                  </div>

                  {/* Action buttons */}
                  {order.status === 'pending_payment' && (
                    <div className="flex justify-end gap-2 px-3 pb-3 pt-1">
                      <button
                        type="button"
                        onClick={(e) => handleCancel(e, order.id)}
                        className="px-3 py-1.5 text-[12px] text-gray-600 border border-gray-300 rounded-full"
                      >
                        {s.order_cancel}
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          // Navigate to payment page
                          go('checkout.payment.open', { orderId: order.id });
                        }}
                        className="px-4 py-1.5 text-[12px] text-white bg-[#FF6A00] rounded-full"
                      >
                        {s.order_pay}
                      </button>
                    </div>
                  )}

                  {order.status === 'to_ship' && (
                    <div className="flex justify-end px-3 pb-3 pt-1">
                      <button
                        type="button"
                        onClick={(e) => handleCancel(e, order.id)}
                        className="px-3 py-1.5 text-[12px] text-gray-600 border border-gray-300 rounded-full"
                      >
                        {s.order_cancel}
                      </button>
                    </div>
                  )}

                  {(order.status === 'shipped' || order.status === 'delivered') && (
                    <div className="flex justify-end gap-2 px-3 pb-3 pt-1">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          go('orderDetail.logistics.open', { id: order.id });
                        }}
                        className="px-3 py-1.5 text-[12px] text-gray-600 border border-gray-300 rounded-full"
                      >
                        {s.order_track}
                      </button>
                      {order.status === 'delivered' && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            window.confirm(s.order_confirm_receipt_confirm) &&
                              useTaobaoStore.getState().confirmReceipt(order.id);
                          }}
                          className="px-3 py-1.5 text-[12px] text-white bg-[#FF6A00] rounded-full"
                        >
                          {s.order_confirm_receipt}
                        </button>
                      )}
                    </div>
                  )}

                  {order.status === 'received' && (
                    <div className="flex justify-end gap-2 px-3 pb-3 pt-1">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          go('orderDetail.logistics.open', { id: order.id });
                        }}
                        className="px-3 py-1.5 text-[12px] text-gray-600 border border-gray-300 rounded-full"
                      >
                        {s.order_track}
                      </button>
                      {order.items.some((it) => !it.reviewId) && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            const unreviewedItem = order.items.find((it) => !it.reviewId);
                            if (unreviewedItem) {
                              go('orderDetail.review.open', { id: order.id, itemId: unreviewedItem.id });
                            }
                          }}
                          className="px-3 py-1.5 text-[12px] text-white bg-[#FF6A00] rounded-full"
                        >
                          {s.order_review}
                        </button>
                      )}
                    </div>
                  )}
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
