'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import {
    FaceLandmarker,
    FilesetResolver,
    type FaceLandmarkerResult,
    type NormalizedLandmark,
} from '@mediapipe/tasks-vision';

// ── Types ────────────────────────────────────────────
export interface HeadPose {
    yaw: number;   // left/right rotation in degrees
    pitch: number; // up/down rotation in degrees
    roll: number;  // tilt in degrees
}

export interface FaceTrackingState {
    faceDetected: boolean;
    landmarks: NormalizedLandmark[] | null;
    headPose: HeadPose;
    gazeScore: number; // 0 = centered, 1 = fully off-screen
    status: 'ok' | 'warning' | 'alert';
    statusMessage: string;
}

export interface FaceTrackingViolation {
    type: 'face_tracking';
    subtype: 'head_turn' | 'gaze_aversion' | 'face_absent';
    timestamp: number;
    message: string;
    severity: 'medium' | 'high' | 'critical';
}

interface FaceTrackingOptions {
    enabled: boolean;
    videoRef: React.RefObject<HTMLVideoElement | null>;
    onViolation: (violation: FaceTrackingViolation) => void;
}

// ── Constants ────────────────────────────────────────
const DETECTION_FPS = 10;
const DETECTION_INTERVAL_MS = 1000 / DETECTION_FPS;

// Thresholds
const HEAD_YAW_THRESHOLD = 30;       // degrees
const HEAD_YAW_DURATION_MS = 2000;   // how long before triggering
const GAZE_THRESHOLD = 0.55;         // normalized off-center score
const GAZE_DURATION_MS = 3000;
const FACE_ABSENT_DURATION_MS = 3000;

// Cooldown between violations of the same type
const VIOLATION_COOLDOWN_MS = 8000;

// ── Landmark indices ─────────────────────────────────
// MediaPipe Face Mesh key points
const NOSE_TIP = 1;
const LEFT_EYE_OUTER = 33;
const RIGHT_EYE_OUTER = 263;
const LEFT_EYE_INNER = 133;
const RIGHT_EYE_INNER = 362;
const CHIN = 152;
const FOREHEAD = 10;

// Iris landmarks (468-477)
const LEFT_IRIS_CENTER = 468;
const RIGHT_IRIS_CENTER = 473;
const LEFT_EYE_LEFT = 33;
const LEFT_EYE_RIGHT = 133;
const RIGHT_EYE_LEFT = 362;
const RIGHT_EYE_RIGHT = 263;

// ── Helper: compute head pose from landmarks ─────────
function computeHeadPose(landmarks: NormalizedLandmark[]): HeadPose {
    const nose = landmarks[NOSE_TIP];
    const leftEye = landmarks[LEFT_EYE_OUTER];
    const rightEye = landmarks[RIGHT_EYE_OUTER];
    const chin = landmarks[CHIN];
    const forehead = landmarks[FOREHEAD];

    // Yaw: horizontal angle based on nose position relative to eye midpoint
    const eyeMidX = (leftEye.x + rightEye.x) / 2;
    const eyeDistance = Math.abs(leftEye.x - rightEye.x);
    const noseOffset = (nose.x - eyeMidX) / (eyeDistance || 0.001);
    const yaw = Math.atan(noseOffset * 2) * (180 / Math.PI);

    // Pitch: vertical angle from forehead to chin vs nose
    const faceMidY = (forehead.y + chin.y) / 2;
    const faceHeight = Math.abs(chin.y - forehead.y);
    const noseVertOffset = (nose.y - faceMidY) / (faceHeight || 0.001);
    const pitch = Math.atan(noseVertOffset * 2) * (180 / Math.PI);

    // Roll: tilt based on eye line angle
    const dy = rightEye.y - leftEye.y;
    const dx = rightEye.x - leftEye.x;
    const roll = Math.atan2(dy, dx) * (180 / Math.PI);

    return { yaw, pitch, roll };
}

