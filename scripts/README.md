# 关闭重复的 Pull Request

本目录包含用于批量关闭重复 PR 并删除其分支的工具。

## 背景

仓库中有多个自动创建的博客数据更新 PR，这些 PR 是重复的（内容已在其他 PR 中合并）。

当前需要关闭的重复 PR：
- PR #242: Update blogs data - 2025-11-20 23:00 +0800 (branch: update-blogs-202511201500)
- PR #243: Update blogs data - 2025-11-21 00:00 +0800 (branch: update-blogs-202511201600)
- PR #244: Update blogs data - 2025-11-21 01:00 +0800 (branch: update-blogs-202511201700)
- PR #245: Update blogs data - 2025-11-21 02:00 +0800 (branch: update-blogs-202511201800)
- PR #246: Update blogs data - 2025-11-21 03:00 +0800 (branch: update-blogs-202511201900)
- PR #247: Update blogs data - 2025-11-21 04:00 +0800 (branch: update-blogs-202511202000)

## 使用方法

### 方法 1: 使用本地脚本 (推荐)

1. **确保已安装 GitHub CLI**
   ```bash
   # macOS
   brew install gh
   
   # Linux
   # 参考: https://github.com/cli/cli#installation
   
   # Windows
   # 参考: https://github.com/cli/cli#installation
   ```

2. **登录 GitHub CLI**
   ```bash
   gh auth login
   ```

3. **运行脚本**
   ```bash
   # 关闭所有默认的重复 PR (242-247)
   ./scripts/close-duplicate-prs.sh
   
   # 或者指定特定的 PR 编号
   ./scripts/close-duplicate-prs.sh 242 243 244
   ```

脚本会自动：
- ✓ 在每个 PR 上添加关闭原因的评论
- ✓ 关闭 PR
- ✓ 删除对应的远程分支

### 方法 2: 使用 GitHub Actions 工作流

1. 进入仓库的 Actions 页面
2. 选择 "Close Duplicate Pull Requests" 工作流
3. 点击 "Run workflow"
4. 输入要关闭的 PR 编号（用逗号分隔），例如：`242,243,244,245,246,247`
5. （可选）自定义关闭原因
6. 点击 "Run workflow" 按钮

### 方法 3: 手动使用 gh CLI

如果你想手动操作，可以使用以下命令：

```bash
# 对每个 PR 执行以下操作
PR_NUM=242
BRANCH=update-blogs-202511201500

# 添加评论
gh pr comment $PR_NUM --body "关闭重复的 PR - 内容已在其他 PR 中合并"

# 关闭 PR
gh pr close $PR_NUM

# 删除分支
git push origin --delete $BRANCH
```

## 验证

关闭 PR 后，你可以验证：

```bash
# 查看已关闭的 PR
gh pr list --state closed --limit 10

# 查看远程分支列表（确认分支已删除）
git ls-remote --heads origin | grep update-blogs
```

## 注意事项

- 脚本会跳过已经关闭或合并的 PR
- 如果分支已经被删除，脚本会跳过删除操作而不会报错
- 所有操作都需要有仓库的适当权限（write 权限）

## 故障排除

**问题：`gh: command not found`**
- 解决：安装 GitHub CLI，参考上述安装说明

**问题：`gh auth status` 失败**
- 解决：运行 `gh auth login` 进行身份验证

**问题：权限被拒绝**
- 解决：确保你的 GitHub 账户对该仓库有 write 权限
