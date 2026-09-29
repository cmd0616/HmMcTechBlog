# HmMcTechBlog

基于 **Vue 3 + Vite** 的个人开源技术博客，通过 GitHub Actions 自动构建并部署到 GitHub Pages。

## 技术栈

| 层 | 选型 | 说明 |
|----|------|------|
| 框架 | Vue 3（Composition API + `<script setup>`） | 组件化，逻辑复用用 composable |
| 构建 | Vite 5 | 相对路径 base，任意子路径可部署 |
| 路由 | Vue Router 4（hash 模式） | Pages 零配置，无 404 问题 |
| 内容 | Markdown + front matter | `import.meta.glob` 构建期自动收集，无索引文件 |

## 项目结构

```
HmMcTechBlog/
├── .github/workflows/deploy.yml  # CI/CD：push 到 main 自动部署 Pages
├── index.html
├── vite.config.js
├── src/
│   ├── config/site.js            # 分类注册表 + 站点信息（唯一的配置入口）
│   ├── composables/
│   │   ├── usePosts.js           # 文章数据层：自动扫描 posts/*.md
│   │   └── useTheme.js           # 明暗主题
│   ├── router/index.js
│   ├── components/
│   │   ├── NavBar.vue
│   │   ├── SideBar.vue
│   │   ├── CategoryTree.vue   # 分类文件树（递归组件，支持多级目录）
│   │   └── PostCard.vue
│   ├── views/
│   │   ├── HomeView.vue          # 首页：分类 / 筛选 / 搜索
│   │   ├── PostView.vue          # 文章详情
│   │   └── NotFoundView.vue
│   └── assets/style.css
└── posts/                        # 文章目录（全部 Markdown）
```

## 日常维护（重点看这里）

### 写新文章

往 `posts/` 丢一个 `.md` 文件即可，**不需要改任何其他文件**：

```markdown
---
title: 文章标题
desc: 一句话摘要（列表页展示）
category: frontend
tags: CSS, 前端
date: 2026-09-26
---

正文（Markdown）……
```

- 文件名即 URL slug（建议英文，如 `my-first-post.md` → `/#/post/my-first-post`）
- `category` 对应 `src/config/site.js` 里的 `key`；用 `/` 可放进多级子目录，见下一节
- 可选 front matter 字段：`updated`（最后更新时间）。不写时自动取 **git 最后提交时间**，
  未 init git 则回退文件修改时间。文末的「Last updated」与该值一致，想手动指定就写 `updated: 2026-09-27`

### 新增知识领域（以后远不止 5 个）

编辑 `src/config/site.js`，加一行即可，侧边栏文件树、卡片标签配色全部自动生效。

**数组书写顺序就是侧边栏显示顺序**（当前：前端 → 后端 → 嵌入式 → 安全 → 架构），想调先后直接上下移动这几行。
文章里用到但未注册的 `category` 会自动排在最后，按名称兜底。

```js
export const CATEGORIES = [
  { key: 'frontend', name: '前端', color: '#3b82f6', desc: '...' },
  // 新增：
  { key: 'ai', name: 'AI', color: '#ec4899', desc: '机器学习 / LLM / Agent' },
]
```

> 即使忘记注册，文章也不会丢失——未识别的 category 会自动建节点：名字取路径最后一段，配色继承最近的已注册祖先。

### 多级目录（文件夹里放文件夹）

侧边栏是文件树，文件夹下可以继续建子文件夹。`category` 用 `/` 分隔即可，层级不限：

```js
export const CATEGORIES = [
  { key: 'frontend', name: '前端', color: '#3b82f6', desc: '...' },
  // 在「前端」下开子文件夹：
  { key: 'frontend/css', name: 'CSS', color: '#0ea5e9', desc: '...' },
]
```

```markdown
category: frontend          → 前端 › 这篇文章
category: frontend/css      → 前端 › CSS › 这篇文章
category: frontend/css/grid → 前端 › CSS › grid › 这篇文章
```

几个行为细节：

- 子文件夹**不必预先注册**，写了就会自动生成（名称取最后一段，配色继承父级）
- 文件夹上的数字是**整棵子树的文章总数**（资源管理器语义）
- 打开深层文章时，会**自动展开整条祖先路径**并高亮当前文件
- 第 3 层起缩进自动收敛，深层不会把标题挤没

### 修改站点信息

同样在 `src/config/site.js` 的 `SITE` 对象中改标题、简介、GitHub 地址。

## 本地开发

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # 产物在 dist/
npm run preview    # 本地预览构建结果
```

## 部署到 GitHub Pages（全自动）

1. 创建 GitHub 仓库并推送：

```bash
git init
git add .
git commit -m "init: vue blog"
git branch -M main
git remote add origin https://github.com/cmd0616/HmMcTechBlog.git
git push -u origin main
```

2. 仓库 **Settings → Pages → Build and deployment**，Source 选择 **GitHub Actions**

3. 之后每次 push 到 `main`，Actions 自动构建部署，1~2 分钟后生效。
   访问：`https://<你的用户名>.github.io/HmMcTechBlog/`

> 项目使用相对路径 + hash 路由，无论部署在仓库名子路径还是自定义域名下都无需改任何配置。
> 记得把 `src/config/site.js` 里的 `github` 地址改成你的仓库。

## 后续可扩展方向

- [ ] 文章目录（TOC）侧边栏
- [ ] 归档 / 标签云页面
- [ ] giscus 评论（基于 GitHub Discussions）
- [ ] RSS 订阅（构建时生成 feed.xml）

## License

MIT
