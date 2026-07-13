import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { useChinaMobileStore } from '../state';
import { useChinaMobileGestures } from '../hooks/useChinaMobileGestures';
import { useAppStrings } from '../../../os/useAppStrings';
import { strings } from '../res/strings';
import { stringsEn } from '../res/strings.en';
import { SubPageHeader } from '../components/SubPageHeader';
import { ConfirmDialog, ConfirmButton } from '../components/ConfirmDialog';
import { CHINAMOBILE_RECHARGE_AMOUNTS } from '../data';
import { formatYuan } from '../utils/format';
import { IcCheck } from '../res/icons';

export const RechargePage: React.FC = () => {
  const s = useAppStrings(strings, stringsEn);
  const { bindTap, go } = useChinaMobileGestures();
  const [searchParams, setSearchParams] = useSearchParams();
  const balance = useChinaMobileStore(st => st.balance);
  const paymentMethods = useChinaMobileStore(st => st.paymentMethods);
  const draft = useChinaMobileStore(st => st._temp.rechargeDraft);
  const setRechargeDraft = useChinaMobileStore(st => st.setRechargeDraft);
  const recharge = useChinaMobileStore(st => st.recharge);

  const dialogOpen = searchParams.get('dialog') === 'confirm';
  const dialogAmount = Number(searchParams.get('amount') ?? draft.amount ?? 0);

  const openConfirm = () => {
    if (!draft.amount) return;
    go('recharge.confirm.dialog.open', { amount: draft.amount });
  };
  const closeDialog = () => setSearchParams(p => { p.delete('dialog'); p.delete('amount'); return p; });
  const handleConfirm = () => {
    recharge(dialogAmount, draft.paymentMethodId);
    closeDialog();
  };

  return (
    <div className="min-h-full bg-[#F2F4F7]">
      <SubPageHeader title={s.recharge_title} />
      <div className="bg-[#0066B3] px-4 pb-5 pt-2" data-status-bar-foreground="light">
        <div className="text-[13px] text-white/80">{s.balance_current}</div>
        <div className="mt-1 text-[28px] font-semibold text-white leading-none">
          {formatYuan(balance)}<span className="text-[14px] ml-1">{s.home_yuan}</span>
        </div>
      </div>

      <div className="px-3 mt-4">
        <div className="text-[14px] font-medium text-[#1A1A1A] mb-2">{s.recharge_amount}</div>
        <div className="grid grid-cols-3 gap-3">
          {CHINAMOBILE_RECHARGE_AMOUNTS.map(amt => {
            const selected = draft.amount === amt;
            return (
              <button
                key={amt}
                className={`relative py-4 rounded-xl border-2 flex flex-col items-center justify-center ${
                  selected ? 'border-[#0066B3] bg-[#EAF3FB]' : 'border-[#EEF0F2] bg-white'
                }`}
                {...bindTap<HTMLButtonElement>(
                  { kind: 'action', id: 'recharge.amount.select' },
                  { params: { amount: amt }, onTrigger: () => setRechargeDraft({ amount: amt }) },
                )}
              >
                <span className={`text-[18px] font-semibold ${selected ? 'text-[#0066B3]' : 'text-[#1A1A1A]'}`}>{amt}</span>
                <span className="text-[11px] text-[#8A8F99]">{s.home_yuan}</span>
                {selected && <IcCheck size={14} className="absolute top-1 right-1 text-[#0066B3]" />}
              </button>
            );
          })}
        </div>
      </div>

      <div className="px-3 mt-4">
        <div className="text-[14px] font-medium text-[#1A1A1A] mb-2">{s.recharge_method}</div>
        <div className="bg-white rounded-xl divide-y divide-[#F5F6F8]">
          {paymentMethods.map(m => {
            const selected = draft.paymentMethodId === m.id;
            return (
              <button
                key={m.id}
                className="w-full px-4 py-3 flex items-center justify-between"
                {...bindTap<HTMLButtonElement>(
                  { kind: 'action', id: 'recharge.method.select' },
                  { params: { methodId: m.id }, onTrigger: () => setRechargeDraft({ paymentMethodId: m.id }) },
                )}
              >
                <span className="text-[14px] text-[#1A1A1A]">
                  {m.label}{m.tail ? `（尾号${m.tail}）` : ''}
                </span>
                {selected && <IcCheck size={18} className="text-[#0066B3]" />}
              </button>
            );
          })}
        </div>
      </div>

      <div className="px-3 mt-4">
        <button
          className="w-full bg-[#0066B3] text-white py-3 rounded-xl text-[15px] font-medium active:bg-[#00528F] disabled:opacity-40"
          disabled={!draft.amount}
          onClick={openConfirm}
        >
          {s.recharge_confirm}
        </button>
      </div>

      <ConfirmDialog
        open={dialogOpen}
        title={s.recharge_confirm_title}
        onCancel={closeDialog}
        confirmSlot={
          <ConfirmButton
            actionProps={
              bindTap<HTMLButtonElement>(
                { kind: 'action', id: 'recharge.confirm.submit' },
                { params: { amount: dialogAmount }, onTrigger: handleConfirm },
              ) as any
            }
          />
        }
      >
        <div>
          {s.recharge_amount}：{dialogAmount}{s.home_yuan}
          <br />
          {s.recharge_balance_after}：{formatYuan(balance + dialogAmount)}{s.home_yuan}
        </div>
      </ConfirmDialog>
      <div className="h-4" />
    </div>
  );
};
