import { ref } from 'vue'

const theme = ref(localStorage.getItem('theme') || 'dark')

function apply() {
  document.documentElement.dataset.theme = theme.value
  localStorage.setItem('theme', theme.value)
}
apply()

export function useTheme() {
  function toggle() {
    theme.value = theme.value === 'dark' ? 'light' : 'dark'
    apply()
  }
  return { theme, toggle }
}
