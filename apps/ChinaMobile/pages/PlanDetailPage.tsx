import React, { useEffect } from 'react';
import { useChinaMobileStore } from '../state';
import { useChinaMobileGestures } from '../hooks/useChinaMobileGestures';
import { useAppStrings } from '../../../os/useAppStrings';
import { strings } from '../res/strings';
import { stringsEn } from '../res/strings.en';
import { SubPageHeader } from '../components/SubPageHeader';
import { CHINAMOBILE_PLAN_BY_ID } from '../data';
import { formatYuan } from '../utils/format';

export const PlanDetailPage: React.FC = () => {
  const s = useAppStrings(strings, stringsEn);
  const { bindTap } = useChinaMobileGestures();
  const activePlanId = useChinaMobileStore(st => st.activePlanId);
  const markPageVisited = useChinaMobileStore(st => st.markPageVisited);
  useEffect(() => { markPageVisited('plan'); }, [markPageVisited]);

  const plan = CHINAMOBILE_PLAN_BY_ID[activePlanId] ?? null;

  return (
    <div className="min-h-full bg-[#F2F4F7]">
      <SubPageHeader title={s.plan_title} right={
        <button {...bindTap<HTMLButtonElement>('plan.change.open')} className="text-white text-[14px]">
          {s.plan_change}
        </button>
      } />
      {plan ? (
        <>
          <div className="bg-[#0066B3] px-4 pb-5 pt-2" data-status-bar-foreground="light">
            <div className="text-[13px] text-white/80">{s.plan_current}</div>
            <div className="mt-1 text-[22px] font-semibold text-white">{plan.name}</div>
            <div className="mt-2 text-white/80 text-[13px]">{plan.desc}</div>
          </div>
          <div className="mx-3 mt-3 bg-white rounded-2xl divide-y divide-[#F5F6F8]">
            <div className="px-4 py-3 flex items-center justify-between">
              <span className="text-[14px] text-[#8A8F99]">{s.plan_price}</span>
              <span className="text-[14px] text-[#1A1A1A]">{formatYuan(plan.price)}{s.home_yuan}/月</span>
            </div>
            <div className="px-4 py-3 flex items-center justify-between">
              <span className="text-[14px] text-[#8A8F99]">{s.plan_data}</span>
              <span className="text-[14px] text-[#1A1A1A]">{plan.dataGb} {s.home_gb}</span>
            </div>
            <div className="px-4 py-3 flex items-center justify-between">
              <span className="text-[14px] text-[#8A8F99]">{s.plan_voice}</span>
              <span className="text-[14px] text-[#1A1A1A]">{plan.voiceMin} {s.home_min}</span>
            </div>
          </div>
          <button
            className="mx-3 mt-3 bg-[#0066B3] text-white py-3 rounded-xl text-[15px] font-medium active:bg-[#00528F]"
            style={{ width: 'calc(100% - 24px)' }}
            {...bindTap<HTMLButtonElement>('plan.change.open')}
          >
            {s.plan_change}
          </button>
        </>
      ) : (
        <div className="px-4 py-20 text-center text-[14px] text-[#8A8F99]">{s.common_not_available}</div>
      )}
      <div className="h-4" />
    </div>
  );
};
