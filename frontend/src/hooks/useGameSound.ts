import { useCallback } from 'react';

export const useGameSound = () => {
    const playTone = useCallback((frequency: number, type: OscillatorType, duration: number) => {
        const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
        if (!AudioContext) return;

        const ctx = new AudioContext();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = type;
        osc.frequency.setValueAtTime(frequency, ctx.currentTime);

        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.00001, ctx.currentTime + duration);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start();
        osc.stop(ctx.currentTime + duration);
    }, []);

    const playMove = () => playTone(300, 'sine', 0.1);
    const playRoll = () => {
        // A quick sequence of random notes
        for (let i = 0; i < 5; i++) {
            setTimeout(() => playTone(400 + Math.random() * 200, 'square', 0.05), i * 50);
        }
    };
    const playWin = () => {
        playTone(523.25, 'sine', 0.2); // C5
        setTimeout(() => playTone(659.25, 'sine', 0.2), 200); // E5
        setTimeout(() => playTone(783.99, 'sine', 0.4), 400); // G5
        setTimeout(() => playTone(1046.50, 'sine', 0.8), 600); // C6
    };
    const playSwap = () => {
        playTone(150, 'sawtooth', 0.3);
        setTimeout(() => playTone(300, 'sawtooth', 0.3), 100);
    }

    return { playMove, playRoll, playWin, playSwap };
};
