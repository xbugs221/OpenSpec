## 1. State Root Resolution

- [x] 1.1 Add a repository-root locator format for `stateRoot` and a shared path helper module that derives config, changes, archive, specs, and schemas paths from it.
- [x] 1.2 Validate locator values so absolute paths and project-escaping paths fail fast with clear errors.
- [x] 1.3 Add unit tests covering default `openspec` fallback, nested `.planning/openspec` roots, and invalid locator values.

## 2. Runtime Command Refactor

- [x] 2.1 Refactor `new change`, `list`, `status`, `instructions`, `instructions apply`, config loading, change metadata, instruction loading, and schema resolution to use the shared path helpers.
- [x] 2.2 Update artifact and status output so returned file paths point at the resolved state root rather than hardcoded `openspec/` locations.
- [x] 2.3 Add integration tests that exercise the real runtime workflow in both `openspec/` and `.planning/openspec/` layouts:
- [x] 2.4 Verify `new change` creates the change in the configured root, `list --json` excludes archive, `status --json` reports scaffolded changes, and `instructions ... --json` returns resolved paths.

## 3. Remove Distribution Features

- [x] 3.1 Remove `init`, `experimental`, and `update` from the CLI surface and fail with a clear runtime-only error if invoked through stale entry points.
- [ ] 3.2 Delete command-generation, AI tool adapter, global profile/delivery, and legacy cleanup modules that only exist to emit prompts, skills, or slash commands.
- [ ] 3.3 Remove or rewrite tests that assume prompts/skills generation still exists.
- [x] 3.4 Add regression tests proving runtime commands no longer create or refresh `.codex/skills`, global prompts, or other tool-managed files.

## 4. Documentation And Migration

- [x] 4.1 Rewrite CLI and customization docs to describe the runtime-only distribution and the locator-based state root contract.
- [x] 4.2 Add migration guidance for moving an existing `openspec/` tree to `.planning/openspec/`.
- [x] 4.3 Add cross-platform verification for path-sensitive tests, including Windows path separator coverage in CI or equivalent test assertions.
