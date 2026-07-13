import React, { useState, useCallback, useMemo } from 'react';
import { usePlayStoreNavigate } from '../navigation';
import { usePlayStoreStore } from '../state';
import { IconRenderer } from '../res/icons';
import { AppListItem } from '../components/AppListItem';
import { baseApps } from '../data';
import type { AppInfo } from '../types';

const SearchPage: React.FC = () => {
  const { go, back } = usePlayStoreNavigate();
  const search = usePlayStoreStore(s => s.search);
  const searchHistory = usePlayStoreStore(s => s.search.history);
  const setSearchCurrent = usePlayStoreStore(s => s.setSearchCurrent);
  const recordSearchSnapshot = usePlayStoreStore(s => s.recordSearchSnapshot);
  const openedAppIds = usePlayStoreStore(s => s.openedAppIds);

  const [query, setQuery] = useState(search.current.query || '');
  const [submitted, setSubmitted] = useState(false);

  const allApps = baseApps();

  const results = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase().trim();
    return allApps.filter(
      a =>
        a.name.toLowerCase().includes(q) ||
        a.developer.toLowerCase().includes(q) ||
        a.summary.toLowerCase().includes(q),
    );
  }, [query, allApps]);

  const handleSubmit = useCallback(() => {
    const trimmed = query.trim();
    if (!trimmed) return;
    setSubmitted(true);
    setSearchCurrent({
      query: trimmed,
      resultsCount: results.length,
      firstResultId: results.length > 0 ? results[0].id : null,
    });
    recordSearchSnapshot();
  }, [query, results, setSearchCurrent, recordSearchSnapshot]);

  const handleAppOpen = (appId: string) => {
    usePlayStoreStore.getState().addOpenedAppId(appId);
    go('search.app.open', { appId });
  };

  return (
    <div className="flex flex-col h-full bg-white" data-status-bar-foreground="dark">
      {/* Search Header */}
      <div className="pt-10 pb-2 px-4 bg-white border-b border-gray-100">
        <div className="flex items-center gap-3">
          <button
            className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100"
            onClick={() => back()}
            data-trigger="system.back"
          >
            <IconRenderer name="IcBack" size={20} />
          </button>
          <div className="flex-1 flex items-center gap-2 bg-gray-100 rounded-full px-4 py-2">
            <IconRenderer name="IcSearch" size={16} />
            <input
              className="flex-1 bg-transparent text-sm text-gray-900 placeholder-gray-400 outline-none"
              placeholder="搜索应用"
              value={query}
              onChange={e => {
                setQuery(e.target.value);
                setSubmitted(false);
              }}
              onKeyDown={e => {
                if (e.key === 'Enter') handleSubmit();
              }}
              autoFocus
            />
            {query && (
              <button
                onClick={() => {
                  setQuery('');
                  setSubmitted(false);
                  setSearchCurrent({ query: '', resultsCount: 0, firstResultId: null });
                }}
              >
                <IconRenderer name="IcClose" size={16} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto" data-scroll-container="main" data-scroll-direction="vertical">
        {!submitted && query.trim() === '' && (
          <>
            {/* Search History */}
            {searchHistory.length > 0 && (
              <div className="px-4 pt-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-semibold text-gray-900">搜索记录</h3>
                  <button
                    className="text-xs text-gray-400"
                    onClick={() => {
                      usePlayStoreStore.getState().recordSearchSnapshot(); // no-op clear
                    }}
                    data-action="search.history.clear"
                  >
                    清除记录
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {searchHistory.slice(-8).reverse().map((h, i) => (
                    <button
                      key={h.id || i}
                      className="px-3 py-1.5 bg-gray-100 rounded-full text-xs text-gray-700 hover:bg-gray-200"
                      onClick={() => {
                        setQuery(h.query);
                      }}
                    >
                      {h.query}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Viewed Apps */}
            {openedAppIds.length > 0 && (
              <div className="px-4 pt-4 pb-20">
                <h3 className="text-sm font-semibold text-gray-900 mb-2">最近查看</h3>
                <div className="bg-white rounded-xl border border-gray-100 divide-y divide-gray-50">
                  {openedAppIds.slice(-5).reverse().map(appId => {
                    const app = allApps.find(a => a.id === appId);
                    if (!app) return null;
                    return (
                      <AppListItem
                        key={app.id}
                        app={app}
                        onClick={handleAppOpen}
                        showRating
                      />
                    );
                  })}
                </div>
              </div>
            )}
          </>
        )}

        {/* Search Results */}
        {submitted && (
          <div className="px-4 pt-4 pb-20">
            {results.length > 0 ? (
              <>
                <p className="text-xs text-gray-400 mb-2">{results.length} 个结果</p>
                <div className="bg-white rounded-xl border border-gray-100 divide-y divide-gray-50">
                  {results.map(app => (
                    <AppListItem
                      key={app.id}
                      app={app}
                      onClick={handleAppOpen}
                      showRating
                    />
                  ))}
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                <IconRenderer name="IcSearch" size={48} />
                <p className="mt-2 text-sm">未找到相关应用</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchPage;
