"use client";

import { usePathname } from "next/navigation";

import { Sidebar } from "@/components/sidebar";
import { Topbar } from "@/components/topbar";

type ApplicationLayoutProps = {
  children: React.ReactNode;
};

type PageMetadata = {
  title: string;
  description: string;
  showSourceFilter?: boolean;
};

const pageMetadata: Record<string, PageMetadata> = {
  "/": {
    title: "Ask Copilot",
    description: "Grounded answers from your engineering knowledge.",
    showSourceFilter: true,
  },
  "/knowledge": {
    title: "Knowledge Library",
    description: "Upload, index, and manage engineering documentation.",
  },
  "/evaluations": {
    title: "Evaluations",
    description: "Review retrieval, grounding, and generation quality.",
  },
  "/playground": {
    title: "Playground",
    description: "Experiment with retrieval and grounded generation.",
  },
};

export function ApplicationLayout({ children }: ApplicationLayoutProps) {
  const pathname = usePathname();

  const metadata = pageMetadata[pathname] ?? {
    title: "Engineering Onboarding Copilot",
    description: "Enterprise engineering knowledge workspace.",
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar />

      <main className="min-h-screen lg:ml-80">
        <Topbar
          title={metadata.title}
          description={metadata.description}
          showSourceFilter={metadata.showSourceFilter}
        />

        {children}
      </main>
    </div>
  );
}
