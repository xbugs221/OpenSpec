## Why

OpenSpec 当前同时承担了两类职责：一类是变更状态查询与 artifact 指令生成，另一类是面向不同 AI 工具分发 prompts、skills 和初始化脚手架。对当前使用方式来说，后者既不需要，也会反复生成项目内和全局的重复文件，干扰已经在 `~/.codex/skills` 中稳定维护的自定义工作流。

同时，OpenSpec 目前将项目状态目录硬编码为 `openspec/`。这与后续希望和 `../get-shit-done` 协同的需求冲突，因为 GSD 的项目状态和规划文档约定保存在 `.planning/` 下，未来需要把 OpenSpec 状态能力嵌入到更复杂但统一的文件树中。

## What Changes

- **BREAKING** 将 OpenSpec 收缩为“最小 CLI 内核”，仅保留当前自定义 Codex 技能实际依赖的变更查询、artifact 指令和归档相关能力。
- **BREAKING** 移除 prompts/skills 分发、AI 工具适配、初始化向导、update 刷新、legacy cleanup、全局 profile/delivery 等非必需能力及其命令面。
- 新增可配置的项目状态根目录解析能力，使变更、spec、schema、config 和 archive 不再强依赖固定的 `openspec/` 路径。
- 保持默认布局向后兼容：未配置时仍使用 `openspec/`，但允许未来切换到 `.planning/openspec/` 等嵌套布局。
- 收紧 CLI 契约到当前工作流边界：`list`、`new change`、`status`、`instructions`/`instructions apply` 以及支撑这些命令的最小内部模块。

## Capabilities

### New Capabilities
- `state-root-resolution`: 统一解析项目状态根目录，并为变更、spec、schema、config、archive 等路径提供可配置根路径支持。

### Modified Capabilities
- `change-creation`: 新建变更目录时改为写入解析后的状态根目录，而不是硬编码 `openspec/changes/`。
- `cli-list`: 列举变更和 spec 时改为扫描解析后的状态根目录，并更新缺失目录时的行为与提示。
- `cli-artifact-workflow`: `status`、`instructions`、`instructions apply`、`new change` 等工作流命令改为基于解析后的状态根目录工作，并移除对 setup 流程的耦合。
- `config-loading`: 项目配置改为从解析后的状态根目录读取，而不是固定读取 `openspec/config.yaml`。
- `instruction-loader`: 生成 artifact/apply 指令时，所有上下文文件和输出路径改为基于解析后的状态根目录。
- `schema-resolution`: 项目本地 schema 目录改为位于解析后的状态根目录下，而不是固定 `openspec/schemas/`。
- `cli-init`: 退役初始化命令，不再负责工具配置、skills、slash commands 或项目脚手架生成。
- `cli-update`: 退役更新命令，不再刷新 prompts、skills 或其他 AI 工具文件。
- `command-generation`: 移除各 AI 工具 command adapter 和命令模板生成能力。
- `ai-tool-paths`: 移除 AI 工具路径和 `skillsDir` 驱动的分发模型。
- `global-config`: 移除仅用于 prompts/skills 分发的全局 profile、delivery 和 workflow 配置能力。
- `legacy-cleanup`: 移除旧版工具集成文件检测与清理逻辑。

## Impact

- 受影响代码主要集中在 CLI 注册、artifact workflow、路径解析、config/schema 加载，以及当前的工具集成生成管线。
- 会删除或重写 `init`、`update`、AI tool adapters、技能模板分发、legacy cleanup、profile/delivery 配置等模块与对应测试。
- 会新增统一的状态根目录解析层，并要求所有保留命令通过该层定位变更、spec、schema、config 和 archive。
- 会影响文档、spec 和测试基线，需要把“固定 `openspec/` 布局”调整为“默认 `openspec/`，可配置根目录”的表述。
