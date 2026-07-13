import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useChinaMobileStore } from '../state';
import { useChinaMobileGestures } from '../hooks/useChinaMobileGestures';
import { useAppStrings } from '../../../os/useAppStrings';
import { strings } from '../res/strings';
import { stringsEn } from '../res/strings.en';
import { SubPageHeader } from '../components/SubPageHeader';
import { ConfirmDialog, ConfirmButton } from '../components/ConfirmDialog';
import { IcPlus, IcDelete, IcFamily } from '../res/icons';

export const FamilyPage: React.FC = () => {
  const s = useAppStrings(strings, stringsEn);
  const { bindTap, go } = useChinaMobileGestures();
  const [searchParams, setSearchParams] = useSearchParams();
  const familyNumbers = useChinaMobileStore(st => st.familyNumbers);
  const draft = useChinaMobileStore(st => st._temp.familyDraft);
  const setFamilyDraft = useChinaMobileStore(st => st.setFamilyDraft);
  const addFamilyNumber = useChinaMobileStore(st => st.addFamilyNumber);
  const deleteFamilyNumber = useChinaMobileStore(st => st.deleteFamilyNumber);
  const [phoneInput, setPhoneInput] = useState('');
  const [nickInput, setNickInput] = useState('');
  const [toast, setToast] = useState<string | null>(null);

  const addDialogOpen = searchParams.get('dialog') === 'addFam';
  const deleteDialogOpen = searchParams.get('dialog') === 'deleteFam';
  const deleteId = searchParams.get('id') ?? '';
  const deleteTarget = familyNumbers.find(f => f.id === deleteId) ?? null;

  const openAdd = () => {
    setPhoneInput(draft.phone);
    setNickInput(draft.nickname);
    go('family.add.open');
  };
  const closeDialog = () => setSearchParams(p => { p.delete('dialog'); p.delete('id'); return p; });
  const handleAdd = () => {
    const res = addFamilyNumber(phoneInput, nickInput);
    if (res.ok) {
      setFamilyDraft({ phone: '', nickname: '' });
      setPhoneInput('');
      setNickInput('');
      closeDialog();
    } else {
      setToast(res.reason ?? '');
      setTimeout(() => setToast(null), 2000);
    }
  };
  const handleDelete = () => {
    if (deleteId) deleteFamilyNumber(deleteId);
    closeDialog();
  };

  return (
    <div className="min-h-full bg-[#F2F4F7]">
      <SubPageHeader title={s.family_title} right={
        <button {...bindTap<HTMLButtonElement>('family.add.open')} className="text-white">
          <IcPlus size={22} />
        </button>
      } />

      {familyNumbers.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-[#8A8F99]">
          <IcFamily size={48} className="text-[#C9CDD4]" />
          <span className="mt-2 text-[14px]">{s.family_empty}</span>
        </div>
      ) : (
        <div className="px-3 py-3 space-y-3">
          {familyNumbers.map(f => (
            <div key={f.id} className="bg-white rounded-xl p-4 flex items-center justify-between">
              <div className="flex items-center">
                <span className="w-10 h-10 rounded-full bg-[#EAF3FB] flex items-center justify-center">
                  <IcFamily size={20} className="text-[#0066B3]" />
                </span>
                <div className="ml-3">
                  <div className="text-[15px] font-medium text-[#1A1A1A]">{f.nickname}</div>
                  <div className="text-[13px] text-[#8A8F99]">{f.phone}</div>
                </div>
              </div>
              <button
                className="flex items-center gap-1 text-[13px] text-[#FF3B30]"
                onClick={() => go('family.delete.dialog.open', { id: f.id })}
              >
                <IcDelete size={16} /> {s.family_delete}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* 添加弹窗（表单） */}
      {addDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={closeDialog}>
          <div className="bg-white rounded-xl w-[320px] overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="px-5 pt-5 pb-3 text-center text-[16px] font-medium text-[#1A1A1A]">{s.family_add_title}</div>
            <div className="px-5 pb-3 space-y-3">
              <div>
                <div className="text-[12px] text-[#8A8F99] mb-1">{s.family_phone}</div>
                <input
                  className="w-full h-11 rounded-lg border border-[#EEF0F2] px-3 text-[15px] outline-none focus:border-[#0066B3]"
                  value={phoneInput}
                  onChange={e => setPhoneInput(e.target.value)}
                  data-keep-keyboard="true"
                />
              </div>
              <div>
                <div className="text-[12px] text-[#8A8F99] mb-1">{s.family_nickname}</div>
                <input
                  className="w-full h-11 rounded-lg border border-[#EEF0F2] px-3 text-[15px] outline-none focus:border-[#0066B3]"
                  value={nickInput}
                  onChange={e => setNickInput(e.target.value)}
                  data-keep-keyboard="true"
                />
              </div>
              {toast && <div className="text-[12px] text-[#FF3B30]">{toast}</div>}
            </div>
            <div className="flex border-t border-[#EEF0F2]">
              <button className="flex-1 py-3 text-[15px] text-[#8A8F99]" onClick={closeDialog}>{s.common_cancel}</button>
              <div className="flex-1 border-l border-[#EEF0F2]">
                <button
                  className="w-full h-full py-3 text-[15px] text-[#0066B3]"
                  {...bindTap<HTMLButtonElement>(
                    { kind: 'action', id: 'family.add.submit' },
                    { onTrigger: handleAdd },
                  )}
                >
                  {s.family_save}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 删除确认弹窗 */}
      <ConfirmDialog
        open={deleteDialogOpen}
        title={s.family_delete_confirm}
        onCancel={closeDialog}
        danger
        confirmSlot={
          <ConfirmButton
            danger
            actionProps={
              bindTap<HTMLButtonElement>(
                { kind: 'action', id: 'family.delete.submit' },
                { params: { familyId: deleteId }, onTrigger: handleDelete },
              ) as any
            }
          />
        }
      >
        {deleteTarget ? <div>{deleteTarget.nickname} {deleteTarget.phone}</div> : null}
      </ConfirmDialog>
    </div>
  );
};
