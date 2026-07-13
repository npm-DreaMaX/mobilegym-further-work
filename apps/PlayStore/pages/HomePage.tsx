import React from 'react';
import { usePlayStoreNavigate } from '../navigation';
import { usePlayStoreStore } from '../state';
import { IconRenderer } from '../res/icons';
import { CATEGORIES } from '../constants';
import { AppListItem } from '../components/AppListItem';
import type { AppInfo } from '../types';
import { baseApps } from '../data';

const HomePage: React.FC = () => {
  const { go } = usePlayStoreNavigate();
  const installedApps = usePlayStoreStore(s => s.installedApps);
  const wishlist = usePlayStoreStore(s => s.wishlist);

  const allApps = baseApps();
  // Get recommended apps (top rated, not installed)
  const recommended = allApps
    .filter(a => !(a.id in installedApps))
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 5);

  const handleAppOpen = (appId: string) => {
    go('home.app.open', { appId });
  };

  const isInstalled = (appId: string) => appId in installedApps;
  const getActionLabel = (app: AppInfo) => {
    if (isInstalled(app.id)) {
      const installedVersion = installedApps[app.id];
      if (installedVersion !== app.storeVersion) return '更新';
      return '已安装';
    }
    return '安装';
  };

  return (
    <div className="flex flex-col h-full bg-gray-50" data-status-bar-foreground="dark">
      {/* Header */}
      <div className="bg-white pt-10 pb-2 px-4 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <IconRenderer name="IcLauncher" size={28} />
            <span className="text-lg font-semibold text-gray-900">Play 商店</span>
          </div>
          <button
            className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100"
            onClick={() => go('home.settings.open')}
            data-trigger="home.settings.open"
          >
            <IconRenderer name="IcSettings" size={20} />
          </button>
        </div>

        {/* Search Bar */}
        <button
          className="mt-3 w-full flex items-center gap-2 px-4 py-2.5 bg-gray-100 rounded-full text-gray-400 hover:bg-gray-200 active:bg-gray-200"
          onClick={() => go('home.search.open')}
          data-trigger="home.search.open"
        >
          <IconRenderer name="IcSearch" size={18} />
          <span className="text-sm">搜索应用</span>
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto" data-scroll-container="main" data-scroll-direction="vertical">
        {/* Quick Access */}
        <div className="px-4 pt-4">
          <div className="flex gap-2">
            <button
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-white rounded-xl border border-gray-200 text-sm text-gray-700 hover:bg-gray-50"
              onClick={() => go('home.categories.open')}
              data-trigger="home.categories.open"
            >
              <IconRenderer name="IcCategories" size={16} />
              <span>分类</span>
            </button>
            <button
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-white rounded-xl border border-gray-200 text-sm text-gray-700 hover:bg-gray-50"
              onClick={() => go('home.charts.open')}
              data-trigger="home.charts.open"
            >
              <IconRenderer name="IcCharts" size={16} />
              <span>排行榜</span>
            </button>
          </div>
        </div>

        {/* Category Quick Access */}
        <div className="px-4 pt-4">
          <h3 className="text-sm font-semibold text-gray-900 mb-2">分类</h3>
          <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
            {CATEGORIES.slice(0, 6).map(cat => (
              <button
                key={cat.id}
                className="flex-shrink-0 flex items-center gap-1 px-3 py-1.5 bg-white border border-gray-200 rounded-full text-xs text-gray-700 hover:bg-gray-50 active:bg-gray-100"
                onClick={() => {
                  usePlayStoreStore.getState().setCurrentCategory(cat.id);
                  go('home.category.open', { categoryId: cat.id });
                }}
                data-trigger="home.category.open"
                data-trigger-params={JSON.stringify({ categoryId: cat.id })}
              >
                <IconRenderer name={cat.icon} size={14} />
                <span>{cat.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Recommended Apps */}
        <div className="px-4 pt-4 pb-20">
          <h3 className="text-sm font-semibold text-gray-900 mb-2">推荐</h3>
          <div className="bg-white rounded-xl border border-gray-100 divide-y divide-gray-50">
            {recommended.map(app => (
              <AppListItem
                key={app.id}
                app={app}
                onClick={handleAppOpen}
                actionLabel={getActionLabel(app)}
                onAction={(id) => {
                  if (!isInstalled(id)) {
                    handleAppOpen(id);
                  }
                }}
                showRating
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
