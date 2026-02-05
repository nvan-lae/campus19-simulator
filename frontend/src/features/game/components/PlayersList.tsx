import { useState } from 'react';
import './PlayersList.css';
import type { GamePlayer } from '../../../types/game';
import { useAuth } from '../../../contexts/AuthContext';
import { CustomEmojiPicker } from './CustomEmojiPicker';

interface PlayersListProps {
  players: GamePlayer[];
  currentPlayerIndex: number;
  playerEmojis: Record<number, string>;
  onEmojiChange: (playerId: number, emoji: string) => void;
}

export const PlayersList = ({ players, currentPlayerIndex, playerEmojis, onEmojiChange }: PlayersListProps) => {
  const { user } = useAuth();
  const [showPicker, setShowPicker] = useState(false);

  // Get list of emojis already used by other players
  const usedEmojis = Object.entries(playerEmojis)
    .filter(([playerId]) => Number(playerId) !== user?.id) // Exclude current user
    .map(([, emoji]) => emoji)
    .filter(emoji => emoji && emoji.match(/^[\p{Emoji}\p{Extended_Pictographic}]/u)); // Only actual emojis

  return (
    <div className="players-list">
      <h3>Players</h3>
      <div className="players-container">
        {players.map((player, index) => {
          // Check if player has an emoji selected
          const emoji = playerEmojis[player.id];
          
          return (
            <div
              key={player.id}
              className={`player-item ${index === currentPlayerIndex ? 'active' : ''}`}
            >
              {/* Make colored square clickable for current user */}
              {user?.id === player.id ? (
                <div className="relative">
                  <button
                    className="player-color relative"
                    style={{ backgroundColor: player.color }}
                    onClick={() => setShowPicker((v: boolean) => !v)}
                    title="Choose your emoji"
                  >
                    <span className="text-base items-center justify-center flex">
                      {emoji || player.username.charAt(0)}
                    </span>
                    {/* Arrow indicator */}
                    <span className="absolute bottom-0 right-0 text-[0.5rem] text-white bg-black/50 rounded-tl px-0.5 leading-none">
                      ▼
                    </span>
                  </button>
                  {showPicker && (
                    <div className="absolute z-50 top-full left-0 mt-1">
                      <CustomEmojiPicker
                        onSelect={(emoji: string) => {
                          onEmojiChange(player.id, emoji);
                          setShowPicker(false);
                        }}
                        usedEmojis={usedEmojis}
                        userStats={user?.stats ? { totalMatches: user.stats.totalMatches, wins: user.stats.wins } : undefined}
                      />
                    </div>
                  )}
                </div>
              ) : (
                <div className="player-color" style={{ backgroundColor: player.color }}>
                  <span className="text-base items-center justify-center flex">
                    {emoji || player.username.charAt(0)}
                  </span>
                </div>
              )}
              <div className="player-info">
                <div className="player-name flex items-center gap-2 relative">
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
                <br />
                <span>💰 {player.coins}</span>
              </div>
            </div>
          </div>
          );
        })}
      </div>
    </div>
  );
};
