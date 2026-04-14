## ADDED Requirements

### Requirement: Update SHALL avoid agent artifact synchronization

The `openspec update` command SHALL update only OpenSpec-owned state and SHALL NOT synchronize tool-specific skills, prompts, or command files.

#### Scenario: Update in a project with legacy agent artifacts

- **WHEN** a project contains legacy or manually maintained `.claude/skills`, `.codex/skills`, `~/.codex/prompts`, or similar files
- **THEN** `openspec update` SHALL NOT modify or delete those files
- **AND** SHALL continue operating only on OpenSpec-owned state

#### Scenario: Update without configured tools

- **WHEN** a user runs `openspec update`
- **THEN** success SHALL NOT depend on detecting configured AI tools or generated artifact files
- **AND** the command SHALL avoid tool-scanning logic entirely
