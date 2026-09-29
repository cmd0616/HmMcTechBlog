<script setup>
import { computed, onMounted, watch, ref, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import { findPost, renderMarkdown, getNeighbors } from '../composables/usePosts'
import { SITE } from '../config/site'
import NotFoundView from './NotFoundView.vue'

const route = useRoute()
const post = computed(() => findPost(route.params.slug))
const html = computed(() => post.value ? renderMarkdown(post.value.body) : '')
/** 独立页面（category: about）：隐藏日期/阅读时长等文章属性 */
const isPage = computed(() => post.value?.category === 'about')
const notFound = ref(false)

function setTitle() {
  if (post.value) document.title = `${post.value.title} - HmMc 技术博客`
}
watch(post, () => { notFound.value = !post.value; setTitle() })
onMounted(setTitle)

// 文章内外链新窗口打开
watch(html, async () => {
  await nextTick()
  document.querySelectorAll('.markdown-body a[href^="http"]').forEach(a => {
    a.target = '_blank'; a.rel = 'noopener'
  })
})

// ---------- 页脚：编辑链接 / 最后更新时间 / 上一页·下一页 ----------
const neighbors = computed(() => getNeighbors(route.params.slug))

const editUrl = computed(() =>
  post.value ? `${SITE.github}/edit/${SITE.branch}/posts/${post.value.slug}.md` : '#'
)

const updatedText = computed(() => {
  const raw = post.value?.updated
  if (!raw) return ''
  const d = new Date(raw)
  return Number.isNaN(d.getTime())
    ? raw
    : d.toLocaleString('zh-CN', {
        year: 'numeric', month: 'numeric', day: 'numeric',
        hour: '2-digit', minute: '2-digit', hour12: false,
      })
})
</script>

<template>
  <div class="post-page">
    <NotFoundView v-if="!post" />
    <template v-else>
      <article class="post-container">
        <header class="post-header">
          <h1>{{ post.title }}</h1>
          <div v-if="!isPage" class="post-meta">
            <span>{{ post.date }}</span>
            <span>预计阅读 {{ post.readTime }} 分钟</span>
            <span>约 {{ post.words }} 字</span>
          </div>
        </header>
        <div class="markdown-body" v-html="html"></div>

        <footer class="post-footer">
          <div class="post-edit-row">
            <a class="post-edit-link" :href="editUrl" target="_blank" rel="noopener">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
              </svg>
              在 GitHub 上编辑此页面
            </a>
            <span v-if="updatedText" class="post-updated">Last updated: {{ updatedText }}</span>
          </div>

          <nav v-if="neighbors.prev || neighbors.next" class="post-nav">
            <router-link v-if="neighbors.prev" class="post-nav-item" :to="`/post/${neighbors.prev.slug}`">
              <span class="post-nav-label">上一页</span>
              <span class="post-nav-title">{{ neighbors.prev.title }}</span>
            </router-link>
            <span v-else class="post-nav-item ghost" aria-hidden="true"></span>

            <router-link v-if="neighbors.next" class="post-nav-item next" :to="`/post/${neighbors.next.slug}`">
              <span class="post-nav-label">下一页</span>
              <span class="post-nav-title">{{ neighbors.next.title }}</span>
            </router-link>
            <span v-else class="post-nav-item ghost" aria-hidden="true"></span>
          </nav>
        </footer>
      </article>
    </template>
  </div>
</template>
