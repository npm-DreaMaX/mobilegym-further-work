import React, { useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { useTaobaoStore } from '../state';
import { useTaobaoGestures } from '../navigation';
import { useTaobaoStrings } from '../hooks/useTaobaoStrings';
import {
  IcNavBack, IcStar, IcSearch, IcShop, IcNavForward,
} from '../res/icons';
import type { Shop } from '../types';

const ShopPage: React.FC = () => {
  const { id: shopId } = useParams<{ id: string }>();
  const s = useTaobaoStrings();
  const { bindBack, go, bindTap } = useTaobaoGestures();

  const shops = useTaobaoStore(st => st.shops) as Record<string, Shop>;
  const products = useTaobaoStore(st => st.products) as Record<string, any>;

  const [searchQuery, setSearchQuery] = useState('');

  const shop = shopId ? shops[shopId] : null;

  const allShopProducts = useMemo(() => {
    if (!shop) return [];
    return shop.productIds
      .map(pid => products[pid])
      .filter(Boolean);
  }, [shop, products]);

  const filteredProducts = useMemo(() => {
    if (!searchQuery.trim()) return allShopProducts;
    const q = searchQuery.trim().toLowerCase();
    return allShopProducts.filter(p =>
      p.title.toLowerCase().includes(q) ||
      (p.description && p.description.toLowerCase().includes(q)),
    );
  }, [allShopProducts, searchQuery]);

  const handleProductClick = (productId: string) => {
    go('search.item.open', { id: productId });
  };

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalf = rating - fullStars >= 0.5;
    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(<IcStar key={i} size={12} className="text-yellow-400 fill-yellow-400" />);
      } else if (i === fullStars && hasHalf) {
        stars.push(<IcStar key={i} size={12} className="text-yellow-400 fill-yellow-400 opacity-50" />);
      } else {
        stars.push(<IcStar key={i} size={12} className="text-gray-300" />);
      }
    }
    return stars;
  };

  if (!shop) {
    return (
      <div className="h-full w-full flex flex-col bg-gray-50" data-status-bar-foreground="dark">
        <div className="bg-white px-4 pt-10 pb-3 flex items-center border-b border-gray-100">
          <button {...bindBack()} className="mr-3 p-1 -ml-1">
            <IcNavBack size={22} className="text-gray-800" />
          </button>
          <h1 className="text-lg font-bold text-gray-800">{s.shop_title}</h1>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <p className="text-sm text-gray-400">店铺不存在</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full flex flex-col bg-gray-50" data-status-bar-foreground="dark">
      {/* Header */}
      <div className="bg-white px-4 pt-10 pb-3 flex items-center border-b border-gray-100">
        <button {...bindBack()} className="mr-3 p-1 -ml-1">
          <IcNavBack size={22} className="text-gray-800" />
        </button>
        <h1 className="text-lg font-bold text-gray-800 flex-1 truncate">{shop.name}</h1>
      </div>

      <div data-scroll-container="main" data-scroll-direction="vertical" className="flex-1 overflow-y-auto">
        {/* Shop info */}
        <div className="bg-white px-4 py-4">
          <div className="flex items-center gap-3">
            {/* Shop avatar placeholder */}
            <div className="w-14 h-14 bg-gradient-to-br from-orange-200 to-orange-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <IcShop size={28} className="text-orange-500" />
            </div>
            <div className="flex-1">
              <h2 className="text-base font-bold text-gray-800">{shop.name}</h2>
              <div className="flex items-center gap-2 mt-1">
                <div className="flex items-center gap-0.5">
                  {renderStars(shop.rating)}
                </div>
                <span className="text-xs text-gray-500">{shop.rating}分</span>
              </div>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-3 leading-relaxed">{shop.description}</p>
        </div>

        {/* Search within shop */}
        <div className="px-4 mt-3">
          <div className="relative">
            <IcSearch size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              className="w-full bg-white border border-gray-200 rounded-lg pl-9 pr-3 py-2.5 text-sm text-gray-800 outline-none placeholder:text-gray-400"
              placeholder={s.shop_search}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Products grid */}
        <div className="px-3 mt-3">
          <div className="flex items-center justify-between mb-2 px-1">
            <h3 className="text-sm font-bold text-gray-800">
              {searchQuery ? `搜索结果 (${filteredProducts.length})` : `${s.shop_all_products} (${filteredProducts.length})`}
            </h3>
          </div>

          {filteredProducts.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-sm text-gray-400">
                {searchQuery ? '未找到相关商品' : '暂无商品'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 pb-6">
              {filteredProducts.map(product => (
                <div
                  key={product.id}
                  className="bg-white rounded-lg overflow-hidden border border-gray-100 cursor-pointer active:opacity-80"
                  onClick={() => handleProductClick(product.id)}
                  data-trigger="shop.item.open"
                  data-trigger-params={JSON.stringify({ id: product.id })}
                >
                  {/* Product image placeholder */}
                  <div className="w-full aspect-square bg-gradient-to-br from-gray-100 to-gray-50 flex items-center justify-center text-gray-400 text-xs">
                    {product.title.slice(0, 8)}
                  </div>
                  <div className="p-2.5">
                    <h4 className="text-xs font-medium text-gray-800 line-clamp-2 leading-tight">
                      {product.title}
                    </h4>
                    <div className="flex items-center gap-1 mt-1.5">
                      <span className="text-sm font-bold text-red-500">¥{product.price}</span>
                      {product.originalPrice > product.price && (
                        <span className="text-[10px] text-gray-400 line-through">
                          ¥{product.originalPrice}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      <div className="flex items-center gap-0.5">
                        {renderStars(product.rating)}
                      </div>
                      <span className="text-[10px] text-gray-400">已售{product.sales}</span>
                    </div>
                    {product.freeShipping && (
                      <span className="mt-1.5 inline-block text-[10px] text-green-500 bg-green-50 px-1.5 py-0.5 rounded">
                        {s.product_free_shipping}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Bottom spacer */}
        <div className="h-8" />
      </div>
    </div>
  );
};

export default ShopPage;
