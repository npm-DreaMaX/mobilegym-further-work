import React from 'react';
import Price from './Price';
import Stepper from './Stepper';
import { useAppStrings } from '@/os/useAppStrings';
import { strings } from '../res/strings';
import { stringsEn } from '../res/strings.en';
import type { Product } from '../types';

interface ProductItemProps {
  product: Product;
  qty: number;
  onAdd: () => void;
  onDecrease: () => void;
}

/** 菜品行：合成 emoji 封面 + 名称 + 月售好评 + 价格 + 加购/步进器 */
const ProductItem: React.FC<ProductItemProps> = ({ product, qty, onAdd, onDecrease }) => {
  const s = useAppStrings(strings, stringsEn);

  return (
    <div className="flex gap-3 px-3 py-3 border-b border-gray-50">
      {/* 合成封面 */}
      <div className="w-[72px] h-[72px] rounded-lg bg-gray-100 flex items-center justify-center text-4xl flex-shrink-0">
        <span>{product.emoji}</span>
      </div>

      <div className="flex-1 min-w-0 flex flex-col">
        <div className="flex items-center gap-1">
          <span className="text-sm font-semibold text-gray-900 truncate">{product.name}</span>
          {product.hot && (
            <span className="text-[9px] text-white bg-[#FF8C00] px-1 rounded-sm flex items-center gap-0.5">
              热销
            </span>
          )}
        </div>
        {product.desc && (
          <span className="text-[11px] text-gray-400 mt-0.5 line-clamp-1">{product.desc}</span>
        )}
        <div className="flex items-center gap-1.5 mt-1 text-[11px] text-gray-400">
          <span>
            {s.shop_month_sales}
            {product.monthSales}
          </span>
          <span>·</span>
          <span>
            {s.shop_good_rate}
            {product.goodRate}%
          </span>
        </div>

        <div className="flex items-end justify-between mt-auto pt-1">
          <Price value={product.price} size="lg" />
          <Stepper qty={qty} onDecrease={onDecrease} onIncrease={onAdd} />
        </div>
      </div>
    </div>
  );
};

export default ProductItem;
