## ADDED Requirements

### Requirement: Resolve project state root from locator
The system SHALL resolve the project state root from a repository-root locator file, defaulting to `openspec` when the locator is absent.

#### Scenario: Locator absent
- **WHEN** a command resolves the state root in a project without `.openspec-root.json`
- **THEN** the resolved state root SHALL be `openspec`

#### Scenario: Locator present with nested root
- **WHEN** `.openspec-root.json` contains `stateRoot: ".planning/openspec"`
- **THEN** the resolved state root SHALL be `.planning/openspec`
- **AND** all project state paths SHALL be derived from that root

### Requirement: Reject unsafe state root values
The system SHALL reject locator values that are absolute paths or escape the project root.

#### Scenario: Absolute path rejected
- **WHEN** `.openspec-root.json` contains an absolute path
- **THEN** the system SHALL fail with a validation error

#### Scenario: Parent traversal rejected
- **WHEN** `.openspec-root.json` contains `../shared/openspec`
- **THEN** the system SHALL fail with a validation error

### Requirement: Expose canonical project path helpers
The system SHALL expose helper functions for all project state locations derived from the resolved state root.

#### Scenario: Changes path derivation
- **WHEN** `getChangesDir(projectRoot)` is called
- **THEN** the system SHALL return `<projectRoot>/<stateRoot>/changes`

#### Scenario: Archive path derivation
- **WHEN** `getArchiveDir(projectRoot)` is called
- **THEN** the system SHALL return `<projectRoot>/<stateRoot>/changes/archive`

#### Scenario: Config path derivation
- **WHEN** `getProjectConfigPath(projectRoot)` is called
- **THEN** the system SHALL return `<projectRoot>/<stateRoot>/config.yaml`

#### Scenario: Project schemas path derivation
- **WHEN** `getProjectSchemasDir(projectRoot)` is called
- **THEN** the system SHALL return `<projectRoot>/<stateRoot>/schemas`
