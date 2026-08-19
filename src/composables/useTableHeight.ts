export function useTableHeight(offset = 280) {
  const tableHeight = ref(`${window.innerHeight - offset}px`)

  const updateTableHeight = () => {
    tableHeight.value = `${window.innerHeight - offset}px`
  }

  onMounted(() => {
    updateTableHeight()
    window.addEventListener('resize', updateTableHeight)
  })

  onBeforeUnmount(() => {
    window.removeEventListener('resize', updateTableHeight)
  })

  return { tableHeight }
}
