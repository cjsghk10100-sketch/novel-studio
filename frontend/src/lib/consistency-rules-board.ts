/**
 * Board-Manuscript / Thread / Proposal / Link Review Rules
 *
 * Deterministic rule engine — NO LLM inference.
 * Priority: canon > board plan > manuscript draft > proposal
 * pending proposal or suggested reference alone cannot produce high severity.
 *
 * Rules:
 * 1. BOARD_REQUIRED_ENTITY_MISSING
 * 2. BOARD_LOCATION_MISMATCH
 * 3. BOARD_TIMELINE_MISMATCH
 * 4. BOARD_GOAL_MISMATCH
 * 5. FORESHADOW_UNRESOLVED
 * 6. PAYOFF_WITHOUT_SETUP
 * 7. UNLINKED_ENTITY_REVIEW
 * 8. PROPOSAL_CANON_CONFLICT
 */

import type { ConsistencyRule, ConsistencyRuleResult, ConsistencyRuleContext } from './consistency-scanner';
import { getLinkedBoardExpectations, compareNormalizedText } from './consistency-resolvers';
import type { NarrativeThread } from './novel-types';

// ---------------------------------------------------------------------------
// 1. BOARD_REQUIRED_ENTITY_MISSING
// ---------------------------------------------------------------------------
export const boardRequiredEntityMissingRule: ConsistencyRule = {
  code: 'BOARD_REQUIRED_ENTITY_MISSING',
  name: '\ubcf4\ub4dc \ud544\uc218 \uc5d4\ud2f0\ud2f0 \ub204\ub77d',
  description: '\ubcf4\ub4dc \uc7a5\uba74\uc758 \ud544\uc218/POV \uc5d4\ud2f0\ud2f0\uac00 \uc6d0\uace0\uc5d0 \uc5c6\uc2b5\ub2c8\ub2e4.',
  scope: 'project',
  run: (ctx) => {
    const { state } = ctx;
    const results: ConsistencyRuleResult[] = [];

    for (const ms of Object.values(state.manuscriptScenes)) {
      if (!ms.linkedBoardSceneId) continue;
      const expect = getLinkedBoardExpectations(ms.id, state);
      if (!expect) continue;

      // Get manuscript scene entity references
      const msRefs = Object.values(state.textEntityReferences)
        .filter((r) => r.manuscriptSceneId === ms.id)
        .map((r) => r.entityId);
      const msCharIds = new Set([...msRefs, ...(ms.povCharacterId ? [ms.povCharacterId] : [])]);

      // Check required characters from board
      for (const reqId of expect.expectedCharacterIds) {
        if (!msCharIds.has(reqId)) {
          const char = state.characters[reqId];
          results.push({
            ruleCode: 'BOARD_REQUIRED_ENTITY_MISSING',
            severity: 'medium',
            title: '\ubcf4\ub4dc \ud544\uc218 \uc5d4\ud2f0\ud2f0 \ub204\ub77d',
            message: `\uc6d0\uace0 "${ms.title}"\uc5d0 \ubcf4\ub4dc \uc7a5\uba74\uc758 \ub4f1\uc7a5\uc778\ubb3c "${char?.name ?? reqId}"\uc774(\uac00) \uc5c6\uc2b5\ub2c8\ub2e4.`,
            bookId: ms.bookId, chapterId: ms.chapterId, sceneId: ms.id, boardSceneId: expect.boardSceneId,
            relatedEntityIds: [reqId],
            evidence: [
              { sourceType: 'board_scene', sourceId: expect.boardSceneId, snippetText: `\ud544\uc218 \uc778\ubb3c: ${char?.name ?? reqId}`, startOffset: null, endOffset: null },
              { sourceType: 'manuscript_scene', sourceId: ms.id, snippetText: null, startOffset: null, endOffset: null },
            ],
            suggestedActions: [
              { label: '\uc6d0\uace0\uc5d0 \uc778\ubb3c \ucd94\uac00', actionType: 'edit', targetType: 'manuscript', targetId: ms.id },
            ],
          });
        }
      }
    }
    return results;
  },
};

