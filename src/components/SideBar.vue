<script setup>
import { computed, reactive, watch } from 'vue'
import { useRoute } from 'vue-router'
import { SITE } from '../config/site'
import { findPost, pages, categoryTree } from '../composables/usePosts'
import { sidebarOpen } from '../composables/useUi'
import CategoryTree from './CategoryTree.vue'

const route = useRoute()

/** 整棵分类树（category 支持 "a/b/c" 路径，层级不限） */
const tree = categoryTree()

/** 当前高亮的分类：文章页高亮其所属分类（完整路径），首页读 query */
const activeCat = computed(() => {
  if (route.name === 'post') {
    const p = findPost(route.params.slug)
    if (p) return p.category
  }
  return route.query.cat || ''
})

/** 当前文章 slug（叶子高亮） */
const activeSlug = computed(() => (route.name === 'post' ? route.params.slug : ''))

/** 展开的文件夹（reactive Set，整棵树共用） */
const expanded = reactive(new Set())

/** 到达深层目录（分享链接、文章页）时，自动展开整条祖先路径 */
watch(activeCat, (k) => {
  if (!k) return
  const parts = k.split('/')
  parts.forEach((_, i) => expanded.add(parts.slice(0, i + 1).join('/')))
}, { immediate: true })
</script>

<template>
  <nav class="side-nav">
    <!-- 独立页面（category: about 的 md 文件） -->
    <div class="side-group">
      <router-link
        v-for="pg in pages" :key="pg.slug"
        class="tree-item" :class="{ active: activeSlug === pg.slug }"
        :to="`/post/${pg.slug}`" @click="sidebarOpen = false"
      >
        <span class="tree-file-dot"></span>
        <span class="tree-label">{{ pg.title }}</span>
      </router-link>
    </div>

    <!-- 分类文件夹树：文件夹里可嵌套文件夹 -->
    <div class="side-group">
      <div class="side-title">知识领域</div>
      <CategoryTree :nodes="tree" :expanded="expanded" :active-cat="activeCat" :active-slug="activeSlug" />
    </div>

    <!-- 外部链接 -->
    <div class="side-group">
      <a class="tree-item" :href="SITE.github" target="_blank" rel="noopener">
        <span class="tree-arrow">
          <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M9 19c-4 1.5-4-2.5-6-3m12 5v-3.5c0-1 .1-1.4-.5-2 2.8-.3 4.5-1.4 4.5-5a4 4 0 0 0-1.1-2.8 3.7 3.7 0 0 0-.1-2.8s-1.1-.3-3.5 1.3a12 12 0 0 0-6 0C6.1 4.7 5 5 5 5a3.7 3.7 0 0 0-.1 2.8A4 4 0 0 0 3.8 10.5c0 3.6 1.7 4.7 4.5 5-.6.6-.6 1.2-.5 2V20" />
          </svg>
        </span>
        <span class="tree-label">GitHub</span>
        <span class="side-count side-external">
          <svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M7 17L17 7M9 7h8v8" />
          </svg>
        </span>
      </a>
    </div>
  </nav>
</template>
