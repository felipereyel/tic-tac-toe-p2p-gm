# P2P Tic-Tac-Toe

A peer-to-peer multiplayer Tic-Tac-Toe game with a Game Master architecture. No server needed - players connect directly to each other.

**[Play Online](https://felipereyel.github.io/tic-tac-toe-p2p-gm/)**

## Quick Start

```sh
npm install
npm run dev
```

Open http://localhost:5173 in two browser windows to test.

## How to Play

1. **Create Game**: Click "Create Game" to become the Game Master
2. **Share Code**: Share the 6-character code with a friend
3. **Join**: Your friend enters the code and their name
4. **Approve**: GM approves the join request
5. **Play**: GM starts the game when ready

## Features

- Real-time P2P gameplay via PeerJS
- Game Master controls game state and validates all moves
- Visual turn indicators (green = your turn, red = waiting)
- Responsive design

## Commands

| Command              | Description                |
| -------------------- | -------------------------- |
| `npm run dev`        | Start development server   |
| `npm run build`      | Build for production       |
| `npm run lint`       | Run ESLint                 |
| `npm run type-check` | Type-check with TypeScript |

## Architecture

See [ARCHITECTURE.md](./ARCHITECTURE.md) for details on the P2P protocol, message types, and code structure.
