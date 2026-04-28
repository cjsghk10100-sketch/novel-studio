/**
 * Wiki ↔ Manuscript Direct Consistency Rules
 *
 * 보드(구성 보드) 없이 위키 데이터와 본편 원고를 직접 비교하는 규칙들.
 * 기존 규칙들은 모두 Board Scene을 중간 매개체로 사용했지만,
 * 이 규칙들은 manuscriptChapters + textEntityReferences + 위키 엔티티만으로 동작합니다.
 *
 * Rules:
 * 1. MS_DEAD_CHARACTER_APPEARS — 사망한 캐릭터가 본편에 등장
 * 2. MS_UNBORN_CHARACTER_APPEARS — 출생 전 캐릭터가 본편에 등장
 * 3. MS_DELETED_ENTITY_REFERENCED — 삭제된 위키 엔티티의 참조가 남아있음
 * 4. MS_CHARACTER_DUAL_CHAPTER — 같은 타임라인의 다른 챕터에서 캐릭터가 다른 장소에 동시 등장
 * 5. MS_WIKI_NAME_NOT_IN_TEXT — 위키 엔티티가 참조되었지만 본문에서 이름을 찾을 수 없음
 * 6. MS_ORPHAN_REFERENCE — 엔티티가 삭제되지는 않았지만 참조가 본문 내용과 불일치
 */

import type { ConsistencyRule, ConsistencyRuleResult, ConsistencyRuleContext } from './consistency-scanner';
import type { EntityType, TextEntityReference } from './novel-types';

// ---------------------------------------------------------------------------
// Helper: parse timelineLabel to numeric value
// ---------------------------------------------------------------------------

function parseTimeline(label: string): number | null {
  if (!label) return null;
  const n = Number(label);
  return !isNaN(n) && n > 0 ? n : null;
}

// Helper: entity name resolver
function getEntityName(
  entityType: EntityType,
  entityId: string,
  state: ConsistencyRuleContext['state'],
): string | null {
  switch (entityType) {
    case 'character': return state.characters[entityId]?.name ?? null;
    case 'location': return state.locations[entityId]?.name ?? null;
    case 'faction': return state.factions[entityId]?.name ?? null;
    case 'item': return state.items[entityId]?.name ?? null;
    case 'event': return state.events[entityId]?.title ?? null;
  }
}

// Helper: check entity existence
function entityExists(
  entityType: EntityType,
  entityId: string,
  state: ConsistencyRuleContext['state'],
): boolean {
  switch (entityType) {
    case 'character': return !!state.characters[entityId];
    case 'location': return !!state.locations[entityId];
    case 'faction': return !!state.factions[entityId];
    case 'item': return !!state.items[entityId];
    case 'event': return !!state.events[entityId];
  }
}

// ---------------------------------------------------------------------------
// Rule 1: MS_DEAD_CHARACTER_APPEARS
// 사망한 캐릭터가 해당 시점 이후의 본편 챕터에 등장
// ---------------------------------------------------------------------------

