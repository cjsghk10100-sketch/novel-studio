import { useState, useMemo, useCallback } from "react";
import { useNovelStore } from "@/lib/novel-store";
import type { NarrativeThreadType, NarrativeThreadStatus, Scene } from "@/lib/novel-types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/components/ui/collapsible";
import { SceneCard } from "@/components/board/SceneCard";
import { SceneForm } from "@/components/board/SceneForm";
import { NarrativeThreadForm } from "@/components/board/NarrativeThreadForm";
import {
  Film, BookOpen, Plus, ChevronDown, ChevronUp, Clock, Users,
  AlertTriangle, Layers, PanelRightOpen, Trash2, Pencil, Target,
  Zap, Link2, Search, Filter, X,
} from "lucide-react";
import { Input } from "@/components/ui/input";

type ViewMode = "chapter" | "thread" | "pov" | "timeline";

const VIEW_MODES: { id: ViewMode; label: string }[] = [
  { id: "chapter", label: "\uc7a5 \ubcf4\uae30" },
  { id: "thread", label: "\uc2a4\ub808\ub4dc \ubcf4\uae30" },
  { id: "pov", label: "POV \ubcf4\uae30" },
  { id: "timeline", label: "\uc2dc\uac04\uc120 \ubcf4\uae30" },
];

const THREAD_TYPE_LABELS: Record<NarrativeThreadType, string> = {
  main_plot: "\uc8fc\ud50c\ub86f", character_arc: "\uc778\ubb3c \uc544\ud06c", relationship: "\uad00\uacc4 \uc544\ud06c",
  mystery: "\ubbf8\uc2a4\ud130\ub9ac", world_rule: "\uc138\uacc4\uad00 \uaddc\uce59", foreshadow: "\ubcf5\uc120",
  emotion: "\uac10\uc815\uc120", politics: "\uc815\uce58/\uc138\ub825", custom: "\uae30\ud0c0",
};
const THREAD_TYPE_COLORS: Record<NarrativeThreadType, string> = {
  main_plot: "bg-tag-pink-10 text-tag-pink-100",
  character_arc: "bg-tag-purple-10 text-tag-purple-100",
  relationship: "bg-tag-blue-10 text-tag-blue-100",
  mystery: "bg-tag-orange-10 text-tag-orange-100",
  world_rule: "bg-tag-cyan-10 text-tag-cyan-100",
  foreshadow: "bg-tag-yellow-10 text-tag-yellow-100",
  emotion: "bg-tag-purple-10 text-tag-purple-100",
  politics: "bg-tag-cyan-10 text-tag-cyan-100",
  custom: "bg-bg-subtle text-fg-muted",
};
const THREAD_STATUS_LABELS: Record<NarrativeThreadStatus, string> = {
  intro: "\ub3c4\uc785", developing: "\uc804\uac1c\uc911", deepening: "\uc2ec\ud654",
  turning: "\uc804\ud658", revealed: "\uacf5\uac1c", resolved: "\ud68c\uc218",
  paused: "\ubcf4\ub958", abandoned: "\ud3d0\uae30",
};
const THREAD_TYPE_ORDER: NarrativeThreadType[] = [
  "main_plot", "character_arc", "relationship", "mystery", "world_rule", "foreshadow", "emotion", "politics", "custom",
];

const MS_STATUS_LABELS: Record<string, string> = {
  draft: "\ucd08\uc548", writing: "\uc791\uc131\uc911", review: "\uac80\ud1a0\uc911", complete: "\uc644\ub8cc",
};
const MS_STATUS_STYLES: Record<string, string> = {
  draft: "bg-bg-subtle text-fg-muted border-border-strong",
  writing: "bg-tag-blue-10 text-tag-blue-100 border-tag-blue-100/20",
  review: "bg-tag-yellow-10 text-tag-yellow-100 border-tag-yellow-100/20",
  complete: "bg-tag-cyan-10 text-tag-cyan-100 border-tag-cyan-100/20",
};

