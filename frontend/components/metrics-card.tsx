const metrics = [
  {
    label: "Top-1 (Reranked)",
    value: "93.3%",
    comparison: "↑ 20.0pp vs Vector",
  },
  {
    label: "Recall@3 (Reranked)",
    value: "93.3%",
    comparison: "↑ 6.6pp vs Vector",
  },
  {
    label: "MRR (Reranked)",
    value: "0.967",
    comparison: "↑ 0.100 vs Vector",
  },
];

export function MetricsCard() {
  return (
    <section className="rounded-xl border border-blue-300/20 bg-white/[0.035] p-4">
      <p className="text-[11px] font-medium uppercase tracking-wider text-slate-300">
        Retrieval performance — global
      </p>

      <div className="mt-4 space-y-4">
        {metrics.map((metric) => (
          <div key={metric.label}>
            <p className="text-xs text-slate-300">{metric.label}</p>
            <p className="mt-1 text-2xl font-semibold text-emerald-400">
              {metric.value}
            </p>
            <p className="mt-1 text-xs text-slate-400">{metric.comparison}</p>
          </div>
        ))}
      </div>

      <a
        href="#evaluations"
        className="mt-5 inline-flex text-xs font-medium text-blue-300 hover:text-blue-200"
      >
        View all evaluations →
      </a>
    </section>
  );
}
