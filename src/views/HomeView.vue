<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import PostCard from '../components/PostCard.vue'
import { usePosts } from '../composables/usePosts'

const route = useRoute()
const posts = usePosts()

const filtered = computed(() => {
  const kw = (route.query.q || '').trim().toLowerCase()
  if (!kw) return posts
  return posts.filter(p => (p.title + p.desc + p.tags.join('')).toLowerCase().includes(kw))
})
</script>

<!--
  注意：模板必须保持单一根元素（不要在根层级写注释）。
  根层级一旦出现注释节点，App.vue 中 <transition> 收到的就是 Fragment，
  children[0] 为 Comment，out-in 过渡的 leave/enter 钩子绑定错乱，
  切换路由后内容区会停在空占位符 <!---->，表现为「文章内容被吞掉」。
-->
<template>
  <section class="list-section">
    <div class="post-grid">
      <PostCard v-for="p in filtered" :key="p.slug" :post="p" />
    </div>
    <div v-if="!filtered.length" class="empty">没有找到相关文章</div>
  </section>
</template>
