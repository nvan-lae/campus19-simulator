import { useEffect, useState } from 'react';
import { useSocket } from '../../../contexts/SocketContext';
import './TurnTimer.css';

interface TurnTimerProps {
  turnStartTime: number | null;
  turnTimeLimit: number;
  gameId: string;
  isMyTurn: boolean;
}

export const TurnTimer = ({ turnStartTime, turnTimeLimit, gameId, isMyTurn }: TurnTimerProps) => {
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const { socket } = useSocket();

  useEffect(() => {
    if (!turnStartTime) {
      setTimeRemaining(turnTimeLimit / 1000);
      return;
    }

    const updateTimer = () => {
      const elapsed = Date.now() - turnStartTime;
      const remaining = Math.max(0, Math.ceil((turnTimeLimit - elapsed) / 1000));
      setTimeRemaining(remaining);

      // Check if time is up
      if (remaining === 0 && socket && gameId) {
        // Emit timeout check to server
        socket.emit('check_turn_timeout', { gameId });
      }
    };

    // Update immediately
    updateTimer();

    // Then update every second
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [turnStartTime, turnTimeLimit, socket, gameId]);

  const getTimerColor = () => {
    const percentage = (timeRemaining / (turnTimeLimit / 1000)) * 100;
    if (percentage > 50) return 'timer-safe';
    if (percentage > 20) return 'timer-warning';
    return 'timer-danger';
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!turnStartTime) return null;

  return (
    <div className={`turn-timer ${getTimerColor()} ${isMyTurn ? 'my-turn' : ''}`}>
      <div className="timer-icon">⏱️</div>
      <div className="timer-display">
        <div className="timer-label">{isMyTurn ? 'Your Time' : 'Turn Timer'}</div>
        <div className="timer-value">{formatTime(timeRemaining)}</div>
      </div>
      {isMyTurn && timeRemaining <= 10 && (
        <div className="timer-warning-text">Hurry up!</div>
      )}
    </div>
  );
};
