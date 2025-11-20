# 关闭重复 Pull Request 完成指南

## 概述

本 PR 创建了用于批量关闭重复 PR 并删除其分支的工具。由于我没有直接通过 API 关闭 PR 的权限，因此创建了以下工具供您使用。

## 🎯 需要关闭的重复 PR

根据您的要求，以下 PR 都是重复的（内容已在其他 PR 中合并）：

- **PR #242**: Update blogs data - 2025-11-20 23:00 +0800 (分支: `update-blogs-202511201500`)
- **PR #243**: Update blogs data - 2025-11-21 00:00 +0800 (分支: `update-blogs-202511201600`)
- **PR #244**: Update blogs data - 2025-11-21 01:00 +0800 (分支: `update-blogs-202511201700`)
- **PR #245**: Update blogs data - 2025-11-21 02:00 +0800 (分支: `update-blogs-202511201800`)
- **PR #246**: Update blogs data - 2025-11-21 03:00 +0800 (分支: `update-blogs-202511201900`)
- **PR #247**: Update blogs data - 2025-11-21 04:00 +0800 (分支: `update-blogs-202511202000`)

## 📦 创建的工具

### 1. GitHub Actions 工作流 ✨ (推荐)

**文件**: `.github/workflows/close-duplicate-prs.yml`

这是最简单的方法！只需：

1. 合并此 PR
2. 进入 **Actions** 标签页
3. 选择 **"Close Duplicate Pull Requests"** 工作流
4. 点击 **"Run workflow"**
5. 输入要关闭的 PR 编号：`242,243,244,245,246,247`
6. 点击绿色的 **"Run workflow"** 按钮

工作流会自动：
- ✅ 在每个 PR 上添加关闭原因的评论
- ✅ 关闭所有指定的 PR
- ✅ 删除对应的远程分支

### 2. Shell 脚本

**文件**: `scripts/close-duplicate-prs.sh`

如果您想在本地运行：

```bash
# 1. 确保已安装 GitHub CLI
gh --version

# 2. 如果未安装，安装 GitHub CLI
# macOS: brew install gh
# Linux: 参考 https://github.com/cli/cli#installation

# 3. 登录 GitHub
gh auth login

# 4. 运行脚本关闭所有默认的重复 PR (242-247)
./scripts/close-duplicate-prs.sh

# 或者指定特定的 PR
./scripts/close-duplicate-prs.sh 242 243 244
```

### 3. 详细文档

**文件**: `scripts/README.md`

包含完整的使用说明、故障排除指南和手动操作方法。

## 🚀 建议的执行步骤

1. **合并此 PR** 到 master 分支
2. **使用 GitHub Actions 方法**（最简单）：
   - 进入仓库的 Actions 页面
   - 运行 "Close Duplicate Pull Requests" 工作流
   - 输入 PR 编号：`242,243,244,245,246,247`
3. **验证结果**：
   - 检查所有 PR 是否已关闭
   - 检查对应的分支是否已删除

## 🔍 验证命令

执行后，您可以使用以下命令验证：

```bash
# 查看已关闭的 PR
gh pr list --state closed --limit 10

# 查看远程分支（确认已删除）
git ls-remote --heads origin | grep update-blogs
```

## ⚠️ 注意事项

- 工作流需要仓库的 `write` 权限（您作为仓库所有者已经拥有）
- 已经关闭或合并的 PR 会被自动跳过
- 不存在的分支会被自动跳过，不会报错

## 📝 Security Summary

✅ 已通过 CodeQL 安全扫描，未发现任何安全漏洞。

所有工具都：
- 使用官方 GitHub CLI
- 不包含硬编码的凭据
- 遵循最佳安全实践

## 💡 后续优化建议

考虑添加一个自动化工作流，定期检查并关闭重复的博客更新 PR，避免手动清理。

---

如有任何问题，请参考 `scripts/README.md` 中的详细文档。
