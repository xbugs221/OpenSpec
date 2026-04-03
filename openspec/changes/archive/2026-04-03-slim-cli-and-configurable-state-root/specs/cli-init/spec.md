## REMOVED Requirements

### Requirement: Progress Indicators
**Reason**: Runtime-only OpenSpec no longer ships an initialization workflow.
**Migration**: Create the project state tree manually or rely on `openspec new change` to materialize parent directories on first use.

### Requirement: Directory Creation
**Reason**: Base directory scaffolding is no longer handled by a dedicated init command.
**Migration**: Commit a locator file and create the desired state root layout directly in the repository.

### Requirement: AI Tool Configuration
**Reason**: OpenSpec no longer generates AI tool prompts or skills.
**Migration**: Maintain tool-specific prompts and skills outside OpenSpec.

### Requirement: Interactive Mode
**Reason**: Interactive setup is removed with the init command.
**Migration**: Configure file layout explicitly in version-controlled project files.

### Requirement: Safety Checks
**Reason**: The command surface that performed setup-time safety checks is removed.
**Migration**: Validation happens at runtime through state-root resolution and command-level path checks.

### Requirement: Success Output
**Reason**: There is no setup workflow to summarize.
**Migration**: Use normal command output from `new change`, `list`, `status`, and `instructions`.

### Requirement: Exit Codes
**Reason**: The init command is retired.
**Migration**: Unsupported-command invocations SHALL fail with a standard runtime-only error.

### Requirement: Additional AI Tool Initialization
**Reason**: Tool onboarding is out of scope for the runtime-only distribution.
**Migration**: Tool configuration is managed externally.

### Requirement: Success Output Enhancements
**Reason**: There is no setup workflow to summarize.
**Migration**: None.

### Requirement: Exit Code Adjustments
**Reason**: Extend-mode init runs no longer exist.
**Migration**: None.

### Requirement: Non-Interactive Mode
**Reason**: The init command is retired, including `--tools none`.
**Migration**: Set the desired state root explicitly and use runtime commands directly.

### Requirement: Skill Generation
**Reason**: OpenSpec no longer generates Agent Skills.
**Migration**: Maintain custom skills outside the package.

### Requirement: Slash Command Generation
**Reason**: OpenSpec no longer generates slash commands or tool prompts.
**Migration**: Maintain command templates outside the package.

### Requirement: Config File Generation
**Reason**: Config file creation is no longer part of a setup flow.
**Migration**: Add `<stateRoot>/config.yaml` manually when project-level config is needed.

### Requirement: Experimental Command Alias
**Reason**: The deprecated setup alias no longer has a supported target.
**Migration**: None.
