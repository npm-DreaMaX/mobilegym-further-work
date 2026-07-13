import { useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { NAVIGATION_DECLARATION } from './navigation.declaration';
import type { TransitionDeclaration } from './navigation.types';

export function usePlayStoreNavigate() {
  const navigate = useNavigate();
  const location = useLocation();

  const go = useCallback(
    (id: string, params: Record<string, string | number> = {}, options?: { mode?: 'push' | 'replace' }) => {
      const t = NAVIGATION_DECLARATION.transitions?.find(
        (transition) => transition.id === id,
      ) as TransitionDeclaration | undefined;

      if (!t) {
        throw new Error(`Transition not found: ${id}`);
      }

      let targetPathname = t.to;

      // Replace path params like :appId, :categoryId with actual values
      for (const [key, value] of Object.entries(params)) {
        targetPathname = targetPathname.replace(`:${key}`, String(value));
      }

      // Build search string if needed
      const searchStr = t.search && Object.keys(t.search).length > 0
        ? '?' + new URLSearchParams(
            Object.fromEntries(
              Object.entries(t.search).map(([k, v]) => [k, String(v ?? '')])
            )
          ).toString()
        : '';

      const mode = options?.mode ?? t.mode;
      if (mode === 'replace') {
        navigate(targetPathname + searchStr, { replace: true });
      } else {
        navigate(targetPathname + searchStr);
      }
    },
    [navigate],
  );

  const back = useCallback(
    (steps: number = 1) => {
      navigate(-steps);
    },
    [navigate],
  );

  return { go, back };
}

export function usePlayStoreGestures() {
  const { go, back } = usePlayStoreNavigate();

  const bindTap = (id: string, params?: Record<string, string | number>) => ({
    onClick: (e: React.MouseEvent) => {
      e.stopPropagation();
      go(id, params);
    },
    'data-trigger': id,
    'data-trigger-params': params ? JSON.stringify(params) : undefined,
  });

  const bindAction = (actionId: string, params?: Record<string, unknown>) => ({
    onClick: (e: React.MouseEvent) => {
      e.stopPropagation();
      // Actions are handled by the component's own onClick handlers
    },
    'data-action': actionId,
    'data-action-params': params ? JSON.stringify(params) : undefined,
  });

  const bindBack = () => ({
    onClick: (e: React.MouseEvent) => {
      e.stopPropagation();
      back();
    },
    'data-trigger': 'system.back',
  });

  return { bindTap, bindAction, bindBack };
}
