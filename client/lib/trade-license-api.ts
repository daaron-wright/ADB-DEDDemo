const DEFAULT_API_BASE_URL = "https://469b2251f491.ngrok-free.app";

const API_BASE_URL =
  import.meta.env.VITE_TRADE_LICENSE_API_BASE_URL ?? DEFAULT_API_BASE_URL;

export type LanguageCode = "english" | "arabic" | "both";

export interface ActivityCompatibilityRequest {
  trade_name: string;
  business_activities: string[];
  language: LanguageCode;
  threshold?: number | null;
  embedding_model?: string | null;
  embedding_provider?: string | null;
  enable_llm_judge?: boolean;
  llm_judge_threshold?: number | null;
}

export interface ActivityMatchItem {
  activity_description: string;
  compatibility_score: number;
  is_consistent: boolean;
  reason?: string | null;
  model?: string | null;
  provider?: string | null;
  threshold?: number | null;
}

export interface ActivityCompatibilityResponse {
  trade_name: string;
  language: LanguageCode;
  results: ActivityMatchItem[];
  total_activities: number;
  consistent_activities: number;
  inconsistent_activities: number;
  threshold_used: number;
  llm_judgment?: unknown;
}

async function handleResponse<T>(response: Response, fallbackMessage: string): Promise<T> {
  if (response.ok) {
    return response.json() as Promise<T>;
  }

  let details: string | undefined;
  try {
    const data = (await response.json()) as { detail?: string };
    if (data && typeof data.detail === "string") {
      details = data.detail;
    }
  } catch (error) {
    // Swallow JSON parsing errors to fall back to the generic message below
  }

  const message = details ? `${fallbackMessage}: ${details}` : fallbackMessage;
  throw new Error(message);
}

export async function validateActivityCompatibility(
  payload: ActivityCompatibilityRequest,
  options: { signal?: AbortSignal } = {},
): Promise<ActivityCompatibilityResponse> {
  const response = await fetch(`${API_BASE_URL}/api/v1/activity-compatibility/validate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(payload),
    signal: options.signal,
  });

  return handleResponse<ActivityCompatibilityResponse>(
    response,
    "Unable to validate trade license compatibility",
  );
}
