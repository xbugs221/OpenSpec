## MODIFIED Requirements

### Requirement: Project-local schema resolution
The system SHALL resolve schemas from the project-local directory (`<stateRoot>/schemas/<name>/`) with highest priority when a `projectRoot` is provided.

#### Scenario: Project-local schema takes precedence over user override
- **WHEN** a schema named "my-workflow" exists at `<stateRoot>/schemas/my-workflow/schema.yaml`
- **AND** a schema named "my-workflow" exists at `~/.local/share/openspec/schemas/my-workflow/schema.yaml`
- **AND** `getSchemaDir("my-workflow", projectRoot)` is called
- **THEN** the system SHALL return the project-local path

#### Scenario: Nested state root schema
- **WHEN** the resolved state root is `.planning/openspec`
- **THEN** project-local schema lookup SHALL use `.planning/openspec/schemas/<name>/schema.yaml`

### Requirement: Project schemas directory helper
The system SHALL provide a `getProjectSchemasDir(projectRoot)` function that returns the project-local schemas directory path under the resolved state root.

#### Scenario: Returns correct path
- **WHEN** `getProjectSchemasDir("/path/to/project")` is called
- **THEN** the system SHALL return `/path/to/project/<stateRoot>/schemas`

### Requirement: Support project-local schema names in config
The system SHALL allow the config schema field to reference project-local schemas defined under the resolved state root.

#### Scenario: Config references project-local schema
- **WHEN** config contains `schema: "my-workflow"` and `<stateRoot>/schemas/my-workflow/` exists
- **THEN** system resolves to the project-local schema
