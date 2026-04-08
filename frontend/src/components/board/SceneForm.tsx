import { useState, useEffect, useCallback } from "react";
import { useNovelStore } from "@/lib/novel-store";
import type { Scene } from "@/lib/novel-types";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
  DialogFooter, DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { X } from "lucide-react";

const POV_NONE = "__none__";

interface SceneFormProps { sceneId?: string; open: boolean; onClose: () => void }

type SceneFormData = Omit<Scene, "id" | "createdAt" | "updatedAt">;

const EMPTY_FORM: SceneFormData = {
  title: "", chapterNo: 1, actNo: 1, timelineIndex: 0,
  summary: "", draftText: "",
  characterIds: [], locationIds: [], itemIds: [],
  povCharacterId: null,
  goal: "", conflict: "", turn: "", outcome: "",
  emotionalShiftFrom: "", emotionalShiftTo: "",
  emotionalShift: "", infoRevealed: "", hookEnd: "",
  threadIds: [],
  manuscriptStatus: "planned",
  wordCount: 0,
};

/* Reusable checkbox multi-select block */
function MultiCheck<T extends { id: string }>({
  label, items, selected, badgeCls, toggle, renderLabel, renderMeta,
}: {
  label: string;
  items: T[];
  selected: string[];
  badgeCls: string;
  toggle: (id: string) => void;
  renderLabel: (item: T) => string;
  renderMeta?: (item: T) => string;
}) {
  if (items.length === 0) return null;
  return (
    <div className="space-y-1.5">
      <Label className="text-fg-base">{label}</Label>
      <div className="border border-border-strong rounded-md p-2 max-h-36 overflow-y-auto">
        {selected.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2">
            {selected.map((id) => {
              const item = items.find((i) => i.id === id);
              if (!item) return null;
              return (
                <Badge key={id} className={`text-[10px] px-1.5 py-0 ${badgeCls} gap-1 cursor-pointer`} onClick={() => toggle(id)}>
                  {renderLabel(item)}<X className="h-2.5 w-2.5" />
                </Badge>
              );
            })}
          </div>
        )}
        {items.map((item) => (
          <label key={item.id} className="flex items-center gap-2 py-1 px-1 rounded hover:bg-bg-subtle cursor-pointer text-xs text-fg-base">
            <input type="checkbox" checked={selected.includes(item.id)} onChange={() => toggle(item.id)} className="accent-brand-100" />
            {renderLabel(item)}
            {renderMeta && <span className="text-fg-muted ml-auto">{renderMeta(item)}</span>}
          </label>
        ))}
      </div>
    </div>
  );
}

