/**
 * Character / Timeline Consistency Rules
 *
 * Deterministic rule engine — NO LLM inference.
 * Priority: canon > board plan > manuscript draft > proposal
 *
 * Rules:
 * 1. CHAR_BEFORE_BIRTH — character appears before birth year
 * 2. CHAR_AFTER_DEATH — character appears after death year
 * 3. CHAR_STATE_CONFLICT — character state contradicts canon
 * 4. CHAR_DUAL_LOCATION — same character in two locations at same time
 * 5. SCENE_TIMELINE_MISSING — scene lacks timeline data
 */

import type { ConsistencyRule, ConsistencyRuleResult, ConsistencyRuleContext } from './consistency-scanner';
import { resolveEntityStateAtTimeline, getSceneParticipants } from './consistency-resolvers';

// ---------------------------------------------------------------------------
// Rule 1: CHAR_BEFORE_BIRTH
// ---------------------------------------------------------------------------

export const charBeforeBirthRule: ConsistencyRule = {
  code: 'CHAR_BEFORE_BIRTH',
  name: '\ucd9c\uc0dd \uc804 \ub4f1\uc7a5',
  description: '\uc778\ubb3c\uc774 \ucd9c\uc0dd\ud558\uae30 \uc804 \uc2dc\uc810\uc758 \uc7a5\uba74\uc5d0 \ub4f1\uc7a5\ud569\ub2c8\ub2e4.',
  scope: 'scene',
  run: (ctx: ConsistencyRuleContext): ConsistencyRuleResult[] => {
    const { state, sceneId } = ctx;
    if (!sceneId) return [];
    const scene = state.scenes[sceneId];
    if (!scene) return [];

    const timelineOrder = scene.timelineIndex > 0 ? scene.timelineIndex : null;
    if (timelineOrder == null) return []; // No timeline — skip temporal rule

    const results: ConsistencyRuleResult[] = [];
    const participants = getSceneParticipants(sceneId, state);
    const allCharIds = new Set([
      ...participants.characterIds,
      ...(participants.povCharacterId ? [participants.povCharacterId] : []),
    ]);

    for (const charId of allCharIds) {
      const entityState = resolveEntityStateAtTimeline(charId, timelineOrder, state);
      if (!entityState) continue;
      if (entityState.birthYear != null && timelineOrder < entityState.birthYear) {
        const char = state.characters[charId];
        results.push({
          ruleCode: 'CHAR_BEFORE_BIRTH',
          severity: 'high',
          title: '\ucd9c\uc0dd \uc804 \ub4f1\uc7a5 \ucda9\ub3cc',
          message: `"${char?.name ?? charId}"\uc774(\uac00) \uc7a5\uba74 "${scene.title}" (${timelineOrder}\ub144)\uc5d0 \ub4f1\uc7a5\ud558\uc9c0\ub9cc, \ucd9c\uc0dd\ub144\ub3c4\ub294 ${entityState.birthYear}\ub144\uc785\ub2c8\ub2e4.`,
          bookId: null,
          chapterId: null,
          sceneId: null,
          boardSceneId: sceneId,
          relatedEntityIds: [charId],
          evidence: [
            { sourceType: 'wiki_entity', sourceId: charId, snippetText: `\ucd9c\uc0dd\ub144\ub3c4: ${entityState.birthYear}`, startOffset: null, endOffset: null },
            { sourceType: 'board_scene', sourceId: sceneId, snippetText: `\ud0c0\uc784\ub77c\uc778: ${timelineOrder}`, startOffset: null, endOffset: null },
          ],
          suggestedActions: [
            { label: '\uc7a5\uba74\uc5d0\uc11c \uc778\ubb3c \uc81c\uac70', actionType: 'edit', targetType: 'scene', targetId: sceneId },
            { label: '\ucd9c\uc0dd\ub144\ub3c4 \uc218\uc815', actionType: 'edit', targetType: 'character', targetId: charId },
          ],
        });
      }
    }
    return results;
  },
};

// ---------------------------------------------------------------------------
// Rule 2: CHAR_AFTER_DEATH
// ---------------------------------------------------------------------------

