import type { GameState, Player } from './game'

export type MessageType =
  | 'join-request'
  | 'join-accepted'
  | 'join-rejected'
  | 'player-disconnected'
  | 'move-command'
  | 'move-result'
  | 'state-update'
  | 'your-turn'
  | 'game-started'
  | 'game-over'
  | 'lobby-update'

export interface BaseMessage {
  type: MessageType
  timestamp: number
}

export interface JoinRequestMessage extends BaseMessage {
  type: 'join-request'
  gamertag: string
  peerId: string
}

export interface JoinAcceptedMessage extends BaseMessage {
  type: 'join-accepted'
  player: Player
  inLobby: boolean
}

export interface JoinRejectedMessage extends BaseMessage {
  type: 'join-rejected'
  reason: string
}

export interface PlayerDisconnectedMessage extends BaseMessage {
  type: 'player-disconnected'
  playerId: string
  gamertag: string
}

export interface MoveCommandMessage extends BaseMessage {
  type: 'move-command'
  playerId: string
  move: unknown
}

export interface MoveResultMessage extends BaseMessage {
  type: 'move-result'
  ok: boolean
  error?: string
}

export interface StateUpdateMessage extends BaseMessage {
  type: 'state-update'
  gameState: GameState
}

export interface YourTurnMessage extends BaseMessage {
  type: 'your-turn'
  gameState: GameState
}

export interface GameStartedMessage extends BaseMessage {
  type: 'game-started'
  gameState: GameState
}

export interface GameOverMessage extends BaseMessage {
  type: 'game-over'
  gameState: GameState
  winner: 'X' | 'O' | 'draw' | null
}

export interface LobbyUpdateMessage extends BaseMessage {
  type: 'lobby-update'
  lobby: Player[]
  queue: Player[]
}

export type Message =
  | JoinRequestMessage
  | JoinAcceptedMessage
  | JoinRejectedMessage
  | PlayerDisconnectedMessage
  | MoveCommandMessage
  | MoveResultMessage
  | StateUpdateMessage
  | YourTurnMessage
  | GameStartedMessage
  | GameOverMessage
  | LobbyUpdateMessage

export function createMessage<T extends Message>(
  type: T['type'],
  data: Omit<T, 'type' | 'timestamp'>,
): T {
  return {
    type,
    timestamp: Date.now(),
    ...data,
  } as T
}
