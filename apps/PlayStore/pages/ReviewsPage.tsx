import React from 'react';
import { useParams } from 'react-router-dom';
import { usePlayStoreNavigate } from '../navigation';
import { usePlayStoreStore } from '../state';
import { IconRenderer } from '../res/icons';
import { baseApps } from '../data';

const ReviewsPage: React.FC = () => {
  const { appId } = useParams<{ appId: string }>();
  const { go, back } = usePlayStoreNavigate();
  const reviews = usePlayStoreStore(s => s.reviews);
  const userReviews = usePlayStoreStore(s => s.userReviews);

  const allApps = baseApps();
  const app = allApps.find(a => a.id === appId);

  if (!app || !appId) {
    return (
      <div className="flex flex-col h-full bg-white pt-10 items-center justify-center">
        <p className="text-gray-400">App not found</p>
        <button className="mt-4 text-app-primary" onClick={() => back()}>返回</button>
      </div>
    );
  }

  const appReviews = reviews.filter(r => r.appId === appId);
  const myReview = userReviews.find(r => r.appId === appId);

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
            <div>
              <span className="text-lg font-semibold text-gray-900">评价</span>
              <span className="text-sm text-gray-400 ml-2">{app.name}</span>
            </div>
          </div>
          <button
            className="px-4 py-1.5 bg-app-primary text-white text-xs font-medium rounded-full"
            onClick={() => go('reviews.edit.open', { appId })}
            data-trigger="reviews.edit.open"
          >
            {myReview ? '编辑评价' : '撰写评价'}
          </button>
        </div>
      </div>

      {/* Reviews List */}
      <div className="flex-1 overflow-y-auto pb-20" data-scroll-container="main" data-scroll-direction="vertical">
        {/* My Review */}
        {myReview && (
          <div className="px-4 pt-4">
            <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">我的评价</h4>
            <div className="p-4 bg-white rounded-xl border border-app-primary/20">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-900">我</span>
                <div className="flex items-center gap-0.5">
                  {[1, 2, 3, 4, 5].map(i => (
                    <IconRenderer
                      key={i}
                      name="IcStar"
                      size={12}
                    />
                  ))}
                </div>
                <span className="text-xs text-gray-400">{myReview.rating}/5</span>
              </div>
              <p className="text-sm text-gray-700 mt-2">{myReview.content}</p>
            </div>
          </div>
        )}

        {/* All Reviews */}
        <div className="px-4 pt-4">
          <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">
            {appReviews.length > 0 ? `全部评价 (${appReviews.length})` : '暂无评价'}
          </h4>
          <div className="space-y-3">
            {appReviews.map(r => (
              <div key={r.id} className="p-4 bg-white rounded-xl border border-gray-100">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-900">{r.userName}</span>
                  <div className="flex items-center gap-0.5">
                    {[1, 2, 3, 4, 5].map(i => (
                      <IconRenderer
                        key={i}
                        name="IcStar"
                        size={10}
                      />
                    ))}
                  </div>
                </div>
                <p className="text-sm text-gray-600 mt-2">{r.content}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReviewsPage;
