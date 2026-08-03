import {
  BookOpen,
  CheckCircle2,
  ExternalLink,
  FileText,
  Info,
  Search,
} from "lucide-react";

import type { CopilotRequestState, CopilotResponse } from "@/lib/types";

type SourcePanelProps = {
  response: CopilotResponse | null;
  requestState: CopilotRequestState;
};

export function SourcePanel({ response, requestState }: SourcePanelProps) {
  const isLoading = ["retrieving", "reranking", "generating"].includes(
    requestState
  );

  const sources = response?.sources ?? [];

  return (
    <aside className="space-y-4">
      <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 p-5">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-slate-950">
              Sources ({sources.length})
            </h3>

            {response?.grounded && (
              <CheckCircle2 className="h-5 w-5 text-emerald-600" />
            )}
          </div>

          {isLoading ? (
            <div className="mt-5 space-y-3">
              {[1, 2, 3].map((item) => (
                <div
                  key={item}
                  className="h-20 animate-pulse rounded-lg bg-slate-100"
                />
              ))}
            </div>
          ) : sources.length > 0 ? (
            <div className="mt-5 space-y-3">
              {sources.map((source) => (
                <article
                  key={source.id}
                  className="rounded-lg border border-slate-200 p-4"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50">
                      <FileText className="h-4 w-4 text-blue-700" />
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="rounded bg-blue-50 px-1.5 py-0.5 text-[10px] font-semibold text-blue-700">
                          Source {source.id}
                        </span>
                      </div>

                      <h4 className="mt-2 text-sm font-semibold text-slate-900">
                        {source.title}
                      </h4>

                      {source.section && (
                        <p className="mt-1 text-xs font-medium text-blue-700">
                          {source.section}
                        </p>
                      )}

                      <p className="mt-3 line-clamp-5 text-xs leading-5 text-slate-500">
                        {source.excerpt}
                      </p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : response ? (
            <div className="mt-5">
              <p className="font-semibold text-slate-900">
                No supporting sources returned
              </p>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Copilot abstained because the available evidence did not support
                a grounded answer.
              </p>
            </div>
          ) : (
            <div className="mt-5">
              <p className="font-semibold text-slate-900">
                Sources will appear here
              </p>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Cited documents and sections will be shown after Copilot answers
                a supported question.
              </p>
            </div>
          )}
        </div>

        <div className="p-5">
          <h4 className="font-semibold text-slate-950">Retrieval Pipeline</h4>

          <div className="mt-4 space-y-3 text-sm">
            <div className="flex items-center gap-3">
              <Search className="h-4 w-4 text-blue-700" />
              <span className="text-slate-600">Vector candidate retrieval</span>
            </div>

            <div className="flex items-center gap-3">
              <BookOpen className="h-4 w-4 text-blue-700" />
              <span className="text-slate-600">Candidate reranking</span>
            </div>

            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-4 w-4 text-blue-700" />
              <span className="text-slate-600">
                Citation-filtered generation
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-blue-200 bg-blue-50/50 p-5">
        <div className="flex items-center gap-2">
          <Info className="h-5 w-5 text-blue-700" />
          <h3 className="font-semibold text-blue-900">About Copilot</h3>
        </div>

        <p className="mt-4 text-sm leading-6 text-slate-600">
          Copilot uses retrieval-augmented generation with reranking, grounding,
          citation validation, and abstention.
        </p>

        <a
          href="https://github.com/Dorani/engineering-onboarding-copilot"
          target="_blank"
          rel="noreferrer"
          className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-blue-700"
        >
          View project source
          <ExternalLink className="h-4 w-4" />
        </a>
      </section>
    </aside>
  );
}
