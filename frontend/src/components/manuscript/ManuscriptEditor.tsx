import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useNovelStore } from "@/lib/novel-store";
import { extractFromText, type EntityIndex } from "@/lib/text-extractor";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BookOpen, Pencil, Check, X, AtSign, Maximize2,
  Minimize2, ChevronLeft, ChevronRight, Bot, Sparkles,
} from "lucide-react";
import type { ManuscriptSceneStatus } from "@/lib/novel-types";

const STATUS_STYLES: Record<string, string> = {
  draft: "bg-bg-subtle text-fg-muted border-border-strong",
  writing: "bg-tag-blue-10 text-tag-blue-100 border-tag-blue-100/20",
  review: "bg-tag-yellow-10 text-tag-yellow-100 border-tag-yellow-100/20",
  complete: "bg-tag-cyan-10 text-tag-cyan-100 border-tag-cyan-100/20",
};
const STATUS_LABELS: Record<string, string> = {
  draft: "초안", writing: "작성중", review: "검토중", complete: "완료",
};

interface ManuscriptEditorProps {
  chapterId: string | null;
  bookId: string | null;
  onNavigateChapter: (chapterId: string) => void;
  onToggleFullscreen: () => void;
  isFullscreen: boolean;
  onOpenEntityMention: () => void;
  onOpenAgentDialog?: () => void;
}

