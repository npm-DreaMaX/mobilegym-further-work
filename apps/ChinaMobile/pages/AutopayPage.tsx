import React, { useState } from 'react';
import { useChinaMobileStore } from '../state';
import { useChinaMobileGestures } from '../hooks/useChinaMobileGestures';
import { useAppStrings } from '../../../os/useAppStrings';
import { strings } from '../res/strings';
import { stringsEn } from '../res/strings.en';
import { SubPageHeader } from '../components/SubPageHeader';
import { IcCheck } from '../res/icons';

export const AutopayPage: React.FC = () => {
  const s = useAppStrings(strings, stringsEn);
  const { bindTap } = useChinaMobileGestures();
  const autopay = useChinaMobileStore(st => st.autopay);
  const draft = useChinaMobileStore(st => st._temp.autopayDraft);
  const paymentMethods = useChinaMobileStore(st => st.paymentMethods);
  const setAutopayDraft = useChinaMobileStore(st => st.setAutopayDraft);
  const setAutopay = useChinaMobileStore(st => st.setAutopay);

  // Initialize draft from committed state on first render
  const draftEnabled = draft.enabled;
  const draftMethodId = draft.paymentMethodId ?? autopay.paymentMethodId;

  const [toast, setToast] = useState<string | null>(null);

  const handleSave = () => {
    if (!draftEnabled) {
      setToast(s.autopay_enable);
      setTimeout(() => setToast(null), 2000);
      return;
    }
    if (!draftMethodId) {
      setToast(s.autopay_method);
      setTimeout(() => setToast(null), 2000);
      return;
    }
    setAutopay(draftEnabled, draftMethodId);
    setToast(s.autopay_saved);
    setTimeout(() => setToast(null), 2000);
  };

  return (
    <div className="min-h-full bg-[#F2F4F7]">
      <SubPageHeader title={s.autopay_title} />
      <div className="bg-[#0066B3] px-4 pb-5 pt-2" data-status-bar-foreground="light">
        <div className="text-[15px] text-white">{s.autopay_title}</div>
        <div className="mt-1 text-[13px] text-white/80">
          {autopay.enabled ? s.autopay_on : s.autopay_off}
        </div>
      </div>

      <div className="mx-3 mt-3 bg-white rounded-2xl">
        <div
          className="px-4 py-4 flex items-center justify-between"
          {...bindTap<HTMLDivElement>(
            { kind: 'action', id: 'autopay.enable.toggle' },
            { onTrigger: () => setAutopayDraft({ enabled: !draftEnabled }) },
          )}
        >
          <div>
            <div className="text-[15px] text-[#1A1A1A]">{s.autopay_enable}</div>
            <div className="text-[12px] text-[#8A8F99] mt-0.5">{draftEnabled ? s.settings_on : s.settings_off}</div>
          </div>
          <span className={`w-11 h-6 rounded-full flex items-center px-0.5 transition-colors ${draftEnabled ? 'bg-[#0066B3]' : 'bg-[#D8DCE2]'}`}>
            <span className={`w-5 h-5 rounded-full bg-white shadow transition-transform ${draftEnabled ? 'translate-x-5' : ''}`} />
          </span>
        </div>
      </div>

      <div className="mx-3 mt-3 bg-white rounded-2xl">
        <div className="px-4 py-3 text-[14px] font-medium text-[#1A1A1A] border-b border-[#F5F6F8]">
          {s.autopay_method}
        </div>
        {paymentMethods.map(m => {
          const selected = draftMethodId === m.id;
          return (
            <button
              key={m.id}
              className="w-full px-4 py-3 flex items-center justify-between border-b border-[#F5F6F8] last:border-b-0"
              {...bindTap<HTMLButtonElement>(
                { kind: 'action', id: 'autopay.method.select' },
                { params: { methodId: m.id }, onTrigger: () => setAutopayDraft({ paymentMethodId: m.id }) },
              )}
            >
              <span className="text-[14px] text-[#1A1A1A]">
                {m.label}{m.tail ? `（尾号${m.tail}）` : ''}
              </span>
              {selected && <IcCheck size={18} className="text-[#0066B3]" />}
            </button>
          );
        })}
      </div>

      <div className="px-3 mt-4">
        <button
          className="w-full bg-[#0066B3] text-white py-3 rounded-xl text-[15px] font-medium active:bg-[#00528F]"
          {...bindTap<HTMLButtonElement>(
            { kind: 'action', id: 'autopay.save.submit' },
            { onTrigger: handleSave },
          )}
        >
          {s.autopay_save}
        </button>
        {toast && <div className="mt-2 text-center text-[13px] text-[#0066B3]">{toast}</div>}
      </div>
      <div className="h-4" />
    </div>
  );
};
