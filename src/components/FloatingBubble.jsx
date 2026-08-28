// src/components/FloatingBubble.jsx
// Draggable floating action button that opens the AI chat.
// Supports both mouse and touch dragging with full unmount cleanup.

import { useState, useRef, useCallback, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { MessageCircle } from 'lucide-react';
import ChatBox from './ChatBox';
import './ChatBubble.css';

const FloatingBubble = () => {
    const [isOpen, setIsOpen] = useState(false);

    // Position state for dragging
    const [pos, setPos] = useState(() => ({
        x: typeof window !== 'undefined' ? window.innerWidth - 76 : 300,
        y: typeof window !== 'undefined' ? window.innerHeight - 140 : 500
    }));

    const dragRef = useRef({
        dragging: false,
        startX: 0,
        startY: 0,
        startPosX: 0,
        startPosY: 0,
        moved: false
    });

    const onMouseMove = useCallback((e) => {
        if (!dragRef.current.dragging) return;
        const dx = e.clientX - dragRef.current.startX;
        const dy = e.clientY - dragRef.current.startY;
        if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
            dragRef.current.moved = true;
        }
        setPos({
            x: Math.max(0, Math.min(window.innerWidth - 56, dragRef.current.startPosX + dx)),
            y: Math.max(0, Math.min(window.innerHeight - 56, dragRef.current.startPosY + dy))
        });
    }, []);

    const onMouseUp = useCallback(() => {
        if (dragRef.current.dragging && !dragRef.current.moved) {
            setIsOpen(true);
        }
        dragRef.current.dragging = false;
        document.removeEventListener('mousemove', onMouseMove);
    }, [onMouseMove]);

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
    }, [pos, onMouseMove]);

    // Touch drag handlers
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
        if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
            dragRef.current.moved = true;
        }
        setPos({
            x: Math.max(0, Math.min(window.innerWidth - 56, dragRef.current.startPosX + dx)),
            y: Math.max(0, Math.min(window.innerHeight - 56, dragRef.current.startPosY + dy))
        });
    }, []);

    const onTouchEnd = useCallback(() => {
        if (dragRef.current.dragging && !dragRef.current.moved) {
            setIsOpen(true);
        }
        dragRef.current.dragging = false;
    }, []);

    // Attach global mouseup and clean up on unmount
    useEffect(() => {
        document.addEventListener('mouseup', onMouseUp);
        return () => {
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
        };
    }, [onMouseMove, onMouseUp]);

    return (
        <>
            {!isOpen && (
                <button
                    className="chat-fab"
                    style={{ left: pos.x, top: pos.y }}
                    onMouseDown={onMouseDown}
                    onTouchStart={onTouchStart}
                    onTouchMove={onTouchMove}
                    onTouchEnd={onTouchEnd}
                    aria-label="Open Luna AI chat"
                >
                    <MessageCircle size={24} />
                </button>
            )}

            <AnimatePresence>
                {isOpen && <ChatBox onClose={() => setIsOpen(false)} />}
            </AnimatePresence>
        </>
    );
};

export default FloatingBubble;
