/**
 * Consistency Resolver / Helper Functions
 *
 * Deterministic helper layer for consistency rule engine.
 * Priority: canon > board plan > manuscript draft > proposal
 * No LLM inference — pure rule-based resolution.
 */

import type {
  Character, Location, Scene, NarrativeThread,
  ManuscriptScene, ManuscriptChapter, TextEntityReference,
  Link, BoardSceneThreadLink,
} from './novel-types';
import type { ConsistencyIssue, ConsistencyIssueEvidence } from './consistency-types';
import type { NovelState } from './novel-store';

// ---------------------------------------------------------------------------
// Types for resolver outputs
// ---------------------------------------------------------------------------

export interface EntityStateAtTimeline {
  entityId: string;
  isAlive: boolean;
  deathYear: number | null;
  birthYear: number | null;
  currentStatus: string | null;
}

export interface RelationAtTimeline {
  fromId: string;
  toId: string;
  relationType: string;
  weight: number;
}

export interface SceneParticipants {
  povCharacterId: string | null;
  characterIds: string[];
  locationIds: string[];
  itemIds: string[];
  source: 'board' | 'manuscript' | 'merged';
}

export interface SceneTimelineInfo {
  timelineIndex: number;
  timelineLabel: string;
  hasTimeline: boolean;
}

export interface BoardExpectation {
  boardSceneId: string;
  expectedCharacterIds: string[];
  expectedLocationIds: string[];
  expectedGoal: string;
  expectedConflict: string;
  expectedOutcome: string;
  expectedThreadIds: string[];
}

// ---------------------------------------------------------------------------
// resolveEntityStateAtTimeline
// ---------------------------------------------------------------------------

export function resolveEntityStateAtTimeline(
  entityId: string,
  timelineOrder: number | null,
  state: Pick<NovelState, 'characters'>,
): EntityStateAtTimeline | null {
  const char = state.characters[entityId];
  if (!char) return null;

  const result: EntityStateAtTimeline = {
    entityId,
    isAlive: true,
    deathYear: char.deathYear,
    birthYear: char.birthYear,
    currentStatus: null,
  };

  // If no timeline to compare, return without temporal judgment
  if (timelineOrder == null) return result;

  // Birth check
  if (char.birthYear != null && timelineOrder < char.birthYear) {
    result.isAlive = false;
    result.currentStatus = 'not_born';
  }

  // Death check
  if (char.deathYear != null && timelineOrder > char.deathYear) {
    result.isAlive = false;
    result.currentStatus = 'deceased';
  }

  return result;
}

// ---------------------------------------------------------------------------
// resolveRelationsAtTimeline
// ---------------------------------------------------------------------------

export function resolveRelationsAtTimeline(
  entityId: string,
  _timelineOrder: number | null,
  state: Pick<NovelState, 'links'>,
): RelationAtTimeline[] {
  // Current links have no temporal range (valid_from/valid_to).
  // Return all links involving this entity. Timeline filtering is a no-op for now.
  const allLinks = Object.values(state.links);
  return allLinks
    .filter((l) => l.fromId === entityId || l.toId === entityId)
    .map((l) => ({
      fromId: l.fromId,
      toId: l.toId,
      relationType: l.relationType,
      weight: l.weight,
    }));
}

// ---------------------------------------------------------------------------
// resolveMembershipAtTimeline
// ---------------------------------------------------------------------------

export function resolveMembershipAtTimeline(
  entityId: string,
  timelineOrder: number | null,
  state: Pick<NovelState, 'links'>,
): RelationAtTimeline[] {
  const rels = resolveRelationsAtTimeline(entityId, timelineOrder, state);
  return rels.filter(
    (r) => r.relationType === 'member_of' || r.relationType === 'leader_of' || r.relationType === 'serves',
  );
}

// ---------------------------------------------------------------------------
// getSceneParticipants
// Priority: board scene characterIds > manuscript references > POV/location meta
// ---------------------------------------------------------------------------

