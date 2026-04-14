## ADDED Requirements

### Requirement: Config SHALL exclude agent artifact installation controls

OpenSpec configuration SHALL NOT expose settings whose only purpose is selecting tools or controlling skill/prompt/command installation.

#### Scenario: Listing config

- **WHEN** a user runs `openspec config list`
- **THEN** the output SHALL NOT include tool-install, profile-delivery, or artifact-distribution settings

#### Scenario: Mutating removed config keys

- **WHEN** a user attempts to set a removed config key for tool installation behavior
- **THEN** the command SHALL fail with a clear error that the key is no longer supported
