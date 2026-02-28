'use client';

import React, { useRef, useEffect } from 'react';
import type { NormalizedLandmark } from '@mediapipe/tasks-vision';
import type { HeadPose } from '@/lib/hooks/use-face-tracking';

// ── Types ────────────────────────────────────────────
interface FaceMeshOverlayProps {
    videoStream: MediaStream | null;
    landmarks: NormalizedLandmark[] | null;
    headPose: HeadPose;
    gazeScore: number;
    faceDetected: boolean;
    status: 'ok' | 'warning' | 'alert';
    statusMessage: string;
}

// ── Key connections for a simplified mesh ────────────
// Instead of all 468 tessellation edges, we draw a subset
// for the face outline, eyes, brows, nose, and lips
const FACE_OVAL = [
    10, 338, 297, 332, 284, 251, 389, 356, 454, 323, 361, 288,
    397, 365, 379, 378, 400, 377, 152, 148, 176, 149, 150, 136,
    172, 58, 132, 93, 234, 127, 162, 21, 54, 103, 67, 109, 10,
];

const LEFT_EYE = [33, 7, 163, 144, 145, 153, 154, 155, 133, 173, 157, 158, 159, 160, 161, 246, 33];
const RIGHT_EYE = [263, 249, 390, 373, 374, 380, 381, 382, 362, 398, 384, 385, 386, 387, 388, 466, 263];
const LEFT_BROW = [70, 63, 105, 66, 107, 55, 65, 52, 53, 46];
const RIGHT_BROW = [300, 293, 334, 296, 336, 285, 295, 282, 283, 276];
const NOSE_BRIDGE = [168, 6, 197, 195, 5, 4, 1, 19];
const LIPS_OUTER = [61, 146, 91, 181, 84, 17, 314, 405, 321, 375, 291, 409, 270, 269, 267, 0, 37, 39, 40, 185, 61];
const LEFT_IRIS = [468, 469, 470, 471, 472];
const RIGHT_IRIS = [473, 474, 475, 476, 477];

// ── Draw helpers ─────────────────────────────────────
function drawPath(
    ctx: CanvasRenderingContext2D,
    landmarks: NormalizedLandmark[],
    indices: number[],
    w: number,
    h: number,
    color: string,
    lineWidth: number,
    close = false
) {
    if (indices.length < 2) return;
    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;
    ctx.beginPath();
    const first = landmarks[indices[0]];
    ctx.moveTo(first.x * w, first.y * h);
    for (let i = 1; i < indices.length; i++) {
        const pt = landmarks[indices[i]];
        ctx.lineTo(pt.x * w, pt.y * h);
    }
    if (close) ctx.closePath();
    ctx.stroke();
}

function drawIris(
    ctx: CanvasRenderingContext2D,
    landmarks: NormalizedLandmark[],
    indices: number[],
    w: number,
    h: number,
    color: string
) {
    if (landmarks.length <= indices[indices.length - 1]) return;
    const center = landmarks[indices[0]];
    // Radius from center to first perimeter point
    const p1 = landmarks[indices[1]];
    const dx = (center.x - p1.x) * w;
    const dy = (center.y - p1.y) * h;
    const radius = Math.sqrt(dx * dx + dy * dy);

    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(center.x * w, center.y * h, radius, 0, Math.PI * 2);
    ctx.fill();

    // Inner highlight dot
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.beginPath();
    ctx.arc(center.x * w, center.y * h, 1.5, 0, Math.PI * 2);
    ctx.fill();
}

