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
  refKeys: Set<string>;
}

export interface ExtractionResult {
  newRefs: Array<{ entityType: EntityType; entityId: string }>;
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
// 2. 패턴 기반 제안 감지 (대폭 확장)
// ---------------------------------------------------------------------------

interface PatternRule {
  pattern: RegExp;
  proposalType: ExtractedProposalType;
  describe: (match: RegExpMatchArray) => string;
  targetEntityType?: EntityType;
}

// ---------------------------------------------------------------------------
// 핵심: 한국어 소설에서 흔한 패턴들
// ---------------------------------------------------------------------------

const PATTERN_RULES: PatternRule[] = [
  // =========================================================================
  // A. 캐릭터 감지 (대사 화자)
  // =========================================================================

  // "대사" 앞뒤로 이름 감지: 민준이 말했다 / 민준은 ...라고 했다
  {
    pattern: /([가-힣]{2,6})(?:이|가|은|는)?\s*(?:말했다|외쳤다|중얼거렸다|속삭였다|소리쳤다|대답했다|물었다|답했다|말을\s*이었다|입을\s*열었다|소리질렀다|불평했다|투덜거렸다|한숨을?\s*쉬며|웃으며|울며)/g,
    proposalType: 'new_entity',
    describe: (m) => `새 캐릭터 후보: "${m[1]}" — 대사/행동 화자로 등장`,
    targetEntityType: 'character',
  },
  // "..." / "..." 따옴표 대사 앞에 이름
  {
    pattern: /([가-힣]{2,6})(?:이|가|은|는|의)?\s*["""][^"""]+["""]/g,
    proposalType: 'new_entity',
    describe: (m) => `새 캐릭터 후보: "${m[1]}" — 따옴표 대사 화자로 등장`,
    targetEntityType: 'character',
  },
  // 이름 + 주요 동작 (보았다, 달렸다, 일어났다 등)
  {
    pattern: /([가-힣]{2,6})(?:이|가|은|는)?\s*(?:보았다|바라보았다|달렸다|일어났다|나타났다|다가왔다|고개를\s*들었다|고개를\s*숙였다|손을\s*뻗었다|걸어갔다|뛰어갔다|멈춰\s*섰다|돌아보았다|눈을\s*떴다|눈을\s*감았다)/g,
    proposalType: 'new_entity',
    describe: (m) => `새 캐릭터 후보: "${m[1]}" — 행동 주체로 등장`,
    targetEntityType: 'character',
  },

  // =========================================================================
  // B. 장소 감지
  // =========================================================================

  // ~에서/에/으로/로 + 동사
  {
    pattern: /([가-힣]{2,10})(?:에서|으로|로|에)\s*(?:향했다|도착했다|들어섰다|나왔다|떠났다|이동했다|돌아왔다|걸어갔다|달려갔다|내려갔다|올라갔다)/g,
    proposalType: 'new_entity',
    describe: (m) => `새 장소 후보: "${m[1]}" — 이동 목적지로 언급됨`,
    targetEntityType: 'location',
  },
  // ~의 거리/마을/성/숲/동굴/탑/궁 등
  {
    pattern: /([가-힣]{2,10})(?:의\s*)?(?:거리|마을|성|숲|동굴|탑|궁|궁전|광장|시장|항구|절벽|산|강|바다|호수|사막|평원|골목|저택|성벽|문|관문|입구)/g,
    proposalType: 'new_entity',
    describe: (m) => `새 장소 후보: "${m[0]}" — 지명으로 언급됨`,
    targetEntityType: 'location',
  },
  // ~에 도착/위치 서술
  {
    pattern: /([가-힣]{2,10})(?:이|가)?\s*(?:눈앞에\s*펼쳐졌다|보였다|나타났다|모습을\s*드러냈다)/g,
    proposalType: 'new_entity',
    describe: (m) => `새 장소 후보: "${m[1]}" — 장면 배경으로 언급됨`,
    targetEntityType: 'location',
  },

  // =========================================================================
  // C. 복선/떡밥
  // =========================================================================
  {
    pattern: /(?:비밀|숨겨진|언젠가|그때가\s*되면|아직\s*때가|진실은|사실은|아무도\s*모르는|알\s*수\s*없는|수수께끼|의문|이상한|기묘한)[^.。!?\n]{5,}[.。!?\n]/g,
    proposalType: 'foreshadow',
    describe: (m) => `떡밥 후보: "${m[0].trim().slice(0, 50)}..."`,
  },
  // 미래 암시
  {
    pattern: /(?:머지않아|곧|조만간|때가\s*되면|나중에\s*알게\s*될|아직은\s*모르지만|그\s*의미를\s*알\s*수\s*없었다|후회하게\s*될\s*것이다)[^.。!?\n]{3,}[.。!?\n]/g,
    proposalType: 'foreshadow',
    describe: (m) => `떡밥 후보: "${m[0].trim().slice(0, 50)}..."`,
  },
  // 과거 언급 (떡밥 가능성)
  {
    pattern: /(?:그날의|그때의|오래전|과거에|어린\s*시절|잊혀진|잊을\s*수\s*없는|기억\s*속의)[^.。!?\n]{5,}[.。!?\n]/g,
    proposalType: 'foreshadow',
    describe: (m) => `떡밥 후보 (과거 언급): "${m[0].trim().slice(0, 50)}..."`,
  },

  // =========================================================================
  // D. 상태 변화
  // =========================================================================
  {
    pattern: /([가-힣]{2,6})(?:이|가|은|는)?\s*(?:죽었다|사망했다|숨을\s*거두었다|사라졌다|각성했다|변했다|쓰러졌다|부활했다|깨어났다|잠들었다|봉인됐다|해방됐다|기절했다|의식을\s*잃었다|깨달았다|변신했다|진화했다|성장했다|힘을\s*얻었다|힘을\s*잃었다|능력을\s*얻었다|능력을\s*잃었다)/g,
    proposalType: 'state_change',
    describe: (m) => `상태 변화: "${m[1]}" — ${m[0].slice(m[1].length).trim()}`,
    targetEntityType: 'character',
  },
  // 부상/회복
  {
    pattern: /([가-힣]{2,6})(?:이|가|은|는)?\s*(?:부상을?\s*입었다|다쳤다|상처를?\s*입었다|회복했다|치료받았다|피를\s*흘렸다|쓰러져\s*있었다)/g,
    proposalType: 'state_change',
    describe: (m) => `상태 변화: "${m[1]}" — ${m[0].slice(m[1].length).trim()}`,
    targetEntityType: 'character',
  },

  // =========================================================================
  // E. 관계 변화
  // =========================================================================
  {
    pattern: /([가-힣]{2,6})(?:이|가|은|는|와|과)?\s*(?:배신했다|배반했다|동맹을?\s*맺었다|적이\s*되었다|화해했다|결별했다|합류했다|추방됐다|가입했다|탈퇴했다|따르기로\s*했다|등을\s*돌렸다|편을\s*들었다|손을\s*잡았다)/g,
    proposalType: 'relationship_change',
    describe: (m) => `관계 변화: "${m[1]}" — ${m[0].slice(m[1].length).trim()}`,
    targetEntityType: 'character',
  },
  // 사제/주종 관계
  {
    pattern: /([가-힣]{2,6})(?:이|가|은|는)?\s*([가-힣]{2,6})(?:의|에게)?\s*(?:스승|제자|부하|주군|충성|맹세|약속)/g,
    proposalType: 'relationship_change',
    describe: (m) => `관계 감지: "${m[1]}"과 "${m[2]}" — 사제/주종 관계`,
    targetEntityType: 'character',
  },

  // =========================================================================
  // F. 회수 (기존 복선 해결)
  // =========================================================================
  {
    pattern: /(?:드디어|마침내|결국|진실이?\s*밝혀졌다|비밀이?\s*드러났다|모든\s*것이\s*맞아떨어졌다|알게\s*되었다|이해했다|깨달았다|수수께끼가?\s*풀렸다|의문이?\s*풀렸다|그때의\s*의미를\s*알았다)[^.。!?\n]{3,}[.。!?\n]/g,
    proposalType: 'payoff',
    describe: (m) => `회수 후보: "${m[0].trim().slice(0, 50)}..."`,
  },

  // =========================================================================
  // G. 세계관 설정
  // =========================================================================
  {
    pattern: /(?:이\s*세계에서는|이곳에서는|법칙에\s*따르면|규칙상|원래|원칙적으로|전설에\s*의하면|고대부터|옛날부터|이\s*땅에서는|마법은|마나는|기는|힘의\s*원천은|능력은)[^.。!?\n]{5,}[.。!?\n]/g,
    proposalType: 'fact',
    describe: (m) => `세계관 설정: "${m[0].trim().slice(0, 50)}..."`,
  },

  // =========================================================================
  // H. 아이템 감지
  // =========================================================================
  {
    pattern: /([가-힣]{2,10})(?:을|를)?\s*(?:꺼냈다|집어\s*들었다|손에\s*쥐었다|차고\s*있었다|내려놓았다|건네주었다|건네받았다|얻었다|발견했다|장착했다|사용했다|빼\s*들었다)/g,
    proposalType: 'new_entity',
    describe: (m) => `새 아이템 후보: "${m[1]}" — 사용/소지 행위로 언급됨`,
    targetEntityType: 'item',
  },

  // =========================================================================
  // I. 세력/단체 감지
  // =========================================================================
  {
    pattern: /([가-힣]{2,10})(?:단|회|파|문|교|길드|기사단|연맹|동맹|조직|군단|왕국|제국|부족)/g,
    proposalType: 'new_entity',
    describe: (m) => `새 세력 후보: "${m[0]}" — 단체/조직으로 언급됨`,
    targetEntityType: 'faction',
  },
];

// 흔한 일반 단어를 필터링하기 위한 불용어 (새 캐릭터 후보에서 제외)
const STOP_WORDS = new Set([
  '그것', '이것', '저것', '여기', '저기', '거기', '누군가', '무언가', '아무도',
  '모두', '자신', '그녀', '그들', '우리', '나는', '너는', '누가', '어디',
  '그때', '이때', '지금', '오늘', '내일', '어제', '하지만', '그러나', '하나',
  '때문', '처음', '마지막', '다시', '이미', '아직', '그리고', '또한',
  '그래서', '그러자', '갑자기', '천천히', '빠르게', '조용히', '가만히',
]);

function findPatternProposals(
  text: string,
  entities: EntityIndex,
  existingProposalDescs: Set<string>,
): ExtractionResult['proposals'] {
  const proposals: ExtractionResult['proposals'] = [];
  const seenDescs = new Set<string>();

  // 이미 위키에 등록된 이름들
  const knownCharNames = new Set(Object.values(entities.characters).map((c) => c.name));
  const knownLocNames = new Set(Object.values(entities.locations).map((l) => l.name));
  const knownFacNames = new Set(Object.values(entities.factions).map((f) => f.name));
  const knownItemNames = new Set(Object.values(entities.items).map((i) => i.name));

  for (const rule of PATTERN_RULES) {
    const regex = new RegExp(rule.pattern.source, rule.pattern.flags);
    let match: RegExpExecArray | null;
    while ((match = regex.exec(text)) !== null) {
      const name = match[1] || '';

      // 불용어 필터
      if (name && STOP_WORDS.has(name)) continue;

      // 이미 위키에 등록된 엔티티면 new_entity에서는 건너뛰기
      if (rule.proposalType === 'new_entity') {
        if (rule.targetEntityType === 'character' && knownCharNames.has(name)) continue;
        if (rule.targetEntityType === 'location' && (knownLocNames.has(name) || knownLocNames.has(match[0]))) continue;
        if (rule.targetEntityType === 'faction' && (knownFacNames.has(name) || knownFacNames.has(match[0]))) continue;
        if (rule.targetEntityType === 'item' && knownItemNames.has(name)) continue;
      }

      const desc = rule.describe(match);
      if (existingProposalDescs.has(desc) || seenDescs.has(desc)) continue;

      // 상태/관계 패턴: 위키에 있는 캐릭터면 targetEntityId 설정
      let targetEntityId: string | null = null;
      if (rule.targetEntityType === 'character' && name) {
        const char = Object.values(entities.characters).find((c) => c.name === name);
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