// ── Helper: compute gaze off-center score ────────────
function computeGazeScore(landmarks: NormalizedLandmark[]): number {
    if (landmarks.length < 478) {
        // No iris landmarks available
        return 0;
    }

    // Left eye: iris center position relative to eye corners
    const leftIris = landmarks[LEFT_IRIS_CENTER];
    const leftEyeL = landmarks[LEFT_EYE_LEFT];
    const leftEyeR = landmarks[LEFT_EYE_RIGHT];
    const leftEyeWidth = Math.abs(leftEyeR.x - leftEyeL.x) || 0.001;
    const leftIrisRatio = (leftIris.x - leftEyeL.x) / leftEyeWidth;
    // 0.5 = centered, 0 or 1 = looking to the side
    const leftOffset = Math.abs(leftIrisRatio - 0.5) * 2;

    // Right eye: iris center position relative to eye corners
    const rightIris = landmarks[RIGHT_IRIS_CENTER];
    const rightEyeL = landmarks[RIGHT_EYE_LEFT];
    const rightEyeR = landmarks[RIGHT_EYE_RIGHT];
    const rightEyeWidth = Math.abs(rightEyeR.x - rightEyeL.x) || 0.001;
    const rightIrisRatio = (rightIris.x - rightEyeL.x) / rightEyeWidth;
    const rightOffset = Math.abs(rightIrisRatio - 0.5) * 2;

    // Average of both eyes, clamped to [0, 1]
    return Math.min(1, (leftOffset + rightOffset) / 2);
}

