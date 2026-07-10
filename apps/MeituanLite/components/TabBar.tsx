import React from 'react';
import { useLocation } from 'react-router-dom';
import { TABS } from '../data';
import { useAppStrings } from '@/os/useAppStrings';
import { strings } from '../res/strings';
import { stringsEn } from '../res/strings.en';
import { useMeituanLiteGestures } from '../hooks/useMeituanLiteGestures';

/** 底部 TabBar：首页 / 订单 / 我的 */
const TabBar: React.FC = () => {
  const s = useAppStrings(strings, stringsEn);
  const location = useLocation();
  const { bindTap } = useMeituanLiteGestures();
  const current = location.pathname;

  const bindingFor = (tabId: string) => {
    if (tabId === 'home') return bindTap<HTMLButtonElement>('tab.home');
    if (tabId === 'orders') return bindTap<HTMLButtonElement>('tab.orders');
    return bindTap<HTMLButtonElement>('tab.me');
  };

  return (
    <div
      data-hide-on-keyboard
      className="flex-shrink-0 bg-white border-t border-gray-100 flex justify-around items-center h-[50px] pb-safe"
    >
      {TABS.map((tab) => {
        const Icon = tab.icon;
        const active = current === tab.route;
        return (
          <button
            key={tab.id}
            type="button"
            className="flex flex-col items-center justify-center gap-0.5 flex-1 py-1"
            {...bindingFor(tab.id)}
          >
            <Icon
              size={22}
              strokeWidth={active ? 2.4 : 1.8}
              className={active ? 'text-[#FFC300]' : 'text-gray-400'}
            />
            <span
              className={`text-[11px] ${active ? 'text-[#FFB000] font-semibold' : 'text-gray-400'}`}
            >
              {s[tab.label]}
            </span>
          </button>
        );
      })}
    </div>
  );
};

export default TabBar;
