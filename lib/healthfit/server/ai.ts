import { CoachReply } from "@/lib/healthfit/contracts";
import { buildFallbackCoachReply } from "@/lib/healthfit/server/defaults";
import { buildSafetyReply, detectSafetyFlags } from "@/lib/healthfit/server/safety";

function extractJsonPayload(text: string) {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

export async function generateCoachReply(props: {
  message: string;
  goalSummary: string;
  activityLevel: string;
  experienceLevel: string;
  conversationId: string;
}): Promise<CoachReply> {
  const flags = detectSafetyFlags(props.message);

  if (flags.length > 0) {
    const safetyReply = buildSafetyReply(flags);
    return {
      conversationId: props.conversationId,
      message: safetyReply.message,
      safetyStatus: "caution",
      flags,
      fallbackUsed: true,
      structured: safetyReply.structured,
    };
  }

  const fallback = buildFallbackCoachReply(props.message, props.goalSummary);
  const apiKey = process.env.OPENAI_API_KEY;
  const model = process.env.HEALTHFIT_AI_MODEL;

  if (!apiKey || !model) {
    return {
      conversationId: props.conversationId,
      message: `${fallback.recap}\n\nFocus for today:\n- ${fallback.focus.join("\n- ")}\n\nNext actions:\n- ${fallback.nextActions.join("\n- ")}`,
      safetyStatus: "clear",
      flags: [],
      fallbackUsed: true,
      structured: fallback,
    };
  }

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        temperature: 0.5,
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content:
              "You are Healthfit.ai, a wellness-only coach. Do not diagnose, prescribe, or claim to treat disease. Reply as JSON with keys: message, recap, focus, nextActions, disclaimer.",
          },
          {
            role: "user",
            content: `Member goal: ${props.goalSummary}\nActivity level: ${props.activityLevel}\nExperience level: ${props.experienceLevel}\nUser message: ${props.message}`,
          },
        ],
      }),
    });

    if (!response.ok) {
      throw new Error(`AI request failed with ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content ?? "";
    const parsed = extractJsonPayload(content);

    if (!parsed) {
      throw new Error("AI response was not valid JSON");
    }

    return {
      conversationId: props.conversationId,
      message: parsed.message ?? fallback.recap,
      safetyStatus: "clear",
      flags: [],
      fallbackUsed: false,
      structured: {
        recap: parsed.recap ?? fallback.recap,
        focus: Array.isArray(parsed.focus) ? parsed.focus : fallback.focus,
        nextActions: Array.isArray(parsed.nextActions)
          ? parsed.nextActions
          : fallback.nextActions,
        disclaimer: parsed.disclaimer ?? fallback.disclaimer,
      },
    };
  } catch (error) {
    console.error("Falling back from AI provider", error);

    return {
      conversationId: props.conversationId,
      message: `${fallback.recap}\n\nFocus for today:\n- ${fallback.focus.join("\n- ")}\n\nNext actions:\n- ${fallback.nextActions.join("\n- ")}`,
      safetyStatus: "clear",
      flags: [],
      fallbackUsed: true,
      structured: fallback,
    };
  }
}
