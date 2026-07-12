import React, { useMemo, useState } from 'react';
import { useCainiaoStore } from '../state';
import { useCainiaoGestures } from '../hooks/useCainiaoGestures';
import { useAppStrings } from '../../../os/useAppStrings';
import { strings } from '../res/strings';
import { stringsEn } from '../res/strings.en';
import { SubPageHeader } from '../components/SubPageHeader';
import {
  CAINIAO_CARRIERS, CAINIAO_SERVICE_TYPES, CAINIAO_ITEM_CATEGORIES,
  CAINIAO_PICKUP_TIME_SLOTS, CAINIAO_SERVICE_BY_ID, computeSendFee,
} from '../data';
import type { ContactInfo } from '../types';

interface FormState {
  senderName: string; senderPhone: string; senderAddress: string;
  receiverName: string; receiverPhone: string; receiverAddress: string;
  itemCategory: string; weight: string;
  serviceType: string; carrierId: string; pickupTime: string; note: string;
}

export const SendCreatePage: React.FC = () => {
  const { bindTap, back } = useCainiaoGestures();
  const s = useAppStrings(strings, stringsEn);
  const addresses = useCainiaoStore(st => st.addresses);
  const defaultAddressId = useCainiaoStore(st => st.defaultAddressId);
  const submitSendRecord = useCainiaoStore(st => st.submitSendRecord);
  const [toast, setToast] = useState(false);

  const defaultAddr = useMemo(
    () => addresses.find(a => a.id === defaultAddressId) ?? addresses[0] ?? null,
    [addresses, defaultAddressId],
  );

  const [form, setForm] = useState<FormState>(() => ({
    senderName: defaultAddr?.name ?? '',
    senderPhone: defaultAddr?.phone ?? '',
    senderAddress: defaultAddr ? `${defaultAddr.province}${defaultAddr.city}${defaultAddr.district}${defaultAddr.detail}` : '',
    receiverName: '',
    receiverPhone: '',
    receiverAddress: '',
    itemCategory: CAINIAO_ITEM_CATEGORIES[0],
    weight: '1',
    serviceType: CAINIAO_SERVICE_TYPES[0].id,
    carrierId: CAINIAO_CARRIERS[0].id,
    pickupTime: CAINIAO_PICKUP_TIME_SLOTS[0],
    note: '',
  }));

  const set = <K extends keyof FormState>(k: K, v: string) => setForm(f => ({ ...f, [k]: v }));

  const carrier = CAINIAO_CARRIERS.find(c => c.id === form.carrierId)!;
  const service = CAINIAO_SERVICE_BY_ID[form.serviceType];
  const fee = useMemo(() => {
    const w = parseFloat(form.weight);
    if (!service || isNaN(w) || w <= 0) return 0;
    return computeSendFee(form.serviceType, w);
  }, [form.serviceType, form.weight, service]);

  const [error, setError] = useState(false);

  const handleSubmit = () => {
    if (!form.receiverName || !form.receiverPhone || !form.receiverAddress ||
        !form.senderName || !form.senderPhone || !form.senderAddress) {
      setError(true);
      return;
    }
    setError(false);
    const sender: ContactInfo = { name: form.senderName, phone: form.senderPhone, address: form.senderAddress };
    const receiver: ContactInfo = { name: form.receiverName, phone: form.receiverPhone, address: form.receiverAddress };
    submitSendRecord({
      sender, receiver,
      itemCategory: form.itemCategory,
      weight: parseFloat(form.weight),
      serviceType: form.serviceType,
      serviceLabel: service.label,
      carrierId: form.carrierId,
      carrierName: carrier.name,
      pickupTime: form.pickupTime,
      note: form.note,
      fee,
    });
    setToast(true);
    setTimeout(() => { setToast(false); back(1); }, 900);
  };

  return (
    <div className="min-h-full bg-[#F5F6F8]">
      <SubPageHeader title={s.sendc_title} />

      {/* 寄件人 */}
      <div className="mt-2 bg-white px-4 py-4">
        <div className="text-[13px] text-[#8A8F99] mb-3">{s.sendc_sender_section}</div>
        <LabeledInput label={s.sendc_name} value={form.senderName} onChange={v => set('senderName', v)} />
        <LabeledInput label={s.sendc_phone} value={form.senderPhone} onChange={v => set('senderPhone', v)} />
        <LabeledInput label={s.sendc_address} value={form.senderAddress} onChange={v => set('senderAddress', v)} />
      </div>

      {/* 收件人 */}
      <div className="mt-2 bg-white px-4 py-4">
        <div className="text-[13px] text-[#8A8F99] mb-3">{s.sendc_receiver_section}</div>
        <LabeledInput label={s.sendc_name} value={form.receiverName} onChange={v => set('receiverName', v)} />
        <LabeledInput label={s.sendc_phone} value={form.receiverPhone} onChange={v => set('receiverPhone', v)} />
        <LabeledInput label={s.sendc_address} value={form.receiverAddress} onChange={v => set('receiverAddress', v)} />
      </div>

      {/* 物品信息 */}
      <div className="mt-2 bg-white px-4 py-4">
        <div className="text-[13px] text-[#8A8F99] mb-3">{s.sendc_item_section}</div>
        <LabeledSelect label={s.sendc_item} value={form.itemCategory} options={CAINIAO_ITEM_CATEGORIES} onChange={v => set('itemCategory', v)} />
        <LabeledInput label={s.sendc_weight} type="number" value={form.weight} onChange={v => set('weight', v)} />
      </div>

      {/* 服务与时间 */}
      <div className="mt-2 bg-white px-4 py-4">
        <div className="text-[13px] text-[#8A8F99] mb-3">{s.sendc_service_section}</div>
        <LabeledSelect label={s.sendc_service} value={form.serviceType} options={CAINIAO_SERVICE_TYPES.map(t => ({ value: t.id, label: t.label }))} onChange={v => set('serviceType', v)} />
        <LabeledSelect label={s.sendc_carrier} value={form.carrierId} options={CAINIAO_CARRIERS.map(c => ({ value: c.id, label: c.name }))} onChange={v => set('carrierId', v)} />
        <LabeledSelect label={s.sendc_pickup_time} value={form.pickupTime} options={CAINIAO_PICKUP_TIME_SLOTS} onChange={v => set('pickupTime', v)} />
        <LabeledInput label={s.sendc_note} value={form.note} onChange={v => set('note', v)} />
      </div>

      {/* 费用 */}
      <div className="mt-2 bg-white px-4 py-4 flex items-center justify-between">
        <span className="text-[14px] text-[#1A1A1A]">{s.sendc_fee}</span>
        <span className="text-[20px] font-semibold text-[#FF6A00]">¥{fee.toFixed(2)}{s.sendc_fee_suffix}</span>
      </div>

      {error && (
        <div className="px-4 py-2 text-center text-[13px] text-[#FF3B30]">{s.sendc_required}</div>
      )}

      {/* 提交 */}
      <div className="sticky bottom-0 px-4 py-3 bg-white border-t border-[#EEF0F2]">
        <button
          className="w-full h-[46px] rounded-[23px] bg-[#FF6A00] text-white text-[16px] font-medium active:bg-[#E55F00]"
          {...bindTap<HTMLButtonElement>({ kind: 'action', id: 'send.form.submit' }, { onTrigger: handleSubmit })}
        >
          {s.sendc_submit}
        </button>
      </div>

      {toast && (
        <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-50">
          <div className="bg-black/70 text-white text-[14px] px-5 py-2.5 rounded-lg">{s.sendc_success}</div>
        </div>
      )}
    </div>
  );
};

// ── 局部表单组件 ──
const LabeledInput: React.FC<{ label: string; value: string; onChange: (v: string) => void; type?: string }> =
  ({ label, value, onChange, type = 'text' }) => (
    <div className="flex items-center py-2 border-b border-[#F5F6F8] last:border-b-0">
      <span className="w-20 text-[13px] text-[#8A8F99]">{label}</span>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        className="flex-1 text-[14px] text-[#1A1A1A] outline-none bg-transparent"
        data-keep-keyboard="true"
      />
    </div>
  );

const LabeledSelect: React.FC<{ label: string; value: string; options: (string | { value: string; label: string })[]; onChange: (v: string) => void }> =
  ({ label, value, options, onChange }) => (
    <div className="flex items-center py-2 border-b border-[#F5F6F8] last:border-b-0">
      <span className="w-20 text-[13px] text-[#8A8F99]">{label}</span>
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className="flex-1 text-[14px] text-[#1A1A1A] outline-none bg-transparent"
      >
        {options.map(o => {
          const v = typeof o === 'string' ? o : o.value;
          const l = typeof o === 'string' ? o : o.label;
          return <option key={v} value={v}>{l}</option>;
        })}
      </select>
    </div>
  );
