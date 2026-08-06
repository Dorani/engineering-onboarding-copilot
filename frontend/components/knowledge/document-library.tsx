import {
  BookOpen,
  CalendarDays,
  Database,
  FileText,
  Layers3,
} from "lucide-react";

import type { DocumentLibraryState, DocumentSummary } from "@/lib/types";

type DocumentLibraryProps = {
  documents: DocumentSummary[];
  libraryState: DocumentLibraryState;
  error: string | null;
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

export function DocumentLibrary({
  documents,
  libraryState,
  error,
}: DocumentLibraryProps) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-col gap-3 border-b border-slate-200 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-700">
            Indexed knowledge
          </p>

          <h3 className="mt-2 text-xl font-semibold text-slate-950">
            Knowledge Library
          </h3>

          <p className="mt-1 text-sm text-slate-500">
            Documents currently available to grounded retrieval.
          </p>
        </div>

        {libraryState === "ready" ? (
          <span className="w-fit rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
            {documents.length}{" "}
            {documents.length === 1 ? "document" : "documents"}
          </span>
        ) : null}
      </div>

      {libraryState === "loading" ? (
        <div className="grid gap-4 p-6 md:grid-cols-2 xl:grid-cols-3">
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className="h-52 animate-pulse rounded-2xl border border-slate-200 bg-slate-50"
            />
          ))}
        </div>
      ) : null}

      {libraryState === "error" ? (
        <div className="p-6">
          <div className="rounded-xl border border-red-200 bg-red-50 p-5">
            <p className="font-semibold text-red-950">
              Knowledge library unavailable
            </p>

            <p className="mt-2 text-sm text-red-800">
              {error ?? "The indexed documents could not be loaded."}
            </p>
          </div>
        </div>
      ) : null}

      {libraryState === "ready" && documents.length === 0 ? (
        <div className="flex min-h-72 flex-col items-center justify-center px-6 py-12 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-600">
            <BookOpen className="h-7 w-7" />
          </div>

          <h4 className="mt-5 text-lg font-semibold text-slate-950">
            No indexed documents
          </h4>

          <p className="mt-2 max-w-md text-sm leading-6 text-slate-600">
            Upload a Markdown or plain-text document to create your first
            searchable knowledge source.
          </p>
        </div>
      ) : null}

      {libraryState === "ready" && documents.length > 0 ? (
        <div className="grid gap-4 p-6 md:grid-cols-2 xl:grid-cols-3">
          {documents.map((document) => (
            <article
              key={document.id}
              className="rounded-2xl border border-slate-200 bg-white p-5 transition hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-md"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
                  <FileText className="h-5 w-5" />
                </div>

                <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold capitalize text-emerald-800">
                  {document.status}
                </span>
              </div>

              <h4 className="mt-5 line-clamp-2 text-base font-semibold text-slate-950">
                {document.title}
              </h4>

              <p className="mt-2 truncate text-sm text-slate-500">
                {document.file_name ?? document.source ?? "Knowledge source"}
              </p>

              <dl className="mt-5 space-y-3 border-t border-slate-100 pt-4">
                <div className="flex items-center justify-between gap-4">
                  <dt className="flex items-center gap-2 text-xs text-slate-500">
                    <Layers3 className="h-4 w-4" />
                    Chunks
                  </dt>

                  <dd className="text-sm font-semibold text-slate-800">
                    {document.chunk_count}
                  </dd>
                </div>

                <div className="flex items-center justify-between gap-4">
                  <dt className="flex items-center gap-2 text-xs text-slate-500">
                    <Database className="h-4 w-4" />
                    Format
                  </dt>

                  <dd className="text-sm font-medium text-slate-700">
                    {formatContentType(document.content_type)}
                  </dd>
                </div>

                <div className="flex items-center justify-between gap-4">
                  <dt className="flex items-center gap-2 text-xs text-slate-500">
                    <CalendarDays className="h-4 w-4" />
                    Indexed
                  </dt>

                  <dd className="text-sm font-medium text-slate-700">
                    {formatDate(document.created_at)}
                  </dd>
                </div>
              </dl>
            </article>
          ))}
        </div>
      ) : null}
    </section>
  );
}
