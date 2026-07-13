import React from 'react';
import { useParams } from 'react-router-dom';
import { IcNavBack, IcTruck, IcPackage } from '../res/icons';
import { useTaobaoGestures } from '../navigation';
import { useTaobaoStrings } from '../hooks/useTaobaoStrings';
import { useTaobaoStore } from '../state';
import * as TimeService from '../../../os/TimeService';
import type { Logistics, LogisticsEvent } from '../types';

const STATUS_LABEL: Record<string, string> = {
  in_transit: '运输中',
  out_for_delivery: '派送中',
  delivered: '已签收',
};

const STATUS_COLOR: Record<string, string> = {
  in_transit: '#3B8BFF',
  out_for_delivery: '#FF6A00',
  delivered: '#26C261',
};

function formatTime(ts: number): string {
  const d = TimeService.fromTimestamp(ts);
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const h = String(d.getHours()).padStart(2, '0');
  const min = String(d.getMinutes()).padStart(2, '0');
  return `${m}-${day} ${h}:${min}`;
}

function formatDate(ts: number): string {
  const d = TimeService.fromTimestamp(ts);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

const LogisticsPage: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const { bindBack } = useTaobaoGestures();
  const s = useTaobaoStrings();

  const logistics = useTaobaoStore((st) =>
    orderId ? (Object.values(st.logistics).find((l: Logistics) => l.orderId === orderId) as Logistics | undefined) : undefined,
  );

  if (!logistics || !orderId) {
    return (
      <div className="h-full flex flex-col bg-gray-50 pt-10" data-status-bar-foreground="dark">
        <div className="flex items-center px-3 pb-3">
          <button type="button" {...bindBack()} className="p-1 -ml-1">
            <IcNavBack size={22} className="text-gray-800" />
          </button>
          <span className="text-[17px] font-bold text-gray-900 ml-2">{s.logistics_title}</span>
        </div>
        <div className="flex-1 flex items-center justify-center text-[13px] text-gray-400">
          暂无物流信息
        </div>
      </div>
    );
  }

  const sortedEvents = [...logistics.events].sort((a: LogisticsEvent, b: LogisticsEvent) => b.time - a.time);

  return (
    <div className="h-full flex flex-col bg-gray-50" data-status-bar-foreground="dark">
      {/* Header */}
      <div className="flex-shrink-0 bg-white pt-10 px-3 pb-3 border-b border-gray-100 flex items-center gap-3">
        <button type="button" {...bindBack()} className="p-1 -ml-1">
          <IcNavBack size={22} className="text-gray-800" />
        </button>
        <span className="text-[17px] font-bold text-gray-900">{s.logistics_title}</span>
      </div>

      <div
        className="flex-1 overflow-y-auto"
        data-scroll-container="main"
        data-scroll-direction="vertical"
      >
        {/* Status card */}
        <div className="bg-white mx-3 mt-3 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{ backgroundColor: STATUS_COLOR[logistics.status] + '20' }}
            >
              <IcTruck size={20} style={{ color: STATUS_COLOR[logistics.status] }} />
            </div>
            <div>
              <p
                className="text-[15px] font-bold"
                style={{ color: STATUS_COLOR[logistics.status] }}
              >
                {STATUS_LABEL[logistics.status]}
              </p>
              {sortedEvents[0] && (
                <p className="text-[12px] text-gray-500 mt-0.5">{sortedEvents[0].description}</p>
              )}
            </div>
          </div>
        </div>

        {/* Carrier info */}
        <div className="bg-white mx-3 mt-2 rounded-lg p-4">
          <div className="flex items-center gap-2 text-[13px] text-gray-700">
            <IcPackage size={16} className="text-gray-400" />
            <span className="text-gray-500">{s.logistics_carrier}:</span>
            <span className="font-medium">{logistics.carrier}</span>
          </div>
          <div className="flex items-center gap-2 text-[13px] text-gray-700 mt-2">
            <span className="text-gray-500">{s.logistics_tracking_no}:</span>
            <span className="font-medium">{logistics.trackingNumber}</span>
          </div>
          <div className="flex items-center gap-2 text-[13px] text-gray-700 mt-2">
            <span className="text-gray-500">{s.logistics_estimated}:</span>
            <span className="font-medium">{formatDate(logistics.estimatedDelivery)}</span>
          </div>
        </div>

        {/* Timeline */}
        <div className="bg-white mx-3 mt-2 rounded-lg p-4 mb-4">
          <p className="text-[14px] font-semibold text-gray-800 mb-4">{s.logistics_latest}</p>
          <div className="relative pl-6">
            <div className="absolute left-[11px] top-2 bottom-2 w-[2px] bg-gray-200" />
            {sortedEvents.map((event: LogisticsEvent, idx: number) => {
              const isLatest = idx === 0;
              return (
                <div key={idx} className="relative pb-5 last:pb-0">
                  <div
                    className={`absolute left-[-13px] top-[2px] w-[26px] h-[26px] rounded-full border-2 flex items-center justify-center ${
                      isLatest
                        ? 'border-[#FF6A00] bg-[#FF6A00]'
                        : 'border-gray-300 bg-white'
                    }`}
                  >
                    {isLatest && (
                      <div className="w-[8px] h-[8px] bg-white rounded-full" />
                    )}
                  </div>
                  <p
                    className={`text-[13px] ${isLatest ? 'font-semibold text-gray-900' : 'text-gray-600'}`}
                  >
                    {event.description}
                  </p>
                  <p className="text-[11px] text-gray-400 mt-0.5">
                    {formatTime(event.time)} | {event.location}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LogisticsPage;
