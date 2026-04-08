import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useNovelStore } from "@/lib/novel-store";
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
  Minimize2, ChevronLeft, ChevronRight, Save,
} from "lucide-react";
import type { ManuscriptSceneStatus } from "@/lib/novel-types";

const STATUS_STYLES: Record<string, string> = {
  draft: "bg-bg-subtle text-fg-muted border-border-strong",
  writing: "bg-tag-blue-10 text-tag-blue-100 border-tag-blue-100/20",
  review: "bg-tag-yellow-10 text-tag-yellow-100 border-tag-yellow-100/20",
  complete: "bg-tag-cyan-10 text-tag-cyan-100 border-tag-cyan-100/20",
};
const STATUS_LABELS: Record<string, string> = {
  draft: "\ucd08\uc548", writing: "\uc791\uc131\uc911", review: "\uac80\ud1a0\uc911", complete: "\uc644\ub8cc",
};

interface ManuscriptEditorProps {
  chapterId: string | null;
  bookId: string | null;
  onNavigateChapter: (chapterId: string) => void;
  onToggleFullscreen: () => void;
  isFullscreen: boolean;
  onOpenEntityMention: () => void;
}

export function ManuscriptEditor({
  chapterId, bookId, onNavigateChapter, onToggleFullscreen, isFullscreen, onOpenEntityMention,
}: ManuscriptEditorProps) {
  const manuscriptChapters = useNovelStore((s) => s.manuscriptChapters);
  const getChaptersForBook = useNovelStore((s) => s.getChaptersForBook);
  const updateManuscriptChapter = useNovelStore((s) => s.updateManuscriptChapter);

  const chapter = chapterId ? manuscriptChapters[chapterId] : null;

  const [content, setContent] = useState("");
  const [title, setTitle] = useState("");
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleDraft, setTitleDraft] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<number | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Sync local state when chapterId changes
  useEffect(() => {
    if (chapter) {
      setContent(chapter.content);
      setTitle(chapter.title);
      setLastSaved(chapter.lastEditedAt);
      setIsSaving(false);
    } else {
      setContent("");
      setTitle("");
    }
  }, [chapterId]); // eslint-disable-line react-hooks/exhaustive-deps

  const saveContent = useCallback((text: string) => {
    if (!chapterId) return;
    setIsSaving(true);
    updateManuscriptChapter(chapterId, { content: text });
    setIsSaving(false);
    setLastSaved(Date.now());
  }, [chapterId, updateManuscriptChapter]);

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
    ? `\ub9c8\uc9c0\ub9c9 \uc800\uc7a5: ${new Date(lastSaved).toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" })}`
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
        <p className="text-sm mb-1">{"\ud654\ub97c \uc120\ud0dd\ud558\uac70\ub098 \uc0c8\ub85c \ub9cc\ub4e4\uc5b4 \uc9d1\ud544\uc744 \uc2dc\uc791\ud558\uc138\uc694"}</p>
        <p className="text-xs text-fg-muted">{"\uc67c\ucabd\uc5d0\uc11c \ud3b8\uc744 \uc120\ud0dd\ud55c \ud6c4 '\uc0c8 \ud654 \ucd94\uac00'\ub97c \ub20c\ub7ec\uc8fc\uc138\uc694"}</p>
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
            <SelectItem value="draft">{"\ucd08\uc548"}</SelectItem>
            <SelectItem value="writing">{"\uc791\uc131\uc911"}</SelectItem>
            <SelectItem value="review">{"\uac80\ud1a0\uc911"}</SelectItem>
            <SelectItem value="complete">{"\uc644\ub8cc"}</SelectItem>
          </SelectContent>
        </Select>

        {/* Word count */}
        <span className="text-fg-muted tabular-nums">{(chapter.wordCount ?? 0).toLocaleString()}{"\uae00\uc790"}</span>

        {/* Save status */}
        <span className={`ml-auto text-[11px] ${isSaving ? "text-tag-yellow-100" : "text-fg-muted"}`}>
          {isSaving ? "\uc800\uc7a5 \uc911..." : "\uc800\uc7a5\ub428"}
          {!isSaving && lastSavedLabel && <span className="ml-1">{lastSavedLabel}</span>}
        </span>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-1 px-4 py-1.5 border-b border-border-strong">
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onOpenEntityMention} title={"\uc5d4\ud2f0\ud2f0 \uc5b8\uae09"}>
          <AtSign className="h-3.5 w-3.5" />
        </Button>
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onToggleFullscreen} title={"\uc804\uccb4 \ud654\uba74"}>
          {isFullscreen ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
        </Button>
        <div className="flex-1" />
        <Button
          variant="ghost" size="icon" className="h-7 w-7"
          disabled={!prevChapterId}
          onClick={() => prevChapterId && onNavigateChapter(prevChapterId)}
          title={"\uc774\uc804 \ud654"}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost" size="icon" className="h-7 w-7"
          disabled={!nextChapterId}
          onClick={() => nextChapterId && onNavigateChapter(nextChapterId)}
          title={"\ub2e4\uc74c \ud654"}
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
          placeholder={"\uc5ec\uae30\uc5d0 \ubcf8\ubb38\uc744 \uc791\uc131\ud558\uc138\uc694..."}
        />
      </div>
    </div>
  );
}
