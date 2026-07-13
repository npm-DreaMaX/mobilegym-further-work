import React from 'react';
import { useAppStrings } from '../../../os/useAppStrings';
import { strings } from '../res/strings';
import { stringsEn } from '../res/strings.en';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  children?: React.ReactNode;
  /** 取消回调（关闭弹窗） */
  onCancel: () => void;
  /** 确认按钮渲染（由调用方提供 data-action 绑定） */
  confirmSlot: React.ReactNode;
  /** 取消/确认文案 */
  cancelText?: string;
  confirmText?: string;
  /** 确认按钮是否危险色 */
  danger?: boolean;
}

/** 通用确认弹窗：取消按钮关闭，确认按钮由调用方提供（带 data-action 绑定）。 */
export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  open, title, children, onCancel, confirmSlot, cancelText, confirmText, danger,
}) => {
  const s = useAppStrings(strings, stringsEn);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onCancel}>
      <div className="bg-white rounded-xl w-[300px] overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="px-5 pt-5 pb-3 text-center">
          <div className="text-[16px] font-medium text-[#1A1A1A]">{title}</div>
          {children ? <div className="mt-2 text-[13px] text-[#8A8F99]">{children}</div> : null}
        </div>
        <div className="flex border-t border-[#EEF0F2]">
          <button
            className="flex-1 py-3 text-[15px] text-[#8A8F99] active:bg-[#F5F6F8]"
            onClick={onCancel}
          >
            {cancelText ?? s.common_cancel}
          </button>
          <div className={`flex-1 border-l border-[#EEF0F2] ${danger ? 'active:bg-[#FFF4F3]' : 'active:bg-[#F5F6F8]'}`}>
            {confirmSlot}
          </div>
        </div>
      </div>
    </div>
  );
};

interface ConfirmButtonProps {
  /** 弹窗内确认按钮的 data-action 绑定 props */
  actionProps: Record<string, unknown>;
  text?: string;
  danger?: boolean;
}

/** 弹窗内的确认按钮：渲染成全宽可点击按钮，沿用调用方传入的 data-action 属性。 */
export const ConfirmButton: React.FC<ConfirmButtonProps> = ({ actionProps, text, danger }) => {
  const s = useAppStrings(strings, stringsEn);
  return (
    <button
      {...(actionProps as any)}
      className={`w-full h-full py-3 text-[15px] ${danger ? 'text-[#FF3B30]' : 'text-[#0066B3]'}`}
    >
      {text ?? s.common_confirm}
    </button>
  );
};
