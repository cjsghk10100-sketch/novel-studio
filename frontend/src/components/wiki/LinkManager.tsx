import * as React from "react";
import { useNovelStore } from "@/lib/novel-store";
import type { EntityType, RelationType, Link, AnyEntity } from "@/lib/novel-types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import { Link2, Plus, X, ArrowRight } from "lucide-react";

const TYPE_COLORS: Record<EntityType, string> = {
  character: "bg-tag-blue-10 text-tag-blue-100",
  location: "bg-tag-cyan-10 text-tag-cyan-100",
  faction: "bg-tag-purple-10 text-tag-purple-100",
  item: "bg-tag-orange-10 text-tag-orange-100",
  event: "bg-tag-yellow-10 text-tag-yellow-100",
};

const TYPE_SINGULAR: Record<EntityType, string> = {
  character: "\uc778\ubb3c",
  location: "\uc9c0\uc5ed",
  faction: "\uc138\ub825",
  item: "\uc544\uc774\ud15c",
  event: "\uc0ac\uac74",
};

const ENTITY_TYPES: EntityType[] = ["character", "location", "faction", "item", "event"];

const RELATION_TYPES: RelationType[] = [
  "member_of",
  "enemy_of",
  "ally_of",
  "parent_of",
  "child_of",
  "located_in",
  "owns",
  "participated_in",
  "caused",
  "friend_of",
  "mentor_of",
  "student_of",
  "rival_of",
  "related_to",
  "leader_of",
  "serves",
  "created_by",
];

const RELATION_LABELS: Record<RelationType, string> = {
  member_of: "\uc18c\uc18d",
  enemy_of: "\uc801\ub300",
  ally_of: "\ub3d9\ub9f9",
  parent_of: "\ubd80\ubaa8",
  child_of: "\uc790\ub140",
  located_in: "\uc704\uce58",
  owns: "\uc18c\uc720",
  participated_in: "\ucc38\uc5ec",
  caused: "\uc6d0\uc778",
  friend_of: "\uce5c\uad6c",
  mentor_of: "\uc2a4\uc2b9",
  student_of: "\uc81c\uc790",
  rival_of: "\ub77c\uc774\ubc8c",
  related_to: "\uad00\ub828",
  leader_of: "\uc9c0\ub3c4\uc790",
  serves: "\ubcf5\uc885",
  created_by: "\uc81c\uc791\uc790",
};

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

function formatRelation(r: RelationType): string {
  return RELATION_LABELS[r] || r.replace(/_/g, " ");
}

interface LinkManagerProps {
  entityType: EntityType;
  entityId: string;
}

