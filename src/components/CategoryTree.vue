<script setup>
import { sidebarOpen } from '../composables/useUi'

const props = defineProps({
  /** 当前层级的文件夹节点（来自 categoryTree()） */
  nodes: { type: Array, required: true },
  /** 展开的文件夹 key 集合（reactive Set，整棵树共用一份） */
  expanded: { type: Object, required: true },
  /** 当前激活的分类，值为完整路径如 frontend/css */
  activeCat: { type: String, default: '' },
  /** 当前文章 slug */
  activeSlug: { type: String, default: '' },
})

/** 点击文件夹：仅切换折叠状态（标准文件树语义） */
function toggle(node) {
  props.expanded.has(node.key) ? props.expanded.delete(node.key) : props.expanded.add(node.key)
}
</script>

<template>
  <div v-for="node in nodes" :key="node.key" class="tree-cat" :style="{ '--cat': node.color }">
    <!-- 文件夹：整行点击仅切换折叠 -->
    <a class="tree-item folder" :class="{ active: activeCat === node.key }" @click="toggle(node)">
      <span class="tree-arrow" :class="{ open: expanded.has(node.key) }">
        <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
          <path d="M9 5l7 7-7 7" />
        </svg>
      </span>
      <span class="tree-label">{{ node.name }}</span>
      <span class="side-count">{{ node.count }}</span>
    </a>

    <div v-show="expanded.has(node.key)" class="tree-children">
      <!-- 子文件夹：递归自身，层级不限 -->
      <CategoryTree
        v-if="node.children.length"
        :nodes="node.children"
        :expanded="expanded"
        :active-cat="activeCat"
        :active-slug="activeSlug"
      />

      <!-- 本文件夹下的文章 -->
      <router-link
        v-for="p in node.posts" :key="p.slug"
        class="tree-item leaf" :class="{ active: activeSlug === p.slug }"
        :to="`/post/${p.slug}`" @click="sidebarOpen = false"
      >
        <span class="tree-file-dot"></span>
        <span class="tree-label">{{ p.title }}</span>
      </router-link>
    </div>
  </div>
</template>
