import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { useChinaMobileStore } from '../state';
import { useChinaMobileGestures } from '../hooks/useChinaMobileGestures';
import { useAppStrings } from '../../../os/useAppStrings';
import { strings } from '../res/strings';
import { stringsEn } from '../res/strings.en';
import { SubPageHeader } from '../components/SubPageHeader';
import { ConfirmDialog, ConfirmButton } from '../components/ConfirmDialog';
import { CHINAMOBILE_DATA_PACKS, CHINAMOBILE_DATA_PACK_BY_ID } from '../data';
import { formatYuan } from '../utils/format';

export const MallPage: React.FC = () => {
  const s = useAppStrings(strings, stringsEn);
  const { bindTap, go } = useChinaMobileGestures();
  const [searchParams, setSearchParams] = useSearchParams();
  const balance = useChinaMobileStore(st => st.balance);
  const buyDataPack = useChinaMobileStore(st => st.buyDataPack);

  const dialogOpen = searchParams.get('dialog') === 'buyPack';
  const dialogPackId = searchParams.get('packId') ?? '';
  const dialogPack = CHINAMOBILE_DATA_PACK_BY_ID[dialogPackId] ?? null;

  const openBuy = (packId: string) => go('datapack.confirm.dialog.open', { packId });
  const closeDialog = () => setSearchParams(p => { p.delete('dialog'); p.delete('packId'); return p; });
  const handleConfirm = () => {
    buyDataPack(dialogPackId, 'pm-balance');
    closeDialog();
  };

  return (
    <div className="min-h-full bg-[#F2F4F7]">
      <SubPageHeader title={s.tab_mall} right={
        <button {...bindTap<HTMLButtonElement>('mall.planchange.open')} className="text-white text-[14px]">
          {s.plan_change}
        </button>
      } />
      <div className="bg-[#0066B3] px-4 pb-4 pt-2" data-status-bar-foreground="light">
        <div className="text-[13px] text-white/80">{s.data_purchased}</div>
        <div className="text-[15px] text-white">流量包办理 · {formatYuan(balance)}{s.home_yuan}</div>
      </div>

      <div className="px-3 py-3 space-y-3">
        {CHINAMOBILE_DATA_PACKS.map(p => (
          <div key={p.id} className="bg-white rounded-xl p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="text-[16px] font-medium text-[#1A1A1A]">{p.name}</div>
                <div className="mt-1 text-[12px] text-[#8A8F99]">{p.desc}</div>
                <div className="mt-1 text-[12px] text-[#0066B3]">{p.validity} · {p.dataGb}{s.home_gb}</div>
              </div>
              <div className="text-right">
                <div className="text-[18px] font-semibold text-[#FF6A00]">{formatYuan(p.price)}</div>
                <div className="text-[11px] text-[#8A8F99]">{s.home_yuan}</div>
              </div>
            </div>
            <button
              className="mt-3 w-full py-2 rounded-lg text-[14px] bg-[#0066B3] text-white active:bg-[#00528F]"
              onClick={() => openBuy(p.id)}
            >
              购买
            </button>
          </div>
        ))}
      </div>

      <ConfirmDialog
        open={dialogOpen}
        title="确认购买"
        onCancel={closeDialog}
        confirmSlot={
          <ConfirmButton
            actionProps={
              bindTap<HTMLButtonElement>(
                { kind: 'action', id: 'datapack.confirm.submit' },
                { params: { packId: dialogPackId }, onTrigger: handleConfirm },
              ) as any
            }
          />
        }
      >
        {dialogPack ? (
          <div>
            {dialogPack.name}
            <br />
            {dialogPack.dataGb}{s.home_gb} · {formatYuan(dialogPack.price)}{s.home_yuan}
          </div>
        ) : null}
      </ConfirmDialog>
      <div className="h-4" />
    </div>
  );
};
