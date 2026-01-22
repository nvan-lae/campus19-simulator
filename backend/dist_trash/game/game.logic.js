"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameRoom = void 0;
const game_constants_1 = require("./game.constants");
class GameRoom {
    constructor(roomId) {
        this.roomId = roomId;
        this.MAX_PLAYERS = game_constants_1.MAX_PLAYERS;
        this.COLORS = game_constants_1.COLORS;
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
        };
    }
    rollDice(userId) {
        const playerIndex = this.state.currentPlayerIndex;
        const player = this.state.players[playerIndex];
        if (player.id !== userId)
            throw new Error('Not your turn');
        if (this.state.diceValue !== null)
            throw new Error('You already rolled');
        if (player.turnsToSkip > 0) {
            player.turnsToSkip--;
            this.state.lastMoveDescription = `${player.username} skips a turn (${player.turnsToSkip} remaining)`;
            this.nextTurn();
            return this.state;
        }
        if (player.stuckInWell) {
            this.state.lastMoveDescription = `${player.username} is stuck in the well! Pay 10 coins or wait for rescue.`;
            return this.state;
        }
        if (this.state.activeChallenge &&
            this.state.activeChallenge.playerId === userId) {
            throw new Error('Must complete challenge first');
        }
        let dice = Math.floor(Math.random() * 6) + 1;
        if (this.state.currentGlobalEvent === 'gravity_flux') {
            dice += 2;
        }
        else if (this.state.currentGlobalEvent === 'windy') {
            dice = Math.max(1, dice - 1);
        }
        this.state.diceValue = dice;
        this.state.lastMoveDescription = `${player.username} rolled a ${dice}...`;
        return this.state;
    }
    makeMove(userId) {
        const playerIndex = this.state.currentPlayerIndex;
        const player = this.state.players[playerIndex];
        if (player.id !== userId)
            throw new Error('Not your turn');
        if (this.state.diceValue === null)
            throw new Error('You need to roll first');
        const dice = this.state.diceValue;
        const oldPosition = player.position;
        let newPosition = oldPosition + dice;
        if (this.state.pendingGooseRoll) {
            newPosition = oldPosition + dice * 2;
            this.state.pendingGooseRoll = false;
        }
        if (newPosition > game_constants_1.BOARD_SIZE) {
            newPosition = game_constants_1.BOARD_SIZE - (newPosition - game_constants_1.BOARD_SIZE);
            this.state.lastMoveDescription = `${player.username} bounced back to tile ${newPosition}`;
        }
        const effect = (0, game_constants_1.getTileEffect)(newPosition);
        newPosition = this.applyTileEffect(player, newPosition, effect);
        player.position = newPosition;
        this.state.diceValue = null;
        if (newPosition === game_constants_1.BOARD_SIZE) {
            this.state.gameOver = true;
            this.state.winner = player;
            this.state.lastMoveDescription = `🎉 ${player.username} reaches tile 42 and WINS!`;
        }
        else if (!this.state.pendingGooseRoll && !this.state.activeChallenge) {
            this.nextTurn();
        }
        return this.state;
    }
    applyTileEffect(player, position, effect) {
        if (player.hasShield &&
            ['inn', 'well', 'prison', 'death'].includes(effect)) {
            player.hasShield = false;
            this.state.lastMoveDescription = `${player.username}'s shield blocked the ${effect}!`;
            return position;
        }
        switch (effect) {
            case 'goose':
                player.coins += game_constants_1.GOOSE_COIN_REWARD;
                this.state.pendingGooseRoll = true;
                this.state.lastMoveDescription = `${player.username} landed on a goose! +${game_constants_1.GOOSE_COIN_REWARD} coins, roll again to double!`;
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
                this.state.lastMoveDescription = `${player.username} fell in the well! Pay 10 coins or wait for rescue.`;
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
                const qIndex = Math.floor(Math.random() * game_constants_1.CODING_QUESTIONS.length);
                const question = game_constants_1.CODING_QUESTIONS[qIndex];
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
                const potentialEffects = ['goose', 'inn', 'well', 'prison', 'death', 'challenge'];
                const randomEffect = potentialEffects[Math.floor(Math.random() * potentialEffects.length)];
                this.state.lastMoveDescription = `${player.username} landed on a Mystery Tile! It turned into... ${randomEffect}!`;
                return this.applyTileEffect(player, position, randomEffect);
            }
            default:
                this.state.lastMoveDescription = `${player.username} moved to tile ${position}`;
                return position;
        }
    }
    submitChallenge(userId, answerIndex) {
        const challenge = this.state.activeChallenge;
        if (!challenge)
            throw new Error('No active challenge');
        if (challenge.playerId !== userId)
            throw new Error('Not your challenge');
        const question = game_constants_1.CODING_QUESTIONS.find((q) => q.id === challenge.questionId);
        if (!question)
            throw new Error('Question not found');
        const player = this.state.players.find((p) => p.id === userId);
        if (!player)
            throw new Error('Player not found');
        if (answerIndex === question.correctIndex) {
            player.coins += question.rewardCoins;
            this.state.lastMoveDescription = `✅ Correct! ${player.username} earned ${question.rewardCoins} coins!`;
            challenge.bets.forEach(bet => {
                if (bet.prediction === 'success') {
                    const bettor = this.state.players.find(p => p.id === bet.playerId);
                    if (bettor)
                        bettor.coins += 5;
                }
                else {
                    const bettor = this.state.players.find(p => p.id === bet.playerId);
                    if (bettor)
                        bettor.coins = Math.max(0, bettor.coins - 5);
                }
            });
        }
        else {
            this.state.lastMoveDescription = `❌ Wrong! The correct answer was: ${question.options[question.correctIndex]}`;
            challenge.bets.forEach(bet => {
                if (bet.prediction === 'fail') {
                    const bettor = this.state.players.find(p => p.id === bet.playerId);
                    if (bettor)
                        bettor.coins += 5;
                }
                else {
                    const bettor = this.state.players.find(p => p.id === bet.playerId);
                    if (bettor)
                        bettor.coins = Math.max(0, bettor.coins - 5);
                }
            });
        }
        this.state.activeChallenge = null;
        if (!this.state.pendingGooseRoll) {
            this.nextTurn();
        }
        return this.state;
    }
    payToEscape(userId) {
        const player = this.state.players.find((p) => p.id === userId);
        if (!player)
            throw new Error('Player not found');
        const currentPlayer = this.state.players[this.state.currentPlayerIndex];
        if (currentPlayer.id !== userId)
            throw new Error('Not your turn');
        const effect = (0, game_constants_1.getTileEffect)(player.position);
        const cost = game_constants_1.ESCAPE_COSTS[effect];
        if (!cost)
            throw new Error('Cannot escape from this tile');
        if (player.coins < cost)
            throw new Error(`Need ${cost} coins to escape (have ${player.coins})`);
        player.coins -= cost;
        if (player.stuckInWell) {
            player.stuckInWell = false;
            this.state.lastMoveDescription = `${player.username} paid ${cost} coins to escape the well!`;
        }
        else if (player.turnsToSkip > 0) {
            player.turnsToSkip = 0;
            this.state.lastMoveDescription = `${player.username} paid ${cost} coins to escape!`;
        }
        else if (effect === 'death') {
            this.state.lastMoveDescription = `${player.username} paid ${cost} coins to cheat death!`;
        }
        return this.state;
    }
    purchaseItem(userId, itemId) {
        const player = this.state.players.find((p) => p.id === userId);
        if (!player)
            throw new Error('Player not found');
        const item = game_constants_1.SHOP_ITEMS.find((i) => i.id === itemId);
        if (!item)
            throw new Error('Item not found');
        let cost = item.cost;
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
    useItem(userId, itemId, targetPlayerId) {
        const player = this.state.players.find((p) => p.id === userId);
        if (!player)
            throw new Error('Player not found');
        const itemIndex = player.inventory.findIndex((i) => i.itemId === itemId);
        if (itemIndex === -1)
            throw new Error('Item not in inventory');
        const item = game_constants_1.SHOP_ITEMS.find((i) => i.id === itemId);
        if (!item)
            throw new Error('Item not found');
        player.inventory.splice(itemIndex, 1);
        switch (itemId) {
            case 'skip_shield':
                player.hasShield = true;
                this.state.lastMoveDescription = `${player.username} activated a Skip Shield!`;
                break;
            case 'extra_roll':
                this.state.pendingGooseRoll = true;
                this.state.lastMoveDescription = `${player.username} uses Extra Roll!`;
                break;
            case 'freeze_trap': {
                if (!targetPlayerId)
                    throw new Error('Must select a target player');
                const freezeTarget = this.state.players.find((p) => p.id === targetPlayerId);
                if (!freezeTarget)
                    throw new Error('Target player not found');
                freezeTarget.turnsToSkip += 1;
                this.state.lastMoveDescription = `${player.username} froze ${freezeTarget.username} for 1 turn!`;
                break;
            }
            case 'pushback': {
                if (!targetPlayerId)
                    throw new Error('Must select a target player');
                const pushTarget = this.state.players.find((p) => p.id === targetPlayerId);
                if (!pushTarget)
                    throw new Error('Target player not found');
                pushTarget.position = Math.max(0, pushTarget.position - 3);
                this.state.lastMoveDescription = `${player.username} pushed ${pushTarget.username} back 3 tiles!`;
                break;
            }
            case 'swap_position': {
                if (!targetPlayerId)
                    throw new Error('Must select a target player');
                const swapTarget = this.state.players.find((p) => p.id === targetPlayerId);
                if (!swapTarget)
                    throw new Error('Target player not found');
                const tempPos = player.position;
                player.position = swapTarget.position;
                swapTarget.position = tempPos;
                this.state.lastMoveDescription = `${player.username} swapped positions with ${swapTarget.username}!`;
                break;
            }
            case 'chaos_orb': {
                const positions = this.state.players.map(p => p.position);
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
    rescueFromWell(position, rescuer) {
        const stuckPlayer = this.state.players.find((p) => p.stuckInWell && p.position === position && p.id !== rescuer.id);
        if (stuckPlayer) {
            stuckPlayer.stuckInWell = false;
            this.state.lastMoveDescription += ` ${rescuer.username} rescued ${stuckPlayer.username} from the well!`;
        }
    }
    nextTurn() {
        this.state.currentPlayerIndex =
            (this.state.currentPlayerIndex + 1) % this.state.players.length;
        this.state.turnCount++;
        if (this.state.turnCount > 0 && this.state.turnCount % 10 === 0) {
            const events = ['gravity_flux', 'inflation', 'windy'];
            const newEvent = events[Math.floor(Math.random() * events.length)];
            this.state.currentGlobalEvent = newEvent;
            this.state.lastMoveDescription = `🌍 GLOBAL EVENT: ${newEvent.toUpperCase()}! (Lasts 10 turns)`;
        }
        else if (this.state.turnCount % 10 === 9) {
            this.state.currentGlobalEvent = null;
        }
        const sorted = [...this.state.players].sort((a, b) => a.position - b.position);
        if (sorted.length > 1) {
            this.state.bountyTargetId = sorted[0].id;
        }
        else {
            this.state.bountyTargetId = null;
        }
    }
    addPlayer(user) {
        if (this.state.players.length >= this.MAX_PLAYERS)
            return false;
        if (this.state.players.find((p) => p.id === user.id))
            return true;
        const order = this.state.players.length;
        const newPlayer = {
            id: user.id,
            username: user.username,
            color: this.COLORS[order],
            position: 0,
            order: order,
            coins: game_constants_1.STARTING_COINS,
            turnsToSkip: 0,
            stuckInWell: false,
            hasShield: false,
            inventory: [],
        };
        this.state.players.push(newPlayer);
        return true;
    }
    getState() {
        return this.state;
    }
    placeBet(userId, prediction) {
        const challenge = this.state.activeChallenge;
        if (!challenge)
            throw new Error('No active challenge');
        if (challenge.playerId === userId)
            throw new Error('Cannot bet on yourself');
        if (challenge.bets.find(b => b.playerId === userId))
            throw new Error('Already placed a bet');
        challenge.bets.push({ playerId: userId, prediction });
        return this.state;
    }
}
exports.GameRoom = GameRoom;
//# sourceMappingURL=game.logic.js.map