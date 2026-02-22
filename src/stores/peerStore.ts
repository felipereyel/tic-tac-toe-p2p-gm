import { defineStore } from 'pinia'
import { ref } from 'vue'
import { usePeerService } from '@/services/peerService'
import { createGMPeerId, createPlayerPeerId, isValidPeerIdForGame, createMessage } from '@/types'
import { useLobbyStore } from '@/stores/lobbyStore'
import { useGameStore } from '@/stores/gameStore'

export const usePeerStore = defineStore('peer', () => {
  const {
    peer,
    connections,
    status,
    error,
    configure,
    connect,
    connectToPeer,
    send,
    broadcast,
    disconnect,
  } = usePeerService()

  const gamertag = ref('')
  const gameCode = ref('')
  let onMessageCallback: ((msg: unknown) => void) | null = null
  let onGMDisconnectedCallback: (() => void) | null = null
  let onPeerDisconnectedCallback: (() => void) | null = null

  function setOnMessage(callback: (msg: unknown) => void) {
    onMessageCallback = callback
  }

  function setOnGMDisconnected(callback: () => void) {
    onGMDisconnectedCallback = callback
  }

  function setOnPeerDisconnected(callback: () => void) {
    onPeerDisconnectedCallback = callback
  }

  function initializeAsGM(code: string) {
    gameCode.value = code
    const peerId = createGMPeerId(code)

    console.log('Initializing as GM with code:', code)
    configure({
      onConnection: (conn) => {
        if (!isValidPeerIdForGame(conn.peer, code)) {
          console.log('Rejecting invalid peer:', conn.peer)
          conn.close()
          return
        }
        console.log('Player connected:', conn.peer)
      },
      onDisconnection: (conn) => {
        console.log('Player disconnected:', conn.peer)
        const lobbyStore = useLobbyStore()
        const gameStore = useGameStore()

        const player =
          lobbyStore.lobby.find((p) => p.peerId === conn.peer) ||
          lobbyStore.queue.find((p) => p.peerId === conn.peer)
        if (player) {
          lobbyStore.removeFromLobby(player.id)
          lobbyStore.removeFromQueue(conn.peer)
          broadcast(
            createMessage('lobby-update', {
              lobby: lobbyStore.lobby,
              queue: lobbyStore.queue,
            }),
          )
        }

        const activePlayer = gameStore.players.find((p) => p.peerId === conn.peer)
        if (activePlayer) {
          gameStore.players = gameStore.players.filter((p) => p.peerId !== conn.peer)
          broadcast(
            createMessage('player-disconnected', {
              playerId: activePlayer.id,
              gamertag: activePlayer.gamertag,
            }),
          )
        }
      },
      onMessage: (conn, message) => {
        console.log('Message from player:', conn.peer, message)
        if (onMessageCallback) {
          onMessageCallback(message)
        }
      },
      onError: (err) => {
        console.error('Connection error:', err)
      },
      onPeerDisconnected: () => {
        console.log('GM peer disconnected from signaling server')
        if (onPeerDisconnectedCallback) {
          onPeerDisconnectedCallback()
        }
      },
    })
    return connect(peerId)
  }

  async function initializeAsPlayer(code: string, tag: string) {
    gameCode.value = code
    gamertag.value = tag
    const myPeerId = createPlayerPeerId(code, tag)

    console.log('Initializing as player:', tag, 'with code:', code)

    configure({
      onConnection: () => {
        console.log('Connected to GM')
      },
      onDisconnection: () => {
        console.log('Disconnected from GM')
        if (onGMDisconnectedCallback) {
          onGMDisconnectedCallback()
        }
      },
      onMessage: (_conn, message) => {
        console.log('Message from GM:', message)
        if (onMessageCallback) {
          onMessageCallback(message)
        }
      },
      onError: (err) => {
        console.error('Connection error:', err)
      },
      onPeerDisconnected: () => {
        console.log('Player peer disconnected from signaling server')
        if (onGMDisconnectedCallback) {
          onGMDisconnectedCallback()
        }
      },
    })

    try {
      await connect(myPeerId)
      await connectToPeer(createGMPeerId(code))
      console.log('Successfully connected to GM')
    } catch (err) {
      console.error('Failed to connect to GM:', err)
      throw err
    }
  }

  return {
    peer,
    connections,
    status,
    error,
    gamertag,
    gameCode,
    configure,
    connect,
    connectToPeer,
    send,
    broadcast,
    disconnect,
    initializeAsGM,
    initializeAsPlayer,
    setOnMessage,
    setOnGMDisconnected,
    setOnPeerDisconnected,
  }
})
