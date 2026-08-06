import { Gauge } from "lucide-react";

export default function EvaluationsPage() {
  return (
    <div className="p-5 lg:p-7">
      <section className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <Gauge className="h-8 w-8 text-blue-700" />

        <h3 className="mt-5 text-xl font-semibold text-slate-950">
          Evaluation Workspace
        </h3>

        <p className="mt-2 text-sm text-slate-600">
          Retrieval and generation evaluation dashboards are coming soon.
        </p>
      </section>
    </div>
  );
}
