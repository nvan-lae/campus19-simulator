import type { ActiveChallenge } from '../../../types/game';
import './ChallengeModal.css';

interface ChallengeModalProps {
    challenge: ActiveChallenge;
    onSubmit: (index: number) => void;
    onBet?: (prediction: 'success' | 'fail') => void;
    currentPlayerName: string;
    isSpectator?: boolean;
}

export const ChallengeModal = ({
    challenge,
    onSubmit,
    onBet,
    currentPlayerName,
    isSpectator = false,
}: ChallengeModalProps) => {
    return (
        <div className="challenge-overlay">
            <div className="challenge-modal">
                <div className="challenge-header">
                    <h2>👾 Coding Challenge!</h2>
                    <p className="player-indicator">{currentPlayerName} is solving...</p>
                </div>

                <div className="challenge-body">
                    <div className="code-block">
                        <pre>{challenge.questionText}</pre>
                    </div>

                    <div className="challenge-options">
                        {challenge.options.map((option, index) => (
                            <button
                                key={index}
                                className="option-button"
                                onClick={() => onSubmit(index)}
                            >
                                <span className="option-letter">{String.fromCharCode(65 + index)}</span>
                                <span className="option-text">{option}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {isSpectator && onBet && (
                    <div className="betting-section">
                        <h3>💰 Place your bet!</h3>
                        <p>Will <strong>{currentPlayerName}</strong> get it right?</p>
                        <div className="bet-buttons">
                            <button className="bet-btn success" onClick={() => onBet('success')}>
                                👍 YES (Win 5)
                            </button>
                            <button className="bet-btn fail" onClick={() => onBet('fail')}>
                                👎 NO (Win 5)
                            </button>
                        </div>
                    </div>
                )}

                <div className="challenge-footer">
                    <p>Reward: <strong>{challenge.reward} Coins</strong></p>
                </div>
            </div>
        </div>
    );
};