const msDeadCharacterAppearsRule: ConsistencyRule = {
  code: 'MS_DEAD_CHARACTER_APPEARS',
  name: '사망 캐릭터 본편 등장',
  description: '사망한 캐릭터가 사망 시점 이후의 본편에 등장합니다.',
  scope: 'project',
  run: (ctx: ConsistencyRuleContext): ConsistencyRuleResult[] => {
    const { state } = ctx;
    const results: ConsistencyRuleResult[] = [];
    const allRefs = Object.values(state.textEntityReferences);
    const allChapters = Object.values(state.manuscriptChapters);

    // Group refs by chapter
    const refsByChapter = new Map<string, TextEntityReference[]>();
    for (const ref of allRefs) {
      const list = refsByChapter.get(ref.manuscriptSceneId) ?? [];
      list.push(ref);
      refsByChapter.set(ref.manuscriptSceneId, list);
    }

    for (const chapter of allChapters) {
      const timeline = parseTimeline(chapter.timelineLabel);
      if (timeline == null) continue;

      const refs = refsByChapter.get(chapter.id) ?? [];
      const charRefs = refs.filter((r) => r.entityType === 'character');

      for (const ref of charRefs) {
        const char = state.characters[ref.entityId];
        if (!char || char.deathYear == null) continue;

        if (timeline > char.deathYear) {
          results.push({
            ruleCode: 'MS_DEAD_CHARACTER_APPEARS',
            severity: 'high',
            title: '사망 캐릭터 본편 등장',
            message: `"${char.name}"은(는) ${char.deathYear}년에 사망했지만, "${chapter.title}" (타임라인 ${timeline}년)에 등장합니다.`,
            bookId: chapter.bookId,
            chapterId: chapter.id,
            sceneId: null,
            boardSceneId: null,
            relatedEntityIds: [ref.entityId],
            evidence: [
              { sourceType: 'wiki_entity', sourceId: ref.entityId, snippetText: `사망년도: ${char.deathYear}`, startOffset: null, endOffset: null },
              { sourceType: 'manuscript_scene', sourceId: chapter.id, snippetText: `타임라인: ${timeline}`, startOffset: null, endOffset: null },
            ],
            suggestedActions: [
              { label: '캐릭터 사망년도 수정', actionType: 'navigate', targetType: 'wiki', targetId: ref.entityId },
              { label: '챕터 타임라인 수정', actionType: 'edit', targetType: 'chapter', targetId: chapter.id },
            ],
          });
        }
      }
    }
    return results;
  },
};

// ---------------------------------------------------------------------------
// Rule 2: MS_UNBORN_CHARACTER_APPEARS
// 출생 전 캐릭터가 본편에 등장
// ---------------------------------------------------------------------------

const msUnbornCharacterAppearsRule: ConsistencyRule = {
  code: 'MS_UNBORN_CHARACTER_APPEARS',
  name: '미출생 캐릭터 본편 등장',
  description: '출생 이전 시점의 본편에 캐릭터가 등장합니다.',
  scope: 'project',
  run: (ctx: ConsistencyRuleContext): ConsistencyRuleResult[] => {
    const { state } = ctx;
    const results: ConsistencyRuleResult[] = [];
    const allRefs = Object.values(state.textEntityReferences);
    const allChapters = Object.values(state.manuscriptChapters);

    const refsByChapter = new Map<string, TextEntityReference[]>();
    for (const ref of allRefs) {
      const list = refsByChapter.get(ref.manuscriptSceneId) ?? [];
      list.push(ref);
      refsByChapter.set(ref.manuscriptSceneId, list);
    }

    for (const chapter of allChapters) {
      const timeline = parseTimeline(chapter.timelineLabel);
      if (timeline == null) continue;

      const refs = refsByChapter.get(chapter.id) ?? [];
      const charRefs = refs.filter((r) => r.entityType === 'character');

      for (const ref of charRefs) {
        const char = state.characters[ref.entityId];
        if (!char || char.birthYear == null) continue;

        if (timeline < char.birthYear) {
          results.push({
            ruleCode: 'MS_UNBORN_CHARACTER_APPEARS',
            severity: 'high',
            title: '미출생 캐릭터 본편 등장',
            message: `"${char.name}"은(는) ${char.birthYear}년에 태어나지만, "${chapter.title}" (타임라인 ${timeline}년)에 등장합니다.`,
            bookId: chapter.bookId,
            chapterId: chapter.id,
            sceneId: null,
            boardSceneId: null,
            relatedEntityIds: [ref.entityId],
            evidence: [
              { sourceType: 'wiki_entity', sourceId: ref.entityId, snippetText: `출생년도: ${char.birthYear}`, startOffset: null, endOffset: null },
              { sourceType: 'manuscript_scene', sourceId: chapter.id, snippetText: `타임라인: ${timeline}`, startOffset: null, endOffset: null },
            ],
            suggestedActions: [
              { label: '캐릭터 출생년도 수정', actionType: 'navigate', targetType: 'wiki', targetId: ref.entityId },
              { label: '챕터 타임라인 수정', actionType: 'edit', targetType: 'chapter', targetId: chapter.id },
            ],
          });
        }
      }
    }
    return results;
  },
};

