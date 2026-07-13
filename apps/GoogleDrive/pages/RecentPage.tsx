import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useGoogleDriveStore } from '../state';
import { formatFileSize } from '../types';
import { IconRenderer, IcArrowLeft, IcClock, IcFileText, IcFolder } from '../res/icons';

export default function RecentPage() {
  const navigate = useNavigate();
  const files = useGoogleDriveStore(s => s.files);

  const recentFiles = React.useMemo(() =>
    files
      .filter(f => !f.trashed && f.lastOpenedAt !== null)
      .sort((a, b) => (b.lastOpenedAt ?? 0) - (a.lastOpenedAt ?? 0)),
  [files]);

  return (
    <div className="flex flex-col h-full pt-10 bg-white dark:bg-[#1E1E1E]" data-status-bar-foreground="dark">
      <div className="flex items-center gap-2 px-3 py-2 border-b border-gray-200 dark:border-gray-700">
        <button onClick={() => navigate(-1)} className="p-1"><IcArrowLeft size={22} className="text-gray-700 dark:text-gray-300" /></button>
        <h1 className="text-lg font-medium text-gray-900 dark:text-gray-100">最近</h1>
      </div>
      <div className="flex-1 overflow-y-auto" data-scroll-container="main" data-scroll-direction="vertical">
        {recentFiles.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400">
            <IcClock size={48} className="mb-3" />
            <p className="text-sm">暂无最近文件</p>
          </div>
        ) : (
          recentFiles.map(file => (
            <button key={file.id} className="flex items-center gap-3 w-full px-4 py-3 border-b border-gray-50 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
              onClick={() => navigate(`/file/${file.id}`)} data-trigger="file.detail.open" data-trigger-type="tap" data-trigger-params={`fileId=${file.id}`}>
              <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center flex-shrink-0">
                <IconRenderer name={file.type === 'folder' ? 'IcFolder' : 'IcFileText'} size={18} className="text-gray-500" />
              </div>
              <div className="flex-1 text-left min-w-0">
                <div className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{file.name}</div>
                <div className="text-xs text-gray-400">
                  {file.ownerName} · {formatFileSize(file.size)} · {new Date(file.lastOpenedAt!).toLocaleDateString('zh-CN')}
                </div>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
}
