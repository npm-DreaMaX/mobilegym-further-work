import React, { useCallback } from 'react';
import { MemoryRouter, Routes, Route, useNavigate } from 'react-router-dom';
import { useAppNavigationHandler } from '../../os/hooks/useAppNavigationHandler';
import { manifest } from './manifest';
import HomePage from './pages/HomePage';
import MyDrivePage from './pages/MyDrivePage';
import FolderPage from './pages/FolderPage';
import FileDetailPage from './pages/FileDetailPage';
import FilePreviewPage from './pages/FilePreviewPage';
import ManageAccessPage from './pages/ManageAccessPage';
import StarredPage from './pages/StarredPage';
import SharedPage from './pages/SharedPage';
import RecentPage from './pages/RecentPage';
import ComputersPage from './pages/ComputersPage';
import TrashPage from './pages/TrashPage';
import SearchResultsPage from './pages/SearchResultsPage';

function AppInner() {
  const navigate = useNavigate();

  const handleBack = useCallback(() => {
    navigate(-1);
    return true;
  }, [navigate]);

  useAppNavigationHandler('googledrive', { onBack: handleBack });

  return (
    <div className="flex flex-col h-full bg-white dark:bg-[#1E1E1E]">
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/files" element={<MyDrivePage />} />
        <Route path="/folder/:folderId" element={<FolderPage />} />
        <Route path="/file/:fileId" element={<FileDetailPage />} />
        <Route path="/file/:fileId/preview" element={<FilePreviewPage />} />
        <Route path="/file/:fileId/access" element={<ManageAccessPage />} />
        <Route path="/starred" element={<StarredPage />} />
        <Route path="/shared" element={<SharedPage />} />
        <Route path="/recent" element={<RecentPage />} />
        <Route path="/computers" element={<ComputersPage />} />
        <Route path="/trash" element={<TrashPage />} />
        <Route path="/search" element={<SearchResultsPage />} />
      </Routes>
    </div>
  );
}

export default function GoogleDriveApp() {
  return (
    <MemoryRouter initialEntries={['/']}>
      <AppInner />
    </MemoryRouter>
  );
}
