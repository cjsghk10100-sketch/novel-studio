/**
 * OpenClaw 에이전트 분석 결과 파서
 *
 * 에이전트가 반환한 JSON 텍스트를 파싱하여
 * ExtractedProposal 형태로 변환합니다.
 */

import type { ExtractedProposalType, EntityType } from '@/lib/novel-types';

export interface ParsedProposal {
  proposalType: ExtractedProposalType;
  targetEntityType: EntityType | null;
  targetEntityId: string | null;
  description: string;
}

export interface ParseResult {
  success: boolean;
  proposals: ParsedProposal[];
  error?: string;
}

const VALID_TYPES = new Set<ExtractedProposalType>([
  'new_entity', 'state_change', 'relationship_change', 'foreshadow', 'payoff', 'fact',
]);

const VALID_ENTITY_TYPES = new Set<EntityType>([
  'character', 'location', 'faction', 'item', 'event',
]);

/**
 * 에이전트 결과 텍스트에서 JSON을 추출하고 파싱합니다.
 *
 * 지원하는 형식:
 * 1. 순수 JSON
 * 2. ```json ... ``` 코드블록 안의 JSON
 * 3. 텍스트 사이에 섞인 JSON 블록
 */
export function parseAgentResult(rawText: string): ParseResult {
  if (!rawText || !rawText.trim()) {
    return { success: false, proposals: [], error: '텍스트가 비어있습니다.' };
  }

  // JSON 블록 추출 시도
  let jsonStr = '';

  // 1. ```json ... ``` 코드블록
  const codeBlockMatch = rawText.match(/```(?:json)?\s*\n?([\s\S]*?)\n?\s*```/);
  if (codeBlockMatch) {
    jsonStr = codeBlockMatch[1].trim();
  } else {
    // 2. { ... } JSON 블록 직접 찾기
    const braceMatch = rawText.match(/\{[\s\S]*\}/);
    if (braceMatch) {
      jsonStr = braceMatch[0];
    } else {
      // 3. [ ... ] 배열 직접 찾기
      const arrayMatch = rawText.match(/\[[\s\S]*\]/);
      if (arrayMatch) {
        jsonStr = `{"proposals": ${arrayMatch[0]}}`;
      }
    }
  }

  if (!jsonStr) {
    return { success: false, proposals: [], error: 'JSON 형식을 찾을 수 없습니다. 에이전트 응답에 JSON이 포함되어 있는지 확인해주세요.' };
  }

  try {
    const parsed = JSON.parse(jsonStr);

    // proposals 배열 찾기
    let rawProposals: any[] = [];
    if (Array.isArray(parsed)) {
      rawProposals = parsed;
    } else if (parsed.proposals && Array.isArray(parsed.proposals)) {
      rawProposals = parsed.proposals;
    } else if (parsed.results && Array.isArray(parsed.results)) {
      rawProposals = parsed.results;
    } else {
      return { success: false, proposals: [], error: 'JSON에 proposals 배열이 없습니다.' };
    }

    const proposals: ParsedProposal[] = [];

    for (const raw of rawProposals) {
      // type 필드 정규화
      let proposalType: ExtractedProposalType = 'fact';
      const rawType = (raw.type || raw.proposalType || 'fact').toString().toLowerCase().trim();
      if (VALID_TYPES.has(rawType as ExtractedProposalType)) {
        proposalType = rawType as ExtractedProposalType;
      } else if (rawType.includes('character') || rawType.includes('캐릭터')) {
        proposalType = 'new_entity';
      } else if (rawType.includes('location') || rawType.includes('장소')) {
        proposalType = 'new_entity';
      } else if (rawType.includes('foreshadow') || rawType.includes('복선') || rawType.includes('떡밥')) {
        proposalType = 'foreshadow';
      } else if (rawType.includes('state') || rawType.includes('상태')) {
        proposalType = 'state_change';
      } else if (rawType.includes('relation') || rawType.includes('관계')) {
        proposalType = 'relationship_change';
      } else if (rawType.includes('payoff') || rawType.includes('회수')) {
        proposalType = 'payoff';
      }

      // entityType 정규화
      let targetEntityType: EntityType | null = null;
      const rawEntityType = (raw.entityType || raw.entity_type || '').toString().toLowerCase().trim();
      if (VALID_ENTITY_TYPES.has(rawEntityType as EntityType)) {
        targetEntityType = rawEntityType as EntityType;
      }

      // description 생성
      const name = raw.name || '';
      const desc = raw.description || raw.desc || raw.detail || '';
      let description = '';

      if (proposalType === 'new_entity' && name) {
        const typeLabel = targetEntityType === 'character' ? '캐릭터'
          : targetEntityType === 'location' ? '장소'
          : targetEntityType === 'faction' ? '세력'
          : targetEntityType === 'item' ? '아이템'
          : targetEntityType === 'event' ? '사건'
          : '엔티티';
        description = `[AI] 새 ${typeLabel} 후보: "${name}" — ${desc}`;
      } else {
        description = `[AI] ${desc || name || '분석 결과'}`;
      }

      proposals.push({
        proposalType,
        targetEntityType,
        targetEntityId: null,
        description,
      });
    }

    if (proposals.length === 0) {
      return { success: true, proposals: [], error: '분석 결과가 비어있습니다.' };
    }

    return { success: true, proposals };
  } catch (e) {
    return {
      success: false,
      proposals: [],
      error: `JSON 파싱 오류: ${e instanceof Error ? e.message : '알 수 없는 오류'}`,
    };
  }
}
