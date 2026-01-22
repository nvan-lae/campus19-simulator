import './PlayersList.css';
import type { GamePlayer } from '../../../types/game';

interface PlayersListProps {
  players: GamePlayer[];
  currentPlayerIndex: number;
}

export const PlayersList = ({ players, currentPlayerIndex }: PlayersListProps) => {
  return (
    <div className="players-list">
      <h3>Players</h3>
      <div className="players-container">
        {players.map((player, index) => (
          <div
            key={player.id}
            className={`player-item ${index === currentPlayerIndex ? 'active' : ''}`}
          >
            <div
              className="player-color"
              style={{ backgroundColor: player.color }}
            />
            <div className="player-info">
              <div className="player-name">
                {player.username}
                <div className="status-icons">
                  {player.hasShield && <span title="Shielded">🛡️</span>}
                  {player.stuckInWell && <span title="Stuck in Well">🕳️</span>}
                  {player.turnsToSkip > 0 && !player.stuckInWell && (
                    <span title={`Skipping ${player.turnsToSkip} turn(s)`}>
                      {player.turnsToSkip === 1 ? '💤' : '⛓️'}
                    </span>
                  )}
                </div>
              </div>
              <div className="player-stats">
                <span>Tile: {player.position}</span>
                <span>💰 {player.coins}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
