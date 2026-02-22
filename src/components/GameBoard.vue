<template>
  <div class="game-board">
    <h1>Tic-Tac-Toe</h1>

    <div class="status-bar">
      <div v-if="winner" class="winner-display">
        <span v-if="winner === 'draw'">It's a Draw!</span>
        <span v-else>Player {{ winner }} Wins!</span>
      </div>
      <div v-else-if="currentTurn" class="turn-indicator">
        <span v-if="isMyTurn" class="your-turn">Your turn!</span>
        <span v-else class="waiting-turn">Waiting for {{ currentTurn }}...</span>
      </div>
    </div>

    <div class="board" :class="{ disabled: !isMyTurn && currentTurn !== null && winner === null }">
      <button
        v-for="(cell, index) in board"
        :key="index"
        class="cell"
        :class="{ 'x-cell': cell === 'X', 'o-cell': cell === 'O' }"
        :disabled="cell !== null || !isMyTurn || winner !== null"
        @click="$emit('move', index)"
      >
        {{ cell }}
      </button>
    </div>

    <div class="players-info">
      <div class="player" :class="{ active: currentTurn === 'X' }">X: {{ getPlayerName('X') }}</div>
      <div class="player" :class="{ active: currentTurn === 'O' }">O: {{ getPlayerName('O') }}</div>
    </div>

    <button v-if="winner" @click="$emit('playAgain')" class="btn-play-again">Play Again</button>
  </div>
</template>

<script setup lang="ts">
import type { Board, Player, PlayerSymbol } from '@/types'

const props = defineProps<{
  board: Board
  currentTurn: PlayerSymbol | null
  players: Player[]
  winner: PlayerSymbol | 'draw' | null
  isMyTurn: boolean
  mySymbol?: PlayerSymbol | null
}>()

defineEmits<{
  move: [position: number]
  playAgain: []
}>()

function getPlayerName(symbol: 'X' | 'O'): string {
  const player = props.players.find((p) => p.symbol === symbol)
  return player?.gamertag || (symbol === props.mySymbol ? 'You' : 'Waiting...')
}
</script>

<style scoped>
.game-board {
  max-width: 500px;
  margin: 0 auto;
  padding: 2rem;
  text-align: center;
}

h1 {
  margin-bottom: 1rem;
}

.status-bar {
  margin-bottom: 1.5rem;
  min-height: 2rem;
}

.winner-display {
  font-size: 1.5rem;
  font-weight: bold;
  color: #42b883;
}

.status-bar {
  min-height: 3rem;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1.5rem;
}

.turn-indicator {
  font-size: 1.25rem;
}

.your-turn {
  color: #42b883;
  font-weight: bold;
  font-size: 1.5rem;
}

.waiting-turn {
  color: #e74c3c;
  font-weight: bold;
}

.board {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  max-width: 320px;
  margin: 0 auto 2rem;
}

.board.disabled {
  cursor: not-allowed;
}

.board.disabled .cell {
  cursor: not-allowed;
}

.cell {
  aspect-ratio: 1;
  font-size: 2rem;
  font-weight: bold;
  line-height: 1;
  border: 2px solid var(--color-border, #ddd);
  border-radius: 8px;
  background: var(--color-bg, #f9f9f9);
  cursor: pointer;
  transition:
    background-color 0.2s,
    transform 0.1s;
  -webkit-tap-highlight-color: transparent;
  user-select: none;
  -webkit-user-select: none;
}

.cell:not(:disabled):hover {
  background: var(--color-bg-hover, #eee);
}

.cell:active {
  transform: scale(0.98);
}

.cell:disabled {
  cursor: default;
}

.cell.x-cell {
  color: #e74c3c;
}

.cell.o-cell {
  color: #3498db;
}

.players-info {
  display: flex;
  justify-content: center;
  gap: 2rem;
  margin-bottom: 2rem;
}

.player {
  padding: 0.5rem 1rem;
  border-radius: 4px;
  opacity: 0.6;
}

.player.active {
  opacity: 1;
  background: var(--color-primary, #42b883);
  color: white;
}

.btn-play-again {
  padding: 0.75rem 2rem;
  font-size: 1rem;
  background-color: #42b883;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}
</style>
