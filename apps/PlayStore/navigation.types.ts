export type Primitive = string | number | boolean | null;

export interface ScrollContainerDeclaration {
  name: string;
  direction: 'vertical' | 'horizontal' | 'both';
  description?: string;
}

export interface RouteDeclaration {
  path: string;
  component: string;
  params: Record<string, 'string' | 'number'>;
  entryPoint: 'home' | 'deepLink' | 'both' | 'none';
  scrollContainers: ScrollContainerDeclaration[];
  uiStates: UiStateDeclaration[];
  queryParams: Record<string, 'string' | 'number'>;
  description: string;
}

export interface UiStateDeclaration {
  id: string;
  search: Record<string, string | null>;
  description: string;
  actions?: ActionDeclaration[];
}

export interface ActionDeclaration {
  id: string;
  label: string;
  behavior: 'toggle' | 'select' | 'input' | 'submit' | 'other';
  description: string;
  scope?: 'global' | 'item';
  paramsSchema?: Record<string, 'string' | 'number'>;
  value?: string;
}

export interface Condition {
  op: 'exists' | 'eq' | 'in' | 'match' | 'gt' | 'gte' | 'lt' | 'lte' | 'and' | 'or' | 'not' | 'always';
  field?: string;
  value?: Primitive | Primitive[];
  conditions?: Condition[];
}

export interface CaseDeclaration {
  when: Condition;
  to?: string;
  search?: Record<string, string | null>;
  searchParams?: Record<string, string | null>;
  params?: Record<string, string | number>;
}

export type FromConstraint = {
  path: string;
  search?: Record<string, string | null>;
};

export interface TransitionDeclaration {
  id: string;
  from: string | string[] | FromConstraint | FromConstraint[];
  to: string;
  search: Record<string, string | null>;
  searchParams: Record<string, string | null>;
  mode: 'push' | 'replace';
  params: Record<string, 'string' | 'number'>;
  label: string;
  ui: {
    placement?: string;
    icon?: string;
    gesture: 'tap' | 'longPress' | 'doubleTap' | 'back';
  };
  cases?: CaseDeclaration[];
}

export interface NavigationDeclaration {
  app: string;
  routes: RouteDeclaration[];
  transitions: TransitionDeclaration[];
  capabilities: {
    historyBack: boolean;
  };
}
