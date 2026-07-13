import React, { useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { usePlayStoreNavigate } from '../navigation';
import { usePlayStoreStore } from '../state';
import { IconRenderer } from '../res/icons';
import { baseApps } from '../data';
import * as TimeService from '../../../os/TimeService';
import type { DownloadStatus } from '../types';

const AppDetailPage: React.FC = () => {
  const { appId } = useParams<{ appId: string }>();
  const { go, back } = usePlayStoreNavigate();

  const installedApps = usePlayStoreStore(s => s.installedApps);
  const downloadJobs = usePlayStoreStore(s => s.downloadJobs);
  const wishlist = usePlayStoreStore(s => s.wishlist);
  const autoUpdate = usePlayStoreStore(s => s.autoUpdate);
  const ratings = usePlayStoreStore(s => s.ratings);
  const userReviews = usePlayStoreStore(s => s.userReviews);
  const reviews = usePlayStoreStore(s => s.reviews);

  const installApp = usePlayStoreStore(s => s.installApp);
  const addDownloadJob = usePlayStoreStore(s => s.addDownloadJob);
  const cancelDownloadJob = usePlayStoreStore(s => s.cancelDownloadJob);
  const updateApp = usePlayStoreStore(s => s.updateApp);
  const uninstallApp = usePlayStoreStore(s => s.uninstallApp);
  const addToWishlist = usePlayStoreStore(s => s.addToWishlist);
  const removeFromWishlist = usePlayStoreStore(s => s.removeFromWishlist);
  const setAutoUpdate = usePlayStoreStore(s => s.setAutoUpdate);

  const [showUninstallConfirm, setShowUninstallConfirm] = useState(false);

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

  const isInstalled = appId in installedApps;
  const installedVersion = installedApps[appId];
  const hasUpdate = isInstalled && installedVersion !== app.storeVersion;
  const isWishlisted = wishlist.includes(appId);
  const isAutoUpdateEnabled = autoUpdate[appId] === true;
  const myRating = ratings[appId];
  const myReview = userReviews.find(r => r.appId === appId);

  // Find active download job for this app
  const activeJob = downloadJobs.find(
    j => j.appId === appId && (j.status === 'queued' || j.status === 'downloading'),
  );

  const handleInstall = () => {
    // Simulate deterministic download: add job, then immediately complete and install
    const now = TimeService.now(); // Using actual timestamps for records per TimeService pattern - this is for store records
    addDownloadJob(appId, now);
    // Complete install immediately (deterministic)
    const jobId = `dj-${downloadJobs.length + 1}`;
    // In real flow, we'd track the job. For deterministic benchmark, install immediately
    installApp(appId, app.storeVersion, now);
  };

  const handleUpdate = () => {
    if (!isInstalled) return;
    // Use non-standard timestamp approach - actual time is only for record ordering
    const now = TimeService.now();
    updateApp(appId, installedVersion, app.storeVersion, now);
  };

  const handleUninstall = () => {
    setShowUninstallConfirm(true);
  };

  const confirmUninstall = () => {
    if (!isInstalled) return;
    const now = TimeService.now();
    uninstallApp(appId, installedVersion, now);
    setShowUninstallConfirm(false);
  };

  const handleCancelDownload = () => {
    if (activeJob) {
      cancelDownloadJob(activeJob.id);
    }
  };

  const handleWishlistToggle = () => {
    if (isWishlisted) {
      removeFromWishlist(appId);
    } else {
      addToWishlist(appId);
    }
  };

  const handleAutoUpdateToggle = () => {
    setAutoUpdate(appId, !isAutoUpdateEnabled);
  };

  const appReviews = reviews.filter(r => r.appId === appId);

  return (
    <div className="flex flex-col h-full bg-white" data-status-bar-foreground="dark">
      {/* Header */}
      <div className="pt-10 pb-2 px-4 bg-white border-b border-gray-100 flex items-center gap-3">
        <button
          className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100"
          onClick={() => back()}
          data-trigger="system.back"
        >
          <IconRenderer name="IcBack" size={20} />
        </button>
        <span className="text-lg font-semibold text-gray-900 truncate flex-1">{app.name}</span>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto" data-scroll-container="main" data-scroll-direction="vertical">
        {/* App Header Info */}
        <div className="px-4 pt-6 pb-4">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center flex-shrink-0">
              <IconRenderer name={app.icon} size={36} />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-xl font-bold text-gray-900">{app.name}</h2>
              <p className="text-sm text-gray-500">{app.developer}</p>
              <div className="flex items-center gap-2 mt-1">
                <div className="flex items-center gap-0.5">
                  <span className="text-sm font-semibold text-gray-900">{app.rating.toFixed(1)}</span>
                  <IconRenderer name="IcStar" size={14} />
                </div>
                <span className="text-xs text-gray-400">{app.downloads} 下载</span>
                <span className="text-xs px-1.5 py-0.5 bg-gray-100 rounded text-gray-500">{app.ageRating}</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 mt-4">
            {!isInstalled && !activeJob && (
              <button
                className="flex-1 py-2.5 bg-app-primary text-white text-sm font-medium rounded-full hover:opacity-90 active:opacity-80"
                onClick={handleInstall}
                data-action="appDetail.install.invoke"
              >
                安装
              </button>
            )}
            {isInstalled && hasUpdate && (
              <button
                className="flex-1 py-2.5 bg-app-primary text-white text-sm font-medium rounded-full hover:opacity-90 active:opacity-80"
                onClick={handleUpdate}
                data-action="appDetail.update.invoke"
              >
                更新
              </button>
            )}
            {isInstalled && !hasUpdate && (
              <button
                className="flex-1 py-2.5 bg-gray-100 text-gray-400 text-sm font-medium rounded-full"
                disabled
              >
                已安装
              </button>
            )}
            {activeJob && (
              <button
                className="flex-1 py-2.5 bg-red-500 text-white text-sm font-medium rounded-full hover:opacity-90 active:opacity-80"
                onClick={handleCancelDownload}
                data-action="appDetail.cancelDownload.invoke"
              >
                取消下载
              </button>
            )}
            {isInstalled && (
              <button
                className="flex-1 py-2.5 bg-red-50 text-red-500 text-sm font-medium rounded-full hover:bg-red-100 active:bg-red-200"
                onClick={handleUninstall}
                data-action="appDetail.uninstall.invoke"
              >
                卸载
              </button>
            )}
          </div>

          {/* Wishlist + Auto-update */}
          <div className="flex gap-2 mt-2">
            <button
              className={`flex items-center gap-1 px-4 py-2 rounded-full text-xs font-medium border transition-colors ${
                isWishlisted
                  ? 'bg-red-50 border-red-200 text-red-500'
                  : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
              }`}
              onClick={handleWishlistToggle}
              data-action="appDetail.wishlist.add"
            >
              <IconRenderer name="IcWishlist" size={14} />
              {isWishlisted ? '已加入愿望单' : '加入愿望单'}
            </button>
            {isInstalled && (
              <button
                className={`flex items-center gap-1 px-4 py-2 rounded-full text-xs font-medium border transition-colors ${
                  isAutoUpdateEnabled
                    ? 'bg-green-50 border-green-200 text-green-600'
                    : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                }`}
                onClick={handleAutoUpdateToggle}
                data-action="appDetail.autoUpdate.toggle"
              >
                <IconRenderer name="IcUpdate" size={14} />
                {isAutoUpdateEnabled ? '自动更新: 开' : '自动更新: 关'}
              </button>
            )}
          </div>
        </div>

        {/* App Details */}
        <div className="px-4 py-4 space-y-4 border-t border-gray-100">
          {/* My Rating */}
          {myRating ? (
            <div>
              <h4 className="text-xs font-semibold text-gray-500 uppercase mb-1">我的评分</h4>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map(i => (
                  <IconRenderer
                    key={i}
                    name="IcStar"
                    size={18}
                  />
                ))}
                <span className="text-sm text-gray-600 ml-1">{myRating}/5</span>
              </div>
              {myReview && (
                <p className="text-sm text-gray-600 mt-1 italic">"{myReview.content}"</p>
              )}
              <button
                className="mt-1 text-xs text-app-primary font-medium"
                onClick={() => go('appDetail.review.edit', { appId })}
                data-trigger="appDetail.review.edit"
              >
                编辑我的评价
              </button>
            </div>
          ) : (
            <button
              className="text-sm text-app-primary font-medium"
              onClick={() => go('appDetail.review.edit', { appId })}
              data-trigger="appDetail.review.edit"
            >
              ✏️ 撰写评价
            </button>
          )}

          {/* Info Grid */}
          <div className="grid grid-cols-2 gap-3">
            <InfoItem label="开发者" value={app.developer} />
            <InfoItem label="分类" value={app.categoryId} />
            <InfoItem label="大小" value={app.size} />
            <InfoItem label="当前版本" value={app.storeVersion} />
            <InfoItem label="已安装版本" value={isInstalled ? installedVersion : '未安装'} />
            <InfoItem label="下载量" value={app.downloads} />
            <InfoItem label="评分人数" value={`${(app.ratingCount / 1_000_000).toFixed(0)}M`} />
            <InfoItem label="年龄分级" value={app.ageRating} />
          </div>

          {/* Description */}
          <div>
            <h4 className="text-xs font-semibold text-gray-500 uppercase mb-1">简介</h4>
            <p className="text-sm text-gray-700 leading-relaxed">{app.summary}</p>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-gray-500 uppercase mb-1">完整描述</h4>
            <p className="text-sm text-gray-700 leading-relaxed">{app.description}</p>
          </div>

          {/* Reviews Preview */}
          {appReviews.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-semibold text-gray-500 uppercase">评价 ({appReviews.length})</h4>
                <button
                  className="text-xs text-app-primary font-medium"
                  onClick={() => go('appDetail.reviews.open', { appId })}
                  data-trigger="appDetail.reviews.open"
                >
                  查看全部
                </button>
              </div>
              <div className="space-y-3">
                {appReviews.slice(0, 2).map(r => (
                  <div key={r.id} className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-gray-900">{r.userName}</span>
                      <div className="flex items-center gap-0.5">
                        {Array.from({ length: 5 }, (_, i) => (
                          <IconRenderer
                            key={i}
                            name="IcStar"
                            size={10}
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-xs text-gray-600 mt-1 line-clamp-2">{r.content}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="h-20" />
        </div>
      </div>

      {/* Uninstall Confirmation Dialog */}
      {showUninstallConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" data-trigger="system.back">
          <div className="bg-white rounded-2xl mx-8 p-6 w-full max-w-sm">
            <h3 className="text-lg font-semibold text-gray-900">确认卸载</h3>
            <p className="text-sm text-gray-500 mt-2">确定要卸载 {app.name} 吗？</p>
            <div className="flex gap-3 mt-6">
              <button
                className="flex-1 py-2.5 bg-gray-100 text-gray-700 text-sm font-medium rounded-full hover:bg-gray-200"
                onClick={() => setShowUninstallConfirm(false)}
              >
                取消
              </button>
              <button
                className="flex-1 py-2.5 bg-red-500 text-white text-sm font-medium rounded-full hover:bg-red-600 active:bg-red-700"
                onClick={confirmUninstall}
                data-action="appDetail.uninstall.invoke"
              >
                卸载
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Helper component for info rows
const InfoItem: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div>
    <div className="text-xs text-gray-400">{label}</div>
    <div className="text-sm text-gray-900 mt-0.5">{value}</div>
  </div>
);

export default AppDetailPage;
