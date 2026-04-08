import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import type {
  ConsistencyIssue,
  ConsistencyIssueSummary,
  ConsistencyIssueEvidence,
  SuggestedAction,
  IssueSeverity,
  IssueStatus,
} from './consistency-types';

// History recording helper — logs to novel store's revisionLogs
function recordConsistencyHistory(action: string, entityId: string, before: unknown, after: unknown) {
  try {
    // Dynamic import to avoid circular dependency
    const { useNovelStore } = require('./novel-store');
    const store = useNovelStore.getState();
    const id = uuidv4();
    const entry = {
      id,
      entityType: 'consistencyIssue',
      entityId,
      action: action as 'create' | 'update' | 'delete',
      diffJson: JSON.stringify({ before, after }),
      createdAt: Date.now(),
      author: 'system',
    };
    useNovelStore.setState({
      revisionLogs: { ...store.revisionLogs, [id]: entry },
    });
  } catch {
    // Silently fail if novel store not available
  }
}

// ---------------------------------------------------------------------------
// SSR-safe localStorage
// ---------------------------------------------------------------------------

const safeStorage = createJSONStorage(() => {
  if (typeof window !== 'undefined') return window.localStorage;
  return { getItem: () => null, setItem: () => {}, removeItem: () => {} };
});

// ---------------------------------------------------------------------------
// State
// ---------------------------------------------------------------------------

export interface ConsistencyState {
  issues: Record<string, ConsistencyIssue>;
}

export interface ConsistencyActions {
  // CRUD
  createIssue: (data: Omit<ConsistencyIssue, 'id' | 'createdAt' | 'updatedAt' | 'firstDetectedAt' | 'lastDetectedAt'>) => string;
  updateIssue: (id: string, patch: Partial<Omit<ConsistencyIssue, 'id' | 'createdAt'>>) => void;
  upsertIssue: (ruleCode: string, match: { sceneId?: string; boardSceneId?: string; relatedEntityIds?: string[] }, data: Omit<ConsistencyIssue, 'id' | 'createdAt' | 'updatedAt' | 'firstDetectedAt' | 'lastDetectedAt'>) => string;
  deleteIssue: (id: string) => void;

  // Status transitions
  resolveIssue: (id: string) => void;
  ignoreIssue: (id: string) => void;
  reopenIssue: (id: string) => void;

  // Queries
  getIssueById: (id: string) => ConsistencyIssue | undefined;
  listIssues: (filter?: { status?: IssueStatus; severity?: IssueSeverity; ruleCode?: string }) => ConsistencyIssue[];
  listIssuesByScene: (sceneId: string) => ConsistencyIssue[];
  listIssuesByBoardScene: (boardSceneId: string) => ConsistencyIssue[];
  listIssuesByEntity: (entityId: string) => ConsistencyIssue[];
  getIssueSummary: () => ConsistencyIssueSummary;
}

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------

