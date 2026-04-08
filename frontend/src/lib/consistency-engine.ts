/**
 * Consistency Check Engine v1
 *
 * Detects logical conflicts in the novel world data.
 * 8 rules implemented:
 * 1. Character age vs timeline inconsistency
 * 2. Same-time dual-location conflict
 * 3. Enemy/Ally relationship contradiction
 * 4. Post-death appearance conflict
 * 5. Long-unresolved foreshadow warning
 * 6. Event chronology violation
 * 7. Manuscript POV character post-death
 * 8. Manuscript-Board location mismatch
 */

import type {
  Character,
  WorldEvent,
  Scene,
  Link,
  Foreshadow,
  ManuscriptScene,
  ConsistencyIssue,
  Severity,
} from "./novel-types";
import { v4 as uuidv4 } from "uuid";

// Helper to create an issue
function issue(
  ruleId: string,
  severity: Severity,
  message: string,
  entityRefs: ConsistencyIssue["entityRefs"],
  why: string,
  fixSuggestion: string
): ConsistencyIssue {
  return { id: uuidv4(), ruleId, severity, message, entityRefs, why, fixSuggestion };
}

/**
 * Rule 1: Character age vs timeline
 */
function checkAgeTimeline(
  characters: Record<string, Character>,
  scenes: Record<string, Scene>
): ConsistencyIssue[] {
  const issues: ConsistencyIssue[] = [];
  const sceneList = Object.values(scenes);

  for (const char of Object.values(characters)) {
    if (char.birthYear == null) continue;

    for (const scene of sceneList) {
      if (!scene.characterIds.includes(char.id)) continue;
      if (scene.timelineIndex === 0) continue;

      const impliedAge = scene.timelineIndex - char.birthYear;

      if (impliedAge < 0) {
        issues.push(
          issue(
            "age-timeline",
            "error",
            `"${char.name}"\uc774(\uac00) \uc7a5\uba74 "${scene.title}" (${scene.timelineIndex}\ub144)\uc5d0 \ub4f1\uc7a5\ud558\uc9c0\ub9cc, \ucd9c\uc0dd\ub144\ub3c4\ub294 ${char.birthYear}\ub144\uc785\ub2c8\ub2e4 - \uc544\uc9c1 \ud0dc\uc5b4\ub098\uc9c0 \uc54a\uc558\uc2b5\ub2c8\ub2e4.`,
            [
              { type: "character", id: char.id, name: char.name },
              { type: "scene", id: scene.id, name: scene.title },
            ],
            `\ucd9c\uc0dd\ub144\ub3c4(${char.birthYear}\ub144)\uac00 \uc7a5\uba74 \ud0c0\uc784\ub77c\uc778(${scene.timelineIndex}\ub144) \uc774\ud6c4\uc785\ub2c8\ub2e4. \ucd94\uc815 \ub098\uc774: ${impliedAge}\uc138`,
            `${char.name}\uc758 \ucd9c\uc0dd\ub144\ub3c4\ub97c ${scene.timelineIndex}\ub144 \uc774\uc804\uc73c\ub85c \uc870\uc815\ud558\uac70\ub098, \uc7a5\uba74\uc744 ${char.birthYear}\ub144 \uc774\ud6c4\ub85c \uc774\ub3d9\ud558\uc138\uc694.`
          )
        );
      } else if (impliedAge > 200) {
        issues.push(
          issue(
            "age-timeline",
            "warn",
            `"${char.name}"\uc774(\uac00) \uc7a5\uba74 "${scene.title}" (${scene.timelineIndex}\ub144)\uc5d0\uc11c ${impliedAge}\uc138\uc785\ub2c8\ub2e4.`,
            [
              { type: "character", id: char.id, name: char.name },
              { type: "scene", id: scene.id, name: scene.title },
            ],
            `\ucd9c\uc0dd\ub144\ub3c4 ${char.birthYear}\ub144, \uc7a5\uba74 \uc5f0\ub3c4 ${scene.timelineIndex}\ub144\uc73c\ub85c \ucd94\uc815 \ub098\uc774 ${impliedAge}\uc138.`,
            `${char.name}\uc774(\uac00) \uc774 \ub098\uc774\uac00 \ub9de\ub294\uc9c0 \ud655\uc778\ud558\uc138\uc694 (\uc608: \ubd88\uba78\uc758 \uc885\uc871). \uadf8\ub807\uc9c0 \uc54a\ub2e4\uba74 \ucd9c\uc0dd\ub144\ub3c4\ub098 \uc7a5\uba74 \ud0c0\uc784\ub77c\uc778\uc744 \uc870\uc815\ud558\uc138\uc694.`
          )
        );
      }
    }
  }

  return issues;
}

