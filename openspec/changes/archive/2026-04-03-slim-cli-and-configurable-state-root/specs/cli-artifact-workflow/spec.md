## MODIFIED Requirements

### Requirement: Status Command
The system SHALL display artifact completion status for a change located under the resolved project state root.

#### Scenario: Status JSON output
- **WHEN** user runs `openspec status --change <id> --json`
- **THEN** the system outputs JSON with `changeName`, `schemaName`, `isComplete`, `applyRequires`, and `artifacts`
- **AND** path resolution SHALL use the resolved state root

#### Scenario: Unknown change
- **WHEN** user runs `openspec status --change unknown-id`
- **AND** directory `<stateRoot>/changes/unknown-id/` does not exist
- **THEN** the system displays an error listing all available change directories from `<stateRoot>/changes/`

### Requirement: Instructions Command
The system SHALL output enriched instructions for creating an artifact using paths derived from the resolved project state root.

#### Scenario: Instructions on scaffolded change
- **WHEN** user runs `openspec instructions proposal --change <id>` on a scaffolded change
- **THEN** system outputs template and metadata for creating the proposal
- **AND** output paths SHALL point into `<stateRoot>/changes/<id>/`

#### Scenario: Nested state root
- **WHEN** the resolved state root is `.planning/openspec`
- **THEN** `openspec instructions <artifact> --change <id> --json` SHALL return `changeDir` under `.planning/openspec/changes/<id>/`

### Requirement: New Change Command
The system SHALL create new change directories under the resolved project state root with validation.

#### Scenario: Create valid change
- **WHEN** user runs `openspec new change add-feature`
- **THEN** the system creates `<stateRoot>/changes/add-feature/` directory

#### Scenario: Create with nested state root
- **WHEN** the resolved state root is `.planning/openspec`
- **THEN** `openspec new change add-feature` creates `.planning/openspec/changes/add-feature/`

### Requirement: Apply Instructions Command
The system SHALL generate schema-aware apply instructions using context files resolved from the project state root.

#### Scenario: Generate apply instructions
- **WHEN** user runs `openspec instructions apply --change <id> --json`
- **AND** all required artifacts exist
- **THEN** the system outputs `contextFiles` pointing to artifact files under `<stateRoot>/changes/<id>/`

#### Scenario: Apply blocked by missing artifacts
- **WHEN** user runs `openspec instructions apply --change <id>`
- **AND** required artifacts are missing
- **THEN** the system indicates apply is blocked
- **AND** lists which artifacts must be created first
