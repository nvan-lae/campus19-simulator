import { useState, useEffect, useRef } from 'react';
import './ChatWindow.css';
import { useSocket } from '../../../contexts/SocketContext';
import { useAuth } from '../../../contexts/AuthContext';

interface ChatMessage {
    playerId: number;
    username: string;
    message: string;
    timestamp: string;
}

interface ChatWindowProps {
    gameId: string;
    players: { id: number; username: string; color: string }[];
}

const REACTIONS = ['😂', '😡', '😱', '👏', '🤔', '🎉', '👍', '🎲'];

export const ChatWindow = ({ gameId, players }: ChatWindowProps) => {
    const { socket } = useSocket();
    const { user } = useAuth();
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [inputText, setInputText] = useState('');
    const [showReactions, setShowReactions] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const messagesContainerRef = useRef<HTMLDivElement>(null);
    const shouldAutoScrollRef = useRef(true);
    const MAX_MESSAGES = 200;

    useEffect(() => {
        if (!socket) return;

        const handleMessage = (msg: ChatMessage) => {
            setMessages(prev => {
                const next = [...prev, msg];
                return next.length > MAX_MESSAGES ? next.slice(-MAX_MESSAGES) : next;
            });
        };

        socket.on('chat_message', handleMessage);

        return () => {
            socket.off('chat_message', handleMessage);
        };
    }, [socket]);

    useEffect(() => {
        if (shouldAutoScrollRef.current && messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'auto' });
        }
    }, [messages]);

    const handleScroll = () => {
        const container = messagesContainerRef.current;
        if (!container) return;

        const bottomThreshold = 32;
        const distanceFromBottom = container.scrollHeight - container.scrollTop - container.clientHeight;
        shouldAutoScrollRef.current = distanceFromBottom <= bottomThreshold;
    };

    const sendMessage = (e?: React.FormEvent, content: string = inputText) => {
        if (e) e.preventDefault();
        if (!content.trim() || !socket) return;

        socket.emit('send_message', { gameId, message: content });
        if (content === inputText) {
            setInputText('');
        }
        setShowReactions(false);
    };

    return (
        <div className="chat-panel">
            <div className="chat-messages" ref={messagesContainerRef} onScroll={handleScroll}>
                {messages.length === 0 && (
                    <div className="chat-empty">No messages yet. Say hi! 👋</div>
                )}
                {messages.map((msg, idx) => {
                    const player = players.find(p => p.id === msg.playerId);
                    const color = player ? player.color : '#94a3b8';
                    const isMe = user?.id === msg.playerId;

                    return (
                        <div key={idx} className={`chat-msg ${isMe ? 'mine' : 'theirs'}`}>
                            {!isMe && <span className="msg-author" style={{ color }}>{msg.username}</span>}
                            <span className="msg-text">{msg.message}</span>
                        </div>
                    );
                })}
                <div ref={messagesEndRef} />
            </div>

            {showReactions && (
                <div className="chat-reactions-bar">
                    {REACTIONS.map(emoji => (
                        <button
                            key={emoji}
                            onClick={() => sendMessage(undefined, emoji)}
                            className="chat-reaction-btn"
                        >
                            {emoji}
                        </button>
                    ))}
                </div>
            )}

            <form className="chat-input" onSubmit={(e) => sendMessage(e)}>
                <button
                    type="button"
                    className={`emoji-toggle-btn ${showReactions ? 'active' : ''}`}
                    onClick={() => setShowReactions(!showReactions)}
                >
                    😀
                </button>
                <input
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="Type a message..."
                    maxLength={150}
                />
                <button type="submit" disabled={!inputText.trim()}>Send</button>
            </form>
        </div>
    );
};
