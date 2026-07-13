import React from 'react';
import { dimensToCssVars, themeToCssVars } from '../../os/utils/themeToCssVars';
import { applySkinToThemeColors } from '../../os/SkinService';
import { useDarkMode } from '../../os/hooks/useDarkMode';
import { manifest } from './manifest';
import { MemoryRouter, Routes, Route, Navigate } from 'react-router-dom';
import { BaicizhanNavigationHandler } from './components/BaicizhanNavigationHandler';
import HomePage from './pages/HomePage';
import MePage from './pages/MePage';
import SearchPage from './pages/SearchPage';
import WordDetailPage from './pages/WordDetailPage';
import WordBooksPage from './pages/WordBooksPage';
import WordBookDetailPage from './pages/WordBookDetailPage';
import StudySessionPage from './pages/StudySessionPage';
import FavoritesPage from './pages/FavoritesPage';
import MistakeBookPage from './pages/MistakeBookPage';
import ReviewSessionPage from './pages/ReviewSessionPage';
import SpellingExercisePage from './pages/SpellingExercisePage';
import ListeningExercisePage from './pages/ListeningExercisePage';
import DailyProgressPage from './pages/DailyProgressPage';
import StatisticsPage from './pages/StatisticsPage';
import StudyPlanPage from './pages/StudyPlanPage';
import SettingsPage from './pages/SettingsPage';
import ReminderPage from './pages/ReminderPage';

export const BaicizhanApp: React.FC = () => {
  const { isDark } = useDarkMode();
  const themeColors = isDark
    ? { ...manifest.theme.colors, ...(manifest.theme.colorsDark ?? {}) }
    : manifest.theme.colors;
  const cssVars = {
    ...themeToCssVars(applySkinToThemeColors(themeColors)),
  };
  return (
    <div className="h-full w-full" style={cssVars as React.CSSProperties}>
      <MemoryRouter initialEntries={['/']}>
        <BaicizhanNavigationHandler />
        <div className="h-full w-full" data-baicizhan-root>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/me" element={<MePage />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/word/:wordId" element={<WordDetailPage />} />
            <Route path="/wordbooks" element={<WordBooksPage />} />
            <Route path="/wordbooks/:bookId" element={<WordBookDetailPage />} />
            <Route path="/study" element={<StudySessionPage />} />
            <Route path="/favorites" element={<FavoritesPage />} />
            <Route path="/mistakes" element={<MistakeBookPage />} />
            <Route path="/review-session" element={<ReviewSessionPage />} />
            <Route path="/spelling/:wordId" element={<SpellingExercisePage />} />
            <Route path="/listening/:wordId" element={<ListeningExercisePage />} />
            <Route path="/progress" element={<DailyProgressPage />} />
            <Route path="/statistics" element={<StatisticsPage />} />
            <Route path="/plan" element={<StudyPlanPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/settings/reminder" element={<ReminderPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </MemoryRouter>
    </div>
  );
};

export default BaicizhanApp;
