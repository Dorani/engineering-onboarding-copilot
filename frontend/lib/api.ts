import type {
  CopilotResponse,
  DocumentDetail,
  DocumentSummary,
  DocumentUploadResponse,
  DeleteDocumentResponse,
} from "@/lib/types";
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:8000";

type ApiErrorBody = {
  detail?: string;
};

export async function askCopilot(
  question: string,
  signal?: AbortSignal
): Promise<CopilotResponse> {
  const response = await fetch(`${API_BASE_URL}/ask`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ question }),
    signal,
  });

  if (!response.ok) {
    let message = `Request failed with status ${response.status}.`;

    try {
      const errorBody = (await response.json()) as ApiErrorBody;

      if (errorBody.detail) {
        message = errorBody.detail;
      }
    } catch {
      // Keep the fallback error message when the body is not JSON.
    }

    throw new Error(message);
  }

  return (await response.json()) as CopilotResponse;
}

export async function uploadDocument(
  file: File,
  signal?: AbortSignal
): Promise<DocumentUploadResponse> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${API_BASE_URL}/documents/upload`, {
    method: "POST",
    body: formData,
    signal,
  });

  if (!response.ok) {
    let message = `Upload failed with status ${response.status}.`;

    try {
      const errorBody = (await response.json()) as ApiErrorBody;

      if (errorBody.detail) {
        message = errorBody.detail;
      }
    } catch {
      // Keep the fallback error when the response body is not JSON.
    }

    throw new Error(message);
  }

  return (await response.json()) as DocumentUploadResponse;
}

export async function getDocuments(
  signal?: AbortSignal
): Promise<DocumentSummary[]> {
  const response = await fetch(`${API_BASE_URL}/documents`, {
    method: "GET",
    headers: {
      Accept: "application/json",
    },
    signal,
    cache: "no-store",
  });

  if (!response.ok) {
    let message = `Unable to load documents. Status ${response.status}.`;

    try {
      const errorBody = (await response.json()) as ApiErrorBody;

      if (errorBody.detail) {
        message = errorBody.detail;
      }
    } catch {
      // Preserve the fallback message when the body is not JSON.
    }

    throw new Error(message);
  }

  return (await response.json()) as DocumentSummary[];
}

export async function getDocument(
  documentId: number,
  signal?: AbortSignal
): Promise<DocumentDetail> {
  const response = await fetch(`${API_BASE_URL}/documents/${documentId}`, {
    method: "GET",
    headers: {
      Accept: "application/json",
    },
    signal,
    cache: "no-store",
  });

  if (!response.ok) {
    let message = `Unable to load document ${documentId}.`;

    try {
      const errorBody = (await response.json()) as ApiErrorBody;

      if (errorBody.detail) {
        message = errorBody.detail;
      }
    } catch {
      // Preserve the fallback message.
    }

    throw new Error(message);
  }

  return (await response.json()) as DocumentDetail;
}

export async function deleteDocument(
  documentId: number,
  signal?: AbortSignal
): Promise<DeleteDocumentResponse> {
  const response = await fetch(`${API_BASE_URL}/documents/${documentId}`, {
    method: "DELETE",
    headers: {
      Accept: "application/json",
    },
    signal,
  });

  if (!response.ok) {
    let message = `Unable to delete document ${documentId}.`;

    try {
      const errorBody = (await response.json()) as ApiErrorBody;

      if (errorBody.detail) {
        message = errorBody.detail;
      }
    } catch {
      // Preserve fallback message.
    }

    throw new Error(message);
  }

  return (await response.json()) as DeleteDocumentResponse;
}
