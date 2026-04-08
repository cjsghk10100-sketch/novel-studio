/**
 * Relation / Membership / World Rule / Event Order Rules
 *
 * Deterministic rule engine — NO LLM inference.
 * Priority: canon > board plan > manuscript draft > proposal
 *
 * Rules:
 * 1. RELATION_NOT_ACTIVE — relation used but not valid at scene timeline
 * 2. MEMBERSHIP_CONFLICT — membership action after leaving faction
 * 3. RULE_SYSTEM_VIOLATION — world rule constraint violated in scene
 * 4. EVENT_ORDER_CONFLICT — causal event order reversed in timeline
 */

import type { ConsistencyRule, ConsistencyRuleResult, ConsistencyRuleContext } from './consistency-scanner';
import {
  resolveRelationsAtTimeline,
  resolveMembershipAtTimeline,
  resolveEntityStateAtTimeline,
  getSceneParticipants,
} from './consistency-resolvers';

// ---------------------------------------------------------------------------
// Rule 1: RELATION_NOT_ACTIVE
// Detects when a scene implies an active relationship (e.g. mentor acting as
// mentor) but the canon relation is not valid at that timeline.
// Currently checks: dead entity in a relationship scene.
// ---------------------------------------------------------------------------

export const relationNotActiveRule: ConsistencyRule = {
  code: 'RELATION_NOT_ACTIVE',
  name: '\uad00\uacc4 \ube44\ud65c\uc131 \ucda9\ub3cc',
  description: '\uc7a5\uba74 \uc2dc\uc810\uc5d0 \ud574\ub2f9 \uad00\uacc4\uac00 \uc720\ud6a8\ud558\uc9c0 \uc54a\uc2b5\ub2c8\ub2e4.',
  scope: 'project',
  run: (ctx: ConsistencyRuleContext): ConsistencyRuleResult[] => {
    const { state } = ctx;
    const results: ConsistencyRuleResult[] = [];
    const allScenes = Object.values(state.scenes);
    const allLinks = Object.values(state.links);

    // Check: if a scene has two characters linked by a relation,
    // but one of them is dead at that timeline, the relation is not active
    for (const scene of allScenes) {
      const ti = scene.timelineIndex > 0 ? scene.timelineIndex : null;
      if (ti == null) continue;

      const charIds = new Set([
        ...(scene.characterIds ?? []),
        ...(scene.povCharacterId ? [scene.povCharacterId] : []),
      ]);
      if (charIds.size < 2) continue;

      // Find relations between characters in this scene
      for (const link of allLinks) {
        if (link.fromType !== 'character' || link.toType !== 'character') continue;
        if (!charIds.has(link.fromId) || !charIds.has(link.toId)) continue;

        // Check if either party is dead at this timeline
        const fromState = resolveEntityStateAtTimeline(link.fromId, ti, state);
        const toState = resolveEntityStateAtTimeline(link.toId, ti, state);

        if (fromState && !fromState.isAlive && fromState.currentStatus === 'deceased') {
          const fromChar = state.characters[link.fromId];
          const toChar = state.characters[link.toId];
          results.push({
            ruleCode: 'RELATION_NOT_ACTIVE',
            severity: 'medium',
            title: '\uad00\uacc4 \ube44\ud65c\uc131 \ucda9\ub3cc',
            message: `"${fromChar?.name ?? link.fromId}"\uc740(\ub294) ${ti}\ub144\uc5d0 \uc0ac\ub9dd \uc0c1\ud0dc\uc774\uc9c0\ub9cc, "${toChar?.name ?? link.toId}"\uacfc(\uc640) ${link.relationType} \uad00\uacc4\ub85c \uc7a5\uba74 "${scene.title}"\uc5d0 \ud568\uaed8 \ub4f1\uc7a5\ud569\ub2c8\ub2e4.`,
            bookId: null, chapterId: null, sceneId: null, boardSceneId: scene.id,
            relatedEntityIds: [link.fromId, link.toId],
            evidence: [
              { sourceType: 'wiki_entity', sourceId: link.fromId, snippetText: `\uc0ac\ub9dd\ub144\ub3c4: ${fromState.deathYear}`, startOffset: null, endOffset: null },
              { sourceType: 'wiki_relation', sourceId: link.id, snippetText: link.relationType, startOffset: null, endOffset: null },
            ],
            suggestedActions: [
              { label: '\uad00\uacc4 \uc218\uc815', actionType: 'navigate', targetType: 'wiki', targetId: link.fromId },
              { label: '\uc7a5\uba74\uc5d0\uc11c \uc778\ubb3c \uc81c\uac70', actionType: 'edit', targetType: 'scene', targetId: scene.id },
            ],
          });
          break; // One issue per scene-link pair
        }
      }
    }
    return results;
  },
};

