## REMOVED Requirements

### Requirement: Global configuration storage
**Reason**: Runtime-only OpenSpec no longer persists profile or delivery settings for prompt distribution.
**Migration**: Keep per-user prompt configuration outside OpenSpec.

### Requirement: Global Config Directory Path
**Reason**: The removed global config file was used only by distribution features.
**Migration**: None.

### Requirement: Global Config Loading
**Reason**: Runtime commands no longer depend on global profile/delivery configuration.
**Migration**: Runtime behavior is driven by project files and the state-root locator.

### Requirement: Global Config Saving
**Reason**: There is no runtime command surface that updates global distribution settings.
**Migration**: None.

### Requirement: Default Configuration
**Reason**: Default profile and delivery values are no longer meaningful without distribution.
**Migration**: None.

### Requirement: Config Schema Evolution
**Reason**: The retired global config schema is no longer part of the runtime contract.
**Migration**: None.
