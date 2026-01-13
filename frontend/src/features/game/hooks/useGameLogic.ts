import { useState, useEffect, useCallback } from 'react';
import { useSocket } from '../../../contexts/SocketContext';
import { useParams } from 'react-router-dom';
import type { GameState } from '../../../types/game';

export const useGameLogic = () => {
  const { socket } = useSocket();
  const { gameId } = useParams<{ gameId: string }>(); 
  
  const [gameState, setGameState] = useState<GameState | null>(null);

  useEffect(() => {
    if (!socket || !gameId) return;

    socket.emit('join_game', { gameId });

    socket.on('game_state_update', (newState: GameState) => {
      // console.log('Game state updated:', newState);
      setGameState(newState);
    });

    socket.on('game_error', (error: { message: string }) => {
      console.error("Game Error:", error.message);
    });

    return () => {
      socket.off('game_state_update');
      socket.off('game_error');
    };
  }, [socket, gameId]);

  const rollDice = useCallback(() => {
    if (!socket || !gameId) return;
    socket.emit('roll_dice', { gameId });
  }, [socket, gameId]);

  const movePlayer = useCallback((_steps: number) => {
    if (!socket || !gameId) return;
    // Emit the new event
    socket.emit('move_player', { gameId });
  }, [socket, gameId]);
  
  const autoPlayCPU = useCallback(() => {
    // console.log("CPU Auto-play triggered (not implemented)");
  }, []);

  const resetGame = useCallback(() => {
    // console.log("Reset game not implemented yet");
  }, []);

  return {
    gameState,
    rollDice,
    movePlayer,
    resetGame,
    autoPlayCPU,
    players: gameState?.players || [],
    currentPlayer: gameState?.players[gameState?.currentPlayerIndex || 0],
    isMyTurn: false, // You can implement logic here: user.id === currentPlayer.id
  };
};
