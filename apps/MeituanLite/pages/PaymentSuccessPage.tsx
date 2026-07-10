import React from 'react';
import { useParams } from 'react-router-dom';
import { IcCheck } from '../res/icons';
import { useMeituanLiteStore } from '../state';
import { useAppStrings } from '@/os/useAppStrings';
import { strings } from '../res/strings';
import { stringsEn } from '../res/strings.en';
import { useMeituanLiteGestures } from '../hooks/useMeituanLiteGestures';

const PaymentSuccessPage: React.FC = () => {
  const s = useAppStrings(strings, stringsEn);
  const { go } = useMeituanLiteGestures();
  const { orderId } = useParams<{ orderId: string }>();

  const order = useMeituanLiteStore((st) => st.orders.find((o) => o.id === orderId));

  return (
    <div className="h-full flex flex-col bg-white" data-status-bar-foreground="dark">
      {/* 顶部留白状态栏 */}
      <div className="pt-10" />

      {/* 成标 */}
      <div className="flex flex-col items-center pt-6 pb-4">
        <span className="w-16 h-16 rounded-full bg-[#26C261] flex items-center justify-center text-white">
          <IcCheck size={40} strokeWidth={3} />
        </span>
        <span className="text-[18px] font-bold text-gray-900 mt-3">{s.pay_success_title}</span>
        <span className="text-[13px] text-gray-400 mt-1">{s.pay_success_status}</span>
      </div>

      {/* 订单信息 */}
      <div className="bg-gray-50 mx-3 rounded-xl px-3 py-3 text-[13px]">
        <div className="flex justify-between py-1">
          <span className="text-gray-400">{s.pay_success_order_no}</span>
          <span className="text-gray-800">{order?.id ?? '-'}</span>
        </div>
        <div className="flex justify-between py-1">
          <span className="text-gray-400">{s.pay_success_eta}</span>
          <span className="text-gray-800">{order?.etaText ?? '-'}</span>
        </div>
        <div className="flex justify-between py-1">
          <span className="text-gray-400">{s.order_status}</span>
          <span className="text-[#26C261]">{s.pay_success_status}</span>
        </div>
      </div>

      <div className="flex-1" />

      {/* 操作按钮 */}
      <div className="px-4 pb-4 flex flex-col gap-2">
        <button
          type="button"
          onClick={() => order && go('paymentSuccess.viewOrder', { orderId: order.id })}
          className="w-full py-3 rounded-full bg-[#FFC300] text-[#1a1a1a] text-[15px] font-bold active:brightness-95"
        >
          {s.pay_success_view_order}
        </button>
        <button
          type="button"
          onClick={() => go('paymentSuccess.backHome')}
          className="w-full py-3 rounded-full border border-gray-200 text-gray-600 text-[14px] active:bg-gray-50"
        >
          {s.pay_success_back_home}
        </button>
      </div>
    </div>
  );
};

export default PaymentSuccessPage;
