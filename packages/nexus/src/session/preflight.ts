/**
 * Lightweight ambiguity detector for incoming user prompts. Runs before the
 * LLM call so a short system nudge can be appended when the request is vague
 * enough that the agent would otherwise guess and waste a turn.
 *
 * Pure regex/heuristic — no LLM call, no Effect layer. The classifier is
 * intentionally loose (5-10% false positives) to keep the user in control
 * via the question tool rather than silently working from a wrong premise.
 */

const AMBIGUITY_PATTERNS: { pattern: RegExp; reason: string }[] = [
  { pattern: /^(it|this|that|those|these)\b/i, reason: "vague pronoun" },
  { pattern: /\b(maybe|perhaps|might|possibly)\b/i, reason: "uncertain modal verb" },
  { pattern: /\b(something|anything|none|some)\b\s+(to|for|with|about)\b/i, reason: "indefinite scope" },
  { pattern: /\?\s*$/, reason: "ends with a question" },
  { pattern: /^(can you|could you|would you|please)\b.{0,30}$/i, reason: "very short request" },
  { pattern: /\b(whatever|whichever|any)\b/i, reason: "open-ended choice" },
  { pattern: /\b(fix it|change it|update it|do that|do this)\b/i, reason: "reference without target" },
]

const MIN_LENGTH_FOR_LLM = 8
const MAX_LENGTH_FOR_HINT = 60

export type AmbiguityResult = {
  ambiguous: boolean
  reason?: string
  hint?: string
}

export function detectAmbiguity(text: string): AmbiguityResult {
  const trimmed = text.trim()
  if (trimmed.length < MIN_LENGTH_FOR_LLM) {
    return { ambiguous: true, reason: "very short input" }
  }

  for (const { pattern, reason } of AMBIGUITY_PATTERNS) {
    if (pattern.test(trimmed)) {
      return {
        ambiguous: true,
        reason,
        hint: buildHint(trimmed, reason),
      }
    }
  }

  return { ambiguous: false }
}

function buildHint(text: string, reason: string): string {
  const preview = text.length > MAX_LENGTH_FOR_HINT ? text.slice(0, MAX_LENGTH_FOR_HINT - 1) + "…" : text
  return `User input may be ambiguous (${reason}). Consider using the question tool to clarify the goal before proceeding. Original input: "${preview}"`
}

const DOUBT_SIGNALS: RegExp[] = [
  /\b(i'm not sure|not sure|unclear|ambiguous|depends on|either)\b/i,
  /\bshould i|do you want|which one|let me know\b/i,
  /\bassuming|presumably|probably|might be\b/i,
  /\b(we could|you could|alternatively)\b/i,
]

export function detectDoubtInResponse(text: string): boolean {
  return DOUBT_SIGNALS.some((pattern) => pattern.test(text))
}
