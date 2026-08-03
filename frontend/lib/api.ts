import type { CopilotResponse } from "@/lib/types";

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
