import * as React from "react";
import { useNovelStore } from "@/lib/novel-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

interface ChapterFormProps {
  bookId: string;
  chapterId?: string | null;
  open: boolean;
  onClose: () => void;
  onCreated?: (chapterId: string) => void;
}

export function ChapterForm({ bookId, chapterId, open, onClose, onCreated }: ChapterFormProps) {
  const isEdit = Boolean(chapterId);

  const manuscriptChapters = useNovelStore((s) => s.manuscriptChapters);
  const getChaptersForBook = useNovelStore((s) => s.getChaptersForBook);
  const addManuscriptChapter = useNovelStore((s) => s.addManuscriptChapter);
  const updateManuscriptChapter = useNovelStore((s) => s.updateManuscriptChapter);

  const [title, setTitle] = React.useState("");

  React.useEffect(() => {
    if (!open) return;
    if (isEdit && chapterId) {
      const ch = manuscriptChapters[chapterId];
      if (ch) setTitle(ch.title);
    } else {
      const count = getChaptersForBook(bookId).length;
      setTitle(`${count + 1}\ud654`);
    }
  }, [open, chapterId, isEdit, manuscriptChapters, bookId, getChaptersForBook]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    if (isEdit && chapterId) {
      updateManuscriptChapter(chapterId, { title: title.trim() });
      onClose();
    } else {
      const sortOrder = getChaptersForBook(bookId).length;
      const newId = addManuscriptChapter({
        bookId,
        title: title.trim(),
        sortOrder,
        content: "",
        summary: "",
        status: "draft",
        linkedBoardSceneId: null,
        povCharacterId: null,
        locationId: null,
        timelineLabel: "",
      });
      if (onCreated) onCreated(newId);
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="border-border-strong bg-bg-chat sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-fg-base">
            {isEdit ? "\ud654 \uc218\uc815" : "\uc0c8 \ud654 \ub9cc\ub4e4\uae30"}
          </DialogTitle>
          <DialogDescription className="text-fg-subtle text-xs">
            {isEdit
              ? "\ud654\uc758 \uc81c\ubaa9\uc744 \uc218\uc815\ud569\ub2c8\ub2e4."
              : "\uc0c8 \ud654\ub97c \ub9cc\ub4e4\uba74 \ubc14\ub85c \uae00\uc744 \uc4f8 \uc218 \uc788\uc2b5\ub2c8\ub2e4."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label className="text-xs text-fg-subtle">{"\uc81c\ubaa9"}</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={"1\ud654: \uc81c\ubaa9\uc744 \uc785\ub825\ud558\uc138\uc694"}
              className="bg-bg-subtle border-border-strong"
              autoFocus
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={onClose} className="text-fg-subtle">
              {"\ucde8\uc18c"}
            </Button>
            <Button type="submit" disabled={!title.trim()}>
              {isEdit ? "\uc800\uc7a5" : "\ub9cc\ub4e4\uae30"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
