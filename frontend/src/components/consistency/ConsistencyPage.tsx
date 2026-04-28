import { useState, useMemo, useCallback } from "react";
import { useNovelStore } from "@/lib/novel-store";
import { scanProject } from "@/lib/consistency-scanner";
import { registerRule } from "@/lib/consistency-scanner";
import { useConsistencyStore } from "@/lib/consistency-store";
import { characterTimelineRules } from "@/lib/consistency-rules-character";
import { relationEventRules } from "@/lib/consistency-rules-relation";
import { boardThreadProposalRules } from "@/lib/consistency-rules-board";
import { manuscriptConsistencyRules } from "@/lib/consistency-rules-manuscript";
import type { ConsistencyIssue as StoredIssue } from "@/lib/consistency-types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Collapsible, CollapsibleTrigger, CollapsibleContent,
} from "@/components/ui/collapsible";
import {
  AlertTriangle, CheckCircle2, ChevronDown, Info, Play, XCircle,
  Search, Filter, Eye, EyeOff, RotateCcw, ExternalLink, X,
} from "lucide-react";

// Register rules once
for (const r of characterTimelineRules) registerRule(r);
for (const r of relationEventRules) registerRule(r);
for (const r of boardThreadProposalRules) registerRule(r);
for (const r of manuscriptConsistencyRules) registerRule(r);

// Severity styles
const SEV_DOT: Record<string, string> = {
  high: "bg-visualizer-crimson-spark",
  medium: "bg-visualizer-golden-amber",
  low: "bg-visualizer-royal-blue",
};
const SEV_LABEL: Record<string, string> = { high: "\ub192\uc74c", medium: "\uc911\uac04", low: "\ub0ae\uc74c" };
const SEV_STYLE: Record<string, string> = {
  high: "bg-visualizer-crimson-spark/10 text-visualizer-crimson-spark border-visualizer-crimson-spark/20",
  medium: "bg-visualizer-golden-amber/10 text-visualizer-golden-amber border-visualizer-golden-amber/20",
  low: "bg-visualizer-royal-blue/10 text-visualizer-royal-blue border-visualizer-royal-blue/20",
};
const STATUS_LABEL: Record<string, string> = { open: "\ubbf8\ud574\uacb0", ignored: "\ubb34\uc2dc", resolved: "\ud574\uacb0\ub428" };

