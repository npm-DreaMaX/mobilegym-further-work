import React from 'react';
import { ICON_REGISTRY, IcPackage } from '../res/icons';

interface IconRendererProps extends React.ComponentProps<typeof IcPackage> {
  name: string;
}

export const IconRenderer: React.FC<IconRendererProps> = ({ name, ...props }) => {
  const IconComponent = ICON_REGISTRY[name];
  if (!IconComponent) {
    return null;
  }
  return <IconComponent {...props} />;
};
