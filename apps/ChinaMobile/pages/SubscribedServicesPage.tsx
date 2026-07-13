import React from 'react';
import { useChinaMobileStore } from '../state';
import { useChinaMobileGestures } from '../hooks/useChinaMobileGestures';
import { useAppStrings } from '../../../os/useAppStrings';
import { strings } from '../res/strings';
import { stringsEn } from '../res/strings.en';
import { SubPageHeader } from '../components/SubPageHeader';
import { formatYuan } from '../utils/format';

export const SubscribedServicesPage: React.FC = () => {
  const s = useAppStrings(strings, stringsEn);
  const { bindTap } = useChinaMobileGestures();
  const services = useChinaMobileStore(st => st.subscribedServices);
  const setServiceEnabled = useChinaMobileStore(st => st.setServiceEnabled);

  const handleToggle = (serviceId: string, enabled: boolean) => {
    setServiceEnabled(serviceId, !enabled);
  };

  return (
    <div className="min-h-full bg-[#F2F4F7]">
      <SubPageHeader title={s.services_title} />
      <div className="px-3 py-3">
        <div className="text-[13px] text-[#8A8F99] px-1 mb-2">{s.services_vas}</div>
        <div className="bg-white rounded-2xl divide-y divide-[#F5F6F8]">
          {services.map(sv => (
            <div key={sv.id} className="px-4 py-3 flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-[15px] text-[#1A1A1A]">{sv.name}</span>
                  {sv.cancellable ? null : (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#F5F6F8] text-[#8A8F99]">{s.services_uncancellable}</span>
                  )}
                </div>
                <div className="mt-1 text-[12px] text-[#8A8F99]">
                  {sv.price === 0 ? s.services_free : `${formatYuan(sv.price)}${s.home_yuan}/${'月'}`}
                </div>
              </div>
              {sv.cancellable ? (
                <button
                  className={`w-11 h-6 rounded-full flex items-center px-0.5 transition-colors ${sv.enabled ? 'bg-[#0066B3]' : 'bg-[#D8DCE2]'}`}
                  {...bindTap<HTMLButtonElement>(
                    { kind: 'action', id: 'service.status.toggle' },
                    { params: { serviceId: sv.id }, onTrigger: () => handleToggle(sv.id, sv.enabled) },
                  )}
                >
                  <span className={`w-5 h-5 rounded-full bg-white shadow transition-transform ${sv.enabled ? 'translate-x-5' : ''}`} />
                </button>
              ) : (
                <span className="text-[12px] text-[#B0B4BC]">{s.services_on}</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
