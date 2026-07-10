import React from 'react';
import { HOME_CATEGORIES } from '../data';
import { useAppStrings } from '@/os/useAppStrings';
import { strings } from '../res/strings';
import { stringsEn } from '../res/strings.en';
import { useMeituanLiteGestures } from '../hooks/useMeituanLiteGestures';

/** 首页分类宫格（4×2），点击跳搜索页带关键词 */
const CategoryGrid: React.FC = () => {
  const s = useAppStrings(strings, stringsEn);
  const { go } = useMeituanLiteGestures();

  const handleCategory = (label: string) => {
    go('search.open', { q: label });
  };

  return (
    <div className="bg-white px-3 py-3">
      <div className="grid grid-cols-4 gap-y-3 gap-x-1">
        {HOME_CATEGORIES.map((cat) => {
          const Icon = cat.icon;
          const label = s[cat.name];
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => handleCategory(label)}
              className="flex flex-col items-center gap-1.5 active:scale-95 transition-transform"
            >
              <span
                className="w-11 h-11 rounded-2xl flex items-center justify-center text-white shadow-sm"
                style={{ background: cat.color }}
              >
                <Icon size={24} strokeWidth={2} />
              </span>
              <span className="text-[11px] text-gray-700">{label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default CategoryGrid;
