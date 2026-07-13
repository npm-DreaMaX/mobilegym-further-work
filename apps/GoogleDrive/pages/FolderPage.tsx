import React from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useGoogleDriveStore } from '../state';
import { SORT_OPTIONS } from '../constants';
import { formatFileSize } from '../types';
import { IconRenderer, IcArrowLeft, IcSearch, IcMoreVertical, IcFolder, IcFileText, IcPlus } from '../res/icons';
import type { SortOption } from '../types';

export default function FolderPage() {
  const { folderId } = useParams<{ folderId: string }>();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const files = useGoogleDriveStore(s => s.files);
  const settings = useGoogleDriveStore(s => s.settings);
  const updateSettings = useGoogleDriveStore(s => s.updateSettings);
  const viewFile = useGoogleDriveStore(s => s.viewFile);
  const createFolder = useGoogleDriveStore(s => s.createFolder);

  const folder = React.useMemo(() => files.find(f => f.id === folderId), [files, folderId]);
  const children = React.useMemo(() => {
    let result = files.filter(f => !f.trashed && f.parentId === folderId);
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
  }, [files, folderId, settings]);

  const showSort = searchParams.get('sort') === 'open';
  const showNewFolder = searchParams.get('newFolder') === 'open';
  const showNewMenu = searchParams.get('newMenu') === 'open';
  const [newFolderName, setNewFolderName] = React.useState('');

  const handleCreateFolder = () => {
    if (newFolderName.trim() && folderId) {
      createFolder(newFolderName.trim(), folderId);
      setNewFolderName('');
      setSearchParams(p => { p.delete('newFolder'); return p; });
    }
  };

  return (
    <div className="flex flex-col h-full pt-10 bg-white dark:bg-[#1E1E1E]" data-status-bar-foreground="dark">
      {/* Top bar */}
      <div className="flex items-center gap-2 px-3 py-2 border-b border-gray-200 dark:border-gray-700">
        <button onClick={() => navigate(-1)} className="p-1">
          <IcArrowLeft size={22} className="text-gray-700 dark:text-gray-300" />
        </button>
        <h1 className="text-lg font-medium text-gray-900 dark:text-gray-100 flex-1 truncate">
          {folder?.name || '文件夹'}
        </h1>
        <button onClick={() => setSearchParams(p => { p.set('newMenu', 'open'); return p; })} className="p-1">
          <IcPlus size={20} className="text-gray-600 dark:text-gray-300" />
        </button>
        <button onClick={() => setSearchParams(p => { p.set('sort', 'open'); return p; })} className="p-1">
          <IcMoreVertical size={20} className="text-gray-600 dark:text-gray-300" />
        </button>
      </div>

      {/* File list */}
      <div className="flex-1 overflow-y-auto" data-scroll-container="main" data-scroll-direction="vertical">
        {children.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400">
            <IcFolder size={48} className="mb-3" />
            <p className="text-sm">此文件夹为空</p>
          </div>
        ) : (
          children.map(file => (
            <button
              key={file.id}
              className="flex items-center gap-3 w-full px-4 py-3 border-b border-gray-50 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800"
              onClick={() => {
                viewFile(file.id);
                if (file.type === 'folder') {
                  navigate(`/folder/${file.id}`);
                } else {
                  navigate(`/file/${file.id}`);
                }
              }}
            >
              <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center flex-shrink-0">
                <IconRenderer name={file.type === 'folder' ? 'IcFolder' : 'IcFileText'} size={18} className="text-gray-500" />
              </div>
              <div className="flex-1 text-left min-w-0">
                <div className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{file.name}</div>
                <div className="text-xs text-gray-400">
                  {file.ownerName} · {formatFileSize(file.size)}
                </div>
              </div>
              {file.starred && <IconRenderer name="IcStar" size={14} className="text-yellow-500 flex-shrink-0" />}
            </button>
          ))
        )}
      </div>

      {/* New Folder Dialog */}
      {showNewFolder && (
        <div className="absolute inset-0 z-50 flex items-end justify-center bg-black/40" onClick={() => setSearchParams(p => { p.delete('newFolder'); return p; })}>
          <div className="w-full bg-white dark:bg-gray-800 rounded-t-2xl p-5" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">新建文件夹</h3>
            <input autoFocus className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 mb-4"
              placeholder="文件夹名称" value={newFolderName} onChange={e => setNewFolderName(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') handleCreateFolder(); }} />
            <div className="flex gap-3">
              <button className="flex-1 py-2.5 text-sm text-gray-600 border rounded-lg" onClick={() => { setNewFolderName(''); setSearchParams(p => { p.delete('newFolder'); return p; }); }}>取消</button>
              <button className="flex-1 py-2.5 text-sm text-white bg-blue-600 rounded-lg font-medium" onClick={handleCreateFolder}>创建</button>
            </div>
          </div>
        </div>
      )}

      {/* New Menu Dialog */}
      {showNewMenu && (
        <div className="absolute inset-0 z-50 flex items-end justify-center bg-black/40" onClick={() => setSearchParams(p => { p.delete('newMenu'); return p; })}>
          <div className="w-full bg-white dark:bg-gray-800 rounded-t-2xl p-5" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">新建</h3>
            <button className="flex items-center gap-3 w-full px-3 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg"
              onClick={() => { setSearchParams(p => { p.delete('newMenu'); p.set('newFolder', 'open'); return p; }); }}>
              <IcFolder size={22} className="text-gray-500" /><span className="text-sm text-gray-900 dark:text-gray-100">文件夹</span>
            </button>
            <button className="flex items-center gap-3 w-full px-3 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg"
              onClick={() => { setSearchParams(p => { p.delete('newMenu'); p.set('upload', 'open'); return p; }); }}>
              <IcPlus size={22} className="text-gray-500" /><span className="text-sm text-gray-900 dark:text-gray-100">上传文件</span>
            </button>
            <button className="w-full py-2.5 mt-3 text-sm text-gray-600 border rounded-lg" onClick={() => setSearchParams(p => { p.delete('newMenu'); return p; })}>取消</button>
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
