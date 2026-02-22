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

## PeerJS Connection Handling

### Connection Flow

**Game Master (GM)**:

1. GM creates a PeerJS instance with their unique ID
2. GM listens for incoming connections via `peer.on('connection')`
3. GM maintains a map of connected players

**Player**:

1. Player creates their own PeerJS instance first
2. Player then connects to GM's peer ID
3. Player sends join request after connection is established

### Connection Validation

The GM validates all incoming connections to ensure they match the expected peer ID scheme. This prevents other PeerJS users from connecting to your game.

**Validation rules**:

- Peer ID must start with `tictactoe-`
- Must include the correct game code
- Must end with `PLAYER-[gamertag]`

If a connection doesn't match, the GM automatically closes it without processing any messages.

The `isValidPeerIdForGame(peerId, gameCode)` function in `src/types/peer.ts` handles this validation.

### Disconnection Handling

PeerJS connections can close unexpectedly (tab close, refresh, network issues). The app handles this as follows:

- **Connection close** (`conn.on('close')`): Fires when a peer-to-peer connection closes
  - GM: Removes player from lobby/queue, broadcasts updated lobby
  - Player: Goes back to main screen
- **Peer server disconnect** (`peer.on('disconnected')`): Fires when peer loses connection to PeerJS signaling server
  - Triggers the same cleanup as connection close

**Flow for unclean disconnects**:

1. When a player closes tab/refreshes, `conn.on('close')` fires
2. GM's `onDisconnection` callback removes player from lobby/queue
3. GM broadcasts `lobby-update` to remaining players
4. If GM closes tab/refreshes, all connections close and players go to main screen

The `peerService.ts` wraps PeerJS and provides:

- `connect(peerId)`: Create a peer and listen for connections
- `connectToPeer(peerId)`: Connect to an existing peer
- `send(peerId, message)`: Send message to specific peer
- `broadcast(message)`: Send message to all connected peers
- `disconnect()`: Close all connections and destroy peer

### Connection States

The peer service tracks these states:

- `disconnected`: Initial state or after disconnect
- `connecting`: Currently establishing connection
- `connected`: Successfully connected
- `error`: Connection failed

### Reconnection

Currently **not supported**:

- If GM disconnects, the game ends
- If a player disconnects during gameplay, they forfeit
- Players must rejoin and get re-approved to play again

This simplifies the implementation but could be extended by:

1. Adding a timeout when a player disconnects
2. Storing the game state to restore on reconnection
3. Implementing a "waiting for reconnection" state

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
├── types/
│   ├── game.ts       # Game state, player types
│   ├── messages.ts   # P2P message protocol
│   └── peer.ts      # Peer ID utilities
├── services/
│   ├── gameLogic.ts     # Game rules (extensible)
│   └── peerService.ts  # PeerJS wrapper
├── stores/
│   ├── gameStore.ts    # Game state
│   ├── lobbyStore.ts   # Player queue/lobby
│   └── peerStore.ts    # P2P connections
├── composables/
│   ├── useGameMaster.ts  # GM logic
│   └── usePlayer.ts     # Player logic
└── components/
    ├── MainMenu.vue     # Create/Join
    ├── CreateGame.vue   # GM lobby management
    ├── JoinGame.vue     # Player join form
    ├── LobbyView.vue    # Waiting room
    └── GameBoard.vue    # Tic-Tac-Toe grid
```
