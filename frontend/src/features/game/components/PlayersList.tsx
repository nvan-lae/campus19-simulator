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
              <div className="player-color" style={{ backgroundColor: player.color }}>
                <span className="text-base items-center justify-center flex">
                  {emoji || player.username.charAt(0)}
                </span>
              </div>
              <div className="player-info">
                <div className="player-name flex items-center gap-2 relative">
                  {player.username}
                  {/* Show emoji for all players */}
                  {emoji && (
                    <span className="text-base ml-1" title={`${player.username}'s emoji`}>
                      {emoji}
                    </span>
                  )}
                {/* Only show emoji picker for current user */}
                {user?.id === player.id && (
                  <>
                    <button
                      className="emoji-picker-toggle ml-2 rounded border px-1.5 py-0.5 bg-slate-800 text-sm cursor-pointer"
                      onClick={() => setShowPicker((v: boolean) => !v)}
                      title="Choose your emoji"
                    >
                      {playerEmojis[player.id] || '🔤'}
                    </button>
                    {showPicker && (
                      <div className="absolute z-50 top-8 left-0">
                        <CustomEmojiPicker
                          onSelect={(emoji: string) => {
                            onEmojiChange(player.id, emoji);
                            setShowPicker(false);
                          }}
                        />
                      </div>
                    )}
                  </>
                )}
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
