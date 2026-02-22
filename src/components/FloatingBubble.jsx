// src/components/FloatingBubble.jsx
// Draggable floating action button that opens the AI chat.
// Supports both mouse and touch dragging.

import { useState, useRef, useCallback } from 'react';
import { AnimatePresence } from 'framer-motion';
import { MessageCircle } from 'lucide-react';
import ChatBox from './ChatBox';
import './ChatBubble.css';

const FloatingBubble = () => {
    const [isOpen, setIsOpen] = useState(false);

    // Position state for dragging
    const [pos, setPos] = useState({ x: window.innerWidth - 76, y: window.innerHeight - 140 });
    const dragRef = useRef({ dragging: false, startX: 0, startY: 0, startPosX: 0, startPosY: 0, moved: false });

    // --- Mouse drag handlers ---
    const onMouseDown = useCallback((e) => {
        dragRef.current = {
            dragging: true,
            startX: e.clientX,
            startY: e.clientY,
            startPosX: pos.x,
            startPosY: pos.y,
            moved: false
        };
        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
    }, [pos]);

    const onMouseMove = useCallback((e) => {
        if (!dragRef.current.dragging) return;
        const dx = e.clientX - dragRef.current.startX;
        const dy = e.clientY - dragRef.current.startY;
        if (Math.abs(dx) > 3 || Math.abs(dy) > 3) dragRef.current.moved = true;
        setPos({
            x: Math.max(0, Math.min(window.innerWidth - 56, dragRef.current.startPosX + dx)),
            y: Math.max(0, Math.min(window.innerHeight - 56, dragRef.current.startPosY + dy))
        });
    }, []);

    const onMouseUp = useCallback(() => {
        // Only open chat if it wasn't a drag
        if (!dragRef.current.moved) setIsOpen(true);
        dragRef.current.dragging = false;
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
    }, [onMouseMove]);

    // --- Touch drag handlers ---
    const onTouchStart = useCallback((e) => {
        const touch = e.touches[0];
        dragRef.current = {
            dragging: true,
            startX: touch.clientX,
            startY: touch.clientY,
            startPosX: pos.x,
            startPosY: pos.y,
            moved: false
        };
    }, [pos]);

    const onTouchMove = useCallback((e) => {
        if (!dragRef.current.dragging) return;
        const touch = e.touches[0];
        const dx = touch.clientX - dragRef.current.startX;
        const dy = touch.clientY - dragRef.current.startY;
        if (Math.abs(dx) > 3 || Math.abs(dy) > 3) dragRef.current.moved = true;
        setPos({
            x: Math.max(0, Math.min(window.innerWidth - 56, dragRef.current.startPosX + dx)),
            y: Math.max(0, Math.min(window.innerHeight - 56, dragRef.current.startPosY + dy))
        });
    }, []);

    const onTouchEnd = useCallback(() => {
        if (!dragRef.current.moved) setIsOpen(true);
        dragRef.current.dragging = false;
    }, []);

    return (
        <>
            {/* Draggable FAB button */}
            {!isOpen && (
                <button
                    className="chat-fab"
                    style={{ left: pos.x, top: pos.y }}
                    onMouseDown={onMouseDown}
                    onTouchStart={onTouchStart}
                    onTouchMove={onTouchMove}
                    onTouchEnd={onTouchEnd}
                >
                    <MessageCircle size={24} />
                </button>
            )}

            {/* Chat modal */}
            <AnimatePresence>
                {isOpen && <ChatBox onClose={() => setIsOpen(false)} />}
            </AnimatePresence>
        </>
    );
};

export default FloatingBubble;
