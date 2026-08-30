import { computed } from 'vue'
import { useBreakpoint } from './useBreakpoint'
import { useResponsiveDialog } from './useResponsiveDialog'

/**
 * 移动端表单与 Dialog 统一适配
 *
 * - 手机端：label 顶部对齐、表单项全宽、Dialog 接近全屏并可滚动
 * - 桌面端：label 右侧对齐、固定 label 宽度
 */
export function useMobileForm(desktopLabelWidth = '100px', desktopDialogWidth = '50%') {
  const { isMobile } = useBreakpoint()
  const { dialogWidth, dialogFullscreen } = useResponsiveDialog(desktopDialogWidth)

  const formLabelWidth = computed(() => (isMobile.value ? undefined : desktopLabelWidth))
  const formLabelPosition = computed(() => (isMobile.value ? 'top' : 'right') as 'top' | 'right')
  const formClass = computed(() => (isMobile.value ? 'mobile-form' : ''))

  const dialogClass = computed(() =>
    isMobile.value ? 'responsive-dialog responsive-dialog--mobile' : 'responsive-dialog',
  )

  return {
    isMobile,
    formLabelWidth,
    formLabelPosition,
    formClass,
    dialogWidth,
    dialogFullscreen,
    dialogClass,
  }
}