/**
 * Rule 2: Same-time dual-location conflict
 */
function checkDualLocation(
  characters: Record<string, Character>,
  scenes: Record<string, Scene>
): ConsistencyIssue[] {
  const issues: ConsistencyIssue[] = [];
  const sceneList = Object.values(scenes);

  for (const char of Object.values(characters)) {
    // Group scenes by timelineIndex for this character
    const timeMap = new Map<number, Scene[]>();

    for (const scene of sceneList) {
      if (!scene.characterIds.includes(char.id)) continue;
      if (scene.timelineIndex === 0) continue;

      const existing = timeMap.get(scene.timelineIndex) || [];
      existing.push(scene);
      timeMap.set(scene.timelineIndex, existing);
    }

    for (const [ti, scenesAtTime] of timeMap) {
      if (scenesAtTime.length < 2) continue;

      // Check if they have different locations
      const locationSets = scenesAtTime.map((s) => new Set(s.locationIds));
      for (let i = 0; i < scenesAtTime.length; i++) {
        for (let j = i + 1; j < scenesAtTime.length; j++) {
          const loc1 = scenesAtTime[i].locationIds;
          const loc2 = scenesAtTime[j].locationIds;
          const overlap = loc1.some((l) => loc2.includes(l));

          if (!overlap && loc1.length > 0 && loc2.length > 0) {
            issues.push(
              issue(
                "dual-location",
                "error",
                `"${char.name}"\uc774(\uac00) \uac19\uc740 \uc2dc\uc810(${ti}\ub144)\uc5d0 \ub450 \uac1c\uc758 \ub2e4\ub978 \uc7a5\uc18c\uc5d0 \ub4f1\uc7a5\ud569\ub2c8\ub2e4: "${scenesAtTime[i].title}"\uacfc "${scenesAtTime[j].title}".`,
                [
                  { type: "character", id: char.id, name: char.name },
                  { type: "scene", id: scenesAtTime[i].id, name: scenesAtTime[i].title },
                  { type: "scene", id: scenesAtTime[j].id, name: scenesAtTime[j].title },
                ],
                `\ub450 \uc7a5\uba74 \ubaa8\ub450 \ud0c0\uc784\ub77c\uc778 \uc778\ub371\uc2a4 ${ti}\uc774\uc9c0\ub9cc ${char.name}\uc774(\uac00) \ub2e4\ub978 \uc7a5\uc18c\uc5d0 \uc788\uc2b5\ub2c8\ub2e4.`,
                `\ud558\ub098\uc758 \uc7a5\uba74 \ud0c0\uc784\ub77c\uc778\uc744 \uc870\uc815\ud558\uac70\ub098, \ub450 \uc7a5\uba74\uc744 \uac19\uc740 \uc7a5\uc18c\ub85c \ubcc0\uacbd\ud558\uac70\ub098, \uc774\ub3d9 \uc7a5\uba74\uc744 \ucd94\uac00\ud558\uc138\uc694.`
              )
            );
          }
        }
      }
    }
  }

  return issues;
}

/**
 * Rule 3: Enemy/Ally relationship contradiction
 */
