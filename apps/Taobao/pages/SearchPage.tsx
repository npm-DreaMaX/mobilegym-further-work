import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTaobaoGestures } from '../navigation';
import { useTaobaoStrings } from '../hooks/useTaobaoStrings';
import { useTaobaoStore } from '../state';
import {
  IcSearch,
  IcNavBack,
  IcClose,
  IcFilter,
  IcSort,
  
  IcStar,
  IcHeart,
  IcExpand,
} from '../res/icons';
import type { SortOption } from '../types';

// Static hot search suggestions
const HOT_SEARCHES = [
  'iPhone 16',
  '蓝牙耳机',
  '羽绒服',
  '精华液',
  '运动鞋',
  '坚果礼盒',
  '电饭煲',
  '机械键盘',
  '书包',
  '面膜',
];

const SORT_OPTIONS: { key: SortOption; label: string }[] = [
  { key: 'comprehensive', label: 'search_sort_comprehensive' },
  { key: 'sales', label: 'search_sort_sales' },
  { key: 'priceAsc', label: 'search_sort_price_asc' },
  { key: 'priceDesc', label: 'search_sort_price_desc' },
  { key: 'rating', label: 'search_sort_rating' },
];

const SearchPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { bindTap, bindBack, go, back } = useTaobaoGestures();
  const s = useTaobaoStrings();

  // Store state
  const products = useTaobaoStore(st => st.products);
  const skus = useTaobaoStore(st => st.skus);
  const categories = useTaobaoStore(st => st.categories);
  const brands = useTaobaoStore(st => st.brands);
  const searchState = useTaobaoStore(st => st.search);
  const setSearchCurrent = useTaobaoStore(st => st.setSearchCurrent);
  const recordSearchSnapshot = useTaobaoStore(st => st.recordSearchSnapshot);
  const recordOpenedProduct = useTaobaoStore(st => st.recordOpenedProduct);
  const clearSearchHistory = useTaobaoStore(st => st.clearSearchHistory);

  // Local state
  const [inputValue, setInputValue] = useState(searchParams.get('q') || '');
  const [showFilter, setShowFilter] = useState(false);

  // Filter local state
  const [filterCategory, setFilterCategory] = useState(searchState.current.categoryId || '');
  const [filterBrand, setFilterBrand] = useState(searchState.current.brandId || '');
  const [filterPriceMin, setFilterPriceMin] = useState(searchState.current.priceMin);
  const [filterPriceMax, setFilterPriceMax] = useState(searchState.current.priceMax);
  const [filterFreeShipping, setFilterFreeShipping] = useState(searchState.current.freeShippingOnly);
  const [filterMinRating, setFilterMinRating] = useState(searchState.current.minRating);

  const inputRef = useRef<HTMLInputElement>(null);

  const q = searchParams.get('q') || '';
  const isResultsMode = q.length > 0;
  const currentSort = (searchParams.get('sort') as SortOption) || searchState.current.sortOption || 'comprehensive';

  // Auto focus input in input mode
  useEffect(() => {
    if (!isResultsMode && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isResultsMode]);

  // Perform search when q changes
  const performSearch = useCallback((query: string) => {
    const trimmed = query.trim();
    if (!trimmed) return;
    setSearchCurrent({ query: trimmed });
    recordSearchSnapshot();
    setSearchParams({ q: trimmed, sort: currentSort });
  }, [setSearchCurrent, recordSearchSnapshot, setSearchParams, currentSort]);

  const handleInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      performSearch(inputValue);
    }
  };

  const handleClearInput = () => {
    setInputValue('');
    if (inputRef.current) inputRef.current.focus();
  };

  const handleBackToInput = () => {
    setSearchParams({});
    setInputValue('');
  };

  const handleSearchFromHistory = (query: string) => {
    setInputValue(query);
    performSearch(query);
  };

  const handleSortChange = (sort: SortOption) => {
    setSearchCurrent({ sortOption: sort });
    const params: Record<string, string> = { q };
    if (sort !== 'comprehensive') params.sort = sort;
    setSearchParams(params);
  };

  // Initialize filter state from store when toggling filter open
  const openFilter = () => {
    setFilterCategory(searchState.current.categoryId || '');
    setFilterBrand(searchState.current.brandId || '');
    setFilterPriceMin(searchState.current.priceMin);
    setFilterPriceMax(searchState.current.priceMax);
    setFilterFreeShipping(searchState.current.freeShippingOnly);
    setFilterMinRating(searchState.current.minRating);
    setShowFilter(true);
  };

  const applyFilter = () => {
    setSearchCurrent({
      categoryId: filterCategory || null,
      brandId: filterBrand || null,
      priceMin: filterPriceMin,
      priceMax: filterPriceMax,
      freeShippingOnly: filterFreeShipping,
      minRating: filterMinRating,
    });
    setShowFilter(false);
  };

  const resetFilter = () => {
    setFilterCategory('');
    setFilterBrand('');
    setFilterPriceMin('');
    setFilterPriceMax('');
    setFilterFreeShipping(false);
    setFilterMinRating('');
    setSearchCurrent({
      categoryId: null,
      brandId: null,
      priceMin: '',
      priceMax: '',
      freeShippingOnly: false,
      minRating: '',
    });
  };

  // Filter and sort products
  const searchResults = useMemo(() => {
    let list = Object.values(products).filter(p => p.enabled);

    // Filter by query
    if (q) {
      const qLower = q.toLowerCase();
      list = list.filter(p => {
        const brand = brands[p.brandId];
        return p.title.toLowerCase().includes(qLower) ||
               (brand && brand.name.toLowerCase().includes(qLower));
      });
    }

    // Filter by category
    if (searchState.current.categoryId) {
      list = list.filter(p => p.categoryId === searchState.current.categoryId);
    }

    // Filter by brand
    if (searchState.current.brandId) {
      list = list.filter(p => p.brandId === searchState.current.brandId);
    }

    // Filter by free shipping
    if (searchState.current.freeShippingOnly) {
      list = list.filter(p => p.freeShipping);
    }

    // Filter by min rating
    if (searchState.current.minRating) {
      const min = parseFloat(searchState.current.minRating);
      if (!isNaN(min)) {
        list = list.filter(p => p.rating >= min);
      }
    }

    // Filter by price range
    const pMin = searchState.current.priceMin ? parseFloat(searchState.current.priceMin) : 0;
    const pMax = searchState.current.priceMax ? parseFloat(searchState.current.priceMax) : Infinity;
    if (pMin > 0 || isFinite(pMax)) {
      list = list.filter(p => p.price >= pMin && p.price <= pMax);
    }

    // Sort
    const sort = currentSort;
    if (sort === 'sales') {
      list.sort((a, b) => b.sales - a.sales);
    } else if (sort === 'priceAsc') {
      list.sort((a, b) => a.price - b.price);
    } else if (sort === 'priceDesc') {
      list.sort((a, b) => b.price - a.price);
    } else if (sort === 'rating') {
      list.sort((a, b) => b.rating - a.rating);
    } else {
      // comprehensive: sort by sales
      list.sort((a, b) => b.sales - a.sales);
    }

    return list;
  }, [products, q, searchState.current, currentSort, brands]);

  const resultsCount = searchResults.length;
  const history = searchState.history;

  const handleProductClick = (productId: string) => {
    recordOpenedProduct(productId);
    go('search.item.open', { id: productId });
  };

  const getSortLabel = (key: string): string => {
    switch (key) {
      case 'comprehensive': return s.search_sort_comprehensive;
      case 'sales': return s.search_sort_sales;
      case 'priceAsc': return s.search_sort_price_asc;
      case 'priceDesc': return s.search_sort_price_desc;
      case 'rating': return s.search_sort_rating;
      default: return key;
    }
  };

  const categoryList = useMemo(() => Object.values(categories), [categories]);
  const brandList = useMemo(() => Object.values(brands), [brands]);

  return (
    <div className="h-full w-full flex flex-col bg-white" data-status-bar-foreground="dark">
      {/* Top bar */}
      <div className="pt-10 px-3 pb-2 border-b border-gray-100">
        {isResultsMode ? (
          <div className="flex items-center gap-2">
            <div
              className="flex-1 flex items-center bg-gray-100 rounded-full px-3 py-2 cursor-pointer"
              onClick={handleBackToInput}
              data-trigger="search.input"
            >
              <IcSearch size={16} className="text-gray-400 mr-2" />
              <span className="text-sm text-gray-600 flex-1">{q}</span>
              <IcClose
                size={16}
                className="text-gray-400"
                onClick={(e) => {
                  e.stopPropagation();
                  handleBackToInput();
                }}
              />
            </div>
            <span
              className="text-sm text-gray-600 cursor-pointer"
              onClick={handleBackToInput}
            >
              {s.search_cancel}
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <div
              {...bindBack()}
              className="p-1 cursor-pointer"
            >
              <IcNavBack size={22} className="text-gray-700" />
            </div>
            <div className="flex-1 flex items-center bg-gray-100 rounded-full px-3 py-2">
              <IcSearch size={16} className="text-gray-400 mr-2" />
              <input
                ref={inputRef}
                type="text"
                className="flex-1 bg-transparent text-sm outline-none text-gray-700 placeholder-gray-400"
                placeholder={s.search_placeholder}
                value={inputValue}
                onChange={e => setInputValue(e.target.value)}
                onKeyDown={handleInputKeyDown}
              />
              {inputValue.length > 0 && (
                <IcClose
                  size={16}
                  className="text-gray-400 cursor-pointer"
                  onClick={handleClearInput}
                />
              )}
            </div>
            <span
              className="text-sm text-app-primary font-medium cursor-pointer"
              onClick={() => performSearch(inputValue)}
            >
              {s.search_title}
            </span>
          </div>
        )}
      </div>

      {/* Sort bar - only in results mode */}
      {isResultsMode && (
        <div className="flex items-center border-b border-gray-100 px-2 py-2">
          <div className="flex-1 flex items-center gap-0 overflow-x-auto">
            {SORT_OPTIONS.map(opt => (
              <button
                key={opt.key}
                className={`px-2.5 py-1 text-xs rounded-full whitespace-nowrap ${
                  currentSort === opt.key
                    ? 'bg-app-primary text-white'
                    : 'text-gray-600'
                }`}
                onClick={() => handleSortChange(opt.key)}
                data-action="search.sort.select.option"
                data-action-params={JSON.stringify({ sort: opt.key })}
              >
                {getSortLabel(opt.key)}
              </button>
            ))}
          </div>
          <button
            className={`ml-1 flex items-center gap-1 px-2.5 py-1 text-xs rounded-full ${
              showFilter || searchState.current.categoryId || searchState.current.brandId
                ? 'bg-app-primary text-white'
                : 'text-gray-600'
            }`}
            onClick={openFilter}
            data-action="search.filter.open.drawer"
          >
            <IcFilter size={12} />
            {s.search_filter}
          </button>
        </div>
      )}

      {/* Main content */}
      <div
        className="flex-1 overflow-y-auto"
        data-scroll-container="main"
        data-scroll-direction="vertical"
      >
        {isResultsMode ? (
          /* Results mode */
          <div className="px-3 py-2">
            {resultsCount > 0 && (
              <p className="text-xs text-gray-400 mb-2">
                {s.search_results_count.replace('{count}', String(resultsCount))}
              </p>
            )}

            {resultsCount === 0 ? (
              <div className="flex flex-col items-center justify-center pt-16">
                <IcSearch size={48} className="text-gray-300 mb-3" />
                <p className="text-gray-400 text-sm">{s.search_no_results}</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                {searchResults.map(product => (
                  <div
                    key={product.id}
                    className="bg-white border border-gray-100 rounded-xl overflow-hidden cursor-pointer"
                    onClick={() => handleProductClick(product.id)}
                    data-trigger="search.item.open"
                    data-trigger-params={JSON.stringify({ id: product.id })}
                  >
                    <div className="h-[130px] bg-gray-200 flex items-center justify-center">
                      <span className="text-gray-400 text-xs">{product.title.slice(0, 12)}...</span>
                    </div>
                    <div className="p-2">
                      <h3 className="text-sm font-medium text-gray-800 line-clamp-2 leading-tight mb-1">
                        {product.title}
                      </h3>
                      <div className="flex items-end gap-1">
                        <span className="text-red-500 text-base font-bold">
                          ¥{product.price}
                        </span>
                        {product.originalPrice > product.price && (
                          <span className="text-gray-400 text-xs line-through mb-0.5">
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
                        {product.freeShipping && (
                          <span className="text-green-500 text-[10px] border border-green-300 rounded px-1">
                            包邮
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          /* Input mode */
          <div className="px-3 py-3">
            {/* Hot searches */}
            <div className="mb-5">
              <h3 className="text-sm font-medium text-gray-700 mb-2">{s.search_hot}</h3>
              <div className="flex flex-wrap gap-2">
                {HOT_SEARCHES.map((hot, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1.5 bg-gray-100 rounded-full text-xs text-gray-600 cursor-pointer"
                    onClick={() => handleSearchFromHistory(hot)}
                  >
                    {hot}
                  </span>
                ))}
              </div>
            </div>

            {/* Search history */}
            {history.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-gray-700">{s.search_history}</h3>
                  <button
                    className="text-xs text-gray-400"
                    onClick={clearSearchHistory}
                  >
                    {s.search_clear}
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {history.map((snap, idx) => (
                    <span
                      key={snap.id || idx}
                      className="px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-full text-xs text-gray-500 cursor-pointer"
                      onClick={() => handleSearchFromHistory(snap.query)}
                    >
                      {snap.query}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Filter drawer overlay */}
      {showFilter && (
        <div className="fixed inset-0 z-[100] flex items-end">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setShowFilter(false)}
          />
          <div className="relative bg-white w-full rounded-t-2xl max-h-[70vh] overflow-y-auto pb-6">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
              <h3 className="text-base font-medium">{s.search_filter}</h3>
              <IcClose
                size={20}
                className="text-gray-400 cursor-pointer"
                onClick={() => setShowFilter(false)}
              />
            </div>

            <div className="px-4 py-3 space-y-4">
              {/* Category */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">{s.search_filter_category}</h4>
                <div className="flex flex-wrap gap-2">
                  {categoryList.map(cat => (
                    <span
                      key={cat.id}
                      className={`px-3 py-1.5 rounded-full text-xs cursor-pointer ${
                        filterCategory === cat.id
                          ? 'bg-app-primary text-white'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                      onClick={() => setFilterCategory(filterCategory === cat.id ? '' : cat.id)}
                    >
                      {cat.name}
                    </span>
                  ))}
                </div>
              </div>

              {/* Brand */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">{s.search_filter_brand}</h4>
                <div className="flex flex-wrap gap-2">
                  {brandList.slice(0, 12).map(brand => (
                    <span
                      key={brand.id}
                      className={`px-3 py-1.5 rounded-full text-xs cursor-pointer ${
                        filterBrand === brand.id
                          ? 'bg-app-primary text-white'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                      onClick={() => setFilterBrand(filterBrand === brand.id ? '' : brand.id)}
                    >
                      {brand.name}
                    </span>
                  ))}
                </div>
              </div>

              {/* Price range */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">{s.search_filter_price}</h4>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    className="flex-1 border border-gray-200 rounded-lg px-3 py-1.5 text-sm outline-none w-0"
                    placeholder="最低价"
                    value={filterPriceMin}
                    onChange={e => setFilterPriceMin(e.target.value)}
                  />
                  <span className="text-gray-400">-</span>
                  <input
                    type="number"
                    className="flex-1 border border-gray-200 rounded-lg px-3 py-1.5 text-sm outline-none w-0"
                    placeholder="最高价"
                    value={filterPriceMax}
                    onChange={e => setFilterPriceMax(e.target.value)}
                  />
                </div>
              </div>

              {/* Free shipping */}
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium text-gray-700">{s.search_filter_free_shipping}</h4>
                <div
                  className={`w-[44px] h-[24px] rounded-full cursor-pointer relative transition-colors ${
                    filterFreeShipping ? 'bg-app-primary' : 'bg-gray-300'
                  }`}
                  onClick={() => setFilterFreeShipping(!filterFreeShipping)}
                >
                  <div
                    className={`w-[20px] h-[20px] bg-white rounded-full shadow-sm absolute top-[2px] transition-transform ${
                      filterFreeShipping ? 'translate-x-[22px]' : 'translate-x-[2px]'
                    }`}
                  />
                </div>
              </div>

              {/* Min rating */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">{s.search_filter_rating}</h4>
                <div className="flex gap-2">
                  {[4, 4.5].map(val => (
                    <span
                      key={val}
                      className={`px-3 py-1.5 rounded-full text-xs cursor-pointer flex items-center gap-1 ${
                        filterMinRating === String(val)
                          ? 'bg-app-primary text-white'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                      onClick={() => setFilterMinRating(filterMinRating === String(val) ? '' : String(val))}
                    >
                      <IcStar size={12} />
                      {val}分以上
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Filter actions */}
            <div className="flex gap-3 px-4 pt-2">
              <button
                className="flex-1 py-2.5 rounded-full text-sm border border-gray-200 text-gray-600"
                onClick={resetFilter}
              >
                {s.search_filter_reset}
              </button>
              <button
                className="flex-1 py-2.5 rounded-full text-sm bg-app-primary text-white font-medium"
                onClick={applyFilter}
              >
                {s.search_filter_apply}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchPage;
