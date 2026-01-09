import { useState, useCallback } from 'react';
import { BOARD_SIZE, checkTileEffect, mockPlayers } from '../utils/gameData';

export interface GamePlayer {
  id: string;
  name: string;
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
  moveHistory: string[];
}

export const useGameLogic = () => {
  const [gameState, setGameState] = useState<GameState>({
    players: mockPlayers.map((p) => ({ ...p })),
    currentPlayerIndex: 0,
    diceValue: null,
    gameOver: false,
    winner: null,
    moveHistory: [],
  });

  const rollDice = useCallback(() => {
    if (gameState.gameOver) return;

    const dice = Math.floor(Math.random() * 6) + 1;

    setGameState((prev) => ({
      ...prev,
      diceValue: dice,
    }));

    return dice;
  }, [gameState.gameOver]);

  const movePlayer = useCallback(
    (diceValue: number) => {
      if (gameState.gameOver) return;

      setGameState((prev) => {
        const newPlayers = [...prev.players];
        const currentPlayer = newPlayers[prev.currentPlayerIndex];
        let newPosition = currentPlayer.position + diceValue;

        // Check if player reached or passed the end
        if (newPosition >= BOARD_SIZE) {
          newPosition = BOARD_SIZE;
        } else {
          // Check for snake or ladder
          newPosition = checkTileEffect(newPosition);
        }

        const oldPosition = currentPlayer.position;
        currentPlayer.position = newPosition;

        // Check win condition
        const isWinner = newPosition === BOARD_SIZE;
        const moveMsg = `${currentPlayer.name} rolled ${diceValue} and moved from ${oldPosition} to ${newPosition}`;

        const newMoveHistory = [...prev.moveHistory, moveMsg];

        if (isWinner) {
          return {
            ...prev,
            players: newPlayers,
            gameOver: true,
            winner: currentPlayer,
            moveHistory: newMoveHistory,
            diceValue: null,
          };
        }

        // Next player
        const nextPlayerIndex = (prev.currentPlayerIndex + 1) % prev.players.length;

        return {
          ...prev,
          players: newPlayers,
          currentPlayerIndex: nextPlayerIndex,
          moveHistory: newMoveHistory,
          diceValue: null,
        };
      });
    },
    [gameState.gameOver]
  );

  const resetGame = useCallback(() => {
    setGameState({
      players: mockPlayers.map((p) => ({ ...p })),
      currentPlayerIndex: 0,
      diceValue: null,
      gameOver: false,
      winner: null,
      moveHistory: [], 
    });
  }, []);

  const autoPlayCPU = useCallback(() => {
    const currentPlayer = gameState.players[gameState.currentPlayerIndex];
    if (currentPlayer.id !== 'player1' && !gameState.gameOver) {
      setTimeout(() => {
        const dice = rollDice();
        if (dice) {
          setTimeout(() => {
            movePlayer(dice);
          }, 500);
        }
      }, 1000);
    }
  }, [gameState, rollDice, movePlayer]);

  return {
    gameState,
    rollDice,
    movePlayer,
    resetGame,
    autoPlayCPU,
  };
};
