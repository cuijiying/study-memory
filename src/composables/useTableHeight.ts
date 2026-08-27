import { BREAKPOINTS } from './useBreakpoint'

/**
 * 动态表格高度 composable
 *
 * 根据视口高度减去固定偏移量计算 el-table 的 height 属性。
 * 手机端偏移量更小（顶栏更紧凑、无侧栏），桌面端偏移量更大。
 *
 * @param desktopOffset - 桌面端顶部占用高度（header + filters + pagination 等），默认 280px
 * @param mobileOffset - 手机端顶部占用高度，默认 220px
 */
export function useTableHeight(desktopOffset = 280, mobileOffset = 220) {
  /** 根据当前视口宽度选择偏移量 */
  const getOffset = () =>
    window.innerWidth < BREAKPOINTS.sm ? mobileOffset : desktopOffset

  const tableHeight = ref(`${window.innerHeight - getOffset()}px`)

  const updateTableHeight = () => {
    tableHeight.value = `${window.innerHeight - getOffset()}px`
  }

  onMounted(() => {
    updateTableHeight()
    window.addEventListener('resize', updateTableHeight, { passive: true })
  })

  onBeforeUnmount(() => {
    window.removeEventListener('resize', updateTableHeight)
  })

  return { tableHeight }
}
