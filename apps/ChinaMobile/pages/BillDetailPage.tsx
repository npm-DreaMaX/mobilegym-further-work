import React, { useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { useChinaMobileStore } from '../state';
import { useChinaMobileGestures } from '../hooks/useChinaMobileGestures';
import { useAppStrings } from '../../../os/useAppStrings';
import { strings } from '../res/strings';
import { stringsEn } from '../res/strings.en';
import { SubPageHeader } from '../components/SubPageHeader';
import { ConfirmDialog, ConfirmButton } from '../components/ConfirmDialog';
import { CHINAMOBILE_BILL_CATEGORY_COLOR } from '../data';
import { formatYuan } from '../utils/format';

export const BillDetailPage: React.FC = () => {
  const s = useAppStrings(strings, stringsEn);
  const { id } = useParams<{ id: string }>();
  const { bindTap, go } = useChinaMobileGestures();
  const [searchParams, setSearchParams] = useSearchParams();
  const bills = useChinaMobileStore(st => st.bills);
  const balance = useChinaMobileStore(st => st.balance);
  const payBill = useChinaMobileStore(st => st.payBill);
  const markPageVisited = useChinaMobileStore(st => st.markPageVisited);
  useEffect(() => { markPageVisited('billDetail'); }, [markPageVisited]);

  const bill = bills.find(b => b.id === id) ?? null;
  const dialogOpen = searchParams.get('dialog') === 'payBill';
  const dialogBillId = searchParams.get('billId') ?? id ?? '';

  const openPay = () => { if (id) go('bill.pay.dialog.open', { billId: id }); };
  const closeDialog = () => setSearchParams(p => { p.delete('dialog'); p.delete('billId'); return p; });
  const handleConfirm = () => {
    payBill(dialogBillId, 'pm-balance');
    closeDialog();
  };

  return (
    <div className="min-h-full bg-[#F2F4F7]">
      <SubPageHeader title={s.bill_detail_title} />
      {bill ? (
        <>
          <div className="bg-[#0066B3] px-4 pb-5 pt-2" data-status-bar-foreground="light">
            <div className="text-[13px] text-white/80">{bill.month} {s.bill_month}</div>
            <div className="mt-1 text-[30px] font-semibold text-white leading-none">
              {formatYuan(bill.total)}<span className="text-[14px] ml-1">{s.home_yuan}</span>
            </div>
            {bill.status === 'unpaid' && <div className="mt-1 text-[12px] text-[#FFD9D9]">{s.bill_status_unpaid}</div>}
          </div>

          <div className="mx-3 mt-3 bg-white rounded-2xl">
            <div className="px-4 py-3 text-[14px] font-medium text-[#1A1A1A] border-b border-[#F5F6F8]">
              {s.bill_detail_title}
            </div>
            {bill.items.map((it, i) => {
              const color = CHINAMOBILE_BILL_CATEGORY_COLOR[it.category] ?? '#8A8F99';
              return (
                <div key={i} className="px-4 py-3 flex items-center justify-between border-b border-[#F5F6F8] last:border-b-0">
                  <div className="flex items-center">
                    <span className="w-2 h-2 rounded-full mr-2" style={{ background: color }} />
                    <span className="text-[14px] text-[#1A1A1A]">{it.category}</span>
                  </div>
                  <span className="text-[14px] text-[#1A1A1A]">{formatYuan(it.amount)}{s.home_yuan}</span>
                </div>
              );
            })}
          </div>

          {bill.status === 'unpaid' && (
            <button
              className="mx-3 mt-3 bg-[#FF6A00] text-white py-3 rounded-xl text-[15px] font-medium active:bg-[#E55F00]"
              style={{ width: 'calc(100% - 24px)' }}
              onClick={openPay}
            >
              {s.bill_pay}（{formatYuan(bill.total)}{s.home_yuan}）
            </button>
          )}
          {bill.status !== 'unpaid' && (
            <div className="mx-3 mt-3 text-center text-[13px] text-[#8A8F99] py-3">
              {bill.status === 'paid' ? s.bill_status_paid : s.bill_status_current}
            </div>
          )}
        </>
      ) : (
        <div className="px-4 py-20 text-center text-[14px] text-[#8A8F99]">{s.common_not_available}</div>
      )}

      <ConfirmDialog
        open={dialogOpen}
        title={s.bill_pay}
        onCancel={closeDialog}
        confirmSlot={
          <ConfirmButton
            danger
            actionProps={
              bindTap<HTMLButtonElement>(
                { kind: 'action', id: 'bill.pay.confirm.submit' },
                { params: { billId: dialogBillId }, onTrigger: handleConfirm },
              ) as any
            }
          />
        }
      >
        {bill ? (
          <div>
            {s.bill_total}：{formatYuan(bill.total)}{s.home_yuan}
            <br />
            {s.balance_current}：{formatYuan(balance)}{s.home_yuan}
          </div>
        ) : null}
      </ConfirmDialog>
      <div className="h-4" />
    </div>
  );
};