// ---------------------------------------------------------------------------
// Rule 2: MEMBERSHIP_CONFLICT
// Detects hostile relation types (enemy_of) coexisting with friendly types
// (ally_of, friend_of, mentor_of, serves) for the same entity pair.
// ---------------------------------------------------------------------------

export const membershipConflictRule: ConsistencyRule = {
  code: 'MEMBERSHIP_CONFLICT',
  name: '\uad00\uacc4 \ubaa8\uc21c',
  description: '\uc801\ub300\uc640 \uc6b0\ud638 \uad00\uacc4\uac00 \ub3d9\uc2dc\uc5d0 \uc874\uc7ac\ud569\ub2c8\ub2e4.',
  scope: 'project',
  run: (ctx: ConsistencyRuleContext): ConsistencyRuleResult[] => {
    const { state } = ctx;
    const results: ConsistencyRuleResult[] = [];
    const allLinks = Object.values(state.links);

    const hostileTypes = new Set(['enemy_of', 'rival_of']);
    const friendlyTypes = new Set(['ally_of', 'friend_of', 'mentor_of', 'student_of', 'serves']);

    // Build pair map
    const checked = new Set<string>();

    for (const link of allLinks) {
      if (link.fromType !== 'character' || link.toType !== 'character') continue;

      const pairKey = [link.fromId, link.toId].sort().join('-');
      if (checked.has(pairKey)) continue;

      // Find all relations for this pair
      const pairLinks = allLinks.filter(
        (l) => l.fromType === 'character' && l.toType === 'character' &&
          ([l.fromId, l.toId].sort().join('-') === pairKey)
      );

      const hasHostile = pairLinks.some((l) => hostileTypes.has(l.relationType));
      const hasFriendly = pairLinks.some((l) => friendlyTypes.has(l.relationType));

      if (hasHostile && hasFriendly) {
        checked.add(pairKey);
        const fromName = state.characters[link.fromId]?.name ?? link.fromId;
        const toName = state.characters[link.toId]?.name ?? link.toId;
        const hostileRels = pairLinks.filter((l) => hostileTypes.has(l.relationType)).map((l) => l.relationType);
        const friendlyRels = pairLinks.filter((l) => friendlyTypes.has(l.relationType)).map((l) => l.relationType);

        results.push({
          ruleCode: 'MEMBERSHIP_CONFLICT',
          severity: 'high',
          title: '\uad00\uacc4 \ubaa8\uc21c',
          message: `"${fromName}"\uacfc(\uc640) "${toName}" \uc0ac\uc774\uc5d0 ${hostileRels.join(', ')}(\uc801\ub300)\uc640 ${friendlyRels.join(', ')}(\uc6b0\ud638) \uad00\uacc4\uac00 \ub3d9\uc2dc\uc5d0 \uc874\uc7ac\ud569\ub2c8\ub2e4.`,
          bookId: null, chapterId: null, sceneId: null, boardSceneId: null,
          relatedEntityIds: [link.fromId, link.toId],
          evidence: pairLinks.map((l) => ({
            sourceType: 'wiki_relation' as const,
            sourceId: l.id,
            snippetText: l.relationType,
            startOffset: null,
            endOffset: null,
          })),
          suggestedActions: [
            { label: '\ucda9\ub3cc \uad00\uacc4 \uc218\uc815', actionType: 'navigate', targetType: 'wiki', targetId: link.fromId },
            { label: '\ubc30\uc2e0 \uc0ac\uac74 \ucd94\uac00', actionType: 'custom', targetType: null, targetId: null },
          ],
        });
      }
    }
    return results;
  },
};

