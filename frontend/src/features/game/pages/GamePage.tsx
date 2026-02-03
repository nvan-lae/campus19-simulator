import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom'; // Added useParams
import './GamePage.css';
import { GameBoard } from '../components/GameBoard';
import { GameControls } from '../components/GameControls';
import { PlayersList } from '../components/PlayersList';
import { Shop } from '../components/Shop';
import { useGameLogic } from '../hooks/useGameLogic';
import { useSocket } from '../../../contexts/SocketContext'; // Keep hooks together
import { ChallengeModal } from '../components/ChallengeModal';
import { ChatWindow } from '../components/ChatWindow';
import { PredictionPanel } from '../components/PredictionPanel';
import { useGameSound } from '../../../hooks/useGameSound';
import { useAuth } from '../../../contexts/AuthContext';

export const GamePage = () => {
  // 1. CALL ALL HOOKS FIRST (Order must not change)
  const { socket } = useSocket();
  const { user } = useAuth();
  const { gameId } = useParams<{ gameId: string }>(); // Get ID from URL
  const { playRoll } = useGameSound();

  const {
    gameState,
    rollDice,
    movePlayer,
    purchaseItem,
    useItem: activateItem,
    payEscape,
    submitChallenge,
    resetGame,
    autoPlayCPU,
  } = useGameLogic();

  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000); // Update every second
    return () => clearInterval(interval);
  }, []);

  // Emoji state for all players
  const [playerEmojis, setPlayerEmojis] = useState<Record<number, string>>({});
  
  const handleEmojiChange = (playerId: number, emoji: string) => {
    setPlayerEmojis(prev => ({ ...prev, [playerId]: emoji }));
    
    // Emit emoji change to other players via WebSocket
    if (socket && gameId) {
      socket.emit('player_emoji_change', { gameId, playerId, emoji });
    }
  };

  // Listen for emoji changes from other players
  useEffect(() => {
    if (!socket) return;

    const handleEmojiUpdate = (data: { playerId: number; emoji: string }) => {
      setPlayerEmojis(prev => ({ ...prev, [data.playerId]: data.emoji }));
    };

    socket.on('emoji_updated', handleEmojiUpdate);

    return () => {
      socket.off('emoji_updated', handleEmojiUpdate);
    };
  }, [socket]);

  // 2. Safe useEffect: Check dependencies carefully
  useEffect(() => {
    if (!gameState || !autoPlayCPU) return;

    // Only run if it's a CPU turn (example logic, adjust as needed)
    // const currentPlayer = gameState.players[gameState.currentPlayerIndex];
    // if (currentPlayer.isCpu) { ... }

    const timer = setTimeout(() => {
      autoPlayCPU();
    }, 100);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameState?.currentPlayerIndex, autoPlayCPU]); // Use optional chaining

  // 3. All Hooks must be called before early returns
  const [isShopOpen, setIsShopOpen] = useState(false);

  // 4. Handle Loading State (Early Return)
  if (!gameState) {
    return (
      <div className="game-page-container">
        <div className="loading-state">
          <h2>Connecting to Game...</h2>
        </div>
      </div>
    );
  }

  // 5. Derived State (Guaranteed to have gameState here)
  const currentPlayer = gameState.players[gameState.currentPlayerIndex];
  const myPlayer = gameState.players.find(p => p.id === user?.id);
  const isRolling = gameState.diceValue !== null && !gameState.gameOver;

  // check if roll is possible by timer
  const isTimeLocked = gameState.rollAvailableAt && now < Number(gameState.rollAvailableAt);
  const secondsLeft = isTimeLocked ? Math.ceil((Number(gameState.rollAvailableAt) - now) / 1000) : 0;
  const isRollDisabled = !!(currentPlayer?.id !== user?.id || !!gameState.diceValue || gameState.gameOver || isTimeLocked);

  const handleRoll = () => {
    playRoll();
    rollDice();
  };

  const handleMove = () => {
    movePlayer();
  };

  // Check if current user has an active challenge (it's my challenge to answer)
  const hasActiveChallenge = gameState.activeChallenge &&
    gameState.activeChallenge.playerId === myPlayer?.id;

  return (
    <div className="game-layout-container">
      {/* Board Area */}
      <div className="main-viewport relative">
        <div className="board-container">
          <GameBoard
            players={gameState.players || []}
            currentPlayerIndex={gameState.currentPlayerIndex}
            globalEvent={gameState.currentGlobalEvent}
            lastMoveDescription={gameState.lastMoveDescription}
            playerEmojis={playerEmojis}
          />
        </div>

        {/* Betting Panel (Absolute Positioning) */}
        {!gameState.diceValue && (
          <div className="absolute bottom-6 right-6 z-20">
            <PredictionPanel
              gameId={gameId || ''}
              isMyTurn={currentPlayer?.id === user?.id}
              hasBet={!!gameState.currentTurnBets?.some((b: { playerId: number }) => b.playerId === user?.id)}

            />
          </div>
        )}

        {/* Betting Result Notification */}
        {gameState.rollBetResult && (
          <div className="absolute top-32 left-1/2 transform -translate-x-1/2 z-50 pointer-events-none">
            {(() => {
              const { winners, losers, outcome } = gameState.rollBetResult;
              const myId = user?.id || -1;
              const isWinner = winners.includes(myId);
              const isLoser = losers.includes(myId);

              if (isWinner) {
                return (
                  <div className="bg-green-500/90 backdrop-blur text-white px-6 py-3 rounded-xl border-2 border-green-400 shadow-[0_0_20px_rgba(34,197,94,0.5)] animate-in fade-in zoom-in duration-300 flex flex-col items-center">
                    <span className="text-2xl">💰</span>
                    <span className="font-black text-lg uppercase tracking-wide">Bet Won!</span>
                    <span className="text-sm font-medium opacity-90">Matched {outcome.toUpperCase()} (+5 coins)</span>
                  </div>
                );
              }
              if (isLoser) {
                return (
                  <div className="bg-red-500/90 backdrop-blur text-white px-6 py-3 rounded-xl border-2 border-red-400 shadow-[0_0_20px_rgba(239,68,68,0.5)] animate-in fade-in zoom-in duration-300 flex flex-col items-center">
                    <span className="text-2xl">💸</span>
                    <span className="font-black text-lg uppercase tracking-wide">Bet Lost</span>
                    <span className="text-sm font-medium opacity-90">Rolled {outcome.toUpperCase()} (-2 coins)</span>
                  </div>
                );
              }
              // If didn't bet, do we show anything? Maybe just the result for everyone?
              // "Outcome: HIGH"
              return (
                <div className="bg-slate-800/80 backdrop-blur text-slate-200 px-4 py-2 rounded-lg border border-slate-600 shadow-xl animate-in fade-in slide-in-from-top-4">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block text-center">Roll Outcome</span>
                  <span className="text-xl font-black text-white block text-center">{outcome.toUpperCase()}</span>
                </div>
              );
            })()}
          </div>
        )}
      </div>

      {/* Right Area: Sidebar */}
      <aside className="game-sidebar">
        <div className="sidebar-header">
          <h1>Campus19 🎲</h1>
        </div>

        {/* Global Event Display */}
        <div className="sidebar-section">
          {gameState.currentGlobalEvent ? (
            <div className="global-event-card">
              <div className="event-label">🌍 Global Event Active</div>
              <div className="event-name">
                {gameState.currentGlobalEvent === 'gravity_flux' && '⚡ Gravity Flux'}
                {gameState.currentGlobalEvent === 'inflation' && '💰 Inflation'}
                {gameState.currentGlobalEvent === 'windy' && '🌬️ Windy'}
              </div>
              <div className="event-description">
                {gameState.currentGlobalEvent === 'gravity_flux' && 'Movement +2 tiles!'}
                {gameState.currentGlobalEvent === 'inflation' && 'Shop +50%!'}
                {gameState.currentGlobalEvent === 'windy' && 'Movement -1 tile!'}
              </div>
            </div>
          ) : (
            <div className="global-event-card inactive">
              <div className="event-label">🌍 Global Event</div>
              <div className="event-name">No Event</div>
              <div className="event-description">The world is calm... for now.</div>
            </div>
          )}
        </div>

        <div className="sidebar-section players-section">
          <PlayersList
            players={gameState.players || []}
            currentPlayerIndex={gameState.currentPlayerIndex}
            playerEmojis={playerEmojis}
            onEmojiChange={handleEmojiChange}
          />
        </div>

        <div className="sidebar-section chat-section max-h-150">
          <ChatWindow
            gameId={gameId || ''}
            players={gameState.players || []}
          />
        </div>

        <div className="sidebar-section action-section">
          <div className="action-card">
            <div className="action-label">Last Action</div>
            <div className="action-content">
              {gameState.lastMoveDescription || "Game started! Roll the dice."}
            </div>
          </div>
        </div>

        <div className="sidebar-section controls-section">
          <div className="controls-card">
            <GameControls
              diceValue={gameState.diceValue}
              currentPlayerName={currentPlayer?.username || 'Unknown'}
              isRolling={isRolling}
              onRoll={handleRoll}
              onMove={handleMove}
              gameOver={gameState.gameOver}
              onReset={resetGame}
              disabled={isRollDisabled}
              rollLabel={isTimeLocked ? `Wait ${secondsLeft}s` : 'Roll Dice'}
            />

            <button
              className="shop-button-full"
              onClick={() => setIsShopOpen(true)}
              disabled={gameState.gameOver}
            >
              🛒 Open Campus Shop
            </button>
          </div>
        </div>
      </aside>

      {/* Modals */}
      {isShopOpen && (
        <div className="shop-modal-overlay" onClick={(e) => {
          if (e.target === e.currentTarget) setIsShopOpen(false);
        }}>
          <div className="shop-modal ui-element relative">
            <button
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-2 z-10"
              onClick={() => setIsShopOpen(false)}
            >
              ✕
            </button>
            <div className="p-8 overflow-y-auto max-h-[90vh]">
              <h2 className="text-2xl font-black mb-6 flex items-center gap-3 text-slate-800 dark:text-white">
                🛒 Campus Shop
                <span className="text-sm font-medium px-3 py-1 bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300 rounded-full ml-auto">
                  My Coins: {myPlayer?.coins || 0}
                </span>
              </h2>
              <Shop
                currentPlayer={myPlayer}
                allPlayers={gameState.players || []}
                onPurchase={(itemId) => {
                  purchaseItem(itemId);
                }}
                onUseItem={(itemId, targetId) => {
                  activateItem(itemId, targetId);
                  setIsShopOpen(false);
                }}
                onPayEscape={payEscape}
                disabled={gameState.gameOver}
              />
            </div>
          </div>
        </div>
      )}

      {/* Challenge Modals */}
      {hasActiveChallenge && gameState.activeChallenge && myPlayer && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl max-w-2xl w-full overflow-hidden border border-indigo-500/50">
            <ChallengeModal
              challenge={gameState.activeChallenge}
              currentPlayerName={myPlayer.username}
              onSubmit={submitChallenge}
            />
          </div>
        </div>
      )}

      {/* Winner Overlay */}
      {gameState.gameOver && gameState.winner && (
        <div className="fixed inset-0 z-[120] flex flex-col items-center justify-center bg-indigo-600/90 backdrop-blur-md text-white">
          <div className="text-6xl font-black mb-8 animate-bounce">
            🎉 {gameState.winner.username} WINS! 🎉
          </div>
          <button
            onClick={resetGame}
            className="bg-white text-indigo-600 font-black py-4 px-12 rounded-full shadow-2xl hover:scale-110 active:scale-95 transition-all"
          >
            PLAY AGAIN
          </button>
        </div>
      )}
    </div>
  );
};
