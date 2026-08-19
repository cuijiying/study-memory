export type ThemeMode = 'dark' | 'light'

const STORAGE_KEY = 'study-memory-theme'

export const useThemeStore = defineStore('theme', () => {
  const theme = ref<ThemeMode>('dark')

  const isDark = computed(() => theme.value === 'dark')

  const applyTheme = () => {
    const root = document.documentElement
    root.dataset.theme = theme.value
    root.classList.toggle('dark', theme.value === 'dark')
  }

  const setTheme = (mode: ThemeMode) => {
    theme.value = mode
    localStorage.setItem(STORAGE_KEY, mode)
    applyTheme()
  }

  const toggleTheme = () => {
    setTheme(theme.value === 'dark' ? 'light' : 'dark')
  }

  const initialize = () => {
    const saved = localStorage.getItem(STORAGE_KEY) as ThemeMode | null
    theme.value = saved === 'light' ? 'light' : 'dark'
    applyTheme()
  }

  return {
    theme,
    isDark,
    setTheme,
    toggleTheme,
    initialize,
  }
})

export function initThemeBeforeMount() {
  const saved = localStorage.getItem(STORAGE_KEY)
  const theme = saved === 'light' ? 'light' : 'dark'
  const root = document.documentElement
  root.dataset.theme = theme
  root.classList.toggle('dark', theme === 'dark')
}
