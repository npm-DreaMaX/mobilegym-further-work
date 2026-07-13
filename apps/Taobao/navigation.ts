import { useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { NAVIGATION_DECLARATION } from './navigation.declaration';
import type { TransitionDeclaration } from './navigation.types';

export function useTaobaoNavigation() {
  const navigate = useNavigate();
  const location = useLocation();

  const go = useCallback(
    (id: string, params: Record<string, string | number> = {}) => {
      const t = NAVIGATION_DECLARATION.transitions?.find(
        (transition: any) => transition.id === id,
      ) as TransitionDeclaration | undefined;

      if (!t) {
        console.error(`Transition not found: ${id}`);
        return;
      }

      let targetPathname = t.to;
      for (const [key, value] of Object.entries(params)) {
        targetPathname = targetPathname.replace(`:${key}`, String(value));
      }

      // Build search params from t.search
      const searchParams = new URLSearchParams();
      for (const [key, val] of Object.entries(t.search)) {
        if (val !== null) {
          searchParams.set(key, val);
        }
      }

      const searchStr = searchParams.toString();
      const fullPath = searchStr ? `${targetPathname}?${searchStr}` : targetPathname;

      if (t.mode === 'replace') {
        navigate(fullPath, { replace: true });
      } else {
        navigate(fullPath);
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

export function useTaobaoGestures() {
  const { go, back } = useTaobaoNavigation();

  const bindTap = (id: string, params?: Record<string, string | number>) => ({
    onClick: (e: React.MouseEvent) => {
      e.stopPropagation();
      go(id, params);
    },
    'data-trigger': id,
    'data-trigger-params': params ? JSON.stringify(params) : undefined,
  });

  const bindAction = (actionId: string, params?: Record<string, any>) => ({
    onClick: (e: React.MouseEvent) => {
      e.stopPropagation();
      // Actions are handled by the component
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

  return { bindTap, bindAction, bindBack, go, back };
}
