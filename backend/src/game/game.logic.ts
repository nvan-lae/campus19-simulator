import {
  BOARD_SIZE,
  checkTileEffect,
  MAX_PLAYERS,
  COLORS,
} from './game.constants';
import { User } from '@prisma/client';

export interface GamePlayer {
  id: number; // db user id
  username: string;
  color: string;
  position: number;
  order: number;
}

export interface GameState {
  players: GamePlayer[];
  currentPlayerIndex: number;
  diceValue: number | null;
  gameOver: boolean;
  winner: GamePlayer | null;
  lastMoveDescription: string | null;
}

export class GameRoom {
  private state: GameState;
  private readonly MAX_PLAYERS = MAX_PLAYERS;
  private readonly COLORS = COLORS;

  constructor(public readonly roomId: string) {
    this.state = {
      players: [],
      currentPlayerIndex: 0,
      diceValue: null,
      gameOver: false,
      winner: null,
      lastMoveDescription: null,
    };
  }

  rollDice(userId: number): GameState {
    const playerIndex = this.state.currentPlayerIndex;
    const player = this.state.players[playerIndex];

    if (player.id !== userId) throw new Error('Not your turn');
    if (this.state.diceValue !== null) throw new Error('You already rolled'); // Prevent double rolling

    // 1. Just roll the dice
    const dice = Math.floor(Math.random() * 6) + 1;
    this.state.diceValue = dice;
    this.state.lastMoveDescription = `${player.username} rolled a ${dice}...`;

    // Do NOT move or switch turn yet
    return this.state;
  }

  // Add this new function
  makeMove(userId: number): GameState {
    const playerIndex = this.state.currentPlayerIndex;
    const player = this.state.players[playerIndex];

    if (player.id !== userId) throw new Error('Not your turn');
    if (this.state.diceValue === null)
      throw new Error('You need to roll first');

    const dice = this.state.diceValue;

    // 2. Move Logic
    const oldPosition = player.position;
    let newPosition = oldPosition + dice;

    if (newPosition >= BOARD_SIZE) {
      newPosition = BOARD_SIZE;
    } else {
      newPosition = checkTileEffect(newPosition);
    }

    player.position = newPosition;
    this.state.lastMoveDescription = `${player.username} moved to tile ${newPosition}`;

    // 3. Reset Dice & Switch Turn
    this.state.diceValue = null; // Important! Clear the dice

    if (newPosition === BOARD_SIZE) {
      this.state.gameOver = true;
      this.state.winner = player;
    } else {
      this.state.currentPlayerIndex =
        (this.state.currentPlayerIndex + 1) % this.state.players.length;
    }

    return this.state;
  }

  addPlayer(user: User): boolean {
    if (this.state.players.length >= this.MAX_PLAYERS) return false;
    if (this.state.players.find((p) => p.id === user.id)) return true; // Already joined

    const order = this.state.players.length;
    const newPlayer: GamePlayer = {
      id: user.id,
      username: user.username,
      color: this.COLORS[order],
      position: 0,
      order: order,
    };

    this.state.players.push(newPlayer);
    return true;
  }

  getState(): GameState {
    return this.state;
  }
}
