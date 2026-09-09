# Changelog

## [0.1.66] - 2026-09-09

### feat(tui): show all previously hidden elements by default

- `thinking_mode` default `hide` -> `show` (`packages/tui/src/context/thinking.ts:36`): Reasoning body ab collapsed nahi, full visible
- `timestamps` `hide` -> `show`, `scrollbar_visible` `false` -> `true`, `generic_tool_output_visibility` `false` -> `true`, `conceal` `true` -> `false` (`packages/tui/src/routes/session/index.tsx:302,306,309,312`)
- Sidebar `auto` ab `wide()` check bina hamesha visible (`index.tsx:315-320`), scrollbar `visible: true` in dialog-select/autocomplete/file-changes
- `ToolPart` `shouldHide` always `false` (`index.tsx:1806-1815`): tool details kabhi hide nahi honge
- `GenericTool`/`Shell`/`ReasoningPart` `expanded` default `false` -> `true` (`index.tsx:1688,1894,2145`): collapsed output pura dikhega
- All `hidden: true` commands -> `hidden: false` (`index.tsx:796-1127`): Page up/down, Line up/down, Half page, First/Last message, Jump last user, Next/Prev message, Background subagents, Child/Parent navigation ab palette me visible

## Unreleased

### feat(tui): Browser Adapter with 3 size options

- Add Ctrl+P -> Browser Adapter dialog (`/browser` slash command).
- 3 modes: Minimal (60 MB), Balanced (600 MB), Full Power (1.3 GB).
- New scripts: `scripts/install-browser-minimal.sh`, `install-browser-balanced.sh`, `install-browser-full.sh`.
- Shared helper: `scripts/install-browser-common.sh` (platform detect, disk check, retry).
- Wrapper installed at `~/.local/bin/nexus-browser` for agent use.
- Docs: `docs/BROWSER_ADAPTER.md`.

### chore(assistant): remove autofarm plugin

- Delete `packages/assistant/src/plugins/autofarm/`.
- No code references remain; agent handles web tasks via Browser Adapter.
- `nexus doctor` no longer includes autofarm checks.

### feat(nexus): doctor Browser Adapter check

- Add `Browser Adapter` check to `nexus doctor`.
- Reports ok when wrapper + venv present, skip when not installed.
- Update test to expect 11 checks.
