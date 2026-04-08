import { useMemo } from "react";
import { useNovelStore } from "@/lib/novel-store";
import { useConsistencyStore } from "@/lib/consistency-store";
import type { EntityType, ExtractedProposalType, ExtractedProposalStatus } from "@/lib/novel-types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { X, Check, Clock, CheckCircle2 } from "lucide-react";

const TYPE_COLORS: Record<EntityType, string> = {
  character: "bg-tag-blue-10 text-tag-blue-100",
  location: "bg-tag-cyan-10 text-tag-cyan-100",
  faction: "bg-tag-purple-10 text-tag-purple-100",
  item: "bg-tag-orange-10 text-tag-orange-100",
  event: "bg-tag-yellow-10 text-tag-yellow-100",
};

const TYPE_LABELS: Record<EntityType, string> = {
  character: "캐릭터",
  location: "장소",
  faction: "세력",
  item: "아이템",
  event: "사건",
};

const PROPOSAL_TYPE_LABELS: Record<ExtractedProposalType, string> = {
  new_entity: "새 엔티티",
  state_change: "상태 변화",
  relationship_change: "관계 변화",
  foreshadow: "떡밥",
  payoff: "회수",
  fact: "설정 사실",
};

const STATUS_BADGE: Record<ExtractedProposalStatus, { label: string; cls: string }> = {
  pending: { label: "대기중", cls: "bg-tag-yellow-10 text-tag-yellow-100" },
  accepted: { label: "승인", cls: "bg-tag-cyan-10 text-tag-cyan-100" },
  rejected: { label: "무시", cls: "bg-bg-subtle text-fg-muted" },
  deferred: { label: "보류", cls: "bg-tag-blue-10 text-tag-blue-100" },
};

const SEVERITY_DOT: Record<string, string> = { error: "bg-red-500", warn: "bg-yellow-500", info: "bg-blue-500" };

interface ManuscriptContextPanelProps {
  sceneId: string | null;
}

