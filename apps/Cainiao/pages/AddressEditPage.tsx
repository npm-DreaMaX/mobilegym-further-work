import React, { useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useCainiaoStore } from '../state';
import { useCainiaoGestures } from '../hooks/useCainiaoGestures';
import { useAppStrings } from '../../../os/useAppStrings';
import { strings } from '../res/strings';
import { stringsEn } from '../res/strings.en';
import { SubPageHeader } from '../components/SubPageHeader';
import { ADDRESS_TAGS } from '../constants';

interface FormState {
  name: string; phone: string;
  province: string; city: string; district: string; detail: string;
  tag: string; isDefault: boolean;
}

export const AddressEditPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id;
  const { bindTap, back } = useCainiaoGestures();
  const s = useAppStrings(strings, stringsEn);
  const addresses = useCainiaoStore(st => st.addresses);
  const upsertAddress = useCainiaoStore(st => st.upsertAddress);

  const existing = useMemo(() => addresses.find(a => a.id === id) ?? null, [addresses, id]);

  const [form, setForm] = useState<FormState>(() => ({
    name: existing?.name ?? '',
    phone: existing?.phone ?? '',
    province: existing?.province ?? '',
    city: existing?.city ?? '',
    district: existing?.district ?? '',
    detail: existing?.detail ?? '',
    tag: existing?.tag ?? ADDRESS_TAGS[0],
    isDefault: existing?.isDefault ?? false,
  }));
  const set = <K extends keyof FormState>(k: K, v: string | boolean) => setForm(f => ({ ...f, [k]: v }));

  const [error, setError] = useState(false);

  const handleSave = () => {
    if (!form.name || !form.phone || !form.province || !form.city || !form.district || !form.detail) {
      setError(true);
      return;
    }
    setError(false);
    upsertAddress({
      id: existing?.id,
      name: form.name,
      phone: form.phone,
      province: form.province,
      city: form.city,
      district: form.district,
      detail: form.detail,
      tag: form.tag,
      isDefault: form.isDefault,
    });
    back(1);
  };

  return (
    <div className="min-h-full bg-[#F5F6F8]">
      <SubPageHeader title={isEdit ? s.addr_edit : s.addr_add} />

      <div className="mt-2 bg-white px-4 py-2">
        <Field label={s.addr_name} value={form.name} onChange={v => set('name', v)} />
        <Field label={s.addr_phone} value={form.phone} onChange={v => set('phone', v)} />
        <Field label="省/直辖市" value={form.province} onChange={v => set('province', v)} />
        <Field label="市" value={form.city} onChange={v => set('city', v)} />
        <Field label="区/县" value={form.district} onChange={v => set('district', v)} />
        <Field label={s.addr_detail} value={form.detail} onChange={v => set('detail', v)} />
      </div>

      <div className="mt-2 bg-white px-4 py-4">
        <div className="text-[13px] text-[#8A8F99] mb-3">{s.addr_tag}</div>
        <div className="flex flex-wrap gap-2">
          {ADDRESS_TAGS.map(t => (
            <button
              key={t}
              className={`px-4 py-1.5 rounded-full text-[13px] ${form.tag === t ? 'bg-[#FF6A00] text-white' : 'bg-[#F5F6F8] text-[#8A8F99]'}`}
              onClick={() => set('tag', t)}
            >
              {t}
            </button>
          ))}
        </div>
        <label className="mt-4 flex items-center text-[14px] text-[#1A1A1A]">
          <input
            type="checkbox"
            checked={form.isDefault}
            onChange={e => set('isDefault', e.target.checked)}
            className="mr-2"
          />
          {s.addr_default}
        </label>
      </div>

      {error && (
        <div className="px-4 py-2 text-center text-[13px] text-[#FF3B30]">请填写完整的地址信息</div>
      )}

      <div className="sticky bottom-0 px-4 py-3 bg-white border-t border-[#EEF0F2]">
        <button
          className="w-full h-[46px] rounded-[23px] bg-[#FF6A00] text-white text-[16px] font-medium active:bg-[#E55F00]"
          {...bindTap<HTMLButtonElement>(
            { kind: 'action', id: isEdit ? 'address.record.update' : 'address.record.save' },
            { onTrigger: handleSave },
          )}
        >
          {s.addr_save}
        </button>
      </div>
    </div>
  );
};

const Field: React.FC<{ label: string; value: string; onChange: (v: string) => void }> = ({ label, value, onChange }) => (
  <div className="flex items-center py-2 border-b border-[#F5F6F8] last:border-b-0">
    <span className="w-20 text-[13px] text-[#8A8F99]">{label}</span>
    <input
      value={value}
      onChange={e => onChange(e.target.value)}
      className="flex-1 text-[14px] text-[#1A1A1A] outline-none bg-transparent"
      data-keep-keyboard="true"
    />
  </div>
);
