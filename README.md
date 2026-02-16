# Campus19 Simulator

_This project has been created as part of the 42 curriculum by nvan-lae, cstevens, tde-raev, and pdaskalo._

## 🎲 Description

**Campus19 Simulator** is a real-time, multiplayer board game based on the "Game of the Goose" mechanics, supporting 1 to 4 players. Players navigate a board in a 19 formation representing Campus 19, encountering traps, "evaluation" tiles for double moves, and a shop to buy items that disrupt opponents. The goal is to reach the final tile through strategy, luck, and successful completion of triggered coding challenges.

**Key Features**

- **Real-time Gameplay**: Live dice rolls and player movement powered by WebSockets.
- **Interactive Board**: Unique tiles including "Mario Kart" (skip a turn) and "Look for Internship" (move back).
- **Matchmaking & Lobby**: Create or join game rooms with friends.
- **Dynamic Shop**: Purchase items like the "Chaos Orb" to shuffle positions.
- **Cross-Platform Auth**: Standard email/password login and 42 Intra OAuth integration.

## 🛠️ Instructions

**Prerequisites**

- Docker Desktop (latest stable version)
- Node.js (v20+ recommended for local linting)
- Google Chrome (recommended browser for compatibility)

**Installation & Execution**

1. **Clone the repository**:

```
git clone <repository-url> transcendence && cd transcendence
```

2. **Environment Setup**:

Create a `.env` file based on `.env.example`:

3. **Launch the Project**:

The following command generates SSL certificates, builds the containers, and runs database migrations:

```
make init
```

4. **Access the Application**:
   Open [https://localhost:5173](https://localhost:5173/login) in your browser.

## 👨‍👩‍👦‍👦 Team Information

| Member       | Role                | Responsibilities                                                                            |
| ------------ | ------------------- | ------------------------------------------------------------------------------------------- |
| **pdaskalo** | **Technical Lead**  | Architecture design, WebSocket implementation (GameGateway), and Prisma ORM configuration.  |
| **nvan-lae** | **Product Owner**   | Feature prioritization, game rule definition (mechanics), and UI/UX vision.                 |
| **cstevens** | **Project Manager** | Scrum facilitation, tracking TODO.md progress, and coordinating team meetings via Whatsapp. |
| **tde-raev** | **Developer**       | Frontend React development, state management hooks, and styling with Tailwind CSS.          |

## 📈 Project Management

- **Organization**: We followed an Agile-lite methodology with weekly syncs to review the "Product Backlog" in `TODO.md`.
- **Tools**: GitHub Issues were used for bug tracking, and Whatsapp served as our primary real-time communication channel.
- **Workflow**: All features were developed in feature branches and required at least one peer review before merging into `main`.

## 💻 Technical Stack

- Frontend: **React 19** with **Vite** for fast builds. Styled using **Tailwind CSS** and **Lucide React** for icons.
- Backend: **NestJS** (v11) providing a modular architecture and dependency injection.
- Database: **PostgreSQL** managed via **Prisma ORM** for type-safe queries.
- Real-time: **Socket.io** for bidirectional communication.
- Containerization: **Docker** & **Docker Compose** for a unified dev/prod environment.

## 🗄️ Database Schema

The schema is designed to handle transient game states and persistent user statistics:

- **User**: Stores auth data, 42 `intraId`, `avatarUrl`, and 2FA secrets.
- **Match**: Tracks game sessions, including start/end timestamps.
- **MatchPlayer**: An explicit link table recording user performance (rank, coins earned, winner status) for match history.

## 🧮 14-Point Module Strategy

| Category      | Module                    | Type  | Points | Justification                                                                       |
| ------------- | ------------------------- | ----- | ------ | ----------------------------------------------------------------------------------- |
| **Web**       | Full-stack Frameworks     | Major | 2      | Utilizes **React** (Frontend) and **NestJS** (Backend) for a structured ecosystem.  |
| **Web**       | Real-time Features        | Major | 2      | **WebSockets** (Socket.io) used for live dice rolls and board updates.              |
| **Web**       | File upload system        | Minor | 1      | Players are able to upload and change their profile pictures                        |
| **Gaming**    | Web-based Game            | Major | 2      | Original "Campus19 Simulator" board game with complete win/loss conditions.         |
| **Gaming**    | Multiplayer 3+            | Major | 2      | Support for up to 4 concurrent players in a single match.                           |
| **User Mgmt** | Standard User Mgmt        | Major | 2      | Includes profiles, avatar uploads, and basic friend/online status logic.            |
| **User Mgmt** | Two-Factor Authentication | Minor | 1      | Allow users to enable 2FA on their account                                          |
| **Web**       | Use of an ORM             | Minor | 1      | **Prisma** is used for all database interactions.                                   |
| **Gaming**    | Game Customization        | Minor | 1      | Custom tile effects (Evaluation, Black Hole, Internship) and power-ups in the shop. |
| **User Mgmt** | OAuth 2.0                 | Minor | 1      | Remote authentication via **42 Intra API**.                                         |
| **User Mgmt** | Game Statistics           | Minor | 1      | Match history and win/loss records displayed on user profiles.                      |
| **Total**     |                           |       | **16** |                                                                                     |

## 🤖 Resources & AI Usage

- **Documentation**: [NestJS Docs](https://docs.nestjs.com/), [Prisma Schema Reference](https://www.prisma.io/docs).
- **AI Usage**: AI was used to generate boilerplate code for the `GameRoom` state machine and to assist in writing the `Makefile` and `docker-compose.yml` configurations. All AI-generated logic was systematically reviewed and tested by the Tech Lead.

## 📋 Features List

- **Auth System**: Login, registration, and 42 OAuth.
- **Lobby**: Private rooms with "Ready" status for all players.
- **Game Loop**: Turn-based movement with server-side validation.
- **Shop**: In-game economy where players spend coins earned during the match.
- **Profile**: View statistics and match history of any registered user.
