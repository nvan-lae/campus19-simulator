# Project Onboarding: Campus19 Simulator

## 1. High-Level Architecture & Flow

The project runs on a 3-container Docker setup defined in `docker-compose.yml`. It separates concerns between data storage, business logic, and the user interface.

### The Container Trio

1. **`transcendence_db` (PostgreSQL):** The persistent data store.
2. **`transcendence_backend` (NestJS):** The API and WebSocket server. It handles authentication, game logic, and database interactions. It runs on port `3000`.
3. **`transcendence_frontend` (React + Vite):** The client-side application running on port `5173`. It connects to the backend via HTTP for standard requests (like profile updates) and WebSockets for live gameplay.

### The Data Flow

* **REST API (HTTP):** Used for "static" actions like logging in, fetching user profiles (`GET /users/me`), and uploading avatars. These requests hit `UsersController`.
* **Real-Time (WebSockets):** Used for the actual gameplay. The frontend connects via `Socket.IO`. The backend verifies the JWT token upon connection, and events (like rolling dice) are emitted to the `GameGateway`. The server calculates the new state and broadcasts it back to all players in that specific game room.

---

## 2. Database Layer: Prisma ORM

We use **Prisma** to interact with our PostgreSQL database. It serves as a type-safe bridge between our TypeScript backend and the raw SQL database.

### The Schema (`schema.prisma`)

The database structure is defined in `backend/prisma/schema.prisma`. Here are the core models:

* **User:** Stores authentication data (including 42 Intra IDs for OAuth), profiles, and stats.
```prisma
model User {
  id        Int      @id @default(autoincrement())
  username  String   @unique
  intraId   String?  @unique // For 42 OAuth
  avatarUrl String?
  matches   MatchPlayer[]    // Relation to games played
}

```


* **Match & MatchPlayer:** We use a "Many-to-Many" relationship with an explicit link table (`MatchPlayer`).
* `Match`: Represents a single game session (start time, end time).
* `MatchPlayer`: Links a `User` to a `Match` and stores their specific performance (winner status, rank, coins earned).



### interacting with the DB (`PrismaService`)

We do not use `new PrismaClient()` manually in every file. Instead, we inject `PrismaService` (which extends `PrismaClient`) into our other services.

**Example Usage (from `UsersService`):**
To get a user's stats, we use Prisma's aggregation and counting methods:

```typescript
// backend/src/users/users.service.ts
async getStats(userId: number) {
  // Count total rows in MatchPlayer for this user
  const totalMatches = await this.prisma.matchPlayer.count({
    where: { userId },
  });

  // Count only rows where isWinner is true
  const wins = await this.prisma.matchPlayer.count({
    where: { userId, isWinner: true },
  });
  
  return { totalMatches, wins };
}

```

---

## 3. Backend Architecture: NestJS

Our backend is built with **NestJS**, which uses a modular, dependency-injection-based architecture. A typical feature consists of a **Module**, a **Controller**, and a **Service**.

### A. The Module (`*.module.ts`)

Modules organize code. The `AppModule` is the root, importing `UsersModule`, `AuthModule`, and `GameModule`.

### B. The Controller (`*.controller.ts`)

Controllers handle incoming HTTP requests. They check permissions (Guards) and call Services.

**Example: Avatar Upload**

1. **Route:** `POST /users/avatar`
2. **Guard:** `@UseGuards(AuthGuard('jwt'))` ensures only logged-in users can access this.
3. **Interceptor:** `FileInterceptor` handles the multipart file upload logic (storage, naming).
4. **Action:** Calls `usersService.update` to save the file path to the DB.

```typescript
// backend/src/users/users.controller.ts
@UseGuards(AuthGuard('jwt'))
@Post('avatar')
async uploadAvatar(@Request() req, @UploadedFile() file) {
  // Logic to save file...
  const avatarUrl = `/uploads/avatars/${file.filename}`;
  // Call service to update DB
  return this.usersService.update(req.user.id, { avatarUrl });
}

```

### C. The Service (`*.service.ts`)

Services contain the business logic. They are "Injectable," meaning NestJS manages their instances.

