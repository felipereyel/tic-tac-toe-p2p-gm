export type CellValue = 'X' | 'O' | null

export type Board = CellValue[]

export type PlayerSymbol = 'X' | 'O'

export interface Player {
  id: string
  peerId: string
  gamertag: string
  symbol: PlayerSymbol
  connected: boolean
}

export type GameStatus = 'waiting' | 'playing' | 'finished'

export interface GameState {
  board: Board
  currentTurn: PlayerSymbol | null
  players: Player[]
  winner: PlayerSymbol | 'draw' | null
  status: GameStatus
  gameCode: string
}

export interface GameLogicResult {
  valid: boolean
  error?: string
  newState?: GameState
  winner?: PlayerSymbol | 'draw' | null
}

export interface GameLogic {
  readonly name: string
  readonly playerCount: number
  createInitialState(players: Player[], gameCode: string): GameState
  validateMove(state: GameState, playerId: string, move: unknown): GameLogicResult
  isGameOver(state: GameState): boolean
  getWinner(state: GameState): PlayerSymbol | 'draw' | null
}

export interface TicTacToeMove {
  position: number
}
