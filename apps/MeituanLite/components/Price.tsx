import React from 'react';

/** 格式化价格：整数显示无小数，非整数保留一位 */
export function formatPrice(value: number): string {
  if (!Number.isFinite(value)) return '0';
  return Number.isInteger(value) ? String(value) : value.toFixed(1);
}

interface PriceProps {
  value: number;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  muted?: boolean; // 划线原价样式
}

const SIZE_MAP = {
  sm: { symbol: 'text-[10px]', int: 'text-xs' },
  md: { symbol: 'text-xs', int: 'text-sm' },
  lg: { symbol: 'text-sm', int: 'text-lg' },
  xl: { symbol: 'text-base', int: 'text-2xl' },
};

/** 红色强调价格组件：¥ 符号小，数字大 */
const Price: React.FC<PriceProps> = ({ value, size = 'md', className = '', muted }) => {
  const s = SIZE_MAP[size];
  const color = muted ? 'text-gray-400 line-through' : 'text-[#FF5339]';
  return (
    <span className={`inline-flex items-baseline font-semibold ${color} ${className}`}>
      <span className={s.symbol}>¥</span>
      <span className={s.int}>{formatPrice(value)}</span>
    </span>
  );
};

export default Price;
