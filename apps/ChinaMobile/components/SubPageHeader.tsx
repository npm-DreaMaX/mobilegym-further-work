import React from 'react';
import { IcBack } from '../res/icons';
import { useChinaMobileGestures } from '../hooks/useChinaMobileGestures';

interface SubPageHeaderProps {
  title: string;
  /** 头部背景色，默认主色蓝 */
  variant?: 'primary' | 'light';
  /** 右侧可选自定义内容 */
  right?: React.ReactNode;
}

export const SubPageHeader: React.FC<SubPageHeaderProps> = ({ title, variant = 'primary', right }) => {
  const { bindBack } = useChinaMobileGestures();
  const isPrimary = variant === 'primary';
  return (
    <div
      className={`pt-10 pb-3 px-4 flex items-center relative sticky top-0 z-20 ${isPrimary ? 'bg-[#0066B3]' : 'bg-[#FFFFFF] border-b border-[#EEF0F2]'}`}
      data-status-bar-foreground="light"
    >
      <button className="absolute left-3 top-10 pt-1" {...bindBack<HTMLButtonElement>()}>
        <IcBack size={24} className={isPrimary ? 'text-white' : 'text-[#1A1A1A]'} />
      </button>
      <span className={`flex-1 min-w-0 px-2 text-center text-[17px] font-medium leading-tight ${isPrimary ? 'text-white' : 'text-[#1A1A1A]'}`}>
        {title}
      </span>
      {right ? <div className="absolute right-3 top-10 pt-1">{right}</div> : null}
    </div>
  );
};