export function ManuscriptEditor({
  chapterId, bookId, onNavigateChapter, onToggleFullscreen, isFullscreen, onOpenEntityMention, onOpenAgentDialog,
}: ManuscriptEditorProps) {
  const manuscriptChapters = useNovelStore((s) => s.manuscriptChapters);
  const getChaptersForBook = useNovelStore((s) => s.getChaptersForBook);
  const updateManuscriptChapter = useNovelStore((s) => s.updateManuscriptChapter);
  const addTextEntityReference = useNovelStore((s) => s.addTextEntityReference);
  const addExtractedProposal = useNovelStore((s) => s.addExtractedProposal);
  const getReferencesForScene = useNovelStore((s) => s.getReferencesForScene);
  const getProposalsForScene = useNovelStore((s) => s.getProposalsForScene);

  // Entity index for extraction
  const characters = useNovelStore((s) => s.characters);
  const locations = useNovelStore((s) => s.locations);
  const factions = useNovelStore((s) => s.factions);
  const items = useNovelStore((s) => s.items);
  const events = useNovelStore((s) => s.events);

  const chapter = chapterId ? manuscriptChapters[chapterId] : null;

  const [content, setContent] = useState("");
  const [title, setTitle] = useState("");
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleDraft, setTitleDraft] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<number | null>(null);
  const [extractionCount, setExtractionCount] = useState(0);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Sync local state when chapterId changes
  useEffect(() => {
    if (chapter) {
      setContent(chapter.content);
      setTitle(chapter.title);
      setLastSaved(chapter.lastEditedAt);
      setIsSaving(false);
      setExtractionCount(0);
    } else {
      setContent("");
      setTitle("");
    }
  }, [chapterId]); // eslint-disable-line react-hooks/exhaustive-deps

  // 자동 추출 실행
  const runExtraction = useCallback((text: string) => {
    if (!chapterId) return;

    const entityIndex: EntityIndex = { characters, locations, factions, items, events };

    // 기존 참조/제안의 키 수집 (중복 방지)
    const existingRefs = getReferencesForScene(chapterId);
    const existingRefKeys = new Set(existingRefs.map((r) => `${r.entityType}:${r.entityId}`));
    const existingProposals = getProposalsForScene(chapterId);
    const existingProposalDescs = new Set(existingProposals.map((p) => p.description));

    const result = extractFromText(text, entityIndex, existingRefKeys, existingProposalDescs);

    let count = 0;

    // 새 엔티티 참조 등록
    for (const ref of result.newRefs) {
      addTextEntityReference({
        manuscriptSceneId: chapterId,
        entityType: ref.entityType,
        entityId: ref.entityId,
      });
      count++;
    }

    // 새 제안 등록
    for (const proposal of result.proposals) {
      addExtractedProposal({
        manuscriptSceneId: chapterId,
        proposalType: proposal.proposalType,
        description: proposal.description,
        status: 'pending',
        targetEntityType: proposal.targetEntityType,
        targetEntityId: proposal.targetEntityId,
      });
      count++;
    }

    if (count > 0) setExtractionCount((prev) => prev + count);
  }, [chapterId, characters, locations, factions, items, events, getReferencesForScene, getProposalsForScene, addTextEntityReference, addExtractedProposal]);

  const saveContent = useCallback((text: string) => {
    if (!chapterId) return;
    setIsSaving(true);
    updateManuscriptChapter(chapterId, { content: text });
    // 저장 후 자동 추출 실행
    runExtraction(text);
    setIsSaving(false);
    setLastSaved(Date.now());
  }, [chapterId, updateManuscriptChapter, runExtraction]);

  const handleContentChange = (value: string) => {
    setContent(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => saveContent(value), 1500);
  };

  // Navigation: prev/next chapter
  const { prevChapterId, nextChapterId } = useMemo(() => {
    if (!chapter || !bookId) return { prevChapterId: null, nextChapterId: null };
    const siblings = getChaptersForBook(bookId);
    const idx = siblings.findIndex((c) => c.id === chapter.id);
    return {
      prevChapterId: idx > 0 ? siblings[idx - 1].id : null,
      nextChapterId: idx < siblings.length - 1 ? siblings[idx + 1].id : null,
    };
  }, [chapter, bookId, getChaptersForBook]);

  const lastSavedLabel = lastSaved
    ? `마지막 저장: ${new Date(lastSaved).toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" })}`
    : "";

  const handleTitleSave = () => {
    if (chapterId && titleDraft.trim()) {
      updateManuscriptChapter(chapterId, { title: titleDraft.trim() });
      setTitle(titleDraft.trim());
    }
    setEditingTitle(false);
  };

  const handleStatusChange = (newStatus: string) => {
    if (chapterId) {
      updateManuscriptChapter(chapterId, { status: newStatus as ManuscriptSceneStatus });
    }
  };

  // Empty state
  if (!chapterId || !chapter) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-fg-muted px-4">
        <BookOpen className="h-10 w-10 mb-3 opacity-40" />
        <p className="text-sm mb-1">화를 선택하거나 새로 만들어 집필을 시작하세요</p>
        <p className="text-xs text-fg-muted">왼쪽에서 편을 선택한 후 '새 화 추가'를 눌러주세요</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Top bar: title + metadata */}
      <div className="flex flex-wrap items-center gap-3 px-4 py-2.5 border-b border-border-strong text-xs">
        {/* Editable title */}
        {editingTitle ? (
          <span className="flex items-center gap-1">
            <Input
              value={titleDraft}
              onChange={(e) => setTitleDraft(e.target.value)}
              className="h-7 text-sm font-semibold w-48 bg-bg-subtle border-border-strong"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter") handleTitleSave();
                if (e.key === "Escape") setEditingTitle(false);
              }}
            />
            <button onClick={handleTitleSave} className="p-0.5 text-fg-base"><Check className="h-3.5 w-3.5" /></button>
            <button onClick={() => setEditingTitle(false)} className="p-0.5 text-fg-muted"><X className="h-3.5 w-3.5" /></button>
          </span>
        ) : (
          <span
            className="text-sm font-semibold text-fg-base cursor-pointer inline-flex items-center gap-1 hover:text-fg-base/80"
            onClick={() => { setTitleDraft(title); setEditingTitle(true); }}
          >
            {title}
            <Pencil className="h-3 w-3 text-fg-muted" />
          </span>
        )}

        {/* Status select */}
        <Select value={chapter.status} onValueChange={handleStatusChange}>
          <SelectTrigger className="h-7 w-24 text-[11px] bg-bg-subtle border-border-strong">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="draft">초안</SelectItem>
            <SelectItem value="writing">작성중</SelectItem>
            <SelectItem value="review">검토중</SelectItem>
            <SelectItem value="complete">완료</SelectItem>
          </SelectContent>
        </Select>

        {/* Word count */}
        <span className="text-fg-muted tabular-nums">{(chapter.wordCount ?? 0).toLocaleString()}글자</span>

        {/* Extraction indicator */}
        {extractionCount > 0 && (
          <span className="inline-flex items-center gap-1 text-[11px] text-tag-cyan-100">
            <Sparkles className="h-3 w-3" />
            {extractionCount}개 감지
          </span>
        )}

        {/* Save status */}
        <span className={`ml-auto text-[11px] ${isSaving ? "text-tag-yellow-100" : "text-fg-muted"}`}>
          {isSaving ? "저장 중..." : "저장됨"}
          {!isSaving && lastSavedLabel && <span className="ml-1">{lastSavedLabel}</span>}
        </span>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-1 px-4 py-1.5 border-b border-border-strong">
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onOpenEntityMention} title="엔티티 언급">
          <AtSign className="h-3.5 w-3.5" />
        </Button>
        {onOpenAgentDialog && (
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onOpenAgentDialog} title="에이전트 분석 요청">
            <Bot className="h-3.5 w-3.5" />
          </Button>
        )}
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onToggleFullscreen} title="전체 화면">
          {isFullscreen ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
        </Button>
        <div className="flex-1" />
        <Button
          variant="ghost" size="icon" className="h-7 w-7"
          disabled={!prevChapterId}
          onClick={() => prevChapterId && onNavigateChapter(prevChapterId)}
          title="이전 화"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost" size="icon" className="h-7 w-7"
          disabled={!nextChapterId}
          onClick={() => nextChapterId && onNavigateChapter(nextChapterId)}
          title="다음 화"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Main editor */}
      <div className="flex-1 min-h-0">
        <textarea
          value={content}
          onChange={(e) => handleContentChange(e.target.value)}
          className="w-full h-full resize-none border-0 bg-transparent text-fg-base focus:outline-none focus:ring-0 text-sm leading-relaxed p-4 font-serif"
          placeholder="여기에 본문을 작성하세요..."
        />
      </div>
    </div>
  );
}
