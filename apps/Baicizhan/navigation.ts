import { useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { NAVIGATION_DECLARATION } from './navigation.declaration';
import type { TransitionDeclaration } from './navigation.types';

export function useBaicizhanNavigation() {
  const navigate = useNavigate();
  const location = useLocation();

  const go = useCallback(
    (id: string, params: Record<string, string | number> = {}) => {
      const t = NAVIGATION_DECLARATION.transitions?.find(
        (transition: any) => transition.id === id,
      ) as TransitionDeclaration | undefined;

      if (!t) {
        throw new Error(`Transition not found: ${id}`);
      }

      let targetPathname = t.to;
      for (const [key, value] of Object.entries(params)) {
        targetPathname = targetPathname.replace(`:${key}`, String(value));
      }

      if (t.mode === 'replace') {
        navigate(targetPathname, { replace: true });
      } else {
        navigate(targetPathname);
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

export function useBaicizhanGestures() {
  const { go, back } = useBaicizhanNavigation();

  const bindTap = (id: string, params?: Record<string, string | number>) => ({
    onClick: (e: React.MouseEvent) => {
      e.stopPropagation();
      go(id, params);
    },
    'data-trigger': id,
    'data-trigger-type': 'tap',
    ...(params ? { 'data-trigger-params': JSON.stringify(params) } : {}),
  });

  const bindAction = (actionId: string, params?: Record<string, any>) => ({
    onClick: (e: React.MouseEvent) => {
      e.stopPropagation();
    },
    'data-action': actionId,
    'data-action-type': 'tap',
    ...(params ? { 'data-action-params': JSON.stringify(params) } : {}),
  });

  const bindBack = () => ({
    onClick: (e: React.MouseEvent) => {
      e.stopPropagation();
      back();
    },
    'data-trigger': 'system.back',
    'data-trigger-type': 'tap',
  });

  return { bindTap, bindAction, bindBack, go, back };
}