export function BoardPage() {
  const books = useNovelStore((s) => s.books);
  const scenes = useNovelStore((s) => s.scenes);
  const narrativeThreads = useNovelStore((s) => s.narrativeThreads);
  const characters = useNovelStore((s) => s.characters);
  const manuscriptChapters = useNovelStore((s) => s.manuscriptChapters);
  const boardChapters = useNovelStore((s) => s.boardChapters);
  const reorderScenes = useNovelStore((s) => s.reorderScenes);

  const [selectedBookId, setSelectedBookId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("chapter");
  const [sceneFormOpen, setSceneFormOpen] = useState(false);
  const [editSceneId, setEditSceneId] = useState<string | undefined>();
  const [threadFormOpen, setThreadFormOpen] = useState(false);
  const [detailPanelOpen, setDetailPanelOpen] = useState(false);

  // Filter state
  const [filterPov, setFilterPov] = useState<string>("all");
  const [filterThread, setFilterThread] = useState<string>("all");
  const [filterSearch, setFilterSearch] = useState("");

  const sortedBooks = useMemo(
    () => Object.values(books).sort((a, b) => a.sortOrder - b.sortOrder), [books],
  );
  const allScenes = useMemo(() => Object.values(scenes), [scenes]);
  const allThreads = useMemo(() => Object.values(narrativeThreads), [narrativeThreads]);
  const allMsChapters = useMemo(() => Object.values(manuscriptChapters), [manuscriptChapters]);
  const locations = useNovelStore((s) => s.locations);

  // Unique POV characters for filter
  const povCharacters = useMemo(() => {
    const ids = new Set(allScenes.map((s) => s.povCharacterId).filter(Boolean) as string[]);
    return Array.from(ids).map((id) => characters[id]).filter(Boolean);
  }, [allScenes, characters]);

  // Apply filters to scenes
  const filteredScenes = useMemo(() => {
    let result = allScenes;
    const q = filterSearch.toLowerCase().trim();
    if (q) {
      result = result.filter((s) =>
        s.title.toLowerCase().includes(q) ||
        (s.summary ?? "").toLowerCase().includes(q) ||
        (s.goal ?? "").toLowerCase().includes(q)
      );
    }
    if (filterPov !== "all") {
      result = result.filter((s) => (s.povCharacterId ?? "") === filterPov);
    }
    if (filterThread !== "all") {
      result = result.filter((s) => (s.threadIds ?? []).includes(filterThread));
    }
    return result;
  }, [allScenes, filterSearch, filterPov, filterThread]);

  const hasActiveFilters = filterPov !== "all" || filterThread !== "all" || filterSearch !== "";

  // Chapter grouping with computed metadata (uses filtered scenes + BoardChapter)
  const allBoardChapters = useMemo(() => Object.values(boardChapters), [boardChapters]);

  const chapters = useMemo(() => {
    const m = new Map<number, Scene[]>();
    for (const s of filteredScenes) {
      const ch = m.get(s.chapterNo) || [];
      ch.push(s);
      m.set(s.chapterNo, ch);
    }
    return Array.from(m.entries())
      .sort(([a], [b]) => a - b)
      .map(([num, scns]) => {
        const sorted = scns.sort((a, b) => a.timelineIndex - b.timelineIndex);
        // Find matching BoardChapter metadata
        const bch = allBoardChapters.find((bc) => bc.chapterNo === num);
        const povIds = new Set(sorted.map((s) => s.povCharacterId).filter(Boolean));
        const mainPov = bch?.mainPovCharacterId ?? (povIds.size > 0 ? Array.from(povIds)[0] : null);
        const threadCount = new Set(sorted.flatMap((s) => s.threadIds ?? [])).size;
        const lastScene = sorted[sorted.length - 1];
        const hookEnd = bch?.hookEnd ?? lastScene?.hookEnd ?? "";
        const linkedMs = allMsChapters.filter((mc) =>
          sorted.some((s) => mc.linkedBoardSceneId === s.id)
        );
        const msWordCount = linkedMs.reduce((sum, mc) => sum + (mc.wordCount ?? 0), 0);
        const msStatus = linkedMs.length > 0
          ? linkedMs.every((mc) => mc.status === "complete") ? "complete"
            : linkedMs.some((mc) => mc.status === "writing" || mc.status === "review") ? "writing"
            : "draft"
          : null;

        return {
          chapterNo: num,
          title: bch?.title ?? "",
          purpose: bch?.purpose ?? "",
          scenes: sorted,
          mainPovId: mainPov,
          sceneCount: sorted.length,
          threadCount,
          hookEnd,
          estimatedWords: bch?.targetWordCount ?? sorted.length * 3000,
          actualWords: msWordCount,
          draftStatus: bch?.draftStatus ?? "planned",
          msStatus,
          completedScenes: linkedMs.filter((mc) => mc.status === "complete").length,
          totalLinkedMs: linkedMs.length,
          warningCount: sorted.filter((s) => {
            const povChar = s.povCharacterId ? characters[s.povCharacterId] : null;
            return povChar && povChar.deathYear != null && s.timelineIndex > povChar.deathYear;
          }).length,
        };
      });
  }, [filteredScenes, allMsChapters, allBoardChapters, characters]);

  // Stats
  const stats = useMemo(() => {
    const openThreads = allThreads.filter((t) => t.status !== "resolved" && t.status !== "abandoned" && t.status !== "paused").length;
    const povSet = new Set(allScenes.map((s) => s.povCharacterId).filter(Boolean));
    return { scenes: allScenes.length, chapters: chapters.length, povCount: povSet.size, openThreads, warnings: 0 };
  }, [allScenes, chapters, allThreads]);

  const handleEditScene = useCallback((id: string) => { setEditSceneId(id); setSceneFormOpen(true); }, []);
  const handleNewScene = useCallback(() => { setEditSceneId(undefined); setSceneFormOpen(true); }, []);
  const handleCloseSceneForm = useCallback(() => { setSceneFormOpen(false); setEditSceneId(undefined); }, []);
  const handleMoveScene = useCallback(
    (chScenes: Scene[], index: number, dir: "up" | "down") => {
      const ids = chScenes.map((s) => s.id);
      const target = dir === "up" ? index - 1 : index + 1;
      if (target < 0 || target >= ids.length) return;
      [ids[index], ids[target]] = [ids[target], ids[index]];
      reorderScenes(ids);
    }, [reorderScenes],
  );

  /* ==== Chapter View (novel-writer accordion) ============================== */
  const renderChapterView = () => (
    <div className="space-y-4">
      {chapters.length === 0 ? (
        <div className="border border-border-strong rounded-lg bg-bg-subtle p-10 text-center">
          <BookOpen className="h-8 w-8 text-fg-muted mx-auto mb-3 opacity-40" />
          <p className="text-sm text-fg-muted mb-1">{"\uc544\uc9c1 \uc7a5\uba74\uc774 \uc5c6\uc2b5\ub2c8\ub2e4."}</p>
          <p className="text-xs text-fg-muted mb-4">{"\uc0c8 \uc7a5\uba74\uc744 \ucd94\uac00\ud558\uc5ec \uc18c\uc124 \uad6c\uc870\ub97c \uc7a1\uc544\ubcf4\uc138\uc694."}</p>
          <Button variant="outline" size="sm" className="text-xs gap-1" onClick={handleNewScene}>
            <Plus className="h-3 w-3" />{"\uccab \uc7a5\uba74 \ucd94\uac00"}
          </Button>
        </div>
      ) : chapters.map((ch, chIdx) => {
        const mainPovName = ch.mainPovId ? characters[ch.mainPovId]?.name ?? null : null;

        return (
          <Collapsible key={ch.chapterNo} defaultOpen={chIdx < 3}>
            <div className="border border-border-strong rounded-lg bg-bg-chat overflow-hidden">
              {/* ── Chapter Header ── */}
              <CollapsibleTrigger asChild>
                <div className="flex items-start gap-3 px-4 py-3 cursor-pointer hover:bg-bg-subtle-hover transition-colors">
                  <ChevronDown className="h-4 w-4 text-fg-muted shrink-0 mt-1 transition-transform [[data-state=closed]>&]:rotate-[-90deg]" />

                  <div className="flex-1 min-w-0">
                    {/* Row 1: Chapter number + title */}
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-bold text-fg-base">{ch.chapterNo}{"\uc7a5"}</span>
                      {ch.title && (
                        <span className="text-sm font-semibold text-fg-base truncate">{ch.title}</span>
                      )}
                    </div>
                    {/* Row 1.5: Purpose */}
                    {ch.purpose && (
                      <p className="text-[11px] text-fg-subtle mb-1.5 truncate">{ch.purpose}</p>
                    )}

                    {/* Row 2: Meta badges */}
                    <div className="flex flex-wrap items-center gap-2">
                      {/* Scene count */}
                      <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-border-strong text-fg-subtle">
                        <Film className="h-2.5 w-2.5 mr-0.5" />{"\uc7a5\uba74"} {ch.sceneCount}{"\uac1c"}
                      </Badge>

                      {/* Main POV */}
                      {mainPovName && (
                        <Badge className="text-[10px] px-1.5 py-0 bg-tag-blue-10 text-tag-blue-100 border-0">
                          <Users className="h-2.5 w-2.5 mr-0.5" />POV: {mainPovName}
                        </Badge>
                      )}

                      {/* Word count: estimated vs actual */}
                      <span className="text-[10px] text-fg-muted tabular-nums">
                        {ch.actualWords > 0
                          ? `${ch.actualWords.toLocaleString()} / ${ch.estimatedWords.toLocaleString()}\uae00\uc790`
                          : `\uc608\uc0c1 ${ch.estimatedWords.toLocaleString()}\uae00\uc790`
                        }
                      </span>

                      {/* Thread count */}
                      {ch.threadCount > 0 && (
                        <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-border-strong text-fg-subtle">
                          <Link2 className="h-2.5 w-2.5 mr-0.5" />{"\uc2a4\ub808\ub4dc"} {ch.threadCount}
                        </Badge>
                      )}

                      {/* Completed scenes / total */}
                      {ch.totalLinkedMs > 0 && (
                        <span className="text-[10px] text-fg-muted">
                          {"\uc9d1\ud544"} {ch.completedScenes}/{ch.sceneCount}
                        </span>
                      )}

                      {/* Consistency warnings */}
                      {ch.warningCount > 0 && (
                        <Badge className="text-[10px] px-1 py-0 bg-visualizer-crimson-spark/10 text-visualizer-crimson-spark border-0">
                          <AlertTriangle className="h-2.5 w-2.5 mr-0.5" />{ch.warningCount}
                        </Badge>
                      )}

                      {/* Manuscript status */}
                      {ch.msStatus && (
                        <Badge className={`text-[10px] px-1.5 py-0 border ${MS_STATUS_STYLES[ch.msStatus] ?? MS_STATUS_STYLES.draft}`}>
                          {MS_STATUS_LABELS[ch.msStatus] ?? "\ucd08\uc548"}
                        </Badge>
                      )}
                    </div>

                    {/* Row 3: Hook */}
                    {ch.hookEnd && (
                      <div className="flex items-center gap-1 mt-1.5 text-[10px] text-fg-muted">
                        <Zap className="h-2.5 w-2.5 shrink-0" />
                        <span className="truncate">{"\ud6c4\ud06c"}: {ch.hookEnd}</span>
                      </div>
                    )}
                  </div>

                  {/* Right actions */}
                  <div className="flex items-center gap-0.5 shrink-0" onClick={(e) => e.stopPropagation()}>
                    {chIdx > 0 && (
                      <Button variant="ghost" size="icon" className="h-6 w-6 text-fg-muted">
                        <ChevronUp className="h-3 w-3" />
                      </Button>
                    )}
                    {chIdx < chapters.length - 1 && (
                      <Button variant="ghost" size="icon" className="h-6 w-6 text-fg-muted">
                        <ChevronDown className="h-3 w-3" />
                      </Button>
                    )}
                    <Button variant="ghost" size="icon" className="h-6 w-6 text-fg-muted" onClick={handleNewScene}>
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </CollapsibleTrigger>

              {/* ── Chapter Content: Scenes ── */}
              <CollapsibleContent>
                <div className="px-4 pb-4 space-y-2 border-t border-border-strong pt-3">
                  {ch.scenes.map((scene, idx) => (
                    <SceneCard key={scene.id} sceneId={scene.id} onEdit={handleEditScene}
                      onMoveUp={idx > 0 ? () => handleMoveScene(ch.scenes, idx, "up") : undefined}
                      onMoveDown={idx < ch.scenes.length - 1 ? () => handleMoveScene(ch.scenes, idx, "down") : undefined} />
                  ))}
                  {ch.scenes.length === 0 && (
                    <p className="text-xs text-fg-muted text-center py-4">{"\uc774 \uc7a5\uc5d0 \uc7a5\uba74\uc774 \uc5c6\uc2b5\ub2c8\ub2e4."}</p>
                  )}
                </div>
              </CollapsibleContent>
            </div>
          </Collapsible>
        );
      })}
    </div>
  );

  /* ==== Thread View ======================================================== */
  const renderThreadView = () => {
    const grouped = new Map<NarrativeThreadType, typeof allThreads>();
    for (const t of allThreads) { const a = grouped.get(t.type) || []; a.push(t); grouped.set(t.type, a); }
    return (
      <div className="space-y-4">
        {allThreads.length === 0 ? (
          <div className="border border-border-strong rounded-lg bg-bg-subtle p-8 text-center">
            <p className="text-sm text-fg-muted">{"\uc11c\uc0ac \uc2a4\ub808\ub4dc\uac00 \uc5c6\uc2b5\ub2c8\ub2e4."}</p>
          </div>
        ) : THREAD_TYPE_ORDER.map((type) => {
          const threads = grouped.get(type);
          if (!threads?.length) return null;
          return (
            <div key={type} className="space-y-2">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-fg-muted">
                {THREAD_TYPE_LABELS[type]} ({threads.length})
              </h3>
              {threads.map((t) => (
                <div key={t.id} className="border border-border-strong rounded-lg bg-bg-subtle p-4 space-y-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge className={`text-[10px] px-1.5 py-0 border-0 ${THREAD_TYPE_COLORS[t.type]}`}>
                      {THREAD_TYPE_LABELS[t.type]}
                    </Badge>
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-border-strong text-fg-subtle">
                      {THREAD_STATUS_LABELS[t.status]}
                    </Badge>
                    <span className="text-sm font-semibold text-fg-base">{t.title}</span>
                  </div>
                  {t.description && <p className="text-xs text-fg-subtle leading-relaxed">{t.description}</p>}
                  {/* Connected scenes */}
                  {(() => {
                    const connectedScenes = filteredScenes.filter((s) => (s.threadIds ?? []).includes(t.id));
                    if (connectedScenes.length === 0) return null;
                    return (
                      <div className="space-y-1 pt-1">
                        <span className="text-[10px] font-semibold text-fg-subtle">{"\uc5f0\uacb0\ub41c \uc7a5\uba74"} ({connectedScenes.length})</span>
                        {connectedScenes.sort((a, b) => a.chapterNo - b.chapterNo || a.timelineIndex - b.timelineIndex).map((s) => (
                          <div key={s.id} className="flex items-center gap-2 text-[10px] text-fg-muted pl-2 border-l-2 border-border-strong cursor-pointer hover:text-fg-base" onClick={() => handleEditScene(s.id)}>
                            <span className="font-medium">{s.chapterNo}{"\uc7a5"}</span>
                            <span className="truncate">{s.title}</span>
                            {s.povCharacterId && characters[s.povCharacterId] && (
                              <Badge className="text-[10px] px-1 py-0 bg-tag-blue-10 text-tag-blue-100 border-0 shrink-0">
                                {characters[s.povCharacterId]?.name}
                              </Badge>
                            )}
                          </div>
                        ))}
                      </div>
                    );
                  })()}
                  <div className="flex gap-4 text-[10px] text-fg-muted">
                    {t.setupSceneId && scenes[t.setupSceneId] && <span>{"\uc124\uc815"}: {scenes[t.setupSceneId].title}</span>}
                    {t.payoffSceneId && scenes[t.payoffSceneId] && <span>{"\ud68c\uc218"}: {scenes[t.payoffSceneId].title}</span>}
                  </div>
                </div>
              ))}
            </div>
          );
        })}
      </div>
    );
  };

  /* ==== POV View =========================================================== */
  const renderPovView = () => {
    const povMap = new Map<string | null, Scene[]>();
    for (const s of filteredScenes) { const key = s.povCharacterId ?? null; const a = povMap.get(key) || []; a.push(s); povMap.set(key, a); }
    const entries = Array.from(povMap.entries()).sort(([a], [b]) => {
      if (a === null) return 1; if (b === null) return -1;
      return (characters[a]?.name ?? "").localeCompare(characters[b]?.name ?? "");
    });
    return (
      <div className="space-y-4">
        {filteredScenes.length === 0 ? (
          <div className="border border-border-strong rounded-lg bg-bg-subtle p-8 text-center">
            <p className="text-sm text-fg-muted">{hasActiveFilters ? "\ud544\ud130 \uacb0\uacfc\uac00 \uc5c6\uc2b5\ub2c8\ub2e4." : "\uc7a5\uba74\uc774 \uc5c6\uc2b5\ub2c8\ub2e4."}</p>
          </div>
        ) : entries.map(([charId, povScenes]) => (
          <div key={charId ?? "__none"} className="space-y-2">
            <h3 className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-fg-muted">
              <Users className="h-3.5 w-3.5" />
              {charId ? characters[charId]?.name ?? "\uc54c \uc218 \uc5c6\uc74c" : "\ubbf8\uc9c0\uc815"}
              <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-border-strong text-fg-subtle ml-1">
                {povScenes.length}{"\uac1c"}
              </Badge>
              {/* Chapter distribution */}
              {charId && (
                <span className="text-[10px] text-fg-muted font-normal normal-case tracking-normal ml-2">
                  {Array.from(new Set(povScenes.map((s) => s.chapterNo))).sort((a, b) => a - b).map((ch) => `${ch}\uc7a5`).join(", ")}
                </span>
              )}
            </h3>
            {povScenes.sort((a, b) => a.timelineIndex - b.timelineIndex).map((scene) => (
              <SceneCard key={scene.id} sceneId={scene.id} onEdit={handleEditScene} />
            ))}
          </div>
        ))}
      </div>
    );
  };

  /* ==== Timeline View ====================================================== */
  const renderTimelineView = () => {
    const sorted = [...filteredScenes].sort((a, b) => a.timelineIndex - b.timelineIndex);
    // Group by timelineIndex for visual grouping
    let lastTimeline = -1;
    return (
      <div className="space-y-1">
        {sorted.length === 0 ? (
          <div className="border border-border-strong rounded-lg bg-bg-subtle p-8 text-center">
            <p className="text-sm text-fg-muted">{hasActiveFilters ? "\ud544\ud130 \uacb0\uacfc\uac00 \uc5c6\uc2b5\ub2c8\ub2e4." : "\uc7a5\uba74\uc774 \uc5c6\uc2b5\ub2c8\ub2e4."}</p>
          </div>
        ) : sorted.map((scene) => {
          const showTimelineLabel = scene.timelineIndex !== lastTimeline;
          lastTimeline = scene.timelineIndex;
          return (
            <div key={scene.id} className="flex items-start gap-3">
              <div className="flex flex-col items-center pt-4 w-12 shrink-0">
                {showTimelineLabel && (
                  <>
                    <Clock className="h-3.5 w-3.5 text-fg-muted" />
                    <span className="text-[10px] font-mono text-fg-muted mt-0.5">{scene.timelineIndex}</span>
                  </>
                )}
                <div className="w-px flex-1 bg-border-strong mt-1" />
              </div>
              <div className="flex-1 pb-2">
                <SceneCard sceneId={scene.id} onEdit={handleEditScene} />
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  /* ==== MAIN RENDER ======================================================== */
  return (
    <div className="flex flex-col h-full bg-bg-chat overflow-hidden">
      {/* ── Header ── */}
      <div className="px-4 py-4 border-b border-border-strong shrink-0">
        <div className="flex items-center gap-3 mb-3">
          <h1 className="text-lg font-semibold text-fg-base shrink-0">{"\uad6c\uc131 \ubcf4\ub4dc"}</h1>
          {sortedBooks.length > 0 && (
            <Select value={selectedBookId ?? "all"} onValueChange={(v) => setSelectedBookId(v === "all" ? null : v)}>
              <SelectTrigger className="h-8 w-44 text-xs bg-bg-subtle border-border-strong">
                <SelectValue placeholder={"\uc804\uccb4 \ud3b8"} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{"\uc804\uccb4 \ud3b8"}</SelectItem>
                {sortedBooks.map((b) => (<SelectItem key={b.id} value={b.id}>{b.title}</SelectItem>))}
              </SelectContent>
            </Select>
          )}
          <div className="ml-auto flex items-center gap-1.5">
            <Button variant="outline" size="sm" className="h-8 text-xs gap-1" onClick={handleNewScene}>
              <Plus className="h-3 w-3" />{"\uc0c8 \uc7a5\uba74"}
            </Button>
            <Button variant="outline" size="sm" className="h-8 text-xs gap-1" onClick={() => setThreadFormOpen(true)}>
              <Plus className="h-3 w-3" />{"\uc0c8 \uc2a4\ub808\ub4dc"}
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setDetailPanelOpen((v) => !v)} title={"\uc0c1\uc138 \ud328\ub110"}>
              <PanelRightOpen className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="flex flex-wrap gap-4 mb-3">
          <div className="flex items-center gap-1.5 text-xs text-fg-subtle"><Film className="h-3.5 w-3.5" /><span>{"\uc7a5\uba74"} {stats.scenes}{"\uac1c"}</span></div>
          <div className="flex items-center gap-1.5 text-xs text-fg-subtle"><BookOpen className="h-3.5 w-3.5" /><span>{"\uc7a5"} {stats.chapters}{"\uac1c"}</span></div>
          <div className="flex items-center gap-1.5 text-xs text-fg-subtle"><Users className="h-3.5 w-3.5" /><span>POV {stats.povCount}{"\uba85"}</span></div>
          <div className="flex items-center gap-1.5 text-xs text-fg-subtle"><Layers className="h-3.5 w-3.5" /><span>{"\uc5f4\ub9b0 \uc2a4\ub808\ub4dc"} {stats.openThreads}{"\uac1c"}</span></div>
          <div className="flex items-center gap-1.5 text-xs text-fg-subtle"><AlertTriangle className="h-3.5 w-3.5" /><span>{"\uc815\ud569\uc131 \uacbd\uace0"} {stats.warnings}{"\uac1c"}</span></div>
        </div>

        <div className="flex gap-1 rounded-lg border border-border-strong p-1 w-fit">
          {VIEW_MODES.map((vm) => (
            <Button key={vm.id} variant={viewMode === vm.id ? "default" : "ghost"} size="sm" className="h-7 text-xs" onClick={() => setViewMode(vm.id)}>
              {vm.label}
            </Button>
          ))}
        </div>
      </div>

      {/* ── Filter Bar ── */}
      <div className="flex flex-wrap items-center gap-2 px-4 py-2 border-b border-border-strong shrink-0">
        <Filter className="h-3.5 w-3.5 text-fg-muted shrink-0" />
        <div className="relative flex-1 min-w-[120px] max-w-[200px]">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-fg-muted" />
          <Input
            placeholder={"\uac80\uc0c9..."}
            value={filterSearch}
            onChange={(e) => setFilterSearch(e.target.value)}
            className="h-7 pl-7 text-xs bg-bg-subtle border-border-strong"
          />
        </div>
        <Select value={filterPov} onValueChange={setFilterPov}>
          <SelectTrigger className="h-7 w-32 text-xs bg-bg-subtle border-border-strong">
            <SelectValue placeholder="POV" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{"\uc804\uccb4 POV"}</SelectItem>
            {povCharacters.map((c) => (
              <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filterThread} onValueChange={setFilterThread}>
          <SelectTrigger className="h-7 w-36 text-xs bg-bg-subtle border-border-strong">
            <SelectValue placeholder={"\uc2a4\ub808\ub4dc"} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{"\uc804\uccb4 \uc2a4\ub808\ub4dc"}</SelectItem>
            {allThreads.map((t) => (
              <SelectItem key={t.id} value={t.id}>{t.title}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" className="h-7 text-xs gap-1 text-fg-muted" onClick={() => {
            setFilterPov("all"); setFilterThread("all"); setFilterSearch("");
          }}>
            <X className="h-3 w-3" />{"\ud544\ud130 \ucd08\uae30\ud654"}
          </Button>
        )}
        {hasActiveFilters && (
          <span className="text-[10px] text-fg-muted ml-auto">{filteredScenes.length}/{allScenes.length}{"\uac1c \uc7a5\uba74"}</span>
        )}
      </div>

      {/* ── Body ── */}
      <div className="flex flex-1 min-h-0 overflow-hidden">
        <ScrollArea className="flex-1">
          <div className="p-4">
            {viewMode === "chapter" && renderChapterView()}
            {viewMode === "thread" && renderThreadView()}
            {viewMode === "pov" && renderPovView()}
            {viewMode === "timeline" && renderTimelineView()}
          </div>
        </ScrollArea>

        {detailPanelOpen && (
          <div className="w-80 border-l border-border-strong shrink-0 flex flex-col bg-bg-chat">
            <div className="px-4 py-3 border-b border-border-strong">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-fg-subtle">{"\uc0c1\uc138 \uc815\ubcf4"}</h2>
            </div>
            <div className="flex-1 flex items-center justify-center px-4">
              <p className="text-xs text-fg-muted text-center">{"\uc7a5\uba74\uc744 \uc120\ud0dd\ud558\uba74 \uc0c1\uc138 \uc815\ubcf4\uac00 \uc5ec\uae30\uc5d0 \ud45c\uc2dc\ub429\ub2c8\ub2e4."}</p>
            </div>
          </div>
        )}
      </div>

      {/* ── Bottom: Thread Tracker ── */}
      <div className="border-t border-border-strong shrink-0">
        <Collapsible>
          <CollapsibleTrigger asChild>
            <button className="flex items-center gap-2 w-full px-4 py-2.5 text-left hover:bg-bg-subtle-hover transition-colors">
              <ChevronDown className="h-4 w-4 text-fg-muted transition-transform [[data-state=closed]>&]:rotate-[-90deg]" />
              <span className="text-xs font-semibold uppercase tracking-wider text-fg-base">{"\uc11c\uc0ac \uc2a4\ub808\ub4dc \ucd94\uc801\uae30"}</span>
              <div className="flex items-center gap-2 ml-2">
                <span className="text-xs text-tag-yellow-100">{"\uc9c4\ud589\uc911"} {allThreads.filter((t) => t.status !== "resolved" && t.status !== "abandoned" && t.status !== "paused").length}</span>
                <span className="text-xs text-fg-muted">/</span>
                <span className="text-xs text-tag-cyan-100">{"\ud68c\uc218"} {allThreads.filter((t) => t.status === "resolved").length}</span>
              </div>
            </button>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="px-4 pb-3 space-y-2">
              {allThreads.length === 0 ? (
                <p className="text-xs text-fg-muted text-center py-3">{"\uc11c\uc0ac \uc2a4\ub808\ub4dc\uac00 \uc5c6\uc2b5\ub2c8\ub2e4. '\uc0c8 \uc2a4\ub808\ub4dc' \ubc84\ud2bc\uc73c\ub85c \ucd94\uac00\ud558\uc138\uc694."}</p>
              ) : allThreads.slice(0, 5).map((t) => (
                <div key={t.id} className="flex items-center gap-2 text-xs">
                  <Badge className={`text-[10px] px-1.5 py-0 border-0 shrink-0 ${THREAD_TYPE_COLORS[t.type]}`}>{THREAD_TYPE_LABELS[t.type]}</Badge>
                  <span className="text-fg-base truncate flex-1">{t.title}</span>
                  <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-border-strong text-fg-subtle shrink-0">{THREAD_STATUS_LABELS[t.status]}</Badge>
                </div>
              ))}
              {allThreads.length > 5 && (
                <p className="text-[10px] text-fg-muted text-center">+{allThreads.length - 5}{"\uac1c \ub354... \uc2a4\ub808\ub4dc \ubcf4\uae30 \ud0ed\uc5d0\uc11c \uc804\uccb4 \ud655\uc778"}</p>
              )}
            </div>
          </CollapsibleContent>
        </Collapsible>
      </div>

      {/* ── Forms ── */}
      <SceneForm sceneId={editSceneId} open={sceneFormOpen} onClose={handleCloseSceneForm} />
      <NarrativeThreadForm open={threadFormOpen} onClose={() => setThreadFormOpen(false)} />
    </div>
  );
}
