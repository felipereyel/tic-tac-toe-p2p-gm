# Architecture

## Overview

This is a peer-to-peer multiplayer Tic-Tac-Toe game with a Game Master (GM) architecture. The GM controls the game state and validates all moves from players.

## Tech Stack

- **Frontend**: Vue 3 + TypeScript
- **State Management**: Pinia
- **P2P Communication**: PeerJS
- **Build Tool**: Vite

## Game Flow

### Creating a Game (Game Master)

1. User clicks "Create Game" on main screen
2. A 6-character game code is generated (e.g., `KVLQAS`)
3. GM shares this code with other players
4. GM sees two lists:
   - **Lobby**: Players accepted and waiting to play
   - **Queue**: Players requesting to join (can Accept/Reject)
5. GM clicks "Start Game" when 2+ players are in lobby

### Joining a Game (Player)

1. User enters the game code and their gamertag
2. Player connects to GM via PeerJS
3. Player waits for GM approval (shown on screen)
4. Once accepted, player joins the lobby
5. Game starts when GM clicks "Start Game"

### Gameplay

1. GM controls all game state and logic
2. Players receive game state updates from GM
3. When it's a player's turn, they see "Your turn!" (green)
4. Player clicks a cell to make a move
5. GM validates the move, updates state, and broadcasts to all players
6. Game ends when someone wins or it's a draw

## PeerJS ID Format

- **GM**: `tictactoe-[GAME_CODE]-GM`
- **Player**: `tictactoe-[GAME_CODE]-PLAYER-[GAMERTAG]`

## Message Protocol

| Message Type    | Direction    | Description                   |
| --------------- | ------------ | ----------------------------- |
| `join-request`  | Player → GM  | Request to join game          |
| `join-accepted` | GM → Player  | GM accepts player             |
| `join-rejected` | GM → Player  | GM rejects player             |
| `lobby-update`  | GM → Players | Broadcast lobby/queue state   |
| `move-command`  | Player → GM  | Player makes a move           |
| `move-result`   | GM → Player  | Move accepted/rejected        |
| `state-update`  | GM → Players | Broadcast game state          |
| `your-turn`     | GM → Player  | Notify player it's their turn |
| `game-started`  | GM → Players | Game has started              |
| `game-over`     | GM → Players | Game ended with winner/draw   |

## Extending the Game

The `GameLogic` interface in `src/services/gameLogic.ts` allows implementing other games. The TicTacToeLogic class implements:

- `createInitialState()`: Initialize game state
- `validateMove()`: Validate player moves
- `isGameOver()`: Check if game ended
- `getWinner()`: Determine winner

## Project Structure

```
src/
├── types/           # TypeScript interfaces
│   ├── game.ts     # Game state, player types
│   ├── messages.ts # P2P message protocol
│   └── peer.ts    # Peer ID utilities
├── services/
│   ├── gameLogic.ts   # Game rules (extensible)
│   └── peerService.ts # PeerJS wrapper
├── stores/         # Pinia stores
│   ├── gameStore.ts   # Game state
│   ├── lobbyStore.ts  # Player queue/lobby
│   └── peerStore.ts   # P2P connections
├── composables/
│   ├── useGameMaster.ts # GM logic
│   └── usePlayer.ts   # Player logic
└── components/
    ├── MainMenu.vue   # Create/Join
    ├── CreateGame.vue # GM lobby management
    ├── JoinGame.vue   # Player join form
    ├── LobbyView.vue  # Waiting room
    └── GameBoard.vue  # Tic-Tac-Toe grid
```