* **Dependency Injection:** `UsersService` needs the database, so we ask for `PrismaService` in the constructor: `constructor(private prisma: PrismaService) {}`.

---

## 4. The Real-Time Game Loop (`GameGateway`)

The most complex part of the app is the `GameGateway`. It uses `Socket.IO` to handle live gameplay.

### Connection & Auth

Unlike standard HTTP requests, WebSocket connections persist.

1. **Handshake:** When a client connects, we extract the JWT from the headers.
2. **Verification:** We verify the token and attach the `User` object to the socket (`client.data.user`).
3. **Room Joining:** Clients send a `join_game` event with a `gameId`. The server adds them to that specific "Room".

### Event Handling Pattern

The game follows a strict **Action -> Process -> Broadcast** loop:

1. **Client Action:** User clicks "Roll Dice". Frontend emits `roll_dice`.
2. **Server Processing:**
```typescript
@SubscribeMessage('roll_dice')
handleRollDice(@MessageBody() data, @ConnectedSocket() client) {
  const user = client.data.user;
  // GameService calculates new position, checks traps, etc.
  const newState = this.gameService.processRoll(data.gameId, user.id);

  // Broadcast the NEW state to EVERYONE in that game room
  this.server.to(data.gameId).emit('game_state_update', newState);
}

```


3. **Frontend Update:** All clients in the room receive `game_state_update` and re-render the board simultaneously.

---


## 5. The Game Engine (`GameRoom` vs `GameService`)

Understanding the distinction between the *Service* and the *Logic* classes is crucial for backend development in this project.

### A. The Manager: `GameService`

Located in `backend/src/game/game.service.ts`, this is a standard NestJS service (Singleton).

* **Role:** It acts as the "Lobby Manager." It creates games, handles users joining/leaving, and persists data to the database when a game ends.
* **Key Storage:** It holds an in-memory `Map<string, GameRoom>` called `activeGames`. If the server restarts, active games are lost (unless we implement Redis later).
* **Database Write:** When a game finishes, `saveMatch()` is called. It calculates rankings and writes a `Match` record with nested `MatchPlayer` entries using Prisma transactions.

### B. The Brain: `GameRoom` (The State Machine)

Located in `backend/src/game/game.logic.ts`, this is **NOT** a NestJS service. It is a plain TypeScript class instantiated once per game ID.

* **Role:** It enforces the actual rules of "Campus19 Simulator." It has no knowledge of the database; it only manipulates the `GameState` object in memory.
* **The State Object:** The frontend receives this exact object. It includes:
* `status`: 'LOBBY' | 'PLAYING' | 'FINISHED'
* `players`: Array of player objects (position, coins, inventory).
* `currentGlobalEvent`: Special modes like 'gravity_flux' or 'inflation'.
* `activeChallenge`: Coding challenges triggered by specific tiles.



### C. Game Features to Know

If you are adding a new game feature, you will likely work in `game.logic.ts`.

* **Tile Effects:** The board logic is a large `switch` statement in `applyTileEffect`. This handles the "Goose" (double move), "Well" (stuck until rescue), and "Labyrinth" (move back) logic.
* **Global Events:** Every 10 turns, the server triggers a global modifier.
* *Example:* `gravity_flux` adds +2 to every dice roll.
* *Example:* `inflation` increases shop item costs by 50%.


