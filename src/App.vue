<script setup lang="ts">
import { ref, computed } from 'vue'
import { useGameStore } from '@/stores/gameStore'
import { useLobbyStore } from '@/stores/lobbyStore'
import { usePeerStore } from '@/stores/peerStore'
import { useGameMaster } from '@/composables/useGameMaster'
import { usePlayer } from '@/composables/usePlayer'
import MainMenu from '@/components/MainMenu.vue'
import CreateGame from '@/components/CreateGame.vue'
import JoinGame from '@/components/JoinGame.vue'
import LobbyView from '@/components/LobbyView.vue'
import GameBoard from '@/components/GameBoard.vue'

const gameStore = useGameStore()
const lobbyStore = useLobbyStore()
const peerStore = usePeerStore()

const generatedCode = ref('')
const joinCode = ref('')
const joinTag = ref('')
const playerComposable = ref<ReturnType<typeof usePlayer> | null>(null)
const gmComposable = ref<ReturnType<typeof useGameMaster> | null>(null)
const isConnecting = ref(false)
const isWaitingForApproval = ref(false)
const connectionError = ref('')

const currentScreen = computed(() => gameStore.currentScreen)
const isGM = computed(() => gameStore.isGM)
const mySymbol = computed(() => gameStore.mySymbol)

const lobby = computed(() => lobbyStore.lobby)
const queue = computed(() => lobbyStore.queue)
const gameError = computed(() => gameStore.error)

const board = computed(() => gameStore.board)
const currentTurn = computed(() => gameStore.currentTurn)
const players = computed(() => gameStore.players)
const winner = computed(() => gameStore.winner)
const isMyTurn = computed(() => gameStore.isMyTurn)

async function createGame() {
  const code = generateCode()
  generatedCode.value = code
  gameStore.setAsGM(code)

  gmComposable.value = useGameMaster(code)
  await gmComposable.value?.initialize()
}

function generateCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  let code = ''
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}

async function joinGame(code: string, tag: string) {
  joinCode.value = code
  joinTag.value = tag
  gameStore.setAsPlayer('')
  isConnecting.value = true
  isWaitingForApproval.value = false
  connectionError.value = ''

  playerComposable.value = usePlayer(code, tag)

  try {
    await playerComposable.value?.connectToGameMaster()
    isConnecting.value = false
    isWaitingForApproval.value = true
  } catch (err) {
    connectionError.value = `Failed to connect: ${(err as Error).message}`
    isConnecting.value = false
    isWaitingForApproval.value = false
  }
}

function handleAcceptPlayer(peerId: string) {
  gmComposable.value?.acceptPlayer(peerId)
}

function handleRejectPlayer(peerId: string) {
  gmComposable.value?.rejectPlayer(peerId)
}

function handleStartGame() {
  gmComposable.value?.startGame()
}

function handleMove(position: number) {
  playerComposable.value?.makeMove(position)
}

function goBack() {
  gameStore.reset()
  lobbyStore.clearLobby()
  peerStore.disconnect()
  generatedCode.value = ''
  joinCode.value = ''
  joinTag.value = ''
  playerComposable.value = null
  gmComposable.value = null
  isConnecting.value = false
  isWaitingForApproval.value = false
  connectionError.value = ''
}
</script>

<template>
  <div class="app">
    <MainMenu
      v-if="currentScreen === 'main'"
      @create="createGame"
      @join="gameStore.currentScreen = 'join'"
    />

    <CreateGame
      v-else-if="currentScreen === 'create'"
      :game-code="generatedCode"
      :lobby="lobby"
      :queue="queue"
      :error="gameError ?? undefined"
      @accept="handleAcceptPlayer"
      @reject="handleRejectPlayer"
      @start="handleStartGame"
      @back="goBack"
    />

    <JoinGame
      v-else-if="currentScreen === 'join'"
      :is-connecting="isConnecting"
      :is-waiting="isWaitingForApproval"
      :game-code="joinCode"
      :error="connectionError"
      @join="joinGame"
      @back="goBack"
    />

    <LobbyView
      v-else-if="currentScreen === 'lobby'"
      :game-code="isGM ? generatedCode : joinCode"
      :lobby="lobby"
      :is-g-m="isGM"
      :my-symbol="mySymbol"
      @start="handleStartGame"
    />

    <GameBoard
      v-else-if="currentScreen === 'game'"
      :board="board"
      :current-turn="currentTurn"
      :players="players"
      :winner="winner"
      :is-my-turn="isMyTurn"
      :my-symbol="mySymbol"
      @move="handleMove"
      @play-again="goBack"
    />

    <div v-else class="game-over">
      <h1>Game Over</h1>
      <p v-if="winner === 'draw'">It's a draw!</p>
      <p v-else>Player {{ winner }} wins!</p>
      <button @click="goBack" class="btn-back">Back to Menu</button>
    </div>
  </div>
</template>

<style scoped>
.app {
  min-height: 100vh;
}

.game-over {
  text-align: center;
  padding: 2rem;
}

.game-over h1 {
  margin-bottom: 1rem;
}

.btn-back {
  margin-top: 1rem;
  padding: 0.75rem 2rem;
  font-size: 1rem;
  background-color: #95a5a6;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}
</style>
