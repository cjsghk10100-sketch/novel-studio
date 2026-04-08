import { useState, useEffect } from "react";
import { useNovelStore } from "@/lib/novel-store";
import type { PlotPoint, PlotPointType } from "@/lib/novel-types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface PlotPointFormProps {
  plotPointId?: string;
  open: boolean;
  onClose: () => void;
}

type PlotPointFormData = Omit<PlotPoint, "id" | "createdAt" | "updatedAt">;

const EMPTY_FORM: PlotPointFormData = {
  title: "",
  type: "setup",
  chapterNo: 1,
  notes: "",
  sceneId: null,
};

const PLOT_TYPES: { value: PlotPointType; label: string }[] = [
  { value: "setup", label: "\uc124\uc815" },
  { value: "conflict", label: "\uac08\ub4f1" },
  { value: "climax", label: "\uc808\uc815" },
  { value: "resolution", label: "\uacb0\ub9d0" },
];

export function PlotPointForm({
  plotPointId,
  open,
  onClose,
}: PlotPointFormProps) {
  const plotPoint = useNovelStore((s) =>
    plotPointId ? s.plotPoints[plotPointId] : undefined
  );
  const scenes = useNovelStore((s) => s.scenes);
  const addPlotPoint = useNovelStore((s) => s.addPlotPoint);
  const updatePlotPoint = useNovelStore((s) => s.updatePlotPoint);

  const [form, setForm] = useState<PlotPointFormData>(EMPTY_FORM);

  useEffect(() => {
    if (plotPoint) {
      setForm({
        title: plotPoint.title,
        type: plotPoint.type,
        chapterNo: plotPoint.chapterNo,
        notes: plotPoint.notes,
        sceneId: plotPoint.sceneId,
      });
    } else {
      setForm(EMPTY_FORM);
    }
  }, [plotPoint, open]);

  function handleSubmit() {
    if (!form.title.trim()) return;

    if (plotPointId) {
      updatePlotPoint(plotPointId, form);
    } else {
      addPlotPoint(form);
    }
    onClose();
  }

  const sceneList = Object.values(scenes).sort(
    (a, b) => a.chapterNo - b.chapterNo || a.timelineIndex - b.timelineIndex
  );

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-fg-base">
            {plotPointId ? "\ud50c\ub86f \ud3ec\uc778\ud2b8 \uc218\uc815" : "\uc0c8 \ud50c\ub86f \ud3ec\uc778\ud2b8"}
          </DialogTitle>
          <DialogDescription className="text-fg-subtle">
            {plotPointId
              ? "\uc774 \ud50c\ub86f \ud3ec\uc778\ud2b8\uc758 \uc138\ubd80 \uc815\ubcf4\ub97c \uc218\uc815\ud569\ub2c8\ub2e4."
              : "\uc2a4\ud1a0\ub9ac\uc758 \uc0c8 \ud50c\ub86f \ud3ec\uc778\ud2b8\ub97c \uc815\uc758\ud569\ub2c8\ub2e4."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Title */}
          <div className="space-y-1.5">
            <Label htmlFor="pp-title" className="text-fg-base">
              {"\uc81c\ubaa9"}
            </Label>
            <Input
              id="pp-title"
              value={form.title}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, title: e.target.value }))
              }
              placeholder={"\ud50c\ub86f \ud3ec\uc778\ud2b8 \uc81c\ubaa9"}
            />
          </div>

          {/* Type and Chapter row */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-fg-base">{"\uc720\ud615"}</Label>
              <Select
                value={form.type}
                onValueChange={(val) =>
                  setForm((prev) => ({
                    ...prev,
                    type: val as PlotPointType,
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PLOT_TYPES.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="pp-chapter" className="text-fg-base">
                {"\ucc55\ud130"}
              </Label>
              <Input
                id="pp-chapter"
                type="number"
                min={1}
                value={form.chapterNo}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    chapterNo: parseInt(e.target.value, 10) || 1,
                  }))
                }
              />
            </div>
          </div>

          {/* Linked Scene */}
          <div className="space-y-1.5">
            <Label className="text-fg-base">{"\uc5f0\uacb0\ub41c \uc7a5\uba74"}</Label>
            <Select
              value={form.sceneId ?? "__none__"}
              onValueChange={(val) =>
                setForm((prev) => ({
                  ...prev,
                  sceneId: val === "__none__" ? null : val,
                }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder={"\uc5f0\uacb0\ub41c \uc7a5\uba74 \uc5c6\uc74c"} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__none__">{"\uc5f0\uacb0\ub41c \uc7a5\uba74 \uc5c6\uc74c"}</SelectItem>
                {sceneList.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.chapterNo}{"\uc7a5"} - {s.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <Label htmlFor="pp-notes" className="text-fg-base">
              {"\uba54\ubaa8"}
            </Label>
            <Textarea
              id="pp-notes"
              rows={4}
              value={form.notes}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, notes: e.target.value }))
              }
              placeholder={"\uc774 \ud50c\ub86f \ud3ec\uc778\ud2b8\uc5d0 \ub300\ud55c \ucd94\uac00 \uba54\ubaa8..."}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            {"\ucde8\uc18c"}
          </Button>
          <Button onClick={handleSubmit} disabled={!form.title.trim()}>
            {plotPointId ? "\ubcc0\uacbd\uc0ac\ud56d \uc800\uc7a5" : "\ud50c\ub86f \ud3ec\uc778\ud2b8 \uc0dd\uc131"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
