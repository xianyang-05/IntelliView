"""
IntelliView — Gemini Live API Interview WebSocket Handler
=========================================================
This module manages the real-time voice interview session between
the candidate's browser and the Gemini 2.0 Flash Live API.

Architecture:
  Browser <--WebSocket--> FastAPI <--WebSocket--> Gemini Live API

Audio specs:
  - Input  (candidate → Gemini): 16-bit PCM, 16 kHz, mono
  - Output (Gemini → candidate): 16-bit PCM, 24 kHz, mono
"""

import os
import json
import asyncio
import base64
import time
import traceback
from datetime import datetime
from typing import Optional

import websockets
from fastapi import WebSocket, WebSocketDisconnect
from vision_proctor import analyze_frame

# ── Gemini Live API config ─────────────────────────────
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
GEMINI_WS_URL = (
    "wss://generativelanguage.googleapis.com/ws/"
    "google.ai.generativelanguage.v1beta.GenerativeService.BidiGenerateContent"
    f"?key={GEMINI_API_KEY}"
)
MODEL = "models/gemini-2.5-flash-native-audio-preview-12-2025"


def build_system_instruction(resume_summary: str, job_title: str) -> str:
    """Build the system prompt for the AI interviewer persona."""
    return f"""You are an AI technical interviewer for the position of {job_title}.
You are professional, friendly, and thorough. Your goal is to evaluate the candidate's
technical skills, problem-solving ability, and communication.

RESUME CONTEXT:
{resume_summary}

INTERVIEW STRUCTURE:
1. Start with a brief greeting and introduction (30 seconds).
2. Ask 3-4 behavioral/technical questions based on the resume (8 minutes).
   - Focus on verifying claims made in the resume.
   - Ask follow-up questions if answers are vague.
3. When you are done with Q&A, call the function `start_coding_assessment` to transition.
4. After coding, call `end_interview` to wrap up.

RULES:
- Keep each question concise and clear.
- If the candidate seems stuck, provide a gentle hint after 30 seconds.
- Evaluate answers internally but do NOT share scores with the candidate.
- Be encouraging but do not give false praise.
- Speak naturally, as if in a real conversation.
- After the coding assessment is submitted, do NOT explain the solution, do NOT discuss whether it is correct or incorrect. Simply acknowledge the submission and call end_interview.
- Coding evaluation results are confidential and visible only to HR.
"""


def build_setup_message(resume_summary: str, job_title: str) -> dict:
    """Build the initial setup message for the Gemini Live API session."""
    return {
        "setup": {
            "model": MODEL,
            "generation_config": {
                "response_modalities": ["AUDIO"],
                "speech_config": {
                    "voice_config": {
                        "prebuilt_voice_config": {
                            "voice_name": "Aoede"
                        }
                    }
                }
            },
            "system_instruction": {
                "parts": [
                    {
                        "text": build_system_instruction(resume_summary, job_title)
                    }
                ]
            },
            "tools": [
                {
                    "function_declarations": [
                        {
                            "name": "start_coding_assessment",
                            "description": "Transition the interview to the coding assessment phase. Call this when you have finished asking all behavioral and technical questions.",
                            "parameters": {
                                "type": "object",
                                "properties": {
                                    "difficulty": {
                                        "type": "string",
                                        "enum": ["easy", "medium", "hard"],
                                        "description": "The difficulty level of the coding problem to present."
                                    },
                                    "topic": {
                                        "type": "string",
                                        "description": "The topic area for the coding problem (e.g., arrays, strings, trees)."
                                    }
                                },
                                "required": ["difficulty", "topic"]
                            }
                        },
                        {
                            "name": "end_interview",
                            "description": "End the interview session. Call this after the coding assessment is complete and you have said goodbye.",
                            "parameters": {
                                "type": "object",
                                "properties": {
                                    "summary": {
                                        "type": "string",
                                        "description": "A brief summary of the interview for the transcript log."
                                    }
                                },
                                "required": ["summary"]
                            }
                        }
                    ]
                }
            ]
        }
    }


class InterviewSession:
    """Manages a single interview session between a candidate and Gemini."""

    def __init__(self, session_id: str, resume_summary: str, job_title: str):
        self.session_id = session_id
        self.resume_summary = resume_summary
        self.job_title = job_title
        self.start_time = datetime.utcnow()
        self.transcript: list[dict] = []
        self.proctoring_events: list[dict] = []
        self.vision_analyses: list[dict] = []
        self.coding_result: Optional[dict] = None
        self.gemini_ws: Optional[websockets.WebSocketClientProtocol] = None
        self._active = False

    def log_transcript(self, role: str, text: str):
        """Append a transcript entry."""
        self.transcript.append({
            "role": role,
            "text": text,
            "timestamp": time.time()
        })

    def log_proctoring_event(self, event: dict):
        """Append a proctoring event."""
        self.proctoring_events.append({
            **event,
            "timestamp": time.time()
        })

    def to_dict(self) -> dict:
        """Serialize session data for storage / report generation."""
        return {
            "session_id": self.session_id,
            "job_title": self.job_title,
            "start_time": self.start_time.isoformat(),
            "end_time": datetime.utcnow().isoformat(),
            "transcript": self.transcript,
            "proctoring_events": self.proctoring_events,
            "vision_analyses": self.vision_analyses,
            "coding_result": self.coding_result,
        }


