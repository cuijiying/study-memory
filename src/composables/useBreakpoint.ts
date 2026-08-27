import { ref, computed, onMounted, onBeforeUnmount } from 'vue'

/**
 * 响应式断点常量 — 与 src/styles/variables.scss 中定义保持一致
 * 修改断点时请同步更新 SCSS 变量与 theme.css 中的 @media 查询
 */
export const BREAKPOINTS = {
  /** 手机端上限（不含）：< 768px */
  sm: 768,
  /** 平板端上限（不含）：< 992px */
  md: 992,
  /** 桌面端宽屏：< 1200px */
  lg: 1200,
} as const

/**
 * 响应式断点检测 composable
 *
 * 通过监听 window resize 事件，实时判断当前视口属于手机 / 平板 / 桌面。
 * 用于在 JS 层切换表格与卡片列表、调整 Dialog 宽度等逻辑。
 *
 * @example
 * const { isMobile, isDesktop } = useBreakpoint()
 * // 模板中：v-if="isMobile" 显示卡片，v-else 显示表格
 */
export function useBreakpoint() {
  /** 当前视口宽度（px） */
  const windowWidth = ref(typeof window !== 'undefined' ? window.innerWidth : BREAKPOINTS.lg)

  /** 更新视口宽度 */
  const updateWidth = () => {
    windowWidth.value = window.innerWidth
  }

  onMounted(() => {
    updateWidth()
    window.addEventListener('resize', updateWidth, { passive: true })
  })

  onBeforeUnmount(() => {
    window.removeEventListener('resize', updateWidth)
  })

  /** 手机端：宽度 < 768px */
  const isMobile = computed(() => windowWidth.value < BREAKPOINTS.sm)

  /** 平板端（含手机）：宽度 < 992px */
  const isTablet = computed(() => windowWidth.value < BREAKPOINTS.md)

  /** 桌面端：宽度 >= 992px */
  const isDesktop = computed(() => windowWidth.value >= BREAKPOINTS.md)

  return {
    windowWidth,
    isMobile,
    isTablet,
    isDesktop,
    BREAKPOINTS,
  }
}
