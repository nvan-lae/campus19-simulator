import { useState, useEffect, useRef, useCallback } from 'react';
import './GameBoard.css';
import { getEffectType, BOARD_SIZE, TILE_INFO } from '../utils/gameData';
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

export const GameBoard = ({ players, currentPlayerIndex, globalEvent, lastMoveDescription, onTileClick, playerEmojis }: GameBoardProps) => {
  const [hoveredTile, setHoveredTile] = useState<number | null>(null);
  const { playWin, playMove } = useGameSound(); // removed playSwap if unused or keep if needed

  const hasWonRef = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [boardSize, setBoardSize] = useState<{ width: number; height: number } | null>(null);

  // Calculate board size to fit container while maintaining aspect ratio
  const calculateBoardSize = useCallback(() => {
    if (!containerRef.current) return;
    
    const container = containerRef.current;
    // Use slightly smaller area to prevent any edge clipping
    const containerWidth = container.clientWidth - 4;
    const containerHeight = container.clientHeight - 4;
    
    // Calculate size that fits within container maintaining 9:7 aspect ratio
    let width = containerWidth;
    let height = width / BOARD_ASPECT_RATIO;
    
    // If height exceeds container, constrain by height instead
    if (height > containerHeight) {
      height = containerHeight;
      width = height * BOARD_ASPECT_RATIO;
    }
    
    setBoardSize({ width, height });
  }, []);

  // Set up resize observer
  useEffect(() => {
    calculateBoardSize();
    
    const resizeObserver = new ResizeObserver(() => {
      calculateBoardSize();
    });
    
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }
    
    return () => resizeObserver.disconnect();
  }, [calculateBoardSize]);

  // Animation State
  // Map of playerId -> currently displayed position (can be float for smooth interpolation if using canvas, 
  // but for grid cells, we might step through integers or use CSS transforms between cells).
  // For "step-by-step", we'll simply update the visual position tile by tile.
  const [visualPositions, setVisualPositions] = useState<Record<number, number>>({});

  // Initialize visual positions on first load
  useEffect(() => {
    const initial: Record<number, number> = {};
    players.forEach(p => {
      // If we already have a visual position, keep it, otherwise sync to real
      if (visualPositions[p.id] === undefined) {
        initial[p.id] = p.position;
      }
    });
    if (Object.keys(initial).length > 0) {
      setVisualPositions(prev => ({ ...prev, ...initial }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run once on mount, then manage updates manually


  // Win Condition Check
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

  // Animation Logic (Step-by-step)
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
          // Move 1 step towards target
          // If diff is huge negative (e.g. restart), maybe faster? No, requested "real life".
          const step = diff > 0 ? 1 : -1;
          newPositions[p.id] = current + step;

          // Play sound only if we actually stepped (throttle?)
          // playMove(); // This might spam if multiple players move. 
        } else {
          newPositions[p.id] = target; // Ensure exact sync
        }
      });

      if (needsUpdate) {
        setVisualPositions(newPositions);
        playMove();
        timeoutId = setTimeout(animate, 300); // Schedule next step
      }
    };

    // Trigger animation if any drift
    // Check if any player is desynced
    const isDesynced = players.some(p => {
      const target = p.position;
      const current = visualPositions[p.id] !== undefined ? visualPositions[p.id] : target;
      return current !== target;
    });

    if (isDesynced) {
      timeoutId = setTimeout(animate, 300);
    } else {
      // Initialize if empty
      const init: Record<number, number> = {};
      let changed = false;
      players.forEach(p => {
        if (visualPositions[p.id] === undefined) {
          init[p.id] = p.position;
          changed = true;
        }
      });
      if (changed) {
        setVisualPositions(prev => ({ ...prev, ...init }));
      }
    }

    return () => clearTimeout(timeoutId);
  }, [players, visualPositions, playMove]);


  // GRID COORDINATES FOR 47 TILES (10x10 Grid)
  // Based on the image: rectangular path with START bottom-left, WIN in center
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

  // Calculate direction arrow for each tile pointing to the next tile
  const getDirectionArrow = (tileNumber: number): string | null => {
    if (tileNumber >= BOARD_SIZE) return null; // No arrow on last tile
    
    const current = getGridCoords(tileNumber);
    const next = getGridCoords(tileNumber + 1);
    
    const dx = next.col - current.col;
    const dy = next.row - current.row;
    
    // Determine direction based on delta
    if (dx > 0 && dy === 0) return '→'; // Right
    if (dx < 0 && dy === 0) return '←'; // Left
    if (dx === 0 && dy > 0) return '↓'; // Down
    if (dx === 0 && dy < 0) return '↑'; // Up
    if (dx > 0 && dy < 0) return '↗'; // Up-Right
    if (dx > 0 && dy > 0) return '↘'; // Down-Right
    if (dx < 0 && dy < 0) return '↖'; // Up-Left
    if (dx < 0 && dy > 0) return '↙'; // Down-Left
    
    return null;
  };




  // Zoom Logic
  // We track the active player's VISUAL position for zoom focus.
  // Determine Zoom Focus
  // Priority: 1. Player currently moving (animating)
  //           2. Current Active Player (waiting to roll/move)

  const movingPlayer = players.find(p => {
    const v = visualPositions[p.id];
    const t = p.position;
    return v !== undefined && v !== t;
  });

  const focusPlayer = movingPlayer || players[currentPlayerIndex];

  // Use visual position for focus to follow animation smoothly
  const focusPos = focusPlayer ? (visualPositions[focusPlayer.id] ?? focusPlayer.position) : 0;
  const focusCoords = getGridCoords(Math.round(focusPos)); // Snap to nearest tile for calc

  // Calculate zoom origin based on focus tile
  // 9 Columns -> (col-1)/8 * 100%
  // 10 Rows -> (row-1)/9 * 100%
  const zoomOriginX = ((focusCoords.col - 1) / 8) * 100;
  const zoomOriginY = ((focusCoords.row - 1) / 9) * 100;

  // Determine Zoom Level
  // We want to zoom IN when a player is moving (i.e. visual != target).
  // AND zoom out when idle ? Or just keep zoomed out?
  // User said: "zoom back out after".

  const isMoving = players.some(p => {
    const v = visualPositions[p.id];
    const t = p.position;
    return v !== undefined && v !== t;
  });

  // Zoom Level - User requested heavily zoomed on player (approx 3 squares)
  const zoomScale = isMoving ? 3.0 : 1.0; // 3.0x zoom when moving, 1.0 when idle
  const inverseScale = 1 / zoomScale;

  const tiles = Array.from({ length: BOARD_SIZE }, (_, i) => i);

  return (
    <div className="game-board-container" ref={containerRef}>
      <div className="game-board-wrapper">
        {/* Stationary Effects Layer - Now sibling to scaled board */}
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
          {/* Effects moved out to parent to avoid scaling issues */}

          {/* Path Connectors - Arrows at tile edges pointing to next tile */}
          {tiles.slice(0, -1).map((tileNumber) => {
            const current = getGridCoords(tileNumber);
            const next = getGridCoords(tileNumber + 1);
            const arrow = getDirectionArrow(tileNumber);
            
            if (!arrow) return null;
            
            // Determine direction for positioning
            const dx = next.col - current.col;
            const dy = next.row - current.row;
            
            // Position class based on direction
            let positionClass = '';
            if (dx > 0) positionClass = 'edge-right';
            else if (dx < 0) positionClass = 'edge-left';
            else if (dy > 0) positionClass = 'edge-bottom';
            else if (dy < 0) positionClass = 'edge-top';
            
            return (
              <div
                key={`connector-${tileNumber}`}
                className={`path-connector ${positionClass}`}
                style={{
                  gridColumn: current.col,
                  gridRow: current.row,
                }}
              >
                <span 
                  className="connector-arrow"
                  style={{
                    transform: `scale(${inverseScale})`,
                  }}
                >
                  {arrow}
                </span>
              </div>
            );
          })}

          {tiles.map((tileNumber) => {
            const coords = getGridCoords(tileNumber);
            const effectType = getEffectType(tileNumber);
            const tileInfo = TILE_INFO[effectType];
            const isSpecial = effectType !== 'none';
            const isHovered = hoveredTile === tileNumber;
            const isWin = tileNumber === BOARD_SIZE - 1;
            const isStart = tileNumber === 0;

            return (
              <div
                key={tileNumber}
                className={`game-tile ${effectType} ${isSpecial ? 'special-tile' : ''} ${isWin ? 'end graduation-zone' : ''} ${isStart ? 'start' : ''}`}
                style={{
                  gridColumn: coords.col,
                  gridRow: coords.row,
                }}
                onClick={() => onTileClick?.(tileNumber)}
                onMouseEnter={() => setHoveredTile(tileNumber)}
                onMouseLeave={() => setHoveredTile(null)}
              >
                {/* Number scales from top-left to stay in corner but maintain size */}
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
                {/* Custom Popover */}
                {isHovered && isSpecial && (
                  <div
                    className="tile-popover"
                    style={{
                      transform: `translateX(-50%) scale(${inverseScale})`,
                      transformOrigin: 'bottom center'
                    }}
                  >
                    <div className="popover-header">
                      {tileInfo.emoji} {tileInfo.label}
                    </div>
                    <div className="popover-body">
                      {effectType === 'goose' && "Double roll + 5 coins!"}
                      {effectType === 'bridge' && "Jump ahead to tile 12"}
                      {effectType === 'inn' && "Skip 1 turn to rest"}
                      {effectType === 'well' && "Stuck until rescue or pay 10 coins"}
                      {effectType === 'labyrinth' && "Go back to tile 30"}
                      {effectType === 'prison' && "Skip 2 turns or pay 15 coins"}
                      {effectType === 'death' && "Restart at Start or pay 20 coins"}
                      {effectType === 'challenge' && "Coding Challenge! Win coins!"}
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {players.map((player) => {
            // Use interpolated visual position
            // If we want smooth pixel movement between grid cells, we CANNOT use gridColumn/Row easily for floats.
            // BUT, we can use the integer part for Grid Cell, and translate offset for fraction?
            // Or just render at the integer tile for now (step-by-step jump).
            // User said "move one square at a time". Jumping tile to tile is acceptable and cleaner than sliding diagonally across gaps.

            const currentVisPos = visualPositions[player.id] ?? player.position;
            const integerPos = Math.round(currentVisPos);
            const coords = getGridCoords(integerPos);

            // Calculate offset if multiple players on same tile
            // Filter by integer pos
            const playersOnSameTile = players.filter(p => {
              const v = visualPositions[p.id] ?? p.position;
              return Math.round(v) === integerPos;
            });
            const pIndex = playersOnSameTile.findIndex(p => p.id === player.id);

             // Calculate cell size based on board size
            const cellWidth = boardSize ? boardSize.width / 10 : 0;
            const cellHeight = boardSize ? boardSize.height / 6 : 0;

            // Arrange tokens in a row, centered horizontally in the tile
            const tokenSize = Math.min(cellWidth, cellHeight) * 0.21; // estimate token diameter
            const totalWidth = playersOnSameTile.length * tokenSize;
            const baseX = (cellWidth - totalWidth) / 1;
            const offsetX = baseX + pIndex * tokenSize;
            const offsetY = cellHeight * 0.5 - tokenSize / 2;

            // Use emoji if set, otherwise fallback to initial
            const emoji = playerEmojis?.[player.id];
            // Helper: detect emoji (simple unicode range check)
            const isEmoji = emoji && emoji.match(/^[\p{Emoji}\p{Extended_Pictographic}]/u);
            
            // If emoji is selected, remove background circle. If text, show circle with player color
            const bgColor = isEmoji 
              ? 'transparent' 
              : (player.color.startsWith('#')
                ? player.color
                : player.color);
            
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
                  // Apply scale to counteract board zoom
                  transform: `translate(${offsetX}px, ${offsetY}px) scale(${inverseScale})`,
                  zIndex: 10 + pIndex,
                  transition: 'all 0.3s ease-out', // smooth micro-adjustment
                  fontSize: isEmoji ? '1.6em' : '1em',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontFamily: isEmoji ? 'inherit' : 'inherit', // fallback to default for text
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