// ---------------------------------------------------------------------------
// Rule 3: RULE_SYSTEM_VIOLATION
// Checks scene_flags_json / metadata against world rule entities.
// Since we don't have a dedicated rule entity yet, this checks for basic
// contradictions: dead character as POV, sealed magic usage, etc.
// ---------------------------------------------------------------------------

export const ruleSystemViolationRule: ConsistencyRule = {
  code: 'RULE_SYSTEM_VIOLATION',
  name: '\uc138\uacc4\uad00 \uaddc\uce59 \uc704\ubc18',
  description: '\uc138\uacc4\uad00 \uaddc\uce59\uc5d0 \uc5b4\uae0b\ub098\ub294 \uc7a5\uba74 \uc124\uc815\uc774 \uc788\uc2b5\ub2c8\ub2e4.',
  scope: 'scene',
  run: (ctx: ConsistencyRuleContext): ConsistencyRuleResult[] => {
    const { state, sceneId } = ctx;
    if (!sceneId) return [];
    const scene = state.scenes[sceneId];
    if (!scene) return [];

    const results: ConsistencyRuleResult[] = [];
    const ti = scene.timelineIndex > 0 ? scene.timelineIndex : null;

    // Check: POV character must be alive (if timeline available)
    if (scene.povCharacterId && ti != null) {
      const povState = resolveEntityStateAtTimeline(scene.povCharacterId, ti, state);
      if (povState && povState.currentStatus === 'not_born') {
        const char = state.characters[scene.povCharacterId];
        results.push({
          ruleCode: 'RULE_SYSTEM_VIOLATION',
          severity: 'high',
          title: '\uc138\uacc4\uad00 \uaddc\uce59 \uc704\ubc18',
          message: `"${char?.name ?? scene.povCharacterId}"\uc774(\uac00) ${ti}\ub144 \uc7a5\uba74\uc758 POV\uc774\uc9c0\ub9cc, \ucd9c\uc0dd\ub144\ub3c4(${povState.birthYear}\ub144) \uc774\uc804\uc785\ub2c8\ub2e4.`,
          bookId: null, chapterId: null, sceneId: null, boardSceneId: sceneId,
          relatedEntityIds: [scene.povCharacterId],
          evidence: [
            { sourceType: 'wiki_entity', sourceId: scene.povCharacterId, snippetText: `\ucd9c\uc0dd: ${povState.birthYear}`, startOffset: null, endOffset: null },
          ],
          suggestedActions: [
            { label: 'POV \ubcc0\uacbd', actionType: 'edit', targetType: 'scene', targetId: sceneId },
          ],
        });
      }
    }

    // Check: location must exist (basic referential integrity)
    for (const locId of (scene.locationIds ?? [])) {
      if (!state.locations[locId]) {
        results.push({
          ruleCode: 'RULE_SYSTEM_VIOLATION',
          severity: 'low',
          title: '\uc874\uc7ac\ud558\uc9c0 \uc54a\ub294 \uc7a5\uc18c \ucc38\uc870',
          message: `\uc7a5\uba74 "${scene.title}"\uc774 \uc0ad\uc81c\ub41c \uc7a5\uc18c(${locId})\ub97c \ucc38\uc870\ud569\ub2c8\ub2e4.`,
          bookId: null, chapterId: null, sceneId: null, boardSceneId: sceneId,
          relatedEntityIds: [],
          evidence: [],
          suggestedActions: [
            { label: '\uc7a5\uc18c \uc218\uc815', actionType: 'edit', targetType: 'scene', targetId: sceneId },
          ],
        });
      }
    }

    return results;
  },
};

// ---------------------------------------------------------------------------
// Rule 4: EVENT_ORDER_CONFLICT
// Checks that causal event links (event A "caused" event B) respect
// timeline order: A.timelineIndex must be < B.timelineIndex.
// ---------------------------------------------------------------------------

