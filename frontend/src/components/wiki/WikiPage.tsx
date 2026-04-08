import * as React from "react";
import { useNovelStore } from "@/lib/novel-store";
import type { EntityType, AnyEntity } from "@/lib/novel-types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { EntityList } from "@/components/wiki/EntityList";
import { EntityDetail } from "@/components/wiki/EntityDetail";
import { EntityForm } from "@/components/wiki/EntityForm";
import {
  Users,
  MapPin,
  Shield,
  Package,
  CalendarClock,
  Search,
  BookOpen,
} from "lucide-react";

const ENTITY_TYPES: EntityType[] = ["character", "location", "faction", "item", "event"];

const TYPE_LABELS: Record<EntityType, string> = {
  character: "\uc778\ubb3c",
  location: "\uc9c0\uc5ed",
  faction: "\uc138\ub825",
  item: "\uc544\uc774\ud15c",
  event: "\uc0ac\uac74",
};

const TYPE_ICONS: Record<EntityType, React.ReactNode> = {
  character: <Users className="h-4 w-4" />,
  location: <MapPin className="h-4 w-4" />,
  faction: <Shield className="h-4 w-4" />,
  item: <Package className="h-4 w-4" />,
  event: <CalendarClock className="h-4 w-4" />,
};

const TYPE_COLORS: Record<EntityType, string> = {
  character: "bg-tag-blue-10 text-tag-blue-100",
  location: "bg-tag-cyan-10 text-tag-cyan-100",
  faction: "bg-tag-purple-10 text-tag-purple-100",
  item: "bg-tag-orange-10 text-tag-orange-100",
  event: "bg-tag-yellow-10 text-tag-yellow-100",
};

function getEntityName(entity: AnyEntity): string {
  if ("title" in entity) return entity.title;
  return (entity as { name: string }).name;
}

