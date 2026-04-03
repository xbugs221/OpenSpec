## REMOVED Requirements

### Requirement: AIToolOption skillsDir field
**Reason**: Runtime-only OpenSpec no longer needs AI tool distribution metadata.
**Migration**: None.

### Requirement: Path configuration for supported tools
**Reason**: Tool-specific output directories are removed with skills/prompt generation.
**Migration**: Configure tool paths in the external systems that own those files.

### Requirement: Cross-platform path handling
**Reason**: Tool output path generation is removed.
**Migration**: Cross-platform path handling remains required in the runtime path helper layer instead.
