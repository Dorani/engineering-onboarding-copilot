export type Source = {
  id: number;
  title: string;
  section: string | null;
  excerpt: string;
};

export type CopilotResponse = {
  answer: string;
  grounded: boolean;
  sources: Source[];
};

export type NavigationItem = {
  label: string;
  description: string;
  href: string;
  icon:
    | "message"
    | "book"
    | "evaluation"
    | "playground"
    | "analytics"
    | "settings";
};

export type CopilotRequestState =
  | "idle"
  | "retrieving"
  | "reranking"
  | "generating"
  | "complete"
  | "error";
