import { useState, useEffect } from "react";
import { useNovelStore } from "@/lib/novel-store";
import type { NarrativeThreadType, NarrativeThreadStatus } from "@/lib/novel-types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
  DialogDescription, DialogFooter,
} from "@/components/ui/dialog";

const THREAD_TYPES: { value: NarrativeThreadType; label: string }[] = [
  { value: "main_plot", label: "\uc8fc\ud50c\ub86f" },
  { value: "character_arc", label: "\uc778\ubb3c \uc544\ud06c" },
  { value: "relationship", label: "\uad00\uacc4 \uc544\ud06c" },
  { value: "mystery", label: "\ubbf8\uc2a4\ud130\ub9ac" },
  { value: "world_rule", label: "\uc138\uacc4\uad00 \uaddc\uce59" },
  { value: "foreshadow", label: "\ubcf5\uc120" },
  { value: "emotion", label: "\uac10\uc815\uc120" },
  { value: "politics", label: "\uc815\uce58/\uc138\ub825" },
  { value: "custom", label: "\uae30\ud0c0" },
];

const THREAD_STATUSES: { value: NarrativeThreadStatus; label: string }[] = [
  { value: "intro", label: "\ub3c4\uc785" },
  { value: "developing", label: "\uc804\uac1c\uc911" },
  { value: "deepening", label: "\uc2ec\ud654" },
  { value: "turning", label: "\uc804\ud658" },
  { value: "revealed", label: "\uacf5\uac1c" },
  { value: "resolved", label: "\ud68c\uc218" },
  { value: "paused", label: "\ubcf4\ub958" },
  { value: "abandoned", label: "\ud3d0\uae30" },
];

interface NarrativeThreadFormProps {
  threadId?: string | null;
  open: boolean;
  onClose: () => void;
}

export function NarrativeThreadForm({ threadId, open, onClose }: NarrativeThreadFormProps) {
  const isEdit = Boolean(threadId);
  const narrativeThreads = useNovelStore((s) => s.narrativeThreads);
  const scenes = useNovelStore((s) => s.scenes);
  const addNarrativeThread = useNovelStore((s) => s.addNarrativeThread);
  const updateNarrativeThread = useNovelStore((s) => s.updateNarrativeThread);

  const [title, setTitle] = useState("");
  const [type, setType] = useState<NarrativeThreadType>("mystery");
  const [status, setStatus] = useState<NarrativeThreadStatus>("intro");
  const [description, setDescription] = useState("");
  const [setupSceneId, setSetupSceneId] = useState<string | null>(null);
  const [payoffSceneId, setPayoffSceneId] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    if (isEdit && threadId) {
      const t = narrativeThreads[threadId];
      if (t) {
        setTitle(t.title); setType(t.type); setStatus(t.status);
        setDescription(t.description);
        setSetupSceneId(t.setupSceneId); setPayoffSceneId(t.payoffSceneId);
      }
    } else {
      setTitle(""); setType("mystery"); setStatus("intro");
      setDescription(""); setSetupSceneId(null); setPayoffSceneId(null);
    }
  }, [open, threadId, isEdit, narrativeThreads]);

  const sceneList = Object.values(scenes).sort(
    (a, b) => a.chapterNo - b.chapterNo || a.timelineIndex - b.timelineIndex,
  );

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    if (isEdit && threadId) {
      updateNarrativeThread(threadId, { title, type, status, description, setupSceneId, payoffSceneId });
    } else {
      addNarrativeThread({
        title, type, status, description, setupSceneId,
        latestSceneId: null, payoffSceneId,
        relatedCharacterIds: [], relatedEntityIds: [],
      });
    }
    onClose();
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="border-border-strong bg-bg-chat sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-fg-base">
            {isEdit ? "\uc11c\uc0ac \uc2a4\ub808\ub4dc \uc218\uc815" : "\uc0c8 \uc11c\uc0ac \uc2a4\ub808\ub4dc"}
          </DialogTitle>
          <DialogDescription className="text-fg-subtle text-xs">
            {"\uc8fc\ud50c\ub86f, \uc778\ubb3c \uc544\ud06c, \ubcf5\uc120, \ubbf8\uc2a4\ud130\ub9ac \ub4f1 \uc7a5\uae30 \uc11c\uc0ac\uc758 \ud750\ub984\uc744 \ucd94\uc801\ud569\ub2c8\ub2e4."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label className="text-xs text-fg-subtle">{"\uc81c\ubaa9"}</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)}
              placeholder={"\uc608: \ud14c\ub860\uc758 \uc720\uc5b8\uc758 \uc758\ubbf8"} className="bg-bg-subtle border-border-strong" autoFocus />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs text-fg-subtle">{"\uc720\ud615"}</Label>
              <Select value={type} onValueChange={(v) => setType(v as NarrativeThreadType)}>
                <SelectTrigger className="bg-bg-subtle border-border-strong"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {THREAD_TYPES.map((t) => (<SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-fg-subtle">{"\uc0c1\ud0dc"}</Label>
              <Select value={status} onValueChange={(v) => setStatus(v as NarrativeThreadStatus)}>
                <SelectTrigger className="bg-bg-subtle border-border-strong"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {THREAD_STATUSES.map((s) => (<SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs text-fg-subtle">{"\uc124\uba85"}</Label>
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3}
              placeholder={"\uc774 \uc2a4\ub808\ub4dc\uac00 \uc5b4\ub5a4 \uc774\uc57c\uae30\ub97c \ub2f4\uace0 \uc788\ub294\uc9c0..."} className="bg-bg-subtle border-border-strong" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs text-fg-subtle">{"\uc2dc\uc791 \uc7a5\uba74"}</Label>
              <Select value={setupSceneId ?? "__none__"} onValueChange={(v) => setSetupSceneId(v === "__none__" ? null : v)}>
                <SelectTrigger className="bg-bg-subtle border-border-strong text-xs"><SelectValue placeholder={"\uc5c6\uc74c"} /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">{"\uc5c6\uc74c"}</SelectItem>
                  {sceneList.map((s) => (<SelectItem key={s.id} value={s.id}>{s.chapterNo}{"\uc7a5"} - {s.title}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-fg-subtle">{"\uc608\uc0c1 \ud68c\uc218 \uc7a5\uba74"}</Label>
              <Select value={payoffSceneId ?? "__none__"} onValueChange={(v) => setPayoffSceneId(v === "__none__" ? null : v)}>
                <SelectTrigger className="bg-bg-subtle border-border-strong text-xs"><SelectValue placeholder={"\uc5c6\uc74c"} /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">{"\uc5c6\uc74c"}</SelectItem>
                  {sceneList.map((s) => (<SelectItem key={s.id} value={s.id}>{s.chapterNo}{"\uc7a5"} - {s.title}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={onClose} className="text-fg-subtle">{"\ucde8\uc18c"}</Button>
            <Button type="submit" disabled={!title.trim()}>
              {isEdit ? "\uc800\uc7a5" : "\uc2a4\ub808\ub4dc \uc0dd\uc131"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
