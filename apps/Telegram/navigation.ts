// apps/Telegram/navigation.ts
// Telegram 导航 hook — go() / back()

import { useCallback } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { NAVIGATION_DECLARATION } from './navigation.declaration';
import { memoryHistoryPopTo } from '@/os/utils/memoryHistoryPopTo';
import { useHistoryTracker } from '@/os/utils/memoryHistoryTracker';
import type { TransitionDeclaration, FromConstraint } from './navigation.types';

type Primitive = string | number | boolean | null;

type SystemTriggerId = 'system.back';
type GestureId = TransitionId | SystemTriggerId;
type TransitionId = (typeof NAVIGATION_DECLARATION.transitions)[number]['id'];

// ── Helpers ────────────────────────────────────────────────────────

function matchRoute(template: string, actual: string): Record<string, string> | null {
  const templateParts = template.split('/').filter(Boolean);
  const actualParts = actual.split('/').filter(Boolean);
  if (templateParts.length !== actualParts.length) return null;
  const params: Record<string, string> = {};
  for (let i = 0; i < templateParts.length; i++) {
    if (templateParts[i].startsWith(':')) {
      params[templateParts[i].slice(1)] = actualParts[i];
    } else if (templateParts[i] !== actualParts[i]) {
      return null;
    }
  }
  return params;
}

function replaceParams(template: string, params: Record<string, any>): string {
  return template.replace(/:([a-zA-Z_]+)/g, (_, key) => {
    const val = params[key];
    return val != null ? encodeURIComponent(String(val)) : `:${key}`;
  });
}

function matchFrom(
  from: TransitionDeclaration['from'],
  currentPath: string,
  currentSearch: URLSearchParams,
): boolean {
  if (from === '*') return true;
  if (typeof from === 'string') {
    // Check if it matches a uiState id (simple heuristic: not starting with /)
    if (!from.startsWith('/')) {
      // It's a uiState reference — try to match via search params
      // For simplicity, match based on current path and search
      return true; // Will be refined by cases
    }
    return matchRoute(from, currentPath) !== null;
  }
  if (Array.isArray(from)) {
    return from.some((f) => matchFrom(f, currentPath, currentSearch));
  }
  // FromConstraint
  const fc = from as FromConstraint;
  if (fc.path && !matchRoute(fc.path, currentPath) && fc.path !== currentPath) {
    if (!matchRoute(fc.path, currentPath)) return false;
  }
  if (fc.search) {
    for (const [key, val] of Object.entries(fc.search)) {
      if (val === '*') continue;
      if (val === null) {
        if (currentSearch.has(key)) return false;
      } else if (currentSearch.get(key) !== val) {
        return false;
      }
    }
  }
  return true;
}

function buildSearchParams(
  search: Record<string, string | null>,
  searchParams: Record<string, string | number>,
  params: Record<string, any>,
  currentUrl: URLSearchParams,
): string {
  const result = new URLSearchParams();
  // Copy current search params
  for (const [key, val] of currentUrl.entries()) {
    result.set(key, val);
  }
  // Apply search overrides (static)
  for (const [key, val] of Object.entries(search)) {
    if (val === null) result.delete(key);
    else result.set(key, val);
  }
  // Apply searchParams (dynamic from params)
  for (const [key, type] of Object.entries(searchParams)) {
    const val = params[key];
    if (val != null) result.set(key, String(val));
  }
  return result.toString();
}

// ── Hook ───────────────────────────────────────────────────────────

export function useAppNavigate() {
  const navigate = useNavigate();
  const location = useLocation();
  const urlParams = useParams();

  const go = useCallback(
    (
      transitionId: string,
      params: Record<string, any> = {},
      options?: { mode?: 'push' | 'replace'; popTo?: string; popToInclusive?: boolean; state?: any },
    ) => {
      const currentPath = location.pathname;
      const currentSearch = new URLSearchParams(location.search);

      // Find transition
      const transition = NAVIGATION_DECLARATION.transitions.find((t) => t.id === transitionId);
      if (!transition) {
        console.warn(`[Telegram] Unknown transition: ${transitionId}`);
        return;
      }

      // Validate from
      if (!matchFrom(transition.from, currentPath, currentSearch)) {
        console.warn(`[Telegram] Transition ${transitionId} from mismatch at ${currentPath}`);
        return;
      }

      // Merge params: URL params + runtime params
      const mergedParams = { ...urlParams, ...params };

      // PopTo support
      if (options?.popTo) {
        memoryHistoryPopTo(options.popTo, { popToInclusive: options.popToInclusive });
      }

      // Resolve target path
      const targetPath = replaceParams(transition.to, mergedParams);

      // Build search string
      const queryString = buildSearchParams(
        transition.search,
        transition.searchParams,
        mergedParams,
        currentSearch,
      );

      const fullTarget = queryString ? `${targetPath}?${queryString}` : targetPath;
      const mode = options?.mode ?? transition.mode;

      navigate(fullTarget, { replace: mode === 'replace', state: options?.state });
    },
    [navigate, location, urlParams],
  );

  const back = useCallback(
    (steps = 1) => {
      navigate(-steps);
    },
    [navigate],
  );

  return { go, back };
}
