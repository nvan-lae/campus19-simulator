import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

interface Lobby {
    gameId: string;
    host: string;
    players: number;
    maxPlayers: number;
    status: 'LOBBY' | 'PLAYING';
    playerIds: number[];
}

export const MainMenu = () => {
    const [lobbies, setLobbies] = useState<Lobby[]>([]);
    const { token, user } = useAuth();
    const navigate = useNavigate();

    const API_URL = import.meta.env.VITE_API_URL || 'https://localhost:3000';

    useEffect(() => {
        const fetchLobbies = async () => {
            try {
                const response = await fetch(`${API_URL}/games`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (response.ok) {
                    setLobbies(await response.json());
                }
            } catch (error) {
                console.error('Failed to fetch lobbies', error);
            }
        };

        fetchLobbies();
        const interval = setInterval(fetchLobbies, 5000); // Poll every 5 seconds
        return () => clearInterval(interval);
    }, [token, API_URL]);

    const createGame = async () => {
        try {
            const response = await fetch(`${API_URL}/games/create`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
            });
            if (response.ok) {
                const { gameId } = await response.json();
                navigate(`/lobby/${gameId}`);
            }
        } catch (error) {
            console.error('Failed to create game', error);
        }
    };

    const joinGame = (gameId: string) => {
        navigate(`/lobby/${gameId}`);
    };

    useEffect(() => {
        // Prevent scrolling globally
        const originalHtmlOverflow = document.documentElement.style.overflow;
        const originalBodyOverflow = document.body.style.overflow;
        document.documentElement.style.overflow = 'hidden';
        document.body.style.overflow = 'hidden';
        return () => {
            document.documentElement.style.overflow = originalHtmlOverflow;
            document.body.style.overflow = originalBodyOverflow;
        };
    }, []);

    return (
        <div className="flex flex-col items-center justify-center min-h-screen gap-8 p-4 bg-slate-900 overflow-hidden">
            <div className="text-center space-y-2">
                <h1 className="text-4xl font-bold text-white mb-2">Campus 19 Simulator</h1>
                <p className="text-gray-500">Welcome, {user?.username}!</p>
            </div>

            <div className="card w-full max-w-2xl p-6 bg-slate-800/80 backdrop-blur rounded-xl border border-slate-700">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-white">Open Lobbies</h2>
                    <button
                        onClick={createGame}
                        className="px-6 py-2 bg-linear-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white rounded-lg font-bold transition-all shadow-lg hover:shadow-xl"
                    >
                        Create Match
                    </button>
                </div>

                <div className="space-y-3">
                    {lobbies.filter(lobby => {
                        // Show all LOBBY games to everyone
                        if (lobby.status === 'LOBBY') return true;
                        // Show PLAYING games only to members
                        if (lobby.status === 'PLAYING') {
                            return user?.id && lobby.playerIds.includes(user.id);
                        }
                        return false;
                    }).length === 0 ? (
                        <div className="text-center py-8 text-gray-400">
                            No open games found. Create one to start playing!
                        </div>
                    ) : (
                        lobbies.filter(lobby => {
                            // Show all LOBBY games to everyone
                            if (lobby.status === 'LOBBY') return true;
                            // Show PLAYING games only to members
                            if (lobby.status === 'PLAYING') {
                                return user?.id && lobby.playerIds.includes(user.id);
                            }
                            return false;
                        }).map((lobby) => (
                            <div
                                key={lobby.gameId}
                                className="flex items-center justify-between p-4 bg-slate-700/50 rounded-lg hover:bg-slate-700 transition-colors border border-slate-600"
                            >
                                <div>
                                    <h3 className="font-bold text-white">Host: {lobby.host}</h3>
                                    <p className="text-sm text-gray-400">Game ID: {lobby.gameId}</p>
                                </div>
                                <div className="flex items-center gap-4">
                                    {lobby.status === 'PLAYING' && (
                                        <span className="text-xs px-2 py-1 bg-amber-500/20 text-amber-400 rounded-full font-medium">
                                            In Progress
                                        </span>
                                    )}
                                    <span className="text-sm px-3 py-1 bg-slate-800 rounded-full text-gray-300">
                                        {lobby.players} / {lobby.maxPlayers} Players
                                    </span>
                                    <button
                                        onClick={() => joinGame(lobby.gameId)}
                                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-semibold transition-colors"
                                    >
                                        {lobby.status === 'PLAYING' ? 'Rejoin' : 'Join'}
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};
