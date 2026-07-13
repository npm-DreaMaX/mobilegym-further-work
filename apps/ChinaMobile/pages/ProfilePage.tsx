import React from 'react';
import { useChinaMobileStore } from '../state';
import { useChinaMobileGestures } from '../hooks/useChinaMobileGestures';
import { useAppStrings } from '../../../os/useAppStrings';
import { strings } from '../res/strings';
import { stringsEn } from '../res/strings.en';
import { SubPageHeader } from '../components/SubPageHeader';
import { IcChevronRight } from '../res/icons';

export const ProfilePage: React.FC = () => {
  const s = useAppStrings(strings, stringsEn);
  const { bindTap } = useChinaMobileGestures();
  const user = useChinaMobileStore(st => st.user);
  const profile = useChinaMobileStore(st => st.profile);

  const rows: { label: string; value: string; transition?: string }[] = [
    { label: s.profile_name, value: profile.realName },
    { label: s.profile_phone, value: user.phone },
    { label: s.profile_email, value: profile.email, transition: 'profile.email.open' },
    { label: s.profile_idno, value: profile.idNo },
    { label: s.profile_address, value: profile.address },
  ];

  return (
    <div className="min-h-full bg-[#F2F4F7]">
      <SubPageHeader title={s.profile_title} />
      <div className="bg-[#0066B3] px-4 pb-5 pt-2" data-status-bar-foreground="light">
        <div className="flex items-center">
          <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center text-white text-[20px] font-semibold">
            {profile.realName.slice(0, 1)}
          </div>
          <div className="ml-3">
            <div className="text-[18px] font-semibold text-white">{profile.realName}</div>
            <div className="text-[13px] text-white/80">{user.phone}</div>
          </div>
        </div>
      </div>

      <div className="mx-3 mt-3 bg-white rounded-2xl divide-y divide-[#F5F6F8]">
        {rows.map((r, i) => (
          <div key={i} className="px-4 py-3 flex items-center justify-between">
            <span className="text-[14px] text-[#8A8F99]">{r.label}</span>
            <div className="flex items-center">
              <span className="text-[14px] text-[#1A1A1A]">{r.value || '—'}</span>
              {r.transition && (
                <button {...bindTap<HTMLButtonElement>(r.transition as any)} className="ml-2">
                  <IcChevronRight size={16} className="text-[#C9CDD4]" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
