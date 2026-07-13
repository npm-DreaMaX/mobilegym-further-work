import React, { useEffect } from 'react';
import { useChinaMobileStore } from '../state';
import { useAppStrings } from '../../../os/useAppStrings';
import { strings } from '../res/strings';
import { stringsEn } from '../res/strings.en';
import { SubPageHeader } from '../components/SubPageHeader';
import { computeRemainingVoiceMin } from '../data';

export const VoiceUsagePage: React.FC = () => {
  const s = useAppStrings(strings, stringsEn);
  const usage = useChinaMobileStore(st => st.usage);
  const markPageVisited = useChinaMobileStore(st => st.markPageVisited);
  useEffect(() => { markPageVisited('voice'); }, [markPageVisited]);

  const remaining = computeRemainingVoiceMin(usage);
  const pct = usage.voiceTotalMin > 0
    ? Math.min(100, Math.round((usage.voiceUsedMin / usage.voiceTotalMin) * 100))
    : 0;

  return (
    <div className="min-h-full bg-[#F2F4F7]">
      <SubPageHeader title={s.voice_title} />
      <div className="bg-[#0066B3] px-4 pb-6 pt-2" data-status-bar-foreground="light">
        <div className="flex flex-col items-center">
          <div className="text-[40px] font-semibold text-white leading-none">{remaining}</div>
          <div className="mt-2 text-white/80 text-[13px]">{s.voice_remaining}</div>
        </div>
        <div className="mt-4 h-2 rounded-full bg-white/25 overflow-hidden">
          <div className="h-full bg-white rounded-full" style={{ width: `${pct}%` }} />
        </div>
      </div>

      <div className="mx-3 mt-3 bg-white rounded-2xl divide-y divide-[#F5F6F8]">
        <div className="px-4 py-3 flex items-center justify-between">
          <span className="text-[14px] text-[#8A8F99]">{s.voice_total}</span>
          <span className="text-[14px] text-[#1A1A1A]">{usage.voiceTotalMin} {s.home_min}</span>
        </div>
        <div className="px-4 py-3 flex items-center justify-between">
          <span className="text-[14px] text-[#8A8F99]">{s.voice_used}</span>
          <span className="text-[14px] text-[#1A1A1A]">{usage.voiceUsedMin} {s.home_min}</span>
        </div>
      </div>
      <div className="h-4" />
    </div>
  );
};
