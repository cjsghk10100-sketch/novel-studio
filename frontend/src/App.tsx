import { useState, useEffect, useCallback } from "react";
import {
  BookOpen,
  Layout,
  ShieldCheck,
  History,
  Database,
  Feather,
  PenTool,
} from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { WikiPage } from "@/components/wiki/WikiPage";
import { BoardPage } from "@/components/board/BoardPage";
import { ManuscriptPage } from "@/components/manuscript/ManuscriptPage";
import ConsistencyPage from "@/components/consistency/ConsistencyPage";
import HistoryPage from "@/components/history/HistoryPage";
import { useNovelStore } from "@/lib/novel-store";
import { useConsistencyStore } from "@/lib/consistency-store";
import { seedData } from "@/lib/seed-data";
import { sampleConsistencyIssues } from "@/lib/consistency-seed";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

type Page = "wiki" | "board" | "manuscript" | "consistency" | "history";

const NAV_ITEMS: { id: Page; label: string; icon: typeof BookOpen }[] = [
  { id: "wiki", label: "\uc138\uacc4\uad00 \uc704\ud0a4", icon: BookOpen },
  { id: "board", label: "\uad6c\uc131 \ubcf4\ub4dc", icon: Layout },
  { id: "manuscript", label: "\ubcf8\ud3b8 \uc9d1\ud544", icon: PenTool },
  { id: "consistency", label: "\uc815\ud569\uc131 \uac80\uc0ac", icon: ShieldCheck },
  { id: "history", label: "\uc218\uc815 \uc774\ub825", icon: History },
];

