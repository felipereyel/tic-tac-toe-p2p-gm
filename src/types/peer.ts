import type { DataConnection } from 'peerjs'

export interface PeerConnection {
  connection: DataConnection
  peerId: string
  gamertag: string | null
  status: 'connecting' | 'connected' | 'disconnected'
  isGM: boolean
}

export const PEER_ID_PREFIX = 'tictactoe'
export const GM_SUFFIX = 'GM'
export const PLAYER_SUFFIX = 'PLAYER'

export function generateGameCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  let code = ''
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}

export function createGMPeerId(gameCode: string): string {
  return `${PEER_ID_PREFIX}-${gameCode}-${GM_SUFFIX}`
}

export function createPlayerPeerId(gameCode: string, gamertag: string): string {
  const sanitizedTag = gamertag.replace(/[^a-zA-Z0-9]/g, '-')
  return `${PEER_ID_PREFIX}-${gameCode}-${PLAYER_SUFFIX}-${sanitizedTag}`
}

export function parsePeerId(
  peerId: string,
): { type: 'gm' | 'player'; gameCode: string; gamertag?: string } | null {
  const parts = peerId.split('-')
  if (parts.length < 3 || parts[0] !== PEER_ID_PREFIX) {
    return null
  }

  const gameCode = parts[1]
  const role = parts[2]

  if (role === GM_SUFFIX) {
    return { type: 'gm', gameCode }
  }

  if (role === PLAYER_SUFFIX && parts.length === 4) {
    return { type: 'player', gameCode, gamertag: parts[3] }
  }

  return null
}

export function isValidPeerIdForGame(peerId: string, gameCode: string): boolean {
  const parsed = parsePeerId(peerId)
  return parsed !== null && parsed.gameCode === gameCode
}
