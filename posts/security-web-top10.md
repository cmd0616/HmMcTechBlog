---
title: Web 安全入门：OWASP Top 10 速览与防御思路
desc: SQL 注入、XSS、CSRF…… 这些高频漏洞的原理并不复杂，关键是建立「不信任任何输入」的安全意识。
category: security
tags: Web安全, OWASP
date: 2026-09-05
---

> 核心原则只有一条：**不信任任何来自用户的输入。**

## 注入类漏洞

### SQL 注入

```sql
-- 用户输入: ' OR '1'='1
SELECT * FROM users WHERE name = '' OR '1'='1' -- AND pwd = '...';
```

**防御：参数化查询，永不拼接 SQL**

```python
cursor.execute("SELECT * FROM users WHERE name = %s", (name,))
```

### XSS（跨站脚本）

用户提交的内容中携带脚本，在其他用户浏览器中执行。

**防御：输出转义 + CSP 响应头**

```
Content-Security-Policy: default-src 'self'
```

## CSRF（跨站请求伪造）

攻击者诱导已登录用户在第三方页面发起伪造请求。

**防御：**

1. 使用 `SameSite=Lax/Strict` Cookie
2. 关键操作携带 CSRF Token
3. `GET` 请求必须无副作用

## 认证与会话

- 密码必须使用 **bcrypt / argon2** 等慢哈希，而不是 MD5/SHA256
- 登录失败统一提示「用户名或密码错误」，避免用户枚举
- 会话 Cookie 设置 `HttpOnly` + `Secure`

## 失效的访问控制

```python
# 错误：只依赖前端隐藏按钮
# 正确：后端每个接口都校验权限
if article.owner_id != current_user.id:
    abort(403)
```

## 学习路线建议

1. 靶场练习：DVWA、PortSwigger Academy（免费且体系化）
2. 工具：Burp Suite、SQLMap、dirsearch
3. 阅读 CVE 报告，理解真实漏洞的形成链路

**安全的本质是攻击面管理，而不是堆砌工具。**
