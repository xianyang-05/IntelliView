"""
IntelliView — Scoring Pipeline
===============================
Aggregates all interview data and produces a weighted final score.

Weights:
  - Interview Q&A:       40%
  - Coding Assessment:    30%
  - Proctoring Integrity: 20%
  - Communication Skills: 10%
"""

import os
import json
from typing import Optional

import google.generativeai as genai

gemini_api_key = os.getenv("GEMINI_API_KEY", "")
if gemini_api_key:
    genai.configure(api_key=gemini_api_key)

EVAL_MODEL = "gemini-2.0-flash"

# ── Thresholds ─────────────────────────────────────────
PASS_THRESHOLD = 70
BORDERLINE_THRESHOLD = 50


async def evaluate_qa_performance(transcript: list[dict]) -> dict:
    """
    Use Gemini to evaluate the candidate's Q&A performance
    from the interview transcript.

    Returns:
        {
            "score": int (0-100),
            "strengths": list[str],
            "weaknesses": list[str],
            "per_question": list[{question, answer_summary, score, feedback}]
        }
    """
    # Build transcript text
    transcript_text = ""
    for entry in transcript:
        role = entry.get("role", "unknown")
        text = entry.get("text", "")
        if role in ("ai", "user"):
            label = "Interviewer" if role == "ai" else "Candidate"
            transcript_text += f"{label}: {text}\n\n"

    if not transcript_text.strip():
        return {
            "score": 0,
            "strengths": [],
            "weaknesses": ["No Q&A data available"],
            "per_question": [],
        }

    prompt = f"""You are an expert interview evaluator. Analyze the following interview transcript
and evaluate the candidate's performance.

TRANSCRIPT:
{transcript_text}

Evaluate and return a JSON object with this exact structure:
{{
    "score": <int 0-100>,
    "strengths": ["strength1", "strength2"],
    "weaknesses": ["weakness1", "weakness2"],
    "per_question": [
        {{
            "question": "The question asked",
            "answer_summary": "Brief summary of candidate's answer",
            "score": <int 0-100>,
            "feedback": "Specific feedback"
        }}
    ]
}}

Scoring criteria:
- Relevance and depth of answers (40%)
- Technical accuracy (30%)
- Use of specific examples (STAR method) (20%)
- Clarity of explanation (10%)

Return ONLY valid JSON, no markdown formatting."""

    try:
        model = genai.GenerativeModel(EVAL_MODEL)
        response = model.generate_content(
            prompt,
            generation_config=genai.GenerationConfig(
                temperature=0.1,
                max_output_tokens=2048,
            )
        )
        text = response.text.strip()
        if text.startswith("```"):
            text = text.split("\n", 1)[1]
            if text.endswith("```"):
                text = text[:-3]
            text = text.strip()
        return json.loads(text)
    except Exception as e:
        return {
            "score": 50,
            "strengths": [],
            "weaknesses": [f"Evaluation error: {e}"],
            "per_question": [],
        }


async def evaluate_code_quality(code: str, problem_title: str,
                                 test_results: dict) -> dict:
    """
    Use Gemini to evaluate code quality beyond test case pass/fail.

    Returns:
        {
            "correctness_score": int (0-100),
            "quality_score": int (0-100),
            "combined_score": int (0-100),
            "feedback": str,
            "time_complexity": str,
            "space_complexity": str
        }
    """
    correctness_score = int(test_results.get("score", 0) * 100)

    prompt = f"""You are a code review expert. Evaluate the following code submission.

PROBLEM: {problem_title}
TEST RESULTS: {test_results.get("passed", 0)}/{test_results.get("total", 0)} test cases passed

CODE:
```
{code}
```

Evaluate and return a JSON object:
{{
    "quality_score": <int 0-100>,
    "feedback": "Detailed feedback on code quality",
    "time_complexity": "O(n) or similar",
    "space_complexity": "O(n) or similar",
    "readability": <int 0-100>,
    "efficiency": <int 0-100>,
    "best_practices": <int 0-100>
}}

Quality criteria:
- Code readability and style (30%)
- Algorithm efficiency (40%)
- Best practices and edge case handling (30%)

Return ONLY valid JSON, no markdown formatting."""

    try:
        model = genai.GenerativeModel(EVAL_MODEL)
        response = model.generate_content(
            prompt,
            generation_config=genai.GenerationConfig(
                temperature=0.1,
                max_output_tokens=1024,
            )
        )
        text = response.text.strip()
        if text.startswith("```"):
            text = text.split("\n", 1)[1]
            if text.endswith("```"):
                text = text[:-3]
            text = text.strip()
        quality = json.loads(text)
        quality_score = quality.get("quality_score", 50)

        # Combined: 60% correctness + 40% quality
        combined = int(correctness_score * 0.6 + quality_score * 0.4)

        return {
            "correctness_score": correctness_score,
            "quality_score": quality_score,
            "combined_score": combined,
            "feedback": quality.get("feedback", ""),
            "time_complexity": quality.get("time_complexity", "Unknown"),
            "space_complexity": quality.get("space_complexity", "Unknown"),
        }
    except Exception as e:
        return {
            "correctness_score": correctness_score,
            "quality_score": 50,
            "combined_score": int(correctness_score * 0.6 + 50 * 0.4),
            "feedback": f"Quality evaluation error: {e}",
            "time_complexity": "Unknown",
            "space_complexity": "Unknown",
        }


