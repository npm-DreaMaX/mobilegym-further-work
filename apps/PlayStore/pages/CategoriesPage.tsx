import React from 'react';
import { usePlayStoreNavigate } from '../navigation';
import { usePlayStoreStore } from '../state';
import { IconRenderer } from '../res/icons';
import { CATEGORIES } from '../constants';
import { baseApps } from '../data';

const CategoriesPage: React.FC = () => {
  const { go, back } = usePlayStoreNavigate();
  const setCurrentCategory = usePlayStoreStore(s => s.setCurrentCategory);
  const allApps = baseApps();

  const handleCategoryOpen = (categoryId: string) => {
    setCurrentCategory(categoryId);
    go('categories.detail.open', { categoryId });
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
          <span className="text-lg font-semibold text-gray-900">分类</span>
        </div>
      </div>

      {/* Category List */}
      <div className="flex-1 overflow-y-auto px-4 pt-3 pb-20" data-scroll-container="main" data-scroll-direction="vertical">
        <div className="grid grid-cols-2 gap-3">
          {CATEGORIES.map(cat => {
            const count = allApps.filter(a => a.categoryId === cat.id).length;
            return (
              <button
                key={cat.id}
                className="flex items-center gap-3 p-4 bg-white rounded-xl border border-gray-100 hover:bg-gray-50 active:bg-gray-100 text-left"
                onClick={() => handleCategoryOpen(cat.id)}
                data-trigger="categories.detail.open"
                data-trigger-params={JSON.stringify({ categoryId: cat.id })}
              >
                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                  <IconRenderer name={cat.icon} size={20} />
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-medium text-gray-900">{cat.name}</div>
                  <div className="text-xs text-gray-400">{count} 个应用</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default CategoriesPage;
