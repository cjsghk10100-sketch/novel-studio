import { useState, useMemo } from "react";
import { useNovelStore } from "@/lib/novel-store";
import { useConsistencyStore } from "@/lib/consistency-store";
import type { NarrativeThread } from "@/lib/novel-types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  GripVertical, ChevronUp, ChevronDown, ChevronRight,
  MapPin, Users, FileText, Target, Zap, Swords, Eye,
  Link2, Clock, AlertTriangle, ExternalLink, ArrowRight,
  Package, Shield, CalendarClock, PenTool,
} from "lucide-react";

const MS_STATUS_LABELS: Record<string, string> = {
  draft: "\ucd08\uc548", writing: "\uc9d1\ud544\uc911", review: "\uac80\ud1a0\uc911", complete: "\ucd08\uace0\uc644\ub8cc",
};
const MS_STATUS_STYLES: Record<string, string> = {
  draft: "bg-bg-subtle text-fg-muted border-border-strong",
  writing: "bg-tag-blue-10 text-tag-blue-100 border-tag-blue-100/20",
  review: "bg-tag-yellow-10 text-tag-yellow-100 border-tag-yellow-100/20",
  complete: "bg-tag-cyan-10 text-tag-cyan-100 border-tag-cyan-100/20",
};

interface SceneCardProps {
  sceneId: string;
  onEdit: (id: string) => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  onNavigateToManuscript?: (sceneId: string) => void;
}

