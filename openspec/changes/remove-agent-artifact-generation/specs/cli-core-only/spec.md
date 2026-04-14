## ADDED Requirements

### Requirement: OpenSpec SHALL operate as a CLI-only workflow tool

OpenSpec SHALL manage only its own CLI behavior and OpenSpec-owned project state. It SHALL NOT manage external agent integration artifacts.

#### Scenario: CLI-only product boundary

- **WHEN** a user runs any OpenSpec command
- **THEN** OpenSpec SHALL treat tool-specific skills, prompts, and command files as out of scope
- **AND** SHALL NOT create, refresh, delete, or inspect them as part of normal operation
