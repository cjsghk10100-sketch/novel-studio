import { useState, useMemo } from "react";
import { useNovelStore } from "@/lib/novel-store";
import type { RevisionLog } from "@/lib/novel-types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "@/components/ui/collapsible";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ChevronDown,
  Filter,
  History,
  RotateCcw,
  Search,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Static action badge styles (no dynamic Tailwind)
// ---------------------------------------------------------------------------

const ACTION_STYLES: Record<string, string> = {
  create: "bg-visualizer-emerald-mint/10 text-visualizer-emerald-mint",
  update: "bg-tag-blue-10 text-tag-blue-100",
  delete: "bg-visualizer-crimson-spark/10 text-visualizer-crimson-spark",
};

const ACTION_LABELS: Record<string, string> = {
  create: "\uc0dd\uc131",
  update: "\uc218\uc815",
  delete: "\uc0ad\uc81c",
};

// ---------------------------------------------------------------------------
// All entity types the store can log revisions for
// ---------------------------------------------------------------------------

const ENTITY_TYPE_OPTIONS = [
  { value: "all", label: "\uc804\uccb4" },
  { value: "character", label: "\uc778\ubb3c" },
  { value: "location", label: "\uc9c0\uc5ed" },
  { value: "faction", label: "\uc138\ub825" },
  { value: "item", label: "\uc544\uc774\ud15c" },
  { value: "event", label: "\uc0ac\uac74" },
  { value: "scene", label: "\uc7a5\uba74" },
  { value: "plotPoint", label: "\ud50c\ub86f \ud3ec\uc778\ud2b8" },
  { value: "foreshadow", label: "\ub5a1\ubc25" },
  { value: "link", label: "\ub9c1\ud06c" },
  { value: "book", label: "\ud3b8" },
  { value: "manuscriptChapter", label: "\uc6d0\uace0 \uc7a5" },
  { value: "manuscriptScene", label: "\uc6d0\uace0 \uc7a5\uba74" },
  { value: "manuscriptVersion", label: "\uc6d0\uace0 \ubc84\uc804" },
  { value: "textEntityReference", label: "\ud14d\uc2a4\ud2b8 \uc5d4\ud2f0\ud2f0 \ucc38\uc870" },
  { value: "extractedProposal", label: "\ucd94\ucd9c \uc81c\uc548" },
  { value: "narrativeThread", label: "\uc11c\uc0ac \uc2a4\ub808\ub4dc" },
  { value: "boardChapter", label: "\ubcf4\ub4dc \uc7a5" },
  { value: "sceneThreadLink", label: "\uc7a5\uba74-\uc2a4\ub808\ub4dc \uc5f0\uacb0" },
  { value: "consistencyIssue", label: "\uc815\ud569\uc131 \uc774\uc288" },
];

// ---------------------------------------------------------------------------
// Timestamp formatter
// ---------------------------------------------------------------------------

function formatTimestamp(ts: number): string {
  const date = new Date(ts);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60_000);
  const diffHr = Math.floor(diffMs / 3_600_000);
  const diffDay = Math.floor(diffMs / 86_400_000);

  if (diffMin < 1) return "\ubc29\uae08 \uc804";
  if (diffMin < 60) return `${diffMin}\ubd84 \uc804`;
  if (diffHr < 24) return `${diffHr}\uc2dc\uac04 \uc804`;
  if (diffDay < 7) return `${diffDay}\uc77c \uc804`;

  return date.toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// ---------------------------------------------------------------------------
// Diff viewer
// ---------------------------------------------------------------------------

interface DiffViewerProps {
  diffJson: string;
}

