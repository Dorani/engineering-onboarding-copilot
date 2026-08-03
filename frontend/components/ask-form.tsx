"use client";

import { LoaderCircle, Paperclip, Send, SlidersHorizontal } from "lucide-react";
import type { FormEvent, KeyboardEvent } from "react";

import type { CopilotRequestState } from "@/lib/types";

type AskFormProps = {
  value: string;
  requestState: CopilotRequestState;
  onChange: (value: string) => void;
  onSubmit: () => void;
};

const statusLabels: Partial<Record<CopilotRequestState, string>> = {
  retrieving: "Retrieving evidence...",
  reranking: "Reranking sources...",
  generating: "Generating grounded answer...",
};

export function AskForm({
  value = "",
  requestState = "idle",
  onChange,
  onSubmit,
}: AskFormProps) {
  const isLoading = ["retrieving", "reranking", "generating"].includes(
    requestState
  );

  const trimmedValue = value.trim();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!isLoading && trimmedValue.length >= 3) {
      onSubmit();
    }
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (
      event.key === "Enter" &&
      !event.shiftKey &&
      !event.nativeEvent.isComposing
    ) {
      event.preventDefault();

      if (!isLoading && trimmedValue.length >= 3) {
        onSubmit();
      }
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-xl border border-blue-500 bg-white p-5 shadow-sm"
    >
      <textarea
        rows={3}
        value={value}
        disabled={isLoading}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Ask a question about engineering processes, tools, standards, or best practices..."
        className="w-full resize-none bg-transparent text-[15px] text-slate-900 outline-none placeholder:text-slate-400 disabled:cursor-not-allowed disabled:opacity-60"
      />

      <div className="mt-5 flex flex-wrap items-center gap-2">
        <button
          type="button"
          aria-label="Attach document"
          disabled
          title="Document upload is coming later"
          className="flex h-10 w-10 cursor-not-allowed items-center justify-center rounded-lg border border-slate-200 text-slate-400"
        >
          <Paperclip className="h-4 w-4" />
        </button>

        <button
          type="button"
          aria-label="Question settings"
          disabled
          title="Question settings are coming later"
          className="flex h-10 w-10 cursor-not-allowed items-center justify-center rounded-lg border border-slate-200 text-slate-400"
        >
          <SlidersHorizontal className="h-4 w-4" />
        </button>

        {isLoading && (
          <div
            className="ml-2 flex items-center gap-2 text-sm text-slate-500"
            role="status"
            aria-live="polite"
          >
            <LoaderCircle className="h-4 w-4 animate-spin text-blue-700" />
            {statusLabels[requestState]}
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading || trimmedValue.length < 3}
          className="ml-auto inline-flex items-center gap-2 rounded-lg bg-blue-700 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:bg-slate-300"
        >
          {isLoading ? (
            <LoaderCircle className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}

          {isLoading ? "Working..." : "Ask Copilot"}
        </button>
      </div>

      <p className="mt-3 text-right text-xs text-slate-400">
        Press Enter to submit · Shift + Enter for a new line
      </p>
    </form>
  );
}
