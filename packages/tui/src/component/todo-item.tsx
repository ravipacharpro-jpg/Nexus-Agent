import { useTheme } from "../context/theme"

export interface TodoItemProps {
  status: string
  content: string
}

export function TodoItem(props: TodoItemProps) {
  const { theme } = useTheme()

  return (
    <box flexDirection="row" gap={0}>
      <text
        flexShrink={0}
        style={{
          fg: props.status === "completed" ? theme.success : props.status === "in_progress" ? theme.warning : theme.textMuted,
        }}
      >
        {props.status === "completed" ? "[done]" : props.status === "in_progress" ? "[run]" : "[todo]"} {" "}
      </text>
      <text
        flexShrink={0}
        style={{
          fg: theme.textMuted,
        }}
      >
        {"  "}
      </text>
      <text
        flexGrow={1}
        wrapMode="word"
        style={{
          fg: props.status === "completed" ? theme.text : props.status === "in_progress" ? theme.warning : theme.textMuted,
        }}
      >
        {props.content}
      </text>
    </box>
  )
}
