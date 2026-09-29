---
title: 现代 CSS 开发指南：容器查询与 :has() 选择器
desc: CSS 早已不是当年的样式表，容器查询、:has() 父选择器、级联层等新特性正在改变组件化开发的思路。
category: frontend
tags: CSS, 前端
date: 2026-09-20
---

## 为什么需要容器查询

媒体查询 `@media` 只能响应**视口**尺寸，但组件化的今天，我们更希望组件根据**自身容器**的尺寸自适应：

```css
.card-container {
  container-type: inline-size;
  container-name: card;
}

@container card (min-width: 400px) {
  .card { display: grid; grid-template-columns: 1fr 2fr; }
}
```

同一个组件，放在侧边栏是纵向布局，放在主内容区自动变成横向布局——**无需任何 JS**。

## :has() —— 时隔多年的「父选择器」

```css
/* 表单项有校验错误时高亮整个 field */
.form-item:has(.error) {
  border-color: #ef4444;
}

/* 选中卡片时给卡片加阴影 */
.card:has(input:checked) {
  box-shadow: 0 0 0 2px var(--accent);
}
```

## 级联层 @layer

解决第三方库样式覆盖的老大难问题：

```css
@layer reset, base, components, utilities;

@layer components {
  .btn { /* 我们的按钮样式 */ }
}
```

## 小结

| 特性 | 解决的问题 | 兼容性 |
|------|-----------|--------|
| 容器查询 | 组件级响应式 | 现代浏览器全支持 |
| `:has()` | 父级/前置选择 | 现代浏览器全支持 |
| `@layer` | 样式优先级管理 | 现代浏览器全支持 |

拥抱新特性，同时用 `@supports` 做渐进增强，是当下写 CSS 的最佳姿势。