export const useConsistencyStore = create<ConsistencyState & ConsistencyActions>()(
  persist(
    (set, get) => ({
      issues: {},

      // ── CRUD ──────────────────────────────────────────────────

      createIssue: (data) => {
        const id = uuidv4();
        const ts = Date.now();
        const issue: ConsistencyIssue = {
          ...data,
          id,
          firstDetectedAt: ts,
          lastDetectedAt: ts,
          createdAt: ts,
          updatedAt: ts,
        };
        set((state) => ({
          issues: { ...state.issues, [id]: issue },
        }));
        recordConsistencyHistory('create', id, null, { title: issue.title, severity: issue.severity, ruleCode: issue.ruleCode });
        return id;
      },

      updateIssue: (id, patch) => {
        set((state) => {
          const prev = state.issues[id];
          if (!prev) return state;
          const updated: ConsistencyIssue = { ...prev, ...patch, updatedAt: Date.now() };
          return { issues: { ...state.issues, [id]: updated } };
        });
      },

      upsertIssue: (ruleCode, match, data) => {
        const state = get();
        // Find existing issue with same ruleCode + matching scene/entity
        const existing = Object.values(state.issues).find((iss) => {
          if (iss.ruleCode !== ruleCode) return false;
          if (match.sceneId && iss.sceneId !== match.sceneId) return false;
          if (match.boardSceneId && iss.boardSceneId !== match.boardSceneId) return false;
          if (match.relatedEntityIds && match.relatedEntityIds.length > 0) {
            const overlap = match.relatedEntityIds.some((eid) => iss.relatedEntityIds.includes(eid));
            if (!overlap) return false;
          }
          return true;
        });

        if (existing) {
          // Update lastDetectedAt and refresh data
          set((s) => ({
            issues: {
              ...s.issues,
              [existing.id]: {
                ...existing,
                ...data,
                id: existing.id,
                firstDetectedAt: existing.firstDetectedAt,
                lastDetectedAt: Date.now(),
                createdAt: existing.createdAt,
                updatedAt: Date.now(),
              },
            },
          }));
          return existing.id;
        } else {
          return get().createIssue(data);
        }
      },

      deleteIssue: (id) => {
        set((state) => {
          const { [id]: _, ...rest } = state.issues;
          return { issues: rest };
        });
      },

      // ── Status transitions ────────────────────────────────────

      resolveIssue: (id) => {
        const prev = get().issues[id];
        get().updateIssue(id, { status: 'resolved' });
        recordConsistencyHistory('update', id, { status: prev?.status }, { status: 'resolved', action: 'resolve' });
      },

      ignoreIssue: (id) => {
        const prev = get().issues[id];
        get().updateIssue(id, { status: 'ignored' });
        recordConsistencyHistory('update', id, { status: prev?.status }, { status: 'ignored', action: 'ignore' });
      },

      reopenIssue: (id) => {
        const prev = get().issues[id];
        get().updateIssue(id, { status: 'open' });
        recordConsistencyHistory('update', id, { status: prev?.status }, { status: 'open', action: 'reopen' });
      },

      // ── Queries ───────────────────────────────────────────────

      getIssueById: (id) => {
        return get().issues[id];
      },

      listIssues: (filter) => {
        let result = Object.values(get().issues);
        if (filter?.status) result = result.filter((i) => i.status === filter.status);
        if (filter?.severity) result = result.filter((i) => i.severity === filter.severity);
        if (filter?.ruleCode) result = result.filter((i) => i.ruleCode === filter.ruleCode);
        return result.sort((a, b) => {
          // Sort: high > medium > low, then by lastDetectedAt desc
          const sevOrder = { high: 0, medium: 1, low: 2 };
          const sevDiff = sevOrder[a.severity] - sevOrder[b.severity];
          if (sevDiff !== 0) return sevDiff;
          return b.lastDetectedAt - a.lastDetectedAt;
        });
      },

      listIssuesByScene: (sceneId) => {
        return Object.values(get().issues)
          .filter((i) => i.sceneId === sceneId || i.boardSceneId === sceneId)
          .sort((a, b) => b.lastDetectedAt - a.lastDetectedAt);
      },

      listIssuesByBoardScene: (boardSceneId) => {
        return Object.values(get().issues)
          .filter((i) => i.boardSceneId === boardSceneId)
          .sort((a, b) => b.lastDetectedAt - a.lastDetectedAt);
      },

      listIssuesByEntity: (entityId) => {
        return Object.values(get().issues)
          .filter((i) => i.relatedEntityIds.includes(entityId))
          .sort((a, b) => b.lastDetectedAt - a.lastDetectedAt);
      },

      getIssueSummary: () => {
        const all = Object.values(get().issues);
        return {
          total: all.length,
          high: all.filter((i) => i.severity === 'high').length,
          medium: all.filter((i) => i.severity === 'medium').length,
          low: all.filter((i) => i.severity === 'low').length,
          open: all.filter((i) => i.status === 'open').length,
          ignored: all.filter((i) => i.status === 'ignored').length,
          resolved: all.filter((i) => i.status === 'resolved').length,
        };
      },
    }),
    {
      name: 'novel-consistency-issues',
      storage: safeStorage,
      partialize: (state) => ({
        issues: state.issues,
      }),
    },
  ),
);
