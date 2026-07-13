import React from 'react';
import type { WalletCard } from '../types';
import { IcNavBack } from '../res/icons';

export type TapProps = React.HTMLAttributes<HTMLButtonElement> & { 'data-trigger'?: string; 'data-action'?: string };

export const PageShell: React.FC<{ children: React.ReactNode; status?: 'dark' | 'light' }> = ({ children, status = 'dark' }) => (
  <div className="min-h-full bg-[#F4F6FA] text-[#172033] pt-10" data-status-bar-foreground={status}>{children}</div>
);

export const Header: React.FC<{ title: string; backProps?: TapProps; right?: React.ReactNode }> = ({ title, backProps, right }) => (
  <div className="sticky top-0 z-20 flex min-h-14 items-center border-b border-[#E7EAF0] bg-white px-3">
    {backProps ? <button type="button" aria-label="back" className="flex min-h-11 min-w-11 items-center justify-center rounded-full active:bg-gray-100" {...backProps}><IcNavBack size={24} /></button> : <div className="w-11" />}
    <h1 className="flex-1 text-center text-[17px] font-semibold">{title}</h1>
    <div className="flex min-w-11 justify-end">{right}</div>
  </div>
);

export const SectionTitle: React.FC<{ children: React.ReactNode }> = ({ children }) => <h2 className="px-4 pb-2 pt-5 text-xs font-semibold uppercase tracking-wide text-[#687386]">{children}</h2>;

export const EmptyState: React.FC<{ text: string }> = ({ text }) => <div className="mx-4 rounded-2xl bg-white px-6 py-14 text-center text-sm text-[#758096]">{text}</div>;

export const PrimaryButton: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement>> = ({ className = '', type = 'button', ...props }) => <button type={type} data-keep-keyboard="true" className={`min-h-12 w-full rounded-xl bg-[#176BEB] px-4 font-semibold text-white active:bg-[#0F56C4] disabled:bg-gray-300 ${className}`} {...props} />;
export const SecondaryButton: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement>> = ({ className = '', type = 'button', ...props }) => <button type={type} data-keep-keyboard="true" className={`min-h-11 rounded-xl border border-[#D9DEE8] bg-white px-4 text-sm font-medium text-[#33405A] active:bg-gray-50 disabled:text-gray-300 ${className}`} {...props} />;

export const Field: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => <label className="block"><span className="mb-1.5 block text-sm font-medium text-[#3B465A]">{label}</span>{children}</label>;
export const inputClass = 'min-h-12 w-full rounded-xl border border-[#D8DEE9] bg-white px-3 text-[15px] outline-none focus:border-[#176BEB]';

export function maskCardNumber(card: WalletCard): string {
  const last4 = card.last4 ?? card.number?.slice(-4) ?? '0000';
  return `•••• •••• •••• ${last4}`;
}

export const CardRow: React.FC<{ card: WalletCard; onOpen: TapProps; defaultText: string; frozenText: string; typeText?: string }> = ({ card, onOpen, defaultText, frozenText, typeText }) => (
  <button type="button" className="block min-h-24 w-full rounded-2xl border border-[#E4E8F0] bg-white p-4 text-left shadow-sm active:scale-[0.99]" {...onOpen}>
    <div className="flex items-start justify-between gap-3"><div><div className="text-xs text-[#6B768A]">{card.issuer}</div><div className="mt-1 font-semibold">{card.name}</div></div><div className="flex flex-wrap justify-end gap-1">{card.isDefault && <span className="rounded-full bg-blue-50 px-2 py-1 text-[10px] font-semibold text-[#176BEB]">{defaultText}</span>}{card.frozen && <span className="rounded-full bg-gray-100 px-2 py-1 text-[10px] text-gray-600">{frozenText}</span>}</div></div>
    <div className="mt-3 flex items-center justify-between text-sm text-[#536078]"><span>{card.type === 'bank' ? maskCardNumber(card) : card.type === 'transit' ? `${card.city ?? ''} · ¥${card.balance.toFixed(2)}` : card.memberNumber}</span>{typeText && <span>{typeText}</span>}</div>
  </button>
);

export const InfoRow: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => <div className="flex min-h-12 items-center justify-between gap-4 border-b border-[#EDF0F5] py-3 last:border-0"><span className="text-sm text-[#748096]">{label}</span><span className="text-right text-sm font-medium text-[#263249]">{value}</span></div>;
