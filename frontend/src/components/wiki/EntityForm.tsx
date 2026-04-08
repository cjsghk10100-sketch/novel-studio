import * as React from "react";
import { useNovelStore } from "@/lib/novel-store";
import type { EntityType } from "@/lib/novel-types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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

const TYPE_SINGULAR: Record<EntityType, string> = {
  character: "\uc778\ubb3c",
  location: "\uc9c0\uc5ed",
  faction: "\uc138\ub825",
  item: "\uc544\uc774\ud15c",
  event: "\uc0ac\uac74",
};

// Role options for characters
const CHARACTER_ROLES = [
  "protagonist",
  "antagonist",
  "supporting",
  "minor",
  "mentor",
  "love interest",
  "comic relief",
  "narrator",
];

const CHARACTER_ROLE_LABELS: Record<string, string> = {
  protagonist: "\uc8fc\uc778\uacf5",
  antagonist: "\uc801\ub300\uc790",
  supporting: "\uc870\uc5f0",
  minor: "\ub2e8\uc5ed",
  mentor: "\uba58\ud1a0",
  "love interest": "\uc5f0\uc778",
  "comic relief": "\uac1c\uadf8 \uce90\ub9ad\ud130",
  narrator: "\ub0b4\ub808\uc774\ud130",
};

// Location type options
const LOCATION_TYPES = [
  "city",
  "town",
  "village",
  "dungeon",
  "forest",
  "mountain",
  "castle",
  "temple",
  "cave",
  "ocean",
  "island",
  "desert",
  "other",
];

const LOCATION_TYPE_LABELS: Record<string, string> = {
  city: "\ub3c4\uc2dc",
  town: "\ub9c8\uc744",
  village: "\ub9c8\uc744",
  dungeon: "\ub358\uc804",
  forest: "\uc232",
  mountain: "\uc0b0",
  castle: "\uc131",
  temple: "\uc0ac\uc6d0",
  cave: "\ub3d9\uad74",
  ocean: "\ubc14\ub2e4",
  island: "\uc12c",
  desert: "\uc0ac\ub9c9",
  other: "\uae30\ud0c0",
};

// Item category options
const ITEM_CATEGORIES = [
  "weapon",
  "armor",
  "artifact",
  "potion",
  "tool",
  "key",
  "document",
  "treasure",
  "clothing",
  "other",
];

const ITEM_CATEGORY_LABELS: Record<string, string> = {
  weapon: "\ubb34\uae30",
  armor: "\ubc29\uc5b4\uad6c",
  artifact: "\uc720\ubb3c",
  potion: "\ubb3c\uc57d",
  tool: "\ub3c4\uad6c",
  key: "\uc5f4\uc1e0",
  document: "\ubb38\uc11c",
  treasure: "\ubcf4\ubb3c",
  clothing: "\uc758\ubcf5",
  other: "\uae30\ud0c0",
};

interface EntityFormProps {
  entityType: EntityType;
  entityId?: string | null;
  open: boolean;
  onClose: () => void;
}