export default function App() {
  const [page, setPage] = useState<Page>("wiki");
  const [showSeedDialog, setShowSeedDialog] = useState(false);

  const characters = useNovelStore((s) => s.characters);
  const hasData = Object.keys(characters).length > 0;

  // Check if first load with no data
  useEffect(() => {
    if (!hasData) {
      setShowSeedDialog(true);
    }
  }, []);

  const loadSeedData = useCallback(() => {
    // Load all seed data into the store
    const store = useNovelStore.getState();

    // Characters
    for (const char of Object.values(seedData.characters)) {
      store.addCharacter({
        name: char.name,
        age: char.age,
        birthYear: char.birthYear,
        deathYear: char.deathYear,
        role: char.role,
        traits: char.traits,
        notes: char.notes,
      });
    }

    // Locations
    for (const loc of Object.values(seedData.locations)) {
      store.addLocation({
        name: loc.name,
        type: loc.type,
        description: loc.description,
      });
    }

    // Factions
    for (const fac of Object.values(seedData.factions)) {
      store.addFaction({
        name: fac.name,
        ideology: fac.ideology,
        description: fac.description,
      });
    }

    // Items
    for (const item of Object.values(seedData.items)) {
      store.addItem({
        name: item.name,
        category: item.category,
        description: item.description,
      });
    }

    // Events
    for (const evt of Object.values(seedData.events)) {
      store.addEvent({
        title: evt.title,
        timelineIndex: evt.timelineIndex,
        summary: evt.summary,
      });
    }

    // Scenes
    for (const scene of Object.values(seedData.scenes)) {
      store.addScene({
        title: scene.title,
        chapterNo: scene.chapterNo,
        actNo: scene.actNo,
        timelineIndex: scene.timelineIndex,
        summary: scene.summary,
        draftText: scene.draftText,
        characterIds: scene.characterIds,
        locationIds: scene.locationIds,
        itemIds: scene.itemIds,
        povCharacterId: scene.povCharacterId ?? null,
        goal: scene.goal ?? "",
        conflict: scene.conflict ?? "",
        turn: scene.turn ?? "",
        outcome: scene.outcome ?? "",
        emotionalShiftFrom: scene.emotionalShiftFrom ?? "",
        emotionalShiftTo: scene.emotionalShiftTo ?? "",
        emotionalShift: scene.emotionalShift ?? "",
        infoRevealed: scene.infoRevealed ?? "",
        hookEnd: scene.hookEnd ?? "",
        threadIds: scene.threadIds ?? [],
        manuscriptStatus: scene.manuscriptStatus ?? "planned",
        wordCount: scene.wordCount ?? 0,
      });
    }

    // Plot Points
    for (const pp of Object.values(seedData.plotPoints)) {
      store.addPlotPoint({
        type: pp.type,
        title: pp.title,
        chapterNo: pp.chapterNo,
        notes: pp.notes,
        sceneId: pp.sceneId,
      });
    }

    // Foreshadows
    for (const fs of Object.values(seedData.foreshadows)) {
      store.addForeshadow({
        setupSceneId: fs.setupSceneId,
        payoffSceneId: fs.payoffSceneId,
        note: fs.note,
        status: fs.status,
      });
    }

    // Books
    for (const book of Object.values(seedData.books)) {
      store.addBook({
        title: book.title,
        sortOrder: book.sortOrder,
      });
    }

    // Manuscript Chapters
    for (const ch of Object.values(seedData.manuscriptChapters)) {
      store.addManuscriptChapter({
        bookId: ch.bookId,
        title: ch.title,
        sortOrder: ch.sortOrder,
        content: ch.content,
        summary: ch.summary,
        status: ch.status,
        linkedBoardSceneId: ch.linkedBoardSceneId,
        povCharacterId: ch.povCharacterId,
        locationId: ch.locationId,
        timelineLabel: ch.timelineLabel,
      });
    }

    // Manuscript Scenes
    for (const ms of Object.values(seedData.manuscriptScenes)) {
      store.addManuscriptScene({
        chapterId: ms.chapterId,
        bookId: ms.bookId,
        title: ms.title,
        sortOrder: ms.sortOrder,
        linkedBoardSceneId: ms.linkedBoardSceneId,
        povCharacterId: ms.povCharacterId,
        locationId: ms.locationId,
        timelineLabel: ms.timelineLabel,
        status: ms.status,
        content: ms.content,
        summary: ms.summary,
        goal: ms.goal,
        conflict: ms.conflict,
        outcome: ms.outcome,
      });
    }

    // Extracted Proposals
    for (const ep of Object.values(seedData.extractedProposals)) {
      store.addExtractedProposal({
        manuscriptSceneId: ep.manuscriptSceneId,
        proposalType: ep.proposalType,
        description: ep.description,
        status: ep.status,
        targetEntityType: ep.targetEntityType,
        targetEntityId: ep.targetEntityId,
      });
    }

    // Narrative Threads
    for (const nt of Object.values(seedData.narrativeThreads)) {
      store.addNarrativeThread({
        type: nt.type,
        title: nt.title,
        description: nt.description,
        status: nt.status,
        setupSceneId: nt.setupSceneId,
        latestSceneId: nt.latestSceneId,
        payoffSceneId: nt.payoffSceneId,
        relatedCharacterIds: nt.relatedCharacterIds,
        relatedEntityIds: nt.relatedEntityIds,
      });
    }

    // Consistency Issues
    const cStore = useConsistencyStore.getState();
    for (const issue of sampleConsistencyIssues) {
      cStore.createIssue(issue);
    }

    setShowSeedDialog(false);
  }, []);

  return (
    <div className="flex h-screen flex-col bg-bg-chat overflow-hidden">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-border-base px-4 py-2 bg-bg-chat shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Feather className="w-5 h-5 text-brand-100" />
            <h1 className="text-base font-bold text-fg-base tracking-tight">
              Novel Studio
            </h1>
          </div>
          <span className="text-xs text-fg-muted font-mono">MVP</span>
        </div>

        {/* Navigation */}
        <nav className="flex items-center gap-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = page === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setPage(item.id)}
                className={`
                  flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded transition-colors
                  ${isActive
                    ? "bg-bg-subtle-hover text-fg-base"
                    : "text-fg-subtle hover:text-fg-base hover:bg-bg-subtle"
                  }
                `}
              >
                <Icon className="w-3.5 h-3.5" />
                <span className="hidden md:inline">{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          {!hasData && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowSeedDialog(true)}
              className="text-xs gap-1.5"
            >
              <Database className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{"\uc0d8\ud50c \ub370\uc774\ud130"}</span>
            </Button>
          )}
          <ThemeToggle />
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 overflow-hidden">
        {page === "wiki" && <WikiPage />}
        {page === "board" && <BoardPage />}
        {page === "manuscript" && <ManuscriptPage />}
        {page === "consistency" && <ConsistencyPage />}
        {page === "history" && <HistoryPage />}
      </main>

      {/* Seed data dialog */}
      <Dialog open={showSeedDialog} onOpenChange={setShowSeedDialog}>
        <DialogContent className="border-border-strong bg-bg-chat sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-fg-base flex items-center gap-2">
              <Feather className="w-5 h-5 text-brand-100" />
              Novel Studio
            </DialogTitle>
            <DialogDescription className="text-fg-subtle">
              {"\uc0d8\ud50c \uc138\uacc4\uad00 \ub370\uc774\ud130\ub97c \ubd88\ub7ec\uc640\uc11c \uc571 \uae30\ub2a5\uc744 \ud0d0\uc0c9\ud558\uc2dc\uaca0\uc2b5\ub2c8\uae4c? \uc778\ubb3c 5\uba85, \uc9c0\uc5ed 4\uac1c, \uc138\ub825 3\uac1c, \uc544\uc774\ud15c 3\uac1c, \uc0ac\uac74 5\uac1c, \uc7a5\uba74 8\uac1c, \uc6d0\uace0 \ub370\uc774\ud130\uc640 \uc815\ud569\uc131 \ud14c\uc2a4\ud2b8\ub97c \uc704\ud55c \uc758\ub3c4\uc801 \ucda9\ub3cc\uc774 \ud3ec\ud568\ub418\uc5b4 \uc788\uc2b5\ub2c8\ub2e4."}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button
              variant="ghost"
              onClick={() => setShowSeedDialog(false)}
              className="text-fg-subtle"
            >
              {"\ube48 \uc0c1\ud0dc\ub85c \uc2dc\uc791"}
            </Button>
            <Button onClick={loadSeedData}>
              {"\uc0d8\ud50c \ub370\uc774\ud130 \ubd88\ub7ec\uc624\uae30"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
