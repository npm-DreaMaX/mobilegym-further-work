import React, { useRef, useState, useMemo } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { IcStar, IcClock, IcLocation, IcFire } from '../res/icons';
import { SHOP_BY_ID, SHOP_TAG_COLORS } from '../data';
import {
  useMeituanLiteStore,
  selectCartLines,
} from '../state';
import { useAppStrings } from '@/os/useAppStrings';
import { strings } from '../res/strings';
import { stringsEn } from '../res/strings.en';
import { useMeituanLiteGestures } from '../hooks/useMeituanLiteGestures';
import ProductItem from '../components/ProductItem';
import CartBar from '../components/CartBar';
import CartSheet from '../components/CartSheet';

const ShopPage: React.FC = () => {
  const s = useAppStrings(strings, stringsEn);
  const { bindBack } = useMeituanLiteGestures();
  const { shopId } = useParams<{ shopId: string }>();
  const [searchParams] = useSearchParams();
  const cartOpen = searchParams.get('cart') === 'open';

  const shop = shopId ? SHOP_BY_ID[shopId] : undefined;

  const lines = useMeituanLiteStore(selectCartLines);
  const addToCart = useMeituanLiteStore((st) => st.addToCart);
  const changeQty = useMeituanLiteStore((st) => st.changeQty);

  const qtyMap = useMemo(() => {
    const m: Record<string, number> = {};
    for (const l of lines) m[l.productId] = l.qty;
    return m;
  }, [lines]);

  const [activeCat, setActiveCat] = useState<string>(shop?.categories[0]?.id ?? '');
  const groupRefs = useRef<Record<string, HTMLDivElement | null>>({});

  if (!shop) {
    return (
      <div className="h-full flex flex-col bg-white" data-status-bar-foreground="dark">
        <div className="pt-10 px-3 pb-2 flex items-center">
          <button type="button" {...bindBack<HTMLButtonElement>()} className="p-1 text-gray-700">
            {s.back}
          </button>
        </div>
        <div className="flex-1 flex items-center justify-center text-gray-400">{s.empty}</div>
      </div>
    );
  }

  const scrollToCat = (catId: string) => {
    setActiveCat(catId);
    const el = groupRefs.current[catId];
    if (el) el.scrollIntoView({ block: 'start', behavior: 'smooth' });
  };

  const promoText = shop.promotions.find((p) => p.type === '满减')?.text;

  return (
    <div className="h-full flex flex-col bg-gray-50 relative" data-status-bar-foreground="dark">
      {/* 顶部栏 */}
      <div className="flex-shrink-0 bg-white pt-10 px-3 pb-2 flex items-center gap-2 border-b border-gray-100 z-10">
        <button type="button" {...bindBack<HTMLButtonElement>()} className="p-1">
          <span className="text-[16px] text-gray-800">{s.back}</span>
        </button>
        <span className="text-[15px] font-bold text-gray-900 truncate flex-1">{shop.name}</span>
      </div>

      {/* 主体：左侧分类 + 右侧商品（含商家信息卡） */}
      <div className="flex-1 flex min-h-0">
        {/* 分类侧栏 */}
        <div
          className="w-[80px] flex-shrink-0 bg-[#f5f5f5] overflow-y-auto no-scrollbar"
          data-scroll-container="category"
          data-scroll-direction="vertical"
        >
          {shop.categories.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => scrollToCat(c.id)}
              className={`w-full text-left px-2 py-3 text-[12px] border-l-2 ${
                activeCat === c.id
                  ? 'bg-white text-[#FFB000] font-semibold border-[#FFC300]'
                  : 'text-gray-500 border-transparent'
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>

        {/* 右侧商品列表 */}
        <div
          className="flex-1 overflow-y-auto bg-white"
          data-scroll-container="main"
          data-scroll-direction="vertical"
        >
          {/* 商家信息卡 */}
          <div className="px-3 py-3 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <span className="text-[16px] font-bold text-gray-900">{shop.name}</span>
              {shop.tags.includes('品牌') && (
                <span className="text-[9px] text-white bg-[#9C5BF5] px-1 rounded-sm">品牌</span>
              )}
            </div>
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

            {/* 标签 */}
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

            {/* 公告 */}
            <div className="mt-2 text-[11px] text-gray-400 leading-relaxed">
              <span className="text-gray-500 font-semibold">{s.shop_notice}：</span>
              {shop.notice}
            </div>

            {/* 满减条 */}
            {promoText && (
              <div className="mt-2 flex items-center gap-1 text-[11px] bg-[#FFF3D6] rounded px-2 py-1">
                <IcFire size={11} className="text-[#FF5339]" />
                <span className="text-[#FF5339]">{promoText}</span>
              </div>
            )}
          </div>

          {/* 按分类分组的商品 */}
          {shop.categories.map((c) => {
            const products = shop.products.filter((p) => p.categoryId === c.id);
            if (products.length === 0) return null;
            return (
              <div key={c.id} ref={(el) => { groupRefs.current[c.id] = el; }}>
                <div className="px-3 py-2 text-[13px] font-bold text-gray-800 bg-gray-50 sticky top-0">
                  {c.name}
                </div>
                {products.map((p) => (
                  <ProductItem
                    key={p.id}
                    product={p}
                    qty={qtyMap[p.id] ?? 0}
                    onAdd={() => addToCart(shop.id, p.id)}
                    onDecrease={() => changeQty(p.id, -1)}
                  />
                ))}
              </div>
            );
          })}
          <div className="h-2" />
        </div>
      </div>

      {/* 底部购物车栏 */}
      <CartBar shop={shop} />

      {/* 购物车弹层 */}
      {cartOpen && <CartSheet shop={shop} />}
    </div>
  );
};

export default ShopPage;
