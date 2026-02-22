import { defineStore } from 'pinia'
import { ref } from 'vue'
import { usePeerService } from '@/services/peerService'
import { createGMPeerId, createPlayerPeerId } from '@/types'

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

  function setOnMessage(callback: (msg: unknown) => void) {
    onMessageCallback = callback
  }

  function initializeAsGM(code: string) {
    gameCode.value = code
    const peerId = createGMPeerId(code)

    console.log('Initializing as GM with code:', code)
    configure({
      onConnection: (conn) => {
        console.log('Player connected:', conn.peer)
      },
      onDisconnection: (conn) => {
        console.log('Player disconnected:', conn.peer)
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
  }
})
