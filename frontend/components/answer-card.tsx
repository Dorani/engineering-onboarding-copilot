"use client";

import {
  CheckCircle2,
  Copy,
  Info,
  LoaderCircle,
  Sparkles,
  TriangleAlert,
} from "lucide-react";
import { useState } from "react";

import type { CopilotRequestState, CopilotResponse } from "@/lib/types";

type AnswerCardProps = {
  response: CopilotResponse | null;
  requestState: CopilotRequestState;
  error: string | null;
  responseTime: number | null;
};

const loadingContent: Record<
  "retrieving" | "reranking" | "generating",
  {
    title: string;
    description: string;
  }
> = {
  retrieving: {
    title: "Retrieving evidence",
    description:
      "Searching the engineering knowledge base for relevant documentation.",
  },
  reranking: {
    title: "Reranking sources",
    description:
      "Evaluating the candidate evidence against your exact question.",
  },
  generating: {
    title: "Generating a grounded answer",
    description: "Synthesizing the selected evidence and validating citations.",
  },
};

function LoadingAnswer({
  requestState,
}: {
  requestState: "retrieving" | "reranking" | "generating";
}) {
  const content = loadingContent[requestState];

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
      <div className="flex min-h-65 flex-col items-center justify-center text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50">
          <LoaderCircle className="h-7 w-7 animate-spin text-blue-700" />
        </div>

        <h3 className="mt-5 text-lg font-semibold text-slate-950">
          {content.title}
        </h3>

        <p className="mt-2 max-w-lg text-sm leading-6 text-slate-500">
          {content.description}
        </p>

        <div className="mt-6 flex gap-2">
          {["retrieving", "reranking", "generating"].map((stage) => (
            <span
              key={stage}
              className={[
                "h-1.5 w-12 rounded-full",
                stage === requestState ? "bg-blue-700" : "bg-slate-200",
              ].join(" ")}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

export function AnswerCard({
  response,
  requestState,
  error,
  responseTime,
}: AnswerCardProps) {
  const [copied, setCopied] = useState(false);

  if (
    requestState === "retrieving" ||
    requestState === "reranking" ||
    requestState === "generating"
  ) {
    return <LoadingAnswer requestState={requestState} />;
  }

  if (error) {
    return (
      <section className="rounded-xl border border-red-200 bg-white p-7 shadow-sm">
        <div className="flex items-start gap-3">
          <TriangleAlert className="mt-0.5 h-6 w-6 shrink-0 text-red-600" />

          <div>
            <h3 className="font-semibold text-slate-950">
              Copilot could not complete the request
            </h3>

            <p className="mt-2 text-sm leading-6 text-slate-600">{error}</p>

            <p className="mt-3 text-xs text-slate-500">
              Confirm that FastAPI, PostgreSQL, and your model credentials are
              available, then try again.
            </p>
          </div>
        </div>
      </section>
    );
  }

  if (!response) {
    return (
      <section className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="flex min-h-65 flex-col items-center justify-center text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50">
            <Sparkles className="h-7 w-7 text-blue-700" />
          </div>

          <h3 className="mt-5 text-lg font-semibold text-slate-950">
            Your grounded answer will appear here
          </h3>

          <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">
            Ask about deployments, architecture, code reviews, incidents,
            observability, testing, AI standards, or other indexed engineering
            knowledge.
          </p>
        </div>
      </section>
    );
  }

  async function copyAnswer() {
    await navigator.clipboard.writeText(response?.answer ?? "");
    setCopied(true);

    window.setTimeout(() => setCopied(false), 1600);
  }

  return (
    <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="p-6">
        <div className="flex flex-col gap-4 border-b border-slate-200 pb-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <Sparkles className="h-8 w-8 text-blue-700" />

            <div>
              <h3 className="text-lg font-semibold text-slate-950">
                Copilot Answer
              </h3>

              <div className="mt-1 flex items-center gap-2 text-sm text-slate-600">
                Grounded
                <span
                  className={[
                    "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold",
                    response.grounded
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-red-50 text-red-600",
                  ].join(" ")}
                >
                  {response.grounded ? (
                    <CheckCircle2 className="h-3.5 w-3.5" />
                  ) : (
                    <TriangleAlert className="h-3.5 w-3.5" />
                  )}

                  {response.grounded ? "Yes" : "No"}
                </span>
              </div>
            </div>
          </div>

          <div
            className={[
              "inline-flex items-center gap-2 rounded-lg border px-4 py-3 text-sm font-medium",
              response.grounded
                ? "border-emerald-200 bg-emerald-50/50 text-emerald-800"
                : "border-amber-200 bg-amber-50/50 text-amber-800",
            ].join(" ")}
          >
            {response.grounded
              ? "Grounded in Evidence"
              : "Insufficient Evidence"}

            <Info className="h-4 w-4" />
          </div>
        </div>

        <div className="pt-6">
          <div className="whitespace-pre-wrap text-[15px] leading-7 text-slate-800">
            {response.answer}
          </div>

          {!response.grounded && (
            <div className="mt-7 rounded-xl border border-blue-200 bg-blue-50/60 p-5">
              <div className="flex items-start gap-3">
                <Info className="mt-0.5 h-5 w-5 shrink-0 text-blue-700" />

                <div>
                  <p className="font-semibold text-blue-900">
                    Why Copilot abstained
                  </p>

                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    Copilot only answers when the available documentation
                    contains sufficient evidence. This prevents unsupported
                    answers from being presented as company policy.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <footer className="flex flex-wrap items-center gap-4 border-t border-slate-200 px-6 py-4 text-xs text-slate-500">
        <span>Pipeline</span>
        <span className="font-medium text-slate-700">
          Vector + Reranker + Grounding
        </span>

        {responseTime !== null && (
          <>
            <span className="h-4 border-l border-slate-300" />
            <span>Response time</span>
            <span className="font-medium text-slate-700">
              {(responseTime / 1000).toFixed(2)}s
            </span>
          </>
        )}

        <button
          onClick={copyAnswer}
          className="ml-auto inline-flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          <Copy className="h-4 w-4" />
          {copied ? "Copied" : "Copy"}
        </button>
      </footer>
    </section>
  );
}
