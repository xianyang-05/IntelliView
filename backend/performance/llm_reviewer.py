"""
LLM reviewer using Claude for edge-case employee performance review.
Only called for flagged employees to save API costs.
Includes retry logic for transient API errors (529 overloaded).
"""

import json
import time
import anthropic
import os

MAX_RETRIES = 3
RETRY_BASE_DELAY = 2  # seconds


def get_claude_client():
    api_key = os.getenv("ANTHROPIC_API_KEY")
    if not api_key:
        raise RuntimeError("ANTHROPIC_API_KEY not set in environment")
    return anthropic.Anthropic(api_key=api_key)


def review_employee(client: anthropic.Anthropic, row: dict, flag_reasons: list[str]) -> dict:
    """
    Ask Claude to review one flagged employee and return structured assessment.
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
            message = client.messages.create(
                model="claude-sonnet-4-20250514",
                max_tokens=600,
                messages=[{"role": "user", "content": prompt}],
            )

            response_text = message.content[0].text.strip()

            # Handle potential markdown code blocks
            if response_text.startswith("```"):
                response_text = response_text.split("\n", 1)[1]
                if response_text.endswith("```"):
                    response_text = response_text[:-3].strip()

            return json.loads(response_text)

        except anthropic.APIStatusError as e:
            last_error = e
            if e.status_code in (429, 529) and attempt < MAX_RETRIES:
                delay = RETRY_BASE_DELAY * (2 ** (attempt - 1))
                print(f"   API overloaded for {row['name']}, retrying in {delay}s (attempt {attempt}/{MAX_RETRIES})...")
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

