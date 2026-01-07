import { useEffect } from 'react';
import '../../../styles/pages.css';
import './GamePage.css';
import { GameBoard } from '../components/GameBoard';
import { GameControls } from '../components/GameControls';
import { PlayersList } from '../components/PlayersList';
import { useGameLogic } from '../hooks/useGameLogic';

export const GamePage = () => {
  const {
    gameState,
    rollDice,
    movePlayer,
    resetGame,
    autoPlayCPU,
  } = useGameLogic();

  const currentPlayer = gameState.players[gameState.currentPlayerIndex];
  const isRolling = gameState.diceValue === null && !gameState.gameOver;

  // Auto-play CPU turns
  useEffect(() => {
    const timer = setTimeout(() => {
      autoPlayCPU();
    }, 100);

    return () => clearTimeout(timer);
  }, [gameState.currentPlayerIndex, autoPlayCPU]);

  const handleRoll = () => {
    rollDice();
  };

  const handleMove = (diceValue: number) => {
    movePlayer(diceValue);
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Game Board</h1>
        {gameState.gameOver && gameState.winner && (
          <p className="winner-text">
            🎉 {gameState.winner.name} WINS! 🎉
          </p>
        )}
      </div>

      <div className="game-content">
        <div className="board-section">
          <GameBoard players={gameState.players} />
        </div>

        <div className="sidebar">
          <PlayersList
            players={gameState.players}
            currentPlayerIndex={gameState.currentPlayerIndex}
          />

          <GameControls
            diceValue={gameState.diceValue}
            currentPlayerName={currentPlayer.name}
            isRolling={isRolling}
            onRoll={handleRoll}
            onMove={handleMove}
            gameOver={gameState.gameOver}
            onReset={resetGame}
          />

          <div className="move-history">
            <h3>Move History</h3>
            <div className="history-list">
              {gameState.moveHistory.slice().reverse().map((move, idx) => (
                <div key={idx} className="history-item">
                  {move}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
