## REMOVED Requirements

### Requirement: CommandContent interface
**Reason**: Runtime-only OpenSpec no longer generates tool command files.
**Migration**: External prompt repositories own their own command metadata schemas.

### Requirement: ToolCommandAdapter interface
**Reason**: Tool adapters exist only to emit prompts/commands for external runtimes.
**Migration**: None.

### Requirement: Command generator function
**Reason**: Command file generation is removed.
**Migration**: None.

### Requirement: CommandAdapterRegistry
**Reason**: No adapters are needed after command generation is removed.
**Migration**: None.

### Requirement: Shared command body content
**Reason**: Shared slash-command templates are no longer shipped by OpenSpec.
**Migration**: Maintain runtime-specific prompt bodies externally.