// ---------------------------------------------------------------------------
// 2. BOARD_LOCATION_MISMATCH
// ---------------------------------------------------------------------------
export const boardLocationMismatchRule: ConsistencyRule = {
  code: 'BOARD_LOCATION_MISMATCH',
  name: '\ubcf4\ub4dc-\uc6d0\uace0 \uc7a5\uc18c \ubd88\uc77c\uce58',
  description: '\ubcf4\ub4dc \uc7a5\uba74\uacfc \uc6d0\uace0 \uc7a5\uba74\uc758 \uc7a5\uc18c\uac00 \ub2e4\ub985\ub2c8\ub2e4.',
  scope: 'project',
  run: (ctx) => {
    const { state } = ctx;
    const results: ConsistencyRuleResult[] = [];

    for (const ms of Object.values(state.manuscriptScenes)) {
      if (!ms.linkedBoardSceneId || !ms.locationId) continue;
      const boardScene = state.scenes[ms.linkedBoardSceneId];
      if (!boardScene || !boardScene.locationIds || boardScene.locationIds.length === 0) continue;

      if (!boardScene.locationIds.includes(ms.locationId)) {
        const msLoc = state.locations[ms.locationId]?.name ?? ms.locationId;
        const boardLoc = boardScene.locationIds.map((id) => state.locations[id]?.name ?? id).join(', ');
        results.push({
          ruleCode: 'BOARD_LOCATION_MISMATCH',
          severity: 'medium',
          title: '\ubcf4\ub4dc-\uc6d0\uace0 \uc7a5\uc18c \ubd88\uc77c\uce58',
          message: `\uc6d0\uace0 "${ms.title}"\uc758 \uc7a5\uc18c(${msLoc})\uac00 \ubcf4\ub4dc "${boardScene.title}"\uc758 \uc7a5\uc18c(${boardLoc})\uc640 \ub2e4\ub985\ub2c8\ub2e4.`,
          bookId: ms.bookId, chapterId: ms.chapterId, sceneId: ms.id, boardSceneId: boardScene.id,
          relatedEntityIds: [ms.locationId],
          evidence: [
            { sourceType: 'manuscript_scene', sourceId: ms.id, snippetText: `\uc7a5\uc18c: ${msLoc}`, startOffset: null, endOffset: null },
            { sourceType: 'board_scene', sourceId: boardScene.id, snippetText: `\uc7a5\uc18c: ${boardLoc}`, startOffset: null, endOffset: null },
          ],
          suggestedActions: [
            { label: '\uc6d0\uace0 \uc7a5\uc18c \uc218\uc815', actionType: 'edit', targetType: 'manuscript', targetId: ms.id },
          ],
        });
      }
    }
    return results;
  },
};

