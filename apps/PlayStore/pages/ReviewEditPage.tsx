import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { usePlayStoreNavigate } from '../navigation';
import { usePlayStoreStore } from '../state';
import { IconRenderer } from '../res/icons';
import { baseApps } from '../data';
import * as TimeService from '../../../os/TimeService';

const ReviewEditPage: React.FC = () => {
  const { appId } = useParams<{ appId: string }>();
  const { back } = usePlayStoreNavigate();

  const userReviews = usePlayStoreStore(s => s.userReviews);
  const ratings = usePlayStoreStore(s => s.ratings);
  const setRating = usePlayStoreStore(s => s.setRating);
  const addReview = usePlayStoreStore(s => s.addReview);
  const updateReview = usePlayStoreStore(s => s.updateReview);
  const deleteReview = usePlayStoreStore(s => s.deleteReview);

  const allApps = baseApps();
  const app = allApps.find(a => a.id === appId);

  const existingReview = userReviews.find(r => r.appId === appId);
  const existingRating = ratings[appId || ''] || 0;

  const [selectedRating, setSelectedRating] = useState(existingReview?.rating || existingRating || 0);
  const [content, setContent] = useState(existingReview?.content || '');
  const [submitted, setSubmitted] = useState(false);

  if (!app || !appId) {
    return (
      <div className="flex flex-col h-full bg-white pt-10 items-center justify-center">
        <p className="text-gray-400">App not found</p>
      </div>
    );
  }

  const handleSubmit = () => {
    if (selectedRating === 0) return;
    const now = TimeService.now(); // Record timestamp

    if (existingReview) {
      updateReview(existingReview.id, selectedRating, content.trim(), now);
    } else {
      setRating(appId, selectedRating);
      if (content.trim()) {
        addReview({
          id: `ur-${userReviews.length + 1}`,
          appId,
          rating: selectedRating,
          content: content.trim(),
          createdAt: now,
          updatedAt: now,
        });
      }
    }
    setSubmitted(true);
    setTimeout(() => back(), 500);
  };

  const handleDelete = () => {
    if (existingReview) {
      deleteReview(existingReview.id);
    }
    back();
  };

  return (
    <div className="flex flex-col h-full bg-gray-50" data-status-bar-foreground="dark">
      {/* Header */}
      <div className="bg-white pt-10 pb-3 px-4 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100"
              onClick={() => back()}
              data-trigger="system.back"
            >
              <IconRenderer name="IcBack" size={20} />
            </button>
            <span className="text-lg font-semibold text-gray-900">
              {existingReview ? '编辑评价' : '撰写评价'}
            </span>
          </div>
          {existingReview && (
            <button
              className="text-xs text-red-500 font-medium px-3 py-1.5 rounded-full hover:bg-red-50"
              onClick={handleDelete}
              data-action="reviewEdit.form.delete"
            >
              删除
            </button>
          )}
        </div>
        <p className="text-xs text-gray-400 mt-1 ml-12">{app.name}</p>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 pt-6 pb-20" data-scroll-container="main" data-scroll-direction="vertical">
        {/* Rating Stars */}
        <div className="text-center">
          <p className="text-sm text-gray-500 mb-3">为这个应用评分</p>
          <div className="flex items-center justify-center gap-2">
            {[1, 2, 3, 4, 5].map(i => (
              <button
                key={i}
                className="p-1"
                onClick={() => setSelectedRating(i)}
                data-action="reviewEdit.rating.set.star"
              >
                <IconRenderer
                  name="IcStar"
                  size={36}
                />
              </button>
            ))}
          </div>
          {selectedRating > 0 && (
            <p className="text-sm font-medium text-gray-700 mt-2">{selectedRating} / 5</p>
          )}
        </div>

        {/* Review Content */}
        <div className="mt-6">
          <p className="text-sm text-gray-500 mb-2">写下你的评价（可选）</p>
          <textarea
            className="w-full h-32 p-4 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 resize-none focus:outline-none focus:border-app-primary"
            placeholder="分享你使用这个应用的体验..."
            value={content}
            onChange={e => setContent(e.target.value)}
            data-action="reviewEdit.content.input.text"
          />
        </div>

        {/* Submit */}
        <button
          className={`w-full mt-6 py-3 rounded-full text-sm font-medium transition-colors ${
            selectedRating > 0
              ? 'bg-app-primary text-white hover:opacity-90 active:opacity-80'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }`}
          onClick={handleSubmit}
          disabled={selectedRating === 0 || submitted}
          data-action="reviewEdit.form.submit"
        >
          {submitted ? '已提交 ✓' : existingReview ? '更新评价' : '提交评价'}
        </button>
      </div>
    </div>
  );
};

export default ReviewEditPage;
