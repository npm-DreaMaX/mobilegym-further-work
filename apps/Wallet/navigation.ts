import { useLocation, useNavigate } from 'react-router-dom';
import { NAVIGATION_DECLARATION, type TransitionId } from './navigation.declaration';

function matchRoute(template: string, path: string): boolean {
  return new RegExp(`^${template.replace(/:\w+/g, '[^/]+')}$`).test(path);
}

function replaceParams(path: string, params: Record<string, string | number>): string {
  return path.replace(/:(\w+)/g, (_, key: string) => {
    const value = params[key];
    if (value === undefined) throw new Error(`Missing param "${key}" for path "${path}"`);
    return encodeURIComponent(String(value));
  });
}

export function useAppNavigate() {
  const navigate = useNavigate();
  const location = useLocation();

  const go = (id: TransitionId, params: Record<string, string | number> = {}) => {
    const declaration = NAVIGATION_DECLARATION.transitions.find((item) => item.id === id);
    if (!declaration) throw new Error(`Transition not found: ${id}`);
    const sources = Array.isArray(declaration.from) ? declaration.from : [declaration.from];
    if (!sources.some((source) => typeof source === 'string' && matchRoute(source, location.pathname))) {
      throw new Error(`Transition "${id}" not allowed from "${location.pathname}"`);
    }
    navigate(replaceParams(declaration.to, params));
  };

  return { go };
}
