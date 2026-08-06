import { CalendarDays, Database, FileText, Layers3 } from "lucide-react";

import type { DocumentDetail, DocumentDetailsState } from "@/lib/types";

type DocumentDetailsPanelProps = {
  document: DocumentDetail | null;
  state: DocumentDetailsState;
};

function formatDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Unknown date";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

function formatContentType(contentType: string | null) {
  if (contentType === "text/markdown") {
    return "Markdown";
  }

  if (contentType === "text/plain") {
    return "Plain text";
  }

  return contentType ?? "Document";
}

export function DocumentDetailsPanel({
  document,
  state,
}: DocumentDetailsPanelProps) {
  if (state === "idle") {
    return (
      <aside className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
          <FileText className="h-6 w-6" />
        </div>

        <h3 className="mt-5 text-lg font-semibold text-slate-950">
          Select a document
        </h3>

        <p className="mt-2 text-sm leading-6 text-slate-600">
          Choose a document from the library to inspect its metadata, sections,
          chunks, and embedding details.
        </p>
      </aside>
    );
  }

  if (state === "loading") {
    return (
      <aside className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="h-6 w-2/3 animate-pulse rounded bg-slate-200" />
        <div className="h-4 w-full animate-pulse rounded bg-slate-100" />
        <div className="h-4 w-4/5 animate-pulse rounded bg-slate-100" />

        <div className="mt-6 space-y-3">
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className="h-20 animate-pulse rounded-xl border border-slate-200 bg-slate-50"
            />
          ))}
        </div>
      </aside>
    );
  }

  if (!document) {
    return (
      <aside className="rounded-2xl border border-red-200 bg-red-50 p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-red-950">
          Document unavailable
        </h3>

        <p className="mt-2 text-sm text-red-800">
          The selected document could not be loaded.
        </p>
      </aside>
    );
  }

  const embeddingDimensions =
    document.chunks.find((chunk) => chunk.embedding_dimensions !== null)
      ?.embedding_dimensions ?? null;

  return (
    <aside className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
            <FileText className="h-6 w-6" />
          </div>

          <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold capitalize text-emerald-800">
            {document.status}
          </span>
        </div>

        <h3 className="mt-5 text-xl font-semibold text-slate-950">
          {document.title}
        </h3>

        <p className="mt-2 break-all text-sm text-slate-500">
          {document.file_name ?? document.source ?? "Knowledge source"}
        </p>
      </div>

      <div className="grid gap-4 border-b border-slate-200 p-6 sm:grid-cols-2 2xl:grid-cols-1">
        <div className="rounded-xl bg-slate-50 p-4">
          <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-slate-500">
            <Layers3 className="h-4 w-4" />
            Chunks
          </div>

          <p className="mt-2 text-lg font-semibold text-slate-950">
            {document.chunk_count}
          </p>
        </div>

        <div className="rounded-xl bg-slate-50 p-4">
          <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-slate-500">
            <Database className="h-4 w-4" />
            Dimensions
          </div>

          <p className="mt-2 text-lg font-semibold text-slate-950">
            {embeddingDimensions ?? "Not available"}
          </p>
        </div>

        <div className="rounded-xl bg-slate-50 p-4">
          <div className="text-xs font-medium uppercase tracking-wider text-slate-500">
            Format
          </div>

          <p className="mt-2 text-sm font-semibold text-slate-950">
            {formatContentType(document.content_type)}
          </p>
        </div>

        <div className="rounded-xl bg-slate-50 p-4">
          <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-slate-500">
            <CalendarDays className="h-4 w-4" />
            Indexed
          </div>

          <p className="mt-2 text-sm font-semibold text-slate-950">
            {formatDate(document.created_at)}
          </p>
        </div>
      </div>

      <div className="p-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-700">
              Indexed content
            </p>

            <h4 className="mt-2 text-lg font-semibold text-slate-950">
              Sections and chunks
            </h4>
          </div>

          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
            {document.chunks.length}
          </span>
        </div>

        <div className="mt-5 max-h-[760px] space-y-3 overflow-y-auto pr-1">
          {document.chunks.map((chunk) => (
            <details
              key={chunk.id}
              className="group rounded-xl border border-slate-200 bg-white"
            >
              <summary className="cursor-pointer list-none p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
                      Chunk {chunk.chunk_index + 1}
                    </p>

                    <p className="mt-1 text-sm font-semibold text-slate-950">
                      {chunk.section ?? "Whole document"}
                    </p>
                  </div>

                  <span className="text-xs font-medium text-blue-700">
                    View
                  </span>
                </div>
              </summary>

              <div className="border-t border-slate-200 bg-slate-50 p-4">
                <p className="whitespace-pre-wrap text-sm leading-6 text-slate-700">
                  {chunk.content}
                </p>

                <div className="mt-4 flex items-center justify-between border-t border-slate-200 pt-3 text-xs text-slate-500">
                  <span>Embedding dimensions</span>
                  <span className="font-semibold text-slate-700">
                    {chunk.embedding_dimensions ?? "Unavailable"}
                  </span>
                </div>
              </div>
            </details>
          ))}
        </div>
      </div>
    </aside>
  );
}
