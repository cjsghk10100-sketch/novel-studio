import { useState, useEffect, useCallback } from "react";
import { useNovelStore } from "@/lib/novel-store";
import { ManuscriptSidebar } from "./ManuscriptSidebar";
import { ManuscriptEditor } from "./ManuscriptEditor";
import { ManuscriptContextPanel } from "./ManuscriptContextPanel";
import { EntityMentionDialog } from "./EntityMentionDialog";

export function ManuscriptPage() {
  const books = useNovelStore((s) => s.books);
  const manuscriptChapters = useNovelStore((s) => s.manuscriptChapters);
  const updateManuscriptChapter = useNovelStore((s) => s.updateManuscriptChapter);
  const addTextEntityReference = useNovelStore((s) => s.addTextEntityReference);

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
        manuscriptSceneId: selectedChapterId, // reusing field for chapter-level reference
        entityType: entityType as "character" | "location" | "faction" | "item" | "event",
        entityId,
      });
      setEntityMentionOpen(false);
    },
    [selectedChapterId, manuscriptChapters, updateManuscriptChapter, addTextEntityReference],
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
