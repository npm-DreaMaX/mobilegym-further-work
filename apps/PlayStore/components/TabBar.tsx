import React from 'react';
import { IconRenderer } from '../res/icons';
import type { LucideIcon } from 'lucide-react';

interface TabItem {
  id: string;
  icon: string;
  label: string;
  route: string;
}

interface TabBarProps {
  items: TabItem[];
  activeTab: string;
  onTabSelect: (tabId: string, route: string) => void;
}

export const TabBar: React.FC<TabBarProps> = ({ items, activeTab, onTabSelect }) => {
  return (
    <div className="flex items-center justify-around bg-white border-t border-gray-200 pt-1 pb-4" data-hide-on-keyboard>
      {items.map((item) => {
        const isActive = item.id === activeTab;
        return (
          <button
            key={item.id}
            className={`flex flex-col items-center gap-0.5 min-w-0 px-2 py-1 ${
              isActive ? 'text-app-primary' : 'text-gray-400'
            }`}
            onClick={() => onTabSelect(item.id, item.route)}
            data-trigger={`tab.${item.id}`}
          >
            <IconRenderer name={item.icon} size={22} />
            <span className="text-[10px] leading-tight truncate">{item.label}</span>
          </button>
        );
      })}
    </div>
  );
};
