import { CalendarDays, Database, FileText, Layers3 } from "lucide-react";

import type { DocumentSummary } from "@/lib/types";

type DocumentCardProps = {
  document: DocumentSummary;
  selected: boolean;
  onSelect: () => void;
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

  return "Document";
}

export function DocumentCard({
  document,
  selected,
  onSelect,
}: DocumentCardProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={[
        "w-full rounded-2xl border bg-white p-5 text-left transition",
        "hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-md",
        selected ? "border-blue-500 ring-2 ring-blue-100" : "border-slate-200",
      ].join(" ")}
    >
      <div className="flex items-start justify-between gap-4">
        <div
          className={[
            "flex h-11 w-11 items-center justify-center rounded-xl",
            selected ? "bg-blue-700 text-white" : "bg-blue-50 text-blue-700",
          ].join(" ")}
        >
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

      {selected ? (
        <div className="mt-4 border-t border-blue-100 pt-4">
          <span className="text-xs font-semibold text-blue-700">
            Viewing document details
          </span>
        </div>
      ) : null}
    </button>
  );
}
