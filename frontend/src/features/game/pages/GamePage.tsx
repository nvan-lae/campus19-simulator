import { useEffect } from 'react';

import './GamePage.css';
import { GameBoard } from '../components/GameBoard';
import { GameControls } from '../components/GameControls';
import { PlayersList } from '../components/PlayersList';
import { useGameLogic } from '../hooks/useGameLogic';
import { useSocket } from '../../../contexts/SocketContext';

export const GamePage = () => {
  // 1. CALL ALL HOOKS FIRST (Order must not change)
  useSocket();

  const {
    gameState,
    rollDice,
    movePlayer,
    resetGame,
    autoPlayCPU,
  } = useGameLogic();

  // 2. Safe useEffect: Check dependencies carefully
  useEffect(() => {
    if (!gameState || !autoPlayCPU) return;

    // Only run if it's a CPU turn (example logic, adjust as needed)
    // const currentPlayer = gameState.players[gameState.currentPlayerIndex];
    // if (currentPlayer.isCpu) { ... }

    const timer = setTimeout(() => {
      autoPlayCPU();
    }, 100);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameState?.currentPlayerIndex, autoPlayCPU]); // Use optional chaining

  // 3. NOW Handle Loading State (Early Return)
  if (!gameState) {
    return (
      <div className="page-container">
        <div className="loading-state">
          <h2>Connecting to Game...</h2>
        </div>
      </div>
    );
  }

  // 4. Safe Derived State (Guaranteed to have gameState here)
  const currentPlayer = gameState.players[gameState.currentPlayerIndex];
  const isRolling = gameState.diceValue !== null && !gameState.gameOver;

  const handleRoll = () => {
    rollDice();
  };

  const handleMove = () => {
    movePlayer();
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Game Board</h1>
        {gameState.gameOver && gameState.winner && (
          <p className="winner-text">
            🎉 {gameState.winner.username} WINS! 🎉
          </p>
        )}
      </div>

      <div className="game-content">
        <div className="board-section">
          {/* Pass safe players array */}
          <GameBoard players={gameState.players || []} />
        </div>

        <div className="sidebar">
          <PlayersList
            players={gameState.players || []}
            currentPlayerIndex={gameState.currentPlayerIndex}
          />

          <GameControls
            diceValue={gameState.diceValue}
            currentPlayerName={currentPlayer?.username || 'Unknown'}
            isRolling={isRolling}
            onRoll={handleRoll}
            onMove={handleMove}
            gameOver={gameState.gameOver}
            onReset={resetGame}
          />

          <div className="move-history">
            <h3>Last Move</h3>
            <div className="history-list">
              {/* FIXED: gameState does not have moveHistory. Use lastMoveDescription. */}
              {gameState.lastMoveDescription ? (
                <div className="history-item">
                  {gameState.lastMoveDescription}
                </div>
              ) : (
                <div className="history-item text-gray-500">No moves yet</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
