## Context

当前 OpenSpec 的核心能力与分发能力交织在一起：

- 核心能力：`new change`、`list`、`status`、`instructions`、schema/config 加载、变更目录与 archive 约定。
- 分发能力：`init`、`update`、AI tool adapters、skills/prompts 模板生成、global profile/delivery、legacy cleanup。

对当前实际使用方式来说，分发能力不仅无价值，还会不断生成和刷新重复的 prompts/skills 文件，覆盖已经稳定存在于 `~/.codex/skills` 的自定义工作流。

同时，核心能力将项目状态根目录硬编码为 `openspec/`。这阻碍了未来与 GSD 的 `.planning/` 文件树协同，因为变更、spec、schema、archive 和 config 都需要能够挂载到统一但可配置的项目状态根目录下。

## Goals / Non-Goals

**Goals:**
- 将 OpenSpec 收缩为面向当前自定义技能工作流的最小 CLI 内核。
- 让所有保留的运行时能力都通过统一的“状态根目录解析层”定位项目文件。
- 默认继续兼容 `openspec/`，并支持未来切换到 `.planning/openspec/` 之类的嵌套布局。
- 明确退役 `init`、`update` 以及它们背后的工具分发管线，避免再生成 AI tool prompts/skills。
- 为后续与 GSD 协同保留稳定的文件树契约，而不是临时硬编码特殊路径。

**Non-Goals:**
- 本次不实现与 GSD 的直接命令级集成，也不读取或写入 GSD 的 `STATE.md`、`ROADMAP.md` 等专有格式。
- 本次不自动迁移现有仓库目录；迁移策略以显式移动目录并提交 locator 文件为主。
- 本次不重新设计 proposal/spec/design/tasks 的 artifact 模型。
- 本次不保留或替代 prompts/skills 生成能力；这些能力直接退役。

## Decisions

### 1. 引入独立的状态根目录 locator

新增一个稳定的仓库根级 locator 文件，例如 `.openspec-root.json`，用来声明 OpenSpec 项目状态目录：

```json
{
  "stateRoot": "openspec"
}
```

解析顺序：

1. 读取仓库根目录 `.openspec-root.json`
2. 若不存在，则默认使用 `openspec`

约束：

- `stateRoot` 必须是相对项目根目录的相对路径。
- 不允许绝对路径。
- 不允许路径逃逸项目根目录。
- 允许嵌套路径，例如 `.planning/openspec`。

这样可以把“如何找到 OpenSpec 状态目录”与“状态目录内部的 config/schema/change/spec 布局”解耦。后续无论要兼容 `.planning/openspec` 还是别的树形结构，都只需调整 locator，而不用在所有命令里塞特判。

### 2. 集中所有项目路径派生逻辑

新增单一入口模块，例如 `src/core/state-root.ts` 或 `src/core/project-paths.ts`，统一提供：

- `resolveStateRoot(projectRoot)`
- `getStateRootDir(projectRoot)`
- `getChangesDir(projectRoot)`
- `getArchiveDir(projectRoot)`
- `getSpecsDir(projectRoot)`
- `getProjectSchemasDir(projectRoot)`
- `getProjectConfigPath(projectRoot)`

所有保留命令与加载器都必须依赖这层，不再直接 `path.join(projectRoot, 'openspec', ...)`。

理由：

- 当前硬编码分散在 `list`、workflow commands、config loading、schema resolution、change utilities、docs strings 等多个模块中。
- 若不集中，会在切换到 `.planning/openspec` 时出现局部命令可用、局部命令失效的碎片化状态。

### 3. 保留最小 CLI 运行时，直接退役分发型命令

保留：

- `openspec list`
- `openspec new change`
- `openspec status`
- `openspec instructions`
- `openspec instructions apply`
- 与这些命令直接相关的 schema/config/change/artifact runtime

退役：

- `openspec init`
- `openspec experimental`
- `openspec update`
- AI tool command generation
- Agent skill template generation
- global profile/delivery config
- legacy cleanup

理由：

- 这些能力不在当前自定义技能闭包内。
- 它们正是造成重复 prompts/skills 文件的来源。
- 保留它们只会让“最小运行时”目标失焦，并继续带来误操作风险。

### 4. Archive 继续作为目录契约，而不是分发型命令能力

当前自定义归档技能并不依赖 `openspec archive` CLI，而是直接：

- 调 `openspec list --json`
- 调 `openspec status --change ... --json`
- 直接检查任务文件和 delta specs
- 然后移动整个变更目录到 archive

因此本次设计只保证 archive 的目录语义和路径 helper：

- archive 目录位置跟随 `getArchiveDir(projectRoot)`
- `list` 等命令继续把 archive 从 active changes 中排除

是否保留独立 `archive` CLI 命令不属于当前必需边界。

### 5. schema/config 继续留在状态根目录内部

当 locator 指向 `.planning/openspec` 时，对应结构为：

```text
.planning/openspec/
  config.yaml
  specs/
  schemas/
  changes/
    archive/
```

理由：

- 这样 OpenSpec 自身的项目状态仍是自洽的一棵子树。
- 不会把配置文件拆散到仓库根和嵌套目录两处。
- 与 GSD 协同的关键是“根目录可嵌套”，不是“OpenSpec 文件散落在 `.planning` 顶层”。

## Risks / Trade-offs

- [Risk] locator 设计引入新的 bootstrap 配置文件 → Mitigation：保持格式极小、允许缺省、默认无文件即使用 `openspec/`。
- [Risk] 删除 `init/update` 会影响习惯旧工作流的用户 → Mitigation：本次变更明确定位为 runtime-only 发行线，并在 CLI 错误信息中说明命令已退役。
- [Risk] 现有测试大量依赖 `openspec/` 固定路径 → Mitigation：将测试重构为统一通过路径 helper 断言，并新增 `.planning/openspec` 真实场景覆盖。
- [Risk] 文档与 spec 大量引用 `openspec/` → Mitigation：区分“默认布局”与“解析后布局”，文档统一表述为“默认 `openspec/`，可通过 locator 变更”。
- [Risk] 现有仓库迁移需要人工移动目录 → Mitigation：设计中明确迁移步骤，先提交 locator，再移动整棵状态目录并验证 `list/status/instructions`。

## Migration Plan

1. 引入 locator 与路径 helper，默认无 locator 时继续使用 `openspec/`。
2. 将保留命令和运行时加载器全部改为依赖路径 helper。
3. 删除 `init/update` 及其支持模块、测试和文档入口。
4. 为默认布局与 `.planning/openspec` 布局各补一组端到端测试。
5. 更新文档，给出迁移示例：
   - 新增 `.openspec-root.json`
   - 将 `openspec/` 整体移动到 `.planning/openspec/`
   - 运行 `openspec list --json` / `openspec status --change ... --json` 验证

## Open Questions

- locator 文件名最终定为 `.openspec-root.json` 还是其他更简短名称。
- 是否保留 `templates` / `schemas` 等辅助只读命令，还是进一步裁成更小 surface。
- 是否需要提供一次性的 `openspec doctor`/`openspec migrate-root` 帮助迁移；当前倾向不做，保持最小化。
