import React, { useState } from 'react';
import { useChinaMobileStore } from '../state';
import { useChinaMobileGestures } from '../hooks/useChinaMobileGestures';
import { useAppStrings } from '../../../os/useAppStrings';
import { strings } from '../res/strings';
import { stringsEn } from '../res/strings.en';
import { SubPageHeader } from '../components/SubPageHeader';
import { IconRenderer } from '../components/IconRenderer';
import { CHINAMOBILE_SERVICE_CATALOG, CHINAMOBILE_SERVICE_PHONES } from '../data';

// Quick-link each searchable service id to a navigation transition.
const SERVICE_TRANSITION: Record<string, string> = {
  'svc-recharge': 'home.recharge.open',
  'svc-datapack': 'home.datapack.open',
  'svc-bill': 'home.bill.open',
  'svc-plan': 'home.plan.open',
  'svc-balance': 'home.balance.open',
  'svc-data': 'home.data.open',
  'svc-voice': 'home.voice.open',
  'svc-services': 'home.services.open',
  'svc-roaming': 'me.roaming.open',
  'svc-autopay': 'me.autopay.open',
  'svc-family': 'home.family.open',
  'svc-profile': 'me.profile.open',
};

export const ServiceSearchPage: React.FC = () => {
  const s = useAppStrings(strings, stringsEn);
  const { bindTap, go } = useChinaMobileGestures();
  const [input, setInput] = useState('');
  const current = useChinaMobileStore(st => st.search.current);
  const history = useChinaMobileStore(st => st.search.history);
  const submitServiceSearch = useChinaMobileStore(st => st.submitServiceSearch);
  const clearServiceSearch = useChinaMobileStore(st => st.clearServiceSearch);

  const results = current.resultIds
    .map(id => CHINAMOBILE_SERVICE_CATALOG.find(svc => svc.id === id))
    .filter(Boolean) as typeof CHINAMOBILE_SERVICE_CATALOG;

  const handleSubmit = () => {
    submitServiceSearch(input);
  };
  const handleClear = () => {
    setInput('');
    clearServiceSearch();
  };

  return (
    <div className="min-h-full bg-[#F2F4F7]">
      <SubPageHeader title={s.search_title} />
      <div className="bg-[#0066B3] px-4 pb-3 pt-2" data-status-bar-foreground="light">
        <div className="flex items-center gap-2">
          <input
            className="flex-1 h-10 rounded-full bg-white px-4 text-[14px] outline-none"
            placeholder={s.search_placeholder}
            value={input}
            onChange={e => setInput(e.target.value)}
            data-keep-keyboard="true"
          />
          <button
            className="text-white text-[14px]"
            {...bindTap<HTMLButtonElement>(
              { kind: 'action', id: 'search.query.submit' },
              { onTrigger: handleSubmit },
            )}
          >
            {s.search_submit}
          </button>
        </div>
      </div>

      {current.searched ? (
        <div className="px-3 py-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[13px] text-[#8A8F99]">{s.search_title}</span>
            <button
              className="text-[12px] text-[#0066B3]"
              {...bindTap<HTMLButtonElement>(
                { kind: 'action', id: 'search.query.clear' },
                { onTrigger: handleClear },
              )}
            >
              {s.search_clear}
            </button>
          </div>
          {results.length === 0 ? (
            <div className="py-10 text-center text-[13px] text-[#8A8F99]">{s.search_empty}</div>
          ) : (
            <div className="bg-white rounded-2xl divide-y divide-[#F5F6F8]">
              {results.map(svc => {
                const trans = SERVICE_TRANSITION[svc.id];
                return (
                  <button
                    key={svc.id}
                    className="w-full px-4 py-3 flex items-center"
                    {...(trans ? bindTap<HTMLButtonElement>(trans as any) : {})}
                  >
                    <span className="w-9 h-9 rounded-full bg-[#EAF3FB] flex items-center justify-center">
                      <IconRenderer name={svc.icon} size={18} className="text-[#0066B3]" />
                    </span>
                    <div className="ml-3 text-left">
                      <div className="text-[14px] text-[#1A1A1A]">{svc.name}</div>
                      <div className="text-[11px] text-[#8A8F99]">{svc.category}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        <div className="px-3 py-3">
          <div className="text-[13px] text-[#8A8F99] mb-2">{s.search_history}</div>
          {history.length === 0 ? (
            <div className="py-6 text-center text-[13px] text-[#B0B4BC]">{s.search_history}</div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {history.map((h, i) => (
                <button
                  key={i}
                  className="px-3 py-1.5 rounded-full bg-white text-[12px] text-[#5A5F6A]"
                  onClick={() => { setInput(h.keyword); submitServiceSearch(h.keyword); }}
                >
                  {h.keyword}
                </button>
              ))}
            </div>
          )}
          <div className="mt-4 text-[13px] text-[#8A8F99] mb-2">客服热线</div>
          <div className="bg-white rounded-2xl divide-y divide-[#F5F6F8]">
            {CHINAMOBILE_SERVICE_PHONES.map(ph => (
              <div key={ph.id} className="px-4 py-3 flex items-center justify-between">
                <span className="text-[14px] text-[#1A1A1A]">{ph.label}</span>
                <span className="text-[13px] text-[#0066B3]">{ph.number}</span>
              </div>
            ))}
          </div>
        </div>
      )}
      <div className="h-4" />
    </div>
  );
};
