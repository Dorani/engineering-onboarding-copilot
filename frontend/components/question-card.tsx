type QuestionCardProps = {
  question: string;
  askedAt: Date | null;
};

export function QuestionCard({ question, askedAt }: QuestionCardProps) {
  if (!question) {
    return (
      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-xs font-medium text-slate-500">
          Ask your first question
        </p>

        <h3 className="mt-4 text-lg font-semibold text-slate-950">
          Search engineering processes, architecture, standards, and operational
          guidance.
        </h3>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
          Copilot retrieves evidence from the knowledge base, reranks the
          results, and generates an answer with citations when the evidence is
          sufficient.
        </p>
      </section>
    );
  }

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-medium text-slate-500">Your question</p>

          <h3 className="mt-4 text-lg font-semibold text-slate-950">
            {question}
          </h3>
        </div>

        {askedAt && (
          <time
            dateTime={askedAt.toISOString()}
            className="shrink-0 text-xs text-slate-500"
          >
            {askedAt.toLocaleTimeString([], {
              hour: "numeric",
              minute: "2-digit",
            })}
          </time>
        )}
      </div>
    </section>
  );
}
