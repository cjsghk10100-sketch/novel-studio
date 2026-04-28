import { useState, useEffect, useCallback } from "react";
import { useNovelStore } from "@/lib/novel-store";
import { ManuscriptSidebar } from "./ManuscriptSidebar";
import { ManuscriptEditor } from "./ManuscriptEditor";
import { ManuscriptContextPanel } from "./ManuscriptContextPanel";
import { EntityMentionDialog } from "./EntityMentionDialog";
import type { EntityType } from "@/lib/novel-types";

export function ManuscriptPage() {
  const books = useNovelStore((s) => s.books);
  const manuscriptChapters = useNovelStore((s) => s.manuscriptChapters);
  const updateManuscriptChapter = useNovelStore((s) => s.updateManuscriptChapter);
  const addTextEntityReference = useNovelStore((s) => s.addTextEntityReference);

  // 위키 등록 액션
  const addCharacter = useNovelStore((s) => s.addCharacter);
  const addLocation = useNovelStore((s) => s.addLocation);
  const addFaction = useNovelStore((s) => s.addFaction);
  const addItem = useNovelStore((s) => s.addItem);
  const addEvent = useNovelStore((s) => s.addEvent);

  // 중복 등록 방지를 위한 위키 엔티티 접근
  const characters = useNovelStore((s) => s.characters);
  const locations = useNovelStore((s) => s.locations);
  const factions = useNovelStore((s) => s.factions);
  const items = useNovelStore((s) => s.items);
  const events = useNovelStore((s) => s.events);

  const [selectedBookId, setSelectedBookId] = useState<string | null>(null);
  const [selectedChapterId, setSelectedChapterId] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [entityMentionOpen, setEntityMentionOpen] = useState(false);

  // Auto-select first book on mount
  useEffect(() => {
    const bookList = Object.values(books).sort((a, b) => a.sortOrder - b.sortOrder);
    if (bookList.length > 0 && !selectedBookId) {
      setSelectedBookId(bookList[0].id);
    }
    if (selectedBookId && !books[selectedBookId] && bookList.length > 0) {
      setSelectedBookId(bookList[0].id);
    }
  }, [books, selectedBookId]);

  // Entity mention handler
  const handleEntityMention = useCallback(
    (entityType: string, entityId: string, entityName: string) => {
      if (!selectedChapterId) return;
      const chapter = manuscriptChapters[selectedChapterId];
      if (!chapter) return;

      updateManuscriptChapter(selectedChapterId, {
        content: chapter.content + ` @${entityName}`,
      });
      addTextEntityReference({
        manuscriptSceneId: selectedChapterId,
        entityType: entityType as EntityType,
        entityId,
      });
      setEntityMentionOpen(false);
    },
    [selectedChapterId, manuscriptChapters, updateManuscriptChapter, addTextEntityReference],
  );

  // 빠른 위키 등록 핸들러: 선택한 텍스트를 위키 엔티티로 바로 등록
  const handleQuickRegister = useCallback(
    (selectedText: string, entityType: EntityType) => {
      if (!selectedChapterId || !selectedText.trim()) return;
      const name = selectedText.trim();

      // 1. 이미 같은 이름의 엔티티가 있는지 확인
      let existingId: string | null = null;
      switch (entityType) {
        case "character":
          existingId = Object.values(characters).find((c) => c.name === name)?.id ?? null;
          break;
        case "location":
          existingId = Object.values(locations).find((l) => l.name === name)?.id ?? null;
          break;
        case "faction":
          existingId = Object.values(factions).find((f) => f.name === name)?.id ?? null;
          break;
        case "item":
          existingId = Object.values(items).find((i) => i.name === name)?.id ?? null;
          break;
        case "event":
          existingId = Object.values(events).find((e) => e.title === name)?.id ?? null;
          break;
      }

      // 2. 없으면 새로 생성, 있으면 기존 ID 사용
      let entityId = existingId ?? "";
      if (!existingId) {
        switch (entityType) {
          case "character":
            entityId = addCharacter({ name, age: null, birthYear: null, deathYear: null, role: "미정", traits: [], notes: "" });
            break;
          case "location":
            entityId = addLocation({ name, type: "미정", description: "" });
            break;
          case "faction":
            entityId = addFaction({ name, ideology: "", description: "" });
            break;
          case "item":
            entityId = addItem({ name, category: "미정", description: "" });
            break;
          case "event":
            entityId = addEvent({ title: name, timelineIndex: 0, summary: "" });
            break;
        }
      }

      // 3. 텍스트 엔티티 참조 생성 (스토어에서 중복 방지)
      if (entityId) {
        addTextEntityReference({
          manuscriptSceneId: selectedChapterId,
          entityType,
          entityId,
        });
      }
    },
    [selectedChapterId, characters, locations, factions, items, events, addCharacter, addLocation, addFaction, addItem, addEvent, addTextEntityReference],
  );

  return (
    <div className="flex h-full bg-bg-chat overflow-hidden">
      {/* Left sidebar */}
      {!isFullscreen && (
        <div className="w-64 border-r border-border-strong flex flex-col shrink-0">
          <ManuscriptSidebar
            selectedBookId={selectedBookId}
            onSelectBook={setSelectedBookId}
            selectedChapterId={selectedChapterId}
            onSelectChapter={setSelectedChapterId}
          />
        </div>
      )}

      {/* Center editor */}
      <div className="flex-1 flex flex-col min-w-0">
        <ManuscriptEditor
          chapterId={selectedChapterId}
          bookId={selectedBookId}
          onNavigateChapter={setSelectedChapterId}
          isFullscreen={isFullscreen}
          onToggleFullscreen={() => setIsFullscreen((f) => !f)}
          onOpenEntityMention={() => setEntityMentionOpen(true)}
          onQuickRegister={handleQuickRegister}
        />
      </div>

      {/* Right context panel */}
      {!isFullscreen && (
        <div className="w-80 border-l border-border-strong flex flex-col shrink-0 hidden lg:flex">
          <ManuscriptContextPanel sceneId={selectedChapterId} />
        </div>
      )}

      {/* Entity mention dialog */}
      <EntityMentionDialog
        open={entityMentionOpen}
        onClose={() => setEntityMentionOpen(false)}
        onSelect={handleEntityMention}
      />
    </div>
  );
}