export function getSceneParticipants(
  sceneId: string,
  state: Pick<NovelState, 'scenes' | 'manuscriptScenes' | 'textEntityReferences'>,
): SceneParticipants {
  const boardScene = state.scenes[sceneId];

  // Try board scene first (canon source)
  if (boardScene) {
    return {
      povCharacterId: boardScene.povCharacterId ?? null,
      characterIds: boardScene.characterIds ?? [],
      locationIds: boardScene.locationIds ?? [],
      itemIds: boardScene.itemIds ?? [],
      source: 'board',
    };
  }

  // Try manuscript scene
  const msScene = state.manuscriptScenes[sceneId];
  if (msScene) {
    // Gather linked text entity references for this manuscript scene
    const refs = Object.values(state.textEntityReferences)
      .filter((r) => r.manuscriptSceneId === sceneId);

    const charIds = refs.filter((r) => r.entityType === 'character').map((r) => r.entityId);
    const locIds = refs.filter((r) => r.entityType === 'location').map((r) => r.entityId);
    const itemIds = refs.filter((r) => r.entityType === 'item').map((r) => r.entityId);

    // Add POV and location from metadata if not already in refs
    if (msScene.povCharacterId && !charIds.includes(msScene.povCharacterId)) {
      charIds.unshift(msScene.povCharacterId);
    }
    if (msScene.locationId && !locIds.includes(msScene.locationId)) {
      locIds.unshift(msScene.locationId);
    }

    return {
      povCharacterId: msScene.povCharacterId,
      characterIds: charIds,
      locationIds: locIds,
      itemIds,
      source: 'manuscript',
    };
  }

  return { povCharacterId: null, characterIds: [], locationIds: [], itemIds: [], source: 'merged' };
}

// ---------------------------------------------------------------------------
// getSceneLocation
// ---------------------------------------------------------------------------

export function getSceneLocation(
  sceneId: string,
  state: Pick<NovelState, 'scenes' | 'locations'>,
): { locationId: string | null; locationName: string | null } {
  const scene = state.scenes[sceneId];
  if (!scene || !scene.locationIds || scene.locationIds.length === 0) {
    return { locationId: null, locationName: null };
  }
  const locId = scene.locationIds[0];
  const loc = state.locations[locId];
  return { locationId: locId, locationName: loc?.name ?? null };
}

// ---------------------------------------------------------------------------
// getSceneTimeline
// ---------------------------------------------------------------------------

export function getSceneTimeline(
  sceneId: string,
  state: Pick<NovelState, 'scenes'>,
): SceneTimelineInfo {
  const scene = state.scenes[sceneId];
  if (!scene) {
    return { timelineIndex: 0, timelineLabel: '', hasTimeline: false };
  }
  return {
    timelineIndex: scene.timelineIndex ?? 0,
    timelineLabel: String(scene.timelineIndex ?? ''),
    hasTimeline: (scene.timelineIndex ?? 0) > 0,
  };
}

// ---------------------------------------------------------------------------
// getLinkedBoardExpectations
// Given a manuscript scene ID, get the linked board scene's expected data
// ---------------------------------------------------------------------------

export function getLinkedBoardExpectations(
  manuscriptSceneId: string,
  state: Pick<NovelState, 'manuscriptScenes' | 'scenes'>,
): BoardExpectation | null {
  const ms = state.manuscriptScenes[manuscriptSceneId];
  if (!ms || !ms.linkedBoardSceneId) return null;

  const boardScene = state.scenes[ms.linkedBoardSceneId];
  if (!boardScene) return null;

  return {
    boardSceneId: boardScene.id,
    expectedCharacterIds: boardScene.characterIds ?? [],
    expectedLocationIds: boardScene.locationIds ?? [],
    expectedGoal: boardScene.goal ?? '',
    expectedConflict: boardScene.conflict ?? '',
    expectedOutcome: boardScene.outcome ?? '',
    expectedThreadIds: boardScene.threadIds ?? [],
  };
}

