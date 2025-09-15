# 背景
- 当前的展示方案（将markdown（直接使用markdown的list语法）直接渲染成html的形式）展示的效果比较丑，我想使用react与Radix UI来进行重构
- 询问了ChatGPT然后进行了预研，使用github pages展示react项目是可行的，核心点是要配合使用[gh-pages库](https://www.npmjs.com/package/gh-pages)

## high level design
- 好看一点，支持Macbook Pro和iPhone展示效果
- Github Pages展示页面
- 自动化（每次push代码到master分支，代码就会直接在github page上进行部署）

## low level design
- 技术栈：react、Radix UI（使用Card组件）、tailwindcss、gh-pages依赖；使用github action实现自动化（push master事件，执行`npm run deploy(vite build && gh-pages -d dist)`命令进行部署）；vite进行项目创建
- 数据结构设计
```
name(string): who's blog
url(string): blogs's url
[optional]describe(string): introduce the blog, the author
[optional]avatar(string): author's avatar url or location path
```
- 写博客流程设计
1. 信息提供（json）
2. 头像图片处理
- 卡片设计（单个博客数据展示效果设计）
1. 上面是avatar图片
1. 接着是博客作者名称
1. 接着是博客描述
