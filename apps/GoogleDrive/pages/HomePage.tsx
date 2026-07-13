import React from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useGoogleDriveStore } from '../state';
import { HOME_SECTIONS, DEVICE_FILES } from '../constants';
import { formatFileSize } from '../types';
import { useAppNavigate } from '../navigation';
import { IconRenderer, IcSearch, IcPlus, IcHardDrive, IcFolder, IcStar, IcUsers, IcClock, IcTrash, IcMonitor, IcFileText } from '../res/icons';

export default function HomePage() {
  const navigate = useNavigate();
  const { go } = useAppNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const files = useGoogleDriveStore(s => s.files);
  const user = useGoogleDriveStore(s => s.user);
  const settings = useGoogleDriveStore(s => s.settings);
  const search = useGoogleDriveStore(s => s.search);
  const submitSearch = useGoogleDriveStore(s => s.submitSearch);
  const clearSearch = useGoogleDriveStore(s => s.clearSearch);
  const setSearchFilter = useGoogleDriveStore(s => s.setSearchFilter);

  // Recent files
  const recentFiles = React.useMemo(() => {
    return files
      .filter(f => !f.trashed && f.lastOpenedAt !== null && f.type !== 'folder')
      .sort((a, b) => (b.lastOpenedAt ?? 0) - (a.lastOpenedAt ?? 0))
      .slice(0, 5);
  }, [files]);

  // Dialog states
  const showNewFolder = searchParams.get('newFolder') === 'open';
  const showNewMenu = searchParams.get('newMenu') === 'open';
  const showSort = searchParams.get('sort') === 'open';
  const showFilter = searchParams.get('filter') === 'open';

  const [newFolderName, setNewFolderName] = React.useState('');
  const [searchQuery, setSearchQuery] = React.useState('');

  const createFolder = useGoogleDriveStore(s => s.createFolder);

  const handleCreateFolder = () => {
    if (newFolderName.trim()) {
      createFolder(newFolderName.trim(), null);
      setNewFolderName('');
      setSearchParams(p => { p.delete('newFolder'); return p; });
    }
  };

  const handleSearch = () => {
    if (searchQuery.trim()) {
      submitSearch(searchQuery.trim());
      navigate('/search');
    }
  };

  const storagePercent = user.storageTotal > 0
    ? Math.round((user.storageUsed / user.storageTotal) * 100)
    : 0;

  const iconMap: Record<string, React.ComponentType<any>> = {
    IcFolder, IcStar, IcUsers, IcClock, IcTrash, IcMonitor,
  };

  return (
    <div className="flex flex-col h-full pt-10 bg-white dark:bg-[#1E1E1E]" data-status-bar-foreground="dark">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2 flex-1 bg-gray-100 dark:bg-gray-800 rounded-lg px-3 py-2"
             onClick={() => navigate('/search')}
             data-trigger="home.search.open" data-trigger-type="tap">
          <IcSearch size={18} className="text-gray-400" />
          <span className="text-sm text-gray-400">搜索云端硬盘</span>
        </div>
        <button
          className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
          onClick={() => setSearchParams(p => { p.set('newMenu', p.get('newMenu') === 'open' ? '' : 'open'); return p; })}
          data-trigger="home.newMenu.open" data-trigger-type="tap"
        >
          <IcPlus size={22} className="text-gray-700 dark:text-gray-300" />
        </button>
      </div>

      {/* Storage bar */}
      <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs text-gray-500">存储空间</span>
          <span className="text-xs text-gray-500">
            {formatFileSize(user.storageUsed)} / {formatFileSize(user.storageTotal)}
          </span>
        </div>
        <div className="h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div className="h-full bg-blue-500 rounded-full" style={{ width: `${storagePercent}%` }} />
        </div>
      </div>

      {/* Quick access sections */}
      <div className="flex-1 overflow-y-auto" data-scroll-container="main" data-scroll-direction="vertical">
        {HOME_SECTIONS.map(section => {
          const IconComp = iconMap[section.icon] || IcFolder;
          return (
            <button
              key={section.id}
              className="flex items-center gap-3 w-full px-4 py-3.5 border-b border-gray-50 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800"
              onClick={() => navigate(section.route)}
            >
              <div className="w-9 h-9 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                <IconComp size={20} className="text-gray-600 dark:text-gray-300" />
              </div>
              <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{section.label}</span>
            </button>
          );
        })}

        {/* Recent files preview */}
        {recentFiles.length > 0 && (
          <div className="mt-3">
            <div className="px-4 py-2">
              <span className="text-xs font-medium text-gray-500 uppercase">最近文件</span>
            </div>
            {recentFiles.map(file => (
              <button
                key={file.id}
                className="flex items-center gap-3 w-full px-4 py-3 border-b border-gray-50 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800"
                onClick={() => navigate(`/file/${file.id}`)}
                data-trigger="file.detail.open" data-trigger-type="tap" data-trigger-params={`fileId=${file.id}`}
              >
                <IcFolder size={20} className="text-gray-400" />
                <div className="flex-1 text-left">
                  <div className="text-sm text-gray-900 dark:text-gray-100">{file.name}</div>
                  <div className="text-xs text-gray-400">{formatFileSize(file.size)}</div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* New Folder Dialog */}
      {showNewFolder && (
        <div className="absolute inset-0 z-50 flex items-end justify-center bg-black/40" onClick={() => setSearchParams(p => { p.delete('newFolder'); return p; })}>
          <div className="w-full bg-white dark:bg-gray-800 rounded-t-2xl p-5" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">新建文件夹</h3>
            <input
              autoFocus
              className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 mb-4"
              placeholder="文件夹名称"
              value={newFolderName}
              onChange={e => setNewFolderName(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') handleCreateFolder(); }}
              data-action="newFolder.name.submit" data-action-type="input"
            />
            <div className="flex gap-3">
              <button
                className="flex-1 py-2.5 text-sm text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-600 rounded-lg"
                onClick={() => { setNewFolderName(''); setSearchParams(p => { p.delete('newFolder'); return p; }); }}
              >
                取消
              </button>
              <button
                className="flex-1 py-2.5 text-sm text-white bg-blue-600 rounded-lg font-medium"
                onClick={handleCreateFolder}
              >
                创建
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Menu Dialog */}
      {showNewMenu && (
        <div className="absolute inset-0 z-50 flex items-end justify-center bg-black/40" onClick={() => setSearchParams(p => { p.delete('newMenu'); return p; })}>
          <div className="w-full bg-white dark:bg-gray-800 rounded-t-2xl p-5" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">新建</h3>
            <button
              className="flex items-center gap-3 w-full px-3 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg"
              onClick={() => { setSearchParams(p => { p.delete('newMenu'); p.set('newFolder', 'open'); return p; }); }}
            >
              <IcFolder size={22} className="text-gray-500" />
              <span className="text-sm text-gray-900 dark:text-gray-100">文件夹</span>
            </button>
            <button
              className="flex items-center gap-3 w-full px-3 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg"
              onClick={() => { setSearchParams(p => { p.delete('newMenu'); p.set('upload', 'open'); return p; }); }}
            >
              <IcPlus size={22} className="text-gray-500" />
              <span className="text-sm text-gray-900 dark:text-gray-100">上传文件</span>
            </button>
          </div>
        </div>
      )}

      {/* Upload Dialog */}
      {searchParams.get('upload') === 'open' && (
        <UploadDialog onClose={() => setSearchParams(p => { p.delete('upload'); return p; })} />
      )}
    </div>
  );
}

function UploadDialog({ onClose }: { onClose: () => void }) {
  const uploadDeviceFile = useGoogleDriveStore(s => s.uploadDeviceFile);

  const handleUpload = (deviceFileId: string) => {
    uploadDeviceFile(deviceFileId, null);
    onClose();
  };

  return (
    <div className="absolute inset-0 z-50 flex items-end justify-center bg-black/40" onClick={onClose}>
      <div className="w-full bg-white dark:bg-gray-800 rounded-t-2xl p-5 max-h-[70vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">选择要上传的文件</h3>
        {DEVICE_FILES.map(df => (
          <button
            key={df.id}
            className="flex items-center gap-3 w-full px-3 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg border-b border-gray-100 dark:border-gray-700"
            onClick={() => handleUpload(df.id)}
            data-trigger="upload.file.select" data-trigger-type="tap"
          >
            <IcFolder size={22} className="text-gray-400" />
            <div className="flex-1 text-left">
              <div className="text-sm text-gray-900 dark:text-gray-100">{df.name}</div>
              <div className="text-xs text-gray-400">{formatFileSize(df.size)}</div>
            </div>
          </button>
        ))}
        <button
          className="w-full py-2.5 mt-3 text-sm text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-600 rounded-lg"
          onClick={onClose}
        >
          取消
        </button>
      </div>
    </div>
  );
}
