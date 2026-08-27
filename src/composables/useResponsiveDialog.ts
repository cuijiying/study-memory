import { computed } from 'vue'
import { useBreakpoint } from './useBreakpoint'

/**
 * 响应式 Dialog 宽度 composable
 *
 * 手机端使用接近全屏的宽度（92%），桌面端使用传入的固定宽度。
 * 配合 Element Plus el-dialog 的 width 属性使用。
 *
 * @param desktopWidth - 桌面端 Dialog 宽度，默认 '50%'
 *
 * @example
 * const { dialogWidth } = useResponsiveDialog('500px')
 * // <el-dialog :width="dialogWidth" />
 */
export function useResponsiveDialog(desktopWidth = '50%') {
  const { isMobile } = useBreakpoint()

  /** 根据设备类型返回合适的 Dialog 宽度 */
  const dialogWidth = computed(() => (isMobile.value ? '92%' : desktopWidth))

  /** 手机端是否使用全屏 Dialog（可选，用于复杂表单） */
  const dialogFullscreen = computed(() => isMobile.value)

  return {
    dialogWidth,
    dialogFullscreen,
    isMobile,
  }
}

/**
 * 响应式分页 layout composable
 *
 * 手机端简化分页控件（去掉 total、sizes、jumper），避免小屏横向溢出。
 *
 * @example
 * const { paginationLayout } = usePaginationLayout()
 * // <el-pagination :layout="paginationLayout" />
 */
export function usePaginationLayout() {
  const { isMobile } = useBreakpoint()

  /** 桌面端完整分页 / 手机端精简分页 */
  const paginationLayout = computed(() =>
    isMobile.value ? 'prev, pager, next' : 'total, sizes, prev, pager, next, jumper',
  )

  return { paginationLayout, isMobile }
}
