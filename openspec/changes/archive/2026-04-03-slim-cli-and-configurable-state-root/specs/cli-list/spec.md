## MODIFIED Requirements

### Requirement: Command Execution
The command SHALL scan and analyze either active changes or specs from the resolved project state root based on the selected mode.

#### Scenario: Scanning for changes (default)
- **WHEN** `openspec list` is executed without flags
- **THEN** scan the `<stateRoot>/changes/` directory for change directories
- **AND** exclude the `archive/` subdirectory from results
- **AND** parse each change's `tasks.md` file to count task completion

#### Scenario: Scanning for specs
- **WHEN** `openspec list --specs` is executed
- **THEN** scan the `<stateRoot>/specs/` directory for capabilities
- **AND** read each capability's `spec.md`
- **AND** parse requirements to compute requirement counts

#### Scenario: Nested state root
- **WHEN** the resolved state root is `.planning/openspec`
- **THEN** `openspec list` scans `.planning/openspec/changes/` and `.planning/openspec/specs/`

### Requirement: Error Handling
The command SHALL gracefully handle missing files and directories using the resolved state root.

#### Scenario: Missing tasks.md file
- **WHEN** a change directory has no `tasks.md` file
- **THEN** display the change with "No tasks" status

#### Scenario: Missing changes directory
- **WHEN** `<stateRoot>/changes/` directory does not exist
- **THEN** `openspec list` SHALL report an empty active-change set instead of instructing the user to run `openspec init`

#### Scenario: Missing specs directory
- **WHEN** `<stateRoot>/specs/` directory does not exist
- **THEN** `openspec list --specs` SHALL display "No specs found."
