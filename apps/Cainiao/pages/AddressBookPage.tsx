import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { useCainiaoStore } from '../state';
import { useCainiaoGestures } from '../hooks/useCainiaoGestures';
import { useAppStrings } from '../../../os/useAppStrings';
import { strings } from '../res/strings';
import { stringsEn } from '../res/strings.en';
import { SubPageHeader } from '../components/SubPageHeader';
import { IconRenderer } from '../components/IconRenderer';
import { IcPlus, IcEdit, IcDelete, IcChevronRight, IcMapPin } from '../res/icons';
import { ADDRESS_TAG_ICON } from '../constants';

export const AddressBookPage: React.FC = () => {
  const { bindTap } = useCainiaoGestures();
  const s = useAppStrings(strings, stringsEn);
  const [searchParams, setSearchParams] = useSearchParams();
  const addresses = useCainiaoStore(st => st.addresses);
  const defaultAddressId = useCainiaoStore(st => st.defaultAddressId);
  const setDefaultAddress = useCainiaoStore(st => st.setDefaultAddress);
  const deleteAddress = useCainiaoStore(st => st.deleteAddress);

  const dialogOpen = searchParams.get('dialog') === 'deleteAddr';
  const dialogAddressId = searchParams.get('id');
  const dialogAddress = addresses.find(a => a.id === dialogAddressId) ?? null;

  const openDeleteDialog = (addressId: string) => {
    setSearchParams(p => { p.set('dialog', 'deleteAddr'); p.set('id', addressId); return p; });
  };
  const closeDialog = () => setSearchParams(p => { p.delete('dialog'); p.delete('id'); return p; });

  return (
    <div className="min-h-full bg-[#F5F6F8]">
      <SubPageHeader
        title={s.addr_title}
        right={
          <button {...bindTap<HTMLButtonElement>('address.add.open')} className="text-[#FF6A00] text-[14px]">
            <IcPlus size={22} />
          </button>
        }
      />

      {addresses.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-[#8A8F99]">
          <IcMapPin size={48} className="text-[#C9CDD4]" />
          <span className="mt-2 text-[14px]">{s.addr_empty}</span>
        </div>
      ) : (
        <div className="px-3 py-3 space-y-3">
          {addresses.map(a => {
            const isDefault = a.id === defaultAddressId;
            return (
              <div key={a.id} className="bg-white rounded-xl p-4">
                <button
                  className="w-full text-left"
                  {...bindTap<HTMLButtonElement>('address.edit.open', { params: { id: a.id } })}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-[16px] font-medium text-[#1A1A1A]">{a.name} {a.phone}</span>
                    {isDefault && (
                      <span className="text-[11px] px-1.5 py-0.5 rounded bg-[#FFF4EC] text-[#FF6A00]">{s.addr_default}</span>
                    )}
                  </div>
                  <div className="mt-2 text-[13px] text-[#8A8F99]">
                    {a.province}{a.city}{a.district}{a.detail}
                  </div>
                  <div className="mt-2 inline-flex items-center gap-1 text-[12px] text-[#8A8F99]">
                    <IconRenderer name={ADDRESS_TAG_ICON[a.tag] ?? 'IcMapPin'} size={14} />
                    {a.tag}
                  </div>
                </button>
                <div className="mt-3 pt-3 border-t border-[#F5F6F8] flex items-center justify-between">
                  <button
                    className={`text-[13px] ${isDefault ? 'text-[#B0B4BC]' : 'text-[#FF6A00]'}`}
                    disabled={isDefault}
                    {...bindTap<HTMLButtonElement>(
                      { kind: 'action', id: 'address.record.setDefault' },
                      { params: { addressId: a.id }, onTrigger: () => setDefaultAddress(a.id) },
                    )}
                  >
                    {s.addr_set_default}
                  </button>
                  <div className="flex items-center gap-4">
                    <button
                      className="flex items-center gap-1 text-[13px] text-[#8A8F99]"
                      {...bindTap<HTMLButtonElement>('address.edit.open', { params: { id: a.id } })}
                    >
                      <IcEdit size={16} /> {s.addr_edit}
                    </button>
                    <button
                      className="flex items-center gap-1 text-[13px] text-[#FF3B30]"
                      onClick={() => openDeleteDialog(a.id)}
                    >
                      <IcDelete size={16} /> {s.addr_delete}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 删除确认弹窗 */}
      {dialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={closeDialog}>
          <div className="bg-white rounded-xl w-[280px] overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="px-5 pt-5 pb-3 text-center">
              <div className="text-[16px] font-medium text-[#1A1A1A]">{s.addr_delete_confirm}</div>
              {dialogAddress && (
                <div className="mt-2 text-[13px] text-[#8A8F99]">
                  {dialogAddress.name} {dialogAddress.phone}
                </div>
              )}
            </div>
            <div className="flex border-t border-[#EEF0F2]">
              <button
                className="flex-1 py-3 text-[15px] text-[#8A8F99] active:bg-[#F5F6F8]"
                onClick={closeDialog}
              >
                {s.common_cancel}
              </button>
              <button
                className="flex-1 py-3 text-[15px] text-[#FF3B30] border-l border-[#EEF0F2] active:bg-[#FFF4F3]"
                {...bindTap<HTMLButtonElement>(
                  { kind: 'action', id: 'address.record.delete' },
                  {
                    params: { addressId: dialogAddressId ?? '' },
                    onTrigger: () => { if (dialogAddressId) deleteAddress(dialogAddressId); closeDialog(); },
                  },
                )}
              >
                {s.common_confirm}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
