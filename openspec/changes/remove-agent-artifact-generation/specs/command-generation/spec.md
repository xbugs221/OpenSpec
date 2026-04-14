## ADDED Requirements

### Requirement: OpenSpec SHALL not generate managed prompt or command markdown files

Managed prompt and command file generation for external tools is no longer part of OpenSpec behavior.

#### Scenario: Command generation request path

- **WHEN** internal runtime flows execute init or update behavior
- **THEN** no tool adapter or command-generation pipeline SHALL be invoked
- **AND** no markdown prompt or command files SHALL be written to either project-local or global tool directories
