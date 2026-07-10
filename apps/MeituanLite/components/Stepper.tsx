import React from 'react';
import { IcMinus, IcPlus } from '../res/icons';

interface StepperProps {
  qty: number;
  onDecrease: () => void;
  onIncrease: () => void;
  size?: 'sm' | 'md';
}

/** 数量增减步进器。qty=0 时只显示加号按钮。 */
const Stepper: React.FC<StepperProps> = ({ qty, onDecrease, onIncrease, size = 'md' }) => {
  const dim = size === 'sm' ? { btn: 'w-4 h-4', icon: 12 } : { btn: 'w-5 h-5', icon: 14 };
  if (qty <= 0) {
    return (
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onIncrease();
        }}
        className={`w-5 h-5 rounded-full bg-[#FFC300] flex items-center justify-center text-white shadow-sm active:scale-95 transition-transform`}
        aria-label="add"
      >
        <IcPlus size={16} strokeWidth={3} />
      </button>
    );
  }
  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onDecrease();
        }}
        className={`${dim.btn} rounded-full border border-[#FFC300] bg-white flex items-center justify-center text-[#FFC300] active:scale-95 transition-transform`}
        aria-label="decrease"
      >
        <IcMinus size={dim.icon} strokeWidth={3} />
      </button>
      <span className="min-w-[16px] text-center text-sm font-semibold text-gray-800">{qty}</span>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onIncrease();
        }}
        className={`${dim.btn} rounded-full bg-[#FFC300] flex items-center justify-center text-white shadow-sm active:scale-95 transition-transform`}
        aria-label="increase"
      >
        <IcPlus size={dim.icon} strokeWidth={3} />
      </button>
    </div>
  );
};

export default Stepper;
