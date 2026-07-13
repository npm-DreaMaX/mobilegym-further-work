import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTaobaoStore } from '../state';
import { useTaobaoGestures } from '../navigation';
import { useTaobaoStrings } from '../hooks/useTaobaoStrings';
import {
  IcNavBack, IcPlus, IcEdit, IcDelete, IcLocation,
  IcNavForward, IcCheck, 
} from '../res/icons';
import type { Address } from '../types';

const AddressesPage: React.FC = () => {
  const s = useTaobaoStrings();
  const { bindBack, bindTap, go } = useTaobaoGestures();
  const [searchParams] = useSearchParams();
  const isSelectMode = searchParams.get('select') === 'true';

  const addresses = useTaobaoStore(st => st.addresses) as Address[];
  const deleteAddress = useTaobaoStore(st => st.deleteAddress);
  const setDefaultAddress = useTaobaoStore(st => st.setDefaultAddress);
  const setCheckoutDraft = useTaobaoStore(st => st.setCheckoutDraft);

  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const handleEdit = (addrId: string) => {
    go('address.edit.open', { id: addrId });
  };

  const handleAdd = () => {
    go('address.add.open', {});
  };

  const handleDelete = (addrId: string) => {
    setConfirmDeleteId(addrId);
  };

  const confirmDelete = () => {
    if (confirmDeleteId) {
      deleteAddress(confirmDeleteId);
      setConfirmDeleteId(null);
    }
  };

  const cancelDelete = () => {
    setConfirmDeleteId(null);
  };

  const handleSetDefault = (addrId: string) => {
    setDefaultAddress(addrId);
  };

  const handleSelect = (address: Address) => {
    if (isSelectMode) {
      setCheckoutDraft({ addressId: address.id });
      go('system.back', {});
    }
  };

  return (
    <div className="h-full w-full flex flex-col bg-gray-50" data-status-bar-foreground="dark">
      {/* Header */}
      <div className="bg-white px-4 pt-10 pb-3 flex items-center border-b border-gray-100">
        <button {...bindBack()} className="mr-3 p-1 -ml-1">
          <IcNavBack size={22} className="text-gray-800" />
        </button>
        <h1 className="text-lg font-bold text-gray-800 flex-1">
          {isSelectMode ? s.address_select : s.address_title}
        </h1>
        {!isSelectMode && (
          <button
            className="flex items-center gap-1 text-orange-500 text-sm font-medium"
            onClick={handleAdd}
            data-trigger="address.add.open"
          >
            <IcPlus size={18} />
            <span>{s.address_add}</span>
          </button>
        )}
      </div>

      {/* Address list */}
      <div data-scroll-container="main" data-scroll-direction="vertical" className="flex-1 overflow-y-auto">
        {addresses.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <IcLocation size={48} className="text-gray-300 mb-3" />
            <p className="text-sm text-gray-400">暂无收货地址</p>
            {!isSelectMode && (
              <button
                className="mt-4 px-6 py-2 bg-orange-500 text-white text-sm rounded-full"
                onClick={handleAdd}
              >
                {s.address_add}
              </button>
            )}
          </div>
        ) : (
          <div className="pt-3 pb-6">
            {addresses.map(addr => (
              <div
                key={addr.id}
                className={`bg-white mx-3 mb-3 rounded-lg overflow-hidden ${
                  isSelectMode ? 'cursor-pointer border border-orange-200 active:bg-orange-50' : 'border border-gray-100'
                }`}
                onClick={() => handleSelect(addr)}
              >
                {/* Address info */}
                <div className="px-4 py-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-gray-800">{addr.name}</span>
                      <span className="text-xs text-gray-500">{addr.phone}</span>
                    </div>
                    {addr.isDefault && (
                      <span className="text-[10px] px-1.5 py-0.5 bg-orange-50 text-orange-500 rounded border border-orange-200">
                        {s.address_default}
                      </span>
                    )}
                  </div>
                  <div className="flex items-start gap-1 mt-2">
                    <IcLocation size={14} className="text-gray-400 mt-0.5 flex-shrink-0" />
                    <span className="text-xs text-gray-600 leading-tight">
                      {addr.province}{addr.city}{addr.district} {addr.detail}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                {!isSelectMode && (
                  <div className="border-t border-gray-100 px-4 py-2 flex items-center justify-end gap-2">
                    {!addr.isDefault && (
                      <button
                        className="px-3 py-1 text-xs text-gray-600 border border-gray-300 rounded-md"
                        onClick={() => handleSetDefault(addr.id)}
                        data-action="address.item.default.set"
                        data-action-params={JSON.stringify({ addressId: addr.id })}
                      >
                        {s.address_set_default}
                      </button>
                    )}
                    <button
                      className="px-3 py-1 text-xs text-gray-600 border border-gray-300 rounded-md flex items-center gap-1"
                      onClick={() => handleEdit(addr.id)}
                      data-trigger="address.edit.open"
                      data-trigger-params={JSON.stringify({ id: addr.id })}
                    >
                      <IcEdit size={12} />
                      <span>{s.address_edit}</span>
                    </button>
                    <button
                      className="px-3 py-1 text-xs text-red-500 border border-red-200 rounded-md flex items-center gap-1"
                      onClick={() => handleDelete(addr.id)}
                      data-action="address.item.delete.confirm"
                      data-action-params={JSON.stringify({ addressId: addr.id })}
                    >
                      <IcDelete size={12} />
                      <span>{s.address_delete}</span>
                    </button>
                  </div>
                )}

                {/* Select indicator */}
                {isSelectMode && (
                  <div className="border-t border-gray-100 px-4 py-2 flex items-center justify-end">
                    <IcCheck size={18} className="text-orange-500" />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Bottom spacer */}
        <div className="h-8" />
      </div>

      {/* Delete confirmation dialog */}
      {confirmDeleteId && (
        <div className="absolute inset-0 bg-black/40 z-50 flex items-center justify-center px-8">
          <div className="bg-white rounded-xl w-full max-w-xs overflow-hidden">
            <div className="px-5 py-6 text-center">
              <IcDelete size={32} className="mx-auto text-red-400 mb-3" />
              <p className="text-sm text-gray-700">{s.address_delete_confirm}</p>
            </div>
            <div className="flex border-t border-gray-100">
              <button
                className="flex-1 py-3 text-sm text-gray-500 border-r border-gray-100 active:bg-gray-50"
                onClick={cancelDelete}
              >
                {s.common_cancel}
              </button>
              <button
                className="flex-1 py-3 text-sm text-red-500 font-medium active:bg-red-50"
                onClick={confirmDelete}
              >
                {s.common_delete}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddressesPage;