export default function ConsistencyPage() {
  const novelState = useNovelStore.getState;
  const characters = useNovelStore((s) => s.characters);
  const scenes = useNovelStore((s) => s.scenes);
  const books = useNovelStore((s) => s.books);

  const issues = useConsistencyStore((s) => s.issues);
  const resolveIssue = useConsistencyStore((s) => s.resolveIssue);
  const ignoreIssue = useConsistencyStore((s) => s.ignoreIssue);
  const reopenIssue = useConsistencyStore((s) => s.reopenIssue);
  const getIssueSummary = useConsistencyStore((s) => s.getIssueSummary);

  const [running, setRunning] = useState(false);
  const [lastScanned, setLastScanned] = useState<number | null>(null);
  const [selectedIssueId, setSelectedIssueId] = useState<string | null>(null);

  // Filters
  const [filterSev, setFilterSev] = useState("all");
  const [filterStatus, setFilterStatus] = useState("open");
  const [filterSearch, setFilterSearch] = useState("");

  const summary = useMemo(() => getIssueSummary(), [issues]);

  const filteredIssues = useMemo(() => {
    let list = Object.values(issues);
    if (filterStatus !== "all") list = list.filter((i) => i.status === filterStatus);
    if (filterSev !== "all") list = list.filter((i) => i.severity === filterSev);
    if (filterSearch.trim()) {
      const q = filterSearch.toLowerCase();
      list = list.filter((i) =>
        i.title.toLowerCase().includes(q) ||
        i.message.toLowerCase().includes(q) ||
        i.ruleCode.toLowerCase().includes(q)
      );
    }
    return list.sort((a, b) => {
      const sev = { high: 0, medium: 1, low: 2 };
      const d = (sev[a.severity] ?? 2) - (sev[b.severity] ?? 2);
      return d !== 0 ? d : b.lastDetectedAt - a.lastDetectedAt;
    });
  }, [issues, filterSev, filterStatus, filterSearch]);

  const selectedIssue = selectedIssueId ? issues[selectedIssueId] : null;

  const handleScan = useCallback(() => {
    setRunning(true);
    requestAnimationFrame(() => {
      scanProject(novelState());
      setLastScanned(Date.now());
      setRunning(false);
    });
  }, [novelState]);

  const resolveEntityName = (id: string) => {
    const c = characters[id]; if (c) return c.name;
    const s = scenes[id]; if (s) return s.title;
    return id.slice(0, 8) + "...";
  };

  return (
    <div className="flex flex-col h-full bg-bg-chat overflow-hidden">
      {/* ── Header ── */}
      <div className="px-6 py-4 border-b border-border-strong shrink-0">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-xs font-semibold uppercase tracking-wider text-fg-subtle">{"\uc815\ud569\uc131 \uac80\uc0ac"}</h2>
            <p className="mt-1 text-sm text-fg-subtle">{"\uc18c\uc124 \uc138\uacc4\uad00 \ub370\uc774\ud130\uc758 \ucda9\ub3cc\uc744 \ud0d0\uc9c0\ud569\ub2c8\ub2e4."}</p>
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={handleScan} disabled={running} size="sm">
              <Play className="h-4 w-4" />
              {running ? "\uac80\uc0ac \uc911..." : "\uc804\uccb4 \uac80\uc0ac"}
            </Button>
          </div>
        </div>

        {/* Summary bar */}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <span className={`h-2.5 w-2.5 rounded-full ${SEV_DOT.high}`} />
            <span className="text-sm text-fg-base font-semibold">{summary.high}</span>
            <span className="text-xs text-fg-subtle">{"\ub192\uc74c"}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className={`h-2.5 w-2.5 rounded-full ${SEV_DOT.medium}`} />
            <span className="text-sm text-fg-base font-semibold">{summary.medium}</span>
            <span className="text-xs text-fg-subtle">{"\uc911\uac04"}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className={`h-2.5 w-2.5 rounded-full ${SEV_DOT.low}`} />
            <span className="text-sm text-fg-base font-semibold">{summary.low}</span>
            <span className="text-xs text-fg-subtle">{"\ub0ae\uc74c"}</span>
          </div>
          <div className="ml-auto flex items-center gap-3 text-xs text-fg-muted">
            <span>{"\ubbf8\ud574\uacb0"} {summary.open} / {"\ubb34\uc2dc"} {summary.ignored} / {"\ud574\uacb0"} {summary.resolved}</span>
            {lastScanned && (
              <span>{"\ub9c8\uc9c0\ub9c9 \uac80\uc0ac"}: {new Date(lastScanned).toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" })}</span>
            )}
          </div>
        </div>
      </div>

      {/* ── Filter bar ── */}
      <div className="flex flex-wrap items-center gap-2 px-6 py-2 border-b border-border-strong shrink-0">
        <Filter className="h-3.5 w-3.5 text-fg-muted shrink-0" />
        <div className="relative min-w-[140px] max-w-[200px]">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-fg-muted" />
          <Input placeholder={"\uac80\uc0c9..."} value={filterSearch} onChange={(e) => setFilterSearch(e.target.value)}
            className="h-7 pl-7 text-xs bg-bg-subtle border-border-strong" />
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="h-7 w-28 text-xs bg-bg-subtle border-border-strong"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{"\uc804\uccb4 \uc0c1\ud0dc"}</SelectItem>
            <SelectItem value="open">{"\ubbf8\ud574\uacb0"}</SelectItem>
            <SelectItem value="ignored">{"\ubb34\uc2dc"}</SelectItem>
            <SelectItem value="resolved">{"\ud574\uacb0\ub428"}</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterSev} onValueChange={setFilterSev}>
          <SelectTrigger className="h-7 w-28 text-xs bg-bg-subtle border-border-strong"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{"\uc804\uccb4 \uc2ec\uac01\ub3c4"}</SelectItem>
            <SelectItem value="high">{"\ub192\uc74c"}</SelectItem>
            <SelectItem value="medium">{"\uc911\uac04"}</SelectItem>
            <SelectItem value="low">{"\ub0ae\uc74c"}</SelectItem>
          </SelectContent>
        </Select>
        <span className="text-[10px] text-fg-muted ml-auto">{filteredIssues.length}{"\uac74"}</span>
      </div>

      {/* ── Body: List + Detail ── */}
      <div className="flex flex-1 min-h-0 overflow-hidden">
        {/* Issue list */}
        <ScrollArea className="flex-1 border-r border-border-strong">
          <div className="p-4 space-y-2">
            {filteredIssues.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <CheckCircle2 className="h-10 w-10 text-visualizer-emerald-mint mb-3" />
                <p className="text-sm font-semibold text-fg-base">{summary.total === 0 ? "\uac80\uc0ac\ub97c \uc2e4\ud589\ud574\uc8fc\uc138\uc694" : "\ud544\ud130 \uacb0\uacfc\uac00 \uc5c6\uc2b5\ub2c8\ub2e4"}</p>
                {summary.total === 0 && (
                  <p className="text-xs text-fg-subtle mt-1">{"\"\uc804\uccb4 \uac80\uc0ac\" \ubc84\ud2bc\uc744 \ub20c\ub7ec \uc18c\uc124 \ub370\uc774\ud130\ub97c \uc2a4\uce94\ud558\uc138\uc694."}</p>
                )}
              </div>
            )}
            {filteredIssues.map((iss) => (
              <button
                key={iss.id}
                onClick={() => setSelectedIssueId(iss.id)}
                className={`w-full text-left border rounded-lg p-3 transition-colors ${
                  selectedIssueId === iss.id ? "border-brand-100/40 bg-bg-subtle" : "border-border-strong hover:border-border-contrast"
                }`}
              >
                <div className="flex items-start gap-2">
                  <span className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${SEV_DOT[iss.severity]}`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <Badge variant="outline" className={`border text-[10px] ${SEV_STYLE[iss.severity]}`}>
                        {SEV_LABEL[iss.severity]}
                      </Badge>
                      <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-border-strong text-fg-subtle">
                        {iss.ruleCode}
                      </Badge>
                      {iss.status !== "open" && (
                        <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-border-strong text-fg-muted">
                          {STATUS_LABEL[iss.status]}
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-fg-base leading-snug mb-1">{iss.title}</p>
                    <p className="text-xs text-fg-subtle line-clamp-2">{iss.message}</p>
                    {(iss.relatedEntityIds ?? []).length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {(iss.relatedEntityIds ?? []).slice(0, 3).map((eid) => (
                          <Badge key={eid} variant="secondary" className="text-[10px] bg-bg-subtle text-fg-subtle">
                            {resolveEntityName(eid)}
                          </Badge>
                        ))}
                      </div>
                    )}
                    <span className="text-[10px] text-fg-muted mt-1 block">
                      {new Date(iss.lastDetectedAt).toLocaleDateString("ko-KR", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </ScrollArea>

        {/* Detail panel */}
        <div className="w-96 shrink-0 flex flex-col bg-bg-chat hidden lg:flex">
          {selectedIssue ? (
            <ScrollArea className="flex-1">
              <div className="p-4 space-y-4">
                {/* Header */}
                <div className="flex items-start gap-2">
                  <span className={`mt-1 h-3 w-3 shrink-0 rounded-full ${SEV_DOT[selectedIssue.severity]}`} />
                  <div className="flex-1">
                    <Badge variant="outline" className={`border text-xs mb-1 ${SEV_STYLE[selectedIssue.severity]}`}>
                      {SEV_LABEL[selectedIssue.severity]}
                    </Badge>
                    <h3 className="text-sm font-semibold text-fg-base">{selectedIssue.title}</h3>
                    <p className="text-[10px] text-fg-muted mt-0.5">{selectedIssue.ruleCode} | {STATUS_LABEL[selectedIssue.status]}</p>
                  </div>
                </div>

                {/* Message */}
                <div className="border border-border-strong rounded-md p-3 bg-bg-subtle">
                  <p className="text-xs text-fg-base leading-relaxed">{selectedIssue.message}</p>
                </div>

                {/* Related entities */}
                {(selectedIssue.relatedEntityIds ?? []).length > 0 && (
                  <div>
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-fg-subtle">{"\uad00\ub828 \uc5d4\ud2f0\ud2f0"}</span>
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {(selectedIssue.relatedEntityIds ?? []).map((eid) => (
                        <Badge key={eid} variant="secondary" className="text-[10px] bg-bg-subtle text-fg-subtle">
                          {resolveEntityName(eid)}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Evidence */}
                {selectedIssue.evidence.length > 0 && (
                  <div>
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-fg-subtle">{"\uc99d\uac70"}</span>
                    <div className="space-y-1.5 mt-1">
                      {selectedIssue.evidence.map((ev, i) => (
                        <div key={i} className="flex items-start gap-2 text-xs border-l-2 border-border-strong pl-2">
                          <Badge variant="outline" className="text-[10px] px-1 py-0 border-border-strong text-fg-muted shrink-0">
                            {ev.sourceType}
                          </Badge>
                          <span className="text-fg-subtle">{ev.snippetText || ev.sourceId.slice(0, 12)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Suggested actions */}
                {selectedIssue.suggestedActions.length > 0 && (
                  <div>
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-fg-subtle">{"\ud574\uacb0 \uc81c\uc548"}</span>
                    <div className="space-y-1 mt-1">
                      {selectedIssue.suggestedActions.map((sa, i) => (
                        <Button key={i} variant="ghost" size="sm" className="h-7 text-xs gap-1 justify-start w-full">
                          <ExternalLink className="h-3 w-3" />{sa.label}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}

                <Separator className="bg-border-strong" />

                {/* Status actions */}
                <div className="flex flex-wrap gap-2">
                  {selectedIssue.status === "open" && (
                    <>
                      <Button variant="outline" size="sm" className="h-7 text-xs gap-1" onClick={() => resolveIssue(selectedIssue.id)}>
                        <CheckCircle2 className="h-3 w-3" />{"\ud574\uacb0\ub428\uc73c\ub85c \ud45c\uc2dc"}
                      </Button>
                      <Button variant="ghost" size="sm" className="h-7 text-xs gap-1 text-fg-muted" onClick={() => ignoreIssue(selectedIssue.id)}>
                        <EyeOff className="h-3 w-3" />{"\ubb34\uc2dc"}
                      </Button>
                    </>
                  )}
                  {(selectedIssue.status === "ignored" || selectedIssue.status === "resolved") && (
                    <Button variant="outline" size="sm" className="h-7 text-xs gap-1" onClick={() => reopenIssue(selectedIssue.id)}>
                      <RotateCcw className="h-3 w-3" />{"\ub2e4\uc2dc \uc5f4\uae30"}
                    </Button>
                  )}
                  <Button variant="ghost" size="sm" className="h-7 text-xs gap-1" onClick={handleScan}>
                    <Play className="h-3 w-3" />{"\uc7ac\uac80\uc0ac"}
                  </Button>
                </div>

                {/* Timestamps */}
                <div className="text-[10px] text-fg-muted space-y-0.5">
                  <p>{"\ucd5c\ucd08 \uac10\uc9c0"}: {new Date(selectedIssue.firstDetectedAt).toLocaleString("ko-KR")}</p>
                  <p>{"\ub9c8\uc9c0\ub9c9 \uac10\uc9c0"}: {new Date(selectedIssue.lastDetectedAt).toLocaleString("ko-KR")}</p>
                </div>
              </div>
            </ScrollArea>
          ) : (
            <div className="flex-1 flex items-center justify-center px-4">
              <p className="text-xs text-fg-muted text-center">{"\uc774\uc288\ub97c \uc120\ud0dd\ud558\uba74 \uc0c1\uc138 \uc815\ubcf4\uac00 \uc5ec\uae30\uc5d0 \ud45c\uc2dc\ub429\ub2c8\ub2e4."}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
