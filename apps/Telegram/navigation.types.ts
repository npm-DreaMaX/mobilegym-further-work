// apps/Telegram/navigation.types.ts
// Local copy of NavigationDeclaration types

export type Primitive = string | number | boolean | null;

export interface LocalStateDeclaration {
  id: string;
  description: string;
  blocking?: boolean;
  persistence?: 'none' | 'routeEntry' | 'session';
  enterBy?: Array<{ kind: 'action' | 'transition'; id: string }>;
  exitBy?: Array<{ kind: 'action' | 'transition'; id: string }>;
  notes?: string;
}

export interface ActionDeclaration {
  id: string;
  label: string;
  description?: string;
  behavior: 'toggle' | 'select' | 'submit' | 'input' | 'open' | 'close' | 'modify' | 'other';
  scope?: 'item';
  paramsSchema?: Record<string, 'string' | 'number' | 'boolean'>;
  condition?: StateCondition;
  effects?: Array<{ kind: 'localState.open'; id: string } | { kind: 'localState.close'; id: string }>;
}

export interface RouteDeclaration {
  path: string;
  component: string;
  params: Record<string, 'string' | 'number'>;
  entryPoint: 'none' | 'home' | 'deepLink' | 'both';
  scrollContainers?: Array<{ name: string; direction: 'vertical' | 'horizontal'; description: string }>;
  uiStates: Array<{
    id: string;
    search: Record<string, string | null>;
    description: string;
    actions?: ActionDeclaration[];
    localStates?: LocalStateDeclaration[];
    stateCondition?: StateCondition;
  }>;
  queryParams: Record<string, 'string' | 'number'>;
  description: string;
}

export interface TransitionDeclaration {
  id: string;
  from: '*' | string | FromConstraint | Array<'*' | string | FromConstraint>;
  to: string;
  search: Record<string, string | null>;
  searchParams: Record<string, 'string' | 'number'>;
  preserveParams?: string[];
  cases?: CaseDeclaration[];
  mode: 'push' | 'replace';
  params: Record<string, 'string' | 'number'>;
  label: string;
  ui: {
    placement: 'topbar' | 'tabbar' | 'content' | 'fab' | 'none';
    icon: string;
    gesture: 'tap' | 'longPress' | 'doubleTap' | 'back';
    condition?: StateCondition;
  };
  dataSource?: DataSourceDeclaration | DataSourceDeclaration[];
}

export interface CaseDeclaration {
  to: string;
  search: Record<string, string | null>;
  searchParams?: Record<string, 'string' | 'number'>;
  when: Condition;
}

export type Condition =
  | { op: 'always' }
  | { op: 'and'; items: Condition[] }
  | { op: 'or'; items: Condition[] }
  | { op: 'not'; item: Condition }
  | { op: 'exists'; ref: ValueRef }
  | { op: 'eq'; left: ValueRef; right: Primitive }
  | { op: 'in'; left: ValueRef; right: Primitive[] }
  | { op: 'match'; left: ValueRef; right: string }
  | { op: 'gt' | 'gte' | 'lt' | 'lte'; left: ValueRef; right: number };

export type ValueRef =
  | { ref: 'search'; key: string }
  | { ref: 'param'; key: string }
  | { ref: 'appState'; key: string };

export interface FromConstraint {
  path: string;
  search?: Record<string, string | '*' | null>;
}

export interface StateCondition {
  op: string;
  text?: string;
  items?: StateCondition[];
  item?: StateCondition;
  ref?: string;
  param?: string;
  field?: string;
  filterFn?: string;
  equals?: Primitive;
  [key: string]: any;
}

export interface DataSourceDeclaration {
  from?: '*' | string | FromConstraint;
  ref: string;
  paramMapping: Record<string, string>;
  labelField?: string;
  filterFn?: string;
}

export interface NavigationDeclaration {
  app: string;
  routes: RouteDeclaration[];
  transitions: TransitionDeclaration[];
  capabilities: {
    historyBack: boolean;
  };
}
