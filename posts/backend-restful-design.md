---
title: RESTful API 设计最佳实践与常见误区
desc: 从资源建模、状态码语义到版本管理，聊聊设计一个「对开发者友好」的 API 接口需要哪些考量。
category: backend
tags: API, 后端
date: 2026-09-15
---

## 资源建模是第一步

好的 API 从**名词**开始，而不是动词：

```
（推荐）
GET    /articles          获取文章列表
GET    /articles/42       获取单篇文章
POST   /articles          创建文章
PATCH  /articles/42       部分更新
DELETE /articles/42       删除文章

（反面示例）
GET    /getArticleList
POST   /articles/delete?id=42
```

## 状态码要语义化

| 状态码 | 场景 |
|--------|------|
| `200`  | 成功（GET/PATCH） |
| `201`  | 创建成功，配合 `Location` 头 |
| `204`  | 删除成功，无返回体 |
| `400`  | 请求参数错误 |
| `401` / `403` | 未认证 / 无权限 |
| `404` | 资源不存在 |
| `409` | 资源冲突 |
| `422` | 业务校验失败 |
| `500` | 服务端异常（不该暴露堆栈） |

## 常见误区

1. **把所有错误都返回 200**，用 body 里的 code 区分——这让监控、网关、重试机制全部失效。
2. **版本放在路径里却没有规范**。推荐 `/v1/articles` 或 `Accept: application/vnd.api+json;version=1`。
3. **分页没有固定约定**。推荐游标分页：

```json
{
  "data": [],
  "next_cursor": "eyJpZCI6NDJ9",
  "has_more": true
}
```

## 小结

API 是给**开发者**用的界面。设计时多问一句：调用方看到这个响应，能一眼明白发生了什么吗？
