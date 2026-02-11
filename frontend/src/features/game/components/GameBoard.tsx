import { useState, useEffect, useRef, useCallback, useMemo, memo } from 'react';
import './GameBoard.css';
import { BOARD_SIZE } from '@campus19/shared';
import { getEffectType, TILE_INFO } from '../utils/gameData';
import type { GamePlayer } from '../../../types/game';
import confetti from 'canvas-confetti';
import { useGameSound } from '../../../hooks/useGameSound';
import { EffectsLayer } from './EffectsLayer';

interface GameBoardProps {
  players: GamePlayer[];
  currentPlayerIndex: number;
  globalEvent: 'gravity_flux' | 'inflation' | 'windy' | null;
  lastMoveDescription: string | null;
  onTileClick?: (tileNumber: number) => void;
  playerEmojis: Record<number, string>;
}

// Board aspect ratio
const BOARD_ASPECT_RATIO = 10 / 10;

// --- STATIC HELPER FUNCTIONS (Moved outside component) ---

// GRID COORDINATES FOR 47 TILES (10x10 Grid)
const getGridCoords = (index: number) => {
  // Left column going UP (tiles 1-9)
  if (index === 0) return { col: 1, row: 10 }; // START - bottom-left
  if (index === 1) return { col: 1, row: 9 };
  if (index === 2) return { col: 1, row: 8 };
  if (index === 3) return { col: 1, row: 7 };
  if (index === 4) return { col: 1, row: 6 };
  if (index === 5) return { col: 1, row: 5 };
  if (index === 6) return { col: 1, row: 4 };
  if (index === 7) return { col: 1, row: 3 };
  if (index === 8) return { col: 1, row: 2 };
  if (index === 9) return { col: 1, row: 1 };
  
  // Bottom row going RIGHT (tiles 10-18)
  if (index === 10) return { col: 4, row: 10 };
  if (index === 11) return { col: 5, row: 10 };
  if (index === 12) return { col: 6, row: 10 };
  if (index === 13) return { col: 7, row: 10 };
  if (index === 14) return { col: 8, row: 10 };
  if (index === 15) return { col: 9, row: 10 };
  if (index === 16) return { col: 10, row: 10 };

  // Right column going UP (tiles 19-24)
  if (index === 17) return { col: 10, row: 9 };
  if (index === 18) return { col: 10, row: 8 };
  if (index === 19) return { col: 10, row: 7 };
  if (index === 20) return { col: 10, row: 6 };
  if (index === 21) return { col: 10, row: 5 };
  if (index === 22) return { col: 10, row: 4 };
  if (index === 23) return { col: 10, row: 3 };
  if (index === 24) return { col: 10, row: 2 };
  if (index === 25) return { col: 10, row: 1 };

  // Top row going LEFT (tiles 25-30)
  if (index === 26) return { col: 9, row: 1 };
  if (index === 27) return { col: 8, row: 1 };
  if (index === 28) return { col: 7, row: 1 };
  if (index === 29) return { col: 6, row: 1 };
  if (index === 30) return { col: 5, row: 1 };
  if (index === 31) return { col: 4, row: 1 };
  if (index === 32) return { col: 4, row: 2 };

  // Inner path (tiles 31-40)
  if (index === 33) return { col: 4, row: 3 };
  if (index === 34) return { col: 4, row: 4 };
  if (index === 35) return { col: 4, row: 5 };
  if (index === 36) return { col: 4, row: 6 };

  // Continue inner path (tiles 41-48)
  if (index === 37) return { col: 5, row: 6 };
  if (index === 38) return { col: 6, row: 6 };
  if (index === 39) return { col: 7, row: 6 };
  if (index === 40) return { col: 8, row: 6 };
  if (index === 41) return { col: 8, row: 5 };
  if (index === 42) return { col: 8, row: 4 };
  if (index === 43) return { col: 8, row: 3 };
  if (index === 44) return { col: 7, row: 3 };
  if (index === 45) return { col: 6, row: 3 };
  if (index === 46) return { col: 6, row: 4 };
  return { col: 6, row: 4 }; // WIN tile
};

