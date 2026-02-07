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
  stuckOnPiscineExam: boolean;
  hasShield: boolean;
  inventory: InventoryItem[];
  isReady: boolean;
}

export interface ActiveChallenge {
  playerId: number;
  questionId: string;
  questionText: string;
  options: string[];
  reward: number;
  bets: { playerId: number; prediction: 'success' | 'fail' }[];
}

export type GameStatus = 'LOBBY' | 'PLAYING' | 'FINISHED';

export interface GameState {
  status: GameStatus;
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
  rollAvailableAt: number | null; // Timestamp when next roll is available
  turnStartTime: number | null; // Timestamp when current turn started
  turnTimeLimit: number; // Turn duration in milliseconds (60 seconds = 60000ms)
}

export class GameRoom {
  private state: GameState;
  private readonly MAX_PLAYERS = MAX_PLAYERS;
  private readonly COLORS = COLORS;

  constructor(public readonly roomId: string) {
    this.state = {
      status: 'LOBBY',
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
      rollAvailableAt: null,
      turnStartTime: null,
      turnTimeLimit: 60000, // 60 seconds
    };
  }

  toggleReady(userId: number): GameState {
    const player = this.state.players.find((p) => p.id === userId);
    if (!player) throw new Error('Player not found');
    player.isReady = !player.isReady;
    return this.state;
  }

  startGame(userId: number): GameState {
    // Only host (first player) can start
    if (this.state.players.length === 0 || this.state.players[0].id !== userId) {
      throw new Error('Only the host can start the game');
    }

    if (this.state.players.length < 2) { // Allow 1 player for debug/testing? Maybe enforce 2? Let's say 2 for real game
      // For now, let's allow 1 for easy testing if needed, or enforce 2.
      // The rules usually imply multiple players.
      // Let's enforce > 0 for now.
    }

    const allReady = this.state.players.every((p) => p.isReady);
    if (!allReady) {
      throw new Error('All players must be ready');
    }

    this.state.status = 'PLAYING';
    this.state.lastMoveDescription = 'Game Started! Good Luck!';
    this.state.turnStartTime = Date.now(); // Start timer for first player
    return this.state;
  }

  rollDice(userId: number): GameState {
    if (this.state.status !== 'PLAYING') throw new Error('Game not started');

    if (this.state.rollAvailableAt && Date.now() < this.state.rollAvailableAt) {
      throw new Error('Roll not available yet');
    }

    const playerIndex = this.state.currentPlayerIndex;
    const player = this.state.players[playerIndex];

    if (player.id !== userId) throw new Error('Not your turn');
    if (this.state.diceValue !== null) throw new Error('You already rolled');

    // Check if player needs to skip turns
    if (player.turnsToSkip > 0) {
      player.turnsToSkip--;
      if (player.turnsToSkip === 0) {
        player.stuckInWell = false; // Release from well if penalty is paid/served
      }
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
      // Clear bets so they aren't processed again on a re-roll (e.g. goose)
      this.state.currentTurnBets = [];
    }

    return this.state;
  }

