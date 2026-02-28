"""
IntelliView — Interview API Routes
====================================
All new endpoints for the AI Interview Module.
This module is imported and registered in server.py.
"""

import json
import asyncio
from typing import Optional

from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Query
from fastapi.responses import JSONResponse, FileResponse

from interview_handler import handle_interview_ws, get_session
from code_executor import get_problem, execute_code
from vision_proctor import analyze_frame, calculate_integrity_score
from scoring_pipeline import (
    evaluate_qa_performance,
    evaluate_code_quality,
    evaluate_communication,
    calculate_final_score,
)
from report_generator import generate_report

router = APIRouter()


# ═══════════════════════════════════════════════════
# INTERVIEW WEBSOCKET
# ═══════════════════════════════════════════════════

@router.websocket("/ws/interview/{session_id}")
async def interview_websocket(
    websocket: WebSocket,
    session_id: str,
    resume_summary: str = Query(default=""),
    job_title: str = Query(default="Software Engineer"),
):
    """
    Main WebSocket endpoint for the AI interview session.
    Bridges the candidate's browser to the Gemini Live API.
    """
    await handle_interview_ws(websocket, session_id, resume_summary, job_title)


# ═══════════════════════════════════════════════════
# CODING PROBLEM
# ═══════════════════════════════════════════════════

@router.get("/api/coding-problem")
async def get_coding_problem(
    difficulty: str = Query(default="medium"),
    topic: str = Query(default="arrays"),
):
    """Get a coding problem for the assessment phase."""
    problem = get_problem(difficulty, topic)
    if not problem:
        return JSONResponse(
            status_code=404,
            content={"detail": "No problem found for the given difficulty and topic."}
        )
    return {
        "title": problem["title"],
        "description": problem["description"],
        "starter_code": problem.get("starter_code", {}),
        "language_options": list(problem.get("starter_code", {}).keys()),
    }


# ═══════════════════════════════════════════════════
# CODE SUBMISSION
# ═══════════════════════════════════════════════════

@router.post("/api/submit-code")
async def submit_code(body: dict):
    """
    Submit candidate code for execution against test cases.

    Body:
        {
            "session_id": str,
            "code": str,
            "language": str,
            "difficulty": str,
            "topic": str
        }
    """
    session_id = body.get("session_id", "")
    code = body.get("code", "")
    language = body.get("language", "python")
    difficulty = body.get("difficulty", "medium")
    topic = body.get("topic", "arrays")

    problem = get_problem(difficulty, topic)
    if not problem:
        return JSONResponse(
            status_code=404,
            content={"detail": "Problem not found."}
        )

    # Execute code against test cases
    result = await execute_code(code, language, problem)

    # Update session if it exists
    session = get_session(session_id)
    if session:
        session.coding_result = {
            "code": code,
            "language": language,
            "problem_title": problem["title"],
            "test_results": result,
        }

    return result


# ═══════════════════════════════════════════════════
# VISION ANALYSIS (called from frontend periodically)
# ═══════════════════════════════════════════════════

@router.post("/api/analyze-frame")
async def analyze_webcam_frame(body: dict):
    """
    Analyze a webcam frame for cheating indicators.

    Body:
        {
            "session_id": str,
            "frame": str (base64 JPEG)
        }
    """
    session_id = body.get("session_id", "")
    frame_data = body.get("frame", "")

    if not frame_data:
        return JSONResponse(
            status_code=400,
            content={"detail": "No frame data provided."}
        )

    result = await analyze_frame(frame_data)

    # Log to session if it exists
    session = get_session(session_id)
    if session:
        session.log_proctoring_event({
            "source": "gemini_vision",
            "severity": result.get("overall_suspicion_level", "none"),
            "message": result.get("summary", ""),
            "details": result,
        })

    return {
        "suspicion_level": result.get("overall_suspicion_level", "none"),
        "summary": result.get("summary", ""),
        "analysis_success": result.get("analysis_success", False),
    }



# ═══════════════════════════════════════════════════
# NOTE: Report generation and retrieval endpoints
# are defined in server.py with Firestore fallback.
# Do NOT duplicate them here.
# ═══════════════════════════════════════════════════
