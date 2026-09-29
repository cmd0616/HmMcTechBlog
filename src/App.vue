<script setup>
import { useRoute } from 'vue-router'
import NavBar from './components/NavBar.vue'
import SideBar from './components/SideBar.vue'
import { sidebarOpen } from './composables/useUi'

const route = useRoute()
</script>

<template>
  <NavBar />

  <div class="app-body">
    <!-- 左侧边栏（桌面常驻 / 移动端抽屉） -->
    <aside class="sidebar" :class="{ open: sidebarOpen }">
      <SideBar />
    </aside>
    <div v-if="sidebarOpen" class="sidebar-mask" @click="sidebarOpen = false"></div>

    <!-- 内容区：仅渲染内容 -->
    <main class="content">
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" :key="route.path" />
        </transition>
      </router-view>
    </main>
  </div>
</template>
