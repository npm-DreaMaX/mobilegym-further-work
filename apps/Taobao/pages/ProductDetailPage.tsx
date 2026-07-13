import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { useTaobaoGestures } from '../navigation';
import { useTaobaoStrings } from '../hooks/useTaobaoStrings';
import { useTaobaoStore } from '../state';
import {
  IcNavBack,
  IcHeart,
  IcShop,
  IcStar,
  IcMinus,
  IcPlus,
  IcTruck,
  IcShare,
  IcMore,
  IcCart,
} from '../res/icons';

const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { bindTap, bindBack, bindAction, go, back } = useTaobaoGestures();
  const s = useTaobaoStrings();

  // Store state
  const products = useTaobaoStore(st => st.products);
  const allSkus = useTaobaoStore(st => st.skus);
  const shops = useTaobaoStore(st => st.shops);
  const brands = useTaobaoStore(st => st.brands);
  const categories = useTaobaoStore(st => st.categories);
  const favoriteIds = useTaobaoStore(st => st.favoriteIds);
  const addToCart = useTaobaoStore(st => st.addToCart);
  const toggleFavorite = useTaobaoStore(st => st.toggleFavorite);
  const recordOpenedProduct = useTaobaoStore(st => st.recordOpenedProduct);

  const product = id ? products[id] : null;

  // Record product open
  useEffect(() => {
    if (id) recordOpenedProduct(id);
  }, [id, recordOpenedProduct]);

  // Get SKUs for this product
  const productSkus = useMemo(() => {
    if (!product) return [];
    return product.skuIds.map((skuId: string) => allSkus[skuId]).filter(Boolean);
  }, [product, allSkus]);

  // Extract attribute groups from SKUs
  const attributeGroups = useMemo(() => {
    if (productSkus.length === 0) return [];
    const keys = new Set<string>();
    productSkus.forEach((sku: any) => {
      Object.keys(sku.attributes).forEach(k => keys.add(k));
    });
    return Array.from(keys).map(key => {
      const values = Array.from(new Set(productSkus.map((sku: any) => sku.attributes[key]).filter(Boolean)));
      return { key, values };
    });
  }, [productSkus]);

  // Selected attributes state
  const [selectedAttributes, setSelectedAttributes] = useState<Record<string, string>>({});
  const [quantity, setQuantity] = useState(1);

  // Find matching SKU based on selected attributes
  const selectedSku = useMemo(() => {
    const attrKeys = Object.keys(selectedAttributes);
    if (attrKeys.length === 0 && productSkus.length === 1) {
      // Auto-select the only SKU
      return productSkus[0];
    }
    if (attrKeys.length < attributeGroups.length) return null;
    return productSkus.find((sku: any) =>
      attrKeys.every((k: string) => sku.attributes[k] === selectedAttributes[k])
    ) || null;
  }, [selectedAttributes, productSkus, attributeGroups]);

  // Auto-select first attribute values
  useEffect(() => {
    if (attributeGroups.length > 0 && Object.keys(selectedAttributes).length === 0) {
      const auto: Record<string, string> = {};
      attributeGroups.forEach((group: any) => {
        if (group.values.length > 0) {
          auto[group.key] = group.values[0] as string;
        }
      });
      setSelectedAttributes(auto);
    }
  }, [attributeGroups]);

  // Reset quantity when SKU changes
  useEffect(() => {
    setQuantity(1);
  }, [selectedSku?.id]);

  const isFav = product ? favoriteIds.includes(product.id) : false;
  const currentPrice = selectedSku ? selectedSku.price : (product?.price ?? 0);
  const currentOriginalPrice = selectedSku ? selectedSku.originalPrice : (product?.originalPrice ?? 0);
  const stock = selectedSku ? selectedSku.stock : 0;
  const shop = product ? shops[product.shopId] : null;
  const brand = product ? brands[product.brandId] : null;
  const category = product ? categories[product.categoryId] : null;

  const handleSelectAttribute = (key: string, value: string) => {
    setSelectedAttributes(prev => ({ ...prev, [key]: value }));
  };

  const handleAddToCart = () => {
    if (!product || !selectedSku) return;
    addToCart(product.id, selectedSku.id, quantity);
    back();
  };

  const handleBuyNow = () => {
    if (!product || !selectedSku) return;
    addToCart(product.id, selectedSku.id, quantity);
    go('cart.checkout.open');
  };

  const handleFavToggle = () => {
    if (product) toggleFavorite(product.id);
  };

  const handleQuantityChange = (delta: number) => {
    setQuantity(prev => {
      const next = prev + delta;
      if (next < 1) return 1;
      if (next > stock) return stock;
      return next;
    });
  };

  if (!product) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-white" data-status-bar-foreground="dark">
        <p className="text-gray-400">商品不存在</p>
      </div>
    );
  }

  return (
    <div className="h-full w-full flex flex-col bg-white" data-status-bar-foreground="dark">
      {/* Top chrome */}
      <div className="pt-10 px-3 pb-2 flex items-center justify-between border-b border-gray-100">
        <div {...bindBack()} className="p-1 cursor-pointer">
          <IcNavBack size={22} className="text-gray-700" />
        </div>
        <div className="flex items-center gap-3">
          <IcShare size={20} className="text-gray-500" />
          <IcMore size={20} className="text-gray-500" />
        </div>
      </div>

      {/* Main scrollable content */}
      <div
        className="flex-1 overflow-y-auto pb-4"
        data-scroll-container="main"
        data-scroll-direction="vertical"
      >
        {/* Image placeholder */}
        <div className="h-[320px] bg-gray-200 flex items-center justify-center mx-0">
          <span className="text-gray-400 text-sm">{product.title.slice(0, 20)}...</span>
        </div>

        {/* Price / Title section */}
        <div className="px-4 pt-3 pb-2">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-2xl font-bold text-red-500">¥{currentPrice}</span>
            {currentOriginalPrice > currentPrice && (
              <span className="text-gray-400 text-sm line-through">¥{currentOriginalPrice}</span>
            )}
            {product.freeShipping && (
              <span className="text-green-500 text-xs border border-green-300 rounded px-1.5 py-0.5 ml-auto">
                {s.product_free_shipping}
              </span>
            )}
          </div>

          <h1 className="text-base font-medium text-gray-800 leading-snug mb-2">
            {product.title}
          </h1>

          {/* Stats row */}
          <div className="flex items-center gap-4 text-xs text-gray-500">
            <span>{s.product_sales}: {product.sales >= 10000 ? `${(product.sales / 10000).toFixed(1)}万` : product.sales}</span>
            <span className="flex items-center gap-0.5">
              <IcStar size={12} className="text-yellow-400 fill-yellow-400" />
              {product.rating}
            </span>
            <span>{product.reviewCount} {s.product_reviews}</span>
          </div>
        </div>

        <div className="h-2 bg-gray-100" />

        {/* SKU selector */}
        <div className="px-4 py-3">
          <h3 className="text-sm font-medium text-gray-700 mb-3">{s.product_sku_select}</h3>
          {attributeGroups.map(group => (
            <div key={group.key} className="mb-3">
              <p className="text-xs text-gray-500 mb-1.5">{group.key}</p>
              <div className="flex flex-wrap gap-2">
                {group.values.map((val: any) => {
                  const isSelected = selectedAttributes[group.key] === val;
                  return (
                    <span
                      key={val}
                      className={`px-3 py-1.5 rounded-lg text-xs border cursor-pointer transition-colors ${
                        isSelected
                          ? 'border-app-primary bg-app-primary/5 text-app-primary font-medium'
                          : 'border-gray-200 text-gray-600 hover:border-gray-300'
                      }`}
                      onClick={() => handleSelectAttribute(group.key, val)}
                      data-action="item.sku.select.option"
                      data-action-params={JSON.stringify({ key: group.key, value: val })}
                    >
                      {val}
                    </span>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Stock info */}
          {selectedSku && (
            <p className="text-xs text-gray-400 mt-1">
              {s.product_stock}: {stock}件
            </p>
          )}
        </div>

        <div className="h-2 bg-gray-100" />

        {/* Quantity */}
        <div className="px-4 py-3 flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">{s.product_quantity}</span>
          <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
            <button
              className="w-9 h-9 flex items-center justify-center text-gray-500 hover:bg-gray-50 cursor-pointer disabled:opacity-30"
              onClick={() => handleQuantityChange(-1)}
              disabled={quantity <= 1}
              data-action="item.quantity.set.value"
              data-action-params={JSON.stringify({ delta: -1 })}
            >
              <IcMinus size={16} />
            </button>
            <span className="w-10 h-9 flex items-center justify-center text-sm font-medium border-x border-gray-200">
              {quantity}
            </span>
            <button
              className="w-9 h-9 flex items-center justify-center text-gray-500 hover:bg-gray-50 cursor-pointer disabled:opacity-30"
              onClick={() => handleQuantityChange(1)}
              disabled={quantity >= stock}
              data-action="item.quantity.set.value"
              data-action-params={JSON.stringify({ delta: 1 })}
            >
              <IcPlus size={16} />
            </button>
          </div>
        </div>

        <div className="h-2 bg-gray-100" />

        {/* Action buttons */}
        <div className="px-4 py-3 flex gap-3">
          <button
            className="flex-1 py-2.5 rounded-full text-sm bg-orange-500 text-white font-medium cursor-pointer disabled:opacity-50"
            onClick={handleAddToCart}
            disabled={!selectedSku}
            data-action="item.cart.add.submit"
          >
            {s.product_add_to_cart}
          </button>
          <button
            className="flex-1 py-2.5 rounded-full text-sm bg-app-primary text-white font-medium cursor-pointer disabled:opacity-50"
            onClick={handleBuyNow}
            disabled={!selectedSku}
            data-action="item.buy.now.submit"
          >
            {s.product_buy_now}
          </button>
          <button
            className={`w-11 h-10 rounded-full border flex items-center justify-center cursor-pointer ${
              isFav ? 'border-red-200 bg-red-50' : 'border-gray-200'
            }`}
            onClick={handleFavToggle}
            data-action="item.favorite.toggle"
          >
            <IcHeart
              size={18}
              className={isFav ? 'text-red-500' : 'text-gray-400'}
              fill={isFav ? 'currentColor' : 'none'}
            />
          </button>
        </div>

        {/* Enter shop */}
        {shop && (
          <div className="mx-4 mb-3">
            <div
              className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3 cursor-pointer"
              {...bindTap('item.shop.open', { id: product.shopId })}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                  <IcShop size={20} className="text-gray-500" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-800">{shop.name}</p>
                  <p className="text-xs text-gray-400">
                    {s.product_shop}评分: {shop.rating}
                  </p>
                </div>
              </div>
              <span className="text-xs text-app-primary">{s.product_enter_shop}</span>
            </div>
          </div>
        )}

        {/* Info tags */}
        <div className="px-4 py-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500">
          {brand && (
            <span>{s.product_brand}: {brand.name}</span>
          )}
          {category && (
            <span>{s.product_category}: {category.name}</span>
          )}
        </div>

        <div className="h-2 bg-gray-100" />

        {/* Description */}
        <div className="px-4 py-3">
          <h3 className="text-sm font-medium text-gray-700 mb-2">{s.product_description}</h3>
          <p className="text-sm text-gray-600 leading-relaxed">{product.description}</p>
        </div>

        {/* Bottom spacing */}
        <div className="h-4" />
      </div>

      {/* Bottom cart button */}
      <div className="border-t border-gray-100 px-4 py-2 flex items-center justify-between bg-white">
        <div
          className="flex items-center gap-1 cursor-pointer"
          onClick={() => go('tab.cart.fromItem')}
        >
          <IcCart size={22} className="text-gray-500" />
        </div>
        <div className="flex gap-2">
          <button
            className="px-6 py-2 rounded-full text-sm bg-orange-500 text-white font-medium cursor-pointer disabled:opacity-50"
            onClick={handleAddToCart}
            disabled={!selectedSku}
          >
            {s.product_add_to_cart}
          </button>
          <button
            className="px-6 py-2 rounded-full text-sm bg-app-primary text-white font-medium cursor-pointer disabled:opacity-50"
            onClick={handleBuyNow}
            disabled={!selectedSku}
          >
            {s.product_buy_now}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;
