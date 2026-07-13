import React, { useEffect, useState } from 'react';
import { useChinaMobileStore } from '../state';
import { useChinaMobileGestures } from '../hooks/useChinaMobileGestures';
import { useAppStrings } from '../../../os/useAppStrings';
import { strings } from '../res/strings';
import { stringsEn } from '../res/strings.en';
import { SubPageHeader } from '../components/SubPageHeader';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const EmailEditPage: React.FC = () => {
  const s = useAppStrings(strings, stringsEn);
  const { bindTap } = useChinaMobileGestures();
  const profile = useChinaMobileStore(st => st.profile);
  const setEmailDraft = useChinaMobileStore(st => st.setEmailDraft);
  const emailDraft = useChinaMobileStore(st => st._temp.emailDraft);
  const updateEmail = useChinaMobileStore(st => st.updateEmail);
  const [input, setInput] = useState(emailDraft || profile.email);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => { setEmailDraft(input); }, [input, setEmailDraft]);

  const handleSave = () => {
    if (!EMAIL_RE.test(input)) {
      setToast(s.email_invalid);
      setTimeout(() => setToast(null), 2000);
      return;
    }
    updateEmail(input);
    setToast(s.email_saved);
    setTimeout(() => setToast(null), 2000);
  };

  return (
    <div className="min-h-full bg-[#F2F4F7]">
      <SubPageHeader title={s.email_title} right={
        <button
          {...bindTap<HTMLButtonElement>(
            { kind: 'action', id: 'email.save.submit' },
            { onTrigger: handleSave },
          )}
          className="text-white text-[14px]"
        >
          {s.email_save}
        </button>
      } />
      <div className="px-3 mt-4">
        <div className="text-[14px] font-medium text-[#1A1A1A] mb-2">{s.email_label}</div>
        <input
          className="w-full h-12 rounded-xl border border-[#EEF0F2] bg-white px-3 text-[15px] outline-none focus:border-[#0066B3]"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder={s.email_label}
          data-keep-keyboard="true"
        />
        {toast && <div className="mt-2 text-[13px] text-[#0066B3]">{toast}</div>}
        <div className="mt-2 text-[12px] text-[#8A8F99]">
          {s.profile_email}：{profile.email}
        </div>
      </div>
    </div>
  );
};
