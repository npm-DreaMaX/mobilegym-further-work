import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { IcNavBack, IcPayment } from '../res/icons';
import { useTaobaoGestures } from '../navigation';
import { useTaobaoStrings } from '../hooks/useTaobaoStrings';
import { useTaobaoStore } from '../state';
import type { Order } from '../types';

const PaymentPage: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const { bindBack } = useTaobaoGestures();
  const s = useTaobaoStrings();

  const order = useTaobaoStore((st) =>
    orderId ? st.orders.find((o: Order) => o.id === orderId) : undefined,
  );
  const payOrder = useTaobaoStore((st) => st.payOrder);

  const [paid, setPaid] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!order || !orderId) {
    return (
      <div className="h-full flex flex-col bg-gray-50 pt-10" data-status-bar-foreground="dark">
        <div className="flex items-center px-3 pb-3">
          <button type="button" {...bindBack()} className="p-1 -ml-1">
            <IcNavBack size={22} className="text-gray-800" />
          </button>
          <span className="text-[17px] font-bold text-gray-900 ml-2">{s.payment_title}</span>
        </div>
        <div className="flex-1 flex items-center justify-center text-[13px] text-gray-400">
          订单不存在
        </div>
      </div>
    );
  }

  const handlePay = () => {
    if (order.status !== 'pending_payment') {
      setError('该订单已支付或已关闭');
      return;
    }
    payOrder(orderId);
    setPaid(true);
    setError(null);
  };

  const totalItems = order.items.reduce((sum, it) => sum + it.quantity, 0);

  if (paid) {
    return (
      <div className="h-full flex flex-col bg-gray-50" data-status-bar-foreground="dark">
        <div className="flex-shrink-0 bg-white pt-10 px-3 pb-3 border-b border-gray-100 flex items-center gap-3">
          <button type="button" {...bindBack()} className="p-1 -ml-1">
            <IcNavBack size={22} className="text-gray-800" />
          </button>
          <span className="text-[17px] font-bold text-gray-900">{s.payment_title}</span>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center px-6">
          <div className="w-20 h-20 bg-[#26C261] rounded-full flex items-center justify-center mb-4">
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <p className="text-[18px] font-bold text-gray-800 mb-2">{s.payment_success}</p>
          <p className="text-[13px] text-gray-500 mb-1">
            {s.payment_amount}: ¥{order.payable}
          </p>
          <p className="text-[12px] text-gray-400 mb-8">
            订单编号: {orderId.slice(0, 16)}...
          </p>
          <button
            type="button"
            onClick={() => navigate('/orders')}
            className="w-full max-w-xs py-3 text-[14px] text-white bg-[#FF6A00] rounded-lg font-medium active:bg-[#e66000]"
          >
            查看订单
          </button>
          <button
            type="button"
            onClick={() => navigate('/')}
            className="w-full max-w-xs py-3 mt-3 text-[14px] text-gray-600 border border-gray-300 rounded-lg font-medium active:bg-gray-50"
          >
            返回首页
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-gray-50" data-status-bar-foreground="dark">
      {/* Header */}
      <div className="flex-shrink-0 bg-white pt-10 px-3 pb-3 border-b border-gray-100 flex items-center gap-3">
        <button type="button" {...bindBack()} className="p-1 -ml-1">
          <IcNavBack size={22} className="text-gray-800" />
        </button>
        <span className="text-[17px] font-bold text-gray-900">{s.payment_title}</span>
      </div>

      <div
        className="flex-1 overflow-y-auto"
        data-scroll-container="main"
        data-scroll-direction="vertical"
      >
        {/* Order summary */}
        <div className="bg-white mt-3 mx-3 rounded-lg p-4">
          <div className="flex items-center gap-3 pb-3 border-b border-gray-100">
            <IcPayment size={20} className="text-[#FF6A00]" />
            <span className="text-[14px] font-semibold text-gray-800">{s.payment_method}</span>
            <span className="text-[13px] text-gray-500 ml-auto">模拟支付</span>
          </div>

          <div className="py-4 flex flex-col items-center">
            <p className="text-[12px] text-gray-500 mb-1">{s.payment_amount}</p>
            <p className="text-[36px] font-bold text-[#FF5339]">¥{order.payable}</p>
          </div>

          <div className="space-y-2 text-[13px] text-gray-500">
            <div className="flex justify-between">
              <span>商品数量</span>
              <span>{totalItems}件</span>
            </div>
            <div className="flex justify-between">
              <span>订单编号</span>
              <span className="text-gray-400">{orderId.slice(0, 16)}...</span>
            </div>
          </div>

          {error && (
            <p className="text-[12px] text-red-500 mt-3 text-center">{error}</p>
          )}
        </div>

        {/* Pay button */}
        <div className="px-3 mt-6">
          <button
            type="button"
            onClick={handlePay}
            className="w-full py-4 text-[16px] text-white bg-[#FF6A00] rounded-lg font-bold active:bg-[#e66000] shadow-lg shadow-[#FF6A00]/30"
          >
            {s.payment_simulate} ¥{order.payable}
          </button>
          <button
            type="button"
            {...bindBack()}
            className="w-full py-3 mt-3 text-[14px] text-gray-500 text-center"
          >
            {s.payment_cancel}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;
