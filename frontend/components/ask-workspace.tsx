"use client";

import { useEffect, useRef, useState } from "react";

import { AnswerCard } from "@/components/answer-card";
import { AskForm } from "@/components/ask-form";
import { QuestionCard } from "@/components/question-card";
import { SourcePanel } from "@/components/source-panel";
import { askCopilot } from "@/lib/api";
import type { CopilotRequestState, CopilotResponse } from "@/lib/types";

export function AskWorkspace() {
  const [draftQuestion, setDraftQuestion] = useState("");
  const [submittedQuestion, setSubmittedQuestion] = useState("");
  const [askedAt, setAskedAt] = useState<Date | null>(null);
  const [response, setResponse] = useState<CopilotResponse | null>(null);
  const [requestState, setRequestState] = useState<CopilotRequestState>("idle");
  const [error, setError] = useState<string | null>(null);
  const [responseTime, setResponseTime] = useState<number | null>(null);

  const requestController = useRef<AbortController | null>(null);
  const stageTimers = useRef<number[]>([]);

  function clearStageTimers() {
    stageTimers.current.forEach((timer) => {
      window.clearTimeout(timer);
    });

    stageTimers.current = [];
  }

  useEffect(() => {
    return () => {
      requestController.current?.abort();
      clearStageTimers();
    };
  }, []);

  async function submitQuestion() {
    const question = draftQuestion.trim();

    if (question.length < 3) {
      return;
    }

    requestController.current?.abort();
    clearStageTimers();

    const controller = new AbortController();
    requestController.current = controller;

    setSubmittedQuestion(question);
    setAskedAt(new Date());
    setResponse(null);
    setError(null);
    setResponseTime(null);
    setRequestState("retrieving");

    stageTimers.current = [
      window.setTimeout(() => {
        setRequestState((current) =>
          current === "retrieving" ? "reranking" : current
        );
      }, 850),

      window.setTimeout(() => {
        setRequestState((current) =>
          current === "reranking" || current === "retrieving"
            ? "generating"
            : current
        );
      }, 1900),
    ];

    const startedAt = performance.now();

    try {
      const result = await askCopilot(question, controller.signal);

      clearStageTimers();

      setResponse(result);
      setResponseTime(performance.now() - startedAt);
      setRequestState("complete");
    } catch (caughtError) {
      clearStageTimers();

      if (
        caughtError instanceof DOMException &&
        caughtError.name === "AbortError"
      ) {
        return;
      }

      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "An unexpected error occurred."
      );

      setRequestState("error");
    }
  }

  return (
    <div className="grid gap-5 p-5 xl:grid-cols-[minmax(0,1fr)_370px] lg:p-7">
      <div className="space-y-5">
        <QuestionCard question={submittedQuestion} askedAt={askedAt} />

        <AnswerCard
          response={response}
          requestState={requestState}
          error={error}
          responseTime={responseTime}
        />

        <AskForm
          value={draftQuestion}
          requestState={requestState}
          onChange={setDraftQuestion}
          onSubmit={submitQuestion}
        />

        <p className="text-center text-xs text-slate-500">
          Copilot can make mistakes. Verify important information.
        </p>
      </div>

      <SourcePanel response={response} requestState={requestState} />
    </div>
  );
}
