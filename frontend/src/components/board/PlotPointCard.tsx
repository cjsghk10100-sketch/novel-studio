import { useNovelStore } from "@/lib/novel-store";
import type { PlotPointType } from "@/lib/novel-types";
import { Badge } from "@/components/ui/badge";
import { BookOpen } from "lucide-react";

const PLOT_TYPE_COLORS: Record<string, string> = {
  setup: "bg-tag-blue-10 text-tag-blue-100 border-tag-blue-100/20",
  conflict: "bg-tag-pink-10 text-tag-pink-100 border-tag-pink-100/20",
  climax: "bg-tag-purple-10 text-tag-purple-100 border-tag-purple-100/20",
  resolution: "bg-tag-cyan-10 text-tag-cyan-100 border-tag-cyan-100/20",
};

const PLOT_TYPE_LABELS: Record<PlotPointType, string> = {
  setup: "\uc124\uc815",
  conflict: "\uac08\ub4f1",
  climax: "\uc808\uc815",
  resolution: "\uacb0\ub9d0",
};

interface PlotPointCardProps {
  plotPointId: string;
  onEdit: (id: string) => void;
}

export function PlotPointCard({ plotPointId, onEdit }: PlotPointCardProps) {
  const plotPoint = useNovelStore((s) => s.plotPoints[plotPointId]);
  const scenes = useNovelStore((s) => s.scenes);

  if (!plotPoint) return null;

  const linkedScene = plotPoint.sceneId ? scenes[plotPoint.sceneId] : null;
  const colorClass =
    PLOT_TYPE_COLORS[plotPoint.type] || PLOT_TYPE_COLORS.setup;

  return (
    <div
      className="border border-border-strong rounded-lg bg-bg-subtle p-3 cursor-pointer transition-colors hover:border-border-contrast"
      onClick={() => onEdit(plotPointId)}
    >
      <div className="flex items-start gap-2">
        <div className="flex-1 min-w-0">
          {/* Header row */}
          <div className="flex items-center gap-2 mb-1.5">
            <Badge className={`text-[10px] px-1.5 py-0 border ${colorClass}`}>
              {PLOT_TYPE_LABELS[plotPoint.type]}
            </Badge>
            <Badge
              variant="outline"
              className="shrink-0 text-[10px] px-1.5 py-0 border-border-strong text-fg-subtle"
            >
              {plotPoint.chapterNo}{"\uc7a5"}
            </Badge>
          </div>

          {/* Title */}
          <h4 className="text-sm font-semibold text-fg-base truncate mb-1">
            {plotPoint.title}
          </h4>

          {/* Notes preview */}
          {plotPoint.notes && (
            <p className="text-xs text-fg-subtle truncate mb-1.5">
              {plotPoint.notes}
            </p>
          )}

          {/* Linked scene */}
          {linkedScene && (
            <div className="flex items-center gap-1 text-xs text-fg-muted">
              <BookOpen className="h-3 w-3" />
              <span className="truncate">{linkedScene.title}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