# ── Active sessions registry ──────────────────────────
_sessions: dict[str, InterviewSession] = {}


def get_session(session_id: str) -> Optional[InterviewSession]:
    return _sessions.get(session_id)


async def handle_interview_ws(client_ws: WebSocket, session_id: str,
                               resume_summary: str, job_title: str):
    """
    Main WebSocket handler that bridges the candidate's browser
    to the Gemini Live API.

    Messages from client:
      - {"type": "audio", "data": "<base64 PCM>"}
      - {"type": "proctoring_event", ...}
      - {"type": "coding_submit", "code": "...", "language": "..."}
      - {"type": "end"}

    Messages to client:
      - {"type": "audio", "data": "<base64 PCM>"}
      - {"type": "transcript", "role": "...", "text": "..."}
      - {"type": "phase_change", "phase": "coding" | "complete"}
      - {"type": "function_call", "name": "...", "args": {...}}
      - {"type": "error", "message": "..."}
    """
    await client_ws.accept()

    session = InterviewSession(session_id, resume_summary, job_title)
    _sessions[session_id] = session

    try:
        # Connect to Gemini Live API
        session.gemini_ws = await websockets.connect(
            GEMINI_WS_URL,
            additional_headers={"Content-Type": "application/json"},
            max_size=None,  # No limit on message size
        )
        session._active = True

        # Send setup message
        setup_msg = build_setup_message(resume_summary, job_title)
        await session.gemini_ws.send(json.dumps(setup_msg))

        # Wait for setup complete
        setup_response = await session.gemini_ws.recv()
        setup_data = json.loads(setup_response)
        print(f"[Interview {session_id}] Gemini session established: {json.dumps(setup_data)[:200]}")

        # Notify client that session is ready
        await client_ws.send_json({
            "type": "session_ready",
            "session_id": session_id
        })

        # Prompt Gemini to start speaking first with a greeting
        initial_prompt = {
            "client_content": {
                "turns": [
                    {
                        "role": "user",
                        "parts": [
                            {
                                "text": "The candidate has just joined the interview. Please greet them warmly and introduce yourself, then begin with your first question."
                            }
                        ]
                    }
                ],
                "turn_complete": True
            }
        }
        await session.gemini_ws.send(json.dumps(initial_prompt))
        print(f"[Interview {session_id}] Sent initial prompt to Gemini to start speaking")

        # Run two tasks concurrently:
        # 1. Forward client audio → Gemini
        # 2. Forward Gemini responses → client
        await asyncio.gather(
            _client_to_gemini(client_ws, session),
            _gemini_to_client(client_ws, session),
        )

    except WebSocketDisconnect:
        print(f"[Interview {session_id}] Client disconnected")
    except Exception as e:
        print(f"[Interview {session_id}] Error: {e}")
        traceback.print_exc()
        try:
            await client_ws.send_json({"type": "error", "message": str(e)})
        except Exception:
            pass
    finally:
        session._active = False
        if session.gemini_ws:
            await session.gemini_ws.close()
        print(f"[Interview {session_id}] Session ended. Transcript entries: {len(session.transcript)}")


async def _client_to_gemini(client_ws: WebSocket, session: InterviewSession):
    """Forward messages from the browser client to Gemini Live API."""
    try:
        while session._active:
            raw = await client_ws.receive_text()
            msg = json.loads(raw)

            if msg.get("type") == "audio":
                # Forward audio chunk to Gemini
                gemini_msg = {
                    "realtime_input": {
                        "media_chunks": [
                            {
                                "data": msg["data"],  # base64 PCM
                                "mime_type": "audio/pcm"
                            }
                        ]
                    }
                }
                if session.gemini_ws:
                    await session.gemini_ws.send(json.dumps(gemini_msg))

            elif msg.get("type") == "vision_frame":
                # Analyze webcam frame with Gemini Vision (non-blocking)
                frame_data = msg.get("data", "")
                if frame_data:
                    asyncio.create_task(
                        _process_vision_frame(client_ws, session, frame_data)
                    )

            elif msg.get("type") == "proctoring_event":
                # Log proctoring event
                session.log_proctoring_event(msg.get("event", {}))

            elif msg.get("type") == "coding_submit":
                # Store coding submission (will be processed by Judge0 separately)
                session.coding_result = {
                    "code": msg.get("code", ""),
                    "language": msg.get("language", "python"),
                    "submitted_at": time.time()
                }
                # Notify Gemini that coding is done via text
                if session.gemini_ws:
                    text_msg = {
                        "client_content": {
                            "turns": [
                                {
                                    "role": "user",
                                    "parts": [{"text": "I have submitted my coding solution. Please acknowledge and wrap up the interview without discussing or explaining the solution."}]
                                }
                            ],
                            "turn_complete": True
                        }
                    }
                    await session.gemini_ws.send(json.dumps(text_msg))

            elif msg.get("type") == "end":
                session._active = False
                break

    except WebSocketDisconnect:
        session._active = False
    except Exception as e:
        print(f"[Interview {session.session_id}] Client→Gemini error: {e}")
        session._active = False


