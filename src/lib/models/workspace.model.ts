import type { Id } from './common.model';

export type WorkspaceSection = 'documents' | 'chat' | 'studio';

export interface WorkspaceStateB {
  currentSessionId: Id | null;
  activeSectionBySession: Record<Id, WorkspaceSection>;
}

export type SelectedBySession = Record<Id, Set<Id>>;