function DiffViewer({ diffJson }: DiffViewerProps) {
  // Parse once -- always runs so hooks below are never conditional
  const parsed = useMemo<{ before: unknown; after: unknown } | null>(() => {
    try {
      return JSON.parse(diffJson);
    } catch {
      return null;
    }
  }, [diffJson]);

  // Compute changed keys for highlighting
  const changedKeys = useMemo(() => {
    const keys = new Set<string>();
    if (
      parsed &&
      parsed.before &&
      parsed.after &&
      typeof parsed.before === "object" &&
      typeof parsed.after === "object"
    ) {
      const b = parsed.before as Record<string, unknown>;
      const a = parsed.after as Record<string, unknown>;
      const allKeys = new Set([...Object.keys(b), ...Object.keys(a)]);
      for (const k of allKeys) {
        if (JSON.stringify(b[k]) !== JSON.stringify(a[k])) {
          keys.add(k);
        }
      }
    }
    return keys;
  }, [parsed]);

  if (!parsed) {
    return (
      <p className="text-xs text-fg-subtle font-mono">
        {"\ubcc0\uacbd \ub370\uc774\ud130\ub97c \ud30c\uc2f1\ud560 \uc218 \uc5c6\uc2b5\ub2c8\ub2e4."}
      </p>
    );
  }

  const beforeStr =
    parsed.before !== null && parsed.before !== undefined
      ? JSON.stringify(parsed.before, null, 2)
      : null;
  const afterStr =
    parsed.after !== null && parsed.after !== undefined
      ? JSON.stringify(parsed.after, null, 2)
      : null;

  function renderJson(obj: unknown, highlight: boolean) {
    if (obj === null || obj === undefined) return null;
    if (typeof obj !== "object") {
      return (
        <pre className="text-xs font-mono whitespace-pre-wrap text-fg-subtle">
          {String(obj)}
        </pre>
      );
    }
    const record = obj as Record<string, unknown>;
    return (
      <div className="space-y-0.5">
        {Object.entries(record).map(([key, value]) => {
          const isChanged = highlight && changedKeys.has(key);
          return (
            <div
              key={key}
              className={`text-xs font-mono leading-5 ${
                isChanged
                  ? "bg-visualizer-golden-amber/10 rounded px-1 -mx-1"
                  : ""
              }`}
            >
              <span className="text-fg-muted">{key}: </span>
              <span className="text-fg-base">
                {typeof value === "string"
                  ? `"${value}"`
                  : JSON.stringify(value)}
              </span>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      {/* Before */}
      <div className="space-y-1">
        <span className="text-xs font-semibold uppercase tracking-wider text-fg-subtle">
          {"\ubcc0\uacbd \uc804"}
        </span>
        <div className="rounded-md border border-border-strong bg-bg-subtle p-3 overflow-auto max-h-64">
          {beforeStr !== null ? (
            renderJson(parsed.before, true)
          ) : (
            <p className="text-xs text-fg-muted italic">{"(\ube44\uc5b4 \uc788\uc74c)"}</p>
          )}
        </div>
      </div>

      {/* After */}
      <div className="space-y-1">
        <span className="text-xs font-semibold uppercase tracking-wider text-fg-subtle">
          {"\ubcc0\uacbd \ud6c4"}
        </span>
        <div className="rounded-md border border-border-strong bg-bg-subtle p-3 overflow-auto max-h-64">
          {afterStr !== null ? (
            renderJson(parsed.after, true)
          ) : (
            <p className="text-xs text-fg-muted italic">{"(\ube44\uc5b4 \uc788\uc74c)"}</p>
          )}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Revision entry card
// ---------------------------------------------------------------------------

function RevisionCard({
  rev,
  onRollback,
}: {
  rev: RevisionLog;
  onRollback: (id: string) => void;
}) {
  const [diffOpen, setDiffOpen] = useState(false);

  return (
    <Card className="border-border-strong bg-bg-chat shadow-none">
      <CardHeader className="p-4 pb-2">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            {/* Action badge */}
            <Badge
              variant="outline"
              className={`shrink-0 border-none text-xs ${ACTION_STYLES[rev.action] || ""}`}
            >
              {ACTION_LABELS[rev.action] || rev.action}
            </Badge>

            <div className="flex-1 min-w-0 space-y-1">
              {/* Entity info */}
              <p className="text-sm text-fg-base">
                <span className="font-semibold capitalize">
                  {rev.entityType}
                </span>{" "}
                <span className="text-fg-subtle font-mono text-xs truncate">
                  {rev.entityId.length > 20
                    ? `${rev.entityId.slice(0, 8)}...${rev.entityId.slice(-8)}`
                    : rev.entityId}
                </span>
              </p>

              {/* Timestamp */}
              <p className="text-xs text-fg-muted">
                {formatTimestamp(rev.createdAt)}
              </p>
            </div>
          </div>

          {/* Rollback button */}
          <Button
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-xs text-fg-subtle hover:text-fg-base shrink-0"
            onClick={() => onRollback(rev.id)}
          >
            <RotateCcw className="h-3 w-3" />
            {"\ub864\ubc31"}
          </Button>
        </div>
      </CardHeader>

      <CardContent className="px-4 pb-4 pt-0">
        {/* Diff collapsible */}
        <Collapsible open={diffOpen} onOpenChange={setDiffOpen}>
          <CollapsibleTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-xs text-fg-subtle hover:text-fg-base gap-1"
            >
              <ChevronDown
                className={`h-3 w-3 transition-transform ${diffOpen ? "rotate-180" : ""}`}
              />
              {"\ubcc0\uacbd\uc0ac\ud56d \ubcf4\uae30"}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="mt-2">
              <DiffViewer diffJson={rev.diffJson} />
            </div>
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------

export default function HistoryPage() {
  const revisionLogs = useNovelStore((s) => s.revisionLogs);
  const rollbackRevision = useNovelStore((s) => s.rollbackRevision);

  const [typeFilter, setTypeFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [rollbackTarget, setRollbackTarget] = useState<string | null>(null);

  // Sort revisions newest-first and apply filters
  const filtered = useMemo(() => {
    let list = Object.values(revisionLogs).sort(
      (a, b) => b.createdAt - a.createdAt
    );

    if (typeFilter !== "all") {
      list = list.filter((r) => r.entityType === typeFilter);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      list = list.filter(
        (r) =>
          r.entityId.toLowerCase().includes(q) ||
          r.entityType.toLowerCase().includes(q)
      );
    }

    return list;
  }, [revisionLogs, typeFilter, searchQuery]);

  // The revision being considered for rollback
  const rollbackRev = rollbackTarget
    ? revisionLogs[rollbackTarget] ?? null
    : null;

  function handleConfirmRollback() {
    if (!rollbackTarget) return;
    rollbackRevision(rollbackTarget);
    setRollbackTarget(null);
  }

  return (
    <div className="tab-enter h-full w-full bg-bg-chat">
      {/* Page header */}
      <div className="px-6 py-5">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-fg-subtle">
          {"\uc218\uc815 \uc774\ub825"}
        </h2>
        <p className="mt-1 text-sm text-fg-subtle">
          {"\ubaa8\ub4e0 \ubcc0\uacbd\uc0ac\ud56d\uc744 \uc870\ud68c\ud558\uace0 \uc6d0\ud558\ub294 \uc2dc\uc810\uc73c\ub85c \ub864\ubc31\ud560 \uc218 \uc788\uc2b5\ub2c8\ub2e4."}
        </p>
      </div>

      <Separator className="bg-border-strong" />

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 px-6 py-3 border-b border-border-strong">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-fg-muted" />
          <Input
            placeholder={"\uc5d4\ud2f0\ud2f0 ID \ub610\ub294 \uc720\ud615\uc73c\ub85c \uac80\uc0c9..."}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 h-8 text-xs bg-bg-subtle border-border-strong"
          />
        </div>

        {/* Type filter */}
        <div className="flex items-center gap-2">
          <Filter className="h-3.5 w-3.5 text-fg-muted" />
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="h-8 w-[160px] text-xs bg-bg-subtle border-border-strong">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ENTITY_TYPE_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Count */}
        <span className="text-xs text-fg-muted ml-auto">
          {filtered.length}{"\uac74"}
        </span>
      </div>

      {/* Revision list */}
      <ScrollArea className="flex-1 h-[calc(100vh-220px)]">
        <div className="px-6 py-4 space-y-3">
          {filtered.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <History className="h-10 w-10 text-fg-muted mb-3" />
              <p className="text-sm text-fg-subtle">
                {Object.keys(revisionLogs).length === 0
                  ? "\uc544\uc9c1 \uc218\uc815 \uc774\ub825\uc774 \uc5c6\uc2b5\ub2c8\ub2e4. \uc18c\uc124 \ub370\uc774\ud130\ub97c \ud3b8\uc9d1\ud558\uba74 \uc5ec\uae30\uc5d0 \ubcc0\uacbd\uc0ac\ud56d\uc774 \ud45c\uc2dc\ub429\ub2c8\ub2e4."
                  : "\ud604\uc7ac \ud544\ud130\uc640 \uc77c\uce58\ud558\ub294 \uc218\uc815 \uc774\ub825\uc774 \uc5c6\uc2b5\ub2c8\ub2e4."}
              </p>
            </div>
          )}

          {filtered.map((rev) => (
            <RevisionCard
              key={rev.id}
              rev={rev}
              onRollback={setRollbackTarget}
            />
          ))}
        </div>
      </ScrollArea>

      {/* Rollback confirmation dialog */}
      <Dialog
        open={rollbackTarget !== null}
        onOpenChange={(open) => {
          if (!open) setRollbackTarget(null);
        }}
      >
        <DialogContent className="border-border-strong bg-bg-chat">
          <DialogHeader>
            <DialogTitle className="text-fg-base">
              {"\ub864\ubc31 \ud655\uc778"}
            </DialogTitle>
            <DialogDescription className="text-fg-subtle">
              {"\ub2e4\uc74c \ubcc0\uacbd\uc0ac\ud56d\uc744 \ub418\ub3cc\ub9bd\ub2c8\ub2e4. \ub864\ubc31\uc744 \uae30\ub85d\ud558\ub294 \uc0c8 \uc218\uc815 \uc774\ub825\uc774 \uc0dd\uc131\ub429\ub2c8\ub2e4."}
            </DialogDescription>
          </DialogHeader>

          {rollbackRev && (
            <div className="space-y-3 py-2">
              <div className="flex items-center gap-2">
                <Badge
                  variant="outline"
                  className={`border-none text-xs ${ACTION_STYLES[rollbackRev.action] || ""}`}
                >
                  {ACTION_LABELS[rollbackRev.action] || rollbackRev.action}
                </Badge>
                <span className="text-sm text-fg-base font-semibold capitalize">
                  {rollbackRev.entityType}
                </span>
                <span className="text-xs text-fg-muted font-mono">
                  {rollbackRev.entityId.length > 20
                    ? `${rollbackRev.entityId.slice(0, 8)}...${rollbackRev.entityId.slice(-8)}`
                    : rollbackRev.entityId}
                </span>
              </div>
              <p className="text-xs text-fg-muted">
                {formatTimestamp(rollbackRev.createdAt)}
              </p>
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setRollbackTarget(null)}
              className="border-border-strong"
            >
              {"\ucde8\uc18c"}
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleConfirmRollback}
            >
              <RotateCcw className="h-3.5 w-3.5" />
              {"\ub864\ubc31 \uc2e4\ud589"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
