import React, { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { IcSearch, IcClose } from '../res/icons';
import { MEITUAN_LITE_CONFIG } from '../data';
import { useAppStrings } from '@/os/useAppStrings';
import { strings } from '../res/strings';
import { stringsEn } from '../res/strings.en';
import { useMeituanLiteGestures } from '../hooks/useMeituanLiteGestures';
import ShopCard from '../components/ShopCard';

const SearchPage: React.FC = () => {
  const s = useAppStrings(strings, stringsEn);
  const { bindBack } = useMeituanLiteGestures();
  const [searchParams] = useSearchParams();
  const initialQ = searchParams.get('q') ?? '';
  const [q, setQ] = useState(initialQ);

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return MEITUAN_LITE_CONFIG.shops;
    return MEITUAN_LITE_CONFIG.shops.filter((shop) => {
      if (shop.name.toLowerCase().includes(query)) return true;
      if (shop.tags.some((t) => t.toLowerCase().includes(query))) return true;
      if (shop.products.some((p) => p.name.toLowerCase().includes(query))) return true;
      return false;
    });
  }, [q]);

  return (
    <div className="h-full flex flex-col bg-gray-50" data-status-bar-foreground="dark">
      {/* 顶部搜索栏 */}
      <div className="flex-shrink-0 bg-white pt-10 px-3 pb-2 flex items-center gap-2 border-b border-gray-100">
        <button type="button" {...bindBack<HTMLButtonElement>()} className="p-1">
          <span className="text-[15px] text-gray-700">{s.back}</span>
        </button>
        <div className="flex-1 h-9 bg-gray-100 rounded-full flex items-center px-3 gap-2">
          <IcSearch size={16} className="text-gray-400" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={s.home_search_placeholder}
            className="flex-1 bg-transparent outline-none text-[14px] text-gray-800 placeholder:text-gray-400"
          />
          {q && (
            <button type="button" onClick={() => setQ('')} className="p-0.5">
              <IcClose size={14} className="text-gray-400" />
            </button>
          )}
        </div>
      </div>

      {/* 内容 */}
      <div
        className="flex-1 overflow-y-auto"
        data-scroll-container="main"
        data-scroll-direction="vertical"
      >
        {q.trim() === '' ? (
          <div className="px-3 pt-4">
            <div className="text-[12px] text-gray-400 mb-2">热门搜索</div>
            <div className="flex flex-wrap gap-2">
              {MEITUAN_LITE_CONFIG.hotKeywords.map((kw) => (
                <button
                  key={kw}
                  type="button"
                  onClick={() => setQ(kw)}
                  className="px-3 py-1.5 bg-white rounded-full text-[12px] text-gray-600 active:bg-gray-100"
                >
                  {kw}
                </button>
              ))}
            </div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-20 text-center text-sm text-gray-400">{s.empty}</div>
        ) : (
          <div className="bg-white mt-2">
            {filtered.map((shop) => (
              <ShopCard key={shop.id} shop={shop} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchPage;