export function SceneCard({ sceneId, onEdit, onMoveUp, onMoveDown, onNavigateToManuscript }: SceneCardProps) {
  const [expanded, setExpanded] = useState(false);

  const scene = useNovelStore((s) => s.scenes[sceneId]);
  const characters = useNovelStore((s) => s.characters);
  const locations = useNovelStore((s) => s.locations);
  const items = useNovelStore((s) => s.items);
  const factions = useNovelStore((s) => s.factions);
  const narrativeThreads = useNovelStore((s) => s.narrativeThreads);
  const manuscriptScenes = useNovelStore((s) => s.manuscriptScenes);

  const linkedMs = useMemo(
    () => Object.values(manuscriptScenes).filter((ms) => ms.linkedBoardSceneId === sceneId),
    [manuscriptScenes, sceneId],
  );

  const linkedThreads = useMemo(() => {
    const ids = scene?.threadIds ?? [];
    return ids.map((tid) => narrativeThreads[tid]).filter(Boolean) as NarrativeThread[];
  }, [scene, narrativeThreads]);

  // Consistency store issues (must be before early return)
  const listIssuesByBoardScene = useConsistencyStore((s) => s.listIssuesByBoardScene);
  const storeIssues = useMemo(() => listIssuesByBoardScene(sceneId).filter((i) => i.status === 'open'), [sceneId, listIssuesByBoardScene]);

  if (!scene) return null;

  const pov = scene.povCharacterId ? characters[scene.povCharacterId] : null;
  const loc = (scene.locationIds ?? []).map((id) => locations[id]).filter(Boolean);
  const sceneChars = (scene.characterIds ?? []).map((id) => characters[id]).filter(Boolean);
  const sceneItems = (scene.itemIds ?? []).map((id) => items[id]).filter(Boolean);

  const goal = scene.goal ?? "";
  const conflict = scene.conflict ?? "";
  const outcome = scene.outcome ?? "";
  const emotional = scene.emotionalShift ?? "";
  const info = scene.infoRevealed ?? "";
  const hook = scene.hookEnd ?? "";
  const msWordCount = linkedMs.reduce((s, ms) => s + (ms.wordCount ?? 0), 0);

  // Manuscript status summary
  const msStatus = linkedMs.length > 0
    ? linkedMs.every((ms) => ms.status === "complete") ? "complete"
      : linkedMs.some((ms) => ms.status === "writing" || ms.status === "review") ? "writing"
      : "draft"
    : null;

  // Consistency warnings
  const warnings: string[] = [];
  if (pov && pov.deathYear != null && scene.timelineIndex > pov.deathYear) {
    warnings.push(`${pov.name}\uc740(\ub294) ${pov.deathYear}\ub144\uc5d0 \uc0ac\ub9dd`);
  }
  // Check characters with deathYear
  for (const c of sceneChars) {
    if (c.deathYear != null && scene.timelineIndex > c.deathYear && c.id !== scene.povCharacterId) {
      warnings.push(`${c.name} \uc0ac\ub9dd \ud6c4 \ub4f1\uc7a5`);
    }
  }

  // Merge inline warnings + store issues
  const allWarnings = [...warnings, ...storeIssues.map((i) => i.title)];
  const warningLevel = allWarnings.length === 0 ? "none" : allWarnings.length >= 2 ? "high" : "medium";

  const toggleExpand = (e: React.MouseEvent) => {
    e.stopPropagation();
    setExpanded((v) => !v);
  };

  const lastEditStr = linkedMs[0]?.lastEditedAt
    ? new Date(linkedMs[0].lastEditedAt).toLocaleDateString("ko-KR", { month: "short", day: "numeric" })
    : null;

  return (
    <div className={`border rounded-lg bg-bg-chat transition-colors hover:border-border-contrast overflow-hidden ${warningLevel === "high" ? "border-visualizer-crimson-spark/40" : warningLevel === "medium" ? "border-visualizer-golden-amber/40" : "border-border-strong"}`}>
      {/* ── Collapsed (always visible) ── */}
      <div className="flex items-start gap-2 p-3">
        {/* Move handle */}
        {(onMoveUp || onMoveDown) && (
          <div className="flex flex-col items-center gap-0.5 pt-0.5 shrink-0">
            <GripVertical className="h-3.5 w-3.5 text-fg-muted" />
            {onMoveUp && (
              <button className="p-0.5 text-fg-muted hover:text-fg-base" onClick={(e) => { e.stopPropagation(); onMoveUp(); }}>
                <ChevronUp className="h-3 w-3" />
              </button>
            )}
            {onMoveDown && (
              <button className="p-0.5 text-fg-muted hover:text-fg-base" onClick={(e) => { e.stopPropagation(); onMoveDown(); }}>
                <ChevronDown className="h-3 w-3" />
              </button>
            )}
          </div>
        )}

        <div className="flex-1 min-w-0">
          {/* Row 1: Title + POV + Location + Timeline + Warning */}
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <button onClick={toggleExpand} className="p-0 shrink-0">
              <ChevronRight className={`h-3.5 w-3.5 text-fg-muted transition-transform ${expanded ? "rotate-90" : ""}`} />
            </button>
            <h3 className="text-sm font-semibold text-fg-base truncate cursor-pointer" onClick={() => onEdit(sceneId)}>
              {scene.title}
            </h3>
            {pov && (
              <Badge className="text-[10px] px-1.5 py-0 bg-tag-blue-10 text-tag-blue-100 border-0 shrink-0">
                <Users className="h-2.5 w-2.5 mr-0.5" />{pov.name}
              </Badge>
            )}
            {loc.length > 0 && (
              <span className="text-[10px] text-fg-muted shrink-0 flex items-center gap-0.5">
                <MapPin className="h-2.5 w-2.5" />{loc[0].name}
              </span>
            )}
            {scene.timelineIndex > 0 && (
              <span className="text-[10px] text-fg-muted flex items-center gap-0.5">
                <Clock className="h-2.5 w-2.5" />{scene.timelineIndex}
              </span>
            )}
            {/* Consistency warning badge */}
            {warnings.length > 0 && (
              <Badge className="text-[10px] px-1 py-0 bg-visualizer-crimson-spark/10 text-visualizer-crimson-spark border-0 shrink-0">
                <AlertTriangle className="h-2.5 w-2.5 mr-0.5" />{warnings.length}
              </Badge>
            )}
          </div>

          {/* Row 2: Goal -> Outcome + Emotional shift */}
          <div className="flex items-center gap-1.5 mb-1.5 text-[10px] text-fg-muted flex-wrap">
            {goal.trim() && (
              <span className="flex items-center gap-0.5">
                <Target className="h-2.5 w-2.5 text-tag-blue-100 shrink-0" />
                <span className="truncate max-w-40">{goal}</span>
              </span>
            )}
            {outcome.trim() && (
              <>
                <ArrowRight className="h-2.5 w-2.5 shrink-0" />
                <span className="truncate max-w-40">{outcome}</span>
              </>
            )}
            {emotional.trim() && (
              <span className="text-tag-purple-100 shrink-0">{emotional}</span>
            )}
          </div>

          {/* Row 3: Entities (collapsed) + Thread chips + Manuscript status */}
          <div className="flex flex-wrap items-center gap-1.5">
            {/* Key entity chips (collapsed view - show first 3 chars) */}
            {sceneChars.slice(0, 2).map((c) => (
              <Badge key={c.id} className="text-[10px] px-1 py-0 bg-tag-blue-10 text-tag-blue-100 border-0">
                {c.name}
              </Badge>
            ))}
            {sceneChars.length > 2 && (
              <span className="text-[10px] text-fg-muted">+{sceneChars.length - 2}</span>
            )}

            {/* Thread chips */}
            {linkedThreads.slice(0, 2).map((t) => (
              <Badge key={t.id} variant="outline" className="text-[10px] px-1 py-0 border-border-strong text-fg-subtle">
                {t.title.length > 10 ? t.title.slice(0, 10) + "\u2026" : t.title}
              </Badge>
            ))}
            {linkedThreads.length > 2 && (
              <span className="text-[10px] text-fg-muted">+{linkedThreads.length - 2}</span>
            )}

            {/* Manuscript status */}
            {msStatus && (
              <Badge className={`text-[10px] px-1 py-0 border shrink-0 ${MS_STATUS_STYLES[msStatus] ?? MS_STATUS_STYLES.draft}`}>
                <FileText className="h-2.5 w-2.5 mr-0.5" />
                {MS_STATUS_LABELS[msStatus] ?? "\uc6d0\uace0 \uc5c6\uc74c"} {msWordCount > 0 ? `${msWordCount.toLocaleString()}\uae00\uc790` : ""}
              </Badge>
            )}
            {!msStatus && (
              <span className="text-[10px] text-fg-muted flex items-center gap-0.5">
                <FileText className="h-2.5 w-2.5" />{"\uc6d0\uace0 \uc5c6\uc74c"}
              </span>
            )}

            {/* Hook at right end */}
            {hook.trim() && (
              <span className="text-[10px] text-fg-muted flex items-center gap-0.5 ml-auto">
                <Zap className="h-2.5 w-2.5 text-tag-yellow-100" />
                <span className="truncate max-w-24">{hook}</span>
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ── Expanded (detail view) ── */}
      {expanded && (
        <div className="px-3 pb-3 pt-0 border-t border-border-strong space-y-3">
          {/* Consistency warnings */}
          {warnings.length > 0 && (
            <div className="bg-visualizer-crimson-spark/5 rounded-md p-2 space-y-1 mt-2">
              <span className="text-[10px] font-semibold text-visualizer-crimson-spark flex items-center gap-0.5">
                <AlertTriangle className="h-3 w-3" />{"\uc815\ud569\uc131 \uacbd\uace0"}
              </span>
              {warnings.map((w, i) => (
                <p key={i} className="text-[10px] text-visualizer-crimson-spark/80">{"\u2022"} {w}</p>
              ))}
            </div>
          )}

          {/* Narrative flow detail */}
          <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 pt-2">
            {conflict.trim() && (
              <div>
                <span className="text-[10px] font-semibold text-fg-subtle flex items-center gap-0.5">
                  <Swords className="h-2.5 w-2.5 text-tag-orange-100" />{"\uac08\ub4f1"}
                </span>
                <p className="text-[11px] text-fg-base mt-0.5">{conflict}</p>
              </div>
            )}
            {info.trim() && (
              <div>
                <span className="text-[10px] font-semibold text-fg-subtle flex items-center gap-0.5">
                  <Eye className="h-2.5 w-2.5" />{"\uc0c8\ub85c \uacf5\uac1c\ub41c \uc815\ubcf4"}
                </span>
                <p className="text-[11px] text-fg-base mt-0.5">{info}</p>
              </div>
            )}
            {hook.trim() && (
              <div>
                <span className="text-[10px] font-semibold text-fg-subtle flex items-center gap-0.5">
                  <Zap className="h-2.5 w-2.5 text-tag-yellow-100" />{"\ud6c4\ud06c"}
                </span>
                <p className="text-[11px] text-fg-base mt-0.5">{hook}</p>
              </div>
            )}
            {scene.summary && (
              <div className="col-span-2">
                <span className="text-[10px] font-semibold text-fg-subtle">{"\uc694\uc57d"}</span>
                <p className="text-[11px] text-fg-subtle mt-0.5 leading-relaxed">{scene.summary}</p>
              </div>
            )}
          </div>

          {/* Wiki entities (full list with type icons) */}
          <div className="space-y-1">
            <span className="text-[10px] font-semibold text-fg-subtle">{"\uc5f0\uacb0\ub41c \uc704\ud0a4 \uc5d4\ud2f0\ud2f0"}</span>
            <div className="flex flex-wrap gap-1.5">
              {sceneChars.map((c) => (
                <Badge key={c.id} className="text-[10px] px-1 py-0 bg-tag-blue-10 text-tag-blue-100 border-0">
                  <Users className="h-2 w-2 mr-0.5" />{c.name}
                </Badge>
              ))}
              {loc.map((l) => (
                <Badge key={l.id} className="text-[10px] px-1 py-0 bg-tag-cyan-10 text-tag-cyan-100 border-0">
                  <MapPin className="h-2 w-2 mr-0.5" />{l.name}
                </Badge>
              ))}
              {sceneItems.map((i) => (
                <Badge key={i.id} className="text-[10px] px-1 py-0 bg-tag-orange-10 text-tag-orange-100 border-0">
                  <Package className="h-2 w-2 mr-0.5" />{i.name}
                </Badge>
              ))}
              {(sceneChars.length === 0 && loc.length === 0 && sceneItems.length === 0) && (
                <span className="text-[10px] text-fg-muted">{"\uc5f0\uacb0\ub41c \uc5d4\ud2f0\ud2f0 \uc5c6\uc74c"}</span>
              )}
            </div>
          </div>

          {/* All threads */}
          {linkedThreads.length > 0 && (
            <div>
              <span className="text-[10px] font-semibold text-fg-subtle">{"\uc5f0\uacb0\ub41c \uc2a4\ub808\ub4dc"}</span>
              <div className="flex flex-wrap gap-1.5 mt-1">
                {linkedThreads.map((t) => (
                  <Badge key={t.id} variant="outline" className="text-[10px] px-1.5 py-0 border-border-strong text-fg-subtle">
                    <Link2 className="h-2.5 w-2.5 mr-0.5" />{t.title}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Manuscript detail */}
          {linkedMs.length > 0 && (
            <div>
              <span className="text-[10px] font-semibold text-fg-subtle">{"\uc6d0\uace0 \uc0c1\ud0dc"}</span>
              <div className="flex items-center gap-2 mt-1 text-[10px]">
                <Badge className={`px-1.5 py-0 border ${MS_STATUS_STYLES[msStatus ?? "draft"]}`}>
                  {MS_STATUS_LABELS[msStatus ?? "draft"]}
                </Badge>
                <span className="text-fg-muted tabular-nums">{msWordCount.toLocaleString()}{"\uae00\uc790"}</span>
                {lastEditStr && <span className="text-fg-muted">{"\ub9c8\uc9c0\ub9c9 \uc218\uc815"}: {lastEditStr}</span>}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-1.5 pt-1">
            <Button variant="outline" size="sm" className="h-6 text-[10px] gap-1" onClick={() => onEdit(sceneId)}>
              {"\ud3b8\uc9d1"}
            </Button>
            {linkedMs.length > 0 && onNavigateToManuscript && (
              <Button variant="ghost" size="sm" className="h-6 text-[10px] gap-1"
                onClick={(e) => { e.stopPropagation(); onNavigateToManuscript(sceneId); }}>
                <ExternalLink className="h-2.5 w-2.5" />{"\ubcf8\ud3b8 \uc5f4\uae30"}
              </Button>
            )}
            {linkedMs.length === 0 && (
              <Button variant="ghost" size="sm" className="h-6 text-[10px] gap-1 text-fg-muted">
                <PenTool className="h-2.5 w-2.5" />{"\uc0c8 \uc6d0\uace0 \uc0dd\uc131"}
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
