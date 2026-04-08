import * as React from "react";
import { useNovelStore } from "@/lib/novel-store";
import type {
  EntityType,
  Character,
  Location,
  Faction,
  Item,
  WorldEvent,
  Link,
  AnyEntity,
} from "@/lib/novel-types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { LinkManager } from "@/components/wiki/LinkManager";
import { useConsistencyStore } from "@/lib/consistency-store";
import { ArrowLeft, Pencil, Check, X, Trash2, FileText, AlertTriangle } from "lucide-react";

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

function formatDate(ts: number): string {
  return new Date(ts).toLocaleDateString("ko-KR", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// ---------------------------------------------------------------------------
// Inline editable field
// ---------------------------------------------------------------------------

interface EditableFieldProps {
  label: string;
  value: string;
  onSave: (value: string) => void;
  multiline?: boolean;
}

function EditableField({ label, value, onSave, multiline }: EditableFieldProps) {
  const [editing, setEditing] = React.useState(false);
  const [draft, setDraft] = React.useState(value);

  const handleSave = () => {
    onSave(draft);
    setEditing(false);
  };

  const handleCancel = () => {
    setDraft(value);
    setEditing(false);
  };

  // Sync draft when value changes externally
  React.useEffect(() => {
    if (!editing) setDraft(value);
  }, [value, editing]);

  return (
    <div className="group">
      <div className="text-xs font-semibold uppercase tracking-wider text-fg-subtle mb-1">
        {label}
      </div>
      {editing ? (
        <div className="flex items-start gap-1">
          {multiline ? (
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              className="flex-1 min-h-[60px] rounded-md border border-border-strong bg-bg-subtle px-2 py-1 text-sm text-fg-base focus:outline-none focus:ring-1 focus:ring-ring"
              autoFocus
            />
          ) : (
            <Input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              className="flex-1 h-8 text-sm bg-bg-subtle border-border-strong"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSave();
                if (e.key === "Escape") handleCancel();
              }}
            />
          )}
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleSave}>
            <Check className="h-3.5 w-3.5 text-fg-base" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleCancel}>
            <X className="h-3.5 w-3.5 text-fg-muted" />
          </Button>
        </div>
      ) : (
        <div
          className="flex items-start gap-1 cursor-pointer rounded px-1 -mx-1 py-0.5 hover:bg-bg-subtle-hover transition-colors"
          onClick={() => setEditing(true)}
        >
          <span className="flex-1 text-sm text-fg-base whitespace-pre-wrap break-words">
            {value || <span className="text-fg-muted italic">{"\ube44\uc5b4 \uc788\uc74c"}</span>}
          </span>
          <Pencil className="h-3 w-3 text-fg-muted opacity-0 group-hover:opacity-100 mt-0.5 shrink-0 transition-opacity" />
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// EntityDetail
// ---------------------------------------------------------------------------

interface EntityDetailProps {
  entityType: EntityType;
  entityId: string;
  onBack: () => void;
}

export function EntityDetail({ entityType, entityId, onBack }: EntityDetailProps) {
  const [confirmDelete, setConfirmDelete] = React.useState(false);

  const getEntityById = useNovelStore((s) => s.getEntityById);
  const updateCharacter = useNovelStore((s) => s.updateCharacter);
  const updateLocation = useNovelStore((s) => s.updateLocation);
  const updateFaction = useNovelStore((s) => s.updateFaction);
  const updateItem = useNovelStore((s) => s.updateItem);
  const updateEvent = useNovelStore((s) => s.updateEvent);
  const deleteCharacter = useNovelStore((s) => s.deleteCharacter);
  const deleteLocation = useNovelStore((s) => s.deleteLocation);
  const deleteFaction = useNovelStore((s) => s.deleteFaction);
  const deleteItem = useNovelStore((s) => s.deleteItem);
  const deleteEvent = useNovelStore((s) => s.deleteEvent);

  // Consistency issues for this entity
  const listIssuesByEntity = useConsistencyStore((s) => s.listIssuesByEntity);
  const entityIssues = React.useMemo(
    () => listIssuesByEntity(entityId).filter((i) => i.status === 'open'),
    [entityId, listIssuesByEntity],
  );

  // Manuscript backlinks - scenes where this entity is referenced
  const textEntityReferences = useNovelStore((s) => s.textEntityReferences);
  const manuscriptScenesMap = useNovelStore((s) => s.manuscriptScenes);
  const manuscriptChaptersMap = useNovelStore((s) => s.manuscriptChapters);
  const booksMap = useNovelStore((s) => s.books);

  const manuscriptBacklinks = React.useMemo(() => {
    return Object.values(textEntityReferences)
      .filter((r) => r.entityType === entityType && r.entityId === entityId)
      .map((r) => {
        const ms = manuscriptScenesMap[r.manuscriptSceneId];
        if (!ms) return null;
        const ch = manuscriptChaptersMap[ms.chapterId];
        const book = booksMap[ms.bookId];
        return { ref: r, scene: ms, chapter: ch, book };
      })
      .filter(Boolean) as Array<{
        ref: typeof textEntityReferences[string];
        scene: typeof manuscriptScenesMap[string];
        chapter: typeof manuscriptChaptersMap[string] | undefined;
        book: typeof booksMap[string] | undefined;
      }>;
  }, [textEntityReferences, manuscriptScenesMap, manuscriptChaptersMap, booksMap, entityType, entityId]);
  const characters = useNovelStore((s) => s.characters);
  const locations = useNovelStore((s) => s.locations);
  const factions = useNovelStore((s) => s.factions);
  const items = useNovelStore((s) => s.items);
  const events = useNovelStore((s) => s.events);

  const entity = React.useMemo(() => {
    // Force re-evaluation when slices change
    void characters; void locations; void factions; void items; void events;
    return getEntityById(entityType, entityId);
  }, [entityType, entityId, getEntityById, characters, locations, factions, items, events]);

  if (!entity) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-fg-muted text-sm">
        <p>{"\uc5d4\ud2f0\ud2f0\ub97c \ucc3e\uc744 \uc218 \uc5c6\uc2b5\ub2c8\ub2e4."}</p>
        <Button variant="ghost" size="sm" onClick={onBack} className="mt-2">
          <ArrowLeft className="h-3.5 w-3.5 mr-1" /> {"\ub3cc\uc544\uac00\uae30"}
        </Button>
      </div>
    );
  }

  const handleUpdate = (field: string, value: string | number | null | string[]) => {
    const patch = { [field]: value };
    switch (entityType) {
      case "character":
        updateCharacter(entityId, patch);
        break;
      case "location":
        updateLocation(entityId, patch);
        break;
      case "faction":
        updateFaction(entityId, patch);
        break;
      case "item":
        updateItem(entityId, patch);
        break;
      case "event":
        updateEvent(entityId, patch);
        break;
    }
  };

  const handleDelete = () => {
    switch (entityType) {
      case "character":
        deleteCharacter(entityId);
        break;
      case "location":
        deleteLocation(entityId);
        break;
      case "faction":
        deleteFaction(entityId);
        break;
      case "item":
        deleteItem(entityId);
        break;
      case "event":
        deleteEvent(entityId);
        break;
    }
    onBack();
  };

  const entityName = "title" in entity ? entity.title : (entity as { name: string }).name;

  return (
    <ScrollArea className="h-full">
      <div className="p-4 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onBack}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <Badge className={`${TYPE_COLORS[entityType]} border-0 text-[10px] px-1.5 py-0`}>
              {TYPE_SINGULAR[entityType]}
            </Badge>
            <h1 className="text-lg font-semibold text-fg-base">{entityName}</h1>
          </div>
          <div>
            {confirmDelete ? (
              <div className="flex items-center gap-1">
                <span className="text-xs text-destructive mr-1">{"\uc0ad\uc81c\ud560\uae4c\uc694?"}</span>
                <Button variant="destructive" size="sm" className="h-7 text-xs" onClick={handleDelete}>
                  {"\uc608"}
                </Button>
                <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => setConfirmDelete(false)}>
                  {"\uc544\ub2c8\uc624"}
                </Button>
              </div>
            ) : (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-fg-muted hover:text-destructive"
                onClick={() => setConfirmDelete(true)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Timestamps + Issue count */}
        <div className="flex gap-4 items-center text-[10px] text-fg-muted">
          <span>{"\uc0dd\uc131\uc77c"}: {formatDate(entity.createdAt)}</span>
          {"updatedAt" in entity && (
            <span>{"\uc218\uc815\uc77c"}: {formatDate((entity as { updatedAt: number }).updatedAt)}</span>
          )}
          {entityIssues.length > 0 && (
            <Badge className="text-[10px] px-1.5 py-0 bg-visualizer-crimson-spark/10 text-visualizer-crimson-spark border-0">
              <AlertTriangle className="h-2.5 w-2.5 mr-0.5" />{"\uad00\ub828 \ucda9\ub3cc"} {entityIssues.length}{"\uac74"}
            </Badge>
          )}
        </div>

        {/* Fields per type */}
        <div className="border border-border-strong rounded-lg p-4 space-y-4">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-fg-subtle">
            {"\uc18d\uc131"}
          </h3>

          {entityType === "character" && renderCharacterFields(entity as Character, handleUpdate)}
          {entityType === "location" && renderLocationFields(entity as Location, handleUpdate)}
          {entityType === "faction" && renderFactionFields(entity as Faction, handleUpdate)}
          {entityType === "item" && renderItemFields(entity as Item, handleUpdate)}
          {entityType === "event" && renderEventFields(entity as WorldEvent, handleUpdate)}
        </div>

        {/* Links section */}
        <div className="border border-border-strong rounded-lg p-4">
          <LinkManager entityType={entityType} entityId={entityId} />
        </div>

        {/* Manuscript backlinks section */}
        <div className="border border-border-strong rounded-lg p-4 space-y-3">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-fg-subtle">
            {"\ub4f1\uc7a5\ud55c \uc6d0\uace0 \uc7a5\uba74"}
          </h3>
          {manuscriptBacklinks.length === 0 ? (
            <p className="text-xs text-fg-muted py-1">{"\uc774 \uc5d4\ud2f0\ud2f0\uac00 \uc5b8\uae09\ub41c \uc6d0\uace0 \uc7a5\uba74\uc774 \uc5c6\uc2b5\ub2c8\ub2e4."}</p>
          ) : (
            <div className="space-y-1">
              {manuscriptBacklinks.map((bl) => (
                <div
                  key={bl.ref.id}
                  className="flex items-center gap-2 px-2 py-1.5 rounded border border-border-strong bg-bg-subtle text-sm"
                >
                  <FileText className="h-3 w-3 text-fg-muted shrink-0" />
                  <span className="text-fg-base text-xs truncate flex-1">
                    {bl.scene.title}
                  </span>
                  {bl.book && (
                    <Badge className="text-[10px] px-1 py-0 bg-bg-subtle text-fg-muted border-border-strong">
                      {bl.book.title}
                    </Badge>
                  )}
                  {bl.chapter && (
                    <span className="text-[10px] text-fg-muted">{bl.chapter.title}</span>
                  )}
                  <span className="text-[10px] text-fg-muted">{(bl.scene.wordCount ?? 0).toLocaleString()}{"\uae00\uc790"}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </ScrollArea>
  );
}

// ---------------------------------------------------------------------------
// Type-specific field renderers
// ---------------------------------------------------------------------------

function renderCharacterFields(
  c: Character,
  onUpdate: (field: string, value: string | number | null | string[]) => void,
) {
  return (
    <div className="space-y-3">
      <EditableField label={"\uc774\ub984"} value={c.name} onSave={(v) => onUpdate("name", v)} />
      <EditableField
        label={"\ub098\uc774"}
        value={c.age !== null ? String(c.age) : ""}
        onSave={(v) => onUpdate("age", v ? Number(v) : null)}
      />
      <EditableField
        label={"\ucd9c\uc0dd\ub144\ub3c4"}
        value={c.birthYear !== null ? String(c.birthYear) : ""}
        onSave={(v) => onUpdate("birthYear", v ? Number(v) : null)}
      />
      <EditableField
        label={"\uc0ac\ub9dd\ub144\ub3c4"}
        value={c.deathYear !== null ? String(c.deathYear) : ""}
        onSave={(v) => onUpdate("deathYear", v ? Number(v) : null)}
      />
      <EditableField label={"\uc5ed\ud560"} value={c.role} onSave={(v) => onUpdate("role", v)} />
      <EditableField
        label={"\ud2b9\uc131 (\uc27c\ud45c\ub85c \uad6c\ubd84)"}
        value={c.traits.join(", ")}
        onSave={(v) =>
          onUpdate(
            "traits",
            v
              .split(",")
              .map((t) => t.trim())
              .filter(Boolean),
          )
        }
      />
      <EditableField label={"\uba54\ubaa8"} value={c.notes} onSave={(v) => onUpdate("notes", v)} multiline />
    </div>
  );
}

function renderLocationFields(
  l: Location,
  onUpdate: (field: string, value: string) => void,
) {
  return (
    <div className="space-y-3">
      <EditableField label={"\uc774\ub984"} value={l.name} onSave={(v) => onUpdate("name", v)} />
      <EditableField label={"\uc720\ud615"} value={l.type} onSave={(v) => onUpdate("type", v)} />
      <EditableField
        label={"\uc124\uba85"}
        value={l.description}
        onSave={(v) => onUpdate("description", v)}
        multiline
      />
    </div>
  );
}

function renderFactionFields(
  f: Faction,
  onUpdate: (field: string, value: string) => void,
) {
  return (
    <div className="space-y-3">
      <EditableField label={"\uc774\ub984"} value={f.name} onSave={(v) => onUpdate("name", v)} />
      <EditableField label={"\uc774\ub150"} value={f.ideology} onSave={(v) => onUpdate("ideology", v)} />
      <EditableField
        label={"\uc124\uba85"}
        value={f.description}
        onSave={(v) => onUpdate("description", v)}
        multiline
      />
    </div>
  );
}

function renderItemFields(
  i: Item,
  onUpdate: (field: string, value: string) => void,
) {
  return (
    <div className="space-y-3">
      <EditableField label={"\uc774\ub984"} value={i.name} onSave={(v) => onUpdate("name", v)} />
      <EditableField label={"\ubd84\ub958"} value={i.category} onSave={(v) => onUpdate("category", v)} />
      <EditableField
        label={"\uc124\uba85"}
        value={i.description}
        onSave={(v) => onUpdate("description", v)}
        multiline
      />
    </div>
  );
}

function renderEventFields(
  e: WorldEvent,
  onUpdate: (field: string, value: string | number) => void,
) {
  return (
    <div className="space-y-3">
      <EditableField label={"\uc81c\ubaa9"} value={e.title} onSave={(v) => onUpdate("title", v)} />
      <EditableField
        label={"\ud0c0\uc784\ub77c\uc778 \uc778\ub371\uc2a4"}
        value={String(e.timelineIndex)}
        onSave={(v) => onUpdate("timelineIndex", Number(v) || 0)}
      />
      <EditableField
        label={"\uc694\uc57d"}
        value={e.summary}
        onSave={(v) => onUpdate("summary", v)}
        multiline
      />
    </div>
  );
}
