import React from 'react';
import { useChinaMobileStore } from '../state';
import { useChinaMobileGestures } from '../hooks/useChinaMobileGestures';
import { useAppStrings } from '../../../os/useAppStrings';
import { strings } from '../res/strings';
import { stringsEn } from '../res/strings.en';
import { formatYuan } from '../utils/format';
import { IcChevronRight } from '../res/icons';
import { IconRenderer } from '../components/IconRenderer';

interface Entry { transition: string; label: string; icon: string }
const ENTRIES: Entry[] = [
  { transition: 'me.recharge.open', label: '充值', icon: 'IcWallet' },
  { transition: 'me.bill.open', label: '账单查询', icon: 'IcBill' },
  { transition: 'me.orders.open', label: '交易记录', icon: 'IcFileText' },
  { transition: 'me.services.open', label: '已订业务', icon: 'IcServices' },
  { transition: 'me.family.open', label: '亲情号码', icon: 'IcFamily' },
  { transition: 'me.autopay.open', label: '自动缴费', icon: 'IcAutopay' },
  { transition: 'me.roaming.open', label: '国际漫游', icon: 'IcGlobe' },
  { transition: 'me.settings.open', label: '设置', icon: 'IcSettings' },
];

export const MePage: React.FC = () => {
  const s = useAppStrings(strings, stringsEn);
  const { bindTap } = useChinaMobileGestures();
  const user = useChinaMobileStore(st => st.user);
  const profile = useChinaMobileStore(st => st.profile);
  const balance = useChinaMobileStore(st => st.balance);

  return (
    <div className="min-h-full bg-[#F2F4F7]">
      <div className="bg-[#0066B3] pt-10 px-4 pb-6" data-status-bar-foreground="light">
        <button className="flex items-center" {...bindTap<HTMLButtonElement>('me.profile.open')}>
          <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center text-white text-[22px] font-semibold">
            {profile.realName.slice(0, 1)}
          </div>
          <div className="ml-3 text-left">
            <div className="text-[18px] font-semibold text-white">{profile.realName}</div>
            <div className="text-[13px] text-white/80">{user.phone} · {s.home_points}{user.points}</div>
          </div>
          <IcChevronRight size={18} className="text-white/80 ml-2" />
        </button>
        <div className="mt-4 bg-white/10 rounded-xl p-3 flex items-center justify-between">
          <div>
            <div className="text-[12px] text-white/80">{s.home_subtitle}</div>
            <div className="text-[18px] font-semibold text-white">{formatYuan(balance)}{s.home_yuan}</div>
          </div>
          <button {...bindTap<HTMLButtonElement>('me.recharge.open')} className="bg-white text-[#0066B3] text-[13px] px-4 py-2 rounded-full">
            {s.home_recharge_btn}
          </button>
        </div>
      </div>

      <div className="mt-3 bg-white rounded-2xl overflow-hidden">
        {ENTRIES.map((e, i) => (
          <button
            key={e.transition}
            className={`w-full px-4 py-3.5 flex items-center justify-between ${i < ENTRIES.length - 1 ? 'border-b border-[#F5F6F8]' : ''}`}
            {...bindTap<HTMLButtonElement>(e.transition as any)}
          >
            <div className="flex items-center">
              <span className="w-8 h-8 rounded-full bg-[#EAF3FB] flex items-center justify-center">
                <IconRenderer name={e.icon} size={18} className="text-[#0066B3]" />
              </span>
              <span className="ml-3 text-[15px] text-[#1A1A1A]">{e.label}</span>
            </div>
            <IcChevronRight size={16} className="text-[#C9CDD4]" />
          </button>
        ))}
      </div>
      <div className="h-4" />
    </div>
  );
};
