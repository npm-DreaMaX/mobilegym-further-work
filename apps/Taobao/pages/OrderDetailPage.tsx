import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { IcNavBack, IcLocation, IcCoupon, IcTruck } from '../res/icons';
import { useTaobaoGestures } from '../navigation';
import { useTaobaoStrings } from '../hooks/useTaobaoStrings';
import { useTaobaoStore } from '../state';
import * as TimeService from '../../../os/TimeService';
import type { Order, OrderItem } from '../types';

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

function formatTime(ts: number): string {
  const d = TimeService.fromTimestamp(ts);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const h = String(d.getHours()).padStart(2, '0');
  const min = String(d.getMinutes()).padStart(2, '0');
  return `${y}-${m}-${day} ${h}:${min}`;
}

const OrderDetailPage: React.FC = () => {
  const { id: orderId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { go, bindBack } = useTaobaoGestures();
  const s = useTaobaoStrings();

  const order = useTaobaoStore((st) =>
    orderId ? st.orders.find((o: Order) => o.id === orderId) : undefined,
  );
  const cancelOrder = useTaobaoStore((st) => st.cancelOrder);
  const confirmReceipt = useTaobaoStore((st) => st.confirmReceipt);

  if (!order || !orderId) {
    return (
      <div className="h-full flex flex-col bg-gray-50 pt-10" data-status-bar-foreground="dark">
        <div className="flex items-center px-3 pb-3">
          <button type="button" {...bindBack()} className="p-1 -ml-1">
            <IcNavBack size={22} className="text-gray-800" />
          </button>
          <span className="text-[17px] font-bold text-gray-900 ml-2">{s.order_detail}</span>
        </div>
        <div className="flex-1 flex items-center justify-center text-[13px] text-gray-400">
          订单不存在
        </div>
      </div>
    );
  }

  const timeline: { label: string; time?: number }[] = [
    { label: '创建订单', time: order.createdAt },
    { label: '付款', time: order.paidAt },
    { label: '发货', time: order.shippedAt },
    { label: '送达', time: order.deliveredAt },
    { label: '确认收货', time: order.receivedAt },
    { label: '已取消', time: order.cancelledAt },
  ].filter((t) => t.time !== undefined);

  const handleCancelWithConfirm = () => {
    const confirmed = window.confirm(s.order_cancel_confirm);
    if (confirmed) {
      cancelOrder(orderId);
    }
  };

  const handleConfirmReceipt = () => {
    const confirmed = window.confirm(s.order_confirm_receipt_confirm);
    if (confirmed) {
      confirmReceipt(orderId);
    }
  };

  return (
    <div className="h-full flex flex-col bg-gray-50" data-status-bar-foreground="dark">
      {/* Header */}
      <div className="flex-shrink-0 bg-white pt-10 px-3 pb-3 border-b border-gray-100 flex items-center gap-3">
        <button type="button" {...bindBack()} className="p-1 -ml-1">
          <IcNavBack size={22} className="text-gray-800" />
        </button>
        <span className="text-[17px] font-bold text-gray-900">{s.order_detail}</span>
      </div>

      <div
        className="flex-1 overflow-y-auto"
        data-scroll-container="main"
        data-scroll-direction="vertical"
      >
        {/* Status banner */}
        <div className="bg-white px-4 py-4 flex items-center justify-between">
          <div>
            <span
              className="text-[15px] font-bold"
              style={{ color: STATUS_COLOR[order.status] ?? '#9B9B9B' }}
            >
              {STATUS_LABEL[order.status] || order.status}
            </span>
            {order.status === 'shipped' && (
              <p className="text-[12px] text-gray-500 mt-0.5">预计很快送达，请保持电话畅通</p>
            )}
          </div>
          <span className="text-[11px] text-gray-400">
            {s.order_id}: {order.id.slice(0, 16)}...
          </span>
        </div>

        {/* Items */}
        <div className="bg-white mt-2 px-4 py-3">
          <p className="text-[14px] font-semibold text-gray-800 mb-2">{s.order_items}</p>
          {order.items.map((item: OrderItem) => (
            <div key={item.id} className="flex items-start gap-3 py-2 border-b border-gray-50 last:border-b-0">
              <div className="w-16 h-16 bg-gray-100 rounded flex items-center justify-center flex-shrink-0">
                <span className="text-[10px] text-gray-400">商品</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] text-gray-800 leading-snug line-clamp-2">{item.productTitle}</p>
                <p className="text-[11px] text-gray-400 mt-0.5">
                  {Object.values(item.skuAttributes).join(' / ')}
                </p>
                <p className="text-[12px] text-gray-500 mt-1">
                  ¥{item.unitPrice} x {item.quantity}
                </p>
              </div>
              <div className="flex flex-col items-end gap-1">
                <span className="text-[13px] font-semibold text-gray-800">
                  ¥{(item.unitPrice * item.quantity).toFixed(2)}
                </span>
                {item.refundStatus !== 'none' && (
                  <span className="text-[10px] text-[#FF6A00]">
                    {item.refundStatus === 'requested' ? '退款中' : '已退款'}
                  </span>
                )}
                {order.status === 'received' && !item.reviewId && (
                  <button
                    type="button"
                    onClick={() => go('orderDetail.review.open', { id: orderId, itemId: item.id })}
                    className="text-[11px] text-[#FF6A00] underline"
                  >
                    {s.order_review}
                  </button>
                )}
                {order.status === 'received' && item.reviewId && (
                  <span className="text-[10px] text-gray-400">已评价</span>
                )}
                {(order.status === 'delivered' || order.status === 'received') && item.refundStatus === 'none' && (
                  <button
                    type="button"
                    onClick={() => go('orderDetail.refund.open', { id: orderId, itemId: item.id })}
                    className="text-[11px] text-gray-500 underline"
                  >
                    {s.order_refund}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Address */}
        <div className="bg-white mt-2 px-4 py-3">
          <div className="flex items-start gap-2">
            <IcLocation size={16} className="text-gray-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-[13px] text-gray-800 font-medium">
                {order.addressSnapshot.name} {order.addressSnapshot.phone}
              </p>
              <p className="text-[12px] text-gray-500 mt-0.5">
                {order.addressSnapshot.province}
                {order.addressSnapshot.city}
                {order.addressSnapshot.district}
                {order.addressSnapshot.detail}
              </p>
            </div>
          </div>
        </div>

        {/* Coupon */}
        {order.couponSnapshot && (
          <div className="bg-white mt-2 px-4 py-3">
            <div className="flex items-start gap-2">
              <IcCoupon size={16} className="text-[#FF6A00] mt-0.5 flex-shrink-0" />
              <div className="flex-1 flex items-center justify-between">
                <span className="text-[13px] text-gray-600">优惠券</span>
                <span className="text-[13px] text-[#FF5339]">-¥{order.couponSnapshot.discount}</span>
              </div>
            </div>
          </div>
        )}

        {/* Totals */}
        <div className="bg-white mt-2 px-4 py-3 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[13px] text-gray-500">{s.order_subtotal}</span>
            <span className="text-[13px] text-gray-800">¥{order.subtotal}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[13px] text-gray-500">{s.order_shipping}</span>
            <span className="text-[13px] text-gray-800">
              {order.shippingFee === 0 ? '免运费' : `¥${order.shippingFee}`}
            </span>
          </div>
          {order.discount > 0 && (
            <div className="flex items-center justify-between">
              <span className="text-[13px] text-gray-500">{s.order_discount}</span>
              <span className="text-[13px] text-[#FF5339]">-¥{order.discount}</span>
            </div>
          )}
          <div className="flex items-center justify-between border-t border-gray-100 pt-2">
            <span className="text-[13px] text-gray-800 font-medium">{s.order_payable}</span>
            <span className="text-[18px] font-bold text-[#FF5339]">¥{order.payable}</span>
          </div>
        </div>

        {/* Timeline */}
        <div className="bg-white mt-2 px-4 py-3 mb-2">
          <p className="text-[14px] font-semibold text-gray-800 mb-3">订单时间线</p>
          <div className="relative pl-5">
            <div className="absolute left-[7px] top-1 bottom-1 w-[1px] bg-gray-200" />
            {timeline.map((entry, idx) => (
              <div key={idx} className="relative pb-3 last:pb-0">
                <div
                  className={`absolute left-[-13px] top-[5px] w-[15px] h-[15px] rounded-full border-2 ${
                    idx === 0 ? 'border-[#FF6A00] bg-[#FF6A00]' : 'border-gray-300 bg-white'
                  }`}
                />
                <p className="text-[13px] text-gray-700">{entry.label}</p>
                {entry.time && (
                  <p className="text-[11px] text-gray-400 mt-0.5">{formatTime(entry.time)}</p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Action buttons */}
        <div className="px-4 py-3 mb-4 space-y-2">
          {order.status === 'pending_payment' && (
            <>
              <button
                type="button"
                onClick={() => navigate(`/payment/${orderId}`)}
                className="w-full py-3 text-[14px] text-white bg-[#FF6A00] rounded-lg font-medium active:bg-[#e66000]"
              >
                {s.order_pay}
              </button>
              <button
                type="button"
                onClick={handleCancelWithConfirm}
                className="w-full py-3 text-[14px] text-gray-600 border border-gray-300 rounded-lg font-medium active:bg-gray-50"
              >
                {s.order_cancel}
              </button>
            </>
          )}
          {order.status === 'to_ship' && (
            <button
              type="button"
              onClick={handleCancelWithConfirm}
              className="w-full py-3 text-[14px] text-gray-600 border border-gray-300 rounded-lg font-medium active:bg-gray-50"
            >
              {s.order_cancel}
            </button>
          )}
          {(order.status === 'shipped' || order.status === 'delivered') && (
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => go('orderDetail.logistics.open', { id: orderId })}
                className="flex-1 py-3 text-[14px] text-gray-600 border border-gray-300 rounded-lg font-medium flex items-center justify-center gap-1.5 active:bg-gray-50"
              >
                <IcTruck size={16} />
                {s.order_track}
              </button>
              {order.status === 'delivered' && (
                <button
                  type="button"
                  onClick={handleConfirmReceipt}
                  className="flex-1 py-3 text-[14px] text-white bg-[#FF6A00] rounded-lg font-medium active:bg-[#e66000]"
                >
                  {s.order_confirm_receipt}
                </button>
              )}
            </div>
          )}
          {order.status === 'received' && (
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => go('orderDetail.logistics.open', { id: orderId })}
                className="flex-1 py-3 text-[14px] text-gray-600 border border-gray-300 rounded-lg font-medium flex items-center justify-center gap-1.5 active:bg-gray-50"
              >
                <IcTruck size={16} />
                {s.order_track}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderDetailPage;
