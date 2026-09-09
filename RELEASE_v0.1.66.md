# NEXUS v0.1.66 — show-all-hidden release

Built: 2026-09-09 Termux aarch64
Base: v0.1.65 -> v0.1.66

## Summary
TUI pe jo jo cheeze hide thi sabko show kar diya hai. User request pe "sab kuch dikhao" mode.

## Changes (hidden -> visible)

1. **packages/tui/src/context/thinking.ts:36,51-60**
   - `thinking_mode` default `hide` -> `show`
   - legacy `hide`/`minimal` -> `show`
   - fallback `hide` -> `show`

2. **packages/tui/src/routes/session/index.tsx:302,306,309,312**
   - `conceal` true->false (code conceal disabled)
   - `timestamps` hide->show
   - `scrollbar_visible` false->true
   - `generic_tool_output_visibility` false->true
   - `sidebarVisible` ab `wide()` dependency hata di, `auto` pe hamesha visible

3. **packages/tui/src/routes/session/index.tsx:1806-1815**
   - `ToolPart.shouldHide` hamesha false -> tool details kabhi hide nahi

4. **packages/tui/src/routes/session/index.tsx:1688,1894,2145**
   - `ReasoningPart`, `GenericTool`, `Shell` expanded false->true -> full output dikhega, truncated nahi

5. **packages/tui/src/routes/session/index.tsx:796-1127**
   - 14 commands `hidden: true` -> `hidden: false`:
     page up/down, line up/down, half page up/down, first/last, messages_last_user, message next/prev, background, child.first/parent/next/prev
     -> ab command palette me visible

6. **packages/tui/src/ui/dialog-select.tsx:613**, **component/dialog-workspace-file-changes.tsx:86**, **component/prompt/autocomplete.tsx:737**
   - `scrollbarOptions visible: false` -> `true`

## Version bump
- 19 packages 0.1.65 -> 0.1.66 (app, cli, codemode, core, desktop, effect-drizzle-sqlite, effect-sqlite-node, enterprise, function, http-recorder, llm, nexus, plugin, server, session-ui, slack, tui, ui, web)
- CHANGELOG.md updated

## Verify
- `grep -c "hidden: true" packages/tui/src/routes/session/index.tsx` -> 0 (pehle 14)
- `grep "thinking_mode.*show" packages/tui/src/context/thinking.ts` -> OK
- `grep "timestamps.*show" packages/tui/src/routes/session/index.tsx` -> OK

## Install / Update
`nexus --version` -> 0.1.66 expected after build
Build: `bun run --cwd packages/nexus build` then install to `~/.nexus/bin/nexus`

## Notes
- Sab defaults ab show pe hai, user chahe to toggle commands se wapas hide kar sakta hai: `session.toggle.*`
- Sidebar ab narrow screen pe bhi dikhega (overlay nahi)