// ═════════════════════════════════════════════════════
// Hook
// ═════════════════════════════════════════════════════
export function useFaceTracking({ enabled, videoRef, onViolation }: FaceTrackingOptions): FaceTrackingState {
    const [state, setState] = useState<FaceTrackingState>({
        faceDetected: true,
        landmarks: null,
        headPose: { yaw: 0, pitch: 0, roll: 0 },
        gazeScore: 0,
        status: 'ok',
        statusMessage: 'Initializing...',
    });

    const landmarkerRef = useRef<FaceLandmarker | null>(null);
    const rafRef = useRef<number>(0);
    const lastDetectionRef = useRef<number>(0);
    const lastTimestampRef = useRef<number>(0);
    const mountedRef = useRef(true);

    // Violation tracking refs
    const headTurnStartRef = useRef<number | null>(null);
    const gazeStartRef = useRef<number | null>(null);
    const faceAbsentStartRef = useRef<number | null>(null);
    const lastViolationRef = useRef<Record<string, number>>({});

    const onViolationRef = useRef(onViolation);
    onViolationRef.current = onViolation;

    // ── Emit violation with cooldown ─────────────────
    const emitViolation = useCallback((
        subtype: FaceTrackingViolation['subtype'],
        message: string,
        severity: FaceTrackingViolation['severity']
    ) => {
        const now = Date.now();
        const lastTime = lastViolationRef.current[subtype] || 0;
        if (now - lastTime < VIOLATION_COOLDOWN_MS) return;

        lastViolationRef.current[subtype] = now;
        onViolationRef.current({
            type: 'face_tracking',
            subtype,
            timestamp: now,
            message,
            severity,
        });
    }, []);

    // ── Initialize MediaPipe ─────────────────────────
    useEffect(() => {
        if (!enabled) return;
        mountedRef.current = true;

        let cancelled = false;

        const init = async () => {
            try {
                const vision = await FilesetResolver.forVisionTasks(
                    'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
                );

                if (cancelled) return;

                const landmarker = await FaceLandmarker.createFromOptions(vision, {
                    baseOptions: {
                        modelAssetPath:
                            'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task',
                        delegate: 'GPU',
                    },
                    runningMode: 'VIDEO',
                    numFaces: 1,
                    outputFaceBlendshapes: false,
                    outputFacialTransformationMatrixes: false,
                });

                if (cancelled) {
                    landmarker.close();
                    return;
                }

                landmarkerRef.current = landmarker;
                if (mountedRef.current) {
                    setState(prev => ({ ...prev, statusMessage: 'Face tracking active' }));
                }
            } catch (err) {
                console.error('[FaceTracking] Failed to initialize MediaPipe:', err);
                if (mountedRef.current) {
                    setState(prev => ({ ...prev, statusMessage: 'Face tracking unavailable' }));
                }
            }
        };

        init();

        return () => {
            cancelled = true;
            mountedRef.current = false;
            if (landmarkerRef.current) {
                landmarkerRef.current.close();
                landmarkerRef.current = null;
            }
        };
    }, [enabled]);

    // ── Detection loop ───────────────────────────────
    useEffect(() => {
        if (!enabled) return;

        const detect = () => {
            if (!mountedRef.current) return;

            const now = performance.now();
            const video = videoRef.current;
            const landmarker = landmarkerRef.current;

            if (
                landmarker &&
                video &&
                video.readyState >= 2 &&
                video.videoWidth > 0 &&
                video.videoHeight > 0 &&
                now - lastDetectionRef.current >= DETECTION_INTERVAL_MS
            ) {
                lastDetectionRef.current = now;

                // MediaPipe requires strictly increasing integer timestamps
                let timestamp = Math.floor(now);
                if (timestamp <= lastTimestampRef.current) {
                    timestamp = lastTimestampRef.current + 1;
                }
                lastTimestampRef.current = timestamp;

                // Extra safety: re-verify video is truly ready right before detection
                if (video.paused || video.ended || video.videoWidth === 0 || video.videoHeight === 0) {
                    rafRef.current = requestAnimationFrame(detect);
                    return;
                }

                let result: FaceLandmarkerResult | null = null;
                try {
                    result = landmarker.detectForVideo(video, timestamp);
                } catch {
                    // MediaPipe can throw if video state changes between check and call
                    rafRef.current = requestAnimationFrame(detect);
                    return;
                }

                if (!result) {
                    rafRef.current = requestAnimationFrame(detect);
                    return;
                }

                try {
                    const currentTime = Date.now();

                    if (result.faceLandmarks && result.faceLandmarks.length > 0) {
                        const landmarks = result.faceLandmarks[0];
                        const headPose = computeHeadPose(landmarks);
                        const gazeScore = computeGazeScore(landmarks);

                        // Reset face absent timer
                        faceAbsentStartRef.current = null;

                        // ── Head turn check ──────────────
                        if (Math.abs(headPose.yaw) > HEAD_YAW_THRESHOLD) {
                            if (!headTurnStartRef.current) {
                                headTurnStartRef.current = currentTime;
                            } else if (currentTime - headTurnStartRef.current > HEAD_YAW_DURATION_MS) {
                                emitViolation(
                                    'head_turn',
                                    `Candidate is looking away (head turned ${Math.abs(headPose.yaw).toFixed(0)}°)`,
                                    Math.abs(headPose.yaw) > 45 ? 'high' : 'medium'
                                );
                            }
                        } else {
                            headTurnStartRef.current = null;
                        }

                        // ── Gaze check ───────────────────
                        if (gazeScore > GAZE_THRESHOLD) {
                            if (!gazeStartRef.current) {
                                gazeStartRef.current = currentTime;
                            } else if (currentTime - gazeStartRef.current > GAZE_DURATION_MS) {
                                emitViolation(
                                    'gaze_aversion',
                                    'Candidate\'s eyes are wandering off-screen',
                                    'medium'
                                );
                            }
                        } else {
                            gazeStartRef.current = null;
                        }

                        // Determine status
                        let status: 'ok' | 'warning' | 'alert' = 'ok';
                        let statusMessage = 'Face OK';

                        if (Math.abs(headPose.yaw) > HEAD_YAW_THRESHOLD) {
                            status = 'alert';
                            statusMessage = 'Head turned';
                        } else if (gazeScore > GAZE_THRESHOLD) {
                            status = 'warning';
                            statusMessage = 'Eyes wandering';
                        }

                        setState({
                            landmarks,
                            headPose,
                            gazeScore,
                            faceDetected: true,
                            status,
                            statusMessage,
                        });
                    } else {
                        // No face detected
                        if (!faceAbsentStartRef.current) {
                            faceAbsentStartRef.current = Date.now();
                        } else if (Date.now() - faceAbsentStartRef.current > FACE_ABSENT_DURATION_MS) {
                            emitViolation(
                                'face_absent',
                                'Candidate face is not visible in the camera',
                                'high'
                            );
                        }

                        headTurnStartRef.current = null;
                        gazeStartRef.current = null;

                        setState(prev => ({
                            ...prev,
                            faceDetected: false,
                            landmarks: null,
                            status: 'warning',
                            statusMessage: 'No face detected',
                        }));
                    }
                } catch {
                    // Silently handle any processing errors
                }
            }

            rafRef.current = requestAnimationFrame(detect);
        };

        rafRef.current = requestAnimationFrame(detect);

        return () => {
            if (rafRef.current) {
                cancelAnimationFrame(rafRef.current);
            }
        };
    }, [enabled, videoRef, emitViolation]);

    return state;
}
