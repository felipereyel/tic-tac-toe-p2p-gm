import { ref } from 'vue'
import { useGameStore, type Screen } from '@/stores/gameStore'
import { useLobbyStore } from '@/stores/lobbyStore'
import { usePeerStore } from '@/stores/peerStore'
import type { Player } from '@/types'
import {
  createGMPeerId,
  createPlayerPeerId,
  createMessage,
  type Message,
  type TicTacToeMove,
} from '@/types'

export function usePlayer(gameCode: string, gamertag: string, onError?: (error: string) => void) {
  const gameStore = useGameStore()
  const lobbyStore = useLobbyStore()
  const peerStore = usePeerStore()

  const isConnected = ref(false)
  const connectionError = ref<string | null>(null)
  const gmPeerId = createGMPeerId(gameCode)

  async function connectToGameMaster() {
    try {
      await peerStore.initializeAsPlayer(gameCode, gamertag)
      isConnected.value = true
      peerStore.setOnMessage((msg: unknown) => handleMessage(msg as Message))
      peerStore.setOnGMDisconnected(() => {
        const errorMsg = 'Disconnected from GM'
        connectionError.value = errorMsg
        onError?.(errorMsg)
        isConnected.value = false
        gameStore.currentScreen = 'main' as Screen
      })

      peerStore.send(
        gmPeerId,
        createMessage('join-request', {
          gamertag,
          peerId: createPlayerPeerId(gameCode, gamertag),
        }),
      )
    } catch (err) {
      const errorMsg = `Failed to connect: ${(err as Error).message}`
      connectionError.value = errorMsg
      onError?.(errorMsg)
      isConnected.value = false
    }
  }

  function handleMessage(message: Message) {
    switch (message.type) {
      case 'join-rejected': {
        const rejMsg = message as { reason: string }
        const errorMsg = `Join rejected: ${rejMsg.reason}`
        connectionError.value = errorMsg
        onError?.(errorMsg)
        isConnected.value = false
        gameStore.currentScreen = 'main' as Screen
        break
      }
      case 'join-accepted': {
        const accMsg = message as { player: { id: string; symbol: 'X' | 'O' } }
        gameStore.setAsPlayer(accMsg.player.id)
        gameStore.mySymbol = accMsg.player.symbol
        gameStore.currentScreen = 'lobby' as Screen
        break
      }
      case 'lobby-update': {
        const lobbyMsg = message as { lobby: Player[]; queue: Player[] }
        lobbyStore.lobby.splice(0, lobbyStore.lobby.length, ...lobbyMsg.lobby)
        lobbyStore.queue.splice(0, lobbyStore.queue.length, ...lobbyMsg.queue)
        break
      }
      case 'state-update': {
        const stateMsg = message as { gameState: Parameters<typeof gameStore.setGameState>[0] }
        gameStore.setGameState(stateMsg.gameState)
        break
      }
      case 'your-turn': {
        const turnMsg = message as { gameState: Parameters<typeof gameStore.setGameState>[0] }
        gameStore.currentScreen = 'game' as Screen
        gameStore.setGameState(turnMsg.gameState)
        break
      }
      case 'game-started': {
        const startMsg = message as { gameState: Parameters<typeof gameStore.setGameState>[0] }
        gameStore.currentScreen = 'game' as Screen
        gameStore.setGameState(startMsg.gameState)
        break
      }
      case 'game-over': {
        const overMsg = message as {
          winner: typeof gameStore.winner
          gameState: Parameters<typeof gameStore.setGameState>[0]
        }
        gameStore.currentScreen = 'game-over' as Screen
        gameStore.winner = overMsg.winner
        gameStore.setGameState(overMsg.gameState)
        break
      }
      case 'player-disconnected': {
        const discMsg = message as { playerId: string; gamertag: string }
        gameStore.players = gameStore.players.filter((p) => p.id !== discMsg.playerId)
        break
      }
      case 'game-stopped': {
        onError?.('GM killed the game')
        gameStore.reset()
        gameStore.currentScreen = 'main' as Screen
        break
      }
    }
  }

  function makeMove(position: number) {
    if (!gameStore.myPlayerId) return
    const move: TicTacToeMove = { position }
    peerStore.send(
      gmPeerId,
      createMessage('move-command', {
        playerId: gameStore.myPlayerId,
        move,
      }),
    )
  }

  return {
    isConnected,
    connectionError,
    connectToGameMaster,
    makeMove,
  }
}
