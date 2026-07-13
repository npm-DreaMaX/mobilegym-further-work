import React, { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { usePlayStoreNavigate } from '../navigation';
import { usePlayStoreStore } from '../state';
import { IconRenderer } from '../res/icons';
import { AppListItem } from '../components/AppListItem';
import { CATEGORIES, SORT_OPTIONS } from '../constants';
import { baseApps } from '../data';
import type { SortOption } from '../types';

const CategoryDetailPage: React.FC = () => {
  const { categoryId } = useParams<{ categoryId: string }>();
  const { go, back } = usePlayStoreNavigate();
  const currentSortOption = usePlayStoreStore(s => s.currentSortOption);
  const setCurrentSortOption = usePlayStoreStore(s => s.setCurrentSortOption);
  const installedApps = usePlayStoreStore(s => s.installedApps);

  const category = CATEGORIES.find(c => c.id === categoryId);
  const allApps = baseApps();

  const apps = useMemo(() => {
    let filtered = allApps.filter(a => a.categoryId === categoryId);
    // Apply sort
    switch (currentSortOption) {
      case 'rating':
        filtered = [...filtered].sort((a, b) => b.rating - a.rating);
        break;
      case 'downloads':
        filtered = [...filtered].sort((a, b) => b.ratingCount - a.ratingCount);
        break;
      case 'size':
        filtered = [...filtered].sort((a, b) => a.sizeBytes - b.sizeBytes);
        break;
      default: // relevance
        break;
    }
    return filtered;
  }, [categoryId, allApps, currentSortOption]);

  const handleSortChange = (option: SortOption) => {
    setCurrentSortOption(option);
  };

  const handleAppOpen = (appId: string) => {
    go('categoryDetail.app.open', { appId });
  };

  return (
    <div className="flex flex-col h-full bg-gray-50" data-status-bar-foreground="dark">
      {/* Header */}
      <div className="bg-white pt-10 pb-3 px-4 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <button
            className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100"
            onClick={() => back()}
            data-trigger="system.back"
          >
            <IconRenderer name="IcBack" size={20} />
          </button>
          <span className="text-lg font-semibold text-gray-900">{category?.name || categoryId}</span>
        </div>

        {/* Sort Options */}
        <div className="flex gap-2 mt-2 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
          {SORT_OPTIONS.map(opt => (
            <button
              key={opt.id}
              className={`flex-shrink-0 px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                currentSortOption === opt.id
                  ? 'bg-app-primary text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
              onClick={() => handleSortChange(opt.id)}
              data-trigger="categoryDetail.sort.select"
              data-trigger-params={JSON.stringify({ option: opt.id })}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* App List */}
      <div className="flex-1 overflow-y-auto pb-20" data-scroll-container="main" data-scroll-direction="vertical">
        <div className="px-4 pt-3">
          <p className="text-xs text-gray-400 mb-2">{apps.length} 个应用</p>
          <div className="bg-white rounded-xl border border-gray-100 divide-y divide-gray-50">
            {apps.map(app => (
              <AppListItem
                key={app.id}
                app={app}
                onClick={handleAppOpen}
                showRating
                actionLabel={app.id in installedApps ? '已安装' : '安装'}
                onAction={(id) => {
                  if (!(id in installedApps)) handleAppOpen(id);
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoryDetailPage;
