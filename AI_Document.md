# GitHub Pages React Router 支持文档

## 概述

\n---\n\n# 统一分页逻辑重构记录 (2025-09-21)\n\n## 背景\n原 `News.tsx` 中直接内联了分页逻辑（当前页、计算切片、页码按钮、滚动处理等）。`Them` 组件（友链列表）需要同样的 20 条/页分页功能，如果继续复制粘贴会造成：\n- 逻辑重复（修改规则需同步两处）。\n- 维护成本增加。\n- 单元测试或未来抽象难度增大。\n\n## 重构目标\n1. 提供一个通用分页逻辑 Hook：`usePagination`。\n2. 提供一个可复用的分页 UI：`<Pagination />`。\n3. `News` 与 `Them` 共用，不再出现分页实现重复代码。\n4. 维持原有交互体验（平滑滚动、页码省略号规则、上一页/下一页）。\n\n## 新增文件\n| 文件 | 说明 |
GitHub Pages 支持 React Router，但需要特殊配置来处理客户端路由。本项目已配置完成，支持以下路由：

- `/` - 友链列表页（原首页内容）
- `/home` - 主页
- `/about` - 关于页面


### 问题
GitHub Pages 是静态文件托管服务，当用户直接访问 `/home` 或 `/about` 时，服务器会寻找对应的物理文件，但这些路由是由 React Router 在客户端处理的，不存在实际的文件，因此会返回 404 错误。

### 解决方案
使用 SPA（Single Page Application）GitHub Pages 解决方案：

1. **404.html 重定向**: 创建 `public/404.html` 文件，将所有 404 请求重定向到主应用
2. **URL 参数处理**: 在 `index.html` 中添加脚本处理重定向的 URL 参数
3. **React Router 配置**: 配置 BrowserRouter 和路由规则

## 配置文件

### public/404.html
```html
````markdown
# GitHub Pages React Router 支持文档

## 概述

GitHub Pages 支持 React Router，但需要特殊配置来处理客户端路由。本项目已配置完成，支持以下路由：

- `/` - 友链列表页（原首页内容）
- `/home` - 主页
- `/about` - 关于页面

## 实现原理

### 问题
GitHub Pages 是静态文件托管服务，当用户直接访问 `/home` 或 `/about` 时，服务器会寻找对应的物理文件，但这些路由是由 React Router 在客户端处理的，不存在实际的文件，因此会返回 404 错误。

### 解决方案
使用 SPA（Single Page Application）GitHub Pages 解决方案：

1. **404.html 重定向**: 创建 `public/404.html` 文件，将所有 404 请求重定向到主应用
2. **URL 参数处理**: 在 `index.html` 中添加脚本处理重定向的 URL 参数
3. **React Router 配置**: 配置 BrowserRouter 和路由规则

## 配置文件

### public/404.html
```html
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <title>Friends</title>
    <script type="text/javascript">
      // Single Page Apps for GitHub Pages
      var pathSegmentsToKeep = 0;
      var l = window.location;
      l.replace(
        l.protocol + '//' + l.hostname + (l.port ? ':' + l.port : '') +
        l.pathname.split('/').slice(0, 1 + pathSegmentsToKeep).join('/') + '/?/' +
        l.pathname.slice(1).split('/').slice(pathSegmentsToKeep).join('/').replace(/&/g, '~and~') +
        (l.search ? '&' + l.search.slice(1).replace(/&/g, '~and~') : '') +
        l.hash
      );
    </script>
  </head>
  <body>
  </body>
</html>
```

### index.html 中的处理脚本
```javascript
<script type="text/javascript">
  (function(l) {
    if (l.search[1] === '/' ) {
      var decoded = l.search.slice(1).split('&').map(function(s) { 
        return s.replace(/~and~/g, '&')
      }).join('?');
      window.history.replaceState(null, null,
          l.pathname.slice(0, -1) + decoded + l.hash
      );
    }
  }(window.location))
</script>
```

## 路由组件

### src/components/Home.tsx
主页组件，展示欢迎信息

### src/components/About.tsx
关于页面组件，展示网站介绍信息

## 导航
应用包含顶部导航栏，支持在不同页面间跳转：
- 友链列表
- 主页
- 关于

## 部署
运行 `npm run deploy` 命令会：
1. 构建应用
2. 复制 CNAME 文件到 dist 目录
3. 复制 404.html 文件到 dist 目录

## 注意事项
1. 所有路由在本地开发和 GitHub Pages 上都能正常工作
2. 直接访问路由 URL（如 https://yoursite.github.io/home）会正确跳转
3. 浏览器前进/后退按钮正常工作
4. 页面刷新不会出现 404 错误

## 技术栈
- React 19
- React Router 7
- Vite
- TypeScript
- Tailwind CSS
- Radix UI

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
该配置适用于部署在 `https://<username>.github.io/awesome-blogs/` 这种"仓库二级路径"场景；但当前仓库使用 **自定义独立域名**，Pages 会把站点挂在域名根路径 `/`。继续带前缀会导致最终 HTML 中引用：
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