// ---------------------------------------------------------------------------
// 3. BOARD_TIMELINE_MISMATCH
// ---------------------------------------------------------------------------
export const boardTimelineMismatchRule: ConsistencyRule = {
  code: 'BOARD_TIMELINE_MISMATCH',
  name: '\ubcf4\ub4dc-\uc6d0\uace0 \uc2dc\uac04\uc120 \ubd88\uc77c\uce58',
  description: '\ubcf4\ub4dc \uc7a5\uba74\uacfc \uc6d0\uace0\uc758 \uc2dc\uac04\uc120\uc774 \ub2e4\ub985\ub2c8\ub2e4.',
  scope: 'project',
  run: (ctx) => {
    const { state } = ctx;
    const results: ConsistencyRuleResult[] = [];

    for (const ms of Object.values(state.manuscriptScenes)) {
      if (!ms.linkedBoardSceneId) continue;
      const boardScene = state.scenes[ms.linkedBoardSceneId];
      if (!boardScene || boardScene.timelineIndex <= 0) continue;

      const msTimeline = Number(ms.timelineLabel);
      if (isNaN(msTimeline) || msTimeline <= 0) continue;

      if (msTimeline !== boardScene.timelineIndex) {
        results.push({
          ruleCode: 'BOARD_TIMELINE_MISMATCH',
          severity: 'medium',
          title: '\ubcf4\ub4dc-\uc6d0\uace0 \uc2dc\uac04\uc120 \ubd88\uc77c\uce58',
          message: `\uc6d0\uace0 "${ms.title}" \uc2dc\uac04\uc120(${msTimeline})\uacfc \ubcf4\ub4dc "${boardScene.title}" \uc2dc\uac04\uc120(${boardScene.timelineIndex})\uc774 \ub2e4\ub985\ub2c8\ub2e4.`,
          bookId: ms.bookId, chapterId: ms.chapterId, sceneId: ms.id, boardSceneId: boardScene.id,
          relatedEntityIds: [],
          evidence: [
            { sourceType: 'manuscript_scene', sourceId: ms.id, snippetText: `\uc2dc\uac04\uc120: ${msTimeline}`, startOffset: null, endOffset: null },
            { sourceType: 'board_scene', sourceId: boardScene.id, snippetText: `\uc2dc\uac04\uc120: ${boardScene.timelineIndex}`, startOffset: null, endOffset: null },
          ],
          suggestedActions: [
            { label: '\uc2dc\uac04\uc120 \ub9de\ucd94\uae30', actionType: 'edit', targetType: 'manuscript', targetId: ms.id },
          ],
        });
      }
    }
    return results;
  },
};

// ---------------------------------------------------------------------------
// 4. BOARD_GOAL_MISMATCH
// ---------------------------------------------------------------------------
export const boardGoalMismatchRule: ConsistencyRule = {
  code: 'BOARD_GOAL_MISMATCH',
  name: '\ubcf4\ub4dc-\uc6d0\uace0 \ubaa9\ud45c \ubd88\uc77c\uce58',
  description: '\ubcf4\ub4dc \uc7a5\uba74\uc758 \ubaa9\ud45c/\uacb0\uacfc\uc640 \uc6d0\uace0\uac00 \ud06c\uac8c \ub2e4\ub985\ub2c8\ub2e4.',
  scope: 'project',
  run: (ctx) => {
    const { state } = ctx;
    const results: ConsistencyRuleResult[] = [];

    for (const ms of Object.values(state.manuscriptScenes)) {
      if (!ms.linkedBoardSceneId) continue;
      const expect = getLinkedBoardExpectations(ms.id, state);
      if (!expect) continue;
      if (!expect.expectedGoal && !expect.expectedOutcome) continue;

      // Compare goal
      if (expect.expectedGoal && ms.goal) {
        const score = compareNormalizedText(expect.expectedGoal, ms.goal);
        if (score < 0.1 && expect.expectedGoal.trim().length > 3 && ms.goal.trim().length > 3) {
          results.push({
            ruleCode: 'BOARD_GOAL_MISMATCH',
            severity: 'low',
            title: '\ubcf4\ub4dc-\uc6d0\uace0 \ubaa9\ud45c \ubd88\uc77c\uce58',
            message: `\uc6d0\uace0 "${ms.title}"\uc758 \ubaa9\ud45c\uc640 \ubcf4\ub4dc \uc7a5\uba74\uc758 \ubaa9\ud45c\uac00 \ud06c\uac8c \ub2e4\ub985\ub2c8\ub2e4.`,
            bookId: ms.bookId, chapterId: ms.chapterId, sceneId: ms.id, boardSceneId: expect.boardSceneId,
            relatedEntityIds: [],
            evidence: [
              { sourceType: 'board_scene', sourceId: expect.boardSceneId, snippetText: `\ubaa9\ud45c: ${expect.expectedGoal}`, startOffset: null, endOffset: null },
              { sourceType: 'manuscript_scene', sourceId: ms.id, snippetText: `\ubaa9\ud45c: ${ms.goal}`, startOffset: null, endOffset: null },
            ],
            suggestedActions: [
              { label: '\ubcf4\ub4dc \ud655\uc778', actionType: 'navigate', targetType: 'board', targetId: expect.boardSceneId },
            ],
          });
        }
      }
    }
    return results;
  },
};

