## MODIFIED Requirements

### Requirement: Change Creation
The system SHALL provide a function to create new change directories programmatically under the resolved project state root.

#### Scenario: Create change
- **WHEN** `createChange(projectRoot, 'add-auth')` is called
- **THEN** the system creates `<stateRoot>/changes/add-auth/` directory

#### Scenario: Duplicate change rejected
- **WHEN** `createChange(projectRoot, 'add-auth')` is called and `<stateRoot>/changes/add-auth/` already exists
- **THEN** the system throws an error indicating the change already exists

#### Scenario: Creates parent directories if needed
- **WHEN** `createChange(projectRoot, 'add-auth')` is called and `<stateRoot>/changes/` does not exist
- **THEN** the system creates the full path including parent directories

#### Scenario: Nested state root respected
- **WHEN** the resolved state root is `.planning/openspec`
- **THEN** `createChange(projectRoot, 'add-auth')` creates `.planning/openspec/changes/add-auth/`

#### Scenario: Invalid change name rejected
- **WHEN** `createChange(projectRoot, 'Add Auth')` is called with an invalid name
- **THEN** the system throws a validation error