# 已迁移到官方 GitHub Pages Actions 工作流 (2025-09-15)

## 迁移动机
原方案使用 `gh-pages` NPM 包直接 push 到 `gh-pages` 分支，需要处理：
1. Git 认证（可能出现 `could not read Username`）。
2. 手动保证 CNAME 复制。
3. 无 Pages 环境保护（Environment URL、审计、Rollbacks 功能有限）。

官方 Actions 组合（`upload-pages-artifact` + `deploy-pages`）提供：
- 内置 OIDC 签发，不需要手动注入 token 到 git remote。
- 自动生成 Environment（`github-pages`）并暴露 URL。
- 更稳定的缓存与最小权限（`contents: read`, `pages: write`）。

## 新工作流文件
路径：`.github/workflows/deployToGithubPages.yml`

核心步骤：
1. build Job：checkout → setup-node → npm ci → vite build → 复制 CNAME → 上传构建产物。
2. deploy Job：使用 `actions/deploy-pages@v4` 部署上传的 artifact。

并发控制：
```
concurrency:
  group: pages-deploy
  cancel-in-progress: false
```
避免快速多次 push 时出现中途构建产物被覆盖的不一致状态。

## 权限说明
```
permissions:
  contents: read
  pages: write
  id-token: write
```
`id-token: write` 是 `deploy-pages` 通过 OIDC 获取短期访问令牌的必要权限。

## 自定义域名处理
工作流中保留：
```
if [ -f CNAME ]; then cp CNAME dist/CNAME; fi
```
确保根目录 `CNAME` 被复制进部署目录。保持仓库根的 `CNAME` 文件即可。

## 本地与线上一致性验证
1. 本地执行：`npm ci && npm run build`，检查 `dist/` 包含 `index.html` 与资源。
2. 手动确认 `dist/CNAME`（若本地复制脚本也需要，可运行：`cp CNAME dist/CNAME`）。
3. 推送到 `master` 后，在 Actions 页面查看：
   - build 任务成功并显示 artifact 上传。
   - deploy 任务显示 `✅ Deployed`，Environment 面板出现 URL。

## 旧脚本及依赖清理（可选）
现在发布不再需要 `gh-pages` 包，可选择：
1. 从 `package.json` 删除 `gh-pages` 依赖。
2. 修改 `scripts.deploy`（保留本地手动预览可改成仅构建）：
   ```jsonc
   "deploy": "npm run build"
   ```
3. 若想安全过渡，可暂时保留，一段时间后再移除。

## 如果仍想保留手动推送方式
可新增一个单独脚本如：`"legacy:publish": "vite build && gh-pages -d dist"`，仅在本地或特殊场景使用。

## 回滚方式
若官方工作流异常（罕见）：
1. 在 Settings → Pages 将 Source 切回 Branch: `gh-pages`。
2. 恢复旧 workflow（保存在 git 历史中）。

## 后续可增量增强
- 添加 `actions/cache` 缓存 `~/.npm`（需注意 vite 和 Tailwind 版本变动）。
- 在 build 前跑 `npm run lint` 或轻量验证脚本（比如校验 `blogs.json` 结构）。
- 添加一个 `preview` workflow 用于 PR 预览（`actions/deploy-pages` 支持 PR 部署预览）。

如需继续删除 `gh-pages` 依赖或添加缓存优化告诉我即可。

---

# 依赖清理与缓存优化记录 (2025-09-15)

## 变更概览
本次调整：
1. 删除 `devDependencies` 中的 `gh-pages` 依赖（已完全迁移到官方 `deploy-pages` 工作流，不再需要本地推送分支方案）。
2. 修改 `package.json` 中 `deploy` 脚本：
  - 旧：`vite build && cp CNAME dist/CNAME && gh-pages -d dist`
  - 新：`npm run build && cp CNAME dist/CNAME`
  说明：现在部署由 GitHub Actions 完成，`deploy` 仅保留本地构建+写入 CNAME 的能力（调试 dist 用）。
