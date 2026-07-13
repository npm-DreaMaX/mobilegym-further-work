import { useCallback } from 'react';
import { useSearchParams, useNavigate, useParams } from 'react-router-dom';
import type { TransitionId } from './navigation.declaration';

export interface GoOptions {
  mode?: 'push' | 'replace';
  params?: Record<string, string>;
}

export function useAppNavigate() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const routeParams = useParams();

  const go = useCallback(
    (id: TransitionId, options?: GoOptions) => {
      const mode = options?.mode ?? 'push';
      const extraParams = options?.params ?? {};

      // Map transition IDs to routes
      const routeMap: Record<string, { path: string; replace?: boolean }> = {
        'tab.home': { path: '/', replace: true },
        'tab.starred': { path: '/starred', replace: true },
        'tab.shared': { path: '/shared', replace: true },
        'tab.files': { path: '/files', replace: true },
        'home.myDrive.open': { path: '/files' },
        'home.computers.open': { path: '/computers' },
        'home.sharedWithMe.open': { path: '/shared' },
        'home.recent.open': { path: '/recent' },
        'home.starred.open': { path: '/starred' },
        'home.trash.open': { path: '/trash' },
        'home.search.open': { path: '/search' },
        'search.search.open': { path: '/search' },
      };

      // Dynamic routes
      if (id === 'folder.open' && extraParams.folderId) {
        navigate(`/folder/${extraParams.folderId}`, { replace: mode === 'replace' });
        return;
      }
      if (id === 'file.detail.open' && extraParams.fileId) {
        navigate(`/file/${extraParams.fileId}`, { replace: mode === 'replace' });
        return;
      }
      if (id === 'detail.manageAccess.open') {
        const sp = new URLSearchParams(searchParams);
        const fileId = extraParams.fileId || routeParams.fileId || '';
        navigate(`/file/${fileId}/access`, { replace: mode === 'replace' });
        return;
      }
      if (id === 'newMenu.folder.open') {
        setSearchParams(p => { p.set('newFolder', 'open'); return p; });
        return;
      }

      const mapped = routeMap[id];
      if (mapped) {
        navigate(mapped.path, { replace: mapped.replace || mode === 'replace' });
      }
    },
    [navigate, searchParams, setSearchParams, routeParams],
  );

  const back = useCallback(
    (n: number = 1) => {
      navigate(-n);
    },
    [navigate],
  );

  const openDialog = useCallback(
    (dialogKey: string) => {
      setSearchParams(p => { p.set(dialogKey, 'open'); return p; });
    },
    [setSearchParams],
  );

  const closeDialog = useCallback(
    (dialogKey: string) => {
      setSearchParams(p => { p.delete(dialogKey); return p; });
    },
    [setSearchParams],
  );

  return { go, back, openDialog, closeDialog, searchParams };
}