function checkRelationshipConflict(
  links: Record<string, Link>,
  entities: Record<string, { id: string; name: string }>
): ConsistencyIssue[] {
  const issues: ConsistencyIssue[] = [];
  const linkList = Object.values(links);

  const hostileTypes = new Set(["enemy_of", "rival_of"]);
  const friendlyTypes = new Set(["ally_of", "friend_of", "mentor_of", "student_of", "serves"]);

  // Build a pair map: (fromId-toId) -> list of relation types
  const pairMap = new Map<string, { relations: string[]; link: Link }[]>();

  for (const link of linkList) {
    const key1 = `${link.fromId}-${link.toId}`;
    const key2 = `${link.toId}-${link.fromId}`;

    for (const key of [key1, key2]) {
      const arr = pairMap.get(key) || [];
      arr.push({ relations: [link.relationType], link });
      pairMap.set(key, arr);
    }
  }

  const checked = new Set<string>();

  for (const link of linkList) {
    const pairKey = [link.fromId, link.toId].sort().join("-");
    if (checked.has(pairKey)) continue;
    checked.add(pairKey);

    const forwardKey = `${link.fromId}-${link.toId}`;
    const reverseKey = `${link.toId}-${link.fromId}`;

    const allRelations = [
      ...(pairMap.get(forwardKey) || []),
      ...(pairMap.get(reverseKey) || []),
    ];

    const hasHostile = allRelations.some((r) =>
      r.relations.some((rt) => hostileTypes.has(rt))
    );
    const hasFriendly = allRelations.some((r) =>
      r.relations.some((rt) => friendlyTypes.has(rt))
    );

    if (hasHostile && hasFriendly) {
      const fromName = entities[link.fromId]?.name || link.fromId;
      const toName = entities[link.toId]?.name || link.toId;

      const hostileRels = allRelations
        .flatMap((r) => r.relations)
        .filter((r) => hostileTypes.has(r));
      const friendlyRels = allRelations
        .flatMap((r) => r.relations)
        .filter((r) => friendlyTypes.has(r));

      issues.push(
        issue(
          "relationship-conflict",
          "error",
          `"${fromName}"\uacfc(\uc640) "${toName}" \uc0ac\uc774\uc5d0 \ucda9\ub3cc\ud558\ub294 \uad00\uacc4\uac00 \uc788\uc2b5\ub2c8\ub2e4: ${hostileRels.join(", ")} vs ${friendlyRels.join(", ")}.`,
          [
            { type: link.fromType, id: link.fromId, name: fromName },
            { type: link.toType, id: link.toId, name: toName },
          ],
          `\uc801\ub300 \uad00\uacc4: ${hostileRels.join(", ")}. \uc6b0\ud638 \uad00\uacc4: ${friendlyRels.join(", ")}. \uc774\ub4e4\uc740 \ubaa8\uc21c\ub429\ub2c8\ub2e4.`,
          `\ucda9\ub3cc\ud558\ub294 \uad00\uacc4 \uc911 \ud558\ub098\ub97c \uc81c\uac70\ud558\uac70\ub098, \uc11c\uc0ac\uc801 \uc124\uba85\uc744 \ucd94\uac00\ud558\uc138\uc694 (\uc608: \ubc30\uc2e0 \uc0ac\uac74).`
        )
      );
    }
  }

  return issues;
}

/**
 * Rule 4: Post-death appearance
 */
function checkPostDeathAppearance(
  characters: Record<string, Character>,
  scenes: Record<string, Scene>
): ConsistencyIssue[] {
  const issues: ConsistencyIssue[] = [];
  const sceneList = Object.values(scenes);

  for (const char of Object.values(characters)) {
    if (char.deathYear == null) continue;

    for (const scene of sceneList) {
      if (!scene.characterIds.includes(char.id)) continue;
      if (scene.timelineIndex === 0) continue;

      if (scene.timelineIndex > char.deathYear) {
        issues.push(
          issue(
            "post-death",
            "error",
            `"${char.name}"\uc774(\uac00) \uc7a5\uba74 "${scene.title}" (${scene.timelineIndex}\ub144)\uc5d0 \ub4f1\uc7a5\ud558\uc9c0\ub9cc, ${char.deathYear}\ub144\uc5d0 \uc0ac\ub9dd\ud588\uc2b5\ub2c8\ub2e4.`,
            [
              { type: "character", id: char.id, name: char.name },
              { type: "scene", id: scene.id, name: scene.title },
            ],
            `\uc0ac\ub9dd\ub144\ub3c4: ${char.deathYear}\ub144. \uc7a5\uba74 \ud0c0\uc784\ub77c\uc778: ${scene.timelineIndex}\ub144. \uc0ac\ub9dd \ud6c4 ${scene.timelineIndex - char.deathYear}\ub144 \ud6c4 \ub4f1\uc7a5.`,
            `\uc774 \uc7a5\uba74\uc5d0\uc11c ${char.name}\uc744(\ub97c) \uc81c\uac70\ud558\uac70\ub098, \uc0ac\ub9dd\ub144\ub3c4\ub97c \ubcc0\uacbd\ud558\uac70\ub098, \ud68c\uc0c1/\uc720\ub839 \ub4f1\uc7a5\uc73c\ub85c \ud45c\uc2dc\ud558\uc138\uc694.`
          )
        );
      }
    }
  }

  return issues;
}