// ═════════════════════════════════════════════════════
// Component
// ═════════════════════════════════════════════════════
const FaceMeshOverlay: React.FC<FaceMeshOverlayProps> = ({
    videoStream,
    landmarks,
    headPose,
    gazeScore,
    faceDetected,
    status,
    statusMessage,
}) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    // Attach video stream
    useEffect(() => {
        if (videoRef.current && videoStream) {
            videoRef.current.srcObject = videoStream;
        }
    }, [videoStream]);

    // Draw landmarks on canvas
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Match canvas to displayed size
        const video = videoRef.current;
        if (video) {
            canvas.width = video.videoWidth || 640;
            canvas.height = video.videoHeight || 480;
        }

        const w = canvas.width;
        const h = canvas.height;

        ctx.clearRect(0, 0, w, h);

        if (!landmarks || !faceDetected) return;

        const meshColor =
            status === 'alert'
                ? 'rgba(239, 68, 68, 0.5)'   // red
                : status === 'warning'
                    ? 'rgba(234, 179, 8, 0.5)'   // yellow
                    : 'rgba(34, 197, 94, 0.35)';  // green

        const eyeColor =
            status === 'alert'
                ? 'rgba(239, 68, 68, 0.7)'
                : status === 'warning'
                    ? 'rgba(234, 179, 8, 0.7)'
                    : 'rgba(34, 197, 94, 0.6)';

        // Draw face oval
        drawPath(ctx, landmarks, FACE_OVAL, w, h, meshColor, 1.5, true);

        // Draw brows
        drawPath(ctx, landmarks, LEFT_BROW, w, h, meshColor, 1);
        drawPath(ctx, landmarks, RIGHT_BROW, w, h, meshColor, 1);

        // Draw eyes
        drawPath(ctx, landmarks, LEFT_EYE, w, h, eyeColor, 1.5, true);
        drawPath(ctx, landmarks, RIGHT_EYE, w, h, eyeColor, 1.5, true);

        // Draw nose
        drawPath(ctx, landmarks, NOSE_BRIDGE, w, h, meshColor, 1);

        // Draw lips
        drawPath(ctx, landmarks, LIPS_OUTER, w, h, meshColor, 1, true);

        // Draw irises
        const irisColor = gazeScore > 0.55
            ? 'rgba(239, 68, 68, 0.8)'
            : gazeScore > 0.35
                ? 'rgba(234, 179, 8, 0.8)'
                : 'rgba(0, 220, 255, 0.8)';

        drawIris(ctx, landmarks, LEFT_IRIS, w, h, irisColor);
        drawIris(ctx, landmarks, RIGHT_IRIS, w, h, irisColor);

        // ── Head pose indicator (top-right corner) ───────
        const indicatorX = w - 50;
        const indicatorY = 50;
        const indicatorRadius = 20;

        // Background circle
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.beginPath();
        ctx.arc(indicatorX, indicatorY, indicatorRadius + 4, 0, Math.PI * 2);
        ctx.fill();

        // Dot showing head direction
        const dotOffsetX = (headPose.yaw / 90) * indicatorRadius;
        const dotOffsetY = (headPose.pitch / 90) * indicatorRadius;
        ctx.fillStyle = status === 'ok' ? '#22c55e' : status === 'warning' ? '#eab308' : '#ef4444';
        ctx.beginPath();
        ctx.arc(
            indicatorX + dotOffsetX,
            indicatorY + dotOffsetY,
            5,
            0,
            Math.PI * 2
        );
        ctx.fill();

        // Center crosshair
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(indicatorX - indicatorRadius, indicatorY);
        ctx.lineTo(indicatorX + indicatorRadius, indicatorY);
        ctx.moveTo(indicatorX, indicatorY - indicatorRadius);
        ctx.lineTo(indicatorX, indicatorY + indicatorRadius);
        ctx.stroke();

    }, [landmarks, headPose, gazeScore, faceDetected, status]);

    return (
        <div className="relative w-full h-full">
            <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="absolute top-0 left-0 w-full h-full object-cover rounded-md"
                style={{ transform: 'scaleX(-1)' }}
            />
            <canvas
                ref={canvasRef}
                className="absolute top-0 left-0 w-full h-full pointer-events-none"
                style={{ transform: 'scaleX(-1)' }}
            />

            {/* Status badge */}
            <div className={`absolute bottom-2 left-2 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-medium backdrop-blur-sm z-10 ${status === 'alert'
                    ? 'bg-red-500/30 text-red-300 border border-red-500/40'
                    : status === 'warning'
                        ? 'bg-yellow-500/30 text-yellow-300 border border-yellow-500/40'
                        : 'bg-green-500/20 text-green-300 border border-green-500/30'
                }`}>
                <span className={`inline-block w-1.5 h-1.5 rounded-full ${status === 'alert' ? 'bg-red-400 animate-pulse' :
                        status === 'warning' ? 'bg-yellow-400 animate-pulse' :
                            'bg-green-400'
                    }`} />
                {statusMessage}
            </div>

            {/* Gaze indicator */}
            {faceDetected && (
                <div className={`absolute bottom-2 right-2 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-medium backdrop-blur-sm z-10 ${gazeScore > 0.55
                        ? 'bg-red-500/30 text-red-300 border border-red-500/40'
                        : gazeScore > 0.35
                            ? 'bg-yellow-500/30 text-yellow-300 border border-yellow-500/40'
                            : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                    }`}>
                    👁 {gazeScore > 0.55 ? 'Eyes: Off-screen ⚠️' : gazeScore > 0.35 ? 'Eyes: Drifting' : 'Eyes: Centered'}
                </div>
            )}
        </div>
    );
};

export default FaceMeshOverlay;
