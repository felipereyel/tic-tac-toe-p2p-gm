import { watch, onUnmounted } from 'vue'

export function useBeforeUnload(enabled: () => boolean) {
  function handleBeforeUnload(e: BeforeUnloadEvent) {
    if (!enabled()) return

    e.preventDefault()
    e.returnValue = ''
    return ''
  }

  watch(
    enabled,
    (newVal) => {
      if (!newVal) {
        window.removeEventListener('beforeunload', handleBeforeUnload)
      } else {
        window.addEventListener('beforeunload', handleBeforeUnload)
      }
    },
    { immediate: true },
  )

  onUnmounted(() => {
    window.removeEventListener('beforeunload', handleBeforeUnload)
  })
}