export function LinkManager({ entityType, entityId }: LinkManagerProps) {
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [targetType, setTargetType] = React.useState<EntityType>("character");
  const [targetId, setTargetId] = React.useState("");
  const [relationType, setRelationType] = React.useState<RelationType>("related_to");

  const getLinksForEntity = useNovelStore((s) => s.getLinksForEntity);
  const getBacklinks = useNovelStore((s) => s.getBacklinks);
  const addLink = useNovelStore((s) => s.addLink);
  const removeLink = useNovelStore((s) => s.removeLink);
  const getEntityById = useNovelStore((s) => s.getEntityById);

  // Subscribe to links slice to trigger re-renders
  const linksMap = useNovelStore((s) => s.links);

  // Subscribe to entity slices for target entity name lookups
  const characters = useNovelStore((s) => s.characters);
  const locations = useNovelStore((s) => s.locations);
  const factions = useNovelStore((s) => s.factions);
  const items = useNovelStore((s) => s.items);
  const events = useNovelStore((s) => s.events);

  const outgoingLinks = React.useMemo(() => {
    void linksMap;
    return getLinksForEntity(entityType, entityId);
  }, [entityType, entityId, getLinksForEntity, linksMap]);

  const backlinks = React.useMemo(() => {
    void linksMap;
    return getBacklinks(entityType, entityId);
  }, [entityType, entityId, getBacklinks, linksMap]);

  // Target entities for the dialog
  const targetEntities = React.useMemo(() => {
    const sliceKey = SLICE_KEY[targetType];
    const sliceMap = { characters, locations, factions, items, events }[sliceKey];
    return Object.values(sliceMap as Record<string, AnyEntity>).filter(
      (e) => !(targetType === entityType && e.id === entityId),
    );
  }, [targetType, entityType, entityId, characters, locations, factions, items, events]);

  const resolveEntityName = React.useCallback(
    (type: EntityType, id: string): string => {
      // Force reactivity by referencing slices
      void characters; void locations; void factions; void items; void events;
      const entity = getEntityById(type, id);
      return entity ? getEntityName(entity) : "(\uc0ad\uc81c\ub428)";
    },
    [getEntityById, characters, locations, factions, items, events],
  );

  const handleAddLink = () => {
    if (!targetId) return;
    addLink({
      fromType: entityType,
      fromId: entityId,
      toType: targetType,
      toId: targetId,
      relationType,
      weight: 1,
    });
    setDialogOpen(false);
    setTargetId("");
    setRelationType("related_to");
  };

  return (
    <div className="space-y-4">
      {/* Outgoing links */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-fg-subtle">
            {"\ub9c1\ud06c"}
          </h3>
          <Button
            variant="outline"
            size="sm"
            className="h-7 text-xs border-border-strong"
            onClick={() => setDialogOpen(true)}
          >
            <Plus className="h-3 w-3 mr-1" />
            {"\ub9c1\ud06c \ucd94\uac00"}
          </Button>
        </div>

        {outgoingLinks.length === 0 ? (
          <p className="text-xs text-fg-muted py-2">{"\ub098\uac00\ub294 \ub9c1\ud06c\uac00 \uc5c6\uc2b5\ub2c8\ub2e4."}</p>
        ) : (
          <div className="space-y-1">
            {outgoingLinks.map((link) => (
              <div
                key={link.id}
                className="flex items-center gap-2 px-2 py-1.5 rounded border border-border-strong bg-bg-subtle text-sm"
              >
                <Link2 className="h-3 w-3 text-fg-muted shrink-0" />
                <span className="text-fg-subtle text-xs">{formatRelation(link.relationType)}</span>
                <ArrowRight className="h-3 w-3 text-fg-muted shrink-0" />
                <Badge className={`${TYPE_COLORS[link.toType]} border-0 text-[10px] px-1 py-0`}>
                  {TYPE_SINGULAR[link.toType]}
                </Badge>
                <span className="text-fg-base text-xs truncate flex-1">
                  {resolveEntityName(link.toType, link.toId)}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 text-fg-muted hover:text-destructive shrink-0"
                  onClick={() => removeLink(link.id)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Backlinks */}
      <div>
        <h3 className="text-xs font-semibold uppercase tracking-wider text-fg-subtle mb-2">
          {"\ubc31\ub9c1\ud06c"}
        </h3>

        {backlinks.length === 0 ? (
          <p className="text-xs text-fg-muted py-2">{"\ub4e4\uc5b4\uc624\ub294 \ub9c1\ud06c\uac00 \uc5c6\uc2b5\ub2c8\ub2e4."}</p>
        ) : (
          <div className="space-y-1">
            {backlinks.map((link) => (
              <div
                key={link.id}
                className="flex items-center gap-2 px-2 py-1.5 rounded border border-border-strong bg-bg-subtle text-sm"
              >
                <Badge className={`${TYPE_COLORS[link.fromType]} border-0 text-[10px] px-1 py-0`}>
                  {TYPE_SINGULAR[link.fromType]}
                </Badge>
                <span className="text-fg-base text-xs truncate flex-1">
                  {resolveEntityName(link.fromType, link.fromId)}
                </span>
                <span className="text-fg-subtle text-xs">{formatRelation(link.relationType)}</span>
                <ArrowRight className="h-3 w-3 text-fg-muted shrink-0" />
                <span className="text-xs text-fg-muted">{"\uc5ec\uae30"}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add link dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="border-border-strong bg-bg-chat sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-fg-base">{"\ub9c1\ud06c \ucd94\uac00"}</DialogTitle>
            <DialogDescription className="text-fg-subtle text-xs">
              {"\uc774 \uc5d4\ud2f0\ud2f0\uc5d0\uc11c \ub2e4\ub978 \uc5d4\ud2f0\ud2f0\ub85c\uc758 \uad00\uacc4\ub97c \uc0dd\uc131\ud569\ub2c8\ub2e4."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs text-fg-subtle font-medium">{"\ub300\uc0c1 \uc720\ud615"}</label>
              <Select
                value={targetType}
                onValueChange={(v) => {
                  setTargetType(v as EntityType);
                  setTargetId("");
                }}
              >
                <SelectTrigger className="bg-bg-subtle border-border-strong">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ENTITY_TYPES.map((t) => (
                    <SelectItem key={t} value={t}>
                      {TYPE_SINGULAR[t]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs text-fg-subtle font-medium">{"\ub300\uc0c1 \uc5d4\ud2f0\ud2f0"}</label>
              <Select value={targetId} onValueChange={setTargetId}>
                <SelectTrigger className="bg-bg-subtle border-border-strong">
                  <SelectValue placeholder={"\uc5d4\ud2f0\ud2f0 \uc120\ud0dd"} />
                </SelectTrigger>
                <SelectContent>
                  {targetEntities.length === 0 ? (
                    <SelectItem value="__none" disabled>
                      {`\uc0ac\uc6a9 \uac00\ub2a5\ud55c ${TYPE_SINGULAR[targetType]}\uc774(\uac00) \uc5c6\uc2b5\ub2c8\ub2e4`}
                    </SelectItem>
                  ) : (
                    targetEntities.map((e) => (
                      <SelectItem key={e.id} value={e.id}>
                        {getEntityName(e)}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs text-fg-subtle font-medium">{"\uad00\uacc4 \uc720\ud615"}</label>
              <Select
                value={relationType}
                onValueChange={(v) => setRelationType(v as RelationType)}
              >
                <SelectTrigger className="bg-bg-subtle border-border-strong">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {RELATION_TYPES.map((r) => (
                    <SelectItem key={r} value={r}>
                      {formatRelation(r)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="ghost" onClick={() => setDialogOpen(false)} className="text-fg-subtle">
              {"\ucde8\uc18c"}
            </Button>
            <Button onClick={handleAddLink} disabled={!targetId}>
              {"\ub9c1\ud06c \ucd94\uac00"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
