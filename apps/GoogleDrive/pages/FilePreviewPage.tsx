import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useGoogleDriveStore } from '../state';
import { formatFileSize, FILE_TYPE_LABELS } from '../types';
import { IconRenderer, IcArrowLeft, IcFileText, IcFolder, IcImage, IcVideo, IcMusic } from '../res/icons';

export default function FilePreviewPage() {
  const { fileId } = useParams<{ fileId: string }>();
  const navigate = useNavigate();
  const files = useGoogleDriveStore(s => s.files);
  const file = React.useMemo(() => files.find(f => f.id === fileId), [files, fileId]);

  if (!file) {
    return (
      <div className="flex flex-col h-full pt-10 bg-gray-900" data-status-bar-foreground="light">
        <div className="flex items-center gap-2 px-3 py-2">
          <button onClick={() => navigate(-1)} className="p-1"><IcArrowLeft size={22} className="text-white" /></button>
          <span className="text-white">文件未找到</span>
        </div>
      </div>
    );
  }

  const typeIcon = (() => {
    switch (file.type) {
      case 'image': return 'IcImage';
      case 'video': return 'IcVideo';
      case 'audio': return 'IcMusic';
      case 'folder': return 'IcFolder';
      default: return 'IcFileText';
    }
  })();

  return (
    <div className="flex flex-col h-full pt-10 bg-gray-900" data-status-bar-foreground="light">
      <div className="flex items-center gap-2 px-3 py-2">
        <button onClick={() => navigate(-1)} className="p-1">
          <IcArrowLeft size={22} className="text-white" />
        </button>
        <span className="text-white text-sm truncate flex-1">{file.name}</span>
      </div>
      <div className="flex-1 flex flex-col items-center justify-center px-6">
        <IconRenderer name={typeIcon} size={80} className="text-gray-500 mb-6" />
        <h2 className="text-white text-lg font-medium mb-2 text-center">{file.name}</h2>
        <p className="text-gray-400 text-sm mb-1">{FILE_TYPE_LABELS[file.type]}</p>
        <p className="text-gray-500 text-xs">{formatFileSize(file.size)}</p>
        <p className="text-gray-600 text-xs mt-6">
          预览不可用 — 这是模拟的 Google Drive 环境
        </p>
      </div>
    </div>
  );
}
