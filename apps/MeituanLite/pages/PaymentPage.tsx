import React from 'react';
import { useParams } from 'react-router-dom';
import { IcWallet, IcCard, IcChat, IcCheck, IcShield } from '../res/icons';
import { useMeituanLiteStore } from '../state';
import { useAppStrings } from '@/os/useAppStrings';
import { strings } from '../res/strings';
import { stringsEn } from '../res/strings.en';
import { useMeituanLiteGestures } from '../hooks/useMeituanLiteGestures';
import { formatPrice } from '../components/Price';
import type { PaymentMethod } from '../types';

const PaymentPage: React.FC = () => {
  const s = useAppStrings(strings, stringsEn);
  const { bindBack, go } = useMeituanLiteGestures();
  const { orderId } = useParams<{ orderId: string }>();

  const order = useMeituanLiteStore((st) => st.orders.find((o) => o.id === orderId));
  const paymentMethod = useMeituanLiteStore((st) => st.paymentMethod);
  const balance = useMeituanLiteStore((st) => st.userProfile.balance);
  const selectPayment = useMeituanLiteStore((st) => st.selectPayment);
  const markOrderPaid = useMeituanLiteStore((st) => st.markOrderPaid);

  const methods: Array<{
    id: PaymentMethod;
    label: string;
    icon: React.FC<any>;
    iconColor: string;
    desc?: string;
  }> = [
    { id: 'balance', label: s.pay_method_balance, icon: IcWallet, iconColor: '#FFB000', desc: `${s.pay_balance} ¥${formatPrice(balance)}` },
    { id: 'bankcard', label: s.pay_method_bankcard, icon: IcCard, iconColor: '#3B8BFF' },
    { id: 'wechat', label: s.pay_method_wechat, icon: IcChat, iconColor: '#26C261' },
    { id: 'alipay', label: s.pay_method_alipay, icon: IcShield, iconColor: '#1677FF' },
  ];

  const handleConfirm = () => {
    if (!order) return;
    markOrderPaid(order.id);
    go('payment.toSuccess', { orderId: order.id });
  };

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

  return (
    <div className="h-full flex flex-col bg-gray-50" data-status-bar-foreground="dark">
      {/* 顶部栏 */}
      <div className="flex-shrink-0 bg-white pt-10 px-3 pb-2 flex items-center border-b border-gray-100">
        <button type="button" {...bindBack<HTMLButtonElement>()} className="p-1">
          <span className="text-[16px] text-gray-800">{s.back}</span>
        </button>
        <span className="text-[15px] font-bold text-gray-900 flex-1 text-center">{s.pay_title}</span>
        <span className="w-8" />
      </div>

      {/* 内容 */}
      <div className="flex-1 overflow-y-auto" data-scroll-container="main" data-scroll-direction="vertical">
        {/* 金额 */}
        <div className="bg-white px-3 py-6 flex flex-col items-center">
          <span className="text-[12px] text-gray-400">{s.pay_amount}</span>
          <span className="text-[32px] font-bold text-[#FF5339] mt-1">
            ¥{formatPrice(order.totalPayable)}
          </span>
        </div>

        {/* 支付方式 */}
        <div className="bg-white mt-2">
          <div className="px-3 pt-3 pb-1 text-[12px] text-gray-400">{s.pay_method}</div>
          {methods.map((m) => {
            const Icon = m.icon;
            const selected = paymentMethod === m.id;
            return (
              <button
                key={m.id}
                type="button"
                onClick={() => selectPayment(m.id)}
                className="w-full flex items-center gap-3 px-3 py-3 border-b border-gray-50 active:bg-gray-50"
              >
                <span
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white"
                  style={{ background: m.iconColor }}
                >
                  <Icon size={18} />
                </span>
                <div className="flex-1 text-left">
                  <div className="text-[14px] text-gray-800">{m.label}</div>
                  {m.desc && <div className="text-[11px] text-gray-400">{m.desc}</div>}
                </div>
                <span
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    selected ? 'border-[#FFC300] bg-[#FFC300]' : 'border-gray-300'
                  }`}
                >
                  {selected && <IcCheck size={12} className="text-white" strokeWidth={3} />}
                </span>
              </button>
            );
          })}
        </div>

        {/* 模拟支付提示 */}
        <div className="mx-3 mt-3 px-3 py-2 rounded-lg bg-[#FFF3D6] flex items-center gap-2">
          <IcShield size={14} className="text-[#FFB000] flex-shrink-0" />
          <span className="text-[11px] text-[#B8860B]">{s.pay_simulated_notice}</span>
        </div>
        <div className="h-4" />
      </div>

      {/* 底部确认支付 */}
      <div className="flex-shrink-0 bg-white px-3 py-2 border-t border-gray-100">
        <button
          type="button"
          onClick={handleConfirm}
          className="w-full py-3 rounded-full bg-[#FFC300] text-[#1a1a1a] text-[15px] font-bold active:brightness-95"
        >
          {s.pay_confirm} ¥{formatPrice(order.totalPayable)}
        </button>
      </div>
    </div>
  );
};

export default PaymentPage;