export const charAfterDeathRule: ConsistencyRule = {
  code: 'CHAR_AFTER_DEATH',
  name: '\uc0ac\ub9dd \ud6c4 \ub4f1\uc7a5',
  description: '\uc0ac\ub9dd\ud55c \uc778\ubb3c\uc774 \uc0ac\ub9dd \uc2dc\uc810 \uc774\ud6c4 \uc7a5\uba74\uc5d0 \ub4f1\uc7a5\ud569\ub2c8\ub2e4.',
  scope: 'scene',
  run: (ctx: ConsistencyRuleContext): ConsistencyRuleResult[] => {
    const { state, sceneId } = ctx;
    if (!sceneId) return [];
    const scene = state.scenes[sceneId];
    if (!scene) return [];

    const timelineOrder = scene.timelineIndex > 0 ? scene.timelineIndex : null;
    if (timelineOrder == null) return [];

    const results: ConsistencyRuleResult[] = [];
    const participants = getSceneParticipants(sceneId, state);
    const allCharIds = new Set([
      ...participants.characterIds,
      ...(participants.povCharacterId ? [participants.povCharacterId] : []),
    ]);

    for (const charId of allCharIds) {
      const entityState = resolveEntityStateAtTimeline(charId, timelineOrder, state);
      if (!entityState) continue;
      if (entityState.deathYear != null && timelineOrder > entityState.deathYear) {
        const char = state.characters[charId];
        results.push({
          ruleCode: 'CHAR_AFTER_DEATH',
          severity: 'high',
          title: '\uc0ac\ub9dd \ud6c4 \ub4f1\uc7a5 \ucda9\ub3cc',
          message: `"${char?.name ?? charId}"\uc740(\ub294) ${entityState.deathYear}\ub144\uc5d0 \uc0ac\ub9dd\ud588\uc9c0\ub9cc, \uc7a5\uba74 "${scene.title}" (${timelineOrder}\ub144)\uc5d0 \ub4f1\uc7a5\ud569\ub2c8\ub2e4.`,
          bookId: null,
          chapterId: null,
          sceneId: null,
          boardSceneId: sceneId,
          relatedEntityIds: [charId],
          evidence: [
            { sourceType: 'wiki_entity', sourceId: charId, snippetText: `\uc0ac\ub9dd\ub144\ub3c4: ${entityState.deathYear}`, startOffset: null, endOffset: null },
            { sourceType: 'board_scene', sourceId: sceneId, snippetText: `\ud0c0\uc784\ub77c\uc778: ${timelineOrder}`, startOffset: null, endOffset: null },
          ],
          suggestedActions: [
            { label: '\uc7a5\uba74\uc5d0\uc11c \uc778\ubb3c \uc81c\uac70', actionType: 'edit', targetType: 'scene', targetId: sceneId },
            { label: '\ud68c\uc0c1/\uc720\ub839\uc73c\ub85c \ud45c\uc2dc', actionType: 'edit', targetType: 'scene', targetId: sceneId },
          ],
        });
      }
    }
    return results;
  },
};

// ---------------------------------------------------------------------------
// Rule 3: CHAR_STATE_CONFLICT
// ---------------------------------------------------------------------------