// --- StaticBoardLayer ---
// This component only re-renders when boardSize or scale changes, 
// IGNORING player movements/animations.

interface StaticBoardLayerProps {
  onTileClick?: (tileNumber: number) => void;
  inverseScale: number;
}

const StaticBoardLayer = memo(({ onTileClick, inverseScale }: StaticBoardLayerProps) => {
  const tiles = useMemo(() => Array.from({ length: BOARD_SIZE }, (_, i) => i), []);

  return (
    <>
      {/* Tiles */}
      {tiles.map((tileNumber) => {
        const coords = getGridCoords(tileNumber);
        const effectType = getEffectType(tileNumber);
        const tileInfo = TILE_INFO[effectType];
        const isSpecial = effectType !== 'none' && effectType !== 'piscine';
        const isTopRow = coords.row === 1;
        const isWin = tileNumber === BOARD_SIZE - 1;
        const isStart = tileNumber === 0;

        return (
          <div
            key={tileNumber}
            className={`game-tile ${effectType} ${isSpecial ? 'special-tile' : ''} ${isWin ? 'end graduation-zone' : ''} ${isStart ? 'start' : ''}`}
            style={{ gridColumn: coords.col, gridRow: coords.row }}
            onClick={() => onTileClick?.(tileNumber)}
          >
            <div
              className="tile-number"
              style={{
                transform: `scale(${inverseScale})`,
                transformOrigin: 'top left',
                transition: 'transform 0.5s ease'
              }}
            >
              {isStart ? 'START' : isWin ? 'WIN' : tileNumber}
            </div>

            <div className="tile-content">
              {tileInfo.emoji && (
                <div
                  className="tile-emoji"
                  style={{
                    transform: `scale(${inverseScale})`,
                    transformOrigin: 'center center',
                    transition: 'transform 0.5s ease'
                  }}
                >
                  {tileInfo.emoji}
                </div>
              )}
            </div>
            
            {isSpecial && (
              <div
                className={`tile-popover ${isTopRow ? 'tile-popover-below' : ''}`}
                style={{
                  transform: `translateX(-50%) scale(${inverseScale})`,
                  transformOrigin: 'bottom center'
                }}
              >
                <div className="popover-header">
                  {tileInfo.emoji} {tileInfo.label}
                </div>
                <div className="popover-body">
                  {effectType === 'eval' && "Double roll + 5 coins!"}
                  {effectType === 'marioKart' && "8 Races good for everyone?"}
                  {effectType === 'stage' && "Go back to tile 30"}
                  {effectType === 'death' && "Black Hole - Return to the start"}
                  {effectType === 'challenge' && "Coding Challenge! Win coins!"}
                  {effectType === 'piscineExam' && "Piscine Exam! Pass to be able to go to the next tile."}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </>
  );
});

// --- MAIN COMPONENT ---

const GameBoardBase = ({ players, currentPlayerIndex, globalEvent, lastMoveDescription, onTileClick, playerEmojis }: GameBoardProps) => {
  const { playWin, playMove } = useGameSound();

  const hasWonRef = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [boardSize, setBoardSize] = useState<{ width: number; height: number } | null>(null);

  const calculateBoardSize = useCallback(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    const containerWidth = container.clientWidth - 4;
    const containerHeight = container.clientHeight - 4;
    
    let width = containerWidth;
    let height = width / BOARD_ASPECT_RATIO;
    
    if (height > containerHeight) {
      height = containerHeight;
      width = height * BOARD_ASPECT_RATIO;
    }
    
    setBoardSize({ width, height });
  }, []);

  const lastSizeRef = useRef({ width: 0, height: 0 });

  useEffect(() => {
    calculateBoardSize();
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        if (Math.abs(width - lastSizeRef.current.width) < 2 && Math.abs(height - lastSizeRef.current.height) < 2) return; 
        lastSizeRef.current = { width, height };
        window.requestAnimationFrame(() => calculateBoardSize());
      }
    });

    if (containerRef.current) resizeObserver.observe(containerRef.current);
    return () => resizeObserver.disconnect();
  }, [calculateBoardSize]);

  // Animation State
  const [visualPositions, setVisualPositions] = useState<Record<number, number>>({});

  useEffect(() => {
    const initial: Record<number, number> = {};
    players.forEach(p => {
      if (visualPositions[p.id] === undefined) initial[p.id] = p.position;
    });
    if (Object.keys(initial).length > 0) setVisualPositions(prev => ({ ...prev, ...initial }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); 

  useEffect(() => {
    const winner = players.find(p => p.position === BOARD_SIZE - 1);
    if (winner && !hasWonRef.current) {
      hasWonRef.current = true;
      playWin();
      confetti({ particleCount: 200, spread: 100, origin: { y: 0.6 } });
    } else if (!winner) {
      hasWonRef.current = false;
    }
  }, [players, playWin]);

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;

    const animate = () => {
      let needsUpdate = false;
      const newPositions = { ...visualPositions };

      players.forEach(p => {
        const target = p.position;
        const current = newPositions[p.id] !== undefined ? newPositions[p.id] : target;

        if (current !== target) {
          needsUpdate = true;
          const diff = target - current;
          const step = diff > 0 ? 1 : -1;
          newPositions[p.id] = current + step;
        } else {
          newPositions[p.id] = target; 
        }
      });

      if (needsUpdate) {
        setVisualPositions(newPositions);
        playMove();
        timeoutId = setTimeout(animate, 300); 
      }
    };

    const isDesynced = players.some(p => {
      const target = p.position;
      const current = visualPositions[p.id] !== undefined ? visualPositions[p.id] : target;
      return current !== target;
    });

    if (isDesynced) {
      timeoutId = setTimeout(animate, 300);
    } else {
      const init: Record<number, number> = {};
      let changed = false;
      players.forEach(p => {
        if (visualPositions[p.id] === undefined) {
          init[p.id] = p.position;
          changed = true;
        }
      });
      if (changed) setVisualPositions(prev => ({ ...prev, ...init }));
    }

    return () => clearTimeout(timeoutId);
  }, [players, visualPositions, playMove]);


  // Zoom Logic
  const movingPlayer = players.find(p => {
    const v = visualPositions[p.id];
    const t = p.position;
    return v !== undefined && v !== t;
  });

  const focusPlayer = movingPlayer || players[currentPlayerIndex];
  const focusPos = focusPlayer ? (visualPositions[focusPlayer.id] ?? focusPlayer.position) : 0;
  const focusTileIndex = Math.round(focusPos);
  const focusCoords = getGridCoords(focusTileIndex); 

  const zoomOriginX = ((focusCoords.col - 1) / 8) * 100;
  const zoomOriginY = ((focusCoords.row - 1) / 9) * 100;

  const isMoving = players.some(p => {
    const v = visualPositions[p.id];
    const t = p.position;
    return v !== undefined && v !== t;
  });

  const focusEffectType = getEffectType(focusTileIndex);
  const isSpecialFocus = focusEffectType !== 'none' && focusEffectType !== 'piscine';
  const [isZoomed, setIsZoomed] = useState(false);
  const zoomTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastZoomTileRef = useRef<number | null>(null);

  useEffect(() => {
    if (isMoving) {
      setIsZoomed(false);
      return;
    }

    if (!isSpecialFocus) {
      setIsZoomed(false);
      return;
    }

    if (lastZoomTileRef.current === focusTileIndex) return;

    lastZoomTileRef.current = focusTileIndex;
    setIsZoomed(true);

    if (zoomTimeoutRef.current) clearTimeout(zoomTimeoutRef.current);
    zoomTimeoutRef.current = setTimeout(() => {
      setIsZoomed(false);
    }, 1200);

    return () => {
      if (zoomTimeoutRef.current) clearTimeout(zoomTimeoutRef.current);
    };
  }, [isMoving, isSpecialFocus, focusTileIndex]);

  const zoomScale = isZoomed ? 3.0 : 1.0; 
  const inverseScale = 1 / zoomScale;

  const playersByTile = useMemo(() => {
    const map = new Map<number, GamePlayer[]>();
    players.forEach(p => {
      const currentVisPos = visualPositions[p.id] ?? p.position;
      const integerPos = Math.round(currentVisPos);
      if (!map.has(integerPos)) map.set(integerPos, []);
      map.get(integerPos)!.push(p);
    });
    return map;
  }, [players, visualPositions]);

  return (
    <div className="game-board-container" ref={containerRef}>
      <div className="game-board-wrapper">
        <div style={{ position: 'absolute', inset: 0, zIndex: 60, pointerEvents: 'none', overflow: 'hidden' }}>
          <EffectsLayer globalEvent={globalEvent} lastMoveDescription={lastMoveDescription} />
        </div>

        <div
          className="game-board spiral-layout-63"
          style={{
            ...(boardSize && {
              width: boardSize.width,
              height: boardSize.height,
            }),
            transformOrigin: `${zoomOriginX}% ${zoomOriginY}%`,
            transform: `scale(${zoomScale})`,
            transition: 'transform-origin 0.5s ease, transform 0.5s ease',
          }}
        >
          {/* STATIC LAYER: Tiles */}
          <StaticBoardLayer 
            onTileClick={onTileClick}
            inverseScale={inverseScale}
          />

          {/* DYNAMIC LAYER: Players */}
          {players.map((player) => {
            const currentVisPos = visualPositions[player.id] ?? player.position;
            const integerPos = Math.round(currentVisPos);
            const coords = getGridCoords(integerPos);

            const playersOnSameTile = playersByTile.get(integerPos) || [];
            const pIndex = playersOnSameTile.findIndex(p => p.id === player.id);

            const cellWidth = boardSize ? boardSize.width / 10 : 0;
            const cellHeight = boardSize ? boardSize.height / 6 : 0;

            const tokenSize = Math.min(cellWidth, cellHeight) * 0.21; 
            const totalWidth = playersOnSameTile.length * tokenSize;
            const baseX = (cellWidth - totalWidth) / 1;
            const offsetX = baseX + pIndex * tokenSize;
            const offsetY = cellHeight * 0.5 - tokenSize / 2;

            const emoji = playerEmojis?.[player.id];
            const isEmoji = emoji && emoji.match(/^[\p{Emoji}\p{Extended_Pictographic}]/u);
            
            const bgColor = isEmoji 
              ? 'transparent' 
              : (player.color.startsWith('#') ? player.color : player.color);
            
            const borderColor = isEmoji ? 'transparent' : 'white';
            const boxShadow = isEmoji ? 'none' : '0 3px 8px rgba(0, 0, 0, 0.4)';
            
            return (
              <div
                key={player.id}
                className="player-token animated-token"
                style={{
                  gridColumn: coords.col,
                  gridRow: coords.row,
                  backgroundColor: bgColor,
                  borderColor: borderColor,
                  boxShadow: boxShadow,
                  transform: `translate(${offsetX}px, ${offsetY}px) scale(${inverseScale})`,
                  zIndex: 10 + pIndex,
                  transition: 'all 0.3s ease-out',
                  fontSize: isEmoji ? '1.6em' : '1em',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontFamily: isEmoji ? 'inherit' : 'inherit',
                  fontWeight: isEmoji ? 'normal' : 'bold',
                  letterSpacing: isEmoji ? undefined : '0.02em',
                }}
                title={`${player.username} (Coins: ${player.coins})`}
              >
                {emoji || player.username.charAt(0)}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export const GameBoard = memo(GameBoardBase, (prevProps, nextProps) => {
  return (
    JSON.stringify(prevProps.currentPlayerIndex) === JSON.stringify(nextProps.currentPlayerIndex) &&
    JSON.stringify(prevProps.lastMoveDescription) === JSON.stringify(nextProps.lastMoveDescription) &&
    JSON.stringify(prevProps.globalEvent) === JSON.stringify(nextProps.globalEvent) &&
    JSON.stringify(prevProps.players) === JSON.stringify(nextProps.players) &&
    JSON.stringify(prevProps.playerEmojis) === JSON.stringify(nextProps.playerEmojis)
  );
});
