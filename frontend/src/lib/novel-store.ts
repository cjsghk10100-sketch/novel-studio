import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';

import type {
  EntityType,
  Character,
  Location,
  Faction,
  Item,
  WorldEvent,
  Link,
  Scene,
  PlotPoint,
  Foreshadow,
  RevisionLog,
  RelationType,
  PlotPointType,
  ForeshadowStatus,
  AnyEntity,
  EntityMap,
  Book,
  ManuscriptChapter,
  ManuscriptScene,
  ManuscriptVersion,
  TextEntityReference,
  ExtractedProposal,
  ManuscriptSceneStatus,
  ExtractedProposalType,
  ExtractedProposalStatus,
  NarrativeThread,
  NarrativeThreadType,
  NarrativeThreadStatus,
  BoardChapter,
  BoardSceneThreadLink,
  ThreadLinkRole,
} from '@/lib/novel-types';

// ---------------------------------------------------------------------------
// State shape
// ---------------------------------------------------------------------------

export interface NovelState {
  // Entity slices -- Record<id, entity> for O(1) lookups
  characters: Record<string, Character>;
  locations: Record<string, Location>;
  factions: Record<string, Faction>;
  items: Record<string, Item>;
  events: Record<string, WorldEvent>;
  scenes: Record<string, Scene>;
  boardChapters: Record<string, BoardChapter>;
  sceneThreadLinks: Record<string, BoardSceneThreadLink>;
  plotPoints: Record<string, PlotPoint>;
  foreshadows: Record<string, Foreshadow>;
  links: Record<string, Link>;
  revisionLogs: Record<string, RevisionLog>;

  // Manuscript (본편 집필) slices
  books: Record<string, Book>;
  manuscriptChapters: Record<string, ManuscriptChapter>;
  manuscriptScenes: Record<string, ManuscriptScene>;
  manuscriptVersions: Record<string, ManuscriptVersion>;
  textEntityReferences: Record<string, TextEntityReference>;
  extractedProposals: Record<string, ExtractedProposal>;
  narrativeThreads: Record<string, NarrativeThread>;
}

// ---------------------------------------------------------------------------
// Actions
// ---------------------------------------------------------------------------

export interface NovelActions {
  // Character CRUD
  addCharacter: (data: Omit<Character, 'id' | 'createdAt' | 'updatedAt'>) => string;
  updateCharacter: (id: string, patch: Partial<Omit<Character, 'id' | 'createdAt' | 'updatedAt'>>) => void;
  deleteCharacter: (id: string) => void;

  // Location CRUD
  addLocation: (data: Omit<Location, 'id' | 'createdAt' | 'updatedAt'>) => string;
  updateLocation: (id: string, patch: Partial<Omit<Location, 'id' | 'createdAt' | 'updatedAt'>>) => void;
  deleteLocation: (id: string) => void;

  // Faction CRUD
  addFaction: (data: Omit<Faction, 'id' | 'createdAt' | 'updatedAt'>) => string;
  updateFaction: (id: string, patch: Partial<Omit<Faction, 'id' | 'createdAt' | 'updatedAt'>>) => void;
  deleteFaction: (id: string) => void;

  // Item CRUD
  addItem: (data: Omit<Item, 'id' | 'createdAt' | 'updatedAt'>) => string;
  updateItem: (id: string, patch: Partial<Omit<Item, 'id' | 'createdAt' | 'updatedAt'>>) => void;
  deleteItem: (id: string) => void;

  // WorldEvent CRUD
  addEvent: (data: Omit<WorldEvent, 'id' | 'createdAt' | 'updatedAt'>) => string;
  updateEvent: (id: string, patch: Partial<Omit<WorldEvent, 'id' | 'createdAt' | 'updatedAt'>>) => void;
  deleteEvent: (id: string) => void;

  // Link management
  addLink: (data: Omit<Link, 'id' | 'createdAt'>) => string;
  removeLink: (id: string) => void;
  getLinksForEntity: (type: EntityType, id: string) => Link[];
  getBacklinks: (type: EntityType, id: string) => Link[];

  // Scene management
  addScene: (data: Omit<Scene, 'id' | 'createdAt' | 'updatedAt'>) => string;
  updateScene: (id: string, patch: Partial<Omit<Scene, 'id' | 'createdAt' | 'updatedAt'>>) => void;
  deleteScene: (id: string) => void;
  reorderScenes: (orderedIds: string[]) => void;

  // PlotPoint management
  addPlotPoint: (data: Omit<PlotPoint, 'id' | 'createdAt' | 'updatedAt'>) => string;
  updatePlotPoint: (id: string, patch: Partial<Omit<PlotPoint, 'id' | 'createdAt' | 'updatedAt'>>) => void;
  deletePlotPoint: (id: string) => void;

