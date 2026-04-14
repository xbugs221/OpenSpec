## ADDED Requirements

### Requirement: Init SHALL create only OpenSpec-owned project state

The `openspec init` command SHALL initialize OpenSpec project state without creating any tool-specific skills, prompts, workflow files, or command files.

#### Scenario: Init in a clean project

- **WHEN** a user runs `openspec init`
- **THEN** the command SHALL create or refresh only OpenSpec-owned files and directories
- **AND** SHALL NOT create `.claude/`, `.codex/`, `.cursor/`, `.github/`, or any other tool-owned integration directory

#### Scenario: Init with pre-existing tool directories

- **WHEN** a project already contains `.claude/`, `.codex/`, or other tool-owned directories
- **THEN** `openspec init` SHALL leave those directories untouched
- **AND** SHALL NOT create `skills`, `prompts`, `commands`, or workflow markdown files beneath them

#### Scenario: Removed tool-install flags

- **WHEN** a user invokes `openspec init` with tool-install options or other agent-artifact distribution options
- **THEN** the command SHALL fail with a clear error explaining that agent artifact installation is no longer supported
