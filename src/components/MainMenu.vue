<template>
  <div class="main-menu">
    <h1>Tic-Tac-Toe P2P</h1>
    <p class="subtitle">Play with friends, no server needed!</p>

    <div class="buttons">
      <button @click="$emit('create')" class="btn-primary">Create Game</button>
      <button @click="$emit('join')" class="btn-secondary">Join Game</button>
    </div>
  </div>
</template>

<script setup lang="ts">
defineEmits<{
  create: []
  join: []
}>()
</script>

<style scoped>
.main-menu {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  text-align: center;
  padding: 2rem;
}

h1 {
  font-size: 3rem;
  margin-bottom: 0.5rem;
  color: var(--color-heading);
}

.subtitle {
  color: var(--color-text);
  margin-bottom: 3rem;
  opacity: 0.8;
}

.buttons {
  display: flex;
  gap: 1.5rem;
}

.btn-primary,
.btn-secondary {
  padding: 1rem 2.5rem;
  font-size: 1.25rem;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition:
    transform 0.2s,
    box-shadow 0.2s;
}

.btn-primary {
  background-color: var(--color-primary, #42b883);
  color: white;
}

.btn-secondary {
  background-color: var(--color-secondary, #35495e);
  color: white;
}

.btn-primary:hover,
.btn-secondary:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}
</style>
