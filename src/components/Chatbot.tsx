'use client';

import { useState, useRef, useEffect } from 'react';
import { X, Send } from 'lucide-react';
import styles from './Chatbot.module.css';

interface Message {
    role: 'user' | 'assistant';
    content: string;
}

export default function Chatbot({ onClose }: { onClose: () => void }) {
    const [messages, setMessages] = useState<Message[]>([
        { role: 'assistant', content: "Hi! I'm your Wedding AI assistant. Need some help planning or budgeting?" }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const bottomRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isLoading]);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMsg: Message = { role: 'user', content: input.trim() };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsLoading(true);

        try {
            const res = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ messages: [...messages, userMsg] }),
            });

            if (!res.ok) {
                throw new Error('Network response was not ok');
            }

            const data = await res.json();
            setMessages(prev => [...prev, { role: 'assistant', content: data.reply }]);
        } catch (error) {
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: "Oops! We encountered an error connecting to the AI. If you're missing a Groq API Key, please add GROQ_API_KEY to your env variables."
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={styles.chatContainer}>
            {/* Header */}
            <div className={styles.chatHeader}>
                <h3 className={styles.chatTitle}>
                    Wedding AI
                </h3>
                <button className={styles.chatCloseBtn} onClick={onClose} aria-label="Close Chat">
                    <X size={20} />
                </button>
            </div>

            {/* Messages */}
            <div className={styles.chatBody}>
                {messages.map((msg, i) => (
                    <div key={i} className={`${styles.message} ${msg.role === 'user' ? styles.messageUser : styles.messageBot}`}>
                        {msg.content}
                    </div>
                ))}
                {isLoading && (
                    <div className={styles.loadingDots}>
                        <div className={styles.dot} />
                        <div className={styles.dot} />
                        <div className={styles.dot} />
                    </div>
                )}
                <div ref={bottomRef} />
            </div>

            {/* Input */}
            <form className={styles.chatInputArea} onSubmit={handleSend}>
                <input
                    type="text"
                    className={styles.chatInput}
                    placeholder="Ask a wedding question..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                />
                <button type="submit" className={styles.chatSendBtn} disabled={!input.trim() || isLoading}>
                    <Send size={18} />
                </button>
            </form>
        </div>
    );
}
