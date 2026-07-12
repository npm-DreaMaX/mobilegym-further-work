import React from 'react';
import { useCainiaoGestures } from '../hooks/useCainiaoGestures';
import { useAppStrings } from '../../../os/useAppStrings';
import { strings } from '../res/strings';
import { stringsEn } from '../res/strings.en';
import { IcPlus, IcFileText, IcSend } from '../res/icons';

export const SendPage: React.FC = () => {
  const { bindTap } = useCainiaoGestures();
  const s = useAppStrings(strings, stringsEn);

  return (
    <div className="min-h-full bg-[#F5F6F8]">
      <div className="bg-[#FF6A00] pt-10 px-4 pb-6" data-status-bar-foreground="light">
        <span className="text-white text-[20px] font-semibold">{s.send_title}</span>
      </div>

      <div className="px-4 -mt-3">
        <button
          className="w-full bg-white rounded-xl p-4 flex items-center text-left active:bg-[#FFF8F3]"
          {...bindTap<HTMLButtonElement>('send.create.open')}
        >
          <div className="w-11 h-11 rounded-full bg-[#FFF4EC] flex items-center justify-center">
            <IcPlus size={22} className="text-[#FF6A00]" />
          </div>
          <div className="ml-3 flex-1">
            <div className="text-[16px] font-medium text-[#1A1A1A]">{s.send_create}</div>
            <div className="text-[12px] text-[#8A8F99] mt-0.5">{s.send_create_desc}</div>
          </div>
          <IcSend size={18} className="text-[#FF6A00]" />
        </button>

        <button
          className="mt-3 w-full bg-white rounded-xl p-4 flex items-center text-left active:bg-[#FFF8F3]"
          {...bindTap<HTMLButtonElement>('send.records.open')}
        >
          <div className="w-11 h-11 rounded-full bg-[#F0F4FF] flex items-center justify-center">
            <IcFileText size={22} className="text-[#1A73E8]" />
          </div>
          <div className="ml-3 flex-1">
            <div className="text-[16px] font-medium text-[#1A1A1A]">{s.send_records}</div>
            <div className="text-[12px] text-[#8A8F99] mt-0.5">{s.send_records_desc}</div>
          </div>
        </button>
      </div>
    </div>
  );
};
