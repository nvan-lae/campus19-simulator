import { GameRoom } from './game.logic';
import { STARTING_COINS } from '@campus19/shared';

describe('GameRoom Logic', () => {
    let gameRoom: GameRoom;
    const mockUser1 = {
        id: 1,
        email: 'p1@test.com',
        username: 'Player1',
        password: 'pw',
        avatarUrl: null,
        intraId: null,
      
        twoFactorEnabled: false,
        twoFactorSecretEncrypted: null,
        twoFactorRecoveryHashes: null,
        twoFactorConfirmedAt: null,
        securityQuestion: null,
        securityAnswerHash: null,
      
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      const mockUser2 = {
        id: 2,
        email: 'p2@test.com',
        username: 'Player2',
        password: 'pw',
        avatarUrl: null,
        intraId: null,
      
        twoFactorEnabled: false,
        twoFactorSecretEncrypted: null,
        twoFactorRecoveryHashes: null,
        twoFactorConfirmedAt: null,
        securityQuestion: null,
        securityAnswerHash: null,
      
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      

    beforeEach(() => {
        gameRoom = new GameRoom('test-room');
        gameRoom.addPlayer(mockUser1);
        gameRoom.addPlayer(mockUser2);
        // Start game flow
        gameRoom.toggleReady(mockUser1.id);
        gameRoom.toggleReady(mockUser2.id);
        gameRoom.startGame(mockUser1.id);
    });

    it('should allow buying and using swap_position', () => {
        const p1 = gameRoom.getState().players[0];
        const p2 = gameRoom.getState().players[1];

        // Give coins
        p1.coins = 100;

        // Set positions
        p1.position = 5;
        p2.position = 10;

        // Buy item (Swap Position cost is 15)
        gameRoom.purchaseItem(p1.id, 'swap_position');
        expect(p1.inventory).toContainEqual(
            expect.objectContaining({ itemId: 'swap_position' }),
        );
        expect(p1.coins).toBe(85);

        // Use item
        gameRoom.useItem(p1.id, 'swap_position', p2.id);

        // Verify swap
        expect(p1.position).toBe(10);
        expect(p2.position).toBe(5);
        expect(p1.inventory).toHaveLength(0);
    });

    it('should handle betting on rolls correctly', () => {
        const p1 = gameRoom.getState().players[0];
        const p2 = gameRoom.getState().players[1];

        // Ensure it's p1's turn
        expect(gameRoom.getState().currentPlayerIndex).toBe(0);

        // p2 places a bet on p1's roll (e.g. HIGH)
        gameRoom.placeRollBet(p2.id, 'high');
        expect(gameRoom.getState().currentTurnBets).toHaveLength(1);

        // p1 rolls
        gameRoom.rollDice(p1.id);

        const state = gameRoom.getState();
        expect(state.diceValue).not.toBeNull();
        expect(state.rollBetResult).not.toBeNull();

        const dice = state.diceValue!;
        const outcome = dice >= 4 ? 'high' : 'low';

        expect(state.rollBetResult?.outcome).toBe(outcome);

        if (outcome === 'high') {
            expect(state.rollBetResult?.winners).toContain(p2.id);
            // p2 started with STARTING_COINS, +5
            expect(gameRoom.getState().players[1].coins).toBe(STARTING_COINS + 5);
        } else {
            expect(state.rollBetResult?.losers).toContain(p2.id);
            // p2 started with STARTING_COINS, -2
            expect(gameRoom.getState().players[1].coins).toBe(STARTING_COINS - 2);
        }
    });
});
