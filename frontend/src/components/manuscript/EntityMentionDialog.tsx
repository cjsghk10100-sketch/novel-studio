import { useNovelStore } from '@/lib/novel-store';
import { EntityType } from '@/lib/novel-types';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import * as VisuallyHidden from '@radix-ui/react-visually-hidden';

interface EntityMentionDialogProps {
  open: boolean;
  onClose: () => void;
  onSelect: (entityType: EntityType, entityId: string, entityName: string) => void;
}

export function EntityMentionDialog({ open, onClose, onSelect }: EntityMentionDialogProps) {
  const characters = useNovelStore((s) => s.characters);
  const locations = useNovelStore((s) => s.locations);
  const factions = useNovelStore((s) => s.factions);
  const items = useNovelStore((s) => s.items);
  const events = useNovelStore((s) => s.events);

  const handleSelect = (type: EntityType, id: string, name: string) => {
    onSelect(type, id, name);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="overflow-hidden p-0 border-border-strong bg-bg-chat sm:max-w-md">
        <VisuallyHidden.Root>
          <DialogTitle>엔티티 검색</DialogTitle>
        </VisuallyHidden.Root>
        <Command>
          <CommandInput placeholder="엔티티 검색..." className="border-0 focus:ring-0" />
          <CommandList>
            <CommandEmpty>검색 결과가 없습니다.</CommandEmpty>

            {Object.keys(characters).length > 0 && (
              <CommandGroup heading="인물">
                {Object.values(characters).map((c) => (
                  <CommandItem key={c.id} onSelect={() => handleSelect('character', c.id, c.name)}>
                    <span>{c.name}</span>
                    {c.role && (
                      <span className="ml-auto text-xs text-muted-foreground">{c.role}</span>
                    )}
                  </CommandItem>
                ))}
              </CommandGroup>
            )}

            {Object.keys(locations).length > 0 && (
              <CommandGroup heading="지역">
                {Object.values(locations).map((l) => (
                  <CommandItem key={l.id} onSelect={() => handleSelect('location', l.id, l.name)}>
                    {l.name}
                  </CommandItem>
                ))}
              </CommandGroup>
            )}

            {Object.keys(factions).length > 0 && (
              <CommandGroup heading="세력">
                {Object.values(factions).map((f) => (
                  <CommandItem key={f.id} onSelect={() => handleSelect('faction', f.id, f.name)}>
                    {f.name}
                  </CommandItem>
                ))}
              </CommandGroup>
            )}

            {Object.keys(items).length > 0 && (
              <CommandGroup heading="아이템">
                {Object.values(items).map((i) => (
                  <CommandItem key={i.id} onSelect={() => handleSelect('item', i.id, i.name)}>
                    {i.name}
                  </CommandItem>
                ))}
              </CommandGroup>
            )}

            {Object.keys(events).length > 0 && (
              <CommandGroup heading="사건">
                {Object.values(events).map((e) => (
                  <CommandItem key={e.id} onSelect={() => handleSelect('event', e.id, e.title)}>
                    <span>{e.title}</span>
                    <span className="ml-auto text-xs text-muted-foreground">
                      #{e.timelineIndex}
                    </span>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </DialogContent>
    </Dialog>
  );
}
