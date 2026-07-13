import React from 'react';
import { IconRenderer } from '../res/icons';
import type { AppInfo } from '../types';

interface AppListItemProps {
  app: AppInfo;
  onClick?: (appId: string) => void;
  actionLabel?: string;
  onAction?: (appId: string) => void;
  showCategory?: boolean;
  showRating?: boolean;
}

export const AppListItem: React.FC<AppListItemProps> = ({
  app,
  onClick,
  actionLabel,
  onAction,
  showCategory = false,
  showRating = true,
}) => {
  return (
    <div
      className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 active:bg-gray-100 cursor-pointer"
      onClick={() => onClick?.(app.id)}
    >
      {/* App Icon */}
      <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
        <IconRenderer name={app.icon} size={28} />
      </div>

      {/* App Info */}
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-gray-900 truncate">{app.name}</div>
        {showCategory && (
          <div className="text-xs text-gray-500 truncate">{app.developer}</div>
        )}
        {showRating && (
          <div className="flex items-center gap-1 mt-0.5">
            <span className="text-xs font-medium text-gray-700">{app.rating.toFixed(1)}</span>
            <IconRenderer name="IcStar" size={10} />
            <span className="text-xs text-gray-400">{app.downloads}</span>
          </div>
        )}
        <div className="text-xs text-gray-400 truncate">{app.size}</div>
      </div>

      {/* Action Button */}
      {actionLabel && onAction && (
        <button
          className="flex-shrink-0 px-4 py-1.5 bg-app-primary text-white text-xs font-medium rounded-full hover:opacity-90 active:opacity-80"
          onClick={(e) => {
            e.stopPropagation();
            onAction(app.id);
          }}
          data-action="appDetail.install.invoke"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
};
