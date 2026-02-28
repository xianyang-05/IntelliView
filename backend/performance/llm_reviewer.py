"""
LLM reviewer using Claude for edge-case employee performance review.
Only called for flagged employees to save API costs.
Includes retry logic for transient API errors (529 overloaded).
"""

import json
import time
import requests
import os

MAX_RETRIES = 3
RETRY_BASE_DELAY = 2  # seconds

OLLAMA_BASE_URL = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "gemma3")


def review_employee(row: dict, flag_reasons: list[str]) -> dict:
    """
    Ask Ollama (Gemma) to review one flagged employee and return structured assessment.
    """
    quality_direction = "Improving" if row["quality_trend"] > 0 else "Declining"

    prompt = f"""You are an HR analytics assistant. Review this employee's performance data and provide a fair, explainable assessment.

Employee: {row['name']} ({row['role']})
Performance Score: {row['final_score']}/100
Category (rule-based): {row['category']}

Metrics:
- Tasks Completed: {row['tasks_completed']}
- On-Time Rate: {row['on_time_rate'] * 100:.0f}%
- Quality Score: {row['quality_score']}/5
- KPI Achievement: {row['kpi_score'] * 100:.0f}%
- Collaboration: {row['collaboration']}/5
- Attendance: {row['attendance'] * 100:.0f}%
- Quality Trend: {quality_direction} ({row['quality_trend']:+.1f})
- Timeliness Trend: {row['timeliness_trend']:+.2f}

Flagged because: {'; '.join(flag_reasons)}

Respond ONLY with valid JSON in this exact format (no markdown, no extra text):
{{
  "final_category": "Raise / Promote" or "Neutral" or "At Risk / PIP",
  "confidence": "High" or "Medium" or "Low",
  "strengths": ["point 1", "point 2"],
  "weaknesses": ["point 1", "point 2"],
  "reasoning": "2-3 sentence explanation of your decision",
  "recommended_action": "specific, actionable recommendation"
}}"""

    last_error = None
    for attempt in range(1, MAX_RETRIES + 1):
        try:
            resp = requests.post(
                f"{OLLAMA_BASE_URL}/api/generate",
                json={
                    "model": OLLAMA_MODEL,
                    "prompt": prompt,
                    "stream": False,
                    "options": {
                        "temperature": 0.0,
                        "num_predict": 600,
                    }
                },
                timeout=120,
            )
            resp.raise_for_status()

            response_text = resp.json()["response"].strip()

            # Handle potential markdown code blocks
            if response_text.startswith("```"):
                response_text = response_text.split("\n", 1)[1]
                if response_text.endswith("```"):
                    response_text = response_text[:-3].strip()

            # Also sometimes Ollama includes trailing backticks without a newline
            if "```" in response_text:
                response_text = response_text.replace("```json", "").replace("```", "").strip()

            return json.loads(response_text)
        except requests.exceptions.RequestException as e:
            last_error = e
            if attempt < MAX_RETRIES:
                delay = RETRY_BASE_DELAY * (2 ** (attempt - 1))
                print(f"   API connectivity issue for {row['name']}, retrying in {delay}s (attempt {attempt}/{MAX_RETRIES})...")
                time.sleep(delay)
                continue
            break
        except Exception as e:
            last_error = e
            break
    print(f"   LLM review failed for {row['name']}: {last_error}")
    return {
        "final_category": row["category"],
        "confidence": "Low",
        "strengths": [],
        "weaknesses": [],
        "reasoning": f"LLM review failed after {MAX_RETRIES} attempts. Falling back to rule-based category.",
        "recommended_action": "Manual review recommended.",
    }

