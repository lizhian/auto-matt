# 固定候选版本的验证

需要证明测试针对指定提交运行时，使用技能目录内的 [validate.mjs](../scripts/validate.mjs)。需要 Node.js 20+、Git 和干净的已检出分支。传入任务书提供的完整 SHA 和分支。证据目录放在工作区之外，父目录应已存在，末级目录由脚本新建。

示例中路径、分支、SHA 和测试命令均应替换成任务实际值。

```sh
node "<技能目录>/scripts/validate.mjs" \
  --repo "<候选工作区>" --expect-sha "<完整 SHA>" --expect-branch "<分支>" \
  --output "<已存在的证据根目录>/AC1-首次" \
  --preflight "git diff --check HEAD^ HEAD" --check "npm test"
```

脚本先运行预检，再执行验收命令。每次命令前后比较分支、提交、索引和相关文件内容。命令失败、超时或检测到改动即停止，保留日志和 receipt.json。默认每条命令限时 30 分钟，可用 --timeout 指定分钟数。需要独立重复采样时用 --repeat-check。

将命令结果关联到票据的 AC。检查 complete、ok、退出状态和日志，注明首次失败和未运行项。这个快照能发现检查结束时仍存在的改动；被忽略的构建产物和外部服务状态须另行观察。未提交的补丁可直接记录补丁范围、命令、输出和人工观察结果。
