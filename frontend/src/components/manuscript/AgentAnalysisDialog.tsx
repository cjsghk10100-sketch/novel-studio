import { useState, useMemo } from "react";
import { useNovelStore } from "@/lib/novel-store";
import { buildAnalysisPrompt, type PromptContext } from "@/lib/agent-prompt-builder";
import { parseAgentResult } from "@/lib/agent-result-parser";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Bot, Copy, Check, ExternalLink, ClipboardPaste,
  Sparkles, AlertCircle, ArrowRight,
} from "lucide-react";

type Step = "request" | "result";

interface AgentAnalysisDialogProps {
  open: boolean;
  onClose: () => void;
  chapterId: string | null;
}

export function AgentAnalysisDialog({ open, onClose, chapterId }: AgentAnalysisDialogProps) {
  const manuscriptChapters = useNovelStore((s) => s.manuscriptChapters);
  const characters = useNovelStore((s) => s.characters);
  const locations = useNovelStore((s) => s.locations);
  const factions = useNovelStore((s) => s.factions);
  const items = useNovelStore((s) => s.items);
  const events = useNovelStore((s) => s.events);
  const addExtractedProposal = useNovelStore((s) => s.addExtractedProposal);

  const [step, setStep] = useState<Step>("request");
  const [copied, setCopied] = useState(false);
  const [resultText, setResultText] = useState("");
  const [parseError, setParseError] = useState<string | null>(null);
  const [importedCount, setImportedCount] = useState(0);

  const chapter = chapterId ? manuscriptChapters[chapterId] : null;

  // 프롬프트 생성
  const prompt = useMemo(() => {
    if (!chapter) return "";
    const ctx: PromptContext = {
      episodeTitle: chapter.title,
      episodeContent: chapter.content,
      characters: Object.values(characters),
      locations: Object.values(locations),
      factions: Object.values(factions),
      items: Object.values(items),
      events: Object.values(events),
    };
    return buildAnalysisPrompt(ctx);
  }, [chapter, characters, locations, factions, items, events]);

  const handleCopyPrompt = async () => {
    try {
      await navigator.clipboard.writeText(prompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
      const ta = document.createElement("textarea");
      ta.value = prompt;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleOpenTelegram = () => {
    // 텔레그램 웹 열기 (봇 이름은 사용자가 설정)
    window.open("https://t.me", "_blank");
  };

  const handleImportResult = () => {
    if (!chapterId || !resultText.trim()) return;

    const result = parseAgentResult(resultText);

    if (!result.success || result.proposals.length === 0) {
      setParseError(result.error || "분석 결과를 파싱할 수 없습니다.");
      return;
    }

    setParseError(null);
    let count = 0;

    for (const proposal of result.proposals) {
      addExtractedProposal({
        manuscriptSceneId: chapterId,
        proposalType: proposal.proposalType,
        description: proposal.description,
        status: "pending",
        targetEntityType: proposal.targetEntityType,
        targetEntityId: proposal.targetEntityId,
      });
      count++;
    }

    setImportedCount(count);
  };

  const handleClose = () => {
    setStep("request");
    setCopied(false);
    setResultText("");
    setParseError(null);
    setImportedCount(0);
    onClose();
  };

  if (!chapter) return null;

  return (
    <Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
      <DialogContent className="max-w-lg bg-bg-chat border-border-strong">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-fg-base">
            <Bot className="h-5 w-5 text-tag-purple-100" />
            에이전트 분석
          </DialogTitle>
          <DialogDescription className="text-fg-muted">
            {step === "request"
              ? "본문을 에이전트에게 보내서 분석받을 수 있습니다."
              : "에이전트의 분석 결과를 붙여넣으세요."}
          </DialogDescription>
        </DialogHeader>

        {step === "request" ? (
          <div className="space-y-4">
            {/* 프롬프트 미리보기 */}
            <div className="border border-border-strong rounded-lg overflow-hidden">
              <div className="px-3 py-2 bg-bg-subtle border-b border-border-strong flex items-center gap-2">
                <Sparkles className="h-3.5 w-3.5 text-tag-purple-100" />
                <span className="text-xs font-medium text-fg-base">분석 요청 프롬프트</span>
                <span className="text-[10px] text-fg-muted ml-auto">{prompt.length.toLocaleString()}자</span>
              </div>
              <ScrollArea className="h-48">
                <pre className="p-3 text-[11px] text-fg-base whitespace-pre-wrap font-mono leading-relaxed">
                  {prompt.slice(0, 500)}
                  {prompt.length > 500 && <span className="text-fg-muted">... (전체 {prompt.length}자)</span>}
                </pre>
              </ScrollArea>
            </div>

            {/* 안내 */}
            <div className="space-y-2 text-xs text-fg-muted">
              <p className="font-medium text-fg-base">사용 방법:</p>
              <ol className="space-y-1.5 pl-4 list-decimal">
                <li>아래 <strong>"프롬프트 복사"</strong> 버튼을 누르세요</li>
                <li>텔레그램에서 <strong>OpenClaw 에이전트</strong>에게 붙여넣기하세요</li>
                <li>에이전트가 JSON으로 응답하면 <strong>"결과 가져오기"</strong>로 진행하세요</li>
              </ol>
            </div>

            {/* 액션 버튼 */}
            <div className="flex items-center gap-2">
              <Button
                onClick={handleCopyPrompt}
                className="flex-1 bg-tag-purple-10 text-tag-purple-100 hover:bg-tag-purple-100/20 border-0"
              >
                {copied ? <Check className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
                {copied ? "복사됨!" : "프롬프트 복사"}
              </Button>
              <Button
                variant="outline"
                onClick={handleOpenTelegram}
                className="border-border-strong"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                텔레그램 열기
              </Button>
            </div>

            <div className="flex justify-end">
              <Button
                variant="ghost"
                onClick={() => setStep("result")}
                className="text-xs text-tag-cyan-100"
              >
                결과 가져오기
                <ArrowRight className="h-3.5 w-3.5 ml-1" />
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* 결과 입력 */}
            <div>
              <label className="text-xs font-medium text-fg-base mb-1.5 block">
                에이전트 분석 결과 (JSON)
              </label>
              <textarea
                value={resultText}
                onChange={(e) => {
                  setResultText(e.target.value);
                  setParseError(null);
                  setImportedCount(0);
                }}
                className="w-full h-48 rounded-lg border border-border-strong bg-bg-subtle text-fg-base text-xs font-mono p-3 resize-none focus:outline-none focus:ring-1 focus:ring-tag-purple-100"
                placeholder={'에이전트가 보내준 JSON 응답을 여기에 붙여넣으세요...\n\n예시:\n{\n  "proposals": [\n    {\n      "type": "new_entity",\n      "entityType": "character",\n      "name": "이름",\n      "description": "설명"\n    }\n  ]\n}'}
              />
            </div>

            {/* 에러 메시지 */}
            {parseError && (
              <div className="flex items-start gap-2 text-xs bg-red-500/10 text-red-400 rounded-md px-3 py-2">
                <AlertCircle className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                <span>{parseError}</span>
              </div>
            )}

            {/* 성공 메시지 */}
            {importedCount > 0 && (
              <div className="flex items-center gap-2 text-xs bg-tag-cyan-10 text-tag-cyan-100 rounded-md px-3 py-2">
                <Check className="h-3.5 w-3.5" />
                <span>{importedCount}개 제안이 등록되었습니다. 오른쪽 "제안" 탭에서 확인하세요.</span>
              </div>
            )}

            {/* 액션 버튼 */}
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                onClick={() => {
                  setStep("request");
                  setParseError(null);
                  setImportedCount(0);
                }}
                className="text-xs"
              >
                ← 돌아가기
              </Button>
              <div className="flex-1" />
              {importedCount > 0 ? (
                <Button onClick={handleClose} className="bg-tag-cyan-10 text-tag-cyan-100 hover:bg-tag-cyan-100/20 border-0">
                  완료
                </Button>
              ) : (
                <Button
                  onClick={handleImportResult}
                  disabled={!resultText.trim()}
                  className="bg-tag-purple-10 text-tag-purple-100 hover:bg-tag-purple-100/20 border-0"
                >
                  <ClipboardPaste className="h-4 w-4 mr-2" />
                  결과 가져오기
                </Button>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
