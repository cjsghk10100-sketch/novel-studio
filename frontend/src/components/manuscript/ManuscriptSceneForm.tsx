import * as React from "react";
import { useNovelStore } from "@/lib/novel-store";
import type { ManuscriptSceneStatus } from "@/lib/novel-types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ManuscriptSceneFormProps {
  bookId: string;
  chapterId: string;
  sceneId?: string | null;
  open: boolean;
  onClose: () => void;
  onCreated?: (sceneId: string) => void;
}

const STATUS_OPTIONS: { value: ManuscriptSceneStatus; label: string }[] = [
  { value: "draft", label: "초안" },
  { value: "writing", label: "작성중" },
  { value: "review", label: "검토중" },
  { value: "complete", label: "완료" },
];

// Sentinel value for "none" selections in Radix Select (which does not allow empty string)
const NONE_VALUE = "__none__";

export function ManuscriptSceneForm({
  bookId,
  chapterId,
  sceneId,
  open,
  onClose,
  onCreated,
}: ManuscriptSceneFormProps) {
  const isEdit = Boolean(sceneId);

  // Store selectors
  const manuscriptScenes = useNovelStore((s) => s.manuscriptScenes);
  const characters = useNovelStore((s) => s.characters);
  const locations = useNovelStore((s) => s.locations);
  const scenes = useNovelStore((s) => s.scenes);
  const getScenesForChapter = useNovelStore((s) => s.getScenesForChapter);
  const addManuscriptScene = useNovelStore((s) => s.addManuscriptScene);
  const updateManuscriptScene = useNovelStore((s) => s.updateManuscriptScene);

  // Form state
  const [title, setTitle] = React.useState("");
  const [status, setStatus] = React.useState<ManuscriptSceneStatus>("draft");
  const [povCharacterId, setPovCharacterId] = React.useState<string | null>(null);
  const [locationId, setLocationId] = React.useState<string | null>(null);
  const [timelineLabel, setTimelineLabel] = React.useState("");
  const [linkedBoardSceneId, setLinkedBoardSceneId] = React.useState<string | null>(null);

  // Initialize form when dialog opens or sceneId changes
  React.useEffect(() => {
    if (!open) return;

    if (isEdit && sceneId) {
      const scene = manuscriptScenes[sceneId];
      if (!scene) return;

      setTitle(scene.title);
      setStatus(scene.status);
      setPovCharacterId(scene.povCharacterId);
      setLocationId(scene.locationId);
      setTimelineLabel(scene.timelineLabel);
      setLinkedBoardSceneId(scene.linkedBoardSceneId);
    } else {
      // Reset for create
      setTitle("");
      setStatus("draft");
      setPovCharacterId(null);
      setLocationId(null);
      setTimelineLabel("");
      setLinkedBoardSceneId(null);
    }
  }, [open, sceneId, isEdit, manuscriptScenes]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    if (isEdit && sceneId) {
      updateManuscriptScene(sceneId, {
        title: title.trim(),
        status,
        povCharacterId,
        locationId,
        timelineLabel,
        linkedBoardSceneId,
      });
    } else {
      const sortOrder = getScenesForChapter(chapterId).length;
      const newId = addManuscriptScene({
        bookId,
        chapterId,
        title: title.trim(),
        sortOrder,
        status,
        povCharacterId,
        locationId,
        timelineLabel,
        linkedBoardSceneId,
        content: "",
        summary: "",
        goal: "",
        conflict: "",
        outcome: "",
      });
      if (onCreated) onCreated(newId);
    }

    onClose();
  };

  // Derived lists
  const characterList = Object.values(characters);
  const locationList = Object.values(locations);
  const boardSceneList = Object.values(scenes).sort(
    (a, b) => a.chapterNo - b.chapterNo || a.actNo - b.actNo
  );

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="border-border-strong bg-bg-chat sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-fg-base">
            {isEdit ? "장면 수정" : "새 장면 생성"}
          </DialogTitle>
          <DialogDescription className="text-fg-subtle text-xs">
            {isEdit
              ? "아래 필드를 수정하여 장면을 변경하세요."
              : "아래 필드를 채워 새 장면을 생성하세요."}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh]">
          <form id="manuscript-scene-form" onSubmit={handleSubmit} className="space-y-4 pr-4">
            {/* 제목 */}
            <FieldRow label="제목">
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="장면 제목"
                className="bg-bg-subtle border-border-strong"
                autoFocus
              />
            </FieldRow>

            {/* 상태 */}
            <FieldRow label="상태">
              <Select value={status} onValueChange={(v) => setStatus(v as ManuscriptSceneStatus)}>
                <SelectTrigger className="bg-bg-subtle border-border-strong">
                  <SelectValue placeholder="상태 선택" />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FieldRow>

            {/* POV 인물 */}
            <FieldRow label="POV 인물">
              <Select
                value={povCharacterId ?? NONE_VALUE}
                onValueChange={(v) => setPovCharacterId(v === NONE_VALUE ? null : v)}
              >
                <SelectTrigger className="bg-bg-subtle border-border-strong">
                  <SelectValue placeholder="없음" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={NONE_VALUE}>{"없음"}</SelectItem>
                  {characterList.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FieldRow>

            {/* 장소 */}
            <FieldRow label="장소">
              <Select
                value={locationId ?? NONE_VALUE}
                onValueChange={(v) => setLocationId(v === NONE_VALUE ? null : v)}
              >
                <SelectTrigger className="bg-bg-subtle border-border-strong">
                  <SelectValue placeholder="없음" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={NONE_VALUE}>{"없음"}</SelectItem>
                  {locationList.map((l) => (
                    <SelectItem key={l.id} value={l.id}>
                      {l.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FieldRow>

            {/* 시간선 */}
            <FieldRow label="시간선">
              <Input
                value={timelineLabel}
                onChange={(e) => setTimelineLabel(e.target.value)}
                placeholder="예: 3일차 오후"
                className="bg-bg-subtle border-border-strong"
              />
            </FieldRow>

            {/* 구성 보드 장면 연결 */}
            <FieldRow label="구성 보드 장면 연결">
              <Select
                value={linkedBoardSceneId ?? NONE_VALUE}
                onValueChange={(v) => setLinkedBoardSceneId(v === NONE_VALUE ? null : v)}
              >
                <SelectTrigger className="bg-bg-subtle border-border-strong">
                  <SelectValue placeholder="연결 없음" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={NONE_VALUE}>{"연결 없음"}</SelectItem>
                  {boardSceneList.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {`${s.chapterNo}장 - ${s.title}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FieldRow>
          </form>
        </ScrollArea>

        <DialogFooter>
          <Button type="button" variant="ghost" onClick={onClose} className="text-fg-subtle">
            {"취소"}
          </Button>
          <Button type="submit" form="manuscript-scene-form" disabled={!title.trim()}>
            {isEdit ? "변경사항 저장" : "장면 생성"}
          </Button>
        </DialogFooter>
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
