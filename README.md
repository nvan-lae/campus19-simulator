# Campus19 Simulator


## Overview 🎲

This project is a _Snakes and Ladders_ style **board game** supporting 2 to 5 simultaneous players.\
Each player takes turns rolling a **dice**, traversing a 42-tile board with obstacles and advancements.


## 14-Point Module Strategy 🧮

| Category | Module | Type | Points |
| - | - | - | - |
| **Web** | Full-stack Frameworks (React + NestJS) | Major | 2 |
| **Web** | Real-time features (WebSockets) | Major | 2 |
| **Gaming** | Web-based Game (The Board Game) | Major | 2 |
| **Gaming** | Multiplayer game (3+ players) | Major | 2 |
| **User Mgmt** | Standard User Management | Major | 2 |
| **Web** | Use of an ORM | Minor | 1 |
| **Gaming** | Game customization (Tile effects) | Minor | 1 |
| **User Mgmt** | OAuth 2.0 (Google/42) | Minor | 1 |
| **User Mgmt** | Game statistics & Match history | Minor | 1 |
| **Total** |  |  | **14** |


## Team Organization 👨‍👩‍👦‍👦

* **Product Owner**: [Name] - Defines feature priorities.
* **Scrum Master**: [Name] - Removes blockers and tracks progress.
* **Tech Lead**: [Name] - Oversees the architecture and code quality.
* **Developers**: [All Names] - Implementing core features.


## Directory Structure 🏗️

```
/transcendence
├── docker-compose.yml       # Orchestrates App, API, and DB
├── /frontend                # React App
├── /backend                 # NestJS App
└── /shared                  # (Optional) Shared Types/Interfaces
```


## Database Schema 📋

* **Users**: `id`, `username`, `email`, `avatar`, `2fa_secret`, `oAuthToken`.
* **Matches**: `id`, `startedAt`, `endedAt`, `winnerId`.
* **MatchParticipants**: `matchId`, `userId`, `score`, `position` (links users to matches).
* **Stats**: (Can be calculated dynamically from Matches, or stored as a running total in Users).


## Game Loop Logic ➰

* **Frontend**: A "dumb" renderer. It sends `user_rolled_dice` events and listens for `board_update` events. It does not calculate where the player lands.
* **Backend**: Maintains the "State" of the board (Who is on which tile? Whose turn is it? Did they hit a trap?).
* **State Store**: Game state should be held in memory (variables in a Service) while the game is active, and only be written to the DB (ORM) when the game finishes.
