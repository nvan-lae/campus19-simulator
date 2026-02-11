import { useEffect, useRef, useState } from 'react';
import confetti from 'canvas-confetti';
import './EffectsLayer.css';

interface EffectsLayerProps {
    globalEvent: 'gravity_flux' | 'inflation' | 'windy' | null;
    lastMoveDescription: string | null;
}

export const EffectsLayer = ({ globalEvent, lastMoveDescription }: EffectsLayerProps) => {
    const [showBanner, setShowBanner] = useState(false);
    const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const lastConfettiAtRef = useRef(0);

    // Show banner ephemeral
    useEffect(() => {
        if (hideTimerRef.current) {
            clearTimeout(hideTimerRef.current);
            hideTimerRef.current = null;
        }

        if (globalEvent) {
            setShowBanner(true);
            hideTimerRef.current = setTimeout(() => {
                setShowBanner(false);
                hideTimerRef.current = null;
            }, 4000);
            return () => {
                if (hideTimerRef.current) {
                    clearTimeout(hideTimerRef.current);
                    hideTimerRef.current = null;
                }
            };
        }

        setShowBanner(false);
    }, [globalEvent]);

    // Confetti for wins/big moments
    useEffect(() => {
        if (!lastMoveDescription) return;

        const now = Date.now();
        if (now - lastConfettiAtRef.current < 1500) {
            return;
        }

        if (lastMoveDescription.includes('WINS')) {
            lastConfettiAtRef.current = now;
            confetti({
                particleCount: 200,
                spread: 100,
                origin: { y: 0.6 },
                colors: ['#FF6B6B', '#4ECDC4', '#FFE66D', '#95E1D3']
            });
        } else if (lastMoveDescription.includes('CHAOS ORB')) {
            lastConfettiAtRef.current = now;
            // Chaos effect
            confetti({
                particleCount: 100,
                angle: 90,
                spread: 360,
                startVelocity: 30,
                colors: ['#000000', '#FF0000', '#660066']
            });
        }
    }, [lastMoveDescription]);

    return (
        <div className={`effects-layer ${globalEvent || ''}`}>
            {globalEvent && showBanner && (
                <div className="global-event-banner">
                    <div className="event-icon">
                        {globalEvent === 'gravity_flux' && '🌌'}
                        {globalEvent === 'inflation' && '📈'}
                        {globalEvent === 'windy' && '🍃'}
                    </div>
                    <div className="event-text">
                        GLOBAL EVENT: {globalEvent.replace('_', ' ').toUpperCase()}
                    </div>
                </div>
            )}

            {/* Weather Effects */}
            {globalEvent === 'gravity_flux' && <div className="effect-gravity-particles"></div>}
            {globalEvent === 'windy' && <div className="effect-wind-lines"></div>}
        </div>
    );
};
