import {
  AlertCircle,
  CheckCircle2,
  Database,
  FileText,
  Layers3,
} from "lucide-react";

import type { DocumentUploadResponse, DocumentUploadState } from "@/lib/types";

type UploadResultCardProps = {
  uploadState: DocumentUploadState;
  result: DocumentUploadResponse | null;
  error: string | null;
};

export function UploadResultCard({
  uploadState,
  result,
  error,
}: UploadResultCardProps) {
  if (uploadState === "idle") {
    return (
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
          <Database className="h-5 w-5" />
        </div>

        <h3 className="mt-4 text-lg font-semibold text-slate-950">
          Ready to index
        </h3>

        <p className="mt-2 text-sm leading-6 text-slate-600">
          Upload a supported document to make its knowledge immediately
          available to the copilot.
        </p>
      </section>
    );
  }

  if (uploadState === "uploading") {
    return (
      <section className="rounded-2xl border border-blue-200 bg-blue-50 p-6 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-700">
          Processing
        </p>

        <h3 className="mt-3 text-lg font-semibold text-slate-950">
          Building the knowledge index
        </h3>

        <div className="mt-5 space-y-3">
          {[
            "Validating document",
            "Creating semantic chunks",
            "Generating embeddings",
            "Writing to pgvector",
          ].map((step) => (
            <div
              key={step}
              className="flex items-center gap-3 text-sm text-slate-700"
            >
              <span className="h-2 w-2 rounded-full bg-blue-500" />
              {step}
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (uploadState === "error") {
    return (
      <section className="rounded-2xl border border-red-200 bg-red-50 p-6 shadow-sm">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-100 text-red-700">
          <AlertCircle className="h-5 w-5" />
        </div>

        <h3 className="mt-4 text-lg font-semibold text-red-950">
          Upload failed
        </h3>

        <p className="mt-2 text-sm leading-6 text-red-800">
          {error ?? "The document could not be indexed."}
        </p>
      </section>
    );
  }

  if (!result) {
    return null;
  }

  return (
    <section className="rounded-2xl border border-emerald-200 bg-white p-6 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
          <CheckCircle2 className="h-5 w-5" />
        </div>

        <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold capitalize text-emerald-800">
          {result.status}
        </span>
      </div>

      <h3 className="mt-4 text-lg font-semibold text-slate-950">
        Document indexed
      </h3>

      <p className="mt-2 text-sm leading-6 text-slate-600">
        This document is now available to semantic retrieval and grounded
        generation.
      </p>

      <dl className="mt-6 space-y-4">
        <div className="flex items-start gap-3">
          <FileText className="mt-0.5 h-5 w-5 text-slate-400" />

          <div>
            <dt className="text-xs font-medium uppercase tracking-wider text-slate-500">
              Document
            </dt>

            <dd className="mt-1 text-sm font-semibold text-slate-900">
              {result.title}
            </dd>

            <dd className="mt-1 text-xs text-slate-500">{result.file_name}</dd>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <Layers3 className="mt-0.5 h-5 w-5 text-slate-400" />

          <div>
            <dt className="text-xs font-medium uppercase tracking-wider text-slate-500">
              Indexed chunks
            </dt>

            <dd className="mt-1 text-sm font-semibold text-slate-900">
              {result.chunks_created}
            </dd>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <Database className="mt-0.5 h-5 w-5 text-slate-400" />

          <div>
            <dt className="text-xs font-medium uppercase tracking-wider text-slate-500">
              Retrieval index
            </dt>

            <dd className="mt-1 text-sm font-semibold text-slate-900">
              PostgreSQL + pgvector
            </dd>
          </div>
        </div>
      </dl>
    </section>
  );
}
