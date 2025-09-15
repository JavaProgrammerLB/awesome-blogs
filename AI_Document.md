# Avatar 本地资源加载说明

在 `blogs.json` 中，有的条目的 `avatar` 字段是完整的远程 URL（以 https:// 开头），有的条目使用了相对文件名，比如 `avatar.png`。

问题：
之前 `avatar` 写成 `avatar.png` 时，页面 `<img src="avatar.png" />` 会向站点根路径请求 `/avatar.png`，但实际文件位于 `src/assets/avatar.png`，导致 404 无法显示。

解决方案：
在 `App.tsx` 中新增：
1. 使用 `import.meta.glob('./assets/*', { eager: true, import: 'default' })` 预加载 `src/assets` 下资源，Vite 会返回它们打包后的真实 URL。
2. 新增 `resolveAvatar` 函数：
   - 如果是 `http(s)://` 或 `data:` 开头，直接返回。
   - 否则尝试用 `./assets/文件名` 去匹配 `assetAvatars` 映射。
   - 匹配成功返回打包后的路径，失败则原样返回（兼容未来放入 `public/` 的情况）。

这样 `blogs.json` 里写成 `"avatar": "avatar.png"` 也能自动正确显示。

使用说明：
- 如果想添加新的本地头像文件，把图片放入 `src/assets/`，然后在 `blogs.json` 里写文件名即可。
- 如果使用远程链接，直接写完整 URL。
- 如果未来想放到 `public/` 目录（例如 `public/custom.png`），则可以直接在 JSON 中写 `"custom.png"` 或 `/custom.png`，但建议保持一致：
  - `src/assets` 内的文件：写文件名。
  - 远程文件：写完整 URL。

可能的扩展：
- 增加一个类型检测，验证本地文件是否存在，不存在在控制台警告。
- 支持子目录：可以把 glob 改成 `./assets/**/*`。

如需再改进或遇到其他加载问题，可以继续提出。

---

# GitHub Actions 自动部署到 GitHub Pages 说明

本仓库已添加工作流：`.github/workflows/deployToGithubPages.yml`

## 触发方式
1. 推送到 `master` 分支（`git push origin master`）。
2. 手动触发：在 GitHub 仓库页面 -> Actions -> 选择该工作流 -> Run workflow。

## 工作流执行步骤概览
| 步骤 | 说明 |
| ---- | ---- |
| checkout | 拉取仓库最新代码 |
| setup-node | 使用 Node.js 20 并启用 npm 缓存 |
| npm ci | 安装依赖（更快且保证与 lockfile 一致） |
| npm run deploy | 执行 `vite build && gh-pages -d dist` 将 `dist` 发布到 `gh-pages` 分支 |
| upload artifact | （可选）上传构建产物供调试/下载 |

## `npm run deploy` 细节
脚本定义：`vite build && gh-pages -d dist`

`gh-pages` 包会：
1. 如果没有 `gh-pages` 分支则创建。
2. 将 `dist` 目录内容强制推送到该分支根目录。
3. 使用默认提供的 `GITHUB_TOKEN` 进行认证（工作流中已通过 `env` 注入）。

## 首次配置 GitHub Pages
1. 打开仓库 Settings -> Pages。
2. Source 选择：`Deploy from a branch`。
3. Branch 选择：`gh-pages`，文件夹保持 `/ (root)`。
4. 保存，等待几分钟即可访问。

## 自定义域名 (CNAME)
仓库根目录已有 `CNAME` 文件；`gh-pages` 发布后会自动包含在构建产物里（确保 `dist` 中最终包含该文件）。如果发现被覆盖：
1. 可在 `vite.config.ts` 中通过 `build.copyPublicDir` 确保 `public/CNAME` 被复制。
2. 或在 deploy 前手动将根目录 `CNAME` 复制到 `dist/`：可以改写脚本：
  ```jsonc
  "deploy": "vite build && cp CNAME dist/CNAME && gh-pages -d dist"
  ```

