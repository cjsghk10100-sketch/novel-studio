/**
 * 자동 링크 엔진
 *
 * 본편 집필 시 본문을 분석하여:
 * - 위키에 등록된 엔티티 이름이 본문에 등장하면 자동 링크 (TextEntityReference)
 *
 * 패턴 감지/제안 생성은 제거됨 — 작가가 위키에 직접 등록하는 흐름이 더 자연스러움.
 */

import type {
  EntityType,
  Character,
  Location,
  Faction,
  Item,
  WorldEvent,
} from '@/lib/novel-types';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface EntityIndex {
  characters: Record<string, Character>;
  locations: Record<string, Location>;
  factions: Record<string, Faction>;
  items: Record<string, Item>;
  events: Record<string, WorldEvent>;
}

export interface AutoLinkResult {
  /** 새로 감지된 엔티티 참조 (중복 제거됨) */
  newRefs: Array<{ entityType: EntityType; entityId: string }>;
}

// ---------------------------------------------------------------------------
// 위키 엔티티 자동 매칭
// ---------------------------------------------------------------------------

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * 본문에서 위키에 등록된 엔티티 이름을 찾아 자동 링크합니다.
 *
 * @param text - 에피소드 본문
 * @param entities - 현재 위키 엔티티 인덱스
 * @param existingRefKeys - 이미 등록된 참조의 "entityType:entityId" Set
 */
export function autoLinkEntities(
  text: string,
  entities: EntityIndex,
  existingRefKeys: Set<string>,
): AutoLinkResult {
  if (!text || text.trim().length < 2) {
    return { newRefs: [] };
  }

  const found: AutoLinkResult['newRefs'] = [];
  const seen = new Set<string>();

  const checks: Array<{ type: EntityType; id: string; name: string }> = [];

  for (const c of Object.values(entities.characters)) {
    if (c.name.length >= 2) checks.push({ type: 'character', id: c.id, name: c.name });
  }
  for (const l of Object.values(entities.locations)) {
    if (l.name.length >= 2) checks.push({ type: 'location', id: l.id, name: l.name });
  }
  for (const f of Object.values(entities.factions)) {
    if (f.name.length >= 2) checks.push({ type: 'faction', id: f.id, name: f.name });
  }
  for (const i of Object.values(entities.items)) {
    if (i.name.length >= 2) checks.push({ type: 'item', id: i.id, name: i.name });
  }
  for (const e of Object.values(entities.events)) {
    if (e.title.length >= 2) checks.push({ type: 'event', id: e.id, name: e.title });
  }

  // 긴 이름부터 먼저 매칭 (부분 매칭 방지)
  checks.sort((a, b) => b.name.length - a.name.length);

  for (const { type, id, name } of checks) {
    const key = `${type}:${id}`;
    if (existingRefKeys.has(key) || seen.has(key)) continue;

    if (text.includes(name)) {
      found.push({ entityType: type, entityId: id });
      seen.add(key);
    }
  }

  return { newRefs: found };
}
