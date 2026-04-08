import { useState, useMemo } from "react";
import { useNovelStore } from "@/lib/novel-store";
import type { ForeshadowStatus } from "@/lib/novel-types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  ChevronDown,
  Plus,
  Check,
  XCircle,
  BookOpen,
} from "lucide-react";

type FilterType = "all" | ForeshadowStatus;

const STATUS_BADGE_CLASS: Record<ForeshadowStatus, string> = {
  open: "bg-tag-yellow-10 text-tag-yellow-100 border-tag-yellow-100/20",
  resolved: "bg-tag-cyan-10 text-tag-cyan-100 border-tag-cyan-100/20",
  abandoned: "bg-bg-subtle text-fg-muted border-border-strong",
};

const STATUS_LABELS: Record<ForeshadowStatus, string> = {
  open: "\ubbf8\ud68c\uc218",
  resolved: "\ud68c\uc218\ub428",
  abandoned: "\ud3ec\uae30",
};

const FILTER_OPTIONS: { value: FilterType; label: string }[] = [
  { value: "all", label: "\uc804\uccb4" },
  { value: "open", label: "\ubbf8\ud68c\uc218" },
  { value: "resolved", label: "\ud68c\uc218\ub428" },
  { value: "abandoned", label: "\ud3ec\uae30" },
];