export const charStateConflictRule: ConsistencyRule = {
  code: 'CHAR_STATE_CONFLICT',
  name: '\uc778\ubb3c \uc0c1\ud0dc \ucda9\ub3cc',
  description: '\uc778\ubb3c\uc758 \uc815\ubcf8 \uc0c1\ud0dc\uc640 \uc7a5\uba74 \ub0b4 \uc0c1\ud0dc\uac00 \ucda9\ub3cc\ud569\ub2c8\ub2e4.',
  scope: 'scene',
  run: (ctx: ConsistencyRuleContext): ConsistencyRuleResult[] => {
    const { state, sceneId } = ctx;
    if (!sceneId) return [];
    const scene = state.scenes[sceneId];
    if (!scene) return [];

    const timelineOrder = scene.timelineIndex > 0 ? scene.timelineIndex : null;
    // Without timeline we can still check dead characters appearing
    const results: ConsistencyRuleResult[] = [];
    const participants = getSceneParticipants(sceneId, state);

    // POV character is "active" — check if that contradicts canon
    if (participants.povCharacterId) {
      const povState = resolveEntityStateAtTimeline(participants.povCharacterId, timelineOrder, state);
      if (povState && !povState.isAlive && povState.currentStatus === 'deceased') {
        const char = state.characters[participants.povCharacterId];
        results.push({
          ruleCode: 'CHAR_STATE_CONFLICT',
          severity: 'high',
          title: '\uc778\ubb3c \uc0c1\ud0dc \ucda9\ub3cc',
          message: `"${char?.name ?? participants.povCharacterId}"\uc774(\uac00) \uc7a5\uba74 "${scene.title}"\uc5d0\uc11c POV\ub85c \ud65c\ub3d9\ud558\uc9c0\ub9cc, \uc815\ubcf8 \uc0c1\ud0dc\ub294 \uc0ac\ub9dd\uc785\ub2c8\ub2e4.`,
          bookId: null, chapterId: null, sceneId: null, boardSceneId: sceneId,
          relatedEntityIds: [participants.povCharacterId],
          evidence: [
            { sourceType: 'wiki_entity', sourceId: participants.povCharacterId, snippetText: `\uc0c1\ud0dc: ${povState.currentStatus}`, startOffset: null, endOffset: null },
          ],
          suggestedActions: [
            { label: 'POV \uc778\ubb3c \ubcc0\uacbd', actionType: 'edit', targetType: 'scene', targetId: sceneId },
          ],
        });
      }
    }
    return results;
  },
};

// ---------------------------------------------------------------------------
// Rule 4: CHAR_DUAL_LOCATION
// ---------------------------------------------------------------------------

export const charDualLocationRule: ConsistencyRule = {
  code: 'CHAR_DUAL_LOCATION',
  name: '\uc774\uc911 \uc704\uce58 \ucda9\ub3cc',
  description: '\uac19\uc740 \uc778\ubb3c\uc774 \uac19\uc740 \uc2dc\uc810\uc5d0 \uc11c\ub85c \ub2e4\ub978 \uc7a5\uc18c\uc5d0 \ub4f1\uc7a5\ud569\ub2c8\ub2e4.',
  scope: 'project',
  run: (ctx: ConsistencyRuleContext): ConsistencyRuleResult[] => {
    const { state } = ctx;
    const results: ConsistencyRuleResult[] = [];
    const allScenes = Object.values(state.scenes);

    // Group scenes by timeline
    const timelineMap = new Map<number, typeof allScenes>();
    for (const s of allScenes) {
      if (s.timelineIndex <= 0) continue;
      const arr = timelineMap.get(s.timelineIndex) || [];
      arr.push(s);
      timelineMap.set(s.timelineIndex, arr);
    }

    for (const [ti, scenesAtTime] of timelineMap) {
      if (scenesAtTime.length < 2) continue;

      // Build character → location mapping at this time
      const charLocations = new Map<string, { sceneId: string; locationIds: string[] }[]>();

      for (const s of scenesAtTime) {
        const charIds = [
          ...(s.characterIds ?? []),
          ...(s.povCharacterId ? [s.povCharacterId] : []),
        ];
        for (const cid of new Set(charIds)) {
          const arr = charLocations.get(cid) || [];
          arr.push({ sceneId: s.id, locationIds: s.locationIds ?? [] });
          charLocations.set(cid, arr);
        }
      }

      for (const [charId, appearances] of charLocations) {
        if (appearances.length < 2) continue;

        // Check if locations differ
        for (let i = 0; i < appearances.length; i++) {
          for (let j = i + 1; j < appearances.length; j++) {
            const loc1 = appearances[i].locationIds;
            const loc2 = appearances[j].locationIds;
            if (loc1.length === 0 || loc2.length === 0) continue;

            const overlap = loc1.some((l) => loc2.includes(l));
            if (!overlap) {
              const char = state.characters[charId];
              const s1 = state.scenes[appearances[i].sceneId];
              const s2 = state.scenes[appearances[j].sceneId];
              const loc1Name = loc1.map((id) => state.locations[id]?.name ?? id).join(', ');
              const loc2Name = loc2.map((id) => state.locations[id]?.name ?? id).join(', ');

              results.push({
                ruleCode: 'CHAR_DUAL_LOCATION',
                severity: 'high',
                title: '\uc774\uc911 \uc704\uce58 \ucda9\ub3cc',
                message: `"${char?.name ?? charId}"\uc774(\uac00) ${ti}\ub144\uc5d0 "${s1?.title}"(${loc1Name})\uacfc "${s2?.title}"(${loc2Name})\uc5d0 \ub3d9\uc2dc \ub4f1\uc7a5\ud569\ub2c8\ub2e4.`,
                bookId: null, chapterId: null, sceneId: null,
                boardSceneId: appearances[i].sceneId,
                relatedEntityIds: [charId],
                evidence: [
                  { sourceType: 'board_scene', sourceId: appearances[i].sceneId, snippetText: `\uc7a5\uc18c: ${loc1Name}`, startOffset: null, endOffset: null },
                  { sourceType: 'board_scene', sourceId: appearances[j].sceneId, snippetText: `\uc7a5\uc18c: ${loc2Name}`, startOffset: null, endOffset: null },
                ],
                suggestedActions: [
                  { label: '\ud0c0\uc784\ub77c\uc778 \uc870\uc815', actionType: 'edit', targetType: 'scene', targetId: appearances[i].sceneId },
                  { label: '\uc774\ub3d9 \uc7a5\uba74 \ucd94\uac00', actionType: 'custom', targetType: null, targetId: null },
                ],
              });
            }
          }
        }
      }
    }
    return results;
  },
};

