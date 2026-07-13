import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { useChinaMobileStore } from '../state';
import { useChinaMobileGestures } from '../hooks/useChinaMobileGestures';
import { useAppStrings } from '../../../os/useAppStrings';
import { strings } from '../res/strings';
import { stringsEn } from '../res/strings.en';
import { SubPageHeader } from '../components/SubPageHeader';
import { ConfirmDialog, ConfirmButton } from '../components/ConfirmDialog';
import { CHINAMOBILE_PLANS, CHINAMOBILE_PLAN_BY_ID } from '../data';
import { formatYuan } from '../utils/format';
import { IcCheck } from '../res/icons';

export const PlanChangePage: React.FC = () => {
  const s = useAppStrings(strings, stringsEn);
  const { bindTap, go } = useChinaMobileGestures();
  const [searchParams, setSearchParams] = useSearchParams();
  const activePlanId = useChinaMobileStore(st => st.activePlanId);
  const draftPlanId = useChinaMobileStore(st => st._temp.planChangeDraft.planId);
  const setPlanChangeDraft = useChinaMobileStore(st => st.setPlanChangeDraft);
  const changePlan = useChinaMobileStore(st => st.changePlan);

  const dialogOpen = searchParams.get('dialog') === 'confirm';
  const dialogPlanId = searchParams.get('planId') ?? draftPlanId ?? '';
  const dialogPlan = CHINAMOBILE_PLAN_BY_ID[dialogPlanId] ?? null;

  const openConfirm = (planId: string) => {
    setPlanChangeDraft({ planId });
    go('planchange.confirm.dialog.open', { planId });
  };
  const closeDialog = () => setSearchParams(p => { p.delete('dialog'); p.delete('planId'); return p; });

  const handleConfirm = () => {
    if (dialogPlanId) changePlan(dialogPlanId);
    closeDialog();
  };

  return (
    <div className="min-h-full bg-[#F2F4F7]">
      <SubPageHeader title={s.planchange_title} />
      <div className="px-3 py-3 space-y-3">
        {CHINAMOBILE_PLANS.map(p => {
          const isActive = p.id === activePlanId;
          const isSelected = p.id === draftPlanId;
          return (
            <div key={p.id} className={`bg-white rounded-xl p-4 border-2 ${isSelected ? 'border-[#0066B3]' : 'border-transparent'}`}>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[16px] font-medium text-[#1A1A1A]">{p.name}</span>
                    {isActive && <span className="text-[11px] px-1.5 py-0.5 rounded bg-[#EAF3FB] text-[#0066B3]">{s.planchange_current}</span>}
                  </div>
                  <div className="mt-1 text-[12px] text-[#8A8F99]">{p.desc}</div>
                  <div className="mt-2 text-[13px] text-[#1A1A1A]">
                    {formatYuan(p.price)}{s.home_yuan}/月 · {p.dataGb}{s.home_gb}流量 · {p.voiceMin}{s.home_min}
                  </div>
                </div>
                {isSelected && <IcCheck size={20} className="text-[#0066B3]" />}
              </div>
              {!isActive && (
                <button
                  className="mt-3 w-full py-2 rounded-lg text-[14px] border border-[#0066B3] text-[#0066B3] active:bg-[#EAF3FB]"
                  {...bindTap<HTMLButtonElement>(
                    { kind: 'action', id: 'planchange.plan.select' },
                    { params: { planId: p.id }, onTrigger: () => setPlanChangeDraft({ planId: p.id }) },
                  )}
                >
                  {s.planchange_select}
                </button>
              )}
            </div>
          );
        })}
      </div>

      <div className="px-3 pb-4">
        <button
          className="w-full bg-[#0066B3] text-white py-3 rounded-xl text-[15px] font-medium active:bg-[#00528F] disabled:opacity-40"
          disabled={!draftPlanId || draftPlanId === activePlanId}
          onClick={() => draftPlanId && openConfirm(draftPlanId)}
        >
          {s.planchange_confirm}
        </button>
      </div>

      <ConfirmDialog
        open={dialogOpen}
        title={s.planchange_confirm_title}
        onCancel={closeDialog}
        confirmSlot={
          <ConfirmButton
            danger={false}
            actionProps={
              bindTap<HTMLButtonElement>(
                { kind: 'action', id: 'planchange.confirm.submit' },
                { params: { planId: dialogPlanId }, onTrigger: handleConfirm },
              ) as any
            }
          />
        }
      >
        {dialogPlan ? (
          <div>
            {s.planchange_current}：{CHINAMOBILE_PLAN_BY_ID[activePlanId]?.name}
            <br />
            {s.planchange_to}：{dialogPlan.name}
          </div>
        ) : null}
      </ConfirmDialog>
    </div>
  );
};