当前如果访问不到自定义域名，请确认：
- DNS A 记录 或 CNAME 记录 已指向 `username.github.io`。
- Pages 设置里成功识别该域名（会显示绿色小盾牌或正在验证）。

## 常见问题排查
| 问题 | 可能原因 | 解决 |
| ---- | -------- | ---- |
| 页面空白/404 | 路由使用 BrowserHistory 且未配置 base | 若为纯静态单页无需更改；多路由建议使用 Hash 路由或在 `vite.config.ts` 设置 `base: '/<repo>/'` （如果不是自定义域名场景） |
| 样式不生效 | 构建 `base` 前缀错误 | 检查 `vite.config.ts` 的 `base` 是否匹配部署路径 |
| CNAME 丢失 | 未复制到 dist | 参见上面 CNAME 处理 |
| 构建失败 | 缓存损坏或 lock 不一致 | 重跑工作流或删除 `node_modules` 后本地验证 `npm ci` |

## 手动本地验证发布内容
```
npm ci
npm run build
npx serve dist   # 或者 npx http-server dist
```

## 后续可改进
1. 添加缓存命中统计（actions/cache 手动控制）。
2. 将 `gh-pages` 步骤替换为官方 Pages Action（`actions/deploy-pages`）并开启构建产物保护。
3. 增加一个工作流检测 `blogs.json` 的结构有效性。

如需我继续改成官方 Pages 方案或增强校验，请直接告诉我。

---

# 404 问题排查与修复记录 (2025-09-15)

## 现象
在自定义域名 `https://friends.yitianyigexiangfa.com/` 访问页面时，浏览器控制台出现若干静态资源（JS/CSS）返回 404，页面白屏或样式缺失。

## 根因分析
`vite.config.ts` 中配置了：
```ts
base: '/awesome-blogs/'
```
该配置适用于部署在 `https://<username>.github.io/awesome-blogs/` 这种“仓库二级路径”场景；但当前仓库使用 **自定义独立域名**，Pages 会把站点挂在域名根路径 `/`。继续带前缀会导致最终 HTML 中引用：
```
<script src="/awesome-blogs/assets/index-xxxx.js"></script>
```
而真实发布路径其实是：
```
/assets/index-xxxx.js
```
因此所有带 `/awesome-blogs/` 前缀的资源请求均 404。

## 修复措施
1. 修改 `vite.config.ts`：
  ```diff
  - base: '/awesome-blogs/',
  + base: '/',
  ```
2. 重新执行 `npm run build` / 部署。
3. 刷新页面（必要时清缓存 / 强刷）。

## 验证步骤
本地：
```
npm run build
npx serve dist   # 打开 http://localhost:3000 或 serve 输出的端口
```
查看生成的 `dist/index.html` 中静态资源引用前缀应为：`/assets/...` 或相对路径，不再含 `/awesome-blogs/`。

## 何时应该使用非根 base
| 场景 | base 设置 |
| ---- | --------- |
| GitHub Pages 默认：`https://<user>.github.io/<repo>/` | `base: '/<repo>/'` |
| 自定义域名：`CNAME -> friends.yitianyigexiangfa.com` | `base: '/'` |
| 反向代理挂载到子路径：`https://domain.com/friends/` | `base: '/friends/'` |

## 额外建议（可选）
1. 若未来改用 GitHub Pages 官方 Actions（`actions/deploy-pages`），可在 workflow 中显式写入构建产物；当前 `gh-pages` 包方式保持即可。
2. 可在本地加一个小脚本自动检测 `dist/index.html` 中是否仍残留错误前缀，避免回归。
3. 如果需要保留旧链接（/awesome-blogs/）做兼容，可在根目录放一个 `awesome-blogs/index.html`，里边用 `<meta http-equiv="refresh">` 方式 301/模拟跳转到根。

---
