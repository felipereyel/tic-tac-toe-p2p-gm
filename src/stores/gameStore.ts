import { defineStore } from 'pinia'
import { ref, computed, type Ref } from 'vue'
import type { Board, GameState, Player, PlayerSymbol } from '@/types'

export type Screen = 'main' | 'create' | 'join' | 'lobby' | 'game' | 'game-over'

export const useGameStore = defineStore('game', () => {
  const board: Ref<Board> = ref([null, null, null, null, null, null, null, null, null])
  const currentTurn: Ref<PlayerSymbol | null> = ref(null)
  const players: Ref<Player[]> = ref([])
  const winner: Ref<PlayerSymbol | 'draw' | null> = ref(null)
  const status: Ref<GameState['status']> = ref('waiting')
  const gameCode: Ref<string> = ref('')
  const currentScreen: Ref<Screen> = ref('main')

  const myPlayerId: Ref<string | null> = ref(null)
  const mySymbol: Ref<PlayerSymbol | null> = ref(null)
  const isGM: Ref<boolean> = ref(false)
  const error: Ref<string | null> = ref(null)

  const isMyTurn = computed(() => {
    if (!myPlayerId.value || !currentTurn.value) return false
    const me = players.value.find((p) => p.id === myPlayerId.value)
    return me?.symbol === currentTurn.value
  })

  const gameState = computed<GameState>(() => ({
    board: board.value,
    currentTurn: currentTurn.value,
    players: players.value,
    winner: winner.value,
    status: status.value,
    gameCode: gameCode.value,
  }))

  function reset() {
    board.value = [null, null, null, null, null, null, null, null, null]
    currentTurn.value = null
    players.value = []
    winner.value = null
    status.value = 'waiting'
    gameCode.value = ''
    currentScreen.value = 'main'
    myPlayerId.value = null
    mySymbol.value = null
    isGM.value = false
    error.value = null
  }

  function setGameState(state: GameState) {
    board.value = [...state.board]
    currentTurn.value = state.currentTurn
    players.value = [...state.players]
    winner.value = state.winner
    status.value = state.status
  }

  function setAsGM(code: string) {
    isGM.value = true
    gameCode.value = code
    status.value = 'waiting'
    currentScreen.value = 'create'
  }

  function setAsPlayer(playerId: string) {
    isGM.value = false
    myPlayerId.value = playerId
  }

  function initializeGame(playersList: Player[], code: string) {
    players.value = playersList
    gameCode.value = code
    status.value = 'playing'
    currentTurn.value = 'X'
  }

  return {
    board,
    currentTurn,
    players,
    winner,
    status,
    gameCode,
    currentScreen,
    myPlayerId,
    mySymbol,
    isGM,
    error,
    isMyTurn,
    gameState,
    reset,
    setGameState,
    setAsGM,
    setAsPlayer,
    initializeGame,
  }
})
