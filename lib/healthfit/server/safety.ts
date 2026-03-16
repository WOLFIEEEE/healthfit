const medicalRedFlags = [
  "chest pain",
  "trouble breathing",
  "shortness of breath",
  "fainted",
  "passed out",
  "suicidal",
  "self harm",
  "self-harm",
  "severe pain",
  "stroke",
  "heart attack",
  "bleeding heavily",
];

const promptInjectionSignals = [
  "ignore previous instructions",
  "ignore all previous",
  "reveal your system prompt",
  "developer message",
  "act as my doctor",
  "diagnose me",
];

export function detectSafetyFlags(message: string) {
  const lowerMessage = message.toLowerCase();

  const redFlags = medicalRedFlags.filter((flag) => lowerMessage.includes(flag));
  const promptFlags = promptInjectionSignals.filter((flag) =>
    lowerMessage.includes(flag)
  );

  return [...redFlags, ...promptFlags];
}

export function isCautionMessage(message: string) {
  return detectSafetyFlags(message).length > 0;
}

export function buildSafetyReply(flags: string[]) {
  return {
    message:
      "I’m not able to help with urgent or medical-risk situations. If symptoms feel serious, severe, or unsafe, seek immediate medical help or contact local emergency services right away.",
    structured: {
      recap:
        "Your message may involve a medical or safety-sensitive situation that needs human support.",
      focus: [
        "pause training advice for now",
        "seek qualified professional help if needed",
        "return to wellness planning only when it feels safe",
      ],
      nextActions: [
        "If symptoms are urgent, contact emergency services now.",
        "If symptoms persist, speak with a licensed clinician.",
        "Use Healthfit.ai only for non-clinical wellness support.",
      ],
      disclaimer:
        "Healthfit.ai is not a medical provider and cannot diagnose or treat conditions.",
    },
    flags,
  };
}
