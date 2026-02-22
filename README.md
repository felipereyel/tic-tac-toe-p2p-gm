# tic-tac-toe-p2p-gm

## Project Description

This project implements a peer-to-peer multiplayer tic-tac-toe with a game master.   
The game is created and controlled by the game master.   
Players should type a quick code to join a game.   

Flow:
- User logs into page and is prompted with either join or create (main screen)
  - if create 
    - the user becomes a game master (GM) for that game and a game id (lets say ABCDEF) is generated for it
    - the GM shared that id for other players to join
    - the GM sees two lists of players on the screen
      - the first is for players who were accepted by the GM: the lobby
      - the second is for players requesting to join: the queue 
        - the GM client auto reject players with incorrect peerId
        - this list has options to allow/deny in each row
        - when GM accepts, the row is moved from the queue to the lobby
          - Newer players join at the end of the lobby
    - GM chooses when to start game
    - after game start all join requests are auto rejected by GM
  - if join
    - the user becomes a player
    - the player must provide a game id and gamertag
    - the player tries to connect with the GM
    - if the player is not accepted he goes back to main screen
    - if the player is accepted he joins the lobby/queue
    - the game starts only the the GM starts
- Game control
  - GM client controls the state/logic of the game
  - players listen to events/gamestate from GM
  - players wait for your-turn event from GM to start their turn
  - players send commands to the GM. 
    - if ok GM answers with ok: true (and gamestate a little after). and GM notifies next player with your-turn event
    - else answer with ok: false (and possibly error/reason) and player needs to provide valid command for the game to proceed
  - GM listens for moves/commands from players, validates them against game logic and notifies that user accordinly
  - if a player makes a move that GM accepts and it alters the gamestate, that gamestate change should be forwarded to all players including the turns player

PeerJS specs:
- GM id: $HOST::tictactoep2pgm::[GENERATED_CODE]::GM
- Player id: $HOST::tictactoep2pgm::[GENERATED_CODE]::PLAYER::[GAMERTAG]


## Project Setup

```sh
npm install
```

### Compile and Hot-Reload for Development

```sh
npm run dev
```

### Type-Check, Compile and Minify for Production

```sh
npm run build
```

### Lint with [ESLint](https://eslint.org/)

```sh
npm run lint
```