// ---------------------------------------------------------------------------
// Rule 5: SCENE_TIMELINE_MISSING
// ---------------------------------------------------------------------------

export const sceneTimelineMissingRule: ConsistencyRule = {
  code: 'SCENE_TIMELINE_MISSING',
  name: '\uc2dc\uac04\uc120 \ub204\ub77d',
  description: '\ube44\uad50\uac00 \ud544\uc694\ud55c \uc7a5\uba74\uc5d0 \ud0c0\uc784\ub77c\uc778 \ub370\uc774\ud130\uac00 \uc5c6\uc2b5\ub2c8\ub2e4.',
  scope: 'scene',
  run: (ctx: ConsistencyRuleContext): ConsistencyRuleResult[] => {
    const { state, sceneId } = ctx;
    if (!sceneId) return [];
    const scene = state.scenes[sceneId];
    if (!scene) return [];

    // Only flag scenes that have characters (meaningful scenes) but no timeline
    if (scene.timelineIndex > 0) return [];
    if ((scene.characterIds ?? []).length === 0 && !scene.povCharacterId) return [];

    return [{
      ruleCode: 'SCENE_TIMELINE_MISSING',
      severity: 'low',
      title: '\uc2dc\uac04\uc120 \ub204\ub77d',
      message: `\uc7a5\uba74 "${scene.title}"\uc5d0 \ud0c0\uc784\ub77c\uc778 \ub370\uc774\ud130\uac00 \uc5c6\uc5b4 \uc2dc\uac04 \uae30\ubc18 \uac80\uc0ac\ub97c \uc218\ud589\ud560 \uc218 \uc5c6\uc2b5\ub2c8\ub2e4.`,
      bookId: null, chapterId: null, sceneId: null, boardSceneId: sceneId,
      relatedEntityIds: [],
      evidence: [],
      suggestedActions: [
        { label: '\ud0c0\uc784\ub77c\uc778 \uc124\uc815', actionType: 'edit', targetType: 'scene', targetId: sceneId },
      ],
    }];
  },
};

// ---------------------------------------------------------------------------
// All character/timeline rules for bulk registration
// ---------------------------------------------------------------------------

export const characterTimelineRules: ConsistencyRule[] = [
  charBeforeBirthRule,
  charAfterDeathRule,
  charStateConflictRule,
  charDualLocationRule,
  sceneTimelineMissingRule,
];