export function WikiPage() {
  const [activeType, setActiveType] = React.useState<EntityType>("character");
  const [selectedId, setSelectedId] = React.useState<string | null>(null);
  const [formOpen, setFormOpen] = React.useState(false);
  const [globalSearch, setGlobalSearch] = React.useState("");

  const searchEntities = useNovelStore((s) => s.searchEntities);

  // Global search results
  const searchResults = React.useMemo(() => {
    if (!globalSearch.trim()) return null;
    return searchEntities(globalSearch).filter(
      (r) => ENTITY_TYPES.includes(r.type as EntityType),
    );
  }, [globalSearch, searchEntities]);

  const handleSelectEntity = (id: string) => {
    setSelectedId(id);
    setGlobalSearch("");
  };

  const handleBack = () => {
    setSelectedId(null);
  };

  return (
    <div className="flex flex-col h-full bg-bg-chat">
      {/* Top bar with global search */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-border-strong">
        <BookOpen className="h-5 w-5 text-fg-subtle shrink-0" />
        <h1 className="text-sm font-semibold text-fg-base whitespace-nowrap">{"\uc138\uacc4\uad00 \uc704\ud0a4"}</h1>
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-fg-muted" />
          <Input
            placeholder={"\ubaa8\ub4e0 \uc5d4\ud2f0\ud2f0 \uac80\uc0c9..."}
            value={globalSearch}
            onChange={(e) => setGlobalSearch(e.target.value)}
            className="h-8 pl-8 text-xs bg-bg-subtle border-border-strong"
          />
          {/* Global search results dropdown */}
          {searchResults && searchResults.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 z-50 border border-border-strong rounded-md bg-bg-chat overflow-hidden">
              <ScrollArea className="max-h-64">
                {searchResults.map((r) => {
                  const entityType = r.type as EntityType;
                  const entity = r.entity as AnyEntity;
                  return (
                    <button
                      key={entity.id}
                      className="w-full text-left px-3 py-2 flex items-center gap-2 hover:bg-bg-subtle-hover transition-colors"
                      onClick={() => {
                        setActiveType(entityType);
                        handleSelectEntity(entity.id);
                      }}
                    >
                      <Badge
                        className={`${TYPE_COLORS[entityType]} border-0 text-[10px] px-1 py-0`}
                      >
                        {TYPE_LABELS[entityType]}
                      </Badge>
                      <span className="text-sm text-fg-base truncate">
                        {getEntityName(entity)}
                      </span>
                    </button>
                  );
                })}
              </ScrollArea>
            </div>
          )}
          {searchResults && searchResults.length === 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 z-50 border border-border-strong rounded-md bg-bg-chat px-3 py-4 text-center text-xs text-fg-muted">
              {"\uac80\uc0c9 \uacb0\uacfc\uac00 \uc5c6\uc2b5\ub2c8\ub2e4."}
            </div>
          )}
        </div>
      </div>

      {/* Main content: sidebar + detail */}
      <div className="flex flex-1 min-h-0 flex-col md:flex-row">
        {/* Left panel */}
        <div className="w-full md:w-80 lg:w-96 border-b md:border-b-0 md:border-r border-border-strong flex flex-col shrink-0">
          {/* Entity type tabs */}
          <div className="flex border-b border-border-strong overflow-x-auto">
            {ENTITY_TYPES.map((type) => {
              const isActive = activeType === type;
              return (
                <button
                  key={type}
                  onClick={() => {
                    setActiveType(type);
                    setSelectedId(null);
                  }}
                  className={`flex items-center gap-1.5 px-3 py-2.5 text-xs font-medium whitespace-nowrap transition-colors border-b-2 ${
                    isActive
                      ? "border-fg-base text-fg-base"
                      : "border-transparent text-fg-subtle hover:text-fg-base hover:bg-bg-subtle-hover"
                  }`}
                >
                  {TYPE_ICONS[type]}
                  <span className="hidden sm:inline">{TYPE_LABELS[type]}</span>
                </button>
              );
            })}
          </div>

          {/* Entity list */}
          <div className="flex-1 min-h-0">
            <EntityList
              entityType={activeType}
              onSelect={handleSelectEntity}
              onCreate={() => setFormOpen(true)}
              selectedId={selectedId}
            />
          </div>
        </div>

        {/* Right panel */}
        <div className="flex-1 min-h-0">
          {selectedId ? (
            <EntityDetail
              entityType={activeType}
              entityId={selectedId}
              onBack={handleBack}
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center px-4">
              <div className="w-12 h-12 rounded-full bg-bg-subtle flex items-center justify-center mb-3">
                <BookOpen className="h-6 w-6 text-fg-muted" />
              </div>
              <p className="text-sm text-fg-subtle mb-1">{"\uc120\ud0dd\ub41c \uc5d4\ud2f0\ud2f0\uac00 \uc5c6\uc2b5\ub2c8\ub2e4"}</p>
              <p className="text-xs text-fg-muted max-w-xs">
                {"\uc67c\ucabd \ubaa9\ub85d\uc5d0\uc11c \uc5d4\ud2f0\ud2f0\ub97c \uc120\ud0dd\ud558\uac70\ub098, \uc704\uc758 \uac80\uc0c9\ucc3d\uc744 \uc0ac\uc6a9\ud574 \ubaa8\ub4e0 \uc720\ud615\uc5d0\uc11c \ucc3e\uc744 \uc218 \uc788\uc2b5\ub2c8\ub2e4."}
              </p>
              <Button
                variant="outline"
                size="sm"
                className="mt-4 border-border-strong text-xs"
                onClick={() => setFormOpen(true)}
              >
                {TYPE_LABELS[activeType]} {"\uc0dd\uc131\ud558\uae30"}
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Create/Edit form dialog */}
      <EntityForm
        entityType={activeType}
        open={formOpen}
        onClose={() => setFormOpen(false)}
      />
    </div>
  );
}
