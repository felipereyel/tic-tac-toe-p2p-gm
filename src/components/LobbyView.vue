<template>
  <div class="lobby-view">
    <h1>Lobby</h1>

    <div v-if="isGM" class="gm-info">
      <p class="label">Share this code with players:</p>
      <div class="code-display">{{ gameCode }}</div>

      <div class="lobby-section">
        <h2>Players ({{ lobby.length }}/2)</h2>
        <div v-if="lobby.length === 0" class="empty">Waiting for players...</div>
        <ul v-else class="player-list">
          <li v-for="player in lobby" :key="player.id">
            {{ player.gamertag }} ({{ player.symbol }})
            <span v-if="player.symbol === mySymbol" class="you-badge">You</span>
          </li>
        </ul>
      </div>

      <button @click="$emit('start')" :disabled="lobby.length < 2" class="btn-start">
        Start Game
      </button>
    </div>

    <div v-else class="player-info">
      <p>Waiting for game to start...</p>

      <div class="lobby-section">
        <h2>Players ({{ lobby.length }}/2)</h2>
        <ul v-if="lobby.length > 0" class="player-list">
          <li v-for="player in lobby" :key="player.id">
            {{ player.gamertag }} ({{ player.symbol }})
            <span v-if="player.symbol === mySymbol" class="you-badge">You</span>
          </li>
        </ul>
        <div v-else class="empty">Waiting for players...</div>
      </div>

      <p class="waiting-text">Waiting for Game Master to start the game...</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Player, PlayerSymbol } from '@/types'

defineProps<{
  gameCode: string
  lobby: Player[]
  isGM: boolean
  mySymbol?: PlayerSymbol | null
}>()

defineEmits<{
  start: []
}>()
</script>

<style scoped>
.lobby-view {
  max-width: 500px;
  margin: 0 auto;
  padding: 2rem;
  text-align: center;
}

h1 {
  margin-bottom: 1.5rem;
}

.label {
  margin-bottom: 0.5rem;
}

.code-display {
  font-size: 2rem;
  font-weight: bold;
  letter-spacing: 0.2em;
  padding: 0.75rem;
  background: var(--color-bg, #f5f5f5);
  border-radius: 8px;
  margin-bottom: 2rem;
}

.lobby-section {
  margin-bottom: 2rem;
}

.lobby-section h2 {
  font-size: 1.25rem;
  margin-bottom: 0.75rem;
}

.empty {
  color: var(--color-text, #666);
  font-style: italic;
  padding: 1rem;
}

.player-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.player-list li {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem;
  border-bottom: 1px solid var(--color-border, #eee);
}

.you-badge {
  font-size: 0.75rem;
  padding: 0.125rem 0.5rem;
  background: #42b883;
  color: white;
  border-radius: 10px;
}

.btn-start {
  padding: 0.75rem 2rem;
  font-size: 1rem;
  background-color: #42b883;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}

.btn-start:disabled {
  background-color: #a0dcc4;
  cursor: not-allowed;
}

.waiting-text {
  color: var(--color-text, #666);
  margin-top: 1rem;
}
</style>
