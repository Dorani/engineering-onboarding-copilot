import { BookOpen } from "lucide-react";

export default function KnowledgePage() {
  return (
    <div className="p-5 lg:p-7">
      <section className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
          <BookOpen className="h-6 w-6" />
        </div>

        <h3 className="mt-5 text-xl font-semibold text-slate-950">
          Knowledge Library
        </h3>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
          Upload engineering documentation, generate embeddings, and make new
          knowledge immediately available to the copilot.
        </p>
      </section>
    </div>
  );
}
