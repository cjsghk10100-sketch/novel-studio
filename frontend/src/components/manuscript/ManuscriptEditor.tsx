import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useNovelStore } from "@/lib/novel-store";
import { autoLinkEntities, type EntityIndex } from "@/lib/text-extractor";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  BookOpen, Pencil, Check, X, AtSign, Maximize2,
  Minimize2, ChevronLeft, ChevronRight, Plus,
  User, MapPin, Shield, Sword, Zap,
} from "lucide-react";
import type { ManuscriptSceneStatus, EntityType } from "@/lib/novel-types";

const STATUS_LABELS: Record<string, string> = {
  draft: "초안", writing: "작성중", review: "검토중", complete: "완료",
};

const ENTITY_ICONS: Record<EntityType, typeof User> = {
  character: User, location: MapPin, faction: Shield, item: Sword, event: Zap,
};
const ENTITY_LABELS: Record<EntityType, string> = {
  character: "캐릭터", location: "장소", faction: "세력", item: "아이템", event: "사건",
};

interface ManuscriptEditorProps {
  chapterId: string | null;
  bookId: string | null;
  onNavigateChapter: (chapterId: string) => void;
  onToggleFullscreen: () => void;
  isFullscreen: boolean;
  onOpenEntityMention: () => void;
  /** 텍스트 선택 후 빠른 위키 등록 콜백 */
  onQuickRegister?: (selectedText: string, entityType: EntityType) => void;
}