// ---------------------------------------------------------------------------
// Rule 3: MS_DELETED_ENTITY_REFERENCED
// 삭제된 위키 엔티티의 참조가 남아있음
// ---------------------------------------------------------------------------

const msDeletedEntityReferencedRule: ConsistencyRule = {
  code: 'MS_DELETED_ENTITY_REFERENCED',
  name: '삭제된 엔티티 참조',
  description: '위키에서 삭제된 엔티티가 본편에 참조로 남아있습니다.',
  scope: 'project',
  run: (ctx: ConsistencyRuleContext): ConsistencyRuleResult[] => {
    const { state } = ctx;
    const results: ConsistencyRuleResult[] = [];
    const allRefs = Object.values(state.textEntityReferences);

    for (const ref of allRefs) {
      if (!entityExists(ref.entityType, ref.entityId, state)) {
        const chapter = state.manuscriptChapters[ref.manuscriptSceneId];
        const chapterTitle = chapter?.title ?? ref.manuscriptSceneId.slice(0, 8);

        results.push({
          ruleCode: 'MS_DELETED_ENTITY_REFERENCED',
          severity: 'medium',
          title: '삭제된 엔티티 참조',
          message: `"${chapterTitle}"에서 삭제된 ${ref.entityType} 엔티티(${ref.entityId.slice(0, 8)}...)를 참조하고 있습니다.`,
          bookId: chapter?.bookId ?? null,
          chapterId: ref.manuscriptSceneId,
          sceneId: null,
          boardSceneId: null,
          relatedEntityIds: [ref.entityId],
          evidence: [
            { sourceType: 'manuscript_scene', sourceId: ref.manuscriptSceneId, snippetText: `참조 타입: ${ref.entityType}`, startOffset: null, endOffset: null },
          ],
          suggestedActions: [
            { label: '참조 제거', actionType: 'delete', targetType: 'reference', targetId: ref.id },
          ],
        });
      }
    }
    return results;
  },
};

// ---------------------------------------------------------------------------
// Rule 4: MS_CHARACTER_DUAL_CHAPTER
// 같은 타임라인의 다른 챕터에서 캐릭터가 다른 장소에 동시 등장
// ---------------------------------------------------------------------------

