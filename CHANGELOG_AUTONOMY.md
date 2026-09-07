# NEXUS — Self-Evolution Changelog

This changelog records changes that the NEXUS agent applied to itself during
autonomous runs. It is intentionally separate from `CHANGELOG.md` (which is the
user-facing release history) so a reviewer can audit self-modifications
without scrolling through every product release.

Format: `[run-id] type(scope): summary` — conventional commits, grouped by run.

---

## Run 2026-09-06T18:48Z (autonomous, head `b451604`)

### Diagnosis

- `Provider.defaultModel()` credential bypass (item 4 in `AUDIT_BASELINE.md`)
  was already fixed in `b451604` after a 10-commit fast-forward from
  `97e25c3`. `runtime.queue.ts` already exposes an immediate acknowledgement
  via `acknowledgement()`, `queuedAcknowledgement()`, and
  `steeringAcknowledgement()`. The error classification file
  (`packages/core/src/session/orchestrator/error-classification.ts`) and the
  `RunCompletionUnverified` gate in `runner/completion.ts` are present. The
  five critical silent-fail bugs identified earlier were already in the
  source tree; no code fix was required.
- `termux-core` has 8 co-located test files (`*.test.ts`) — earlier count of
  zero was a path typo. `test/installer-termux-wrapper.test.sh` already
  exercises the canonical Termux wrapper. CI runs `bash -n` against every
  `scripts/install-browser-*.sh`.

### Heals (install scripts only)

- `install.sh:407` — TMPDIR selection now honors `${TMPDIR}` first, then
  `${PREFIX}/tmp` on Termux, then `/tmp`. Removes the silent `EROFS` on
  Termux when `TMPDIR` is unset.
- `install.sh:206-225` — release-version discovery now sends an explicit
  `User-Agent`, tolerates the repo-rename redirect, and rejects any value
  that does not look like `vX.Y.Z` (rate-limit messages and redirect bodies
  cannot leak through).
- `install.sh:269` — `check_version` now greps the first semver-shaped
  token from `nexus --version`, so debug builds like
  `0.0.0--202609060746` and annotated releases like
  `0.1.11 (commit abc)` no longer break the equality check.
- `AGENTS.md` — new "Termux Compatibility" section documents the
  `/tmp`/`/usr/bin/env`/`tsgo`/`grun` pitfalls so future agents do not
  rediscover them.

### Verification

- `bash -n` passes on `install.sh`, `install-termux.sh`, and
  `install-termux-easy.sh`.
- `git diff --stat`: 1 file, 38 insertions, 4 deletions
  (`AGENTS.md` not included; it is documentation, not committed yet).
- `nexus` runtime was not touched; `nexus.bin` is the same dev build as
  before the run, so user-visible behaviour is unchanged.
- Working tree: 1 modified file (`install.sh`) plus the pre-existing
  `install-termux.sh` chmod noise.

### Not changed (out of scope)

- The `/tmp` reference that the *installed* `nexus` binary hits when
  invoking `nexus doctor` lives in compiled code, not in the source
  monorepo. Reinstalling the release binary is the correct fix, and that
  was explicitly deferred to the user.
- `package.json` `repository.url` already points at the new canonical
  remote — no edit required.
- Branch rename to `dev` was declined by the user; left as `nexus`.

### Suggested next steps for the user

- `nexus upgrade` to swap the dev-build binary for the v0.1.63 release.
- Re-run `nexus doctor` to confirm the `/tmp` error is gone in the
  release build.
- `git diff install.sh AGENTS.md` for a final review before any push.
