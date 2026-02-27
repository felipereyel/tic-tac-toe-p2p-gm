<template>
  <div class="create-game">
    <h1>Create Game</h1>

    <div v-if="!gameCode" class="loading">
      <p>Generating game...</p>
    </div>

    <div v-else class="game-info">
      <p class="label">Share this code with players:</p>
      <div class="code-display">{{ gameCode }}</div>

      <button @click="copyLink" class="btn-copy-link">Copy Game Link</button>

      <div class="lobby-section">
        <h2>Lobby</h2>
        <div v-if="lobby.length === 0" class="empty">No players yet</div>
        <ul v-else class="player-list">
          <li v-for="player in lobby" :key="player.id">
            {{ player.gamertag }} ({{ player.symbol }})
          </li>
        </ul>

        <h2>Queue</h2>
        <div v-if="queue.length === 0" class="empty">No players waiting</div>
        <ul v-else class="player-list queue">
          <li v-for="player in queue" :key="player.id">
            <span>{{ player.gamertag }}</span>
            <div class="actions">
              <button @click="$emit('accept', player.peerId)" class="btn-accept">Accept</button>
              <button @click="$emit('reject', player.peerId)" class="btn-reject">Reject</button>
            </div>
          </li>
        </ul>
      </div>

      <div class="controls">
        <button
          @click="$emit('start')"
          :disabled="lobby.length < MIN_PLAYERS"
          class="btn-start"
          :class="{ ready: lobby.length >= MIN_PLAYERS }"
        >
          Start Game
        </button>
        <button @click="$emit('back')" class="btn-back">Back</button>
      </div>

      <p v-if="error" class="error">{{ error }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Player } from '@/types'
import { GAME_SETTINGS } from '@/utils/settings'

const props = defineProps<{
  gameCode: string
  lobby: Player[]
  queue: Player[]
  error?: string
}>()

const MIN_PLAYERS = GAME_SETTINGS.PLAYER_COUNT

const emit = defineEmits<{
  accept: [peerId: string]
  reject: [peerId: string]
  start: []
  back: []
  toast: [message: string, type: 'error' | 'success' | 'info']
}>()

const gameLink = computed(() => {
  return `${window.location.origin}/?code=${props.gameCode}&is_player=true`
})

function copyLink() {
  navigator.clipboard
    .writeText(gameLink.value)
    .then(() => {
      emit('toast', 'Link copied!', 'success')
    })
    .catch(() => {
      emit('toast', 'Failed to copy link', 'error')
    })
}
</script>

<style scoped>
.create-game {
  max-width: 600px;
  margin: 0 auto;
  padding: 2rem;
}

h1 {
  text-align: center;
  margin-bottom: 2rem;
}

.loading {
  text-align: center;
  padding: 2rem;
}

.label {
  text-align: center;
  margin-bottom: 0.5rem;
}

.code-display {
  font-size: 2.5rem;
  font-weight: bold;
  font-family: 'Courier New', Courier, monospace;
  text-align: center;
  letter-spacing: 0.3em;
  padding: 1rem 2rem;
  background: #2c3e50;
  color: #42b883;
  border-radius: 8px;
  margin-bottom: 1rem;
  border: 2px solid #42b883;
}

.btn-copy-link {
  display: block;
  width: 100%;
  margin-bottom: 2rem;
  padding: 0.6rem;
  font-size: 0.875rem;
  background-color: transparent;
  color: #42b883;
  border: 2px solid #42b883;
  border-radius: 6px;
  cursor: pointer;
  transition:
    background-color 0.2s,
    color 0.2s;
}

.btn-copy-link:hover {
  background-color: #42b883;
  color: white;
}

.lobby-section h2 {
  font-size: 1.25rem;
  margin: 1.5rem 0 0.5rem;
  border-bottom: 1px solid var(--color-border, #ddd);
  padding-bottom: 0.25rem;
}

.empty {
  color: var(--color-text, #666);
  font-style: italic;
  padding: 0.5rem;
}

.player-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.player-list li {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem;
  border-bottom: 1px solid var(--color-border, #eee);
}

.player-list.queue li {
  flex-wrap: wrap;
}

.actions {
  display: flex;
  gap: 0.5rem;
}

.btn-accept,
.btn-reject {
  padding: 0.25rem 0.75rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.875rem;
}

.btn-accept {
  background-color: #42b883;
  color: white;
}

.btn-reject {
  background-color: #e74c3c;
  color: white;
}

.controls {
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
  justify-content: center;
}

.btn-start,
.btn-back {
  padding: 0.75rem 2rem;
  font-size: 1rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}

.btn-start {
  background-color: #42b883;
  color: white;
}

.btn-start:disabled {
  background-color: #a0dcc4;
  cursor: not-allowed;
}

.btn-start.ready {
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(66, 184, 131, 0.7);
  }
  70% {
    box-shadow: 0 0 0 10px rgba(66, 184, 131, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(66, 184, 131, 0);
  }
}

.btn-back {
  background-color: #95a5a6;
  color: white;
}

.error {
  color: #e74c3c;
  text-align: center;
  margin-top: 1rem;
}
</style>
