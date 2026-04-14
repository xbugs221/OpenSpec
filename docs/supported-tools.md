# Supported Tools

OpenSpec is now CLI-only.

It no longer installs or refreshes:

- project-local `skills/` directories
- project-local `prompts/` or `commands/` directories
- global prompt files such as `~/.codex/prompts/`

OpenSpec manages only its own project state under `openspec/`.

## What This Means

- Keep your agent instructions in whatever format your tool expects
- Treat those files as user-owned, not OpenSpec-managed
- Use `openspec init` and `openspec update` only for OpenSpec project state

## OpenSpec-Owned Files

`openspec init` and `openspec update` may create or refresh:

- `openspec/`
- `openspec/specs/`
- `openspec/changes/`
- `openspec/changes/archive/`
- `openspec/config.yaml`

They do not create `.claude/`, `.codex/`, `.cursor/`, `.github/`, or similar tool-owned integration paths.
