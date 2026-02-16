import { useCallback } from 'react';

let sharedAudioContext: AudioContext | null = null;

const getSharedAudioContext = () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const AudioContextCtor = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextCtor) return null;

    if (!sharedAudioContext) {
        sharedAudioContext = new AudioContextCtor();
    }

    if (sharedAudioContext.state === 'suspended') {
        sharedAudioContext.resume().catch(() => {
            // Ignore resume failures (often blocked until user gesture).
        });
    }

    return sharedAudioContext;
};

export const useGameSound = () => {
    const playTone = useCallback((frequency: number, type: OscillatorType, duration: number) => {
        const ctx = getSharedAudioContext();
        if (!ctx) return;

        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = type;
        osc.frequency.setValueAtTime(frequency, ctx.currentTime);

        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.00001, ctx.currentTime + duration);

        osc.connect(gain);
        gain.connect(ctx.destination);

        const stopTime = ctx.currentTime + duration;
        osc.start();
        osc.stop(stopTime);
        osc.onended = () => {
            osc.disconnect();
            gain.disconnect();
        };
    }, []);

    const playMove = useCallback(() => {
        playTone(300, 'sine', 0.1);
    }, [playTone]);

    const playRoll = useCallback(() => {
        // A quick sequence of random notes
        for (let i = 0; i < 5; i++) {
            setTimeout(() => playTone(400 + Math.random() * 200, 'square', 0.05), i * 50);
        }
    }, [playTone]);

    const playWin = useCallback(() => {
        playTone(523.25, 'sine', 0.2); // C5
        setTimeout(() => playTone(659.25, 'sine', 0.2), 200); // E5
        setTimeout(() => playTone(783.99, 'sine', 0.4), 400); // G5
        setTimeout(() => playTone(1046.50, 'sine', 0.8), 600); // C6
    }, [playTone]);

    const playSwap = useCallback(() => {
        playTone(150, 'sawtooth', 0.3);
        setTimeout(() => playTone(300, 'sawtooth', 0.3), 100);
    }, [playTone]);

    return { playMove, playRoll, playWin, playSwap };
};
