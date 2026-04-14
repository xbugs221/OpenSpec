## 1. Remove Agent Artifact Runtime

- [x] 1.1 Remove tool metadata and discovery logic used for skills/prompts/commands installation
- [x] 1.2 Remove skill generation, command generation, and legacy artifact cleanup from `init`
- [x] 1.3 Remove skill sync, command sync, migration-from-artifacts, and legacy artifact cleanup from `update`
- [x] 1.4 Delete command adapter infrastructure and any helpers that only exist for agent artifact generation

## 2. Simplify Config Surface

- [x] 2.1 Remove global config fields and command UX that only control profile, delivery, or tool-install behavior
- [x] 2.2 Remove runtime branches that depend on tool selection or artifact delivery modes
- [x] 2.3 Keep only CLI-relevant configuration semantics and defaults

## 3. Tighten Filesystem Ownership

- [x] 3.1 Ensure `init` writes only OpenSpec-owned project files
- [x] 3.2 Ensure `update` performs no writes outside OpenSpec-owned state
- [x] 3.3 Add regression tests proving no project-local or global prompt/skill directories are created or mutated

## 4. Clean Documentation and Tests

- [x] 4.1 Remove or rewrite docs that describe supported tools, skills, prompts, command adapters, delivery modes, or tool auto-detection
- [x] 4.2 Replace tests that assert artifact generation with tests that assert CLI-only behavior
- [x] 4.3 Run targeted tests, then full test suite, and resolve regressions
