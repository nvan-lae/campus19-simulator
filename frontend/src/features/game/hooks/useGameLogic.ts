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

  const movePlayer = useCallback(() => {
    if (!socket || !gameId) return;
    // Emit the new event
    socket.emit('move_player', { gameId });
  }, [socket, gameId]);

  const purchaseItem = useCallback((itemId: string) => {
    if (!socket || !gameId) return;
    socket.emit('purchase_item', { gameId, itemId });
  }, [socket, gameId]);

  const useItem = useCallback((itemId: string, targetPlayerId?: number) => {
    if (!socket || !gameId) return;
    socket.emit('use_item', { gameId, itemId, targetPlayerId });
  }, [socket, gameId]);

  const submitChallenge = useCallback((answerIndex: number) => {
    if (!socket || !gameId) return;
    socket.emit('submit_challenge', { gameId, answerIndex });
  }, [socket, gameId]);

  const placeBet = useCallback((prediction: 'success' | 'fail') => {
    if (!socket || !gameId) return;
    socket.emit('place_bet', { gameId, prediction });
  }, [socket, gameId]);

  const sendReaction = useCallback((emoji: string) => {
    if (!socket || !gameId) return;
    socket.emit('send_reaction', { gameId, emoji });
  }, [socket, gameId]);

  return {
    gameState,
    rollDice,
    movePlayer,
    purchaseItem,
    useItem,
    submitChallenge,
    placeBet,
    sendReaction,
    players: gameState?.players || [],
    currentPlayer: gameState?.players[gameState?.currentPlayerIndex || 0],
    isMyTurn: false, // You can implement logic here: user.id === currentPlayer.id
  };
};