export function ManuscriptContextPanel({ sceneId }: ManuscriptContextPanelProps) {
  const manuscriptScenes = useNovelStore((s) => s.manuscriptScenes);
  const characters = useNovelStore((s) => s.characters);
  const locations = useNovelStore((s) => s.locations);
  const scenes = useNovelStore((s) => s.scenes);
  const plotPoints = useNovelStore((s) => s.plotPoints);
  const foreshadows = useNovelStore((s) => s.foreshadows);
  const getReferencesForScene = useNovelStore((s) => s.getReferencesForScene);
  const getProposalsForScene = useNovelStore((s) => s.getProposalsForScene);
  const getEntityById = useNovelStore((s) => s.getEntityById);
  const removeTextEntityReference = useNovelStore((s) => s.removeTextEntityReference);
  const updateExtractedProposal = useNovelStore((s) => s.updateExtractedProposal);

  const msScene = sceneId ? manuscriptScenes[sceneId] : null;
  const refs = useMemo(() => (sceneId ? getReferencesForScene(sceneId) : []), [sceneId, getReferencesForScene]);
  const proposals = useMemo(() => (sceneId ? getProposalsForScene(sceneId) : []), [sceneId, getProposalsForScene]);

  const groupedRefs = useMemo(() => {
    const g: Partial<Record<EntityType, typeof refs>> = {};
    for (const r of refs) (g[r.entityType] ??= []).push(r);
    return g;
  }, [refs]);

  const boardScene = msScene?.linkedBoardSceneId ? scenes[msScene.linkedBoardSceneId] : null;
  const linkedId = msScene?.linkedBoardSceneId;
  const relatedPlotPoints = useMemo(
    () => (linkedId ? Object.values(plotPoints).filter((pp) => pp.sceneId === linkedId) : []),
    [plotPoints, linkedId],
  );
  const relatedForeshadows = useMemo(
    () => (linkedId ? Object.values(foreshadows).filter((f) => f.setupSceneId === linkedId || f.payoffSceneId === linkedId) : []),
    [foreshadows, linkedId],
  );

  // Issues from consistency store
  const consistencyIssues = useConsistencyStore((s) => s.issues);
  const listIssuesByScene = useConsistencyStore((s) => s.listIssuesByScene);

  const issues = useMemo(() => {
    if (!sceneId) return [];
    // Check both manuscript scene ID and linked board scene ID
    const byMs = listIssuesByScene(sceneId);
    const byBoard = msScene?.linkedBoardSceneId ? listIssuesByScene(msScene.linkedBoardSceneId) : [];
    // Also check by entity
    const entityIssues = msScene?.povCharacterId
      ? Object.values(consistencyIssues).filter((i) => i.relatedEntityIds.includes(msScene.povCharacterId!) && i.status === 'open')
      : [];
    // Dedupe by ID
    const map = new Map<string, typeof byMs[number]>();
    for (const i of [...byMs, ...byBoard, ...entityIssues]) map.set(i.id, i);
    return Array.from(map.values());
  }, [sceneId, msScene, consistencyIssues, listIssuesByScene]);

  if (!sceneId) return <div className="p-4 text-xs text-fg-muted">장면을 선택하세요.</div>;

  return (
    <Tabs defaultValue="entities" className="flex flex-col h-full">
      <TabsList className="bg-bg-subtle rounded-lg shrink-0">
        <TabsTrigger value="entities" className="text-xs">엔티티</TabsTrigger>
        <TabsTrigger value="board" className="text-xs">보드</TabsTrigger>
        <TabsTrigger value="consistency" className="text-xs">정합성</TabsTrigger>
        <TabsTrigger value="proposals" className="text-xs">제안</TabsTrigger>
      </TabsList>

      {/* Tab 1: Entities */}
      <TabsContent value="entities" className="flex-1 min-h-0">
        <ScrollArea className="h-full">
          <div className="p-2 space-y-3">
            {refs.length === 0 ? (
              <p className="text-xs text-fg-muted text-center py-4">연결된 엔티티가 없습니다.</p>
            ) : (
              (Object.entries(groupedRefs) as [EntityType, typeof refs][]).map(([type, items]) => (
                <div key={type} className="space-y-1">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-fg-muted">{TYPE_LABELS[type]}</p>
                  <div className="flex flex-wrap gap-1">
                    {items.map((ref) => {
                      const entity = getEntityById(ref.entityType, ref.entityId);
                      const name = entity ? ("name" in entity ? entity.name : ("title" in entity ? (entity as { title: string }).title : ref.entityId)) : ref.entityId;
                      return (
                        <Badge key={ref.id} className={`${TYPE_COLORS[type]} text-[10px] gap-1 pr-1`}>
                          {name}
                          <button onClick={() => removeTextEntityReference(ref.id)} className="ml-0.5 hover:opacity-70">
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      );
                    })}
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </TabsContent>

      {/* Tab 2: Board */}
      <TabsContent value="board" className="flex-1 min-h-0">
        <ScrollArea className="h-full">
          <div className="p-2 space-y-3">
            {!boardScene ? (
              <p className="text-xs text-fg-muted text-center py-4">연결된 구성 보드 장면이 없습니다.</p>
            ) : (
              <>
                <div>
                  <p className="text-xs font-semibold text-fg-base">{boardScene.title}</p>
                  {boardScene.summary && <p className="text-xs text-fg-muted mt-1">{boardScene.summary}</p>}
                </div>
                {boardScene.characterIds.length > 0 && (
                  <div className="space-y-1">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-fg-muted">캐릭터</p>
                    <div className="flex flex-wrap gap-1">
                      {boardScene.characterIds.map((cid) => {
                        const c = characters[cid];
                        return <Badge key={cid} className={`${TYPE_COLORS.character} text-[10px]`}>{c?.name ?? cid}</Badge>;
                      })}
                    </div>
                  </div>
                )}
                {boardScene.locationIds.length > 0 && (
                  <div className="space-y-1">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-fg-muted">장소</p>
                    <div className="flex flex-wrap gap-1">
                      {boardScene.locationIds.map((lid) => {
                        const l = locations[lid];
                        return <Badge key={lid} className={`${TYPE_COLORS.location} text-[10px]`}>{l?.name ?? lid}</Badge>;
                      })}
                    </div>
                  </div>
                )}
                {relatedPlotPoints.length > 0 && (
                  <div className="space-y-1">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-fg-muted">플롯 포인트</p>
                    {relatedPlotPoints.map((pp) => (
                      <p key={pp.id} className="text-xs text-fg-base">- {pp.title}</p>
                    ))}
                  </div>
                )}
                {relatedForeshadows.length > 0 && (
                  <div className="space-y-1">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-fg-muted">떡밥/회수</p>
                    {relatedForeshadows.map((f) => (
                      <p key={f.id} className="text-xs text-fg-base">- {f.note}</p>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </ScrollArea>
      </TabsContent>

      {/* Tab 3: Consistency (from consistency store) */}
      <TabsContent value="consistency" className="flex-1 min-h-0">
        <ScrollArea className="h-full">
          <div className="p-2 space-y-2">
            {issues.length === 0 ? (
              <div className="flex items-center justify-center gap-1.5 py-4 text-xs text-fg-muted">
                <CheckCircle2 className="h-4 w-4" />
                {"\uc815\ud569\uc131 \ubb38\uc81c\uac00 \uc5c6\uc2b5\ub2c8\ub2e4."}
              </div>
            ) : (
              issues.map((issue) => (
                <div key={issue.id} className="flex items-start gap-2 text-xs border border-border-strong rounded p-2">
                  <span className={`mt-0.5 h-2.5 w-2.5 shrink-0 rounded-full ${
                    issue.severity === "high" ? "bg-visualizer-crimson-spark" :
                    issue.severity === "medium" ? "bg-visualizer-golden-amber" : "bg-visualizer-royal-blue"
                  }`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-fg-base font-medium">{issue.title}</p>
                    <p className="text-fg-subtle text-[10px] mt-0.5">{issue.message}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </TabsContent>

      {/* Tab 4: Proposals */}
      <TabsContent value="proposals" className="flex-1 min-h-0">
        <ScrollArea className="h-full">
          <div className="p-2 space-y-2">
            {proposals.length === 0 ? (
              <p className="text-xs text-fg-muted text-center py-4">추출 제안이 없습니다.</p>
            ) : (
              proposals.map((p) => (
                <div key={p.id} className="border border-border-strong rounded-md p-2 space-y-1.5">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <Badge className="bg-tag-purple-10 text-tag-purple-100 text-[10px]">{PROPOSAL_TYPE_LABELS[p.proposalType]}</Badge>
                    <Badge className={`${STATUS_BADGE[p.status].cls} text-[10px]`}>{STATUS_BADGE[p.status].label}</Badge>
                  </div>
                  <p className="text-xs text-fg-base">{p.description}</p>
                  {p.status === "pending" && (
                    <div className="flex items-center gap-1 pt-0.5">
                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => updateExtractedProposal(p.id, { status: "accepted" })}>
                        <Check className="h-3.5 w-3.5 text-tag-cyan-100" />
                      </Button>
                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => updateExtractedProposal(p.id, { status: "rejected" })}>
                        <X className="h-3.5 w-3.5 text-fg-muted" />
                      </Button>
                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => updateExtractedProposal(p.id, { status: "deferred" })}>
                        <Clock className="h-3.5 w-3.5 text-tag-blue-100" />
                      </Button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </TabsContent>
    </Tabs>
  );
}
