import { defineStore } from 'pinia'
import { ref } from 'vue'
import { usePeerService } from '@/services/peerService'
import { createGMPeerId, createPlayerPeerId, isValidPeerIdForGame } from '@/types'

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
  let onPlayerDisconnectedCallback: ((peerId: string) => void) | null = null

  function setOnMessage(callback: (msg: unknown) => void) {
    onMessageCallback = callback
  }

  function setOnGMDisconnected(callback: () => void) {
    onGMDisconnectedCallback = callback
  }

  function setOnPeerDisconnected(callback: () => void) {
    onPeerDisconnectedCallback = callback
  }

  function setOnPlayerDisconnected(callback: (peerId: string) => void) {
    onPlayerDisconnectedCallback = callback
  }

  function resetAll() {
    onMessageCallback = null
    onGMDisconnectedCallback = null
    onPeerDisconnectedCallback = null
    onPlayerDisconnectedCallback = null
    gamertag.value = ''
    gameCode.value = ''
    disconnect()
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
        if (onPlayerDisconnectedCallback) {
          onPlayerDisconnectedCallback(conn.peer)
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
    setOnPlayerDisconnected,
    resetAll,
  }
})
