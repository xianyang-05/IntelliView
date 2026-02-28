'use client';

import { useEffect } from 'react';

interface ProctoringEvent {
    type: 'visibility' | 'fullscreen' | 'focus' | 'contextmenu' | 'copy' | 'paste' | 'face_tracking';
    timestamp: number;
    message: string;
}

interface ProctoringOptions {
    enabled: boolean;
    onViolation: (event: ProctoringEvent) => void;
}

export const useProctoring = ({ enabled, onViolation }: ProctoringOptions) => {
    useEffect(() => {
        if (!enabled) return;

        // ── Auto-enter fullscreen ─────────────────────
        document.documentElement.requestFullscreen().catch((err) => {
            console.warn(`Could not enter full-screen mode: ${err.message}`);
        });

        // ── Tab switch detection ──────────────────────
        const handleVisibilityChange = () => {
            if (document.hidden) {
                onViolation({
                    type: 'visibility',
                    timestamp: Date.now(),
                    message: 'Candidate switched to another tab or window.',
                });
            }
        };

        // ── Fullscreen exit detection ─────────────────
        const handleFullscreenChange = () => {
            if (!document.fullscreenElement) {
                onViolation({
                    type: 'fullscreen',
                    timestamp: Date.now(),
                    message: 'Candidate exited fullscreen mode.',
                });
            }
        };

        // ── Focus loss detection ──────────────────────
        const handleBlur = () => {
            onViolation({
                type: 'focus',
                timestamp: Date.now(),
                message: 'Interview window lost focus.',
            });
        };

        // ── Right-click disable ───────────────────────
        const handleContextMenu = (e: Event) => {
            e.preventDefault();
            onViolation({
                type: 'contextmenu',
                timestamp: Date.now(),
                message: 'Candidate attempted to open context menu.',
            });
        };

        // ── Copy disable ─────────────────────────────
        const handleCopy = (e: Event) => {
            e.preventDefault();
            onViolation({
                type: 'copy',
                timestamp: Date.now(),
                message: 'Candidate attempted to copy content.',
            });
        };

        // ── Paste disable ────────────────────────────
        const handlePaste = (e: Event) => {
            e.preventDefault();
            onViolation({
                type: 'paste',
                timestamp: Date.now(),
                message: 'Candidate attempted to paste content.',
            });
        };

        // ── Attach listeners ─────────────────────────
        document.addEventListener('visibilitychange', handleVisibilityChange);
        document.addEventListener('fullscreenchange', handleFullscreenChange);
        window.addEventListener('blur', handleBlur);
        document.addEventListener('contextmenu', handleContextMenu);
        document.addEventListener('copy', handleCopy);
        document.addEventListener('paste', handlePaste);

        // ── Cleanup ──────────────────────────────────
        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            document.removeEventListener('fullscreenchange', handleFullscreenChange);
            window.removeEventListener('blur', handleBlur);
            document.removeEventListener('contextmenu', handleContextMenu);
            document.removeEventListener('copy', handleCopy);
            document.removeEventListener('paste', handlePaste);
            if (document.fullscreenElement) {
                document.exitFullscreen().catch(() => { });
            }
        };
    }, [enabled, onViolation]);
};
