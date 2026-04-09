import { useMemo } from "react";
import { useNovelStore } from "@/lib/novel-store";
import { useConsistencyStore } from "@/lib/consistency-store";
import type { EntityType } from "@/lib/novel-types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { X, CheckCircle2, Link2 } from "lucide-react";

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

interface ManuscriptContextPanelProps {
  sceneId: string | null;
}

export function ManuscriptContextPanel({ sceneId }: ManuscriptContextPanelProps) {
  const manuscriptScenes = useNovelStore((s) => s.manuscriptScenes);
  const manuscriptChapters = useNovelStore((s) => s.manuscriptChapters);
  const characters = useNovelStore((s) => s.characters);
  const locations = useNovelStore((s) => s.locations);
  const scenes = useNovelStore((s) => s.scenes);
  const plotPoints = useNovelStore((s) => s.plotPoints);
  const foreshadows = useNovelStore((s) => s.foreshadows);
  const getEntityById = useNovelStore((s) => s.getEntityById);
  const removeTextEntityReference = useNovelStore((s) => s.removeTextEntityReference);

  // 직접 슬라이스 구독 → 변경 시 리렌더링 보장
  const textEntityReferences = useNovelStore((s) => s.textEntityReferences);

  const msScene = sceneId ? (manuscriptScenes[sceneId] ?? null) : null;
  const msChapter = sceneId ? (manuscriptChapters[sceneId] ?? null) : null;
  const linkedBoardSceneId = msScene?.linkedBoardSceneId ?? msChapter?.linkedBoardSceneId ?? null;
  const povCharacterId = msScene?.povCharacterId ?? msChapter?.povCharacterId ?? null;

  // 슬라이스에서 직접 필터링 (리렌더링 보장)
  const refs = useMemo(() => {
    if (!sceneId) return [];
    return Object.values(textEntityReferences).filter((r) => r.manuscriptSceneId === sceneId);
  }, [sceneId, textEntityReferences]);

  const groupedRefs = useMemo(() => {
    const g: Partial<Record<EntityType, typeof refs>> = {};
    for (const r of refs) (g[r.entityType] ??= []).push(r);
    return g;
  }, [refs]);

  const boardScene = linkedBoardSceneId ? scenes[linkedBoardSceneId] : null;
  const relatedPlotPoints = useMemo(
    () => (linkedBoardSceneId ? Object.values(plotPoints).filter((pp) => pp.sceneId === linkedBoardSceneId) : []),
    [plotPoints, linkedBoardSceneId],
  );
  const relatedForeshadows = useMemo(
    () => (linkedBoardSceneId ? Object.values(foreshadows).filter((f) => f.setupSceneId === linkedBoardSceneId || f.payoffSceneId === linkedBoardSceneId) : []),
    [foreshadows, linkedBoardSceneId],
  );

  // Issues from consistency store
  const consistencyIssues = useConsistencyStore((s) => s.issues);
  const listIssuesByScene = useConsistencyStore((s) => s.listIssuesByScene);

  const issues = useMemo(() => {
    if (!sceneId) return [];
    const byMs = listIssuesByScene(sceneId);
    const byBoard = linkedBoardSceneId ? listIssuesByScene(linkedBoardSceneId) : [];
    const entityIssues = povCharacterId
      ? Object.values(consistencyIssues).filter((i) => i.relatedEntityIds.includes(povCharacterId) && i.status === 'open')
      : [];
    const map = new Map<string, typeof byMs[number]>();
    for (const i of [...byMs, ...byBoard, ...entityIssues]) map.set(i.id, i);
    return Array.from(map.values());
  }, [sceneId, linkedBoardSceneId, povCharacterId, consistencyIssues, listIssuesByScene]);

  if (!sceneId) return <div className="p-4 text-xs text-fg-muted">화를 선택하세요.</div>;

  return (
    <Tabs defaultValue="entities" className="flex flex-col h-full">
      <TabsList className="bg-bg-subtle rounded-lg shrink-0">
        <TabsTrigger value="entities" className="text-xs">엔티티</TabsTrigger>
        <TabsTrigger value="board" className="text-xs">보드</TabsTrigger>
        <TabsTrigger value="consistency" className="text-xs">정합성</TabsTrigger>
      </TabsList>

      {/* Tab 1: 연결된 위키 엔티티 */}
      <TabsContent value="entities" className="flex-1 min-h-0">
        <ScrollArea className="h-full">
          <div className="p-2 space-y-3">
            {refs.length === 0 ? (
              <div className="text-center py-4 space-y-1">
                <Link2 className="h-5 w-5 mx-auto text-fg-muted opacity-40" />
                <p className="text-xs text-fg-muted">위키에 등록된 이름이 본문에 나오면</p>
                <p className="text-xs text-fg-muted">자동으로 연결됩니다.</p>
                <p className="text-[10px] text-fg-muted mt-2">본문에서 텍스트를 선택하면 빠른 등록도 가능합니다.</p>
              </div>
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

      {/* Tab 2: 구성 보드 연결 */}
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

      {/* Tab 3: 정합성 검사 */}
      <TabsContent value="consistency" className="flex-1 min-h-0">
        <ScrollArea className="h-full">
          <div className="p-2 space-y-2">
            {issues.length === 0 ? (
              <div className="flex items-center justify-center gap-1.5 py-4 text-xs text-fg-muted">
                <CheckCircle2 className="h-4 w-4" />
                정합성 문제가 없습니다.
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
    </Tabs>
  );
}
