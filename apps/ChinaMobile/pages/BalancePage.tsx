import React, { useEffect } from 'react';
import { useChinaMobileStore } from '../state';
import { useChinaMobileGestures } from '../hooks/useChinaMobileGestures';
import { useAppStrings } from '../../../os/useAppStrings';
import { strings } from '../res/strings';
import { stringsEn } from '../res/strings.en';
import { SubPageHeader } from '../components/SubPageHeader';
import { formatYuan, formatTxnTime } from '../utils/format';
import { IcWallet } from '../res/icons';

export const BalancePage: React.FC = () => {
  const s = useAppStrings(strings, stringsEn);
  const { bindTap } = useChinaMobileGestures();
  const balance = useChinaMobileStore(st => st.balance);
  const bills = useChinaMobileStore(st => st.bills);
  const transactions = useChinaMobileStore(st => st.transactions);
  const markPageVisited = useChinaMobileStore(st => st.markPageVisited);

  useEffect(() => { markPageVisited('balance'); }, [markPageVisited]);

  const arrearsBill = bills.find(b => b.status === 'unpaid') ?? null;
  const currentBill = bills.find(b => b.status === 'current') ?? null;
  const recent = transactions.slice(0, 5);

  return (
    <div className="min-h-full bg-[#F2F4F7]">
      <SubPageHeader title={s.balance_title} />
      <div className="bg-[#0066B3] px-4 pb-5" data-status-bar-foreground="light">
        <div className="bg-white/10 rounded-xl p-4">
          <div className="text-[13px] text-white/80">{s.balance_current}</div>
          <div className="mt-1 text-[32px] font-semibold text-white leading-none">
            {formatYuan(balance)}<span className="text-[14px] ml-1">{s.home_yuan}</span>
          </div>
        </div>
      </div>

      <div className="mx-3 mt-3 bg-white rounded-2xl divide-y divide-[#F5F6F8]">
        <div className="px-4 py-3 flex items-center justify-between">
          <span className="text-[14px] text-[#8A8F99]">{s.balance_payable}</span>
          <span className="text-[14px] text-[#1A1A1A]">
            {currentBill ? `${formatYuan(currentBill.total)}${s.home_yuan}` : '—'}
          </span>
        </div>
        <div className="px-4 py-3 flex items-center justify-between">
          <span className="text-[14px] text-[#8A8F99]">{s.balance_arrears}</span>
          <span className={`text-[14px] ${arrearsBill ? 'text-[#FF3B30]' : 'text-[#1A1A1A]'}`}>
            {arrearsBill ? `${formatYuan(arrearsBill.total)}${s.home_yuan}` : `0.00${s.home_yuan}`}
          </span>
        </div>
      </div>

      {arrearsBill && (
        <div className="mx-3 mt-2 text-[12px] text-[#FF6A00] px-1">{s.balance_arrears_hint}</div>
      )}

      <button
        className="mx-3 mt-3 w-full bg-[#0066B3] text-white py-3 rounded-xl text-[15px] font-medium active:bg-[#00528F]"
        style={{ width: 'calc(100% - 24px)' }}
        {...bindTap<HTMLButtonElement>('home.recharge.open')}
      >
        {s.balance_recharge}
      </button>

      <div className="mx-3 mt-4 bg-white rounded-2xl">
        <div className="px-4 py-3 text-[14px] font-medium text-[#1A1A1A] border-b border-[#F5F6F8]">
          {s.balance_recent}
        </div>
        {recent.length === 0 ? (
          <div className="px-4 py-8 text-center text-[13px] text-[#8A8F99]">{s.orders_empty}</div>
        ) : (
          recent.map(t => (
            <div key={t.id} className="px-4 py-3 flex items-center justify-between border-b border-[#F5F6F8] last:border-b-0">
              <div className="flex items-center">
                <IcWallet size={18} className="text-[#0066B3]" />
                <div className="ml-2">
                  <div className="text-[14px] text-[#1A1A1A]">{t.desc}</div>
                  <div className="text-[11px] text-[#B0B4BC]">{formatTxnTime(t.time)}</div>
                </div>
              </div>
              <span className={`text-[14px] ${t.type === 'recharge' ? 'text-[#FF6A00]' : 'text-[#1A1A1A]'}`}>
                {t.type === 'planchange' ? '' : (t.amount > 0 ? '+' : '')}{t.type === 'planchange' ? '' : formatYuan(t.amount)}
              </span>
            </div>
          ))
        )}
      </div>
      <div className="h-4" />
    </div>
  );
};