3. 在 `.github/workflows/deployToGithubPages.yml` 中新增缓存步骤：
  ```yaml
  - name: Cache build output (Vite + TS)
    uses: actions/cache@v4
    with:
     path: |
      ~/.cache/vite
      ~/.npm
      node_modules/.cache
     key: ${{ runner.os }}-build-${{ hashFiles('package-lock.json', 'tsconfig*.json', 'vite.config.*') }}
     restore-keys: |
      ${{ runner.os }}-build-
  ```

## 为什么可以安全移除 `gh-pages`
当前部署链路：构建 → 上传 artifact → `actions/deploy-pages`。官方 Action 会将 artifact 发布为 Pages 版本，不需要再维护 `gh-pages` 分支，因此 `gh-pages` 包的 git push 逻辑失效。移除后：
* 减少一次依赖安装体积与安全面。
* 避免开发者误运行旧发布脚本导致分支状态漂移。

## 缓存策略说明
虽然 `setup-node` 已启用 `cache: npm`，但仍追加：
* `~/.cache/vite`：Vite/ESBuild/Tailwind 某些中间缓存可能命中（视版本与配置而定，命中率不保证，但成本低）。
* `node_modules/.cache`：若未来引入 SWC/PostCSS 之类缓存目录可直接受益。
* 同时包含 `~/.npm` 使得即便 `setup-node` 行为变更也有二级兜底（轻冗余，可视需要再精简）。

键设计：
```
${{ runner.os }}-build-${{ hashFiles('package-lock.json', 'tsconfig*.json', 'vite.config.*') }}
```
当依赖锁 / TS 配置 / Vite 配置变化时触发失效，保证缓存正确性。

## 本地影响
本地开发与运行不受影响；`npm run deploy` 现在不会再试图推送 Git 分支，只用于生成 `dist` 供手动预览：
```
npm run deploy
npx serve dist
```

## 若需要恢复 `gh-pages` 旧方案
可回滚到历史提交重新取回：
1. 恢复依赖：`npm i -D gh-pages`
2. 还原脚本：`"deploy": "vite build && cp CNAME dist/CNAME && gh-pages -d dist"`
3. 新建（或继续使用） `gh-pages` 分支，并在 Settings → Pages 切换 Source。

## 后续可考虑的进一步优化
1. 在缓存步骤中分离 npm 缓存与构建缓存（减少 key 变化时的完全失效）。
2. 添加 `lint` 步骤保证主分支质量：
  ```yaml
  - run: npm run lint --max-warnings=0
  ```
3. 增加一个 `pull_request` 触发，仅执行构建与预览（可用 Pages 预览环境）。
4. 若 Tailwind 配置增多，可专门缓存 `tailwind.config.*` 参与 key 计算。

如需继续压缩构建时间或加入预览环境，告知即可继续调整。

---

# News.tsx 分页功能实现记录 (2025-09-20)

## 功能概述
为 News.tsx 组件实现了完整的分页功能，将原本只显示前20条数据的限制改为支持分页浏览所有 `items.json` 中的数据。

## 实现细节

### 1. 状态管理
- 新增 `currentPage` 状态，使用 `useState(1)` 管理当前页码
- 设置每页显示数量为 20 条（`itemsPerPage = 20`）

### 2. 数据分页逻辑
```tsx
const totalPages = Math.ceil(items.length / itemsPerPage);
const startIndex = (currentPage - 1) * itemsPerPage;
const endIndex = startIndex + itemsPerPage;
const currentItems = items.slice(startIndex, endIndex);
```

### 3. 分页导航组件
实现了完整的分页导航，包括：

#### 页面信息显示
- 显示当前页的数据范围和总数据量
- 格式：`显示第 X - Y 项，共 Z 项`

#### 分页按钮
- **上一页/下一页按钮**：支持页面切换，首页和末页时自动禁用
- **页码按钮**：智能显示逻辑
  - 当前页周围显示最多5个页码
  - 页码过多时显示省略号（...）
  - 首尾页码始终显示
  - 当前页高亮显示（`variant="solid"`）

#### 页码跳转功能
- 提供数字输入框，支持直接输入页码跳转
- 按回车键执行跳转，输入完成后自动清空输入框
- 包含输入验证，只允许有效页码范围

### 4. 用户体验优化
- **滚动到顶部**：切换页面时自动滚动到页面顶部，使用平滑滚动效果
- **响应式布局**：分页控件使用 Flexbox 布局，适配不同屏幕尺寸
- **按钮状态管理**：首页/末页时相应按钮自动禁用

### 5. 样式设计
使用 Radix UI Button 组件和 Tailwind CSS：
- `variant="outline"`：普通状态的页码按钮
- `variant="solid"`：当前页高亮按钮
- 合理的间距和对齐（`gap-2`, `justify-center`, `items-center`）
- 输入框样式：`w-16 px-2 py-1 border border-gray-300 rounded text-center`

