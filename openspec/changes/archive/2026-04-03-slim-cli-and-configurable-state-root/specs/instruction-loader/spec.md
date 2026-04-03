## MODIFIED Requirements

### Requirement: Change Context Loading
The system SHALL load change context combining graph and completion state from the resolved project state root.

#### Scenario: Load context for existing change
- **WHEN** `loadChangeContext(projectRoot, changeName)` is called for an existing change
- **THEN** the system returns a context with graph, completed set, schema name, and change info
- **AND** `changeDir` SHALL be located under `<stateRoot>/changes/<changeName>/`

#### Scenario: Load context for nested state root
- **WHEN** the resolved state root is `.planning/openspec`
- **THEN** `loadChangeContext(projectRoot, changeName)` uses `.planning/openspec/changes/<changeName>/`

### Requirement: Template Enrichment
The system SHALL enrich templates with change-specific context using resolved project paths.

#### Scenario: Include artifact metadata
- **WHEN** instructions are generated for an artifact
- **THEN** the output includes change name, artifact ID, schema name, and output path
- **AND** `outputPath` SHALL be relative to the resolved change directory

#### Scenario: Include dependency status
- **WHEN** an artifact has dependencies
- **THEN** the output shows each dependency with completion status
- **AND** dependency paths SHALL resolve under the same resolved state root
