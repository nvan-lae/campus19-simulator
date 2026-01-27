import { useState } from 'react';
import './ReactionWheel.css';

interface ReactionWheelProps {
    onSendReaction: (emoji: string) => void;
}

const REACTIONS = ['😂', '😡', '😱', '👏', '🤔', '🎉'];

export const ReactionWheel = ({ onSendReaction }: ReactionWheelProps) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="reaction-container">
            <button
                className={`reaction-toggle ${isOpen ? 'active' : ''}`}
                onClick={() => setIsOpen(!isOpen)}
            >
                😀
            </button>

            {isOpen && (
                <div className="reaction-wheel">
                    {REACTIONS.map(emoji => (
                        <button
                            key={emoji}
                            className="reaction-btn"
                            onClick={() => {
                                onSendReaction(emoji);
                                setIsOpen(false);
                            }}
                        >
                            {emoji}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};
