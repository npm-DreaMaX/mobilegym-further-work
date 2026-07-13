import React from 'react';
import { usePlayStoreNavigate } from '../navigation';
import { usePlayStoreStore } from '../state';
import { IconRenderer } from '../res/icons';
import { AppListItem } from '../components/AppListItem';
import { baseApps } from '../data';

const WishlistPage: React.FC = () => {
  const { go } = usePlayStoreNavigate();
  const wishlist = usePlayStoreStore(s => s.wishlist);
  const removeFromWishlist = usePlayStoreStore(s => s.removeFromWishlist);
  const installedApps = usePlayStoreStore(s => s.installedApps);

  const allApps = baseApps();
  const wishlistApps = allApps.filter(a => wishlist.includes(a.id));

  const handleAppOpen = (appId: string) => {
    go('wishlist.app.open', { appId });
  };

  const handleRemove = (appId: string) => {
    removeFromWishlist(appId);
  };

  return (
    <div className="flex flex-col h-full bg-gray-50" data-status-bar-foreground="dark">
      {/* Header */}
      <div className="bg-white pt-10 pb-3 px-4 border-b border-gray-100">
        <span className="text-lg font-semibold text-gray-900">愿望单</span>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto pb-20" data-scroll-container="main" data-scroll-direction="vertical">
        {wishlistApps.length > 0 ? (
          <div className="px-4 pt-4">
            <div className="bg-white rounded-xl border border-gray-100 divide-y divide-gray-50">
              {wishlistApps.map(app => (
                <div key={app.id} className="flex items-center">
                  <div className="flex-1">
                    <AppListItem
                      app={app}
                      onClick={handleAppOpen}
                      showRating
                      actionLabel={app.id in installedApps ? '已安装' : '安装'}
                      onAction={(id) => {
                        if (!(id in installedApps)) handleAppOpen(id);
                      }}
                    />
                  </div>
                  <button
                    className="flex-shrink-0 px-4 py-1.5 mr-2 bg-red-50 text-red-500 text-xs font-medium rounded-full hover:bg-red-100"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemove(app.id);
                    }}
                    data-action="appDetail.wishlist.add"
                  >
                    移除
                  </button>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400">
            <IconRenderer name="IcWishlist" size={48} />
            <p className="mt-2 text-sm">愿望单为空</p>
            <p className="text-xs text-gray-300 mt-1">浏览应用并将它们加入愿望单</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default WishlistPage;
