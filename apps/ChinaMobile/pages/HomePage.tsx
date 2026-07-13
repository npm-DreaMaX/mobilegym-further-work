import React from 'react';
import { useChinaMobileStore } from '../state';
import { useChinaMobileGestures } from '../hooks/useChinaMobileGestures';
import { useAppStrings } from '../../../os/useAppStrings';
import { strings } from '../res/strings';
import { stringsEn } from '../res/strings.en';
import { IcSearch, IcChevronRight, IcDataUsage, IcVoice, IcPlan, IcPoints } from '../res/icons';
import { IconRenderer } from '../components/IconRenderer';
import { CHINAMOBILE_QUICK_ENTRIES, CHINAMOBILE_PLAN_BY_ID, computeRemainingDataGb, computeRemainingVoiceMin } from '../data';
import { formatYuan } from '../utils/format';

const QUICK_TRANSITION: Record<string, string> = {
  recharge: 'home.recharge.open',
  datapack: 'home.datapack.open',
  bill: 'home.bill.open',
  plan: 'home.plan.open',
  balance: 'home.balance.open',
  services: 'home.services.open',
  family: 'home.family.open',
  more: 'home.search.open',
};

export const HomePage: React.FC = () => {
  const { bindTap, go } = useChinaMobileGestures();
  const s = useAppStrings(strings, stringsEn);
  const user = useChinaMobileStore(st => st.user);
  const balance = useChinaMobileStore(st => st.balance);
  const usage = useChinaMobileStore(st => st.usage);
  const purchasedPacks = useChinaMobileStore(st => st.purchasedPacks);
  const activePlanId = useChinaMobileStore(st => st.activePlanId);

  const remainingData = computeRemainingDataGb({ usage, purchasedPacks });
  const remainingVoice = computeRemainingVoiceMin(usage);
  const activePlan = CHINAMOBILE_PLAN_BY_ID[activePlanId] ?? null;
  const dataPct = usage.dataTotalGb > 0
    ? Math.min(100, Math.round((usage.dataUsedGb / usage.dataTotalGb) * 100))
    : 0;

  return (
    <div className="min-h-full bg-[#F2F4F7]">
      {/* 品牌头部 */}
      <div className="bg-[#0066B3] pt-10 px-4 pb-4" data-status-bar-foreground="light">
        <div className="flex items-center justify-between">
          <span className="text-white text-[20px] font-semibold">{s.home_title}</span>
          <button {...bindTap<HTMLButtonElement>('home.search.open')} aria-label={s.search_title}>
            <IcSearch size={22} className="text-white" />
          </button>
        </div>
        <div className="mt-1 text-white/80 text-[13px]">{user.phone}</div>
      </div>

      {/* 用量 dashboard */}
      <div className="bg-[#0066B3] px-4 pb-5" data-status-bar-foreground="light">
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <div className="flex items-end justify-between">
            <div>
              <div className="text-[13px] text-[#8A8F99]">{s.home_subtitle}</div>
              <div className="mt-1 text-[28px] font-semibold text-[#1A1A1A] leading-none">
                {formatYuan(balance)}<span className="text-[14px] text-[#8A8F99] ml-1">{s.home_yuan}</span>
              </div>
            </div>
            <button
              className="bg-[#0066B3] text-white text-[13px] px-4 py-2 rounded-full active:bg-[#00528F]"
              {...bindTap<HTMLButtonElement>('home.recharge.open')}
            >
              {s.home_recharge_btn}
            </button>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-2 text-center">
            <button className="flex flex-col items-center" {...bindTap<HTMLButtonElement>('home.data.open')}>
              <IcDataUsage size={20} className="text-[#0066B3]" />
              <span className="mt-1 text-[15px] font-semibold text-[#1A1A1A]">{remainingData}</span>
              <span className="text-[11px] text-[#8A8F99]">{s.home_gb}</span>
            </button>
            <button className="flex flex-col items-center" {...bindTap<HTMLButtonElement>('home.voice.open')}>
              <IcVoice size={20} className="text-[#0066B3]" />
              <span className="mt-1 text-[15px] font-semibold text-[#1A1A1A]">{remainingVoice}</span>
              <span className="text-[11px] text-[#8A8F99]">{s.home_min}</span>
            </button>
            <button className="flex flex-col items-center" {...bindTap<HTMLButtonElement>('home.plan.open')}>
              <IcPlan size={20} className="text-[#0066B3]" />
              <span className="mt-1 text-[12px] font-medium text-[#1A1A1A] leading-tight">
                {activePlan ? activePlan.name.replace('5G智享套餐-', '').replace('飞享套餐-', '') : '-'}
              </span>
              <span className="text-[11px] text-[#8A8F99]">{s.home_plan}</span>
            </button>
          </div>
          {/* 流量进度条 */}
          <div className="mt-4">
            <div className="flex justify-between text-[11px] text-[#8A8F99]">
              <span>{s.home_data}</span>
              <span>{usage.dataUsedGb}/{usage.dataTotalGb}{s.home_gb}</span>
            </div>
            <div className="mt-1 h-1.5 rounded-full bg-[#EEF0F2] overflow-hidden">
              <div className="h-full bg-[#0066B3] rounded-full" style={{ width: `${dataPct}%` }} />
            </div>
          </div>
        </div>
      </div>

      {/* 快捷入口 */}
      <div className="bg-white mx-3 mt-3 rounded-2xl p-4">
        <div className="grid grid-cols-4 gap-y-4">
          {CHINAMOBILE_QUICK_ENTRIES.map(q => (
            <button
              key={q.id}
              className="flex flex-col items-center"
              {...bindTap<HTMLButtonElement>(QUICK_TRANSITION[q.id] as any)}
            >
              <span className="w-10 h-10 rounded-full bg-[#EAF3FB] flex items-center justify-center">
                <IconRenderer name={q.icon} size={20} className="text-[#0066B3]" />
              </span>
              <span className="mt-1 text-[12px] text-[#1A1A1A]">{q.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 积分 / 账户概览 */}
      <button
        className="w-full bg-white mx-3 mt-3 rounded-2xl p-4 flex items-center"
        style={{ width: 'calc(100% - 24px)' }}
        {...bindTap<HTMLButtonElement>('home.orders.open')}
      >
        <span className="w-10 h-10 rounded-full bg-[#FFF4EC] flex items-center justify-center">
          <IcPoints size={20} className="text-[#FF6A00]" />
        </span>
        <div className="ml-3 flex-1 text-left">
          <div className="text-[13px] text-[#8A8F99]">{s.home_points}</div>
          <div className="text-[16px] font-medium text-[#1A1A1A]">{user.points}</div>
        </div>
        <IcChevronRight size={18} className="text-[#C9CDD4]" />
      </button>
      <div className="h-4" />
    </div>
  );
};
