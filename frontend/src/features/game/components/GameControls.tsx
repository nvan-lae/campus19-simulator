import './GameControls.css';

interface GameControlsProps {
  diceValue: number | null;
  currentPlayerName: string;
  isRolling: boolean;
  onRoll: () => void;
  onMove: (diceValue: number) => void;
  gameOver: boolean;
  onReset: () => void;
  disabled?: boolean;
  rollLabel?: string;
}

const DICE_FACES = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];

export const GameControls = ({
  diceValue,
  currentPlayerName,
  isRolling,
  onRoll,
  onMove,
  gameOver,
  onReset,
  disabled,
  rollLabel,
}: GameControlsProps) => {
  const getDiceFace = (value: number) => DICE_FACES[value - 1] || '🎲';

  return (
    <div className="controls-wrapper">
      {/* Current Turn */}
      <div className="turn-indicator">
        <span className="turn-label">Current Turn</span>
        <span className="turn-player">{currentPlayerName}</span>
      </div>

      {/* Dice Area */}
      <div className="dice-area">
        {diceValue === null ? (
          <button
            className="roll-button"
            onClick={onRoll}
            disabled={disabled || isRolling || gameOver}
          >
            {isRolling ? (
              <span className="rolling-animation">🎲</span>
            ) : (
              <>{rollLabel || '🎲 Roll Dice'}</>
            )}
          </button>
        ) : (
          <div className="dice-result">
            <div className="dice-face">{getDiceFace(diceValue)}</div>
            <div className="dice-number">{diceValue}</div>
            <button
              className="move-button"
              onClick={() => onMove(diceValue)}
              disabled={gameOver}
            >
              Move →
            </button>
          </div>
        )}
      </div>

      {/* Game Over */}
      {gameOver && (
        <button onClick={onReset} className="new-game-button">
          🔄 New Game
        </button>
      )}
    </div>
  );
};
