import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useCainiaoStore } from '../state';
import { useCainiaoGestures } from '../hooks/useCainiaoGestures';
import { useAppStrings } from '../../../os/useAppStrings';
import { strings } from '../res/strings';
import { stringsEn } from '../res/strings.en';
import { SubPageHeader } from '../components/SubPageHeader';
import { IcTruck, IcStation, IcPackageCheck, IcClock, IcMapPin } from '../res/icons';
import { formatEventTime } from '../utils/format';

export const PackageDetailPage: React.FC = () => {
  const { id = '' } = useParams<{ id: string }>();
  const { bindTap } = useCainiaoGestures();
  const s = useAppStrings(strings, stringsEn);
  const pkg = useCainiaoStore(st => st.packages.find(p => p.id === id));
  const markPickedUp = useCainiaoStore(st => st.markPackagePickedUp);
  const viewPackage = useCainiaoStore(st => st.viewPackage);

  // 记录浏览态（易失，仅 benchmark 判定"是否打开正确包裹"用）
  useEffect(() => {
    if (id) viewPackage(id);
  }, [id, viewPackage]);

  if (!pkg) {
    return (
      <div className="min-h-full bg-[#F5F6F8]">
        <SubPageHeader title={s.detail_title} />
        <div className="text-center text-[14px] text-[#8A8F99] py-20">未找到该包裹</div>
      </div>
    );
  }

  const isArrived = pkg.status === 'arrived_station';
  const alreadyPicked = pkg.status === 'picked_up' || pkg.status === 'delivered';
  const latest = pkg.events[0];

  return (
    <div className="min-h-full bg-[#F5F6F8]">
      <SubPageHeader title={s.detail_title} />

      {/* 状态卡 */}
      <div className="bg-[#FF6A00] px-4 py-5 text-white">
        <div className="flex items-center gap-2">
          {isArrived ? <IcStation size={22} /> : alreadyPicked ? <IcPackageCheck size={22} /> : <IcTruck size={22} />}
          <span className="text-[18px] font-semibold">{pkg.statusLabel}</span>
        </div>
        {pkg.eta && !alreadyPicked && (
          <div className="mt-1 text-[13px] text-white/90">{s.detail_eta}：{pkg.eta}</div>
        )}
        {latest && (
          <div className="mt-3 text-[13px] text-white/90">
            {s.detail_latest_node}：{latest.description}
          </div>
        )}
        {isArrived && pkg.pickupCode && (
          <div className="mt-3 inline-flex items-center gap-3 bg-white/15 rounded-lg px-3 py-2">
            <span className="text-[13px]">{s.detail_pickup_code}</span>
            <span className="text-[20px] font-semibold tracking-wider">{pkg.pickupCode}</span>
          </div>
        )}
      </div>

      {/* 取件信息（驿站） */}
      {pkg.station && (
        <div className="mt-2 bg-white px-4 py-4">
          <div className="text-[14px] font-medium text-[#1A1A1A] mb-3">{s.detail_station}</div>
          <div className="space-y-2 text-[13px] text-[#1A1A1A]">
            <div className="flex items-start gap-2">
              <IcStation size={16} className="text-[#8A8F99] mt-0.5" />
              <span>{s.detail_station_name}：{pkg.station.name}</span>
            </div>
            <div className="flex items-start gap-2">
              <IcMapPin size={16} className="text-[#8A8F99] mt-0.5" />
              <span>{s.detail_station_addr}：{pkg.station.address}</span>
            </div>
            <div className="flex items-start gap-2">
              <IcClock size={16} className="text-[#8A8F99] mt-0.5" />
              <span>{s.detail_station_hours}：{pkg.station.businessHours}</span>
            </div>
          </div>
        </div>
      )}

      {/* 收发地址 */}
      <div className="mt-2 bg-white px-4 py-4">
        <div className="text-[14px] font-medium text-[#1A1A1A] mb-3">{s.detail_route}</div>
        <div className="flex items-center justify-between text-[13px]">
          <div className="flex-1">
            <div className="text-[#8A8F99] text-[12px]">{s.detail_from}</div>
            <div className="text-[#1A1A1A] mt-1">{pkg.fromCity}</div>
            <div className="text-[#8A8F99] text-[12px] mt-0.5">{pkg.sender.name} {pkg.sender.phone}</div>
          </div>
          <IcTruck size={20} className="text-[#FF6A00] mx-3" />
          <div className="flex-1 text-right">
            <div className="text-[#8A8F99] text-[12px]">{s.detail_to}</div>
            <div className="text-[#1A1A1A] mt-1">{pkg.toCity}</div>
            <div className="text-[#8A8F99] text-[12px] mt-0.5">{pkg.recipient.name} {pkg.recipient.phone}</div>
          </div>
        </div>
        <div className="mt-3 pt-3 border-t border-[#EEF0F2] text-[13px] text-[#8A8F99] flex justify-between">
          <span>{s.detail_item}：{pkg.itemCategory}</span>
          <span>{s.detail_weight}：{pkg.weight}kg</span>
        </div>
      </div>

      {/* 物流时间线 */}
      <div className="mt-2 bg-white px-4 py-4">
        <div className="text-[14px] font-medium text-[#1A1A1A] mb-3">{s.detail_timeline}</div>
        <div className="relative pl-1">
          {pkg.events.map((e, i) => {
            const isLast = i === 0;
            return (
              <div key={i} className="flex gap-3 pb-4 last:pb-0 relative">
                <div className="flex flex-col items-center">
                  <span className={`mt-1 w-2.5 h-2.5 rounded-full ${isLast ? 'bg-[#FF6A00]' : 'bg-[#D8DCE2]'}`} />
                  {i < pkg.events.length - 1 && <span className="flex-1 w-px bg-[#EEF0F2] mt-1" />}
                </div>
                <div className="flex-1 -mt-0.5">
                  <div className="text-[13px] text-[#1A1A1A]">{e.description}</div>
                  <div className="text-[12px] text-[#B0B4BC] mt-0.5">{formatEventTime(e.time)} · {e.location}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 运单号 */}
      <div className="mt-2 bg-white px-4 py-3 text-[13px] text-[#8A8F99] flex justify-between">
        <span>{s.detail_tracking_no}</span>
        <span className="text-[#1A1A1A]">{pkg.trackingNo}</span>
      </div>
      <div className="mt-2 bg-white px-4 py-3 text-[13px] text-[#8A8F99] flex justify-between">
        <span>{s.detail_carrier}</span>
        <span className="text-[#1A1A1A]">{pkg.carrierName}</span>
      </div>

      {/* 确认取件按钮 */}
      {isArrived && (
        <div className="sticky bottom-0 px-4 py-3 bg-white border-t border-[#EEF0F2]">
          <button
            className="w-full h-[46px] rounded-[23px] bg-[#FF6A00] text-white text-[16px] font-medium active:bg-[#E55F00]"
            {...bindTap<HTMLButtonElement>(
              { kind: 'action', id: 'package.pickup.confirm' },
              { params: { packageId: pkg.id }, onTrigger: () => markPickedUp(pkg.id) },
            )}
          >
            {s.detail_confirm_pickup}
          </button>
        </div>
      )}
      {alreadyPicked && (
        <div className="px-4 py-6 text-center text-[14px] text-[#8A8F99]">{s.detail_picked}</div>
      )}
    </div>
  );
};
