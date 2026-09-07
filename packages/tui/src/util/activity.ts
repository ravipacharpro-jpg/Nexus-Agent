import type { Part, ToolPart } from "@nexus-ai/sdk/v2"

const MAX_DETAIL = 80

function firstLine(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined
  const trimmed = value.trim()
  if (!trimmed) return undefined
  return trimmed.split(/\r?\n/, 1)[0]
}

function detailFor(part: Pick<ToolPart, "tool" | "state">): string | undefined {
  const input = (part as { state?: { input?: Record<string, unknown> } }).state?.input ?? {}
  switch (part.tool) {
    case "read":
      return firstLine(input.filePath)
    case "edit":
    case "write":
      return firstLine(input.filePath)
    case "bash":
      return firstLine(input.command)
    case "grep":
      return [firstLine(input.pattern), firstLine(input.include)].filter(Boolean).join(" in ")
    case "glob":
      return firstLine(input.pattern)
    case "webfetch":
      return firstLine(input.url)
    case "websearch":
      return firstLine(input.query)
    case "task":
      return firstLine(input.subagent_type) ?? firstLine(input.description)
    case "todowrite": {
      const todos = Array.isArray(input.todos) ? (input.todos as { status: string }[]) : []
      const active = todos.filter((t) => t.status === "in_progress").length
      return `${todos.length} steps${active ? `, ${active} active` : ""}`
    }
    case "question": {
      const questions = Array.isArray(input.questions) ? (input.questions as { question: string }[]) : []
      return questions[0]?.question
    }
    case "apply_patch": {
      const files = Array.isArray(input.files) ? input.files.length : 0
      return files ? `${files} file${files === 1 ? "" : "s"}` : undefined
    }
    default:
      return undefined
  }
}

function trim(s: string): string {
  return s.length > MAX_DETAIL ? s.slice(0, MAX_DETAIL - 1) + "…" : s
}

/**
 * Fixed, redacted narration for a running tool. Labels never interpolate
 * command, path, URL, query, pattern, description, title, or task text so the
 * timeline cannot leak user content while a step is still in flight.
 */
export function activityLabel(part: Pick<ToolPart, "tool" | "state">): string {
  const verb =
    part.tool === "read"
      ? "Read"
      : part.tool === "edit"
        ? "Edit"
        : part.tool === "write"
          ? "Write"
          : part.tool === "bash"
            ? "Run"
            : part.tool === "grep" || part.tool === "glob"
              ? "Search"
              : part.tool === "webfetch"
                ? "Fetch"
                : part.tool === "websearch"
                  ? "Search"
                  : part.tool === "task"
                    ? "Delegate"
                    : part.tool === "todowrite"
                      ? "Plan"
                      : part.tool === "question"
                        ? "Ask"
                        : part.tool === "apply_patch"
                          ? "Patch"
                          : "Working"
  const detail = detailFor(part)
  return detail ? `→ ${verb} ${trim(detail)}` : `→ ${verb}…`
}

/**
 * Current redacted stage of a running assistant turn, derived only from the
 * already-streamed parts of its last message. Returns undefined once visible
 * text is streaming (the timeline itself shows that text).
 */
export function liveActivity(parts: Part[]): string | undefined {
  const running = parts.findLast(
    (part): part is ToolPart => part.type === "tool" && ["pending", "running"].includes(part.state.status),
  )
  if (running) return activityLabel(running)
  const streaming = parts.findLast((part) => part.type === "text" && part.text.trim())
  if (!streaming) return "Thinking..."
  return undefined
}