// ---------------------------------------------------------------------------
// 5. FORESHADOW_UNRESOLVED — uses narrative_threads with type=foreshadow/mystery
// ---------------------------------------------------------------------------
export const foreshadowUnresolvedRule: ConsistencyRule = {
  code: 'FORESHADOW_UNRESOLVED',
  name: '\ubbf8\ud68c\uc218 \uc2a4\ub808\ub4dc',
  description: '\ubcf5\uc120/\ubbf8\uc2a4\ud130\ub9ac \uc2a4\ub808\ub4dc\uac00 \uc7a5\uae30\uac04 \ubbf8\ud68c\uc218 \uc0c1\ud0dc\uc785\ub2c8\ub2e4.',
  scope: 'project',
  run: (ctx) => {
    const { state } = ctx;
    const results: ConsistencyRuleResult[] = [];
    const allScenes = Object.values(state.scenes);
    const maxChapter = allScenes.reduce((max, s) => Math.max(max, s.chapterNo), 0);

    for (const thread of Object.values(state.narrativeThreads)) {
      // Only check foreshadow/mystery type threads
      if (thread.type !== 'foreshadow' && thread.type !== 'mystery') continue;
      if (thread.status === 'resolved' || thread.status === 'abandoned' || thread.status === 'paused') continue;
      if (!thread.setupSceneId) continue;

      const setupScene = state.scenes[thread.setupSceneId];
      if (!setupScene) continue;

      const chapterGap = maxChapter - setupScene.chapterNo;
      if (chapterGap >= 5) {
        results.push({
          ruleCode: 'FORESHADOW_UNRESOLVED',
          severity: 'medium',
          title: '\ubbf8\ud68c\uc218 \uc2a4\ub808\ub4dc',
          message: `\uc2a4\ub808\ub4dc "${thread.title}" (${setupScene.chapterNo}\uc7a5 \uc124\uc815)\uc774 ${chapterGap}\uac1c \uc7a5\uc5d0 \uac78\uccd0 \ubbf8\ud68c\uc218\uc785\ub2c8\ub2e4.`,
          bookId: null, chapterId: null, sceneId: null, boardSceneId: setupScene.id,
          relatedEntityIds: thread.relatedEntityIds ?? [],
          evidence: [
            { sourceType: 'board_scene', sourceId: setupScene.id, snippetText: `\uc124\uc815: ${setupScene.chapterNo}\uc7a5`, startOffset: null, endOffset: null },
          ],
          suggestedActions: [
            { label: '\ud68c\uc218 \uc7a5\uba74 \uc9c0\uc815', actionType: 'edit', targetType: 'thread', targetId: thread.id },
          ],
        });
      } else if (chapterGap >= 3) {
        results.push({
          ruleCode: 'FORESHADOW_UNRESOLVED',
          severity: 'low',
          title: '\ubbf8\ud68c\uc218 \uc2a4\ub808\ub4dc \uc8fc\uc758',
          message: `\uc2a4\ub808\ub4dc "${thread.title}" (${setupScene.chapterNo}\uc7a5)\uc774 ${chapterGap}\ucc55\ud130 \ub3d9\uc548 \ubbf8\ud68c\uc218\uc785\ub2c8\ub2e4.`,
          bookId: null, chapterId: null, sceneId: null, boardSceneId: setupScene.id,
          relatedEntityIds: [],
          evidence: [],
          suggestedActions: [
            { label: '\ud68c\uc218 \uacc4\ud68d \ud655\uc778', actionType: 'navigate', targetType: 'thread', targetId: thread.id },
          ],
        });
      }
    }

    // Also check legacy foreshadows for compatibility
    for (const fs of Object.values(state.foreshadows)) {
      if (fs.status !== 'open') continue;
      if (!fs.setupSceneId) continue;
      const setupScene = state.scenes[fs.setupSceneId];
      if (!setupScene) continue;
      const chapterGap = maxChapter - setupScene.chapterNo;
      if (chapterGap >= 5) {
        results.push({
          ruleCode: 'FORESHADOW_UNRESOLVED',
          severity: 'medium',
          title: '\ubbf8\ud68c\uc218 \ub5a1\ubc25',
          message: `\ub5a1\ubc25 "${fs.note}" (${setupScene.chapterNo}\uc7a5)\uc774 ${chapterGap}\ucc55\ud130 \ub3d9\uc548 \ubbf8\ud68c\uc218\uc785\ub2c8\ub2e4.`,
          bookId: null, chapterId: null, sceneId: null, boardSceneId: setupScene.id,
          relatedEntityIds: [],
          evidence: [
            { sourceType: 'board_scene', sourceId: setupScene.id, snippetText: `\uc124\uc815 \uc7a5\uba74`, startOffset: null, endOffset: null },
          ],
          suggestedActions: [],
        });
      }
    }
    return results;
  },
};

