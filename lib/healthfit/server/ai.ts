import {
  CoachAction,
  CoachReply,
  coachActionSchema,
} from "@/lib/healthfit/contracts";
import { createId } from "@/lib/healthfit/ids";
import { buildFallbackCoachReply } from "@/lib/healthfit/server/defaults";
import { buildSafetyReply, detectSafetyFlags } from "@/lib/healthfit/server/safety";

function extractJsonPayload(text: string) {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

function isAutomaticLogAction(action: CoachAction) {
  return (
    action.type === "log_workout" ||
    action.type === "log_meal" ||
    action.type === "log_habit" ||
    action.type === "log_check_in"
  );
}

function uniqueCoachActions(actions: CoachAction[]) {
  return Array.from(
    new Map(
      actions.map((action) => [
        JSON.stringify({
          type: action.type,
          payload: "payload" in action ? action.payload : null,
          href: "href" in action ? action.href : null,
        }),
        action,
      ])
    ).values()
  );
}

function normalizeLoggedActions(
  rawActions: unknown,
  habitSlugs: string[]
): CoachAction[] {
  if (!Array.isArray(rawActions)) {
    return [];
  }

  const parsedActions = rawActions.reduce<CoachAction[]>((actions, item, index) => {
      if (!item || typeof item !== "object") {
        return actions;
      }

      const candidate = {
        ...item,
        id:
          typeof (item as { id?: unknown }).id === "string" &&
          (item as { id: string }).id.trim().length > 0
            ? (item as { id: string }).id
            : createId(`coachauto${index}`),
      };
      const parsed = coachActionSchema.safeParse(candidate);

      if (!parsed.success || !isAutomaticLogAction(parsed.data)) {
        return actions;
      }

      if (
        parsed.data.type === "log_habit" &&
        habitSlugs.length > 0 &&
        !habitSlugs.includes(parsed.data.payload.habitSlug)
      ) {
        return actions;
      }

      actions.push(parsed.data);
      return actions;
    }, []);

  return uniqueCoachActions(parsedActions).slice(0, 4);
}

function clampScore(value: number | null, fallback: number) {
  return Math.min(10, Math.max(1, Math.round(value ?? fallback)));
}

function titleCase(value: string) {
  return value
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function extractNumberFromPatterns(
  message: string,
  patterns: RegExp[],
  minimum = 0,
  maximum = Number.POSITIVE_INFINITY
) {
  for (const pattern of patterns) {
    const match = message.match(pattern);
    if (!match) continue;
    const value = Number(match[1]);

    if (Number.isFinite(value) && value >= minimum && value <= maximum) {
      return value;
    }
  }

  return null;
}

function extractDurationMin(message: string, fallback: number) {
  const hourValue = extractNumberFromPatterns(
    message,
    [/\b(\d+(?:\.\d+)?)\s*(?:hours?|hrs?|hr|h)\b/i],
    0,
    8
  );

  if (hourValue !== null) {
    return Math.max(5, Math.round(hourValue * 60));
  }

  const minuteValue = extractNumberFromPatterns(
    message,
    [/\b(\d{1,3})\s*(?:minutes?|mins?|min|m)\b/i],
    5,
    240
  );

  if (minuteValue !== null) {
    return minuteValue;
  }

  return fallback;
}

function extractSleepHours(message: string) {
  return (
    extractNumberFromPatterns(
      message,
      [
        /(?:slept|sleep|sleeping)[^\d]{0,16}(\d+(?:\.\d+)?)/i,
        /(\d+(?:\.\d+)?)\s*(?:hours?|hrs?|hr|h)\s*(?:of)?\s*sleep/i,
      ],
      0,
      16
    ) ?? null
  );
}

function inferWorkoutName(message: string) {
  const workoutMatchers = [
    { pattern: /\bleg day\b/i, name: "Leg day strength session" },
    { pattern: /\bupper body\b/i, name: "Upper body strength session" },
    { pattern: /\blower body\b/i, name: "Lower body strength session" },
    { pattern: /\bfull body\b/i, name: "Full-body training session" },
    { pattern: /\bmobility\b|\bstretch(?:ing)?\b/i, name: "Mobility session" },
    { pattern: /\byoga\b/i, name: "Yoga session" },
    { pattern: /\bwalk(?:ed|ing)?\b/i, name: "Walk" },
    { pattern: /\bran\b|\brun\b|\bjog(?:ged|ging)?\b/i, name: "Run" },
    { pattern: /\bcycl(?:ed|ing)\b|\bbik(?:e|ed|ing)\b/i, name: "Cycling session" },
    { pattern: /\bsw(?:am|im|imming)\b/i, name: "Swim session" },
    { pattern: /\blift(?:ed|ing)?\b|\bstrength\b|\bweights?\b/i, name: "Strength training session" },
    { pattern: /\bhiit\b|\binterval\b/i, name: "Conditioning session" },
    { pattern: /\bworkout\b|\bsession\b|\btrain(?:ed|ing)?\b|\bexercise\b/i, name: "Workout session" },
  ];

  const matched = workoutMatchers.find(({ pattern }) => pattern.test(message));

  return matched?.name ?? "Workout session";
}

function inferWorkoutFallbackDuration(message: string, sessionLengthMin: number) {
  if (/\bwalk(?:ed|ing)?\b|\bmobility\b|\bstretch(?:ing)?\b|\byoga\b/i.test(message)) {
    return 25;
  }

  if (/\bran\b|\brun\b|\bcycl(?:ed|ing)\b|\bbik(?:e|ed|ing)\b/i.test(message)) {
    return 30;
  }

  if (/\blift(?:ed|ing)?\b|\bstrength\b|\bweights?\b|\bleg day\b|\bupper body\b|\blower body\b|\bfull body\b/i.test(message)) {
    return Math.max(35, sessionLengthMin);
  }

  return Math.max(20, sessionLengthMin || 30);
}

function inferMealType(message: string): "breakfast" | "lunch" | "dinner" | "snack" {
  if (/\bbreakfast\b|\bmorning\b/i.test(message)) return "breakfast";
  if (/\blunch\b|\bnoon\b|\bafternoon\b/i.test(message)) return "lunch";
  if (/\bdinner\b|\bevening\b|\bsupper\b/i.test(message)) return "dinner";
  return "snack";
}

function cleanMealTitle(value: string) {
  return value
    .replace(/\b(?:about|around)\s+\d+[^,.;]*$/i, "")
    .replace(/\b\d+\s*(?:kcal|calories?|cals?)\b.*$/i, "")
    .replace(/\b\d+\s*g\s*(?:protein|carbs?|fat)\b.*$/i, "")
    .replace(/\b\d+\s*(?:ml|l|liters?)\s*water\b.*$/i, "")
    .replace(/^(?:my|the)\s+/i, "")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/^[,:-]\s*/, "")
    .replace(/[,:-]\s*$/, "");
}

function inferMealTitle(message: string, mealType: "breakfast" | "lunch" | "dinner" | "snack") {
  const directMatch = message.match(
    /(?:i\s+(?:had|ate|drank)|log(?:ged)?\s+(?:my\s+)?(?:meal|breakfast|lunch|dinner|snack)|for\s+(?:breakfast|lunch|dinner|snack))[:\s-]*([^.!?\n]+)/i
  );
  const rawTitle = directMatch?.[1] ? cleanMealTitle(directMatch[1]) : "";

  if (rawTitle.length >= 2) {
    return titleCase(rawTitle);
  }

  return `${titleCase(mealType)} log`;
}

function extractMacros(message: string) {
  return {
    calories:
      extractNumberFromPatterns(
        message,
        [/\b(\d{2,4})\s*(?:kcal|calories?|cals?)\b/i],
        0,
        3000
      ) ?? 0,
    proteinGrams:
      extractNumberFromPatterns(
        message,
        [/\b(\d{1,3})\s*g(?:rams?)?\s*protein\b/i, /\bprotein[^\d]{0,8}(\d{1,3})\b/i],
        0,
        300
      ) ?? 0,
    carbsGrams:
      extractNumberFromPatterns(
        message,
        [/\b(\d{1,3})\s*g(?:rams?)?\s*carbs?\b/i, /\bcarbs?[^\d]{0,8}(\d{1,3})\b/i],
        0,
        400
      ) ?? 0,
    fatGrams:
      extractNumberFromPatterns(
        message,
        [/\b(\d{1,3})\s*g(?:rams?)?\s*fat\b/i, /\bfat[^\d]{0,8}(\d{1,3})\b/i],
        0,
        200
      ) ?? 0,
    waterMl:
      extractNumberFromPatterns(
        message,
        [/\b(\d{2,4})\s*ml\b/i],
        0,
        4000
      ) ??
      (() => {
        const liters = extractNumberFromPatterns(
          message,
          [/\b(\d+(?:\.\d+)?)\s*(?:liters?|litres?|l)\b/i],
          0,
          5
        );

        return liters !== null ? Math.round(liters * 1000) : 0;
      })(),
  };
}

function extractCheckInAction(message: string): CoachAction | null {
  if (!/\bcheck[\s-]?in\b|\bmood\b|\benergy\b|\bstress\b|\badherence\b|\bsleep\b/i.test(message)) {
    return null;
  }

  const moodScore = extractNumberFromPatterns(
    message,
    [/\bmood[^\d]{0,12}(\d{1,2})(?:\/10)?\b/i],
    1,
    10
  );
  const energyScore = extractNumberFromPatterns(
    message,
    [/\benergy[^\d]{0,12}(\d{1,2})(?:\/10)?\b/i],
    1,
    10
  );
  const stressScore = extractNumberFromPatterns(
    message,
    [/\bstress[^\d]{0,12}(\d{1,2})(?:\/10)?\b/i],
    1,
    10
  );
  const adherenceScore = extractNumberFromPatterns(
    message,
    [/\badherence[^\d]{0,12}(\d{1,2})(?:\/10)?\b/i, /\bconsistency[^\d]{0,12}(\d{1,2})(?:\/10)?\b/i],
    1,
    10
  );
  const sleepHours = extractSleepHours(message);

  if (
    moodScore === null ||
    energyScore === null ||
    stressScore === null ||
    adherenceScore === null ||
    sleepHours === null
  ) {
    return null;
  }

  return {
    id: createId("coachcheckin"),
    type: "log_check_in",
    label: "Capture this check-in",
    description: "Save the daily check-in details directly from chat.",
    payload: {
      periodType: "daily",
      moodScore,
      energyScore,
      stressScore,
      adherenceScore,
      sleepHours,
      notes: "Captured automatically from coach chat.",
    },
  };
}

function extractFallbackLoggedActions(props: {
  message: string;
  habitSlugs: string[];
  sessionLengthMin: number;
}) {
  const actions: CoachAction[] = [];
  const lowerMessage = props.message.toLowerCase();
  const checkInAction = extractCheckInAction(props.message);

  if (checkInAction) {
    actions.push(checkInAction);
  }

  const hasWorkoutIntent =
    /(?:\bi\s+(?:did|completed|finished|logged|went for|had|wrapped up)\b|\blog(?:ged)?\b)/i.test(
      props.message
    ) &&
    /\bworkout\b|\bsession\b|\bwalk(?:ed|ing)?\b|\bran\b|\brun\b|\bjog(?:ged|ging)?\b|\blift(?:ed|ing)?\b|\bstrength\b|\bweights?\b|\btrain(?:ed|ing)?\b|\bexercise\b|\bhiit\b|\bmobility\b|\byoga\b|\bcycle(?:d|ing)?\b|\bbik(?:e|ed|ing)\b/i.test(
      props.message
    );

  if (hasWorkoutIntent) {
    actions.push({
      id: createId("coachworkout"),
      type: "log_workout",
      label: "Capture this workout",
      description: "Save the completed workout directly from chat.",
      payload: {
        workoutName: inferWorkoutName(props.message),
        durationMin: extractDurationMin(
          props.message,
          inferWorkoutFallbackDuration(props.message, props.sessionLengthMin)
        ),
        effortScore: extractNumberFromPatterns(
          props.message,
          [
            /\beffort[^\d]{0,12}(\d{1,2})(?:\/10)?\b/i,
            /\brpe[^\d]{0,8}(\d{1,2})(?:\/10)?\b/i,
            /\b(\d{1,2})\/10\b/i,
          ],
          1,
          10
        ) ?? undefined,
        notes: "Captured automatically from coach chat.",
      },
    });
  }

  const hasMealIntent =
    /(?:\bi\s+(?:had|ate|drank|finished)\b|\blog(?:ged)?\s+(?:my\s+)?(?:meal|breakfast|lunch|dinner|snack)\b|\bfor\s+(?:breakfast|lunch|dinner|snack)\b)/i.test(
      props.message
    ) &&
    !(/\bwater\b/.test(lowerMessage) &&
      !/\bmeal\b|\bbreakfast\b|\blunch\b|\bdinner\b|\bsnack\b|\bprotein\b|\bcarbs?\b|\bfat\b|\bcalories?\b|\bfood\b|\bchicken\b|\brice\b|\boats\b|\beggs?\b/i.test(
        props.message
      ));

  if (hasMealIntent) {
    const mealType = inferMealType(props.message);
    const macros = extractMacros(props.message);

    actions.push({
      id: createId("coachmeal"),
      type: "log_meal",
      label: "Capture this meal",
      description: "Save the meal details directly from chat.",
      payload: {
        mealType,
        title: inferMealTitle(props.message, mealType),
        calories: macros.calories,
        proteinGrams: macros.proteinGrams,
        carbsGrams: macros.carbsGrams,
        fatGrams: macros.fatGrams,
        waterMl: macros.waterMl,
        notes: "Captured automatically from coach chat.",
      },
    });
  }

  if (
    props.habitSlugs.includes("hydrate") &&
    /(?:\bhit\b|\bfinished\b|\bcompleted\b|\blog(?:ged)?\b|\bdrank\b).*(?:\bwater\b|\bhydration\b)|(?:\bwater goal\b|\bhydration target\b)/i.test(
      props.message
    )
  ) {
    actions.push({
      id: createId("coachhabit"),
      type: "log_habit",
      label: "Mark hydration habit",
      description: "Record the hydration habit directly from chat.",
      payload: {
        habitSlug: "hydrate",
        status: "done",
        note: "Captured automatically from coach chat.",
      },
    });
  }

  if (
    props.habitSlugs.includes("walk") &&
    !hasWorkoutIntent &&
    /(?:\bwalk habit\b|\bmovement break\b|\bpost[- ]meal walk\b|\bstep goal\b|\bdid my walk\b)/i.test(
      props.message
    )
  ) {
    actions.push({
      id: createId("coachhabit"),
      type: "log_habit",
      label: "Mark walk habit",
      description: "Record the walk habit directly from chat.",
      payload: {
        habitSlug: "walk",
        status: "done",
        note: "Captured automatically from coach chat.",
      },
    });
  }

  if (
    props.habitSlugs.includes("sleep") &&
    /(?:\bsleep window\b|\bbedtime\b|\bdid my sleep habit\b|\bkept my sleep\b|\bin bed by\b)/i.test(
      props.message
    )
  ) {
    actions.push({
      id: createId("coachhabit"),
      type: "log_habit",
      label: "Mark sleep habit",
      description: "Record the sleep habit directly from chat.",
      payload: {
        habitSlug: "sleep",
        status: "done",
        note: "Captured automatically from coach chat.",
      },
    });
  }

  return uniqueCoachActions(actions).slice(0, 4);
}

export async function generateCoachReply(props: {
  message: string;
  goalSummary: string;
  activityLevel: string;
  experienceLevel: string;
  conversationId: string;
  memoryContext?: string;
  habitSlugs?: string[];
  sessionLengthMin?: number;
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
      structured: {
        ...safetyReply.structured,
        actions: [],
        loggedActions: [],
      },
    };
  }

  const fallback = buildFallbackCoachReply(props.message, props.goalSummary);
  const fallbackLoggedActions = extractFallbackLoggedActions({
    message: props.message,
    habitSlugs: props.habitSlugs ?? [],
    sessionLengthMin: props.sessionLengthMin ?? 35,
  });
  const apiKey = process.env.OPENAI_API_KEY;
  const model = process.env.HEALTHFIT_AI_MODEL;

  if (!apiKey || !model) {
    return {
      conversationId: props.conversationId,
      message: `${fallback.recap}\n\nFocus for today:\n- ${fallback.focus.join("\n- ")}\n\nNext actions:\n- ${fallback.nextActions.join("\n- ")}`,
      safetyStatus: "clear",
      flags: [],
      fallbackUsed: true,
      structured: {
        ...fallback,
        actions: [],
        loggedActions: fallbackLoggedActions,
      },
    };
  }

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      signal: AbortSignal.timeout(10_000),
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
              "You are Healthfit.ai, a wellness-only coach. Do not diagnose, prescribe, or claim to treat disease. Reply as JSON with keys: message, recap, focus, nextActions, disclaimer, loggedActions. loggedActions must be an array. Only include a logged action when the member clearly reports something already completed or explicitly asks you to log it now. Allowed logged action types: log_workout, log_meal, log_habit, log_check_in. Never include navigate or replan actions in loggedActions. Use the provided habit slug list exactly for habits. For workouts, use a sensible duration if the exact number is missing. For meals, it is acceptable to set calories and macros to 0 when truly unknown. For check-ins, only log when mood, energy, stress, adherence, and sleep can all be inferred with reasonable confidence.",
          },
          {
            role: "user",
            content: `Member goal: ${props.goalSummary}\nActivity level: ${props.activityLevel}\nExperience level: ${props.experienceLevel}\nDefault workout session length: ${props.sessionLengthMin ?? 35} minutes\nAvailable habit slugs: ${(props.habitSlugs ?? []).join(", ") || "none"}\nMember memory:\n${props.memoryContext ?? "No additional context"}\nUser message: ${props.message}`,
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

    const loggedActions = normalizeLoggedActions(
      parsed.loggedActions,
      props.habitSlugs ?? []
    );

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
        actions: [],
        loggedActions,
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
      structured: {
        ...fallback,
        actions: [],
        loggedActions: fallbackLoggedActions,
      },
    };
  }
}