export function ManuscriptEditor({
  chapterId, bookId, onNavigateChapter, onToggleFullscreen, isFullscreen, onOpenEntityMention, onQuickRegister,
}: ManuscriptEditorProps) {
  const manuscriptChapters = useNovelStore((s) => s.manuscriptChapters);
  const getChaptersForBook = useNovelStore((s) => s.getChaptersForBook);
  const updateManuscriptChapter = useNovelStore((s) => s.updateManuscriptChapter);
  const addTextEntityReference = useNovelStore((s) => s.addTextEntityReference);
  const getReferencesForScene = useNovelStore((s) => s.getReferencesForScene);
  const syncManuscriptToBoard = useNovelStore((s) => s.syncManuscriptToBoard);

  // Entity index for auto-link
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
  const [selectedText, setSelectedText] = useState("");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

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

  // 자동 링크 실행 + 보드 동기화
  const runAutoLink = useCallback((text: string) => {
    if (!chapterId) return;
    const entityIndex: EntityIndex = { characters, locations, factions, items, events };
    const existingRefs = getReferencesForScene(chapterId);
    const existingRefKeys = new Set(existingRefs.map((r) => `${r.entityType}:${r.entityId}`));
    const result = autoLinkEntities(text, entityIndex, existingRefKeys);
    for (const ref of result.newRefs) {
      addTextEntityReference({
        manuscriptSceneId: chapterId,
        entityType: ref.entityType,
        entityId: ref.entityId,
      });
    }
    // 새 참조가 추가되었으면 보드 장면에도 동기화
    if (result.newRefs.length > 0) {
      syncManuscriptToBoard(chapterId);
    }
  }, [chapterId, characters, locations, factions, items, events, getReferencesForScene, addTextEntityReference, syncManuscriptToBoard]);

  const saveContent = useCallback((text: string) => {
    if (!chapterId) return;
    setIsSaving(true);
    updateManuscriptChapter(chapterId, { content: text });
    runAutoLink(text);
    setIsSaving(false);
    setLastSaved(Date.now());
  }, [chapterId, updateManuscriptChapter, runAutoLink]);

  const handleContentChange = (value: string) => {
    setContent(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => saveContent(value), 1500);
  };

  // 텍스트 선택 감지 → 빠른 등록 메뉴
  const handleMouseUp = useCallback(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    const sel = ta.value.substring(ta.selectionStart, ta.selectionEnd).trim();
    if (sel.length >= 2 && sel.length <= 20 && !sel.includes("\n")) {
      setSelectedText(sel);
    } else {
      setSelectedText("");
    }
  }, []);

  // 에디터 외부 클릭 시 선택 상태 초기화
  useEffect(() => {
    const handleGlobalClick = (e: MouseEvent) => {
      const ta = textareaRef.current;
      if (ta && !ta.contains(e.target as Node)) {
        // 빠른 등록 버튼 영역 클릭은 제외
        const target = e.target as HTMLElement;
        if (target.closest('[data-quick-register]')) return;
        setSelectedText("");
      }
    };
    document.addEventListener("mousedown", handleGlobalClick);
    return () => document.removeEventListener("mousedown", handleGlobalClick);
  }, []);

  const handleQuickRegister = useCallback((type: EntityType) => {
    if (selectedText && onQuickRegister) {
      onQuickRegister(selectedText, type);
    }
    setSelectedText("");
  }, [selectedText, onQuickRegister]);

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
      {/* Top bar */}
      <div className="flex flex-wrap items-center gap-3 px-4 py-2.5 border-b border-border-strong text-xs">
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

        <span className="text-fg-muted tabular-nums">{(chapter.wordCount ?? 0).toLocaleString()}글자</span>

        <span className={`ml-auto text-[11px] ${isSaving ? "text-tag-yellow-100" : "text-fg-muted"}`}>
          {isSaving ? "저장 중..." : "저장됨"}
          {!isSaving && lastSavedLabel && <span className="ml-1">{lastSavedLabel}</span>}
        </span>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-1 px-4 py-1.5 border-b border-border-strong">
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onOpenEntityMention} title="엔티티 언급 (@)">
          <AtSign className="h-3.5 w-3.5" />
        </Button>

        {/* 빠른 위키 등록 드롭다운 */}
        {onQuickRegister && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-7 w-7" title="빠른 위키 등록 (텍스트 선택 후 사용)">
                <Plus className="h-3.5 w-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="bg-bg-chat border-border-strong">
              <div className="px-2 py-1.5 text-[10px] text-fg-muted">
                {selectedText ? `"${selectedText}" 등록:` : "본문에서 텍스트를 선택한 후 사용하세요"}
              </div>
              {selectedText && (["character", "location", "faction", "item", "event"] as EntityType[]).map((type) => {
                const Icon = ENTITY_ICONS[type];
                return (
                  <DropdownMenuItem
                    key={type}
                    onClick={() => handleQuickRegister(type)}
                    className="text-xs gap-2"
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {ENTITY_LABELS[type]}로 등록
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onToggleFullscreen} title="전체 화면">
          {isFullscreen ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
        </Button>
        <div className="flex-1" />
        <Button variant="ghost" size="icon" className="h-7 w-7" disabled={!prevChapterId}
          onClick={() => prevChapterId && onNavigateChapter(prevChapterId)} title="이전 화">
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" className="h-7 w-7" disabled={!nextChapterId}
          onClick={() => nextChapterId && onNavigateChapter(nextChapterId)} title="다음 화">
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* 선택 텍스트 빠른 등록 알림 바 */}
      {selectedText && onQuickRegister && (
        <div data-quick-register className="flex items-center gap-2 px-4 py-1.5 bg-tag-blue-10 border-b border-tag-blue-100/20 text-xs">
          <span className="text-tag-blue-100">
            "{selectedText}" 선택됨 — 위키에 등록하려면:
          </span>
          <div className="flex items-center gap-1">
            {(["character", "location", "faction", "item", "event"] as EntityType[]).map((type) => {
              const Icon = ENTITY_ICONS[type];
              return (
                <button
                  key={type}
                  onClick={() => handleQuickRegister(type)}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-bg-chat border border-border-strong text-fg-base hover:bg-bg-subtle transition-colors"
                  title={`${ENTITY_LABELS[type]}로 등록`}
                >
                  <Icon className="h-3 w-3" />
                  <span className="text-[10px]">{ENTITY_LABELS[type]}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Main editor */}
      <div className="flex-1 min-h-0">
        <textarea
          ref={textareaRef}
          value={content}
          onChange={(e) => handleContentChange(e.target.value)}
          onMouseUp={handleMouseUp}
          onKeyUp={handleMouseUp}
          className="w-full h-full resize-none border-0 bg-transparent text-fg-base focus:outline-none focus:ring-0 text-sm leading-relaxed p-4 font-serif"
          placeholder="여기에 본문을 작성하세요..."
        />
      </div>
    </div>
  );
}