/**
 * Rule 5: Long-unresolved foreshadow warning
 */
function checkUnresolvedForeshadows(
  foreshadows: Record<string, Foreshadow>,
  scenes: Record<string, Scene>
): ConsistencyIssue[] {
  const issues: ConsistencyIssue[] = [];
  const sceneList = Object.values(scenes);
  const maxChapter = sceneList.reduce((max, s) => Math.max(max, s.chapterNo), 0);

  for (const fs of Object.values(foreshadows)) {
    if (fs.status !== "open") continue;

    const setupScene = scenes[fs.setupSceneId];
    if (!setupScene) continue;

    const chapterGap = maxChapter - setupScene.chapterNo;

    if (chapterGap >= 5) {
      issues.push(
        issue(
          "unresolved-foreshadow",
          "warn",
          `\ub5a1\ubc25 "${fs.note}" (${setupScene.chapterNo}\uc7a5 \uc124\uc815)\uc774 ${chapterGap}\uac1c \ucc55\ud130 \ub3d9\uc548 \ubbf8\ud68c\uc218 \uc0c1\ud0dc\uc785\ub2c8\ub2e4.`,
          [{ type: "scene", id: setupScene.id, name: setupScene.title }],
          `\uc124\uc815 \uc7a5\uba74\uc774 ${setupScene.chapterNo}\uc7a5\uc5d0 \uc788\uace0, \ud604\uc7ac \ucd5c\ub300 \ucc55\ud130\ub294 ${maxChapter}\uc7a5\uc785\ub2c8\ub2e4. \uac04\uaca9: ${chapterGap}\ucc55\ud130 \ud68c\uc218 \uc5c6\uc74c.`,
          `\ud68c\uc218 \uc7a5\uba74\uc744 \ucd94\uac00\ud558\uac70\ub098, \uc758\ub3c4\uc801\uc73c\ub85c \ud3ec\uae30\ud55c \uacbd\uc6b0 \ud3ec\uae30\ub85c \ud45c\uc2dc\ud558\uc138\uc694.`
        )
      );
    } else if (chapterGap >= 3) {
      issues.push(
        issue(
          "unresolved-foreshadow",
          "info",
          `\ub5a1\ubc25 "${fs.note}" (${setupScene.chapterNo}\uc7a5)\uc774 ${chapterGap}\ucc55\ud130 \ub3d9\uc548 \ubbf8\ud68c\uc218 \uc0c1\ud0dc\uc785\ub2c8\ub2e4.`,
          [{ type: "scene", id: setupScene.id, name: setupScene.title }],
          `\uace7 \ud68c\uc218\uac00 \ud544\uc694\ud560 \uc218 \uc788\uc2b5\ub2c8\ub2e4. \uc124\uc815: ${setupScene.chapterNo}\uc7a5, \ud604\uc7ac: ${maxChapter}\uc7a5.`,
          `\ub2e4\uc74c \uba87 \ucc55\ud130 \ub0b4\uc5d0 \ud68c\uc218 \uc7a5\uba74\uc744 \ucd94\uac00\ud558\ub294 \uac83\uc744 \uace0\ub824\ud558\uc138\uc694.`
        )
      );
    }
  }

  return issues;
}

/**
 * Rule 6: Event chronology violation
 */
