## REMOVED Requirements

### Requirement: Legacy artifact detection
**Reason**: Runtime-only OpenSpec no longer scans for AI tool integration artifacts.
**Migration**: Clean up legacy prompt files manually if they still exist.

### Requirement: Legacy cleanup confirmation
**Reason**: There is no setup/update flow that mutates external tool files.
**Migration**: None.

### Requirement: Surgical removal of config file content
**Reason**: Managed marker cleanup is removed with the distribution pipeline.
**Migration**: None.

### Requirement: Legacy directory removal
**Reason**: Runtime-only OpenSpec does not own legacy tool directories.
**Migration**: Remove directories manually if desired.

### Requirement: project.md migration hint
**Reason**: Legacy migration guidance tied to setup/update flows is removed.
**Migration**: Maintain migration notes in docs only if still needed.

### Requirement: Cleanup reporting
**Reason**: Cleanup reporting is unnecessary once OpenSpec stops mutating external tool files.
**Migration**: None.
