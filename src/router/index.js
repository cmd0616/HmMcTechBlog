import { createRouter, createWebHashHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import PostView from '../views/PostView.vue'
import NotFoundView from '../views/NotFoundView.vue'

// hash 路由：GitHub Pages 无需 SPA 回退配置，子路径部署零配置
const router = createRouter({
  history: createWebHashHistory(),
  scrollBehavior(to, from, saved) {
    if (to.hash) return { el: to.hash, top: 80 }
    return saved || { top: 0 }
  },
  routes: [
    // 静态导入：避免 transition(out-in) + 异步组件竞态导致页面停留在 opacity:0
    { path: '/', name: 'home', component: HomeView },
    { path: '/post/:slug', name: 'post', component: PostView },
    { path: '/:pathMatch(.*)*', name: 'not-found', component: NotFoundView },
  ],
})

router.afterEach((to) => {
  if (to.name === 'post' && to.params.slug) {
    document.title = `${decodeURIComponent(to.params.slug)} - HmMc 技术博客`
  } else if (to.name === 'home') {
    document.title = 'HmMc 技术博客'
  }
})

export default router
