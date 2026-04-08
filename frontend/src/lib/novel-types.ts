// Entity types
export type EntityType = 'character' | 'location' | 'faction' | 'item' | 'event';

export interface Character {
  id: string;
  name: string;
  age: number | null;
  birthYear: number | null; // timeline year
  deathYear: number | null; // null if alive
  role: string; // protagonist, antagonist, supporting, etc.
  traits: string[];
  notes: string;
  createdAt: number;
  updatedAt: number;
}

export interface Location {
  id: string;
  name: string;
  type: string; // city, dungeon, forest, etc.
  description: string;
  createdAt: number;
  updatedAt: number;
}

export interface Faction {
  id: string;
  name: string;
  ideology: string;
  description: string;
  createdAt: number;
  updatedAt: number;
}

export interface Item {
  id: string;
  name: string;
  category: string; // weapon, artifact, potion, etc.
  description: string;
  createdAt: number;
  updatedAt: number;
}

export interface WorldEvent {
  id: string;
  title: string;
  timelineIndex: number; // year or sequence number
  summary: string;
  createdAt: number;
  updatedAt: number;
}

// Link between entities
export type RelationType =
  | 'member_of' | 'enemy_of' | 'ally_of' | 'parent_of' | 'child_of'
  | 'located_in' | 'owns' | 'participated_in' | 'caused'
  | 'friend_of' | 'mentor_of' | 'student_of' | 'rival_of'
  | 'related_to' | 'leader_of' | 'serves' | 'created_by';

export interface Link {
  id: string;
  fromType: EntityType;
  fromId: string;
  toType: EntityType;
  toId: string;
  relationType: RelationType;
  weight: number; // 0-1
  createdAt: number;
}

// Scene and story structure

// Board Chapter (장 단위 메타데이터)
export interface BoardChapter {
  id: string;
  chapterNo: number;
  title: string;
  purpose: string;
  mainPovCharacterId: string | null;
  hookEnd: string;
  targetWordCount: number;
  draftStatus: 'planned' | 'outlining' | 'drafting' | 'revising' | 'complete';
  createdAt: number;
  updatedAt: number;
}

export interface Scene {
  id: string;
  title: string;
  chapterNo: number;
  actNo: number;
  timelineIndex: number;
  summary: string;
  draftText: string;
  characterIds: string[];
  locationIds: string[];
  itemIds: string[];
  // Novel-writer fields
  povCharacterId: string | null;
  goal: string;
  conflict: string;
  turn: string;
  outcome: string;
  emotionalShiftFrom: string;
  emotionalShiftTo: string;
  emotionalShift: string;
  infoRevealed: string;
  hookEnd: string;
  threadIds: string[];
  manuscriptStatus: string;
  wordCount: number;
  createdAt: number;
  updatedAt: number;
}

// Board Scene <-> Thread link with role
export type ThreadLinkRole = 'introduces' | 'advances' | 'complicates' | 'reveals' | 'resolves';

export interface BoardSceneThreadLink {
  id: string;
  sceneId: string;
  threadId: string;
  role: ThreadLinkRole;
  createdAt: number;
}

export type PlotPointType = 'setup' | 'conflict' | 'climax' | 'resolution';

export interface PlotPoint {
  id: string;
  type: PlotPointType;
  title: string;
  chapterNo: number;
  notes: string;
  sceneId: string | null;
  createdAt: number;
  updatedAt: number;
}

export type ForeshadowStatus = 'open' | 'resolved' | 'abandoned';

// Narrative Thread (서사 스레드)
export type NarrativeThreadType =
  | 'main_plot'
  | 'character_arc'
  | 'relationship'
  | 'mystery'
  | 'world_rule'
  | 'foreshadow'
  | 'emotion'
  | 'politics'
  | 'custom';

export type NarrativeThreadStatus =
  | 'intro'
  | 'developing'
  | 'deepening'
  | 'turning'
  | 'revealed'
  | 'resolved'
  | 'paused'
  | 'abandoned';

export interface NarrativeThread {
  id: string;
  type: NarrativeThreadType;
  title: string;
  description: string;
  status: NarrativeThreadStatus;
  setupSceneId: string | null;
  latestSceneId: string | null;
  payoffSceneId: string | null;
  relatedCharacterIds: string[];
  relatedEntityIds: string[];
  createdAt: number;
  updatedAt: number;
}

export interface Foreshadow {
  id: string;
  setupSceneId: string;
  payoffSceneId: string | null;
  note: string;
  status: ForeshadowStatus;
  createdAt: number;
  updatedAt: number;
}

// Revision log
export interface RevisionLog {
  id: string;
  entityType: string; // 'character' | 'location' | etc. or 'scene' | 'plotPoint'
  entityId: string;
  action: 'create' | 'update' | 'delete';
  diffJson: string; // JSON stringified diff (before/after)
  createdAt: number;
  author: string;
}

// Consistency check result
export type Severity = 'info' | 'warn' | 'error';

export interface ConsistencyIssue {
  id: string;
  ruleId: string;
  severity: Severity;
  message: string;
  entityRefs: Array<{ type: string; id: string; name: string }>;
  why: string;
  fixSuggestion: string;
}

// =========================================================================
// Manuscript (본편 집필) types
// =========================================================================

export type ManuscriptSceneStatus = 'draft' | 'writing' | 'review' | 'complete';

export interface Book {
  id: string;
  title: string;
  sortOrder: number;
  createdAt: number;
  updatedAt: number;
}

export interface ManuscriptChapter {
  id: string;
  bookId: string;
  title: string;
  sortOrder: number;
  content: string;
  summary: string;
  status: ManuscriptSceneStatus;
  wordCount: number;
  lastEditedAt: number;
  linkedBoardSceneId: string | null;
  povCharacterId: string | null;
  locationId: string | null;
  timelineLabel: string;
  createdAt: number;
  updatedAt: number;
}

export interface ManuscriptScene {
  id: string;
  chapterId: string;
  bookId: string;
  title: string;
  sortOrder: number;
  linkedBoardSceneId: string | null;
  povCharacterId: string | null;
  locationId: string | null;
  timelineLabel: string;
  status: ManuscriptSceneStatus;
  content: string;
  summary: string;
  goal: string;
  conflict: string;
  outcome: string;
  wordCount: number;
  lastEditedAt: number;
  createdAt: number;
  updatedAt: number;
}

export interface ManuscriptVersion {
  id: string;
  manuscriptSceneId: string;
  content: string;
  wordCount: number;
  createdAt: number;
}

export interface TextEntityReference {
  id: string;
  manuscriptSceneId: string;
  entityType: EntityType;
  entityId: string;
  createdAt: number;
}

export type ExtractedProposalType =
  | 'new_entity'
  | 'state_change'
  | 'relationship_change'
  | 'foreshadow'
  | 'payoff'
  | 'fact';

export type ExtractedProposalStatus = 'pending' | 'accepted' | 'rejected' | 'deferred';

export interface ExtractedProposal {
  id: string;
  manuscriptSceneId: string;
  proposalType: ExtractedProposalType;
  description: string;
  status: ExtractedProposalStatus;
  targetEntityType: EntityType | null;
  targetEntityId: string | null;
  createdAt: number;
  updatedAt: number;
}

// Helper type for any entity
export type AnyEntity = Character | Location | Faction | Item | WorldEvent;

// Get entity by type
export type EntityMap = {
  character: Character;
  location: Location;
  faction: Faction;
  item: Item;
  event: WorldEvent;
};
