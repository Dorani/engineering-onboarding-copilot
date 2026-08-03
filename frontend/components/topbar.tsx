import { Code2, Sun } from "lucide-react";

export function Topbar() {
  return (
    <header className="flex flex-col gap-5 border-b border-slate-200 bg-white px-5 py-5 md:flex-row md:items-center md:justify-between lg:px-7">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight text-slate-950">
          Ask Copilot
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Grounded answers from your engineering knowledge.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button className="min-w-57.5 rounded-xl border border-slate-200 bg-white px-4 py-3 text-left shadow-sm">
          <span className="block text-xs font-medium text-slate-700">
            Source Filter
          </span>
          <span className="mt-1 block text-sm text-slate-500">All Sources</span>
        </button>

        <button
          aria-label="Toggle theme"
          className="flex h-12 w-12 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 shadow-sm hover:bg-slate-50"
        >
          <Sun className="h-5 w-5" />
        </button>

        <a
          href="http://127.0.0.1:8000/docs"
          target="_blank"
          rel="noreferrer"
          className="inline-flex h-12 items-center gap-2 rounded-xl bg-blue-700 px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-800"
        >
          <Code2 className="h-4 w-4" />
          API Docs
        </a>
      </div>
    </header>
  );
}
