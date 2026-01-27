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
}

// Board aspect ratio
const BOARD_ASPECT_RATIO = 9 / 7;

export const GameBoard = ({ players, currentPlayerIndex, globalEvent, lastMoveDescription, onTileClick }: GameBoardProps) => {
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
        initial[p.id] = p.position === 0 ? 1 : p.position;
      }
    });
    if (Object.keys(initial).length > 0) {
      setVisualPositions(prev => ({ ...prev, ...initial }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run once on mount, then manage updates manually


  // Win Condition Check
  useEffect(() => {
    const winner = players.find(p => p.position === BOARD_SIZE);
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
        const target = p.position === 0 ? 1 : p.position;
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
      const target = p.position === 0 ? 1 : p.position;
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
          init[p.id] = p.position === 0 ? 1 : p.position;
          changed = true;
        }
      });
      if (changed) {
        setVisualPositions(prev => ({ ...prev, ...init }));
      }
    }

    return () => clearTimeout(timeoutId);
  }, [players, visualPositions, playMove]);


  // GRID COORDINATES FOR 63 TILES (9x7 Grid)
  const getGridCoords = (index: number) => {
    // 9 Columns (1..9), 7 Rows (1..7)
    // Spiral inward.

    // SAFETY: Clamp index
    if (index <= 0) return { col: 1, row: 7 }; // Start at bottom left

    // Layer 0 (Outer Ring)
    // Bottom: 1..9 -> (1,7) to (9,7)
    if (index <= 9) return { col: index, row: 7 };

    // Right: 10..14 -> (9,6) to (9,2)
    // 10->(9,6), 11->(9,5), 12->(9,4), 13->(9,3), 14->(9,2)
    // row = 7 - (index - 9) = 16 - index.
    if (index <= 14) return { col: 9, row: 16 - index };

    // Top: 15..23 -> (9,1) to (1,1)
    // 15->(9,1)...23->(1,1)
    // col = 9 - (index - 15) = 24 - index.
    if (index <= 23) return { col: 24 - index, row: 1 };

    // Left: 24..28 -> (1,2) to (1,6)
    // 24->(1,2)...28->(1,6)
    // row = 1 + (index - 23) = index - 22.
    if (index <= 28) return { col: 1, row: index - 22 };

    // Layer 1 (Inner Ring 1)
    // Bottom: 29..35 -> (2,6) to (8,6)
    // 29->(2,6)...35->(8,6)
    // col = 2 + (index - 29) = index - 27.
    if (index <= 35) return { col: index - 27, row: 6 };

    // Right: 36..38 -> (8,5) to (8,3)
    // 36->(8,5), 37->(8,4), 38->(8,3)
    // row = 6 - (index - 35) = 41 - index.
    if (index <= 38) return { col: 8, row: 41 - index };

    // Top: 39..45 -> (8,2) to (2,2)
    // 39->(8,2)...45->(2,2)
    // col = 8 - (index - 39) = 47 - index.
    if (index <= 45) return { col: 47 - index, row: 2 };

    // Left: 46..48 -> (2,3) to (2,5)
    // 46->(2,3)...48->(2,5)
    // row = 2 + (index - 45) = index - 43.
    if (index <= 48) return { col: 2, row: index - 43 };

    // Layer 2 (Inner Ring 2)
    // Bottom: 49..53 -> (3,5) to (7,5)
    // 49->(3,5)...53->(7,5)
    // col = 3 + (index - 49) = index - 46.
    if (index <= 53) return { col: index - 46, row: 5 };

    // Right: 54..54 -> (7,4)
    if (index === 54) return { col: 7, row: 4 };

    // OR wait, my manual calc earlier:
    // Ring 2 Side Right was (7,4)? 
    // Let's recheck gap.
    // 36..38 was col 8, rows 5,4,3. (Wait, calc said 8,5 to 8,3. 36->8,5; 37->8,4; 38->8,3).
    // So row 4 is occupied by tile 37 (Right outer).
    // NO. Grid logic:
    // Outer Right: 10..14 (Rows 6,5,4,3,2 at col 9). tile 12 is at (9,4).
    // Inner Right: 36..38 (Rows 5,4,3 at col 8). tile 37 is at (8,4).
    // Inner Inner Right (Col 7): Should be just row 4?
    // Wait. 36->(8,5). 37->(8,4). 38->(8,3).
    // So 37 is at row 4.
    // So 54 being at (7,4) is fine. It's inside of 37. Perfect.

    // Top: 55..59 -> (7,3) to (3,3)
    // 55->(7,3)...59->(3,3)
    // col = 7 - (index - 55) = 62 - index.
    if (index <= 59) return { col: 62 - index, row: 3 };

    // Left: 60 -> (3,4)
    if (index === 60) return { col: 3, row: 4 };

    // Center / Win Path
    // 61 -> (4,4)
    // 62 -> (5,4)
    // 63 -> (6,4) WIN? Or Center is 63?
    // Let's layout 61..63 in center row 4.
    if (index === 61) return { col: 4, row: 4 };
    if (index === 62) return { col: 5, row: 4 };
    if (index >= 63) return { col: 6, row: 4 };

    return { col: 4, row: 3 }; // Fallback
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
    const t = p.position === 0 ? 1 : p.position;
    return v !== undefined && v !== t;
  });

  const focusPlayer = movingPlayer || players[currentPlayerIndex];

  // Use visual position for focus to follow animation smoothly
  const focusPos = focusPlayer ? (visualPositions[focusPlayer.id] || (focusPlayer.position === 0 ? 1 : focusPlayer.position)) : 1;
  const focusCoords = getGridCoords(Math.round(focusPos)); // Snap to nearest tile for calc

  // Calculate zoom origin based on focus tile
  // 9 Columns -> (col-1)/8 * 100%
  // 7 Rows -> (row-1)/6 * 100%
  const zoomOriginX = ((focusCoords.col - 1) / 8) * 100;
  const zoomOriginY = ((focusCoords.row - 1) / 6) * 100;

  // Determine Zoom Level
  // We want to zoom IN when a player is moving (i.e. visual != target).
  // AND zoom out when idle ? Or just keep zoomed out?
  // User said: "zoom back out after".

  const isMoving = players.some(p => {
    const v = visualPositions[p.id];
    const t = p.position === 0 ? 1 : p.position;
    return v !== undefined && v !== t;
  });

  // Zoom Level - User requested heavily zoomed on player (approx 3 squares)
  const zoomScale = isMoving ? 3.0 : 1.0; // 3.0x zoom when moving, 1.0 when idle
  const inverseScale = 1 / zoomScale;

  const tiles = Array.from({ length: BOARD_SIZE }, (_, i) => i + 1);

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
            const isWin = tileNumber === BOARD_SIZE;
            const isStart = tileNumber === 1;

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

            const currentVisPos = visualPositions[player.id] || (player.position === 0 ? 1 : player.position);
            const integerPos = Math.round(currentVisPos);
            const coords = getGridCoords(integerPos);

            // Calculate offset if multiple players on same tile
            // Filter by integer pos
            const playersOnSameTile = players.filter(p => {
              const v = visualPositions[p.id] || (p.position === 0 ? 1 : p.position);
              return Math.round(v) === integerPos;
            });
            const pIndex = playersOnSameTile.findIndex(p => p.id === player.id);

            // dynamic offset
            const offsetX = (pIndex * 8) - (playersOnSameTile.length * 4);
            const offsetY = (pIndex * 5);

            return (
              <div
                key={player.id}
                className="player-token animated-token"
                style={{
                  gridColumn: coords.col,
                  gridRow: coords.row,
                  backgroundColor: player.color,
                  // Apply scale to counteract board zoom
                  transform: `translate(${offsetX}px, ${offsetY}px) scale(${inverseScale})`,
                  zIndex: 10 + pIndex,
                  transition: 'all 0.3s ease-out' // smooth micro-adjustment
                }}
                title={`${player.username} (Coins: ${player.coins})`}
              >
                {player.username.charAt(0)}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
