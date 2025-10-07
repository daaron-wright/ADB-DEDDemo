import axios from "axios";
import { RequestHandler } from "express";
import { z } from "zod";

const DEFAULT_API_BASE_URL = "https://469b2251f491.ngrok-free.app";

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

const TRADE_LICENSE_API_BASE_URL =
  process.env.TRADE_LICENSE_API_BASE_URL ?? DEFAULT_API_BASE_URL;

export const handleValidateActivityCompatibility: RequestHandler = async (
  req,
  res,
) => {
  try {
    const payload = activityCompatibilityRequestSchema.parse(req.body);

    const apiResponse = await axios.post(
      `${TRADE_LICENSE_API_BASE_URL}/api/v1/activity-compatibility/validate`,
      payload,
      {
        timeout: 15000,
      },
    );

    return res.status(200).json(apiResponse.data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        detail: "Invalid request payload.",
        issues: error.flatten(),
      });
    }

    if (axios.isAxiosError(error)) {
      const status = error.response?.status ?? 502;
      const detail =
        typeof error.response?.data === "object" && error.response?.data !== null
          ? (error.response.data as { detail?: string }).detail ?? error.message
          : error.message;

      return res.status(status).json({
        detail: detail ?? "Trade License API request failed.",
      });
    }

    console.error("Unexpected error validating activity compatibility", error);
    return res.status(500).json({
      detail: "Unexpected error while validating activity compatibility.",
    });
  }
};