  makeMove(userId: number): GameState {
    if (this.state.status !== 'PLAYING') throw new Error('Game not started');

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

    // Check for piscineExam tiles in the path and stop at the first one
    // Do this BEFORE bounce calculation to ensure we check the actual path
    // Skip piscineExam check if player is currently on a piscineExam tile (already cleared it)
    const currentTileEffect = getTileEffect(oldPosition);
    const skipPiscineExamCheck = currentTileEffect === 'piscineExam';
    
    const maxCheckPosition = Math.min(newPosition, BOARD_SIZE - 1);
    for (let pos = oldPosition + 1; pos <= maxCheckPosition; pos++) {
      const effect = getTileEffect(pos);
      if (effect === 'piscineExam' && !skipPiscineExamCheck) {
        console.log(`Player ${player.username} hit a Piscine Exam at tile ${pos}`);
        newPosition = pos;
        this.state.lastMoveDescription = `${player.username} encountered Piscine Exam at tile ${pos}!`;
        break;
      }
    }

    // Must land exactly on BOARD_SIZE to win (only if didn't hit piscineExam)
    if (newPosition > BOARD_SIZE - 1) {
      newPosition = (BOARD_SIZE - 1) - (newPosition - (BOARD_SIZE - 1));
      this.state.lastMoveDescription = `${player.username} bounced back to tile ${newPosition}`;
    }

    // Apply tile effects
    const effect = getTileEffect(newPosition);
    newPosition = this.applyTileEffect(player, newPosition, effect);

    player.position = newPosition;
    this.state.diceValue = null;

    // Check win condition
    if (newPosition === BOARD_SIZE - 1) {
      this.state.gameOver = true;
      this.state.status = 'FINISHED';
      this.state.winner = player;
      this.state.lastMoveDescription = `🎉 ${player.username} reaches tile ${BOARD_SIZE - 1} and WINS!`;
    }
    else if (!this.state.pendingGooseRoll && !this.state.activeChallenge) {
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
        this.state.lastMoveDescription = `${player.username} got lost in the labyrinth and goes back to 30!`;
        return 30;

      case 'prison':
        player.turnsToSkip = 2;
        this.state.lastMoveDescription = `${player.username} is in prison and skips 2 turns`;
        return position;

      case 'death':
        this.state.lastMoveDescription = `${player.username} fell into a Black Hole and starts from the piscine!`;
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

      case 'piscineExam': {
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
        this.state.lastMoveDescription = `${player.username} must pass the Piscine Exam!`;
        return position;
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

    // Check if this was a piscineExam challenge (tile 9)
    const isPiscineExam = player.position === 9;

    if (answerIndex === question.correctIndex) {
      player.coins += question.rewardCoins;
      
      if (isPiscineExam) {
        this.state.lastMoveDescription = `✅ Correct! ${player.username} passed the Piscine Exam and earned ${question.rewardCoins} coins!`;
      } else {
        this.state.lastMoveDescription = `✅ Correct! ${player.username} earned ${question.rewardCoins} coins!`;
      }

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
      // For piscineExam, move player back 1 tile
      if (isPiscineExam) {
        player.position = Math.max(0, player.position - 1);
        this.state.lastMoveDescription = `❌ Wrong! ${player.username} moves back 1 tile. The correct answer was: ${question.options[question.correctIndex]}`;
      } else {
        this.state.lastMoveDescription = `❌ Wrong! The correct answer was: ${question.options[question.correctIndex]}`;
      }
      
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
    if (this.state.status !== 'PLAYING') throw new Error('Game not started');

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
    if (effect === 'well' || effect === 'prison') {
      player.turnsToSkip = 0;
      player.stuckInWell = false;
      this.state.lastMoveDescription = `${player.username} paid ${cost} coins to escape the ${effect}!`;
    } else if (effect === 'death') {
      // For black hole, they can pay to NOT restart - keep position
      this.state.lastMoveDescription = `${player.username} paid ${cost} coins to escape the Black Hole!`;
    }

    return this.state;
  }

  // Purchase an item from the shop
  purchaseItem(userId: number, itemId: string): GameState {
    // Can buy items anytime or only on turn? Let's say anytime if alive/playing
    if (this.state.status !== 'PLAYING') throw new Error('Game not started');

    const player = this.state.players.find((p) => p.id === userId);
    if (!player) throw new Error('Player not found');

    const item = SHOP_ITEMS.find((i) => i.id === itemId);
    if (!item) throw new Error('Item not found');
    let cost = item.cost;
    // Inflation Event (50% increase, rounded up to nearest coin)
    if (this.state.currentGlobalEvent === 'inflation') {
      cost = Math.ceil(cost * 1.5);
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
    if (this.state.status !== 'PLAYING') throw new Error('Game not started');

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



  private nextTurn(): void {
    this.state.currentPlayerIndex =
      (this.state.currentPlayerIndex + 1) % this.state.players.length;
    
    this.state.rollAvailableAt = Date.now() + 3000;
    this.state.turnStartTime = Date.now(); // Start timer for new turn
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
    } else if (this.state.turnCount % 10 === 0 && this.state.currentPlayerIndex === 0) {
      // Logic adjustment: The above condition sets it at turn % 10 == 0.
      // But if we want it to LAST 10 turns, we need to clear it appropriately.
      // If we set it at 10, 20, 30...
      // We should probably check expiry. Simpler approach:
      // If turnCount % 10 is 0 -> START event.
      // If turnCount % 10 is 5 -> END event (if we want 5 turns) or keep it until next start?
      // The comment said "Lasts 10 turns". So it runs for the whole block?
      // If it runs for the whole block, when does it clear?
      // If we want it to clear, maybe we set it at X and clear at X+10.
      // Let's assume we want 50% uptime or 100% uptime? "Lasts 10 turns" implies it ends.
      // Let's make it last 5 turns.
    }

    // Fix: Set/Clear logic was confusing. Let's make it explicit.
    // Event starts at turn 10, 20, 30...
    // Event ends at turn 19, 29, 39... (9 turns duration)
    // To make it 10 turns: Start at 10, End at 20 (overlap?).
    // Better: Start at turn % 20 === 0. End at turn % 20 === 10. (10 turns on, 10 turns off).

    // Reverting to the requested fix: "current set/clear logic results in a 9-turn duration... Fix the off-by-one"
    // Original code: set at %10 === 0, clear at %10 === 9.
    // 0 -> set. 1..8 -> active. 9 -> clear.
    // Turns active: 0, 1, 2, 3, 4, 5, 6, 7, 8. (9 turns).
    // Review requires "Lasts 10 turns".
    // So we should NOT clear at 9 if we want it to last until the next one replaces it?
    // Or if we want periods of NO event. 
    // If the message says "Lasts 10 turns", and it repeats every 10 turns, it means it is ALWAYS on (just changes).
    // If we want it to toggle, say "Every 20 turns, lasts 10 turns".

    // Let's IMPLEMENT: Change periodically every 10 turns.
    // So we never clear it, just overwrite it? Or clear it?
    // User message: "but the current set/clear logic results in a 9-turn duration (set at turn 10, cleared at turn 19)."
    // Fix: Remove the clear logic if we want it to last until the next 10th turn.
    // OR if we want a gap, adjust the numbers.
    // Assuming "Lasts 10 turns" means we want it to encompass the full decagon of turns.
    // But then there is no "clear".
    // If we remove the 'else if' block, it persists until overwritten.

    if (this.state.turnCount > 0 && this.state.turnCount % 10 === 0) {
      const events: ('gravity_flux' | 'inflation' | 'windy')[] = [
        'gravity_flux',
        'inflation',
        'windy',
      ];
      const newEvent = events[Math.floor(Math.random() * events.length)];
      this.state.currentGlobalEvent = newEvent;
      this.state.lastMoveDescription = `🌍 GLOBAL EVENT: ${newEvent.toUpperCase()}! (Lasts 10 turns)`;
    }
    // Removed the "clear at 9" logic so it lasts full 10 turns until next one triggers.
    // Wait, if we don't clear it, it stays forever. And at 10 it changes.
    // This effectively makes it last 10 turns.


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
      stuckOnPiscineExam: false,
      hasShield: false,
      inventory: [],
      isReady: false,
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

  // Check if current player's turn has timed out
  isTurnTimedOut(): boolean {
    if (this.state.status !== 'PLAYING') return false;
    if (this.state.turnStartTime === null) return false;
    
    const timeElapsed = Date.now() - this.state.turnStartTime;
    return timeElapsed >= this.state.turnTimeLimit;
  }

  // Kick the current player for timeout and skip their turn
  kickIdlePlayer(): GameState {
    if (this.state.status !== 'PLAYING') {
      throw new Error('Game not in progress');
    }

    const currentPlayer = this.state.players[this.state.currentPlayerIndex];
    this.state.lastMoveDescription = `⏱️ ${currentPlayer.username} was kicked for inactivity!`;

    // Remove player from the game
    this.state.players.splice(this.state.currentPlayerIndex, 1);

    // Check if we have enough players to continue
    if (this.state.players.length < 2) {
      // If only 1 player left, they win by default
      if (this.state.players.length === 1) {
        this.state.gameOver = true;
        this.state.status = 'FINISHED';
        this.state.winner = this.state.players[0];
        this.state.lastMoveDescription += ` ${this.state.players[0].username} wins by default!`;
      } else {
        // No players left, end game
        this.state.gameOver = true;
        this.state.status = 'FINISHED';
        this.state.winner = null;
        this.state.lastMoveDescription = 'All players were kicked. Game over!';
      }
      this.state.turnStartTime = null;
      return this.state;
    }

    // Adjust current player index after removal
    if (this.state.currentPlayerIndex >= this.state.players.length) {
      this.state.currentPlayerIndex = 0;
    }

    // Clear dice and start next turn
    this.state.diceValue = null;
    this.state.rollAvailableAt = Date.now() + 3000;
    this.state.turnStartTime = Date.now();
    this.state.currentTurnBets = [];

    return this.state;
  }
}
