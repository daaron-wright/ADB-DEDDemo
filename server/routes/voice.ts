import { RequestHandler } from "express";
import { z } from "zod";

const ALLOWED_OUTPUT_FORMATS = [
  "mp3_44100_192",
  "mp3_44100_128",
  "mp3_44100_64",
  "ogg_48000",
  "pcm_44100",
] as const;

type OutputFormat = (typeof ALLOWED_OUTPUT_FORMATS)[number];

const OUTPUT_CONTENT_TYPES: Record<OutputFormat, string> = {
  mp3_44100_192: "audio/mpeg",
  mp3_44100_128: "audio/mpeg",
  mp3_44100_64: "audio/mpeg",
  ogg_48000: "audio/ogg",
  pcm_44100: "audio/wav",
};

const voiceSettingsSchema = z
  .object({
    stability: z.number().min(0).max(1).optional(),
    similarityBoost: z.number().min(0).max(1).optional(),
    style: z.number().min(0).max(1).optional(),
    useSpeakerBoost: z.boolean().optional(),
  })
  .strict();

const narrationRequestSchema = z.object({
  text: z.string().min(1, "Narration text is required"),
  voiceId: z.string().min(1).optional(),
  modelId: z.string().min(1).optional(),
  outputFormat: z.enum(ALLOWED_OUTPUT_FORMATS).optional(),
  voiceSettings: voiceSettingsSchema.optional(),
});

const DEFAULT_VOICE_ID = "21m00Tcm4TlvDq8ikWAM"; // Rachel
const DEFAULT_MODEL_ID = "eleven_multilingual_v2";
const DEFAULT_OUTPUT_FORMAT: OutputFormat = "mp3_44100_192";
const DEFAULT_VOICE_SETTINGS = {
  stability: 0.32,
  similarity_boost: 0.9,
  style: 0.58,
  use_speaker_boost: true,
};

export const handleVoiceNarration: RequestHandler = async (req, res) => {
  try {
    const apiKey = process.env.ELEVENLABS_API_KEY;
    if (!apiKey) {
      return res.status(503).json({
        error: "Voice narration service is not configured",
        code: "missing_api_key",
      });
    }

    const { text, voiceId, modelId, outputFormat, voiceSettings } =
      narrationRequestSchema.parse(req.body);
    const resolvedVoiceId = voiceId ?? process.env.ELEVENLABS_VOICE_ID ?? DEFAULT_VOICE_ID;
    const resolvedModelId = modelId ?? process.env.ELEVENLABS_MODEL_ID ?? DEFAULT_MODEL_ID;
    const resolvedOutputFormat =
      outputFormat ?? getEnvOutputFormat(process.env.ELEVENLABS_OUTPUT_FORMAT) ?? DEFAULT_OUTPUT_FORMAT;

    const voiceSettingsOverrides: Partial<typeof DEFAULT_VOICE_SETTINGS> = {};
    if (voiceSettings?.stability !== undefined) {
      voiceSettingsOverrides.stability = voiceSettings.stability;
    }
    if (voiceSettings?.similarityBoost !== undefined) {
      voiceSettingsOverrides.similarity_boost = voiceSettings.similarityBoost;
    }
    if (voiceSettings?.style !== undefined) {
      voiceSettingsOverrides.style = voiceSettings.style;
    }
    if (voiceSettings?.useSpeakerBoost !== undefined) {
      voiceSettingsOverrides.use_speaker_boost = voiceSettings.useSpeakerBoost;
    }

    const resolvedVoiceSettings = {
      ...DEFAULT_VOICE_SETTINGS,
      ...voiceSettingsOverrides,
    };

    const acceptHeader = OUTPUT_CONTENT_TYPES[resolvedOutputFormat] ?? "audio/mpeg";

    const elevenLabsResponse = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${resolvedVoiceId}`,
      {
        method: "POST",
        headers: {
          "xi-api-key": apiKey,
          "Content-Type": "application/json",
          Accept: acceptHeader,
        },
        body: JSON.stringify({
          text,
          model_id: resolvedModelId,
          output_format: resolvedOutputFormat,
          voice_settings: resolvedVoiceSettings,
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
    const responseContentType = elevenLabsResponse.headers.get("content-type") ?? acceptHeader;
    res.setHeader("Content-Type", responseContentType);
    res.setHeader("Cache-Control", "no-store");
    res.setHeader("X-Voice-Model", resolvedModelId);
    res.setHeader("X-Voice-Id", resolvedVoiceId);
    res.setHeader("X-Voice-Output-Format", resolvedOutputFormat);
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