  // Foreshadow management
  addForeshadow: (data: Omit<Foreshadow, 'id' | 'createdAt' | 'updatedAt'>) => string;
  resolveForeshadow: (id: string, payoffSceneId: string) => void;
  abandonForeshadow: (id: string) => void;

  // Revision log
  rollbackRevision: (revisionId: string) => void;

  // Search
  searchEntities: (query: string) => Array<{ type: EntityType | 'scene' | 'plotPoint'; entity: AnyEntity | Scene | PlotPoint }>;

  // Helpers
  getEntityById: <T extends EntityType>(type: T, id: string) => EntityMap[T] | undefined;
  getScenesByChapter: (chapterNo: number) => Scene[];
  getPlotPointsByChapter: (chapterNo: number) => PlotPoint[];
  getUnresolvedForeshadows: () => Foreshadow[];

  // Book CRUD
  addBook: (data: Omit<Book, 'id' | 'createdAt' | 'updatedAt'>) => string;
  updateBook: (id: string, patch: Partial<Omit<Book, 'id' | 'createdAt' | 'updatedAt'>>) => void;
  deleteBook: (id: string) => void;

  // ManuscriptChapter CRUD
  addManuscriptChapter: (data: Omit<ManuscriptChapter, 'id' | 'createdAt' | 'updatedAt' | 'wordCount' | 'lastEditedAt'>) => string;
  updateManuscriptChapter: (id: string, patch: Partial<Omit<ManuscriptChapter, 'id' | 'createdAt' | 'updatedAt' | 'wordCount' | 'lastEditedAt'>>) => void;
  deleteManuscriptChapter: (id: string) => void;
  reorderManuscriptChapters: (orderedIds: string[]) => void;

  // ManuscriptScene CRUD
  addManuscriptScene: (data: Omit<ManuscriptScene, 'id' | 'createdAt' | 'updatedAt' | 'wordCount' | 'lastEditedAt'>) => string;
  updateManuscriptScene: (id: string, patch: Partial<Omit<ManuscriptScene, 'id' | 'createdAt' | 'updatedAt' | 'wordCount' | 'lastEditedAt'>>) => void;
  deleteManuscriptScene: (id: string) => void;
  reorderManuscriptScenes: (orderedIds: string[]) => void;

  // ManuscriptVersion
  addManuscriptVersion: (manuscriptSceneId: string) => string;

  // TextEntityReference
  addTextEntityReference: (data: Omit<TextEntityReference, 'id' | 'createdAt'>) => string;
  removeTextEntityReference: (id: string) => void;

  // ExtractedProposal
  addExtractedProposal: (data: Omit<ExtractedProposal, 'id' | 'createdAt' | 'updatedAt'>) => string;
  updateExtractedProposal: (id: string, patch: Partial<Omit<ExtractedProposal, 'id' | 'createdAt' | 'updatedAt'>>) => void;

  // Manuscript helpers
  getChaptersForBook: (bookId: string) => ManuscriptChapter[];
  getScenesForChapter: (chapterId: string) => ManuscriptScene[];
  getVersionsForScene: (sceneId: string) => ManuscriptVersion[];
  getReferencesForScene: (sceneId: string) => TextEntityReference[];
  getProposalsForScene: (sceneId: string) => ExtractedProposal[];

