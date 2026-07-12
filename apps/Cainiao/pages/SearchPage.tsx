import React, { useState } from 'react';
import { useCainiaoStore } from '../state';
import { useCainiaoGestures } from '../hooks/useCainiaoGestures';
import { useAppStrings } from '../../../os/useAppStrings';
import { strings } from '../res/strings';
import { stringsEn } from '../res/strings.en';
import { SubPageHeader } from '../components/SubPageHeader';
import { IcSearch, IcChevronRight, IcPackageCheck } from '../res/icons';
import { formatEventTime } from '../utils/format';

export const SearchPage: React.FC = () => {
  const { bindTap } = useCainiaoGestures();
  const s = useAppStrings(strings, stringsEn);
  const submitSearch = useCainiaoStore(st => st.submitSearch);
  const clearSearch = useCainiaoStore(st => st.clearSearch);
  const current = useCainiaoStore(st => st.search.current);
  const history = useCainiaoStore(st => st.search.history);
  const packages = useCainiaoStore(st => st.packages);

  const [input, setInput] = useState('');

  const handleSubmit = () => {
    const v = input.trim();
    if (!v) return;
    submitSearch(v);
  };

  const handleClear = () => {
    setInput('');
    clearSearch();
  };

  const resultPackage = current.searched && current.resultPackageId
    ? packages.find(p => p.id === current.resultPackageId) ?? null
    : null;

  return (
    <div className="min-h-full bg-[#F5F6F8]">
      <SubPageHeader title={s.search_title} />

      {/* 搜索框 */}
      <div className="bg-white px-4 py-3 flex items-center gap-2">
        <div className="flex-1 h-10 rounded-full bg-[#F5F6F8] flex items-center px-4">
          <IcSearch size={18} className="text-[#8A8F99]" />
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') handleSubmit(); }}
            placeholder={s.search_placeholder}
            className="flex-1 ml-2 bg-transparent outline-none text-[14px] text-[#1A1A1A]"
            data-keep-keyboard="true"
          />
        </div>
        <button
          className="text-[14px] text-[#FF6A00] font-medium"
          {...bindTap<HTMLButtonElement>({ kind: 'action', id: 'search.query.submit' }, { onTrigger: handleSubmit })}
        >
          {s.search_submit}
        </button>
      </div>

      {/* 结果区 */}
      {current.searched && (
        <div className="mt-2 px-3">
          {resultPackage ? (
            <div className="bg-white rounded-xl p-4">
              <div className="flex items-center justify-between">
                <span className="text-[13px] text-[#8A8F99]">{s.search_result}</span>
                <IcPackageCheck size={18} className="text-[#34C759]" />
              </div>
              <button
                className="mt-2 w-full text-left"
                {...bindTap<HTMLButtonElement>('home.package.open', { params: { id: resultPackage.id } })}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[15px] font-medium text-[#1A1A1A]">{resultPackage.statusLabel}</span>
                  <span className="text-[12px] text-[#8A8F99]">{resultPackage.carrierName}</span>
                </div>
                <div className="mt-2 text-[13px] text-[#8A8F99]">运单号 {resultPackage.trackingNo}</div>
                <div className="mt-1 text-[12px] text-[#B0B4BC]">
                  {resultPackage.events[0] ? formatEventTime(resultPackage.events[0].time) : ''} · {resultPackage.events[0]?.location ?? ''}
                </div>
                <div className="mt-2 flex items-center text-[13px] text-[#FF6A00]">
                  {s.search_open_detail}
                  <IcChevronRight size={16} className="ml-auto" />
                </div>
              </button>
            </div>
          ) : (
            <div className="bg-white rounded-xl p-6 text-center text-[14px] text-[#8A8F99]">
              {s.search_no_result}
            </div>
          )}
          <div className="mt-2 text-center">
            <button
              className="text-[13px] text-[#8A8F99]"
              {...bindTap<HTMLButtonElement>({ kind: 'action', id: 'search.query.clear' }, { onTrigger: handleClear })}
            >
              {s.search_clear}
            </button>
          </div>
        </div>
      )}

      {/* 搜索历史 */}
      {!current.searched && (
        <div className="mt-2 px-4">
          <div className="text-[13px] text-[#8A8F99] mb-2">{s.search_history}</div>
          {history.length === 0 ? (
            <div className="text-[13px] text-[#B0B4BC]">{s.search_history_empty}</div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {history.map(h => (
                <button
                  key={`${h.trackingNo}-${h.time}`}
                  className="px-3 py-1.5 rounded-full bg-white text-[13px] text-[#1A1A1A] active:bg-[#FFF4EC]"
                  onClick={() => { setInput(h.trackingNo); submitSearch(h.trackingNo); }}
                >
                  {h.trackingNo}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
