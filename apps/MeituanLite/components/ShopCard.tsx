import React from 'react';
import { IcStar, IcClock, IcLocation } from '../res/icons';
import { SHOP_TAG_COLORS } from '../data';
import { useAppStrings } from '@/os/useAppStrings';
import { strings } from '../res/strings';
import { stringsEn } from '../res/strings.en';
import { useMeituanLiteGestures } from '../hooks/useMeituanLiteGestures';
import type { Shop } from '../types';

interface ShopCardProps {
  shop: Shop;
}

/** 附近商家列表卡片 */
const ShopCard: React.FC<ShopCardProps> = ({ shop }) => {
  const s = useAppStrings(strings, stringsEn);
  const { go } = useMeituanLiteGestures();

  const openShop = () => go('shop.open', { shopId: shop.id });

  // 主满减文案
  const promoText = shop.promotions.find((p) => p.type === '满减')?.text;

  return (
    <div
      className="bg-white px-3 py-3 active:bg-gray-50 cursor-pointer"
      onClick={openShop}
      role="button"
      tabIndex={0}
    >
      <div className="flex gap-3">
        {/* 合成封面：色块 + emoji */}
        <div
          className="w-16 h-16 rounded-xl flex items-center justify-center text-3xl flex-shrink-0"
          style={{ background: shop.coverColor }}
        >
          <span>{shop.emoji}</span>
        </div>

        <div className="flex-1 min-w-0">
          {/* 商家名 + 标签 */}
          <div className="flex items-center gap-1.5">
            <span className="text-[15px] font-bold text-gray-900 truncate">{shop.name}</span>
            {shop.tags.includes('品牌') && (
              <span className="text-[9px] text-white bg-[#9C5BF5] px-1 rounded-sm">品牌</span>
            )}
          </div>

          {/* 评分 月售 起送 配送 时间 距离 */}
          <div className="flex items-center gap-1.5 mt-1 text-[11px] text-gray-500">
            <span className="flex items-center gap-0.5 text-[#FF5339] font-semibold">
              <IcStar size={11} className="fill-[#FFB400] text-[#FFB400]" />
              {shop.rating}
            </span>
            <span>·</span>
            <span>
              {s.shop_month_sales}
              {shop.monthSales}
            </span>
            <span>·</span>
            <span>
              {s.shop_min_order}¥{shop.minOrder}
            </span>
          </div>

          <div className="flex items-center gap-1.5 mt-0.5 text-[11px] text-gray-500">
            <span className="flex items-center gap-0.5">
              <IcClock size={11} />
              {shop.deliveryTime}
              {s.shop_delivery_time}
            </span>
            <span>·</span>
            <span>
              {s.shop_delivery_fee}¥{shop.deliveryFee}
            </span>
            <span>·</span>
            <span className="flex items-center gap-0.5">
              <IcLocation size={11} />
              {shop.distance}
              {s.shop_distance_km}
            </span>
          </div>

          {/* 标签条 */}
          {shop.tags.length > 0 && (
            <div className="flex items-center gap-1 mt-1.5 flex-wrap">
              {shop.tags.map((t) => (
                <span
                  key={t}
                  className="text-[9px] px-1 py-0.5 rounded-sm border"
                  style={{
                    color: SHOP_TAG_COLORS[t] ?? '#9B9B9B',
                    borderColor: (SHOP_TAG_COLORS[t] ?? '#9B9B9B') + '55',
                  }}
                >
                  {t}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 满减条 */}
      {promoText && (
        <div className="mt-2 flex items-center gap-1 text-[11px]">
          <span className="text-white bg-[#FF5339] px-1 rounded-sm">减</span>
          <span className="text-[#FF5339]">{promoText}</span>
        </div>
      )}
    </div>
  );
};

export default ShopCard;
