---
title: 关于本项目
desc: 项目介绍与技术栈说明
category: about
date: 2026-09-27
---

## 项目简介

HmMcTechBlog 是我的个人开源技术博客，基于 **Vue 3 + Vite** 构建，
通过 GitHub Actions 自动构建并部署到 GitHub Pages。

## 技术栈

| 层 | 选型 |
|----|------|
| 框架 | Vue 3（Composition API） |
| 构建 | Vite 5 |
| 路由 | Vue Router 4（hash 模式） |
| 内容 | Markdown + front matter，构建期自动收集 |

## 如何写新文章

往仓库 `posts/` 目录添加一个 `.md` 文件即可，无需改动任何代码：

```markdown
---
title: 文章标题
desc: 一句话摘要
category: frontend
tags: CSS, 前端
date: 2026-09-27
---

正文……
```

## 如何新增知识领域

编辑 `src/config/site.js`，在 `CATEGORIES` 数组中加一行即可，全站自动生效。
