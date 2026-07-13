import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useGoogleDriveStore } from '../state';
import { FILTER_TYPES, SORT_OPTIONS } from '../constants';
import { formatFileSize } from '../types';
import { IconRenderer, IcArrowLeft, IcSearch, IcFilter, IcMoreVertical, IcFileText, IcFolder, IcX } from '../res/icons';
import type { SortOption, FilterType } from '../types';

export default function SearchResultsPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const files = useGoogleDriveStore(s => s.files);
  const search = useGoogleDriveStore(s => s.search);
  const submitSearch = useGoogleDriveStore(s => s.submitSearch);
  const setSearchFilter = useGoogleDriveStore(s => s.setSearchFilter);
  const setSearchOwnerFilter = useGoogleDriveStore(s => s.setSearchOwnerFilter);
  const clearSearch = useGoogleDriveStore(s => s.clearSearch);
  const settings = useGoogleDriveStore(s => s.settings);
  const updateSettings = useGoogleDriveStore(s => s.updateSettings);

  const [searchInput, setSearchInput] = React.useState(search.current.query || '');
  const [ownerFilterInput, setOwnerFilterInput] = React.useState('');
  const showFilter = searchParams.get('filter') === 'open';
  const showSort = searchParams.get('sort') === 'open';

  const handleSearch = () => {
    if (searchInput.trim()) {
      submitSearch(searchInput.trim());
    }
  };

  const handleOwnerFilter = () => {
    setSearchOwnerFilter(ownerFilterInput.trim());
    setSearchParams(p => { p.delete('filter'); return p; });
  };

  // Display results
  const displayFiles = React.useMemo(() => {
    if (!search.current.searched) return [];
    let result = files.filter(f => !f.trashed && search.current.resultIds.includes(f.id));
    // Apply sort
    const dir = settings.sortDirection === 'asc' ? 1 : -1;
    result = [...result].sort((a, b) => {
      if (a.type === 'folder' && b.type !== 'folder') return -1;
      if (a.type !== 'folder' && b.type === 'folder') return 1;
      if (settings.sortOption === 'name') return a.name.localeCompare(b.name) * dir;
      if (settings.sortOption === 'modified') return (a.modifiedTime - b.modifiedTime) * dir;
      if (settings.sortOption === 'size') return (a.size - b.size) * dir;
      return 0;
    });
    return result;
  }, [files, search.current, settings]);

  return (
    <div className="flex flex-col h-full pt-10 bg-white dark:bg-[#1E1E1E]" data-status-bar-foreground="dark">
      {/* Search bar */}
      <div className="flex items-center gap-2 px-3 py-2 border-b border-gray-200 dark:border-gray-700">
        <button onClick={() => navigate(-1)} className="p-1">
          <IcArrowLeft size={22} className="text-gray-700 dark:text-gray-300" />
        </button>
        <div className="flex-1 flex items-center bg-gray-100 dark:bg-gray-800 rounded-lg px-3 py-1.5">
          <IcSearch size={16} className="text-gray-400 mr-2 flex-shrink-0" />
          <input
            autoFocus
            className="flex-1 bg-transparent text-sm text-gray-900 dark:text-gray-100 outline-none"
            placeholder="搜索云端硬盘"
            value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') handleSearch(); }}
            data-action="search.query.submit" data-action-type="input"
          />
          {searchInput && (
            <button onClick={() => { setSearchInput(''); clearSearch(); }} className="p-0.5" data-action="search.query.clear" data-action-type="submit">
              <IcX size={16} className="text-gray-400" />
            </button>
          )}
        </div>
        <button onClick={() => setSearchParams(p => { p.set('filter', 'open'); return p; })} className="p-1">
          <IcFilter size={20} className="text-gray-600 dark:text-gray-300" />
        </button>
        <button onClick={() => setSearchParams(p => { p.set('sort', 'open'); return p; })} className="p-1">
          <IcMoreVertical size={20} className="text-gray-600 dark:text-gray-300" />
        </button>
      </div>

      {/* Active filters */}
      {(search.current.filterType !== 'all' || search.current.filterOwner) && (
        <div className="flex items-center gap-2 px-3 py-1.5 border-b border-gray-100 dark:border-gray-800">
          {search.current.filterType !== 'all' && (
            <span className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-600 px-2 py-0.5 rounded-full flex items-center gap-1">
              类型: {FILTER_TYPES.find(f => f.id === search.current.filterType)?.label}
              <button onClick={() => setSearchFilter('all')}><IcX size={12} /></button>
            </span>
          )}
          {search.current.filterOwner && (
            <span className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-600 px-2 py-0.5 rounded-full flex items-center gap-1">
              所有者: {search.current.filterOwner}
              <button onClick={() => setSearchOwnerFilter('')}><IcX size={12} /></button>
            </span>
          )}
        </div>
      )}

      {/* Results */}
      <div className="flex-1 overflow-y-auto" data-scroll-container="main" data-scroll-direction="vertical">
        {!search.current.searched ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400">
            <IcSearch size={48} className="mb-3" />
            <p className="text-sm">输入关键词搜索文件</p>
          </div>
        ) : displayFiles.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400">
            <IcSearch size={48} className="mb-3" />
            <p className="text-sm">未找到匹配的文件</p>
          </div>
        ) : (
          <>
            <div className="px-4 py-2 text-xs text-gray-400">
              找到 {search.current.resultCount} 个结果
            </div>
            {displayFiles.map(file => (
              <button key={file.id} className="flex items-center gap-3 w-full px-4 py-3 border-b border-gray-50 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
                onClick={() => navigate(`/file/${file.id}`)} data-trigger="file.detail.open" data-trigger-type="tap" data-trigger-params={`fileId=${file.id}`}>
                <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center flex-shrink-0">
                  <IconRenderer name={file.type === 'folder' ? 'IcFolder' : 'IcFileText'} size={18} className="text-gray-500" />
                </div>
                <div className="flex-1 text-left min-w-0">
                  <div className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{file.name}</div>
                  <div className="text-xs text-gray-400">{file.ownerName} · {formatFileSize(file.size)}</div>
                </div>
                {file.starred && <IconRenderer name="IcStar" size={14} className="text-yellow-500 flex-shrink-0" />}
              </button>
            ))}
          </>
        )}
      </div>

      {/* Filter dialog */}
      {showFilter && (
        <div className="absolute inset-0 z-50 flex items-end justify-center bg-black/40" onClick={() => setSearchParams(p => { p.delete('filter'); return p; })}>
          <div className="w-full bg-white dark:bg-gray-800 rounded-t-2xl p-5" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">筛选</h3>
            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">文件类型</h4>
              <div className="flex flex-wrap gap-2">
                {FILTER_TYPES.map(ft => (
                  <button key={ft.id}
                    className={`px-3 py-1.5 rounded-full text-xs ${search.current.filterType === ft.id ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}
                    onClick={() => { setSearchFilter(ft.id as FilterType); }}
                    data-action="search.filter.type.select" data-action-type="select">
                    {ft.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">所有者</h4>
              <input className="w-full px-3 py-2 border rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600"
                placeholder="输入所有者邮箱" value={ownerFilterInput} onChange={e => setOwnerFilterInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') handleOwnerFilter(); }}
                data-action="search.filter.owner.submit" data-action-type="input"
              />
            </div>
            <div className="flex gap-3">
              <button className="flex-1 py-2.5 text-sm text-gray-600 border rounded-lg"
                onClick={() => { setSearchOwnerFilter(''); setSearchFilter('all'); setSearchParams(p => { p.delete('filter'); return p; }); }}>
                清除筛选
              </button>
              <button className="flex-1 py-2.5 text-sm text-white bg-blue-600 rounded-lg font-medium"
                onClick={handleOwnerFilter}>
                应用
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sort dialog */}
      {showSort && (
        <div className="absolute inset-0 z-50 flex items-end justify-center bg-black/40" onClick={() => setSearchParams(p => { p.delete('sort'); return p; })}>
          <div className="w-full bg-white dark:bg-gray-800 rounded-t-2xl p-5" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">排序方式</h3>
            {SORT_OPTIONS.map(opt => (
              <button key={opt.id}
                className={`flex items-center gap-3 w-full px-3 py-3 rounded-lg text-sm ${settings.sortOption === opt.id ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600' : 'text-gray-900 dark:text-gray-100'}`}
                onClick={() => { updateSettings({ sortOption: opt.id as SortOption }); setSearchParams(p => { p.delete('sort'); return p; }); }}>
                <IconRenderer name={opt.icon} size={18} /><span>{opt.label}</span>
                {settings.sortOption === opt.id && <span className="ml-auto text-blue-600">✓</span>}
              </button>
            ))}
            <button className="w-full py-2.5 mt-3 text-sm text-gray-600 border rounded-lg" onClick={() => setSearchParams(p => { p.delete('sort'); return p; })}>取消</button>
          </div>
        </div>
      )}
    </div>
  );
}
