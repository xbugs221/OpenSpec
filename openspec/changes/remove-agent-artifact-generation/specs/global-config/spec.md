## ADDED Requirements

### Requirement: Global config SHALL store only CLI-relevant settings

OpenSpec global configuration SHALL NOT persist settings that exist only to control agent artifact installation.

#### Scenario: Reading existing config with legacy installation keys

- **WHEN** OpenSpec loads global config containing legacy keys such as tool selection, profile, or delivery for artifact installation
- **THEN** OpenSpec SHALL ignore or migrate them away without requiring agent artifact sync logic
- **AND** SHALL NOT use them to write files outside OpenSpec-owned state
