import { ref } from 'vue'
import { useGameStore, type Screen } from '@/stores/gameStore'
import { useLobbyStore } from '@/stores/lobbyStore'
import { usePeerStore } from '@/stores/peerStore'
import { ticTacToeLogic } from '@/services/gameLogic'
import { GAME_SETTINGS } from '@/utils/settings'
import { createMessage, type Message, type Player, type TicTacToeMove } from '@/types'

export function useGameMaster(gameCode: string) {
  const gameStore = useGameStore()
  const lobbyStore = useLobbyStore()
  const peerStore = usePeerStore()

  const gameStarted = ref(false)

  async function initialize() {
    await peerStore.initializeAsGM(gameCode)
    peerStore.setOnMessage((msg: unknown) => handleMessage(msg as Message))
    peerStore.setOnPlayerDisconnected(handlePlayerPeerDisconnected)
  }

  function handlePlayerPeerDisconnected(peerId: string) {
    console.log('Player peer disconnected:', peerId)

    const player =
      lobbyStore.lobby.find((p) => p.peerId === peerId) ||
      lobbyStore.queue.find((p) => p.peerId === peerId)
    if (player) {
      lobbyStore.removeFromLobby(player.id)
      lobbyStore.removeFromQueue(peerId)
      peerStore.broadcast(
        createMessage('lobby-update', { lobby: lobbyStore.lobby, queue: lobbyStore.queue }),
      )
    }

    const activePlayer = gameStore.players.find((p) => p.peerId === peerId)
    if (activePlayer) {
      gameStore.players = gameStore.players.filter((p) => p.peerId !== peerId)

      const remainingPlayer = gameStore.players[0]
      if (remainingPlayer) {
        gameStore.winner = remainingPlayer.symbol
        gameStore.status = 'finished'
        peerStore.broadcast(
          createMessage('game-over', {
            gameState: gameStore.gameState,
            winner: remainingPlayer.symbol,
          }),
        )
      }

      peerStore.broadcast(
        createMessage('player-disconnected', {
          playerId: activePlayer.id,
          gamertag: activePlayer.gamertag,
        }),
      )
    }
  }

  function handleMessage(message: Message) {
    switch (message.type) {
      case 'join-request':
        handleJoinRequest(message)
        break
      case 'move-command':
        handleMoveCommand(message)
        break
    }
  }

  function handleJoinRequest(message: Extract<Message, { type: 'join-request' }>) {
    if (gameStarted.value) {
      peerStore.send(
        message.peerId,
        createMessage('join-rejected', { reason: 'Game already started' }),
      )
      return
    }

    if (lobbyStore.lobby.length >= GAME_SETTINGS.PLAYER_COUNT) {
      peerStore.send(message.peerId, createMessage('join-rejected', { reason: 'Lobby is full' }))
      return
    }

    const { gamertag, peerId } = message
    const player: Player = {
      id: crypto.randomUUID(),
      peerId,
      gamertag,
      symbol: 'X',
      connected: true,
    }
    lobbyStore.addToQueue(player)
  }

  function handleMoveCommand(message: Extract<Message, { type: 'move-command' }>) {
    if (!gameStore.gameState) return

    const { playerId, move } = message
    const player = gameStore.players.find((p) => p.id === playerId)
    if (!player) {
      peerStore.send(
        playerId,
        createMessage('move-result', { ok: false, error: 'Player not found' }),
      )
      return
    }

    const result = ticTacToeLogic.validateMove(gameStore.gameState, playerId, move as TicTacToeMove)
    if (!result.valid || !result.newState) {
      peerStore.send(
        player.peerId,
        createMessage('move-result', { ok: false, error: result.error }),
      )
      return
    }

    gameStore.setGameState(result.newState)
    peerStore.send(player.peerId, createMessage('move-result', { ok: true }))
    peerStore.broadcast(createMessage('state-update', { gameState: result.newState }))

    if (result.winner !== null) {
      peerStore.broadcast(
        createMessage('game-over', { gameState: result.newState, winner: result.winner }),
      )
      gameStore.currentScreen = 'game-over' as Screen
    } else if (result.newState.currentTurn) {
      const nextPlayer = gameStore.players.find((p) => p.symbol === result.newState!.currentTurn)
      if (nextPlayer) {
        peerStore.send(
          nextPlayer.peerId,
          createMessage('your-turn', { gameState: result.newState }),
        )
      }
    }
  }

  function acceptPlayer(peerId: string) {
    const player = lobbyStore.queue.find((p) => p.peerId === peerId)
    if (!player) return

    player.symbol = lobbyStore.lobby.length === 0 ? 'X' : 'O'
    lobbyStore.acceptPlayer(peerId)
    peerStore.send(peerId, createMessage('join-accepted', { player, inLobby: true }))
    peerStore.broadcast(
      createMessage('lobby-update', { lobby: lobbyStore.lobby, queue: lobbyStore.queue }),
    )
  }

  function rejectPlayer(peerId: string) {
    lobbyStore.rejectPlayer(peerId)
    peerStore.send(
      peerId,
      createMessage('join-rejected', { reason: 'Game full or request rejected by GM' }),
    )
  }

  function startGame() {
    if (lobbyStore.lobby.length < GAME_SETTINGS.PLAYER_COUNT) {
      gameStore.error = 'Need at least 2 players to start'
      return
    }

    gameStarted.value = true
    lobbyStore.startGame()
    gameStore.initializeGame([...lobbyStore.lobby], gameCode)
    peerStore.broadcast(createMessage('game-started', { gameState: gameStore.gameState }))
    gameStore.currentScreen = 'game' as Screen
  }

  return {
    initialize,
    acceptPlayer,
    rejectPlayer,
    startGame,
    gameStarted,
  }
}