function checkEventChronology(
  events: Record<string, WorldEvent>,
  links: Record<string, Link>
): ConsistencyIssue[] {
  const issues: ConsistencyIssue[] = [];

  const causalLinks = Object.values(links).filter(
    (l) =>
      l.relationType === "caused" &&
      l.fromType === "event" &&
      l.toType === "event"
  );

  for (const link of causalLinks) {
    const causeEvent = events[link.fromId];
    const effectEvent = events[link.toId];

    if (!causeEvent || !effectEvent) continue;

    if (causeEvent.timelineIndex >= effectEvent.timelineIndex) {
      issues.push(
        issue(
          "event-chronology",
          "error",
          `\uc0ac\uac74 "${causeEvent.title}" (${causeEvent.timelineIndex}\ub144)\uc774 "${effectEvent.title}" (${effectEvent.timelineIndex}\ub144)\uc758 \uc6d0\uc778\uc774\uc9c0\ub9cc, \uac19\uc740 \uc2dc\uae30\uc774\uac70\ub098 \ub354 \ub2a6\uac8c \ubc1c\uc0dd\ud569\ub2c8\ub2e4.`,
          [
            { type: "event", id: causeEvent.id, name: causeEvent.title },
            { type: "event", id: effectEvent.id, name: effectEvent.title },
          ],
          `\uc6d0\uc778 \uc0ac\uac74 \ud0c0\uc784\ub77c\uc778: ${causeEvent.timelineIndex}. \uacb0\uacfc \uc0ac\uac74 \ud0c0\uc784\ub77c\uc778: ${effectEvent.timelineIndex}. \uc6d0\uc778\uc774 \uacb0\uacfc\ubcf4\ub2e4 \uba3c\uc800\uc5ec\uc57c \ud569\ub2c8\ub2e4.`,
          `\ud558\ub098\uc758 \uc0ac\uac74 \ud0c0\uc784\ub77c\uc778\uc744 \uc870\uc815\ud558\uc5ec \uc6d0\uc778\uc774 \uacb0\uacfc\ubcf4\ub2e4 \uba3c\uc800 \ubc1c\uc0dd\ud558\ub3c4\ub85d \ud558\uc138\uc694.`
        )
      );
    }
  }

  return issues;
}

/**
 * Rule 7: Manuscript POV character post-death
 */
function checkManuscriptPovDeath(
  manuscriptScenes: Record<string, ManuscriptScene>,
  characters: Record<string, Character>
): ConsistencyIssue[] {
  const issues: ConsistencyIssue[] = [];

  for (const ms of Object.values(manuscriptScenes)) {
    if (!ms.povCharacterId) continue;
    const char = characters[ms.povCharacterId];
    if (!char || char.deathYear == null) continue;

    const timelineNum = Number(ms.timelineLabel);
    if (isNaN(timelineNum) || timelineNum === 0) continue;

    if (timelineNum > char.deathYear) {
      issues.push(
        issue(
          "manuscript-pov-death",
          "error",
          `\uc6d0\uace0 \uc7a5\uba74 "${ms.title}"\uc758 POV \uc778\ubb3c "${char.name}"\uc740(\ub294) ${char.deathYear}\ub144\uc5d0 \uc0ac\ub9dd\ud588\uc9c0\ub9cc, \uc7a5\uba74\uc758 \uc2dc\uac04\uc120\uc740 ${timelineNum}\ub144\uc785\ub2c8\ub2e4.`,
          [
            { type: "character", id: char.id, name: char.name },
            { type: "manuscriptScene", id: ms.id, name: ms.title },
          ],
          `POV \uc778\ubb3c\uc758 \uc0ac\ub9dd\ub144\ub3c4: ${char.deathYear}\ub144. \uc6d0\uace0 \uc7a5\uba74 \uc2dc\uac04\uc120: ${timelineNum}\ub144.`,
          `POV \uc778\ubb3c\uc744 \ubcc0\uacbd\ud558\uac70\ub098, \uc7a5\uba74 \uc2dc\uac04\uc120\uc744 \uc218\uc815\ud558\uac70\ub098, \ud68c\uc0c1/\uc720\ub839 \uc2dc\uc810\uc73c\ub85c \ud45c\uc2dc\ud558\uc138\uc694.`
        )
      );
    }
  }

  return issues;
}

/**
 * Rule 8: Manuscript-Board location mismatch
 */
