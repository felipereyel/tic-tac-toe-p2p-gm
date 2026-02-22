import type { Board, GameLogic, GameLogicResult, GameState, Player, PlayerSymbol } from '@/types'

export interface TicTacToeMove {
  position: number
}

const WINNING_COMBINATIONS = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
]

function checkWinner(board: Board): PlayerSymbol | 'draw' | null {
  for (const combo of WINNING_COMBINATIONS) {
    const [a, b, c] = combo
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return board[a]
    }
  }

  if (board.every((cell) => cell !== null)) {
    return 'draw'
  }

  return null
}

export class TicTacToeLogic implements GameLogic {
  readonly name = 'Tic-Tac-Toe'
  readonly playerCount = 2

  createInitialState(players: Player[], gameCode: string): GameState {
    if (players.length !== this.playerCount) {
      throw new Error(`Tic-Tac-Toe requires exactly ${this.playerCount} players`)
    }

    return {
      board: Array(9).fill(null),
      currentTurn: 'X',
      players,
      winner: null,
      status: 'playing',
      gameCode,
    }
  }

  validateMove(state: GameState, playerId: string, move: unknown): GameLogicResult {
    if (state.status !== 'playing') {
      return { valid: false, error: 'Game is not in progress' }
    }

    const player = state.players.find((p) => p.id === playerId)
    if (!player) {
      return { valid: false, error: 'Player not found in game' }
    }

    if (state.currentTurn !== player.symbol) {
      return { valid: false, error: `It's not your turn. Current turn: ${state.currentTurn}` }
    }

    const ticTacToeMove = move as TicTacToeMove
    if (typeof ticTacToeMove.position !== 'number') {
      return { valid: false, error: 'Invalid move format' }
    }

    const { position } = ticTacToeMove
    if (position < 0 || position > 8) {
      return { valid: false, error: 'Position must be between 0 and 8' }
    }

    if (state.board[position] !== null) {
      return { valid: false, error: 'Cell is already occupied' }
    }

    const newBoard = [...state.board]
    newBoard[position] = player.symbol

    const winner = checkWinner(newBoard)
    const isGameOver = winner !== null

    const newState: GameState = {
      ...state,
      board: newBoard,
      currentTurn: isGameOver ? null : state.currentTurn === 'X' ? 'O' : 'X',
      winner,
      status: isGameOver ? 'finished' : 'playing',
    }

    return {
      valid: true,
      newState,
      winner,
    }
  }

  isGameOver(state: GameState): boolean {
    return state.status === 'finished'
  }

  getWinner(state: GameState): PlayerSymbol | 'draw' | null {
    return state.winner
  }
}

export const ticTacToeLogic = new TicTacToeLogic()
