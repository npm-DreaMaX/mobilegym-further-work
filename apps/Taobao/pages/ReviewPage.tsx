import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { IcNavBack, IcStar } from '../res/icons';
import { useTaobaoGestures } from '../navigation';
import { useTaobaoStrings } from '../hooks/useTaobaoStrings';
import { useTaobaoStore } from '../state';
import type { Order, OrderItem } from '../types';

const TAG_OPTIONS = [
  '质量好',
  '性价比高',
  '物流快',
  '包装精美',
  '卖家服务好',
  '穿着舒适',
  '效果好',
  '味道好',
];

const ReviewPage: React.FC = () => {
  const { orderId, itemId } = useParams<{ orderId: string; itemId: string }>();
  const { bindBack, back } = useTaobaoGestures();
  const s = useTaobaoStrings();

  const order = useTaobaoStore((st) =>
    orderId ? st.orders.find((o: Order) => o.id === orderId) : undefined,
  );
  const submitReview = useTaobaoStore((st) => st.submitReview);

  const [rating, setRating] = useState(0);
  const [content, setContent] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);

  const item: OrderItem | undefined = order?.items.find((i: OrderItem) => i.id === itemId);

  if (!order || !item || !orderId || !itemId) {
    return (
      <div className="h-full flex flex-col bg-gray-50 pt-10" data-status-bar-foreground="dark">
        <div className="flex items-center px-3 pb-3">
          <button type="button" {...bindBack()} className="p-1 -ml-1">
            <IcNavBack size={22} className="text-gray-800" />
          </button>
          <span className="text-[17px] font-bold text-gray-900 ml-2">{s.review_title}</span>
        </div>
        <div className="flex-1 flex items-center justify-center text-[13px] text-gray-400">
          订单或商品不存在
        </div>
      </div>
    );
  }

  const alreadyReviewed = !!item.reviewId;
  const canSubmit = rating > 0 && !alreadyReviewed && !submitted;

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );
  };

  const handleSubmit = () => {
    if (!canSubmit) return;
    submitReview(orderId, itemId, rating, content, selectedTags);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="h-full flex flex-col bg-gray-50" data-status-bar-foreground="dark">
        <div className="flex-shrink-0 bg-white pt-10 px-3 pb-3 border-b border-gray-100">
          <span className="text-[17px] font-bold text-gray-900">{s.review_title}</span>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center px-6">
          <div className="w-20 h-20 bg-[#26C261] rounded-full flex items-center justify-center mb-4">
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <p className="text-[18px] font-bold text-gray-800 mb-1">{s.review_success}</p>
          <p className="text-[13px] text-gray-500 mb-8 text-center">感谢你的评价</p>
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
        <span className="text-[17px] font-bold text-gray-900">{s.review_title}</span>
      </div>

      <div
        className="flex-1 overflow-y-auto"
        data-scroll-container="main"
        data-scroll-direction="vertical"
      >
        {/* Item info */}
        <div className="bg-white mx-3 mt-3 rounded-lg p-3 flex items-start gap-3">
          <div className="w-14 h-14 bg-gray-100 rounded flex items-center justify-center flex-shrink-0">
            <span className="text-[10px] text-gray-400">商品</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[13px] text-gray-800 leading-snug line-clamp-2">{item.productTitle}</p>
            <p className="text-[11px] text-gray-400 mt-0.5">
              {Object.values(item.skuAttributes).join(' / ')} x{item.quantity}
            </p>
          </div>
        </div>

        {/* Already reviewed notice */}
        {alreadyReviewed && (
          <div className="mx-3 mt-3 px-3 py-2 bg-gray-100 rounded-lg">
            <p className="text-[12px] text-gray-500">该商品已评价</p>
          </div>
        )}

        {/* Rating */}
        <div className="bg-white mx-3 mt-3 rounded-lg p-4">
          <p className="text-[14px] font-semibold text-gray-800 mb-3">{s.review_rating}</p>
          <div className="flex justify-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => !alreadyReviewed && setRating(star)}
                disabled={alreadyReviewed}
                className="p-1"
              >
                <IcStar
                  size={32}
                  className={
                    star <= rating
                      ? 'text-[#FFB000] fill-[#FFB000]'
                      : 'text-gray-200 fill-gray-200'
                  }
                />
              </button>
            ))}
          </div>
          <p className="text-center text-[12px] text-gray-400 mt-2">
            {rating === 0 && '点击评分'}
            {rating === 1 && '非常差'}
            {rating === 2 && '较差'}
            {rating === 3 && '一般'}
            {rating === 4 && '满意'}
            {rating === 5 && '非常满意'}
          </p>
        </div>

        {/* Content */}
        <div className="bg-white mx-3 mt-3 rounded-lg p-4">
          <p className="text-[14px] font-semibold text-gray-800 mb-2">{s.review_content}</p>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={s.review_content_placeholder}
            disabled={alreadyReviewed}
            className="w-full h-24 text-[13px] text-gray-700 border border-gray-200 rounded-lg p-3 resize-none outline-none focus:border-[#FF6A00] placeholder:text-gray-300 disabled:bg-gray-50"
          />
        </div>

        {/* Tags */}
        <div className="bg-white mx-3 mt-3 rounded-lg p-4">
          <p className="text-[14px] font-semibold text-gray-800 mb-3">{s.review_tags}</p>
          <div className="flex flex-wrap gap-2">
            {TAG_OPTIONS.map((tag) => {
              const isSelected = selectedTags.includes(tag);
              return (
                <button
                  key={tag}
                  type="button"
                  onClick={() => !alreadyReviewed && toggleTag(tag)}
                  disabled={alreadyReviewed}
                  className={`px-3 py-1.5 text-[12px] rounded-full border ${
                    isSelected
                      ? 'border-[#FF6A00] bg-[#FFF8F0] text-[#FF6A00]'
                      : 'border-gray-200 text-gray-600 bg-white'
                  } ${alreadyReviewed ? 'opacity-50' : ''}`}
                >
                  {tag}
                </button>
              );
            })}
          </div>
        </div>

        {/* Submit */}
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
            {s.review_submit}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReviewPage;
