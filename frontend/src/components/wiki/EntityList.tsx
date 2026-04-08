import * as React from "react";
import { useNovelStore } from "@/lib/novel-store";
import type { EntityType, AnyEntity } from "@/lib/novel-types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus, Search } from "lucide-react";

// Entity type to display name map
const TYPE_LABELS: Record<EntityType, string> = {
  character: "\uc778\ubb3c",
  location: "\uc9c0\uc5ed",
  faction: "\uc138\ub825",
  item: "\uc544\uc774\ud15c",
  event: "\uc0ac\uac74",
};

// Tag colors per type (static - no dynamic Tailwind)
const TYPE_COLORS: Record<EntityType, string> = {
  character: "bg-tag-blue-10 text-tag-blue-100",
  location: "bg-tag-cyan-10 text-tag-cyan-100",
  faction: "bg-tag-purple-10 text-tag-purple-100",
  item: "bg-tag-orange-10 text-tag-orange-100",
  event: "bg-tag-yellow-10 text-tag-yellow-100",
};

// Slice key mapping
const SLICE_KEY: Record<EntityType, "characters" | "locations" | "factions" | "items" | "events"> = {
  character: "characters",
  location: "locations",
  faction: "factions",
  item: "items",
  event: "events",
};

function getEntityName(entity: AnyEntity): string {
  if ("title" in entity) return entity.title;
  return (entity as { name: string }).name;
}

function getKeyAttribute(entityType: EntityType, entity: AnyEntity): string {
  switch (entityType) {
    case "character": {
      const c = entity as { role: string; age: number | null };
      const parts: string[] = [];
      if (c.role) parts.push(c.role);
      if (c.age !== null) parts.push(`${c.age}\uc138`);
      return parts.join(" / ") || "--";
    }
    case "location": {
      const l = entity as { type: string };
      return l.type || "--";
    }
    case "faction": {
      const f = entity as { ideology: string };
      return f.ideology || "--";
    }
    case "item": {
      const i = entity as { category: string };
      return i.category || "--";
    }
    case "event": {
      const e = entity as { timelineIndex: number };
      return `${e.timelineIndex}\ub144`;
    }
    default:
      return "--";
  }
}

function formatDate(ts: number): string {
  return new Date(ts).toLocaleDateString("ko-KR", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

interface EntityListProps {
  entityType: EntityType;
  onSelect: (id: string) => void;
  onCreate?: () => void;
  selectedId?: string | null;
}

export function EntityList({ entityType, onSelect, onCreate, selectedId }: EntityListProps) {
  const [filter, setFilter] = React.useState("");
  const sliceKey = SLICE_KEY[entityType];
  const entitiesMap = useNovelStore((s) => s[sliceKey]);

  const entities = React.useMemo(() => {
    const all = Object.values(entitiesMap) as AnyEntity[];
    const q = filter.toLowerCase().trim();
    if (!q) return all.sort((a, b) => b.createdAt - a.createdAt);
    return all
      .filter((e) => {
        const name = getEntityName(e).toLowerCase();
        const attr = getKeyAttribute(entityType, e).toLowerCase();
        return name.includes(q) || attr.includes(q);
      })
      .sort((a, b) => b.createdAt - a.createdAt);
  }, [entitiesMap, filter, entityType]);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-border-strong">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-fg-subtle">
          {TYPE_LABELS[entityType]}
        </h2>
        <Badge className={`${TYPE_COLORS[entityType]} border-0 text-[10px] px-1.5 py-0`}>
          {entities.length}
        </Badge>
      </div>

      {/* Search + New */}
      <div className="flex items-center gap-2 px-3 py-2 border-b border-border-strong">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-fg-muted" />
          <Input
            placeholder={`${TYPE_LABELS[entityType]} \ud544\ud130...`}
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="h-8 pl-8 text-xs bg-bg-subtle border-border-strong"
          />
        </div>
        {onCreate && (
          <Button
            variant="outline"
            size="sm"
            onClick={onCreate}
            className="h-8 px-2 border-border-strong"
          >
            <Plus className="h-3.5 w-3.5" />
            <span className="sr-only">{"\uc0c8\ub85c \ub9cc\ub4e4\uae30"}</span>
          </Button>
        )}
      </div>

      {/* Entity list */}
      <ScrollArea className="flex-1">
        {entities.length === 0 ? (
          <div className="px-3 py-8 text-center text-fg-muted text-xs">
            {filter
              ? `\ud544\ud130\uc640 \uc77c\uce58\ud558\ub294 ${TYPE_LABELS[entityType]}\uc774(\uac00) \uc5c6\uc2b5\ub2c8\ub2e4.`
              : `\uc544\uc9c1 ${TYPE_LABELS[entityType]}\uc774(\uac00) \uc5c6\uc2b5\ub2c8\ub2e4. \ud558\ub098 \uc0dd\uc131\ud574 \ubcf4\uc138\uc694.`}
          </div>
        ) : (
          <div className="divide-y divide-border-strong">
            {entities.map((entity) => {
              const name = getEntityName(entity);
              const attr = getKeyAttribute(entityType, entity);
              const isSelected = selectedId === entity.id;

              return (
                <button
                  key={entity.id}
                  onClick={() => onSelect(entity.id)}
                  className={`w-full text-left px-3 py-2.5 flex items-center gap-3 transition-colors hover:bg-bg-subtle-hover ${
                    isSelected ? "bg-bg-subtle" : ""
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-fg-base truncate">
                      {name}
                    </div>
                    <div className="text-xs text-fg-subtle truncate mt-0.5">
                      {attr}
                    </div>
                  </div>
                  <div className="text-[10px] text-fg-muted whitespace-nowrap">
                    {formatDate(entity.createdAt)}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
