/**
 * 규칙 기반 텍스트 자동 추출 엔진
 *
 * 본편 집필 시 본문을 분석하여:
 * 1. 위키에 등록된 엔티티 이름이 본문에 등장하면 자동 링크 (TextEntityReference)
 * 2. 패턴 기반으로 새 엔티티/복선/상태 변화/관계 변화를 감지하여 제안 (ExtractedProposal)
 */

import type {
  EntityType,
  Character,
  Location,
  Faction,
  Item,
  WorldEvent,
  TextEntityReference,
  ExtractedProposal,
  ExtractedProposalType,
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

export interface ExistingRefs {
  /** entityType:entityId 형태의 Set */
  refKeys: Set<string>;
}

export interface ExtractionResult {
  /** 새로 감지된 엔티티 참조 (중복 제거됨) */
  newRefs: Array<{ entityType: EntityType; entityId: string }>;
  /** 패턴 기반 제안 */
  proposals: Array<{
    proposalType: ExtractedProposalType;
    description: string;
    targetEntityType: EntityType | null;
    targetEntityId: string | null;
  }>;
}

// ---------------------------------------------------------------------------
// 1. 위키 엔티티 자동 매칭
// ---------------------------------------------------------------------------

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function findEntityMentions(
  text: string,
  entities: EntityIndex,
  existingRefs: ExistingRefs,
): ExtractionResult['newRefs'] {
  const found: ExtractionResult['newRefs'] = [];
  const seen = new Set<string>();

  const checks: Array<{ type: EntityType; id: string; name: string }> = [];

  // 캐릭터
  for (const c of Object.values(entities.characters)) {
    if (c.name.length >= 2) checks.push({ type: 'character', id: c.id, name: c.name });
  }
  // 장소
  for (const l of Object.values(entities.locations)) {
    if (l.name.length >= 2) checks.push({ type: 'location', id: l.id, name: l.name });
  }
  // 세력
  for (const f of Object.values(entities.factions)) {
    if (f.name.length >= 2) checks.push({ type: 'faction', id: f.id, name: f.name });
  }
  // 아이템
  for (const i of Object.values(entities.items)) {
    if (i.name.length >= 2) checks.push({ type: 'item', id: i.id, name: i.name });
  }
  // 사건
  for (const e of Object.values(entities.events)) {
    if (e.title.length >= 2) checks.push({ type: 'event', id: e.id, name: e.title });
  }

  // 긴 이름부터 먼저 매칭 (부분 매칭 방지)
  checks.sort((a, b) => b.name.length - a.name.length);

  for (const { type, id, name } of checks) {
    const key = `${type}:${id}`;
    if (existingRefs.refKeys.has(key) || seen.has(key)) continue;

    const regex = new RegExp(escapeRegex(name), 'g');
    if (regex.test(text)) {
      found.push({ entityType: type, entityId: id });
      seen.add(key);
    }
  }

  return found;
}

// ---------------------------------------------------------------------------
// 2. 패턴 기반 제안 감지
// ---------------------------------------------------------------------------

interface PatternRule {
  /** 정규식 패턴 */
  pattern: RegExp;
  /** 추출 유형 */
  proposalType: ExtractedProposalType;
  /** 설명 생성 함수 */
  describe: (match: RegExpMatchArray) => string;
  /** 대상 엔티티 타입 (있으면) */
  targetEntityType?: EntityType;
}

/**
 * 대사 앞 화자 감지: "이름"이(가) 말했다 / "이름"이 ... "대사"
 * 한국어 대사 패턴: 이름 + 조사 + 동사 + "대사"
 */
const DIALOGUE_SPEAKER_PATTERN = /([가-힣]{2,6})(?:이|가|은|는|의)?\s*(?:말했다|외쳤다|중얼거렸다|속삭였다|소리쳤다|대답했다|물었다|답했다)/g;

const PATTERN_RULES: PatternRule[] = [
  // 새 장소 후보
  {
    pattern: /([가-힣]{2,10})(?:에서|으로|로|에)\s*(?:향했다|도착했다|들어섰다|나왔다|떠났다|이동했다|돌아왔다)/g,
    proposalType: 'new_entity',
    describe: (m) => `새 장소 후보: "${m[1]}" — 본문에서 장소로 언급됨`,
    targetEntityType: 'location',
  },
  // 복선/떡밥
  {
    pattern: /(?:비밀|숨겨진|언젠가|그때가\s*되면|아직\s*때가|진실은|사실은|아무도\s*모르는)[^.。!?]*[.。!?]/g,
    proposalType: 'foreshadow',
    describe: (m) => `떡밥 후보: "${m[0].slice(0, 40)}..."`,
  },
  // 상태 변화
  {
    pattern: /([가-힣]{2,6})(?:이|가|은|는)?\s*(?:죽었다|사라졌다|각성했다|변했다|쓰러졌다|부활했다|깨어났다|잠들었다|봉인됐다|해방됐다)/g,
    proposalType: 'state_change',
    describe: (m) => `상태 변화 감지: "${m[1]}" — ${m[0].slice(m[1].length).trim()}`,
    targetEntityType: 'character',
  },
  // 관계 변화
  {
    pattern: /([가-힣]{2,6})(?:이|가|은|는|와|과)?\s*(?:배신했다|동맹을\s*맺었다|적이\s*되었다|화해했다|결별했다|합류했다|떠났다|추방됐다)/g,
    proposalType: 'relationship_change',
    describe: (m) => `관계 변화 감지: "${m[1]}" — ${m[0].slice(m[1].length).trim()}`,
    targetEntityType: 'character',
  },
  // 회수 (기존 복선의 해결)
  {
    pattern: /(?:그때의|드디어|마침내|결국|진실이\s*밝혀졌다|비밀이\s*드러났다|모든\s*것이\s*맞아떨어졌다)[^.。!?]*[.。!?]/g,
    proposalType: 'payoff',
    describe: (m) => `회수 후보: "${m[0].slice(0, 40)}..."`,
  },
  // 설정 사실
  {
    pattern: /(?:이\s*세계에서는|법칙에\s*따르면|규칙상|원래|원칙적으로|전설에\s*의하면|고대부터)[^.。!?]*[.。!?]/g,
    proposalType: 'fact',
    describe: (m) => `세계관 설정: "${m[0].slice(0, 40)}..."`,
  },
];

function findPatternProposals(
  text: string,
  entities: EntityIndex,
  existingProposalDescs: Set<string>,
): ExtractionResult['proposals'] {
  const proposals: ExtractionResult['proposals'] = [];
  const seenDescs = new Set<string>();

  // 대사 화자 감지 (위키에 없는 이름)
  const knownNames = new Set<string>();
  for (const c of Object.values(entities.characters)) knownNames.add(c.name);

  let dialogueMatch: RegExpExecArray | null;
  const dialogueRe = new RegExp(DIALOGUE_SPEAKER_PATTERN.source, 'g');
  while ((dialogueMatch = dialogueRe.exec(text)) !== null) {
    const speaker = dialogueMatch[1];
    if (!knownNames.has(speaker)) {
      const desc = `새 캐릭터 후보: "${speaker}" — 본문에서 대사 화자로 등장`;
      if (!existingProposalDescs.has(desc) && !seenDescs.has(desc)) {
        proposals.push({
          proposalType: 'new_entity',
          description: desc,
          targetEntityType: 'character',
          targetEntityId: null,
        });
        seenDescs.add(desc);
      }
    }
  }

  // 패턴 규칙 실행
  for (const rule of PATTERN_RULES) {
    const regex = new RegExp(rule.pattern.source, rule.pattern.flags);
    let match: RegExpExecArray | null;
    while ((match = regex.exec(text)) !== null) {
      const desc = rule.describe(match);
      if (existingProposalDescs.has(desc) || seenDescs.has(desc)) continue;

      // 장소 패턴: 이미 위키에 있는 장소면 건너뛰기
      if (rule.targetEntityType === 'location' && match[1]) {
        const locName = match[1];
        const isKnown = Object.values(entities.locations).some((l) => l.name === locName);
        if (isKnown) continue;
      }

      // 상태/관계 패턴: 이미 위키에 있는 캐릭터면 targetEntityId 설정
      let targetEntityId: string | null = null;
      if (rule.targetEntityType === 'character' && match[1]) {
        const charName = match[1];
        const char = Object.values(entities.characters).find((c) => c.name === charName);
        if (char) targetEntityId = char.id;
      }

      proposals.push({
        proposalType: rule.proposalType,
        description: desc,
        targetEntityType: rule.targetEntityType ?? null,
        targetEntityId,
      });
      seenDescs.add(desc);
    }
  }

  return proposals;
}

// ---------------------------------------------------------------------------
// 3. 메인 추출 함수
// ---------------------------------------------------------------------------

/**
 * 본문 텍스트를 분석하여 엔티티 참조 및 제안을 추출합니다.
 *
 * @param text - 에피소드 본문
 * @param entities - 현재 위키 엔티티 인덱스
 * @param existingRefKeys - 이미 등록된 참조의 "entityType:entityId" Set
 * @param existingProposalDescs - 이미 등록된 제안의 description Set
 */
export function extractFromText(
  text: string,
  entities: EntityIndex,
  existingRefKeys: Set<string>,
  existingProposalDescs: Set<string>,
): ExtractionResult {
  if (!text || text.trim().length < 10) {
    return { newRefs: [], proposals: [] };
  }

  const newRefs = findEntityMentions(text, entities, { refKeys: existingRefKeys });
  const proposals = findPatternProposals(text, entities, existingProposalDescs);

  return { newRefs, proposals };
}
