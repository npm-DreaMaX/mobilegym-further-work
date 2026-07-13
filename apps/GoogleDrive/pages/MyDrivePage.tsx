import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useGoogleDriveStore } from '../state';
import { SORT_OPTIONS, FILTER_TYPES } from '../constants';
import { formatFileSize, FILE_TYPE_LABELS } from '../types';
import { IconRenderer, IcArrowLeft, IcSearch, IcMoreVertical, IcFolder, IcFileText } from '../res/icons';
import type { SortOption, FilterType } from '../types';

export default function MyDrivePage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const files = useGoogleDriveStore(s => s.files);
  const settings = useGoogleDriveStore(s => s.settings);
  const updateSettings = useGoogleDriveStore(s => s.updateSettings);

  // Root-level my_drive files (non-trashed)
  const driveFiles = React.useMemo(() => {
    let result = files.filter(f => !f.trashed && f.driveLabel === 'my_drive' && f.parentId === null);
    // Sort
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
  }, [files, settings]);

  const showSort = searchParams.get('sort') === 'open';

  return (
    <div className="flex flex-col h-full pt-10 bg-white dark:bg-[#1E1E1E]" data-status-bar-foreground="dark">
      {/* Top bar */}
      <div className="flex items-center gap-2 px-3 py-2 border-b border-gray-200 dark:border-gray-700">
        <button onClick={() => navigate(-1)} className="p-1" data-trigger="detail.back" data-trigger-type="back">
          <IcArrowLeft size={22} className="text-gray-700 dark:text-gray-300" />
        </button>
        <h1 className="text-lg font-medium text-gray-900 dark:text-gray-100 flex-1">我的云端硬盘</h1>
        <button onClick={() => navigate('/search')} className="p-1" data-trigger="home.search.open" data-trigger-type="tap">
          <IcSearch size={20} className="text-gray-600 dark:text-gray-300" />
        </button>
        <button onClick={() => setSearchParams(p => { p.set('sort', 'open'); return p; })} className="p-1" data-trigger="home.sort.open" data-trigger-type="tap">
          <IcMoreVertical size={20} className="text-gray-600 dark:text-gray-300" />
        </button>
      </div>

      {/* File list */}
      <div className="flex-1 overflow-y-auto" data-scroll-container="main" data-scroll-direction="vertical">
        {driveFiles.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400">
            <IcFolder size={48} className="mb-3" />
            <p className="text-sm">此文件夹为空</p>
          </div>
        ) : (
          driveFiles.map(file => (
            <FileRow
              key={file.id}
              file={file}
              onClick={() => {
                if (file.type === 'folder') {
                  navigate(`/folder/${file.id}`);
                } else {
                  navigate(`/file/${file.id}`);
                }
              }}
            />
          ))
        )}
      </div>

      {/* Sort dialog */}
      {showSort && (
        <div className="absolute inset-0 z-50 flex items-end justify-center bg-black/40" onClick={() => setSearchParams(p => { p.delete('sort'); return p; })}>
          <div className="w-full bg-white dark:bg-gray-800 rounded-t-2xl p-5" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">排序方式</h3>
            {SORT_OPTIONS.map(opt => (
              <button
                key={opt.id}
                className={`flex items-center gap-3 w-full px-3 py-3 rounded-lg text-sm ${
                  settings.sortOption === opt.id ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600' : 'text-gray-900 dark:text-gray-100'
                }`}
                onClick={() => {
                  updateSettings({ sortOption: opt.id as SortOption });
                  setSearchParams(p => { p.delete('sort'); return p; });
                }}
                data-action="sort.option.select" data-action-type="submit"
              >
                <IconRenderer name={opt.icon} size={18} />
                <span>{opt.label}</span>
                {settings.sortOption === opt.id && <span className="ml-auto text-blue-600">✓</span>}
              </button>
            ))}
            <button
              className="w-full py-2.5 mt-3 text-sm text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-600 rounded-lg"
              onClick={() => setSearchParams(p => { p.delete('sort'); return p; })}
            >
              取消
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function FileRow({ file, onClick }: { file: any; onClick: () => void }) {
  const isFolder = file.type === 'folder';
  return (
    <button
      className="flex items-center gap-3 w-full px-4 py-3 border-b border-gray-50 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800"
      onClick={onClick}
      data-trigger={isFolder ? 'folder.open' : 'file.detail.open'} data-trigger-type="tap"
      data-trigger-params={isFolder ? `folderId=${file.id}` : `fileId=${file.id}`}
    >
      <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center flex-shrink-0">
        <IconRenderer name={isFolder ? 'IcFolder' : 'IcFileText'} size={18} className="text-gray-500" />
      </div>
      <div className="flex-1 text-left min-w-0">
        <div className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{file.name}</div>
        <div className="text-xs text-gray-400">
          {file.ownerName} · {formatFileSize(file.size)} · {new Date(file.modifiedTime).toLocaleDateString('zh-CN')}
        </div>
      </div>
      {file.starred && <IconRenderer name="IcStar" size={14} className="text-yellow-500 flex-shrink-0" />}
      <IconRenderer name="IcMoreVertical" size={16} className="text-gray-400 flex-shrink-0" />
    </button>
  );
}
