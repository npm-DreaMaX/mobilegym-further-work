import React from 'react';
import { IcLocation, IcChevronDown, IcSearch, IcBell } from '../res/icons';
import { MEITUAN_LITE_CONFIG } from '../data';
import { useMeituanLiteStore } from '../state';
import { useAppStrings } from '@/os/useAppStrings';
import { strings } from '../res/strings';
import { stringsEn } from '../res/strings.en';
import { useMeituanLiteGestures } from '../hooks/useMeituanLiteGestures';
import CategoryGrid from '../components/CategoryGrid';
import BannerStrip from '../components/BannerStrip';
import ShopCard from '../components/ShopCard';
import TabBar from '../components/TabBar';

const HomePage: React.FC = () => {
  const s = useAppStrings(strings, stringsEn);
  const { bindTap } = useMeituanLiteGestures();
  const addressId = useMeituanLiteStore((st) => st.addressId);
  const address = MEITUAN_LITE_CONFIG.addresses.find((a) => a.id === addressId);

  return (
    <div className="h-full flex flex-col bg-gray-50" data-status-bar-foreground="dark">
      {/* 黄色顶部区域 */}
      <div className="flex-shrink-0 bg-[#FFC300] pt-10 px-3 pb-3">
        <div className="flex items-center justify-between">
          <button type="button" className="flex items-center gap-1 max-w-[60%]">
            <IcLocation size={16} className="text-[#1a1a1a]" />
            <span className="text-[14px] font-bold text-[#1a1a1a] truncate">
              {address ? address.detail : s.home_location_hint}
            </span>
            <IcChevronDown size={14} className="text-[#1a1a1a]" />
          </button>
          <IcBell size={20} className="text-[#1a1a1a]" />
        </div>

        {/* 搜索栏 */}
        <button
          type="button"
          {...bindTap<HTMLButtonElement>('search.open')}
          className="w-full mt-3 h-9 bg-white rounded-full flex items-center px-3 gap-2 active:bg-gray-50"
        >
          <IcSearch size={16} className="text-[#FFB000]" />
          <span className="text-[13px] text-gray-400">{s.home_search_placeholder}</span>
        </button>
      </div>

      {/* 可滚动内容 */}
      <div
        className="flex-1 overflow-y-auto"
        data-scroll-container="main"
        data-scroll-direction="vertical"
      >
        <CategoryGrid />
        <BannerStrip />

        {/* 附近商家 */}
        <div className="flex items-center justify-between px-3 pt-3 pb-1">
          <span className="text-[15px] font-bold text-gray-900">{s.home_nearby}</span>
        </div>
        <div className="bg-white">
          {MEITUAN_LITE_CONFIG.shops.map((shop) => (
            <ShopCard key={shop.id} shop={shop} />
          ))}
        </div>
        <div className="h-2" />
      </div>

      <TabBar />
    </div>
  );
};

export default HomePage;