  // NarrativeThread CRUD
  addNarrativeThread: (data: Omit<NarrativeThread, 'id' | 'createdAt' | 'updatedAt'>) => string;
  updateNarrativeThread: (id: string, patch: Partial<Omit<NarrativeThread, 'id' | 'createdAt' | 'updatedAt'>>) => void;
  deleteNarrativeThread: (id: string) => void;
  getThreadsForScene: (sceneId: string) => NarrativeThread[];
  getOpenThreads: () => NarrativeThread[];
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

function now(): number {
  return Date.now();
}

function appendRevision(
  state: NovelState,
  entityType: string,
  entityId: string,
  action: 'create' | 'update' | 'delete',
  before: unknown,
  after: unknown,
): NovelState['revisionLogs'] {
  const id = uuidv4();
  const entry: RevisionLog = {
    id,
    entityType,
    entityId,
    action,
    diffJson: JSON.stringify({ before, after }),
    createdAt: now(),
    author: 'user',
  };
  return { ...state.revisionLogs, [id]: entry };
}

// Slice key for each entity type
const ENTITY_SLICE_KEY: Record<EntityType, keyof Pick<NovelState, 'characters' | 'locations' | 'factions' | 'items' | 'events'>> = {
  character: 'characters',
  location: 'locations',
  faction: 'factions',
  item: 'items',
  event: 'events',
};

// ---------------------------------------------------------------------------
// SSR-safe localStorage storage
// ---------------------------------------------------------------------------

const safeStorage = createJSONStorage(() => {
  if (typeof window !== 'undefined') {
    return window.localStorage;
  }
  // Provide a no-op storage for SSR
  return {
    getItem: () => null,
    setItem: () => {},
    removeItem: () => {},
  };
});

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------

export const useNovelStore = create<NovelState & NovelActions>()(
  persist(
    (set, get) => ({
      // ----- Initial state -----
      characters: {},
      locations: {},
      factions: {},
      items: {},
      events: {},
      scenes: {},
      boardChapters: {},
      sceneThreadLinks: {},
      plotPoints: {},
      foreshadows: {},
      links: {},
      revisionLogs: {},
      books: {},
      manuscriptChapters: {},
      manuscriptScenes: {},
      manuscriptVersions: {},
      textEntityReferences: {},
      extractedProposals: {},
      narrativeThreads: {},

      // -----------------------------------------------------------------------
      // Character CRUD
      // -----------------------------------------------------------------------

      addCharacter: (data) => {
        const id = uuidv4();
        const ts = now();
        const entity: Character = { ...data, id, createdAt: ts, updatedAt: ts };
        set((state) => ({
          characters: { ...state.characters, [id]: entity },
          revisionLogs: appendRevision(state, 'character', id, 'create', null, entity),
        }));
        return id;
      },

      updateCharacter: (id, patch) => {
        set((state) => {
          const prev = state.characters[id];
          if (!prev) return state;
          const updated: Character = { ...prev, ...patch, updatedAt: now() };
          return {
            characters: { ...state.characters, [id]: updated },
            revisionLogs: appendRevision(state, 'character', id, 'update', prev, updated),
          };
        });
      },

      deleteCharacter: (id) => {
        set((state) => {
          const prev = state.characters[id];
          if (!prev) return state;
          const { [id]: _, ...rest } = state.characters;
          return {
            characters: rest,
            revisionLogs: appendRevision(state, 'character', id, 'delete', prev, null),
          };
        });
      },

      // -----------------------------------------------------------------------
      // Location CRUD
      // -----------------------------------------------------------------------

      addLocation: (data) => {
        const id = uuidv4();
        const ts = now();
        const entity: Location = { ...data, id, createdAt: ts, updatedAt: ts };
        set((state) => ({
          locations: { ...state.locations, [id]: entity },
          revisionLogs: appendRevision(state, 'location', id, 'create', null, entity),
        }));
        return id;
      },

      updateLocation: (id, patch) => {
        set((state) => {
          const prev = state.locations[id];
          if (!prev) return state;
          const updated: Location = { ...prev, ...patch, updatedAt: now() };
          return {
            locations: { ...state.locations, [id]: updated },
            revisionLogs: appendRevision(state, 'location', id, 'update', prev, updated),
          };
        });
      },

      deleteLocation: (id) => {
        set((state) => {
          const prev = state.locations[id];
          if (!prev) return state;
          const { [id]: _, ...rest } = state.locations;
          return {
            locations: rest,
            revisionLogs: appendRevision(state, 'location', id, 'delete', prev, null),
          };
        });
      },

      // -----------------------------------------------------------------------
      // Faction CRUD
      // -----------------------------------------------------------------------

      addFaction: (data) => {
        const id = uuidv4();
        const ts = now();
        const entity: Faction = { ...data, id, createdAt: ts, updatedAt: ts };
        set((state) => ({
          factions: { ...state.factions, [id]: entity },
          revisionLogs: appendRevision(state, 'faction', id, 'create', null, entity),
        }));
        return id;
      },

      updateFaction: (id, patch) => {
        set((state) => {
          const prev = state.factions[id];
          if (!prev) return state;
          const updated: Faction = { ...prev, ...patch, updatedAt: now() };
          return {
            factions: { ...state.factions, [id]: updated },
            revisionLogs: appendRevision(state, 'faction', id, 'update', prev, updated),
          };
        });
      },

      deleteFaction: (id) => {
        set((state) => {
          const prev = state.factions[id];
          if (!prev) return state;
          const { [id]: _, ...rest } = state.factions;
          return {
            factions: rest,
            revisionLogs: appendRevision(state, 'faction', id, 'delete', prev, null),
          };
        });
      },

      // -----------------------------------------------------------------------
      // Item CRUD
      // -----------------------------------------------------------------------

      addItem: (data) => {
        const id = uuidv4();
        const ts = now();
        const entity: Item = { ...data, id, createdAt: ts, updatedAt: ts };
        set((state) => ({
          items: { ...state.items, [id]: entity },
          revisionLogs: appendRevision(state, 'item', id, 'create', null, entity),
        }));
        return id;
      },

      updateItem: (id, patch) => {
        set((state) => {
          const prev = state.items[id];
          if (!prev) return state;
          const updated: Item = { ...prev, ...patch, updatedAt: now() };
          return {
            items: { ...state.items, [id]: updated },
            revisionLogs: appendRevision(state, 'item', id, 'update', prev, updated),
          };
        });
      },

      deleteItem: (id) => {
        set((state) => {
          const prev = state.items[id];
          if (!prev) return state;
          const { [id]: _, ...rest } = state.items;
          return {
            items: rest,
            revisionLogs: appendRevision(state, 'item', id, 'delete', prev, null),
          };
        });
      },

      // -----------------------------------------------------------------------
      // WorldEvent CRUD
      // -----------------------------------------------------------------------

      addEvent: (data) => {
        const id = uuidv4();
        const ts = now();
        const entity: WorldEvent = { ...data, id, createdAt: ts, updatedAt: ts };
        set((state) => ({
          events: { ...state.events, [id]: entity },
          revisionLogs: appendRevision(state, 'event', id, 'create', null, entity),
        }));
        return id;
      },

      updateEvent: (id, patch) => {
        set((state) => {
          const prev = state.events[id];
          if (!prev) return state;
          const updated: WorldEvent = { ...prev, ...patch, updatedAt: now() };
          return {
            events: { ...state.events, [id]: updated },
            revisionLogs: appendRevision(state, 'event', id, 'update', prev, updated),
          };
        });
      },

      deleteEvent: (id) => {
        set((state) => {
          const prev = state.events[id];
          if (!prev) return state;
          const { [id]: _, ...rest } = state.events;
          return {
            events: rest,
            revisionLogs: appendRevision(state, 'event', id, 'delete', prev, null),
          };
        });
      },

      // -----------------------------------------------------------------------
      // Link management
      // -----------------------------------------------------------------------

      addLink: (data) => {
        const id = uuidv4();
        const ts = now();
        const link: Link = { ...data, id, createdAt: ts };
        set((state) => ({
          links: { ...state.links, [id]: link },
          revisionLogs: appendRevision(state, 'link', id, 'create', null, link),
        }));
        return id;
      },

      removeLink: (id) => {
        set((state) => {
          const prev = state.links[id];
          if (!prev) return state;
          const { [id]: _, ...rest } = state.links;
          return {
            links: rest,
            revisionLogs: appendRevision(state, 'link', id, 'delete', prev, null),
          };
        });
      },

      getLinksForEntity: (type, id) => {
        const allLinks = Object.values(get().links);
        return allLinks.filter((l) => l.fromType === type && l.fromId === id);
      },

      getBacklinks: (type, id) => {
        const allLinks = Object.values(get().links);
        return allLinks.filter((l) => l.toType === type && l.toId === id);
      },

      // -----------------------------------------------------------------------
      // Scene management
      // -----------------------------------------------------------------------

      addScene: (data) => {
        const id = uuidv4();
        const ts = now();
        const scene: Scene = { ...data, id, createdAt: ts, updatedAt: ts };
        set((state) => ({
          scenes: { ...state.scenes, [id]: scene },
          revisionLogs: appendRevision(state, 'scene', id, 'create', null, scene),
        }));
        return id;
      },

      updateScene: (id, patch) => {
        set((state) => {
          const prev = state.scenes[id];
          if (!prev) return state;
          const updated: Scene = { ...prev, ...patch, updatedAt: now() };
          return {
            scenes: { ...state.scenes, [id]: updated },
            revisionLogs: appendRevision(state, 'scene', id, 'update', prev, updated),
          };
        });
      },

      deleteScene: (id) => {
        set((state) => {
          const prev = state.scenes[id];
          if (!prev) return state;
          const { [id]: _, ...rest } = state.scenes;
          return {
            scenes: rest,
            revisionLogs: appendRevision(state, 'scene', id, 'delete', prev, null),
          };
        });
      },

      reorderScenes: (orderedIds) => {
        set((state) => {
          const updatedScenes = { ...state.scenes };
          const ts = now();
          orderedIds.forEach((sceneId, index) => {
            const scene = updatedScenes[sceneId];
            if (scene) {
              updatedScenes[sceneId] = { ...scene, timelineIndex: index, updatedAt: ts };
            }
          });
          return {
            scenes: updatedScenes,
            revisionLogs: appendRevision(state, 'scene', 'bulk-reorder', 'update', orderedIds, orderedIds),
          };
        });
      },

      // -----------------------------------------------------------------------
      // PlotPoint management
      // -----------------------------------------------------------------------

      addPlotPoint: (data) => {
        const id = uuidv4();
        const ts = now();
        const pp: PlotPoint = { ...data, id, createdAt: ts, updatedAt: ts };
        set((state) => ({
          plotPoints: { ...state.plotPoints, [id]: pp },
          revisionLogs: appendRevision(state, 'plotPoint', id, 'create', null, pp),
        }));
        return id;
      },

      updatePlotPoint: (id, patch) => {
        set((state) => {
          const prev = state.plotPoints[id];
          if (!prev) return state;
          const updated: PlotPoint = { ...prev, ...patch, updatedAt: now() };
          return {
            plotPoints: { ...state.plotPoints, [id]: updated },
            revisionLogs: appendRevision(state, 'plotPoint', id, 'update', prev, updated),
          };
        });
      },

      deletePlotPoint: (id) => {
        set((state) => {
          const prev = state.plotPoints[id];
          if (!prev) return state;
          const { [id]: _, ...rest } = state.plotPoints;
          return {
            plotPoints: rest,
            revisionLogs: appendRevision(state, 'plotPoint', id, 'delete', prev, null),
          };
        });
      },

      // -----------------------------------------------------------------------
      // Foreshadow management
      // -----------------------------------------------------------------------

      addForeshadow: (data) => {
        const id = uuidv4();
        const ts = now();
        const fs: Foreshadow = { ...data, id, createdAt: ts, updatedAt: ts };
        set((state) => ({
          foreshadows: { ...state.foreshadows, [id]: fs },
          revisionLogs: appendRevision(state, 'foreshadow', id, 'create', null, fs),
        }));
        return id;
      },

      resolveForeshadow: (id, payoffSceneId) => {
        set((state) => {
          const prev = state.foreshadows[id];
          if (!prev) return state;
          const updated: Foreshadow = {
            ...prev,
            payoffSceneId,
            status: 'resolved',
            updatedAt: now(),
          };
          return {
            foreshadows: { ...state.foreshadows, [id]: updated },
            revisionLogs: appendRevision(state, 'foreshadow', id, 'update', prev, updated),
          };
        });
      },

      abandonForeshadow: (id) => {
        set((state) => {
          const prev = state.foreshadows[id];
          if (!prev) return state;
          const updated: Foreshadow = {
            ...prev,
            status: 'abandoned',
            updatedAt: now(),
          };
          return {
            foreshadows: { ...state.foreshadows, [id]: updated },
            revisionLogs: appendRevision(state, 'foreshadow', id, 'update', prev, updated),
          };
        });
      },

      // -----------------------------------------------------------------------
      // Rollback
      // -----------------------------------------------------------------------

      rollbackRevision: (revisionId) => {
        set((state) => {
          const rev = state.revisionLogs[revisionId];
          if (!rev) return state;

          const diff = JSON.parse(rev.diffJson) as { before: unknown; after: unknown };
          const ts = now();

          // Determine which slice to modify
          const sliceKey = getSliceKeyForRevision(rev.entityType);
          if (!sliceKey) return state;

          const slice = { ...(state[sliceKey] as Record<string, unknown>) };

          if (rev.action === 'create') {
            // Undo create -> delete the entity
            delete slice[rev.entityId];
          } else if (rev.action === 'update') {
            // Undo update -> restore before state
            if (diff.before) {
              slice[rev.entityId] = { ...(diff.before as Record<string, unknown>), updatedAt: ts };
            }
          } else if (rev.action === 'delete') {
            // Undo delete -> restore the entity
            if (diff.before) {
              slice[rev.entityId] = { ...(diff.before as Record<string, unknown>), updatedAt: ts };
            }
          }

          // Create a rollback revision entry
          const rollbackLogs = appendRevision(
            state,
            rev.entityType,
            rev.entityId,
            rev.action === 'create' ? 'delete' : rev.action === 'delete' ? 'create' : 'update',
            diff.after,
            diff.before,
          );

          return {
            [sliceKey]: slice,
            revisionLogs: rollbackLogs,
          } as Partial<NovelState>;
        });
      },

      // -----------------------------------------------------------------------
      // Search
      // -----------------------------------------------------------------------

      searchEntities: (query) => {
        const state = get();
        const q = query.toLowerCase();
        const results: Array<{ type: EntityType | 'scene' | 'plotPoint'; entity: AnyEntity | Scene | PlotPoint }> = [];

        // Search characters
        for (const c of Object.values(state.characters)) {
          if (
            c.name.toLowerCase().includes(q) ||
            c.role.toLowerCase().includes(q) ||
            c.notes.toLowerCase().includes(q) ||
            c.traits.some((t) => t.toLowerCase().includes(q))
          ) {
            results.push({ type: 'character', entity: c });
          }
        }

        // Search locations
        for (const l of Object.values(state.locations)) {
          if (
            l.name.toLowerCase().includes(q) ||
            l.type.toLowerCase().includes(q) ||
            l.description.toLowerCase().includes(q)
          ) {
            results.push({ type: 'location', entity: l });
          }
        }

        // Search factions
        for (const f of Object.values(state.factions)) {
          if (
            f.name.toLowerCase().includes(q) ||
            f.ideology.toLowerCase().includes(q) ||
            f.description.toLowerCase().includes(q)
          ) {
            results.push({ type: 'faction', entity: f });
          }
        }

        // Search items
        for (const i of Object.values(state.items)) {
          if (
            i.name.toLowerCase().includes(q) ||
            i.category.toLowerCase().includes(q) ||
            i.description.toLowerCase().includes(q)
          ) {
            results.push({ type: 'item', entity: i });
          }
        }

        // Search events
        for (const e of Object.values(state.events)) {
          if (
            e.title.toLowerCase().includes(q) ||
            e.summary.toLowerCase().includes(q)
          ) {
            results.push({ type: 'event', entity: e });
          }
        }

        // Search scenes
        for (const s of Object.values(state.scenes)) {
          if (
            s.title.toLowerCase().includes(q) ||
            s.summary.toLowerCase().includes(q) ||
            s.draftText.toLowerCase().includes(q)
          ) {
            results.push({ type: 'scene', entity: s });
          }
        }

        // Search plot points
        for (const pp of Object.values(state.plotPoints)) {
          if (
            pp.title.toLowerCase().includes(q) ||
            pp.notes.toLowerCase().includes(q)
          ) {
            results.push({ type: 'plotPoint', entity: pp });
          }
        }

        return results;
      },

      // -----------------------------------------------------------------------
      // Helpers
      // -----------------------------------------------------------------------

      getEntityById: <T extends EntityType>(type: T, id: string): EntityMap[T] | undefined => {
        const state = get();
        const sliceKey = ENTITY_SLICE_KEY[type];
        const slice = state[sliceKey] as Record<string, EntityMap[T]>;
        return slice[id];
      },

      getScenesByChapter: (chapterNo) => {
        return Object.values(get().scenes)
          .filter((s) => s.chapterNo === chapterNo)
          .sort((a, b) => a.timelineIndex - b.timelineIndex);
      },

      getPlotPointsByChapter: (chapterNo) => {
        return Object.values(get().plotPoints)
          .filter((pp) => pp.chapterNo === chapterNo)
          .sort((a, b) => a.createdAt - b.createdAt);
      },

      getUnresolvedForeshadows: () => {
        return Object.values(get().foreshadows).filter((f) => f.status === 'open');
      },

      // -----------------------------------------------------------------------
      // Book CRUD
      // -----------------------------------------------------------------------

      addBook: (data) => {
        const id = uuidv4();
        const ts = now();
        const entity: Book = { ...data, id, createdAt: ts, updatedAt: ts };
        set((state) => ({
          books: { ...state.books, [id]: entity },
          revisionLogs: appendRevision(state, 'book', id, 'create', null, entity),
        }));
        return id;
      },

      updateBook: (id, patch) => {
        set((state) => {
          const prev = state.books[id];
          if (!prev) return state;
          const updated: Book = { ...prev, ...patch, updatedAt: now() };
          return {
            books: { ...state.books, [id]: updated },
            revisionLogs: appendRevision(state, 'book', id, 'update', prev, updated),
          };
        });
      },

      deleteBook: (id) => {
        set((state) => {
          const prev = state.books[id];
          if (!prev) return state;
          const { [id]: _, ...rest } = state.books;
          return {
            books: rest,
            revisionLogs: appendRevision(state, 'book', id, 'delete', prev, null),
          };
        });
      },

      // -----------------------------------------------------------------------
      // ManuscriptChapter CRUD
      // -----------------------------------------------------------------------

      addManuscriptChapter: (data) => {
        const id = uuidv4();
        const ts = now();
        const content = data.content || '';
        const wordCount = content.replace(/\s/g, '').length;
        const entity: ManuscriptChapter = { ...data, id, content, wordCount, lastEditedAt: ts, createdAt: ts, updatedAt: ts };
        set((state) => ({
          manuscriptChapters: { ...state.manuscriptChapters, [id]: entity },
          revisionLogs: appendRevision(state, 'manuscriptChapter', id, 'create', null, entity),
        }));
        return id;
      },

      updateManuscriptChapter: (id, patch) => {
        set((state) => {
          const prev = state.manuscriptChapters[id];
          if (!prev) return state;
          const updated: ManuscriptChapter = { ...prev, ...patch, updatedAt: now() };
          // Auto-compute wordCount when content changes
          const content = updated.content;
          updated.wordCount = content.replace(/\s/g, '').length;
          updated.lastEditedAt = now();
          return {
            manuscriptChapters: { ...state.manuscriptChapters, [id]: updated },
            revisionLogs: appendRevision(state, 'manuscriptChapter', id, 'update', prev, updated),
          };
        });
      },

      deleteManuscriptChapter: (id) => {
        set((state) => {
          const prev = state.manuscriptChapters[id];
          if (!prev) return state;
          const { [id]: _, ...rest } = state.manuscriptChapters;
          return {
            manuscriptChapters: rest,
            revisionLogs: appendRevision(state, 'manuscriptChapter', id, 'delete', prev, null),
          };
        });
      },

      reorderManuscriptChapters: (orderedIds) => {
        set((state) => {
          const updatedChapters = { ...state.manuscriptChapters };
          const ts = now();
          orderedIds.forEach((chapterId, index) => {
            const chapter = updatedChapters[chapterId];
            if (chapter) {
              updatedChapters[chapterId] = { ...chapter, sortOrder: index, updatedAt: ts };
            }
          });
          return {
            manuscriptChapters: updatedChapters,
            revisionLogs: appendRevision(state, 'manuscriptChapter', 'bulk-reorder', 'update', orderedIds, orderedIds),
          };
        });
      },

      // -----------------------------------------------------------------------
      // ManuscriptScene CRUD
      // -----------------------------------------------------------------------

      addManuscriptScene: (data) => {
        const id = uuidv4();
        const ts = now();
        const content = data.content;
        const wordCount = content.replace(/\s/g, '').length;
        const entity: ManuscriptScene = { ...data, id, wordCount, lastEditedAt: ts, createdAt: ts, updatedAt: ts };
        set((state) => ({
          manuscriptScenes: { ...state.manuscriptScenes, [id]: entity },
          revisionLogs: appendRevision(state, 'manuscriptScene', id, 'create', null, entity),
        }));
        return id;
      },

      updateManuscriptScene: (id, patch) => {
        set((state) => {
          const prev = state.manuscriptScenes[id];
          if (!prev) return state;
          const updated: ManuscriptScene = { ...prev, ...patch, updatedAt: now() };
          // If content is being updated, auto-compute wordCount
          const content = updated.content;
          const wordCount = content.replace(/\s/g, '').length;
          updated.wordCount = wordCount;
          updated.lastEditedAt = now();
          return {
            manuscriptScenes: { ...state.manuscriptScenes, [id]: updated },
            revisionLogs: appendRevision(state, 'manuscriptScene', id, 'update', prev, updated),
          };
        });
      },

      deleteManuscriptScene: (id) => {
        set((state) => {
          const prev = state.manuscriptScenes[id];
          if (!prev) return state;
          const { [id]: _, ...rest } = state.manuscriptScenes;
          return {
            manuscriptScenes: rest,
            revisionLogs: appendRevision(state, 'manuscriptScene', id, 'delete', prev, null),
          };
        });
      },

      reorderManuscriptScenes: (orderedIds) => {
        set((state) => {
          const updatedScenes = { ...state.manuscriptScenes };
          const ts = now();
          orderedIds.forEach((sceneId, index) => {
            const scene = updatedScenes[sceneId];
            if (scene) {
              updatedScenes[sceneId] = { ...scene, sortOrder: index, updatedAt: ts };
            }
          });
          return {
            manuscriptScenes: updatedScenes,
            revisionLogs: appendRevision(state, 'manuscriptScene', 'bulk-reorder', 'update', orderedIds, orderedIds),
          };
        });
      },

      // -----------------------------------------------------------------------
      // ManuscriptVersion
      // -----------------------------------------------------------------------

      addManuscriptVersion: (manuscriptSceneId) => {
        const state = get();
        const scene = state.manuscriptScenes[manuscriptSceneId];
        if (!scene) return '';
        const id = uuidv4();
        const version: ManuscriptVersion = {
          id,
          manuscriptSceneId,
          content: scene.content,
          wordCount: scene.wordCount,
          createdAt: now(),
        };
        set((state) => ({
          manuscriptVersions: { ...state.manuscriptVersions, [id]: version },
          revisionLogs: appendRevision(state, 'manuscriptVersion', id, 'create', null, version),
        }));
        return id;
      },

      // -----------------------------------------------------------------------
      // TextEntityReference
      // -----------------------------------------------------------------------

      addTextEntityReference: (data) => {
        const id = uuidv4();
        const ts = now();
        const entity: TextEntityReference = { ...data, id, createdAt: ts };
        set((state) => ({
          textEntityReferences: { ...state.textEntityReferences, [id]: entity },
          revisionLogs: appendRevision(state, 'textEntityReference', id, 'create', null, entity),
        }));
        return id;
      },

      removeTextEntityReference: (id) => {
        set((state) => {
          const prev = state.textEntityReferences[id];
          if (!prev) return state;
          const { [id]: _, ...rest } = state.textEntityReferences;
          return {
            textEntityReferences: rest,
            revisionLogs: appendRevision(state, 'textEntityReference', id, 'delete', prev, null),
          };
        });
      },

      // -----------------------------------------------------------------------
      // ExtractedProposal
      // -----------------------------------------------------------------------

      addExtractedProposal: (data) => {
        const id = uuidv4();
        const ts = now();
        const entity: ExtractedProposal = { ...data, id, createdAt: ts, updatedAt: ts };
        set((state) => ({
          extractedProposals: { ...state.extractedProposals, [id]: entity },
          revisionLogs: appendRevision(state, 'extractedProposal', id, 'create', null, entity),
        }));
        return id;
      },

      updateExtractedProposal: (id, patch) => {
        set((state) => {
          const prev = state.extractedProposals[id];
          if (!prev) return state;
          const updated: ExtractedProposal = { ...prev, ...patch, updatedAt: now() };
          return {
            extractedProposals: { ...state.extractedProposals, [id]: updated },
            revisionLogs: appendRevision(state, 'extractedProposal', id, 'update', prev, updated),
          };
        });
      },

      // -----------------------------------------------------------------------
      // Manuscript helpers
      // -----------------------------------------------------------------------

      getChaptersForBook: (bookId) => {
        return Object.values(get().manuscriptChapters)
          .filter((ch) => ch.bookId === bookId)
          .sort((a, b) => a.sortOrder - b.sortOrder);
      },

      getScenesForChapter: (chapterId) => {
        return Object.values(get().manuscriptScenes)
          .filter((s) => s.chapterId === chapterId)
          .sort((a, b) => a.sortOrder - b.sortOrder);
      },

      getVersionsForScene: (sceneId) => {
        return Object.values(get().manuscriptVersions)
          .filter((v) => v.manuscriptSceneId === sceneId)
          .sort((a, b) => a.createdAt - b.createdAt);
      },

      getReferencesForScene: (sceneId) => {
        return Object.values(get().textEntityReferences)
          .filter((r) => r.manuscriptSceneId === sceneId);
      },

      getProposalsForScene: (sceneId) => {
        return Object.values(get().extractedProposals)
          .filter((p) => p.manuscriptSceneId === sceneId);
      },

      // -----------------------------------------------------------------------
      // NarrativeThread CRUD
      // -----------------------------------------------------------------------

      addNarrativeThread: (data) => {
        const id = uuidv4();
        const ts = now();
        const entity: NarrativeThread = { ...data, id, createdAt: ts, updatedAt: ts };
        set((state) => ({
          narrativeThreads: { ...state.narrativeThreads, [id]: entity },
          revisionLogs: appendRevision(state, 'narrativeThread', id, 'create', null, entity),
        }));
        return id;
      },

      updateNarrativeThread: (id, patch) => {
        set((state) => {
          const prev = state.narrativeThreads[id];
          if (!prev) return state;
          const updated: NarrativeThread = { ...prev, ...patch, updatedAt: now() };
          return {
            narrativeThreads: { ...state.narrativeThreads, [id]: updated },
            revisionLogs: appendRevision(state, 'narrativeThread', id, 'update', prev, updated),
          };
        });
      },

      deleteNarrativeThread: (id) => {
        set((state) => {
          const prev = state.narrativeThreads[id];
          if (!prev) return state;
          const { [id]: _, ...rest } = state.narrativeThreads;
          return {
            narrativeThreads: rest,
            revisionLogs: appendRevision(state, 'narrativeThread', id, 'delete', prev, null),
          };
        });
      },

      getThreadsForScene: (sceneId) => {
        const state = get();
        const scene = state.scenes[sceneId];
        if (!scene) return [];
        const threadIds = scene.threadIds ?? [];
        return threadIds.map((tid) => state.narrativeThreads[tid]).filter(Boolean);
      },

      getOpenThreads: () => {
        return Object.values(get().narrativeThreads).filter(
          (t) => t.status !== 'resolved' && t.status !== 'abandoned' && t.status !== 'paused',
        );
      },
    }),
    {
      name: 'novel-assistant-data',
      storage: safeStorage,
      // Only persist data slices, not action functions
      partialize: (state) => ({
        characters: state.characters,
        locations: state.locations,
        factions: state.factions,
        items: state.items,
        events: state.events,
        scenes: state.scenes,
        boardChapters: state.boardChapters,
        sceneThreadLinks: state.sceneThreadLinks,
        plotPoints: state.plotPoints,
        foreshadows: state.foreshadows,
        links: state.links,
        revisionLogs: state.revisionLogs,
        books: state.books,
        manuscriptChapters: state.manuscriptChapters,
        manuscriptScenes: state.manuscriptScenes,
        manuscriptVersions: state.manuscriptVersions,
        textEntityReferences: state.textEntityReferences,
        extractedProposals: state.extractedProposals,
        narrativeThreads: state.narrativeThreads,
      }),
    },
  ),
);

// ---------------------------------------------------------------------------
// Utility: map revision entityType string to the correct state slice key
// ---------------------------------------------------------------------------

function getSliceKeyForRevision(entityType: string): keyof NovelState | null {
  const map: Record<string, keyof NovelState> = {
    character: 'characters',
    location: 'locations',
    faction: 'factions',
    item: 'items',
    event: 'events',
    scene: 'scenes',
    boardChapter: 'boardChapters',
    sceneThreadLink: 'sceneThreadLinks',
    plotPoint: 'plotPoints',
    foreshadow: 'foreshadows',
    link: 'links',
    book: 'books',
    manuscriptChapter: 'manuscriptChapters',
    manuscriptScene: 'manuscriptScenes',
    manuscriptVersion: 'manuscriptVersions',
    textEntityReference: 'textEntityReferences',
    extractedProposal: 'extractedProposals',
    narrativeThread: 'narrativeThreads',
  };
  return map[entityType] ?? null;
}
