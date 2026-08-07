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
export type DocumentLibraryState = "loading" | "ready" | "error";

export type CopilotRequestState =
  | "idle"
  | "retrieving"
  | "reranking"
  | "generating"
  | "complete"
  | "error";

export type DocumentStatus = "uploaded" | "processing" | "indexed" | "failed";

export type DocumentUploadResponse = {
  document_id: number;
  title: string;
  file_name: string;
  content_type: string;
  status: DocumentStatus;
  chunks_created: number;
};

export type DocumentSummary = {
  id: number;
  title: string;
  source: string | null;
  file_name: string | null;
  content_type: string | null;
  status: DocumentStatus;
  chunk_count: number;
  created_at: string;
};
export type DocumentChunkDetail = {
  id: number;
  section: string | null;
  content: string;
  chunk_index: number;
  embedding_dimensions: number | null;
};

export type DocumentDetail = {
  id: number;
  title: string;
  source: string | null;
  file_name: string | null;
  content_type: string | null;
  status: DocumentStatus;
  chunk_count: number;
  created_at: string;
  chunks: DocumentChunkDetail[];
};

export type DeleteDocumentResponse = {
  document_id: number;
  deleted: boolean;
};

export type DocumentUploadState = "idle" | "uploading" | "success" | "error";
export type DocumentDetailsState = "idle" | "loading" | "ready" | "error";
