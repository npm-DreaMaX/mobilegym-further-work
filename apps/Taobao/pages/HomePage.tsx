import React, { useMemo } from 'react';
import { useTaobaoGestures } from '../navigation';
import { useTaobaoStrings } from '../hooks/useTaobaoStrings';
import { useTaobaoStore } from '../state';
import {
  IcSearch,
  IcCamera,
  IcStar,
  IcHeart,
  IcHistory,
  ICON_REGISTRY,
} from '../res/icons';
import TabBar from '../components/TabBar';

const HomePage: React.FC = () => {
  const { bindTap, bindAction } = useTaobaoGestures();
  const s = useTaobaoStrings();

  const products = useTaobaoStore(st => st.products);
  const categories = useTaobaoStore(st => st.categories);
  const favoriteIds = useTaobaoStore(st => st.favoriteIds);
  const recentlyViewed = useTaobaoStore(st => st.recentlyViewed);

  // Recommended products: show products with highest sales
  const recommended = useMemo(() => {
    return Object.values(products)
      .filter(p => p.enabled)
      .sort((a, b) => b.sales - a.sales)
      .slice(0, 6);
  }, [products]);

  // Recently viewed products
  const recentProducts = useMemo(() => {
    return recentlyViewed
      .map(id => products[id])
      .filter(Boolean)
      .slice(0, 4);
  }, [recentlyViewed, products]);

  const categoryList = useMemo(() => {
    return Object.values(categories).slice(0, 8);
  }, [categories]);

  return (
    <div className="h-full w-full flex flex-col bg-gray-100" data-status-bar-foreground="dark">
      {/* Search bar */}
      <div className="pt-10 bg-white px-4 pb-3">
        <div
          {...bindTap('home.search.open')}
          className="flex items-center bg-gray-100 rounded-full px-4 py-2.5 cursor-pointer"
          data-trigger="home.search.open"
        >
          <IcSearch size={18} className="text-gray-400 mr-2" />
          <span className="text-gray-400 text-sm flex-1">{s.home_search_placeholder}</span>
          <IcCamera size={18} className="text-gray-400" />
        </div>
      </div>

      <div
        className="flex-1 overflow-y-auto"
        data-scroll-container="main"
        data-scroll-direction="vertical"
      >
        {/* Category grid */}
        <div className="bg-white mx-3 mt-3 rounded-xl px-2 pt-4 pb-2">
          <div className="grid grid-cols-4 gap-y-4">
            {categoryList.map(cat => {
              const IconComponent = ICON_REGISTRY[cat.icon];
              return (
                <div
                  key={cat.id}
                  {...bindTap('home.category.open')}
                  className="flex flex-col items-center cursor-pointer"
                >
                  <div className="w-[48px] h-[48px] rounded-full bg-orange-50 flex items-center justify-center mb-1.5">
                    {IconComponent ? (
                      <IconComponent size={24} className="text-app-primary" />
                    ) : (
                      <div className="w-6 h-6 rounded bg-gray-200" />
                    )}
                  </div>
                  <span className="text-xs text-gray-700">{cat.name}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* "猜你喜欢" section */}
        <div className="mx-3 mt-3">
          <div className="flex items-center justify-between mb-2 px-1">
            <h2 className="text-base font-bold text-gray-800">{s.home_recommend}</h2>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {recommended.map(product => {
              const isFav = favoriteIds.includes(product.id);
              return (
                <div
                  key={product.id}
                  className="bg-white rounded-xl overflow-hidden cursor-pointer"
                  {...bindTap('home.item.open', { id: product.id })}
                >
                  {/* Image placeholder */}
                  <div className="h-[140px] bg-gray-200 flex items-center justify-center">
                    <span className="text-gray-400 text-xs">{product.title.slice(0, 10)}...</span>
                  </div>
                  <div className="p-2">
                    <h3 className="text-sm font-medium text-gray-800 line-clamp-2 leading-tight mb-1.5">
                      {product.title}
                    </h3>
                    <div className="flex items-center gap-1">
                      <span className="text-red-500 text-base font-bold">
                        ¥{product.price}
                      </span>
                      {product.originalPrice > product.price && (
                        <span className="text-gray-400 text-xs line-through">
                          ¥{product.originalPrice}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-gray-400 text-xs">
                        已售{product.sales >= 10000
                          ? `${(product.sales / 10000).toFixed(1)}万`
                          : product.sales}
                      </span>
                      {isFav && <IcHeart size={14} className="text-red-500" fill="currentColor" />}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* "最近浏览" section */}
        {recentProducts.length > 0 && (
          <div className="mx-3 mt-4 mb-4">
            <div className="flex items-center gap-1.5 mb-2 px-1">
              <IcHistory size={16} className="text-gray-500" />
              <h2 className="text-base font-bold text-gray-800">{s.home_recently_viewed}</h2>
            </div>
            <div className="flex gap-2 overflow-x-auto pb-2">
              {recentProducts.map(product => (
                <div
                  key={product.id}
                  className="bg-white rounded-xl overflow-hidden min-w-[130px] max-w-[130px] cursor-pointer flex-shrink-0"
                  {...bindTap('home.item.open', { id: product.id })}
                >
                  <div className="h-[100px] bg-gray-200 flex items-center justify-center">
                    <span className="text-gray-400 text-xs">{product.title.slice(0, 8)}</span>
                  </div>
                  <div className="p-2">
                    <h3 className="text-xs text-gray-800 line-clamp-2 leading-tight mb-1">
                      {product.title}
                    </h3>
                    <span className="text-red-500 text-sm font-bold">¥{product.price}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Bottom spacing for TabBar */}
        <div className="h-20" />
      </div>

      <TabBar />
    </div>
  );
};

export default HomePage;
