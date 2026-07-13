import { fromTimestamp } from '../../../os/TimeService';

/** 格式化时间戳为「MM-DD HH:mm」 */
export function formatTxnTime(ts: number): string {
  const d = fromTimestamp(ts);
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  const hh = String(d.getHours()).padStart(2, '0');
  const mi = String(d.getMinutes()).padStart(2, '0');
  return `${mm}-${dd} ${hh}:${mi}`;
}

/** 格式化金额：保留两位小数 */
export function formatYuan(n: number): string {
  return (Math.round(n * 100) / 100).toFixed(2);
}