export function SceneForm({ sceneId, open, onClose }: SceneFormProps) {
  const scene = useNovelStore((s) => (sceneId ? s.scenes[sceneId] : undefined));
  const characters = useNovelStore((s) => s.characters);
  const locations = useNovelStore((s) => s.locations);
  const items = useNovelStore((s) => s.items);
  const narrativeThreads = useNovelStore((s) => s.narrativeThreads);
  const addScene = useNovelStore((s) => s.addScene);
  const updateScene = useNovelStore((s) => s.updateScene);

  const [form, setForm] = useState<SceneFormData>(EMPTY_FORM);

  useEffect(() => {
    if (scene) {
      setForm({
        title: scene.title, chapterNo: scene.chapterNo,
        actNo: scene.actNo, timelineIndex: scene.timelineIndex,
        summary: scene.summary, draftText: scene.draftText,
        characterIds: [...scene.characterIds],
        locationIds: [...scene.locationIds],
        itemIds: [...scene.itemIds],
        povCharacterId: scene.povCharacterId ?? null,
        goal: scene.goal ?? "", conflict: scene.conflict ?? "",
        turn: scene.turn ?? "",
        outcome: scene.outcome ?? "",
        emotionalShiftFrom: scene.emotionalShiftFrom ?? "",
        emotionalShiftTo: scene.emotionalShiftTo ?? "",
        emotionalShift: scene.emotionalShift ?? "",
        infoRevealed: scene.infoRevealed ?? "", hookEnd: scene.hookEnd ?? "",
        threadIds: [...(scene.threadIds ?? [])],
        manuscriptStatus: scene.manuscriptStatus ?? "planned",
        wordCount: scene.wordCount ?? 0,
      });
    } else {
      setForm(EMPTY_FORM);
    }
  }, [scene, open]);

  const setField = useCallback(
    <K extends keyof SceneFormData>(key: K, value: SceneFormData[K]) => {
      setForm((prev) => ({ ...prev, [key]: value }));
    }, []
  );

  const toggleId = useCallback(
    (field: "characterIds" | "locationIds" | "itemIds" | "threadIds", id: string) => {
      setForm((prev) => {
        const arr = prev[field];
        return { ...prev, [field]: arr.includes(id) ? arr.filter((x) => x !== id) : [...arr, id] };
      });
    }, []
  );

  function handleSubmit() {
    if (!form.title.trim()) return;
    if (sceneId) updateScene(sceneId, form);
    else addScene(form);
    onClose();
  }

  const characterList = Object.values(characters);
  const locationList = Object.values(locations);
  const itemList = Object.values(items);
  const threadList = Object.values(narrativeThreads);

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-fg-base">
            {sceneId ? "장면 수정" : "새 장면 생성"}
          </DialogTitle>
          <DialogDescription className="text-fg-subtle">
            {sceneId ? "이 장면의 세부 정보를 수정합니다." : "세부 정보를 입력하여 새 장면을 생성합니다."}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 pr-4 -mr-4">
          <div className="space-y-4 pb-2">
            {/* 제목 */}
            <div className="space-y-1.5">
              <Label htmlFor="scene-title" className="text-fg-base">제목</Label>
              <Input id="scene-title" value={form.title} onChange={(e) => setField("title", e.target.value)} placeholder="장면 제목" />
            </div>

            {/* 챕터 / 막 / 타임라인 */}
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="scene-chapter" className="text-fg-base">챕터</Label>
                <Input id="scene-chapter" type="number" min={1} value={form.chapterNo} onChange={(e) => setField("chapterNo", parseInt(e.target.value, 10) || 1)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="scene-act" className="text-fg-base">막</Label>
                <Input id="scene-act" type="number" min={1} value={form.actNo} onChange={(e) => setField("actNo", parseInt(e.target.value, 10) || 1)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="scene-timeline" className="text-fg-base">타임라인 인덱스</Label>
                <Input id="scene-timeline" type="number" min={0} value={form.timelineIndex} onChange={(e) => setField("timelineIndex", parseInt(e.target.value, 10) || 0)} />
              </div>
            </div>

            {/* 요약 */}
            <div className="space-y-1.5">
              <Label htmlFor="scene-summary" className="text-fg-base">요약</Label>
              <Textarea id="scene-summary" rows={3} value={form.summary} onChange={(e) => setField("summary", e.target.value)} placeholder="장면의 간략한 요약..." />
            </div>

            {/* 시점 인물 (POV) */}
            <div className="space-y-1.5">
              <Label className="text-fg-base">시점 인물 (POV)</Label>
              <Select value={form.povCharacterId ?? POV_NONE} onValueChange={(v) => setField("povCharacterId", v === POV_NONE ? null : v)}>
                <SelectTrigger><SelectValue placeholder="없음" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value={POV_NONE}>없음</SelectItem>
                  {characterList.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* 소설 집필 필드 - 2열 그리드 */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-fg-base">장면 목표</Label>
                <Input value={form.goal} onChange={(e) => setField("goal", e.target.value)} placeholder="이 장면에서 달성할 것" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-fg-base">갈등</Label>
                <Input value={form.conflict} onChange={(e) => setField("conflict", e.target.value)} placeholder="핵심 갈등 요소" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-fg-base">결과</Label>
                <Input value={form.outcome} onChange={(e) => setField("outcome", e.target.value)} placeholder="장면의 결과" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-fg-base">감정 변화</Label>
                <Input value={form.emotionalShift} onChange={(e) => setField("emotionalShift", e.target.value)} placeholder="불안 -> 결의" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-fg-base">정보 공개</Label>
                <Input value={form.infoRevealed} onChange={(e) => setField("infoRevealed", e.target.value)} placeholder="독자에게 공개되는 정보" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-fg-base">장면 끝 후크</Label>
                <Input value={form.hookEnd} onChange={(e) => setField("hookEnd", e.target.value)} placeholder="다음 장면으로 이끄는 후크" />
              </div>
            </div>

            {/* 초고 */}
            <div className="space-y-1.5">
              <Label htmlFor="scene-draft" className="text-fg-base">초고</Label>
              <Textarea id="scene-draft" rows={5} value={form.draftText} onChange={(e) => setField("draftText", e.target.value)} placeholder="장면 초고를 작성하세요..." className="font-mono text-xs" />
            </div>

            {/* 등장인물 */}
            <MultiCheck label="등장인물" items={characterList} selected={form.characterIds}
              badgeCls="bg-tag-blue-10 text-tag-blue-100 border-tag-blue-100/20"
              toggle={(id) => toggleId("characterIds", id)}
              renderLabel={(c) => c.name} renderMeta={(c) => c.role} />

            {/* 장소 */}
            <MultiCheck label="장소" items={locationList} selected={form.locationIds}
              badgeCls="bg-tag-cyan-10 text-tag-cyan-100 border-tag-cyan-100/20"
              toggle={(id) => toggleId("locationIds", id)}
              renderLabel={(l) => l.name} renderMeta={(l) => l.type} />

            {/* 아이템 */}
            <MultiCheck label="아이템" items={itemList} selected={form.itemIds}
              badgeCls="bg-tag-orange-10 text-tag-orange-100 border-tag-orange-100/20"
              toggle={(id) => toggleId("itemIds", id)}
              renderLabel={(i) => i.name} renderMeta={(i) => i.category} />

            {/* 서사 스레드 */}
            <MultiCheck label="서사 스레드" items={threadList} selected={form.threadIds}
              badgeCls="bg-tag-blue-10 text-tag-blue-100 border-tag-blue-100/20"
              toggle={(id) => toggleId("threadIds", id)}
              renderLabel={(t) => t.title} renderMeta={(t) => t.status} />
          </div>
        </ScrollArea>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>취소</Button>
          <Button onClick={handleSubmit} disabled={!form.title.trim()}>
            {sceneId ? "변경사항 저장" : "장면 생성"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
