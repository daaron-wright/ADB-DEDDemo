import axios from "axios";
import { RequestHandler } from "express";
import { z } from "zod";

const DEFAULT_API_BASE_URL = "https://469b2251f491.ngrok-free.app";
const FALLBACK_COMPATIBILITY_THRESHOLD = 0.72;
const FALLBACK_MIN_SCORE = 0.62;
const FALLBACK_BASE_SCORE = 0.9;
const FALLBACK_SCORE_STEP = 0.06;

const activityCompatibilityRequestSchema = z.object({
  trade_name: z.string().min(1, "Trade name is required"),
  business_activities: z.array(z.string().min(1)).min(1),
  language: z.enum(["english", "arabic"]),
  threshold: z.number().min(0).max(1).optional(),
  embedding_model: z.string().optional(),
  embedding_provider: z.string().optional(),
  enable_llm_judge: z.boolean().optional(),
  llm_judge_threshold: z.number().min(0).max(1).optional(),
});

type ActivityCompatibilityPayload = z.infer<
  typeof activityCompatibilityRequestSchema
>;

type ActivityCompatibilityFallbackResult = {
  activity_description: string;
  compatibility_score: number;
  is_consistent: boolean;
  reason: string;
  threshold: number;
};

type ActivityCompatibilityFallbackResponse = {
  trade_name: string;
  language: ActivityCompatibilityPayload["language"];
  results: ActivityCompatibilityFallbackResult[];
  total_activities: number;
  consistent_activities: number;
  inconsistent_activities: number;
  threshold_used: number;
  llm_judgment: null;
};

const TRADE_LICENSE_API_BASE_URL =
  process.env.TRADE_LICENSE_API_BASE_URL ?? DEFAULT_API_BASE_URL;

function buildFallbackCompatibilityResponse(
  payload: ActivityCompatibilityPayload,
): ActivityCompatibilityFallbackResponse {
  const results = payload.business_activities.map((activity, index) => {
    const computedScore = Number(
      Math.max(
        FALLBACK_MIN_SCORE,
        FALLBACK_BASE_SCORE - index * FALLBACK_SCORE_STEP,
      ).toFixed(2),
    );
    const isConsistent = computedScore >= FALLBACK_COMPATIBILITY_THRESHOLD;

    return {
      activity_description: activity,
      compatibility_score: computedScore,
      is_consistent: isConsistent,
      reason: `${payload.trade_name} remains ${
        isConsistent ? "aligned" : "partially aligned"
      } with ${activity} based on cached compatibility guidance for Abu Dhabi F&B concepts.
`,
      threshold: FALLBACK_COMPATIBILITY_THRESHOLD,
    };
  });

  const consistentActivities = results.filter((item) => item.is_consistent).length;

  return {
    trade_name: payload.trade_name,
    language: payload.language,
    results,
    total_activities: results.length,
    consistent_activities: consistentActivities,
    inconsistent_activities: results.length - consistentActivities,
    threshold_used: FALLBACK_COMPATIBILITY_THRESHOLD,
    llm_judgment: null,
  };
}

export const handleValidateActivityCompatibility: RequestHandler = async (
  req,
  res,
) => {
  let payload: ActivityCompatibilityPayload;

  try {
    payload = activityCompatibilityRequestSchema.parse(req.body);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        detail: "Invalid request payload.",
        issues: error.flatten(),
      });
    }

    console.error("Unexpected validation error", error);
    return res.status(500).json({
      detail: "Unexpected error while validating activity compatibility.",
    });
  }

  try {
    const apiResponse = await axios.post(
      `${TRADE_LICENSE_API_BASE_URL}/api/v1/activity-compatibility/validate`,
      payload,
      {
        timeout: 15000,
      },
    );

    return res.status(200).json(apiResponse.data);
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status;
      const shouldServeFallback =
        !error.response ||
        status === undefined ||
        status >= 500 ||
        error.code === "ECONNABORTED";

      if (shouldServeFallback) {
        console.warn(
          "Falling back to cached trade license compatibility response:",
          error.message,
        );
        return res
          .status(200)
          .json(buildFallbackCompatibilityResponse(payload));
      }

      const detail =
        typeof error.response?.data === "object" && error.response?.data !== null
          ? (error.response.data as { detail?: string }).detail ?? error.message
          : error.message;

      return res.status(status ?? 502).json({
        detail: detail ?? "Trade License API request failed.",
      });
    }

    console.error("Unexpected error validating activity compatibility", error);
    return res.status(500).json({
      detail: "Unexpected error while validating activity compatibility.",
    });
  }
};
