import React from 'react';
import { useParams } from 'react-router-dom';
import { useCainiaoStore } from '../state';
import { useAppStrings } from '../../../os/useAppStrings';
import { strings } from '../res/strings';
import { stringsEn } from '../res/strings.en';
import { SubPageHeader } from '../components/SubPageHeader';
import { formatRelativeDay, formatEventTime, formatDate } from '../utils/format';
import type { SendRecord } from '../types';

function statusLabel(r: SendRecord, s: { records_pending: string; records_shipping: string; records_completed: string }): string {
  if (r.status === 'completed') return s.records_completed;
  if (r.status === 'shipping') return s.records_shipping;
  return s.records_pending;
}

const Row: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
  <div className="flex items-start py-2 border-b border-[#F5F6F8] last:border-b-0">
    <span className="w-24 text-[13px] text-[#8A8F99]">{label}</span>
    <span className="flex-1 text-[14px] text-[#1A1A1A]">{value}</span>
  </div>
);

export const SendRecordDetailPage: React.FC = () => {
  const { id = '' } = useParams<{ id: string }>();
  const s = useAppStrings(strings, stringsEn);
  const record = useCainiaoStore(st => st.sendRecords.find(r => r.id === id));

  if (!record) {
    return (
      <div className="min-h-full bg-[#F5F6F8]">
        <SubPageHeader title={s.srecord_title} />
        <div className="text-center text-[14px] text-[#8A8F99] py-20">未找到该订单</div>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-[#F5F6F8]">
      <SubPageHeader title={s.srecord_title} />

      <div className="bg-white px-4 py-4">
        <div className="flex items-center justify-between">
          <span className="text-[15px] font-medium text-[#1A1A1A]">{s.srecord_status}</span>
          <span className="text-[13px] text-[#FF6A00]">{statusLabel(record, s)}</span>
        </div>
        <div className="mt-2 text-[12px] text-[#B0B4BC]">
          {s.records_created}：{formatRelativeDay(record.createdAt)} {formatEventTime(record.createdAt).slice(6)}
        </div>
      </div>

      <div className="mt-2 bg-white px-4 py-2">
        <Row label="寄件人" value={`${record.sender.name} ${record.sender.phone}`} />
        <Row label="寄件地址" value={record.sender.address} />
        <Row label="收件人" value={`${record.receiver.name} ${record.receiver.phone}`} />
        <Row label="收件地址" value={record.receiver.address} />
      </div>

      <div className="mt-2 bg-white px-4 py-2">
        <Row label="快递公司" value={record.carrierName} />
        <Row label={s.sendc_service} value={record.serviceLabel} />
        <Row label={s.sendc_item} value={record.itemCategory} />
        <Row label={s.sendc_weight} value={`${record.weight}kg`} />
        <Row label={s.sendc_pickup_time} value={record.pickupTime} />
        {record.note ? <Row label={s.sendc_note} value={record.note} /> : null}
      </div>

      <div className="mt-2 bg-white px-4 py-4 flex items-center justify-between">
        <span className="text-[14px] text-[#1A1A1A]">{s.srecord_fee}</span>
        <span className="text-[20px] font-semibold text-[#FF6A00]">¥{record.fee.toFixed(2)}</span>
      </div>

      <div className="mt-2 bg-white px-4 py-3 text-[12px] text-[#B0B4BC]">
        订单编号 {record.id} · {formatDate(record.createdAt)}
      </div>
    </div>
  );
};
