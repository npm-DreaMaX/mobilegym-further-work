import React from 'react';
import { useChinaMobileStore } from '../state';
import { useChinaMobileGestures } from '../hooks/useChinaMobileGestures';
import { useAppStrings } from '../../../os/useAppStrings';
import { strings } from '../res/strings';
import { stringsEn } from '../res/strings.en';
import { SubPageHeader } from '../components/SubPageHeader';

export const SettingsPage: React.FC = () => {
  const s = useAppStrings(strings, stringsEn);
  const { bindTap } = useChinaMobileGestures();
  const settings = useChinaMobileStore(st => st.settings);
  const updateSettings = useChinaMobileStore(st => st.updateSettings);

  const toggles: { id: 'settings.dataalert.toggle' | 'settings.marketing.toggle' | 'settings.theme.toggle'; label: string; value: boolean; field: 'dataAlert' | 'marketingPush' | 'themeId' }[] = [
    { id: 'settings.dataalert.toggle', label: s.settings_data_alert, value: settings.dataAlert, field: 'dataAlert' },
    { id: 'settings.marketing.toggle', label: s.settings_marketing, value: settings.marketingPush, field: 'marketingPush' },
    { id: 'settings.theme.toggle', label: s.settings_theme, value: settings.themeId === 'dark', field: 'themeId' },
  ];

  const handleToggle = (field: typeof toggles[number]['field']) => {
    if (field === 'themeId') {
      updateSettings({ themeId: settings.themeId === 'dark' ? 'light' : 'dark' });
    } else {
      updateSettings({ [field]: !settings[field] } as any);
    }
  };

  return (
    <div className="min-h-full bg-[#F2F4F7]">
      <SubPageHeader title={s.settings_title} />
      <div className="mt-2 bg-white">
        {toggles.map((t, i) => (
          <div
            key={t.id}
            className={`flex items-center justify-between px-4 py-4 ${i < toggles.length - 1 ? 'border-b border-[#F5F6F8]' : ''}`}
            {...bindTap<HTMLDivElement>(
              { kind: 'action', id: t.id },
              { onTrigger: () => handleToggle(t.field) },
            )}
          >
            <span className="text-[15px] text-[#1A1A1A]">{t.label}</span>
            <span className={`w-11 h-6 rounded-full flex items-center px-0.5 transition-colors ${t.value ? 'bg-[#0066B3]' : 'bg-[#D8DCE2]'}`}>
              <span className={`w-5 h-5 rounded-full bg-white shadow transition-transform ${t.value ? 'translate-x-5' : ''}`} />
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
