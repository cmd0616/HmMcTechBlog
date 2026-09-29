<script setup>
import { getCategory } from '../config/site'

const props = defineProps({
  post: { type: Object, required: true },
})
const cat = getCategory(props.post.category)
</script>

<template>
  <router-link class="post-card" :to="`/post/${post.slug}`" :style="{ '--cat': cat.color }">
    <span class="card-tag">{{ cat.name }}</span>
    <h3>{{ post.title }}</h3>
    <p class="card-desc">{{ post.desc }}</p>
    <div class="card-meta">
      <span>{{ post.date }}</span>
      <span>{{ post.readTime }} min</span>
    </div>
  </router-link>
</template>
