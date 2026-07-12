import React, { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useCainiaoStore } from '../state';
import { useCainiaoGestures } from '../hooks/useCainiaoGestures';
import { useAppStrings } from '../../../os/useAppStrings';
import { strings } from '../res/strings';
import { stringsEn } from '../res/strings.en';
import { IcSearch, IcBell, IcTruck, IcStation, IcPackageCheck, IcChevronRight, IcBox } from '../res/icons';
import { formatEventTime } from '../utils/format';
import { filterStatuses, statusToFilter } from '../types';
import type { FilterKey, Package } from '../types';

const FILTERS: { key: FilterKey | null; transition: 'home.filter.all' | 'home.filter.in_transit' | 'home.filter.arrived' | 'home.filter.picked'; labelKey: 'filter_all' | 'filter_in_transit' | 'filter_arrived' | 'filter_picked' }[] = [
  { key: null, transition: 'home.filter.all', labelKey: 'filter_all' },
  { key: 'in_transit', transition: 'home.filter.in_transit', labelKey: 'filter_in_transit' },
  { key: 'arrived_station', transition: 'home.filter.arrived', labelKey: 'filter_arrived' },
  { key: 'picked_up', transition: 'home.filter.picked', labelKey: 'filter_picked' },
];

function statusIcon(p: Package) {
  if (p.status === 'arrived_station') return <IcStation size={20} className="text-[#FF6A00]" />;
  if (p.status === 'picked_up' || p.status === 'delivered') return <IcPackageCheck size={20} className="text-[#8A8F99]" />;
  return <IcTruck size={20} className="text-[#FF6A00]" />;
}

export const HomePage: React.FC = () => {
  const { bindTap, go } = useCainiaoGestures();
  const s = useAppStrings(strings, stringsEn);
  const [searchParams] = useSearchParams();
  const packages = useCainiaoStore(st => st.packages);
  const unread = useCainiaoStore(st => st.notifications.filter(n => !n.read).length);
  const filterInStore = useCainiaoStore(st => st.filter.currentStatus);
  const setFilter = useCainiaoStore(st => st.setFilter);

  // URL-driven filter (canonical source) → sync into store for judge visibility
  const urlFilter = (searchParams.get('filter') as FilterKey | null) ?? null;
  useEffect(() => {
    if (urlFilter !== filterInStore) setFilter(urlFilter);
  }, [urlFilter, filterInStore, setFilter]);

  const activeFilter: FilterKey | null = urlFilter;
  const statuses = activeFilter ? filterStatuses(activeFilter) : null;
  const visiblePackages = statuses
    ? packages.filter(p => statuses.includes(p.status))
    : packages;

  return (
    <div className="min-h-full bg-[#F5F6F8]">
      {/* 顶部品牌区 */}
      <div className="bg-[#FF6A00] pt-10 px-4 pb-5" data-status-bar-foreground="light">
        <div className="flex items-center justify-between">
          <span className="text-white text-[20px] font-semibold">{s.home_title}</span>
          <button
            className="relative"
            {...bindTap<HTMLButtonElement>('home.notifications.open')}
            aria-label={s.me_notifications}
          >
            <IcBell size={24} className="text-white" />
            {unread > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[16px] h-[16px] px-1 rounded-full bg-[#FF3B30] text-white text-[10px] leading-[16px] text-center">
                {unread}
              </span>
            )}
          </button>
        </div>
        {/* 搜索入口 */}
        <button
          className="mt-3 w-full h-10 rounded-full bg-white flex items-center px-4"
          {...bindTap<HTMLButtonElement>('home.search.open')}
        >
          <IcSearch size={18} className="text-[#8A8F99]" />
          <span className="ml-2 text-[14px] text-[#8A8F99]">{s.home_search_placeholder}</span>
        </button>
      </div>

      {/* 筛选 Tab */}
      <div className="bg-white px-4 py-2 flex items-center gap-5 border-b border-[#EEF0F2]">
        {FILTERS.map(f => {
          const active = activeFilter === f.key;
          return (
            <button
              key={f.transition}
              className={`relative pb-1 text-[14px] ${active ? 'text-[#1A1A1A] font-semibold' : 'text-[#8A8F99]'}`}
              {...bindTap<HTMLButtonElement>(f.transition)}
            >
              {s[f.labelKey]}
              {active && <span className="absolute left-1/2 -translate-x-1/2 bottom-0 w-5 h-[2px] bg-[#FF6A00] rounded-full" />}
            </button>
          );
        })}
      </div>

      {/* 包裹列表 */}
      {visiblePackages.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-[#8A8F99]">
          <IcBox size={48} className="text-[#C9CDD4]" />
          <span className="mt-2 text-[14px]">{s.home_empty}</span>
        </div>
      ) : (
        <div className="px-3 py-3 space-y-3">
          {visiblePackages.map(p => {
            const latest = p.events[0];
            const isArrived = p.status === 'arrived_station';
            return (
              <button
                key={p.id}
                className="w-full bg-white rounded-xl p-4 text-left active:bg-[#FFF8F3]"
                {...bindTap<HTMLButtonElement>('home.package.open', { params: { id: p.id } })}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {statusIcon(p)}
                    <span className="text-[15px] font-medium text-[#1A1A1A]">{p.statusLabel}</span>
                  </div>
                  <span className="text-[12px] text-[#8A8F99]">{p.carrierName}</span>
                </div>
                {isArrived && p.pickupCode ? (
                  <div className="mt-3 flex items-center justify-between bg-[#FFF4EC] rounded-lg px-3 py-2">
                    <span className="text-[13px] text-[#8A8F99]">{s.home_pickup_code}</span>
                    <span className="text-[18px] font-semibold text-[#FF6A00] tracking-wider">{p.pickupCode}</span>
                  </div>
                ) : null}
                <div className="mt-3 flex items-center text-[13px] text-[#8A8F99]">
                  <span className="flex-1 min-w-0 truncate">
                    {s.home_latest}：{latest?.description ?? ''}
                  </span>
                </div>
                <div className="mt-1 flex items-center justify-between">
                  <span className="text-[12px] text-[#B0B4BC]">
                    {latest ? formatEventTime(latest.time) : ''} · {latest?.location ?? ''}
                  </span>
                  {p.eta && (
                    <span className="text-[12px] text-[#FF6A00]">
                      {s.home_eta_prefix} {p.eta} {s.home_eta_suffix}
                    </span>
                  )}
                </div>
                <div className="mt-2 flex items-center text-[12px] text-[#B0B4BC]">
                  <span className="truncate">运单号 {p.trackingNo}</span>
                  <IcChevronRight size={16} className="text-[#C9CDD4] ml-auto" />
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
