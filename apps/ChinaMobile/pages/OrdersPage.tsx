import React from 'react';
import { useChinaMobileStore } from '../state';
import { useAppStrings } from '../../../os/useAppStrings';
import { strings } from '../res/strings';
import { stringsEn } from '../res/strings.en';
import { SubPageHeader } from '../components/SubPageHeader';
import { formatTxnTime, formatYuan } from '../utils/format';
import { IcWallet } from '../res/icons';
import type { Transaction } from '../types';

const TYPE_LABEL: Record<Transaction['type'], string> = {
  recharge: 'orders_type_recharge',
  payment: 'orders_type_payment',
  datapack: 'orders_type_datapack',
  planchange: 'orders_type_planchange',
  service: 'orders_type_service',
} as const;

export const OrdersPage: React.FC = () => {
  const s = useAppStrings(strings, stringsEn);
  const transactions = useChinaMobileStore(st => st.transactions);

  return (
    <div className="min-h-full bg-[#F2F4F7]">
      <SubPageHeader title={s.orders_title} />
      {transactions.length === 0 ? (
        <div className="px-4 py-20 text-center text-[14px] text-[#8A8F99]">{s.orders_empty}</div>
      ) : (
        <div className="px-3 py-3 space-y-3">
          {transactions.map(t => (
            <div key={t.id} className="bg-white rounded-xl p-4 flex items-center justify-between">
              <div className="flex items-center">
                <span className="w-10 h-10 rounded-full bg-[#EAF3FB] flex items-center justify-center">
                  <IcWallet size={18} className="text-[#0066B3]" />
                </span>
                <div className="ml-3">
                  <div className="text-[14px] text-[#1A1A1A]">{t.desc}</div>
                  <div className="text-[11px] text-[#B0B4BC]">
                    {s[TYPE_LABEL[t.type] as keyof typeof strings]} · {formatTxnTime(t.time)}
                  </div>
                </div>
              </div>
              <span className={`text-[14px] ${t.type === 'recharge' ? 'text-[#FF6A00]' : 'text-[#1A1A1A]'}`}>
                {t.type === 'planchange' ? '' : (t.amount > 0 ? '+' : '') + formatYuan(t.amount)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
