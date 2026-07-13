import React from 'react';
import { ICON_REGISTRY } from '../res/icons';

interface IconRendererProps {
  name: string;
  size?: number;
  className?: string;
}

/** 数据驱动图标渲染（name 必须是 Ic* 别名） */
export const IconRenderer: React.FC<IconRendererProps> = ({ name, size = 22, className }) => {
  const Icon = ICON_REGISTRY[name] as React.ComponentType<{ size?: number; className?: string }>;
  if (!Icon) return null;
  return <Icon size={size} className={className} />;
};
