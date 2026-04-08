import { useState, useMemo } from "react";
import { useNovelStore } from "@/lib/novel-store";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Plus,
  ChevronUp,
  ChevronDown,
  BookOpen,
  FileText,
} from "lucide-react";
import { BookForm } from "@/components/manuscript/BookForm";
import { ChapterForm } from "@/components/manuscript/ChapterForm";

const STATUS_STYLES: Record<string, string> = {
  draft: "bg-bg-subtle text-fg-muted border-border-strong",
  writing: "bg-tag-blue-10 text-tag-blue-100 border-tag-blue-100/20",
  review: "bg-tag-yellow-10 text-tag-yellow-100 border-tag-yellow-100/20",
  complete: "bg-tag-cyan-10 text-tag-cyan-100 border-tag-cyan-100/20",
};

const STATUS_LABELS: Record<string, string> = {
  draft: "\ucd08\uc548",
  writing: "\uc791\uc131\uc911",
  review: "\uac80\ud1a0\uc911",
  complete: "\uc644\ub8cc",
};

interface ManuscriptSidebarProps {
  selectedBookId: string | null;
  onSelectBook: (id: string | null) => void;
  selectedChapterId: string | null;
  onSelectChapter: (id: string | null) => void;
}

export function ManuscriptSidebar({
  selectedBookId,
  onSelectBook,
  selectedChapterId,
  onSelectChapter,
}: ManuscriptSidebarProps) {
  const books = useNovelStore((s) => s.books);
  const getChaptersForBook = useNovelStore((s) => s.getChaptersForBook);
  const reorderManuscriptChapters = useNovelStore((s) => s.reorderManuscriptChapters);

  const [bookFormOpen, setBookFormOpen] = useState(false);
  const [chapterFormOpen, setChapterFormOpen] = useState(false);

  const sortedBooks = useMemo(
    () => Object.values(books).sort((a, b) => a.sortOrder - b.sortOrder),
    [books],
  );

  const chapters = useMemo(
    () => (selectedBookId ? getChaptersForBook(selectedBookId) : []),
    [selectedBookId, getChaptersForBook],
  );

  function moveChapter(index: number, direction: -1 | 1) {
    const ids = chapters.map((c) => c.id);
    const target = index + direction;
    if (target < 0 || target >= ids.length) return;
    [ids[index], ids[target]] = [ids[target], ids[index]];
    reorderManuscriptChapters(ids);
  }

  return (
    <div className="flex flex-col h-full bg-bg-chat">
      {/* Book selector */}
      <div className="flex items-center gap-2 px-3 py-3 border-b border-border-strong">
        <BookOpen className="h-4 w-4 text-fg-subtle shrink-0" />
        <Select
          value={selectedBookId ?? ""}
          onValueChange={(v) => {
            onSelectBook(v || null);
            onSelectChapter(null);
          }}
        >
          <SelectTrigger className="flex-1 h-8 text-xs bg-bg-subtle border-border-strong">
            <SelectValue placeholder={"\ud3b8 \uc120\ud0dd..."} />
          </SelectTrigger>
          <SelectContent>
            {sortedBooks.map((b) => (
              <SelectItem key={b.id} value={b.id}>{b.title}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          variant="outline"
          size="sm"
          className="h-8 w-8 p-0 shrink-0 border-border-strong"
          onClick={() => setBookFormOpen(true)}
          title={"\uc0c8 \ud3b8"}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      {/* Chapter (화) list */}
      <ScrollArea className="flex-1 min-h-0">
        <div className="px-2 py-2 space-y-0.5">
          {!selectedBookId && (
            <p className="text-xs text-fg-muted text-center py-6">
              {"\ud3b8\uc744 \uc120\ud0dd\ud558\uc138\uc694"}
            </p>
          )}

          {selectedBookId && chapters.length === 0 && (
            <div className="text-center py-8">
              <p className="text-xs text-fg-muted mb-3">{"\uc544\uc9c1 \ud654\uac00 \uc5c6\uc2b5\ub2c8\ub2e4"}</p>
              <Button
                variant="outline"
                size="sm"
                className="text-xs gap-1"
                onClick={() => setChapterFormOpen(true)}
              >
                <Plus className="h-3 w-3" />
                {"\uccab \ud654 \ub9cc\ub4e4\uae30"}
              </Button>
            </div>
          )}

          {chapters.map((chapter, idx) => (
            <div
              key={chapter.id}
              className={`group flex items-center gap-2 px-2 py-2.5 rounded-md cursor-pointer transition-colors ${
                selectedChapterId === chapter.id
                  ? "bg-bg-subtle"
                  : "hover:bg-bg-subtle-hover"
              }`}
              onClick={() => onSelectChapter(chapter.id)}
            >
              <FileText className="h-3.5 w-3.5 text-fg-muted shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="text-xs font-medium text-fg-base truncate">
                  {chapter.title}
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  <Badge
                    className={`text-[10px] px-1 py-0 border shrink-0 ${STATUS_STYLES[chapter.status] ?? STATUS_STYLES.draft}`}
                  >
                    {STATUS_LABELS[chapter.status] ?? STATUS_LABELS.draft}
                  </Badge>
                  <span className="text-[10px] text-fg-muted tabular-nums">
                    {(chapter.wordCount ?? 0).toLocaleString()}{"\uae00\uc790"}
                  </span>
                </div>
              </div>

              {/* Reorder buttons */}
              <div className="flex flex-col shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  className="p-0.5 text-fg-muted hover:text-fg-base"
                  onClick={(e) => { e.stopPropagation(); moveChapter(idx, -1); }}
                  disabled={idx === 0}
                >
                  <ChevronUp className="h-3 w-3" />
                </button>
                <button
                  className="p-0.5 text-fg-muted hover:text-fg-base"
                  onClick={(e) => { e.stopPropagation(); moveChapter(idx, 1); }}
                  disabled={idx === chapters.length - 1}
                >
                  <ChevronDown className="h-3 w-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      {/* Bottom buttons */}
      <div className="px-3 py-3 border-t border-border-strong">
        <Button
          variant="outline"
          size="sm"
          className="w-full text-xs gap-1.5 border-border-strong"
          disabled={!selectedBookId}
          onClick={() => setChapterFormOpen(true)}
        >
          <Plus className="h-3.5 w-3.5" />
          {"\uc0c8 \ud654 \ucd94\uac00"}
        </Button>
      </div>

      {/* Dialogs */}
      <BookForm
        open={bookFormOpen}
        onClose={() => setBookFormOpen(false)}
        onCreated={(newId) => {
          onSelectBook(newId);
          onSelectChapter(null);
          setBookFormOpen(false);
        }}
      />
      {selectedBookId && (
        <ChapterForm
          bookId={selectedBookId}
          open={chapterFormOpen}
          onClose={() => setChapterFormOpen(false)}
          onCreated={(newId) => {
            onSelectChapter(newId);
            setChapterFormOpen(false);
          }}
        />
      )}
    </div>
  );
}
