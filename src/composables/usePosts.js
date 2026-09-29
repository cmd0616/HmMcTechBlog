/**
 * 文章数据层
 *
 * 新增文章 = 往 posts/ 目录丢一个 .md 文件，无需任何其他操作
 *
 * 构建时 Vite 会通过 import.meta.glob 自动收集所有 .md 原文，
 * 运行时解析 front matter 生成元数据。
 *
 * category: about 的文件被视为「独立页面」（如关于页），不参与文章列表。
 * category 支持 "a/b/c" 路径，自动生成多级文件夹（见 categoryTree）。
 */
import { marked } from 'marked'
import { getCategory } from '../config/site'
import postMtimes from 'virtual:post-mtime'

const RAW_POSTS = import.meta.glob('/posts/*.md', { query: '?raw', import: 'default', eager: true })

/** 解析极简 front matter（key: value 行，tags 用逗号分隔） */
function parseFrontMatter(raw, slug) {
  const m = raw.match(/^---\s*\n([\s\S]*?)\n---\s*\n?/)
  const meta = { slug }
  let body = raw

  if (m) {
    body = raw.slice(m[0].length)
    for (const line of m[1].split('\n')) {
      const idx = line.indexOf(':')
      if (idx > 0) meta[line.slice(0, idx).trim()] = line.slice(idx + 1).trim()
    }
  }

  meta.title = meta.title || slug
  meta.desc = meta.desc || ''
  meta.category = meta.category || 'other'
  meta.tags = (meta.tags || '').split(/[,，]/).map(t => t.trim()).filter(Boolean)
  meta.date = meta.date || '1970-01-01'
  // 最后更新时间：front matter 显式声明 updated > git 提交时间（虚拟模块） > 创建日期
  meta.updated = meta.updated || postMtimes[slug] || meta.date
  meta.body = body

  const words = body.replace(/\s/g, '').length
  meta.words = words
  meta.readTime = Math.max(1, Math.round(words / 350))
  return meta
}

const all = Object.entries(RAW_POSTS)
  .map(([path, raw]) => parseFrontMatter(raw, path.match(/([^/]+)\.md$/)[1]))
  .sort((a, b) => b.date.localeCompare(a.date))

/** 独立页面（category: about），如「关于本项目」 */
export const pages = all.filter(p => p.category === 'about')

/** 普通文章（按日期倒序） */
const posts = all.filter(p => p.category !== 'about')

/** 全部文章（按日期倒序） */
export function usePosts() {
  return posts
}

/** 按 slug 获取单篇内容（文章或页面） */
export function findPost(slug) {
  return all.find(p => p.slug === slug)
}

/**
 * 按侧边栏文件树的展示顺序，把全部文章展平成一个序列
 * 深度优先：与 CategoryTree 的渲染顺序一致（先子文件夹，后本层文章）
 */
const NAV_SEQUENCE = (() => {
  const seq = []
  const walk = (node) => {
    node.children.forEach(walk)
    seq.push(...node.posts)
  }
  categoryTree().forEach(walk)
  return seq
})()

/** 上一篇 / 下一篇（按侧边栏导航顺序取相邻文章；独立页面不参与） */
export function getNeighbors(slug) {
  const i = NAV_SEQUENCE.findIndex(p => p.slug === slug)
  if (i === -1) return { prev: null, next: null }
  return { prev: NAV_SEQUENCE[i - 1] || null, next: NAV_SEQUENCE[i + 1] || null }
}

/** 渲染 Markdown 为 HTML */
export function renderMarkdown(md) {
  return marked.parse(md, { breaks: true })
}

/** 分类计数（仅统计普通文章，按分类 key 扁平统计） */
export function categoryCounts() {
  const counts = {}
  posts.forEach(p => { counts[p.category] = (counts[p.category] || 0) + 1 })
  return counts
}

/**
 * 分类树 —— 侧边栏文件树的数据源
 *
 * category 支持 "a/b/c" 路径，文件夹里可以继续放文件夹（层级不限）：
 *   category: frontend          → 前端 › 文章
 *   category: frontend/css      → 前端 › CSS › 文章
 *
 * 节点结构：
 *   { key, name, color, desc, posts, children, count }
 *   - posts    直接属于该文件夹的文章
 *   - children 子文件夹
 *   - count    整棵子树的文章数（资源管理器语义：文件夹显示总数）
 */
export function categoryTree() {
  const roots = []
  const index = new Map()

  /** 取得（或按需创建）某个分类节点，并挂到父节点下 */
  function ensure(key) {
    const hit = index.get(key)
    if (hit) return hit

    const meta = getCategory(key)
    const node = {
      key,
      name: meta.name,
      color: meta.color,
      desc: meta.desc,
      order: meta.order, // 取自 CATEGORIES 数组下标
      posts: [],
      children: [],
      count: 0,
    }
    index.set(key, node)

    const parts = key.split('/')
    if (parts.length === 1) roots.push(node)
    else ensure(parts.slice(0, -1).join('/')).children.push(node)

    return node
  }

  posts.forEach(p => ensure(p.category || 'other').posts.push(p))

  const countOf = (n) => n.posts.length + n.children.reduce((sum, c) => sum + countOf(c), 0)

  /** 文件夹排序：先按 site.js 的数组顺序（order），未注册的再按名称兜底 */
  const byOrderThenName = (a, b) => (a.order - b.order) || a.name.localeCompare(b.name, 'zh')

  const settle = (n) => {
    n.count = countOf(n)
    n.children.forEach(settle)
    n.children.sort(byOrderThenName)
    n.posts.sort((a, b) => b.date.localeCompare(a.date)) // 同一文件夹内仍按日期倒序
    return n
  }

  return roots.map(settle).sort(byOrderThenName)
}
