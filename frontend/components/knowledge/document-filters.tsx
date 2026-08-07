import { Search } from "lucide-react";

export type DocumentFormatFilter =
  | "all"
  | "markdown"
  | "plain-text"
  | "document";

export type DocumentStatusFilter =
  | "all"
  | "uploaded"
  | "processing"
  | "indexed"
  | "failed";

type DocumentFiltersProps = {
  searchQuery: string;
  formatFilter: DocumentFormatFilter;
  statusFilter: DocumentStatusFilter;
  onSearchChange: (value: string) => void;
  onFormatChange: (value: DocumentFormatFilter) => void;
  onStatusChange: (value: DocumentStatusFilter) => void;
  onClear: () => void;
};

export function DocumentFilters({
  searchQuery,
  formatFilter,
  statusFilter,
  onSearchChange,
  onFormatChange,
  onStatusChange,
  onClear,
}: DocumentFiltersProps) {
  const hasFilters =
    searchQuery.trim() !== "" ||
    formatFilter !== "all" ||
    statusFilter !== "all";

  return (
    <div className="border-b border-slate-200 px-6 py-4">
      <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_180px_180px_auto]">
        <label className="relative">
          <span className="sr-only">Search documents</span>

          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

          <input
            type="search"
            value={searchQuery}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Search documents..."
            className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
          />
        </label>

        <label>
          <span className="sr-only">Filter by format</span>

          <select
            value={formatFilter}
            onChange={(event) =>
              onFormatChange(event.target.value as DocumentFormatFilter)
            }
            className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
          >
            <option value="all">All formats</option>
            <option value="markdown">Markdown</option>
            <option value="plain-text">Plain text</option>
            <option value="document">Document</option>
          </select>
        </label>

        <label>
          <span className="sr-only">Filter by status</span>

          <select
            value={statusFilter}
            onChange={(event) =>
              onStatusChange(event.target.value as DocumentStatusFilter)
            }
            className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
          >
            <option value="all">All statuses</option>
            <option value="indexed">Indexed</option>
            <option value="processing">Processing</option>
            <option value="uploaded">Uploaded</option>
            <option value="failed">Failed</option>
          </select>
        </label>

        <button
          type="button"
          disabled={!hasFilters}
          onClick={onClear}
          className="h-11 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Clear
        </button>
      </div>
    </div>
  );
}