// ---------------------------------------------------------------------------
// 6. PAYOFF_WITHOUT_SETUP
// ---------------------------------------------------------------------------
export const payoffWithoutSetupRule: ConsistencyRule = {
  code: 'PAYOFF_WITHOUT_SETUP',
  name: '\uc124\uc815 \uc5c6\ub294 \ud68c\uc218',
  description: '\ud68c\uc218 \uc7a5\uba74\uc774 \uc788\uc9c0\ub9cc \uc124\uc815 \uc7a5\uba74\uc774 \uc5c6\uac70\ub098, \ud68c\uc218\uac00 \uc124\uc815\ubcf4\ub2e4 \uba3c\uc800\uc785\ub2c8\ub2e4.',
  scope: 'project',
  run: (ctx) => {
    const { state } = ctx;
    const results: ConsistencyRuleResult[] = [];

    for (const thread of Object.values(state.narrativeThreads)) {
      if (thread.type !== 'foreshadow' && thread.type !== 'mystery') continue;

      // Payoff exists but no setup
      if (thread.payoffSceneId && !thread.setupSceneId) {
        results.push({
          ruleCode: 'PAYOFF_WITHOUT_SETUP',
          severity: 'medium',
          title: '\uc124\uc815 \uc5c6\ub294 \ud68c\uc218',
          message: `\uc2a4\ub808\ub4dc "${thread.title}"\uc5d0 \ud68c\uc218 \uc7a5\uba74\uc740 \uc788\uc9c0\ub9cc \uc124\uc815 \uc7a5\uba74\uc774 \uc5c6\uc2b5\ub2c8\ub2e4.`,
          bookId: null, chapterId: null, sceneId: null, boardSceneId: thread.payoffSceneId,
          relatedEntityIds: thread.relatedEntityIds ?? [],
          evidence: [],
          suggestedActions: [
            { label: '\uc124\uc815 \uc7a5\uba74 \uc9c0\uc815', actionType: 'edit', targetType: 'thread', targetId: thread.id },
          ],
        });
      }

      // Payoff before setup (timeline check)
      if (thread.setupSceneId && thread.payoffSceneId) {
        const setupScene = state.scenes[thread.setupSceneId];
        const payoffScene = state.scenes[thread.payoffSceneId];
        if (setupScene && payoffScene &&
            setupScene.timelineIndex > 0 && payoffScene.timelineIndex > 0 &&
            payoffScene.timelineIndex < setupScene.timelineIndex) {
          results.push({
            ruleCode: 'PAYOFF_WITHOUT_SETUP',
            severity: 'medium',
            title: '\ud68c\uc218\uac00 \uc124\uc815\ubcf4\ub2e4 \uba3c\uc800',
            message: `\uc2a4\ub808\ub4dc "${thread.title}"\uc758 \ud68c\uc218(${payoffScene.timelineIndex}\ub144)\uac00 \uc124\uc815(${setupScene.timelineIndex}\ub144)\ubcf4\ub2e4 \uba3c\uc800\uc785\ub2c8\ub2e4.`,
            bookId: null, chapterId: null, sceneId: null, boardSceneId: thread.payoffSceneId,
            relatedEntityIds: [],
            evidence: [
              { sourceType: 'board_scene', sourceId: thread.setupSceneId, snippetText: `\uc124\uc815: ${setupScene.timelineIndex}\ub144`, startOffset: null, endOffset: null },
              { sourceType: 'board_scene', sourceId: thread.payoffSceneId, snippetText: `\ud68c\uc218: ${payoffScene.timelineIndex}\ub144`, startOffset: null, endOffset: null },
            ],
            suggestedActions: [
              { label: '\uc2dc\uac04\uc120 \uc870\uc815', actionType: 'edit', targetType: 'thread', targetId: thread.id },
            ],
          });
        }
      }
    }
    return results;
  },
};