## 数据源信息
- **数据文件**：`../assets/items.json`
- **数据结构**：包含 `update_time` 和 `items` 数组
- **预估数据量**：约4000+行，每个博客条目包含 `blog_id`, `item_name`, `item_url`, `time` 等字段

## 代码变更
1. **导入新增**：添加 `useState` hook 和 `Button` 组件
2. **原有逻辑保持**：博客数据处理逻辑（`blogMap` 构建）保持不变
3. **渲染逻辑升级**：从 `items.slice(0, 20)` 改为 `currentItems`（基于当前页动态计算）
4. **新增UI组件**：页面信息、分页导航、页码跳转等完整分页界面

## 使用说明
- 用户可通过上一页/下一页按钮顺序浏览
- 用户可直接点击页码按钮跳转到指定页面  
- 用户可在输入框中输入页码并按回车快速跳转
- 页面切换时会自动滚动到顶部，提升浏览体验

这个实现提供了完整的分页浏览体验，用户现在可以方便地访问 `items.json` 中的所有博客数据，而不再受到20条的显示限制。

````
```

### index.html 中的处理脚本
```javascript
<script type="text/javascript">
  (function(l) {
    if (l.search[1] === '/' ) {
      var decoded = l.search.slice(1).split('&').map(function(s) { 
        return s.replace(/~and~/g, '&')
      }).join('?');
      window.history.replaceState(null, null,
          l.pathname.slice(0, -1) + decoded + l.hash
      );
    }
  }(window.location))
</script>
```

## 路由组件

### src/components/Home.tsx
主页组件，展示欢迎信息

### src/components/About.tsx
关于页面组件，展示网站介绍信息

## 导航
应用包含顶部导航栏，支持在不同页面间跳转：
- 友链列表
- 主页
- 关于

## 部署
运行 `npm run deploy` 命令会：
1. 构建应用
2. 复制 CNAME 文件到 dist 目录
3. 复制 404.html 文件到 dist 目录

## 注意事项
1. 所有路由在本地开发和 GitHub Pages 上都能正常工作
2. 直接访问路由 URL（如 https://yoursite.github.io/home）会正确跳转
3. 浏览器前进/后退按钮正常工作
4. 页面刷新不会出现 404 错误

## 技术栈
- React 19
- React Router 7
- Vite
- TypeScript
- Tailwind CSS
- Radix UI

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

# 已迁移到官方 GitHub Pages Actions 工作流 (2025-09-15)

## 迁移动机
原方案使用 `gh-pages` NPM 包直接 push 到 `gh-pages` 分支，需要处理：
1. Git 认证（可能出现 `could not read Username`）。
2. 手动保证 CNAME 复制。
3. 无 Pages 环境保护（Environment URL、审计、Rollbacks 功能有限）。

官方 Actions 组合（`upload-pages-artifact` + `deploy-pages`）提供：
- 内置 OIDC 签发，不需要手动注入 token 到 git remote。
- 自动生成 Environment（`github-pages`）并暴露 URL。
- 更稳定的缓存与最小权限（`contents: read`, `pages: write`）。

## 新工作流文件
路径：`.github/workflows/deployToGithubPages.yml`

核心步骤：
1. build Job：checkout → setup-node → npm ci → vite build → 复制 CNAME → 上传构建产物。
2. deploy Job：使用 `actions/deploy-pages@v4` 部署上传的 artifact。

并发控制：
```
concurrency:
  group: pages-deploy
  cancel-in-progress: false
```
避免快速多次 push 时出现中途构建产物被覆盖的不一致状态。

## 权限说明
```
permissions:
  contents: read
  pages: write
  id-token: write
