import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Player } from '@/types'

export const useLobbyStore = defineStore('lobby', () => {
  const lobby = ref<Player[]>([])
  const queue = ref<Player[]>([])
  const gameStarted = ref(false)

  function addToLobby(player: Player) {
    const index = queue.value.findIndex((p) => p.peerId === player.peerId)
    if (index !== -1) {
      queue.value.splice(index, 1)
      lobby.value.push(player)
    }
  }

  function removeFromLobby(playerId: string) {
    const index = lobby.value.findIndex((p) => p.id === playerId)
    if (index !== -1) {
      lobby.value.splice(index, 1)
    }
  }

  function addToQueue(player: Player) {
    const exists = queue.value.some((p) => p.peerId === player.peerId)
    if (!exists) {
      queue.value.push(player)
    }
  }

  function removeFromQueue(peerId: string) {
    const index = queue.value.findIndex((p) => p.peerId === peerId)
    if (index !== -1) {
      queue.value.splice(index, 1)
    }
  }

  function acceptPlayer(peerId: string) {
    const player = queue.value.find((p) => p.peerId === peerId)
    if (!player) return

    const index = queue.value.indexOf(player)
    if (index === -1) return

    queue.value.splice(index, 1)
    lobby.value.push(player)
  }

  function rejectPlayer(peerId: string) {
    removeFromQueue(peerId)
  }

  function clearLobby() {
    lobby.value = []
    queue.value = []
    gameStarted.value = false
  }

  function startGame() {
    gameStarted.value = true
  }

  function getPeerIdFromQueue(peerId: string): string | undefined {
    const player = queue.value.find((p) => p.peerId === peerId)
    return player?.id
  }

  return {
    lobby,
    queue,
    gameStarted,
    addToLobby,
    removeFromLobby,
    addToQueue,
    removeFromQueue,
    acceptPlayer,
    rejectPlayer,
    clearLobby,
    startGame,
    getPeerIdFromQueue,
  }
})
