import React, { useEffect } from 'react';
import { useChinaMobileStore } from '../state';
import { useAppStrings } from '../../../os/useAppStrings';
import { strings } from '../res/strings';
import { stringsEn } from '../res/strings.en';
import { SubPageHeader } from '../components/SubPageHeader';
import { computeRemainingDataGb } from '../data';
import { formatYuan } from '../utils/format';

export const DataUsagePage: React.FC = () => {
  const s = useAppStrings(strings, stringsEn);
  const usage = useChinaMobileStore(st => st.usage);
  const purchasedPacks = useChinaMobileStore(st => st.purchasedPacks);
  const markPageVisited = useChinaMobileStore(st => st.markPageVisited);
  useEffect(() => { markPageVisited('data'); }, [markPageVisited]);

  const remaining = computeRemainingDataGb({ usage, purchasedPacks });
  const pct = usage.dataTotalGb > 0
    ? Math.min(100, Math.round((usage.dataUsedGb / usage.dataTotalGb) * 100))
    : 0;
  const ring = 2 * Math.PI * 52;
  const dash = (pct / 100) * ring;

  return (
    <div className="min-h-full bg-[#F2F4F7]">
      <SubPageHeader title={s.data_title} />
      <div className="bg-[#0066B3] px-4 pb-6 pt-2" data-status-bar-foreground="light">
        <div className="flex flex-col items-center">
          <div className="relative w-[120px] h-[120px]">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
              <circle cx="60" cy="60" r="52" stroke="rgba(255,255,255,0.25)" strokeWidth="10" fill="none" />
              <circle cx="60" cy="60" r="52" stroke="#ffffff" strokeWidth="10" fill="none"
                strokeLinecap="round" strokeDasharray={`${dash} ${ring - dash}`} />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-[26px] font-semibold text-white leading-none">{remaining}</span>
              <span className="text-[12px] text-white/80 mt-1">{s.home_gb}</span>
            </div>
          </div>
          <div className="mt-3 text-white text-[14px]">{s.data_remaining_highspeed}</div>
        </div>
      </div>

      <div className="mx-3 mt-3 bg-white rounded-2xl divide-y divide-[#F5F6F8]">
        <div className="px-4 py-3 flex items-center justify-between">
          <span className="text-[14px] text-[#8A8F99]">{s.data_total}</span>
          <span className="text-[14px] text-[#1A1A1A]">{usage.dataTotalGb} {s.home_gb}</span>
        </div>
        <div className="px-4 py-3 flex items-center justify-between">
          <span className="text-[14px] text-[#8A8F99]">{s.data_used}</span>
          <span className="text-[14px] text-[#1A1A1A]">{usage.dataUsedGb} {s.home_gb}</span>
        </div>
      </div>

      <div className="mx-3 mt-3 bg-white rounded-2xl">
        <div className="px-4 py-3 text-[14px] font-medium text-[#1A1A1A] border-b border-[#F5F6F8]">
          {s.data_purchased}
        </div>
        {purchasedPacks.length === 0 ? (
          <div className="px-4 py-6 text-center text-[13px] text-[#8A8F99]">{s.orders_empty}</div>
        ) : (
          purchasedPacks.map(p => (
            <div key={p.id} className="px-4 py-3 flex items-center justify-between border-b border-[#F5F6F8] last:border-b-0">
              <div>
                <div className="text-[14px] text-[#1A1A1A]">{p.name}</div>
                <div className="text-[11px] text-[#B0B4BC]">{s.data_used} {p.dataGb} {s.home_gb}</div>
              </div>
              <span className="text-[13px] text-[#8A8F99]">{formatYuan(p.price)}{s.home_yuan}</span>
            </div>
          ))
        )}
      </div>
      <div className="h-4" />
    </div>
  );
};
