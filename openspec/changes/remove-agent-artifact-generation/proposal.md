## Why

OpenSpec currently acts as both:

- a project CLI for spec-driven workflow management
- an installer/synchronizer for agent-specific skills, prompts, and command files

That second responsibility is now unwanted. It creates repository churn, writes files into tool-owned directories such as `.claude/skills/` and `.codex/skills/`, writes global prompt files such as `~/.codex/prompts/`, and conflicts with user-maintained agent instructions.

We want a narrower product boundary:

- keep the `openspec` CLI
- keep the `openspec/` project state and schema system
- remove all managed agent artifact generation and cleanup

## What Changes

### 1. Make OpenSpec CLI-only

Refactor `openspec init` and `openspec update` so they only manage OpenSpec project state and CLI behavior. They must not create, refresh, delete, or detect any tool-specific skills, prompts, workflow files, or command files.

### 2. Remove agent integration surface from runtime behavior

Remove the code paths that currently:

- define tool-specific skills directories
- generate tool-specific skill files
- generate tool-specific prompt/command files
- scan projects for configured AI tools
- infer migration state from generated agent artifacts
- clean up legacy managed agent files

### 3. Remove config concepts that only exist for artifact installation

Remove install-time configuration concepts whose sole purpose is distributing agent artifacts, including tool selection, profile-driven skill installation, and delivery mode (`skills`, `commands`, `both`).

### 4. Keep OpenSpec-owned state only

The only filesystem writes performed by init/update should stay within OpenSpec-owned state, such as:

- `openspec/`
- project-local OpenSpec config/state files
- any future CLI-owned metadata under the OpenSpec state root

No writes should occur under tool-owned paths or user home prompt directories.

## Capabilities

### New Capabilities

- `cli-core-only`: Define OpenSpec as a CLI-first tool that does not manage external agent artifacts.

### Modified Capabilities

- `cli-init`: initialization no longer installs or refreshes agent skills/prompts/commands
- `cli-update`: update no longer syncs agent artifacts or legacy tool integrations
- `cli-config`: remove configuration flows that only control agent artifact installation
- `global-config`: remove persisted delivery/profile/tool-install settings that no longer apply
- `command-generation`: remove managed prompt/command file generation from the product surface
- `ai-tool-paths`: remove tool path metadata used only for skill/prompt installation
- `legacy-cleanup`: stop detecting and mutating legacy agent artifact files

## Impact

- `src/core/init.ts`
- `src/core/update.ts`
- `src/core/config.ts`
- `src/core/global-config.ts`
- `src/core/available-tools.ts`
- `src/core/migration.ts`
- `src/core/profile-sync-drift.ts`
- `src/core/shared/tool-detection.ts`
- `src/core/legacy-cleanup.ts`
- `src/core/command-generation/`
- `src/commands/config.ts`
- docs describing supported tools, skills, prompts, and delivery modes
- tests that currently assert skill/prompt generation behavior
