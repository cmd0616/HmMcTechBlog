<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useTheme } from '../composables/useTheme'
import { sidebarOpen } from '../composables/useUi'
import { usePosts } from '../composables/usePosts'
import { CATEGORIES, SITE } from '../config/site'
import logoUrl from '../assets/logo.jpg'

const { theme, toggle } = useTheme()
const posts = usePosts()
const route = useRoute()
const router = useRouter()

const keyword = computed({
  get: () => route.query.q || '',
  set: (value) => {
    router.replace({ path: '/', query: value ? { q: value } : {} })
  },
})
</script>

<template>
  <header class="navbar">
    <div class="nav-inner">
      <div class="nav-left">
        <!-- 移动端：汉堡按钮（SVG） -->
        <button class="icon-btn menu-btn" @click="sidebarOpen = true" aria-label="打开菜单">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
            <path d="M3 6h18M3 12h18M3 18h18" />
          </svg>
        </button>

        <router-link class="logo" to="/">
          <img class="logo-mark" :src="logoUrl" alt="HmMc TechBlog" />
          <span class="logo-text">
            <span class="logo-title">HmMc<em>TechBlog</em></span>
            <span class="logo-subtitle">{{ CATEGORIES.length }} 领域 · {{ posts.length }} 篇文章</span>
          </span>
        </router-link>
      </div>

      <!-- 全局搜索 -->
      <input v-model="keyword" class="nav-search" type="search" placeholder="搜索文章…" />

      <div class="nav-actions">
        <button class="icon-btn" @click="toggle" :aria-label="theme === 'dark' ? '切换到亮色主题' : '切换到暗色主题'">
          <svg v-if="theme === 'dark'" viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
          </svg>
          <svg v-else viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
          </svg>
        </button>
      </div>
    </div>
  </header>
</template>
