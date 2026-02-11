import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSocket } from '../../contexts/SocketContext';
import { useAuth } from '../../contexts/AuthContext';

interface Player {
  id: number;
  username: string;
  isReady: boolean;
  color: string;
}

interface GameState {
  status: 'LOBBY' | 'PLAYING' | 'FINISHED';
  players: Player[];
}

export const LobbyPage = () => {
  const { gameId } = useParams();
  const { socket } = useSocket();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log('[LobbyPage] useEffect triggered. Socket:', socket?.id, 'GameId:', gameId);

    if (!socket) {
      console.log('[LobbyPage] No socket connection');
      return;
    }
    if (!gameId) {
      console.log('[LobbyPage] No gameId');
      return;
    }

    // Join game
    console.log('[LobbyPage] Emitting join_game for:', gameId);
    socket.emit('join_game', { gameId });

    // Listen for updates
    const handleStateUpdate = (state: GameState) => {
      console.log('[LobbyPage] Received game_state_update:', state);
      setGameState(state);
      if (state.status === 'PLAYING') {
        navigate(`/game/${gameId}`);
      }
    };

    const handleError = (err: { message: string }) => {
      console.error('[LobbyPage] Received game_error:', err);
      if (err.message && err.message.includes('Authentication pending')) {
        console.log('Auth pending, retrying join in 500ms...');
        setTimeout(() => {
          socket.emit('join_game', { gameId });
        }, 500);
      } else {
        setError(err.message);
      }
    };

    socket.on('game_state_update', handleStateUpdate);
    socket.on('game_error', handleError);

    return () => {
      console.log('[LobbyPage] Cleaning up listeners');
      socket.off('game_state_update', handleStateUpdate);
      socket.off('game_error', handleError);
    };
  }, [socket, gameId, navigate]);

  const toggleReady = () => {
    if (!socket || !gameId) return;
    socket.emit('player_ready', { gameId });
  };

  const startGame = () => {
    if (!socket || !gameId) return;
    socket.emit('start_game', { gameId });
  };

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="bg-red-500/20 text-red-200 p-6 rounded-lg border border-red-500">
          <h2 className="text-xl font-bold mb-2">Error</h2>
          <p>{error}</p>
          <button onClick={() => navigate('/')} className="mt-4 text-sm hover:underline">
            Back to Menu
          </button>
        </div>
      </div>
    );
  }

  if (!gameState) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  const isHost = gameState.players.length > 0 && gameState.players[0].id === user?.id;
  const allReady = gameState.players.length > 0 && gameState.players.every((p) => p.isReady);
  const currentPlayer = gameState.players.find((p) => p.id === user?.id);

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center p-8">
      <div className="w-full max-w-4xl space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-linear-to-r from-emerald-400 to-cyan-400">
            Lobby: {gameId}
          </h1>
          <p className="text-slate-400 mt-2">Waiting for players...</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Player List */}
          <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
            <h2 className="text-xl font-semibold text-white mb-4">Players ({gameState.players.length}/4)</h2>
            <div className="space-y-3">
              {gameState.players.map((player) => (
                <div
                  key={player.id}
                  className={`flex items-center justify-between p-3 rounded-lg border ${player.id === user?.id ? 'bg-slate-700/50 border-emerald-500/50' : 'bg-slate-700/30 border-slate-700'
                    }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: player.color }}
                    />
                    <span className="text-gray-200 font-medium">
                      {player.username} {player.id === user?.id && '(You)'} {gameState.players[0].id === player.id && '👑'}
                    </span>
                  </div>
                  {player.isReady ? (
                    <span className="text-emerald-400 text-sm font-bold bg-emerald-400/10 px-2 py-1 rounded">READY</span>
                  ) : (
                    <span className="text-slate-500 text-sm font-medium">pending...</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Controls */}
          <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700 flex flex-col justify-between">
            <div>
              <h2 className="text-xl font-semibold text-white mb-4">Game Settings</h2>
              <div className="text-sm text-gray-400 space-y-2">
                <p>• Map: Classic Campus 19</p>
                <p>• Mode: Game of the Goose</p>
                <p>• Max Players: 4</p>
              </div>
            </div>

            <div className="mt-8 space-y-4">
              {/* Ready Button */}
              <button
                onClick={toggleReady}
                className={`w-full py-3 rounded-lg font-bold text-lg transition-all transform hover:scale-[1.02] ${currentPlayer?.isReady
                  ? 'bg-yellow-500 hover:bg-yellow-600 text-black shadow-lg shadow-yellow-500/20'
                  : 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/20'
                  }`}
              >
                {currentPlayer?.isReady ? 'Not Ready' : 'Ready Up!'}
              </button>

              {/* Start Button (Host Only) */}
              {isHost && (
                <button
                  onClick={startGame}
                  disabled={!allReady}
                  className={`w-full py-3 rounded-lg font-bold text-lg transition-all ${allReady
                    ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/20 transform hover:scale-[1.02]'
                    : 'bg-slate-700 text-slate-500 cursor-not-allowed'
                    }`}
                >
                  Start Game
                </button>
              )}
              {!isHost && (
                <p className="text-center text-gray-500 text-sm">Waiting for host to start...</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

