import {
  BOARD_SIZE,
  MAX_PLAYERS,
  COLORS,
  STARTING_COINS,
  GOOSE_COIN_REWARD,
  getTileEffect,
  ESCAPE_COSTS,
  SHOP_ITEMS,
  TileEffectType,
  CODING_QUESTIONS,
} from './game.constants';
import { User } from '@prisma/client';

export interface InventoryItem {
  itemId: string;
  name: string;
}

export interface GamePlayer {
  id: number; // db user id
  username: string;
  color: string;
  position: number;
  order: number;
  coins: number;
  turnsToSkip: number;
  stuckInWell: boolean;
  hasShield: boolean;
  inventory: InventoryItem[];
}

export interface ActiveChallenge {
  playerId: number;
  questionId: string;
  questionText: string;
  options: string[];
  reward: number;
  bets: { playerId: number; prediction: 'success' | 'fail' }[];
}

export interface GameState {
  players: GamePlayer[];
  currentPlayerIndex: number;
  diceValue: number | null;
  gameOver: boolean;
  winner: GamePlayer | null;
  lastMoveDescription: string | null;
  pendingGooseRoll: boolean;
  activeChallenge: ActiveChallenge | null;
  turnCount: number;
  currentGlobalEvent: 'gravity_flux' | 'inflation' | 'windy' | null;
  bountyTargetId: number | null;
  currentTurnBets: { playerId: number; bet: 'low' | 'high' }[];
  rollBetResult: {
    winners: number[];
    losers: number[];
    outcome: 'low' | 'high';
  } | null;
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
      pendingGooseRoll: false,
      activeChallenge: null,
      turnCount: 0,
      currentGlobalEvent: null,
      bountyTargetId: null,
      currentTurnBets: [],
      rollBetResult: null,
    };
  }

  rollDice(userId: number): GameState {
    const playerIndex = this.state.currentPlayerIndex;
    const player = this.state.players[playerIndex];

    if (player.id !== userId) throw new Error('Not your turn');
    if (this.state.diceValue !== null) throw new Error('You already rolled');

    // Check if player needs to skip turns
    if (player.turnsToSkip > 0) {
      player.turnsToSkip--;
      this.state.lastMoveDescription = `${player.username} skips a turn (${player.turnsToSkip} remaining)`;
      this.nextTurn();
      return this.state;
    }

    // Reset previous bet results before new roll
    this.state.rollBetResult = null;

    // Check if challenge active - should not happen if FE blocks, but valid check
    if (
      this.state.activeChallenge &&
      this.state.activeChallenge.playerId === userId
    ) {
      throw new Error('Must complete challenge first');
    }

    let dice = Math.floor(Math.random() * 6) + 1;

    // Global Event Modifiers
    if (this.state.currentGlobalEvent === 'gravity_flux') {
      dice += 2;
    } else if (this.state.currentGlobalEvent === 'windy') {
      dice = Math.max(1, dice - 1);
    }

    this.state.diceValue = dice;
    this.state.lastMoveDescription = `${player.username} rolled a ${dice}...`;

    // Process Bets
    if (this.state.currentTurnBets.length > 0) {
      const isHigh = dice >= 4; // 4,5,6
      const outcome = isHigh ? 'high' : 'low';
      const winners: number[] = [];
      const losers: number[] = [];

      this.state.currentTurnBets.forEach((bet) => {
        const bettor = this.state.players.find((p) => p.id === bet.playerId);
        if (bettor) {
          if (bet.bet === outcome) {
            bettor.coins += 5;
            winners.push(bettor.id);
          } else {
            // Optional penalty?
            bettor.coins = Math.max(0, bettor.coins - 2);
            losers.push(bettor.id);
          }
        }
      });

      this.state.rollBetResult = { winners, losers, outcome };
    }

    return this.state;
  }

  makeMove(userId: number): GameState {
    const playerIndex = this.state.currentPlayerIndex;
    const player = this.state.players[playerIndex];

    if (player.id !== userId) throw new Error('Not your turn');
    if (this.state.diceValue === null)
      throw new Error('You need to roll first');

    const dice = this.state.diceValue;
    const oldPosition = player.position;
    let newPosition = oldPosition + dice;

    // Handle goose double movement
    if (this.state.pendingGooseRoll) {
      newPosition = oldPosition + dice * 2;
      this.state.pendingGooseRoll = false;
    }

    // Must land exactly on 42 to win
    if (newPosition > BOARD_SIZE) {
      newPosition = BOARD_SIZE - (newPosition - BOARD_SIZE);
      this.state.lastMoveDescription = `${player.username} bounced back to tile ${newPosition}`;
    }

    // Apply tile effects
    const effect = getTileEffect(newPosition);
    newPosition = this.applyTileEffect(player, newPosition, effect);

    player.position = newPosition;
    this.state.diceValue = null;

    // Check win condition
    if (newPosition === BOARD_SIZE) {
      this.state.gameOver = true;
      this.state.winner = player;
      this.state.lastMoveDescription = `🎉 ${player.username} reaches tile 42 and WINS!`;
    } else if (!this.state.pendingGooseRoll && !this.state.activeChallenge) {
      this.nextTurn();
    }

    return this.state;
  }

  private applyTileEffect(
    player: GamePlayer,
    position: number,
    effect: TileEffectType,
  ): number {
    // Check if player has shield
    if (
      player.hasShield &&
      ['inn', 'well', 'prison', 'death'].includes(effect)
    ) {
      player.hasShield = false;
      this.state.lastMoveDescription = `${player.username}'s shield blocked the ${effect}!`;
      return position;
    }

    switch (effect) {
      case 'goose':
        player.coins += GOOSE_COIN_REWARD;
        this.state.pendingGooseRoll = true;
        this.state.lastMoveDescription = `${player.username} landed on a goose! +${GOOSE_COIN_REWARD} coins, roll again to double!`;
        return position;

      case 'bridge':
        this.state.lastMoveDescription = `${player.username} crossed the bridge from ${position} to 12!`;
        return 12;

      case 'inn':
        player.turnsToSkip = 1;
        this.state.lastMoveDescription = `${player.username} stays at the inn and skips 1 turn`;
        return position;

      case 'well':
        player.stuckInWell = true;
        player.turnsToSkip = 4; // 4 turn penalty instead of stuck forever
        this.state.lastMoveDescription = `${player.username} fell in the well! Skip 4 turns or pay 10 coins.`;
        return position;

      case 'labyrinth':
        this.state.lastMoveDescription = `${player.username} got lost in the labyrinth and goes back to 12!`;
        return 12;

      case 'prison':
        player.turnsToSkip = 2;
        this.state.lastMoveDescription = `${player.username} is in prison and skips 2 turns`;
        return position;

      case 'death':
        this.state.lastMoveDescription = `${player.username} landed on death and starts over!`;
        return 0;

      case 'challenge': {
        // Pick a random question
        const qIndex = Math.floor(Math.random() * CODING_QUESTIONS.length);
        const question = CODING_QUESTIONS[qIndex];
        this.state.activeChallenge = {
          playerId: player.id,
          questionId: question.id,
          questionText: question.question,
          options: question.options,
          reward: question.rewardCoins,
          bets: [],
        };
        this.state.lastMoveDescription = `${player.username} faces a Coding Challenge!`;
        return position;
      }

      case 'mystery': {
        const potentialEffects: TileEffectType[] = [
          'goose',
          'inn',
          'well',
          'prison',
          'death',
          'challenge',
        ];
        const randomEffect =
          potentialEffects[Math.floor(Math.random() * potentialEffects.length)];
        this.state.lastMoveDescription = `${player.username} landed on a Mystery Tile! It turned into... ${randomEffect}!`;
        // Recursively apply the new effect
        return this.applyTileEffect(player, position, randomEffect);
      }

      default:
        this.state.lastMoveDescription = `${player.username} moved to tile ${position}`;
        return position;
    }
  }

  // Submit challenge answer
  submitChallenge(userId: number, answerIndex: number): GameState {
    const challenge = this.state.activeChallenge;
    if (!challenge) throw new Error('No active challenge');
    if (challenge.playerId !== userId) throw new Error('Not your challenge');

    const question = CODING_QUESTIONS.find(
      (q) => q.id === challenge.questionId,
    );
    if (!question) throw new Error('Question not found'); // Should not happen

    const player = this.state.players.find((p) => p.id === userId);
    if (!player) throw new Error('Player not found');

    if (answerIndex === question.correctIndex) {
      player.coins += question.rewardCoins;
      this.state.lastMoveDescription = `✅ Correct! ${player.username} earned ${question.rewardCoins} coins!`;

      // Payout bets (SUCCESS)
      challenge.bets.forEach((bet) => {
        if (bet.prediction === 'success') {
          const bettor = this.state.players.find((p) => p.id === bet.playerId);
          if (bettor) bettor.coins += 5; // Fixed reward for simplicity
        } else {
          const bettor = this.state.players.find((p) => p.id === bet.playerId);
          if (bettor) bettor.coins = Math.max(0, bettor.coins - 5);
        }
      });
    } else {
      this.state.lastMoveDescription = `❌ Wrong! The correct answer was: ${question.options[question.correctIndex]}`;
      // Payout bets (FAIL)
      challenge.bets.forEach((bet) => {
        if (bet.prediction === 'fail') {
          const bettor = this.state.players.find((p) => p.id === bet.playerId);
          if (bettor) bettor.coins += 5;
        } else {
          const bettor = this.state.players.find((p) => p.id === bet.playerId);
          if (bettor) bettor.coins = Math.max(0, bettor.coins - 5);
        }
      });
    }

    // Clear challenge and move next
    this.state.activeChallenge = null;
    if (!this.state.pendingGooseRoll) {
      this.nextTurn();
    }
    return this.state;
  }

  // Escape from well, prison, or death by paying coins
  payToEscape(userId: number): GameState {
    const player = this.state.players.find((p) => p.id === userId);
    if (!player) throw new Error('Player not found');

    const currentPlayer = this.state.players[this.state.currentPlayerIndex];
    if (currentPlayer.id !== userId) throw new Error('Not your turn');

    const effect = getTileEffect(player.position);
    const cost = ESCAPE_COSTS[effect];

    if (!cost) throw new Error('Cannot escape from this tile');
    if (player.coins < cost)
      throw new Error(`Need ${cost} coins to escape (have ${player.coins})`);

    player.coins -= cost;

    // Logic to clear penalty
    if (effect === 'well' || effect === 'prison' || effect === 'inn') {
      player.turnsToSkip = 0;
      player.stuckInWell = false;
      this.state.lastMoveDescription = `${player.username} paid ${cost} coins to escape the ${effect}!`;
    } else if (effect === 'death') {
      // For death, they can pay to NOT restart - keep position
      this.state.lastMoveDescription = `${player.username} paid ${cost} coins to cheat death!`;
    }

    return this.state;
  }

  // Purchase an item from the shop
  purchaseItem(userId: number, itemId: string): GameState {
    const player = this.state.players.find((p) => p.id === userId);
    if (!player) throw new Error('Player not found');

    const item = SHOP_ITEMS.find((i) => i.id === itemId);
    if (!item) throw new Error('Item not found');
    let cost = item.cost;
    // Inflation Event
    if (this.state.currentGlobalEvent === 'inflation') {
      cost *= 2;
    }

    if (player.coins < cost)
      throw new Error(`Need ${cost} coins (have ${player.coins})`);

    player.coins -= cost;
    player.inventory.push({ itemId: item.id, name: item.name });

    this.state.lastMoveDescription = `${player.username} purchased ${item.name}!`;
    return this.state;
  }

  // Use an item from inventory
  useItem(userId: number, itemId: string, targetPlayerId?: number): GameState {
    const player = this.state.players.find((p) => p.id === userId);
    if (!player) throw new Error('Player not found');

    const itemIndex = player.inventory.findIndex((i) => i.itemId === itemId);
    if (itemIndex === -1) throw new Error('Item not in inventory');

    const item = SHOP_ITEMS.find((i) => i.id === itemId);
    if (!item) throw new Error('Item not found');

    // Remove item from inventory
    player.inventory.splice(itemIndex, 1);

    switch (itemId) {
      case 'skip_shield':
        player.hasShield = true;
        this.state.lastMoveDescription = `${player.username} activated a Skip Shield!`;
        break;

      case 'extra_roll':
        // Allow another roll after current move
        this.state.pendingGooseRoll = true;
        this.state.lastMoveDescription = `${player.username} uses Extra Roll!`;
        break;

      case 'freeze_trap': {
        if (!targetPlayerId) throw new Error('Must select a target player');
        const freezeTarget = this.state.players.find(
          (p) => p.id === targetPlayerId,
        );
        if (!freezeTarget) throw new Error('Target player not found');
        freezeTarget.turnsToSkip += 1;
        this.state.lastMoveDescription = `${player.username} froze ${freezeTarget.username} for 1 turn!`;
        break;
      }

      case 'pushback': {
        if (!targetPlayerId) throw new Error('Must select a target player');
        const pushTarget = this.state.players.find(
          (p) => p.id === targetPlayerId,
        );
        if (!pushTarget) throw new Error('Target player not found');
        pushTarget.position = Math.max(0, pushTarget.position - 3);
        this.state.lastMoveDescription = `${player.username} pushed ${pushTarget.username} back 3 tiles!`;
        break;
      }

      case 'swap_position': {
        if (!targetPlayerId) throw new Error('Must select a target player');
        const swapTarget = this.state.players.find(
          (p) => p.id === targetPlayerId,
        );
        if (!swapTarget) throw new Error('Target player not found');

        const tempPos = player.position;
        player.position = swapTarget.position;
        swapTarget.position = tempPos;

        this.state.lastMoveDescription = `${player.username} swapped positions with ${swapTarget.username}!`;
        break;
      }

      case 'chaos_orb': {
        // Shuffle all positions
        const positions = this.state.players.map((p) => p.position);
        for (let i = positions.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [positions[i], positions[j]] = [positions[j], positions[i]];
        }
        this.state.players.forEach((p, index) => {
          p.position = positions[index];
        });
        this.state.lastMoveDescription = `🔮 CHAOS ORB USED! All positions shuffled!`;
        break;
      }

      default:
        throw new Error('Unknown item');
    }

    return this.state;
  }

  // Rescue player from well when landing on same tile
  private rescueFromWell(position: number, rescuer: GamePlayer): void {
    const stuckPlayer = this.state.players.find(
      (p) => p.stuckInWell && p.position === position && p.id !== rescuer.id,
    );
    if (stuckPlayer) {
      stuckPlayer.stuckInWell = false;
      this.state.lastMoveDescription += ` ${rescuer.username} rescued ${stuckPlayer.username} from the well!`;
    }
  }

  private nextTurn(): void {
    this.state.currentPlayerIndex =
      (this.state.currentPlayerIndex + 1) % this.state.players.length;

    // Clear bets for new turn
    this.state.currentTurnBets = [];

    // Only increment turn count when circle completes (optional, or just every turn)
    // Let's do every turn for now, simple counter
    this.state.turnCount++;

    // Global Event Logic (every 5 turns? or every 5 rounds?)
    // Let's say every 10 turns (approx 2-3 rounds with 4 players)
    if (this.state.turnCount > 0 && this.state.turnCount % 10 === 0) {
      const events: ('gravity_flux' | 'inflation' | 'windy')[] = [
        'gravity_flux',
        'inflation',
        'windy',
      ];
      const newEvent = events[Math.floor(Math.random() * events.length)];
      this.state.currentGlobalEvent = newEvent;
      this.state.lastMoveDescription = `🌍 GLOBAL EVENT: ${newEvent.toUpperCase()}! (Lasts 10 turns)`;
    } else if (this.state.turnCount % 10 === 9) {
      // Clear event before next trigger
      this.state.currentGlobalEvent = null;
    }

    // Bounty Logic: Update every turn
    const sorted = [...this.state.players].sort(
      (a, b) => a.position - b.position,
    );
    // Only assign bounty if positions distinct and count > 1 (lowest position is index 0)
    if (sorted.length > 1) {
      this.state.bountyTargetId = sorted[0].id; // Last place is actually earliest position (lowest number)
    } else {
      this.state.bountyTargetId = null;
    }
  }

  addPlayer(user: User): boolean {
    if (this.state.players.length >= this.MAX_PLAYERS) return false;
    if (this.state.players.find((p) => p.id === user.id)) return true;

    const order = this.state.players.length;
    const newPlayer: GamePlayer = {
      id: user.id,
      username: user.username,
      color: this.COLORS[order],
      position: 0,
      order: order,
      coins: STARTING_COINS,
      turnsToSkip: 0,
      stuckInWell: false,
      hasShield: false,
      inventory: [],
    };

    this.state.players.push(newPlayer);
    return true;
  }

  getState(): GameState {
    return this.state;
  }

  placeBet(userId: number, prediction: 'success' | 'fail'): GameState {
    const challenge = this.state.activeChallenge;
    if (!challenge) throw new Error('No active challenge');
    if (challenge.playerId === userId)
      throw new Error('Cannot bet on yourself');

    // Check if already bet
    if (challenge.bets.find((b) => b.playerId === userId))
      throw new Error('Already placed a bet');

    challenge.bets.push({ playerId: userId, prediction });
    // DEDUCT COST? Maybe free to bet for now to encourage it?
    // Let's make it risk/reward: win=5, lose=-5 (implemented in resolution)

    return this.state;
  }

  placeRollBet(userId: number, prediction: 'low' | 'high'): GameState {
    // 1. Can only bet if dice not rolled yet
    if (this.state.diceValue !== null) throw new Error('Roll already happened');

    // 2. Cannot bet on yourself
    if (this.state.players[this.state.currentPlayerIndex].id === userId) {
      throw new Error('Cannot bet on your own roll');
    }

    // 3. Check if already bet
    if (this.state.currentTurnBets.find((b) => b.playerId === userId)) {
      throw new Error('Already placed a bet for this turn');
    }

    this.state.currentTurnBets.push({ playerId: userId, bet: prediction });
    return this.state;
  }
}
