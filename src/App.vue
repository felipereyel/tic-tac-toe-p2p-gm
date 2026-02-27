<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useGameStore } from '@/stores/gameStore'
import { useLobbyStore } from '@/stores/lobbyStore'
import { usePeerStore } from '@/stores/peerStore'
import { useGameMaster } from '@/composables/useGameMaster'
import { usePlayer } from '@/composables/usePlayer'
import { useBeforeUnload } from '@/composables/useBeforeUnload'
import MainMenu from '@/components/MainMenu.vue'
import CreateGame from '@/components/CreateGame.vue'
import JoinGame from '@/components/JoinGame.vue'
import LobbyView from '@/components/LobbyView.vue'
import GameBoard from '@/components/GameBoard.vue'
import ToastNotification from '@/components/ToastNotification.vue'

const gameStore = useGameStore()
const lobbyStore = useLobbyStore()
const peerStore = usePeerStore()

const generatedCode = ref('')
const joinCode = ref('')
const joinTag = ref('')
const codeToJoin = ref('')
const playerComposable = ref<ReturnType<typeof usePlayer> | null>(null)
const gmComposable = ref<ReturnType<typeof useGameMaster> | null>(null)
const isConnecting = ref(false)
const isWaitingForApproval = ref(false)
const connectionError = ref('')
const toastMessage = ref('')
const toastType = ref<'error' | 'success' | 'info'>('error')

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

useBeforeUnload(() => currentScreen.value !== 'main')

onMounted(() => {
  const params = new URLSearchParams(window.location.search)
  const code = params.get('code')
  const isPlayer = params.get('is_player')

  if (code && isPlayer === 'true') {
    codeToJoin.value = code.toUpperCase()
    window.history.replaceState({}, '', window.location.pathname)
  }
})

watch(connectionError, (newError) => {
  if (newError && currentScreen.value === 'join') {
    toastMessage.value = newError
    toastType.value = 'error'
  }
})

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

function startJoin() {
  peerStore.resetAll()
  isWaitingForApproval.value = false
  isConnecting.value = false
  connectionError.value = ''
  toastMessage.value = ''
  joinCode.value = ''
  joinTag.value = ''
  gameStore.currentScreen = 'join'
}

function startJoinWithCode(code: string) {
  peerStore.resetAll()
  isWaitingForApproval.value = false
  isConnecting.value = false
  connectionError.value = ''
  toastMessage.value = ''
  joinCode.value = code
  joinTag.value = ''
  gameStore.currentScreen = 'join'
  gameStore.setAsPlayer('')
  playerComposable.value = usePlayer(code, '', (error) => {
    connectionError.value = error
    toastMessage.value = error
    toastType.value = 'error'
  })
}

watch(codeToJoin, (code) => {
  if (code) {
    startJoinWithCode(code)
  }
})

async function joinGame(code: string, tag: string) {
  joinCode.value = code
  joinTag.value = tag
  gameStore.setAsPlayer('')
  isConnecting.value = true
  isWaitingForApproval.value = false
  connectionError.value = ''
  toastMessage.value = ''

  playerComposable.value = usePlayer(code, tag, (error) => {
    connectionError.value = error
    toastMessage.value = error
    toastType.value = 'error'
  })

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

function handleStopGame() {
  gmComposable.value?.stopGame()
  goBack()
}

function handleToast(message: string, type: 'error' | 'success' | 'info') {
  toastMessage.value = message
  toastType.value = type
}

function goBack() {
  gameStore.reset()
  lobbyStore.clearLobby()
  peerStore.resetAll()
  generatedCode.value = ''
  joinCode.value = ''
  joinTag.value = ''
  playerComposable.value = null
  gmComposable.value = null
  isConnecting.value = false
  isWaitingForApproval.value = false
  connectionError.value = ''
  toastMessage.value = ''
}
</script>

<template>
  <div class="app">
    <ToastNotification
      v-if="toastMessage"
      :message="toastMessage"
      :type="toastType"
      :duration="4000"
    />
    <MainMenu v-if="currentScreen === 'main'" @create="createGame" @join="startJoin" />

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
      @toast="handleToast"
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
      :is-g-m="isGM"
      @move="handleMove"
      @play-again="goBack"
      @stop-game="handleStopGame"
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
