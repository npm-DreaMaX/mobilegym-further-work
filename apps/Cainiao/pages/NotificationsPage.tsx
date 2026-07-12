import React from 'react';
import { useCainiaoStore } from '../state';
import { useCainiaoGestures } from '../hooks/useCainiaoGestures';
import { useAppStrings } from '../../../os/useAppStrings';
import { strings } from '../res/strings';
import { stringsEn } from '../res/strings.en';
import { SubPageHeader } from '../components/SubPageHeader';
import { IcBell, IcChevronRight } from '../res/icons';
import { formatEventTime } from '../utils/format';

export const NotificationsPage: React.FC = () => {
  const { bindTap } = useCainiaoGestures();
  const s = useAppStrings(strings, stringsEn);
  const notifications = useCainiaoStore(st => st.notifications);
  const markRead = useCainiaoStore(st => st.markNotificationRead);
  const archive = useCainiaoStore(st => st.archiveNotification);

  // 未读在前，已归档不展示
  const visible = notifications.filter(n => !n.archived).sort((a, b) => (a.read ? 1 : 0) - (b.read ? 1 : 0) || b.time - a.time);

  return (
    <div className="min-h-full bg-[#F5F6F8]">
      <SubPageHeader title={s.notif_title} />
      {visible.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-[#8A8F99]">
          <IcBell size={48} className="text-[#C9CDD4]" />
          <span className="mt-2 text-[14px]">{s.notif_empty}</span>
        </div>
      ) : (
        <div className="px-3 py-3 space-y-2">
          {visible.map(n => (
            <div key={n.id} className={`bg-white rounded-xl p-4 ${!n.read ? 'border-l-2 border-[#FF6A00]' : ''}`}>
              <button
                className="w-full text-left"
                {...bindTap<HTMLButtonElement>('notification.open', { params: { id: n.id } })}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[15px] font-medium text-[#1A1A1A]">{n.title}</span>
                  {!n.read && <span className="text-[11px] px-1.5 py-0.5 rounded bg-[#FFF4EC] text-[#FF6A00]">{s.notif_unread}</span>}
                </div>
                <div className="mt-1 text-[13px] text-[#8A8F99] line-clamp-2">{n.body}</div>
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-[12px] text-[#B0B4BC]">{formatEventTime(n.time)}</span>
                  <IcChevronRight size={16} className="text-[#C9CDD4]" />
                </div>
              </button>
              <div className="mt-2 pt-2 border-t border-[#F5F6F8] flex items-center justify-end gap-4">
                {!n.read && (
                  <button
                    className="text-[12px] text-[#8A8F99]"
                    {...bindTap<HTMLButtonElement>(
                      { kind: 'action', id: 'notification.item.markRead' },
                      { params: { notificationId: n.id }, onTrigger: () => markRead(n.id) },
                    )}
                  >
                    {s.notif_mark_read}
                  </button>
                )}
                <button
                  className="text-[12px] text-[#8A8F99]"
                  {...bindTap<HTMLButtonElement>(
                    { kind: 'action', id: 'notification.item.archive' },
                    { params: { notificationId: n.id }, onTrigger: () => archive(n.id) },
                  )}
                >
                  {s.notif_archive}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