export function ForeshadowTracker() {
  const foreshadows = useNovelStore((s) => s.foreshadows);
  const scenes = useNovelStore((s) => s.scenes);
  const addForeshadow = useNovelStore((s) => s.addForeshadow);
  const resolveForeshadow = useNovelStore((s) => s.resolveForeshadow);
  const abandonForeshadow = useNovelStore((s) => s.abandonForeshadow);

  const [filter, setFilter] = useState<FilterType>("all");
  const [isOpen, setIsOpen] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newNote, setNewNote] = useState("");
  const [newSetupSceneId, setNewSetupSceneId] = useState("");
  const [resolveTargets, setResolveTargets] = useState<
    Record<string, string>
  >({});

  const allForeshadows = useMemo(
    () =>
      Object.values(foreshadows).sort((a, b) => b.createdAt - a.createdAt),
    [foreshadows]
  );

  const filteredForeshadows = useMemo(
    () =>
      filter === "all"
        ? allForeshadows
        : allForeshadows.filter((f) => f.status === filter),
    [allForeshadows, filter]
  );

  const stats = useMemo(() => {
    const counts = { open: 0, resolved: 0, abandoned: 0 };
    for (const f of allForeshadows) {
      counts[f.status]++;
    }
    return counts;
  }, [allForeshadows]);

  const sceneList = useMemo(
    () =>
      Object.values(scenes).sort(
        (a, b) =>
          a.chapterNo - b.chapterNo || a.timelineIndex - b.timelineIndex
      ),
    [scenes]
  );

  function handleCreate() {
    if (!newNote.trim() || !newSetupSceneId) return;
    addForeshadow({
      note: newNote.trim(),
      setupSceneId: newSetupSceneId,
      payoffSceneId: null,
      status: "open",
    });
    setNewNote("");
    setNewSetupSceneId("");
    setShowCreateForm(false);
  }

  function handleResolve(foreshadowId: string) {
    const payoffId = resolveTargets[foreshadowId];
    if (!payoffId) return;
    resolveForeshadow(foreshadowId, payoffId);
    setResolveTargets((prev) => {
      const next = { ...prev };
      delete next[foreshadowId];
      return next;
    });
  }

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <div className="border border-border-strong rounded-lg bg-bg-subtle">
        {/* Header */}
        <CollapsibleTrigger asChild>
          <button className="flex items-center justify-between w-full p-4 text-left">
            <div className="flex items-center gap-3">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-fg-base">
                {"\ub5a1\ubc25/\ud68c\uc218 \ud2b8\ub798\ucee4"}
              </h3>
              {/* Stats */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-tag-yellow-100">
                  {"\ubbf8\ud68c\uc218"} {stats.open}
                </span>
                <span className="text-xs text-fg-muted">/</span>
                <span className="text-xs text-tag-cyan-100">
                  {"\ud68c\uc218"} {stats.resolved}
                </span>
                <span className="text-xs text-fg-muted">/</span>
                <span className="text-xs text-fg-muted">
                  {"\ud3ec\uae30"} {stats.abandoned}
                </span>
              </div>
            </div>
            <ChevronDown
              className={`h-4 w-4 text-fg-muted transition-transform ${
                isOpen ? "rotate-180" : ""
              }`}
            />
          </button>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <div className="px-4 pb-4 space-y-3">
            {/* Filter bar and create button */}
            <div className="flex items-center gap-2">
              <div className="flex gap-1">
                {FILTER_OPTIONS.map((opt) => (
                  <Button
                    key={opt.value}
                    variant={filter === opt.value ? "default" : "ghost"}
                    size="sm"
                    className="h-7 text-xs"
                    onClick={() => setFilter(opt.value)}
                  >
                    {opt.label}
                  </Button>
                ))}
              </div>
              <div className="ml-auto">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs gap-1"
                  onClick={() => setShowCreateForm(!showCreateForm)}
                >
                  <Plus className="h-3 w-3" />
                  {"\uc0c8 \ub5a1\ubc25"}
                </Button>
              </div>
            </div>

            {/* Create form */}
            {showCreateForm && (
              <div className="border border-border-strong rounded-md p-3 bg-bg-subtle space-y-2">
                <div className="space-y-1.5">
                  <Label className="text-fg-base text-xs">{"\ub5a1\ubc25 \ub0b4\uc6a9"}</Label>
                  <Input
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    placeholder={"\ub5a1\ubc25 \ud78c\ud2b8\ub97c \uc124\uba85\ud558\uc138\uc694..."}
                    className="text-xs"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-fg-base text-xs">{"\uc124\uc815 \uc7a5\uba74"}</Label>
                  <Select
                    value={newSetupSceneId}
                    onValueChange={setNewSetupSceneId}
                  >
                    <SelectTrigger className="text-xs">
                      <SelectValue placeholder={"\uc7a5\uba74 \uc120\ud0dd..."} />
                    </SelectTrigger>
                    <SelectContent>
                      {sceneList.map((s) => (
                        <SelectItem key={s.id} value={s.id}>
                          {s.chapterNo}{"\uc7a5"} - {s.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex justify-end gap-2 pt-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs"
                    onClick={() => setShowCreateForm(false)}
                  >
                    {"\ucde8\uc18c"}
                  </Button>
                  <Button
                    size="sm"
                    className="h-7 text-xs"
                    onClick={handleCreate}
                    disabled={!newNote.trim() || !newSetupSceneId}
                  >
                    {"\uc0dd\uc131"}
                  </Button>
                </div>
              </div>
            )}

            {/* Foreshadow list */}
            {filteredForeshadows.length === 0 ? (
              <p className="text-xs text-fg-muted text-center py-4">
                {filter === "all"
                  ? "\uc544\uc9c1 \ub5a1\ubc25\uc774 \uc5c6\uc2b5\ub2c8\ub2e4. \ud558\ub098 \uc0dd\uc131\ud558\uc5ec \ud50c\ub86f \uc2a4\ub808\ub4dc\ub97c \ucd94\uc801\ud558\uc138\uc694."
                  : `${FILTER_OPTIONS.find((o) => o.value === filter)?.label || ""} \ub5a1\ubc25\uc774 \uc5c6\uc2b5\ub2c8\ub2e4.`}
              </p>
            ) : (
              <div className="space-y-2">
                {filteredForeshadows.map((f) => {
                  const setupScene = scenes[f.setupSceneId];
                  const payoffScene = f.payoffSceneId
                    ? scenes[f.payoffSceneId]
                    : null;

                  return (
                    <div
                      key={f.id}
                      className="border border-border-strong rounded-md p-3 space-y-2"
                    >
                      <div className="flex items-start gap-2">
                        <Badge
                          className={`text-[10px] px-1.5 py-0 border shrink-0 ${STATUS_BADGE_CLASS[f.status]}`}
                        >
                          {STATUS_LABELS[f.status]}
                        </Badge>
                        <p className="text-xs text-fg-base flex-1">
                          {f.note}
                        </p>
                      </div>

                      {/* Scene references */}
                      <div className="flex flex-wrap gap-3 text-xs text-fg-subtle">
                        {setupScene && (
                          <span className="flex items-center gap-1">
                            <BookOpen className="h-3 w-3" />
                            {"\uc124\uc815"}: {setupScene.title}
                          </span>
                        )}
                        {payoffScene && (
                          <span className="flex items-center gap-1">
                            <Check className="h-3 w-3" />
                            {"\ud68c\uc218"}: {payoffScene.title}
                          </span>
                        )}
                      </div>

                      {/* Actions for open foreshadows */}
                      {f.status === "open" && (
                        <div className="flex items-center gap-2 pt-1">
                          <Select
                            value={resolveTargets[f.id] ?? ""}
                            onValueChange={(val) =>
                              setResolveTargets((prev) => ({
                                ...prev,
                                [f.id]: val,
                              }))
                            }
                          >
                            <SelectTrigger className="text-xs h-7 flex-1">
                              <SelectValue placeholder={"\ud68c\uc218 \uc7a5\uba74 \uc120\ud0dd..."} />
                            </SelectTrigger>
                            <SelectContent>
                              {sceneList.map((s) => (
                                <SelectItem key={s.id} value={s.id}>
                                  {s.chapterNo}{"\uc7a5"} - {s.title}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-7 text-xs gap-1 shrink-0"
                            onClick={() => handleResolve(f.id)}
                            disabled={!resolveTargets[f.id]}
                          >
                            <Check className="h-3 w-3" />
                            {"\ud68c\uc218"}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 text-xs gap-1 shrink-0 text-fg-muted"
                            onClick={() => abandonForeshadow(f.id)}
                          >
                            <XCircle className="h-3 w-3" />
                            {"\ud3ec\uae30"}
                          </Button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}
