"use client";

import { BookOpen, SearchX } from "lucide-react";
import { useMemo, useState } from "react";

import { DocumentCard } from "@/components/knowledge/document-card";
import {
  DocumentFilters,
  type DocumentFormatFilter,
  type DocumentStatusFilter,
} from "@/components/knowledge/document-filters";
import type { DocumentLibraryState, DocumentSummary } from "@/lib/types";

type DocumentLibraryProps = {
  documents: DocumentSummary[];
  libraryState: DocumentLibraryState;
  error: string | null;
  selectedDocumentId: number | null;
  onSelectDocument: (documentId: number) => void;
};

function matchesFormat(
  document: DocumentSummary,
  formatFilter: DocumentFormatFilter
) {
  if (formatFilter === "all") {
    return true;
  }

  if (formatFilter === "markdown") {
    return document.content_type === "text/markdown";
  }

  if (formatFilter === "plain-text") {
    return document.content_type === "text/plain";
  }

  return (
    document.content_type !== "text/markdown" &&
    document.content_type !== "text/plain"
  );
}

export function DocumentLibrary({
  documents,
  libraryState,
  error,
  selectedDocumentId,
  onSelectDocument,
}: DocumentLibraryProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [formatFilter, setFormatFilter] = useState<DocumentFormatFilter>("all");
  const [statusFilter, setStatusFilter] = useState<DocumentStatusFilter>("all");

  const filteredDocuments = useMemo(() => {
    const normalizedSearch = searchQuery.trim().toLowerCase();

    return documents.filter((document) => {
      const searchableText = [
        document.title,
        document.file_name ?? "",
        document.source ?? "",
      ]
        .join(" ")
        .toLowerCase();

      const matchesSearch =
        normalizedSearch === "" || searchableText.includes(normalizedSearch);

      const matchesStatus =
        statusFilter === "all" || document.status === statusFilter;

      return (
        matchesSearch && matchesStatus && matchesFormat(document, formatFilter)
      );
    });
  }, [documents, formatFilter, searchQuery, statusFilter]);

  const filtersActive =
    searchQuery.trim() !== "" ||
    formatFilter !== "all" ||
    statusFilter !== "all";

  function clearFilters() {
    setSearchQuery("");
    setFormatFilter("all");
    setStatusFilter("all");
  }

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
            {filtersActive
              ? `${filteredDocuments.length} of ${documents.length} documents`
              : `${documents.length} ${
                  documents.length === 1 ? "document" : "documents"
                }`}
          </span>
        ) : null}
      </div>

      {libraryState === "ready" && documents.length > 0 ? (
        <DocumentFilters
          searchQuery={searchQuery}
          formatFilter={formatFilter}
          statusFilter={statusFilter}
          onSearchChange={setSearchQuery}
          onFormatChange={setFormatFilter}
          onStatusChange={setStatusFilter}
          onClear={clearFilters}
        />
      ) : null}

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

      {libraryState === "ready" &&
      documents.length > 0 &&
      filteredDocuments.length === 0 ? (
        <div className="flex min-h-72 flex-col items-center justify-center px-6 py-12 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-600">
            <SearchX className="h-7 w-7" />
          </div>

          <h4 className="mt-5 text-lg font-semibold text-slate-950">
            No matching documents
          </h4>

          <p className="mt-2 max-w-md text-sm leading-6 text-slate-600">
            Try changing your search query or clearing one of the active
            filters.
          </p>

          <button
            type="button"
            onClick={clearFilters}
            className="mt-5 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Clear filters
          </button>
        </div>
      ) : null}

      {libraryState === "ready" && filteredDocuments.length > 0 ? (
        <div className="grid gap-4 p-6 md:grid-cols-2 xl:grid-cols-3">
          {filteredDocuments.map((document) => (
            <DocumentCard
              key={document.id}
              document={document}
              selected={selectedDocumentId === document.id}
              onSelect={() => onSelectDocument(document.id)}
            />
          ))}
        </div>
      ) : null}
    </section>
  );
}
