import { useState, useEffect } from 'react';
import { useSocket } from '../../../contexts/SocketContext';

interface PredictionPanelProps {
    gameId: string;
    isMyTurn: boolean;
    hasBet: boolean;
}

export const PredictionPanel = ({ gameId, isMyTurn, hasBet }: PredictionPanelProps) => {
    const { socket } = useSocket();
    const [betPlaced, setBetPlaced] = useState<'low' | 'high' | null>(null);

    // Reset local bet state when turn changes (hasBet becomes false)
    useEffect(() => {
        if (!hasBet) {
            setTimeout(() => setBetPlaced(null), 0);
        }
    }, [hasBet]);

    if (isMyTurn) return null; // Don't show if it's my turn
    if (hasBet) return (
        <div className="bg-slate-800/80 backdrop-blur text-white p-3 rounded-xl border border-indigo-500/30 flex items-center justify-center gap-2 text-sm shadow-lg transform transition-all hover:scale-105">
            <span>🎲 Bet Placed: </span>
            <span className="font-bold text-amber-400 uppercase">{betPlaced || '...'}</span>
        </div>
    );

    const placeBet = (prediction: 'low' | 'high') => {
        if (!socket) return;
        socket.emit('place_roll_bet', { gameId, prediction });
        setBetPlaced(prediction);
    };

    return (
        <div className="bg-slate-900/90 backdrop-blur p-4 rounded-xl border border-indigo-500 shadow-2xl flex flex-col gap-3 animate-in fade-in slide-in-from-bottom-4">
            <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">Prediction</span>
                <span className="text-[10px] text-slate-400">Win 5 Coins</span>
            </div>
            <div className="text-sm font-medium text-white">
                What will they roll?
            </div>
            <div className="grid grid-cols-2 gap-2">
                <button
                    onClick={() => placeBet('low')}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white py-2 px-3 rounded-lg text-xs font-bold transition-all hover:scale-105 active:scale-95 border-b-2 border-indigo-800"
                >
                    LOW (1-3)
                </button>
                <button
                    onClick={() => placeBet('high')}
                    className="bg-purple-600 hover:bg-purple-500 text-white py-2 px-3 rounded-lg text-xs font-bold transition-all hover:scale-105 active:scale-95 border-b-2 border-purple-800"
                >
                    HIGH (4-6)
                </button>
            </div>
        </div>
    );
};