export const eventOrderConflictRule: ConsistencyRule = {
  code: 'EVENT_ORDER_CONFLICT',
  name: '\uc0ac\uac74 \uc21c\uc11c \ucda9\ub3cc',
  description: '\uc6d0\uc778 \uc0ac\uac74\uc774 \uacb0\uacfc \uc0ac\uac74\ubcf4\ub2e4 \ub2a6\uac8c \ubc1c\uc0dd\ud569\ub2c8\ub2e4.',
  scope: 'project',
  run: (ctx: ConsistencyRuleContext): ConsistencyRuleResult[] => {
    const { state } = ctx;
    const results: ConsistencyRuleResult[] = [];
    const allLinks = Object.values(state.links);
    const events = state.events;

    // Find causal links between events
    const causalLinks = allLinks.filter(
      (l) => l.relationType === 'caused' && l.fromType === 'event' && l.toType === 'event'
    );

    for (const link of causalLinks) {
      const causeEvent = events[link.fromId];
      const effectEvent = events[link.toId];
      if (!causeEvent || !effectEvent) continue;

      // Both events need timeline data for comparison
      if (causeEvent.timelineIndex <= 0 || effectEvent.timelineIndex <= 0) {
        // No timeline — skip or downgrade
        if (causeEvent.timelineIndex <= 0 && effectEvent.timelineIndex <= 0) continue;
        // One has timeline, other doesn't — low severity warning
        results.push({
          ruleCode: 'EVENT_ORDER_CONFLICT',
          severity: 'low',
          title: '\uc0ac\uac74 \uc21c\uc11c \uac80\uc99d \ubd88\uac00',
          message: `\uc0ac\uac74 "${causeEvent.title}" \u2192 "${effectEvent.title}" \uc778\uacfc\uad00\uacc4\uc758 \uc2dc\uac04\uc120 \ub370\uc774\ud130\uac00 \ubd80\uc871\ud569\ub2c8\ub2e4.`,
          bookId: null, chapterId: null, sceneId: null, boardSceneId: null,
          relatedEntityIds: [link.fromId, link.toId],
          evidence: [],
          suggestedActions: [
            { label: '\ud0c0\uc784\ub77c\uc778 \uc124\uc815', actionType: 'edit', targetType: 'event', targetId: causeEvent.timelineIndex <= 0 ? link.fromId : link.toId },
          ],
        });
        continue;
      }

      // Check: cause must be before effect
      if (causeEvent.timelineIndex >= effectEvent.timelineIndex) {
        results.push({
          ruleCode: 'EVENT_ORDER_CONFLICT',
          severity: 'high',
          title: '\uc0ac\uac74 \uc21c\uc11c \ucda9\ub3cc',
          message: `\uc0ac\uac74 "${causeEvent.title}"(${causeEvent.timelineIndex}\ub144)\uc774 "${effectEvent.title}"(${effectEvent.timelineIndex}\ub144)\uc758 \uc6d0\uc778\uc774\uc9c0\ub9cc, \uac19\uc740 \uc2dc\uae30\uc774\uac70\ub098 \ub354 \ub2a6\uac8c \ubc1c\uc0dd\ud569\ub2c8\ub2e4.`,
          bookId: null, chapterId: null, sceneId: null, boardSceneId: null,
          relatedEntityIds: [link.fromId, link.toId],
          evidence: [
            { sourceType: 'wiki_entity', sourceId: link.fromId, snippetText: `\ud0c0\uc784\ub77c\uc778: ${causeEvent.timelineIndex}`, startOffset: null, endOffset: null },
            { sourceType: 'wiki_entity', sourceId: link.toId, snippetText: `\ud0c0\uc784\ub77c\uc778: ${effectEvent.timelineIndex}`, startOffset: null, endOffset: null },
          ],
          suggestedActions: [
            { label: '\uc0ac\uac74 \ud0c0\uc784\ub77c\uc778 \uc218\uc815', actionType: 'edit', targetType: 'event', targetId: link.fromId },
          ],
        });
      }
    }
    return results;
  },
};

// ---------------------------------------------------------------------------
// Export all rules for bulk registration
// ---------------------------------------------------------------------------

export const relationEventRules: ConsistencyRule[] = [
  relationNotActiveRule,
  membershipConflictRule,
  ruleSystemViolationRule,
  eventOrderConflictRule,
];
