import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { IcNavBack } from '../res/icons';
import { useTaobaoGestures } from '../navigation';
import { useTaobaoStrings } from '../hooks/useTaobaoStrings';
import { useTaobaoStore } from '../state';
import type { Order, OrderItem } from '../types';

const REFUND_REASONS = [
  '不喜欢/不想要',
  '商品与描述不符',
  '质量问题',
  '发错货',
  '其他',
];

const RefundPage: React.FC = () => {
  const { orderId, itemId } = useParams<{ orderId: string; itemId: string }>();
  const { bindBack, back } = useTaobaoGestures();
  const s = useTaobaoStrings();

  const order = useTaobaoStore((st) =>
    orderId ? st.orders.find((o: Order) => o.id === orderId) : undefined,
  );
  const requestRefund = useTaobaoStore((st) => st.requestRefund);

  const [reason, setReason] = useState('');
  const [note, setNote] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const item: OrderItem | undefined = order?.items.find((i: OrderItem) => i.id === itemId);

  if (!order || !item || !orderId || !itemId) {
    return (
      <div className="h-full flex flex-col bg-gray-50 pt-10" data-status-bar-foreground="dark">
        <div className="flex items-center px-3 pb-3">
          <button type="button" {...bindBack()} className="p-1 -ml-1">
            <IcNavBack size={22} className="text-gray-800" />
          </button>
          <span className="text-[17px] font-bold text-gray-900 ml-2">{s.refund_title}</span>
        </div>
        <div className="flex-1 flex items-center justify-center text-[13px] text-gray-400">
          订单或商品不存在
        </div>
      </div>
    );
  }

  const isDuplicate = item.refundStatus !== 'none';
  const canSubmit = reason && !isDuplicate && !submitted;

  const handleSubmit = () => {
    if (!canSubmit) return;
    requestRefund(orderId, itemId, reason, note);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="h-full flex flex-col bg-gray-50" data-status-bar-foreground="dark">
        <div className="flex-shrink-0 bg-white pt-10 px-3 pb-3 border-b border-gray-100">
          <span className="text-[17px] font-bold text-gray-900">{s.refund_title}</span>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center px-6">
          <div className="w-20 h-20 bg-[#26C261] rounded-full flex items-center justify-center mb-4">
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <p className="text-[18px] font-bold text-gray-800 mb-1">退款申请已提交</p>
          <p className="text-[13px] text-gray-500 mb-8 text-center">请耐心等待商家处理</p>
          <button
            type="button"
            onClick={() => back(2)}
            className="w-full max-w-xs py-3 text-[14px] text-white bg-[#FF6A00] rounded-lg font-medium active:bg-[#e66000]"
          >
            返回订单
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
        <span className="text-[17px] font-bold text-gray-900">{s.refund_title}</span>
      </div>

      <div
        className="flex-1 overflow-y-auto"
        data-scroll-container="main"
        data-scroll-direction="vertical"
      >
        {/* Item info */}
        <div className="bg-white mx-3 mt-3 rounded-lg p-3 flex items-start gap-3">
          <div className="w-16 h-16 bg-gray-100 rounded flex items-center justify-center flex-shrink-0">
            <span className="text-[10px] text-gray-400">商品</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[13px] text-gray-800 leading-snug">{item.productTitle}</p>
            <p className="text-[11px] text-gray-400 mt-0.5">
              {Object.values(item.skuAttributes).join(' / ')} x{item.quantity}
            </p>
            <p className="text-[13px] font-semibold text-gray-800 mt-1">
              ¥{(item.unitPrice * item.quantity).toFixed(2)}
            </p>
          </div>
        </div>

        {/* Duplicate warning */}
        {isDuplicate && (
          <div className="mx-3 mt-3 px-3 py-2 bg-[#FFF3E0] rounded-lg">
            <p className="text-[12px] text-[#FF6A00]">{s.refund_duplicate}</p>
          </div>
        )}

        {/* Reason selector */}
        <div className="bg-white mx-3 mt-3 rounded-lg p-4">
          <p className="text-[14px] font-semibold text-gray-800 mb-3">{s.refund_reason}</p>
          <div className="space-y-2">
            {REFUND_REASONS.map((r) => (
              <label
                key={r}
                className={`flex items-center gap-3 px-3 py-3 rounded-lg border cursor-pointer ${
                  reason === r
                    ? 'border-[#FF6A00] bg-[#FFF8F0]'
                    : 'border-gray-200 bg-white'
                } ${isDuplicate ? 'opacity-50 pointer-events-none' : ''}`}
              >
                <input
                  type="radio"
                  name="refundReason"
                  value={r}
                  checked={reason === r}
                  onChange={() => setReason(r)}
                  disabled={isDuplicate}
                  className="accent-[#FF6A00]"
                />
                <span className="text-[13px] text-gray-700">{r}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Note */}
        <div className="bg-white mx-3 mt-3 rounded-lg p-4">
          <p className="text-[14px] font-semibold text-gray-800 mb-2">{s.refund_note}</p>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder={s.refund_note_placeholder}
            disabled={isDuplicate}
            className="w-full h-24 text-[13px] text-gray-700 border border-gray-200 rounded-lg p-3 resize-none outline-none focus:border-[#FF6A00] placeholder:text-gray-300 disabled:bg-gray-50"
          />
        </div>

        {/* Submit button */}
        <div className="px-3 mt-6 mb-6">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!canSubmit}
            className={`w-full py-3 text-[14px] font-medium rounded-lg ${
              canSubmit
                ? 'text-white bg-[#FF6A00] active:bg-[#e66000]'
                : 'text-gray-400 bg-gray-200 cursor-not-allowed'
            }`}
          >
            {s.refund_submit}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RefundPage;
