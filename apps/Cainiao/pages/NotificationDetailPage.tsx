import React from 'react';
import { useParams } from 'react-router-dom';
import { useCainiaoStore } from '../state';
import { useCainiaoGestures } from '../hooks/useCainiaoGestures';
import { useAppStrings } from '../../../os/useAppStrings';
import { strings } from '../res/strings';
import { stringsEn } from '../res/strings.en';
import { SubPageHeader } from '../components/SubPageHeader';
import { formatEventTime } from '../utils/format';

export const NotificationDetailPage: React.FC = () => {
  const { id = '' } = useParams<{ id: string }>();
  const { bindTap } = useCainiaoGestures();
  const s = useAppStrings(strings, stringsEn);
  const notif = useCainiaoStore(st => st.notifications.find(n => n.id === id));
  const markRead = useCainiaoStore(st => st.markNotificationRead);

  if (!notif) {
    return (
      <div className="min-h-full bg-[#F5F6F8]">
        <SubPageHeader title={s.notif_title} />
        <div className="text-center text-[14px] text-[#8A8F99] py-20">未找到该消息</div>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-[#F5F6F8]">
      <SubPageHeader title={s.notif_title} />
      <div className="bg-white px-4 py-5">
        <div className="text-[17px] font-medium text-[#1A1A1A]">{notif.title}</div>
        <div className="mt-1 text-[12px] text-[#B0B4BC]">{formatEventTime(notif.time)}</div>
        <div className="mt-4 text-[14px] text-[#1A1A1A] leading-6">{notif.body}</div>
      </div>
      <div className="mt-2 bg-white px-4 py-4">
        {!notif.read ? (
          <button
            className="w-full h-[44px] rounded-[22px] border border-[#FF6A00] text-[#FF6A00] text-[15px]"
            {...bindTap<HTMLButtonElement>(
              { kind: 'action', id: 'notification.detail.markRead' },
              { params: { notificationId: notif.id }, onTrigger: () => markRead(notif.id) },
            )}
          >
            {s.ndetail_mark_read}
          </button>
        ) : (
          <div className="text-center text-[13px] text-[#B0B4BC]">已读</div>
        )}
      </div>
    </div>
  );
};
