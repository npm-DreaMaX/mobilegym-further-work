import React from 'react';
import { useCainiaoStore } from '../state';
import { useCainiaoGestures } from '../hooks/useCainiaoGestures';
import { useAppStrings } from '../../../os/useAppStrings';
import { strings } from '../res/strings';
import { stringsEn } from '../res/strings.en';
import { SubPageHeader } from '../components/SubPageHeader';
import { IcFileText, IcChevronRight } from '../res/icons';
import { formatRelativeDay, formatEventTime } from '../utils/format';
import type { SendRecord } from '../types';

function statusLabel(r: SendRecord, s: { records_pending: string; records_shipping: string; records_completed: string }): string {
  if (r.status === 'completed') return s.records_completed;
  if (r.status === 'shipping') return s.records_shipping;
  return s.records_pending;
}

export const SendRecordsPage: React.FC = () => {
  const { bindTap } = useCainiaoGestures();
  const s = useAppStrings(strings, stringsEn);
  const records = useCainiaoStore(st => st.sendRecords);

  return (
    <div className="min-h-full bg-[#F5F6F8]">
      <SubPageHeader title={s.records_title} />
      {records.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-[#8A8F99]">
          <IcFileText size={48} className="text-[#C9CDD4]" />
          <span className="mt-2 text-[14px]">{s.records_empty}</span>
        </div>
      ) : (
        <div className="px-3 py-3 space-y-3">
          {records.map(r => (
            <button
              key={r.id}
              className="w-full bg-white rounded-xl p-4 text-left active:bg-[#FFF8F3]"
              {...bindTap<HTMLButtonElement>('send.record.open', { params: { id: r.id } })}
            >
              <div className="flex items-center justify-between">
                <span className="text-[15px] font-medium text-[#1A1A1A]">{r.receiver.name}</span>
                <span className={`text-[12px] px-2 py-0.5 rounded-full ${r.status === 'completed' ? 'bg-[#F0F4FF] text-[#1A73E8]' : 'bg-[#FFF4EC] text-[#FF6A00]'}`}>
                  {statusLabel(r, s)}
                </span>
              </div>
              <div className="mt-2 text-[13px] text-[#8A8F99]">{r.receiver.address}</div>
              <div className="mt-1 text-[12px] text-[#B0B4BC]">{r.carrierName} · {r.serviceLabel} · {r.itemCategory}</div>
              <div className="mt-2 flex items-center justify-between">
                <span className="text-[12px] text-[#B0B4BC]">
                  {s.records_created}：{formatRelativeDay(r.createdAt)} {formatEventTime(r.createdAt).slice(6)}
                </span>
                <span className="text-[15px] font-semibold text-[#1A1A1A]">¥{r.fee.toFixed(2)}{s.records_fee_suffix}</span>
              </div>
              <IcChevronRight size={16} className="text-[#C9CDD4] mt-1" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
