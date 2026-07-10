import React from 'react';
import { IcWallet, IcLocation, IcChat, IcGift, IcChevronRight, IcOrder } from '../res/icons';
import { useMeituanLiteStore } from '../state';
import { useAppStrings } from '@/os/useAppStrings';
import { strings } from '../res/strings';
import { stringsEn } from '../res/strings.en';
import { useMeituanLiteGestures } from '../hooks/useMeituanLiteGestures';
import { formatPrice } from '../components/Price';
import TabBar from '../components/TabBar';

const MePage: React.FC = () => {
  const s = useAppStrings(strings, stringsEn);
  const { go } = useMeituanLiteGestures();
  const userProfile = useMeituanLiteStore((st) => st.userProfile);

  const entries = [
    { icon: IcOrder, color: '#FFB000', label: s.me_orders, action: () => go('tab.orders') },
    { icon: IcWallet, color: '#3B8BFF', label: s.me_wallet, action: () => {} },
    { icon: IcLocation, color: '#26C261', label: s.me_address, action: () => {} },
    { icon: IcGift, color: '#FF5339', label: s.me_balance, action: () => {} },
    { icon: IcChat, color: '#9C5BF5', label: s.me_service, action: () => {} },
  ];

  return (
    <div className="h-full flex flex-col bg-gray-50" data-status-bar-foreground="dark">
      {/* 顶部用户区（黄色） */}
      <div className="flex-shrink-0 bg-[#FFC300] pt-12 pb-5 px-4 flex items-center gap-3">
        <span className="w-14 h-14 rounded-full bg-white/40 flex items-center justify-center text-2xl">
          🧑
        </span>
        <div className="flex flex-col">
          <span className="text-[17px] font-bold text-[#1a1a1a]">{userProfile.name}</span>
          <span className="text-[12px] text-[#1a1a1a]/70">{s.me_simulated_user}</span>
          <span className="text-[11px] text-[#1a1a1a]/70 mt-0.5">{userProfile.phone}</span>
        </div>
      </div>

      {/* 余额卡 */}
      <div className="bg-white mx-3 -mt-3 rounded-xl px-4 py-3 flex items-center justify-between shadow-sm">
        <div className="flex flex-col">
          <span className="text-[11px] text-gray-400">{s.me_balance}</span>
          <span className="text-[18px] font-bold text-[#FF5339]">¥{formatPrice(userProfile.balance)}</span>
        </div>
        <span className="text-[12px] text-[#FFB000]">{s.pay_method_balance}</span>
      </div>

      {/* 列表 */}
      <div
        className="flex-1 overflow-y-auto mt-3"
        data-scroll-container="main"
        data-scroll-direction="vertical"
      >
        <div className="bg-white mx-0">
          {entries.map((e, idx) => {
            const Icon = e.icon;
            return (
              <button
                key={idx}
                type="button"
                onClick={e.action}
                className="w-full flex items-center gap-3 px-4 py-3 border-b border-gray-50 active:bg-gray-50"
              >
                <span
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-white"
                  style={{ background: e.color }}
                >
                  <Icon size={16} />
                </span>
                <span className="flex-1 text-left text-[14px] text-gray-800">{e.label}</span>
                <IcChevronRight size={14} className="text-gray-300" />
              </button>
            );
          })}
        </div>
      </div>

      <TabBar />
    </div>
  );
};

export default MePage;
