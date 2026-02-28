"""
IntelliView — Gemini Vision Proctoring Analysis
================================================
Periodically analyzes webcam frames using Gemini 2.0 Flash
to detect cheating indicators that pure landmark detection cannot catch.
"""

import os
import json
import base64
import time
from typing import Optional

import google.generativeai as genai

# ── Gemini config ──────────────────────────────────────
gemini_api_key = os.getenv("GEMINI_API_KEY", "")
if gemini_api_key:
    genai.configure(api_key=gemini_api_key)

VISION_MODEL = "gemini-2.0-flash"

ANALYSIS_PROMPT = """You are an AI proctoring system analyzing a webcam frame from a remote technical interview.

Analyze this image carefully and report in JSON format:

{
  "devices_detected": {
    "found": true/false,
    "description": "Description of any electronic devices (phones, earphones, tablets, secondary monitors)",
    "confidence": 0.0-1.0
  },
  "other_people": {
    "found": true/false,
    "description": "Description of any other people visible",
    "confidence": 0.0-1.0
  },
  "notes_or_screens": {
    "found": true/false,
    "description": "Description of any notes, books, papers, or secondary screens",
    "confidence": 0.0-1.0
  },
  "reading_off_screen": {
    "found": true/false,
    "description": "Whether the person appears to be reading from something off-camera",
    "confidence": 0.0-1.0
  },
  "face_visible": true/false,
  "overall_suspicion_level": "none" | "low" | "medium" | "high" | "critical",
  "summary": "One-sentence summary of findings"
}

IMPORTANT:
- Only report what you can actually see with reasonable confidence.
- Do not make assumptions about things outside the frame.
- A confidence below 0.3 should be treated as "not found".
- Return ONLY valid JSON, no markdown formatting.
"""


async def analyze_frame(frame_base64: str) -> dict:
    """
    Send a webcam frame to Gemini Vision for cheating analysis.

    Args:
        frame_base64: Base64-encoded JPEG image from the webcam.

    Returns:
        Structured analysis result dict.
    """
    try:
        model = genai.GenerativeModel(VISION_MODEL)

        # Build the image part
        image_part = {
            "inline_data": {
                "mime_type": "image/jpeg",
                "data": frame_base64
            }
        }

        response = await model.generate_content_async(
            [ANALYSIS_PROMPT, image_part],
            generation_config=genai.GenerationConfig(
                temperature=0.1,
                max_output_tokens=1024,
            )
        )

        # Parse JSON from response
        text = response.text.strip()
        # Remove markdown code fences if present
        if text.startswith("```"):
            text = text.split("\n", 1)[1]
            if text.endswith("```"):
                text = text[:-3]
            text = text.strip()

        result = json.loads(text)
        result["timestamp"] = time.time()
        result["analysis_success"] = True
        return result

    except json.JSONDecodeError as e:
        return {
            "analysis_success": False,
            "error": f"Failed to parse Gemini response as JSON: {e}",
            "timestamp": time.time(),
            "overall_suspicion_level": "unknown",
        }
    except Exception as e:
        return {
            "analysis_success": False,
            "error": str(e),
            "timestamp": time.time(),
            "overall_suspicion_level": "unknown",
        }


def calculate_integrity_score(proctoring_events: list[dict],
                               vision_analyses: list[dict]) -> dict:
    """
    Calculate the overall integrity score from proctoring events
    and Gemini Vision analyses.

    Scoring:
      - Start at 100
      - Browser violations: -5 each (visibility, focus), -10 (fullscreen)
      - MediaPipe events: -3 (medium), -8 (high), -15 (critical)
      - Vision flags: -5 (low), -10 (medium), -20 (high), -30 (critical)
      - Minimum score: 0

    Returns:
        {
            "score": int (0-100),
            "violations_count": int,
            "critical_flags": list[str],
            "breakdown": {...}
        }
    """
    score = 100
    violations = 0
    critical_flags = []

    browser_deductions = 0
    mediapipe_deductions = 0
    vision_deductions = 0

    # Process browser proctoring events
    for event in proctoring_events:
        event_type = event.get("type", "")
        violations += 1

        if event_type == "fullscreen":
            browser_deductions += 10
        elif event_type in ("visibility", "focus"):
            browser_deductions += 5
        else:
            browser_deductions += 3

    # Process MediaPipe facial tracking events
    for event in proctoring_events:
        severity = event.get("severity", "medium")
        if event.get("source") == "mediapipe":
            violations += 1
            if severity == "critical":
                mediapipe_deductions += 15
                critical_flags.append(event.get("message", "Critical MediaPipe event"))
            elif severity == "high":
                mediapipe_deductions += 8
            elif severity == "medium":
                mediapipe_deductions += 3

    # Process Gemini Vision analyses
    for analysis in vision_analyses:
        if not analysis.get("analysis_success"):
            continue

        level = analysis.get("overall_suspicion_level", "none")
        if level == "critical":
            vision_deductions += 30
            critical_flags.append(analysis.get("summary", "Critical vision flag"))
        elif level == "high":
            vision_deductions += 20
            critical_flags.append(analysis.get("summary", "High vision flag"))
        elif level == "medium":
            vision_deductions += 10
        elif level == "low":
            vision_deductions += 5

    total_deductions = browser_deductions + mediapipe_deductions + vision_deductions
    score = max(0, 100 - total_deductions)

    return {
        "score": score,
        "violations_count": violations,
        "critical_flags": critical_flags,
        "breakdown": {
            "browser_deductions": browser_deductions,
            "mediapipe_deductions": mediapipe_deductions,
            "vision_deductions": vision_deductions,
            "total_deductions": total_deductions,
        }
    }