* **The Item Shop:** Players can buy items like `moulinette_roulette` (shuffles everyone's positions) or `norminette_pass` (blocks the next negative effect). The logic for *using* these items is handled in the `useItem` method.

---

## 6. Authentication Deep Dive

The project supports two login methods: **Standard (Email/Pass)** and **42 Intra (OAuth)**.

### A. The Passport Strategies

We use `@nestjs/passport` to handle the heavy lifting.

1. **Local Strategy:** Standard username/password check using `bcrypt`.
2. **42 Strategy (`FortyTwoStrategy`):**
* Located in `backend/src/auth/strategies/forty-two.strategy.ts`.
* It intercepts the callback from the 42 API.
* It calls `validate42User` in the AuthService.



### B. Auto-Registration Flow

A key feature of our OAuth implementation is "Just-in-Time" provisioning.

* When a 42 user logs in, we check if their `intraId` exists in our DB.
* **If yes:** Log them in.
* **If no:** We *automatically create* a new User account using their 42 profile data (Username, Avatar, Email). This bypasses the registration form entirely.

### C. JWT (JSON Web Tokens)

Once authenticated (via either method), the server issues a JWT signed with a secret.

* **Payload:** `{ username: string, sub: number (userId) }`.
* **Usage:**
* **HTTP:** Sent in the `Authorization: Bearer <token>` header.
* **WebSocket:** Sent in the `auth` handshake object. The `GameGateway` manually verifies this token before allowing a connection.



---

## 7. Developer Workflow: Adding a New Feature

If you were asked to add a new "Teleport" item to the game, here is the flow you would follow:

1. **Define Constants:** Add the item ID and Cost to `game.constants.ts` (not shown, but imported in logic).
2. **Update Logic (`game.logic.ts`):**
* Add a case to the `useItem` switch statement:
```typescript
case 'teleport':
  player.position = 42; // Move to tile 42
  this.state.lastMoveDescription = `${player.username} teleported!`;
  break;

```




3. **Frontend (React):** The frontend will automatically receive the updated `GameState`. You would just need to ensure the `Shop` component renders the new icon (based on the ID).
4. **Database:** No DB changes required for game logic tweaks, as game state is transient!

---


## 8. Frontend Integration (React + Vite)

The frontend is a **Single Page Application (SPA)** built with React. It communicates with the backend in two distinct ways: **HTTP** for REST resources (like profiles) and **WebSockets** for live gameplay.

### A. The Socket Context (`SocketContext.tsx`)

We use a **Context Provider** to ensure there is only *one* active WebSocket connection per client, accessible anywhere in the component tree.

* **Why?** Prevents multiple socket connections from opening if a user navigates between pages.
* **Flow:**
1. App initializes: `SocketContext` creates the `socket` instance.
2. User logs in: The socket performs a "handshake" using the JWT token.
3. Components consume it: `const { socket } = useContext(SocketContext);`



### B. The Game Loop Hook (`useGameLogic.ts`)

Instead of scattering logic across UI components, we encapsulate the game state management in a custom hook: `useGameLogic`.

* **Listeners:** It sets up event listeners for `game_state_update`.
* **State:** It maintains the local `GameState` object (players, dice value, board events).
* **Actions:** It exposes functions like `rollDice()` or `buyItem()`, which emit the corresponding events to the server.

### C. Visualizing the State (`GameBoard.tsx`)

The UI is purely "reactive." It does not calculate rules; it simply renders the `GameState` it receives.

* If `state.players[0].position` changes from 5 to 8, the `GameBoard` component automatically re-renders the player token on tile 8.
* If `state.activeChallenge` is present, the `ChallengeModal` pops up automatically.

---

## 9. Deployment & Infrastructure (Docker)

We use **Docker Compose** to orchestrate the entire stack. This ensures that every developer runs the exact same environment, regardless of their OS.

### The Service Trio (`docker-compose.yml`)

1. **`postgres`**:
* **Image**: `postgres:15-alpine` (Lightweight DB).
* **Volume**: `postgres_data:/var/lib/postgresql/data` ensures data persists even if you destroy the container.


2. **`backend`**:
* **Hot Reloading**: The volume `- ./backend:/usr/src/app` maps your local code folder into the container. When you save a file in VS Code, the container detects the change and restarts the server automatically.
* **Networking**: It is accessible at `localhost:3000` on your host machine, but inside the Docker network, it talks to the database via the hostname `postgres`.


3. **`frontend`**:
* **Vite Server**: Runs on `localhost:5173`.
* **Hot Reloading**: Similar to the backend, your local changes are reflected instantly in the browser without a manual refresh.



### Environment Variables

The `.env` file (which should **never** be committed to Git) controls secrets.

* **`DATABASE_URL`**: Used by Prisma to connect to Postgres.
* **`JWT_SECRET`**: Used to sign/verify auth tokens.
* **`FORTYTWO_...`**: Credentials for the 42 OAuth provider.