async def evaluate_communication(transcript: list[dict]) -> dict:
    """
    Use Gemini to evaluate communication skills from the transcript.

    Returns:
        {
            "score": int (0-100),
            "clarity": int (0-100),
            "confidence": int (0-100),
            "professionalism": int (0-100),
            "feedback": str
        }
    """
    candidate_text = "\n".join(
        entry["text"] for entry in transcript if entry.get("role") == "user"
    )

    if not candidate_text.strip():
        return {
            "score": 0,
            "clarity": 0,
            "confidence": 0,
            "professionalism": 0,
            "feedback": "No candidate speech data available.",
        }

    prompt = f"""Evaluate the communication skills of this interview candidate based on their responses.

CANDIDATE'S RESPONSES:
{candidate_text}

Return a JSON object:
{{
    "score": <int 0-100>,
    "clarity": <int 0-100>,
    "confidence": <int 0-100>,
    "professionalism": <int 0-100>,
    "feedback": "Brief feedback on communication"
}}

Return ONLY valid JSON, no markdown formatting."""

    try:
        model = genai.GenerativeModel(EVAL_MODEL)
        response = model.generate_content(
            prompt,
            generation_config=genai.GenerationConfig(
                temperature=0.1,
                max_output_tokens=512,
            )
        )
        text = response.text.strip()
        if text.startswith("```"):
            text = text.split("\n", 1)[1]
            if text.endswith("```"):
                text = text[:-3]
            text = text.strip()
        return json.loads(text)
    except Exception as e:
        return {
            "score": 50,
            "clarity": 50,
            "confidence": 50,
            "professionalism": 50,
            "feedback": f"Communication evaluation error: {e}",
        }


async def calculate_final_score(
    qa_eval: dict,
    coding_eval: dict,
    integrity_eval: dict,
    communication_eval: dict,
) -> dict:
    """
    Calculate the weighted final score and determine the decision.

    Weights:
      - Q&A: 40%
      - Coding: 30%
      - Integrity: 20%
      - Communication: 10%

    Returns:
        {
            "final_score": int (0-100),
            "decision": "PASS" | "BORDERLINE" | "FAIL",
            "breakdown": {...},
            "recommendation": str
        }
    """
    qa_score = qa_eval.get("score", 0)
    coding_score = coding_eval.get("combined_score", 0)
    integrity_score = integrity_eval.get("score", 100)
    comm_score = communication_eval.get("score", 0)

    weighted = {
        "qa": {"raw": qa_score, "weight": 0.40, "weighted": qa_score * 0.40},
        "coding": {"raw": coding_score, "weight": 0.30, "weighted": coding_score * 0.30},
        "integrity": {"raw": integrity_score, "weight": 0.20, "weighted": integrity_score * 0.20},
        "communication": {"raw": comm_score, "weight": 0.10, "weighted": comm_score * 0.10},
    }

    final_score = int(sum(d["weighted"] for d in weighted.values()))

    if final_score >= PASS_THRESHOLD:
        decision = "PASS"
        recommendation = "Recommend for next round or hire."
    elif final_score >= BORDERLINE_THRESHOLD:
        decision = "BORDERLINE"
        recommendation = "Flag for HR manual review with detailed notes."
    else:
        decision = "FAIL"
        recommendation = "Auto-reject. Candidate did not meet minimum requirements."

    # Override: critical integrity flags always result in FAIL
    if integrity_eval.get("score", 100) < 30:
        decision = "FAIL"
        recommendation = "Auto-reject due to critical integrity violations."

    return {
        "final_score": final_score,
        "decision": decision,
        "breakdown": weighted,
        "recommendation": recommendation,
    }
