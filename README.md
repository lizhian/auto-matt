# auto-matt

两个使用原生子 agent 的中文开发技能。

| 技能 | 适用场景 | 如何开始 |
| --- | --- | --- |
| [matt](skills/matt/SKILL.md) | 希望先由主 agent 主持访谈，确认方案并亲自选择简单、中等或复杂路线，再委派实现和两轮审查。 | `$matt 搜索结果应保留项目的全局排名` |
| [workloop](skills/workloop/SKILL.md) | 希望按风险选择快速、单票或多票路线，按票验收、独立审查和集成。 | `$workloop 给搜索命令增加大小写无关匹配` |

## 安装

使用支持 Agent Skills 的客户端和技能安装工具。在终端执行以下命令，按提示选择目标客户端。

```sh
npx skills add lizhian/auto-matt --skill matt workloop
```

也可以在 Codex 中请 `$skill-installer` 从仓库 `lizhian/auto-matt` 安装 `skills/matt` 和 `skills/workloop`。

## 运行条件

两项技能都需要宿主支持创建子 agent。`matt` 会按所选路线调用 Matt Pocock 的访谈、Spec、实现与审查技能，请先安装该路线需要的配套技能。[Matt Pocock 技能库](https://github.com/mattpocock/skills)

`workloop` 随附中文运行手册、派工模板和验证脚本。对固定 Git 提交运行验证工具需要 Git 和 Node.js 20 或更高版本。[验证手册](skills/workloop/reference/validation.md)

## 来源

`workloop` 的流程与固定版本验证工具改编自 paseo-matt-workloop，原生子 agent 负责执行和审查。[上游项目](https://github.com/suntianc/paseo-matt-workloop) · [随附许可证](skills/workloop/LICENSE)
