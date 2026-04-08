/**
 * Consistency Scan Pipeline
 *
 * Deterministic rule engine — NO LLM inference.
 * Priority: canon > board plan > manuscript draft > proposal
 *
 * Pipeline: scan → run rules → upsert issues → stale resolve
 */

import type { NovelState } from './novel-store';
import type {
  ConsistencyIssue,
  ConsistencyIssueSummary,
  IssueSeverity,
  IssueStatus,
} from './consistency-types';
import { buildIssueFingerprint } from './consistency-resolvers';
import { useConsistencyStore } from './consistency-store';

// ---------------------------------------------------------------------------
// Rule interface
// ---------------------------------------------------------------------------

export interface ConsistencyRuleContext {
  state: NovelState;
  sceneId?: string;
  bookId?: string;
}

export type ConsistencyRuleResult = Omit<
  ConsistencyIssue,
  'id' | 'createdAt' | 'updatedAt' | 'firstDetectedAt' | 'lastDetectedAt' | 'status'
>;

export interface ConsistencyRule {
  code: string;
  name: string;
  description: string;
  scope: 'scene' | 'book' | 'project';
  run: (ctx: ConsistencyRuleContext) => ConsistencyRuleResult[];
}

// ---------------------------------------------------------------------------
// Rule Registry
// ---------------------------------------------------------------------------

const ruleRegistry: ConsistencyRule[] = [];

export function registerRule(rule: ConsistencyRule): void {
  // Prevent duplicate registration
  if (!ruleRegistry.find((r) => r.code === rule.code)) {
    ruleRegistry.push(rule);
  }
}

export function getRegisteredRules(): ConsistencyRule[] {
  return [...ruleRegistry];
}

// ---------------------------------------------------------------------------
// Run rules by scope
// ---------------------------------------------------------------------------

function runRulesForScene(state: NovelState, sceneId: string): ConsistencyRuleResult[] {
  const results: ConsistencyRuleResult[] = [];
  for (const rule of ruleRegistry) {
    if (rule.scope === 'scene' || rule.scope === 'project') {
      try {
        const ruleResults = rule.run({ state, sceneId });
        results.push(...ruleResults);
      } catch {
        // Rule failed — skip silently, don't crash pipeline
      }
    }
  }
  return results;
}

function runRulesForBook(state: NovelState, bookId: string): ConsistencyRuleResult[] {
  const results: ConsistencyRuleResult[] = [];
  for (const rule of ruleRegistry) {
    if (rule.scope === 'book' || rule.scope === 'project') {
      try {
        const ruleResults = rule.run({ state, bookId });
        results.push(...ruleResults);
      } catch {
        // Rule failed — skip silently
      }
    }
  }
  return results;
}

function runRulesForProject(state: NovelState): ConsistencyRuleResult[] {
  const results: ConsistencyRuleResult[] = [];
  for (const rule of ruleRegistry) {
    try {
      const ruleResults = rule.run({ state });
      results.push(...ruleResults);
    } catch {
      // Rule failed — skip silently
    }
  }
  return results;
}

// ---------------------------------------------------------------------------
// Dedup + Upsert
// ---------------------------------------------------------------------------

function upsertDetectedIssues(detected: ConsistencyRuleResult[]): Set<string> {
  const store = useConsistencyStore.getState();
  const touchedFingerprints = new Set<string>();

  for (const d of detected) {
    const fp = buildIssueFingerprint({
      ruleCode: d.ruleCode,
      bookId: d.bookId,
      chapterId: d.chapterId,
      sceneId: d.sceneId,
      boardSceneId: d.boardSceneId,
      relatedEntityIds: d.relatedEntityIds,
    });
    touchedFingerprints.add(fp);

    store.upsertIssue(
      d.ruleCode,
      {
        sceneId: d.sceneId ?? undefined,
        boardSceneId: d.boardSceneId ?? undefined,
        relatedEntityIds: d.relatedEntityIds.length > 0 ? d.relatedEntityIds : undefined,
      },
      { ...d, status: 'open' },
    );
  }

  return touchedFingerprints;
}

// ---------------------------------------------------------------------------
// Stale issue resolution
// ---------------------------------------------------------------------------

function resolveStaleIssues(touchedFingerprints: Set<string>, scopeFilter?: { bookId?: string; sceneId?: string; boardSceneId?: string }): void {
  const store = useConsistencyStore.getState();
  const allIssues = Object.values(store.issues);

  for (const issue of allIssues) {
    // Only process open issues
    if (issue.status !== 'open') continue;

    // Apply scope filter — only resolve issues within the scanned scope
    if (scopeFilter) {
      if (scopeFilter.sceneId && issue.sceneId !== scopeFilter.sceneId && issue.boardSceneId !== scopeFilter.sceneId) {
        continue;
      }
      if (scopeFilter.bookId && issue.bookId !== scopeFilter.bookId) {
        continue;
      }
    }

    const fp = buildIssueFingerprint({
      ruleCode: issue.ruleCode,
      bookId: issue.bookId,
      chapterId: issue.chapterId,
      sceneId: issue.sceneId,
      boardSceneId: issue.boardSceneId,
      relatedEntityIds: issue.relatedEntityIds,
    });

    // If this issue was NOT re-detected in this scan, it's stale → resolve
    if (!touchedFingerprints.has(fp)) {
      store.resolveIssue(issue.id);
    }
  }
}

// ---------------------------------------------------------------------------
// Scan APIs
// ---------------------------------------------------------------------------

export interface ScanResult {
  summary: ConsistencyIssueSummary;
  issueCount: number;
  lastScannedAt: number;
}

export function scanProject(state: NovelState): ScanResult {
  // Run all rules on full project
  const detected = runRulesForProject(state);

  // Also run scene-level rules for every scene
  for (const sceneId of Object.keys(state.scenes)) {
    detected.push(...runRulesForScene(state, sceneId));
  }

  // Upsert detected issues
  const touched = upsertDetectedIssues(detected);

  // Resolve stale (no scope filter = project-wide)
  resolveStaleIssues(touched);

  return buildScanResult();
}

export function scanBook(state: NovelState, bookId: string): ScanResult {
  // Run book-level rules
  const detected = runRulesForBook(state, bookId);

  // Run scene-level rules for scenes in this book's chapters
  const bookScenes = Object.values(state.scenes).filter((s) => {
    // Match scenes by their chapter's book (via boardChapters or manuscriptChapters)
    // For now, include all scenes since we don't have a direct book→scene link on board scenes
    return true;
  });
  for (const scene of bookScenes) {
    detected.push(...runRulesForScene(state, scene.id));
  }

  const touched = upsertDetectedIssues(detected);
  resolveStaleIssues(touched, { bookId });

  return buildScanResult();
}

export function scanScene(state: NovelState, sceneId: string): ScanResult {
  const detected = runRulesForScene(state, sceneId);
  const touched = upsertDetectedIssues(detected);
  resolveStaleIssues(touched, { sceneId });

  return buildScanResult();
}

// ---------------------------------------------------------------------------
// Aggregate summary
// ---------------------------------------------------------------------------

function buildScanResult(): ScanResult {
  const store = useConsistencyStore.getState();
  const summary = store.getIssueSummary();
  return {
    summary,
    issueCount: summary.total,
    lastScannedAt: Date.now(),
  };
}
