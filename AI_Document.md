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
