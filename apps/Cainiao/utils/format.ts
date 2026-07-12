import { fromTimestamp, fromLocalParts, getDate } from '../../../os/TimeService';

/** 格式化物流事件时间：MM-DD HH:mm */
export function formatEventTime(ts: number): string {
  const d = fromTimestamp(ts);
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  const hh = String(d.getHours()).padStart(2, '0');
  const mi = String(d.getMinutes()).padStart(2, '0');
  return `${mm}-${dd} ${hh}:${mi}`;
}

/** 格式化日期：YYYY-MM-DD */
export function formatDate(ts: number): string {
  const d = fromTimestamp(ts);
  const y = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${y}-${mm}-${dd}`;
}

function startOfDayTimestamp(ts: number): number {
  const d = fromTimestamp(ts);
  return fromLocalParts(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0).getTime();
}

/** 相对天数描述（今天/昨天/前天/MM-DD） */
export function formatRelativeDay(ts: number): string {
  const today = getDate();
  const diff = Math.round(
    (startOfDayTimestamp(today.getTime()) - startOfDayTimestamp(ts)) / 86400000,
  );
  if (diff === 0) return '今天';
  if (diff === 1) return '昨天';
  if (diff === 2) return '前天';
  const d = fromTimestamp(ts);
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${mm}-${dd}`;
}
