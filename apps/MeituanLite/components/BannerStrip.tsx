import React from 'react';
import { MEITUAN_LITE_CONFIG } from '../data';

/** 优惠横幅（合成色块 + emoji，无真实图片） */
const BannerStrip: React.FC = () => {
  const banners = MEITUAN_LITE_CONFIG.banners;
  return (
    <div className="px-3 pt-2">
      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
        {banners.map((b) => (
          <div
            key={b.id}
            className="flex-shrink-0 w-[260px] h-[68px] rounded-xl flex items-center px-3 gap-2 text-white"
            style={{ background: `linear-gradient(135deg, ${b.color} 0%, ${b.color}cc 100%)` }}
          >
            <span className="text-3xl">{b.emoji}</span>
            <div className="flex flex-col">
              <span className="text-sm font-bold">{b.title}</span>
              <span className="text-[11px] opacity-90">{b.subtitle}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BannerStrip;
