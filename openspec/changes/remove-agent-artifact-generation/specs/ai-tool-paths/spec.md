## ADDED Requirements

### Requirement: Tool path metadata SHALL not drive artifact installation

OpenSpec SHALL NOT maintain runtime path metadata for external tool skill/prompt installation.

#### Scenario: Runtime path resolution

- **WHEN** OpenSpec resolves filesystem targets during init or update
- **THEN** it SHALL resolve only OpenSpec-owned paths
- **AND** SHALL NOT compute `.claude`, `.codex`, `.cursor`, home-directory prompt paths, or similar external tool targets