const msCharacterDualChapterRule: ConsistencyRule = {
  code: 'MS_CHARACTER_DUAL_CHAPTER',
  name: '캐릭터 이중 등장',
  description: '같은 시점의 다른 챕터에서 캐릭터가 다른 장소에 동시에 등장합니다.',
  scope: 'project',
  run: (ctx: ConsistencyRuleContext): ConsistencyRuleResult[] => {
    const { state } = ctx;
    const results: ConsistencyRuleResult[] = [];
    const allChapters = Object.values(state.manuscriptChapters);
    const allRefs = Object.values(state.textEntityReferences);

    // Group chapters by timeline
    const chaptersByTimeline = new Map<number, typeof allChapters>();
    for (const ch of allChapters) {
      const tl = parseTimeline(ch.timelineLabel);
      if (tl == null) continue;
      const list = chaptersByTimeline.get(tl) ?? [];
      list.push(ch);
      chaptersByTimeline.set(tl, list);
    }

    // Group refs by chapter
    const refsByChapter = new Map<string, typeof allRefs>();
    for (const ref of allRefs) {
      const list = refsByChapter.get(ref.manuscriptSceneId) ?? [];
      list.push(ref);
      refsByChapter.set(ref.manuscriptSceneId, list);
    }

    // Check each timeline group with 2+ chapters
    const checked = new Set<string>();

    for (const [timeline, chapters] of chaptersByTimeline) {
      if (chapters.length < 2) continue;

      // Build per-chapter character→location map
      const chapterCharLoc: Array<{ chapterId: string; title: string; locationId: string | null; charIds: Set<string> }> = [];
      for (const ch of chapters) {
        const refs = refsByChapter.get(ch.id) ?? [];
        const charIds = new Set(
          refs.filter((r) => r.entityType === 'character').map((r) => r.entityId),
        );
        if (ch.povCharacterId && !charIds.has(ch.povCharacterId)) {
          charIds.add(ch.povCharacterId);
        }
        chapterCharLoc.push({
          chapterId: ch.id,
          title: ch.title,
          locationId: ch.locationId,
          charIds,
        });
      }

      // Compare all pairs
      for (let i = 0; i < chapterCharLoc.length; i++) {
        for (let j = i + 1; j < chapterCharLoc.length; j++) {
          const a = chapterCharLoc[i];
          const b = chapterCharLoc[j];

          // Both must have different locations
          if (!a.locationId || !b.locationId || a.locationId === b.locationId) continue;

          // Find common characters
          for (const charId of a.charIds) {
            if (!b.charIds.has(charId)) continue;

            const dedupKey = `${timeline}:${charId}:${[a.chapterId, b.chapterId].sort().join('-')}`;
            if (checked.has(dedupKey)) continue;
            checked.add(dedupKey);

            const charName = state.characters[charId]?.name ?? charId.slice(0, 8);
            const locAName = state.locations[a.locationId]?.name ?? a.locationId.slice(0, 8);
            const locBName = state.locations[b.locationId]?.name ?? b.locationId.slice(0, 8);

            results.push({
              ruleCode: 'MS_CHARACTER_DUAL_CHAPTER',
              severity: 'medium',
              title: '캐릭터 이중 등장',
              message: `"${charName}"이(가) 타임라인 ${timeline}년에 "${a.title}"(${locAName})과 "${b.title}"(${locBName})에 동시에 등장합니다.`,
              bookId: null,
              chapterId: null,
              sceneId: null,
              boardSceneId: null,
              relatedEntityIds: [charId, a.locationId, b.locationId],
              evidence: [
                { sourceType: 'manuscript_scene', sourceId: a.chapterId, snippetText: `장소: ${locAName}`, startOffset: null, endOffset: null },
                { sourceType: 'manuscript_scene', sourceId: b.chapterId, snippetText: `장소: ${locBName}`, startOffset: null, endOffset: null },
              ],
              suggestedActions: [
                { label: `"${a.title}" 확인`, actionType: 'navigate', targetType: 'chapter', targetId: a.chapterId },
                { label: `"${b.title}" 확인`, actionType: 'navigate', targetType: 'chapter', targetId: b.chapterId },
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
// Rule 5: MS_WIKI_NAME_NOT_IN_TEXT
// 위키 엔티티가 참조되었지만 본문에서 현재 이름을 찾을 수 없음 (이름 변경 감지)
// ---------------------------------------------------------------------------

const msWikiNameNotInTextRule: ConsistencyRule = {
  code: 'MS_WIKI_NAME_NOT_IN_TEXT',
  name: '위키 이름 불일치',
  description: '위키 엔티티가 참조되었지만 본문에서 현재 이름을 찾을 수 없습니다.',
  scope: 'project',
  run: (ctx: ConsistencyRuleContext): ConsistencyRuleResult[] => {
    const { state } = ctx;
    const results: ConsistencyRuleResult[] = [];
    const allRefs = Object.values(state.textEntityReferences);

    // Group refs by chapter for efficient lookup
    const refsByChapter = new Map<string, TextEntityReference[]>();
    for (const ref of allRefs) {
      const list = refsByChapter.get(ref.manuscriptSceneId) ?? [];
      list.push(ref);
      refsByChapter.set(ref.manuscriptSceneId, list);
    }

    const checked = new Set<string>();

    for (const [chapterId, refs] of refsByChapter) {
      const chapter = state.manuscriptChapters[chapterId];
      if (!chapter || !chapter.content) continue;

      for (const ref of refs) {
        const name = getEntityName(ref.entityType, ref.entityId, state);
        if (!name) continue; // Entity deleted — handled by rule 3

        const dedupKey = `${chapterId}:${ref.entityType}:${ref.entityId}`;
        if (checked.has(dedupKey)) continue;
        checked.add(dedupKey);

        if (!chapter.content.includes(name)) {
          results.push({
            ruleCode: 'MS_WIKI_NAME_NOT_IN_TEXT',
            severity: 'low',
            title: '위키 이름 불일치',
            message: `"${chapter.title}"에서 "${name}" (${ref.entityType})이(가) 참조되었지만, 본문에서 해당 이름을 찾을 수 없습니다. 위키에서 이름이 변경되었을 수 있습니다.`,
            bookId: chapter.bookId,
            chapterId: chapter.id,
            sceneId: null,
            boardSceneId: null,
            relatedEntityIds: [ref.entityId],
            evidence: [
              { sourceType: 'wiki_entity', sourceId: ref.entityId, snippetText: `현재 이름: ${name}`, startOffset: null, endOffset: null },
              { sourceType: 'manuscript_scene', sourceId: chapter.id, snippetText: '본문에서 이름 미발견', startOffset: null, endOffset: null },
            ],
            suggestedActions: [
              { label: '본문에서 이름 수정', actionType: 'edit', targetType: 'chapter', targetId: chapter.id },
              { label: '참조 제거', actionType: 'delete', targetType: 'reference', targetId: ref.id },
            ],
          });
        }
      }
    }
    return results;
  },
};

// ---------------------------------------------------------------------------
// Rule 6: MS_ORPHAN_REFERENCE
// manuscriptChapter 자체가 삭제되었는데 참조가 남아있는 경우
// ---------------------------------------------------------------------------

const msOrphanReferenceRule: ConsistencyRule = {
  code: 'MS_ORPHAN_REFERENCE',
  name: '고아 참조',
  description: '삭제된 챕터의 엔티티 참조가 남아있습니다.',
  scope: 'project',
  run: (ctx: ConsistencyRuleContext): ConsistencyRuleResult[] => {
    const { state } = ctx;
    const results: ConsistencyRuleResult[] = [];
    const allRefs = Object.values(state.textEntityReferences);

    for (const ref of allRefs) {
      // Check if the manuscript chapter still exists
      if (!state.manuscriptChapters[ref.manuscriptSceneId] && !state.manuscriptScenes[ref.manuscriptSceneId]) {
        const entityName = getEntityName(ref.entityType, ref.entityId, state) ?? ref.entityId.slice(0, 8);

        results.push({
          ruleCode: 'MS_ORPHAN_REFERENCE',
          severity: 'low',
          title: '고아 참조',
          message: `삭제된 챕터(${ref.manuscriptSceneId.slice(0, 8)}...)에서 "${entityName}" (${ref.entityType}) 참조가 남아있습니다.`,
          bookId: null,
          chapterId: null,
          sceneId: null,
          boardSceneId: null,
          relatedEntityIds: [ref.entityId],
          evidence: [
            { sourceType: 'manuscript_scene', sourceId: ref.manuscriptSceneId, snippetText: '챕터 삭제됨', startOffset: null, endOffset: null },
          ],
          suggestedActions: [
            { label: '참조 정리', actionType: 'delete', targetType: 'reference', targetId: ref.id },
          ],
        });
      }
    }
    return results;
  },
};

// ---------------------------------------------------------------------------
// Export all rules
// ---------------------------------------------------------------------------

export const manuscriptConsistencyRules: ConsistencyRule[] = [
  msDeadCharacterAppearsRule,
  msUnbornCharacterAppearsRule,
  msDeletedEntityReferencedRule,
  msCharacterDualChapterRule,
  msWikiNameNotInTextRule,
  msOrphanReferenceRule,
];