async def _process_vision_frame(client_ws: WebSocket, session: InterviewSession,
                                 frame_base64: str):
    """Analyze a webcam frame with Gemini Vision and send results to client."""
    try:
        result = await analyze_frame(frame_base64)
        session.vision_analyses.append(result)

        suspicion = result.get("overall_suspicion_level", "none")
        summary = result.get("summary", "")

        print(f"[Interview {session.session_id}] Vision analysis: {suspicion} — {summary}")

        # Send result to the client so it can update the integrity badge
        await client_ws.send_json({
            "type": "vision_result",
            "suspicion_level": suspicion,
            "summary": summary,
            "devices_detected": result.get("devices_detected", {}),
            "other_people": result.get("other_people", {}),
            "notes_or_screens": result.get("notes_or_screens", {}),
            "reading_off_screen": result.get("reading_off_screen", {}),
            "face_visible": result.get("face_visible", True),
        })

        # If high/critical, also log as a proctoring event for scoring
        if suspicion in ("high", "critical"):
            session.log_proctoring_event({
                "type": "vision",
                "source": "gemini_vision",
                "severity": suspicion,
                "message": summary,
            })

    except Exception as e:
        print(f"[Interview {session.session_id}] Vision analysis error: {e}")


async def _gemini_to_client(client_ws: WebSocket, session: InterviewSession):
    """Forward responses from Gemini Live API to the browser client."""
    try:
        while session._active and session.gemini_ws:
            raw = await session.gemini_ws.recv()
            response = json.loads(raw)

            # Handle server content (audio + text responses)
            server_content = response.get("serverContent")
            if server_content:
                parts = server_content.get("modelTurn", {}).get("parts", [])
                for part in parts:
                    # Audio data
                    if "inlineData" in part:
                        inline = part["inlineData"]
                        if inline.get("mimeType", "").startswith("audio/"):
                            await client_ws.send_json({
                                "type": "audio",
                                "data": inline["data"]  # base64 PCM
                            })

                    # Text (transcript)
                    if "text" in part:
                        text = part["text"]
                        session.log_transcript("ai", text)
                        await client_ws.send_json({
                            "type": "transcript",
                            "role": "ai",
                            "text": text
                        })

                # Check if turn is complete
                if server_content.get("turnComplete"):
                    await client_ws.send_json({"type": "turn_complete"})

            # Handle tool calls (function calling)
            tool_call = response.get("toolCall")
            if tool_call:
                for fc in tool_call.get("functionCalls", []):
                    func_name = fc.get("name", "")
                    func_args = fc.get("args", {})
                    func_id = fc.get("id", "")

                    print(f"[Interview {session.session_id}] Function call: {func_name}({func_args})")

                    if func_name == "start_coding_assessment":
                        await client_ws.send_json({
                            "type": "phase_change",
                            "phase": "coding",
                            "difficulty": func_args.get("difficulty", "medium"),
                            "topic": func_args.get("topic", "arrays"),
                        })
                        # Send function response back to Gemini
                        func_response = {
                            "tool_response": {
                                "function_responses": [
                                    {
                                        "id": func_id,
                                        "name": func_name,
                                        "response": {
                                            "result": "Coding assessment has been presented to the candidate. Please wait for them to complete it."
                                        }
                                    }
                                ]
                            }
                        }
                        await session.gemini_ws.send(json.dumps(func_response))

                    elif func_name == "end_interview":
                        session.log_transcript("system", f"Interview ended: {func_args.get('summary', '')}")
                        await client_ws.send_json({
                            "type": "phase_change",
                            "phase": "complete",
                            "summary": func_args.get("summary", ""),
                        })
                        # Send function response back to Gemini
                        func_response = {
                            "tool_response": {
                                "function_responses": [
                                    {
                                        "id": func_id,
                                        "name": func_name,
                                        "response": {
                                            "result": "Interview session has been ended. Goodbye."
                                        }
                                    }
                                ]
                            }
                        }
                        await session.gemini_ws.send(json.dumps(func_response))
                        session._active = False

            # Handle setup complete
            if "setupComplete" in response:
                print(f"[Interview {session.session_id}] Setup complete confirmed")

    except websockets.exceptions.ConnectionClosed:
        print(f"[Interview {session.session_id}] Gemini connection closed")
        session._active = False
    except Exception as e:
        print(f"[Interview {session.session_id}] Gemini→Client error: {e}")
        traceback.print_exc()
        session._active = False
