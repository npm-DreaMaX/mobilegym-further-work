import React from 'react';
import { useChinaMobileStore } from '../state';
import { useChinaMobileGestures } from '../hooks/useChinaMobileGestures';
import { useAppStrings } from '../../../os/useAppStrings';
import { strings } from '../res/strings';
import { stringsEn } from '../res/strings.en';
import { SubPageHeader } from '../components/SubPageHeader';
import { IcGlobe } from '../res/icons';

export const RoamingPage: React.FC = () => {
  const s = useAppStrings(strings, stringsEn);
  const { bindTap } = useChinaMobileGestures();
  const enabled = useChinaMobileStore(st => st.roaming.enabled);
  const setRoaming = useChinaMobileStore(st => st.setRoaming);

  return (
    <div className="min-h-full bg-[#F2F4F7]">
      <SubPageHeader title={s.roaming_title} />
      <div className="bg-[#0066B3] px-4 pb-5 pt-2" data-status-bar-foreground="light">
        <div className="flex items-center gap-2">
          <IcGlobe size={22} className="text-white" />
          <span className="text-[18px] font-semibold text-white">{s.roaming_title}</span>
        </div>
        <div className="mt-1 text-[13px] text-white/80">{s.roaming_desc}</div>
      </div>

      <div className="mx-3 mt-3 bg-white rounded-2xl">
        <div
          className="px-4 py-4 flex items-center justify-between"
          {...bindTap<HTMLDivElement>(
            { kind: 'action', id: 'roaming.enabled.toggle' },
            { onTrigger: () => setRoaming(!enabled) },
          )}
        >
          <div>
            <div className="text-[15px] text-[#1A1A1A]">{s.roaming_title}</div>
            <div className="text-[12px] text-[#8A8F99] mt-0.5">{enabled ? s.roaming_on : s.roaming_off}</div>
          </div>
          <span className={`w-11 h-6 rounded-full flex items-center px-0.5 transition-colors ${enabled ? 'bg-[#0066B3]' : 'bg-[#D8DCE2]'}`}>
            <span className={`w-5 h-5 rounded-full bg-white shadow transition-transform ${enabled ? 'translate-x-5' : ''}`} />
          </span>
        </div>
      </div>
    </div>
  );
};
