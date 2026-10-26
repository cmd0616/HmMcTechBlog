---
title: 从 DOM 到屏幕：浏览器渲染管线六步拆解
desc: 解析、建树、布局、绘制、光栅化、合成——拆解浏览器把 HTML 变成屏幕像素的完整链路
category: frontend
tags: 浏览器, 渲染管线, DOM, Blink, 前端
date: 2026-10-26
---

> 输入一个 URL 后，HTML 是怎么变成屏幕上那些像素的？本文沿着解析 → 布局 → 绘制 → 光栅化 → 合成的完整链路，看看每个阶段各自解决了什么问题。

## 一、浏览器组成

| 模块 | 做什么 | 相关技术 |
|---|---|---|
| 用户界面 UI | 地址栏、标签页、菜单、书签 | 系统窗口框架、Qt/原生 UI 框架、多进程 IPC |
| 浏览器引擎 | 连接 UI 和渲染引擎，管理导航、标签页、进程 | Chromium 多进程架构、Mojo IPC、站点隔离 |
| 渲染引擎 | 解析 HTML/CSS，构建 DOM/CSSOM/渲染树 | Blink、WebKit、Gecko；HTML5 解析算法、CSS 选择器匹配 |
| JavaScript 引擎 | 解析和执行 JS | V8、JavaScriptCore、SpiderMonkey；JIT、GC、事件循环 |
| 网络模块 | DNS、TCP/TLS、HTTP、缓存、代理 | HTTP/1.1、HTTP/2、HTTP/3、QUIC、DoH、DoQ、TLS 1.3 |
| UI 后端 | 绘制按钮、滚动条、对话框等基础控件 | 系统原生控件、Skia、GPU 合成 |
| 数据存储 | Cookie、localStorage、IndexedDB、缓存 | SQLite、LevelDB、Cache Storage、Service Worker |

## 二、渲染

### 1. 解析 HTML，生成 DOM 树；解析 CSS，生成 CSSOM 树

分词器 Tokenizer 将字符流拆成一个个 Token。
HTML 输出 `StartTag`、`EndTag`、`Text`、`Comment` 等；CSS 输出选择器、属性名、属性值、`{}`、`;` 等。

树构建器 Tree Builder 根据 Token 和 HTML 语法规则创建节点、维护父子关系。
HTML 输出 DOM 树；CSS 输出 CSSOM / 样式规则树。

### 2. 生成渲染树

遍历 DOM 树，给每一个节点贴上 CSS 样式。
输出渲染树（知道界面上有哪些节点应该长什么样）。

### 3. 布局 / 重排

渲染引擎遍历渲染树，计算每个节点的位置（布局），写回渲染树（有了位置信息，可以叫做布局树了），此时就知道每个节点应该放在什么位置。

如果元素的几何信息或文档结构发生变化，浏览器需要重新计算受影响部分的布局，这就是重排。

浏览器会在每帧渲染前，把所有累积的布局变更批量结算一次；如果这一帧没有任何布局变更，就不会重排。

**正常流程：**

```text
JS 执行（修改样式、DOM）
标记 dirty 节点
JS 任务结束
浏览器进入渲染阶段
    如果有 dirty 节点 → 批量 Layout（一次重排）
    如果没有 dirty 节点 → 跳过 Layout
Paint → Composite → 上屏
```

**强制重排（读操作倒逼写操作）**

- 写操作完成后，立马进行读操作
- 浏览器会立刻进行重排，防止读到旧值
- 如果重排速度慢，会导致卡顿掉帧

### 4. 绘制

```text
LayoutObject 树：知道每个元素多大、在哪
        ↓
PaintLayer / GraphicsLayer 树：决定哪些内容要独立成层
        ↓
Paint：按图层为单位生成 DisplayList / PaintRecord
        ↓
cc 合成器：把每个图层的光栅化结果合成到屏幕
```

渲染引擎遍历布局树，生成绘制指令列表 / Paint Record。

生成图层树，知道哪些节点需要单独处理。

图层树不是每个元素一层，而是只有需要独立合成、独立动画、独立裁剪或独立层叠的元素才会单独成层。

### 5. 光栅化

光栅化就是把 Paint 阶段生成的绘制指令 DisplayList / PaintRecord 真正执行一遍，变成 GPU 可用的像素或纹理。

```text
Blink 主线程：Paint → 生成 DisplayList / PaintRecord
        ↓ commit
cc 合成器线程：Layer 树 → LayerImpl 树
        ↓
PictureLayerTiling 把 PictureLayerImpl 拆成 Tile
        ↓
TileManager 按优先级调度 RasterTask
        ↓
Raster 线程 / GPU 进程回放每个 Tile 的绘制指令
        ↓
生成 GPU 纹理 / 位图
        ↓
Activate → Draw → 提交 CompositorFrame 给 Viz
```

cc 合成器将图层树分割成 Tile（瓦片），然后执行绘制指令，将 Tile 变成像素或纹理。

### 6. 合成

合成线程把各图层按顺序组合，再交给 GPU 显示。`transform`、`opacity` 这类属性更容易只触发合成阶段，所以做动画时通常更流畅。

## 小结

把整条链路串起来，就是这一行：

```text
字节流 → DOM / CSSOM → 渲染树 → Layout → Paint → Raster → Composite → 屏幕
```

回头看，浏览器做的事其实分成两半：**前半段搞清楚页面上有什么**（解析、建树、算样式），**后半段把它真正画出来**（布局、绘制、光栅化、合成）。

每个阶段各自回答一个问题，可以这么记：

| 阶段 | 回答的问题 |
|---|---|
| DOM / CSSOM | 页面结构和样式规则是什么 |
| 渲染树 | 哪些节点要显示、各自长什么样 |
| 布局 | 每个节点放在哪、多大 |
| 绘制 | 按什么顺序画、画什么内容 |
| 光栅化 | 绘制指令怎么变成像素 |
| 合成 | 各图层怎么拼成一屏 |

至于这条链路上每一步的代价、以及前端能怎么"少走几步"（重排、重绘、强制同步布局、合成层），放到后面讲浏览器内核源码的文章里展开。
