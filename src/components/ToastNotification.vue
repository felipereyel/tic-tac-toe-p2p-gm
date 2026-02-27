<template>
  <div v-if="visible" class="toast" :class="type">
    {{ message }}
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

const props = defineProps<{
  message: string
  type?: 'error' | 'success' | 'info'
  duration?: number
}>()

const visible = ref(true)

watch(
  () => props.message,
  () => {
    visible.value = true
    if (props.duration && props.duration > 0) {
      setTimeout(() => {
        visible.value = false
      }, props.duration)
    }
  },
  { immediate: true },
)
</script>

<style scoped>
.toast {
  position: fixed;
  top: 1rem;
  left: 50%;
  transform: translateX(-50%);
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 500;
  z-index: 1000;
  animation: slideDown 0.3s ease;
}

.toast.error {
  background-color: #e74c3c;
  color: white;
}

.toast.success {
  background-color: #42b883;
  color: white;
}

.toast.info {
  background-color: #3498db;
  color: white;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateX(-50%) translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
  }
}
</style>
