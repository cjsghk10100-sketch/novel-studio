/**
 * OpenClaw 에이전트 분석 요청 프롬프트 생성기
 *
 * 현재 에피소드 본문 + 위키 엔티티 목록을 구조화된 프롬프트로 변환하여
 * 텔레그램을 통해 에이전트에게 보낼 수 있도록 합니다.
 */

import type {
  Character,
  Location,
  Faction,
  Item,
  WorldEvent,
} from '@/lib/novel-types';

export interface PromptContext {
  episodeTitle: string;
  episodeContent: string;
  characters: Character[];
  locations: Location[];
  factions: Faction[];
  items: Item[];
  events: WorldEvent[];
}

/**
 * 에이전트에게 보낼 분석 요청 프롬프트를 생성합니다.
 */
export function buildAnalysisPrompt(ctx: PromptContext): string {
  const lines: string[] = [];

  lines.push(`📖 소설 분석 요청`);
  lines.push(`━━━━━━━━━━━━━━━━━━`);
  lines.push(``);
  lines.push(`📌 에피소드: ${ctx.episodeTitle}`);
  lines.push(``);

  // 기존 위키 엔티티 요약
  lines.push(`📂 현재 등록된 세계관 데이터:`);
  lines.push(``);

  if (ctx.characters.length > 0) {
    lines.push(`[캐릭터] ${ctx.characters.map((c) => c.name).join(', ')}`);
  }
  if (ctx.locations.length > 0) {
    lines.push(`[장소] ${ctx.locations.map((l) => l.name).join(', ')}`);
  }
  if (ctx.factions.length > 0) {
    lines.push(`[세력] ${ctx.factions.map((f) => f.name).join(', ')}`);
  }
  if (ctx.items.length > 0) {
    lines.push(`[아이템] ${ctx.items.map((i) => i.name).join(', ')}`);
  }
  if (ctx.events.length > 0) {
    lines.push(`[사건] ${ctx.events.map((e) => e.title).join(', ')}`);
  }

  lines.push(``);
  lines.push(`━━━━━━━━━━━━━━━━━━`);
  lines.push(`📝 본문:`);
  lines.push(``);

  // 본문 (너무 길면 잘라서)
  const maxLen = 3000;
  const content = ctx.episodeContent.length > maxLen
    ? ctx.episodeContent.slice(0, maxLen) + '\n\n... (이하 생략)'
    : ctx.episodeContent;
  lines.push(content);

  lines.push(``);
  lines.push(`━━━━━━━━━━━━━━━━━━`);
  lines.push(`🔍 분석 요청사항:`);
  lines.push(``);
  lines.push(`위 본문을 읽고 아래 항목들을 JSON 형식으로 분석해주세요:`);
  lines.push(``);
  lines.push(`1. 새로 등장한 캐릭터 (위키에 없는 인물)`);
  lines.push(`2. 새로 등장한 장소`);
  lines.push(`3. 복선/떡밥 (나중에 회수될 수 있는 단서)`);
  lines.push(`4. 캐릭터 상태 변화 (사망, 각성, 변신 등)`);
  lines.push(`5. 관계 변화 (동맹, 배신, 적대 등)`);
  lines.push(`6. 세계관 설정/규칙`);
  lines.push(``);
  lines.push(`📋 응답 형식 (JSON):`);
  lines.push(`\`\`\`json`);
  lines.push(`{`);
  lines.push(`  "proposals": [`);
  lines.push(`    {`);
  lines.push(`      "type": "new_entity | state_change | relationship_change | foreshadow | payoff | fact",`);
  lines.push(`      "entityType": "character | location | faction | item | event | null",`);
  lines.push(`      "name": "엔티티 이름 (있으면)",`);
  lines.push(`      "description": "상세 설명"`);
  lines.push(`    }`);
  lines.push(`  ]`);
  lines.push(`}`);
  lines.push(`\`\`\``);

  return lines.join('\n');
}

/**
 * 텔레그램 딥링크 URL을 생성합니다.
 * @param botUsername 봇 사용자명 (예: "OpenClawBot")
 * @param text 보낼 텍스트 (URL 인코딩됨)
 */
export function buildTelegramDeepLink(botUsername: string, text?: string): string {
  // Telegram 딥링크로 봇 채팅 열기
  const base = `https://t.me/${botUsername}`;
  if (text) {
    // start 파라미터로는 텍스트를 직접 보낼 수 없으므로 채팅만 열기
    return base;
  }
  return base;
}
