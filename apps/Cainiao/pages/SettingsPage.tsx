import React from 'react';
import { useCainiaoStore } from '../state';
import { useCainiaoGestures } from '../hooks/useCainiaoGestures';
import { useAppStrings } from '../../../os/useAppStrings';
import { strings } from '../res/strings';
import { stringsEn } from '../res/strings.en';
import { SubPageHeader } from '../components/SubPageHeader';

export const SettingsPage: React.FC = () => {
  const { bindTap } = useCainiaoGestures();
  const s = useAppStrings(strings, stringsEn);
  const settings = useCainiaoStore(st => st.settings);
  const updateSettings = useCainiaoStore(st => st.updateSettings);

  const toggles: { id: 'settings.alert.pickup.toggle' | 'settings.alert.transit.toggle' | 'settings.alert.arrival.toggle' | 'settings.theme.toggle'; label: string; value: boolean; field: 'pickupAlert' | 'transitAlert' | 'arrivalAlert' | 'themeId' }[] = [
    { id: 'settings.alert.pickup.toggle', label: s.settings_pickup_alert, value: settings.pickupAlert, field: 'pickupAlert' },
    { id: 'settings.alert.transit.toggle', label: s.settings_transit_alert, value: settings.transitAlert, field: 'transitAlert' },
    { id: 'settings.alert.arrival.toggle', label: s.settings_arrival_alert, value: settings.arrivalAlert, field: 'arrivalAlert' },
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
    <div className="min-h-full bg-[#F5F6F8]">
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
            <span
              className={`w-11 h-6 rounded-full flex items-center px-0.5 transition-colors ${t.value ? 'bg-[#FF6A00]' : 'bg-[#D8DCE2]'}`}
            >
              <span className={`w-5 h-5 rounded-full bg-white shadow transition-transform ${t.value ? 'translate-x-5' : ''}`} />
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