// ---------------------------------------------------------------------------
// getApprovedCanonFacts
// In current model, canon = wiki entities + approved relations.
// We don't have a separate wiki_facts table yet, so this returns
// entity state + approved links as "facts".
// ---------------------------------------------------------------------------

export function getApprovedCanonFacts(
  subjectId: string,
  timelineOrder: number | null,
  state: Pick<NovelState, 'characters' | 'links'>,
): { entityState: EntityStateAtTimeline | null; relations: RelationAtTimeline[] } {
  const entityState = resolveEntityStateAtTimeline(subjectId, timelineOrder, state);
  const relations = resolveRelationsAtTimeline(subjectId, timelineOrder, state);
  return { entityState, relations };
}

// ---------------------------------------------------------------------------
// compareNormalizedText
// Deterministic text comparison — NO LLM inference.
// Returns overlap score 0..1 based on token overlap.
// ---------------------------------------------------------------------------

export function compareNormalizedText(a: string, b: string): number {
  if (!a || !b) return 0;

  const normalize = (s: string) =>
    s.toLowerCase()
      .replace(/[^\uAC00-\uD7AF\u1100-\u11FF\u3130-\u318Fa-z0-9\s]/g, '')
      .trim()
      .split(/\s+/)
      .filter(Boolean);

  const tokensA = normalize(a);
  const tokensB = normalize(b);

  if (tokensA.length === 0 || tokensB.length === 0) return 0;

  const setB = new Set(tokensB);
  const overlap = tokensA.filter((t) => setB.has(t)).length;

  // Jaccard-like: overlap / union
  const union = new Set([...tokensA, ...tokensB]).size;
  return union > 0 ? overlap / union : 0;
}

// ---------------------------------------------------------------------------
// buildIssueFingerprint
// Deterministic dedup key from rule_code + scope + entities + evidence
// ---------------------------------------------------------------------------

export function buildIssueFingerprint(issue: {
  ruleCode: string;
  bookId?: string | null;
  chapterId?: string | null;
  sceneId?: string | null;
  boardSceneId?: string | null;
  relatedEntityIds?: string[];
}): string {
  const parts = [
    issue.ruleCode,
    issue.bookId ?? '_',
    issue.chapterId ?? '_',
    issue.sceneId ?? '_',
    issue.boardSceneId ?? '_',
    ...(issue.relatedEntityIds ?? []).sort(),
  ];
  return parts.join('|');
}

// ---------------------------------------------------------------------------
// Helper: compute timeline_order from various sources
// Returns null if no reliable timeline data exists
// ---------------------------------------------------------------------------

export function resolveTimelineOrder(
  scene: Scene | null,
  msChapter: ManuscriptChapter | null,
): number | null {
  // Board scene timeline_index is the primary source
  if (scene && scene.timelineIndex > 0) {
    return scene.timelineIndex;
  }
  // Manuscript chapter timeline_label as fallback
  if (msChapter && msChapter.timelineLabel) {
    const num = Number(msChapter.timelineLabel);
    if (!isNaN(num) && num > 0) return num;
  }
  return null;
}

// ---------------------------------------------------------------------------
// Helper: normalize alias text for entity matching
// ---------------------------------------------------------------------------

export function normalizeAlias(text: string): string {
  return text
    .toLowerCase()
    .replace(/\s+/g, '')
    .replace(/[^\uAC00-\uD7AF\u1100-\u11FF\u3130-\u318Fa-z0-9]/g, '');
}

// ---------------------------------------------------------------------------
// Helper: build scene snapshot for versioning
// ---------------------------------------------------------------------------

export function buildSceneSnapshot(
  sceneId: string,
  state: Pick<NovelState, 'scenes' | 'manuscriptScenes'>,
): Record<string, unknown> | null {
  const boardScene = state.scenes[sceneId];
  if (boardScene) {
    return { ...boardScene };
  }
  const msScene = state.manuscriptScenes[sceneId];
  if (msScene) {
    return { ...msScene };
  }
  return null;
}
