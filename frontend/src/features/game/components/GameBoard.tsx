import './GameBoard.css';
import { getEffectType, BOARD_SIZE } from '../utils/gameData';
import type { GamePlayer } from '../hooks/useGameLogic';

interface GameBoardProps {
  players: GamePlayer[];
  onTileClick?: (tileNumber: number) => void;
}

export const GameBoard = ({ players, onTileClick }: GameBoardProps) => {
  const getTilesForRow = (rowIndex: number): number[] => {
    const startTile = rowIndex * 7 + 1;
    const endTile = startTile + 6;

    // Alternate direction for snake-and-ladders style
    if (rowIndex % 2 === 0) {
      return Array.from({ length: 7 }, (_, i) => startTile + i);
    } else {
      return Array.from({ length: 7 }, (_, i) => endTile - i);
    }
  };

  const getPlayersOnTile = (tileNumber: number) => {
    return players.filter((p) => p.position === tileNumber);
  };

  const renderTile = (tileNumber: number) => {
    if (tileNumber <= 0 || tileNumber > BOARD_SIZE) return null;

    const playersOnTile = getPlayersOnTile(tileNumber);
    const effectType = getEffectType(tileNumber);

    return (
      <div
        key={tileNumber}
        className={`game-tile ${effectType}`}
        onClick={() => onTileClick?.(tileNumber)}
      >
        <div className="tile-number">{tileNumber}</div>
        <div className="tile-players">
          {playersOnTile.map((player) => (
            <div
              key={player.id}
              className="player-token"
              style={{ backgroundColor: player.color }}
              title={player.name}
            >
              {player.name.charAt(0)}
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="game-board-container">
      <div className="game-board">
        {/* Start tile */}
        <div className="game-tile start">
          <div className="tile-number">START</div>
          <div className="tile-players">
            {players.map((player) =>
              player.position === 0 ? (
                <div
                  key={player.id}
                  className="player-token"
                  style={{ backgroundColor: player.color }}
                  title={player.name}
                >
                  {player.name.charAt(0)}
                </div>
              ) : null
            )}
          </div>
        </div>

        {/* Game tiles */}
        {Array.from({ length: 6 }, (_, rowIndex) => (
          <div key={`row-${rowIndex}`} className="board-row">
            {getTilesForRow(rowIndex).map((tileNumber) => renderTile(tileNumber))}
          </div>
        ))}

        {/* End tile */}
        <div className="game-tile end">
          <div className="tile-number">WIN!</div>
          <div className="tile-players">
            {players.map((player) =>
              player.position === BOARD_SIZE ? (
                <div
                  key={player.id}
                  className="player-token winner"
                  style={{ backgroundColor: player.color }}
                  title={player.name}
                >
                  {player.name.charAt(0)}
                </div>
              ) : null
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
