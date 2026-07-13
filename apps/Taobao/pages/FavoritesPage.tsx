import React from 'react';
import { useNavigate } from 'react-router-dom';
import { IcNavBack, IcHeart, IcStar } from '../res/icons';
import { useTaobaoGestures } from '../navigation';
import { useTaobaoStrings } from '../hooks/useTaobaoStrings';
import { useTaobaoStore } from '../state';
import type { Product } from '../types';

const FavoritesPage: React.FC = () => {
  const navigate = useNavigate();
  const { bindBack } = useTaobaoGestures();
  const s = useTaobaoStrings();

  const favoriteIds = useTaobaoStore((st) => st.favoriteIds);
  const products = useTaobaoStore((st) => st.products);
  const toggleFavorite = useTaobaoStore((st) => st.toggleFavorite);

  const favoriteProducts: Product[] = favoriteIds
    .map((id: string) => products[id] as Product | undefined)
    .filter((p): p is Product => p !== undefined && p.enabled);

  return (
    <div className="h-full flex flex-col bg-gray-50" data-status-bar-foreground="dark">
      {/* Header */}
      <div className="flex-shrink-0 bg-white pt-10 px-3 pb-3 border-b border-gray-100 flex items-center gap-3">
        <button type="button" {...bindBack()} className="p-1 -ml-1">
          <IcNavBack size={22} className="text-gray-800" />
        </button>
        <span className="text-[17px] font-bold text-gray-900">{s.fav_title}</span>
        <span className="text-[12px] text-gray-400 ml-1">({favoriteProducts.length})</span>
      </div>

      <div
        className="flex-1 overflow-y-auto"
        data-scroll-container="main"
        data-scroll-direction="vertical"
      >
        {favoriteProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24">
            <IcHeart size={48} className="text-gray-300 mb-3" />
            <p className="text-[13px] text-gray-400 mb-1">{s.fav_empty}</p>
            <button
              type="button"
              onClick={() => navigate('/')}
              className="mt-2 px-6 py-2 text-[13px] text-[#FF6A00] border border-[#FF6A00] rounded-full active:bg-[#FFF8F0]"
            >
              去首页看看
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2 p-3">
            {favoriteProducts.map((product: Product) => (
              <div
                key={product.id}
                className="bg-white rounded-lg overflow-hidden active:opacity-80"
              >
                <button
                  type="button"
                  onClick={() => navigate(`/item/${product.id}`)}
                  className="w-full text-left"
                >
                  <div className="w-full aspect-square bg-gray-100 flex items-center justify-center">
                    <span className="text-[11px] text-gray-400">商品</span>
                  </div>
                  <div className="p-2">
                    <p className="text-[12px] text-gray-800 line-clamp-2 leading-snug min-h-[2.5em]">
                      {product.title}
                    </p>
                    <div className="flex items-center gap-1 mt-1">
                      {product.freeShipping && (
                        <span className="text-[9px] text-[#FF6A00] border border-[#FF6A00] rounded px-0.5 leading-none">
                          包邮
                        </span>
                      )}
                    </div>
                    <div className="flex items-baseline gap-1 mt-1">
                      <span className="text-[14px] font-bold text-[#FF5339]">¥{product.price}</span>
                      {product.originalPrice > product.price && (
                        <span className="text-[10px] text-gray-400 line-through">
                          ¥{product.originalPrice}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1 mt-1">
                      <IcStar size={10} className="text-[#FFB000] fill-[#FFB000]" />
                      <span className="text-[10px] text-gray-500">{product.rating}</span>
                      <span className="text-[10px] text-gray-400">
                        已售{product.sales > 999 ? `${(product.sales / 10000).toFixed(1)}万` : product.sales}
                      </span>
                    </div>
                  </div>
                </button>
                <div className="px-2 pb-2">
                  <button
                    type="button"
                    onClick={() => toggleFavorite(product.id)}
                    className="w-full py-1.5 text-[11px] text-gray-500 border border-gray-200 rounded flex items-center justify-center gap-1 active:bg-gray-50"
                  >
                    <IcHeart size={12} className="text-red-400 fill-red-400" />
                    {s.fav_remove}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FavoritesPage;
