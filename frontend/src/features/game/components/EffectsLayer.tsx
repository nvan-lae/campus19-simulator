import { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import './EffectsLayer.css';

interface EffectsLayerProps {
    globalEvent: 'gravity_flux' | 'inflation' | 'windy' | null;
    lastMoveDescription: string | null;
}

export const EffectsLayer = ({ globalEvent, lastMoveDescription }: EffectsLayerProps) => {
    const [showBanner, setShowBanner] = useState(false);

    // Show banner ephemeral
    useEffect(() => {
        if (globalEvent) {
            setShowBanner(true);
            const timer = setTimeout(() => {
                setShowBanner(false);
            }, 4000);
            return () => clearTimeout(timer);
        } else {
            setShowBanner(false);
        }
    }, [globalEvent]);

    // Confetti for wins/big moments
    useEffect(() => {
        if (!lastMoveDescription) return;

        if (lastMoveDescription.includes('WINS')) {
            confetti({
                particleCount: 200,
                spread: 100,
                origin: { y: 0.6 },
                colors: ['#FF6B6B', '#4ECDC4', '#FFE66D', '#95E1D3']
            });
        } else if (lastMoveDescription.includes('goose')) {
            confetti({
                particleCount: 50,
                spread: 50,
                origin: { y: 0.7 },
                colors: ['#FFD700', '#FFA500'] // Gold colors
            });
        } else if (lastMoveDescription.includes('CHAOS ORB')) {
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
