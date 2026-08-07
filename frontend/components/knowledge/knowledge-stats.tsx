import { Database, FileUp, Layers3, Library } from "lucide-react";

import type { DocumentSummary } from "@/lib/types";

type KnowledgeStatsProps = {
  documents: DocumentSummary[];
};

export function KnowledgeStats({ documents }: KnowledgeStatsProps) {
  const totalDocuments = documents.length;

  const totalChunks = documents.reduce(
    (total, document) => total + document.chunk_count,
    0
  );

  const indexedDocuments = documents.filter(
    (document) => document.status === "indexed"
  ).length;

  const uploadedDocuments = documents.filter(
    (document) => document.source === "upload"
  ).length;

  const stats = [
    {
      label: "Documents",
      value: totalDocuments,
      description: "Knowledge sources",
      icon: Library,
    },
    {
      label: "Chunks",
      value: totalChunks,
      description: "Retrievable units",
      icon: Layers3,
    },
    {
      label: "Indexed",
      value: indexedDocuments,
      description: "Search ready",
      icon: Database,
    },
    {
      label: "Uploads",
      value: uploadedDocuments,
      description: "User-ingested",
      icon: FileUp,
    },
  ];

  return (
    <section>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;

          return (
            <div
              key={stat.label}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                    {stat.label}
                  </p>

                  <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">
                    {stat.value.toLocaleString()}
                  </p>

                  <p className="mt-1 text-sm text-slate-500">
                    {stat.description}
                  </p>
                </div>

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
                  <Icon className="h-5 w-5" />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
