# auto-matt

一个组织 Matt 系列技能的中文开发工作流。用户确认方案后选择实施路线。[技能文档与流程图](skills/auto-matt/SKILL.md)

- 选**快速**路线时，主 agent 直接按已确认的方案实现。
- 选**普通**路线时，用户确认 Spec 后，主 agent 委派子 agent 实现。
- 选**复杂**路线时，用户确认 Spec 并选择切片规模后，主 agent 拆分票据并按依赖并行委派。

调用示例为 `$auto-matt 搜索结果应保留项目的全局排名`。

## 安装

使用支持 Agent Skills 的客户端和技能安装工具。在终端执行以下命令，按提示选择目标客户端。

```sh
npx skills add lizhian/auto-matt --skill auto-matt
```

也可以在 Codex 中请 `$skill-installer` 从仓库 `lizhian/auto-matt` 安装 `skills/auto-matt`。

## 运行条件

`auto-matt` 依赖已安装的 Matt 系列技能，从 `ask-matt` 开始分流，实施结束后使用 `retro` 复盘。普通和复杂路线需要宿主支持子 agent。[Matt Pocock 技能库](https://github.com/mattpocock/skills)
