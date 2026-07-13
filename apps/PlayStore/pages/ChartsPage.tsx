import React, { useMemo } from 'react';
import { usePlayStoreNavigate } from '../navigation';
import { usePlayStoreStore } from '../state';
import { IconRenderer } from '../res/icons';
import { AppListItem } from '../components/AppListItem';
import { SORT_OPTIONS } from '../constants';
import { baseApps } from '../data';
import type { SortOption } from '../types';

const ChartsPage: React.FC = () => {
  const { go, back } = usePlayStoreNavigate();
  const currentSortOption = usePlayStoreStore(s => s.currentSortOption);
  const setCurrentSortOption = usePlayStoreStore(s => s.setCurrentSortOption);
  const installedApps = usePlayStoreStore(s => s.installedApps);

  const allApps = baseApps();

  const sortedApps = useMemo(() => {
    let apps = [...allApps];
    switch (currentSortOption) {
      case 'rating':
        apps.sort((a, b) => b.rating - a.rating);
        break;
      case 'downloads':
        apps.sort((a, b) => b.ratingCount - a.ratingCount);
        break;
      case 'size':
        apps.sort((a, b) => a.sizeBytes - b.sizeBytes);
        break;
      default:
        // relevance = combined score
        apps.sort((a, b) => (b.rating * Math.log10(b.ratingCount + 1)) - (a.rating * Math.log10(a.ratingCount + 1)));
        break;
    }
    return apps;
  }, [allApps, currentSortOption]);

  const handleSortChange = (option: SortOption) => {
    setCurrentSortOption(option);
  };

  const handleAppOpen = (appId: string) => {
    go('charts.app.open', { appId });
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
          <span className="text-lg font-semibold text-gray-900">排行榜</span>
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
              data-trigger="charts.sort.select"
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
          <div className="bg-white rounded-xl border border-gray-100 divide-y divide-gray-50">
            {sortedApps.map((app, index) => (
              <div key={app.id} className="flex items-center">
                <div className="w-8 text-center flex-shrink-0">
                  <span className={`text-sm font-bold ${index < 3 ? 'text-app-primary' : 'text-gray-400'}`}>
                    {index + 1}
                  </span>
                </div>
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
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChartsPage;
