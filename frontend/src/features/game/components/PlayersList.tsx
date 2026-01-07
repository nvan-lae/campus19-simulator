import './PlayersList.css';
import type { GamePlayer } from '../hooks/useGameLogic';

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
              <div className="player-name">{player.name}</div>
              <div className="player-position">Tile: {player.position}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
