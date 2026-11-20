# auto-matt

三个使用原生子 agent 的中文开发技能。

| 技能 | 适用场景 | 如何开始 |
| --- | --- | --- |
| [auto-matt](skills/auto-matt/SKILL.md) | 用户确认方案并选择路线。快速路线由主 agent 直接实现，普通和复杂路线需用户确认 Spec，复杂路线还需选择切片规模。 | `$auto-matt 搜索结果应保留项目的全局排名` |
| [matt](skills/matt/SKILL.md) | 由主 agent 按问题选择或组合 Matt 技能。需要实现时，用户选择路线并确认计划或 Spec。 | `$matt 搜索结果应保留项目的全局排名` |
| [workloop](skills/workloop/SKILL.md) | 希望按风险选择快速、单票或多票路线，按票验收、独立审查和集成。 | `$workloop 给搜索命令增加大小写无关匹配` |

## 安装

使用支持 Agent Skills 的客户端和技能安装工具。在终端执行以下命令，按提示选择目标客户端。

```sh
npx skills add lizhian/auto-matt --skill auto-matt matt workloop
```

也可以在 Codex 中请 `$skill-installer` 从仓库 `lizhian/auto-matt` 安装所需的技能目录。

## 运行条件

`auto-matt` 和 `matt` 的入口依赖 `ask-matt`。先安装该技能，再按所选路线安装对应的访谈、Spec、实现或审查技能。`auto-matt` 在实施结束后还会使用 `retro`。`auto-matt` 的普通和复杂路线、`matt` 的独立复核与 `workloop` 的开发流程需要宿主支持子 agent。[Matt Pocock 技能库](https://github.com/mattpocock/skills)

`workloop` 随附中文运行手册、派工模板和验证脚本。对固定 Git 提交运行验证工具需要 Git 和 Node.js 20 或更高版本。[验证手册](skills/workloop/reference/validation.md)

## 来源

`workloop` 的流程与固定版本验证工具改编自 paseo-matt-workloop，原生子 agent 负责执行和审查。[上游项目](https://github.com/suntianc/paseo-matt-workloop) · [随附许可证](skills/workloop/LICENSE)
