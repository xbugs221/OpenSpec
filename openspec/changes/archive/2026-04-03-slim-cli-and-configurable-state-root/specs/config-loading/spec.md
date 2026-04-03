## MODIFIED Requirements

### Requirement: Load project config from openspec/config.yaml
The system SHALL read and parse the project configuration file located at `<stateRoot>/config.yaml` relative to the project root.

#### Scenario: Valid config file exists
- **WHEN** `<stateRoot>/config.yaml` exists with valid YAML content
- **THEN** system parses the file and returns a ProjectConfig object

#### Scenario: Config file does not exist
- **WHEN** `<stateRoot>/config.yaml` does not exist
- **THEN** system returns null without error

#### Scenario: Nested state root config
- **WHEN** the resolved state root is `.planning/openspec`
- **THEN** the system reads `.planning/openspec/config.yaml`

### Requirement: Support .yml file extension alias
The system SHALL accept both `.yaml` and `.yml` file extensions for the config file under the resolved state root.

#### Scenario: Config file uses .yml extension
- **WHEN** `<stateRoot>/config.yml` exists and `<stateRoot>/config.yaml` does not exist
- **THEN** system reads from `<stateRoot>/config.yml`

#### Scenario: Both .yaml and .yml exist
- **WHEN** both `<stateRoot>/config.yaml` and `<stateRoot>/config.yml` exist
- **THEN** system prefers `<stateRoot>/config.yaml`
