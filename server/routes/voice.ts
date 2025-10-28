import { RequestHandler } from "express";
import { z } from "zod";

const narrationRequestSchema = z.object({
  text: z.string().min(1, "Narration text is required"),
  voiceId: z.string().min(1).optional(),
  modelId: z.string().min(1).optional(),
});

const DEFAULT_VOICE_ID = "21m00Tcm4TlvDq8ikWAM"; // Rachel
const DEFAULT_MODEL_ID = "eleven_multilingual_v2";

export const handleVoiceNarration: RequestHandler = async (req, res) => {
  try {
    const apiKey = process.env.ELEVENLABS_API_KEY;
    if (!apiKey) {
      return res.status(503).json({
        error: "Voice narration service is not configured",
        code: "missing_api_key",
      });
    }

    const { text, voiceId, modelId } = narrationRequestSchema.parse(req.body);
    const resolvedVoiceId = voiceId ?? process.env.ELEVENLABS_VOICE_ID ?? DEFAULT_VOICE_ID;
    const resolvedModelId = modelId ?? process.env.ELEVENLABS_MODEL_ID ?? DEFAULT_MODEL_ID;

    const elevenLabsResponse = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${resolvedVoiceId}`,
      {
        method: "POST",
        headers: {
          "xi-api-key": apiKey,
          "Content-Type": "application/json",
          Accept: "audio/mpeg",
        },
        body: JSON.stringify({
          text,
          model_id: resolvedModelId,
          voice_settings: {
            stability: 0.45,
            similarity_boost: 0.82,
            style: 0.6,
            use_speaker_boost: true,
          },
        }),
      },
    );

    if (!elevenLabsResponse.ok) {
      const errorPayload = await safeReadJson(elevenLabsResponse);
      return res.status(elevenLabsResponse.status).json({
        error: "Failed to generate voice narration",
        code: "tts_error",
        details: errorPayload,
      });
    }

    const audioBuffer = Buffer.from(await elevenLabsResponse.arrayBuffer());
    res.setHeader("Content-Type", "audio/mpeg");
    res.setHeader("Cache-Control", "no-store");
    res.setHeader("X-Voice-Model", resolvedModelId);
    res.setHeader("X-Voice-Id", resolvedVoiceId);
    res.send(audioBuffer);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: "Invalid request payload",
        code: "bad_request",
        details: error.errors,
      });
    }

    console.error("Voice narration error:", error);
    res.status(500).json({ error: "Unexpected voice narration failure", code: "internal_error" });
  }
};

async function safeReadJson(response: Response) {
  try {
    return await response.clone().json();
  } catch {
    return null;
  }
}