function checkManuscriptBoardLocationMismatch(
  manuscriptScenes: Record<string, ManuscriptScene>,
  boardScenes: Record<string, Scene>,
  locations: Record<string, any>
): ConsistencyIssue[] {
  const issues: ConsistencyIssue[] = [];

  for (const ms of Object.values(manuscriptScenes)) {
    if (!ms.linkedBoardSceneId || !ms.locationId) continue;
    const boardScene = boardScenes[ms.linkedBoardSceneId];
    if (!boardScene) continue;

    if (boardScene.locationIds.length > 0 && !boardScene.locationIds.includes(ms.locationId)) {
      const msLocName = locations[ms.locationId]?.name || ms.locationId;
      const boardLocNames = boardScene.locationIds
        .map((id: string) => locations[id]?.name || id)
        .join(", ");

      issues.push(
        issue(
          "manuscript-board-location",
          "warn",
          `\uc6d0\uace0 \uc7a5\uba74 "${ms.title}"\uc758 \uc7a5\uc18c(${msLocName})\uac00 \uc5f0\uacb0\ub41c \ubcf4\ub4dc \uc7a5\uba74 "${boardScene.title}"\uc758 \uc7a5\uc18c(${boardLocNames})\uc640 \ub2e4\ub985\ub2c8\ub2e4.`,
          [
            { type: "manuscriptScene", id: ms.id, name: ms.title },
            { type: "scene", id: boardScene.id, name: boardScene.title },
          ],
          `\uc6d0\uace0 \uc7a5\uc18c: ${msLocName}. \ubcf4\ub4dc \uc7a5\uba74 \uc7a5\uc18c: ${boardLocNames}.`,
          `\uc6d0\uace0\uc758 \uc7a5\uc18c\ub97c \ubcf4\ub4dc \uc7a5\uba74\uacfc \uc77c\uce58\uc2dc\ud0a4\uac70\ub098, \uc758\ub3c4\uc801\uc778 \ubcc0\uacbd\uc774\uba74 \ubcf4\ub4dc \uc7a5\uba74\ub3c4 \uc5c5\ub370\uc774\ud2b8\ud558\uc138\uc694.`
        )
      );
    }
  }

  return issues;
}

/**
 * Run all consistency checks and return combined issues.
 */
export function runConsistencyChecks(data: {
  characters: Record<string, Character>;
  locations: Record<string, any>;
  factions: Record<string, any>;
  items: Record<string, any>;
  events: Record<string, WorldEvent>;
  scenes: Record<string, Scene>;
  links: Record<string, Link>;
  foreshadows: Record<string, Foreshadow>;
  manuscriptScenes?: Record<string, ManuscriptScene>;
}): ConsistencyIssue[] {
  // Build a flat entity name map for relationship checks
  const entityNameMap: Record<string, { id: string; name: string }> = {};
  for (const c of Object.values(data.characters)) {
    entityNameMap[c.id] = { id: c.id, name: c.name };
  }
  for (const l of Object.values(data.locations)) {
    entityNameMap[l.id] = { id: l.id, name: l.name };
  }
  for (const f of Object.values(data.factions)) {
    entityNameMap[f.id] = { id: f.id, name: f.name };
  }
  for (const i of Object.values(data.items)) {
    entityNameMap[i.id] = { id: i.id, name: i.name };
  }
  for (const e of Object.values(data.events)) {
    entityNameMap[e.id] = { id: e.id, name: e.title };
  }

  return [
    ...checkAgeTimeline(data.characters, data.scenes),
    ...checkDualLocation(data.characters, data.scenes),
    ...checkRelationshipConflict(data.links, entityNameMap),
    ...checkPostDeathAppearance(data.characters, data.scenes),
    ...checkUnresolvedForeshadows(data.foreshadows, data.scenes),
    ...checkEventChronology(data.events, data.links),
    ...(data.manuscriptScenes ? checkManuscriptPovDeath(data.manuscriptScenes, data.characters) : []),
    ...(data.manuscriptScenes ? checkManuscriptBoardLocationMismatch(data.manuscriptScenes, data.scenes, data.locations) : []),
  ];
}

/** Get a summary of issues by severity */
export function getIssueSummary(issues: ConsistencyIssue[]) {
  return {
    errors: issues.filter((i) => i.severity === "error").length,
    warnings: issues.filter((i) => i.severity === "warn").length,
    info: issues.filter((i) => i.severity === "info").length,
    total: issues.length,
  };
}
