// =========================================================================
// Consistency Issue Domain Types
// =========================================================================

export type IssueSeverity = 'high' | 'medium' | 'low';
export type IssueStatus = 'open' | 'ignored' | 'resolved';

export type EvidenceSourceType =
  | 'manuscript_scene'
  | 'board_scene'
  | 'wiki_entity'
  | 'wiki_fact'
  | 'wiki_relation'
  | 'proposal';

export interface ConsistencyIssueEvidence {
  sourceType: EvidenceSourceType;
  sourceId: string;
  snippetText: string | null;
  startOffset: number | null;
  endOffset: number | null;
}

export interface SuggestedAction {
  label: string;
  actionType: 'navigate' | 'edit' | 'link' | 'delete' | 'custom';
  targetType: string | null;
  targetId: string | null;
}

export interface ConsistencyIssue {
  id: string;
  ruleCode: string;
  severity: IssueSeverity;
  status: IssueStatus;
  title: string;
  message: string;
  bookId: string | null;
  chapterId: string | null;
  sceneId: string | null;
  boardSceneId: string | null;
  relatedEntityIds: string[];
  evidence: ConsistencyIssueEvidence[];
  suggestedActions: SuggestedAction[];
  firstDetectedAt: number;
  lastDetectedAt: number;
  createdAt: number;
  updatedAt: number;
}

export interface ConsistencyIssueSummary {
  total: number;
  high: number;
  medium: number;
  low: number;
  open: number;
  ignored: number;
  resolved: number;
}