```
`id-token: write` 是 `deploy-pages` 通过 OIDC 获取短期访问令牌的必要权限。

## 自定义域名处理
工作流中保留：
```
if [ -f CNAME ]; then cp CNAME dist/CNAME; fi
```
确保根目录 `CNAME` 被复制进部署目录。保持仓库根的 `CNAME` 文件即可。

## 本地与线上一致性验证
1. 本地执行：`npm ci && npm run build`，检查 `dist/` 包含 `index.html` 与资源。
2. 手动确认 `dist/CNAME`（若本地复制脚本也需要，可运行：`cp CNAME dist/CNAME`）。
3. 推送到 `master` 后，在 Actions 页面查看：
   - build 任务成功并显示 artifact 上传。
   - deploy 任务显示 `✅ Deployed`，Environment 面板出现 URL。

## 旧脚本及依赖清理（可选）
现在发布不再需要 `gh-pages` 包，可选择：
1. 从 `package.json` 删除 `gh-pages` 依赖。
2. 修改 `scripts.deploy`（保留本地手动预览可改成仅构建）：
   ```jsonc
   "deploy": "npm run build"
   ```
3. 若想安全过渡，可暂时保留，一段时间后再移除。

## 如果仍想保留手动推送方式
可新增一个单独脚本如：`"legacy:publish": "vite build && gh-pages -d dist"`，仅在本地或特殊场景使用。

## 回滚方式
若官方工作流异常（罕见）：
1. 在 Settings → Pages 将 Source 切回 Branch: `gh-pages`。
2. 恢复旧 workflow（保存在 git 历史中）。

## 后续可增量增强
- 添加 `actions/cache` 缓存 `~/.npm`（需注意 vite 和 Tailwind 版本变动）。
- 在 build 前跑 `npm run lint` 或轻量验证脚本（比如校验 `blogs.json` 结构）。
- 添加一个 `preview` workflow 用于 PR 预览（`actions/deploy-pages` 支持 PR 部署预览）。

如需继续删除 `gh-pages` 依赖或添加缓存优化告诉我即可。

---

# 依赖清理与缓存优化记录 (2025-09-15)

## 变更概览
本次调整：
1. 删除 `devDependencies` 中的 `gh-pages` 依赖（已完全迁移到官方 `deploy-pages` 工作流，不再需要本地推送分支方案）。
2. 修改 `package.json` 中 `deploy` 脚本：
  - 旧：`vite build && cp CNAME dist/CNAME && gh-pages -d dist`
  - 新：`npm run build && cp CNAME dist/CNAME`
  说明：现在部署由 GitHub Actions 完成，`deploy` 仅保留本地构建+写入 CNAME 的能力（调试 dist 用）。
3. 在 `.github/workflows/deployToGithubPages.yml` 中新增缓存步骤：
  ```yaml
  - name: Cache build output (Vite + TS)
    uses: actions/cache@v4
    with:
     path: |
      ~/.cache/vite
      ~/.npm
      node_modules/.cache
     key: ${{ runner.os }}-build-${{ hashFiles('package-lock.json', 'tsconfig*.json', 'vite.config.*') }}
     restore-keys: |
      ${{ runner.os }}-build-
  ```

## 为什么可以安全移除 `gh-pages`
当前部署链路：构建 → 上传 artifact → `actions/deploy-pages`。官方 Action 会将 artifact 发布为 Pages 版本，不需要再维护 `gh-pages` 分支，因此 `gh-pages` 包的 git push 逻辑失效。移除后：
* 减少一次依赖安装体积与安全面。
* 避免开发者误运行旧发布脚本导致分支状态漂移。

## 缓存策略说明
虽然 `setup-node` 已启用 `cache: npm`，但仍追加：
* `~/.cache/vite`：Vite/ESBuild/Tailwind 某些中间缓存可能命中（视版本与配置而定，命中率不保证，但成本低）。
* `node_modules/.cache`：若未来引入 SWC/PostCSS 之类缓存目录可直接受益。
* 同时包含 `~/.npm` 使得即便 `setup-node` 行为变更也有二级兜底（轻冗余，可视需要再精简）。

键设计：
```
${{ runner.os }}-build-${{ hashFiles('package-lock.json', 'tsconfig*.json', 'vite.config.*') }}
```
当依赖锁 / TS 配置 / Vite 配置变化时触发失效，保证缓存正确性。

## 本地影响
本地开发与运行不受影响；`npm run deploy` 现在不会再试图推送 Git 分支，只用于生成 `dist` 供手动预览：
```
npm run deploy
npx serve dist
```

## 若需要恢复 `gh-pages` 旧方案
可回滚到历史提交重新取回：
1. 恢复依赖：`npm i -D gh-pages`
2. 还原脚本：`"deploy": "vite build && cp CNAME dist/CNAME && gh-pages -d dist"`
3. 新建（或继续使用） `gh-pages` 分支，并在 Settings → Pages 切换 Source。

## 后续可考虑的进一步优化
1. 在缓存步骤中分离 npm 缓存与构建缓存（减少 key 变化时的完全失效）。
2. 添加 `lint` 步骤保证主分支质量：
  ```yaml
  - run: npm run lint --max-warnings=0
  ```
3. 增加一个 `pull_request` 触发，仅执行构建与预览（可用 Pages 预览环境）。
4. 若 Tailwind 配置增多，可专门缓存 `tailwind.config.*` 参与 key 计算。

如需继续压缩构建时间或加入预览环境，告知即可继续调整。

---