// ---------------------------------------------------------------------------
// 7. UNLINKED_ENTITY_REVIEW
// ---------------------------------------------------------------------------
export const unlinkedEntityReviewRule: ConsistencyRule = {
  code: 'UNLINKED_ENTITY_REVIEW',
  name: '\ubbf8\uc5f0\uacb0 \uc5d4\ud2f0\ud2f0 \uac80\ud1a0',
  description: '\uc6d0\uace0\uc5d0 \uc5d4\ud2f0\ud2f0 \uc774\ub984\uc774 \ub4f1\uc7a5\ud558\uc9c0\ub9cc \ub9c1\ud06c\uac00 \uc5c6\uc2b5\ub2c8\ub2e4.',
  scope: 'project',
  run: (ctx) => {
    const { state } = ctx;
    const results: ConsistencyRuleResult[] = [];

    // Build entity name set
    const entityNames = new Map<string, { id: string; type: string; name: string }>();
    for (const c of Object.values(state.characters)) {
      entityNames.set(c.name.toLowerCase(), { id: c.id, type: 'character', name: c.name });
    }
    for (const l of Object.values(state.locations)) {
      entityNames.set(l.name.toLowerCase(), { id: l.id, type: 'location', name: l.name });
    }
    for (const f of Object.values(state.factions)) {
      entityNames.set(f.name.toLowerCase(), { id: f.id, type: 'faction', name: f.name });
    }

    // Check manuscript chapters for entity names without links
    for (const mc of Object.values(state.manuscriptChapters)) {
      if (!mc.content || mc.content.length < 10) continue;
      const contentLower = mc.content.toLowerCase();

      // Get linked entities for this chapter
      const linkedIds = new Set(
        Object.values(state.textEntityReferences)
          .filter((r) => r.manuscriptSceneId === mc.id)
          .map((r) => r.entityId)
      );

      for (const [name, entity] of entityNames) {
        if (name.length < 2) continue; // Skip very short names
        if (linkedIds.has(entity.id)) continue; // Already linked
        if (contentLower.includes(name)) {
          results.push({
            ruleCode: 'UNLINKED_ENTITY_REVIEW',
            severity: 'low',
            title: '\ubbf8\uc5f0\uacb0 \uc5d4\ud2f0\ud2f0 \uac80\ud1a0',
            message: `\uc6d0\uace0 "${mc.title}"\uc5d0 "${entity.name}"\uc774(\uac00) \ub4f1\uc7a5\ud558\uc9c0\ub9cc \uc5d4\ud2f0\ud2f0 \ub9c1\ud06c\uac00 \uc5c6\uc2b5\ub2c8\ub2e4.`,
            bookId: mc.bookId, chapterId: mc.id, sceneId: null, boardSceneId: null,
            relatedEntityIds: [entity.id],
            evidence: [
              { sourceType: 'manuscript_scene', sourceId: mc.id, snippetText: `"${entity.name}" \ubc1c\uacac`, startOffset: null, endOffset: null },
            ],
            suggestedActions: [
              { label: '\uc5d4\ud2f0\ud2f0 \ub9c1\ud06c', actionType: 'link', targetType: 'entity', targetId: entity.id },
            ],
          });
          break; // One issue per chapter-entity pair
        }
      }
    }
    return results;
  },
};

