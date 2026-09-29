import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { execSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.dirname(fileURLToPath(import.meta.url))

/** 项目是否已纳入 git 管理（未 git init 时直接跳过 git 查询，避免刷一串 fatal 日志） */
function inGitRepo() {
  try {
    execSync('git rev-parse --is-inside-work-tree', { cwd: ROOT, stdio: ['ignore', 'pipe', 'pipe'] })
    return true
  } catch { return false }
}

/**
 * 读取每篇文章的最后修改时间
 * 优先级：git 最后一次提交时间（CI 上也准确）→ 文件 mtime（未 init git / 未提交时兜底）
 */
function readPostTimes() {
  const dir = path.join(ROOT, 'posts')
  if (!fs.existsSync(dir)) return {}

  const useGit = inGitRepo()
  const times = {}
  for (const name of fs.readdirSync(dir)) {
    if (!name.endsWith('.md')) continue
    const slug = name.replace(/\.md$/, '')

    let time = ''
    if (useGit) {
      try {
        time = execSync(`git log -1 --format=%cI -- "${name}"`, {
          cwd: ROOT,
          stdio: ['ignore', 'pipe', 'pipe'], // 屏蔽 stderr，异常不外泄到控制台
        }).toString().trim()
      } catch { /* 文件尚未提交等场景，回退 mtime */ }
    }
    if (!time) time = fs.statSync(path.join(dir, name)).mtime.toISOString()

    times[slug] = time
  }
  return times
}

/** 虚拟模块：把文章更新时间注入前端，避免每次部署 CI checkout 导致 mtime 失真 */
function postMtimePlugin() {
  const resolved = '\0virtual:post-mtime'
  return {
    name: 'post-mtime',
    resolveId(source) {
      return source === 'virtual:post-mtime' ? resolved : null
    },
    load(id) {
      // 只处理自己的虚拟模块，否则会拦截所有模块的加载
      if (id !== resolved) return null
      return `export default ${JSON.stringify(readPostTimes())}`
    },
  }
}

// 相对路径 base + hash 路由 => 仓库根路径 / 子路径 / 自定义域名 均可直接部署，无需改配置
export default defineConfig({
  base: './',
  plugins: [vue(), postMtimePlugin()],
})
