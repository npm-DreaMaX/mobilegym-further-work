// Baicizhan App Types

export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced';

export type FamiliarityStatus = 'unknown' | 'learning' | 'familiar' | 'mastered';

export type ReviewStatus = 'pending' | 'reviewing' | 'reviewed';

export interface Word {
  id: string;
  spelling: string;
  phonetic: string;
  chineseMeaning: string;
  englishMeaning: string;
  exampleSentence: string;
  exampleTranslation: string;
  bookId: string;
  difficulty: DifficultyLevel;
  familiarity: FamiliarityStatus;
  isFavorite: boolean;
  studyCount: number;
  mistakeCount: number;
  reviewStatus: ReviewStatus;
  noteIds: string[];
  lastStudiedAt: number | null;
}

export interface WordBook {
  id: string;
  name: string;
  nameEn: string;
  description: string;
  descriptionEn: string;
  totalWords: number;
  learnedWords: number;
  isCurrent: boolean;
  difficulty: DifficultyLevel;
}

export interface StudyPlan {
  bookId: string;
  dailyGoal: number;
  reminderEnabled: boolean;
  reminderTime: string; // 'HH:mm' format
}

export interface StudyRecord {
  id: string;
  wordId: string;
  bookId: string;
  result: 'known' | 'unknown';
  timestamp: number;
  sessionId: string;
}

export interface StudySession {
  id: string;
  bookId: string;
  startedAt: number;
  completedAt: number | null;
  totalWords: number;
  completedWords: number;
  knownCount: number;
  unknownCount: number;
  isCompleted: boolean;
}

export interface ReviewRecord {
  id: string;
  wordId: string;
  result: 'correct' | 'incorrect';
  timestamp: number;
  sessionId: string;
}

export interface ReviewSession {
  id: string;
  startedAt: number;
  completedAt: number | null;
  totalWords: number;
  completedWords: number;
  correctCount: number;
  incorrectCount: number;
  isCompleted: boolean;
}

export interface Note {
  id: string;
  wordId: string;
  content: string;
  createdAt: number;
  updatedAt: number;
}

export interface SpellingExercise {
  id: string;
  wordId: string;
  attempts: string[];
  isCorrect: boolean;
  isCompleted: boolean;
  startedAt: number;
  completedAt: number | null;
}

export interface ListeningExercise {
  id: string;
  wordId: string;
  played: boolean;
  selectedOption: string | null;
  isCorrect: boolean;
  isCompleted: boolean;
  startedAt: number;
  completedAt: number | null;
}

export interface DailyProgress {
  date: string; // 'YYYY-MM-DD'
  studiedCount: number;
  reviewedCount: number;
  goalCompleted: boolean;
}

export interface Statistics {
  totalStudyCount: number;
  totalMistakeCount: number;
  totalFavoriteCount: number;
  streakDays: number;
  lastStudyDate: string | null;
}

export interface SearchState {
  query: string;
  results: string[]; // word ids
  openedWordId: string | null;
  history: string[]; // recent queries
}

export interface BaicizhanSettings {
  themeId: 'light' | 'dark';
  fontSize: 'small' | 'medium' | 'large';
  autoPlayPronunciation: boolean;
}

export interface BaicizhanState {
  wordBooks: Record<string, WordBook>;
  words: Record<string, Word>;
  studyPlan: StudyPlan;
  todaySession: StudySession | null;
  studyRecords: StudyRecord[];
  reviewRecords: ReviewRecord[];
  reviewSessions: ReviewSession[];
  mistakeBook: string[]; // word ids
  favorites: string[]; // word ids
  notes: Record<string, Note>;
  spellingExercises: Record<string, SpellingExercise>;
  listeningExercises: Record<string, ListeningExercise>;
  dailyProgress: DailyProgress | null;
  statistics: Statistics;
  search: SearchState;
  settings: BaicizhanSettings;
  _temp: {
    currentStudyWordIndex: number;
    currentReviewWordIndex: number;
    studySessionWordIds: string[];
    reviewSessionWordIds: string[];
  };
}