export function EntityForm({ entityType, entityId, open, onClose }: EntityFormProps) {
  const isEdit = Boolean(entityId);

  const getEntityById = useNovelStore((s) => s.getEntityById);
  const addCharacter = useNovelStore((s) => s.addCharacter);
  const addLocation = useNovelStore((s) => s.addLocation);
  const addFaction = useNovelStore((s) => s.addFaction);
  const addItem = useNovelStore((s) => s.addItem);
  const addEvent = useNovelStore((s) => s.addEvent);
  const updateCharacter = useNovelStore((s) => s.updateCharacter);
  const updateLocation = useNovelStore((s) => s.updateLocation);
  const updateFaction = useNovelStore((s) => s.updateFaction);
  const updateItem = useNovelStore((s) => s.updateItem);
  const updateEvent = useNovelStore((s) => s.updateEvent);

  // Form state
  const [formData, setFormData] = React.useState<Record<string, string>>({});

  // Initialize form when dialog opens or entityId changes
  React.useEffect(() => {
    if (!open) return;

    if (isEdit && entityId) {
      const entity = getEntityById(entityType, entityId);
      if (!entity) return;

      switch (entityType) {
        case "character": {
          const c = entity as { name: string; age: number | null; birthYear: number | null; deathYear: number | null; role: string; traits: string[]; notes: string };
          setFormData({
            name: c.name,
            age: c.age !== null ? String(c.age) : "",
            birthYear: c.birthYear !== null ? String(c.birthYear) : "",
            deathYear: c.deathYear !== null ? String(c.deathYear) : "",
            role: c.role,
            traits: c.traits.join(", "),
            notes: c.notes,
          });
          break;
        }
        case "location": {
          const l = entity as { name: string; type: string; description: string };
          setFormData({ name: l.name, type: l.type, description: l.description });
          break;
        }
        case "faction": {
          const f = entity as { name: string; ideology: string; description: string };
          setFormData({ name: f.name, ideology: f.ideology, description: f.description });
          break;
        }
        case "item": {
          const i = entity as { name: string; category: string; description: string };
          setFormData({ name: i.name, category: i.category, description: i.description });
          break;
        }
        case "event": {
          const e = entity as { title: string; timelineIndex: number; summary: string };
          setFormData({
            title: e.title,
            timelineIndex: String(e.timelineIndex),
            summary: e.summary,
          });
          break;
        }
      }
    } else {
      // Reset for create
      setFormData({});
    }
  }, [open, entityId, entityType, isEdit, getEntityById]);

  const updateField = (key: string, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    switch (entityType) {
      case "character": {
        const data = {
          name: formData.name || "\uc774\ub984 \uc5c6\ub294 \uc778\ubb3c",
          age: formData.age ? Number(formData.age) : null,
          birthYear: formData.birthYear ? Number(formData.birthYear) : null,
          deathYear: formData.deathYear ? Number(formData.deathYear) : null,
          role: formData.role || "supporting",
          traits: (formData.traits || "")
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean),
          notes: formData.notes || "",
        };
        if (isEdit && entityId) {
          updateCharacter(entityId, data);
        } else {
          addCharacter(data);
        }
        break;
      }
      case "location": {
        const data = {
          name: formData.name || "\uc774\ub984 \uc5c6\ub294 \uc9c0\uc5ed",
          type: formData.type || "other",
          description: formData.description || "",
        };
        if (isEdit && entityId) {
          updateLocation(entityId, data);
        } else {
          addLocation(data);
        }
        break;
      }
      case "faction": {
        const data = {
          name: formData.name || "\uc774\ub984 \uc5c6\ub294 \uc138\ub825",
          ideology: formData.ideology || "",
          description: formData.description || "",
        };
        if (isEdit && entityId) {
          updateFaction(entityId, data);
        } else {
          addFaction(data);
        }
        break;
      }
      case "item": {
        const data = {
          name: formData.name || "\uc774\ub984 \uc5c6\ub294 \uc544\uc774\ud15c",
          category: formData.category || "other",
          description: formData.description || "",
        };
        if (isEdit && entityId) {
          updateItem(entityId, data);
        } else {
          addItem(data);
        }
        break;
      }
      case "event": {
        const data = {
          title: formData.title || "\uc774\ub984 \uc5c6\ub294 \uc0ac\uac74",
          timelineIndex: Number(formData.timelineIndex) || 0,
          summary: formData.summary || "",
        };
        if (isEdit && entityId) {
          updateEvent(entityId, data);
        } else {
          addEvent(data);
        }
        break;
      }
    }

    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="border-border-strong bg-bg-chat sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-fg-base">
            {isEdit ? `${TYPE_SINGULAR[entityType]} \uc218\uc815` : `\uc0c8 ${TYPE_SINGULAR[entityType]} \uc0dd\uc131`}
          </DialogTitle>
          <DialogDescription className="text-fg-subtle text-xs">
            {isEdit
              ? `\uc544\ub798 \ud544\ub4dc\ub97c \uc218\uc815\ud558\uc5ec ${TYPE_SINGULAR[entityType]}\uc744(\ub97c) \ubcc0\uacbd\ud558\uc138\uc694.`
              : `\uc544\ub798 \ud544\ub4dc\ub97c \ucc44\uc6cc \uc0c8 ${TYPE_SINGULAR[entityType]}\uc744(\ub97c) \uc0dd\uc131\ud558\uc138\uc694.`}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {entityType === "character" && (
            <>
              <FieldRow label={"\uc774\ub984"}>
                <Input
                  value={formData.name || ""}
                  onChange={(e) => updateField("name", e.target.value)}
                  placeholder={"\uc778\ubb3c \uc774\ub984"}
                  className="bg-bg-subtle border-border-strong"
                  autoFocus
                />
              </FieldRow>
              <div className="grid grid-cols-3 gap-3">
                <FieldRow label={"\ub098\uc774"}>
                  <Input
                    type="number"
                    value={formData.age || ""}
                    onChange={(e) => updateField("age", e.target.value)}
                    placeholder="--"
                    className="bg-bg-subtle border-border-strong"
                  />
                </FieldRow>
                <FieldRow label={"\ucd9c\uc0dd\ub144\ub3c4"}>
                  <Input
                    type="number"
                    value={formData.birthYear || ""}
                    onChange={(e) => updateField("birthYear", e.target.value)}
                    placeholder="--"
                    className="bg-bg-subtle border-border-strong"
                  />
                </FieldRow>
                <FieldRow label={"\uc0ac\ub9dd\ub144\ub3c4"}>
                  <Input
                    type="number"
                    value={formData.deathYear || ""}
                    onChange={(e) => updateField("deathYear", e.target.value)}
                    placeholder="--"
                    className="bg-bg-subtle border-border-strong"
                  />
                </FieldRow>
              </div>
              <FieldRow label={"\uc5ed\ud560"}>
                <Select
                  value={formData.role || ""}
                  onValueChange={(v) => updateField("role", v)}
                >
                  <SelectTrigger className="bg-bg-subtle border-border-strong">
                    <SelectValue placeholder={"\uc5ed\ud560 \uc120\ud0dd"} />
                  </SelectTrigger>
                  <SelectContent>
                    {CHARACTER_ROLES.map((r) => (
                      <SelectItem key={r} value={r}>
                        {CHARACTER_ROLE_LABELS[r] || r}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FieldRow>
              <FieldRow label={"\ud2b9\uc131 (\uc27c\ud45c\ub85c \uad6c\ubd84)"}>
                <Input
                  value={formData.traits || ""}
                  onChange={(e) => updateField("traits", e.target.value)}
                  placeholder={"\uc6a9\uac10\ud55c, \ub618\ub618\ud55c, \uace0\uc9d1\uc2a4\ub7ec\uc6b4"}
                  className="bg-bg-subtle border-border-strong"
                />
              </FieldRow>
              <FieldRow label={"\uba54\ubaa8"}>
                <Textarea
                  value={formData.notes || ""}
                  onChange={(e) => updateField("notes", e.target.value)}
                  placeholder={"\uc774 \uc778\ubb3c\uc5d0 \ub300\ud55c \ucd94\uac00 \uba54\ubaa8..."}
                  className="bg-bg-subtle border-border-strong min-h-[80px]"
                />
              </FieldRow>
            </>
          )}

          {entityType === "location" && (
            <>
              <FieldRow label={"\uc774\ub984"}>
                <Input
                  value={formData.name || ""}
                  onChange={(e) => updateField("name", e.target.value)}
                  placeholder={"\uc9c0\uc5ed \uc774\ub984"}
                  className="bg-bg-subtle border-border-strong"
                  autoFocus
                />
              </FieldRow>
              <FieldRow label={"\uc720\ud615"}>
                <Select
                  value={formData.type || ""}
                  onValueChange={(v) => updateField("type", v)}
                >
                  <SelectTrigger className="bg-bg-subtle border-border-strong">
                    <SelectValue placeholder={"\uc720\ud615 \uc120\ud0dd"} />
                  </SelectTrigger>
                  <SelectContent>
                    {LOCATION_TYPES.map((t) => (
                      <SelectItem key={t} value={t}>
                        {LOCATION_TYPE_LABELS[t] || t}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FieldRow>
              <FieldRow label={"\uc124\uba85"}>
                <Textarea
                  value={formData.description || ""}
                  onChange={(e) => updateField("description", e.target.value)}
                  placeholder={"\uc774 \uc9c0\uc5ed\uc744 \uc124\uba85\ud558\uc138\uc694..."}
                  className="bg-bg-subtle border-border-strong min-h-[80px]"
                />
              </FieldRow>
            </>
          )}

          {entityType === "faction" && (
            <>
              <FieldRow label={"\uc774\ub984"}>
                <Input
                  value={formData.name || ""}
                  onChange={(e) => updateField("name", e.target.value)}
                  placeholder={"\uc138\ub825 \uc774\ub984"}
                  className="bg-bg-subtle border-border-strong"
                  autoFocus
                />
              </FieldRow>
              <FieldRow label={"\uc774\ub150"}>
                <Input
                  value={formData.ideology || ""}
                  onChange={(e) => updateField("ideology", e.target.value)}
                  placeholder={"\ud575\uc2ec \uc774\ub150 \ub610\ub294 \uc2e0\ub150 \uccb4\uacc4"}
                  className="bg-bg-subtle border-border-strong"
                />
              </FieldRow>
              <FieldRow label={"\uc124\uba85"}>
                <Textarea
                  value={formData.description || ""}
                  onChange={(e) => updateField("description", e.target.value)}
                  placeholder={"\uc774 \uc138\ub825\uc744 \uc124\uba85\ud558\uc138\uc694..."}
                  className="bg-bg-subtle border-border-strong min-h-[80px]"
                />
              </FieldRow>
            </>
          )}

          {entityType === "item" && (
            <>
              <FieldRow label={"\uc774\ub984"}>
                <Input
                  value={formData.name || ""}
                  onChange={(e) => updateField("name", e.target.value)}
                  placeholder={"\uc544\uc774\ud15c \uc774\ub984"}
                  className="bg-bg-subtle border-border-strong"
                  autoFocus
                />
              </FieldRow>
              <FieldRow label={"\ubd84\ub958"}>
                <Select
                  value={formData.category || ""}
                  onValueChange={(v) => updateField("category", v)}
                >
                  <SelectTrigger className="bg-bg-subtle border-border-strong">
                    <SelectValue placeholder={"\ubd84\ub958 \uc120\ud0dd"} />
                  </SelectTrigger>
                  <SelectContent>
                    {ITEM_CATEGORIES.map((c) => (
                      <SelectItem key={c} value={c}>
                        {ITEM_CATEGORY_LABELS[c] || c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FieldRow>
              <FieldRow label={"\uc124\uba85"}>
                <Textarea
                  value={formData.description || ""}
                  onChange={(e) => updateField("description", e.target.value)}
                  placeholder={"\uc774 \uc544\uc774\ud15c\uc744 \uc124\uba85\ud558\uc138\uc694..."}
                  className="bg-bg-subtle border-border-strong min-h-[80px]"
                />
              </FieldRow>
            </>
          )}

          {entityType === "event" && (
            <>
              <FieldRow label={"\uc81c\ubaa9"}>
                <Input
                  value={formData.title || ""}
                  onChange={(e) => updateField("title", e.target.value)}
                  placeholder={"\uc0ac\uac74 \uc81c\ubaa9"}
                  className="bg-bg-subtle border-border-strong"
                  autoFocus
                />
              </FieldRow>
              <FieldRow label={"\ud0c0\uc784\ub77c\uc778 \uc778\ub371\uc2a4 (\uc5f0\ub3c4 \ub610\ub294 \uc21c\uc11c)"}>
                <Input
                  type="number"
                  value={formData.timelineIndex || ""}
                  onChange={(e) => updateField("timelineIndex", e.target.value)}
                  placeholder="0"
                  className="bg-bg-subtle border-border-strong"
                />
              </FieldRow>
              <FieldRow label={"\uc694\uc57d"}>
                <Textarea
                  value={formData.summary || ""}
                  onChange={(e) => updateField("summary", e.target.value)}
                  placeholder={"\uc774 \uc0ac\uac74\uc744 \uc694\uc57d\ud558\uc138\uc694..."}
                  className="bg-bg-subtle border-border-strong min-h-[80px]"
                />
              </FieldRow>
            </>
          )}

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={onClose} className="text-fg-subtle">
              {"\ucde8\uc18c"}
            </Button>
            <Button type="submit">
              {isEdit ? "\ubcc0\uacbd\uc0ac\ud56d \uc800\uc7a5" : `${TYPE_SINGULAR[entityType]} \uc0dd\uc131`}
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
