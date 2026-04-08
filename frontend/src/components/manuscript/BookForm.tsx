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

interface BookFormProps {
  bookId?: string | null;
  open: boolean;
  onClose: () => void;
  onCreated?: (bookId: string) => void;
}

export function BookForm({ bookId, open, onClose, onCreated }: BookFormProps) {
  const isEdit = Boolean(bookId);

  const books = useNovelStore((s) => s.books);
  const addBook = useNovelStore((s) => s.addBook);
  const updateBook = useNovelStore((s) => s.updateBook);

  // Form state
  const [formData, setFormData] = React.useState<Record<string, string>>({});

  // Initialize form when dialog opens or bookId changes
  React.useEffect(() => {
    if (!open) return;

    if (isEdit && bookId) {
      const book = books[bookId];
      if (!book) return;

      setFormData({
        title: book.title,
      });
    } else {
      // Reset for create
      setFormData({});
    }
  }, [open, bookId, isEdit, books]);

  const updateField = (key: string, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const data = {
      title: formData.title || "이름 없는 편",
      sortOrder: Object.keys(books).length,
    };

    if (isEdit && bookId) {
      updateBook(bookId, { title: data.title });
    } else {
      const newId = addBook(data);
      if (onCreated) onCreated(newId);
    }

    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="border-border-strong bg-bg-chat sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-fg-base">
            {isEdit ? "편 수정" : "새 편 생성"}
          </DialogTitle>
          <DialogDescription className="text-fg-subtle text-xs">
            {isEdit
              ? "아래 필드를 수정하여 편을 변경하세요."
              : "아래 필드를 채워 새 편을 생성하세요."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <FieldRow label={"제목"}>
            <Input
              value={formData.title || ""}
              onChange={(e) => updateField("title", e.target.value)}
              placeholder={"편 제목"}
              className="bg-bg-subtle border-border-strong"
              autoFocus
            />
          </FieldRow>

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={onClose} className="text-fg-subtle">
              {"취소"}
            </Button>
            <Button type="submit">
              {isEdit ? "변경사항 저장" : "편 생성"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------
// Helper layout component
// ---------------------------------------------------------------------------

function FieldRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs text-fg-subtle">{label}</Label>
      {children}
    </div>
  );
}
