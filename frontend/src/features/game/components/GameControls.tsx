import './GameControls.css';

interface GameControlsProps {
  diceValue: number | null;
  currentPlayerName: string;
  isRolling: boolean;
  onRoll: () => void;
  onMove: (diceValue: number) => void;
  gameOver: boolean;
  onReset: () => void;
}

export const GameControls = ({
  diceValue,
  currentPlayerName,
  isRolling,
  onRoll,
  onMove,
  gameOver,
  onReset,
}: GameControlsProps) => {
  return (
    <div className="game-controls">
      <div className="controls-section">
        <h3>Current Turn</h3>
        <div className="current-player">{currentPlayerName}</div>
      </div>

      <div className="controls-section">
        <h3>Dice</h3>
        <div className="dice-container">
          {diceValue === null ? (
            <button onClick={onRoll} disabled={isRolling || gameOver}>
              {isRolling ? 'Rolling...' : 'Roll Dice'}
            </button>
          ) : (
            <>
              <div className="dice-display">{diceValue}</div>
              <button onClick={() => onMove(diceValue)} disabled={gameOver}>
                Move
              </button>
            </>
          )}
        </div>
      </div>

      {gameOver && (
        <div className="controls-section">
          <button onClick={onReset} className="reset-button">
            New Game
          </button>
        </div>
      )}
    </div>
  );
};