// ---------------------------------------------------------------------------
// 8. PROPOSAL_CANON_CONFLICT
// ---------------------------------------------------------------------------
export const proposalCanonConflictRule: ConsistencyRule = {
  code: 'PROPOSAL_CANON_CONFLICT',
  name: '\uc81c\uc548-\uc815\ubcf8 \ucda9\ub3cc',
  description: '\ub300\uae30 \uc911\uc778 \uc81c\uc548\uc774 \uc2b9\uc778\ub41c \uc815\ubcf8 \uc0ac\uc2e4\uacfc \ucda9\ub3cc\ud569\ub2c8\ub2e4.',
  scope: 'project',
  run: (ctx) => {
    const { state } = ctx;
    const results: ConsistencyRuleResult[] = [];

    for (const proposal of Object.values(state.extractedProposals)) {
      if (proposal.status !== 'pending') continue;
      if (!proposal.targetEntityId) continue;

      // Check state_change proposals against canon
      if (proposal.proposalType === 'state_change') {
        const char = state.characters[proposal.targetEntityId];
        if (char) {
          // If proposal suggests death but character is already dead in canon
          const descLower = proposal.description.toLowerCase();
          if ((descLower.includes('\uc0ac\ub9dd') || descLower.includes('\uc804\uc0ac')) && char.deathYear != null) {
            results.push({
              ruleCode: 'PROPOSAL_CANON_CONFLICT',
              severity: 'low', // proposal alone cannot be high
              title: '\uc81c\uc548-\uc815\ubcf8 \ucda9\ub3cc',
              message: `\uc81c\uc548 "${proposal.description}"\uc774 \uc815\ubcf8\uc758 \uc0ac\ub9dd\ub144\ub3c4(${char.deathYear}\ub144)\uc640 \uc911\ubcf5\ub420 \uc218 \uc788\uc2b5\ub2c8\ub2e4.`,
              bookId: null, chapterId: null, sceneId: proposal.manuscriptSceneId, boardSceneId: null,
              relatedEntityIds: [proposal.targetEntityId],
              evidence: [
                { sourceType: 'proposal', sourceId: proposal.id, snippetText: proposal.description, startOffset: null, endOffset: null },
                { sourceType: 'wiki_entity', sourceId: proposal.targetEntityId, snippetText: `\uc0ac\ub9dd\ub144\ub3c4: ${char.deathYear}`, startOffset: null, endOffset: null },
              ],
              suggestedActions: [
                { label: '\uc81c\uc548 \uac80\ud1a0', actionType: 'navigate', targetType: 'proposal', targetId: proposal.id },
              ],
            });
          }
        }
      }
    }
    return results;
  },
};

// ---------------------------------------------------------------------------
// Export all rules
// ---------------------------------------------------------------------------
export const boardThreadProposalRules: ConsistencyRule[] = [
  boardRequiredEntityMissingRule,
  boardLocationMismatchRule,
  boardTimelineMismatchRule,
  boardGoalMismatchRule,
  foreshadowUnresolvedRule,
  payoffWithoutSetupRule,
  unlinkedEntityReviewRule,
  proposalCanonConflictRule,
];
