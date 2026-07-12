import React, { useState } from 'react';
import { useCainiaoStore } from '../state';
import { useCainiaoGestures } from '../hooks/useCainiaoGestures';
import { useAppStrings } from '../../../os/useAppStrings';
import { strings } from '../res/strings';
import { stringsEn } from '../res/strings.en';
import { SubPageHeader } from '../components/SubPageHeader';

export const ProfileEditPage: React.FC = () => {
  const { bindTap, back } = useCainiaoGestures();
  const s = useAppStrings(strings, stringsEn);
  const user = useCainiaoStore(st => st.user);
  const updateNickname = useCainiaoStore(st => st.updateNickname);
  const [nickname, setNickname] = useState(user.nickname);

  const handleSave = () => {
    updateNickname(nickname.trim() || user.nickname);
    back(1);
  };

  return (
    <div className="min-h-full bg-[#F5F6F8]">
      <SubPageHeader title={s.profile_title} />
      <div className="mt-2 bg-white px-4 py-2">
        <div className="flex items-center py-2 border-b border-[#F5F6F8]">
          <span className="w-20 text-[13px] text-[#8A8F99]">{s.profile_nickname}</span>
          <input
            value={nickname}
            onChange={e => setNickname(e.target.value)}
            className="flex-1 text-[14px] text-[#1A1A1A] outline-none bg-transparent"
            data-keep-keyboard="true"
          />
        </div>
        <div className="flex items-center py-2">
          <span className="w-20 text-[13px] text-[#8A8F99]">{s.profile_name}</span>
          <span className="flex-1 text-[14px] text-[#B0B4BC]">{user.name}</span>
        </div>
        <div className="flex items-center py-2">
          <span className="w-20 text-[13px] text-[#8A8F99]">{s.profile_phone}</span>
          <span className="flex-1 text-[14px] text-[#B0B4BC]">{user.phone}</span>
        </div>
      </div>

      <div className="px-4 mt-4">
        <button
          className="w-full h-[46px] rounded-[23px] bg-[#FF6A00] text-white text-[16px] font-medium active:bg-[#E55F00]"
          {...bindTap<HTMLButtonElement>({ kind: 'action', id: 'profile.record.save' }, { onTrigger: handleSave })}
        >
          {s.profile_save}
        </button>
      </div>
    </div>
  );
};
