import React from 'react';
import { Book, RefreshCw, User, Search, Heart, AlertTriangle, Edit3, Volume2, BarChart3, Settings, Bell, Library, Play, ChevronLeft } from 'lucide-react';

export const IcBook: React.FC<{ size?: number; className?: string }> = (props) => <Book {...props} />;
export const IcRefresh: React.FC<{ size?: number; className?: string }> = (props) => <RefreshCw {...props} />;
export const IcUser: React.FC<{ size?: number; className?: string }> = (props) => <User {...props} />;
export const IcSearch: React.FC<{ size?: number; className?: string }> = (props) => <Search {...props} />;
export const IcHeart: React.FC<{ size?: number; className?: string }> = (props) => <Heart {...props} />;
export const IcAlertTriangle: React.FC<{ size?: number; className?: string }> = (props) => <AlertTriangle {...props} />;
export const IcEdit3: React.FC<{ size?: number; className?: string }> = (props) => <Edit3 {...props} />;
export const IcVolume2: React.FC<{ size?: number; className?: string }> = (props) => <Volume2 {...props} />;
export const IcBarChart3: React.FC<{ size?: number; className?: string }> = (props) => <BarChart3 {...props} />;
export const IcSettings: React.FC<{ size?: number; className?: string }> = (props) => <Settings {...props} />;
export const IcBell: React.FC<{ size?: number; className?: string }> = (props) => <Bell {...props} />;
export const IcLibrary: React.FC<{ size?: number; className?: string }> = (props) => <Library {...props} />;
export const IcPlay: React.FC<{ size?: number; className?: string }> = (props) => <Play {...props} />;
export const IcChevronLeft: React.FC<{ size?: number; className?: string }> = (props) => <ChevronLeft {...props} />;

// Launcher icon
export const IcLauncher: React.FC<{ size?: number; className?: string }> = ({ size = 48, className }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none" className={className}>
    <rect width="48" height="48" rx="12" fill="#4F46E5" />
    <text x="24" y="30" textAnchor="middle" fill="white" fontSize="20" fontWeight="bold">B</text>
  </svg>
);

export const ICON_REGISTRY: Record<string, React.FC<{ size?: number; className?: string }>> = {
  IcBook,
  IcRefresh,
  IcUser,
  IcSearch,
  IcHeart,
  IcAlertTriangle,
  IcEdit3,
  IcVolume2,
  IcBarChart3,
  IcSettings,
  IcBell,
  IcLibrary,
  IcPlay,
  IcChevronLeft,
  IcLauncher,
};
