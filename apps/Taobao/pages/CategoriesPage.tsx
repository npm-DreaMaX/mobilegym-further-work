import React, { useState } from 'react';
import { useTaobaoStore } from '../state';
import { useTaobaoGestures } from '../navigation';
import { useTaobaoStrings } from '../hooks/useTaobaoStrings';
import TabBar from '../components/TabBar';
import {
  IcSmartphone, IcTv, IcShirt, IcSparkles, IcWine, IcBook, IcDumbbell, IcBackpack,
  IcNavForward, IcStar, IcShop,
} from '../res/icons';
import type { Category, Product } from '../types';

const CATEGORY_ICON_MAP: Record<string, React.FC<{ size?: number; className?: string }>> = {
  IcSmartphone, IcTv, IcShirt, IcSparkles, IcWine, IcBook, IcDumbbell, IcBackpack,
};

const CategoriesPage: React.FC = () => {
  const s = useTaobaoStrings();
  const { bindTap, bindBack, go } = useTaobaoGestures();
  const categories = useTaobaoStore(st => st.categories) as Record<string, Category>;
  const products = useTaobaoStore(st => st.products) as Record<string, Product>;
  const brands = useTaobaoStore(st => st.brands) as Record<string, any>;
  const shops = useTaobaoStore(st => st.shops) as Record<string, any>;

  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);

  const categoryList = Object.values(categories);
  const selectedCategory = selectedCategoryId ? categories[selectedCategoryId] : null;
  const categoryProducts = selectedCategory
    ? selectedCategory.productIds.map(pid => products[pid]).filter(Boolean)
    : [];

  const brandList = Object.values(brands);

  const handleCategoryClick = (catId: string) => {
    if (selectedCategoryId === catId) {
      setSelectedCategoryId(null);
    } else {
      setSelectedCategoryId(catId);
    }
  };

  const handleProductClick = (productId: string) => {
    go('category.item.open', { id: productId });
  };

  const handleShopClick = (shopId: string) => {
    go('category.shop.open', { id: shopId });
  };

  return (
    <div className="h-full w-full flex flex-col bg-gray-50" data-status-bar-foreground="dark">
      {/* Header */}
      <div className="bg-white px-4 pt-10 pb-3 flex items-center border-b border-gray-100">
        <h1 className="text-lg font-bold text-gray-800">{s.tab_category}</h1>
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-hidden flex flex-col">
        <div data-scroll-container="main" data-scroll-direction="vertical" className="flex-1 overflow-y-auto">
          {/* Category grid */}
          <div className="bg-white px-3 py-4">
            <div className="grid grid-cols-4 gap-y-5 gap-x-2">
              {categoryList.map(cat => {
                const IconComp = CATEGORY_ICON_MAP[cat.icon];
                const isActive = selectedCategoryId === cat.id;
                return (
                  <div
                    key={cat.id}
                    className={`flex flex-col items-center cursor-pointer py-2 rounded-lg transition-colors ${
                      isActive ? 'bg-orange-50' : ''
                    }`}
                    onClick={() => handleCategoryClick(cat.id)}
                    data-trigger="category.select"
                    data-trigger-params={JSON.stringify({ id: cat.id })}
                  >
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                      isActive ? 'bg-orange-100' : 'bg-orange-50'
                    }`}>
                      {IconComp ? (
                        <IconComp size={24} className={isActive ? 'text-orange-500' : 'text-gray-600'} />
                      ) : (
                        <IcSmartphone size={24} className="text-gray-600" />
                      )}
                    </div>
                    <span className={`text-xs mt-1.5 ${isActive ? 'text-orange-500 font-medium' : 'text-gray-700'}`}>
                      {cat.name}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Selected category products */}
          {selectedCategory && (
            <div className="mt-2">
              <div className="bg-white px-4 py-3 flex items-center justify-between">
                <h2 className="text-sm font-bold text-gray-800">
                  {selectedCategory.name} — 共{categoryProducts.length}件商品
                </h2>
                <button
                  className="text-xs text-gray-500"
                  onClick={() => setSelectedCategoryId(null)}
                >
                  收起
                </button>
              </div>
              <div className="bg-white px-3 pb-3 grid grid-cols-2 gap-3">
                {categoryProducts.map(product => {
                  const shop = shops[product.shopId];
                  return (
                    <div
                      key={product.id}
                      className="bg-gray-50 rounded-lg p-3 cursor-pointer"
                      onClick={() => handleProductClick(product.id)}
                      data-trigger="category.item.open"
                      data-trigger-params={JSON.stringify({ id: product.id })}
                    >
                      {/* Product image placeholder */}
                      <div className="w-full aspect-square bg-gradient-to-br from-gray-200 to-gray-100 rounded-lg mb-2 flex items-center justify-center text-gray-400 text-xs">
                        {product.title.slice(0, 8)}
                      </div>
                      <h3 className="text-xs font-medium text-gray-800 line-clamp-2 leading-tight">
                        {product.title}
                      </h3>
                      <div className="flex items-center gap-1 mt-1">
                        <span className="text-sm font-bold text-red-500">¥{product.price}</span>
                        {product.originalPrice > product.price && (
                          <span className="text-[10px] text-gray-400 line-through">
                            ¥{product.originalPrice}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center justify-between mt-1">
                        <div className="flex items-center gap-0.5">
                          <IcStar size={10} className="text-yellow-400 fill-yellow-400" />
                          <span className="text-[10px] text-gray-500">{product.rating}</span>
                        </div>
                        <span className="text-[10px] text-gray-400">已售{product.sales > 999 ? `${(product.sales / 1000).toFixed(1)}k` : product.sales}</span>
                      </div>
                      {shop && (
                        <div
                          className="flex items-center gap-1 mt-1.5 cursor-pointer"
                          onClick={(e) => { e.stopPropagation(); handleShopClick(shop.id); }}
                          data-trigger="category.shop.open"
                          data-trigger-params={JSON.stringify({ id: shop.id })}
                        >
                          <IcShop size={12} className="text-blue-500" />
                          <span className="text-[10px] text-blue-500 truncate">{shop.name}</span>
                          <IcNavForward size={10} className="text-blue-400" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Brand section */}
          <div className="mt-2 bg-white px-4 py-3">
            <h2 className="text-sm font-bold text-gray-800 mb-3">品牌推荐</h2>
            <div className="flex flex-wrap gap-2">
              {brandList.map(brand => (
                <span
                  key={brand.id}
                  className="px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-full text-xs text-gray-700 cursor-pointer hover:bg-gray-100"
                >
                  {brand.name}
                </span>
              ))}
            </div>
          </div>

          {/* Bottom spacer for TabBar */}
          <div className="h-16" />
        </div>
      </div>

      <TabBar />
    </div>
  );
};

export default CategoriesPage;
