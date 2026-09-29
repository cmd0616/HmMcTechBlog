/**
 * 分类注册表 —— 唯一需要维护的配置
 *
 * 新增一个知识领域，只需要在下面数组里加一项，全站自动生效：
 *   - 侧边栏文件树 / 文章卡片标签配色
 *
 * 数组顺序 = 侧边栏显示顺序，想调整分类先后直接上下移动这几行。
 * 文章里用到但未注册的 category 会自动排在最后（按名称兜底）。
 *
 * 【多级目录】key 支持用 "/" 表示层级，文件夹里可以继续放文件夹：
 *
 *   { key: 'frontend',     name: '前端', color: '#3b82f6' }
 *   { key: 'frontend/css', name: 'CSS',  color: '#0ea5e9' }
 *
 * 会渲染成「前端 › CSS」两层文件夹。文章 front matter 写：
 *
 *   category: frontend/css        → 放进「前端 › CSS」
 *   category: frontend            → 直接放进「前端」
 *
 * 层级深度不限（a/b/c…），不必预先注册：
 * 文章用到未注册的层级时会自动创建节点，名字取路径最后一段，
 * 配色继承最近的已注册祖先。
 */
export const CATEGORIES = [
  { key: 'frontend', name: '前端',   color: '#3b82f6', desc: 'HTML / CSS / JS / 框架与工程化' },
  { key: 'backend',  name: '后端',   color: '#10b981', desc: '服务端语言 / 数据库 / 中间件' },
  { key: 'embedded', name: '嵌入式', color: '#f59e0b', desc: '单片机 / RTOS / 驱动与硬件' },
  { key: 'security', name: '安全',   color: '#ef4444', desc: 'Web 安全 / 逆向 / CTF 实战' },
  { key: 'arch',     name: '架构',   color: '#8b5cf6', desc: '系统设计 / 分布式 / 最佳实践' },
  // 示例：在「前端」下开一个子文件夹（取消注释即可生效）
  // { key: 'frontend/css', name: 'CSS', color: '#0ea5e9', desc: '布局 / 选择器 / 新特性' },
  // 示例：以后想加 AI 领域，取消下一行注释即可
  // { key: 'ai', name: 'AI', color: '#ec4899', desc: '机器学习 / LLM / Agent' },
]

/** 站点全局信息 */
export const SITE = {
  title: 'HmMc 技术博客',
  motto: '探索技术的无限可能',
  desc: '记录技术领域的学习笔记与实战经验，欢迎交流指正。',
  github: 'https://github.com/cmd0616/HmMcTechBlog', // 文末「在 GitHub 上编辑此页面」链接使用
  branch: 'main', // 「在 GitHub 上编辑此页面」链接使用的分支
}

/** order = 数组下标，即侧边栏的显示顺序；调顺序直接调数组顺序即可 */
const CAT_MAP = Object.fromEntries(CATEGORIES.map((c, i) => [c.key, { ...c, order: i }]))

/** 未注册层级的排序位次：始终排在所有已注册项之后 */
export const UNREGISTERED_ORDER = Number.POSITIVE_INFINITY

/** 兜底分类：文章使用了未注册的 category 时使用 */
export const FALLBACK_CATEGORY = { key: 'other', name: '其他', color: '#64748b', desc: '' }

/** 路径最后一段，作为未注册层级的默认显示名 */
const leafName = (key) => key.split('/').pop()

/**
 * 取分类的展示信息（名称 / 配色 / 描述）
 *
 * 支持 "a/b/c" 路径：未注册的层级会向上找最近的已注册祖先并继承其配色，
 * 因此给父文件夹配一次色，整棵子树就统一了。
 */
export function getCategory(key) {
  if (!key) return { ...FALLBACK_CATEGORY, order: UNREGISTERED_ORDER }
  const hit = CAT_MAP[key]
  if (hit) return hit

  const parts = key.split('/')
  for (let i = parts.length - 1; i > 0; i--) {
    const ancestor = CAT_MAP[parts.slice(0, i).join('/')]
    if (ancestor) {
      return { key, name: leafName(key), color: ancestor.color, desc: '', order: UNREGISTERED_ORDER }
    }
  }
  return { ...FALLBACK_CATEGORY, key, name: leafName(key), order: UNREGISTERED_ORDER }
}
