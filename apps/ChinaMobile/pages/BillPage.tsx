import React from 'react';
import { useChinaMobileStore } from '../state';
import { useChinaMobileGestures } from '../hooks/useChinaMobileGestures';
import { useAppStrings } from '../../../os/useAppStrings';
import { strings } from '../res/strings';
import { stringsEn } from '../res/strings.en';
import { SubPageHeader } from '../components/SubPageHeader';
import { formatYuan } from '../utils/format';
import { IcChevronRight } from '../res/icons';
import type { Bill } from '../types';

const STATUS_TEXT: Record<Bill['status'], string> = {
  current: 'bill_status_current',
  unpaid: 'bill_status_unpaid',
  paid: 'bill_status_paid',
} as const;

export const BillPage: React.FC = () => {
  const s = useAppStrings(strings, stringsEn);
  const { bindTap } = useChinaMobileGestures();
  const bills = useChinaMobileStore(st => st.bills);

  return (
    <div className="min-h-full bg-[#F2F4F7]">
      <SubPageHeader title={s.bill_title} />
      <div className="px-3 py-3 space-y-3">
        {bills.map(b => (
          <button
            key={b.id}
            className="w-full bg-white rounded-xl p-4 text-left active:bg-[#F5F6F8]"
            {...bindTap<HTMLButtonElement>('bill.detail.open', { params: { id: b.id } })}
          >
            <div className="flex items-center justify-between">
              <span className="text-[15px] font-medium text-[#1A1A1A]">{b.month} {s.bill_month}</span>
              <span className={`text-[12px] px-2 py-0.5 rounded-full ${
                b.status === 'unpaid' ? 'bg-[#FFF4F3] text-[#FF3B30]' :
                b.status === 'current' ? 'bg-[#EAF3FB] text-[#0066B3]' : 'bg-[#F5F6F8] text-[#8A8F99]'
              }`}>
                {s[STATUS_TEXT[b.status] as keyof typeof strings]}
              </span>
            </div>
            <div className="mt-2 flex items-center justify-between">
              <span className="text-[13px] text-[#8A8F99]">{s.bill_total}</span>
              <span className="text-[18px] font-semibold text-[#1A1A1A]">
                {formatYuan(b.total)}<span className="text-[12px] text-[#8A8F99] ml-1">{s.home_yuan}</span>
              </span>
            </div>
            {b.status === 'unpaid' && (
              <div className="mt-1 text-[12px] text-[#FF6A00]">{s.bill_status_unpaid}</div>
            )}
            <div className="mt-2 flex items-center">
              <span className="text-[12px] text-[#0066B3]">{s.bill_view_detail}</span>
              <IcChevronRight size={14} className="text-[#C9CDD4] ml-auto" />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};
