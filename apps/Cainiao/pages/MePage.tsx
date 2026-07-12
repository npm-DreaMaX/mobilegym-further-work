import React from 'react';
import { useCainiaoStore } from '../state';
import { useCainiaoGestures } from '../hooks/useCainiaoGestures';
import { useAppStrings } from '../../../os/useAppStrings';
import { strings } from '../res/strings';
import { stringsEn } from '../res/strings.en';
import {
  IcUser, IcEdit, IcMapPin, IcFileText, IcBell, IcSettings, IcChevronRight,
} from '../res/icons';

export const MePage: React.FC = () => {
  const { bindTap } = useCainiaoGestures();
  const s = useAppStrings(strings, stringsEn);
  const user = useCainiaoStore(st => st.user);
  const unread = useCainiaoStore(st => st.notifications.filter(n => !n.read).length);

  const items = [
    { id: 'me.profile.edit.open' as const, label: s.me_edit_profile, Icon: IcEdit },
    { id: 'me.address.open' as const, label: s.me_address_book, Icon: IcMapPin },
    { id: 'me.sendRecords.open' as const, label: s.me_send_records, Icon: IcFileText },
    { id: 'me.notifications.open' as const, label: s.me_notifications, Icon: IcBell, badge: unread },
    { id: 'me.settings.open' as const, label: s.me_settings, Icon: IcSettings },
  ];

  return (
    <div className="min-h-full bg-[#F5F6F8]">
      <div className="bg-[#FF6A00] pt-10 px-4 pb-8" data-status-bar-foreground="light">
        <div className="flex items-center">
          <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center">
            <IcUser size={32} className="text-white" />
          </div>
          <div className="ml-4">
            <div className="text-white text-[18px] font-semibold">{user.nickname}</div>
            <div className="text-white/85 text-[13px] mt-1">{user.name} · {user.phone}</div>
          </div>
        </div>
      </div>

      <div className="mt-2 bg-white">
        {items.map((it, i) => {
          const { Icon } = it;
          return (
            <button
              key={it.id}
              className={`w-full flex items-center px-4 py-4 active:bg-[#FFF8F3] ${i < items.length - 1 ? 'border-b border-[#F5F6F8]' : ''}`}
              {...bindTap<HTMLButtonElement>(it.id)}
            >
              <Icon size={20} className="text-[#8A8F99]" />
              <span className="ml-3 flex-1 text-left text-[15px] text-[#1A1A1A]">{it.label}</span>
              {it.badge ? (
                <span className="mr-2 min-w-[18px] h-[18px] px-1 rounded-full bg-[#FF3B30] text-white text-[10px] leading-[18px] text-center">
                  {it.badge}
                </span>
              ) : null}
              <IcChevronRight size={18} className="text-[#C9CDD4]" />
            </button>
          );
        })}
      </div>
    </div>
  );
};
