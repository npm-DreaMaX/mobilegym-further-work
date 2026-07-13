import type { DifficultyLevel } from './types';

export const TABS = [
  { id: 'home', route: '/', label: '学习', labelEn: 'Learn', icon: 'IcBook' },
  { id: 'review', route: '/review', label: '复习', labelEn: 'Review', icon: 'IcRefresh' },
  { id: 'profile', route: '/me', label: '我的', labelEn: 'Me', icon: 'IcUser' },
] as const;

export const DIFFICULTY_LABELS: Record<DifficultyLevel, string> = {
  beginner: '基础',
  intermediate: '中级',
  advanced: '高级',
};

export const FAMILIARITY_LABELS: Record<string, string> = {
  unknown: '未学',
  learning: '学习中',
  familiar: '已认识',
  mastered: '已掌握',
};

export const WORD_BOOK_CATALOG = [
  {
    id: 'cet4',
    name: '大学英语四级',
    nameEn: 'CET-4',
    description: '大学英语四级核心词汇',
    descriptionEn: 'Core vocabulary for CET-4',
    difficulty: 'intermediate' as DifficultyLevel,
  },
  {
    id: 'cet6',
    name: '大学英语六级',
    nameEn: 'CET-6',
    description: '大学英语六级核心词汇',
    descriptionEn: 'Core vocabulary for CET-6',
    difficulty: 'advanced' as DifficultyLevel,
  },
  {
    id: 'basic',
    name: '基础词汇',
    nameEn: 'Basic Vocabulary',
    description: '日常基础英语词汇',
    descriptionEn: 'Essential daily English vocabulary',
    difficulty: 'beginner' as DifficultyLevel,
  },
  {
    id: 'travel',
    name: '旅行英语',
    nameEn: 'Travel English',
    description: '出国旅行常用词汇',
    descriptionEn: 'Common travel vocabulary',
    difficulty: 'beginner' as DifficultyLevel,
  },
  {
    id: 'business',
    name: '商务英语',
    nameEn: 'Business English',
    description: '职场商务英语词汇',
    descriptionEn: 'Workplace business English vocabulary',
    difficulty: 'advanced' as DifficultyLevel,
  },
] as const;

export const DAILY_GOAL_OPTIONS = [10, 20, 30, 50, 100];

export const REMINDER_TIME_OPTIONS = [
  '08:00', '08:30', '09:00', '10:00',
  '12:00', '14:00', '16:00', '18:00',
  '19:00', '20:00', '21:00', '22:00',
];
